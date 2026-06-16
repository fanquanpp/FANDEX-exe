---
order: 61
title: STL算法详解
module: cpp
category: C++
difficulty: intermediate
description: STL算法库深入
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/运算符重载
  - cpp/面向对象基础
  - cpp/字符串处理
  - cpp/文件IO与文件系统
prerequisites:
  - cpp/概述与现代标准
---

## 概述

STL 算法库是 C++ 标准库中最强大的组件之一，提供了大量通用的算法模板，涵盖排序、搜索、修改、数值计算等领域。STL 算法通过迭代器与容器解耦，同一算法可以作用于任何提供合适迭代器的数据结构。配合 Lambda 表达式，STL 算法能够以声明式的方式表达复杂的数据处理逻辑。

C++20 的 Ranges 库进一步增强了算法的可用性，支持管道式组合和惰性求值。但传统的 STL 算法仍然是基础，理解其分类和使用方式是高效使用 C++ 的关键。

## 基础概念

### 算法分类

| 类别         | 说明             | 典型算法                        |
| ------------ | ---------------- | ------------------------------- |
| 非修改序列   | 不改变元素值     | find、count、search             |
| 修改序列     | 改变元素值或顺序 | transform、replace、remove      |
| 排序         | 重排元素顺序     | sort、stable_sort、partial_sort |
| 搜索         | 查找元素或子序列 | binary_search、lower_bound      |
| 集合         | 集合运算         | set_union、set_intersection     |
| 堆           | 堆操作           | push_heap、pop_heap             |
| 数值         | 数学运算         | accumulate、inner_product       |
| 未初始化内存 | 原始内存操作     | uninitialized_copy              |

### 迭代器要求

不同算法对迭代器有不同要求：

- **输入迭代器**：只读，单遍（如 `std::find`）
- **输出迭代器**：只写，单遍（如 `std::copy`）
- **前向迭代器**：可读写，多遍（如 `std::replace`）
- **双向迭代器**：可反向遍历（如 `std::reverse`）
- **随机访问迭代器**：支持跳转（如 `std::sort`）

## 快速上手

### 排序与搜索

```cpp
#include <algorithm>
#include <vector>
#include <iostream>

int main() {
    std::vector<int> v = {5, 2, 8, 1, 9, 3, 7, 4, 6};

    // 排序
    std::sort(v.begin(), v.end());              // 升序
    std::sort(v.begin(), v.end(), std::greater<>());  // 降序

    // 稳定排序（保持相等元素的相对顺序）
    std::stable_sort(v.begin(), v.end());

    // 部分排序（只保证前5个是最小的且有序）
    std::partial_sort(v.begin(), v.begin() + 5, v.end());

    // 二分搜索（要求已排序）
    bool found = std::binary_search(v.begin(), v.end(), 5);

    // 查找下界和上界
    auto [lower, upper] = std::equal_range(v.begin(), v.end(), 5);
    std::cout << "等于5的元素数量: " << (upper - lower) << std::endl;
    return 0;
}
```

### 修改序列

```cpp
#include <algorithm>
#include <vector>
#include <string>

int main() {
    std::vector<int> v = {1, 2, 3, 4, 5};
    std::vector<int> out(v.size());

    // 变换：对每个元素应用函数
    std::transform(v.begin(), v.end(), out.begin(),
        [](int n) { return n * n; });  // out = {1, 4, 9, 16, 25}

    // 移除（注意：只是移动元素，需要 erase 配合）
    v.erase(std::remove_if(v.begin(), v.end(),
        [](int n) { return n % 2 == 0; }), v.end());  // 移除偶数

    // 去重（要求已排序）
    std::sort(v.begin(), v.end());
    v.erase(std::unique(v.begin(), v.end()), v.end());

    // 反转
    std::reverse(v.begin(), v.end());

    // 旋转：将前3个元素移到末尾
    std::rotate(v.begin(), v.begin() + 3, v.end());
    return 0;
}
```

### 数值算法

```cpp
#include <numeric>
#include <vector>

int main() {
    std::vector<int> v = {1, 2, 3, 4, 5};

    // 累加
    int sum = std::accumulate(v.begin(), v.end(), 0);  // 15

    // 自定义操作：求乘积
    int product = std::accumulate(v.begin(), v.end(), 1, std::multiplies<>());  // 120

    // 内积
    std::vector<int> a = {1, 2, 3};
    std::vector<int> b = {4, 5, 6};
    int dot = std::inner_product(a.begin(), a.end(), b.begin(), 0);  // 32

    // 前缀和
    std::vector<int> prefix(v.size());
    std::partial_sum(v.begin(), v.end(), prefix.begin());  // {1, 3, 6, 10, 15}

    // 填充递增序列
    std::iota(v.begin(), v.end(), 1);  // {1, 2, 3, 4, 5}
    return 0;
}
```

## 详细用法

### 查找算法

