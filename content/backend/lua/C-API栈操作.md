---
order: 104
title: 'C-API栈操作'
module: lua
category: 'dev-lang'
difficulty: advanced
description: 'Lua C-API栈操作详解：lua_State、lua_push、lua_to。'
author: fanquanpp
updated: '2026-06-14'
related:
  - lua/弱表
  - lua/环境与全局变量管理
  - lua/用户数据
  - lua/模块加载
prerequisites:
  - lua/概述与环境配置
---

## 1. 虚拟栈

Lua 与 C 通过虚拟栈交互：

```c
lua_State *L = luaL_newstate();

// 压栈
lua_pushstring(L, "hello");
lua_pushnumber(L, 42);
lua_pushboolean(L, 1);

// 栈: "hello" | 42 | true
// 索引:   1    |  2 |   3  (正索引，从底到顶)
// 索引:  -3    | -2 |  -1  (负索引，从顶到底)

// 读取
const char *s = lua_tostring(L, 1);  // "hello"
double n = lua_tonumber(L, 2);       // 42
int b = lua_toboolean(L, 3);         // 1

// 栈顶索引
int top = lua_gettop(L);  // 3
```

## 2. 常用栈操作

```c
lua_pushnil(L);
lua_pushinteger(L, 100);
lua_pushvalue(L, 1);     // 复制索引1的值到栈顶
lua_remove(L, 2);        // 移除索引2
lua_insert(L, 1);        // 栈顶插入到索引1
lua_replace(L, 1);       // 栈顶替换索引1
lua_pop(L, 2);           // 弹出2个元素
```

## 3. 类型检查

```c
lua_isstring(L, idx);
lua_isnumber(L, idx);
lua_istable(L, idx);
lua_isfunction(L, idx);
lua_type(L, idx);  // LUA_TSTRING, LUA_TNUMBER, ...
```
