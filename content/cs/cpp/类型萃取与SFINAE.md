---
order: 106
title: 类型萃取与SFINAE
module: cpp
category: 'dev-lang'
difficulty: advanced
description: C++类型萃取与SFINAE详解：type_traits与编译期类型判断。
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/智能指针循环引用
  - cpp/Lambda捕获详解
  - cpp/可变参数模板与折叠表达式
  - cpp/C++20协程
prerequisites:
  - cpp/概述与现代标准
---

## 概述

类型萃取（Type Traits）是 C++ 编译期类型 introspection 的标准工具集，定义在 `<type_traits>` 头文件中。它们允许在编译期查询类型的属性（如是否为整数、是否为指针）、比较类型间的关系（如是否相同、是否有继承关系）以及对类型进行变换（如添加或移除 const 修饰）。SFINAE（Substitution Failure Is Not An Error）是与类型萃取配合的核心机制，使得模板可以根据类型信息有条件地参与重载决议。

类型萃取和 SFINAE 是泛型编程的基础设施，标准库中的 `std::enable_if`、`std::void_t` 和 C++20 的概念（Concepts）都建立在这些机制之上。

## 基础概念

### 类型萃取的三种操作

1. **查询**：`std::is_integral_v<T>` -- T 是整数类型吗？
2. **变换**：`std::remove_const_t<T>` -- 去掉 T 的 const 修饰
3. **比较**：`std::is_same_v<T, U>` -- T 和 U 是同一类型吗？

### SFINAE 的核心规则

当模板参数替换产生无效类型时，编译器不会报错，而是将该特化从候选集中移除。这使得我们可以根据类型条件选择不同的实现。

## 快速上手

### 常用类型查询

```cpp
#include <type_traits>

// 基础类型判断
static_assert(std::is_integral_v<int>);           // 整数类型
static_assert(std::is_floating_point_v<double>);  // 浮点类型
static_assert(std::is_pointer_v<int*>);           // 指针类型
static_assert(std::is_reference_v<int&>);         // 引用类型
static_assert(std::is_const_v<const int>);        // const 修饰
static_assert(std::is_array_v<int[10]>);          // 数组类型
static_assert(std::is_enum_v<Color>);             // 枚举类型
static_assert(std::is_class_v<std::string>);      // 类类型

// 类型关系
static_assert(std::is_same_v<int, int32_t>);       // 相同类型
static_assert(std::is_base_of_v<Base, Derived>);   // 继承关系
static_assert(std::is_convertible_v<int, double>);  // 可隐式转换

// 构造性检查
static_assert(std::is_constructible_v<std::string, const char*>);
static_assert(std::is_default_constructible_v<int>);
static_assert(!std::is_copy_constructible_v<std::unique_ptr<int>>);
```

### enable_if 条件启用

```cpp
#include <type_traits>
#include <iostream>

// 仅当 T 是整数类型时启用
template<typename T>
std::enable_if_t<std::is_integral_v<T>, T>
process(T value) {
    std::cout << "整数处理" << std::endl;
    return value * 2;
}

// 仅当 T 是浮点类型时启用
template<typename T>
std::enable_if_t<std::is_floating_point_v<T>, T>
process(T value) {
    std::cout << "浮点处理" << std::endl;
    return value * 2.0;
}

// 使用
process(42);    // 整数处理
process(3.14);  // 浮点处理
```

## 详细用法

### 类型变换

```cpp
#include <type_traits>

// 移除修饰符
using T1 = std::remove_const_t<const int>;         // int
using T2 = std::remove_volatile_t<volatile int>;   // int
using T3 = std::remove_cv_t<const volatile int>;   // int
using T4 = std::remove_reference_t<int&>;          // int
using T5 = std::remove_pointer_t<int*>;            // int
using T6 = std::remove_extent_t<int[10]>;          // int（移除数组维度）

// 添加修饰符
using T7 = std::add_const_t<int>;                  // const int
using T8 = std::add_pointer_t<int>;                // int*
using T9 = std::add_lvalue_reference_t<int>;       // int&
using T10 = std::add_rvalue_reference_t<int>;      // int&&

// decay：模拟按值传递的类型变换
using T11 = std::decay_t<const int&>;              // int
using T12 = std::decay_t<int[10]>;                 // int*
using T13 = std::decay_t<void(int)>;               // void(*)(int)

// 条件类型选择
using PtrType = std::conditional_t<USE_64BIT, int64_t, int32_t>;

// 公共类型
using Common = std::common_type_t<int, double>;    // double
```

### void_t 检测成员（C++17）

