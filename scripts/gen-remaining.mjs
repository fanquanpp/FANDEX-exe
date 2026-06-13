import fs from 'fs';
import path from 'path';

const BASE = 'c:\\Atian\\Project\\Trae\\FANDEX-vue\\src\\content\\docs';

function fm(order, title, module, category, difficulty, description) {
  return `---
order: ${order}
title: '${title}'
module: '${module}'
category: '${category}'
difficulty: '${difficulty}'
description: '${description}'
author: 'fanquanpp'
updated: 2026-06-14
---`;
}

function writeFile(dir, filename, content) {
  const fullPath = path.join(BASE, dir, filename);
  if (fs.existsSync(fullPath)) {
    console.log(`SKIP: ${fullPath}`);
    return 0;
  }
  fs.writeFileSync(fullPath, content, 'utf-8');
  return 1;
}

let total = 0;
function addFile(moduleDir, category, order, title, desc, difficulty, content) {
  const filename = title + '.md';
  const fullContent = fm(order, title, moduleDir, category, difficulty, desc) + '\n\n' + content;
  total += writeFile(moduleDir, filename, fullContent);
}

// ==================== C# (14 files) ====================
addFile(
  'csharp',
  'C#',
  50,
  'LINQ深度解析',
  'LINQ查询语法与方法语法',
  'intermediate',
  `## 1. LINQ 语法

\`\`\`csharp
// 方法语法
var result = users
  .Where(u => u.Age > 18)
  .OrderBy(u => u.Name)
  .Select(u => new { u.Name, u.Age });

// 查询语法
var result2 = from u in users
              where u.Age > 18
              orderby u.Name
              select new { u.Name, u.Age };
\`\`\`

## 2. 常用操作符

| 操作符 | 说明 |
|--------|------|
| \`Where\` | 过滤 |
| \`Select\` | 投影 |
| \`OrderBy\` | 排序 |
| \`GroupBy\` | 分组 |
| \`Join\` | 连接 |
| \`Distinct\` | 去重 |
| \`Aggregate\` | 聚合 |
| \`Zip\` | 合并 |
`
);

addFile(
  'csharp',
  'C#',
  51,
  '异步编程详解',
  'async/await与Task',
  'intermediate',
  `## 1. async/await

\`\`\`csharp
async Task<string> FetchDataAsync(string url) {
  using var client = new HttpClient();
  return await client.GetStringAsync(url);
}

// 并行执行
var tasks = urls.Select(FetchDataAsync);
var results = await Task.WhenAll(tasks);
\`\`\`

## 2. ValueTask

\`\`\`csharp
// 同步结果时避免分配
async ValueTask<int> GetValueAsync() {
  if (cache.TryGetValue(key, out var value))
    return value; // 同步返回，无分配
  return await FetchFromDbAsync();
}
\`\`\`
`
);

addFile(
  'csharp',
  'C#',
  52,
  '模式匹配',
  'C#模式匹配与switch表达式',
  'intermediate',
  `## 1. 模式匹配

\`\`\`csharp
// 类型模式
if (obj is string s) Console.WriteLine(s.Length);

// 属性模式
if (person is { Age: >= 18, City: "Beijing" }) { }

// 列表模式（C# 11）
if (arr is [1, 2, .., 5]) { }

// switch 表达式
string label = status switch {
  200 => "OK",
  404 => "Not Found",
  >= 500 => "Server Error",
  _ => "Unknown"
};
\`\`\`
`
);

addFile(
  'csharp',
  'C#',
  53,
  '记录类型',
  'record类型与with表达式',
  'intermediate',
  `## 1. record

\`\`\`csharp
public record Person(string Name, int Age);

var p1 = new Person("Alice", 25);
var p2 = p1 with { Age = 26 }; // 不可变修改
Console.WriteLine(p1 == p2);    // false（值相等）
\`\`\`

## 2. record struct

\`\`\`csharp
public record struct Point(double X, double Y);
\`\`\`
`
);

addFile(
  'csharp',
  'C#',
  54,
  '泛型与协变逆变',
  '泛型约束与型变',
  'advanced',
  `## 1. 泛型约束

\`\`\`csharp
where T : class           // 引用类型
where T : struct          // 值类型
where T : new()           // 无参构造
where T : IEnumerable     // 实现接口
where T : BaseClass       // 继承基类
\`\`\`

## 2. 协变与逆变

\`\`\`csharp
interface IEnumerable<out T> { } // 协变
interface IComparer<in T> { }    // 逆变
\`\`\`
`
);

addFile(
  'csharp',
  'C#',
  55,
  'Span与Memory',
  '零分配内存操作',
  'advanced',
  `## 1. Span<T>

\`\`\`csharp
Span<int> span = stackalloc int[100];
span[0] = 42;

// 切片
Span<int> slice = span[10..20];

// 不需要 unsafe 的指针操作
void Process(Span<byte> buffer) {
  for (int i = 0; i < buffer.Length; i++)
    buffer[i] = (byte)(buffer[i] * 2);
}
\`\`\`

## 2. Memory<T>

\`\`\`csharp
// 可以存储在堆上，跨 async 边界
Memory<byte> memory = new byte[1024];
await ProcessAsync(memory);
\`\`\`
`
);

addFile(
  'csharp',
  'C#',
  56,
  '源生成器',
  'C# Source Generators',
  'advanced',
  `## 1. 源生成器

\`\`\`csharp
[Generator]
public class AutoNotifyGenerator : ISourceGenerator {
  public void Execute(GeneratorExecutionContext context) {
    // 扫描 [AutoNotify] 标记的属性
    // 生成 INotifyPropertyChanged 实现
  }
  public void Initialize(GeneratorInitializationContext context) { }
}
\`\`\`
`
);

addFile(
  'csharp',
  'C#',
  57,
  'C#与Unity游戏开发',
  'Unity脚本与组件系统',
  'intermediate',
  `## 1. MonoBehaviour

\`\`\`csharp
public class PlayerController : MonoBehaviour {
  public float speed = 5f;

  void Update() {
    float h = Input.GetAxis("Horizontal");
    float v = Input.GetAxis("Vertical");
    transform.Translate(new Vector3(h, 0, v) * speed * Time.deltaTime);
  }
}
\`\`\`

## 2. 协程

\`\`\`csharp
IEnumerator SpawnWaves() {
  while (true) {
    yield return new WaitForSeconds(2f);
    Instantiate(enemyPrefab, spawnPoint.position, Quaternion.identity);
  }
}
\`\`\`
`
);

addFile(
  'csharp',
  'C#',
  58,
  'C#与Blazor',
  'Blazor WebAssembly与Server',
  'intermediate',
  `## 1. Blazor 组件

\`\`\`razor
@page "/counter"
<h1>Counter: @count</h1>
<button @onclick="Increment">Click</button>

@code {
  private int count = 0;
  private void Increment() => count++;
}
\`\`\`
`
);

addFile(
  'csharp',
  'C#',
  59,
  'C#与MAUI',
  '.NET MAUI跨平台开发',
  'intermediate',
  `## 1. MAUI 页面

\`\`\`xml
<ContentPage>
  <VerticalStackLayout>
    <Label Text="Hello MAUI" />
    <Button Text="Click" Clicked="OnClicked" />
  </VerticalStackLayout>
</ContentPage>
\`\`\`
`
);

addFile(
  'csharp',
  'C#',
  60,
  'C#与EF Core',
  'Entity Framework Core',
  'intermediate',
  `## 1. DbContext

\`\`\`csharp
public class AppDbContext : DbContext {
  public DbSet<User> Users => Set<User>();
  protected override void OnConfiguring(DbContextOptionsBuilder options) =>
    options.UseSqlite("Data Source=app.db");
}

// 使用
await using var db = new AppDbContext();
var users = await db.Users.Where(u => u.Age > 18).ToListAsync();
\`\`\`
`
);

addFile(
  'csharp',
  'C#',
  61,
  'C#与依赖注入',
  '.NET依赖注入容器',
  'intermediate',
  `## 1. 注册与使用

\`\`\`csharp
// 注册
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddSingleton<ICache, MemoryCache>();

// 使用
public class UserController {
  private readonly IUserService _service;
  public UserController(IUserService service) => _service = service;
}
\`\`\`
`
);

addFile(
  'csharp',
  'C#',
  62,
  'C#与最小API',
  '.NET Minimal API',
  'beginner',
  `## 1. Minimal API

\`\`\`csharp
var app = WebApplication.CreateBuilder(args).Build();

app.MapGet("/hello", () => "Hello World!");
app.MapGet("/users/{id}", (int id) => userService.GetById(id));
app.MapPost("/users", (User user) => userService.Create(user));

app.Run();
\`\`\`
`
);

