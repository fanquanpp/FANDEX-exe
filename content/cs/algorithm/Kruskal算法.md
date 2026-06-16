---
order: 108
title: Kruskal算法
module: algorithm
category: 'comp-sci'
difficulty: intermediate
description: 'Kruskal 最小生成树算法：贪心策略、并查集优化、边排序与实际应用。'
author: fanquanpp
updated: '2026-06-14'
related:
  - algorithm/动态规划状态压缩
  - 'algorithm/Floyd-Warshall算法'
  - algorithm/拓扑排序
  - algorithm/算法理论知识点
prerequisites:
  - algorithm/算法分析基础与学习路线
---

## 1. 最小生成树

### 1.1 定义

给定连通无向图 $G=(V,E)$，最小生成树（MST）是边集 $T \subseteq E$，使得：

- $T$ 连接所有顶点（生成树）
- $T$ 的边权之和最小

### 1.2 MST 性质

- $n$ 个顶点的 MST 恰好有 $n-1$ 条边
- MST 可能不唯一（边权相同时）
- 切割性质：横跨切割的最小权边一定在 MST 中

## 2. Kruskal 算法

### 2.1 贪心策略

按边权从小到大排序，依次加入不形成环的边：

```
1. 将所有边按权重排序
2. 初始化并查集，每个顶点独立
3. 遍历排序后的边:
   - 如果边的两端不在同一集合 → 加入MST，合并集合
   - 否则跳过（会形成环）
4. 重复直到选了 n-1 条边
```

### 2.2 实现

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False
        if self.rank[rx] < self.rank[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        if self.rank[rx] == self.rank[ry]:
            self.rank[rx] += 1
        return True

def kruskal(n, edges):
    edges.sort(key=lambda e: e[2])
    uf = UnionFind(n)
    mst = []
    total = 0
    for u, v, w in edges:
        if uf.union(u, v):
            mst.append((u, v, w))
            total += w
            if len(mst) == n - 1:
                break
    return mst, total
```

### 2.3 执行示例

```
图:
    A --4-- B --3-- C
    |      /|       |
    1    2  5       6
    |  /    |       |
    D --8-- E --7-- F

边排序: (A,D,1), (B,E,2), (B,C,3), (A,B,4), (B,D,5), (C,F,6), (E,F,7), (D,E,8)

选边过程:
  (A,D,1) → 加入, union(A,D)
  (B,E,2) → 加入, union(B,E)
  (B,C,3) → 加入, union(B,C)
  (A,B,4) → 加入, union(A,B)  (A和D已连通,B和C,E已连通)
  (B,D,5) → 跳过 (B和D已连通)
  (C,F,6) → 加入, union(C,F)
  → 已选5条边(n-1=5), 结束

MST总权: 1+2+3+4+6 = 16
```

## 3. 复杂度分析

| 步骤       | 复杂度           |
| ---------- | ---------------- |
| 排序       | $O(E \log E)$    |
| 并查集操作 | $O(E \alpha(V))$ |
| 总计       | $O(E \log E)$    |

稀疏图（$E \approx V$）时优于 Prim 的 $O(V^2)$。

## 4. Kruskal vs Prim

| 维度     | Kruskal       | Prim          |
| -------- | ------------- | ------------- |
| 策略     | 加边法        | 加点法        |
| 数据结构 | 并查集        | 优先队列      |
| 稀疏图   | $O(E \log E)$ | $O(E \log V)$ |
| 稠密图   | $O(E \log E)$ | $O(V^2)$      |
| 实现     | 简单          | 中等          |

## 5. 应用

### 5.1 最小生成森林

图不连通时，Kruskal 自动生成最小生成森林：

```python
# 不需要 n-1 条边就结束，遍历所有边
def kruskal_forest(n, edges):
    edges.sort(key=lambda e: e[2])
    uf = UnionFind(n)
    mst = []
    for u, v, w in edges:
        if uf.union(u, v):
            mst.append((u, v, w))
    return mst
```

### 5.2 次小生成树

```python
# 在MST基础上，尝试替换每条MST边为非MST边
def second_mst(n, edges):
    mst, _ = kruskal(n, edges)
    mst_set = set((u, v) for u, v, _ in mst)
    second_best = float('inf')
    for u, v, w in mst:
        # 删除边(u,v)，重新运行Kruskal
        remaining = [e for e in edges if (e[0], e[1]) != (u, v)]
        _, total = kruskal(n, remaining)
        if total < second_best:
            second_best = total
    return second_best
```
