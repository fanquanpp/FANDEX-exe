---
order: 53
title: JUC并发包
module: java
category: Java
difficulty: advanced
description: java.util.concurrent并发工具
author: fanquanpp
updated: '2026-06-14'
related:
  - java/泛型进阶
  - java/并发编程基础
  - java/JVM类加载机制
  - java/JVM垃圾回收
prerequisites:
  - java/概述与开发环境
---

## 概述

java.util.concurrent（JUC）是 Java 并发编程的核心工具包，提供了线程池、并发集合、同步工具和原子类等组件。掌握 JUC 是编写高性能并发程序的基础，本文介绍 JUC 中最常用的工具类及其最佳实践。

## 基础概念

### JUC 核心组件

| 组件类型 | 代表类                         | 用途           |
| -------- | ------------------------------ | -------------- |
| 线程池   | ThreadPoolExecutor             | 管理和复用线程 |
| 并发集合 | ConcurrentHashMap              | 线程安全的集合 |
| 同步工具 | CountDownLatch, CyclicBarrier  | 线程间协调     |
| 原子类   | AtomicInteger, AtomicReference | 无锁并发操作   |
| 锁       | ReentrantLock, ReadWriteLock   | 灵活的锁机制   |

## 快速上手

### 线程池

```java
// 不推荐：使用 Executors 工厂方法（可能造成 OOM）
// Executors.newFixedThreadPool - 无界队列，可能堆积任务
// Executors.newCachedThreadPool - 无界线程数，可能创建大量线程

// 推荐：手动创建 ThreadPoolExecutor
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    2,                                    // 核心线程数
    4,                                    // 最大线程数
    60L, TimeUnit.SECONDS,                // 空闲线程存活时间
    new LinkedBlockingQueue<>(100),        // 工作队列（有界）
    new ThreadFactory() {                  // 自定义线程工厂
        private final AtomicInteger counter = new AtomicInteger(0);
        @Override
        public Thread newThread(Runnable r) {
            Thread t = new Thread(r, "worker-" + counter.incrementAndGet());
            t.setDaemon(false);
            return t;
        }
    },
    new ThreadPoolExecutor.CallerRunsPolicy() // 拒绝策略：调用者线程执行
);

executor.submit(() -> doWork());
executor.shutdown(); // 优雅关闭
```

### 并发集合

```java
// ConcurrentHashMap：高并发哈希表
ConcurrentHashMap<String, User> userMap = new ConcurrentHashMap<>();
userMap.put("user1", new User("张三"));
userMap.computeIfAbsent("user2", k -> new User("李四")); // 原子操作
userMap.forEach((key, value) -> System.out.println(key + ": " + value));

// CopyOnWriteArrayList：读多写少的列表
CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();
list.add("item1"); // 写操作会复制整个数组
list.get(0);       // 读操作无锁，性能好

// BlockingQueue：生产者-消费者模式
BlockingQueue<Task> queue = new ArrayBlockingQueue<>(100);
// 生产者
queue.put(new Task()); // 队列满时阻塞
// 消费者
Task task = queue.take(); // 队列空时阻塞
```

### 原子类

```java
// 基本原子类
AtomicInteger counter = new AtomicInteger(0);
counter.incrementAndGet();           // 自增并返回新值
counter.getAndIncrement();           // 自增并返回旧值
counter.compareAndSet(0, 1);        // CAS 操作：当前值为0时设为1
counter.addAndGet(10);               // 加10并返回新值

// 引用原子类
AtomicReference<User> ref = new AtomicReference<>(null);
ref.compareAndSet(null, new User("张三")); // CAS 更新引用

// 累加器（Java 8+，比 AtomicLong 性能更好）
LongAdder adder = new LongAdder();
adder.increment();    // 自增
adder.add(100);       // 加100
long sum = adder.sum(); // 获取总和

// 字段更新器（避免创建原子类对象）
AtomicIntegerFieldUpdater<User> ageUpdater =
    AtomicIntegerFieldUpdater.newUpdater(User.class, "age");
ageUpdater.incrementAndGet(user); // 原子更新 user 的 age 字段
```

## 详细用法

### 同步工具

```java
// CountDownLatch：等待多个线程完成
CountDownLatch latch = new CountDownLatch(3);
executor.submit(() -> { fetchData1(); latch.countDown(); });
executor.submit(() -> { fetchData2(); latch.countDown(); });
executor.submit(() -> { fetchData3(); latch.countDown(); });
latch.await(10, TimeUnit.SECONDS); // 等待所有任务完成，最多10秒

// CyclicBarrier：多个线程互相等待，全部到齐后继续执行
CyclicBarrier barrier = new CyclicBarrier(3, () -> {
    System.out.println("所有线程到齐，开始合并结果");
});
for (int i = 0; i < 3; i++) {
    executor.submit(() -> {
        processData();
        barrier.await(); // 等待其他线程
        mergeResult();
    });
}

// Semaphore：限制并发访问数量
Semaphore semaphore = new Semaphore(10); // 最多10个并发
semaphore.acquire();
try {
    accessDatabase();
} finally {
    semaphore.release();
}

// Phaser：更灵活的同步屏障（可动态注册/注销参与者）
Phaser phaser = new Phaser(3); // 3个参与者
phaser.arriveAndAwaitAdvance(); // 到达并等待
phaser.register();              // 动态添加参与者
phaser.arriveAndDeregister();   // 到达并注销
```

