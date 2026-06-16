---
order: 100
title: 'React-Compiler自动记忆化'
module: react
category: 'dev-lang'
difficulty: advanced
description: 'React Compiler原理详解：自动记忆化、依赖分析与性能优化。'
author: fanquanpp
updated: '2026-06-14'
related:
  - 'react/React与CI-CD'
  - react/React与Monorepo
  - 'react/Server-Components与Client-Components'
  - react/Next.js应用路由
prerequisites:
  - react/概述与环境配置
---

## 1. React Compiler 概述

### 1.1 解决的问题

手动记忆化的痛点：

- `useMemo`/`useCallback` 过度使用
- 忘记添加依赖导致 Bug
- 依赖数组维护成本高

React Compiler 自动分析组件，插入必要的记忆化。

### 1.2 工作原理

```
源代码 → Babel 解析 → AST 分析 → 自动插入记忆化 → 输出代码
```

## 2. 编译前后对比

### 2.1 手动记忆化

```jsx
function UserCard({ user, onSelect }) {
  const fullName = useMemo(() => `${user.first} ${user.last}`, [user.first, user.last]);
  const handleClick = useCallback(() => onSelect(user.id), [onSelect, user.id]);

  return <Card title={fullName} onClick={handleClick} />;
}
```

### 2.2 Compiler 自动处理

```jsx
function UserCard({ user, onSelect }) {
  const fullName = `${user.first} ${user.last}`;
  const handleClick = () => onSelect(user.id);

  return <Card title={fullName} onClick={handleClick} />;
}
// Compiler 自动识别需要记忆化的值
```

## 3. 启用 Compiler

```bash
npm install babel-plugin-react-compiler
```

```javascript
// babel.config.js
module.exports = {
  presets: ['@babel/preset-react'],
  plugins: ['babel-plugin-react-compiler'],
};
```

```javascript
// Vite
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', { target: '18' }]],
      },
    }),
  ],
});
```

## 4. Compiler 规则

### 4.1 纯函数假设

Compiler 假设组件和 Hook 是纯函数：

- 相同输入 → 相同输出
- 无副作用

### 4.2 不可变数据

```jsx
//  直接修改
items.push(newItem);

//  不可变更新
const newItems = [...items, newItem];
```

## 5. 性能影响

Compiler 生成的记忆化代码比手动 `useMemo` 更细粒度，通常能带来 2-5 倍的重渲染性能提升。
