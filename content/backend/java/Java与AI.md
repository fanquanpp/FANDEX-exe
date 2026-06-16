---
order: 77
title: Java与AI
module: java
category: Java
difficulty: intermediate
description: Java机器学习与AI集成
author: fanquanpp
updated: '2026-06-14'
related:
  - java/Java与GraphQL
  - java/Java性能调优
  - java/Java与安全
  - java/Java与WebAssembly
prerequisites:
  - java/概述与开发环境
---

## 概述

Java 在 AI 领域虽然不如 Python 主流，但凭借其强大的工程化能力、出色的并发性能和成熟的生态，在企业级 AI 应用中占据重要地位。通过 DJL、LangChain4j 等框架，Java 开发者可以方便地集成深度学习推理、大语言模型调用和 RAG 管道，将 AI 能力嵌入到现有的企业系统中。

## 基础概念

### Java AI 生态的主要框架

| 框架        | 定位             | 特点                       |
| ----------- | ---------------- | -------------------------- |
| DJL         | 深度学习推理库   | 引擎无关，支持 PyTorch/TF  |
| LangChain4j | LLM 应用开发框架 | 对标 Python LangChain      |
| Tribuo      | 传统机器学习库   | Oracle 出品，支持分类/回归 |
| Deep Java   | 神经网络训练     | 纯 Java 实现               |

### 关键术语

- **Model Zoo**：预训练模型仓库，可直接加载使用
- **Translator**：DJL 中将原始数据转换为模型输入的转换器
- **Predictor**：执行模型推理的组件
- **ChatLanguageModel**：LangChain4j 中的对话模型接口

## 快速上手

### DJL 图像分类

```java
// 添加依赖后，使用预训练模型进行图像分类
Model model = Model.newInstance("resnet");
model.load(Paths.get("model"));

// 创建翻译器，将图像转换为模型输入格式
Translator<Image, Classifications> translator = ImageClassificationTranslator.builder()
    .addTransform(new Resize(224, 224))
    .addTransform(new ToTensor())
    .build();

// 创建预测器并执行推理
Predictor<Image, Classifications> predictor = model.newPredictor(translator);
Image image = ImageFactory.getInstance().fromFile(Paths.get("photo.jpg"));
Classifications result = predictor.predict(image);
result.items().forEach(item ->
    System.out.println(item.getClassName() + ": " + item.getProbability()));
```

### LangChain4j 调用大语言模型

```java
// 配置并调用 OpenAI 模型
ChatLanguageModel model = OpenAiChatModel.builder()
    .apiKey(System.getenv("OPENAI_API_KEY"))
    .modelName("gpt-4")
    .temperature(0.7)
    .build();

String response = model.generate("用Java实现快速排序");
System.out.println(response);
```

## 详细用法

### DJL 模型训练

```java
// 使用 DJL 训练一个简单的神经网络
Model model = Model.newInstance("mlp");
model.setBlock(new Mlp(784, 10, new int[]{128, 64}));

Trainer trainer = model.newTrainer(
    DefaultTrainingConfig.builder()
        .optDevices(Engine.getInstance().getDevices(1))
        .addTrainingListeners(TrainingListener.Defaults.logging())
        .build());

// 初始化训练器
trainer.initialize(new Shape(1, 784));

// 训练循环
for (int epoch = 0; epoch < 10; epoch++) {
    for (Batch batch : trainer.iterateDataset(trainDataset)) {
        EasyTrain.trainBatch(trainer, batch);
        trainer.step();
        batch.close();
    }
    // 每轮结束后验证
    EasyTrain.evaluate(trainer, validateDataset);
}
```

### LangChain4j 对话记忆

```java
// 带记忆的多轮对话
ChatMemory chatMemory = MessageWindowChatMemory.withMaxMessages(20);

ChatLanguageModel model = OpenAiChatModel.builder()
    .apiKey(System.getenv("OPENAI_API_KEY"))
    .modelName("gpt-4")
    .build();

// 创建带记忆的助手
Assistant assistant = AiServices.builder(Assistant.class)
    .chatLanguageModel(model)
    .chatMemory(chatMemory)
    .build();

// 多轮对话会自动保持上下文
String answer1 = assistant.chat("我叫张三");
String answer2 = assistant.chat("我叫什么名字？"); // 会回答"张三"
```

