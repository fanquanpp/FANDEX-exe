---
order: 79
title: Kotlin与正则
module: kotlin
category: Kotlin
difficulty: beginner
description: Kotlin正则表达式
author: fanquanpp
updated: '2026-06-14'
related:
  - kotlin/Kotlin与Benchmark
  - kotlin/Kotlin与IO
  - kotlin/Kotlin与时间
  - kotlin/Kotlin与并发安全
prerequisites:
  - kotlin/概述与环境配置
---

## 概述

正则表达式（Regular Expression，简称 Regex）是一种描述字符串模式的语法。它用于搜索、匹配、替换和验证文本。Kotlin 通过 `Regex` 类封装了 Java 的正则表达式功能，同时提供了一些 Kotlin 风格的扩展函数，让正则操作更简洁。

无论你是验证用户输入、从文本中提取数据、还是批量替换字符串，正则表达式都是不可或缺的工具。

## 基础概念

- **Regex 对象**：Kotlin 中用 `Regex()` 或 `.toRegex()` 创建正则表达式对象
- **模式匹配**：正则表达式定义一个模式，用来检查字符串是否符合该模式
- **元字符**：特殊含义的字符，如 `.`（任意字符）、`*`（零或多次）、`+`（一或多次）
- **字符类**：`[abc]` 匹配方括号中的任意一个字符
- **分组**：用 `()` 将部分模式分组，可以提取匹配的子串
- **原始字符串**：Kotlin 的 `""" """` 三引号字符串，不需要转义反斜杠

## 快速上手

```kotlin
fun main() {
    // 创建正则表达式（推荐用原始字符串，避免双重转义）
    val regex = Regex("""\d{4}-\d{2}-\d{2}""")

    // 检查是否包含匹配
    val contains = "Date: 2026-06-14".contains(regex)
    println("包含日期: $contains")  // true

    // 查找第一个匹配
    val match = regex.find("Date: 2026-06-14")
    println("找到: ${match?.value}")  // 2026-06-14

    // 检查是否完全匹配
    val exactMatch = regex.matches("2026-06-14")
    println("完全匹配: $exactMatch")  // true

    // 替换
    val replaced = "2026-06-14".replace(regex, "YYYY-MM-DD")
    println("替换后: $replaced")  // YYYY-MM-DD
}
```

## 详细用法

### 常用元字符

```kotlin
fun metacharDemo() {
    // . 匹配任意单个字符（除换行符外）
    println("a1b".contains(Regex("a.b")))   // true

    // \d 匹配数字，等价于 [0-9]
    println("abc123".contains(Regex("\\d+")))  // true

    // \w 匹配字母数字下划线，等价于 [a-zA-Z0-9_]
    println("hello_world".contains(Regex("\\w+")))  // true

    // \s 匹配空白字符（空格、制表符、换行等）
    println("hello world".contains(Regex("\\s")))  // true

    // ^ 匹配字符串开头
    println("Hello".contains(Regex("^H")))  // true

    // $ 匹配字符串结尾
    println("Hello".contains(Regex("o$")))  // true

    // 量词
    // * 零或多次
    println("".matches(Regex("a*")))    // true
    // + 一或多次
    println("aaa".matches(Regex("a+")))  // true
    // ? 零或一次
    println("a".matches(Regex("a?")))    // true
    // {n} 恰好n次
    println("123".matches(Regex("\\d{3}")))  // true
    // {n,m} n到m次
    println("12".matches(Regex("\\d{2,4}")))  // true
}
```

### 字符类和范围

```kotlin
fun charClassDemo() {
    // [abc] 匹配 a、b 或 c 中的任意一个
    println("a".matches(Regex("[abc]")))  // true
    println("d".matches(Regex("[abc]")))  // false

    // [a-z] 匹配小写字母
    println("m".matches(Regex("[a-z]")))  // true

    // [A-Z] 匹配大写字母
    println("M".matches(Regex("[A-Z]")))  // true

    // [0-9] 匹配数字
    println("5".matches(Regex("[0-9]")))  // true

    // [^abc] 匹配不在方括号中的字符（取反）
    println("d".matches(Regex("[^abc]")))  // true
    println("a".matches(Regex("[^abc]")))  // false

    // 组合使用
    val alphaNumeric = Regex("[a-zA-Z0-9]+")
    println("Hello123".matches(alphaNumeric))  // true
    println("Hello 123".matches(alphaNumeric))  // false（包含空格）
}
```

