---
order: 59
title: Python与Celery
module: python
category: Python
difficulty: intermediate
description: Celery异步任务队列
author: fanquanpp
updated: '2026-06-14'
related:
  - python/Python与Redis
  - python/Python与Docker
  - python/Python与消息队列
  - python/Python与Django
prerequisites:
  - python/语法速查
---

## 什么是 Celery

Celery 是 Python 中最流行的分布式任务队列框架。它让你把耗时的操作（如发送邮件、生成报表、处理视频）放到后台异步执行，而不是让用户等待。

Celery 的工作方式很简单：你在代码中定义一个任务函数，调用时这个函数不会立即执行，而是被放入消息队列中。后台的 Worker 进程从队列中取出任务并执行。调用方可以立即得到响应，不需要等待任务完成。

## 基础概念

### Broker（消息代理）

Broker 是 Celery 用来传递消息的中间件，最常用的是 Redis 和 RabbitMQ。生产者把任务消息发给 Broker，Worker 从 Broker 取出任务执行。

### Worker（工作进程）

Worker 是实际执行任务的后台进程。你可以启动多个 Worker 来并行处理任务，也可以在不同机器上启动 Worker 来分布式处理。

### Result Backend（结果后端）

Result Backend 用来存储任务的执行结果。如果你不需要获取任务结果，可以不配置。常用的有 Redis 和数据库。

### 任务状态

任务有以下几种状态：

- PENDING：等待执行
- STARTED：开始执行
- SUCCESS：执行成功
- FAILURE：执行失败
- RETRY：正在重试
- REVOKED：已撤销

## 快速上手

### 安装

```bash
# 安装 Celery 和 Redis 依赖
pip install celery redis
```

### 创建 Celery 应用

```python
# tasks.py
from celery import Celery

# 创建 Celery 实例，指定 Broker 为 Redis
app = Celery('myapp', broker='redis://localhost:6379/0')

# 定义一个异步任务
@app.task
def add(x, y):
    """简单的加法任务"""
    return x + y

@app.task
def send_email(to, subject, body):
    """模拟发送邮件"""
    import time
    time.sleep(5)  # 模拟耗时操作
    print(f"邮件已发送: {to} - {subject}")
    return True
```

### 启动 Worker

```bash
# 启动 Worker 进程
celery -A tasks worker --loglevel=info

# Windows 上需要使用 eventlet 或 gevent 池
pip install eventlet
celery -A tasks worker --loglevel=info --pool=eventlet
```

### 调用任务

```python
# 调用任务（不会阻塞，立即返回）
from tasks import add, send_email

# 方式一：异步调用（返回 AsyncResult 对象）
result = add.delay(4, 6)
print(f"任务 ID: {result.id}")

# 方式二：延迟执行（10 秒后执行）
result = add.apply_async(args=[4, 6], countdown=10)

# 方式三：指定时间执行
from datetime import datetime, timedelta
eta = datetime.now() + timedelta(hours=1)
result = add.apply_async(args=[4, 6], eta=eta)
```

## 详细用法

### 获取任务结果

```python
# 配置 Result Backend
app = Celery('myapp',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/1'  # 用不同的数据库存储结果
)

# 调用任务并获取结果
result = add.delay(4, 6)

# 检查任务是否完成
print(f"任务完成: {result.ready()}")

# 等待并获取结果（会阻塞）
print(f"结果: {result.get(timeout=10)}")

# 获取任务状态
print(f"状态: {result.status}")

# 获取任务 ID
print(f"ID: {result.id}")
```

### 任务重试

```python
@app.task(bind=True, max_retries=3)
def process_payment(self, order_id):
    """处理支付，失败时自动重试"""
    try:
        # 模拟支付处理
        result = call_payment_api(order_id)
        if not result:
            raise ValueError("支付接口返回失败")
        return result
    except Exception as exc:
        # 重试：5 秒后重试，指数退避
        raise self.retry(exc=exc, countdown=5 * (2 ** self.request.retries))
```

### 定时任务（Celery Beat）

Celery Beat 是 Celery 的定时任务调度器，可以按计划自动执行任务：

```python
# celery_config.py
from celery.schedules import crontab

beat_schedule = {
    # 每 30 秒执行一次
    'cleanup-every-30-seconds': {
        'task': 'tasks.cleanup',
        'schedule': 30.0,
    },
    # 每天凌晨 2 点执行
    'daily-report': {
        'task': 'tasks.generate_report',
        'schedule': crontab(hour=2, minute=0),
    },
    # 每周一上午 9 点执行
    'weekly-summary': {
        'task': 'tasks.weekly_summary',
        'schedule': crontab(hour=9, minute=0, day_of_week=1),
    },
}
```

```python
# tasks.py
app = Celery('myapp', broker='redis://localhost:6379/0')
app.config_from_object('celery_config')

@app.task
def cleanup():
    """清理过期数据"""
    print("清理过期数据...")

@app.task
def generate_report():
    """生成日报"""
    print("生成日报...")

@app.task
def weekly_summary():
    """生成周报"""
    print("生成周报...")
```

启动 Beat 调度器：

