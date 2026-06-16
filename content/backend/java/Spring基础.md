---
order: 61
title: Spring基础
module: java
category: Java
difficulty: intermediate
description: Spring框架核心概念
author: fanquanpp
updated: '2026-06-14'
related:
  - java/Java新特性
  - java/运算符与表达式
  - java/SpringBoot进阶
  - java/SpringBoot安全
prerequisites:
  - java/概述与开发环境
---

## 概述

Spring 框架是 Java 企业级开发的事实标准，其核心是 IoC（控制反转）容器和 AOP（面向切面编程）。IoC 容器负责管理 Bean 的生命周期和依赖关系，AOP 提供声明式的横切关注点处理。理解这两个核心概念是掌握 Spring 生态的基础。

## 基础概念

### IoC 容器

| 概念               | 说明                                         |
| ------------------ | -------------------------------------------- |
| Bean               | 由 Spring 容器管理的对象                     |
| ApplicationContext | Spring 容器，负责创建和组装 Bean             |
| 依赖注入（DI）     | 容器自动将依赖注入到 Bean 中                 |
| Bean 作用域        | singleton、prototype、request、session       |
| Bean 生命周期      | 实例化 -> 属性注入 -> 初始化 -> 使用 -> 销毁 |

### AOP 核心术语

| 术语   | 说明                               |
| ------ | ---------------------------------- |
| 切面   | 横切关注点的模块化（如日志、事务） |
| 切入点 | 定义在哪些方法上应用切面           |
| 通知   | 切面在切入点上的具体动作           |
| 织入   | 将切面应用到目标对象的过程         |

## 快速上手

### 依赖注入

```java
// 构造器注入（推荐方式，保证不可变性和可测试性）
@Service
public class UserService {
    private final UserRepository userRepository;
    private final EmailService emailService;

    // Spring 4.3+ 单构造器可省略 @Autowired
    public UserService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }
}

// 字段注入（不推荐，难以测试）
@Service
public class OrderService {
    @Autowired  // 不推荐：隐藏了依赖关系
    private PaymentGateway paymentGateway;
}
```

### Bean 配置

```java
// 方式一：组件扫描（最常用）
@Configuration
@ComponentScan(basePackages = "com.example")
public class AppConfig {}

// 方式二：Java 配置类
@Configuration
public class DataSourceConfig {
    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:postgresql://localhost/mydb");
        config.setMaximumPoolSize(10);
        return new HikariDataSource(config);
    }

    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
```

## 详细用法

### AOP 切面编程

```java
// 定义自定义注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Loggable {
    String value() default "";
}

// 实现切面
@Aspect
@Component
public class LoggingAspect {
    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);

    // 环绕通知：最强大的通知类型
    @Around("@annotation(loggable)")
    public Object logMethod(ProceedingJoinPoint pjp, Loggable loggable) throws Throwable {
        String methodName = pjp.getSignature().toShortString();
        Object[] args = pjp.getArgs();

        logger.info("调用方法: {}, 参数: {}", methodName, Arrays.toString(args));
        long start = System.nanoTime();

        try {
            Object result = pjp.proceed(); // 执行目标方法
            logger.info("方法返回: {}, 耗时: {} ms", methodName,
                (System.nanoTime() - start) / 1_000_000);
            return result;
        } catch (Exception e) {
            logger.error("方法异常: {}, 错误: {}", methodName, e.getMessage());
            throw e;
        }
    }
}

// 使用自定义注解
@Service
public class OrderService {
    @Loggable("创建订单")
    public Order createOrder(OrderRequest request) {
        // 业务逻辑
    }
}
```

### Bean 生命周期回调

```java
// 使用注解管理 Bean 生命周期
@Component
public class CacheManager {
    private Cache<String, Object> cache;

    @PostConstruct // 初始化回调
    public void init() {
        cache = Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(Duration.ofMinutes(30))
            .build();
        System.out.println("缓存初始化完成");
    }

    @PreDestroy // 销毁回调
    public void cleanup() {
        cache.cleanUp();
        System.out.println("缓存清理完成");
    }
}
```

