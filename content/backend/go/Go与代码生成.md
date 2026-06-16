---
order: 73
title: Go与代码生成
module: go
category: Go
difficulty: intermediate
description: 'go generate与代码生成'
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与CGO
  - go/Go与Wasm
  - go/Go与依赖注入
  - go/Go与配置管理
prerequisites:
  - go/概述与环境配置
---

## 概述

代码生成是指通过工具自动生成源代码，而不是手动编写。Go 语言内置了 `go generate` 命令，配合特殊的注释指令，可以在构建前自动运行代码生成工具。这在生成重复性代码（如数据库查询、Mock 对象、序列化代码等）时非常有用，可以减少手写代码的工作量，同时保持类型安全。

## 基础概念

在开始编码之前，需要理解代码生成的几个核心概念：

- **go:generate 指令**：在 Go 源文件中添加 `//go:generate` 注释，后面跟要执行的命令。运行 `go generate` 时，Go 工具会扫描这些注释并执行对应命令。
- **代码生成器**：读取输入（如 Schema、接口定义等）并输出 Go 源代码的程序。
- **生成代码与手写代码分离**：生成的代码通常放在单独的文件中（如 `*_gen.go`、`mock/*.go`），避免与手写代码混淆。
- **构建前生成**：代码生成发生在编译之前，生成的代码会被正常编译到程序中。

## 快速上手

最简单的 go:generate 示例：

```go
package main

//go:generate echo "正在生成代码..."
//go:generate go run gen.go
//go:generate go build -o mytool gen_tool.go

func main() {
    // 业务代码
}
```

运行代码生成：

```bash
# 在当前目录执行所有 go:generate 指令
go generate ./...

# 在指定文件中执行
go generate main.go
```

## 详细用法

### 1. go:generate 指令语法

`//go:generate` 注释必须紧贴在行首（`//` 前不能有空格），后面跟任意 shell 命令：

```go
//go:generate go run github.com/sqlc-dev/sqlc/cmd/sqlc generate
//go:generate mockgen -source=service.go -destination=mock/service.go
//go:generate stringer -type=Status
```

可用的占位符：

```go
//go:generate go run $GOFILE          // 当前文件名
//go:generate go build -o $GOPATH/bin/tool . // GOPATH 环境变量
//go:generate go run . -input $GOFILE -output gen_$GOFILE
```

### 2. Stringer：为枚举生成 String 方法

Stringer 是 Go 官方提供的工具，为整型常量生成 `String()` 方法：

```go
package status

//go:generate stringer -type=Status

type Status int

const (
    StatusUnknown Status = iota
    StatusPending
    StatusActive
    StatusCompleted
    StatusFailed
)
```

运行 `go generate` 后，会生成 `status_string.go` 文件：

```go
// 自动生成的代码
func (Status) String() string {
    // 返回 "Unknown"、"Pending"、"Active" 等字符串
}
```

### 3. Mockgen：生成 Mock 对象

在单元测试中，需要模拟接口的行为。mockgen 可以为接口自动生成 Mock 实现：

```go
package service

//go:generate mockgen -source=service.go -destination=mock/service.go -package=mock

// 定义接口
type UserRepository interface {
    GetByID(ctx context.Context, id string) (*User, error)
    Create(ctx context.Context, user *User) error
    List(ctx context.Context) ([]*User, error)
}
```

运行 `go generate` 后，在 `mock/service.go` 中生成 Mock 实现：

```go
// 在测试中使用生成的 Mock
func TestGetUser(t *testing.T) {
    ctrl := gomock.NewController(t)
    defer ctrl.Finish()

    // 创建 Mock 对象
    mockRepo := mock.NewMockUserRepository(ctrl)

    // 设置期望：当调用 GetByID 时返回指定用户
    mockRepo.EXPECT().
        GetByID(gomock.Any(), "123").
        Return(&User{ID: "123", Name: "小明"}, nil)

    // 使用 Mock 对象测试
    svc := NewUserService(mockRepo)
    user, err := svc.GetByID(context.Background(), "123")
    assert.NoError(t, err)
    assert.Equal(t, "小明", user.Name)
}
```

### 4. sqlc：从 SQL 生成类型安全的代码

sqlc 根据 SQL 查询语句生成类型安全的 Go 代码，避免手写数据库操作：

```yaml
# sqlc.yaml
version: '2'
sql:
  - engine: 'postgresql'
    queries: 'queries/'
    schema: 'migrations/'
    gen:
      go:
        package: 'db'
        out: 'db'
```

编写 SQL 查询文件 `queries/users.sql`：

```sql
-- name: GetUser :one
SELECT * FROM users WHERE id = $1;

-- name: ListUsers :many
SELECT * FROM users ORDER BY name;

-- name: CreateUser :one
INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;
```

运行生成：

```go
//go:generate go run github.com/sqlc-dev/sqlc/cmd/sqlc generate
```