```cpp
#include <algorithm>
#include <vector>

std::vector<int> data = {1, 3, 5, 7, 9, 2, 4, 6, 8};

// 线性查找
auto it = std::find(data.begin(), data.end(), 5);
if (it != data.end()) {
    std::cout << "找到: " << *it << std::endl;
}

// 条件查找
auto it2 = std::find_if(data.begin(), data.end(),
    [](int n) { return n > 6; });  // 找到第一个大于6的

// 查找子序列
std::vector<int> pattern = {7, 9};
auto it3 = std::search(data.begin(), data.end(),
    pattern.begin(), pattern.end());

// 计数
int count = std::count_if(data.begin(), data.end(),
    [](int n) { return n % 2 == 0; });  // 偶数的个数

// 判断是否所有/任一/没有元素满足条件
bool allPositive = std::all_of(data.begin(), data.end(),
    [](int n) { return n > 0; });
bool hasNegative = std::any_of(data.begin(), data.end(),
    [](int n) { return n < 0; });
bool noneZero = std::none_of(data.begin(), data.end(),
    [](int n) { return n == 0; });
```

### 排列与划分

```cpp
#include <algorithm>
#include <vector>

std::vector<int> v = {5, 2, 8, 1, 9};

// 划分：将满足条件的元素移到前面
auto partition_point = std::partition(v.begin(), v.end(),
    [](int n) { return n % 2 == 0; });  // 偶数在前

// 稳定划分：保持相对顺序
std::stable_partition(v.begin(), v.end(),
    [](int n) { return n % 2 == 0; });

// 下一个排列
std::sort(v.begin(), v.end());
do {
    // 处理当前排列
} while (std::next_permutation(v.begin(), v.end()));

// 随机打乱
std::random_device rd;
std::mt19937 g(rd());
std::shuffle(v.begin(), v.end(), g);
```

### 集合操作

```cpp
#include <algorithm>
#include <vector>
#include <iterator>

std::vector<int> a = {1, 2, 3, 4, 5};
std::vector<int> b = {3, 4, 5, 6, 7};
std::vector<int> result;

// 并集
std::set_union(a.begin(), a.end(), b.begin(), b.end(),
    std::back_inserter(result));  // {1, 2, 3, 4, 5, 6, 7}

result.clear();
// 交集
std::set_intersection(a.begin(), a.end(), b.begin(), b.end(),
    std::back_inserter(result));  // {3, 4, 5}

result.clear();
// 差集（a 有 b 没有）
std::set_difference(a.begin(), a.end(), b.begin(), b.end(),
    std::back_inserter(result));  // {1, 2}
```

## 常见场景

### 移除-删除惯用法

```cpp
// erase-remove idiom：高效删除容器中满足条件的元素
std::vector<int> data = {1, 2, 3, 4, 5, 6, 7, 8};

// 删除所有偶数
data.erase(
    std::remove_if(data.begin(), data.end(),
        [](int n) { return n % 2 == 0; }),
    data.end()
);
// data = {1, 3, 5, 7}

// C++20: 使用 std::erase_if 更简洁
// std::erase_if(data, [](int n) { return n % 2 == 0; });
```

### Top-K 问题

```cpp
#include <algorithm>
#include <vector>

std::vector<int> data = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5};

// 找前3个最大的元素
std::partial_sort(data.begin(), data.begin() + 3, data.end(),
    std::greater<>());
// data[0..2] = {9, 6, 5}

// 找第K大的元素
std::nth_element(data.begin(), data.begin() + 2, data.end(),
    std::greater<>());
// data[2] 是第3大的元素
```

## 注意事项

- `std::remove` 和 `std::remove_if` 不会真正删除元素，只是将不需要的元素移到末尾，必须配合 `erase` 使用
- `std::sort` 不保证相等元素的相对顺序，需要稳定排序时使用 `std::stable_sort`
- 二分搜索算法要求输入范围已排序，否则结果是未定义的
- 算法的迭代器要求必须满足，传入不满足的迭代器会导致编译错误或运行时错误
- 修改算法不要使迭代器失效，如在 `std::remove_if` 过程中不要修改容器大小

## 进阶用法

### C++20 Ranges 算法

```cpp
#include <ranges>
#include <algorithm>
#include <vector>

namespace rv = std::views;
namespace rg = std::ranges;

std::vector<int> data = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

// Ranges 算法可以直接接受容器，无需 begin/end
rg::sort(data);

// 支持投影参数
struct Student { std::string name; int score; };
std::vector<Student> students = {{"张三", 85}, {"李四", 92}};
rg::sort(students, {}, &Student::score);  // 按成绩排序

// Ranges 算法与视图组合
auto even_squares = data
    | rv::filter([](int n) { return n % 2 == 0; })
    | rv::transform([](int n) { return n * n; });
```

### 并行算法（C++17）

```cpp
#include <algorithm>
#include <execution>
#include <vector>

std::vector<int> data(1000000);

// 并行排序
std::sort(std::execution::par, data.begin(), data.end());

// 并行变换
std::transform(std::execution::par, data.begin(), data.end(),
    data.begin(), [](int n) { return n * 2; });

// 并行计数
auto count = std::count_if(std::execution::par,
    data.begin(), data.end(), [](int n) { return n > 0; });

// 执行策略
// std::execution::seq    - 顺序执行
// std::execution::par    - 并行执行
// std::execution::par_unseq - 并行且可能向量化
```
