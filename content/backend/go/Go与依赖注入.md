---
order: 74
title: Go与依赖注入
module: go
category: Go
difficulty: intermediate
description: Wire与依赖注入
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与配置管理
  - go/Go与代码生成
  - go/Go与日志
  - go/Go与模板
prerequisites:
  - go/概述与环境配置
---

## 概述

依赖注入（Dependency Injection，DI）是一种设计模式，将组件所依赖的对象从外部传入，而非在组件内部创建。这样做的好处是降低耦合、方便测试和替换实现。Go 社区中，Google 的 Wire 是最流行的编译时依赖注入工具，它通过代码生成在编译期完成依赖注入，没有运行时反射开销。

## 基础概念

在开始编码之前，需要理解依赖注入的几个核心概念：

- **依赖**：一个组件需要使用的其他组件。如 UserService 依赖 UserRepository。
- **注入**：将依赖从外部传入，而非在组件内部 new 出来。
- **Provider**：提供依赖的函数，负责创建某个类型的实例。
- **Injector**：注入器，将所有 Provider 组装起来，生成最终的初始化代码。
- **编译时注入 vs 运行时注入**：Wire 在编译时生成代码，没有反射开销；其他框架（如 dig）在运行时通过反射注入。

## 快速上手

### 手动依赖注入

不使用任何框架，手动注入依赖：

```go
package main

// 定义接口
type UserRepository interface {
    GetByID(id string) (*User, error)
}

// 定义服务，依赖 UserRepository
type UserService struct {
    repo UserRepository // 依赖从外部注入
}

// 构造函数，接收依赖
func NewUserService(repo UserRepository) *UserService {
    return &UserService{repo: repo}
}

// 具体实现
type PostgresUserRepo struct {
    db *sql.DB
}

func NewPostgresUserRepo(db *sql.DB) *PostgresUserRepo {
    return &PostgresUserRepo{db: db}
}

func (r *PostgresUserRepo) GetByID(id string) (*User, error) {
    // 数据库查询...
    return &User{ID: id, Name: "小明"}, nil
}

func main() {
    // 手动组装依赖
    db := connectDB()
    repo := NewPostgresUserRepo(db)       // 创建依赖
    service := NewUserService(repo)        // 注入依赖
    _ = service
}
```

### 使用 Wire

```bash
go get github.com/google/wire/cmd/wire@latest
```

```go
// wire.go - 定义依赖注入配置
//go:build wireinject
// +build wireinject

package main

import "github.com/google/wire"

func InitializeApp() *App {
    wire.Build(
        NewPostgresDB,       // 提供 *sql.DB
        NewPostgresUserRepo, // 提供 *PostgresUserRepo（实现 UserRepository）
        wire.Bind(new(UserRepository), new(*PostgresUserRepo)), // 绑定接口到实现
        NewUserService,      // 提供 *UserService
        NewApp,              // 提供 *App
    )
    return nil // Wire 会替换这个函数体
}
```

```go
// app.go - 业务代码
package main

type App struct {
    userService *UserService
}

func NewApp(userService *UserService) *App {
    return &App{userService: userService}
}

func (a *App) Run() {
    user, _ := a.userService.GetByID("123")
    fmt.Printf("用户: %s\n", user.Name)
}
```

运行 Wire 生成代码：

```bash
wire
```

Wire 会生成 `wire_gen.go` 文件，包含实际的初始化代码。

## 详细用法

### 1. Provider

Provider 是普通的 Go 函数，返回需要注入的类型：

```go
// 简单 Provider
func NewConfig() *Config {
    return &Config{Port: 8080}
}

// 带依赖的 Provider
func NewServer(config *Config, handler http.Handler) *http.Server {
    return &http.Server{Addr: config.Addr, Handler: handler}
}

// 命名 Provider（同类型多个实例）
func NewPrimaryDB(config *Config) *sql.DB { /* ... */ }
func NewReplicaDB(config *Config) *sql.DB { /* ... */ }
```

### 2. 接口绑定

将接口绑定到具体实现：

```go
wire.Build(
    NewPostgresUserRepo,
    wire.Bind(new(UserRepository), new(*PostgresUserRepo)),
)
```

### 3. 命名注入

当有多个同类型的 Provider 时，使用 `wire.FieldsOf` 或 `wire.Value`：

```go
type DBConfig struct {
    PrimaryDSN string
    ReplicaDSN string
}

// 使用 wire.Value 注入常量
wire.Build(
    wire.Value(Config{Port: 8080}),
)

// 使用 wire.FieldsOf 注入结构体字段
wire.Build(
    NewDBConfig,
    wire.FieldsOf(new(*DBConfig), "PrimaryDSN"),
    wire.FieldsOf(new(*DBConfig), "ReplicaDSN"),
)
```

