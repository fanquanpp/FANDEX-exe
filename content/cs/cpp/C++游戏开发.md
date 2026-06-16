---
order: 79
title: C++游戏开发
module: cpp
category: C++
difficulty: advanced
description: 游戏引擎与C++游戏开发
author: fanquanpp
updated: '2026-06-14'
related:
  - cpp/C++网络编程
  - cpp/C++图形编程
  - cpp/C++嵌入式开发
  - cpp/内存管理
prerequisites:
  - cpp/概述与现代标准
---

## 1. 游戏循环

```cpp
class Game {
  bool running_ = true;
public:
  void run() {
    auto last = std::chrono::high_resolution_clock::now();
    while (running_) {
      auto now = std::chrono::high_resolution_clock::now();
      float dt = std::chrono::duration<float>(now - last).count();
      last = now;
      processInput();
      update(dt);
      render();
    }
  }
};
```