addFile(
  'csharp',
  'C#',
  63,
  'C#12与C#13新特性',
  '最新C#语言特性',
  'intermediate',
  `## 1. C# 12 新特性

- 主构造函数：\`class MyClass(int x) { }\`
- 集合表达式：\`int[] arr = [1, 2, 3];\`
- 内联数组
- ref readonly 参数

## 2. C# 13 新特性

- \`params\` 集合
- 部分属性
- 扩展类型
- 锁对象
`
);

addFile(
  'csharp',
  'C#',
  64,
  'C#与反射',
  '反射与表达式树',
  'advanced',
  `## 1. 反射

\`\`\`csharp
var type = typeof(User);
var props = type.GetProperties();
var method = type.GetMethod("GetName");
var result = method.Invoke(instance, null);
\`\`\`

## 2. 表达式树

\`\`\`csharp
Expression<Func<User, bool>> expr = u => u.Age > 18;
// 可以编译执行，也可以分析结构
var compiled = expr.Compile();
bool result = compiled(user);
\`\`\`
`
);

// ==================== Python (40 files) ====================
addFile(
  'python',
  'Python',
  50,
  '列表推导式进阶',
  '列表/字典/集合推导式与生成器表达式',
  'intermediate',
  `## 1. 推导式

\`\`\`python
# 列表推导
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]

# 字典推导
word_len = {w: len(w) for w in ['hello', 'world']}

# 集合推导
unique = {x % 5 for x in range(20)}

# 嵌套推导
flat = [x for row in matrix for x in row]
\`\`\`

## 2. 生成器表达式

\`\`\`python
# 惰性求值，节省内存
total = sum(x**2 for x in range(1000000))
\`\`\`
`
);

addFile(
  'python',
  'Python',
  51,
  '上下文管理器',
  'with语句与上下文协议',
  'intermediate',
  `## 1. 自定义上下文管理器

\`\`\`python
class Timer:
  def __enter__(self):
    self.start = time.time()
    return self
  def __exit__(self, *args):
    self.elapsed = time.time() - self.start
    print(f"耗时: {self.elapsed:.2f}s")

with Timer():
  do_something()
\`\`\`

## 2. contextmanager 装饰器

\`\`\`python
from contextlib import contextmanager

@contextmanager
def database_connection(url):
  conn = connect(url)
  try:
    yield conn
  finally:
    conn.close()
\`\`\`
`
);

addFile(
  'python',
  'Python',
  52,
  '元类',
  '元类与类创建过程',
  'advanced',
  `## 1. 元类基础

\`\`\`python
class Meta(type):
  def __new__(mcs, name, bases, namespace):
    # 修改类创建过程
    namespace['class_id'] = id(mcs)
    return super().__new__(mcs, name, bases, namespace)

class MyClass(metaclass=Meta):
  pass
\`\`\`

## 2. 实际应用

\`\`\`python
# 单例元类
class Singleton(type):
  _instances = {}
  def __call__(cls, *args, **kwargs):
    if cls not in cls._instances:
      cls._instances[cls] = super().__call__(*args, **kwargs)
    return cls._instances[cls]
\`\`\`
`
);

addFile(
  'python',
  'Python',
  53,
  '描述符协议',
  '描述符与属性访问控制',
  'advanced',
  `## 1. 描述符

\`\`\`python
class Validated:
  def __set_name__(self, owner, name):
    self.name = name
  def __get__(self, obj, objtype=None):
    return obj.__dict__.get(self.name)
  def __set__(self, obj, value):
    if not isinstance(value, (int, float)):
      raise TypeError(f"{self.name} must be numeric")
    obj.__dict__[self.name] = value

class Product:
  price = Validated()
\`\`\`
`
);

addFile(
  'python',
  'Python',
  54,
  '协程与asyncio',
  'async/await与异步IO',
  'intermediate',
  `## 1. async/await

\`\`\`python
import asyncio

async def fetch_data(url):
  async with aiohttp.ClientSession() as session:
    async with session.get(url) as response:
      return await response.json()

async def main():
  results = await asyncio.gather(
    fetch_data(url1),
    fetch_data(url2)
  )

asyncio.run(main())
\`\`\`
`
);

addFile(
  'python',
  'Python',
  55,
  '多进程与多线程',
  'threading与multiprocessing',
  'intermediate',
  `## 1. 多线程

\`\`\`python
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=4) as pool:
  results = pool.map(fetch_url, urls)
\`\`\`

## 2. 多进程

\`\`\`python
from multiprocessing import Pool

with Pool(4) as pool:
  results = pool.map(heavy_compute, data)
\`\`\`

## 3. GIL 限制

| 场景 | 推荐 |
|------|------|
| IO 密集 | 多线程/协程 |
| CPU 密集 | 多进程 |
`
);

addFile(
  'python',
  'Python',
  56,
  '类型注解与mypy',
  'Python类型系统与静态检查',
  'intermediate',
  `## 1. 类型注解

\`\`\`python
from typing import Optional, Union, List, Dict, Callable

def greet(name: str, age: int = 0) -> str:
  return f"Hello, {name}!"

def process(data: list[int] | None = None) -> dict[str, float]:
  return {}

# 类型别名
type Vector = list[float]
type Matrix = list[Vector]
\`\`\`

## 2. mypy

\`\`\`bash
mypy --strict my_module.py
\`\`\`
`
);

addFile(
  'python',
  'Python',
  57,
  '数据类与Pydantic',
  'dataclass与Pydantic模型',
  'intermediate',
  `## 1. dataclass

\`\`\`python
from dataclasses import dataclass, field

@dataclass
class User:
  name: str
  age: int
  tags: list[str] = field(default_factory=list)
\`\`\`

## 2. Pydantic

\`\`\`python
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
  name: str
  email: EmailStr
  age: int = Field(ge=0, le=150)

user = UserCreate(name="Alice", email="a@b.com", age=25)
user.model_dump_json()
\`\`\`
`
);

addFile(
  'python',
  'Python',
  58,
  'Python与FastAPI',
  'FastAPI框架开发',
  'intermediate',
  `## 1. FastAPI 基础

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

@app.get("/users/{user_id}")
async def get_user(user_id: int) -> User:
  return await user_service.get(user_id)

@app.post("/users")
async def create_user(user: UserCreate) -> User:
  return await user_service.create(user)
\`\`\`
`
);

addFile(
  'python',
  'Python',
  59,
  'Python与Django',
  'Django Web框架',
  'intermediate',
  `## 1. Django 基础

\`\`\`python
# models.py
class Article(models.Model):
  title = models.CharField(max_length=200)
  content = models.TextField()
  published = models.DateTimeField(auto_now_add=True)

# views.py
def article_list(request):
  articles = Article.objects.all()
  return render(request, 'articles.html', {'articles': articles})
\`\`\`
`
);

addFile(
  'python',
  'Python',
  60,
  'Python与SQLAlchemy',
  'SQLAlchemy ORM',
  'intermediate',
  `## 1. SQLAlchemy 2.0

\`\`\`python
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase

class Base(DeclarativeBase): pass

class User(Base):
  __tablename__ = "users"
  id: Mapped[int] = mapped_column(primary_key=True)
  name: Mapped[str] = mapped_column(String(50))

async with AsyncSession(engine) as session:
  result = await session.execute(select(User).where(User.name == "Alice"))
  user = result.scalar_one()
\`\`\`
`
);

addFile(
  'python',
  'Python',
  61,
  'Python与Celery',
  'Celery异步任务队列',
  'intermediate',
  `## 1. Celery 配置

\`\`\`python
from celery import Celery

app = Celery('tasks', broker='redis://localhost:6379')

@app.task
def process_data(data_id):
  data = fetch_data(data_id)
  return transform(data)

# 调用
result = process_data.delay(42)
result.get(timeout=30)
\`\`\`
`
);

addFile(
  'python',
  'Python',
  62,
  'Python与Docker',
  'Python容器化',
  'intermediate',
  `## 1. Dockerfile

\`\`\`dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`
`
);

addFile(
  'python',
  'Python',
  63,
  'Python与Redis',
  'Redis缓存与消息',
  'intermediate',
  `## 1. Redis 操作

\`\`\`python
import redis

r = redis.Redis(host='localhost', port=6379)

r.set('user:1:name', 'Alice', ex=3600)
name = r.get('user:1:name')

# 发布/订阅
pubsub = r.pubsub()
pubsub.subscribe('events')
for message in pubsub.listen():
  print(message)
\`\`\`
`
);

