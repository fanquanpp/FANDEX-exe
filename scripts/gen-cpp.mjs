import fs from 'fs';
import path from 'path';

const BASE = 'c:\\Atian\\Project\\Trae\\FANDEX-vue\\src\\content\\docs';

function fm(order, title, module, category, difficulty, description) {
  return `---
order: ${order}
title: '${title}'
module: '${module}'
category: '${category}'
difficulty: '${difficulty}'
description: '${description}'
author: 'fanquanpp'
updated: 2026-06-14
---`;
}

function writeFile(dir, filename, content) {
  const fullPath = path.join(BASE, dir, filename);
  if (fs.existsSync(fullPath)) {
    console.log(`SKIP: ${fullPath}`);
    return 0;
  }
  fs.writeFileSync(fullPath, content, 'utf-8');
  return 1;
}

let total = 0;
function addFile(moduleDir, category, order, title, desc, difficulty, content) {
  const filename = title + '.md';
  const fullContent = fm(order, title, moduleDir, category, difficulty, desc) + '\n\n' + content;
  total += writeFile(moduleDir, filename, fullContent);
}

// ==================== C++ (39 files) ====================
addFile(
  'cpp',
  'C++',
  50,
  '右值引用与移动语义',
  '右值引用、移动构造与完美转发',
  'advanced',
  `## 1. 左值与右值

\`\`\`cpp
int a = 42;    // a 是左值
int&& r = 42;  // 42 是右值，r 是右值引用

// 左值引用：只能绑定左值
int& lref = a;

// 右值引用：只能绑定右值
int&& rref = 42;

// 常量左值引用：可以绑定右值
const int& cref = 42;
\`\`\`

## 2. 移动语义

\`\`\`cpp
class String {
  char* data_;
  size_t size_;
public:
  // 移动构造
  String(String&& other) noexcept
    : data_(other.data_), size_(other.size_) {
    other.data_ = nullptr;
    other.size_ = 0;
  }

  // 移动赋值
  String& operator=(String&& other) noexcept {
    if (this != &other) {
      delete[] data_;
      data_ = other.data_;
      size_ = other.size_;
      other.data_ = nullptr;
      other.size_ = 0;
    }
    return *this;
  }
};
\`\`\`

## 3. std::move

\`\`\`cpp
std::string a = "hello";
std::string b = std::move(a); // a 变为有效但未定义状态
\`\`\`

## 4. 完美转发

\`\`\`cpp
template<typename T, typename... Args>
std::unique_ptr<T> make_unique(Args&&... args) {
  return std::unique_ptr<T>(new T(std::forward<Args>(args)...));
}
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  51,
  '智能指针详解',
  'unique_ptr、shared_ptr与weak_ptr',
  'intermediate',
  `## 1. unique_ptr

\`\`\`cpp
auto p = std::make_unique<int>(42);
auto q = std::move(p); // 所有权转移

// 自定义删除器
auto deleter = [](FILE* f) { fclose(f); };
std::unique_ptr<FILE, decltype(deleter)> file(fopen("test.txt", "r"), deleter);
\`\`\`

## 2. shared_ptr

\`\`\`cpp
auto p1 = std::make_shared<int>(42);
auto p2 = p1; // 引用计数 +1
std::cout << p1.use_count(); // 2

// 循环引用问题
struct Node {
  std::shared_ptr<Node> next; // ❌ 可能循环引用
  std::weak_ptr<Node> prev;   // ✅ 使用 weak_ptr
};
\`\`\`

## 3. weak_ptr

\`\`\`cpp
std::weak_ptr<int> wp = sp;
if (auto locked = wp.lock()) {
  std::cout << *locked; // 安全访问
}
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  52,
  'Lambda表达式',
  'Lambda捕获、泛型Lambda与C++23改进',
  'intermediate',
  `## 1. 基本语法

\`\`\`cpp
auto add = [](int a, int b) { return a + b; };
add(1, 2); // 3
\`\`\`

## 2. 捕获

\`\`\`cpp
int x = 10, y = 20;

auto f1 = [x, y]() { return x + y; };    // 值捕获
auto f2 = [&x, &y]() { x++; y++; };      // 引用捕获
auto f3 = [=]() { return x + y; };       // 全部值捕获
auto f4 = [&]() { x++; y++; };           // 全部引用捕获
auto f5 = [=, &x]() { x++; return y; };  // 混合捕获
auto f6 = [this]() { return member; };    // 捕获 this
\`\`\`

## 3. 泛型 Lambda（C++14）

\`\`\`cpp
auto greater = [](auto a, auto b) { return a > b; };
greater(3, 2);    // true
greater(3.0, 2.5); // true
\`\`\`

## 4. C++23 改进

\`\`\`cpp
// 递归 Lambda
auto fib = [](this auto self, int n) -> int {
  return n <= 1 ? n : self(n-1) + self(n-2);
};
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  53,
  '模板元编程',
  '模板特化、SFINAE与概念',
  'advanced',
  `## 1. 模板特化

\`\`\`cpp
template<typename T>
struct is_pointer { static constexpr bool value = false; };

template<typename T>
struct is_pointer<T*> { static constexpr bool value = true; };

static_assert(is_pointer<int*>::value);
static_assert(!is_pointer<int>::value);
\`\`\`

## 2. SFINAE

\`\`\`cpp
template<typename T, typename = std::enable_if_t<std::is_integral_v<T>>>
void process(T value) { /* 整数版本 */ }

template<typename T, typename = std::enable_if_t<std::is_floating_point_v<T>>>
void process(T value) { /* 浮点版本 */ }
\`\`\`

## 3. C++20 概念

\`\`\`cpp
template<typename T>
concept Addable = requires(T a, T b) { a + b; };

template<Addable T>
T add(T a, T b) { return a + b; }
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  54,
  'C++20概念',
  'Concepts约束与要求',
  'advanced',
  `## 1. 定义概念

\`\`\`cpp
template<typename T>
concept Integral = std::is_integral_v<T>;

template<typename T>
concept Sortable = requires(T& container) {
  { container.begin() } -> std::random_access_iterator;
  { container.end() } -> std::random_access_iterator;
  requires std::totally_ordered<typename T::value_type>;
};
\`\`\`

## 2. 使用概念

\`\`\`cpp
// requires 子句
template<typename T> requires Integral<T>
T gcd(T a, T b) { return b == 0 ? a : gcd(b, a % b); }

// 尾置 requires
template<typename T>
auto divide(T a, T b) -> T requires std::is_arithmetic_v<T> { return a / b; }

// 简写
Integral auto foo(Integral auto x) { return x * 2; }
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  55,
  'C++20范围',
  'Ranges库与视图组合',
  'advanced',
  `## 1. 基本用法

\`\`\`cpp
#include <ranges>

auto nums = std::views::iota(1, 100);
auto even = nums | std::views::filter([](int n) { return n % 2 == 0; });
auto squared = even | std::views::transform([](int n) { return n * n; });
auto first5 = squared | std::views::take(5);

for (int n : first5) std::cout << n << ' '; // 4 16 36 64 100
\`\`\`

## 2. 常用视图

| 视图 | 说明 |
|------|------|
| \`filter\` | 过滤 |
| \`transform\` | 转换 |
| \`take\` | 取前n个 |
| \`drop\` | 跳过前n个 |
| \`reverse\` | 反转 |
| \`sort\` | 排序 |
| \`unique\` | 去重 |
| \`join\` | 展平 |
| \`zip\` | 合并（C++23） |
`
);

