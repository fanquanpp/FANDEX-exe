---
title: "Java 核心语言名词注释 (Core Language Glossary)"
module: "java"
category: "Core Language"
description: "Java 核心语言概念：类/对象/继承/多态/封装/异常等 | Java core language: class, object, inheritance, polymorphism, encapsulation, exceptions"
---

## A

| 术语 | 英文 | 释义 |
|------|------|------|
| 按值传递 | Pass by Value | Java 方法参数传递机制，基本类型传递值的副本，引用类型传递引用的副本（非对象本身） |
| 按位运算符 | Bitwise Operator | 对整数二进制位进行操作的运算符：`&`、`|`、`^`、`~`、`<<`、`>>`、`>>>` |

## B

| 术语 | 英文 | 释义 |
|------|------|------|
| 包 | Package | 组织类的命名空间机制，使用 `package` 声明，避免类名冲突 |
| 包装类 | Wrapper Class | 基本类型的对象封装：`Integer`、`Double`、`Boolean` 等，支持自动装箱/拆箱 |
| 变量 | Variable | 存储数据的命名内存位置，分为局部变量、实例变量、类变量 |
| 标识符 | Identifier | 程序中类名、方法名、变量名等的命名，须遵循命名规则 |
| 不可变对象 | Immutable Object | 创建后状态不可改变的对象，如 `String`，线程安全 |

## C

| 术语 | 英文 | 释义 |
|------|------|------|
| 成员变量 | Field / Member Variable | 类中定义的属性，存储对象状态，包括实例变量和类变量 |
| 抽象类 | Abstract Class | 用 `abstract` 修饰的类，不能实例化，可包含抽象方法和具体方法 |
| 抽象方法 | Abstract Method | 用 `abstract` 修饰的无方法体方法，必须由子类实现 |
| 重载 | Overloading | 同一类中方法名相同但参数列表不同（参数类型/个数/顺序），编译时多态 |
| 重写 | Overriding | 子类重新定义父类的方法，方法签名相同，运行时多态 |
| 常量 | Constant | 值不可改变的变量，使用 `final` 修饰，命名全大写 |
| 初始化块 | Initialization Block | 类中用 `{}` 定义的代码块，分为静态初始化块和实例初始化块 |
| 传参 | Argument Passing | 方法调用时将实际参数传递给形式参数的机制 |

## D

| 术语 | 英文 | 释义 |
|------|------|------|
| 单继承 | Single Inheritance | Java 类只允许继承一个直接父类，但可通过接口实现多重类型 |
| 动态绑定 | Dynamic Binding | 运行时根据实际对象类型决定调用哪个方法，多态的基础 |
| 动态分发 | Dynamic Dispatch | 运行时根据对象实际类型选择方法实现的机制 |

## E

| 术语 | 英文 | 释义 |
|------|------|------|
| 封装 | Encapsulation | 将数据和方法包装在类中，通过访问修饰符控制外部访问，OOP 四大特性之一 |

## F

| 术语 | 英文 | 释义 |
|------|------|------|
| 方法 | Method | 定义对象行为的代码块，由方法签名和方法体组成 |
| 方法签名 | Method Signature | 方法名和参数列表的组合，用于区分不同方法 |
| 访问修饰符 | Access Modifier | 控制类/方法/变量可见性的关键字：`public`、`protected`、`default`、`private` |
| final 关键字 | final | 修饰类（不可继承）、方法（不可重写）、变量（不可修改） |

## G

| 术语 | 英文 | 释义 |
|------|------|------|
| 构造器 | Constructor | 用于初始化对象的特殊方法，与类同名，无返回值，支持重载 |
| 构造器链 | Constructor Chaining | 构造器之间通过 `this()` 和 `super()` 的调用链 |
| 关键字 | Keyword | Java 语言预定义的保留字，如 `class`、`if`、`return` 等，不可用作标识符 |

## H

| 术语 | 英文 | 释义 |
|------|------|------|
| 哈希码 | Hash Code | 对象的整型标识，由 `hashCode()` 方法返回，用于哈希表存储和查找 |

## I

| 术语 | 英文 | 释义 |
|------|------|------|
| 接口 | Interface | 用 `interface` 定义的行为契约，Java 8+ 支持默认方法和静态方法 |
| 继承 | Inheritance | 子类获得父类属性和方法的机制，使用 `extends` 关键字，OOP 四大特性之一 |

## J

| 术语 | 英文 | 释义 |
|------|------|------|
| 静态导入 | Static Import | `import static` 直接引用类的静态成员，无需类名前缀 |

## K

