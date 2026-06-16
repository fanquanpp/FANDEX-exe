---
order: 59
title: JavaIO与NIO
module: java
category: Java
difficulty: intermediate
description: BIO、NIO与AIO
author: fanquanpp
updated: '2026-06-14'
related:
  - java/Java反射
  - java/Java序列化
  - java/Java新特性
  - java/运算符与表达式
prerequisites:
  - java/概述与开发环境
---

## 概述

Java 的 I/O 体系经历了从传统 BIO 到 NIO 再到 AIO 的演进。BIO 是最早的阻塞式模型，每个连接占用一个线程；NIO 引入了多路复用机制，一个线程可管理多个连接；AIO 则进一步实现了真正的异步非阻塞操作。理解三者的差异与适用场景，是编写高性能网络与文件程序的基础。

## 基础概念

### BIO vs NIO vs AIO

| 模型 | 说明                          | 适用场景             |
| ---- | ----------------------------- | -------------------- |
| BIO  | 同步阻塞，一个连接一个线程    | 连接数少且固定的场景 |
| NIO  | 同步非阻塞，Selector 多路复用 | 高并发短连接         |
| AIO  | 异步非阻塞，回调通知          | 高并发长连接         |

### 核心术语

- **Buffer（缓冲区）**：NIO 中数据的容器，所有读写操作都通过缓冲区完成
- **Channel（通道）**：双向的数据通道，可同时进行读写
- **Selector（选择器）**：多路复用器，用于监控多个 Channel 的事件
- **SelectionKey**：表示 Channel 与 Selector 之间的注册关系

## 快速上手

### BIO 文件读取