addFile(
  'python',
  'Python',
  64,
  'Python与GraphQL',
  'Strawberry与Ariadne',
  'intermediate',
  `## 1. Strawberry

\`\`\`python
import strawberry

@strawberry.type
class User:
  name: str
  age: int

@strawberry.type
class Query:
  @strawberry.field
  def user(self, id: int) -> User:
    return get_user(id)

schema = strawberry.Schema(query=Query)
\`\`\`
`
);

addFile(
  'python',
  'Python',
  65,
  'Python与机器学习',
  'scikit-learn与ML基础',
  'intermediate',
  `## 1. scikit-learn

\`\`\`python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
clf = RandomForestClassifier(n_estimators=100)
clf.fit(X_train, y_train)
accuracy = clf.score(X_test, y_test)
\`\`\`
`
);

addFile(
  'python',
  'Python',
  66,
  'Python与深度学习',
  'PyTorch与TensorFlow',
  'advanced',
  `## 1. PyTorch

\`\`\`python
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
\`\`\`
`
);

addFile(
  'python',
  'Python',
  67,
  'Python与NLP',
  '自然语言处理',
  'intermediate',
  `## 1. spaCy

\`\`\`python
import spacy

nlp = spacy.load("zh_core_web_sm")
doc = nlp("自然语言处理是人工智能的重要方向")

for ent in doc.ents:
  print(ent.text, ent.label_)
\`\`\`

## 2. Transformers

\`\`\`python
from transformers import pipeline

classifier = pipeline("sentiment-analysis")
result = classifier("这个产品非常好用")
\`\`\`
`
);

addFile(
  'python',
  'Python',
  68,
  'Python与计算机视觉',
  'OpenCV与图像处理',
  'intermediate',
  `## 1. OpenCV

\`\`\`python
import cv2

img = cv2.imread('photo.jpg')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 100, 200)
cv2.imwrite('edges.jpg', edges)
\`\`\`
`
);

addFile(
  'python',
  'Python',
  69,
  'Python与Web爬虫',
  'Scrapy与BeautifulSoup',
  'intermediate',
  `## 1. BeautifulSoup

\`\`\`python
from bs4 import BeautifulSoup
import requests

response = requests.get('https://example.com')
soup = BeautifulSoup(response.text, 'html.parser')
titles = [h2.text for h2 in soup.find_all('h2')]
\`\`\`

## 2. Scrapy

\`\`\`python
class QuotesSpider(scrapy.Spider):
  name = 'quotes'
  start_urls = ['https://quotes.toscrape.com']

  def parse(self, response):
    for quote in response.css('div.quote'):
      yield {'text': quote.css('span::text').get()}
\`\`\`
`
);

addFile(
  'python',
  'Python',
  70,
  'Python与自动化',
  '脚本自动化与任务调度',
  'intermediate',
  `## 1. 文件自动化

\`\`\`python
import shutil
from pathlib import Path

# 批量重命名
for f in Path('photos').glob('*.jpg'):
  new_name = f"IMG_{f.stat().st_mtime_ns}.jpg"
  f.rename(f.parent / new_name)
\`\`\`

## 2. 定时任务

\`\`\`python
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()
scheduler.add_job(cleanup, 'cron', hour=2)
scheduler.start()
\`\`\`
`
);

addFile(
  'python',
  'Python',
  71,
  'Python与测试',
  'pytest与测试最佳实践',
  'intermediate',
  `## 1. pytest

\`\`\`python
import pytest

@pytest.fixture
def user():
  return User(name="Alice", age=25)

def test_user_name(user):
  assert user.name == "Alice"

@pytest.mark.parametrize("input,expected", [
  (1, 2), (2, 4), (3, 6)
])
def test_double(input, expected):
  assert input * 2 == expected
\`\`\`
`
);

addFile(
  'python',
  'Python',
  72,
  'Python与日志',
  'logging模块与日志配置',
  'beginner',
  `## 1. logging

\`\`\`python
import logging

logging.basicConfig(
  level=logging.INFO,
  format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)

logger = logging.getLogger(__name__)
logger.info("Processing started")
logger.error("Something went wrong", exc_info=True)
\`\`\`
`
);

addFile(
  'python',
  'Python',
  73,
  'Python与加密',
  'cryptography与安全编程',
  'intermediate',
  `## 1. 加密

\`\`\`python
from cryptography.fernet import Fernet

key = Fernet.generate_key()
cipher = Fernet(key)
encrypted = cipher.encrypt(b"secret message")
decrypted = cipher.decrypt(encrypted)
\`\`\`

## 2. 哈希

\`\`\`python
import hashlib
hash = hashlib.sha256(data.encode()).hexdigest()

import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
bcrypt.checkpw(input.encode(), hashed)
\`\`\`
`
);

addFile(
  'python',
  'Python',
  74,
  'Python与CLI',
  'Click与命令行工具',
  'intermediate',
  `## 1. Click

\`\`\`python
import click

@click.command()
@click.option('--name', '-n', required=True, help='Your name')
@click.option('--count', default=1, type=int)
def hello(name, count):
  for _ in range(count):
    click.echo(f'Hello, {name}!')

if __name__ == '__main__':
  hello()
\`\`\`
`
);

addFile(
  'python',
  'Python',
  75,
  'Python与配置管理',
  '配置文件与环境变量',
  'beginner',
  `## 1. pydantic-settings

\`\`\`python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
  database_url: str = "sqlite:///db.sqlite3"
  secret_key: str
  debug: bool = False

  class Config:
    env_file = ".env"

settings = Settings()
\`\`\`
`
);

addFile(
  'python',
  'Python',
  76,
  'Python与消息队列',
  'RabbitMQ与Kafka',
  'intermediate',
  `## 1. Kafka

\`\`\`python
from kafka import KafkaProducer, KafkaConsumer

producer = KafkaProducer(bootstrap_servers='localhost:9092')
producer.send('topic', b'message')

consumer = KafkaConsumer('topic', bootstrap_servers='localhost:9092')
for msg in consumer:
  print(msg.value)
\`\`\`
`
);

addFile(
  'python',
  'Python',
  77,
  'Python与gRPC',
  'gRPC服务开发',
  'intermediate',
  `## 1. gRPC

\`\`\`python
import grpc

class GreeterServicer(greeter_pb2_grpc.GreeterServicer):
  def SayHello(self, request, context):
    return greeter_pb2.HelloReply(message=f"Hello, {request.name}!")

server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
greeter_pb2_grpc.add_GreeterServicer_to_server(GreeterServicer(), server)
server.add_insecure_port('[::]:50051')
server.start()
\`\`\`
`
);

addFile(
  'python',
  'Python',
  78,
  'Python与WebSocket',
  'WebSocket实时通信',
  'intermediate',
  `## 1. FastAPI WebSocket

\`\`\`python
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
  await websocket.accept()
  while True:
    data = await websocket.receive_text()
    await websocket.send_text(f"Echo: {data}")
\`\`\`
`
);

addFile(
  'python',
  'Python',
  79,
  'Python与CI-CD',
  'Python项目CI/CD',
  'intermediate',
  `## 1. GitHub Actions

\`\`\`yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install -r requirements.txt
      - run: pytest
      - run: ruff check .
\`\`\`
`
);

addFile(
  'python',
  'Python',
  80,
  'Python与性能优化',
  '性能分析与优化技巧',
  'advanced',
  `## 1. 性能分析

\`\`\`python
# cProfile
python -m cProfile -s time my_script.py

# line_profiler
@profile
def slow_function():
  ...

# memory_profiler
@profile
def memory_heavy():
  ...
\`\`\`

## 2. 优化技巧

- 使用 \`__slots__\` 减少内存
- 使用生成器代替列表
- 使用 NumPy 向量化
- 使用 Cython 加速
- 使用 \`functools.lru_cache\`
`
);

addFile(
  'python',
  'Python',
  81,
  'Python与设计模式',
  'Python实现设计模式',
  'intermediate',
  `## 1. 常用模式

\`\`\`python
# 单例
class Singleton:
  _instance = None
  def __new__(cls):
    if cls._instance is None:
      cls._instance = super().__new__(cls)
    return cls._instance

# 策略模式
class Sorter:
  def __init__(self, strategy): self.strategy = strategy
  def sort(self, data): return self.strategy(data)

# 观察者
class Observable:
  def __init__(self): self._observers = []
  def subscribe(self, obs): self._observers.append(obs)
  def notify(self, event):
    for obs in self._observers: obs(event)
\`\`\`
`
);

