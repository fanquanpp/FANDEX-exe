---
order: 55
title: Python与SQLAlchemy
module: python
category: Python
difficulty: intermediate
description: SQLAlchemy ORM
author: fanquanpp
updated: '2026-06-14'
related:
  - python/Python与FastAPI
  - python/Python与数据库迁移
  - python/Python与Redis
  - python/Python与Docker
prerequisites:
  - python/语法速查
---

## 什么是 SQLAlchemy

SQLAlchemy 是 Python 中最强大的数据库工具包和 ORM（对象关系映射）框架。它让你用 Python 类来操作数据库，而不需要手写 SQL 语句。你定义 Python 类来表示数据表，SQLAlchemy 自动将类操作转换为 SQL 执行。

SQLAlchemy 分为两层：Core 层提供 SQL 表达式语言，可以直接构建 SQL 查询；ORM 层在 Core 之上，提供对象关系映射。对于大多数应用，使用 ORM 层就足够了。

## 基础概念

### ORM

ORM 是 Object-Relational Mapping 的缩写，即对象关系映射。它把数据库中的表映射为 Python 类，表中的行映射为类的实例，列映射为类的属性。你操作 Python 对象，ORM 负责生成对应的 SQL。

### Session

Session 是 SQLAlchemy ORM 的核心接口，负责管理对象与数据库之间的交互。所有数据库操作都通过 Session 进行：查询、添加、修改、删除。

### 声明式映射

SQLAlchemy 2.0 使用声明式映射，通过 DeclarativeBase 基类和类型注解来定义模型。这是最推荐的模型定义方式。

### Engine

Engine 是 SQLAlchemy 与数据库通信的入口点，管理连接池和 SQL 执行。通常在应用启动时创建一个 Engine 实例。

## 快速上手

### 安装

```bash
# 安装 SQLAlchemy
pip install sqlalchemy

# 安装数据库驱动（根据你使用的数据库选择）
pip install psycopg2-binary  # PostgreSQL
pip install pymysql          # MySQL
# SQLite 不需要额外驱动，Python 标准库自带
```

### 定义模型和创建表

```python
from sqlalchemy import String, Integer, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

# 声明基类
class Base(DeclarativeBase):
    pass

# 定义用户模型
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(200), unique=True)
    age: Mapped[int] = mapped_column(Integer, nullable=True)

    def __repr__(self):
        return f"User(id={self.id}, name={self.name})"

# 创建数据库引擎（SQLite 内存数据库）
engine = create_engine("sqlite:///myapp.db", echo=True)
# echo=True 会打印生成的 SQL 语句，方便调试

# 创建所有表
Base.metadata.create_all(engine)
```

### 基本的增删改查

```python
from sqlalchemy import select

# 创建 Session
with Session(engine) as session:
    # 创建（添加新记录）
    user = User(name="张三", email="zhangsan@example.com", age=25)
    session.add(user)
    session.commit()
    print(f"新增用户 ID: {user.id}")

    # 查询
    user = session.execute(
        select(User).where(User.name == "张三")
    ).scalar_one()
    print(f"查询结果: {user}")

    # 修改
    user.age = 26
    session.commit()

    # 删除
    session.delete(user)
    session.commit()
```

## 详细用法

### 模型定义详解

```python
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    # 主键（自增）
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # 字符串字段
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    # 唯一字段
    email: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)

    # 可为空的字段
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # 带默认值的字段
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # 自动时间戳
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    # 关系（一个用户有多篇文章）
    articles: Mapped[list["Article"]] = relationship(back_populates="author")

class Article(Base):
    __tablename__ = "articles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)

    # 外键
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # 关系
    author: Mapped["User"] = relationship(back_populates="articles")
```

### 查询操作

```python
from sqlalchemy import select, and_, or_, func, desc

with Session(engine) as session:
    # 基本查询
    stmt = select(User)
    users = session.execute(stmt).scalars().all()

    # 条件查询
    stmt = select(User).where(User.age > 20)
    users = session.execute(stmt).scalars().all()

    # 多条件查询
    stmt = select(User).where(
        and_(User.age > 20, User.is_active == True)
    )

    # 或条件
    stmt = select(User).where(
        or_(User.name == "张三", User.name == "李四")
    )

    # 模糊查询
    stmt = select(User).where(User.name.like("%张%"))

    # 排序
    stmt = select(User).order_by(desc(User.age))

    # 限制数量
    stmt = select(User).limit(10).offset(20)  # 分页：第 3 页，每页 10 条

    # 聚合查询
    stmt = select(func.count(User.id))
    total = session.execute(stmt).scalar()

    # 分组查询
    stmt = select(User.age, func.count(User.id)).group_by(User.age)

    # 获取单条记录
    user = session.execute(
        select(User).where(User.id == 1)
    ).scalar_one_or_none()

    # 按主键查询
    user = session.get(User, 1)
```

