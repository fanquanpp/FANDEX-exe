---
order: 52
title: Lambda表达式
module: cpp
category: C++
difficulty: intermediate
description: Lambda捕获、泛型Lambda与C++23改进
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/指针
  - cpp/智能指针详解
  - cpp/模板元编程
  - cpp/C++20范围
prerequisites:
  - cpp/概述与现代标准
---

## 概述

Lambda 表达式是 C++11 引入的匿名函数机制，允许在代码中就地定义函数对象。Lambda 使得算法的回调、容器的遍历和异步操作等场景的代码更加简洁直观。从 C++11 到 C++23，Lambda 的能力持续增强：泛型参数、初始化捕获、模板 Lambda、递归 Lambda 等，使其成为现代 C++ 最重要的特性之一。

Lambda 的本质是编译器自动生成的函数对象类，捕获的变量成为该类的成员，函数体成为 operator() 的实现。理解这一点有助于理解 Lambda 的各种行为和限制。

## 基础概念

### Lambda 的组成部分

```cpp
[捕获列表](参数列表) mutable noexcept -> 返回类型 { 函数体 }
```

- **捕获列表**：指定如何访问外部变量
- **参数列表**：与普通函数相同（C++14 起可使用 auto）
- **mutable**：允许修改值捕获的变量
- **noexcept**：声明不抛出异常
- **返回类型**：通常可自动推导，复杂情况需显式指定
- **函数体**：Lambda 的执行逻辑

### Lambda 的类型

每个 Lambda 表达式都有唯一的匿名类型，只能用 auto 或模板参数接收。如果需要存储 Lambda，可使用 `std::function`（有开销）或模板（零开销）。

## 快速上手

### 基本语法

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    // 最简单的 Lambda
    auto add = [](int a, int b) { return a + b; };
    std::cout << add(1, 2) << std::endl;  // 3

    // 在算法中使用 Lambda
    std::vector<int> nums = {5, 2, 8, 1, 9, 3};
    std::sort(nums.begin(), nums.end(), [](int a, int b) {
        return a > b;  // 降序排序
    });

    for (int n : nums) {
        std::cout << n << " ";  // 9 8 5 3 2 1
    }
    return 0;
}
```

### 捕获外部变量

```cpp
int x = 10, y = 20;

auto f1 = [x, y]() { return x + y; };    // 值捕获
auto f2 = [&x, &y]() { x++; y++; };      // 引用捕获
auto f3 = [=]() { return x + y; };       // 全部值捕获
auto f4 = [&]() { x++; y++; };           // 全部引用捕获
auto f5 = [=, &x]() { x++; return y; };  // 混合捕获
auto f6 = [this]() { return member; };    // 捕获 this 指针
auto f7 = [*this]() { return member; };   // C++17，拷贝当前对象
```

## 详细用法

### 泛型 Lambda（C++14）

```cpp
#include <iostream>
#include <string>

// 使用 auto 参数，Lambda 自动成为模板
auto greater = [](auto a, auto b) { return a > b; };

greater(3, 2);       // true，int 比较
greater(3.0, 2.5);   // true，double 比较
greater("b", "a");   // true，字符串比较

// 泛型 Lambda 与容器配合
auto printContainer = [](const auto& container) {
    for (const auto& item : container) {
        std::cout << item << " ";
    }
    std::cout << std::endl;
};
```

### 模板 Lambda（C++20）

```cpp
#include <concepts>

// C++20: 显式模板参数，可以约束类型
auto process = []<typename T>(T value) {
    return value * 2;
};

// 带概念约束的模板 Lambda
auto processIntegral = []<std::integral T>(T value) {
    return value * 2;  // 仅接受整数类型
};

// 模板 Lambda 可以使用更复杂的类型操作
auto transformPair = []<typename A, typename B>(std::pair<A, B> p) {
    return std::make_pair(p.second, p.first);  // 交换 pair 的两个元素
};
```

### 初始化捕获与移动捕获（C++14）

```cpp
#include <memory>
#include <string>

// 移动捕获：将 unique_ptr 移入 Lambda
auto ptr = std::make_unique<int>(42);
auto f = [p = std::move(ptr)]() { return *p; };

// 计算捕获：在捕获时计算表达式
int threshold = 100;
auto checker = [max = threshold * 2](int value) {
    return value > max;
};

// 捕获字符串副本
std::string name = "张三";
auto greeter = [n = std::move(name)]() {
    return "你好, " + n;
};
```

### C++23 递归 Lambda

```cpp
// C++23: 使用显式对象参数实现递归 Lambda
auto fibonacci = [](this auto self, int n) -> int {
    return n <= 1 ? n : self(n - 1) + self(n - 2);
};

std::cout << fibonacci(10) << std::endl;  // 55

