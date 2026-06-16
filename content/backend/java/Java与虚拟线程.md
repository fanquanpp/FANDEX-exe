---
order: 81
title: Java与虚拟线程
module: java
category: Java
difficulty: intermediate
description: 'Project Loom虚拟线程'
author: fanquanpp
updated: '2026-06-14'
related:
  - java/Java与响应式编程
  - java/方法详解
  - java/Java与GraalVM
  - java/Java与Kubernetes
prerequisites:
  - java/概述与开发环境
---

## 概述

虚拟线程（Virtual Threads）是 Java 21 正式引入的轻量级线程，由 JVM 而非操作系统管理。与传统的平台线程相比，虚拟线程的创建成本极低，可以轻松创建百万级线程，特别适合 I/O 密集型场景。虚拟线程让开发者可以用传统的同步阻塞式编程风格实现高并发，无需学习响应式编程范式。

## 基础概念

### 虚拟线程 vs 平台线程

| 特性     | 虚拟线程                  | 平台线程            |
| -------- | ------------------------- | ------------------- |
| 创建成本 | 极低（约 1KB）            | 高（约 1MB 栈空间） |
| 数量上限 | 百万级                    | 千级                |
| 阻塞行为 | 不占用 OS 线程            | 占用 OS 线程        |
| 调度方式 | JVM 调度                  | OS 调度             |
| 适用场景 | I/O 密集型                | CPU 密集型          |
| 创建方式 | Thread.startVirtualThread | new Thread          |

### 核心术语

- **载体线程（Carrier Thread）**：运行虚拟线程的平台线程，由 ForkJoinPool 提供
- **挂载（Mount）**：虚拟线程在载体线程上执行
- **卸载（Unmount）**：虚拟线程遇到阻塞操作时从载体线程上卸载
- **固定（Pinning）**：虚拟线程无法卸载的情况，如在 synchronized 块中阻塞

## 快速上手

### 创建虚拟线程

```java
// 方式一：直接创建并启动
Thread vt = Thread.startVirtualThread(() -> {
    System.out.println("虚拟线程运行中: " + Thread.currentThread());
});

// 方式二：使用 Builder
Thread vt2 = Thread.ofVirtual()
    .name("my-vthread")
    .start(() -> doWork());

// 方式三：使用工厂
ThreadFactory factory = Thread.ofVirtual().name("worker-", 0).factory();
Thread vt3 = factory.newThread(() -> doWork());
vt3.start();
```

### 虚拟线程执行器

```java
// 使用虚拟线程执行器，每个任务一个虚拟线程
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10000).forEach(i -> {
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1)); // 模拟 I/O 操作
            return i;
        });
    });
} // 自动等待所有任务完成
```

## 详细用法

### 与 CompletableFuture 配合

```java
// 虚拟线程 + CompletableFuture 实现并发请求
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<CompletableFuture<String>> futures = urls.stream()
        .map(url -> CompletableFuture.supplyAsync(
            () -> fetchUrl(url), executor))  // 每个请求在独立虚拟线程中执行
        .toList();

    // 等待所有请求完成
    List<String> results = futures.stream()
        .map(CompletableFuture::join)
        .toList();
}
```

### Spring Boot 中使用虚拟线程

```yaml
# application.yml - 启用虚拟线程
spring:
  threads:
    virtual:
      enabled: true
```

```java
// Spring Boot 3.2+ 自动配置虚拟线程
// Tomcat 请求处理使用虚拟线程
@Configuration
public class VirtualThreadConfig {
    @Bean
    public TomcatProtocolHandlerCustomizer<?> protocolHandlerVirtualThreadExecutorCustomizer() {
        return protocolHandler -> {
            protocolHandler.setExecutor(
                Executors.newVirtualThreadPerTaskExecutor());
        };
    }

    // 异步请求处理也使用虚拟线程
    @Bean
    public AsyncTaskExecutor applicationTaskExecutor() {
        return new TaskExecutorAdapter(
            Executors.newVirtualThreadPerTaskExecutor());
    }
}
```

### 虚拟线程中的阻塞操作

```java
// 虚拟线程遇到阻塞操作会自动让出载体线程
public List<User> fetchUsers(List<Long> ids) {
    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
        List<Future<User>> futures = ids.stream()
            .map(id -> executor.submit(() -> {
                // 网络请求阻塞时，虚拟线程自动卸载，不浪费载体线程
                return httpClient.send(request, BodyHandlers.ofString());
            }))
            .toList();

        return futures.stream()
            .map(f -> {
                try { return parseUser(f.get()); }
                catch (Exception e) { throw new RuntimeException(e); }
            })
            .toList();
    }
}
```

