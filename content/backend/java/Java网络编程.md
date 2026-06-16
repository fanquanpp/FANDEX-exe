---
order: 67
title: Java网络编程
module: java
category: Java
difficulty: intermediate
description: Socket与HTTP客户端
author: fanquanpp
updated: '2026-06-14'
related:
  - java/Java设计模式
  - java/Java函数式编程
  - java/Java日志系统
  - java/Java单元测试
prerequisites:
  - java/概述与开发环境
---

## 概述

Java 网络编程涵盖从底层 Socket 到高层 HTTP 客户端的完整体系。Java 11 引入的新 HttpClient API 提供了现代化的 HTTP 客户端，支持同步/异步请求、HTTP/2 和 WebSocket。本文介绍 Java 网络编程的核心 API 和实用技巧。

## 基础概念

### 网络编程层次

| 层次     | API                 | 用途            |
| -------- | ------------------- | --------------- |
| 传输层   | Socket/ServerSocket | TCP/UDP 通信    |
| 应用层   | HttpClient          | HTTP/HTTPS 请求 |
| 应用层   | WebSocket           | 双向实时通信    |
| 网络信息 | InetAddress         | IP 地址解析     |
| URL 处理 | URI/URL             | URL 解析和构建  |

### 核心术语

- **TCP**：面向连接的可靠传输协议
- **UDP**：无连接的不可靠传输协议
- **HTTP/2**：支持多路复用、头部压缩的 HTTP 协议
- **WebSocket**：基于 HTTP 升级的全双工通信协议

## 快速上手

### HttpClient 同步请求

```java
// 创建 HttpClient 实例（推荐复用）
HttpClient client = HttpClient.newHttpClient();

// 构建 GET 请求
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/data"))
    .header("Accept", "application/json")
    .GET()
    .build();

// 发送同步请求
HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
System.out.println("状态码: " + response.statusCode());
System.out.println("响应体: " + response.body());
```

### HttpClient 异步请求

```java
// 发送异步请求，返回 CompletableFuture
CompletableFuture<HttpResponse<String>> future =
    client.sendAsync(request, BodyHandlers.ofString());

// 非阻塞处理响应
future.thenAccept(response -> {
    System.out.println("状态码: " + response.statusCode());
    System.out.println("响应体: " + response.body());
}).exceptionally(ex -> {
    System.err.println("请求失败: " + ex.getMessage());
    return null;
});
```

## 详细用法

### POST 请求与 JSON

```java
// 发送 JSON 格式的 POST 请求
String jsonBody = """
    {
        "name": "张三",
        "age": 25
    }
    """;

HttpRequest postRequest = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users"))
    .header("Content-Type", "application/json")
    .header("Authorization", "Bearer " + token)
    .POST(BodyPublishers.ofString(jsonBody))
    .build();

HttpResponse<String> response = client.send(postRequest, BodyHandlers.ofString());
```

### 超时与重试

```java
// 配置超时和重试
HttpClient client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(10))  // 连接超时
    .followRedirects(HttpClient.Redirect.NORMAL) // 跟随重定向
    .build();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/data"))
    .timeout(Duration.ofSeconds(30))  // 请求超时
    .GET()
    .build();

// 简单重试逻辑
int maxRetries = 3;
HttpResponse<String> response = null;
for (int i = 0; i < maxRetries; i++) {
    try {
        response = client.send(request, BodyHandlers.ofString());
        if (response.statusCode() < 500) break; // 非服务端错误，不重试
    } catch (IOException | InterruptedException e) {
        if (i == maxRetries - 1) throw e;
        Thread.sleep(1000 * (i + 1)); // 指数退避
    }
}
```

### 文件上传与下载

```java
// 文件上传
Path filePath = Path.of("report.pdf");
HttpRequest uploadRequest = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/upload"))
    .header("Content-Type", "application/octet-stream")
    .POST(BodyPublishers.ofFile(filePath))
    .build();

// 文件下载
HttpRequest downloadRequest = HttpRequest.newBuilder()
    .uri(URI.create("https://example.com/file.zip"))
    .GET()
    .build();

Path outputPath = Path.of("download/file.zip");
HttpResponse<Path> response = client.send(downloadRequest,
    BodyHandlers.ofFile(outputPath));
```

### TCP Socket 编程