addFile(
  'cpp',
  'C++',
  56,
  'C++20协程',
  '协程基础与生成器',
  'advanced',
  `## 1. 协程关键字

\`\`co_await\`、\`co_yield\`、\`co_return\`

\`\`\`cpp
#include <coroutine>

Generator<int> fibonacci() {
  int a = 0, b = 1;
  while (true) {
    co_yield a;
    auto temp = a;
    a = b;
    b = temp + b;
  }
}

for (int n : fibonacci() | std::views::take(10)) {
  std::cout << n << ' ';
}
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  57,
  'C++20模块',
  '模块系统与import',
  'intermediate',
  `## 1. 模块定义

\`\`\`cpp
// math.cppm
export module math;

export int add(int a, int b) { return a + b; }
export int multiply(int a, int b) { return a * b; }

// 非导出符号（模块私有）
int helper() { return 42; }
\`\`\`

## 2. 使用模块

\`\`\`cpp
import math;

int main() {
  std::cout << add(1, 2);     // ✅ 导出的
  // helper();                 // ❌ 未导出
}
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  58,
  'C++23与C++26新特性',
  '最新标准特性预览',
  'advanced',
  `## 1. C++23 新特性

- \`std::expected<T, E>\` — 错误处理
- \`std::print\` — 格式化输出
- \`std::flat_map\` / \`std::flat_set\` — 扁平容器
- \`std::generator\` — 协程生成器
- \`if consteval\` — 编译期判断
- \`std::unreachable()\` — 不可达标记
- 多维下标运算符 \`operator[]\`

## 2. C++26 新特性

- 反射（Reflection）
- 契约（Contracts）
- \`std::text_encoding\`
- 线程安全引用计数
- SIMD 库
`
);

