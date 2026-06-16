---
order: 81
title: Kotlin与并发安全
module: kotlin
category: Kotlin
difficulty: advanced
description: 协程并发与线程安全
author: fanquanpp
updated: '2026-06-14'
related:
  - kotlin/Kotlin与正则
  - kotlin/Kotlin与时间
  - kotlin/Kotlin与WebSocket
  - kotlin/Kotlin与安全
prerequisites:
  - kotlin/概述与环境配置
---

## 概述

Kotlin 协程的并发安全与传统线程并发不同。协程虽然轻量，但多协程同时访问共享可变状态仍会产生竞态条件。本文介绍协程并发的安全工具，包括 Mutex、Actor、线程限制和原子操作。

## 基础概念

### 协程并发的风险

```kotlin
// 危险：多协程并发修改共享变量
var counter = 0
runBlocking {
    repeat(1000) {
        launch {
            counter++ // 竞态条件！最终值可能小于1000
        }
    }
}
println(counter) // 可能输出 978 等非1000的值
```

### 并发安全策略

| 策略       | 说明                         | 适用场景       |
| ---------- | ---------------------------- | -------------- |
| Mutex      | 协程互斥锁，挂起等待         | 保护临界区     |
| Actor      | 单线程处理消息，天然线程安全 | 状态机、计数器 |
| 线程限制   | 将协程限制在单一线程         | UI 线程操作    |
| 不可变数据 | 使用不可变对象避免竞态       | 函数式风格     |
| Atomic     | 使用 Java 原子类             | 简单计数器     |

## 快速上手

### Mutex 互斥锁

```kotlin
val mutex = Mutex()
var counter = 0

runBlocking {
    repeat(1000) {
        launch {
            mutex.withLock {
                counter++ // 安全：同一时刻只有一个协程能进入
            }
        }
    }
}
println(counter) // 1000
```

### Actor 模型

```kotlin
// 使用 Actor 实现线程安全的计数器
sealed class CounterMsg
object Inc : CounterMsg()
class Get(val response: CompletableDeferred<Int>) : CounterMsg()

fun CoroutineScope.counterActor() = actor<CounterMsg> {
    var counter = 0
    for (msg in channel) {
        when (msg) {
            is Inc -> counter++
            is Get -> msg.response.complete(counter)
        }
    }
}

// 使用
val counter = counterActor()
counter.send(Inc)
val result = CompletableDeferred<Int>()
counter.send(Get(result))
println(result.await())
```

## 详细用法

### Mutex 高级用法

```kotlin
// 带超时的锁获取
val mutex = Mutex()

suspend fun processWithTimeout() {
    if (mutex.tryLock()) {
        try {
            doWork()
        } finally {
            mutex.unlock()
        }
    } else {
        println("获取锁失败，执行备选逻辑")
    }
}

// Mutex 保护多个资源
class TransferService {
    private val mutex = Mutex()

    suspend fun transfer(from: Account, to: Account, amount: Int) {
        mutex.withLock {
            if (from.balance >= amount) {
                from.balance -= amount
                to.balance += amount
            }
        }
    }
}
```

### 线程限制

```kotlin
// 将协程限制在单一线程上执行
val singleThreadContext = newSingleThreadContext("SafeThread")

runBlocking {
    var sharedData = 0
    repeat(1000) {
        launch(singleThreadContext) {
            sharedData++ // 安全：所有协程在同一线程执行
        }
    }
}

// 使用 Dispatcher 进行线程限制
// Android 中的 Dispatchers.Main
viewModelScope.launch(Dispatchers.Main) {
    // 所有 UI 操作在主线程执行，天然线程安全
    updateUI()
}
```

### 原子操作

```kotlin
// 使用 Java 原子类处理简单并发场景
val atomicCounter = AtomicInteger(0)

runBlocking {
    repeat(1000) {
        launch(Dispatchers.Default) {
            atomicCounter.incrementAndGet() // 原子自增
        }
    }
}
println(atomicCounter.get()) // 1000

// 使用 AtomicReference 保护复杂对象
val state = AtomicReference(ServerState.IDLE)
state.compareAndSet(ServerState.IDLE, ServerState.STARTING)
```

## 常见场景

### 并发安全的状态管理

```kotlin
// 使用 Mutex 保护复杂状态
class UserManager {
    private val mutex = Mutex()
    private val users = mutableMapOf<String, User>()

    suspend fun addUser(user: User) {
        mutex.withLock {
            users[user.id] = user
        }
    }

    suspend fun getUser(id: String): User? {
        return mutex.withLock {
            users[id]
        }
    }

    suspend fun removeUser(id: String) {
        mutex.withLock {
            users.remove(id)
        }
    }
}
```

### 并发任务限流

```kotlin
// 使用 Semaphore 限制并发数
val semaphore = Semaphore(5) // 最多5个并发

suspend fun processWithLimit(tasks: List<Task>) {
    coroutineScope {
        tasks.map { task ->
            launch {
                semaphore.withPermit {
                    processTask(task)
                }
            }
        }.joinAll()
    }
}
```

## 注意事项

- Mutex 是挂起锁，不会阻塞线程，比 Java 的 ReentrantLock 更适合协程
- 不要在持有 Mutex 锁时调用长时间阻塞操作，应使用 withContext 切换调度器
- Actor 模型适合状态频繁变更的场景，但消息传递有额外开销
- 线程限制简单有效，但会限制并发度
- 优先使用不可变数据和单线程数据流，避免共享可变状态
- 协程的 withLock 是可重入的，同一个协程可以多次获取同一把锁

## 进阶用法

### STM（软件事务内存）模式

```kotlin
// 使用乐观锁实现简单的 STM
class AtomicState<T>(initial: T) {
    private val ref = AtomicReference(initial)
    private val version = AtomicInteger(0)

    fun get(): T = ref.get()

    fun update(transform: (T) -> T): Boolean {
        while (true) {
            val oldVersion = version.get()
            val oldValue = ref.get()
            val newValue = transform(oldValue)
            if (ref.compareAndSet(oldValue, newValue)) {
                version.incrementAndGet()
                return true
            }
        }
    }
}
```

### 协程间通信 Channel

```kotlin
// 使用 Channel 实现生产者-消费者模式
fun CoroutineScope.producer() = produce {
    while (true) {
        val data = fetchData()
        send(data)
        delay(1000)
    }
}

fun CoroutineScope.consumer(channel: ReceiveChannel<Data>) = launch {
    for (data in channel) {
        processData(data)
    }
}

// 使用
val channel = producer()
consumer(channel)
```