## 常见场景

### 并发数据库查询

```java
// 使用虚拟线程并发查询多个数据源
public OrderDetail getOrderDetail(Long orderId) {
    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
        // 并发查询，每个查询在独立虚拟线程中执行
        Future<Order> orderFuture = executor.submit(() -> orderDao.findById(orderId));
        Future<List<OrderItem>> itemsFuture = executor.submit(() -> itemDao.findByOrderId(orderId));
        Future<User> userFuture = executor.submit(() -> userDao.findById(orderId));
        Future<Payment> paymentFuture = executor.submit(() -> paymentDao.findByOrderId(orderId));

        // 等待所有查询完成并组装结果
        return new OrderDetail(
            orderFuture.get(),
            itemsFuture.get(),
            userFuture.get(),
            paymentFuture.get()
        );
    } catch (Exception e) {
        throw new RuntimeException("查询订单详情失败", e);
    }
}
```

### 并发 HTTP 请求

```java
// 使用虚拟线程并发调用多个微服务
public AggregatedResult aggregateData(List<String> serviceUrls) {
    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
        List<Future<ServiceResponse>> futures = serviceUrls.stream()
            .map(url -> executor.submit(() -> callService(url)))
            .toList();

        List<ServiceResponse> responses = futures.stream()
            .map(f -> {
                try { return f.get(5, TimeUnit.SECONDS); }
                catch (TimeoutException e) { return ServiceResponse.timeout(); }
                catch (Exception e) { return ServiceResponse.error(e); }
            })
            .toList();

        return AggregatedResult.from(responses);
    }
}
```

## 注意事项

- 避免在虚拟线程中使用 synchronized，改用 ReentrantLock，防止线程固定（Pinning）
- 虚拟线程不适合 CPU 密集型计算任务，应使用平台线程或 ForkJoinPool
- 不要池化虚拟线程，每次需要时直接创建即可
- 虚拟线程的 ThreadLocal 使用需谨慎，大量虚拟线程可能导致内存问题
- 虚拟线程没有优先级概念，setPriority 无效
- 目前虚拟线程不支持 native 方法的栈帧

## 进阶用法

### 避免线程固定

```java
// 错误：synchronized 会导致虚拟线程固定在载体线程上
public synchronized void process() {  // 不要这样做
    blockingOperation();
}

// 正确：使用 ReentrantLock 替代 synchronized
private final ReentrantLock lock = new ReentrantLock();

public void process() {
    lock.lock();
    try {
        blockingOperation(); // 阻塞时虚拟线程可以正常卸载
    } finally {
        lock.unlock();
    }
}
```

### 虚拟线程与信号量控制并发

```java
// 使用 Semaphore 控制虚拟线程的并发度
public class BoundedVirtualThreadExecutor {
    private final Semaphore semaphore;

    public BoundedVirtualThreadExecutor(int maxConcurrency) {
        this.semaphore = new Semaphore(maxConcurrency);
    }

    public <T> T submitWithLimit(Callable<T> task) throws Exception {
        semaphore.acquire(); // 获取许可
        try {
            return task.call();
        } finally {
            semaphore.release(); // 释放许可
        }
    }
}

// 限制最多 100 个虚拟线程同时访问数据库
BoundedVirtualThreadExecutor executor = new BoundedVirtualThreadExecutor(100);
try (var vtExecutor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<Void>> futures = ids.stream()
        .map(id -> vtExecutor.submit(() ->
            executor.submitWithLimit(() -> queryDatabase(id))))
        .toList();
}
```

### 结构化并发（预览特性）

```java
// 使用 StructuredTaskScope 实现结构化并发（Java 21 预览）
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    // 并发执行多个子任务
    StructuredTaskScope.Subtask<String> userTask = scope.fork(() -> fetchUser(id));
    StructuredTaskScope.Subtask<String> orderTask = scope.fork(() -> fetchOrder(id));

    scope.join();           // 等待所有子任务完成
    scope.throwIfFailed();  // 任一子任务失败则抛出异常

    // 获取结果
    String user = userTask.get();
    String order = orderTask.get();
    return combine(user, order);
}
```
