---
order: 66
title: Python与深度学习
module: python
category: Python
difficulty: advanced
description: PyTorch与TensorFlow
author: fanquanpp
updated: '2026-06-14'
related:
  - python/Python与GraphQL
  - python/Python与机器学习
  - python/Python与NLP
  - python/Python与计算机视觉
prerequisites:
  - python/语法速查
---

## 1. PyTorch

```python
import torch

model = torch.nn.Sequential(
  torch.nn.Linear(784, 256),
  torch.nn.ReLU(),
  torch.nn.Linear(256, 10)
)

optimizer = torch.optim.Adam(model.parameters())
loss_fn = torch.nn.CrossEntropyLoss()

for epoch in range(10):
  output = model(inputs)
  loss = loss_fn(output, labels)
  optimizer.zero_grad()
  loss.backward()
  optimizer.step()
```
