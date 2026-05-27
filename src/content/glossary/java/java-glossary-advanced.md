---
title: "Java 高级特性名词注释 (Advanced Features Glossary)"
module: "java"
category: "Advanced Features"
description: "Java 高级特性：泛型/注解/反射/模块/JVM等 | Java advanced: generics, annotations, reflection, modules, JVM"
---

## A

| 术语 | 英文 | 释义 |
|------|------|------|
| 注解 | Annotation | 以 `@` 标识的元数据，分为内置注解（`@Override`、`@Deprecated`）和自定义注解 |
| APT | Annotation Processing Tool | 编译时注解处理工具，用于在编译阶段生成代码 |
| AOP | Aspect-Oriented Programming | 面向切面编程，通过预编译方式和运行期动态代理实现程序功能的统一维护 |

## B

| 术语 | 英文 | 释义 |
|------|------|------|
| 边界 | Bound | 泛型类型参数的约束，上界 `extends`、下界 `super` |
| 边界擦除 | Bridge Method | 编译器为保持泛型多态性而生成的桥接方法 |

## C

| 术语 | 英文 | 释义 |
|------|------|------|
| Class 对象 | Class Object | 每个类在 JVM 中对应的 `java.lang.Class` 实例，反射的入口 |
| ClassLoader | ClassLoader | 类加载器，负责将 `.class` 文件加载到 JVM，双亲委派模型 |
| CAS | Compare-And-Swap | 无锁并发原语，比较当前值与期望值，相同则更新，`sun.misc.Unsafe` 提供 |
| CGLIB | CGLIB | 基于继承的动态代理库，通过生成子类实现代理，Spring AOP 默认使用 |
| Constructor | Constructor | 反射中代表构造器的类，可通过 `Class.getDeclaredConstructor()` 获取 |

## D

| 术语 | 英文 | 释义 |
|------|------|------|
| 动态代理 | Dynamic Proxy | 运行时生成代理对象的机制，JDK 代理基于接口，CGLIB 代理基于继承 |
| 类型擦除 | Type Erasure | 泛型在编译后擦除类型参数信息，替换为上界或 `Object`，保持向后兼容 |

## E

| 术语 | 英文 | 释义 |
|------|------|------|
| 枚举 | Enum | 用 `enum` 定义的类型安全枚举类，隐式继承 `java.lang.Enum` |

## F

| 术语 | 英文 | 释义 |
|------|------|------|
| 反射 | Reflection | 运行时检查和操作类、方法、字段的能力，核心类：`Class`、`Method`、`Field` |
| 方法句柄 | Method Handle | Java 7 引入的底层方法调用机制，比反射更轻量，`java.lang.invoke` 包 |
| 泛型 | Generics | Java 5 引入的类型参数化机制，提供编译时类型安全检查 |

## G

| 术语 | 英文 | 释义 |
|------|------|------|
| 泛型类 | Generic Class | 使用类型参数定义的类，如 `class Box<T>` |
| 泛型方法 | Generic Method | 使用类型参数定义的方法，类型参数声明在返回值之前 |
| 泛型接口 | Generic Interface | 使用类型参数定义的接口，如 `interface Comparable<T>` |

## H

| 术语 | 英文 | 释义 |
|------|------|------|
| Heap | Heap | JVM 堆内存，存储对象实例和数组，GC 主要管理区域，分为新生代和老年代 |

## I

| 术语 | 英文 | 释义 |
|------|------|------|
| 元注解 | Meta-Annotation | 修饰注解的注解：`@Retention`、`@Target`、`@Inherited`、`@Documented` |
| JVM | Java Virtual Machine | Java 虚拟机，执行字节码的运行时环境 |
| JIT | Just-In-Time Compiler | 即时编译器，将热点字节码编译为本地机器码以提升性能 |

## J

| 术语 | 英文 | 释义 |
|------|------|------|
| 记录类 | Record | Java 14 预览/16 正式的不可变数据载体类，自动生成 `equals`、`hashCode`、`toString` |

## K

