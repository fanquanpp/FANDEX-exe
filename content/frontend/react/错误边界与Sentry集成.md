---
order: 105
title: 错误边界与Sentry集成
module: react
category: 'dev-lang'
difficulty: advanced
description: React错误边界与Sentry错误监控集成实践。
author: fanquanpp
updated: '2026-06-14'
related:
  - 'react/React-19新增API'
  - react/并发渲染与可中断更新
  - react/自定义Hooks复用逻辑
prerequisites:
  - react/概述与环境配置
---

## 1. Error Boundary

### 1.1 类组件实现

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, {
      contexts: { react: { componentStack: errorInfo.componentStack } },
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h1>出错了</h1>;
    }
    return this.props.children;
  }
}
```

## 2. Sentry 集成

### 2.1 初始化

```javascript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://xxx@sentry.io/xxx',
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### 2.2 React 集成

```jsx
import * as Sentry from '@sentry/react';

// Sentry 提供的 ErrorBoundary
<Sentry.ErrorBoundary fallback={<ErrorPage />} showDialog>
  <App />
</Sentry.ErrorBoundary>;

// 路由追踪
const SentryRoute = Sentry.withSentryRouting(Route);
```

### 2.3 性能监控

```javascript
const transaction = Sentry.startTransaction({ name: 'fetch-users' });
const span = transaction.startChild({ op: 'http', description: 'GET /api/users' });

try {
  await fetch('/api/users');
} finally {
  span.finish();
  transaction.finish();
}
```
