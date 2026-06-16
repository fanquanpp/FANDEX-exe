---
order: 71
title: 类型安全的API客户端
module: typescript
category: TypeScript
difficulty: advanced
description: 构建端到端类型安全的HTTP客户端
author: fanquanpp
updated: '2026-06-14'
related:
  - typescript/类型声明与模块解析
  - typescript/类型安全的事件系统
  - typescript/类型安全的状态管理
  - typescript/类型安全的表单验证
prerequisites:
  - typescript/语法速查
---

## 概述

构建类型安全的 API 客户端是前后端协作中的关键环节。通过在 TypeScript 中定义完整的 API 类型映射，可以实现从请求参数到响应数据的端到端类型安全。本文介绍如何使用 TypeScript 的泛型、条件类型和模板字面量类型构建一个类型安全的 HTTP 客户端，确保路由路径、请求方法、查询参数、请求体和响应体都有精确的类型约束。

## 基础概念

**API 类型映射**：将所有 API 路由定义为一个类型映射对象，每个路由对应其支持的 HTTP 方法和参数/响应类型。

**路径参数提取**：使用模板字面量类型从路由路径中提取动态参数（如 `/users/:id` 中的 `id`），确保路径参数的类型安全。

**条件类型推断**：使用 infer 关键字从 API 类型映射中推断请求参数、查询参数、请求体和响应体的类型。

**类型安全的请求函数**：基于 API 类型映射构建泛型请求函数，根据传入的路由和方法自动推断所有参数和返回类型。

## 快速上手

### API 类型定义

```typescript
// 定义 API 路由类型映射
interface APIClient {
  '/users': {
    GET: { response: User[]; query?: { page: number; limit: number } };
    POST: { response: User; body: Omit<User, 'id'> };
  };
  '/users/:id': {
    GET: { response: User; params: { id: string } };
    PUT: { response: User; params: { id: string }; body: Partial<User> };
    DELETE: { response: void; params: { id: string } };
  };
  '/posts': {
    GET: { response: Post[]; query?: { author: string } };
    POST: { response: Post; body: Omit<Post, 'id' | 'createdAt'> };
  };
}
```

### 基础请求函数

```typescript
// 提取支持指定方法的所有路径
type PathsWithMethod<M extends string> = {
  [P in keyof APIClient]: M extends keyof APIClient[P] ? P : never;
}[keyof APIClient];

// 类型安全的请求函数
async function request<
  Path extends PathsWithMethod<Method>,
  Method extends keyof APIClient[Path] = 'GET',
>(
  path: Path,
  options: {
    method?: Method;
    params?: APIClient[Path][Method] extends { params: infer P } ? P : never;
    query?: APIClient[Path][Method] extends { query: infer Q } ? Q : never;
    body?: APIClient[Path][Method] extends { body: infer B } ? B : never;
  }
): Promise<APIClient[Path][Method] extends { response: infer R } ? R : never> {
  const { method = 'GET' as Method, params, query, body } = options;

  // 替换路径参数
  let url: string = path;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, value);
    }
  }

  // 添加查询参数
  if (query) {
    const searchParams = new URLSearchParams(query as Record<string, string>);
    url += `?${searchParams.toString()}`;
  }

  // 发送请求
  const response = await fetch(url, {
    method: method as string,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`);
  }

  return response.json();
}
```

## 详细用法

### 路径参数替换类型

```typescript
// 递归替换路径中的参数占位符
type ReplaceParams<Path, Params> = Path extends `${infer Before}:${infer Param}${infer After}`
  ? Params extends { [K in Param]: string }
    ? `${Before}${Params[Param & keyof Params]}${ReplaceParams<After, Params>}`
    : never
  : Path;

// 提取路径中的参数名
type ExtractPathParams<Path> = Path extends `${infer _}:${infer Param}${infer Rest}`
  ? Param extends `${infer P}/${infer _}`
    ? P | ExtractPathParams<Rest>
    : Param | ExtractPathParams<Rest>
  : never;

// 使用
type UserPathParams = ExtractPathParams<'/users/:id'>;
// 'id'

type PostCommentParams = ExtractPathParams<'/posts/:postId/comments/:commentId'>;
// 'postId' | 'commentId'

type ReplacedPath = ReplaceParams<'/users/:id', { id: '123' }>;
// '/users/123'
```

### 类型安全的请求构建器

```typescript
// 链式请求构建器
class RequestBuilder<Path extends keyof APIClient> {
  private path: Path;
  private method: keyof APIClient[Path] = 'GET' as any;
  private params: any = {};
  private queryObj: any = {};
  private bodyObj: any = {};

  constructor(path: Path) {
    this.path = path;
  }

  method<M extends keyof APIClient[Path]>(method: M): RequestBuilder<Path> {
    this.method = method;
    return this;
  }