addFile(
  'cpp',
  'C++',
  59,
  'RAII与资源管理',
  '资源获取即初始化模式',
  'intermediate',
  `## 1. RAII 原则

\`\`\`cpp
class FileHandle {
  FILE* file_;
public:
  FileHandle(const char* path, const char* mode)
    : file_(fopen(path, mode)) {
    if (!file_) throw std::runtime_error("Cannot open file");
  }
  ~FileHandle() { if (file_) fclose(file_); }

  // 禁止拷贝
  FileHandle(const FileHandle&) = delete;
  FileHandle& operator=(const FileHandle&) = delete;

  // 允许移动
  FileHandle(FileHandle&& other) noexcept : file_(other.file_) { other.file_ = nullptr; }

  FILE* get() const { return file_; }
};
\`\`\`

## 2. 标准库 RAII 类

| 类 | 资源 |
|-----|------|
| \`std::string\` | 字符缓冲区 |
| \`std::vector\` | 动态数组 |
| \`std::unique_ptr\` | 堆对象 |
| \`std::shared_ptr\` | 共享堆对象 |
| \`std::lock_guard\` | 互斥锁 |
| \`std::fstream\` | 文件 |
`
);

addFile(
  'cpp',
  'C++',
  60,
  '运算符重载',
  '自定义运算符行为',
  'intermediate',
  `## 1. 常见运算符重载

\`\`\`cpp
class Vector2D {
  double x_, y_;
public:
  Vector2D(double x, double y) : x_(x), y_(y) {}

  Vector2D operator+(const Vector2D& other) const {
    return {x_ + other.x_, y_ + other.y_};
  }

  Vector2D& operator+=(const Vector2D& other) {
    x_ += other.x_; y_ += other.y_;
    return *this;
  }

  double operator[](int i) const { return i == 0 ? x_ : y_; }

  bool operator==(const Vector2D& other) const = default; // C++20

  friend std::ostream& operator<<(std::ostream& os, const Vector2D& v) {
    return os << "(" << v.x_ << ", " << v.y_ << ")";
  }
};
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  61,
  'STL算法详解',
  'STL算法库深入',
  'intermediate',
  `## 1. 排序与搜索

\`\`\`cpp
std::sort(v.begin(), v.end());
std::stable_sort(v.begin(), v.end());
std::partial_sort(v.begin(), v.begin() + 5, v.end());

auto it = std::binary_search(v.begin(), v.end(), target);
auto [lower, upper] = std::equal_range(v.begin(), v.end(), target);
\`\`\`

## 2. 修改序列

\`\`\`cpp
std::transform(in.begin(), in.end(), out.begin(), fn);
std::remove_if(v.begin(), v.end(), pred);
std::unique(v.begin(), v.end());
std::reverse(v.begin(), v.end());
std::rotate(v.begin(), v.begin() + k, v.end());
\`\`\`

## 3. 数值算法

\`\`\`cpp
std::accumulate(v.begin(), v.end(), 0);
std::inner_product(a.begin(), a.end(), b.begin(), 0);
std::partial_sum(v.begin(), v.end(), out.begin());
std::iota(v.begin(), v.end(), 1);
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  62,
  '字符串处理',
  'std::string与字符串视图',
  'intermediate',
  `## 1. std::string

\`\`\`cpp
std::string s = "Hello, World!";
s.find("World");           // 7
s.substr(0, 5);            // "Hello"
s.replace(7, 5, "C++");    // "Hello, C++!"
s += "!";                  // 拼接

// C++20 starts_with / ends_with
s.starts_with("Hello");    // true
s.ends_with("!");          // true

// C++23 contains
s.contains("World");       // true
\`\`\`

## 2. std::string_view

\`\`\`cpp
void process(std::string_view sv) {
  // 不拷贝，零开销
}

std::string s = "Hello";
process(s);              // 隐式转换
process("World");        // 直接使用字面量
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  63,
  '文件IO与文件系统',
  '文件操作与std::filesystem',
  'intermediate',
  `## 1. 文件流

\`\`\`cpp
std::ifstream in("input.txt");
std::ofstream out("output.txt");
std::string line;
while (std::getline(in, line)) {
  out << line << "\\n";
}
\`\`\`

## 2. std::filesystem（C++17）

\`\`\`cpp
#include <filesystem>
namespace fs = std::filesystem;

fs::path p = "/usr/local/bin";
p / "app";                        // 路径拼接
fs::exists(p);                     // 是否存在
fs::is_directory(p);               // 是否目录
fs::file_size(p);                  // 文件大小
fs::create_directories("a/b/c");   // 创建目录
fs::copy("src", "dst", fs::copy_options::recursive);
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  64,
  '异常安全',
  '异常安全保证与RAII',
  'intermediate',
  `## 1. 异常安全等级

| 等级 | 说明 |
|------|------|
| 不抛出 | \`noexcept\` 保证 |
| 强保证 | 操作成功或状态不变 |
| 基本保证 | 不泄漏资源，对象可用 |
| 无保证 | 不提供任何保证 |

\`\`\`cpp
class SafeVector {
  std::vector<int> data_;
public:
  void push_back(int value) {
    data_.push_back(value); // vector::push_back 提供强保证
  }

  void swap(SafeVector& other) noexcept {
    data_.swap(other.data_); // noexcept 保证
  }
};
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  65,
  '多线程与并发',
  'std::thread与同步原语',
  'advanced',
  `## 1. 线程

\`\`\`cpp
#include <thread>

void task(int id) { std::cout << "Thread " << id << "\\n"; }

std::thread t1(task, 1);
std::thread t2(task, 2);
t1.join();
t2.join();
\`\`\`

## 2. 互斥锁

\`\`\`cpp
std::mutex mtx;
std::lock_guard<std::mutex> lock(mtx);     // RAII 锁
std::unique_lock<std::mutex> ulock(mtx);   // 可移动锁
std::shared_mutex smtx;                     // 读写锁
\`\`\`

## 3. 异步

\`\`\`cpp
auto future = std::async(std::launch::async, []() {
  return heavy_computation();
});
auto result = future.get();
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  66,
  '类型特征与SFINAE',
  '类型特征与编译期类型判断',
  'advanced',
  `## 1. 类型特征

\`\`\`cpp
#include <type_traits>

static_assert(std::is_integral_v<int>);
static_assert(std::is_pointer_v<int*>);
static_assert(std::is_same_v<int, int32_t>);
static_assert(std::is_constructible_v<std::string, const char*>);

// 条件类型
using Type = std::conditional_t<is_64bit, int64_t, int32_t>;
\`\`\`

## 2. SFINAE

\`\`\`cpp
template<typename T>
std::enable_if_t<std::is_arithmetic_v<T>, T>
abs(T value) { return value < 0 ? -value : value; }
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  67,
  '变参模板',
  '可变参数模板与折叠表达式',
  'advanced',
  `## 1. 变参模板

\`\`\`cpp
template<typename... Args>
void print(Args... args) {
  (std::cout << ... << args) << "\\n"; // C++17 折叠表达式
}

print("Hello", " ", "World", "!"); // Hello World!
\`\`\`

## 2. 折叠表达式

\`\`\`cpp
template<typename... Args>
auto sum(Args... args) {
  return (args + ...); // 右折叠
}

template<typename... Args>
auto all(Args... args) {
  return (... && args); // 左折叠
}
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  68,
  'constexpr与编译期计算',
  '编译期常量与计算',
  'advanced',
  `## 1. constexpr

\`\`\`cpp
constexpr int factorial(int n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

static_assert(factorial(5) == 120); // 编译期计算

constexpr auto val = factorial(10); // 编译期常量
\`\`\`

## 2. consteval（C++20）

\`\`\`cpp
consteval int square(int n) { return n * n; }
// 必须在编译期计算
int arr[square(5)]; // OK
\`\`\`

## 3. constinit（C++20）

\`\`\`cpp
constinit int global = factorial(5); // 编译期初始化，运行时变量
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  69,
  '命名空间与链接',
  '命名空间、匿名命名空间与链接性',
  'intermediate',
  `## 1. 命名空间

\`\`\`cpp
namespace math {
  constexpr double PI = 3.14159265;
  int add(int a, int b) { return a + b; }
}

using math::PI;
using namespace math; // 不推荐在头文件中使用

// 嵌套命名空间
namespace a::b::c { // C++17
  void func() {}
}
\`\`\`

## 2. 匿名命名空间

\`\`\`cpp
namespace {
  int internal_var = 42; // 内部链接，等价于 static
}
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  70,
  '设计模式与C++',
  'C++实现常见设计模式',
  'intermediate',
  `## 1. 单例模式

\`\`\`cpp
class Singleton {
public:
  static Singleton& instance() {
    static Singleton inst;
    return inst;
  }
  Singleton(const Singleton&) = delete;
  Singleton& operator=(const Singleton&) = delete;
private:
  Singleton() = default;
};
\`\`\`

## 2. 观察者模式

\`\`\`cpp
class Observable {
  std::vector<std::function<void()>> observers_;
public:
  void subscribe(std::function<void()> obs) { observers_.push_back(std::move(obs)); }
  void notify() { for (auto& obs : observers_) obs(); }
};
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  71,
  'C++内存模型',
  'C++原子操作与内存序',
  'advanced',
  `## 1. 原子操作

\`\`\`cpp
#include <atomic>

std::atomic<int> counter{0};
counter.fetch_add(1, std::memory_order_relaxed);
counter.load(std::memory_order_acquire);
counter.store(0, std::memory_order_release);
\`\`\`

## 2. 内存序

| 内存序 | 说明 |
|--------|------|
| \`relaxed\` | 无顺序保证 |
| \`acquire\` | 读操作，后续不能重排到此之前 |
| \`release\` | 写操作，之前不能重排到此之后 |
| \`acq_rel\` | 读写都有保证 |
| \`seq_cst\` | 顺序一致（默认） |
`
);

