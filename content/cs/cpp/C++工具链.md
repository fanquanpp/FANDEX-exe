---
order: 72
title: C++工具链
module: cpp
category: C++
difficulty: intermediate
description: CMake、vcpkg与包管理
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/面向对象进阶
  - cpp/C++内存模型
  - cpp/C++测试框架
  - cpp/C++与Python交互
prerequisites:
  - cpp/概述与现代标准
---

## 概述

C++ 工具链是支撑项目构建、依赖管理和持续集成的基础设施。与 Rust 的 Cargo 或 Node.js 的 npm 不同，C++ 没有官方统一的包管理器和构建系统，但 CMake 和 vcpkg 的组合已成为事实标准。CMake 负责跨平台构建配置，vcpkg 负责第三方库的获取和集成，两者配合可以高效管理现代 C++ 项目。

掌握工具链是 C++ 开发者从入门到进阶的关键一步。良好的构建配置不仅影响开发效率，还直接关系到项目的可维护性和跨平台兼容性。

## 基础概念

### 构建系统的演进

| 工具  | 说明                                          |
| ----- | --------------------------------------------- |
| Make  | 最经典的构建工具，使用 Makefile 描述构建规则  |
| CMake | 跨平台元构建系统，生成 Makefile/Ninja/VS 项目 |
| Ninja | 专注于速度的底层构建工具，常与 CMake 配合     |
| Bazel | Google 出品，支持大规模多语言项目             |
| xmake | 国产构建工具，API 更友好                      |

### 包管理器对比

| 包管理器     | 说明                                  |
| ------------ | ------------------------------------- |
| vcpkg        | 微软出品，库数量丰富，与 CMake 集成好 |
| Conan        | 去中心化包管理，灵活性高              |
| CPM.cmake    | CMake 原生的轻量级依赖管理            |
| FetchContent | CMake 内置的依赖获取方式              |

## 快速上手

### CMake 基础配置

```cmake
# CMakeLists.txt
cmake_minimum_required(VERSION 3.20)
project(MyProject LANGUAGES CXX)

# 设置 C++ 标准
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 查找第三方库
find_package(fmt REQUIRED)
find_package(range-v3 REQUIRED)

# 定义可执行目标
add_executable(app main.cpp)

# 链接库
target_link_libraries(app fmt::fmt range-v3::range-v3)
```

### 使用 vcpkg 管理依赖

```bash
# 安装依赖库
vcpkg install fmt range-v3

# 配置 CMake 使用 vcpkg 工具链
cmake -B build -DCMAKE_TOOLCHAIN_FILE=[vcpkg根目录]/scripts/buildsystems/vcpkg.cmake

# 编译项目
cmake --build build --config Release
```

### vcpkg.json 清单模式

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": [
    "fmt",
    "range-v3",
    {
      "name": "boost-system",
      "version>=": "1.82.0"
    }
  ],
  "builtin-baseline": "2024.01.15"
}
```

## 详细用法

### 目标化 CMake 最佳实践

```cmake
cmake_minimum_required(VERSION 3.20)
project(MathLib LANGUAGES CXX)

# 库目标
add_library(mathlib
    src/math.cpp
    src/algebra.cpp
    src/geometry.cpp
)

# 设置库的属性（而非全局变量）
target_include_directories(mathlib
    PUBLIC include          # 公开头文件，使用者可见
    PRIVATE src             # 私有头文件，仅编译时可见
)

target_compile_features(mathlib PUBLIC cxx_std_20)

# 条件编译
option(ENABLE_TESTING "启用测试" ON)
if(ENABLE_TESTING)
    enable_testing()
    add_subdirectory(tests)
endif()

# 安装规则
install(TARGETS mathlib
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
)
install(DIRECTORY include/ DESTINATION include)
```

### 多目标项目管理

```cmake
# 顶层 CMakeLists.txt
cmake_minimum_required(VERSION 3.20)
project(MyApp LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)

# 子目录
add_subdirectory(core)      # 核心库
add_subdirectory(network)   # 网络库
add_subdirectory(app)       # 应用程序

# core/CMakeLists.txt
add_library(core src/utils.cpp)
target_include_directories(core PUBLIC include)

# network/CMakeLists.txt
add_library(network src/client.cpp)
target_link_libraries(core PUBLIC core)  # network 依赖 core

