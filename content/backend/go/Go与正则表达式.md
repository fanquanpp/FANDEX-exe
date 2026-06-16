---
order: 81
title: Go与正则表达式
module: go
category: Go
difficulty: intermediate
description: regexp包详解
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与信号处理
  - go/Go与文件监控
  - go/Go与时间
  - go/Go与JSON
prerequisites:
  - go/概述与环境配置
---

## 概述

正则表达式是一种描述字符串模式的工具，可以用来搜索、匹配、替换和验证文本。Go 标准库的 `regexp` 包实现了 RE2 语法，这是一种高效且安全正则表达式引擎，保证了线性时间复杂度，不会出现回溯爆炸的问题。

## 基础概念

在开始编码之前，需要了解正则表达式的几个核心概念：

- **模式（Pattern）**：用特殊语法描述的字符串规则，比如 `\d+` 匹配一个或多个数字。
- **匹配（Match）**：检查字符串是否符合某个模式。
- **捕获组（Capture Group）**：用括号 `()` 包裹的子模式，可以单独提取匹配的部分。
- **元字符**：有特殊含义的字符，如 `.`（任意字符）、`*`（零次或多次）、`+`（一次或多次）。
- **字符类**：用 `[]` 定义一组可选字符，如 `[a-z]` 匹配小写字母。
- **锚点**：`^` 匹配开头，`$` 匹配结尾。

Go 的 regexp 包使用 RE2 语法，不支持反向引用和零宽断言等 Perl 风格特性，但保证了执行时间的可预测性。

## 快速上手

最简单的正则匹配示例：

```go
package main

import (
    "fmt"
    "regexp"
)

func main() {
    // 编译正则表达式（建议使用 MustCompile，程序启动时就能发现语法错误）
    re := regexp.MustCompile(`\d{4}-\d{2}-\d{2}`)

    // 判断字符串是否匹配
    fmt.Println(re.MatchString("今天是 2026-06-14")) // true

    // 查找第一个匹配
    match := re.FindString("日期: 2026-06-14，时间: 10:30")
    fmt.Println(match) // 2026-06-14
}
```

## 详细用法

### 1. 编译正则表达式

Go 提供两种编译方式：

```go
// Compile：编译失败时返回错误
re, err := regexp.Compile(`\d+`)
if err != nil {
    // 处理编译错误
}

// MustCompile：编译失败时直接 panic，适合全局变量初始化
var datePattern = regexp.MustCompile(`\d{4}-\d{2}-\d{2}`)
```

推荐在全局变量中使用 `MustCompile`，这样程序启动时就能发现正则语法错误，而不是在运行时才报错。

### 2. 匹配判断

检查字符串是否包含匹配内容：

```go
re := regexp.MustCompile(`golang`)

// 判断是否匹配
re.MatchString("I love golang")  // true
re.MatchString("I love python")  // false

// 匹配字节切片
re.Match([]byte("I love golang")) // true

// 判断整个字符串是否匹配（类似 ^...$）
re2 := regexp.MustCompile(`^\d+$`)
re2.MatchString("12345")   // true，全是数字
re2.MatchString("12a45")   // false，包含非数字
```

### 3. 查找匹配

```go
re := regexp.MustCompile(`\d+`)

// 查找第一个匹配
re.FindString("abc 123 def 456")       // "123"

// 查找所有匹配
re.FindAllString("abc 123 def 456", -1) // ["123", "456"]
// 第二个参数限制匹配数量，-1 表示全部

// 查找匹配的索引位置
loc := re.FindStringIndex("abc 123 def")
// loc = [4, 7]，表示匹配在 [4,7) 位置

// 查找所有匹配的索引
locs := re.FindAllStringIndex("abc 123 def 456", -1)
// locs = [[4,7], [12,15]]
```

### 4. 捕获组

用括号 `()` 提取匹配的子部分：

```go
// 提取日期的年、月、日
re := regexp.MustCompile(`(\d{4})-(\d{2})-(\d{2})`)

// FindStringSubmatch 返回完整匹配和各捕获组
groups := re.FindStringSubmatch("日期: 2026-06-14")
// groups[0] = "2026-06-14"  完整匹配
// groups[1] = "2026"        第一个捕获组（年）
// groups[2] = "06"          第二个捕获组（月）
// groups[3] = "14"          第三个捕获组（日）

fmt.Printf("年: %s, 月: %s, 日: %s\n", groups[1], groups[2], groups[3])

// 命名捕获组
re2 := regexp.MustCompile(`(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})`)
match := re2.FindStringSubmatch("2026-06-14")

// 获取命名捕获组的索引
yearIdx := re2.SubexpIndex("year")
fmt.Println("年:", match[yearIdx]) // 年: 2026
```

### 5. 替换

```go
re := regexp.MustCompile(`\d{4}-\d{2}-\d{2}`)

// 简单替换
result := re.ReplaceAllString("日期: 2026-06-14", "YYYY-MM-DD")
// result = "日期: YYYY-MM-DD"

// 使用捕获组进行替换
re2 := regexp.MustCompile(`(\w+)@(\w+)\.(\w+)`)
result2 := re2.ReplaceAllString("邮箱: user@example.com", "域名: $2.$3")
// result2 = "邮箱: 域名: example.com"

// 使用函数进行替换
re3 := regexp.MustCompile(`\d+`)
result3 := re3.ReplaceAllStringFunc("价格: 100 元，数量: 5", func(match string) string {
    num, _ := strconv.Atoi(match)
    return fmt.Sprintf("%d", num*2) // 数字翻倍
})
// result3 = "价格: 200 元，数量: 10"
```

### 6. 分割字符串