### 关系查询

```python
with Session(engine) as session:
    # 查询用户及其文章（懒加载）
    user = session.get(User, 1)
    for article in user.articles:
        print(article.title)

    # 预加载（避免 N+1 查询问题）
    from sqlalchemy.orm import selectinload
    stmt = select(User).options(selectinload(User.articles))
    users = session.execute(stmt).scalars().all()

    # 反向查询：从文章查作者
    article = session.get(Article, 1)
    print(article.author.name)
```

### 批量操作

```python
with Session(engine) as session:
    # 批量添加
    users = [
        User(name="张三", email="z1@example.com"),
        User(name="李四", email="z2@example.com"),
        User(name="王五", email="z3@example.com"),
    ]
    session.add_all(users)
    session.commit()

    # 批量更新
    from sqlalchemy import update
    session.execute(
        update(User).where(User.is_active == True).values(age=30)
    )
    session.commit()

    # 批量删除
    from sqlalchemy import delete
    session.execute(
        delete(User).where(User.is_active == False)
    )
    session.commit()
```

### 使用事务

```python
from sqlalchemy.exc import IntegrityError

with Session(engine) as session:
    try:
        # 开始事务
        user1 = User(name="张三", email="z1@example.com")
        user2 = User(name="李四", email="z2@example.com")
        session.add(user1)
        session.add(user2)
        session.commit()  # 提交事务
    except IntegrityError:
        session.rollback()  # 回滚事务
        print("操作失败，已回滚")
```

## 常见场景

### FastAPI 中集成 SQLAlchemy

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session
from fastapi import FastAPI, Depends

# 数据库配置
DATABASE_URL = "sqlite:///./app.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass

# 依赖：获取数据库 Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

@app.get("/users/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="用户不存在")
    return {"id": user.id, "name": user.name}
```

## 注意事项与常见错误

### N+1 查询问题

遍历关联对象时，每次访问都会触发一次额外的数据库查询。使用 selectinload 或 joinedload 预加载关联数据：

```python
# 错误：N+1 查询
users = session.execute(select(User)).scalars().all()
for user in users:
    print(user.articles)  # 每个用户触发一次查询

# 正确：预加载
from sqlalchemy.orm import selectinload
stmt = select(User).options(selectinload(User.articles))
users = session.execute(stmt).scalars().all()
```

### Session 必须关闭

使用 with 语句确保 Session 被正确关闭。忘记关闭会导致连接泄漏。

### 异步 SQLAlchemy

FastAPI 等异步框架中应使用异步 SQLAlchemy：

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

engine = create_async_engine("sqlite+aiosqlite:///./app.db")
```

## 进阶用法

### 多对多关系

```python
from sqlalchemy import Table, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

# 关联表
article_tags = Table(
    'article_tags', Base.metadata,
    mapped_column('article_id', ForeignKey('articles.id'), primary_key=True),
    mapped_column('tag_id', ForeignKey('tags.id'), primary_key=True),
)

class Tag(Base):
    __tablename__ = "tags"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    articles: Mapped[list["Article"]] = relationship(secondary=article_tags, back_populates="tags")

class Article(Base):
    __tablename__ = "articles"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    tags: Mapped[list["Tag"]] = relationship(secondary=article_tags, back_populates="articles")
```

### 混合属性

```python
from sqlalchemy.ext.hybrid import hybrid_property

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(50))
    last_name: Mapped[str] = mapped_column(String(50))

    @hybrid_property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @full_name.expression
    def full_name(cls):
        # 在 SQL 查询中使用
        return cls.first_name + " " + cls.last_name
```

### 事件监听

```python
from sqlalchemy import event

@event.listens_for(Session, "before_flush")
def validate_before_flush(session, flush_context, instances):
    """在 flush 前验证数据"""
    for obj in session.new:
        if isinstance(obj, User) and not obj.email:
            raise ValueError("邮箱不能为空")
```
