---
order: 70
title: Go与Fuzzing
module: go
category: Go
difficulty: intermediate
description: 模糊测试
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与CGO
  - go/Go与性能分析
  - go/Go与代码生成
  - go/Go与Wasm
prerequisites:
  - go/概述与环境配置
---

## 概述

模糊测试（Fuzzing）是一种自动化测试技术，通过向程序输入大量随机或变异的数据，发现潜在的崩溃、内存泄漏和安全漏洞。Go 1.18 原生支持模糊测试，无需第三方工具即可编写和运行 Fuzz 测试。

## 基础概念

在开始编码之前，需要理解模糊测试的几个核心概念：

- **Fuzz 目标（Fuzz Target）**：一个以 `Fuzz` 前缀命名的函数，接收 `*testing.F` 参数，定义了要测试的函数和输入类型。
- **种子语料（Seed Corpus）**：开发者提供的初始输入数据，Fuzzing 引擎基于这些数据生成变体。
- **语料缓存（Corpus）**：Fuzzing 过程中生成的有效输入会被缓存，下次运行时复用。
- **覆盖率引导**：Go Fuzzing 使用覆盖率信息指导输入生成，优先探索未覆盖的代码路径。

## 快速上手

最简单的模糊测试：

```go
// parser_test.go
package parser

import (
    "testing"
    "unicode/utf8"
)

// 被测试的函数
func Reverse(s string) string {
    runes := []rune(s)
    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
        runes[i], runes[j] = runes[j], runes[i]
    }
    return string(runes)
}

// 模糊测试函数
func FuzzReverse(f *testing.F) {
    // 添加种子语料
    f.Add("hello")
    f.Add("世界")
    f.Add("")

    // 定义模糊测试逻辑
    f.Fuzz(func(t *testing.T, original string) {
        // 反转两次应该得到原始字符串
        reversed := Reverse(original)
        doubleReversed := Reverse(reversed)

        if doubleReversed != original {
            t.Errorf("Reverse(Reverse(%q)) = %q, 期望 %q", original, doubleReversed, original)
        }

        // 反转后的字符串长度应该相同
        if utf8.RuneCountInString(reversed) != utf8.RuneCountInString(original) {
            t.Errorf("反转后长度不同: %d vs %d", utf8.RuneCountInString(reversed), utf8.RuneCountInString(original))
        }
    })
}
```

运行模糊测试：

```bash
# 运行模糊测试（会持续运行直到发现问题或手动停止）
go test -fuzz=FuzzReverse

# 运行指定时间
go test -fuzz=FuzzReverse -fuzztime=30s

# 运行模糊测试和普通测试
go test -fuzz=. -run=^$
```

## 详细用法

### 1. 支持的输入类型

Fuzz 目标函数的参数支持以下类型：

```go
// 单个参数
func FuzzParseInt(f *testing.F) {
    f.Fuzz(func(t *testing.T, input string) {
        _, _ = strconv.Atoi(input)
    })
}

// 多个参数
func FuzzAdd(f *testing.F) {
    f.Add(1, 2)
    f.Fuzz(func(t *testing.T, a, b int) {
        result := Add(a, b)
        if result != a+b {
            t.Errorf("Add(%d, %d) = %d", a, b, result)
        }
    })
}

// 支持的类型：string, []byte, int, int8, int16, int32, int64,
// uint, uint8, uint16, uint32, uint64, float32, float64, bool
```

### 2. 添加种子语料

```go
func FuzzJSON(f *testing.F) {
    // 添加单个种子
    f.Add(`{"name": "test"}`)
    f.Add(`{"age": 25}`)
    f.Add(`invalid json`)

    // 从文件添加种子语料
    // 将文件放在 testdata/fuzz/FuzzJSON/ 目录下

    f.Fuzz(func(t *testing.T, input string) {
        var result map[string]interface{}
        json.Unmarshal([]byte(input), &result)
    })
}
```

### 3. 字节切片输入

```go
func FuzzParse(f *testing.F) {
    f.Add([]byte("hello"))
    f.Add([]byte(""))

    f.Fuzz(func(t *testing.T, data []byte) {
        // 测试解析函数是否能处理任意输入而不崩溃
        _, err := Parse(data)
        // 不检查结果，只确保不 panic
        _ = err
    })
}
```

### 4. 发现问题后的处理

当 Fuzz 测试发现问题时，Go 会自动保存导致问题的输入：