```go
re := regexp.MustCompile(`[,;，；]`) // 支持中英文逗号和分号

parts := re.Split("苹果,香蕉;橙子，葡萄；西瓜", -1)
// parts = ["苹果", "香蕉", "橙子", "葡萄", "西瓜"]
// -1 表示分割所有，正数表示最多分割几次
```

### 7. 常用正则模式

```go
// 匹配邮箱
var emailPattern = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

// 匹配手机号（中国大陆）
var phonePattern = regexp.MustCompile(`^1[3-9]\d{9}$`)

// 匹配 URL
var urlPattern = regexp.MustCompile(`https?://[^\s]+`)

// 匹配 IP 地址
var ipPattern = regexp.MustCompile(`\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}`)

// 匹配中文字符
var chinesePattern = regexp.MustCompile(`[\p{Han}]+`)

// 匹配十六进制颜色
var hexColorPattern = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)
```

## 常见场景

### 场景一：表单验证

```go
func ValidateEmail(email string) bool {
    pattern := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
    return pattern.MatchString(email)
}

func ValidatePhone(phone string) bool {
    pattern := regexp.MustCompile(`^1[3-9]\d{9}$`)
    return pattern.MatchString(phone)
}

// 使用
if !ValidateEmail("user@example.com") {
    fmt.Println("邮箱格式不正确")
}
```

### 场景二：提取日志信息

```go
// 从日志行中提取时间、级别和消息
logLine := `[2026-06-14 10:30:45] [ERROR] 连接数据库失败: timeout`

re := regexp.MustCompile(`\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] \[(\w+)\] (.+)`)
groups := re.FindStringSubmatch(logLine)
if len(groups) == 4 {
    timestamp := groups[1] // 2026-06-14 10:30:45
    level := groups[2]     // ERROR
    message := groups[3]   // 连接数据库失败: timeout
    fmt.Printf("时间: %s, 级别: %s, 消息: %s\n", timestamp, level, message)
}
```

### 场景三：文本清洗

```go
// 移除 HTML 标签
re := regexp.MustCompile(`<[^>]+>`)
cleanText := re.ReplaceAllString("<p>你好</p><b>世界</b>", "")
// cleanText = "你好世界"

// 移除多余空白
re2 := regexp.MustCompile(`\s+`)
cleanText2 := re2.ReplaceAllString("你好   世界  Go", " ")
// cleanText2 = "你好 世界 Go"
```

### 场景四：配置文件解析

```go
// 解析 key=value 格式的配置
config := `
host=localhost
port=8080
debug=true
`

re := regexp.MustCompile(`(\w+)=(.+)`)
matches := re.FindAllStringSubmatch(config, -1)
for _, m := range matches {
    key := m[1]
    value := m[2]
    fmt.Printf("%s = %s\n", key, value)
}
```

## 注意事项与常见错误

1. **反斜杠转义**：Go 的字符串中反斜杠是转义字符，正则表达式中的 `\d` 需要写成 `"\\d"` 或使用反引号 `` `\d` ``。推荐始终使用反引号。

2. **正则编译开销**：编译正则表达式有一定开销，不要在循环或函数内重复编译。应该编译一次，全局复用：

```go
// 正确：全局编译一次
var pattern = regexp.MustCompile(`\d+`)

func process(s string) {
    pattern.FindString(s) // 复用已编译的正则
}

// 错误：每次调用都编译
func process(s string) {
    re := regexp.MustCompile(`\d+`) // 不要这样做
    re.FindString(s)
}
```

3. **regexp.MustCompile 会 panic**：如果正则语法有误，`MustCompile` 会直接 panic。只在初始化阶段使用，不要用在可能接收用户输入正则的场景。

4. **贪婪与非贪婪**：默认是贪婪匹配（匹配尽可能多的字符），加 `?` 变为非贪婪：

```go
re := regexp.MustCompile(`a.*b`)   // 贪婪：匹配从第一个a到最后一个b
re2 := regexp.MustCompile(`a.*?b`) // 非贪婪：匹配从第一个a到最近的b
```

5. **不支持反向引用**：Go 的 regexp 不支持 `\1` 反向引用。如果需要匹配 HTML 标签对这类需求，需要换用其他方法。

6. **字符类中的特殊位置**：在 `[]` 中，`^` 放在开头表示取反，`-` 放在开头或结尾表示字面量：

```go
regexp.MustCompile(`[^abc]`)  // 匹配非 a/b/c 的字符
regexp.MustCompile(`[-abc]`)  // 匹配 - 或 a 或 b 或 c
```

## 进阶用法

### ReplaceAllStringFunc 与捕获组结合

如果替换时需要引用捕获组，可以使用 `ReplaceAllFunc` 配合 `FindSubmatch`：

```go
re := regexp.MustCompile(`(\w+)=(\w+)`)
input := "name=alice age=30"

result := re.ReplaceAllStringFunc(input, func(match string) string {
    parts := re.FindStringSubmatch(match)
    return fmt.Sprintf("%s:%s", parts[1], parts[2])
})
// result = "name:alice age:30"
```

### 匹配 Unicode

Go 的 regexp 支持 Unicode 类别：

```go
// 匹配中文字符
re := regexp.MustCompile(`\p{Han}+`)
re.FindAllString("Hello 你好 World 世界", -1) // ["你好", "世界"]

// 匹配字母（包括 Unicode 字母）
re2 := regexp.MustCompile(`\p{L}+`)

// 匹配数字（包括 Unicode 数字）
re3 := regexp.MustCompile(`\p{N}+`)
```

### Longest 匹配

默认情况下 regexp 返回最左匹配。如果需要最长匹配：

```go
re := regexp.MustCompile(`a|ab|abc`)
re.FindString("abc") // "a"，默认返回最左匹配

re.Longest()
re.FindString("abc") // "abc"，返回最长匹配
```
