---
order: 72
title: Java与消息队列
module: java
category: Java
difficulty: intermediate
description: Kafka与RabbitMQ集成
author: fanquanpp
updated: '2026-06-14'
related:
  - java/控制流
  - java/Java与微服务
  - java/Java与Redis
  - java/Java与Docker
prerequisites:
  - java/概述与开发环境
---

## 概述

消息队列是分布式系统中实现解耦、异步处理和流量削峰的核心基础设施。Java 生态中，Kafka 适合高吞吐量的日志和事件流处理，RabbitMQ 适合复杂的消息路由和可靠投递。本文介绍两者在 Java 中的集成方式及最佳实践。

## 基础概念

### 消息模型对比

| 特性     | Kafka                   | RabbitMQ         |
| -------- | ----------------------- | ---------------- |
| 定位     | 分布式事件流平台        | 消息代理         |
| 吞吐量   | 极高（百万级/秒）       | 高（万级/秒）    |
| 消息保留 | 持久化，按时间/容量保留 | 确认后删除       |
| 消息顺序 | 分区内有序              | 队列内有序       |
| 路由能力 | 基于主题                | 丰富的交换机类型 |
| 适用场景 | 日志收集、事件溯源      | 任务队列、RPC    |

### 核心术语

- **Producer（生产者）**：发送消息的应用
- **Consumer（消费者）**：接收消息的应用
- **Broker**：消息服务器
- **Topic/Queue**：消息目的地
- **Partition**：Kafka 中 Topic 的分区，实现并行消费

## 快速上手

### Kafka 生产与消费

```java
// Spring Boot 中使用 Kafka
// 生产者：发送消息
@Service
public class OrderProducer {
    @Autowired
    private KafkaTemplate<String, OrderEvent> kafkaTemplate;

    public void sendOrder(OrderEvent event) {
        kafkaTemplate.send("orders", event.getOrderId(), event);
    }
}

// 消费者：接收消息
@Component
public class OrderConsumer {
    @KafkaListener(topics = "orders", groupId = "order-service")
    public void handleOrder(OrderEvent event) {
        processOrder(event);
    }
}
```

### RabbitMQ 生产与消费

```java
// Spring Boot 中使用 RabbitMQ
// 生产者
@Service
public class TaskProducer {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendTask(Task task) {
        rabbitTemplate.convertAndSend("task-exchange", "task.routing", task);
    }
}

// 消费者
@Component
public class TaskConsumer {
    @RabbitListener(queues = "task-queue")
    public void handleTask(Task task) {
        process(task);
    }
}
```

## 详细用法

### Kafka 配置与高级特性

```java
// Kafka 生产者配置
@Configuration
public class KafkaProducerConfig {
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        props.put(ProducerConfig.ACKS_CONFIG, "all"); // 等待所有副本确认
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true); // 启用幂等
        props.put(ProducerConfig.RETRIES_CONFIG, 3); // 重试次数
        return new DefaultKafkaProducerFactory<>(props);
    }
}

// 手动确认消费
@KafkaListener(topics = "orders", groupId = "order-service")
public void handleOrder(ConsumerRecord<String, OrderEvent> record, Acknowledgment ack) {
    try {
        processOrder(record.value());
        ack.acknowledge(); // 手动确认
    } catch (Exception e) {
        // 处理失败，不确认，消息会重新投递
        log.error("处理订单失败: {}", record.value(), e);
    }
}
```

### RabbitMQ 交换机与路由

```java
// RabbitMQ 配置：定义交换机、队列和绑定
@Configuration
public class RabbitConfig {
    // 声明交换机
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange("order.exchange");
    }

    // 声明队列
    @Bean
    public Queue paymentQueue() {
        return QueueBuilder.durable("payment.queue")
            .withArgument("x-dead-letter-exchange", "dlx.exchange") // 死信交换机
            .withArgument("x-message-ttl", 60000) // 消息 TTL 60秒
            .build();
    }

    @Bean
    public Queue inventoryQueue() {
        return QueueBuilder.durable("inventory.queue").build();
    }

    // 绑定队列到交换机
    @Bean
    public Binding paymentBinding() {
        return BindingBuilder.bind(paymentQueue())
            .to(orderExchange()).with("order.paid");
    }

    @Bean
    public Binding inventoryBinding() {
        return BindingBuilder.bind(inventoryQueue())
            .to(orderExchange()).with("order.created");
    }
}
```