### 分组和提取

```kotlin
fun groupDemo() {
    // 用 () 分组，提取匹配的子串
    val dateRegex = Regex("""(\d{4})-(\d{2})-(\d{2})""")
    val input = "今天是 2026-06-14"

    val match = dateRegex.find(input)
    if (match != null) {
        println("完整匹配: ${match.value}")        // 2026-06-14
        println("第1组(年): ${match.groupValues[1]}")  // 2026
        println("第2组(月): ${match.groupValues[2]}")  // 06
        println("第3组(日): ${match.groupValues[3]}")  // 14
    }

    // 命名分组
    val namedRegex = Regex("""(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})""")
    val namedMatch = namedRegex.find(input)
    if (namedMatch != null) {
        // 通过名称访问分组
        println("年: ${namedMatch.groups["year"]?.value}")   // 2026
        println("月: ${namedMatch.groups["month"]?.value}")  // 06
        println("日: ${namedMatch.groups["day"]?.value}")    // 14
    }

    // 查找所有匹配
    val emailRegex = Regex("""[\w.]+@[\w.]+\.\w+""")
    val text = "联系 alice@example.com 或 bob@test.org"
    val emails = emailRegex.findAll(text).map { it.value }.toList()
    println("找到的邮箱: $emails")  // [alice@example.com, bob@test.org]
}
```

### 替换操作

```kotlin
fun replaceDemo() {
    // 简单替换
    val result1 = "Hello 123 World 456".replace(Regex("\\d+"), "NUM")
    println(result1)  // Hello NUM World NUM

    // 带分组的替换
    val result2 = "2026-06-14".replace(Regex("(\\d{4})-(\\d{2})-(\\d{2})"), "$2/$3/$1")
    println(result2)  // 06/14/2026

    // 使用 Lambda 替换（更灵活）
    val result3 = "Prices: $10, $20, $30".replace(Regex("\\$(\\d+)")) { match ->
        val price = match.groupValues[1].toInt()
        "¥${price * 7}"
    }
    println(result3)  // Prices: ¥70, ¥140, ¥210

    // 替换第一个匹配
    val result4 = "aaa bbb aaa".replaceFirst(Regex("aaa"), "XXX")
    println(result4)  // XXX bbb aaa
}
```

### 分割字符串

```kotlin
fun splitDemo() {
    // 按正则分割
    val parts1 = "a,b;c:d".split(Regex("[,;:]"))
    println(parts1)  // [a, b, c, d]

    // 按多个空格分割
    val parts2 = "hello   world  kotlin".split(Regex("\\s+"))
    println(parts2)  // [hello, world, kotlin]

    // 限制分割次数
    val parts3 = "a,b,c,d".split(Regex(","), limit = 2)
    println(parts3)  // [a, b,c,d]
}
```

## 常见场景

### 验证用户输入

```kotlin
object InputValidator {
    // 验证手机号（中国大陆）
    fun isValidPhone(phone: String): Boolean {
        return phone.matches(Regex("""1[3-9]\d{9}"""))
    }

    // 验证邮箱
    fun isValidEmail(email: String): Boolean {
        return email.matches(Regex("""[\w.+-]+@[\w-]+\.[\w.]+"""))
    }

    // 验证身份证号（18位）
    fun isValidIdCard(id: String): Boolean {
        return id.matches(Regex("""\d{17}[\dXx]"""))
    }

    // 验证URL
    fun isValidUrl(url: String): Boolean {
        return url.matches(Regex("""https?://[\w.-]+(?:/[\w./-]*)?"""))
    }

    // 验证密码强度（至少8位，包含字母和数字）
    fun isStrongPassword(password: String): Boolean {
        return password.matches(Regex("""(?=.*[a-zA-Z])(?=.*\d).{8,}"""))
    }
}

fun main() {
    println(InputValidator.isValidPhone("13812345678"))  // true
    println(InputValidator.isValidEmail("test@example.com"))  // true
    println(InputValidator.isStrongPassword("abc12345"))  // true
}
```