生成的代码可以直接使用：

```go
// 使用生成的代码查询数据库
user, err := queries.GetUser(ctx, "123")
users, err := queries.ListUsers(ctx)
createdUser, err := queries.CreateUser(ctx, db.CreateUserParams{
    Name:  "小明",
    Email: "ming@example.com",
})
```

### 5. Protobuf：生成 gRPC 代码

```go
//go:generate protoc --go_out=. --go-grpc_out=. api.proto
```

### 6. Wire：生成依赖注入代码

```go
//go:build wireinject
// +build wireinject

//go:generate wire gen ./...
```

### 7. 自定义代码生成器

可以编写自己的代码生成工具。以下是一个简单的示例，为结构体生成 Builder 模式代码：

```go
// gen/main.go - 代码生成器
package main

import (
    "fmt"
    "os"
    "reflect"
    "strings"
)

func main() {
    // 读取输入参数或解析源文件
    // 这里简化演示：为指定结构体生成 Builder

    structName := os.Args[1]
    fields := strings.Split(os.Args[2], ",")

    // 生成 Builder 代码
    var sb strings.Builder
    sb.WriteString("// Code generated; DO NOT EDIT.\n")
    sb.WriteString("package main\n\n")
    sb.WriteString(fmt.Sprintf("type %sBuilder struct {\n", structName))
    sb.WriteString(fmt.Sprintf("    obj *%s\n", structName))
    sb.WriteString("}\n\n")

    for _, field := range fields {
        parts := strings.SplitN(field, ":", 2)
        name, typ := parts[0], parts[1]
        sb.WriteString(fmt.Sprintf("func (b *%sBuilder) %s(v %s) *%sBuilder {\n",
            structName, name, typ, structName))
        sb.WriteString(fmt.Sprintf("    b.obj.%s = v\n", name))
        sb.WriteString("    return b\n")
        sb.WriteString("}\n\n")
    }

    fmt.Print(sb.String())
}
```

在源文件中使用：

```go
//go:generate go run gen/main.go User Name:string,Age:int,Email:string
```

## 常见场景

### 场景一：生成 CRUD 代码

为数据库模型自动生成增删改查代码：

```go
//go:generate go run github.com/xx/gencrud -type=User,Order,Product
```

### 场景二：生成 API 客户端

从 OpenAPI/Swagger 规范生成 HTTP 客户端代码：

```go
//go:generate go run github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen -package api api.yaml > api.gen.go
```

### 场景三：生成消息类型

从 Protobuf 定义生成 Go 结构体和序列化代码：

```go
//go:generate protoc --go_out=. --go_opt=paths=source_relative messages.proto
```

## 注意事项与常见错误

1. **注释格式**：`//go:generate` 前面不能有空格，`//` 和 `go:generate` 之间也不能有空格。这是 Go 编译器指令的通用规则。

2. **生成代码不要手动修改**：生成的文件通常带有 `DO NOT EDIT` 注释。手动修改会在下次生成时被覆盖。

3. **生成代码要提交到版本控制**：虽然生成代码可以随时重新生成，但提交到 Git 可以确保 `go build` 不依赖生成工具，CI 流程更简单。

4. **go generate 不会自动运行**：`go build` 和 `go test` 不会触发 `go generate`。需要显式运行 `go generate ./...`。

5. **生成顺序**：同一个文件中的 `go:generate` 指令按从上到下的顺序执行。不同文件之间的执行顺序不确定。

6. **错误处理**：如果某个 generate 命令失败，后续的命令不会执行。检查错误输出以定位问题。

## 进阶用法

### 条件生成

使用构建标签控制何时生成代码：

```go
//go:build generate

// +build generate

package main

// 这个文件只在 go generate 时编译
```

### 使用 Go AST 解析源码

编写更复杂的代码生成器时，可以使用 Go 的 AST 包解析源代码：

```go
import (
    "go/ast"
    "go/parser"
    "go/token"
)

func ParseStructs(filename string) {
    fset := token.NewFileSet()
    node, _ := parser.ParseFile(fset, filename, nil, parser.ParseComments)

    for _, decl := range node.Decls {
        genDecl, ok := decl.(*ast.GenDecl)
        if !ok {
            continue
        }
        for _, spec := range genDecl.Specs {
            typeSpec, ok := spec.(*ast.TypeSpec)
            if !ok {
                continue
            }
            structType, ok := typeSpec.Type.(*ast.StructType)
            if !ok {
                continue
            }
            // 遍历结构体字段
            for _, field := range structType.Fields.List {
                fmt.Printf("字段: %s, 类型: %v\n", field.Names[0].Name, field.Type)
            }
        }
    }
}
```

### Makefile 集成

将代码生成集成到构建流程中：

```makefile
.PHONY: generate build

generate:
	go generate ./...

build: generate
	go build -o bin/app .

test: generate
	go test ./...
```
