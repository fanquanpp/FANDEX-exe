---
order: 54
title: JVM类加载机制
module: java
category: Java
difficulty: advanced
description: 类加载器与双亲委派
author: fanquanpp
updated: '2026-06-14'
related:
  - java/并发编程基础
  - java/JUC并发包
  - java/JVM垃圾回收
  - java/Java反射
prerequisites:
  - java/概述与开发环境
---

## 概述

JVM 类加载机制是 Java 运行时的基础，负责将 class 文件加载到 JVM 中并转换为 java.lang.Class 对象。理解类加载过程、双亲委派模型及其打破方式，对于排查类冲突、开发框架和理解热部署至关重要。

## 基础概念

### 类加载的五个阶段

| 阶段   | 说明                                        |
| ------ | ------------------------------------------- |
| 加载   | 读取 class 文件，生成 Class 对象            |
| 验证   | 校验字节码格式、元数据、符号引用的合法性    |
| 准备   | 为静态变量分配内存并设置默认初始值          |
| 解析   | 将常量池的符号引用替换为直接引用            |
| 初始化 | 执行静态变量赋值和静态代码块（clinit 方法） |

### 类加载器层次

```
Bootstrap ClassLoader（加载 rt.jar 等核心库）
  |
Extension ClassLoader（加载 ext 目录下的库）
  |
Application ClassLoader（加载 classpath 下的类）
  |
自定义 ClassLoader（用户定义的类加载器）
```

## 快速上手

### 查看类加载器

```java
// 查看当前类的类加载器
ClassLoader loader = MyClass.class.getClassLoader();
System.out.println("类加载器: " + loader);
System.out.println("父加载器: " + loader.getParent());
System.out.println("祖父加载器: " + loader.getParent().getParent());

// 输出示例：
// 类加载器: sun.misc.Launcher$AppClassLoader@18b4aac2
// 父加载器: sun.misc.Launcher$ExtClassLoader@1b6d3586
// 祖父加载器: null（Bootstrap 由 C++ 实现，Java 中表示为 null）
```

### 双亲委派机制

```java
// 双亲委派的工作流程：
// 1. 收到类加载请求时，先委托给父加载器
// 2. 父加载器无法加载时，才由自己加载
// 3. 保证核心类（如 java.lang.Object）只被加载一次

// 双亲委派的核心源码（ClassLoader.loadClass）
protected Class<?> loadClass(String name, boolean resolve) {
    synchronized (getClassLoadingLock(name)) {
        // 1. 先检查是否已加载
        Class<?> c = findLoadedClass(name);
        if (c == null) {
            // 2. 委托给父加载器
            if (parent != null) {
                c = parent.loadClass(name, false);
            } else {
                c = findBootstrapClassOrNull(name);
            }
            // 3. 父加载器无法加载，自己查找
            if (c == null) {
                c = findClass(name);
            }
        }
        return c;
    }
}
```

## 详细用法

### 自定义类加载器

```java
// 自定义类加载器：从指定目录加载 class 文件
class CustomClassLoader extends ClassLoader {
    private final String classPath;

    public CustomClassLoader(String classPath) {
        this.classPath = classPath;
    }

    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        // 将类名转换为文件路径
        String fileName = name.replace('.', '/') + ".class";
        Path path = Path.of(classPath, fileName);

        if (!Files.exists(path)) {
            throw new ClassNotFoundException(name);
        }

        try {
            byte[] classData = Files.readAllBytes(path);
            // 将字节数组转换为 Class 对象
            return defineClass(name, classData, 0, classData.length);
        } catch (IOException e) {
            throw new ClassNotFoundException(name, e);
        }
    }
}

// 使用自定义类加载器
CustomClassLoader loader = new CustomClassLoader("/opt/plugins");
Class<?> pluginClass = loader.loadClass("com.example.Plugin");
Object plugin = pluginClass.getDeclaredConstructor().newInstance();
```

### 打破双亲委派

