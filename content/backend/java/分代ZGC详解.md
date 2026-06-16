---
order: 106
title: 分代ZGC详解
module: java
category: 'dev-lang'
difficulty: advanced
description: 'JDK 21分代ZGC详解：原理、配置与调优。'
author: fanquanpp
updated: '2026-06-14'
related:
  - java/反射与动态代理
  - java/注解处理器
  - java/面向对象编程
  - java/抽象类与接口
prerequisites:
  - java/概述与开发环境
---

## 概述

ZGC（Z Garbage Collector）是 Oracle 开发的低延迟垃圾收集器，目标是将 GC 停顿时间控制在 1 毫秒以内，且停顿时间不随堆大小增加而增长。JDK 21 引入的分代 ZGC 将堆分为新生代和老年代，利用弱分代假说提升回收效率，是当前最先进的垃圾回收器之一。

## 基础概念

### ZGC 核心技术

| 技术       | 说明                                       |
| ---------- | ------------------------------------------ |
| 着色指针   | 在指针中存储 GC 元数据，无需额外的标记位图 |
| 读屏障     | 在对象引用加载时执行检查，确保引用正确性   |
| 并发整理   | 与应用线程并发执行对象移动，减少停顿       |
| 区域化内存 | 堆被划分为大小不等的区域（ZPage）          |
| 转发表     | 记录对象移动后的新地址，用于指针修正       |

### 为什么需要分代

- 大多数对象朝生夕死（弱分代假说），新生代对象存活率低
- 非分代 ZGC 每次都扫描整个堆，对短命对象回收效率低
- 分代后可以更频繁地回收新生代，减少全堆扫描开销
- 老年代回收频率降低，减少长生命周期对象的处理开销

### ZPage 类型

| 类型   | 大小     | 用途               |
| ------ | -------- | ------------------ |
| Small  | 2MB      | 小对象分配         |
| Medium | 32MB     | 中等大小对象       |
| Large  | N \* 2MB | 大对象（连续内存） |

## 快速上手

### 启用分代 ZGC

```bash
# JDK 21+ 启用分代 ZGC
java -XX:+UseZGC -XX:+ZGenerational -Xms4g -Xmx4g -jar app.jar

# 验证 ZGC 是否启用
java -XX:+UseZGC -XX:+ZGenerational -Xlog:gc -jar app.jar
# 输出中应包含 "Using The Z Garbage Collector" 和 "Generational"
```

### 基本 GC 日志

```bash
# 查看 ZGC 日志
java -XX:+UseZGC -XX:+ZGenerational \
  -Xlog:gc*:file=gc.log:time,uptime,level,tags \
  -jar app.jar

# 实时监控 GC
jstat -gcutil <pid> 1000
```

## 详细用法

### 核心配置参数

```bash
# 基本参数
-XX:+UseZGC                # 启用 ZGC
-XX:+ZGenerational         # 启用分代模式（JDK 21+）
-Xms4g -Xmx4g              # 堆大小（建议 Xms=Xmx）

# 调优参数
-XX:ZAllocationSpikeTolerance=2    # 分配峰值容忍度（默认2）
-XX:SoftMaxHeapSize=3g             # 软最大堆大小（GC 努力维持的目标）
-XX:ConcGCThreads=4                # 并发 GC 线程数（默认为 CPU 核数的 12.5%）
-XX:ZFragmentLimit=5               # 碎片率上限（百分比，默认5）

# 高级参数
-XX:+UnlockExperimentalVMOptions   # 解锁实验性选项
-XX:+ZVerifyForwarding             # 验证转发表正确性（调试用）
-XX:+ZVerifyViews                  # 验证指针视图（调试用）
```

### 内存分配与回收流程

```
对象分配流程：
1. 线程本地分配（TLAB） -> 快速路径
2. ZPage 分配 -> 中等路径
3. 新 ZPage 创建 -> 慢速路径（可能触发 GC）

新生代回收流程：
1. 标记阶段：并发标记存活对象
2. 转移阶段：并发将存活对象移到新 ZPage
3. 重定位阶段：修正指向已移动对象的引用

老年代回收流程：
1. 与新生代类似，但频率更低
2. 可与新生代回收并发执行
```

### 分代 ZGC 的内存布局