### 4. Provider Set

将相关的 Provider 组织成集合：

```go
// user_set.go
var UserSet = wire.NewSet(
    NewPostgresUserRepo,
    wire.Bind(new(UserRepository), new(*PostgresUserRepo)),
    NewUserService,
)

// server_set.go
var ServerSet = wire.NewSet(
    NewConfig,
    NewRouter,
    NewServer,
)

// wire.go
func InitializeApp() *App {
    wire.Build(
        UserSet,
        ServerSet,
        NewApp,
    )
    return nil
}
```

### 5. 清理函数

Provider 可以返回清理函数：

```go
func NewDB(config *Config) (*sql.DB, func(), error) {
    db, err := sql.Open("postgres", config.DSN)
    if err != nil {
        return nil, nil, err
    }
    cleanup := func() {
        db.Close()
    }
    return db, cleanup, nil
}

// Wire 生成的代码会收集所有清理函数
// 调用方可以统一执行清理
app, cleanup, err := InitializeApp()
defer cleanup()
```

### 6. Mock 测试

依赖注入最大的好处是方便测试：

```go
// Mock 实现
type MockUserRepo struct {
    Users map[string]*User
}

func (m *MockUserRepo) GetByID(id string) (*User, error) {
    return m.Users[id], nil
}

// 测试时注入 Mock
func TestUserService(t *testing.T) {
    mockRepo := &MockUserRepo{
        Users: map[string]*User{
            "123": {ID: "123", Name: "测试用户"},
        },
    }
    service := NewUserService(mockRepo) // 注入 Mock

    user, err := service.GetByID("123")
    assert.NoError(t, err)
    assert.Equal(t, "测试用户", user.Name)
}
```

### 7. Wire 测试

使用 Wire 为测试生成注入代码：

```go
// wire_test.go
//go:build wireinject
// +build wireinject

func InitializeTestApp() *App {
    wire.Build(
        NewMockUserRepo,     // 使用 Mock 实现
        wire.Bind(new(UserRepository), new(*MockUserRepo)),
        NewUserService,
        NewApp,
    )
    return nil
}
```

## 常见场景

### 场景一：Web 应用依赖图

```go
var AppSet = wire.NewSet(
    NewConfig,
    NewDB,
    NewRedis,
    NewUserRepository,
    wire.Bind(new(UserRepository), new(*PostgresUserRepo)),
    NewUserService,
    NewAuthMiddleware,
    NewRouter,
    NewServer,
)

func main() {
    app, cleanup, err := InitializeApp()
    defer cleanup()
    app.Run()
}
```

### 场景二：多环境配置

```go
// 开发环境
func InitializeDevApp() *App {
    wire.Build(
        NewDevConfig,
        NewSQLiteDB,
        NewUserService,
        NewApp,
    )
    return nil
}

// 生产环境
func InitializeProdApp() *App {
    wire.Build(
        NewProdConfig,
        NewPostgresDB,
        NewUserService,
        NewApp,
    )
    return nil
}
```

## 注意事项与常见错误

1. **wire.go 的构建标签**：`wire.go` 必须有 `//go:build wireinject` 标签，这样正常编译时不会包含它，只有 wire 命令会处理。

2. **wire_gen.go 要提交到版本控制**：生成的代码应该提交到 Git，这样不安装 Wire 也能编译项目。

3. **循环依赖**：如果 A 依赖 B，B 又依赖 A，Wire 会报错。需要重构代码消除循环。

4. **缺少 Provider**：如果某个类型没有对应的 Provider，Wire 会报错并列出缺失的 Provider。

5. **接口绑定方向**：`wire.Bind(new(Interface), new(*Implementation))`，第一个参数是接口，第二个是实现。

6. **不要过度使用 DI**：简单的项目不需要 Wire。手动注入更直观。当依赖关系复杂（超过 5-10 个组件）时再考虑使用。

## 进阶用法

### 运行时依赖注入

如果不想用代码生成，可以使用运行时 DI 框架：

```go
// 使用 dig
import "go.uber.org/dig"

container := dig.New()
container.Provide(NewConfig)
container.Provide(NewDB)
container.Provide(NewUserService)

container.Invoke(func(service *UserService) {
    service.DoSomething()
})
```

### 构造函数注入 vs 字段注入

Go 推荐构造函数注入（显式传递依赖），而非字段注入（设置属性）：

```go
// 推荐：构造函数注入
func NewUserService(repo UserRepository) *UserService {
    return &UserService{repo: repo}
}

// 不推荐：字段注入
service := &UserService{}
service.Repo = repo // 容易忘记设置
```
