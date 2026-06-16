---
order: 61
title: Kotlin序列化
module: kotlin
category: Kotlin
difficulty: intermediate
description: kotlinx.serialization
author: fanquanpp
updated: '2026-06-14'
related:
  - kotlin/Kotlin内联类
  - kotlin/Kotlin契约
  - kotlin/Kotlin集合操作
  - kotlin/Kotlin作用域函数
prerequisites:
  - kotlin/概述与环境配置
---

## 概述

序列化是将对象转换为可存储或可传输格式（如 JSON、Protobuf）的过程，反序列化则是将格式化数据还原为对象。Kotlin 官方提供的序列化库是 kotlinx.serialization，它通过编译器插件在编译期生成序列化代码，避免了运行时反射，因此性能更好且与混淆工具兼容。

如果你需要调用 REST API、保存数据到本地、或在不同服务之间传递数据，序列化是必不可少的。

## 基础概念

- **@Serializable**：标记在类上，编译器会自动为该类生成序列化和反序列化代码
- **Serializers**：序列化器，负责具体的转换逻辑。大多数情况下编译器自动生成，你也可以自定义
- **Json**：JSON 格式的配置对象，控制序列化行为（如忽略未知字段、格式化输出等）
- **Encoder/Decoder**：编码器和解码器，是底层抽象，支持多种格式（JSON、Protobuf、CBOR 等）
- **编译器插件**：kotlinx-serialization 需要编译器插件支持，不是纯运行时库

## 快速上手

第一步，在 `build.gradle.kts` 中添加序列化插件和依赖：

```kotlin
plugins {
    kotlin("jvm") version "2.0.0"
    // 必须添加序列化编译器插件
    kotlin("plugin.serialization") version "2.0.0"
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")
}
```

最简单的序列化和反序列化：

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.json.*

// 用 @Serializable 标记数据类
@Serializable
data class User(val name: String, val age: Int)

fun main() {
    // 序列化：对象 -> JSON 字符串
    val user = User("Alice", 25)
    val jsonString = Json.encodeToString(user)
    println(jsonString)  // {"name":"Alice","age":25}

    // 反序列化：JSON 字符串 -> 对象
    val decoded = Json.decodeFromString<User>("""{"name":"Bob","age":30}""")
    println(decoded)  // User(name=Bob, age=30)
}
```

## 详细用法

### 配置 Json 对象

默认的 `Json` 对象比较严格，通常需要自定义配置：

```kotlin
// 创建自定义配置的 Json 实例
val json = Json {
    ignoreUnknownKeys = true    // 忽略 JSON 中有但类中没有的字段
    prettyPrint = true          // 格式化输出，方便阅读
    isLenient = true            // 宽松模式，允许非标准 JSON
    encodeDefaults = true       // 编码默认值
    coerceInputValues = true    // 将无效值强制转为默认值
}

// 使用自定义配置
val user = json.decodeFromString<User>("""{"name":"Alice","age":25,"extra":"ignored"}""")
// extra 字段会被忽略，因为 ignoreUnknownKeys = true
```

### 可选字段与默认值

```kotlin
@Serializable
data class Profile(
    val name: String,
    val age: Int = 0,              // 默认值，JSON 中可以省略
    val email: String? = null,     // 可空类型，可以传 null 或省略
    val role: String = "user"      // 默认角色
)

fun main() {
    // JSON 中省略了 age 和 email，会使用默认值
    val profile = Json.decodeFromString<Profile>("""{"name":"Alice"}""")
    println(profile)  // Profile(name=Alice, age=0, email=null, role=user)

    // 序列化时，默认值默认不会输出（节省空间）
    val json = Json { encodeDefaults = true }
    println(json.encodeToString(profile))
    // 加了 encodeDefaults 后会输出所有字段
}
```

### 嵌套对象和列表

```kotlin
@Serializable
data class Address(val city: String, val street: String)

@Serializable
data class Person(
    val name: String,
    val address: Address,          // 嵌套对象
    val hobbies: List<String>      // 列表
)

fun main() {
    val person = Person(
        name = "Alice",
        address = Address("Beijing", "Chaoyang Road"),
        hobbies = listOf("Reading", "Coding")
    )

    val jsonString = Json.encodeToString(person)
    println(jsonString)
    // {"name":"Alice","address":{"city":"Beijing","street":"Chaoyang Road"},"hobbies":["Reading","Coding"]}

    val decoded = Json.decodeFromString<Person>(jsonString)
    println(decoded.address.city)  // Beijing
}
```

### 自定义字段名

当 JSON 字段名与 Kotlin 属性名不同时，用 `@SerialName` 映射：

```kotlin
@Serializable
data class ApiResponse(
    @SerialName("status_code")
    val statusCode: Int,           // JSON 中是 status_code，Kotlin 中是 statusCode

    @SerialName("user_name")
    val userName: String
)

fun main() {
    val json = """{"status_code":200,"user_name":"Alice"}"""
    val response = Json.decodeFromString<ApiResponse>(json)
    println(response.statusCode)  // 200
    println(response.userName)    // Alice
}
```

### 枚举和密封类的序列化

```kotlin
@Serializable
enum class Status { ACTIVE, INACTIVE, SUSPENDED }

@Serializable
data class Account(val name: String, val status: Status)