addFile(
  'python',
  'Python',
  82,
  'Python与打包发布',
  'PyPI与包发布',
  'intermediate',
  `## 1. pyproject.toml

\`\`\`toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "my-package"
version = "1.0.0"
dependencies = ["requests>=2.28"]
\`\`\`

## 2. 发布

\`\`\`bash
python -m build
twine upload dist/*
\`\`\`
`
);

addFile(
  'python',
  'Python',
  83,
  'Python与Jupyter',
  'Jupyter Notebook与数据分析',
  'beginner',
  `## 1. Jupyter 魔术命令

\`\`\`python
%timeit sum(range(1000))
%matplotlib inline
%%writefile script.py
\`\`\`

## 2. 常用扩展

- JupyterLab
- nbconvert
- ipywidgets
- nbdev
`
);

addFile(
  'python',
  'Python',
  84,
  'Python与虚拟环境',
  'venv、conda与环境管理',
  'beginner',
  `## 1. venv

\`\`\`bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\\Scripts\\activate     # Windows
pip install -r requirements.txt
\`\`\`

## 2. uv（现代替代）

\`\`\`bash
uv venv
uv pip install fastapi
uv pip compile requirements.in -o requirements.txt
\`\`\`
`
);

addFile(
  'python',
  'Python',
  85,
  'Python与代码质量',
  'Ruff、Black与代码规范',
  'beginner',
  `## 1. 工具链

\`\`\`bash
# Ruff — linter + formatter
ruff check .
ruff format .

# mypy — 类型检查
mypy --strict .

# pre-commit
pre-commit run --all-files
\`\`\`

## 2. pyproject.toml 配置

\`\`\`toml
[tool.ruff]
line-length = 88
select = ["E", "F", "I", "N", "UP"]

[tool.mypy]
strict = true
\`\`\`
`
);

addFile(
  'python',
  'Python',
  86,
  'Python与数据库迁移',
  'Alembic与数据库迁移',
  'intermediate',
  `## 1. Alembic

\`\`\`bash
alembic init migrations
alembic revision --autogenerate -m "add users table"
alembic upgrade head
alembic downgrade -1
\`\`\`
`
);

addFile(
  'python',
  'Python',
  87,
  'Python与OAuth2',
  'OAuth2与JWT认证',
  'intermediate',
  `## 1. FastAPI OAuth2

\`\`\`python
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.get("/me")
async def read_users_me(token: str = Depends(oauth2_scheme)):
  return decode_jwt(token)
\`\`\`
`
);

addFile(
  'python',
  'Python',
  88,
  'Python与WebSocket-2',
  'Socket.IO与实时应用',
  'intermediate',
  `## 1. Socket.IO

\`\`\`python
from fastapi import FastAPI
from socketio import ASGIApp, AsyncServer

sio = AsyncServer(async_mode='asgi')
app = FastAPI()
socket_app = ASGIApp(sio, app)

@sio.event
async def connect(sid, environ):
  print(f"Client {sid} connected")

@sio.event
async def message(sid, data):
  await sio.emit('response', data, room=sid)
\`\`\`
`
);

addFile(
  'python',
  'Python',
  89,
  'Python与向量数据库',
  '向量搜索与RAG',
  'advanced',
  `## 1. ChromaDB

\`\`\`python
import chromadb

client = chromadb.PersistentClient()
collection = client.get_or_create_collection("docs")

collection.add(documents=["Hello world"], ids=["1"])
results = collection.query(query_texts=["Hi"], n_results=5)
\`\`\`
`
);

// ==================== Go (40 files) ====================
addFile(
  'go',
  'Go',
  50,
  '切片原理',
  'Go切片底层实现与扩容',
  'intermediate',
  `## 1. 切片结构

\`\`\`go
type slice struct {
  array unsafe.Pointer
  len   int
  cap   int
}
\`\`\`

## 2. 扩容策略

\`\`\`go
// 旧容量 < 256: 新容量 = 旧容量 * 2
// 旧容量 >= 256: 新容量 = 旧容量 * 1.25 + 192
\`\`\`

## 3. 常见陷阱

\`\`\`go
// 切片共享底层数组
a := []int{1, 2, 3, 4, 5}
b := a[1:3]
b[0] = 99 // a[1] 也变成 99

// 使用 copy 避免共享
c := make([]int, len(b))
copy(c, b)
\`\`\`
`
);

addFile(
  'go',
  'Go',
  51,
  'Map原理',
  'Go map底层实现',
  'advanced',
  `## 1. 哈希表结构

\`\`\`go
type hmap struct {
  count     int
  B         uint8
  hash0     uint32
  buckets   unsafe.Pointer
  oldbuckets unsafe.Pointer
}
\`\`\`

## 2. 渐进式扩容

- 等量扩容：整理溢出桶
- 增量扩容：桶数翻倍，搬迁分批进行

## 3. 非并发安全

\`\`\`go
// 并发读写 panic
// 使用 sync.RWMutex 或 sync.Map
\`\`\`
`
);

addFile(
  'go',
  'Go',
  52,
  'Channel原理',
  'Channel底层实现与调度',
  'advanced',
  `## 1. Channel 结构

\`\`\`go
type hchan struct {
  qcount   uint
  dataqsiz uint
  buf      unsafe.Pointer
  sendx    uint
  recvx    uint
  sendq    waitq
  recvq    waitq
  lock     mutex
}
\`\`\`

## 2. 发送与接收

- 无缓冲：发送方阻塞直到接收方就绪
- 有缓冲：缓冲区满时发送方阻塞
- 关闭 channel：接收方获取零值

## 3. select 实现

随机选择一个就绪的 case 执行。
`
);

addFile(
  'go',
  'Go',
  53,
  'Goroutine调度',
  'GMP调度模型',
  'advanced',
  `## 1. GMP 模型

| 概念 | 说明 |
|------|------|
| G (Goroutine) | 协程 |
| M (Machine) | 系统线程 |
| P (Processor) | 逻辑处理器 |

## 2. 调度策略

- Work Stealing：P 从其他 P 偷 G
- Hand Off：M 阻塞时释放 P
- 抢占式调度：基于信号的抢占（Go 1.14+）
`
);

addFile(
  'go',
  'Go',
  54,
  'Context详解',
  'context.Context与取消传播',
  'intermediate',
  `## 1. 基本用法

\`\`\`go
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

result, err := fetchWithTimeout(ctx, url)
\`\`\`

## 2. 传播取消

\`\`\`go
func handler(ctx context.Context) {
  go func() {
    select {
    case <-ctx.Done():
      log.Println("Cancelled:", ctx.Err())
    case <-time.After(10 * time.Second):
      log.Println("Done")
    }
  }()
}
\`\`\`
`
);

addFile(
  'go',
  'Go',
  55,
  '接口与类型断言',
  'Go接口与动态派发',
  'intermediate',
  `## 1. 接口

\`\`\`go
type Reader interface {
  Read(p []byte) (n int, err error)
}

// 隐式实现
type MyReader struct{}
func (r MyReader) Read(p []byte) (int, error) { return 0, nil }
\`\`\`

## 2. 类型断言

\`\`\`go
var r Reader = MyReader{}
if mr, ok := r.(MyReader); ok {
  // 使用 mr
}

// type switch
switch v := r.(type) {
case MyReader: fmt.Println("MyReader")
case *Buffer:  fmt.Println("Buffer")
}
\`\`\`
`
);

addFile(
  'go',
  'Go',
  56,
  '错误处理进阶',
  '错误包装、检查与自定义错误',
  'intermediate',
  `## 1. 错误包装

\`\`\`go
if err != nil {
  return fmt.Errorf("failed to read config: %w", err)
}

// 检查
errors.Is(err, os.ErrNotExist)
errors.As(err, &pathErr)
\`\`\`

## 2. 自定义错误

\`\`\`go
type AppError struct {
  Code    string
  Message string
  Cause   error
}

func (e *AppError) Error() string { return e.Message }
func (e *AppError) Unwrap() error { return e.Cause }
\`\`\`
`
);