### 从文本中提取数据

```kotlin
fun extractData() {
    val text = """
        订单号: ORD-20260614-001
        金额: 128.50元
        日期: 2026-06-14
        电话: 13812345678
    """.trimIndent()

    // 提取订单号
    val orderRegex = Regex("""ORD-\d{8}-\d{3}""")
    println("订单号: ${orderRegex.find(text)?.value}")

    // 提取金额
    val amountRegex = Regex("""(\d+\.?\d*)元""")
    println("金额: ${amountRegex.find(text)?.groupValues?.get(1)}")

    // 提取所有数字
    val numbers = Regex("""\d+""").findAll(text).map { it.value }.toList()
    println("所有数字: $numbers")
}
```

### 文本清洗

```kotlin
fun cleanText() {
    val dirty = "  Hello   World  \n\n  Kotlin  is   great!  "

    // 去除多余空白
    val cleaned = dirty.trim()
        .replace(Regex("\\s+"), " ")
    println(cleaned)  // Hello World Kotlin is great!

    // 去除 HTML 标签
    val html = "<p>Hello</p><b>World</b>"
    val plainText = html.replace(Regex("<[^>]+>"), "")
    println(plainText)  // HelloWorld

    // 去除特殊字符
    val special = "Hello!@# World$%^"
    val alphanumeric = special.replace(Regex("[^a-zA-Z0-9\\s]"), "")
    println(alphanumeric)  // Hello World
}
```

## 注意事项

- **使用原始字符串**：Kotlin 的 `""" """` 三引号字符串不需要转义反斜杠，写正则时更清晰
- **matches vs contains**：`matches()` 要求整个字符串匹配，`contains()` 只要有子串匹配即可
- **正则性能**：复杂的正则表达式可能导致回溯爆炸，对性能敏感的场景要测试
- **不要过度使用正则**：简单的字符串操作（如 `startsWith`、`split`）比正则更易读
- **贪婪 vs 非贪婪**：默认是贪婪匹配（尽可能多匹配），加 `?` 变为非贪婪（尽可能少匹配）

## 进阶用法

### 非贪婪匹配

```kotlin
fun nonGreedyDemo() {
    val html = "<div>内容1</div><div>内容2</div>"

    // 贪婪匹配：匹配尽可能多的内容
    val greedy = Regex("<div>.*</div>").find(html)?.value
    println(greedy)  // <div>内容1</div><div>内容2</div>（匹配了整个字符串）

    // 非贪婪匹配：匹配尽可能少的内容
    val nonGreedy = Regex("<div>.*?</div>").findAll(html).map { it.value }.toList()
    println(nonGreedy)  // [<div>内容1</div>, <div>内容2</div>]
}
```

### 正则选项

```kotlin
fun regexOptionsDemo() {
    // 忽略大小写
    val caseInsensitive = Regex("hello", RegexOption.IGNORE_CASE)
    println("HELLO".matches(caseInsensitive))  // true

    // 多行模式（^ 和 $ 匹配每行的开头和结尾）
    val multiline = Regex("""^Hello""", RegexOption.MULTILINE)
    println("World\nHello".contains(multiline))  // true

    // DOTALL 模式（. 也匹配换行符）
    val dotAll = Regex("a.b", RegexOption.DOT_MATCHES_ALL)
    println("a\nb".matches(dotAll))  // true
}
```

### 正则与协程

```kotlin
import kotlinx.coroutines.*

// 对大量文本并行执行正则匹配
suspend fun parallelRegexMatch(texts: List<String>, pattern: Regex): List<List<String>> {
    return coroutineScope {
        texts.map { text ->
            async(Dispatchers.Default) {
                pattern.findAll(text).map { it.value }.toList()
            }
        }.awaitAll()
    }
}
```