fun main() {
    val account = Account("Alice", Status.ACTIVE)
    val json = Json.encodeToString(account)
    println(json)  // {"name":"Alice","status":"ACTIVE"}
}

// 密封类的多态序列化
@Serializable
sealed class Message {
    abstract val id: String

    @Serializable
    @SerialName("text")
    data class Text(override val id: String, val content: String) : Message()

    @Serializable
    @SerialName("image")
    data class Image(override val id: String, val url: String) : Message()
}

fun main() {
    val messages: List<Message> = listOf(
        Message.Text("1", "Hello"),
        Message.Image("2", "https://example.com/img.png")
    )
    val json = Json.encodeToString(messages)
    // 会自动添加 type 字段区分子类
}
```

### 手动构建和解析 JSON

有时你需要处理动态结构的 JSON：

```kotlin
import kotlinx.serialization.json.*

fun main() {
    // 手动构建 JSON 对象
    val jsonObject = buildJsonObject {
        put("name", "Alice")
        put("age", 25)
        put("isStudent", true)
        put("hobbies", buildJsonArray {
            add("Reading")
            add("Coding")
        })
        put("address", buildJsonObject {
            put("city", "Beijing")
        })
    }
    println(jsonObject.toString())

    // 手动解析 JSON
    val jsonElement = Json.parseToJsonElement("""{"name":"Bob","scores":[90,85,92]}""")
    // 读取字段
    val name = jsonElement.jsonObject["name"]?.jsonPrimitive?.content  // "Bob"
    val scores = jsonElement.jsonObject["scores"]?.jsonArray
        ?.map { it.jsonPrimitive.int }  // [90, 85, 92]
    println("Name: $name, Scores: $scores")
}
```

## 常见场景

### 封装网络请求的响应格式

```kotlin
@Serializable
data class ApiResult<T>(
    val code: Int,
    val message: String,
    val data: T? = null
)

@Serializable
data class Article(val id: Int, val title: String, val content: String)

fun main() {
    val json = """{"code":200,"message":"success","data":{"id":1,"title":"Hello","content":"World"}}"""
    val result = Json.decodeFromString<ApiResult<Article>>(json)
    result.data?.let { article ->
        println("文章: ${article.title} - ${article.content}")
    }
}
```

### 本地数据持久化

```kotlin
import java.io.File

@Serializable
data class AppSettings(
    val theme: String = "light",
    val fontSize: Int = 14,
    val recentFiles: List<String> = emptyList()
)

// 保存设置到文件
fun saveSettings(settings: AppSettings, filePath: String) {
    val json = Json { prettyPrint = true }
    File(filePath).writeText(json.encodeToString(settings))
}

// 从文件读取设置
fun loadSettings(filePath: String): AppSettings {
    val text = File(filePath).readText()
    return Json.decodeFromString(text)
}
```

## 注意事项

- **必须添加编译器插件**：没有 `kotlin("plugin.serialization")` 插件，`@Serializable` 注解不会生效
- **主构造器的属性才会被序列化**：类体中定义的属性不会参与序列化
- **不可变集合**：序列化支持 `List`、`Set`、`Map`，但不支持 `MutableList` 等可变集合的自动推断，需要时用 `@SerialName` 或自定义序列化器
- **循环引用**：序列化不支持循环引用，会导致栈溢出
- **第三方类无法直接标记 @Serializable**：对于不属于你的类（如 `java.util.Date`），需要自定义序列化器

## 进阶用法

### 自定义序列化器

```kotlin
import kotlinx.serialization.*
import kotlinx.serialization.descriptors.*
import kotlinx.serialization.encoding.*

// 为 Date 类自定义序列化器
object DateSerializer : KSerializer<java.util.Date> {
    // 描述符：序列化后的类型是 LONG
    override val descriptor: SerialDescriptor =
        PrimitiveSerialDescriptor("Date", PrimitiveKind.LONG)

    // 反序列化：从时间戳还原 Date
    override fun deserialize(decoder: Decoder): java.util.Date {
        return java.util.Date(decoder.decodeLong())
    }

    // 序列化：将 Date 转为时间戳
    override fun serialize(encoder: Encoder, value: java.util.Date) {
        encoder.encodeLong(value.time)
    }
}

// 使用自定义序列化器
@Serializable
data class Event(
    val title: String,
    @Serializable(with = DateSerializer::class)
    val date: java.util.Date
)
```

### 多格式支持

kotlinx.serialization 不只支持 JSON，还支持 Protobuf、CBOR、Properties 等格式：

```kotlin
// Protobuf 支持（需要添加对应依赖）
dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-protobuf:1.6.3")
}

import kotlinx.serialization.protobuf.*

@Serializable
data class ProtoMessage(val id: Int, val text: String)

fun main() {
    val message = ProtoMessage(1, "Hello")
    // 序列化为 Protobuf 二进制格式
    val bytes = ProtoBuf.encodeToByteArray(message)
    // 从二进制还原
    val decoded = ProtoBuf.decodeFromByteArray<ProtoMessage>(bytes)
}
```

### 泛型序列化

```kotlin
// 泛型类的序列化
@Serializable
data class Box<T>(val value: T)

fun main() {
    // 需要显式指定泛型类型
    val box = Box(User("Alice", 25))
    val json = Json.encodeToString(Box.serializer(User.serializer()), box)

    // 反序列化时也需要指定
    val decoded = Json.decodeFromString(Box.serializer(User.serializer()), json)
}
```