addFile(
  'go',
  'Go',
  57,
  '泛型详解',
  'Go 1.18+泛型',
  'intermediate',
  `## 1. 泛型函数

\`\`\`go
func Map[T any, R any](s []T, f func(T) R) []R {
  result := make([]R, len(s))
  for i, v := range s { result[i] = f(v) }
  return result
}
\`\`\`

## 2. 类型约束

\`\`\`go
type Number interface {
  ~int | ~int8 | ~int16 | ~int32 | ~int64 |
  ~float32 | ~float64
}

func Sum[T Number](nums []T) T {
  var total T
  for _, n := range nums { total += n }
  return total
}
\`\`\`
`
);

addFile(
  'go',
  'Go',
  58,
  '反射',
  'reflect包与运行时类型信息',
  'advanced',
  `## 1. 基本反射

\`\`\`go
import "reflect"

t := reflect.TypeOf(42)          // int
v := reflect.ValueOf("hello")    // string

// 结构体字段
s := reflect.TypeOf(User{})
for i := 0; i < s.NumField(); i++ {
  f := s.Field(i)
  fmt.Println(f.Name, f.Type)
}
\`\`\`
`
);

addFile(
  'go',
  'Go',
  59,
  'unsafe与指针',
  'unsafe包与指针操作',
  'advanced',
  `## 1. unsafe 操作

\`\`\`go
import "unsafe"

// 获取偏移量
offset := unsafe.Offsetof(struct{}.Field)

// 指针转换
ptr := unsafe.Pointer(&x)
*(*int)(ptr) = 42

// SliceHeader
hdr := (*reflect.SliceHeader)(unsafe.Pointer(&slice))
\`\`\`
`
);

addFile(
  'go',
  'Go',
  60,
  '内存对齐',
  'Go结构体内存对齐',
  'intermediate',
  `## 1. 对齐规则

\`\`\`go
// Bad: 24 bytes
type Bad struct {
  a bool   // 1 + 7 padding
  b int64  // 8
  c int32  // 4 + 4 padding
}

// Good: 16 bytes
type Good struct {
  b int64  // 8
  c int32  // 4
  a bool   // 1 + 3 padding
}
\`\`\`
`
);

addFile(
  'go',
  'Go',
  61,
  'Go与gRPC',
  'gRPC服务开发',
  'intermediate',
  `## 1. gRPC 服务

\`\`\`go
type GreeterServer struct { pb.UnimplementedGreeterServer }

func (s *GreeterServer) SayHello(ctx context.Context, req *pb.HelloRequest) (*pb.HelloReply, error) {
  return &pb.HelloReply{Message: "Hello " + req.Name}, nil
}

lis, _ := net.Listen("tcp", ":50051")
grpc.NewServer().Serve(lis)
\`\`\`
`
);

addFile(
  'go',
  'Go',
  62,
  'Go与GraphQL',
  'gqlgen GraphQL框架',
  'intermediate',
  `## 1. gqlgen

\`\`\`go
//go:generate go run github.com/99designs/gqlgen generate

func (r *queryResolver) Users(ctx context.Context) ([]*model.User, error) {
  return r.userService.GetAll(ctx)
}
\`\`\`
`
);

addFile(
  'go',
  'Go',
  63,
  'Go与Docker',
  'Go容器化与多阶段构建',
  'intermediate',
  `## 1. 多阶段构建

\`\`\`dockerfile
FROM golang:1.22 AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /server .

FROM alpine:3.19
COPY --from=builder /server /server
ENTRYPOINT ["/server"]
\`\`\`
`
);

addFile(
  'go',
  'Go',
  64,
  'Go与Kubernetes',
  'client-go与K8s开发',
  'advanced',
  `## 1. client-go

\`\`\`go
config, _ := rest.InClusterConfig()
clientset, _ := kubernetes.NewForConfig(config)

pods, _ := clientset.CoreV1().Pods("default").List(ctx, metav1.ListOptions{})
for _, pod := range pods.Items {
  fmt.Println(pod.Name)
}
\`\`\`
`
);

addFile(
  'go',
  'Go',
  65,
  'Go与数据库',
  'database/sql与GORM',
  'intermediate',
  `## 1. database/sql

\`\`\`go
db, _ := sql.Open("postgres", connStr)
row := db.QueryRowContext(ctx, "SELECT name FROM users WHERE id = $1", id)
var name string
row.Scan(&name)
\`\`\`

## 2. GORM

\`\`\`go
var user User
db.First(&user, 1)
db.Where("age > ?", 18).Find(&users)
\`\`\`
`
);

addFile(
  'go',
  'Go',
  66,
  'Go与Redis',
  'go-redis客户端',
  'intermediate',
  `## 1. go-redis

\`\`\`go
rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
rdb.Set(ctx, "key", "value", time.Hour)
val, _ := rdb.Get(ctx, "key").Result()
\`\`\`
`
);

addFile(
  'go',
  'Go',
  67,
  'Go与消息队列',
  'Kafka与NATS',
  'intermediate',
  `## 1. Kafka (confluent-kafka-go)

\`\`\`go
p, _ := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": "localhost:9092"})
p.Produce(&kafka.Message{TopicPartition: kafka.TopicPartition{Topic: &topic}, Value: []byte(msg)}, nil)
\`\`\`
`
);

addFile(
  'go',
  'Go',
  68,
  'Go与测试',
  'Go测试框架与基准测试',
  'intermediate',
  `## 1. 测试

\`\`\`go
func TestAdd(t *testing.T) {
  if add(1, 2) != 3 { t.Error("expected 3") }
}

func BenchmarkAdd(b *testing.B) {
  for i := 0; i < b.N; i++ { add(1, 2) }
}

// 表驱动测试
func TestParse(t *testing.T) {
  tests := []struct{ input, expected string }{
    {"hello", "HELLO"},
    {"world", "WORLD"},
  }
  for _, tt := range tests {
    if got := parse(tt.input); got != tt.expected {
      t.Errorf("parse(%q) = %q, want %q", tt.input, got, tt.expected)
    }
  }
}
\`\`\`
`
);

addFile(
  'go',
  'Go',
  69,
  'Go与Fuzzing',
  'Go模糊测试',
  'intermediate',
  `## 1. Fuzzing

\`\`\`go
func FuzzReverse(f *testing.F) {
  f.Add("hello")
  f.Fuzz(func(t *testing.T, orig string) {
    rev := reverse(orig)
    if reverse(rev) != orig {
      t.Errorf("reverse(reverse(%q)) = %q", orig, reverse(rev))
    }
  })
}
\`\`\`
`
);

addFile(
  'go',
  'Go',
  70,
  'Go与性能分析',
  'pprof与性能调优',
  'advanced',
  `## 1. pprof

\`\`\`go
import _ "net/http/pprof"

go http.ListenAndServe(":6060", nil)
\`\`\`

\`\`\`bash
go tool pprof http://localhost:6060/debug/pprof/profile
go tool pprof http://localhost:6060/debug/pprof/heap
\`\`\`
`
);

addFile(
  'go',
  'Go',
  71,
  'Go与CGO',
  'CGO与C互操作',
  'advanced',
  `## 1. CGO

\`\`\`go
/*
#include <stdio.h>
void say_hello() { printf("Hello from C!\\n"); }
*/
import "C"

C.say_hello()
\`\`\`
`
);

addFile(
  'go',
  'Go',
  72,
  'Go与Wasm',
  'Go编译为WebAssembly',
  'advanced',
  `## 1. 编译

\`\`\`bash
GOOS=js GOARCH=wasm go build -o main.wasm
\`\`\`

## 2. 与 JavaScript 交互

\`\`\`go
import "syscall/js"

js.Global().Get("console").Call("log", "Hello from Go!")
\`\`\`
`
);

addFile(
  'go',
  'Go',
  73,
  'Go与代码生成',
  'go generate与代码生成',
  'intermediate',
  `## 1. go generate

\`\`\`go
//go:generate go run github.com/sqlc-dev/sqlc/cmd/sqlc generate
//go:generate mockgen -source=service.go -destination=mock/service.go
\`\`\`

\`\`\`bash
go generate ./...
\`\`\`
`
);

addFile(
  'go',
  'Go',
  74,
  'Go与依赖注入',
  'Wire与依赖注入',
  'intermediate',
  `## 1. Wire

\`\`\`go
//go:build wireinject

func InitializeApp() (*App, error) {
  wire.Build(
    NewDB,
    NewRepository,
    NewService,
    NewHandler,
    wire.Struct(new(App), "*"),
  )
  return nil, nil
}
\`\`\`
`
);

addFile(
  'go',
  'Go',
  75,
  'Go与配置管理',
  'Viper与配置',
  'intermediate',
  `## 1. Viper

\`\`\`go
viper.SetConfigName("config")
viper.AddConfigPath(".")
viper.ReadInConfig()

dbURL := viper.GetString("database.url")
port := viper.GetInt("server.port")
\`\`\`
`
);