```java
// TCP 服务端
try (ServerSocket serverSocket = new ServerSocket(8080)) {
    System.out.println("服务端启动，监听 8080 端口");
    while (true) {
        Socket clientSocket = serverSocket.accept(); // 等待客户端连接
        new Thread(() -> handleClient(clientSocket)).start();
    }
}

// 处理客户端连接
void handleClient(Socket socket) {
    try (socket;
         BufferedReader in = new BufferedReader(
             new InputStreamReader(socket.getInputStream()));
         PrintWriter out = new PrintWriter(socket.getOutputStream(), true)) {
        String line;
        while ((line = in.readLine()) != null) {
            out.println("Echo: " + line); // 回显消息
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
}

// TCP 客户端
try (Socket socket = new Socket("localhost", 8080);
     PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
     BufferedReader in = new BufferedReader(
         new InputStreamReader(socket.getInputStream()))) {
    out.println("Hello, Server!");
    String response = in.readLine();
    System.out.println("服务端响应: " + response);
}
```

## 常见场景

### REST API 客户端封装

```java
// 封装通用的 REST 客户端
public class RestClient {
    private final HttpClient client;
    private final ObjectMapper mapper = new ObjectMapper();

    public RestClient() {
        this.client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    }

    public <T> T get(String url, Class<T> responseType, String token) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Authorization", "Bearer " + token)
            .GET().build();
        HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            throw new RuntimeException("请求失败: " + response.statusCode());
        }
        return mapper.readValue(response.body(), responseType);
    }

    public <T> T post(String url, Object body, Class<T> responseType) throws Exception {
        String json = mapper.writeValueAsString(body);
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .POST(BodyPublishers.ofString(json)).build();
        HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
        return mapper.readValue(response.body(), responseType);
    }
}
```

### WebSocket 客户端

```java
// 使用 HttpClient 创建 WebSocket 连接
HttpClient client = HttpClient.newHttpClient();
WebSocket webSocket = client.newWebSocketBuilder()
    .buildAsync(URI.create("wss://echo.example.com/ws"), new WebSocket.Listener() {
        @Override
        public CompletionStage<?> onText(WebSocket ws, CharSequence data, boolean last) {
            System.out.println("收到消息: " + data);
            return null; // 消息处理完成
        }

        @Override
        public CompletionStage<?> onClose(WebSocket ws, int code, String reason) {
            System.out.println("连接关闭: " + reason);
            return null;
        }

        @Override
        public void onError(WebSocket ws, Throwable error) {
            System.err.println("WebSocket 错误: " + error.getMessage());
        }
    }).join();

// 发送消息
webSocket.sendText("Hello, WebSocket!", true);
```

## 注意事项

- HttpClient 实例应复用，不要每次请求都创建新实例
- 异步请求返回的 CompletableFuture 需要正确处理异常，避免静默失败
- Socket 编程中务必使用 try-with-resources 确保资源关闭
- 网络请求应设置合理的超时时间，避免无限等待
- 生产环境应使用连接池管理 HTTP 连接
- UDP 适合实时性要求高但允许丢包的场景，如视频流、DNS 查询

## 进阶用法

### HTTP/2 多路复用

```java
// HttpClient 默认支持 HTTP/2
HttpClient client = HttpClient.newBuilder()
    .version(HttpClient.Version.HTTP_2) // 优先使用 HTTP/2
    .build();

// HTTP/2 多路复用：多个请求共享一个 TCP 连接
List<CompletableFuture<HttpResponse<String>>> futures = urls.stream()
    .map(url -> client.sendAsync(
        HttpRequest.newBuilder().uri(URI.create(url)).GET().build(),
        BodyHandlers.ofString()))
    .toList();

// 等待所有请求完成
CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
```

### UDP 数据报

```java
// UDP 发送
try (DatagramSocket socket = new DatagramSocket()) {
    byte[] data = "Hello UDP".getBytes();
    InetAddress address = InetAddress.getByName("localhost");
    DatagramPacket packet = new DatagramPacket(data, data.length, address, 9090);
    socket.send(packet);
}

// UDP 接收
try (DatagramSocket socket = new DatagramSocket(9090)) {
    byte[] buffer = new byte[1024];
    DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
    socket.receive(packet);
    String message = new String(packet.getData(), 0, packet.getLength());
    System.out.println("收到: " + message);
}
```