```
+--------------------------------------------------+
|                   ZHeap                           |
|  +------------------+  +------------------+       |
|  |    新生代         |  |    老年代         |       |
|  |  ZPage(Small)    |  |  ZPage(Small)    |       |
|  |  ZPage(Small)    |  |  ZPage(Medium)   |       |
|  |  ZPage(Medium)   |  |  ZPage(Large)    |       |
|  +------------------+  +------------------+       |
+--------------------------------------------------+

- 新生代和老年代各自维护独立的 ZPage 集合
- 对象在新生代存活足够长时间后晋升到老年代
- 新生代和老年代可以独立回收，也可以同时回收
```

## 常见场景

### 低延迟交易系统

```bash
# 交易系统配置：追求极低停顿
java -XX:+UseZGC -XX:+ZGenerational \
  -Xms16g -Xmx16g \
  -XX:SoftMaxHeapSize=12g \
  -XX:ConcGCThreads=8 \
  -XX:ZAllocationSpikeTolerance=3 \
  -XX:+UseLargePages \
  -XX:LargePageSizeInBytes=2m \
  -jar trading-app.jar
```

### 大内存缓存服务

```bash
# 缓存服务配置：大堆内存
java -XX:+UseZGC -XX:+ZGenerational \
  -Xms64g -Xmx64g \
  -XX:SoftMaxHeapSize=48g \
  -XX:ConcGCThreads=12 \
  -XX:ZFragmentLimit=3 \
  -jar cache-service.jar
```

### 从 G1 迁移到 ZGC

```bash
# 迁移步骤：
# 1. 在测试环境启用分代 ZGC
java -XX:+UseZGC -XX:+ZGenerational -Xms4g -Xmx4g -jar app.jar

# 2. 收集 GC 日志并分析停顿时间
java -XX:+UseZGC -XX:+ZGenerational \
  -Xlog:gc*:file=zgc.log:time,uptime \
  -jar app.jar

# 3. 对比 G1 和 ZGC 的性能指标
#    - 最大停顿时间
#    - 吞吐量
#    - CPU 使用率
#    - 内存使用量

# 4. 调整 ConcGCThreads 和 SoftMaxHeapSize
```

## 注意事项

- 分代 ZGC 从 JDK 21 开始提供，早期版本仅支持非分代模式
- ZGC 的吞吐量略低于 G1（约低 5-10%），但停顿时间大幅降低
- ZGC 需要更多的堆外内存用于存储元数据（约为堆大小的 3%）
- 读屏障会带来约 4% 的性能开销，但换来的是极低的停顿
- 在 Linux 上建议启用大页内存（-XX:+UseLargePages）提升性能
- ZGC 不支持压缩指针（CompressedOops），32GB 以下堆可能不如 G1

## 进阶用法

### ZGC 调优策略

```bash
# 策略一：调整并发线程数
# ConcGCThreads 默认为 CPU 核数的 12.5%
# 如果 GC 频率高，可以增加并发线程数
-XX:ConcGCThreads=8  # 8核机器可以设为2-4

# 策略二：调整软最大堆
# SoftMaxHeapSize 是 GC 努力维持的目标
# 实际堆使用可以超过此值，但 GC 会更积极地回收
-XX:SoftMaxHeapSize=3g  # 在4GB堆中设为3GB

# 策略三：调整分配容忍度
# ZAllocationSpikeTolerance 控制分配高峰时的容忍度
# 如果有突发流量，可以适当增大
-XX:ZAllocationSpikeTolerance=3
```

### ZGC 监控与诊断

```bash
# 使用 JFR（Java Flight Recorder）监控 ZGC
java -XX:+UseZGC -XX:+ZGenerational \
  -XX:StartFlightRecording=duration=60s,filename=zgc.jfr \
  -jar app.jar

# 使用 JMX 监控 ZGC 指标
# 关键 MBean：java.lang:type=GarbageCollector,name=ZGC

# 使用 jcmd 获取 ZGC 详细信息
jcmd <pid> GC.heap_info
jcmd <pid> GC.class_histogram
jcmd <pid> VM.info
```

### 非分代到分代的迁移注意事项

```bash
# 分代 ZGC 的行为变化：
# 1. 新生代回收频率高于老年代
# 2. 对象晋升条件：经历多次新生代回收仍存活
# 3. Mixed GC：同时回收新生代和部分老年代
# 4. 内存使用模式可能不同，需要重新评估堆大小

# 迁移后需要验证：
# - GC 停顿时间是否满足要求
# - 吞吐量是否可接受
# - 内存使用是否合理
# - 是否有晋升失败等问题
```
