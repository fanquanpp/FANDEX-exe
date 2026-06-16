---
order: 101
title: 'Server-Components与Client-Components'
module: react
category: 'dev-lang'
difficulty: advanced
description: 'React Server Components与Client Components界限划分与最佳实践。'
author: fanquanpp
updated: '2026-06-14'
related:
  - react/React与Monorepo
  - 'react/React-Compiler自动记忆化'
  - react/Next.js应用路由
  - 'react/React-19新增API'
prerequisites:
  - react/概述与环境配置
---

## 1. Server Components

### 1.1 特点

- 在服务端渲染，不发送 JS 到客户端
- 可直接访问数据库、文件系统
- 不能使用 useState、useEffect 等客户端 Hook
- 不能监听事件

```jsx
// Server Component
async function UserProfile({ userId }) {
  const user = await db.user.findUnique({ where: { id: userId } });

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </div>
  );
}
```

## 2. Client Components

### 2.1 声明方式

```jsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

### 2.2 特点

- 在客户端渲染和交互
- 可使用所有 React Hook
- 可监听事件
- 会发送 JS 到客户端

## 3. 界限划分

| 场景                    | Server        | Client |
| ----------------------- | ------------- | ------ |
| 获取数据                |               |        |
| 访问后端资源            |               |        |
| 交互（点击/输入）       |               |        |
| useState/useEffect      |               |        |
| 自定义 Hook（依赖状态） |               |        |
| 大型依赖（如 D3）       | （不发送 JS） |        |

## 4. 组合模式

```jsx
// Server Component
export default function Page() {
  return (
    <div>
      <ServerHeader /> {/* Server Component */}
      <ClientCounter /> {/* Client Component */}
      <ServerFooter /> {/* Server Component */}
    </div>
  );
}
```

> Server Component 可以导入 Client Component，但 Client Component 不能导入 Server Component。