addFile(
  'go',
  'Go',
  76,
  'Go与日志',
  'slog与结构化日志',
  'beginner',
  `## 1. slog（Go 1.21+）

\`\`\`go
import "log/slog"

slog.Info("request processed",
  "method", r.Method,
  "path", r.URL.Path,
  "duration", elapsed,
)
\`\`\`
`
);

addFile(
  'go',
  'Go',
  77,
  'Go与模板',
  'text/template与html/template',
  'intermediate',
  `## 1. 模板

\`\`\`go
tmpl := template.Must(template.New("hello").Parse("Hello, {{.Name}}!"))
tmpl.Execute(os.Stdout, struct{ Name string }{"Alice"})
\`\`\`
`
);

addFile(
  'go',
  'Go',
  78,
  'Go与加密',
  'crypto包与安全编程',
  'intermediate',
  `## 1. 加密

\`\`\`go
import "crypto/sha256"
hash := sha256.Sum256([]byte("hello"))

import "crypto/rand"
token := make([]byte, 32)
rand.Read(token)
\`\`\`
`
);

addFile(
  'go',
  'Go',
  79,
  'Go与信号处理',
  '信号处理与优雅关闭',
  'intermediate',
  `## 1. 优雅关闭

\`\`\`go
sigChan := make(chan os.Signal, 1)
signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

<-sigChan
log.Println("Shutting down...")
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()
server.Shutdown(ctx)
\`\`\`
`
);

addFile(
  'go',
  'Go',
  80,
  'Go与文件监控',
  'fsnotify与文件变更',
  'intermediate',
  `## 1. fsnotify

\`\`\`go
watcher, _ := fsnotify.NewWatcher()
watcher.Add("./config.yaml")

for {
  select {
  case event := <-watcher.Events:
    if event.Has(fsnotify.Write) { reloadConfig() }
  case err := <-watcher.Errors:
    log.Println("Error:", err)
  }
}
\`\`\`
`
);

addFile(
  'go',
  'Go',
  81,
  'Go与正则表达式',
  'regexp包详解',
  'intermediate',
  `## 1. 正则

\`\`\`go
re := regexp.MustCompile(\`\\d{4}-\\d{2}-\\d{2}\`)
match := re.FindString("Date: 2026-06-14")
groups := re.FindStringSubmatch("2026-06-14")
result := re.ReplaceAllString(text, "YYYY-MM-DD")
\`\`\`
`
);

addFile(
  'go',
  'Go',
  82,
  'Go与时间',
  'time包详解',
  'beginner',
  `## 1. 时间操作

\`\`\`go
now := time.Now()
tomorrow := now.Add(24 * time.Hour)
formatted := now.Format("2006-01-02 15:04:05")
parsed, _ := time.Parse("2006-01-02", "2026-06-14")

// 计时
start := time.Now()
doWork()
elapsed := time.Since(start)
\`\`\`
`
);

addFile(
  'go',
  'Go',
  83,
  'Go与JSON',
  'encoding/json详解',
  'intermediate',
  `## 1. JSON

\`\`\`go
type User struct {
  Name  string \`json:"name"\`
  Age   int    \`json:"age"\`
  Email string \`json:"email,omitempty"\`
}

data, _ := json.Marshal(user)
json.Unmarshal(data, &user)

// Decoder（流式）
decoder := json.NewDecoder(r.Body)
decoder.Decode(&user)
\`\`\`
`
);

addFile(
  'go',
  'Go',
  84,
  'Go与HTTP客户端',
  'net/http与HTTP请求',
  'intermediate',
  `## 1. HTTP 客户端

\`\`\`go
client := &http.Client{Timeout: 10 * time.Second}
resp, _ := client.Get("https://api.example.com/data")
defer resp.Body.Close()
body, _ := io.ReadAll(resp.Body)
\`\`\`
`
);

addFile(
  'go',
  'Go',
  85,
  'Go与HTTP服务器',
  'net/http与路由',
  'intermediate',
  `## 1. HTTP 服务器

\`\`\`go
mux := http.NewServeMux()
mux.HandleFunc("GET /users/{id}", func(w http.ResponseWriter, r *http.Request) {
  id := r.PathValue("id")
  json.NewEncoder(w).Encode(getUser(id))
})

http.ListenAndServe(":8080", mux)
\`\`\`
`
);

addFile(
  'go',
  'Go',
  86,
  'Go与中间件',
  'HTTP中间件模式',
  'intermediate',
  `## 1. 中间件

\`\`\`go
func Logging(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    start := time.Now()
    next.ServeHTTP(w, r)
    log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
  })
}

// 链式
handler := Logging(Auth(Recovery(mux)))
\`\`\`
`
);

addFile(
  'go',
  'Go',
  87,
  'Go与OAuth2',
  'OAuth2客户端实现',
  'intermediate',
  `## 1. golang.org/x/oauth2

\`\`\`go
config := &oauth2.Config{
  ClientID:     "client-id",
  ClientSecret: "client-secret",
  Scopes:       []string{"openid", "profile"},
  Endpoint:     google.Endpoint,
}
url := config.AuthCodeURL("state")
token, _ := config.Exchange(ctx, code)
client := config.Client(ctx, token)
\`\`\`
`
);

addFile(
  'go',
  'Go',
  88,
  'Go与分布式追踪',
  'OpenTelemetry集成',
  'advanced',
  `## 1. OpenTelemetry

\`\`\`go
import "go.opentelemetry.io/otel"

ctx, span := otel.Tracer("app").Start(ctx, "process")
defer span.End()
// ... 业务逻辑
span.SetAttributes(attribute.String("key", "value"))
\`\`\`
`
);

addFile(
  'go',
  'Go',
  89,
  'Go与限流',
  '限流与熔断',
  'intermediate',
  `## 1. 限流

\`\`\`go
import "golang.org/x/time/rate"

limiter := rate.NewLimiter(100, 10) // 100/s, burst 10
if !limiter.Allow() {
  http.Error(w, "Too Many Requests", 429)
  return
}
\`\`\`
`
);

// ==================== Lua (16 files) ====================
addFile(
  'lua',
  'Lua',
  50,
  '表与元表进阶',
  'Lua表操作与元表机制',
  'intermediate',
  `## 1. 元表

\`\`\`lua
local vector = {x = 0, y = 0}
local mt = {
  __add = function(a, b) return {x = a.x + b.x, y = a.y + b.y} end,
  __tostring = function(v) return string.format("(%g, %g)", v.x, v.y) end
}
setmetatable(vector, mt)
\`\`\`

## 2. 元方法

| 元方法 | 说明 |
|--------|------|
| \`__add\` | + |
| \`__sub\` | - |
| \`__mul\` | * |
| \`__eq\` | == |
| \`__lt\` | < |
| \`__index\` | 索引访问 |
| \`__newindex\` | 索引赋值 |
| \`__call\` | 函数调用 |
`
);

addFile(
  'lua',
  'Lua',
  51,
  '面向对象编程',
  'Lua OOP实现',
  'intermediate',
  `## 1. 类实现

\`\`\`lua
local Class = {}
Class.__index = Class

function Class.new(x, y)
  return setmetatable({x = x, y = y}, Class)
end

function Class:area()
  return self.x * self.y
end

local obj = Class.new(3, 4)
print(obj:area()) -- 12
\`\`\`

## 2. 继承

\`\`\`lua
local Sub = setmetatable({}, {__index = Class})
Sub.__index = Sub

function Sub.new(x, y, z)
  local self = Class.new(x, y)
  setmetatable(self, Sub)
  self.z = z
  return self
end
\`\`\`
`
);

addFile(
  'lua',
  'Lua',
  52,
  '协程详解',
  'Lua协程与多任务',
  'intermediate',
  `## 1. 协程

\`\`\`lua
local co = coroutine.create(function()
  for i = 1, 5 do
    coroutine.yield(i)
  end
end)

print(coroutine.resume(co)) -- true 1
print(coroutine.resume(co)) -- true 2
\`\`\`

## 2. 生产者-消费者

\`\`\`lua
function producer()
  return coroutine.wrap(function()
    while true do
      local value = io.read()
      if not value then return end
      coroutine.yield(value)
    end
  end)
end
\`\`\`
`
);

