---
order: 50
title: ArkTS语言特性
module: harmonyos
category: HarmonyOS
difficulty: intermediate
description: ArkTS扩展语法与限制
author: fanquanpp
updated: '2026-06-14'
related:
  - harmonyos/网络与数据持久化
  - harmonyos/多媒体与设备能力
  - harmonyos/状态管理
  - harmonyos/自定义组件
prerequisites:
  - harmonyos/概述与环境搭建
---

## 概述

ArkTS 是 HarmonyOS 的应用开发语言，基于 TypeScript 扩展了声明式 UI 语法，同时施加了更严格的类型限制以保证运行时性能。理解 ArkTS 的扩展特性和限制，是开发 HarmonyOS 应用的基础。

## 基础概念

### ArkTS 与 TypeScript 的关系

| 特性       | TypeScript        | ArkTS                 |
| ---------- | ----------------- | --------------------- |
| 类型系统   | 可选              | 强制静态类型          |
| any 类型   | 允许              | 禁止                  |
| 运行时检查 | typeof/instanceof | 限制使用              |
| 声明式 UI  | 无                | @Component + build()  |
| 状态管理   | 无                | @State/@Link 等装饰器 |
| 编译优化   | 通用              | AOT 编译，更严格约束  |

### 核心装饰器

| 装饰器     | 用途                   |
| ---------- | ---------------------- |
| @Entry     | 标记页面入口组件       |
| @Component | 标记自定义组件         |
| @Builder   | 声明轻量级 UI 构建函数 |
| @Extend    | 扩展原生组件样式       |
| @Styles    | 抽取通用样式           |

## 快速上手

### 页面入口组件

```typescript
// 使用 @Entry 和 @Component 创建页面
@Entry
@Component
struct Index {
  @State message: string = 'Hello World'
  @State count: number = 0

  build() {
    Column() {
      Text(this.message)
        .fontSize(30)
        .fontWeight(FontWeight.Bold)

      Text(`点击次数: ${this.count}`)
        .fontSize(20)
        .margin({ top: 20 })

      Button('点击我')
        .width(200)
        .height(50)
        .margin({ top: 20 })
        .onClick(() => {
          this.count++
          this.message = `已点击 ${this.count} 次`
        })
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
  }
}
```

### @Builder 构建函数

```typescript
// @Builder 声明可复用的 UI 片段
@Entry
@Component
struct BuilderDemo {
  @State items: string[] = ['首页', '发现', '我的']

  // 定义 Builder 函数
  @Builder TabItem(title: string, index: number) {
    Column() {
      Text(title)
        .fontSize(16)
        .fontColor(index === 0 ? '#007DFF' : '#999999')
    }
    .width('33%')
    .height(50)
    .justifyContent(FlexAlign.Center)
  }

  build() {
    Row() {
      ForEach(this.items, (item: string, index: number) => {
        this.TabItem(item, index)
      })
    }
    .width('100%')
    .height(50)
  }
}
```

## 详细用法

### @Extend 扩展样式

```typescript
// @Extend 为特定组件扩展样式方法
@Extend(Text) function titleStyle() {
  .fontSize(24)
  .fontWeight(FontWeight.Bold)
  .fontColor('#333333')
  .margin({ bottom: 10 })
}

@Extend(Button) function primaryButton() {
  .width(200)
  .height(50)
  .backgroundColor('#007DFF')
  .fontColor(Color.White)
  .borderRadius(25)
}

// 使用
@Entry
@Component
struct ExtendDemo {
  build() {
    Column() {
      Text('标题').titleStyle()
      Button('提交').primaryButton()
    }
  }
}
```

### @Styles 通用样式

```typescript
// @Styles 抽取多个组件共用的样式
@Styles function cardStyle() {
  .width('90%')
  .padding(15)
  .borderRadius(10)
  .backgroundColor(Color.White)
  .shadow({ radius: 5, color: '#1F000000', offsetY: 2 })
}

// 使用
@Entry
@Component
struct StylesDemo {
  build() {
    Column() {
      // 多个卡片共享样式
      Column() {
        Text('卡片1').fontSize(18)
      }.cardStyle()

      Column() {
        Text('卡片2').fontSize(18)
      }.cardStyle()
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
    .padding(15)
  }
}
```

### 条件渲染与循环

```typescript
@Entry
@Component
struct RenderDemo {
  @State isLoggedIn: boolean = false
  @State items: Item[] = [
    { id: 1, name: '项目1' },
    { id: 2, name: '项目2' },
    { id: 3, name: '项目3' }
  ]

  build() {
    Column() {
      // 条件渲染
      if (this.isLoggedIn) {
        Text('欢迎回来')
      } else {
        Button('登录')
          .onClick(() => this.isLoggedIn = true)
      }

      // 循环渲染
      ForEach(this.items, (item: Item) => {
        Text(item.name)
          .width('100%')
          .height(50)
          .textAlign(TextAlign.Center)
      }, (item: Item) => item.id.toString())
    }
  }
}

interface Item {
  id: number
  name: string
}
```

## 常见场景

### 自定义对话框

```typescript
@CustomDialog
struct ConfirmDialog {
  controller: CustomDialogController
  title: string = '确认'
  message: string = '确定要执行此操作吗？'
  onConfirm?: () => void

  build() {
    Column() {
      Text(this.title).fontSize(20).fontWeight(FontWeight.Bold)
      Text(this.message).fontSize(16).margin({ top: 10 })
      Row() {
        Button('取消')
          .backgroundColor('#999')
          .onClick(() => this.controller.close())
        Button('确认')
          .onClick(() => {
            this.onConfirm?.()
            this.controller.close()
          })
      }.margin({ top: 20 })
    }.padding(20)
  }
}
```

## 注意事项

- ArkTS 禁止使用 any 类型，所有变量必须有明确类型
- 不允许使用 typeof、instanceof 等运行时类型检查
- 闭包使用受限，不能在闭包中修改外部 @State 变量（需通过引用类型间接修改）
- struct 不支持继承，组件复用应使用组合模式
- @Builder 函数不能有返回值，只能包含 UI 描述
- ArkTS 的编译模式为 AOT，不支持 eval 和动态代码执行

## 进阶用法

### 响应式数据源

```typescript
// 使用 @Observed 和 @ObjectLink 实现嵌套对象的响应式
@Observed
class User {
  name: string = ''
  age: number = 0
}

@Entry
@Component
struct ObservedDemo {
  @State user: User = new User()

  build() {
    Column() {
      Text(`姓名: ${this.user.name}`)
      Text(`年龄: ${this.user.age}`)
      Button('修改姓名')
        .onClick(() => this.user.name = '张三')
    }
  }
}
```
