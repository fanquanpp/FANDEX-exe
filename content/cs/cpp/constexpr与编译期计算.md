---
order: 68
title: constexpr与编译期计算
module: cpp
category: C++
difficulty: advanced
description: 编译期常量与计算
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/类型特征与SFINAE
  - cpp/变参模板
  - cpp/命名空间与链接
  - cpp/设计模式与C++
prerequisites:
  - cpp/概述与现代标准
---

## 概述

constexpr 是 C++11 引入的关键字，用于声明可以在编译期求值的常量表达式。从 C++11 到 C++23，constexpr 的能力持续扩展：C++14 放宽了 constexpr 函数的限制，C++20 引入了 consteval（强制编译期计算）和 constinit（编译期初始化），C++23 进一步扩展了 constexpr 的适用范围。编译期计算将运行时开销转移到编译期，是零开销抽象的重要实现手段。

编译期计算的核心价值在于：将原本在运行时才能发现的错误提前到编译期，同时消除运行时计算开销。合理使用 constexpr 可以让代码既安全又高效。

## 基础概念

### constexpr 的演进

| 标准  | 能力                                       |
| ----- | ------------------------------------------ |
| C++11 | constexpr 函数只能包含一条 return 语句     |
| C++14 | 允许局部变量、if/for、多语句               |
| C++17 | constexpr if、constexpr lambda             |
| C++20 | consteval、constinit、虚函数可为 constexpr |
| C++23 | 更多标准库函数标记为 constexpr             |

### 三个关键字的区别

| 关键字      | 计算时机       | 说明                            |
| ----------- | -------------- | ------------------------------- |
| `constexpr` | 编译期或运行期 | 声明可以在编译期求值，但不强制  |
| `consteval` | 必须编译期     | C++20，强制在编译期计算         |
| `constinit` | 编译期初始化   | C++20，编译期初始化但运行时可变 |

## 快速上手

### constexpr 变量与函数

```cpp
// 编译期常量
constexpr int MAX_SIZE = 1024;
constexpr double PI = 3.14159265358979;

// constexpr 函数：可在编译期或运行期调用
constexpr int factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

// 编译期调用
constexpr int val = factorial(5);   // 120，编译期计算
static_assert(val == 120);          // 编译期断言

// 运行期调用
int n;
std::cin >> n;
int result = factorial(n);  // 运行期计算，n 是运行时值
```

### consteval 强制编译期计算

```cpp
// consteval 函数必须在编译期执行
consteval int square(int n) { return n * n; }

int arr[square(5)];  // 正确：square(5) 在编译期计算，结果为 25

// int x = square(n);  // 错误：n 是运行时值，consteval 不允许运行期调用

// 使用场景：编译期字符串哈希
consteval uint32_t hash(const char* str) {
    uint32_t h = 0;
    while (*str) {
        h = h * 31 + static_cast<uint32_t>(*str++);
    }
    return h;
}

switch (hash(cmd)) {
    case hash("start"): start(); break;
    case hash("stop"):  stop();  break;
}
```

### constinit 编译期初始化

```cpp
// 全局变量在编译期初始化，避免静态初始化顺序问题
constinit int global_counter = factorial(5);  // 编译期初始化为 120

// constinit 变量在运行时仍可修改
global_counter++;  // 正确：运行时可以修改

// 对比：constexpr 全局变量不可修改
constexpr int MAX = 100;
// MAX++;  // 错误：constexpr 变量是 const 的
```

## 详细用法

### C++14 放宽的 constexpr 函数

```cpp
// C++14：constexpr 函数可以包含局部变量、循环和条件语句
constexpr int fibonacci(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; ++i) {
        int temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}

static_assert(fibonacci(10) == 55);

// C++14：constexpr 函数可以调用其他 constexpr 函数
constexpr bool isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i * i <= n; ++i) {
        if (n % i == 0) return false;
    }
    return true;
}

static_assert(isPrime(17));
static_assert(!isPrime(15));
```

### constexpr if（C++17）

```cpp
// constexpr if：编译期条件分支，未选中的分支不会被实例化
template<typename T>
auto process(T value) {
    if constexpr (std::is_integral_v<T>) {
        return value * 2;  // 仅当 T 是整数类型时实例化
    } else if constexpr (std::is_floating_point_v<T>) {
        return value + 0.5;  // 仅当 T 是浮点类型时实例化
    } else {
        return value;  // 其他类型
    }
}

// 消除 SFINAE 的复杂写法
template<typename T>
std::string toString(const T& value) {
    if constexpr (std::is_same_v<T, std::string>) {
        return value;
    } else if constexpr (std::is_arithmetic_v<T>) {
        return std::to_string(value);
    } else {
        return static_cast<std::string>(value);
    }
}
```

