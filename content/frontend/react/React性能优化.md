---
order: 57
title: React性能优化
module: react
category: React
difficulty: intermediate
description: React应用性能优化策略
author: fanquanpp
updated: '2026-06-14'
related:
  - react/自定义Hooks设计模式
  - react/状态管理方案对比
  - react/React错误边界
  - react/React表单处理
prerequisites:
  - react/概述与环境配置
---

## 1. 避免不必要渲染

```jsx
// React.memo
const MyComponent = React.memo(function MyComponent(props) {
  return <div>{props.value}</div>;
});

// useMemo
const expensiveValue = useMemo(() => computeExpensive(a, b), [a, b]);

// useCallback
const handleClick = useCallback(() => doSomething(id), [id]);
```

## 2. 代码分割

```jsx
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>;
```

## 3. 虚拟化长列表

```jsx
import { FixedSizeList } from 'react-window';

function MyList({ items }) {
  return (
    <FixedSizeList height={600} itemCount={items.length} itemSize={50}>
      {({ index, style }) => <div style={style}>{items[index].name}</div>}
    </FixedSizeList>
  );
}
```

## 4. Profiler

```jsx
<Profiler
  id="Panel"
  onRender={(id, phase, duration) => {
    console.log(`${id} ${phase} took ${duration}ms`);
  }}
>
  <Panel />
</Profiler>
```
