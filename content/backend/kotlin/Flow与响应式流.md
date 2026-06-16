---
order: 55
title: Flow与响应式流
module: kotlin
category: Kotlin
difficulty: advanced
description: 'Kotlin Flow与Channel'
author: fanquanpp
updated: '2026-06-14'
related:
  - kotlin/委托属性
  - kotlin/协程基础
  - kotlin/Kotlin与Spring
  - kotlin/Kotlin与Android
prerequisites:
  - kotlin/概述与环境配置
---

## 概述

Kotlin Flow 是协程生态中的响应式流实现，基于冷流模型，每个收集者独立接收完整数据序列。StateFlow 和 SharedFlow 则是热流，适合状态管理和事件广播。本文介绍 Flow 的核心操作符、背压处理和冷热流的选型。

## 基础概念

### 冷流 vs 热流

| 特性       | Flow（冷流）         | StateFlow/SharedFlow（热流） |
| ---------- | -------------------- | ---------------------------- |
| 数据生产   | 收集时才启动         | 始终活跃                     |
| 多个收集者 | 各自独立接收全部数据 | 共享同一数据源               |
| 典型用途   | 一次性数据获取       | 状态管理、事件广播           |
| 类比       | Netflix 点播         | 电视直播                     |

### 核心组件

| 组件              | 说明                                     |
| ----------------- | ---------------------------------------- |
| Flow              | 冷流基础接口                             |
| MutableStateFlow  | 可变状态流，始终有值，新订阅者收到最新值 |
| MutableSharedFlow | 可变共享流，支持多个收集者               |
| Channel           | 协程间的通道，类似 BlockingQueue         |

## 快速上手

### Flow 创建与收集

```kotlin
// 方式一：flow 构建器
fun numbers(): Flow<Int> = flow {
    for (i in 1..10) {
        emit(i)      // 发射数据
        delay(100)    // 模拟耗时操作
    }
}

// 方式二：flowOf 和 asFlow
val flow1 = flowOf(1, 2, 3)
val flow2 = (1..100).asFlow()

// 方式三：channelFlow（支持并发发射）
fun concurrentFlow(): Flow<Int> = channelFlow {
    launch { send(fetchFromSource1()) }
    launch { send(fetchFromSource2()) }
}

// 收集 Flow
runBlocking {
    numbers()
        .filter { it % 2 == 0 }
        .map { it * it }
        .collect { println(it) }
}
```

### StateFlow 状态管理

```kotlin
// 在 ViewModel 中使用 StateFlow 管理状态
class UserViewModel : ViewModel() {
    // 私有可变状态流
    private val _uiState = MutableStateFlow<UserUiState>(UserUiState.Loading)
    // 公开只读状态流
    val uiState: StateFlow<UserUiState> = _uiState.asStateFlow()

    fun loadUser(id: String) {
        viewModelScope.launch {
            _uiState.value = UserUiState.Loading
            try {
                val user = repository.fetchUser(id)
                _uiState.value = UserUiState.Success(user)
            } catch (e: Exception) {
                _uiState.value = UserUiState.Error(e.message ?: "未知错误")
            }
        }
    }
}

// 在 Compose 中收集 StateFlow
@Composable
fun UserScreen(viewModel: UserViewModel) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    when (uiState) {
        is UserUiState.Loading -> CircularProgressIndicator()
        is UserUiState.Success -> Text((uiState as UserUiState.Success).user.name)
        is UserUiState.Error -> Text((uiState as UserUiState.Error).message)
    }
}
```

## 详细用法

### Flow 操作符

```kotlin
// 转换操作符
flow.map { it.uppercase() }           // 映射
    .filter { it.startsWith("A") }    // 过滤
    .mapNotNull { it.takeIf { it.length > 3 } } // 过滤空值
    .distinctUntilChanged()            // 去重
    .take(5)                           // 只取前5个

// 组合操作符
val combined = flow1.zip(flow2) { a, b -> "$a-$b" }  // 配对
val merged = merge(flow1, flow2)                       // 合并
val concatenated = flow1 + flow2                       // 连接

// 限流与防抖
searchQuery
    .debounce(300)           // 300ms 内无新值才发射
    .distinctUntilChanged()  // 值未变化则跳过
    .flatMapLatest { query -> // 取消上一次搜索，使用最新结果
        searchRepository.search(query)
    }

// 错误处理
flow.catch { e ->
    emit(fallbackValue)  // 发生错误时发射备选值
}.retry(3) { e ->
    e is IOException      // 仅对网络错误重试
}
```