```bash
# 发现问题后，输入会保存到 testdata/fuzz/FuzzReverse/ 目录
# 例如：testdata/fuzz/FuzzReverse/abc123

# 重新运行失败的测试
go test -run=FuzzReverse

# 查看失败输入
cat testdata/fuzz/FuzzReverse/abc123
```

失败输入文件格式：

```
go test fuzz v1
string("无效的输入数据")
```

### 5. 结合表驱动测试

```go
func FuzzParseURL(f *testing.F) {
    // 种子语料
    seeds := []string{
        "https://example.com",
        "http://localhost:8080/path?q=1",
        "ftp://server/file",
    }
    for _, seed := range seeds {
        f.Add(seed)
    }

    f.Fuzz(func(t *testing.T, rawURL string) {
        u, err := url.Parse(rawURL)
        if err != nil {
            return // 无效 URL，跳过
        }
        // 验证解析结果可以重新序列化
        if u.String() == "" && rawURL != "" {
            t.Errorf("解析后为空: %q", rawURL)
        }
    })
}
```

## 常见场景

### 场景一：测试解析函数

```go
func FuzzParseConfig(f *testing.F) {
    f.Add("key=value\n")
    f.Add("# comment\nkey=value\n")
    f.Add("")

    f.Fuzz(func(t *testing.T, input string) {
        _, err := ParseConfig(strings.NewReader(input))
        // 只确保不 panic，不检查结果
        _ = err
    })
}
```

### 场景二：测试编码/解码

```go
func FuzzBase64(f *testing.F) {
    f.Add("hello")
    f.Add("SGVsbG8gV29ybGQ=")

    f.Fuzz(func(t *testing.T, input string) {
        encoded := base64.StdEncoding.EncodeToString([]byte(input))
        decoded, err := base64.StdEncoding.DecodeString(encoded)
        if err != nil {
            t.Fatalf("解码失败: %v", err)
        }
        if string(decoded) != input {
            t.Errorf("编解码不一致: %q != %q", decoded, input)
        }
    })
}
```

### 场景三：测试字符串处理

```go
func FuzzStringOps(f *testing.F) {
    f.Add("hello world")

    f.Fuzz(func(t *testing.T, s string) {
        // Split + Join 应该保持一致
        parts := strings.Split(s, ",")
        joined := strings.Join(parts, ",")
        if joined != s {
            t.Errorf("Split/Join 不一致: %q", s)
        }
    })
}
```

## 注意事项与常见错误

1. **Fuzz 函数命名**：必须以 `Fuzz` 开头，参数为 `*testing.F`。普通测试以 `Test` 开头，参数为 `*testing.T`。

2. **Fuzz 函数不能在 Test 函数内**：Fuzz 函数是顶层函数，不能嵌套。

3. **种子语料要覆盖边界情况**：空字符串、特殊字符、超长输入等。

4. **不要在 Fuzz 中测试精确结果**：Fuzz 适合发现崩溃和 panic，不适合验证精确的业务逻辑。

5. **运行时间**：Fuzz 测试默认无限运行。使用 `-fuzztime` 限制时间，或在 CI 中设置合理的时间。

6. **语料文件要提交到版本控制**：`testdata/fuzz/` 下的文件应该提交到 Git，确保失败的测试可以重现。

7. **参数数量限制**：Fuzz 函数最多支持 9 个参数（除 `*testing.T` 外）。

## 进阶用法

### 自定义 Fuzz 值生成

```go
func FuzzCustomType(f *testing.F) {
    f.Fuzz(func(t *testing.T, age int, name string) {
        // 组合多个参数构造复杂输入
        user := User{Age: age, Name: name}
        data, err := json.Marshal(user)
        if err != nil {
            return
        }
        var decoded User
        if err := json.Unmarshal(data, &decoded); err != nil {
            t.Errorf("反序列化失败: %v", err)
        }
    })
}
```

### 与持续集成集成

```yaml
# GitHub Actions
- name: Fuzz Test
  run: go test -fuzz=. -fuzztime=60s ./...
```

### 检测 Panic

Fuzz 测试会自动检测 panic。如果被测函数可能 panic，Fuzz 会捕获并报告：

```go
func FuzzAccessSlice(f *testing.F) {
    f.Add([]int{1, 2, 3}, 0)

    f.Fuzz(func(t *testing.T, slice []int, index int) {
        // Fuzz 会自动检测越界 panic
        if index >= 0 && index < len(slice) {
            _ = slice[index]
        }
    })
}
```
