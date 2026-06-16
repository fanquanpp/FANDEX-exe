---
order: 84
title: C++反射与元编程
module: cpp
category: C++
difficulty: advanced
description: 编译期反射与代码生成
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/C++代码规范
  - cpp/C++与WebAssembly
  - cpp/C++数学库
  - cpp/智能指针
prerequisites:
  - cpp/概述与现代标准
---

## 概述

反射（Reflection）是指在运行时或编译期获取类型的结构信息（如成员变量、成员函数、基类等）的能力。C++ 长期以来缺乏语言级别的反射支持，开发者需要依赖宏、模板元编程等技巧实现有限的反射功能。C++26 有望引入静态反射提案（P2996），届时将提供标准化的编译期反射机制。

元编程（Metaprogramming）是通过程序来生成或变换程序的编程范式。C++ 的模板系统是一种图灵完备的元编程语言，可以在编译期执行计算、生成代码和进行类型操作。模板元编程与反射密切相关：反射获取类型信息，元编程基于这些信息生成代码。

## 基础概念

### 静态反射与动态反射

- **静态反射**：在编译期获取类型信息，零运行时开销，C++26 反射提案属于此类
- **动态反射**：在运行时获取类型信息，需要类型注册和运行时数据结构，Java/C# 风格

C++ 选择了静态反射路线，与零开销原则一致。编译期反射的结果可以在编译期使用，驱动代码生成。

### 元编程的主要手段

| 手段             | 说明                           |
| ---------------- | ------------------------------ |
| 模板特化         | 根据类型选择不同实现           |
| SFINAE           | 替换失败不是错误，用于条件编译 |
| constexpr if     | 编译期条件分支（C++17）        |
| 概念（Concepts） | 约束模板参数（C++20）          |
| 编译期反射       | 获取类型结构信息（C++26 提案） |

## 快速上手

### 编译期类型信息

```cpp
#include <typeinfo>
#include <iostream>

// 使用 typeid 获取类型名称（运行时，依赖编译器实现）
std::cout << typeid(int).name() << std::endl;
std::cout << typeid(double).name() << std::endl;

// 使用 type_traits 获取编译期类型信息
#include <type_traits>

static_assert(std::is_integral_v<int>);          // true
static_assert(std::is_pointer_v<int*>);           // true
static_assert(std::is_base_of_v<Base, Derived>);  // 继承关系
```

### 编译期计算

```cpp
#include <type_traits>

// 编译期计算斐波那契数列
template<int N>
struct Fibonacci {
    static constexpr int value = Fibonacci<N - 1>::value + Fibonacci<N - 2>::value;
};

template<>
struct Fibonacci<0> {
    static constexpr int value = 0;
};

template<>
struct Fibonacci<1> {
    static constexpr int value = 1;
};

// 使用 constexpr 函数更简洁
constexpr int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}

static_assert(fib(10) == 55);
```

## 详细用法

### 结构化字段遍历（聚合类型反射）

```cpp
#include <tuple>
#include <string>

// 通过结构化绑定遍历聚合类型的字段
struct Person {
    std::string name;
    int age;
    double height;
};

// 将聚合类型转为 tuple 引用
template<typename T>
auto toTupleRef(T& obj) {
    // 针对具体类型手动映射
    if constexpr (std::is_same_v<T, Person>) {
        return std::tie(obj.name, obj.age, obj.height);
    }
}

// 通用的字段遍历
template<typename T, typename Func>
void forEachField(T& obj, Func&& func) {
    auto t = toTupleRef(obj);
    std::apply([&func](auto&... fields) {
        (func(fields), ...);  // 折叠表达式遍历每个字段
    }, t);
}

// 使用
Person p{"张三", 25, 175.5};
forEachField(p, [](auto& field) {
    std::cout << field << " ";
});
// 输出: 张三 25 175.5
```

### 编译期字符串处理

```cpp
#include <array>

// 编译期字符串（C++20 方式）
template<size_t N>
struct ConstexprString {
    std::array<char, N> data{};

    constexpr ConstexprString(const char (&str)[N]) {
        for (size_t i = 0; i < N; ++i) {
            data[i] = str[i];
        }
    }

    constexpr size_t size() const { return N - 1; }

    constexpr bool operator==(const ConstexprString& other) const {
        return data == other.data;
    }
};

// 编译期字符串比较
constexpr ConstexprString hello{"hello"};
constexpr ConstexprString world{"world"};
static_assert(hello.size() == 5);
static_assert(!(hello == world));
```

### 类型注册表

```cpp
#include <unordered_map>
#include <functional>
#include <string>
#include <any>

// 简易类型注册系统
class TypeRegistry {
    std::unordered_map<std::string, std::function<std::any()>> creators_;

public:
    template<typename T>
    void registerType(const std::string& name) {
        creators_[name] = []() -> std::any {
            return T{};
        };
    }

    std::any create(const std::string& name) const {
        auto it = creators_.find(name);
        if (it != creators_.end()) {
            return it->second();
        }
        return {};
    }

    bool hasType(const std::string& name) const {
        return creators_.count(name) > 0;
    }
};

// 使用
TypeRegistry registry;
registry.registerType<int>("int");
registry.registerType<std::string>("string");

auto val = registry.create("int");
if (val.has_value()) {
    std::cout << std::any_cast<int>(val) << std::endl;  // 0
}
```

