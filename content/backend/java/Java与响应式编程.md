---
order: 80
title: Java与响应式编程
module: java
category: Java
difficulty: advanced
description: 'Project Reactor与WebFlux'
author: fanquanpp
updated: '2026-06-14'
related:
  - java/Java与安全
  - java/Java与WebAssembly
  - java/方法详解
  - java/Java与虚拟线程
prerequisites:
  - java/概述与开发环境
---

## 概述

响应式编程是一种基于异步数据流的编程范式，通过声明式的方式处理异步事件。在 Java 生态中，Project Reactor 是核心响应式库，Spring WebFlux 是基于 Reactor 的响应式 Web 框架。响应式编程适合 I/O 密集型的高并发场景，但学习曲线较陡。对于新项目，如果追求低延迟和高吞吐量，可以考虑使用虚拟线程替代。

## 基础概念

### 响应式核心类型

| 类型       | 说明                         |
| ---------- | ---------------------------- |
| Mono       | 表示 0 或 1 个元素的异步序列 |
| Flux       | 表示 0 到 N 个元素的异步序列 |
| Publisher  | 响应式流的发布者接口         |
| Subscriber | 响应式流的订阅者接口         |

### 响应式流规范

- **onSubscribe**：订阅成功时调用，传入 Subscription
- **onNext**：每收到一个元素时调用
- **onError**：发生错误时调用，之后不再调用其他方法
- **onComplete**：所有元素处理完成后调用

### 背压（Backpressure）

当生产者速度大于消费者时，背压机制允许消费者告知生产者降低发送速率，避免内存溢出。

## 快速上手

### Mono 与 Flux 创建

```java
// Mono：0 或 1 个元素
Mono<String> mono1 = Mono.just("Hello");
Mono<String> mono2 = Mono.empty();
Mono<String> mono3 = Mono.fromCallable(() -> fetchData());
Mono<String> mono4 = Mono.fromSupplier(() -> computeResult());

// Flux：0 到 N 个元素
Flux<Integer> flux1 = Flux.just(1, 2, 3, 4, 5);
Flux<Integer> flux2 = Flux.range(1, 100);
Flux<Long> flux3 = Flux.interval(Duration.ofSeconds(1)); // 每秒发射一个递增数字
Flux<Integer> flux4 = Flux.fromIterable(List.of(1, 2, 3));

// 订阅并处理
mono1.map(String::toUpperCase)
    .flatMap(this::processAsync)
    .subscribe(
        result -> System.out.println("结果: " + result),
        error -> System.err.println("错误: " + error.getMessage()),
        () -> System.out.println("完成")
    );
```

### 基本操作符

```java
// 转换操作
Flux<String> names = Flux.just("Alice", "Bob", "Charlie")
    .map(String::toUpperCase)              // 转换元素
    .filter(name -> name.length() > 3)     // 过滤
    .flatMap(name -> splitToChars(name))   // 展平
    .distinct()                            // 去重
    .sort();                               // 排序

// 组合操作
Flux<Integer> merged = Flux.merge(flux1, flux2);     // 合并
Flux<Integer> concatenated = Flux.concat(flux1, flux2); // 顺序连接
Flux<Tuple2<Integer, String>> zipped = Flux.zip(flux1, flux2); // 配对
```

## 详细用法

### WebFlux 控制器

```java
// 响应式 Web 控制器
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // 返回单个用户
    @GetMapping("/{id}")
    public Mono<User> getUser(@PathVariable String id) {
        return userService.findById(id);
    }

    // 返回用户列表
    @GetMapping
    public Flux<User> listUsers() {
        return userService.findAll();
    }

    // 创建用户
    @PostMapping
    public Mono<User> createUser(@RequestBody UserRequest request) {
        return userService.create(request);
    }

    // 服务端推送事件（SSE）
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<User> streamUsers() {
        return Flux.interval(Duration.ofSeconds(2))
            .flatMap(tick -> userService.findLatest());
    }
}
```

### 响应式数据访问

```java
// 使用 R2DBC 进行响应式数据库操作
@Repository
public interface UserRepository extends ReactiveCrudRepository<User, String> {
    Mono<User> findByEmail(String email);
    Flux<User> findByAgeGreaterThan(int age);
}

// 自定义查询
@Service
public class UserService {
    private final UserRepository userRepository;

    public Mono<User> findByIdOrCreate(String id, UserRequest request) {
        return userRepository.findById(id)
            .switchIfEmpty(userRepository.save(new User(request)));
    }

    public Flux<User> findActiveUsers() {
        return userRepository.findAll()
            .filter(user -> user.getStatus() == Status.ACTIVE);
    }
}
```

### 错误处理

