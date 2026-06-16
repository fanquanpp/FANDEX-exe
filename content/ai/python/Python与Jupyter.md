---
order: 83
title: Python与Jupyter
module: python
category: Python
difficulty: beginner
description: 'Jupyter Notebook与数据分析'
author: fanquanpp
updated: '2026-06-14'
related:
  - python/Python与设计模式
  - python/Python与打包发布
  - python/Python与虚拟环境
  - python/Python与代码质量
prerequisites:
  - python/语法速查
---

## 什么是 Jupyter

Jupyter Notebook 是一个交互式的编程环境，你可以在网页中编写和运行代码，还能在代码之间插入文字说明、公式和图表。它的名字来源于三种编程语言：Julia、Python 和 R。

Jupyter 是数据科学和机器学习领域最常用的工具。数据分析师用它来探索数据、可视化结果，研究人员用它来记录实验过程，教师用它来制作交互式教学材料。它的核心优势是"所见即所得"——代码的运行结果直接显示在代码下方，包括表格、图表等。

## 基础概念

### Notebook

Notebook 是 Jupyter 中的文档文件，扩展名为 .ipynb。一个 Notebook 由多个单元格（Cell）组成，每个单元格可以包含代码或文字。

### 单元格（Cell）

Notebook 中的每个单元格有两种类型：

- 代码单元格（Code Cell）：包含可执行的 Python 代码，运行后结果显示在单元格下方
- Markdown 单元格（Markdown Cell）：包含文字说明，支持 Markdown 语法，可以写标题、列表、公式等

### 内核（Kernel）

内核是实际执行代码的后台进程。每个 Notebook 都关联一个内核。当你在代码单元格中运行代码时，实际上是内核在执行。内核的状态（变量的值、导入的模块等）在所有单元格之间共享。

### JupyterLab

JupyterLab 是 Jupyter Notebook 的升级版，提供了更现代化的界面，支持同时打开多个 Notebook、文件浏览器、终端等功能。建议新项目直接使用 JupyterLab。

## 快速上手

### 安装 Jupyter

```bash
# 安装 JupyterLab（推荐）
pip install jupyterlab

# 或者安装经典版 Jupyter Notebook
pip install notebook

# 安装常用的数据科学库
pip install numpy pandas matplotlib
```

### 启动 Jupyter

```bash
# 启动 JupyterLab
jupyter lab

# 启动经典版 Notebook
jupyter notebook
```

启动后浏览器会自动打开 Jupyter 的界面。如果没有自动打开，终端会显示一个 URL，手动在浏览器中打开即可。

### 创建第一个 Notebook

在 JupyterLab 界面中，点击"Python 3"创建一个新的 Notebook。在第一个单元格中输入代码，按 Shift+Enter 运行：

```python
# 第一个 Jupyter 代码单元格
print("Hello, Jupyter!")
```

运行后，输出会显示在单元格下方，同时自动创建一个新的空单元格。

## 详细用法

### 常用快捷键

在命令模式（按 Esc 进入）下：

- Enter：进入编辑模式
- A：在当前单元格上方插入新单元格
- B：在当前单元格下方插入新单元格
- DD：删除当前单元格（快速按两次 D）
- M：将单元格切换为 Markdown 类型
- Y：将单元格切换为代码类型
- Shift+Enter：运行当前单元格并跳到下一个

在编辑模式（按 Enter 进入）下：

- Esc：回到命令模式
- Ctrl+Enter：运行当前单元格但不跳转
- Shift+Enter：运行当前单元格并跳到下一个
- Tab：代码补全
- Shift+Tab：查看函数文档

### 魔术命令

Jupyter 提供了特殊的"魔术命令"，以 % 或 %% 开头，用于执行特殊操作：

```python
# 行魔术命令（以 % 开头，只作用于一行）
%timeit sum(range(1000))        # 测量代码执行时间
%pwd                             # 显示当前工作目录
%ls                              # 列出当前目录的文件
%who                             # 列出当前定义的变量
%reset                           # 清除所有变量
%env                             # 查看环境变量
```

```python
# 单元格魔术命令（以 %% 开头，作用于整个单元格）
%%timeit
# 测量整个单元格的执行时间
total = 0
for i in range(10000):
    total += i
```

```python
# 将单元格内容写入文件
%%writefile script.py
def greet(name):
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("World"))
```

```python
# 在 Notebook 中加载外部 Python 文件
# %load script.py
```

```python
# 运行外部 Python 脚本
# %run script.py
```

### 数据可视化

Jupyter 最强大的功能之一是内联显示图表：

```python
# 在 Notebook 中显示 matplotlib 图表
%matplotlib inline

import matplotlib.pyplot as plt
import numpy as np

# 生成数据
x = np.linspace(0, 2 * np.pi, 100)
y = np.sin(x)

# 绘制图表
plt.figure(figsize=(8, 4))
plt.plot(x, y, label='sin(x)')
plt.title('正弦函数')
plt.xlabel('x')
plt.ylabel('y')
plt.legend()
plt.grid(True)
plt.show()
```

```python
# 使用 pandas 展示数据表格
import pandas as pd

# 创建示例数据
df = pd.DataFrame({
    '姓名': ['张三', '李四', '王五', '赵六'],
    '年龄': [25, 30, 28, 35],
    '城市': ['北京', '上海', '广州', '深圳'],
    '薪资': [15000, 20000, 18000, 25000],
})

# 直接显示 DataFrame（Jupyter 会渲染成美观的表格）
df
```

```python
# 查看数据统计信息
df.describe()
```

### 使用 Markdown 编写说明