```cpp
#include <type_traits>

// 检测 T 是否有 toString() 方法
template<typename T, typename = void>
struct has_toString : std::false_type {};

template<typename T>
struct has_toString<T, std::void_t<decltype(std::declval<T>().toString())>>
    : std::true_type {};

template<typename T>
constexpr bool has_toString_v = has_toString<T>::value;

// 检测 T 是否有 value_type 类型别名
template<typename T, typename = void>
struct has_value_type : std::false_type {};

template<typename T>
struct has_value_type<T, std::void_t<typename T::value_type>>
    : std::true_type {};

// 检测 T 是否支持 operator==
template<typename T, typename = void>
struct is_equality_comparable : std::false_type {};

template<typename T>
struct is_equality_comparable<T, std::void_t<
    decltype(std::declval<T>() == std::declval<T>())
>> : std::true_type {};

// 使用
static_assert(has_toString_v<WithToString>);     // true
static_assert(has_value_type_v<std::vector<int>>); // true
static_assert(is_equality_comparable_v<int>);    // true
```

### SFINAE 与标签分发

```cpp
#include <type_traits>
#include <iterator>

// 使用迭代器标签分发选择最优实现
template<typename Iterator>
void advanceImpl(Iterator& it, int n, std::input_iterator_tag) {
    // 输入迭代器：只能单步前进
    for (int i = 0; i < n; ++i) ++it;
}

template<typename Iterator>
void advanceImpl(Iterator& it, int n, std::random_access_iterator_tag) {
    // 随机访问迭代器：可以直接跳跃
    it += n;
}

// 统一接口
template<typename Iterator>
void advance(Iterator& it, int n) {
    advanceImpl(it, n, typename std::iterator_traits<Iterator>::iterator_category{});
}
```

## 常见场景

### 条件性编译优化

```cpp
#include <type_traits>
#include <cstring>

// 根据类型是否可平凡拷贝选择复制策略
template<typename T>
void copyElements(T* dst, const T* src, size_t count) {
    if constexpr (std::is_trivially_copyable_v<T>) {
        std::memcpy(dst, src, count * sizeof(T));  // 高速内存拷贝
    } else {
        for (size_t i = 0; i < count; ++i) {
            dst[i] = src[i];  // 调用拷贝赋值
        }
    }
}
```

### 编译期接口约束

```cpp
#include <type_traits>

// 约束模板参数必须是可序列化的类型
template<typename T>
std::string serialize(const T& obj) {
    if constexpr (std::is_arithmetic_v<T>) {
        return std::to_string(obj);
    } else if constexpr (has_toString_v<T>) {
        return obj.toString();
    } else {
        static_assert(always_false<T>, "类型不支持序列化");
    }
}

// always_false 辅助模板
template<typename T>
struct always_false : std::false_type {};
```

## 注意事项

- `_v` 变量模板后缀是 C++17 引入的，C++14 需使用 `::value`
- `_t` 类型别名后缀是 C++14 引入的，C++11 需使用 `::type`
- SFINAE 只在模板参数替换的即时上下文中生效，函数体中的错误不是 SFINAE
- `enable_if` 的条件不能重叠，否则会导致重载歧义
- `void_t` 在 C++17 中标准化，C++14 中需要手动定义
- C++20 概念是 SFINAE 的更优替代，提供更清晰的错误信息

## 进阶用法

### C++20 概念替代 SFINAE

```cpp
#include <concepts>

// 概念比 enable_if 更简洁、更易读
template<std::integral T>
T process(T value) { return value * 2; }

// requires 子句可以组合多个条件
template<typename T>
    requires std::is_arithmetic_v<T> && (!std::is_same_v<T, bool>)
T compute(T value) { return value + 1; }

// 自定义概念
template<typename T>
concept Printable = requires(std::ostream& os, const T& t) {
    { os << t } -> std::same_as<std::ostream&>;
};

template<Printable T>
void log(const T& value) {
    std::cout << value << std::endl;
}
```

### 编译期类型遍历

```cpp
#include <type_traits>
#include <tuple>

// 检查元组中是否包含指定类型
template<typename T, typename Tuple>
struct has_type;

template<typename T>
struct has_type<T, std::tuple<>> : std::false_type {};

template<typename T, typename... Rest>
struct has_type<T, std::tuple<T, Rest...>> : std::true_type {};

template<typename T, typename First, typename... Rest>
struct has_type<T, std::tuple<First, Rest...>> : has_type<T, std::tuple<Rest...>> {};

// 使用
using MyTuple = std::tuple<int, double, std::string>;
static_assert(has_type<int, MyTuple>::value);
static_assert(!has_type<float, MyTuple>::value);
```