### 背压处理

```kotlin
// 当生产者速度大于消费者时，需要处理背压
fun fastProducer(): Flow<Int> = flow {
    repeat(1000) {
        emit(it) // 快速发射
    }
}

// 方式一：conflate - 跳过中间值，只处理最新值
fastProducer()
    .conflate()
    .collect { value ->
        delay(100) // 慢速消费者
        println("处理: $value")
    }

// 方式二：collectLatest - 每次新值到来时取消上一次处理
fastProducer()
    .collectLatest { value ->
        delay(100)
        println("处理: $value")
    }

// 方式三：buffer - 在单独的协程中运行生产者
fastProducer()
    .buffer(50) // 缓冲区容量50
    .collect { value ->
        delay(100)
        println("处理: $value")
    }
```

### SharedFlow 事件广播

```kotlin
// 使用 SharedFlow 实现事件总线
class EventBus {
    // 配置：1个最近的事件，超时后重置
    private val _events = MutableSharedFlow<String>(
        replay = 0,     // 新订阅者不回放历史
        extraBufferCapacity = 10,
        onBufferOverflow = BufferOverflow.DROP_OLDEST
    )
    val events: SharedFlow<String> = _events.asSharedFlow()

    suspend fun send(event: String) {
        _events.emit(event)
    }
}

// 发送事件
eventBus.send("用户登录")

// 收集事件
lifecycleScope.launch {
    eventBus.events.collect { event ->
        handleEvent(event)
    }
}
```

## 常见场景

### 网络请求封装

```kotlin
// 使用 Flow 封装网络请求
fun <T> safeApiCall(execute: suspend () -> T): Flow<Result<T>> = flow {
    try {
        val result = execute()
        emit(Result.success(result))
    } catch (e: IOException) {
        emit(Result.failure(e))
    }
}

// 使用
viewModelScope.launch {
    safeApiCall { apiService.getUser(id) }
        .catch { e -> _uiState.value = UiState.Error(e.message) }
        .collect { result ->
            result.onSuccess { user ->
                _uiState.value = UiState.Success(user)
            }
        }
}
```

### 多数据源合并

```kotlin
// 合并本地缓存和网络数据
fun getUser(id: String): Flow<User> = flow {
    // 先发射缓存数据
    val cached = cache.getUser(id)
    if (cached != null) emit(cached)

    // 再从网络获取最新数据
    val remote = apiService.fetchUser(id)
    cache.put(remote)
    emit(remote) // 发射最新数据
}
```

## 注意事项

- Flow 是冷流，每次 collect 都会重新执行生产者逻辑
- StateFlow 初始值必须提供，新订阅者会立即收到当前值
- SharedFlow 的 replay 参数控制新订阅者回放的历史事件数
- 在 Compose 中使用 collectAsStateWithLifecycle 而非 collectAsState，避免后台浪费资源
- 不要在 Flow 生产者中修改共享状态，应使用 StateFlow
- flatMapLatest 适合搜索场景，flatMapConcat 适合顺序处理

## 进阶用法

### 自定义 Flow 操作符

```kotlin
// 自定义操作符：带指数退避的重试
fun <T> Flow<T>.retryWithBackoff(
    retries: Int = 3,
    initialDelay: Long = 1000,
    maxDelay: Long = 10000
): Flow<T> = retryWhen { cause, attempt ->
    if (attempt < retries && cause is IOException) {
        val delay = minOf(initialDelay * (1L shl attempt.toInt()), maxDelay)
        delay(delay)
        true // 继续重试
    } else {
        false // 停止重试
    }
}

// 使用
apiFlow
    .retryWithBackoff(retries = 3, initialDelay = 500)
    .collect { data -> processData(data) }
```

### Channel 与 Flow 的转换

```kotlin
// Channel 转 Flow
val channel = Channel<Int>()
val flow = channel.receiveAsFlow()

// Flow 转 Channel（取第一个值）
val firstValue: Int = someFlow.first()

// 使用 produceIn 将 Flow 转为 Channel
val channelFlow = someFlow.produceIn(this)
for (item in channelFlow) {
    process(item)
}
```
