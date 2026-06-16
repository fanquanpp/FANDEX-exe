---
order: 85
title: C++数学库
module: cpp
category: C++
difficulty: intermediate
description: 数值计算与数学库
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/C++与WebAssembly
  - cpp/C++反射与元编程
  - cpp/智能指针
  - cpp/C++正则表达式
prerequisites:
  - cpp/概述与现代标准
---

## 概述

C++ 标准库提供了丰富的数学计算支持，从基础的 `<cmath>` 数学函数到 `<complex>` 复数运算，再到 `<random>` 随机数生成和 `<numeric>` 数值算法。对于更高级的数值计算需求，业界还有 Eigen、BLAS/LAPACK 等成熟的第三方库。理解标准库的数学能力是科学计算、游戏开发和金融建模等领域的基础。

C++ 的数学库设计遵循零开销原则：标准库的数学函数直接映射到硬件指令，不会引入额外的运行时开销。同时，C++ 的模板系统使得数学库可以同时支持多种数值类型。

## 基础概念

### 数值类型

| 类型          | 说明           | 典型范围         |
| ------------- | -------------- | ---------------- |
| `float`       | 单精度浮点数   | 约 7 位有效数字  |
| `double`      | 双精度浮点数   | 约 15 位有效数字 |
| `long double` | 扩展精度浮点数 | 平台相关         |
| `int64_t`     | 64 位整数      | -2^63 到 2^63-1  |

### 数学库分类

| 头文件       | 说明                     |
| ------------ | ------------------------ |
| `<cmath>`    | 基础数学函数             |
| `<complex>`  | 复数运算                 |
| `<numeric>`  | 数值算法（累加、内积等） |
| `<random>`   | 随机数生成               |
| `<valarray>` | 数值数组（较少使用）     |
| `<bit>`      | 位操作（C++20）          |

## 快速上手

### 基础数学函数

```cpp
#include <cmath>
#include <iostream>

int main() {
    // 幂与根
    std::cout << std::sqrt(2.0) << std::endl;    // 平方根: 1.41421
    std::cout << std::pow(2, 10) << std::endl;    // 幂运算: 1024
    std::cout << std::cbrt(27.0) << std::endl;    // 立方根: 3

    // 三角函数（参数为弧度）
    std::cout << std::sin(M_PI / 4) << std::endl; // 正弦: 0.707107
    std::cout << std::cos(M_PI / 3) << std::endl; // 余弦: 0.5
    std::cout << std::tan(M_PI / 4) << std::endl; // 正切: 1

    // 对数与指数
    std::cout << std::log(std::exp(1.0)) << std::endl;  // 自然对数: 1.0
    std::cout << std::log10(1000.0) << std::endl;        // 常用对数: 3
    std::cout << std::log2(1024.0) << std::endl;         // 二进制对数: 10

    // 取整
    std::cout << std::abs(-42) << std::endl;     // 绝对值: 42
    std::cout << std::floor(3.7) << std::endl;   // 向下取整: 3
    std::cout << std::ceil(3.2) << std::endl;    // 向上取整: 4
    std::cout << std::round(3.5) << std::endl;   // 四舍五入: 4
    return 0;
}
```

### 复数运算

```cpp
#include <complex>
#include <iostream>

int main() {
    // 创建复数 (实部, 虚部)
    std::complex<double> z1(1.0, 2.0);  // 1 + 2i
    std::complex<double> z2(3.0, -1.0); // 3 - i

    // 基本运算
    auto sum = z1 + z2;      // (4, 1)
    auto product = z1 * z2;  // (5, 5)

    // 复数属性
    std::cout << std::abs(z1) << std::endl;    // 模: 2.23607
    std::cout << std::arg(z1) << std::endl;    // 辐角: 1.10715
    std::cout << std::norm(z1) << std::endl;   // 模的平方: 5
    std::cout << std::real(z1) << std::endl;   // 实部: 1
    std::cout << std::imag(z1) << std::endl;   // 虚部: 2

    // 共轭复数
    auto conj = std::conj(z1);  // (1, -2)
    return 0;
}
```

