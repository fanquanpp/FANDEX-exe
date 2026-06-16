---
order: 57
title: Java反射
module: java
category: Java
difficulty: intermediate
description: 反射API与动态代理
author: fanquanpp
updated: '2026-06-14'
related:
  - java/JVM类加载机制
  - java/JVM垃圾回收
  - java/Java序列化
  - java/JavaIO与NIO
prerequisites:
  - java/概述与开发环境
---

## 概述

Java 反射机制允许程序在运行时检查和操作类、方法、字段等结构信息。反射是框架开发的基础，Spring 的依赖注入、JUnit 的测试方法发现、MyBatis 的结果映射都依赖反射实现。本文介绍反射 API 的核心用法、动态代理以及使用时的注意事项。

## 基础概念

### 反射核心类

| 类          | 说明                    |
| ----------- | ----------------------- |
| Class       | 表示类的元信息          |
| Field       | 表示类的字段            |
| Method      | 表示类的方法            |
| Constructor | 表示类的构造方法        |
| Annotation  | 表示注解信息            |
| Parameter   | 表示方法参数（Java 8+） |

### 获取 Class 对象的方式

```java
// 方式一：通过类名
Class<?> clazz1 = User.class;

// 方式二：通过对象
Class<?> clazz2 = new User().getClass();

// 方式三：通过全限定名（最灵活）
Class<?> clazz3 = Class.forName("com.example.User");

// 方式四：通过类加载器
Class<?> clazz4 = ClassLoader.getSystemClassLoader()
    .loadClass("com.example.User");
```

## 快速上手

### 基本反射操作

```java
Class<?> clazz = Class.forName("com.example.User");

// 获取所有声明的方法（包括私有）
Method[] methods = clazz.getDeclaredMethods();

// 获取指定方法
Method setName = clazz.getDeclaredMethod("setName", String.class);

// 获取字段
Field nameField = clazz.getDeclaredField("name");
nameField.setAccessible(true); // 允许访问私有字段

// 获取构造方法
Constructor<?> constructor = clazz.getDeclaredConstructor(String.class, int.class);

// 通过反射创建实例
Object instance = constructor.newInstance("张三", 25);
```

### 读取和修改字段

```java
// 创建实例并修改私有字段
User user = new User();
Field nameField = User.class.getDeclaredField("name");
nameField.setAccessible(true); // 突破 private 限制
nameField.set(user, "李四");   // 设置字段值

// 读取字段值
String name = (String) nameField.get(user);
System.out.println("姓名: " + name); // 李四

// 读取静态字段
Field countField = User.class.getDeclaredField("instanceCount");
int count = (int) countField.get(null); // 静态字段传 null
```

## 详细用法

### 方法调用

```java
// 调用实例方法
Method setName = User.class.getMethod("setName", String.class);
setName.invoke(user, "王五");

// 调用私有方法
Method validate = User.class.getDeclaredMethod("validate", String.class);
validate.setAccessible(true);
boolean result = (boolean) validate.invoke(user, "test");

// 调用静态方法
Method valueOf = Integer.class.getMethod("valueOf", int.class);
Integer num = (Integer) valueOf.invoke(null, 42);

// 调用带可变参数的方法
Method printf = System.out.getClass().getMethod("printf", String.class, Object[].class);
printf.invoke(System.out, "Hello %s%n", new Object[]{"World"});
```

### 注解处理

```java
// 自定义注解
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface ApiEndpoint {
    String path();
    String method() default "GET";
}

// 通过反射读取注解
Method[] methods = controller.getClass().getDeclaredMethods();
for (Method method : methods) {
    ApiEndpoint endpoint = method.getAnnotation(ApiEndpoint.class);
    if (endpoint != null) {
        System.out.println("路径: " + endpoint.path());
        System.out.println("方法: " + endpoint.method());
    }
}
```

### 动态代理

