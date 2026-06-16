---
order: 107
title: 'Floyd-Warshall'
module: algorithm
category: 'comp-sci'
difficulty: intermediate
description: 'Floyd-Warshall 多源最短路径算法：动态规划推导、路径重建、负环检测与传递闭包。'
author: fanquanpp
updated: '2026-06-14'
related:
  - algorithm/KMP字符串匹配
  - algorithm/动态规划状态压缩
  - algorithm/Kruskal算法
  - algorithm/拓扑排序
prerequisites:
  - algorithm/算法分析基础与学习路线
---

## 1. 算法原理

### 1.1 动态规划定义

$$dp[k][i][j] = \text{从 } i \text{ 到 } j \text{，只经过节点 } \{0, 1, \ldots, k\} \text{ 的最短路径}$$

### 1.2 状态转移

$$dp[k][i][j] = \min(dp[k-1][i][j],\ dp[k-1][i][k] + dp[k-1][k][j])$$

含义：要么不经过 $k$，要么经过 $k$（$i \to k \to j$）。

### 1.3 空间优化

$k$ 维可以省略，原地更新：

```python
def floyd_warshall(dist):
    n = len(dist)
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    return dist
```

## 2. 路径重建

### 2.1 记录中间节点

```python
def floyd_with_path(dist):
    n = len(dist)
    nxt = [[j if dist[i][j] < float('inf') else -1 for j in range(n)] for i in range(n)]

    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
                    nxt[i][j] = nxt[i][k]

    return dist, nxt

def reconstruct_path(nxt, i, j):
    if nxt[i][j] == -1:
        return []
    path = [i]
    while i != j:
        i = nxt[i][j]
        path.append(i)
    return path
```

## 3. 负环检测

### 3.1 检测方法

Floyd 完成后，如果 `dist[i][i] < 0`，则存在经过 $i$ 的负环：

```python
def has_negative_cycle(dist):
    n = len(dist)
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    for i in range(n):
        if dist[i][i] < 0:
            return True
    return False
```

## 4. 传递闭包

### 4.1 可达性矩阵

将 Floyd 用于判断节点间是否可达：

```python
def transitive_closure(reach):
    n = len(reach)
    for k in range(n):
        for i in range(n):
            for j in range(n):
                reach[i][j] = reach[i][j] or (reach[i][k] and reach[k][j])
    return reach
```

### 4.2 位运算优化

```python
def transitive_closure_bitwise(reach):
    n = len(reach)
    for k in range(n):
        for i in range(n):
            if reach[i] & (1 << k):
                reach[i] |= reach[k]
    return reach
```

## 5. 复杂度与应用

| 维度 | 值                       |
| ---- | ------------------------ |
| 时间 | $O(n^3)$                 |
| 空间 | $O(n^2)$                 |
| 适用 | $n \leq 400$，多源最短路 |

**适用场景**：稠密图、需要所有节点对最短路、负权边（无负环）。