  params(p: APIClient[Path][typeof this.method] extends { params: infer P } ? P : never): this {
    this.params = p;
    return this;
  }

  query(q: APIClient[Path][typeof this.method] extends { query: infer Q } ? Q : never): this {
    this.queryObj = q;
    return this;
  }

  body(b: APIClient[Path][typeof this.method] extends { body: infer B } ? B : never): this {
    this.bodyObj = b;
    return this;
  }

  async execute(): Promise<
    APIClient[Path][typeof this.method] extends { response: infer R } ? R : never
  > {
    return request(this.path, {
      method: this.method,
      params: this.params,
      query: this.queryObj,
      body: this.bodyObj,
    });
  }
}

// 使用
const users = await new RequestBuilder('/users')
  .method('GET')
  .query({ page: 1, limit: 10 })
  .execute();
// User[]
```

### 错误类型定义

```typescript
// 定义 API 错误类型
interface APIError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// 类型安全的结果
type APIResult<T> = { success: true; data: T } | { success: false; error: APIError };

// 包装请求函数
async function safeRequest<
  Path extends PathsWithMethod<Method>,
  Method extends keyof APIClient[Path] = 'GET',
>(
  path: Path,
  options: {
    method?: Method;
    params?: APIClient[Path][Method] extends { params: infer P } ? P : never;
    query?: APIClient[Path][Method] extends { query: infer Q } ? Q : never;
    body?: APIClient[Path][Method] extends { body: infer B } ? B : never;
  }
): Promise<APIResult<APIClient[Path][Method] extends { response: infer R } ? R : never>> {
  try {
    const data = await request(path, options);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : '未知错误',
      },
    };
  }
}
```

## 常见场景

### 自动生成 API 客户端

```typescript
// 根据 API 类型映射自动生成所有方法
type APIMethods = {
  [Path in keyof APIClient]: {
    [Method in keyof APIClient[Path] as Lowercase<string & Method>]: (
      options: Omit<
        {
          params?: APIClient[Path][Method] extends { params: infer P } ? P : never;
          query?: APIClient[Path][Method] extends { query: infer Q } ? Q : never;
          body?: APIClient[Path][Method] extends { body: infer B } ? B : never;
        },
        never
      >
    ) => Promise<APIClient[Path][Method] extends { response: infer R } ? R : never>;
  };
};

// 使用
const api: APIMethods = {
  '/users': {
    get: (options) => request('/users', { method: 'GET', ...options }),
    post: (options) => request('/users', { method: 'POST', ...options }),
  },
  '/users/:id': {
    get: (options) => request('/users/:id', { method: 'GET', ...options }),
    put: (options) => request('/users/:id', { method: 'PUT', ...options }),
    delete: (options) => request('/users/:id', { method: 'DELETE', ...options }),
  },
};

// 类型安全调用
const users = await api['/users'].get({ query: { page: 1, limit: 10 } });
const user = await api['/users/:id'].get({ params: { id: '1' } });
```

## 注意事项

- **类型定义维护**：API 类型映射需要与后端 API 保持同步。建议使用 OpenAPI/Swagger 自动生成类型定义，避免手动维护导致不一致。
- **路径参数格式**：本文使用 `:param` 格式表示路径参数。如果后端使用 `{param}` 格式，需要调整路径参数提取的类型逻辑。
- **文件上传**：文件上传场景需要特殊处理，body 类型应为 FormData 而非 JSON。可以在类型映射中为特定路由添加特殊的 body 类型。
- **请求取消**：生产环境中应支持 AbortController 取消请求，可以在请求函数中增加 signal 参数。

## 进阶用法

### OpenAPI 类型生成

```typescript
// 从 OpenAPI Schema 生成类型
type OpenAPIToTypes<Schema extends Record<string, any>> = {
  [Path in keyof Schema]: {
    [Method in keyof Schema[Path]]: {
      response: Schema[Path][Method]['response'];
      params: Schema[Path][Method]['params'];
      query: Schema[Path][Method]['query'];
      body: Schema[Path][Method]['body'];
    };
  };
};

// 使用工具自动从 Swagger JSON 生成 APIClient 类型
// 例如：openapi-typescript 库可以将 OpenAPI 规范转换为 TypeScript 类型
```

### 请求拦截器

```typescript
// 类型安全的请求/响应拦截器
interface RequestInterceptor {
  onRequest(config: RequestConfig): RequestConfig | Promise<RequestConfig>;
}

interface ResponseInterceptor<T = any> {
  onResponse(response: T): T | Promise<T>;
  onError(error: APIError): APIError | Promise<APIError>;
}

interface RequestConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
}

class HTTPClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  // 添加认证拦截器
  addAuthToken(getToken: () => string | null): void {
    this.addRequestInterceptor({
      onRequest(config) {
        const token = getToken();
        if (token) {
          config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
        }
        return config;
      },
    });
  }
}
```
