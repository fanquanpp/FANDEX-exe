---
order: 69
title: Go与JSON
module: go
category: Go
difficulty: beginner
description: encoding/json详解
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与数据库
  - go/Go与HTTP服务器
  - go/Go与HTTP客户端
  - go/Go与Redis
prerequisites:
  - go/概述与环境配置
---

## 概述

JSON（JavaScript Object Notation）是最常用的数据交换格式，Web API、配置文件、消息队列等场景广泛使用。Go 标准库的 `encoding/json` 包提供了完整的 JSON 编码和解码功能，可以将 Go 结构体与 JSON 之间互相转换。

## 基础概念

在开始编码之前，需要理解 JSON 操作的几个核心概念：

- **序列化（Marshal）**：将 Go 数据结构转换为 JSON 字符串。
- **反序列化（Unmarshal）**：将 JSON 字符串转换为 Go 数据结构。
- **结构体标签**：`json:"name"` 标签控制 JSON 字段名和行为。
- **编码器（Encoder）**：流式写入 JSON，适合处理大量数据。
- **解码器（Decoder）**：流式读取 JSON，适合从 HTTP 请求体等流中解析。

## 快速上手

最常用的 JSON 操作：

```go
package main

import (
    "encoding/json"
    "fmt"
)

type User struct {
    Name  string `json:"name"`
    Age   int    `json:"age"`
    Email string `json:"email,omitempty"` // omitempty: 零值时省略
}

func main() {
    // 序列化：结构体 -> JSON
    user := User{Name: "小明", Age: 25}
    data, _ := json.Marshal(user)
    fmt.Println(string(data)) // {"name":"小明","age":25}

    // 反序列化：JSON -> 结构体
    jsonStr := `{"name":"小红","age":22,"email":"hong@example.com"}`
    var user2 User
    json.Unmarshal([]byte(jsonStr), &user2)
    fmt.Printf("%+v\n", user2) // {Name:小红 Age:22 Email:hong@example.com}
}
```

## 详细用法

### 1. 结构体标签

`json` 标签控制字段的 JSON 行为：

```go
type Product struct {
    // 基本用法：指定 JSON 字段名
    Name string `json:"name"`

    // omitempty：零值（空字符串、0、nil）时省略该字段
    Description string `json:"description,omitempty"`

    // -：忽略该字段（不序列化也不反序列化）
    InternalID string `json:"-"`

    // ,-：序列化时忽略，但反序列化时可以填充
    TempField string `json:",omitempty"`

    // 不加标签：使用 Go 字段名（大写开头）
    Price float64

    // 字符串编码：将数字作为字符串输出
    ID int `json:"id,string"`
}
```

### 2. 基本类型序列化

```go
// 切片
nums := []int{1, 2, 3}
data, _ := json.Marshal(nums) // [1,2,3]

// Map
m := map[string]int{"apple": 5, "banana": 3}
data, _ := json.Marshal(m) // {"apple":5,"banana":3}

// 嵌套结构
type Address struct {
    City    string `json:"city"`
    Country string `json:"country"`
}

type Person struct {
    Name    string  `json:"name"`
    Address Address `json:"address"`
}

person := Person{
    Name:    "小明",
    Address: Address{City: "北京", Country: "中国"},
}
data, _ := json.Marshal(person)
// {"name":"小明","address":{"city":"北京","country":"中国"}}
```

### 3. 美化输出

```go
// 缩进格式输出
data, _ := json.MarshalIndent(user, "", "  ")
fmt.Println(string(data))
// {
//   "name": "小明",
//   "age": 25
// }
```

### 4. 处理未知结构

当 JSON 结构不确定时，使用 `map[string]interface{}`：

```go
jsonStr := `{"name":"小明","scores":{"math":95,"english":88}}`

var result map[string]interface{}
json.Unmarshal([]byte(jsonStr), &result)

name := result["name"].(string) // 类型断言
scores := result["scores"].(map[string]interface{})
math := scores["math"].(float64) // JSON 数字默认解析为 float64

fmt.Printf("姓名: %s, 数学: %.0f\n", name, math)
```

### 5. 流式编解码

处理 HTTP 请求/响应中的 JSON：

```go
// 编码：将结构体写入 io.Writer
func handleAPI(w http.ResponseWriter, r *http.Request) {
    users := []User{{Name: "小明"}, {Name: "小红"}}

    w.Header().Set("Content-Type", "application/json")
    enc := json.NewEncoder(w)
    enc.Encode(users) // 直接写入 ResponseWriter
}

// 解码：从 io.Reader 读取 JSON
func handlePost(w http.ResponseWriter, r *http.Request) {
    var user User
    dec := json.NewDecoder(r.Body)
    err := dec.Decode(&user)
    if err != nil {
        http.Error(w, "无效的 JSON", http.StatusBadRequest)
        return
    }
    fmt.Printf("收到用户: %+v\n", user)
}
```

### 6. 自定义序列化

实现 `json.Marshaler` 和 `json.Unmarshaler` 接口：