## 详细用法

### 数值算法

```cpp
#include <numeric>
#include <vector>
#include <iostream>

int main() {
    std::vector<int> data = {1, 2, 3, 4, 5};

    // 累加
    int sum = std::accumulate(data.begin(), data.end(), 0);
    std::cout << "求和: " << sum << std::endl;  // 15

    // 自定义操作的累加（求乘积）
    int product = std::accumulate(data.begin(), data.end(), 1, std::multiplies<>());
    std::cout << "求积: " << product << std::endl;  // 120

    // 内积（点积）
    std::vector<int> a = {1, 2, 3};
    std::vector<int> b = {4, 5, 6};
    int dot = std::inner_product(a.begin(), a.end(), b.begin(), 0);
    std::cout << "内积: " << dot << std::endl;  // 1*4 + 2*5 + 3*6 = 32

    // 部分和（前缀和）
    std::vector<int> prefix(data.size());
    std::partial_sum(data.begin(), data.end(), prefix.begin());
    // prefix = {1, 3, 6, 10, 15}

    // 相邻差分
    std::vector<int> diff(data.size());
    std::adjacent_difference(data.begin(), data.end(), diff.begin());
    // diff = {1, 1, 1, 1, 1}
    return 0;
}
```

### 随机数生成

```cpp
#include <random>
#include <iostream>

int main() {
    // C++11 随机数引擎 + 分布

    // 均匀分布整数 [1, 100]
    std::mt19937 gen(42);  // 梅森旋转算法，种子为 42
    std::uniform_int_distribution<int> dist_int(1, 100);
    std::cout << "随机整数: " << dist_int(gen) << std::endl;

    // 均匀分布浮点数 [0.0, 1.0)
    std::uniform_real_distribution<double> dist_real(0.0, 1.0);
    std::cout << "随机浮点: " << dist_real(gen) << std::endl;

    // 正态分布（均值 0，标准差 1）
    std::normal_distribution<double> dist_normal(0.0, 1.0);
    std::cout << "正态分布: " << dist_normal(gen) << std::endl;

    // 使用 random_device 获取真随机种子
    std::random_device rd;
    std::mt19937 gen_random(rd());
    std::cout << "真随机: " << dist_int(gen_random) << std::endl;
    return 0;
}
```

### C++20 数学常量

```cpp
#include <numbers>
#include <iostream>

int main() {
    // C++20 标准数学常量
    std::cout << std::numbers::pi << std::endl;           // 3.14159...
    std::cout << std::numbers::e << std::endl;            // 2.71828...
    std::cout << std::numbers::sqrt2 << std::endl;        // 1.41421...
    std::cout << std::numbers::ln2 << std::endl;          // 0.69314...
    std::cout << std::numbers::phi << std::endl;          // 黄金比例: 1.61803...
    std::cout << std::numbers::inv_pi << std::endl;       // 1/pi
    std::cout << std::numbers::inv_sqrt_pi << std::endl;  // 1/sqrt(pi)
    return 0;
}
```

### 位操作（C++20）

```cpp
#include <bit>
#include <iostream>

int main() {
    unsigned int x = 0b11001000;

    // 统计 1 的个数
    std::cout << std::popcount(x) << std::endl;  // 3

    // 前导零数量
    std::cout << std::countl_zero(x) << std::endl;  // 平台相关

    // 判断是否为 2 的幂
    std::cout << std::has_single_bit(8u) << std::endl;   // true
    std::cout << std::has_single_bit(6u) << std::endl;   // false

    // 向上取整到 2 的幂
    std::cout << std::bit_ceil(5u) << std::endl;   // 8
    std::cout << std::bit_floor(5u) << std::endl;  // 4

    // 字节序
    if constexpr (std::endian::native == std::endian::little) {
        std::cout << "小端序" << std::endl;
    }
    return 0;
}
```

## 常见场景