将单元格切换为 Markdown 类型（按 M 键），可以编写格式化的文字说明：

```markdown
# 数据分析报告

## 1. 数据概览

本数据集包含 **4 条**记录，字段说明如下：

- 姓名：员工姓名
- 年龄：员工年龄
- 城市：所在城市
- 薪资：月薪（元）

## 2. 分析结论

平均薪资为 **19,500 元**，最高薪资为 25,000 元。
```

### 安装和使用扩展

```bash
# 安装 ipywidgets（交互式控件）
pip install ipywidgets

# 安装 nbconvert（导出 Notebook 为其他格式）
pip install nbconvert

# 安装 nbdev（用 Notebook 开发 Python 库）
pip install nbdev
```

使用交互式控件：

```python
import ipywidgets as widgets
from IPython.display import display

# 创建滑块控件
slider = widgets.IntSlider(
    value=50,
    min=0,
    max=100,
    step=1,
    description='数值:'
)
display(slider)

# 创建下拉选择框
dropdown = widgets.Dropdown(
    options=['北京', '上海', '广州', '深圳'],
    value='北京',
    description='城市:'
)
display(dropdown)
```

### 导出 Notebook

```bash
# 导出为 HTML
jupyter nbconvert notebook.ipynb --to html

# 导出为 PDF（需要安装 LaTeX）
jupyter nbconvert notebook.ipynb --to pdf

# 导出为 Python 脚本
jupyter nbconvert notebook.ipynb --to script

# 导出为 Markdown
jupyter nbconvert notebook.ipynb --to markdown
```

## 常见场景

### 探索性数据分析

```python
import pandas as pd
import matplotlib.pyplot as plt

# 读取数据
df = pd.read_csv('sales.csv')

# 查看前几行
df.head()

# 查看数据信息
df.info()

# 查看缺失值
df.isnull().sum()

# 按月份统计销售额
monthly = df.groupby('month')['sales'].sum()
monthly.plot(kind='bar', title='月度销售额')
plt.ylabel('销售额')
plt.show()
```

### 交互式数据分析

```python
from ipywidgets import interact
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('sales.csv')

@interact(column=df.select_dtypes(include='number').columns.tolist())
def plot_histogram(column):
    """交互式绘制直方图"""
    plt.figure(figsize=(8, 4))
    df[column].hist(bins=30)
    plt.title(f'{column} 分布')
    plt.xlabel(column)
    plt.ylabel('频次')
    plt.show()
```

### 机器学习实验记录

```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# 加载数据
iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=42
)

# 实验 1：n_estimators=50
clf1 = RandomForestClassifier(n_estimators=50, random_state=42)
clf1.fit(X_train, y_train)
acc1 = accuracy_score(y_test, clf1.predict(X_test))
print(f"n_estimators=50, 准确率: {acc1:.4f}")

# 实验 2：n_estimators=100
clf2 = RandomForestClassifier(n_estimators=100, random_state=42)
clf2.fit(X_train, y_train)
acc2 = accuracy_score(y_test, clf2.predict(X_test))
print(f"n_estimators=100, 准确率: {acc2:.4f}")

# 实验 3：n_estimators=200
clf3 = RandomForestClassifier(n_estimators=200, random_state=42)
clf3.fit(X_train, y_train)
acc3 = accuracy_score(y_test, clf3.predict(X_test))
print(f"n_estimators=200, 准确率: {acc3:.4f}")
```

## 注意事项与常见错误

### 变量状态容易混乱

Notebook 中的变量在所有单元格之间共享，而且单元格可以按任意顺序执行。这容易导致变量状态混乱。建议：

- 定期重启内核（Kernel -> Restart）清除所有状态
- 按从上到下的顺序执行单元格
- 在 Notebook 开头集中导入所有库和定义所有函数

### 大文件不要提交到 Git

.ipynb 文件包含输出结果和元数据，体积大且 diff 不友好。建议：

- 使用 .gitignore 忽略 .ipynb 文件中的输出
- 使用 nbstripout 工具在提交前清除输出
- 或者将分析结果导出为 .py 文件提交

### 长时间运行的任务

如果某个单元格运行时间很长，你无法中断它。可以使用 Kernel -> Interrupt 来强制停止当前执行。更安全的做法是在代码中加入超时机制。

### 内存泄漏

长时间运行的 Notebook 可能会占用大量内存。定期检查变量占用：

```python
# 查看占用内存最大的变量
import sys
sorted([(name, sys.getsizeof(value)) for name, value in globals().items()],
       key=lambda x: x[1], reverse=True)[:10]
```

## 进阶用法

### 使用 JupyterLab

JupyterLab 提供了更强大的功能：

- 左侧文件浏览器可以方便地管理文件
- 支持拖拽排列多个 Notebook 和终端
- 内置终端和文本编辑器
- 支持实时协作

### 使用 nbconvert 自动生成报告

将分析结果自动导出为 HTML 报告：

```bash
# 执行 Notebook 并导出为 HTML
jupyter nbconvert --execute analysis.ipynb --to html
```

### 远程访问 Jupyter

在服务器上运行 Jupyter，本地浏览器访问：

```bash
# 在远程服务器上启动
jupyter lab --no-browser --port=8888 --ip=0.0.0.0

# 或使用 SSH 隧道（更安全）
ssh -N -f -L localhost:8888:localhost:8888 user@remote-server
```

### 使用 VS Code 中的 Jupyter

VS Code 内置了 Jupyter 支持，可以直接在 VS Code 中打开和编辑 .ipynb 文件，无需启动浏览器。安装 Python 扩展后，创建 .ipynb 文件即可使用。