### ReentrantLock 与 Condition

```java
// ReentrantLock：比 synchronized 更灵活的锁
ReentrantLock lock = new ReentrantLock(true); // true = 公平锁
lock.lock();
try {
    // 临界区
} finally {
    lock.unlock(); // 必须在 finally 中释放锁
}

// tryLock：尝试获取锁，避免死锁
if (lock.tryLock(5, TimeUnit.SECONDS)) {
    try {
        doWork();
    } finally {
        lock.unlock();
    }
} else {
    System.out.println("获取锁超时");
}

// Condition：精确唤醒
ReentrantLock lock = new ReentrantLock();
Condition notEmpty = lock.newCondition();
Condition notFull = lock.newCondition();

// 生产者
lock.lock();
try {
    while (queue.size() == capacity) {
        notFull.await(); // 队列满时等待
    }
    queue.add(item);
    notEmpty.signal(); // 通知消费者
} finally {
    lock.unlock();
}
```

### ReadWriteLock

```java
// 读写锁：读读不互斥，读写互斥
ReadWriteLock rwLock = new ReentrantReadWriteLock();
Lock readLock = rwLock.readLock();
Lock writeLock = rwLock.writeLock();

// 读操作
readLock.lock();
try {
    return cache.get(key);
} finally {
    readLock.unlock();
}

// 写操作
writeLock.lock();
try {
    cache.put(key, value);
} finally {
    writeLock.unlock();
}
```

## 常见场景

### 线程池监控

```java
// 监控线程池状态
ThreadPoolExecutor executor = new ThreadPoolExecutor(...);

// 定期打印线程池状态
ScheduledExecutorService monitor = Executors.newSingleThreadScheduledExecutor();
monitor.scheduleAtFixedRate(() -> {
    System.out.println("活跃线程数: " + executor.getActiveCount());
    System.out.println("队列大小: " + executor.getQueue().size());
    System.out.println("已完成任务数: " + executor.getCompletedTaskCount());
    System.out.println("池大小: " + executor.getPoolSize());
}, 0, 10, TimeUnit.SECONDS);
```

### 限流器

```java
// 使用 Semaphore 实现简单限流
public class RateLimiter {
    private final Semaphore semaphore;
    private final ScheduledExecutorService scheduler;

    public RateLimiter(int permitsPerSecond) {
        this.semaphore = new Semaphore(permitsPerSecond);
        this.scheduler = Executors.newSingleThreadScheduledExecutor();
        // 每秒释放所有许可
        scheduler.scheduleAtFixedRate(() -> {
            semaphore.release(permitsPerSecond - semaphore.availablePermits());
        }, 1, 1, TimeUnit.SECONDS);
    }

    public boolean tryAcquire() {
        return semaphore.tryAcquire();
    }
}
```

## 注意事项

- 不要使用 Executors 创建线程池，应手动配置 ThreadPoolExecutor 参数
- 线程池的工作队列必须设置容量上限，避免 OOM
- 锁必须在 finally 块中释放，避免死锁
- CountDownLatch 不可重用，CyclicBarrier 可以重用
- ConcurrentHashMap 不允许 null 键和 null 值
- 原子类的 CAS 操作可能失败，需要配合循环使用

## 进阶用法

### CompletableFuture 异步编排

```java
// CompletableFuture：比 Future 更强大的异步编程工具
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(
    () -> fetchFromService1(), executor);
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(
    () -> fetchFromService2(), executor);

// 等待所有完成
CompletableFuture<Void> all = CompletableFuture.allOf(future1, future2);
all.thenRun(() -> {
    String result1 = future1.join();
    String result2 = future2.join();
    combine(result1, result2);
});

// 任一完成即返回
CompletableFuture<Object> any = CompletableFuture.anyOf(future1, future2);
any.thenAccept(result -> processFirstResult(result));

// 链式异步操作
CompletableFuture<String> result = CompletableFuture
    .supplyAsync(() -> fetchData())
    .thenApplyAsync(data -> transform(data), executor)
    .thenComposeAsync(transformed -> saveAsync(transformed), executor)
    .exceptionally(ex -> "fallback value");
```

### StampedLock 乐观读

```java
// StampedLock：比 ReadWriteLock 性能更好的读写锁
StampedLock stampedLock = new StampedLock();

// 乐观读（不加锁，性能最好）
long stamp = stampedLock.tryOptimisticRead();
double currentValue = value; // 读取数据
if (!stampedLock.validate(stamp)) {
    // 乐观读失败，升级为悲观读锁
    stamp = stampedLock.readLock();
    try {
        currentValue = value;
    } finally {
        stampedLock.unlockRead(stamp);
    }
}

// 写锁
long writeStamp = stampedLock.writeLock();
try {
    value = newValue;
} finally {
    stampedLock.unlockWrite(writeStamp);
}
```