### constexpr 类

```cpp
// constexpr 类：所有成员函数都可以在编译期调用
class Point {
    double x_, y_;
public:
    constexpr Point(double x, double y) : x_(x), y_(y) {}
    constexpr double x() const { return x_; }
    constexpr double y() const { return y_; }
    constexpr double distanceFromOrigin() const {
        return x_ * x_ + y_ * y_;  // 简化，不开方
    }
};

// 编译期创建和操作对象
constexpr Point p(3.0, 4.0);
static_assert(p.distanceFromOrigin() == 25.0);

// constexpr 容器（C++20 支持 constexpr std::vector）
constexpr auto createPoints() {
    std::array<Point, 3> points = {
        Point(0, 0), Point(1, 0), Point(0, 1)
    };
    return points;
}
```

### constexpr Lambda（C++17）

```cpp
// constexpr Lambda 可以在编译期调用
auto square = [](int n) constexpr { return n * n; };

static_assert(square(5) == 25);

// 在编译期算法中使用 constexpr Lambda
constexpr auto compute() {
    int sum = 0;
    for (int i = 1; i <= 10; ++i) {
        sum += i * i;
    }
    return sum;
}

static_assert(compute() == 385);
```

## 常见场景

### 编译期查找表

```cpp
#include <array>

// 编译期生成正弦查找表
constexpr std::array<double, 360> generateSinTable() {
    std::array<double, 360> table{};
    for (int i = 0; i < 360; ++i) {
        table[i] = __builtin_sin(i * 3.14159265 / 180.0);
    }
    return table;
}

// 编译期生成，运行时直接查表
constexpr auto SIN_TABLE = generateSinTable();

double fastSin(int degrees) {
    return SIN_TABLE[degrees % 360];
}
```

### 编译期字符串解析

```cpp
// 编译期解析版本号字符串
struct Version {
    int major, minor, patch;
};

constexpr Version parseVersion(const char* str) {
    Version v{0, 0, 0};
    int* current = &v.major;
    while (*str) {
        if (*str == '.') {
            current = (current == &v.major) ? &v.minor : &v.patch;
        } else if (*str >= '0' && *str <= '9') {
            *current = *current * 10 + (*str - '0');
        }
        ++str;
    }
    return v;
}

constexpr auto ver = parseVersion("2.4.1");
static_assert(ver.major == 2);
static_assert(ver.minor == 4);
static_assert(ver.patch == 1);
```

### 编译期类型注册

```cpp
// 使用编译期哈希实现类型 ID
template<typename T>
consteval uint32_t typeId() {
    return hash(__FUNCSIG__);  // MSVC，其他编译器用 __PRETTY_FUNCTION__
}

// 编译期确定类型 ID，运行时零开销
static_assert(typeId<int>() != typeId<double>());
```

## 注意事项

- constexpr 函数不保证一定在编译期执行，只有在编译期上下文中调用时才会编译期求值
- consteval 函数不能在运行期调用，参数必须是编译期常量
- constinit 只能用于具有静态存储期的变量（全局变量、静态变量）
- constexpr 函数中不能使用 goto、asm、try/catch 等语句
- C++20 之前 constexpr 函数不能调用虚函数，C++20 放宽了此限制
- 过度使用编译期计算会显著增加编译时间，应权衡编译期和运行时的开销

## 进阶用法

### 编译期正则表达式匹配

```cpp
// 简化的编译期字符串匹配
template<size_t N>
struct FixedString {
    char data[N]{};
    constexpr FixedString(const char (&str)[N]) {
        for (size_t i = 0; i < N; ++i) data[i] = str[i];
    }
    constexpr bool startsWith(const char* prefix) const {
        size_t i = 0;
        while (prefix[i]) {
            if (i >= N || data[i] != prefix[i]) return false;
            ++i;
        }
        return true;
    }
};

// 编译期字符串操作
constexpr FixedString path = "/api/users";
static_assert(path.startsWith("/api"));
```

### C++23 constexpr 扩展

```cpp
// C++23: 更多标准库函数标记为 constexpr
#include <cmath>

constexpr double computeAngle(double x, double y) {
    // C++23: atan2 等数学函数可在编译期调用
    return std::atan2(y, x);
}

// C++23: constexpr 的 dynamic_cast 和 typeid
// 允许在编译期使用多态
```
