---
order: 73
title: C++测试框架
module: cpp
category: C++
difficulty: intermediate
description: 'Google Test与Catch2'
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/C++内存模型
  - cpp/C++工具链
  - cpp/C++与Python交互
  - cpp/C++性能优化
prerequisites:
  - cpp/概述与现代标准
---

## 概述

测试是保证软件质量的基石。C++ 生态中有多个成熟的测试框架，其中 Google Test（gtest）和 Catch2 最为流行。Google Test 是 Google 出品的重量级框架，功能全面、企业级支持；Catch2 则以轻量、易用著称，单头文件即可使用。选择哪个框架取决于项目规模和团队偏好，但掌握测试的基本原则比框架选择更为重要。

良好的测试应该遵循 FIRST 原则：快速（Fast）、独立（Independent）、可重复（Repeatable）、自验证（Self-validating）、及时（Timely）。

## 基础概念

### 测试类型

| 类型       | 说明                               |
| ---------- | ---------------------------------- |
| 单元测试   | 测试单个函数或类的行为             |
| 集成测试   | 测试模块之间的交互                 |
| 参数化测试 | 用不同输入重复运行同一测试         |
| 死亡测试   | 验证程序在特定条件下是否按预期终止 |
| 基准测试   | 测量代码执行性能                   |

### 断言级别

- **EXPECT**：断言失败后继续执行当前测试，收集所有失败信息
- **ASSERT**：断言失败后立即终止当前测试，后续代码不再执行

## 快速上手

### Google Test 基础

```cpp
#include <gtest/gtest.h>

// 被测函数
int add(int a, int b) { return a + b; }
int divide(int a, int b) {
    if (b == 0) throw std::invalid_argument("除数不能为零");
    return a / b;
}

// 基本测试
TEST(MathTest, Add) {
    EXPECT_EQ(add(1, 2), 3);       // 相等
    EXPECT_NE(add(1, 2), 4);       // 不等
    EXPECT_GT(add(5, 3), 0);       // 大于
    EXPECT_LT(add(-1, 0), 1);      // 小于
}

// 测试异常
TEST(MathTest, DivideByZero) {
    EXPECT_THROW(divide(10, 0), std::invalid_argument);
    EXPECT_ANY_THROW(divide(10, 0));
    EXPECT_NO_THROW(divide(10, 2));
}
```

### Catch2 基础

```cpp
#include <catch2/catch_test_macros.hpp>

int add(int a, int b) { return a + b; }

TEST_CASE("Addition works", "[math]") {
    REQUIRE(add(1, 2) == 3);       // REQUIRE 失败后停止
    CHECK(add(-1, 1) == 0);        // CHECK 失败后继续

    // 分区测试
    SECTION("positive numbers") {
        REQUIRE(add(2, 3) == 5);
    }

    SECTION("negative numbers") {
        REQUIRE(add(-2, -3) == -5);
    }
}
```

## 详细用法

### Google Test 参数化测试

```cpp
#include <gtest/gtest.h>

// 参数化测试类
class AddTest : public ::testing::TestWithParam<std::tuple<int, int, int>> {};

// 用不同参数运行同一测试
TEST_P(AddTest, VariousInputs) {
    auto [a, b, expected] = GetParam();
    EXPECT_EQ(add(a, b), expected);
}

// 定义测试数据
INSTANTIATE_TEST_SUITE_P(
    AddTests,
    AddTest,
    ::testing::Values(
        std::make_tuple(1, 2, 3),
        std::make_tuple(-1, 1, 0),
        std::make_tuple(0, 0, 0),
        std::make_tuple(100, 200, 300)
    )
);
```

### Google Test 测试夹具

```cpp
#include <gtest/gtest.h>
#include <vector>

class VectorTest : public ::testing::Test {
protected:
    // 每个测试前执行
    void SetUp() override {
        vec_ = {1, 2, 3, 4, 5};
    }

    // 每个测试后执行
    void TearDown() override {
        vec_.clear();
    }

    std::vector<int> vec_;
};

TEST_F(VectorTest, Size) {
    EXPECT_EQ(vec_.size(), 5u);
}

TEST_F(VectorTest, PushBack) {
    vec_.push_back(6);
    EXPECT_EQ(vec_.size(), 6u);
    EXPECT_EQ(vec_.back(), 6);
}

TEST_F(VectorTest, Clear) {
    vec_.clear();
    EXPECT_TRUE(vec_.empty());
}
```

### Catch2 匹配器

```cpp
#include <catch2/catch_test_macros.hpp>
#include <catch2/matchers/catch_matchers_string.hpp>
#include <catch2/matchers/catch_matchers_vector.hpp>

TEST_CASE("String matchers", "[matchers]") {
    std::string str = "Hello, World!";

    // 字符串匹配器
    REQUIRE_THAT(str, Catch::Matchers::ContainsSubstring("World"));
    REQUIRE_THAT(str, Catch::Matchers::StartsWith("Hello"));
    REQUIRE_THAT(str, Catch::Matchers::EndsWith("!"));
}

TEST_CASE("Vector matchers", "[matchers]") {
    std::vector<int> vec = {1, 2, 3, 4, 5};

    REQUIRE_THAT(vec, Catch::Matchers::Contains(3));
    REQUIRE_THAT(vec, Catch::Matchers::SizeIs(5));
}
```

