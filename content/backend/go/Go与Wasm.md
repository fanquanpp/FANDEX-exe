---
order: 72
title: Go与Wasm
module: go
category: Go
difficulty: advanced
description: WebAssembly开发
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与CGO
  - go/Go与代码生成
  - go/Go与性能分析
  - go/Go与Fuzzing
prerequisites:
  - go/概述与环境配置
---

## 概述

WebAssembly（Wasm）是一种可以在浏览器中运行的低级字节码格式。Go 1.11 开始支持将 Go 程序编译为 WebAssembly，让 Go 代码直接在浏览器中执行。这为服务端逻辑复用到前端、计算密集型任务的浏览器端执行提供了可能。

## 基础概念

在开始编码之前，需要理解 WebAssembly 的几个核心概念：

- **Wasm 模块**：编译后的二进制文件（.wasm），可以在浏览器中加载和执行。
- **JavaScript 桥接**：Go Wasm 通过 `syscall/js` 包与 JavaScript 交互，可以调用 JS 函数、操作 DOM。
- **wasm_exec.js**：Go 官方提供的 JavaScript 加载器，负责在浏览器中加载和运行 Wasm 模块。
- **线性内存**：Wasm 使用线性内存模型，Go 和 JavaScript 通过共享内存交换数据。

## 快速上手

### 1. 编写 Go Wasm 程序

```go
package main

import (
    "fmt"
    "syscall/js"
)

func main() {
    // 等待 JavaScript 桥接就绪
    c := make(chan struct{}, 0)

    // 注册一个 JavaScript 可调用的函数
    js.Global().Set("greet", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        name := args[0].String()
        greeting := fmt.Sprintf("你好，%s！来自 Go Wasm", name)
        return greeting
    }))

    fmt.Println("Go Wasm 已加载")

    // 保持程序运行
    <-c
}
```

### 2. 编译为 Wasm

```bash
# 编译为 WebAssembly
GOOS=js GOARCH=wasm go build -o main.wasm main.go

# Windows PowerShell
$env:GOOS="js"; $env:GOARCH="wasm"; go build -o main.wasm main.go
```

### 3. 创建 HTML 页面

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Go Wasm 示例</title>
  </head>
  <body>
    <h1>Go WebAssembly 示例</h1>
    <input id="name" placeholder="输入名字" />
    <button onclick="sayHello()">打招呼</button>
    <p id="result"></p>

    <!-- 加载 wasm_exec.js -->
    <script src="wasm_exec.js"></script>
    <script>
      const go = new Go();
      WebAssembly.instantiateStreaming(fetch('main.wasm'), go.importObject).then((result) => {
        go.run(result.instance);
      });

      function sayHello() {
        const name = document.getElementById('name').value;
        const result = greet(name); // 调用 Go 注册的函数
        document.getElementById('result').textContent = result;
      }
    </script>
  </body>
