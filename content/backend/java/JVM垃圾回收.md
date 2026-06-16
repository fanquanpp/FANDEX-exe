---
order: 55
title: JVM垃圾回收
module: java
category: Java
difficulty: advanced
description: GC算法与垃圾回收器
author: fanquanpp
updated: '2026-06-14'
related:
  - java/JUC并发包
  - java/JVM类加载机制
  - java/Java反射
  - java/Java序列化
prerequisites:
  - java/概述与开发环境
---

## 概述

JVM 垃圾回收（GC）是自动内存管理的核心机制，负责回收不再使用的对象占用的内存空间。理解 GC 算法、分代模型和各种回收器的特点，是进行 JVM 调优和排查内存问题的基础。

## 基础概念

### GC 算法

| 算法      | 原理                         | 优点           | 缺点           |
| --------- | ---------------------------- | -------------- | -------------- |
| 标记-清除 | 标记存活对象，清除未标记对象 | 实现简单       | 产生内存碎片   |
| 标记-整理 | 标记后将存活对象移向一端     | 无碎片         | 移动对象开销大 |
| 复制算法  | 将存活对象复制到另一半空间   | 无碎片、效率高 | 可用空间减半   |
| 分代收集  | 根据对象存活时间选择不同算法 | 综合效率最高   | 实现复杂       |

### 分代模型

```
+-------------------+-------------------+
|     新生代         |      老年代       |
| Eden | S0 | S1    |                   |
+-------------------+-------------------+
```

- **新生代**：新对象在 Eden 区分配，Minor GC 频率高但速度快
- **老年代**：长期存活的对象晋升到老年代，Major GC/Full GC 频率低但停顿长
- **对象晋升**：默认经历 15 次 Minor GC 仍存活的对象晋升到老年代

### GC 类型

| 类型     | 说明                             |
| -------- | -------------------------------- |
| Minor GC | 回收新生代，频率高，停顿短       |
| Major GC | 回收老年代（不同回收器定义不同） |
| Full GC  | 回收整个堆和方法区，停顿最长     |
| Mixed GC | G1 回收新生代和部分老年代区域    |

## 快速上手

### 查看 GC 日志

```bash
# Java 8 查看 GC 日志
java -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:gc.log -jar app.jar

# Java 9+ 使用统一日志框架
java -Xlog:gc*:file=gc.log:time,uptime,level,tags -jar app.jar

# 查看 GC 摘要信息
jstat -gcutil <pid> 1000  # 每秒打印一次 GC 统计
```

### 选择垃圾回收器

```bash
# Serial 收集器：单线程，适合客户端应用
java -XX:+UseSerialGC -jar app.jar

# Parallel 收集器：多线程，吞吐量优先（Java 8 默认）
java -XX:+UseParallelGC -jar app.jar

# G1 收集器：分区收集，停顿可控（Java 9+ 默认）
java -XX:+UseG1GC -jar app.jar

# ZGC 收集器：超低延迟（Java 15+ 生产可用）
java -XX:+UseZGC -jar app.jar
```

## 详细用法

### G1 收集器配置

```bash
# G1 收集器核心参数
java -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \       # 目标最大停顿时间（毫秒）
  -XX:G1HeapRegionSize=8m \        # Region 大小（1/2/4/8/16/32MB）
  -XX:InitiatingHeapOccupancyPercent=45 \ # 触发并发标记的堆占用比例
  -XX:G1MixedGCCountTarget=8 \     # Mixed GC 最大次数
  -XX:G1ReservePercent=10 \        # 保留空间比例，防止晋升失败
  -Xms2g -Xmx2g \                  # 堆大小（建议 Xms=Xmx）
  -jar app.jar
```

### ZGC 收集器配置

```bash
# ZGC 收集器核心参数
java -XX:+UseZGC \
  -XX:ZAllocationSpikeTolerance=2 \  # 分配峰值容忍度
  -XX:SoftMaxHeapSize=1g \           # 软最大堆大小
  -XX:ConcGCThreads=4 \              # 并发 GC 线程数
  -Xms2g -Xmx4g \                    # 堆大小范围
  -jar app.jar

# JDK 21 分代 ZGC
java -XX:+UseZGC -XX:+ZGenerational -jar app.jar
```