```java
// 响应式错误处理
public Mono<User> getUser(String id) {
    return userRepository.findById(id)
        // 元素为空时切换到备选值
        .switchIfEmpty(Mono.error(new UserNotFoundException(id)))
        // 发生错误时返回默认值
        .onErrorReturn(User.DEFAULT)
        // 根据异常类型处理
        .onErrorResume(TimeoutException.class,
            ex -> fallbackService.getUser(id))
        // 错误时重试
        .retry(3)
        // 带退避策略的重试
        .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
            .maxBackoff(Duration.ofSeconds(10))
            .filter(ex -> ex instanceof ServiceException))
        // 最终处理（类似 finally）
        .doFinally(signal -> cleanup());
}
```

### 调度器与线程模型

```java
// 切换执行线程
Flux<Integer> result = Flux.range(1, 100)
    .publishOn(Schedulers.boundedElastic())  // 切换到弹性线程池执行后续操作
    .map(this::blockingOperation)             // 阻塞操作在弹性线程池中执行
    .publishOn(Schedulers.parallel())         // 切换到并行线程池
    .map(this::cpuIntensiveWork)              // CPU 密集型操作在并行线程池中执行
    .subscribeOn(Schedulers.boundedElastic()); // 订阅操作在弹性线程池中执行

// 常用调度器
// Schedulers.immediate()     - 当前线程
// Schedulers.single()        - 单一线程
// Schedulers.boundedElastic() - 弹性线程池（适合阻塞操作）
// Schedulers.parallel()      - 并行线程池（适合 CPU 密集型）
```

## 常见场景

### 并发请求聚合

```java
// 并发调用多个服务并聚合结果
public Mono<OrderDetail> getOrderDetail(String orderId) {
    Mono<Order> order = orderService.getOrder(orderId);
    Mono<User> user = userService.getUser(orderId);
    Mono<Payment> payment = paymentService.getPayment(orderId);

    // 等待所有请求完成后组装
    return Mono.zip(order, user, payment)
        .map(tuple -> new OrderDetail(
            tuple.getT1(), tuple.getT2(), tuple.getT3()));
}
```

### 响应式缓存

```java
// 使用 Caffeine + Reactor 实现响应式缓存
public Mono<User> getUserWithCache(String id) {
    return Mono.fromCallable(() -> cache.getIfPresent(id))
        .flatMap(cached -> cached != null
            ? Mono.just(cached)
            : userRepository.findById(id)
                .doOnNext(user -> cache.put(id, user)));
}
```

## 注意事项

- 响应式代码调试困难，建议使用 reactor-tools 的 debug 模式
- 在响应式链中不要使用阻塞操作（如 Thread.sleep、blockingGet），会破坏响应式模型
- 必须处理错误，否则错误会被静默吞掉
- 响应式编程的学习曲线陡峭，团队需要统一理解
- 对于 I/O 密集型场景，Java 21 的虚拟线程可能是更简单的替代方案
- WebFlux 和 Spring MVC 不能混用，一个项目只能选一种

## 进阶用法

### 自定义 Operator

```java
// 自定义操作符：添加请求日志
public class LoggingOperator implements CoreOperator<String, String> {
    @Override
    public Subscriber<? super String> apply(Subscriber<? super String> subscriber) {
        return new LoggingSubscriber(subscriber);
    }

    private static class LoggingSubscriber implements CoreSubscriber<String> {
        private final CoreSubscriber<? super String> downstream;

        LoggingSubscriber(CoreSubscriber<? super String> downstream) {
            this.downstream = downstream;
        }

        @Override
        public void onSubscribe(Subscription s) {
            downstream.onSubscribe(s);
        }

        @Override
        public void onNext(String s) {
            System.out.println("收到数据: " + s);
            downstream.onNext(s);
        }

        @Override
        public void onError(Throwable t) {
            System.err.println("发生错误: " + t.getMessage());
            downstream.onError(t);
        }

        @Override
        public void onComplete() {
            System.out.println("流完成");
            downstream.onComplete();
        }
    }
}
```

### Hot Stream 与 Cold Stream

```java
// Cold Stream：每个订阅者独立接收所有数据
Flux<Integer> cold = Flux.range(1, 5);
cold.subscribe(n -> System.out.println("订阅者1: " + n));
cold.subscribe(n -> System.out.println("订阅者2: " + n));
// 两个订阅者都会收到 1-5

// Hot Stream：共享数据源，后订阅的会错过之前的数据
Sinks.Many<String> sink = Sinks.many().multicast().onBackpressureBuffer();
sink.tryEmitNext("消息1");
sink.asFlux().subscribe(msg -> System.out.println("订阅者1: " + msg));
sink.tryEmitNext("消息2");
sink.asFlux().subscribe(msg -> System.out.println("订阅者2: " + msg));
sink.tryEmitNext("消息3");
// 订阅者1 收到 消息1,2,3；订阅者2 只收到 消息2,3
```