### 模拟对象（Google Mock）

```cpp
#include <gmock/gmock.h>

// 定义接口
class Database {
public:
    virtual ~Database() = default;
    virtual bool connect(const std::string& host) = 0;
    virtual std::string query(const std::string& sql) = 0;
    virtual void disconnect() = 0;
};

// 创建模拟类
class MockDatabase : public Database {
public:
    MOCK_METHOD(bool, connect, (const std::string& host), (override));
    MOCK_METHOD(std::string, query, (const std::string& sql), (override));
    MOCK_METHOD(void, disconnect, (), (override));
};

// 使用模拟对象测试
TEST(UserServiceTest, GetUser) {
    MockDatabase db;

    // 设置期望：connect 被调用一次，返回 true
    EXPECT_CALL(db, connect("localhost"))
        .Times(1)
        .WillOnce(::testing::Return(true));

    // 设置期望：query 被调用一次，返回指定结果
    EXPECT_CALL(db, query("SELECT * FROM users WHERE id=1"))
        .Times(1)
        .WillOnce(::testing::Return(R"({"name": "张三"})")"));

    // 执行测试
    EXPECT_TRUE(db.connect("localhost"));
    EXPECT_EQ(db.query("SELECT * FROM users WHERE id=1"), R"({"name": "张三"})");
}
```

## 常见场景

### 测试文件 IO

```cpp
#include <gtest/gtest.h>
#include <fstream>
#include <filesystem>

class FileIOTest : public ::testing::Test {
protected:
    std::string test_dir_ = "test_temp";

    void SetUp() override {
        std::filesystem::create_directories(test_dir_);
    }

    void TearDown() override {
        std::filesystem::remove_all(test_dir_);
    }
};

TEST_F(FileIOTest, WriteAndRead) {
    std::string filepath = test_dir_ + "/data.txt";

    // 写入
    {
        std::ofstream out(filepath);
        out << "测试数据" << std::endl;
    }

    // 读取
    {
        std::ifstream in(filepath);
        std::string line;
        std::getline(in, line);
        EXPECT_EQ(line, "测试数据");
    }
}
```

### 测试多线程代码

```cpp
#include <gtest/gtest.h>
#include <thread>
#include <vector>
#include <atomic>

TEST(ConcurrencyTest, AtomicCounter) {
    std::atomic<int> counter{0};
    std::vector<std::thread> threads;

    for (int i = 0; i < 8; ++i) {
        threads.emplace_back([&counter]() {
            for (int j = 0; j < 1000; ++j) {
                counter.fetch_add(1, std::memory_order_relaxed);
            }
        });
    }

    for (auto& t : threads) t.join();
    EXPECT_EQ(counter.load(), 8000);
}
```

## 注意事项

- 测试代码和业务代码同等重要，应保持测试代码的可读性和可维护性
- 每个测试应只验证一个行为，避免一个测试包含过多断言
- 测试命名应清晰表达意图，如 `DivideByZero_ThrowsException` 而非 `Test1`
- 避免测试之间的依赖关系，每个测试应能独立运行
- 不要测试私有方法，应通过公共接口间接验证
- Google Test 的 `ASSERT_*` 系列在失败后会终止当前测试，适合后续代码无意义的场景

## 进阶用法

### Google Test 死亡测试

```cpp
#include <gtest/gtest.h>
#include <cassert>

void validateAge(int age) {
    assert(age >= 0 && age <= 150);
}

TEST(AgeValidationTest, InvalidAgeCausesDeath) {
    // 验证 assert 触发
    EXPECT_DEATH(validateAge(-1), "age >= 0");
    EXPECT_DEATH(validateAge(200), "age <= 150");
}

TEST(AgeValidationTest, ValidAgeDoesNotDie) {
    EXPECT_NO_FATAL_FAILURE(validateAge(25));
}
```

### Catch2 生成器

```cpp
#include <catch2/catch_test_macros.hpp>
#include <catch2/generators/catch_generators.hpp>

TEST_CASE("Fibonacci properties", "[fib]") {
    auto n = GENERATE(0, 1, 2, 5, 10, 20);

    SECTION("fib(n) >= 0") {
        REQUIRE(fibonacci(n) >= 0);
    }

    SECTION("fib(n+1) >= fib(n) for n >= 1") {
        if (n >= 1) {
            REQUIRE(fibonacci(n + 1) >= fibonacci(n));
        }
    }
}
```

### CMake 集成测试

```cmake
# CMakeLists.txt
enable_testing()

# 自动发现并注册 Google Test
add_executable(my_tests
    test/math_test.cpp
    test/string_test.cpp
)

target_link_libraries(my_tests PRIVATE mylib GTest::gtest_main)

include(GoogleTest)
gtest_discover_tests(my_tests)

# 运行: ctest --test-dir build --output-on-failure
```