// 也可以实现更复杂的递归逻辑
auto treeTraversal = [](this auto self, const Node* node) -> void {
    if (!node) return;
    self(node->left);   // 递归遍历左子树
    std::cout << node->value << " ";
    self(node->right);  // 递归遍历右子树
};
```

## 常见场景

### 自定义排序

```cpp
#include <vector>
#include <algorithm>
#include <string>

struct Student {
    std::string name;
    int score;
};

int main() {
    std::vector<Student> students = {
        {"张三", 85}, {"李四", 92}, {"王五", 78}
    };

    // 按成绩降序排序
    std::sort(students.begin(), students.end(),
        [](const Student& a, const Student& b) {
            return a.score > b.score;
        });

    // 按姓名排序
    std::sort(students.begin(), students.end(),
        [](const Student& a, const Student& b) {
            return a.name < b.name;
        });
    return 0;
}
```

### 事件回调

```cpp
#include <functional>
#include <vector>
#include <iostream>

class Button {
    std::vector<std::function<void()>> clickHandlers_;
public:
    void onClick(std::function<void()> handler) {
        clickHandlers_.push_back(std::move(handler));
    }

    void click() {
        for (auto& h : clickHandlers_) h();
    }
};

int main() {
    Button btn;
    int clickCount = 0;

    // 使用 Lambda 注册回调
    btn.onClick([&clickCount]() {
        ++clickCount;
        std::cout << "按钮被点击了 " << clickCount << " 次" << std::endl;
    });

    btn.click();  // 按钮被点击了 1 次
    btn.click();  // 按钮被点击了 2 次
    return 0;
}
```

### 延迟计算

```cpp
#include <functional>
#include <iostream>

// 延迟求值：只在需要时计算
template<typename F>
class LazyValue {
    F func_;
    mutable bool computed_ = false;
    mutable decltype(func_()) value_;
public:
    explicit LazyValue(F func) : func_(std::move(func)) {}

    const auto& get() const {
        if (!computed_) {
            value_ = func_();
            computed_ = true;
        }
        return value_;
    }
};

// 使用 Lambda 创建延迟值
auto lazyData = LazyValue([]() {
    std::cout << "计算中..." << std::endl;
    return 42;
});

// 此时不会计算
std::cout << "延迟值已创建" << std::endl;

// 首次访问时才计算
std::cout << lazyData.get() << std::endl;  // 输出: 计算中... 42
```

## 注意事项

- 引用捕获可能导致悬空引用，Lambda 的生命周期超过被引用变量时尤其危险
- 值捕获的是创建 Lambda 时的快照，后续修改原变量不影响 Lambda 内的值
- 避免使用默认捕获 `[=]` 和 `[&]`，显式列出每个捕获变量更安全
- `[=]` 会隐式捕获 this 指针（C++20 已弃用此行为），应显式写 `[=, this]` 或 `[=, *this]`
- Lambda 默认是 const 的，需要 `mutable` 关键字才能修改值捕获的变量
- 无捕获的 Lambda 可以转换为函数指针，有捕获的不能

## 进阶用法

### Lambda 与 STL 算法组合

```cpp
#include <algorithm>
#include <vector>
#include <numeric>

int main() {
    std::vector<int> data = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

    // 使用 Lambda 进行条件计数
    auto evenCount = std::count_if(data.begin(), data.end(),
        [](int n) { return n % 2 == 0; });

    // 使用 Lambda 进行条件移除
    auto newEnd = std::remove_if(data.begin(), data.end(),
        [](int n) { return n < 5; });
    data.erase(newEnd, data.end());

    // 使用 Lambda 进行自定义累加
    auto sumOfSquares = std::accumulate(data.begin(), data.end(), 0,
        [](int sum, int n) { return sum + n * n; });
    return 0;
}
```

### Lambda 与 std::function

```cpp
#include <functional>
#include <map>
#include <string>

// 使用 std::map 存储不同签名的 Lambda
class CommandDispatcher {
    std::map<std::string, std::function<void(const std::string&)>> commands_;
public:
    void registerCommand(const std::string& name,
                         std::function<void(const std::string&)> handler) {
        commands_[name] = std::move(handler);
    }

    void execute(const std::string& name, const std::string& arg) {
        auto it = commands_.find(name);
        if (it != commands_.end()) {
            it->second(arg);
        }
    }
};

// 注册不同行为的命令
dispatcher.registerCommand("greet", [](const std::string& name) {
    std::cout << "你好, " << name << "!" << std::endl;
});
dispatcher.registerCommand("echo", [](const std::string& msg) {
    std::cout << msg << std::endl;
});
```

### C++20 捕获包展开

```cpp
#include <tuple>
#include <iostream>

// 在 Lambda 中展开参数包
template<typename... Args>
void forEach(Args... args) {
    // C++20: 使用初始化捕获展开参数包
    [... captures = std::move(args)]() {
        ((std::cout << captures << " "), ...);
    }();
}

// 使用
forEach(1, "hello", 3.14);  // 输出: 1 hello 3.14
```
