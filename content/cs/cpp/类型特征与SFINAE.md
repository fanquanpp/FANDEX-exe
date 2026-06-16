---
order: 66
title: 类型特征与SFINAE
module: cpp
category: C++
difficulty: advanced
description: 类型特征与编译期类型判断
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/异常安全
  - cpp/多线程与并发
  - cpp/变参模板
  - cpp/constexpr与编译期计算
prerequisites:
  - cpp/概述与现代标准
---

## 概述

类型特征（Type Traits）是 C++ 标准库 `<type_traits>` 中提供的编译期类型查询和变换工具。它们在编译期回答关于类型的问题（如"这个类型是整数吗？"）或产生新的类型（如"去掉这个类型的 const 修饰"）。SFINAE（Substitution Failure Is Not An Error）是与类型特征配合使用的核心机制，允许模板在实例化失败时静默退出重载集而非产生编译错误。

类型特征和 SFINAE 是泛型编程的基石，使得代码能够根据类型信息自动选择不同的实现路径。C++20 的概念（Concepts）提供了更简洁的替代方案，但理解 SFINAE 仍然是阅读和维护现有代码的必要技能。

## 基础概念

### 类型特征分类

| 类别     | 说明             | 示例                                 |
| -------- | ---------------- | ------------------------------------ |
| 类型查询 | 判断类型的属性   | `is_integral`、`is_pointer`          |
| 类型比较 | 比较两个类型     | `is_same`、`is_base_of`              |
| 类型变换 | 修改类型的修饰   | `remove_const`、`add_pointer`        |
| 类型关系 | 判断类型间的关系 | `is_convertible`、`is_constructible` |

### SFINAE 的含义

SFINAE 规则：当模板参数替换导致无效类型或表达式时，编译器不会报错，而是将该模板从重载候选集中移除。这使得可以根据类型特征有条件地启用或禁用特定的模板重载。

## 快速上手

### 常用类型特征

```cpp
#include <type_traits>

// 类型查询
static_assert(std::is_integral_v<int>);           // true
static_assert(std::is_pointer_v<int*>);           // true
static_assert(std::is_reference_v<int&>);         // true
static_assert(std::is_const_v<const int>);        // true
static_assert(std::is_class_v<std::string>);      // true
static_assert(std::is_enum_v<Color>);             // true（假设 Color 是枚举）

// 类型比较
static_assert(std::is_same_v<int, int32_t>);      // true
static_assert(std::is_base_of_v<Base, Derived>);  // true
static_assert(std::is_convertible_v<int, double>); // true

// 类型构造性
static_assert(std::is_constructible_v<std::string, const char*>);  // true
static_assert(std::is_default_constructible_v<int>);               // true
static_assert(std::is_copy_constructible_v<std::unique_ptr<int>>); // false

// 条件类型选择
using PtrType = std::conditional_t<true, int*, int>;  // int*
```

### enable_if 基本用法

```cpp
#include <type_traits>
#include <iostream>

// 仅当 T 是算术类型时启用此函数
template<typename T>
std::enable_if_t<std::is_arithmetic_v<T>, T>
abs_value(T value) {
    return value < 0 ? -value : value;
}

// 使用
abs_value(-42);    // 正确：int 是算术类型
abs_value(3.14);   // 正确：double 是算术类型
// abs_value("hello");  // 编译错误：const char* 不是算术类型
```

## 详细用法

### enable_if 的三种写法

```cpp
#include <type_traits>

// 方式一：作为默认模板参数（最常用）
template<typename T, typename = std::enable_if_t<std::is_integral_v<T>>>
void process(T value) { /* 整数版本 */ }

// 方式二：作为返回类型
template<typename T>
std::enable_if_t<std::is_floating_point_v<T>, T>
compute(T value) { /* 浮点版本 */ }

// 方式三：作为额外的模板参数（避免歧义）
template<typename T, std::enable_if_t<std::is_pointer_v<T>, int> = 0>
void inspect(T ptr) { /* 指针版本 */ }
```

### 类型变换

```cpp
#include <type_traits>

// 移除修饰
using T1 = std::remove_const_t<const int>;        // int
using T2 = std::remove_reference_t<int&>;         // int
using T3 = std::remove_pointer_t<int*>;           // int
using T4 = std::remove_cv_t<const volatile int>;  // int

// 添加修饰
using T5 = std::add_const_t<int>;                 // const int
using T6 = std::add_pointer_t<int>;               // int*
using T7 = std::add_lvalue_reference_t<int>;      // int&

// 衰变（decay）：模拟按值传递的类型变换
using T8 = std::decay_t<const int&>;              // int
using T9 = std::decay_t<int[10]>;                 // int*
using T10 = std::decay_t<void(int)>;              // void(*)(int)

// 条件类型
using Type = std::conditional_t<sizeof(void*) == 8, int64_t, int32_t>;
```

