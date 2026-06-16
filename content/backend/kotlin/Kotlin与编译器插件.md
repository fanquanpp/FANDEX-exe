---
order: 74
title: Kotlin与编译器插件
module: kotlin
category: Kotlin
difficulty: advanced
description: kapt、KSP与编译器插件
author: fanquanpp
updated: '2026-06-14'
related:
  - kotlin/Kotlin与测试
  - kotlin/Kotlin与协程Channel
  - kotlin/Kotlin与DSL
  - kotlin/Kotlin与原子操作
prerequisites:
  - kotlin/概述与环境配置
---

## 概述

Kotlin 编译器插件是在编译期间对代码进行自动处理的工具。它们可以生成代码、修改已有代码、或执行额外的检查。最常见的用途是注解处理——扫描代码中的注解，然后自动生成额外的源文件。Kotlin 生态中有三种主要的注解处理方式：kapt、KSP 和编译器插件。

理解编译器插件的工作原理，有助于你选择合适的工具，并理解项目中自动生成的代码从何而来。

## 基础概念

- **kapt（Kotlin Annotation Processing Tool）**：Kotlin 早期的注解处理方案，通过将 Kotlin 代码转换为 Java 存根（stub），然后交给 Java 的 APT 处理。兼容性好但速度慢
- **KSP（Kotlin Symbol Processing）**：Kotlin 新一代的符号处理 API，直接操作 Kotlin 的 AST，速度比 kapt 快 2 倍以上
- **Compiler Plugin**：直接修改编译器行为的插件，如 all-open、no-arg、serialization 等
- **注解处理**：在编译期扫描注解，自动生成代码的过程
- **代码生成**：根据注解或配置，自动生成 Kotlin/Java 源文件

## 快速上手

### kapt 的基本使用

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.0.0"
    // 添加 kapt 插件
    kotlin("kapt") version "2.0.0"
}

dependencies {
    // 使用 kapt 处理注解
    kapt("com.google.dagger:hilt-compiler:2.50")
    implementation("com.google.dagger:hilt-android:2.50")
}
```

### KSP 的基本使用

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.0.0"
    // 添加 KSP 插件
    id("com.google.devtools.ksp") version "2.0.0-1.0.21"
}

dependencies {
    // 使用 ksp 处理注解（注意是 ksp 而不是 kapt）
    ksp("com.example:processor:1.0.0")
    implementation("com.example:annotations:1.0.0")
}
```

KSP 比 kapt 更快，因为直接操作 Kotlin AST，不需要生成 Java 存根。

## 详细用法

### 内置编译器插件

Kotlin 自带几个常用的编译器插件：

#### all-open 插件

让标记了指定注解的类不再默认 final，可以被继承：

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.0.0"
    kotlin("plugin.allopen") version "2.0.0"
}

// 配置哪些注解的类需要打开
allOpen {
    annotation("com.example.OpenClass")
    annotation("javax.persistence.Entity")  // JPA 实体类需要被代理继承
}

// 使用自定义注解
@Target(AnnotationTarget.CLASS)
annotation class OpenClass

@OpenClass
class MyService {
    // 没有 all-open 插件时，Kotlin 类默认是 final，不能被继承
    // 有了 all-open，标记了 @OpenClass 的类会被编译为 open class
}
```

#### no-arg 插件

为标记了指定注解的类自动生成无参构造器：

```kotlin
// build.gradle.kts
plugins {
    kotlin("plugin.noarg") version "2.0.0"
}

noArg {
    annotation("com.example.NoArg")
    annotation("javax.persistence.Entity")
}

@Target(AnnotationTarget.CLASS)
annotation class NoArg

@NoArg
data class User(val name: String, val age: Int)
// 编译后会自动生成无参构造器，某些框架（如 JPA）需要
```

#### serialization 插件

为标记了 @Serializable 的类自动生成序列化代码：

```kotlin
// build.gradle.kts
plugins {
    kotlin("plugin.serialization") version "2.0.0"
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")
}

// 使用
import kotlinx.serialization.*

@Serializable
data class User(val name: String, val age: Int)
// 编译器插件会自动生成 User.serializer()
```

### kapt 与 KSP 的选择

```kotlin
// 场景一：使用 Room 数据库
// kapt 方式
dependencies {
    kapt("androidx.room:room-compiler:2.6.0")
}

// KSP 方式（推荐，更快）
dependencies {
    ksp("androidx.room:room-compiler:2.6.0")
}

// 场景二：使用 Dagger/Hilt
// kapt 方式（目前 Hilt 主要支持 kapt）
dependencies {
    kapt("com.google.dagger:hilt-compiler:2.50")
}

// 场景三：使用 Moshi
// kapt 方式
dependencies {
    kapt("com.squareup.moshi:moshi-kotlin-codegen:1.15.0")
}

// KSP 方式
dependencies {
    ksp("dev.zacsweers.moshix:moshi-kotlin-codegen:0.25.0")
}
```

### 自定义 KSP 处理器

```kotlin
// 定义注解
@Target(AnnotationTarget.CLASS)
annotation class Factory