### 矩阵运算（使用 Eigen）

```cpp
#include <Eigen/Dense>
#include <iostream>

int main() {
    // 创建 3x3 矩阵
    Eigen::Matrix3d A;
    A << 1, 2, 3,
         4, 5, 6,
         7, 8, 10;

    // 向量
    Eigen::Vector3d b(1, 2, 3);

    // 求解线性方程组 Ax = b
    Eigen::Vector3d x = A.colPivHouseholderQr().solve(b);
    std::cout << "解: " << x.transpose() << std::endl;

    // 矩阵运算
    Eigen::Matrix3d inv = A.inverse();        // 逆矩阵
    double det = A.determinant();              // 行列式
    Eigen::Vector3cd eigenvalues = A.eigenvalues();  // 特征值
    return 0;
}
```

### 统计计算

```cpp
#include <vector>
#include <numeric>
#include <cmath>
#include <algorithm>

// 计算均值
double mean(const std::vector<double>& data) {
    return std::accumulate(data.begin(), data.end(), 0.0) / data.size();
}

// 计算标准差
double stddev(const std::vector<double>& data) {
    double m = mean(data);
    double sq_sum = std::accumulate(data.begin(), data.end(), 0.0,
        [m](double sum, double val) {
            return sum + (val - m) * (val - m);
        });
    return std::sqrt(sq_sum / data.size());
}

// 计算中位数
double median(std::vector<double> data) {
    std::sort(data.begin(), data.end());
    size_t n = data.size();
    if (n % 2 == 0) {
        return (data[n/2 - 1] + data[n/2]) / 2.0;
    }
    return data[n/2];
}
```

## 注意事项

- 浮点数比较不能使用 `==`，应使用近似比较或 `std::abs(a - b) < epsilon`
- `std::abs` 对整数和浮点数有不同重载，注意包含正确的头文件（整数用 `<cstdlib>`，浮点用 `<cmath>`）
- `M_PI` 不是标准定义，C++20 的 `std::numbers::pi` 是标准替代
- `std::valarray` 虽然设计用于数值计算，但实际使用较少，推荐使用 Eigen 等第三方库
- 随机数引擎的状态较大（`std::mt19937` 约 2.5KB），避免频繁构造，应作为成员变量或传引用
- `std::random_device` 在某些平台上可能返回伪随机数（如 MinGW），生产环境需注意

## 进阶用法

### 高精度计算

```cpp
#include <boost/multiprecision/cpp_dec_float.hpp>

using namespace boost::multiprecision;

// 使用 50 位精度的十进制浮点数
using float50 = cpp_dec_float_50;

float50 pi = "3.14159265358979323846264338327950288419716939937510";
float50 result = sqrt(pi);  // 高精度平方根

std::cout << std::setprecision(50) << result << std::endl;
```

### 数值积分

```cpp
#include <cmath>
#include <functional>
#include <iostream>

// 辛普森法则数值积分
double simpson(std::function<double(double)> f, double a, double b, int n) {
    double h = (b - a) / n;
    double sum = f(a) + f(b);

    for (int i = 1; i < n; i += 2) {
        sum += 4 * f(a + i * h);  // 奇数项系数为 4
    }
    for (int i = 2; i < n; i += 2) {
        sum += 2 * f(a + i * h);  // 偶数项系数为 2
    }
    return sum * h / 3;
}

// 计算 sin(x) 在 [0, pi] 上的积分（理论值为 2）
double result = simpson([](double x) { return std::sin(x); }, 0, M_PI, 1000);
std::cout << "积分结果: " << result << std::endl;  // 约 2.0
```

### constexpr 数学函数（C++26）

```cpp
// C++26 将更多 cmath 函数标记为 constexpr
// 允许在编译期进行数学计算

// C++23 部分支持
constexpr double circle_area(double radius) {
    // C++23: 部分数学函数可在编译期调用
    return 3.14159265358979 * radius * radius;
}

static_assert(circle_area(1.0) > 3.14);
```
