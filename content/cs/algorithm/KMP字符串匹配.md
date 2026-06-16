---
order: 105
title: KMP字符串匹配
module: algorithm
category: 'comp-sci'
difficulty: advanced
description: 'KMP 字符串匹配算法：部分匹配表（PMT/next数组）构建、匹配过程、时间复杂度证明与优化。'
author: fanquanpp
updated: '2026-06-14'
related:
  - algorithm/跳跃表
  - algorithm/布隆过滤器
  - algorithm/动态规划状态压缩
  - 'algorithm/Floyd-Warshall算法'
prerequisites:
  - algorithm/算法分析基础与学习路线
---

## 1. KMP 算法原理

### 1.1 暴力匹配的问题

```
文本:    a b a b c a b c a b
模式:    a b c

暴力匹配失配时，模式回退到开头，文本前进1位
最坏时间: O(nm)
```

### 1.2 KMP 的核心思想

失配时利用已匹配信息，**模式串不回退，文本串不回退**：

```
文本:    a b a b a b c
模式:    a b a b c
              ↑ 失配

已匹配 "abab" 的最长公共前后缀为 "ab"
模式跳过已匹配的前缀，从 "ab" 之后继续匹配

文本:    a b a b a b c
模式:        a b a b c
              ↑ 从这里继续
```

## 2. 部分匹配表（PMT）

### 2.1 PMT 定义

PMT[i] = 模式串 P[0..i] 的**最长公共前后缀长度**（不含自身）：

```
模式: a b a b c
索引: 0 1 2 3 4

P[0..0] = "a"     → 前后缀: 无      → PMT[0] = 0
P[0..1] = "ab"    → 前后缀: 无      → PMT[1] = 0
P[0..2] = "aba"   → 前缀{a,ab} 后缀{a,ba} → 公共"a" → PMT[2] = 1
P[0..3] = "abab"  → 前缀{a,ab,aba} 后缀{b,ab,bab} → 公共"ab" → PMT[3] = 2
P[0..4] = "ababc" → 无公共前后缀 → PMT[4] = 0

PMT = [0, 0, 1, 2, 0]
```

### 2.2 next 数组

next 数组是 PMT 整体右移一位，next[0] = -1：

```
PMT:   [0, 0, 1, 2, 0]
next:  [-1, 0, 0, 1, 2]

失配时 j 跳转到 next[j]
```

### 2.3 next 数组构建

```python
def build_next(pattern):
    n = len(pattern)
    next_arr = [-1] * n
    j = -1
    for i in range(1, n):
        while j >= 0 and pattern[i] != pattern[j + 1]:
            j = next_arr[j]
        if pattern[i] == pattern[j + 1]:
            j += 1
        next_arr[i] = j
    return next_arr
```

**构建过程示意**：

```
模式: a b a b c

i=1, j=-1: 'b' ≠ 'a' → next[1] = -1 → j=-1
i=2, j=-1: 'a' == 'a' → j=0 → next[2] = 0
i=3, j=0:  'b' == 'b' → j=1 → next[3] = 1
i=4, j=1:  'c' ≠ 'a' → j=next[1]=-1 → 'c' ≠ 'a' → next[4] = -1

next = [-1, -1, 0, 1, -1]
```

## 3. KMP 匹配

### 3.1 匹配算法

```python
def kmp_search(text, pattern):
    if not pattern:
        return 0
    next_arr = build_next(pattern)
    j = -1
    for i in range(len(text)):
        while j >= 0 and text[i] != pattern[j + 1]:
            j = next_arr[j]
        if text[i] == pattern[j + 1]:
            j += 1
        if j == len(pattern) - 1:
            return i - j  # 匹配成功
    return -1
```

### 3.2 匹配过程

```
文本:    a b a b a b c
模式:    a b a b c

i=0,j=-1: 'a'=='a' → j=0
i=1,j=0:  'b'=='b' → j=1
i=2,j=1:  'a'=='a' → j=2
i=3,j=2:  'b'=='b' → j=3
i=4,j=3:  'a'≠'c' → j=next[3]=1 → 'a'=='a' → j=2
i=5,j=2:  'b'=='b' → j=3
i=6,j=3:  'c'=='c' → j=4 → 匹配成功! 返回 6-4=2
```

## 4. 复杂度分析

### 4.1 时间复杂度

```
构建 next: O(m)
匹配过程: O(n)

关键证明: i 只增不减，j 每次回退至少减1
总比较次数 ≤ 2n
总时间: O(n + m)
```

### 4.2 空间复杂度

```
next 数组: O(m)
```

## 5. 变体与应用

### 5.1 查找所有匹配

```python
def kmp_search_all(text, pattern):
    next_arr = build_next(pattern)
    j = -1
    results = []
    for i in range(len(text)):
        while j >= 0 and text[i] != pattern[j + 1]:
            j = next_arr[j]
        if text[i] == pattern[j + 1]:
            j += 1
        if j == len(pattern) - 1:
            results.append(i - j)
            j = next_arr[j]  # 继续搜索
    return results
```

### 5.2 字符串匹配算法对比

| 算法        | 预处理        | 匹配          | 特点     |
| ----------- | ------------- | ------------- | -------- |
| 暴力        | $O(0)$        | $O(nm)$       | 简单     |
| KMP         | $O(m)$        | $O(n)$        | 最坏线性 |
| Rabin-Karp  | $O(m)$        | $O(n)$ 均摊   | 哈希滚动 |
| Boyer-Moore | $O(m+\sigma)$ | $O(n/m)$ 最好 | 实际最快 |
| Sunday      | $O(m+\sigma)$ | $O(n/m)$ 最好 | 简单高效 |