```java
// JDK 动态代理：只能代理接口
interface Service {
    String execute(String input);
}

class ServiceImpl implements Service {
    public String execute(String input) {
        return "处理: " + input;
    }
}

// 创建代理对象
Service target = new ServiceImpl();
Service proxy = (Service) Proxy.newProxyInstance(
    Service.class.getClassLoader(),
    new Class[]{Service.class},
    (obj, method, args) -> {
        // 前置增强
        System.out.println("调用方法: " + method.getName());
        long start = System.nanoTime();
        // 执行目标方法
        Object result = method.invoke(target, args);
        // 后置增强
        long elapsed = System.nanoTime() - start;
        System.out.println("耗时: " + elapsed + " ns");
        return result;
    }
);

String result = proxy.execute("测试数据");
```

## 常见场景

### 简单 ORM 映射

```java
// 使用反射实现简单的对象关系映射
@Retention(RetentionPolicy.RUNTIME)
@interface Column { String value(); }

@Retention(RetentionPolicy.RUNTIME)
@interface Table { String value(); }

@Table("users")
class User {
    @Column("user_name")
    private String name;
    @Column("user_age")
    private int age;
}

// 根据 ResultSet 和注解自动映射
public <T> T mapRow(ResultSet rs, Class<T> clazz) throws Exception {
    T instance = clazz.getDeclaredConstructor().newInstance();
    for (Field field : clazz.getDeclaredFields()) {
        Column col = field.getAnnotation(Column.class);
        if (col != null) {
            field.setAccessible(true);
            Object value = rs.getObject(col.value());
            field.set(instance, value);
        }
    }
    return instance;
}
```

### CGLIB 动态代理

```java
// CGLIB 可以代理类（不需要接口）
Enhancer enhancer = new Enhancer();
enhancer.setSuperclass(ServiceImpl.class);
enhancer.setCallback((MethodInterceptor) (obj, method, args, proxy) -> {
    System.out.println("CGLIB 前置增强: " + method.getName());
    Object result = proxy.invokeSuper(obj, args); // 调用父类方法
    System.out.println("CGLIB 后置增强");
    return result;
});

ServiceImpl proxy = (ServiceImpl) enhancer.create();
proxy.execute("测试");
```

## 注意事项

- 反射会绕过访问控制，破坏封装性，应谨慎使用
- 反射调用比直接调用慢 10-100 倍，性能敏感场景避免使用
- setAccessible(true) 可能被 SecurityManager 阻止
- 反射操作私有成员可能导致代码难以维护和调试
- 在模块化系统（Java 9+）中，反射访问需要通过 --add-opens 显式开放
- 优先使用方法引用和 Lambda，仅在框架级代码中使用反射

## 进阶用法

### MethodHandle（方法句柄）

```java
// MethodHandle 比反射更高效、更安全
MethodHandles.Lookup lookup = MethodHandles.lookup();

// 查找虚方法
MethodType type = MethodType.methodType(String.class, String.class);
MethodHandle handle = lookup.findVirtual(String.class, "replace", type);

// 调用方法
String result = (String) handle.invokeExact("hello", 'l', 'r');
System.out.println(result); // "herro"

// 查找静态方法
MethodHandle valueOf = lookup.findStatic(
    Integer.class, "valueOf",
    MethodType.methodType(Integer.class, int.class));
Integer num = (Integer) valueOf.invokeExact(42);
```

### 反射与泛型

```java
// 通过反射获取泛型类型信息
abstract class TypeReference<T> {
    private final Type type;
    protected TypeReference() {
        Type superClass = getClass().getGenericSuperclass();
        this.type = ((ParameterizedType) superClass).getActualTypeArguments()[0];
    }
    public Type getType() { return type; }
}

// 使用方式：获取 List<String> 的元素类型
TypeReference<List<String>> ref = new TypeReference<>() {};
Type listType = ref.getType();
System.out.println(listType); // java.util.List<java.lang.String>
```