</html>
```

### 4. 复制 wasm_exec.js

```bash
# 复制 Go 自带的 wasm_exec.js 到项目目录
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .
```

### 5. 启动 HTTP 服务器

```bash
# 需要通过 HTTP 服务器访问（不能直接打开 HTML 文件）
go run github.com/traefik/traefik@latest
# 或简单方式
python -m http.server 8080
```

## 详细用法

### 1. 操作 DOM

```go
func manipulateDOM() {
    document := js.Global().Get("document")

    // 获取元素
    element := document.Call("getElementById", "myDiv")

    // 修改内容
    element.Set("innerHTML", "<b>来自 Go 的内容</b>")

    // 修改样式
    style := element.Get("style")
    style.Set("color", "red")
    style.Set("fontSize", "20px")

    // 添加 CSS 类
    element.Get("classList").Call("add", "highlight")

    // 创建新元素
    newElement := document.Call("createElement", "p")
    newElement.Set("textContent", "新段落")
    document.Get("body").Call("appendChild", newElement)
}
```

### 2. 处理事件

```go
func setupEventListener() {
    document := js.Global().Get("document")
    button := document.Call("getElementById", "myButton")

    // 添加点击事件
    button.Call("addEventListener", "click", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        event := args[0]
        fmt.Println("按钮被点击了")
        event.Call("preventDefault") // 阻止默认行为
        return nil
    }))
}
```

### 3. 调用 JavaScript 函数

```go
func callJavaScript() {
    // 调用全局函数
    alert := js.Global().Get("alert")
    alert.Invoke("来自 Go 的消息")

    // 调用 console.log
    console := js.Global().Get("console")
    console.Call("log", "调试信息")

    // 调用 fetch 发起 HTTP 请求
    fetch := js.Global().Get("fetch")
    response := fetch.Invoke("https://api.example.com/data")
    // 注意：fetch 返回 Promise，需要异步处理
}
```

### 4. 处理 Promise

```go
func fetchData(url string) {
    js.Global().Get("fetch").Invoke(url).Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        response := args[0]
        return response.Call("json")
    })).Call("then", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        data := args[0]
        fmt.Println("收到数据:", data.String())
        return nil
    })).Call("catch", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        err := args[0]
        fmt.Println("请求失败:", err.String())
        return nil
    }))
}
```

### 5. 传递复杂数据

```go
func passComplexData() {
    // 创建 JavaScript 对象
    obj := js.Global().Get("Object").New()
    obj.Set("name", "小明")
    obj.Set("age", 25)

    // 创建数组
    arr := js.Global().Get("Array").New()
    arr.Call("push", "苹果")
    arr.Call("push", "香蕉")

    obj.Set("fruits", arr)

    // 读取 JavaScript 对象
    name := obj.Get("name").String()
    length := arr.Get("length").Int()
}
```

### 6. 注册多个函数

```go
func registerFunctions() {
    js.Global().Set("add", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        a := args[0].Int()
        b := args[1].Int()
        return a + b
    }))

    js.Global().Set("toUpperCase", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        s := args[0].String()
        return strings.ToUpper(s)
    }))

    js.Global().Set("processArray", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
        arr := args[0]
        length := arr.Get("length").Int()
        var sum int
        for i := 0; i < length; i++ {
            sum += arr.Index(i).Int()
        }
        return sum
    }))
}
```

## 常见场景

### 场景一：浏览器端计算

将计算密集型任务放到浏览器端执行：

```go
js.Global().Set("fibonacci", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
    n := args[0].Int()
    return fibonacci(n)
}))

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}
```

### 场景二：图片处理

在浏览器端处理图片：

```go
func processImage() {
    canvas := js.Global().Get("document").Call("getElementById", "myCanvas")
    ctx := canvas.Call("getContext", "2d")
    imageData := ctx.Call("getImageData", 0, 0, canvas.Get("width"), canvas.Get("height"))
    data := imageData.Get("data")

    // 处理像素数据
    length := data.Get("length").Int()
    for i := 0; i < length; i += 4 {
        r := data.Index(i).Int()
        g := data.Index(i + 1).Int()
        b := data.Index(i + 2).Int()
        // 转灰度
        gray := (r + g + b) / 3
        data.SetIndex(i, gray)
        data.SetIndex(i+1, gray)
        data.SetIndex(i+2, gray)
    }

    ctx.Call("putImageData", imageData, 0, 0)
}
```

## 注意事项与常见错误

1. **二进制体积大**：Go Wasm 的二进制文件通常有几 MB，因为包含了 Go 运行时。可以使用 TinyGo 减小体积。

2. **不支持所有 Go 特性**：Wasm 模式下不支持网络监听（net.Listen）、文件系统等需要操作系统的功能。

3. **必须保持程序运行**：Go Wasm 程序的 main 函数退出后，注册的函数将不可用。使用 channel 阻塞 main 函数。

4. **js.FuncOf 不会被 GC**：注册的 JavaScript 函数不会被 Go 的垃圾回收器回收。如果需要释放，调用函数的 `Release()` 方法。

5. **类型转换**：Go 和 JavaScript 之间的类型转换需要小心。JavaScript 的 number 对应 Go 的 int/float64，string 对应 Go 的 string。

6. **并发限制**：Wasm 目前不支持多线程。Go 的 goroutine 在 Wasm 中是协作式调度。

## 进阶用法

### TinyGo

TinyGo 是 Go 的子集编译器，生成的 Wasm 体积更小：

```bash
# 安装 TinyGo
# 编译
tinygo build -o main.wasm -target wasm main.go
```

### Wasm 以外：WASI

WebAssembly System Interface（WASI）允许 Wasm 在浏览器外运行：

```bash
# 编译为 WASI
GOOS=wasip1 GOARCH=wasm go build -o main.wasm main.go

# 使用 Wasmtime 运行
wasmtime main.wasm
```