### 常见 JVM 调优参数

```bash
# 堆内存设置
-Xms4g                    # 初始堆大小
-Xmx4g                    # 最大堆大小
-Xmn2g                    # 新生代大小
-XX:MetaspaceSize=256m    # 元空间初始大小
-XX:MaxMetaspaceSize=512m # 元空间最大大小

# GC 通用参数
-XX:+UseG1GC              # 使用 G1 收集器
-XX:MaxGCPauseMillis=200  # 目标最大停顿时间
-XX:+HeapDumpOnOutOfMemoryError  # OOM 时自动生成堆转储
-XX:HeapDumpPath=/logs/   # 堆转储文件路径

# 线程栈设置
-Xss512k                  # 每个线程的栈大小
```

## 常见场景

### 排查内存泄漏

```bash
# 第一步：观察 GC 行为
jstat -gcutil <pid> 1000 5  # 每1秒打印5次

# 第二步：查看对象统计
jmap -histo <pid> | head -20  # 查看占用内存最多的对象类型

# 第三步：生成堆转储
jmap -dump:format=b,file=heap.hprof <pid>

# 第四步：使用 MAT 或 VisualVM 分析堆转储
# 重点关注：Dominator Tree、Leak Suspects
```

### Full GC 频繁排查

```bash
# 常见原因及排查思路：
# 1. 老年代空间不足 -> 检查大对象分配
# 2. 元空间不足 -> 检查动态类生成（如 CGLIB）
# 3. 显式调用 System.gc() -> 检查代码或禁用
# 4. 内存泄漏 -> 使用堆转储分析

# 禁用显式 GC 调用
java -XX:+DisableExplicitGC -jar app.jar
```

### 大堆内存调优

```bash
# 16GB 堆内存的 G1 配置建议
java -XX:+UseG1GC \
  -Xms16g -Xmx16g \
  -XX:MaxGCPauseMillis=200 \
  -XX:G1HeapRegionSize=16m \
  -XX:InitiatingHeapOccupancyPercent=40 \
  -XX:ParallelGCThreads=8 \
  -XX:ConcGCThreads=4 \
  -XX:+UseLargePages \
  -jar app.jar
```

## 注意事项

- Xms 和 Xmx 建议设置为相同值，避免运行时堆大小调整的开销
- G1 的 MaxGCPauseMillis 是目标值而非保证值，实际停顿可能超过
- 频繁 Full GC 通常意味着内存分配有问题，需要排查而非仅调参
- ZGC 适合大堆内存（>4GB）和低延迟要求的场景
- GC 调优应基于实际负载和 GC 日志，不要凭经验猜测
- 生产环境务必开启 HeapDumpOnOutOfMemoryError

## 进阶用法

### GC 日志分析

```bash
# 使用 GCEasy 在线分析 GC 日志
# 访问 https://gceasy.io 上传 gc.log 文件

# 使用 JDK 自带工具分析
# 生成 GC 日志
java -Xlog:gc*:file=gc.log -jar app.jar

# 使用 jstat 实时监控
jstat -gc <pid> 1000  # 每秒打印 GC 统计信息

# 关键指标：
# YGC  - Young GC 次数
# YGCT - Young GC 总耗时
# FGC  - Full GC 次数
# FGCT - Full GC 总耗时
# GCT  - GC 总耗时
```

### 内存分配策略

```java
// 大对象直接进入老年代
// -XX:PretenureSizeThreshold=1M  超过1MB的对象直接在老年代分配
// 仅对 Serial 和 ParNew 收集器有效

// 长期存活对象进入老年代
// -XX:MaxTenuringThreshold=15  默认15次GC后晋升

// 动态年龄判断
// 如果 Survivor 中相同年龄对象总大小超过 Survivor 空间一半，
// 大于等于该年龄的对象直接晋升老年代

// 空间分配担保
// -XX:-HandlePromotionFailure  关闭空间分配担保（JDK 6+ 默认开启）
```