```java
// 打破双亲委派：重写 loadClass 方法而非 findClass
class PluginClassLoader extends ClassLoader {
    private final String pluginPath;

    public PluginClassLoader(String pluginPath) {
        this.pluginPath = pluginPath;
    }

    @Override
    protected Class<?> loadClass(String name, boolean resolve)
            throws ClassNotFoundException {
        // 核心类仍使用双亲委派
        if (name.startsWith("java.") || name.startsWith("javax.")) {
            return super.loadClass(name, resolve);
        }

        // 插件类自己加载，不委托给父加载器
        Class<?> c = findLoadedClass(name);
        if (c == null) {
            c = findClass(name);
        }
        if (resolve) {
            resolveClass(c);
        }
        return c;
    }

    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        String fileName = name.replace('.', '/') + ".class";
        try {
            byte[] data = Files.readAllBytes(Path.of(pluginPath, fileName));
            return defineClass(name, data, 0, data.length);
        } catch (IOException e) {
            throw new ClassNotFoundException(name, e);
        }
    }
}
```

### 热部署实现

```java
// 简单的热部署：每次创建新的类加载器加载最新代码
public class HotDeploy {
    private Object service;
    private ClassLoader currentLoader;

    public void reload() throws Exception {
        // 创建新的类加载器
        ClassLoader newLoader = new CustomClassLoader("/app/classes");

        // 加载最新版本的类
        Class<?> serviceClass = newLoader.loadClass("com.example.Service");
        Object newService = serviceClass.getDeclaredConstructor().newInstance();

        // 替换旧实例
        this.service = newService;
        this.currentLoader = newLoader;
        System.out.println("热部署完成");
    }
}
```

## 常见场景

### SPI 机制与线程上下文类加载器

```java
// SPI（Service Provider Interface）使用线程上下文类加载器打破双亲委派
// JDBC 就是典型的 SPI 机制

// ServiceLoader 加载实现类
ServiceLoader<Driver> drivers = ServiceLoader.load(Driver.class);
for (Driver driver : drivers) {
    System.out.println("找到驱动: " + driver.getClass().getName());
}

// ServiceLoader.load 内部使用线程上下文类加载器
public static <S> ServiceLoader<S> load(Class<S> service) {
    ClassLoader cl = Thread.currentThread().getContextClassLoader();
    return ServiceLoader.load(service, cl);
}
```

### 模块化系统中的类加载

```java
// Java 9+ 模块化系统中，每个模块有独立的类加载器
// 模块间的访问需要通过 requires 和 exports 声明

// module-info.java
module com.example.app {
    requires com.example.core;
    exports com.example.app.api;
}

// 使用 Module API 查询模块信息
ModuleLayer layer = ModuleLayer.boot();
layer.modules().forEach(m -> {
    System.out.println("模块: " + m.getName());
    m.getPackages().forEach(pkg -> System.out.println("  包: " + pkg));
});
```

## 注意事项

- 自定义类加载器时优先重写 findClass 而非 loadClass，除非确实需要打破双亲委派
- 类被不同的类加载器加载后，即使全限定名相同，也不属于同一个类（instanceof 返回 false）
- 线程上下文类加载器是 SPI 机制的核心，使用时注意设置和恢复
- Java 9+ 模块化系统对反射访问有严格限制，需要通过 --add-opens 开放
- 类加载过程中出现异常，该类将无法使用，且不会重试加载

## 进阶用法

### 类卸载条件

```java
// 类被卸载需要同时满足以下条件：
// 1. 该类所有的实例都已被回收
// 2. 加载该类的 ClassLoader 已经被回收
// 3. 该类对应的 java.lang.Class 对象没有在任何地方被引用

// 验证类卸载：使用 -verbose:class 参数观察
// java -verbose:class -cp . MyApp

// 触发类卸载的示例
CustomClassLoader loader = new CustomClassLoader("/plugins");
Class<?> clazz = loader.loadClass("com.example.Plugin");
Object instance = clazz.getDeclaredConstructor().newInstance();

instance = null;   // 释放实例
clazz = null;      // 释放 Class 引用
loader = null;     // 释放 ClassLoader 引用
System.gc();       // 建议 JVM 回收，但不保证立即卸载
```

### 字节码增强

```java
// 使用 Java Agent 在类加载时修改字节码
public class TimingAgent {
    public static void premain(String args, Instrumentation inst) {
        inst.addTransformer((loader, className, classBeingRedefined,
                protectionDomain, classfileBuffer) -> {
            // 使用 ASM 或 Byte Buddy 修改字节码
            // 例如：给所有方法添加耗时统计
            if (className.startsWith("com/example/")) {
                return addTiming(classfileBuffer);
            }
            return null; // 不修改
        });
    }
}
```