// 实现 SymbolProcessor
class FactoryProcessor : SymbolProcessor {
    override fun process(resolver: Resolver): List<KSAnnotated> {
        // 查找所有标记了 @Factory 的类
        val factories = resolver.getSymbolsWithAnnotation(Factory::class.qualifiedName!!)
        factories.forEach { annotated ->
            val classDecl = annotated as KSClassDeclaration
            // 生成工厂类代码
            generateFactory(classDecl)
        }
        return emptyList()
    }

    private fun generateFactory(classDecl: KSClassDeclaration) {
        val className = classDecl.simpleName.asString()
        val packageName = classDecl.packageName.asString()
        // 使用 CodeGenerator 生成代码
        val file = FileSpec.builder("$packageName.factory", "${className}Factory")
            .addFunction(FunSpec.builder("create")
                .returns(ClassName(packageName, className))
                .addStatement("return $className()")
                .build())
            .build()
        // 写入文件
    }
}

// 注册处理器
class FactoryProcessorProvider : SymbolProcessorProvider {
    override fun create(environment: SymbolProcessorEnvironment): SymbolProcessor {
        return FactoryProcessor()
    }
}
```

## 常见场景

### Spring Boot 项目中的插件配置

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "2.0.0"
    kotlin("plugin.spring") version "2.0.0"    // 包含 all-open
    kotlin("plugin.jpa") version "2.0.0"       // 包含 all-open + no-arg
    kotlin("plugin.serialization") version "2.0.0"
}

// kotlin-spring 插件自动为以下注解的类打开：
// @Component, @Service, @Repository, @Controller, @Configuration 等

// kotlin-jpa 插件自动为以下注解的类打开并生成无参构造器：
// @Entity, @Embeddable, @MappedSuperclass 等
```

### Android 项目中的插件配置

```kotlin
// build.gradle.kts
plugins {
    kotlin("android") version "2.0.0"
    kotlin("kapt") version "2.0.0"              // 或使用 KSP
    kotlin("plugin.serialization") version "2.0.0"
    id("com.google.devtools.ksp") version "2.0.0-1.0.21"
}

dependencies {
    // Room 数据库（推荐用 KSP）
    ksp("androidx.room:room-compiler:2.6.0")

    // Hilt 依赖注入（目前仍需 kapt）
    kapt("com.google.dagger:hilt-compiler:2.50")

    // 序列化
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")
}
```

### Lombok 与 Kotlin

```kotlin
// 如果项目同时使用 Lombok 和 Kotlin
plugins {
    kotlin("jvm") version "2.0.0"
    kotlin("kapt") version "2.0.0"
    id("io.freefair.lombok") version "8.4"
}

// 注意：Kotlin 代码不能直接使用 Lombok 注解
// Lombok 只能处理 Java 代码
// 如果 Kotlin 需要调用 Lombok 生成的代码，需要使用 lombok-config 配置
```

## 注意事项

- **KSP 是未来方向**：Google 推荐使用 KSP 替代 kapt，新项目应优先选择 KSP
- **kapt 的编译速度较慢**：kapt 需要生成 Java 存根，增加了编译时间
- **KSP 的兼容性**：不是所有注解处理器都支持 KSP，使用前需要确认
- **编译器插件顺序**：如果同时使用多个编译器插件，注意它们的顺序可能影响编译结果
- **生成的代码不可见**：注解处理器生成的代码通常在 build 目录下，IDE 可能需要手动标记为源码目录
- **增量编译**：KSP 支持增量编译，kapt 也支持但效果不如 KSP

## 进阶用法

### kapt 的配置选项

```kotlin
// build.gradle.kts
kapt {
    // 启用增量编译
    useBuildCache = true

    // 指定注解处理器的参数
    arguments {
        arg("option1", "value1")
        arg("room.schemaLocation", "$projectDir/schemas")
    }

    // 排除不需要处理的依赖
    exclude(group = "com.example", module = "unused-module")
}
```

### KSP 的配置选项

```kotlin
// build.gradle.kts
ksp {
    // 传递参数给处理器
    arg("option1", "value1")
    arg("room.schemaLocation", "$projectDir/schemas")

    // 排除特定处理器
    excludeProcessor("com.example.SomeProcessor")
}

// KSP 支持多轮处理
// 如果处理器生成了新的带注解的代码，KSP 会自动进行下一轮处理
```

### 自定义编译器插件

对于高级需求，可以编写自己的 Kotlin 编译器插件：

```kotlin
// 编写编译器插件需要实现 ComponentRegistrar 接口
// 这属于非常高级的用法，通常只在框架开发中使用

// 示例：一个简单的编译器插件结构
class MyPluginComponentRegistrar : ComponentRegistrar {
    override fun registerProjectComponents(
        project: MockProject,
        configuration: CompilerConfiguration
    ) {
        // 注册 IrGenerationExtension 或 ClassBuilderInterceptorExtension
        // 来修改编译过程中的代码
    }
}

// 在 META-INF 中注册插件
// org.jetbrains.kotlin.compiler.plugin.ComponentRegistrar
// com.example.MyPluginComponentRegistrar
```