### 条件化 Bean

```java
// 使用 @Conditional 按条件注册 Bean
@Configuration
public class CacheConfig {
    @Bean
    @ConditionalOnProperty(name = "cache.type", havingValue = "redis")
    public CacheService redisCacheService() {
        return new RedisCacheService();
    }

    @Bean
    @ConditionalOnProperty(name = "cache.type", havingValue = "local",
                           matchIfMissing = true) // 默认值
    public CacheService localCacheService() {
        return new LocalCacheService();
    }

    @Bean
    @ConditionalOnMissingBean(CacheService.class) // 当没有其他 CacheService 时生效
    public CacheService defaultCacheService() {
        return new NoOpCacheService();
    }
}
```

## 常见场景

### 事务管理

```java
// 声明式事务管理
@Service
public class OrderService {
    @Transactional // 默认只对 RuntimeException 回滚
    public Order createOrder(OrderRequest request) {
        Order order = new Order(request);
        orderRepository.save(order);
        inventoryService.deduct(request.getItems()); // 库存扣减
        return order;
    }

    // 指定回滚条件
    @Transactional(rollbackFor = Exception.class) // 所有异常都回滚
    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        accountService.debit(fromId, amount);
        accountService.credit(toId, amount);
    }

    // 只读事务，优化查询性能
    @Transactional(readOnly = true)
    public Order getOrder(Long id) {
        return orderRepository.findById(id).orElseThrow();
    }
}
```

### 事件驱动

```java
// 定义事件
public class OrderCreatedEvent extends ApplicationEvent {
    private final Order order;
    public OrderCreatedEvent(Object source, Order order) {
        super(source);
        this.order = order;
    }
    public Order getOrder() { return order; }
}

// 发布事件
@Service
public class OrderService {
    @Autowired
    private ApplicationEventPublisher publisher;

    public Order createOrder(OrderRequest request) {
        Order order = saveOrder(request);
        publisher.publishEvent(new OrderCreatedEvent(this, order));
        return order;
    }
}

// 监听事件
@Component
public class NotificationListener {
    @EventListener
    @Async // 异步处理
    public void onOrderCreated(OrderCreatedEvent event) {
        sendNotification(event.getOrder());
    }
}
```

## 注意事项

- 优先使用构造器注入，保证依赖不可变且便于测试
- @Transactional 注解只对 public 方法生效，private/protected 方法上的注解会被忽略
- 同一个类中方法互调不会触发 AOP 代理（自调用问题）
- Bean 默认是 singleton 作用域，有状态 Bean 应使用 prototype 作用域
- 避免在 Bean 的构造器中依赖尚未初始化的其他 Bean

## 进阶用法

### 自定义注解 + AOP 实现限流

```java
// 限流注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {
    int permits() default 10;
    Duration period() default Duration.ofSeconds(1);
}

// 限流切面
@Aspect
@Component
public class RateLimitAspect {
    private final ConcurrentHashMap<String, RateLimiter> limiters = new ConcurrentHashMap<>();

    @Around("@annotation(rateLimit)")
    public Object limit(ProceedingJoinPoint pjp, RateLimit rateLimit) throws Throwable {
        String key = pjp.getSignature().toLongString();
        RateLimiter limiter = limiters.computeIfAbsent(key,
            k -> RateLimiter.create(rateLimit.permits() / (double) rateLimit.period().getSeconds()));

        if (!limiter.tryAcquire()) {
            throw new RateLimitExceededException("请求过于频繁");
        }
        return pjp.proceed();
    }
}
```

### FactoryBean 创建复杂 Bean

```java
// 使用 FactoryBean 创建需要复杂初始化的 Bean
public class RestClientFactoryBean implements FactoryBean<RestClient> {
    private String baseUrl;
    private int timeout;

    @Override
    public RestClient getObject() {
        return RestClient.builder()
            .baseUrl(baseUrl)
            .defaultHeader("Content-Type", "application/json")
            .build();
    }

    @Override
    public Class<?> getObjectType() {
        return RestClient.class;
    }
}
```