| 术语 | 英文 | 释义 |
|------|------|------|
| 可变参数 | Varargs | 方法参数使用 `Type...` 声明，本质是数组，只能作为最后一个参数 |

## L

| 术语 | 英文 | 释义 |
|------|------|------|
| Lambda 表达式 | Lambda Expression | Java 8 引入的匿名函数，`(params) -> expression`，函数式接口的简洁实现 |
| 类加载 | Class Loading | JVM 将 `.class` 字节码加载到内存的过程：加载→链接→初始化 |
| 类初始化 | Class Initialization | 执行类构造器 `<clinit>()` 方法，初始化静态变量和静态代码块 |

## M

| 术语 | 英文 | 释义 |
|------|------|------|
| 模块系统 | Module System | Java 9 引入的 JPMS，通过 `module-info.java` 声明模块依赖和导出 |
| 模块路径 | Module Path | 替代 classpath 的模块化类查找路径，`--module-path` 指定 |
| Method 对象 | Method Object | 反射中代表方法的类，可通过 `invoke()` 调用任意方法 |
| 密封类 | Sealed Class | Java 15 预览/17 正式，用 `sealed` 修饰，限制哪些类可以继承它 |

## N

| 术语 | 英文 | 释义 |
|------|------|------|
| 内省 | Introspection | 通过 `java.beans` 包检查 Bean 属性和事件的反射机制 |

## O

| 术语 | 英文 | 释义 |
|------|------|------|
| PECS | Producer Extends Consumer Super | 泛型通配符使用原则：生产者用 `extends`，消费者用 `super` |

## P

| 术语 | 英文 | 释义 |
|------|------|------|
| Pattern Matching | Pattern Matching | Java 16+ 的 `instanceof` 模式匹配，`obj instanceof String s` 同时判断和绑定 |
| PermGen | Permanent Generation | JDK7 及以前的永久代，存储类元数据，JDK8 被元空间取代 |

## R

| 术语 | 英文 | 释义 |
|------|------|------|
| Retention | Retention | 注解保留策略：`SOURCE`（源码）、`CLASS`（字节码）、`RUNTIME`（运行时） |
| 运行时注解 | Runtime Annotation | `@Retention(RetentionPolicy.RUNTIME)` 标注的注解，可通过反射获取 |

## S

| 术语 | 英文 | 释义 |
|------|------|------|
| 密封接口 | Sealed Interface | 用 `sealed` 修饰的接口，限制实现类 |
| Stack | Stack | JVM 栈内存，存储局部变量表、操作数栈、方法返回地址等栈帧信息 |
| Switch 表达式 | Switch Expression | Java 12 预览/14 正式，switch 可作为表达式返回值，支持箭头语法 |
| 实例模式匹配 | Instanceof Pattern Matching | Java 16+ 特性，`instanceof` 同时进行类型检查和变量绑定 |

## T

| 术语 | 英文 | 释义 |
|------|------|------|
| 通配符 | Wildcard | 泛型中的 `?`，表示未知类型，`<? extends T>` 上界通配、`<? super T>` 下界通配 |
| Type Token | Type Token | 用于在运行时保留泛型类型信息的模式，如 `new TypeToken<List<String>>(){}` |
| Text Block | Text Block | Java 13 预览/15 正式的多行字符串，用三个双引号 `"""` 包裹 |

## V

| 术语 | 英文 | 释义 |
|------|------|------|
| Virtual Thread | Virtual Thread | Java 21 正式引入的虚拟线程（协程），轻量级线程，由 JVM 调度而非 OS |

## W

| 术语 | 英文 | 释义 |
|------|------|------|
| 无界通配符 | Unbounded Wildcard | `<?>` 表示未知类型，等价于 `<? extends Object>` |

## Y

| 术语 | 英文 | 释义 |
|------|------|------|
| 元空间 | Metaspace | JDK8 取代永久代的类元数据存储区域，使用本地内存，默认无上限 |

## Z

| 术语 | 英文 | 释义 |
|------|------|------|
| 逐层加载 | Lazy Loading | 类的延迟加载策略，使用时才触发加载和初始化 |