```bash
# 启动 Beat（与 Worker 分开运行）
celery -A tasks beat --loglevel=info

# 也可以把 Worker 和 Beat 一起启动
celery -A tasks worker --beat --loglevel=info
```

### 任务链（Chain）

任务链用于按顺序执行多个任务，前一个任务的结果作为后一个任务的输入：

```python
from celery import chain

# 定义几个任务
@app.task
def add(x, y):
    return x + y

@app.task
def multiply(x):
    return x * 10

@app.task
def display(result):
    print(f"最终结果: {result}")
    return result

# 创建任务链：add(4, 6) -> multiply(result) -> display(result)
workflow = chain(add.s(4, 6), multiply.s(), display.s())
result = workflow.apply_async()

# 等待最终结果
print(result.get())  # 100
```

### 任务组（Group）

任务组用于并行执行多个任务：

```python
from celery import group

@app.task
def process_item(item_id):
    """处理单个项目"""
    import time
    time.sleep(1)
    return f"项目 {item_id} 已处理"

# 并行处理多个项目
job = group(process_item.s(i) for i in range(10))
result = job.apply_async()

# 等待所有任务完成
print(result.get())  # ['项目 0 已处理', '项目 1 已处理', ...]
```

### 任务签名（Signature）

签名是任务的局部参数化，可以在不执行任务的情况下传递参数：

```python
# 创建签名（不立即执行）
task_sig = add.s(4, 6)

# 后续执行
result = task_sig.apply_async()

# 也可以在签名基础上添加参数
task_sig = add.s(4)  # 只传了第一个参数
result = task_sig.apply_async(args=(6,))  # 补充第二个参数
```

### 配置 Celery

```python
app = Celery('myapp')

# 通过配置字典设置
app.conf.update(
    broker_url='redis://localhost:6379/0',
    result_backend='redis://localhost:6379/1',
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='Asia/Shanghai',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,        # 任务最长执行 5 分钟
    task_soft_time_limit=270,   # 软超时 4.5 分钟（抛异常）
    worker_max_tasks_per_child=1000,  # 每个 Worker 处理 1000 个任务后重启
    worker_prefetch_multiplier=1,     # 每次只取一个任务
)
```

## 常见场景

### 异步发送邮件

```python
@app.task
def send_welcome_email(user_id):
    """异步发送欢迎邮件"""
    user = User.objects.get(id=user_id)
    send_mail(
        subject='欢迎注册',
        message=f'你好 {user.name}，欢迎加入我们！',
        from_email='noreply@example.com',
        recipient_list=[user.email],
    )
    return True

# 在视图中调用
def register(request):
    user = create_user(...)
    # 不等待邮件发送完成，立即返回
    send_welcome_email.delay(user.id)
    return Response("注册成功")
```

### 报表生成

```python
@app.task
def generate_monthly_report(year, month):
    """生成月度报表（耗时操作）"""
    data = fetch_sales_data(year, month)
    report = create_report(data)
    file_path = save_report(report, year, month)
    # 发送通知
    notify_report_ready.delay(file_path)
    return file_path

@app.task
def notify_report_ready(file_path):
    """通知报表已生成"""
    send_notification(f"月度报表已生成: {file_path}")
```

## 注意事项与常见错误

### Windows 不支持 prefork 池

Windows 上 Celery 默认的 prefork 池不可用，需要使用 eventlet 或 gevent：

```bash
pip install eventlet
celery -A tasks worker --pool=eventlet --loglevel=info
```

### 不要传递不可序列化的对象

任务参数必须能被序列化（JSON、pickle 等）。不要传递数据库模型实例、文件对象等：

```python
# 错误：传递了模型实例
# send_email.delay(user)

# 正确：传递 ID，在任务中查询
send_email.delay(user.id)
```

### 避免在任务中访问数据库连接

Worker 是长驻进程，数据库连接可能已过期。每次在任务中访问数据库时应该创建新连接。

### 任务幂等性

任务可能因为重试或 Worker 崩溃而被多次执行。设计任务时应该考虑幂等性——同一任务执行多次的效果和执行一次相同。

## 进阶用法

### 在 Django 中使用 Celery

```python
# myproject/celery.py
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
app = Celery('myproject')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
```

```python
# myproject/__init__.py
from .celery import app as celery_app
__all__ = ('celery_app',)
```

### 任务进度追踪

```python
@app.task(bind=True)
def long_process(self, total_steps):
    """长时间任务，报告进度"""
    for i in range(total_steps):
        # 执行一步
        do_step(i)
        # 更新进度
        self.update_state(
            state='PROGRESS',
            meta={'current': i + 1, 'total': total_steps}
        )
    return {'result': 'done'}

# 查询进度
result = long_process.delay(100)
if result.state == 'PROGRESS':
    progress = result.info['current'] / result.info['total'] * 100
    print(f"进度: {progress:.0f}%")
```

### 撤销任务

```python
# 撤销一个任务
result = add.delay(4, 6)
result.revoke()

# 撤销正在执行的任务（发送终止信号）
result.revoke(terminate=True)

# 撤销所有等待中的任务
app.control.purge()
```