addFile(
  'lua',
  'Lua',
  53,
  '环境与模块',
  'Lua环境与require机制',
  'intermediate',
  `## 1. 模块

\`\`\`lua
-- mymodule.lua
local M = {}

function M.greet(name)
  return "Hello, " .. name
end

return M
\`\`\`

\`\`\`lua
local mymodule = require("mymodule")
print(mymodule.greet("World"))
\`\`\`
`
);

addFile(
  'lua',
  'Lua',
  54,
  '字符串模式匹配',
  'Lua模式匹配与正则',
  'intermediate',
  `## 1. 模式匹配

\`\`\`lua
string.find("Hello World", "World")  -- 7 11
string.match("2026-06-14", "%d+-%d+-%d+")
string.gsub("hello world", "(%w+)", string.upper)

-- 模式字符
-- %d 数字  %a 字母  %w 字母数字  %s 空白
-- + 1或多个  * 0或多个  ? 0或1个
\`\`\`
`
);

addFile(
  'lua',
  'Lua',
  55,
  'Lua与C交互',
  'Lua C API',
  'advanced',
  `## 1. C 函数注册

\`\`\`c
static int l_add(lua_State *L) {
  double a = luaL_checknumber(L, 1);
  double b = luaL_checknumber(L, 2);
  lua_pushnumber(L, a + b);
  return 1;
}

lua_register(L, "add", l_add);
\`\`\`
`
);

addFile(
  'lua',
  'Lua',
  56,
  'LuaJIT',
  'LuaJIT与FFI',
  'advanced',
  `## 1. FFI

\`\`\`lua
local ffi = require("ffi")

ffi.cdef[[
  int printf(const char *fmt, ...);
]]

ffi.C.printf("Hello from C!\\n")
\`\`\`
`
);

addFile(
  'lua',
  'Lua',
  57,
  'Lua与Love2D',
  'Love2D游戏开发',
  'intermediate',
  `## 1. Love2D 基础

\`\`\`lua
function love.load()
  player = {x = 100, y = 100, speed = 200}
end

function love.update(dt)
  if love.keyboard.isDown("right") then
    player.x = player.x + player.speed * dt
  end
end

function love.draw()
  love.graphics.rectangle("fill", player.x, player.y, 50, 50)
end
\`\`\`
`
);

addFile(
  'lua',
  'Lua',
  58,
  'Lua与Neovim',
  'Neovim Lua配置',
  'intermediate',
  `## 1. Neovim 配置

\`\`\`lua
-- init.lua
vim.opt.number = true
vim.opt.relativenumber = true

vim.keymap.set('n', '<leader>f', vim.lsp.buf.format, { desc = 'Format' })

-- 插件管理 (lazy.nvim)
require('lazy').setup({
  'nvim-treesitter/nvim-treesitter',
  'neovim/nvim-lspconfig',
})
\`\`\`
`
);

addFile(
  'lua',
  'Lua',
  59,
  'Lua与Redis脚本',
  'Redis Lua脚本',
  'intermediate',
  `## 1. Redis Lua

\`\`\`lua
-- 限流脚本
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local current = tonumber(redis.call('GET', key) or '0')
if current >= limit then
  return 0
end
redis.call('INCR', key)
redis.call('EXPIRE', key, window)
return 1
\`\`\`
`
);

addFile(
  'lua',
  'Lua',
  60,
  'Lua与Nginx',
  'OpenResty Lua开发',
  'intermediate',
  `## 1. OpenResty

\`\`\`lua
-- access_by_lua_block
local token = ngx.var.http_authorization
if not token then
  ngx.exit(401)
end

-- content_by_lua_block
ngx.say('{"status":"ok"}')
\`\`\`
`
);

addFile(
  'lua',
  'Lua',
  61,
  'Lua错误处理',
  '错误处理与保护调用',
  'beginner',
  `## 1. 错误处理

\`\`\`lua
-- pcall
local ok, result = pcall(function()
  return riskyOperation()
end)
if not ok then
  print("Error:", result)
end

-- xpcall（带错误处理函数）
local ok, result = xpcall(riskyFn, debug.traceback)
\`\`\`
`
);

addFile(
  'lua',
  'Lua',
  62,
  'Lua迭代器',
  '自定义迭代器',
  'intermediate',
  `## 1. 迭代器

\`\`\`lua
-- 简单迭代器
function range(n)
  local i = 0
  return function()
    i = i + 1
    if i <= n then return i end
  end
end

for i in range(5) do print(i) end

-- 泛型 for 状态迭代器
function pairs(t)
  return next, t, nil
end
\`\`\`
`
);

addFile(
  'lua',
  'Lua',
  63,
  'Lua与World of Warcraft',
  'WoW插件开发',
  'intermediate',
  `## 1. WoW 插件

\`\`\`lua
-- MyAddon.toc
## Title: My Addon
## Interface: 100205

-- MyAddon.lua
local frame = CreateFrame("Frame")
frame:RegisterEvent("PLAYER_ENTERING_WORLD")
frame:SetScript("OnEvent", function(self, event)
  print("Hello, " .. UnitName("player"))
end)
\`\`\`
`
);

addFile(
  'lua',
  'Lua',
  64,
  'Lua性能优化',
  'Lua性能优化技巧',
  'intermediate',
  `## 1. 优化技巧

- 使用局部变量代替全局变量
- 预分配表大小
- 避免在热路径创建闭包
- 使用 \`table.insert\` 的位置参数
- 字符串拼接使用 \`table.concat\`
- 使用 LuaJIT 获得更好性能
`
);

addFile(
  'lua',
  'Lua',
  65,
  'Lua调试技巧',
  '调试与性能分析',
  'intermediate',
  `## 1. 调试

\`\`\`lua
-- debug 库
debug.traceback()
debug.getinfo(func)
debug.sethook(callback, "l")  -- 行钩子

-- 简单性能分析
local start = os.clock()
doWork()
print(string.format("耗时: %.3fs", os.clock() - start))
\`\`\`
`
);

// ==================== HarmonyOS (18 files) ====================
addFile(
  'harmonyos',
  'HarmonyOS',
  50,
  'ArkTS语言特性',
  'ArkTS扩展语法与限制',
  'intermediate',
  `## 1. ArkTS 特性

\`\`\`typescript
// 基于 TypeScript，增加了声明式UI
@Entry
@Component
struct Index {
  @State message: string = 'Hello World'

  build() {
    Column() {
      Text(this.message)
        .fontSize(30)
        .onClick(() => {
          this.message = 'Clicked!'
        })
    }
  }
}
\`\`\`

## 2. ArkTS 限制

- 不允许使用 any
- 不允许使用运行时类型检查
- 限制使用闭包
- 强制静态类型
`
);

addFile(
  'harmonyos',
  'HarmonyOS',
  51,
  '状态管理',
  '@State/@Prop/@Link等装饰器',
  'intermediate',
  `## 1. 状态装饰器

| 装饰器 | 说明 |
|--------|------|
| \`@State\` | 组件内状态 |
| \`@Prop\` | 父子单向同步 |
| \`@Link\` | 父子双向同步 |
| \`@Provide\` | 跨层级提供 |
| \`@Consume\` | 跨层级消费 |
| \`@Watch\` | 监听变化 |
| \`@StorageLink\` | 持久化存储 |

\`\`\`typescript
@Component
struct Child {
  @Link count: number

  build() {
    Button(\`Count: \${this.count}\`)
      .onClick(() => this.count++)
  }
}
\`\`\`
`
);

addFile(
  'harmonyos',
  'HarmonyOS',
  52,
  '自定义组件',
  '自定义组件与生命周期',
  'intermediate',
  `## 1. 自定义组件

\`\`\`typescript
@Component
export struct MyButton {
  @Prop text: string
  onButtonClick?: () => void

  build() {
    Button(this.text)
      .width(200)
      .height(50)
      .onClick(() => this.onButtonClick?.())
  }
}
\`\`\`

## 2. 生命周期

| 回调 | 说明 |
|------|------|
| \`aboutToAppear\` | 组件即将出现 |
| \`aboutToDisappear\` | 组件即将销毁 |
| \`onPageShow\` | 页面显示 |
| \`onPageHide\` | 页面隐藏 |
| \`onBackPress\` | 返回键按下 |
`
);

addFile(
  'harmonyos',
  'HarmonyOS',
  53,
  '列表与网格',
  'List与Grid组件',
  'intermediate',
  `## 1. List

\`\`\`typescript
List() {
  ForEach(this.data, (item: Data) => {
    ListItem() {
      Row() {
        Text(item.title)
      }
    }
  }, (item: Data) => item.id.toString())
}
.listDirection(Axis.Vertical)
.cachedCount(5
\`\`\`

## 2. Grid

\`\`\`typescript
Grid() {
  ForEach(this.items, (item) => {
    GridItem() {
      Text(item.name)
    }
  })
}
.columnsTemplate('1fr 1fr 1fr')
\`\`\`
`
);