| 术语 | 英文 | 释义 |
|------|------|------|
| 空引用 | Null Reference | `null` 表示引用不指向任何对象，调用其方法会抛出 `NullPointerException` |

## L

| 术语 | 英文 | 释义 |
|------|------|------|
| 局部变量 | Local Variable | 方法或代码块内定义的变量，无默认值，作用域限于定义处到块结束 |

## M

| 术语 | 英文 | 释义 |
|------|------|------|
| 面向对象编程 | OOP | 以对象为核心的编程范式，四大特性：封装、继承、多态、抽象 |
| 模块 | Module | Java 9 引入的模块化单元，通过 `module-info.java` 定义 |

## N

| 术语 | 英文 | 释义 |
|------|------|------|
| 内部类 | Inner Class | 定义在另一个类内部的类，分为成员内部类、局部内部类、匿名内部类、静态内部类 |
| 匿名内部类 | Anonymous Inner Class | 无名字的内部类，通常用于一次性实现接口或继承类 |

## O

| 术语 | 英文 | 释义 |
|------|------|------|
| 对象 | Object | 类的实例，拥有状态（属性）和行为（方法），所有对象继承自 `java.lang.Object` |

## P

| 术语 | 英文 | 释义 |
|------|------|------|
| 多态 | Polymorphism | 同一操作作用于不同对象产生不同行为，通过重写和动态绑定实现，OOP 四大特性之一 |

## Q

| 术语 | 英文 | 释义 |
|------|------|------|
| 强制类型转换 | Type Casting | 将一种类型显式转换为另一种类型，引用类型向下转型需用 `instanceof` 检查 |

## R

| 术语 | 英文 | 释义 |
|------|------|------|
| 弱引用 | Weak Reference | `java.lang.ref.WeakReference`，垃圾回收时无论内存是否充足都会回收 |
| 软引用 | Soft Reference | `java.lang.ref.SoftReference`，内存不足时才被垃圾回收 |

## S

| 术语 | 英文 | 释义 |
|------|------|------|
| 实例 | Instance | 类的具体对象，通过 `new` 关键字创建 |
| 实例变量 | Instance Variable | 类中非 `static` 修饰的成员变量，每个对象拥有独立副本 |
| 实例化 | Instantiation | 通过 `new` 创建对象的过程 |
| 实例初始化块 | Instance Initialization Block | 每次创建对象时执行的代码块，在构造器之前运行 |
| 数据类型 | Data Type | 基本类型（8种）和引用类型（类、接口、数组） |
| this 关键字 | this | 指向当前对象的引用，用于区分成员变量和局部变量、调用本类其他构造器 |
| super 关键字 | super | 指向父类的引用，用于访问父类成员和调用父类构造器 |
| static 关键字 | static | 修饰成员使其属于类而非实例，静态方法不可访问非静态成员 |

## T

| 术语 | 英文 | 释义 |
|------|------|------|
| 逃逸分析 | Escape Analysis | JIT 编译器分析对象是否逃逸出方法，用于优化锁消除和栈上分配 |
| 条件运算符 | Ternary Operator | 三元运算符 `? :`，`condition ? value1 : value2` |

## W

| 术语 | 英文 | 释义 |
|------|------|------|
| 外部类 | Outer Class | 包含内部类的类 |

## Y

| 术语 | 英文 | 释义 |
|------|------|------|
| 异常 | Exception | 程序运行时的非致命错误，分为受检异常（Checked）和非受检异常（Unchecked） |
| 异常链 | Exception Chaining | 在捕获异常后抛出新异常时保留原始异常信息，使用 `initCause()` 或构造器传入 |
| 受检异常 | Checked Exception | 编译器强制要求处理的异常，必须 `try-catch` 或 `throws` 声明 |
| 非受检异常 | Unchecked Exception | `RuntimeException` 及其子类，编译器不强制处理 |
| 异常处理 | Exception Handling | 使用 `try`、`catch`、`finally`、`throw`、`throws` 处理异常的机制 |
| 自定义异常 | Custom Exception | 继承 `Exception` 或 `RuntimeException` 创建的业务异常类 |

## Z

| 术语 | 英文 | 释义 |
|------|------|------|
| 自动装箱 | Autoboxing | 基本类型自动转换为包装类，如 `int` → `Integer` |
| 自动拆箱 | Unboxing | 包装类自动转换为基本类型，如 `Integer` → `int` |
| 作用域 | Scope | 变量可被访问的代码范围，分为类级、方法级、块级 |
| 装饰器模式 | Decorator Pattern | 动态给对象添加职责的结构型设计模式，Java I/O 流广泛使用 |