```java
// 传统 BIO 方式读取文件
try (FileInputStream fis = new FileInputStream("data.txt")) {
    byte[] buffer = new byte[1024];
    int bytesRead = fis.read(buffer);
    while (bytesRead != -1) {
        // 处理读取到的数据
        System.out.println(new String(buffer, 0, bytesRead));
        bytesRead = fis.read(buffer);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

### NIO 文件读取

```java
// NIO 方式读取文件
try (FileChannel channel = FileChannel.open(
        Path.of("data.txt"), StandardOpenOption.READ)) {
    ByteBuffer buf = ByteBuffer.allocate(1024);
    while (channel.read(buf) != -1) {
        buf.flip(); // 切换为读模式
        while (buf.hasRemaining()) {
            System.out.print((char) buf.get());
        }
        buf.clear(); // 清空缓冲区，准备下次写入
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

## 详细用法

### Buffer 的核心操作

```java
// 创建缓冲区
ByteBuffer buf = ByteBuffer.allocate(1024);  // 堆内缓冲区
ByteBuffer directBuf = ByteBuffer.allocateDirect(1024); // 直接缓冲区（堆外内存）

// 写入数据
buf.put((byte) 65);
buf.put(new byte[]{66, 67, 68});

// 切换为读模式
buf.flip();

// 读取数据
byte b = buf.get();       // 读取单个字节
byte[] arr = new byte[3];
buf.get(arr);             // 读取到数组

// 常用方法
buf.rewind();    // 重读：position 归零，limit 不变
buf.mark();      // 标记当前位置
buf.reset();     // 回到标记位置
buf.compact();   // 将未读数据移到缓冲区头部
```

### Channel 类型

```java
// 文件通道
FileChannel fileChannel = FileChannel.open(
    Path.of("data.txt"),
    StandardOpenOption.READ,
    StandardOpenOption.WRITE
);

// 文件通道传输数据
try (FileChannel src = FileChannel.open(Path.of("source.txt"), StandardOpenOption.READ);
     FileChannel dest = FileChannel.open(Path.of("dest.txt"),
         StandardOpenOption.CREATE, StandardOpenOption.WRITE)) {
    // 零拷贝传输，效率高
    dest.transferFrom(src, 0, src.size());
}

// Socket 通道
ServerSocketChannel serverChannel = ServerSocketChannel.open();
serverChannel.bind(new InetSocketAddress(8080));
serverChannel.configureBlocking(false); // 设置为非阻塞模式
```

### Selector 多路复用

```java
// 创建 Selector 并注册通道
Selector selector = Selector.open();
ServerSocketChannel serverChannel = ServerSocketChannel.open();
serverChannel.configureBlocking(false);
serverChannel.bind(new InetSocketAddress(8080));
// 注册接受连接事件
serverChannel.register(selector, SelectionKey.OP_ACCEPT);

// 事件循环
while (true) {
    int readyCount = selector.select(); // 阻塞直到有事件就绪
    if (readyCount == 0) continue;

    Set<SelectionKey> selectedKeys = selector.selectedKeys();
    Iterator<SelectionKey> iter = selectedKeys.iterator();
    while (iter.hasNext()) {
        SelectionKey key = iter.next();
        if (key.isAcceptable()) {
            // 处理新连接
            SocketChannel client = serverChannel.accept();
            client.configureBlocking(false);
            client.register(selector, SelectionKey.OP_READ);
        } else if (key.isReadable()) {
            // 处理读事件
            SocketChannel client = (SocketChannel) key.channel();
            ByteBuffer buf = ByteBuffer.allocate(256);
            int bytesRead = client.read(buf);
            if (bytesRead == -1) {
                client.close(); // 连接关闭
            }
        }
        iter.remove(); // 必须手动移除已处理的键
    }
}
```

## 常见场景

### 文件复制

```java
// 使用 NIO 进行文件复制（推荐方式）
public static void copyFile(Path source, Path target) throws IOException {
    try (FileChannel srcChannel = FileChannel.open(source, StandardOpenOption.READ);
         FileChannel destChannel = FileChannel.open(target,
             StandardOpenOption.CREATE, StandardOpenOption.WRITE)) {
        long size = srcChannel.size();
        long transferred = 0;
        while (transferred < size) {
            // 使用 transferTo 实现零拷贝
            transferred += srcChannel.transferTo(transferred, size - transferred, destChannel);
        }
    }
}
```

### 内存映射文件

```java
// 大文件处理：使用内存映射提升性能
try (FileChannel channel = FileChannel.open(
        Path.of("large.dat"),
        StandardOpenOption.READ,
        StandardOpenOption.WRITE)) {
    // 将文件映射到内存
    MappedByteBuffer mappedBuf = channel.map(
        FileChannel.MapMode.READ_WRITE, 0, channel.size());
    // 像操作内存一样操作文件
    mappedBuf.putInt(0, 42);
    mappedBuf.force(); // 强制将修改写入磁盘
}
```

## 注意事项

- Buffer 的 flip() 方法容易遗漏，忘记调用会导致读取到空数据或错误数据
- Selector 事件循环中必须手动移除已处理的 SelectionKey，否则会重复处理
- 直接缓冲区（allocateDirect）分配和销毁开销大，适合长期使用的大缓冲区
- 内存映射文件修改后需要调用 force() 确保数据落盘
- NIO 的非阻塞模式不等于异步，AIO 才是真正的异步操作
- 在 Windows 上 AIO 的实现效果不如 Linux，选择模型时需考虑部署平台

## 进阶用法

### AIO 异步文件操作

```java
// 使用 AsynchronousFileChannel 进行异步读写
try (AsynchronousFileChannel asyncChannel = AsynchronousFileChannel.open(
        Path.of("data.txt"), StandardOpenOption.READ)) {
    ByteBuffer buf = ByteBuffer.allocate(1024);
    // 异步读取，传入回调
    asyncChannel.read(buf, 0, buf, new CompletionHandler<Integer, ByteBuffer>() {
        @Override
        public void completed(Integer result, ByteBuffer attachment) {
            attachment.flip();
            System.out.println("读取完成，字节数: " + result);
        }

        @Override
        public void failed(Throwable exc, ByteBuffer attachment) {
            System.err.println("读取失败: " + exc.getMessage());
        }
    });
}
```

### NIO 与线程池配合

```java
// 将 I/O 操作与业务处理分离
ExecutorService workerPool = Executors.newFixedThreadPool(
    Runtime.getRuntime().availableProcessors());

// 在 Selector 事件循环中，将读到的数据交给线程池处理
while (true) {
    selector.select();
    for (SelectionKey key : selector.selectedKeys()) {
        if (key.isReadable()) {
            SocketChannel client = (SocketChannel) key.channel();
            ByteBuffer buf = ByteBuffer.allocate(4096);
            int bytesRead = client.read(buf);
            if (bytesRead > 0) {
                buf.flip();
                byte[] data = new byte[buf.remaining()];
                buf.get(data);
                // 将业务处理提交到线程池，避免阻塞 I/O 线程
                workerPool.submit(() -> process(data));
            }
        }
    }
    selector.selectedKeys().clear();
}
```