### void_t 检测成员（C++17）

```cpp
#include <type_traits>

// 检测类型 T 是否有 size() 成员函数
template<typename T, typename = void>
struct has_size : std::false_type {};

template<typename T>
struct has_size<T, std::void_t<decltype(std::declval<T>().size())>>
    : std::true_type {};

template<typename T>
constexpr bool has_size_v = has_size<T>::value;

// 检测类型 T 是否有 iterator 类型别名
template<typename T, typename = void>
struct has_iterator : std::false_type {};

template<typename T>
struct has_iterator<T, std::void_t<typename T::iterator>>
    : std::true_type {};

// 使用
static_assert(has_size_v<std::vector<int>>);   // true
static_assert(has_size_v<int>);                // false
static_assert(has_iterator_v<std::vector<int>>); // true
```

### SFINAE 与重载决议

```cpp
#include <type_traits>
#include <iostream>
#include <string>

// 根据类型选择不同的序列化方式
template<typename T>
std::enable_if_t<std::is_arithmetic_v<T>, std::string>
serialize(const T& value) {
    return std::to_string(value);
}

template<typename T>
std::enable_if_t<std::is_same_v<T, std::string>, std::string>
serialize(const T& value) {
    return "\"" + value + "\"";
}

template<typename T>
std::enable_if_t<std::is_enum_v<T>, std::string>
serialize(const T& value) {
    return std::to_string(static_cast<int>(value));
}

// 使用
serialize(42);          // "42"
serialize(std::string("hello"));  // "\"hello\""
serialize(Color::Red);  // "0"（假设 enum Color { Red, Green, Blue }）
```

## 常见场景

### 通用容器打印

```cpp
#include <type_traits>
#include <iostream>
#include <vector>

// 仅当容器元素可打印时启用
template<typename Container>
std::enable_if_t<std::is_same_v<
    decltype(std::cout << std::declval<typename Container::value_type>()),
    std::ostream&>>
printContainer(const Container& c) {
    for (const auto& item : c) {
        std::cout << item << " ";
    }
    std::cout << std::endl;
}
```

### 编译期类型分发

```cpp
#include <type_traits>
#include <cstring>

// 根据类型是否可平凡拷贝选择不同的复制策略
template<typename T>
std::enable_if_t<std::is_trivially_copyable_v<T>>
fastCopy(T* dst, const T* src, size_t count) {
    std::memcpy(dst, src, count * sizeof(T));  // 高速内存拷贝
}

template<typename T>
std::enable_if_t<!std::is_trivially_copyable_v<T>>
fastCopy(T* dst, const T* src, size_t count) {
    for (size_t i = 0; i < count; ++i) {
        dst[i] = src[i];  // 调用拷贝赋值运算符
    }
}
```

## 注意事项

- `enable_if` 的条件必须依赖于模板参数，不能依赖于非模板参数
- 两个 `enable_if` 重载的条件不能重叠，否则会导致歧义
- `void_t` 只在 C++17 及以上可用，C++14 中需要手动定义
- 类型特征的 `_v` 后缀变量模板是 C++17 引入的，C++14 需要使用 `::value`
- C++20 的概念（Concepts）是 SFINAE 的更优替代，错误信息更友好
- SFINAE 只在模板参数替换的即时上下文中生效，函数体内的错误不是 SFINAE

## 进阶用法

### C++20 概念替代 SFINAE

```cpp
#include <concepts>

// 使用概念替代 enable_if，语法更简洁
template<std::integral T>
T process(T value) { return value * 2; }

// requires 子句
template<typename T>
    requires std::is_arithmetic_v<T>
T compute(T value) { return value + 1; }

// 简写形式
auto add(std::integral auto a, std::integral auto b) {
    return a + b;
}
```

### 自定义类型特征

```cpp
#include <type_traits>

// 检测类型是否可迭代
template<typename T, typename = void>
struct is_iterable : std::false_type {};

template<typename T>
struct is_iterable<T, std::void_t<
    decltype(std::begin(std::declval<T&>())),
    decltype(std::end(std::declval<T&>()))
>> : std::true_type {};

template<typename T>
constexpr bool is_iterable_v = is_iterable<T>::value;

// 检测类型是否有特定方法
template<typename T, typename = void>
struct has_serialize : std::false_type {};

template<typename T>
struct has_serialize<T, std::void_t<
    decltype(std::declval<const T&>().serialize(std::declval<std::ostream&>()))
>> : std::true_type {};

// 使用
static_assert(is_iterable_v<std::vector<int>>);  // true
static_assert(!is_iterable_v<int>);              // false
```