addFile(
  'cpp',
  'C++',
  72,
  'C++工具链',
  'CMake、vcpkg与包管理',
  'intermediate',
  `## 1. CMake

\`\`\`cmake
cmake_minimum_required(VERSION 3.20)
project(MyProject LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)

find_package(fmt REQUIRED)
find_package(range-v3 REQUIRED)

add_executable(app main.cpp)
target_link_libraries(app fmt::fmt range-v3::range-v3)
\`\`\`

## 2. vcpkg

\`\`\`bash
vcpkg install fmt range-v3
cmake -B build -DCMAKE_TOOLCHAIN_FILE=[vcpkg root]/scripts/buildsystems/vcpkg.cmake
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  73,
  'C++测试框架',
  'Google Test与Catch2',
  'intermediate',
  `## 1. Google Test

\`\`\`cpp
#include <gtest/gtest.h>

TEST(MathTest, Add) {
  EXPECT_EQ(add(1, 2), 3);
  EXPECT_NE(add(1, 2), 4);
  ASSERT_TRUE(add(0, 0) == 0);
}
\`\`\`

## 2. Catch2

\`\`\`cpp
#include <catch2/catch_test_macros.hpp>

TEST_CASE("Addition works", "[math]") {
  REQUIRE(add(1, 2) == 3);
  REQUIRE(add(-1, 1) == 0);
}
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  74,
  'C++与Python交互',
  'pybind11与C++/Python互操作',
  'advanced',
  `## 1. pybind11

\`\`\`cpp
#include <pybind11/pybind11.h>

int add(int a, int b) { return a + b; }

PYBIND11_MODULE(mymod, m) {
  m.def("add", &add, "Add two numbers");
}
\`\`\`

\`\`\`python
import mymod
mymod.add(1, 2)  # 3
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  75,
  'C++性能优化',
  'C++性能优化技巧',
  'advanced',
  `## 1. 编译器优化

\`\`\`bash
-O2          # 标准优化
-O3          # 激进优化
-march=native # 针对本机CPU优化
-flto        # 链接时优化
\`\`\`

## 2. 数据布局优化

\`\`\`cpp
// 缓存友好的数据布局
struct SoA { // Structure of Arrays
  std::vector<float> x, y, z;
};

struct AoS { // Array of Structures
  struct Point { float x, y, z; };
  std::vector<Point> points;
};
// SoA 更适合 SIMD 和缓存行
\`\`\`

## 3. 移动代替拷贝

\`\`\`cpp
std::vector<int> v2 = std::move(v1); // O(1) 而非 O(n)
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  76,
  'C++序列化',
  '序列化与反序列化',
  'intermediate',
  `## 1. JSON 序列化

\`\`\`cpp
#include <nlohmann/json.hpp>

struct User {
  std::string name;
  int age;
};

// 序列化
nlohmann::json j = {{"name", user.name}, {"age", user.age}};
std::string json_str = j.dump();

// 反序列化
auto j2 = nlohmann::json::parse(json_str);
User u2 = j2.get<User>();
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  77,
  'C++网络编程',
  'Asio与网络编程',
  'advanced',
  `## 1. Asio TCP 服务器

\`\`\`cpp
#include <asio.hpp>

asio::io_context io;
asio::ip::tcp::acceptor acceptor(io,
  asio::ip::tcp::endpoint(asio::ip::tcp::v4(), 8080));

for (;;) {
  asio::ip::tcp::socket socket(io);
  acceptor.accept(socket);
  std::string msg = "Hello!\\n";
  asio::write(socket, asio::buffer(msg));
}
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  78,
  'C++图形编程',
  'OpenGL与图形基础',
  'advanced',
  `## 1. OpenGL 初始化

\`\`\`cpp
#include <GL/gl.h>

void render() {
  glClear(GL_COLOR_BUFFER_BIT);
  glBegin(GL_TRIANGLES);
  glColor3f(1, 0, 0); glVertex2f(-0.5f, -0.5f);
  glColor3f(0, 1, 0); glVertex2f(0.5f, -0.5f);
  glColor3f(0, 0, 1); glVertex2f(0.0f, 0.5f);
  glEnd();
}
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  79,
  'C++游戏开发',
  '游戏引擎与C++游戏开发',
  'advanced',
  `## 1. 游戏循环

\`\`\`cpp
class Game {
  bool running_ = true;
public:
  void run() {
    auto last = std::chrono::high_resolution_clock::now();
    while (running_) {
      auto now = std::chrono::high_resolution_clock::now();
      float dt = std::chrono::duration<float>(now - last).count();
      last = now;
      processInput();
      update(dt);
      render();
    }
  }
};
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  80,
  'C++嵌入式开发',
  '嵌入式C++开发要点',
  'advanced',
  `## 1. 嵌入式 C++ 限制

\`\`\`cpp
// 避免异常（增加代码体积）
// -fno-exceptions

// 避免RTTI
// -fno-rtti

// 使用 constexpr 代替运行时计算
constexpr int BUFFER_SIZE = 1024;
alignas(16) uint8_t buffer[BUFFER_SIZE];

// 静态分配
class ObjectPool {
  std::array<Object, MAX_OBJECTS> pool_;
  std::bitset<MAX_OBJECTS> used_;
};
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  81,
  'C++与Rust对比',
  'C++与Rust语言对比',
  'intermediate',
  `## 1. 内存安全

| 特性 | C++ | Rust |
|------|-----|------|
| 内存管理 | 手动/RAII | 所有权系统 |
| 空指针 | 可能 | 编译期阻止 |
| 数据竞争 | 可能 | 编译期阻止 |
| 缓冲区溢出 | 可能 | 边界检查 |

## 2. 互操作

\`\`\`cpp
// CXX — Rust 与 C++ 互操作
// Rust 可以调用 C++ 代码
// C++ 可以调用 Rust 代码
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  82,
  'C++代码规范',
  'C++编码规范与最佳实践',
  'beginner',
  `## 1. 命名规范

| 类型 | 风格 | 示例 |
|------|------|------|
| 类名 | PascalCase | \`MyClass\` |
| 函数 | snake_case | \`process_data\` |
| 变量 | snake_case | \`item_count\` |
| 常量 | UPPER_CASE | \`MAX_SIZE\` |
| 模板参数 | PascalCase | \`typename Iterator\` |

## 2. 现代C++最佳实践

- 使用 \`auto\` 推断类型
- 优先 \`{}\` 初始化
- 使用 \`nullptr\` 代替 \`NULL\`
- 使用 \`enum class\`
- 使用 \`constexpr\`
- 优先 \`std::array\` 代替 C 数组
- 使用 RAII 管理资源
`
);