### LangChain4j RAG 管道

```java
// 构建简单的 RAG（检索增强生成）管道
EmbeddingStore<TextSegment> embeddingStore = new InMemoryEmbeddingStore<>();
EmbeddingModel embeddingModel = new AllMiniLmL6V2QuantizedEmbeddingModel();

// 文档切分与嵌入
DocumentSplitter splitter = DocumentSplitters.recursive(300, 0);
Document document = FileSystemDocumentLoader.loadDocument(Path.of("knowledge.txt"));
List<TextSegment> segments = splitter.split(document);

// 存入向量库
List<Embedding> embeddings = embeddingModel.embedAll(segments).content();
embeddingStore.addAll(embeddings, segments);

// 创建检索器
ContentRetriever retriever = EmbeddingStoreContentRetriever.builder()
    .embeddingStore(embeddingStore)
    .embeddingModel(embeddingModel)
    .maxResults(3)
    .build();

// 构建带 RAG 的助手
Assistant assistant = AiServices.builder(Assistant.class)
    .chatLanguageModel(model)
    .contentRetriever(retriever)
    .build();
```

## 常见场景

### AI 服务封装

```java
// 将 AI 能力封装为 Spring Boot 服务
@Service
public class AiService {
    private final ChatLanguageModel chatModel;

    public AiService() {
        this.chatModel = OpenAiChatModel.builder()
            .apiKey(System.getenv("OPENAI_API_KEY"))
            .modelName("gpt-4")
            .build();
    }

    public String summarize(String text) {
        return chatModel.generate("请总结以下内容：\n" + text);
    }

    public String translate(String text, String targetLang) {
        return chatModel.generate(
            "将以下内容翻译为" + targetLang + "：\n" + text);
    }
}
```

### 结构化输出

```java
// 使用 LangChain4j 获取结构化输出
record Sentiment(String label, double confidence) {}

interface SentimentAnalyzer {
    @UserMessage("分析以下文本的情感倾向：{{text}}")
    Sentiment analyze(@V("text") String text);
}

SentimentAnalyzer analyzer = AiServices.create(SentimentAnalyzer.class, model);
Sentiment result = analyzer.analyze("这个产品非常好用，我很满意！");
// result.label() -> "正面", result.confidence() -> 0.95
```

## 注意事项

- DJL 运行时需要下载引擎原生库，首次启动较慢，建议在构建阶段预下载
- LangChain4j 调用外部 API 需要处理网络超时和限流，生产环境建议配置重试策略
- 模型推理是 CPU/GPU 密集型操作，建议在线程池中执行，避免阻塞主线程
- 向量嵌入模型的维度必须与向量存储的维度匹配，否则检索结果会出错
- Java 的 AI 生态更新较快，建议关注 DJL 和 LangChain4j 的最新版本

## 进阶用法

### 自定义工具调用

```java
// 让 LLM 调用 Java 方法（Function Calling）
@Tool("查询指定城市的天气信息")
String getWeather(@P("城市名称") String city) {
    // 实际调用天气 API
    return weatherClient.query(city);
}

interface WeatherAssistant {
    String chat(String userMessage);
}

WeatherAssistant assistant = AiServices.builder(WeatherAssistant.class)
    .chatLanguageModel(model)
    .tools(new Object() {
        @Tool("查询天气")
        String getWeather(@P("城市") String city) {
            return weatherClient.query(city);
        }
    })
    .build();

// 用户提问时，模型会自动判断是否需要调用工具
String answer = assistant.chat("北京今天天气怎么样？");
```

### 流式输出

```java
// 使用流式输出提升用户体验
StreamingChatLanguageModel streamingModel = OpenAiStreamingChatModel.builder()
    .apiKey(System.getenv("OPENAI_API_KEY"))
    .modelName("gpt-4")
    .build();

TokenStream tokenStream = streamingModel.chat("解释量子计算的基本原理");
tokenStream.onNext(token -> System.out.print(token))  // 逐 token 输出
    .onComplete(response -> System.out.println("\n[完成]"))
    .onError(Throwable::printStackTrace)
    .start();
```