```go
type Time struct {
    time.Time
}

// 自定义序列化格式
func (t Time) MarshalJSON() ([]byte, error) {
    formatted := t.Format("2006-01-02 15:04:05")
    return json.Marshal(formatted)
}

// 自定义反序列化
func (t *Time) UnmarshalJSON(data []byte) error {
    var s string
    if err := json.Unmarshal(data, &s); err != nil {
        return err
    }
    parsed, err := time.Parse("2006-01-02 15:04:05", s)
    if err != nil {
        return err
    }
    t.Time = parsed
    return nil
}
```

### 7. 处理 JSON 数组

```go
// 解析 JSON 数组到切片
jsonStr := `[{"name":"小明","age":25},{"name":"小红","age":22}]`

var users []User
json.Unmarshal([]byte(jsonStr), &users)

for _, u := range users {
    fmt.Printf("%s: %d岁\n", u.Name, u.Age)
}
```

### 8. 动态 JSON

处理结构不确定的 JSON 数据：

```go
// 使用 json.RawMessage 延迟解析
type Event struct {
    Type string          `json:"type"`
    Data json.RawMessage `json:"data"` // 原始 JSON 字节
}

jsonStr := `{"type":"user_created","data":{"name":"小明"}}`

var event Event
json.Unmarshal([]byte(jsonStr), &event)

switch event.Type {
case "user_created":
    var user User
    json.Unmarshal(event.Data, &user)
case "order_created":
    var order Order
    json.Unmarshal(event.Data, &order)
}
```

## 常见场景

### 场景一：API 响应

```go
// 统一 API 响应格式
type APIResponse struct {
    Code    int         `json:"code"`
    Message string      `json:"message"`
    Data    interface{} `json:"data,omitempty"`
}

func WriteJSON(w http.ResponseWriter, code int, data interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(code)
    json.NewEncoder(w).Encode(APIResponse{
        Code:    code,
        Message: "success",
        Data:    data,
    })
}
```

### 场景二：配置文件

```go
type Config struct {
    Server   ServerConfig   `json:"server"`
    Database DatabaseConfig `json:"database"`
}

type ServerConfig struct {
    Port int    `json:"port"`
    Mode string `json:"mode"`
}

type DatabaseConfig struct {
    URL string `json:"url"`
}

func LoadConfig(path string) (*Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, err
    }
    var cfg Config
    if err := json.Unmarshal(data, &cfg); err != nil {
        return nil, err
    }
    return &cfg, nil
}
```

### 场景三：嵌套 JSON 解析

```go
type Order struct {
    ID     string  `json:"id"`
    Items  []Item  `json:"items"`
    Total  float64 `json:"total"`
}

type Item struct {
    Name  string  `json:"name"`
    Price float64 `json:"price"`
    Count int     `json:"count"`
}

jsonStr := `{
    "id": "ORD-001",
    "items": [
        {"name": "苹果", "price": 5.5, "count": 3},
        {"name": "香蕉", "price": 3.2, "count": 2}
    ],
    "total": 22.9
}`

var order Order
json.Unmarshal([]byte(jsonStr), &order)
```

## 注意事项与常见错误

1. **字段必须导出**：JSON 只能序列化导出的字段（大写字母开头）。小写开头的字段会被忽略。

2. **JSON 数字是 float64**：`interface{}` 解析 JSON 数字时，类型是 `float64`，不是 `int`。需要类型断言后转换。

3. **指针字段和零值**：如果需要区分"字段不存在"和"字段为零值"，使用指针类型：

```go
type User struct {
    Age *int `json:"age,omitempty"` // nil 表示未设置，0 表示年龄为0
}
```

4. **Unmarshal 必须传指针**：`json.Unmarshal(data, &user)`，必须传指针，否则无法修改值。

5. **循环引用**：结构体之间不能有循环引用，否则序列化时会无限递归导致栈溢出。

6. **HTML 安全**：`json.Marshal` 默认会转义 `<`、`>`、`&` 为 Unicode 转义序列。如果不需要转义，使用 `json.NewEncoder` 并设置 `SetEscapeHTML(false)`。

7. **时间格式**：`time.Time` 默认序列化为 RFC3339 格式。如果需要其他格式，实现自定义的 MarshalJSON。

## 进阶用法

### 第三方 JSON 库

标准库的 `encoding/json` 性能一般，高性能场景可以使用：

- **jsoniter**：兼容标准库，性能提升 2-3 倍
- ** sonic**：字节跳动开源，基于 JIT，性能极高
- **easyjson**：代码生成方式，零反射

```go
// jsoniter 用法（与标准库兼容）
import jsoniter "github.com/json-iterator/go"

var json = jsoniter.ConfigCompatibleWithStandardLibrary

data, _ := json.Marshal(user)
json.Unmarshal(data, &user2)
```

### json.Number

默认情况下 JSON 数字解析为 float64，可能丢失精度。使用 `json.Number` 保留原始数字：

```go
dec := json.NewDecoder(bytes.NewReader(data))
dec.UseNumber() // 启用 Number 模式

var result map[string]interface{}
dec.Decode(&result)

// 获取数字字符串
num := result["id"].(json.Number).String()
```