addFile(
  'cpp',
  'C++',
  83,
  'C++与WebAssembly',
  'C++编译为WebAssembly',
  'advanced',
  `## 1. Emscripten

\`\`\`bash
emcc hello.cpp -o hello.js
emcc hello.cpp -o hello.html
\`\`\`

## 2. 与 JavaScript 交互

\`\`\`cpp
#include <emscripten.h>

EMSCRIPTEN_KEEPALIVE
int add(int a, int b) { return a + b; }
\`\`\`

\`\`\`javascript
const module = await Module();
const result = module._add(1, 2); // 3
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  84,
  'C++反射与元编程',
  '编译期反射与代码生成',
  'advanced',
  `## 1. 编译期类型信息

\`\`\`cpp
#include <typeinfo>
std::cout << typeid(int).name(); // 输出类型名

// C++26 反射（提案中）
// consteval auto members = std::meta::members_of(^MyStruct);
\`\`\`

## 2. 静态反射技巧

\`\`\`cpp
// 聚合类型字段计数
template<typename T>
consteval size_t field_count() {
  // 通过聚合初始化技巧
  return []<size_t... I>(std::index_sequence<I...>) {
    return sizeof...(I);
  }(std::make_index_sequence<sizeof(T)>{});
}
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  85,
  'C++数学库',
  '数值计算与数学库',
  'intermediate',
  `## 1. 数学函数

\`\`\`cpp
#include <cmath>

std::sqrt(2.0);
std::pow(2, 10);
std::sin(M_PI / 4);
std::log(std::exp(1.0)); // 1.0
std::abs(-42);
std::floor(3.7);  // 3
std::ceil(3.2);   // 4
std::round(3.5);  // 4
\`\`\`

## 2. 复数

\`\`\`cpp
#include <complex>
std::complex<double> z(1.0, 2.0);
std::abs(z);   // 模
std::arg(z);   // 辐角
std::norm(z);  // 模的平方
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  86,
  'C++正则表达式',
  'std::regex与正则匹配',
  'intermediate',
  `## 1. 基本用法

\`\`\`cpp
#include <regex>

std::regex pattern(R"(\\d{4}-\\d{2}-\\d{2})");
std::string text = "Date: 2026-06-14";

std::smatch match;
if (std::regex_search(text, match, pattern)) {
  std::cout << match[0]; // "2026-06-14"
}

// 替换
std::string result = std::regex_replace(text, pattern, "YYYY-MM-DD");
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  87,
  'C++日期时间',
  'chrono与日期时间处理',
  'intermediate',
  `## 1. chrono

\`\`\`cpp
#include <chrono>

using namespace std::chrono;

auto start = steady_clock::now();
// ... 操作
auto end = steady_clock::now();
auto duration = duration_cast<milliseconds>(end - start);
std::cout << duration.count() << "ms\\n";
\`\`\`

## 2. C++20 日历

\`\`\`cpp
#include <chrono>

auto today = year_month_day{2026y, June, 14d};
auto birthday = 2000y / January / 15;
\`\`\`
`
);

addFile(
  'cpp',
  'C++',
  88,
  'C++格式化输出',
  'std::format与格式化',
  'intermediate',
  `## 1. std::format（C++20）

\`\`\`cpp
#include <format>

std::string s = std::format("Hello, {}!", "World");
std::string s2 = std::format("{0} + {1} = {2}", 1, 2, 3);
std::string s3 = std::format("{:.2f}", 3.14159); // "3.14"
std::string s4 = std::format("{:10d}", 42);      // "        42"
\`\`\`

## 2. std::print（C++23）

\`\`\`cpp
#include <print>

std::print("Hello, {}!\\n", "World");
std::println("Value: {}", 42);
\`\`\`
`
);

console.log(`\nDone! Total C++ files created: ${total}`);