## 常见场景

### 序列化框架

```cpp
#include <vector>
#include <string>
#include <sstream>

// 字段描述器
struct FieldInfo {
    std::string name;
    std::function<std::string(const void*)> getter;
    std::function<void(void*, const std::string&)> setter;
};

// 类描述器
class ClassDescriptor {
    std::vector<FieldInfo> fields_;
public:
    void addField(FieldInfo info) { fields_.push_back(std::move(info)); }
    const auto& fields() const { return fields_; }
};

// 为 Person 注册字段
ClassDescriptor describePerson() {
    ClassDescriptor desc;
    desc.addField({"name",
        [](const void* obj) { return static_cast<const Person*>(obj)->name; },
        [](void* obj, const std::string& v) { static_cast<Person*>(obj)->name = v; }
    });
    desc.addField({"age",
        [](const void* obj) { return std::to_string(static_cast<const Person*>(obj)->age); },
        [](void* obj, const std::string& v) { static_cast<Person*>(obj)->age = std::stoi(v); }
    });
    return desc;
}
```

### 依赖注入容器

```cpp
#include <memory>
#include <unordered_map>
#include <typeindex>
#include <functional>

class ServiceContainer {
    std::unordered_map<std::type_index, std::function<std::shared_ptr<void>()>> factories_;

public:
    template<typename Interface, typename Implementation>
    void registerService() {
        factories_[std::type_index(typeid(Interface))] = []() {
            return std::make_shared<Implementation>();
        };
    }

    template<typename Interface>
    std::shared_ptr<Interface> resolve() {
        auto it = factories_.find(std::type_index(typeid(Interface)));
        if (it != factories_.end()) {
            return std::static_pointer_cast<Interface>(it->second());
        }
        return nullptr;
    }
};
```

## 注意事项

- C++26 反射提案仍在标准化过程中，不同编译器的实验性支持可能不同，生产代码暂不建议依赖
- 当前的反射技巧（如宏注册、聚合绑定）都有局限性，无法自动发现类型的所有成员
- 模板元编程的编译错误信息通常很长且难以理解，建议使用 static_assert 和概念提供清晰的错误提示
- 过度使用元编程会显著增加编译时间，应权衡编译期计算与运行时计算的取舍
- 编译期反射的代码调试困难，建议在运行时测试逻辑正确性后再转为编译期实现

## 进阶用法

### C++26 反射提案预览

```cpp
// P2996 提案语法（尚未正式标准化）
// 获取类型的所有成员
// consteval auto members = std::meta::members_of(^MyStruct);

// 遍历成员并生成代码
// template<typename T>
// consteval auto generateSerializer() {
//     std::string code;
//     for (auto member : std::meta::members_of(^T)) {
//         code += "serialize(obj." + std::meta::name_of(member) + ");\n";
//     }
//     return code;
// }

// 使用 meta::info 进行编译期类型操作
// static_assert(std::meta::is_class(^MyStruct));
// static_assert(std::meta::is_public(^MyStruct::x));
```

### 基于宏的简易反射

```cpp
#include <vector>
#include <string>
#include <tuple>

// 反射宏：注册字段名和偏移量
#define REFLECT_FIELDS(...) \
    static auto fields() { \
        return std::make_tuple(__VA_ARGS__); \
    } \
    static auto fieldNames() { \
        return std::vector<std::string>{MACRO_TO_STRING(__VA_ARGS__)}; \
    }

#define MACRO_TO_STRING(...) #__VA_ARGS__

// 使用宏的类定义
struct Student {
    std::string name;
    int age;
    double score;

    REFLECT_FIELDS(name, age, score)
};

// 基于反射的通用打印函数
template<typename T>
void printObject(const T& obj) {
    auto names = T::fieldNames();
    auto values = obj.fields();
    size_t i = 0;
    std::apply([&](const auto&... vals) {
        ((std::cout << names[i++] << ": " << vals << "\n"), ...);
    }, values);
}
```

### 编译期代码生成

```cpp
#include <array>

// 编译期生成查找表
template<typename T, T (*Func)(T), size_t N>
struct LookupTable {
    std::array<T, N> table{};

    constexpr LookupTable() {
        for (size_t i = 0; i < N; ++i) {
            table[i] = Func(static_cast<T>(i));
        }
    }

    constexpr T operator[](size_t i) const { return table[i]; }
};

// 编译期计算正弦值
constexpr float sinDeg(int deg) {
    // 简化实现，实际应使用泰勒展开
    return static_cast<float>(deg);  // 占位
}

// 生成 0-359 度的正弦查找表
constexpr auto sinTable = LookupTable<float, sinDeg, 360>{};

// 运行时直接查表，零计算开销
float value = sinTable[90];
```
