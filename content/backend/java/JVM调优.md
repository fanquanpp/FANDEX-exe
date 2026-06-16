---
order: 100
title: JVM调优
module: java
category: 'dev-lang'
difficulty: advanced
description: JVM调优详解：堆参数、GC日志、MAT分析。
author: fanquanpp
updated: '2026-06-14'
related:
  - java/Java新特性与生态
  - java/数组详解
  - java/集合框架详解
  - java/并发编程详解
prerequisites:
  - java/概述与开发环境
---

## 1. 堆内存参数

```bash
# 堆大小
-Xms512m          # 初始堆大小
-Xmx2g            # 最大堆大小
-Xmn256m          # 新生代大小

# 元空间
-XX:MetaspaceSize=256m
-XX:MaxMetaspaceSize=512m

# 栈大小
-Xss512k          # 每个线程栈大小
```

## 2. GC 日志

```bash
# JDK 8
-XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:gc.log

# JDK 11+
-Xlog:gc*:file=gc.log:time,uptime,level,tags
```

## 3. 常用调优策略

### 3.1 选择 GC 算法

| GC       | 适用场景         |
| -------- | ---------------- |
| Serial   | 单核、小内存     |
| Parallel | 吞吐量优先       |
| CMS      | 低延迟（已废弃） |
| G1       | 通用、平衡       |
| ZGC      | 超低延迟         |

### 3.2 G1 调优

```bash
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200  # 目标停顿时间
-XX:G1HeapRegionSize=8m   # Region 大小
-XX:InitiatingHeapOccupancyPercent=45  # 触发并发标记的堆占用率
```

## 4. MAT 分析

1. 使用 jmap 生成堆转储：`jmap -dump:format=b,file=heap.hprof <pid>`
2. 用 MAT 打开 heap.hprof
3. 查看 Dominator Tree 找到最大对象
4. 查看 Leak Suspects 报告