addFile(
  'harmonyos',
  'HarmonyOS',
  54,
  '导航与路由',
  'Navigation与Router',
  'intermediate',
  `## 1. Navigation

\`\`\`typescript
Navigation() {
  NavRouter() {
    NavDestination() {
      Text('Detail Page')
    }
    .title('Detail')
  }
}
.navDestination(this.buildNavDestination)
\`\`\`

## 2. Router

\`\`\`typescript
import router from '@ohos.router'

router.pushUrl({ url: 'pages/Detail', params: { id: 1 } })
router.back()
\`\`\`
`
);

addFile(
  'harmonyos',
  'HarmonyOS',
  55,
  '网络请求',
  'HTTP请求与数据获取',
  'intermediate',
  `## 1. HTTP 请求

\`\`\`typescript
import http from '@ohos.net.http'

async function fetchData(url: string) {
  const httpRequest = http.createHttp()
  const response = await httpRequest.request(url, {
    method: http.RequestMethod.GET,
    header: { 'Content-Type': 'application/json' }
  })
  return JSON.parse(response.result as string)
}
\`\`\`
`
);

addFile(
  'harmonyos',
  'HarmonyOS',
  56,
  '数据持久化',
  'Preferences与关系型数据库',
  'intermediate',
  `## 1. Preferences

\`\`\`typescript
import dataPreferences from '@ohos.data.preferences'

const prefs = await dataPreferences.getPreferences(context, 'myPrefs')
await prefs.put('key', 'value')
await prefs.flush()
const value = await prefs.get('key', 'default')
\`\`\`

## 2. 关系型数据库

\`\`\`typescript
import relationalStore from '@ohos.data.relationalStore'

const store = await relationalStore.getRdbStore(context, {
  name: 'app.db', securityLevel: relationalStore.SecurityLevel.S1
})
\`\`\`
`
);

addFile(
  'harmonyos',
  'HarmonyOS',
  57,
  '动画系统',
  '属性动画与显式动画',
  'intermediate',
  `## 1. 属性动画

\`\`\`typescript
@State scale: number = 1

Image($r('app.media.icon'))
  .scale({ x: this.scale, y: this.scale })
  .animation({
    duration: 300,
    curve: Curve.EaseInOut
  })

// 触发
this.scale = this.scale === 1 ? 1.2 : 1
\`\`\`

## 2. 显式动画

\`\`\`typescript
animateTo({ duration: 300 }, () => {
  this.offsetX = 100
})
\`\`\`
`
);

addFile(
  'harmonyos',
  'HarmonyOS',
  58,
  '手势与交互',
  '手势识别与触摸事件',
  'intermediate',
  `## 1. 手势

\`\`\`typescript
Text('Tap me')
  .gesture(
    TapGesture()
      .onAction(() => console.log('Tapped'))
  )

// 组合手势
.gesture(
  GestureGroup(GestureMode.Exclusive,
    TapGesture(),
    LongPressGesture(),
    PanGesture()
  )
)
\`\`\`
`
);

addFile(
  'harmonyos',
  'HarmonyOS',
  59,
  '通知与权限',
  '通知系统与权限管理',
  'intermediate',
  `## 1. 通知

\`\`\`typescript
import notificationManager from '@ohos.notificationManager'

notificationManager.publish({
  id: 1,
  content: {
    contentType: notificationManager.ContentType.NOTIFICATION_CONTENT_BASIC_TEXT,
    normal: { title: 'Title', text: 'Content' }
  }
})
\`\`\`

## 2. 权限

\`\`\`json
// module.json5
"requestPermissions": [
  { "name": "ohos.permission.INTERNET" },
  { "name": "ohos.permission.LOCATION" }
]
\`\`\`
`
);

addFile(
  'harmonyos',
  'HarmonyOS',
  60,
  '多媒体能力',
  '相机、音频与视频',
  'intermediate',
  `## 1. 相机

\`\`\`typescript
import camera from '@ohos.multimedia.camera'

const cameraManager = camera.getCameraManager(context)
const cameras = cameraManager.getSupportedCameras()
\`\`\`

## 2. 音频

\`\`\`typescript
import audio from '@ohos.multimedia.audio'

const audioRenderer = await audio.createAudioRenderer({
  sampleRate: 44100, channels: 2, sampleFormat: audio.AudioSampleFormat.FORMAT_16_BIT,
  encodingType: audio.AudioEncodingType.ENCODING_TYPE_RAW
})
\`\`\`
`
);

addFile(
  'harmonyos',
  'HarmonyOS',
  61,
  '传感器与位置',
  '传感器与定位服务',
  'intermediate',
  `## 1. 传感器

\`\`\`typescript
import sensor from '@ohos.sensor'

sensor.on(sensor.SensorId.ACCELEROMETER, (data) => {
  console.log(\`x: \${data.x}, y: \${data.y}, z: \${data.z}\`)
})
\`\`\`

## 2. 地理位置

\`\`\`typescript
import geoLocationManager from '@ohos.geoLocationManager'

const location = await geoLocationManager.getCurrentLocation()
console.log(\`Lat: \${location.latitude}, Lng: \${location.longitude}\`)
\`\`\`
`
);

addFile(
  'harmonyos',
  'HarmonyOS',
  62,
  '分布式能力',
  '分布式数据与设备协同',
  'advanced',
  `## 1. 分布式数据

\`\`\`typescript
import distributedData from '@ohos.data.distributedData'

const kvManager = distributedData.createKVManager({
  bundleName: 'com.example.app'
})
\`\`\`

## 2. 设备发现

\`\`\`typescript
import deviceManager from '@ohos.distributedDeviceManager'

const dm = deviceManager.createDeviceManager('com.example.app')
dm.on('deviceFound', (device) => console.log('Found:', device))
\`\`\`
`
);

addFile(
  'harmonyos',
  'HarmonyOS',
  63,
  '卡片开发',
  '服务卡片（Widget）',
  'intermediate',
  `## 1. 卡片

\`\`\`typescript
@Entry
@Component
struct WidgetCard {
  build() {
    Column() {
      Text('Weather')
        .fontSize(20)
      Text('25°C')
        .fontSize(40)
    }
    .width('100%')
    .height('100%')
  }
}
\`\`\`
`
);

addFile(
  'harmonyos',
  'HarmonyOS',
  64,
  '应用签名与发布',
  '签名、打包与上架',
  'intermediate',
  `## 1. 签名

\`\`\`bash
# 生成证书
openssl req -new -x509 -key private.pem -out cert.cer

# 生成 Profile
# 在 AppGallery Connect 中配置
\`\`\`

## 2. 打包

\`\`\`bash
hvigorw assembleHap
\`\`\`
`
);

addFile(
  'harmonyos',
  'HarmonyOS',
  65,
  '性能优化',
  'HarmonyOS应用性能优化',
  'intermediate',
  `## 1. 优化策略

- 使用 \`LazyForEach\` 代替 \`ForEach\` 处理大数据
- 合理使用 \`cachedCount\`
- 避免频繁状态更新
- 使用 \`@Reusable\` 复用组件
- 减少嵌套层级
`
);

addFile(
  'harmonyos',
  'HarmonyOS',
  66,
  '测试与调试',
  'HarmonyOS应用测试',
  'intermediate',
  `## 1. 单元测试

\`\`\`typescript
import { describe, it, expect } from '@ohos/hypium'

describe('MathTest', () => {
  it('add should work', () => {
    expect(add(1, 2)).assertEqual(3)
  })
})
\`\`\`

## 2. DevEco Studio 调试

- 断点调试
- 日志 HiLog
- 性能分析 DevEco Profiler
`
);

addFile(
  'harmonyos',
  'HarmonyOS',
  67,
  '国际化与无障碍',
  '多语言与无障碍支持',
  'intermediate',
  `## 1. 国际化

\`\`\`
resources/
├── base/element/string.json       # 默认语言
├── en_US/element/string.json      # 英文
└── zh_CN/element/string.json      # 中文
\`\`\`

## 2. 无障碍

\`\`\`typescript
Text('Submit')
  .accessibilityText('Submit button')
  .accessibilityGroup(true)
\`\`\`
`
);

console.log(`\nDone! Total C# + Python + Go + Lua + HarmonyOS files created: ${total}`);