# app/CMakeLists.txt
add_executable(myapp main.cpp)
target_link_libraries(myapp PRIVATE core network)
```

### CMake Presets 标准化构建

```json
{
  "version": 3,
  "cmakeMinimumRequired": { "major": 3, "minor": 20, "patch": 0 },
  "configurePresets": [
    {
      "name": "debug",
      "binaryDir": "${sourceDir}/build/debug",
      "cacheVariables": {
        "CMAKE_BUILD_TYPE": "Debug",
        "CMAKE_EXPORT_COMPILE_COMMANDS": "ON"
      }
    },
    {
      "name": "release",
      "binaryDir": "${sourceDir}/build/release",
      "cacheVariables": {
        "CMAKE_BUILD_TYPE": "Release"
      }
    }
  ],
  "buildPresets": [
    { "name": "debug", "configurePreset": "debug" },
    { "name": "release", "configurePreset": "release" }
  ]
}
```

```bash
# 使用 preset 配置和构建
cmake --preset debug
cmake --build --preset debug
```

### FetchContent 管理依赖

```cmake
include(FetchContent)

# 从 GitHub 获取依赖
FetchContent_Declare(
    fmt
    GIT_REPOSITORY https://github.com/fmtlib/fmt.git
    GIT_TAG        10.1.1
)

FetchContent_Declare(
    googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG        v1.14.0
)

# 批量获取
FetchContent_MakeAvailable(fmt googletest)

# 使用
target_link_libraries(myapp PRIVATE fmt::fmt GTest::gtest_main)
```

## 常见场景

### 跨平台构建

```cmake
# 平台检测
if(WIN32)
    target_compile_definitions(myapp PRIVATE WINDOWS_PLATFORM)
    target_link_libraries(myapp PRIVATE ws2_32)  # Windows 网络库
elseif(UNIX)
    target_compile_definitions(myapp PRIVATE UNIX_PLATFORM)
    target_link_libraries(myapp PRIVATE pthread)  # POSIX 线程库
endif()

# 编译器特定选项
if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    target_compile_options(myapp PRIVATE -Wall -Wextra -Wpedantic)
elseif(MSVC)
    target_compile_options(myapp PRIVATE /W4 /permissive-)
endif()
```

### 集成测试框架

```cmake
enable_testing()

# 添加测试可执行文件
add_executable(tests
    tests/test_math.cpp
    tests/test_algebra.cpp
)

target_link_libraries(tests PRIVATE mathlib GTest::gtest_main)

# 注册测试
include(GoogleTest)
gtest_discover_tests(tests)
```

```bash
# 运行测试
ctest --test-dir build --output-on-failure
```

## 注意事项

- 优先使用 `target_*` 命令（如 `target_compile_options`）而非全局命令（如 `add_compile_options`），避免污染其他目标
- `CMAKE_CXX_STANDARD` 应通过 `target_compile_features(target PUBLIC cxx_std_20)` 设置，而非全局变量
- vcpkg 清单模式（vcpkg.json）优于直接安装模式，确保依赖版本可复现
- 使用 CMake Presets 统一团队构建配置，避免"在我机器上能编译"的问题
- 将 `CMAKE_EXPORT_COMPILE_COMMANDS` 设为 ON，方便 clangd 等工具提供代码补全和跳转
- 不要在 CMakeLists.txt 中硬编码绝对路径，使用 `${CMAKE_CURRENT_SOURCE_DIR}` 等变量

## 进阶用法

### 自定义 vcpkg 端口

当第三方库不在 vcpkg 仓库中时，可以创建本地端口：

```
my-ports/
  mylib/
    portfile.cmake
    vcpkg.json
```

```cmake
# portfile.cmake
vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO user/mylib
    REF v1.0.0
    SHA512 0123456789abcdef...
)

vcpkg_cmake_configure(
    SOURCE_PATH "${SOURCE_PATH}"
)

vcpkg_cmake_install()
vcpkg_cmake_config_fixup()
```

```bash
# 使用本地端口
cmake -B build -DCMAKE_TOOLCHAIN_FILE=[vcpkg]/scripts/buildsystems/vcpkg.cmake \
    -DVCPKG_OVERLAY_PORTS=${PWD}/my-ports
```

### CCache 加速编译

```cmake
# 在 CMakeLists.txt 中启用 ccache
find_program(CCACHE_PROGRAM ccache)
if(CCACHE_PROGRAM)
    set(CMAKE_CXX_COMPILER_LAUNCHER ${CCACHE_PROGRAM})
    set(CMAKE_C_COMPILER_LAUNCHER ${CCACHE_PROGRAM})
endif()
```

### Conan 集成

```ini
# conanfile.txt
[requires]
fmt/10.1.1
boost/1.82.0

[generators]
CMakeDeps
CMakeToolchain

[options]
boost/*:shared=True
```

```bash
# 安装依赖并生成 CMake 配置
conan install . --output-folder=build --build=missing

# 使用生成的工具链配置 CMake
cmake -B build -DCMAKE_TOOLCHAIN_FILE=build/conan_toolchain.cmake
```