### 消息可靠性保障

```java
// Kafka 事务消息
@Transactional
public void createOrder(Order order) {
    orderRepository.save(order);
    // 事务内发送消息，保证数据库操作和消息发送的原子性
    kafkaTemplate.executeInTransaction(kt -> {
        kt.send("orders", order.getId(), new OrderEvent(order));
        return true;
    });
}

// RabbitMQ 消息确认回调
@Component
public class RabbitConfirmCallback implements RabbitTemplate.ConfirmCallback {
    @Override
    public void confirm(CorrelationData correlationData, boolean ack, String cause) {
        if (ack) {
            log.info("消息发送成功: {}", correlationData);
        } else {
            log.error("消息发送失败: {}, 原因: {}", correlationData, cause);
            // 执行重试或记录到数据库
        }
    }
}
```

## 常见场景

### 延迟消息

```java
// 使用 RabbitMQ 实现延迟消息（订单超时取消）
@Bean
public Queue orderDelayQueue() {
    return QueueBuilder.durable("order.delay.queue")
        .withArgument("x-dead-letter-exchange", "order.exchange")
        .withArgument("x-dead-letter-routing-key", "order.timeout")
        .withArgument("x-message-ttl", 1800000) // 30分钟超时
        .build();
}

// 创建订单时发送延迟消息
public void createOrder(Order order) {
    orderRepository.save(order);
    rabbitTemplate.convertAndSend("", "order.delay.queue", order);
    // 30分钟后消息进入死信队列，触发超时处理
}

// 超时处理
@RabbitListener(queues = "order.timeout.queue")
public void handleTimeout(Order order) {
    if (order.getStatus() == Status.UNPAID) {
        order.setStatus(Status.CANCELLED);
        orderRepository.save(order);
    }
}
```

### 消息重试与死信

```java
// Spring Kafka 重试配置
@Configuration
public class KafkaRetryConfig {
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, String>
            kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, String> factory =
            new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        // 配置重试模板
        RetryTemplate retryTemplate = new RetryTemplate();
        retryTemplate.setRetryPolicy(new SimpleRetryPolicy(3)); // 最多重试3次
        retryTemplate.setBackOffPolicy(new ExponentialBackOffPolicy());
        factory.setRetryTemplate(retryTemplate);
        // 重试失败后发送到死信主题
        factory.setErrorHandler(new DeadLetterPublishingRecoverer(kafkaTemplate()));
        return factory;
    }
}
```

## 注意事项

- Kafka 消费者偏移量提交策略需根据业务选择自动或手动提交
- RabbitMQ 消息消费失败时应考虑重试次数限制，避免无限重试
- 消息体应保持精简，大数据不要放入消息队列，可传递引用（如文件路径）
- Kafka 分区数不宜过多，每个分区都会消耗 Broker 内存和文件句柄
- 消费者组的消费者数量不应超过分区数，多余的消费者会空闲
- 生产环境务必开启消息持久化和确认机制

## 进阶用法

### Kafka Streams

```java
// 使用 Kafka Streams 进行实时流处理
@Configuration
public class OrderStreamConfig {
    @Bean
    public KStream<String, OrderEvent> orderStream(StreamsBuilder builder) {
        KStream<String, OrderEvent> stream = builder.stream("orders");

        // 按用户分组，统计每分钟的订单数
        stream.groupBy((key, order) -> order.getUserId())
            .windowedBy(TimeWindows.ofSizeWithNoGrace(Duration.ofMinutes(1)))
            .count(Materialized.as("order-counts"))
            .toStream()
            .to("order-statistics");

        return stream;
    }
}
```

### 消息幂等消费

```java
// 实现幂等消费，防止消息重复处理
@Component
public class IdempotentOrderConsumer {
    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @KafkaListener(topics = "orders", groupId = "order-service")
    public void handleOrder(OrderEvent event) {
        String key = "order:processed:" + event.getOrderId();
        // 使用 Redis SETNX 实现幂等判断
        Boolean isNew = redisTemplate.opsForValue()
            .setIfAbsent(key, "1", Duration.ofHours(24));
        if (Boolean.FALSE.equals(isNew)) {
            log.info("订单已处理，跳过: {}", event.getOrderId());
            return;
        }
        processOrder(event);
    }
}
```
