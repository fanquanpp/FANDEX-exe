---
order: 55
title: Lua与C交互
module: lua
category: Lua
difficulty: advanced
description: 'Lua C API'
author: fanquanpp
updated: '2026-06-14'
related:
  - lua/环境与模块
  - lua/字符串模式匹配
  - lua/Lua即时编译器
  - lua/Lua与Love2D
prerequisites:
  - lua/概述与环境配置
---

## 概述

Lua 的设计目标之一就是作为嵌入式脚本语言，与 C 语言无缝交互。Lua 提供了一套完整的 C API，允许 C 程序嵌入 Lua 解释器、调用 Lua 函数、在 C 中实现 Lua 可调用的函数。这种双向交互能力是 Lua 被广泛嵌入游戏引擎、Web 服务器等系统的基础。

为什么需要 Lua 与 C 交互？一方面，C 可以实现 Lua 难以完成的高性能计算和系统级操作；另一方面，Lua 可以作为 C 程序的扩展语言，让用户在不修改 C 源码的情况下定制程序行为。理解 C API 的工作方式，对于编写高性能的 Lua 模块和调试嵌入式 Lua 环境都很重要。

## 基础概念

### Lua 栈

Lua 与 C 之间的所有数据交换都通过一个虚拟栈完成。栈是一个后进先出（LIFO）的数据结构，每个元素可以是 Lua 的任何类型（nil、boolean、number、string、table、function 等）。C 函数从栈中获取参数，将结果压入栈中返回。

栈的索引方式：正数索引从栈底开始（1 是栈底），负数索引从栈顶开始（-1 是栈顶）。通常使用负数索引更方便，因为不需要知道栈的深度。

### C 函数注册

C 函数需要遵循特定的签名（lua_CFunction），然后通过 lua_register 或 lua_pushcfunction 注册到 Lua 中。注册后，Lua 代码就可以像调用普通 Lua 函数一样调用 C 函数。

### 内存管理

Lua 的所有对象（字符串、表、函数等）由 Lua 的垃圾回收器管理。C 代码通过 API 操作这些对象时，Lua 自动处理引用计数和回收。C 代码不应该直接释放 Lua 对象的内存。

## 快速上手

### 最简 C 模块

编写一个 C 文件，导出一个 add 函数给 Lua 使用：

```c
/* mylib.c */
#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

/* 实现 Lua 可调用的函数 */
static int l_add(lua_State *L) {
    /* 从栈中获取参数 */
    double a = luaL_checknumber(L, 1);  /* 第一个参数 */
    double b = luaL_checknumber(L, 2);  /* 第二个参数 */

    /* 将结果压入栈 */
    lua_pushnumber(L, a + b);

    /* 返回值的数量 */
    return 1;
}

/* 注册函数列表 */
static const luaL_Reg mylib[] = {
    {"add", l_add},
    {NULL, NULL}  /* 哨兵，表示列表结束 */
};

/* 模块入口函数 */
int luaopen_mylib(lua_State *L) {
    luaL_newlib(L, mylib);  /* 创建表并注册函数 */
    return 1;  /* 返回这个表 */
}
```

### 编译为动态库

```bash
# Linux
gcc -shared -fPIC -o mylib.so mylib.c -I/usr/include/lua5.3 -llua5.3

# macOS
gcc -bundle -undefined dynamic_lookup -o mylib.so mylib.c -I/usr/local/include

# Windows (MinGW)
gcc -shared -o mylib.dll mylib.c -I/usr/include/lua
```

### 在 Lua 中使用

```lua
-- 加载 C 模块
local mylib = require("mylib")

-- 调用 C 函数
local result = mylib.add(3, 5)
print("3 + 5 = " .. result)  -- 输出: 3 + 5 = 8
```

## 详细用法

### 1. 参数获取

C 函数从栈中获取 Lua 传递的参数：

```c
#include <lua.h>
#include <lauxlib.h>

static int l_greet(lua_State *L) {
    /* 获取字符串参数，如果类型不对会抛出错误 */
    const char *name = luaL_checkstring(L, 1);

    /* 获取可选的数字参数，提供默认值 */
    int times = luaL_optinteger(L, 2, 1);  /* 第二个参数，默认值 1 */

    /* 检查参数数量 */
    int nargs = lua_gettop(L);  /* 获取栈中参数的数量 */

    /* 构建结果字符串 */
    for (int i = 0; i < times; i++) {
        printf("Hello, %s!\n", name);
    }

    lua_pushfstring(L, "Greeted %s %d times", name, times);
    return 1;  /* 返回一个值 */
}
```

### 2. 返回多个值

Lua 函数可以返回多个值，C 函数也可以：

```c
static int l_divmod(lua_State *L) {
    int a = luaL_checkinteger(L, 1);
    int b = luaL_checkinteger(L, 2);

    if (b == 0) {
        /* 抛出 Lua 错误 */
        luaL_error(L, "division by zero");
    }

    /* 压入多个返回值 */
    lua_pushinteger(L, a / b);   /* 第一个返回值：商 */
    lua_pushinteger(L, a % b);   /* 第二个返回值：余数 */

    return 2;  /* 返回两个值 */
}
```

在 Lua 中使用：

```lua
local quotient, remainder = divmod(17, 5)
print(quotient, remainder)  -- 输出: 3  2
```

### 3. 操作 Lua 表

C 函数可以创建和操作 Lua 表：

```c
static int l_createPerson(lua_State *L) {
    const char *name = luaL_checkstring(L, 1);
    int age = luaL_checkinteger(L, 2);

    /* 创建一个新表 */
    lua_createtable(L, 0, 2);  /* 预分配 0 个数组元素，2 个哈希元素 */

    /* 设置表的字段 */
    lua_pushstring(L, name);
    lua_setfield(L, -2, "name");  /* t.name = name */

    lua_pushinteger(L, age);
    lua_setfield(L, -2, "age");   /* t.age = age */

    /* 表现在在栈顶，作为返回值 */
    return 1;
}

/* 读取表字段 */
static int l_getField(lua_State *L) {
    luaL_checktype(L, 1, LUA_TTABLE);  /* 确保第一个参数是表 */
    const char *key = luaL_checkstring(L, 2);  /* 第二个参数是键 */

    /* 从表中获取字段 */
    lua_getfield(L, 1, key);  /* 将 t[key] 压入栈 */

    return 1;  /* 返回字段值 */
}
```

### 4. 调用 Lua 函数

C 代码可以调用 Lua 函数：

```c
static int l_callLuaFunc(lua_State *L) {
    /* 假设 Lua 中已经定义了一个函数 myCallback */
    lua_getglobal(L, "myCallback");  /* 将全局函数压入栈 */

    if (!lua_isfunction(L, -1)) {
        luaL_error(L, "myCallback is not a function");
    }

    /* 压入参数 */
    lua_pushstring(L, "hello from C");
    lua_pushinteger(L, 42);

    /* 调用函数：2 个参数，1 个返回值，无错误处理函数 */
    if (lua_pcall(L, 2, 1, 0) != LUA_OK) {
        /* 调用失败，栈顶是错误信息 */
        const char *err = lua_tostring(L, -1);
        luaL_error(L, "call failed: %s", err);
    }

    /* 获取返回值 */
    const char *result = lua_tostring(L, -1);
    printf("Lua 返回: %s\n", result);

    lua_pop(L, 1);  /* 弹出返回值，保持栈平衡 */
    return 0;
}
```

### 5. 错误处理

C 函数中应该正确处理错误：

```c
static int l_safeDivide(lua_State *L) {
    double a = luaL_checknumber(L, 1);
    double b = luaL_checknumber(L, 2);

    /* 使用 luaL_argcheck 检查参数条件 */
    luaL_argcheck(L, b != 0, 2, "division by zero");

    lua_pushnumber(L, a / b);
    return 1;
}

/* 使用 lua_pcall 保护调用 Lua 代码 */
static int l_protectedCall(lua_State *L) {
    lua_getglobal(L, "someFunction");

    /* lua_pcall 会捕获错误，不会导致程序崩溃 */
    if (lua_pcall(L, 0, 0, 0) != LUA_OK) {
        const char *err = lua_tostring(L, -1);
        printf("错误: %s\n", err);
        lua_pop(L, 1);  /* 弹出错误信息 */
    }

    return 0;
}
```

### 6. 用户数据（Userdata）

Userdata 是 C 数据在 Lua 中的表示，分为完整用户数据和轻量用户数据：

```c
/* 定义 C 结构体 */
typedef struct {
    double x;
    double y;
} Point;

/* 创建 Point 用户数据 */
static int l_newPoint(lua_State *L) {
    double x = luaL_checknumber(L, 1);
    double y = luaL_checknumber(L, 2);

    /* 分配用户数据 */
    Point *p = (Point *)lua_newuserdata(L, sizeof(Point));
    p->x = x;
    p->y = y;

    /* 设置元表 */
    luaL_getmetatable(L, "Point");
    lua_setmetatable(L, -2);

    return 1;  /* 返回用户数据 */
}

/* 获取坐标 */
static int l_getX(lua_State *L) {
    Point *p = (Point *)luaL_checkudata(L, 1, "Point");
    lua_pushnumber(L, p->x);
    return 1;
}

static int l_getY(lua_State *L) {
    Point *p = (Point *)luaL_checkudata(L, 1, "Point");
    lua_pushnumber(L, p->y);
    return 1;
}

/* 注册 Point 类型 */
static const luaL_Reg point_methods[] = {
    {"new", l_newPoint},
    {"getX", l_getX},
    {"getY", l_getY},
    {NULL, NULL}
};

int luaopen_point(lua_State *L) {
    /* 创建元表 */
    luaL_newmetatable(L, "Point");

    /* 创建模块表 */
    luaL_newlib(L, point_methods);
    return 1;
}
```

## 常见场景

### 场景一：为 Lua 提供高性能计算

```c
/* 快速排序实现 */
static int l_quicksort(lua_State *L) {
    luaL_checktype(L, 1, LUA_TTABLE);
    int n = luaL_len(L, 1);  /* 获取表长度 */

    /* 将 Lua 表复制到 C 数组 */
    double *arr = (double *)malloc(n * sizeof(double));
    for (int i = 1; i <= n; i++) {
        lua_rawgeti(L, 1, i);
        arr[i - 1] = lua_tonumber(L, -1);
        lua_pop(L, 1);
    }

    /* 执行 C 层面的快速排序 */
    qsort(arr, n, sizeof(double), compare_double);

    /* 将排序结果写回 Lua 表 */
    for (int i = 1; i <= n; i++) {
        lua_pushnumber(L, arr[i - 1]);
        lua_rawseti(L, 1, i);
    }

    free(arr);
    return 1;  /* 返回原表（已排序） */
}
```

### 场景二：封装系统 API

```c
#include <sys/stat.h>
#include <unistd.h>

static int l_fileExists(lua_State *L) {
    const char *path = luaL_checkstring(L, 1);
    struct stat st;
    int result = (stat(path, &st) == 0);
    lua_pushboolean(L, result);
    return 1;
}

static int l_getFileSize(lua_State *L) {
    const char *path = luaL_checkstring(L, 1);
    struct stat st;
    if (stat(path, &st) != 0) {
        luaL_error(L, "cannot stat '%s'", path);
    }
    lua_pushinteger(L, (lua_Integer)st.st_size);
    return 1;
}
```

## 注意事项与常见错误

### 栈平衡

每次 C 函数返回时，栈上应该只留下返回值。如果压入了临时值但没有弹出，会导致栈泄漏：

```c
static int l_badExample(lua_State *L) {
    lua_pushstring(L, "temp");  /* 压入临时值 */
    /* 忘记弹出... */

    lua_pushnumber(L, 42);  /* 压入返回值 */
    return 1;  /* 栈上实际有两个值，但只返回了一个 */
}

/* 正确做法 */
static int l_goodExample(lua_State *L) {
    lua_pushstring(L, "temp");
    /* 使用完后弹出 */
    lua_pop(L, 1);

    lua_pushnumber(L, 42);
    return 1;
}
```

### 不要在 C 函数中直接使用 Lua 栈上的指针

Lua 的垃圾回收器可能在任何时候移动字符串，所以不要保存从 lua_tostring 获得的指针：

```c
/* 错误：指针可能失效 */
static int l_badPointer(lua_State *L) {
    const char *s = lua_tostring(L, 1);
    lua_pop(L, 1);  /* 弹出后，s 可能失效 */
    printf("%s\n", s);  /* 危险！ */
    return 0;
}

/* 正确：在使用期间保持值在栈上 */
static int l_goodPointer(lua_State *L) {
    const char *s = lua_tostring(L, 1);
    printf("%s\n", s);  /* 使用时值还在栈上 */
    lua_pop(L, 1);      /* 使用完后再弹出 */
    return 0;
}
```

### luaL_check vs lua_to

luaL_check 系列函数会检查类型，类型不对时抛出 Lua 错误。lua_to 系列函数不做检查，类型不对时返回 0 或 NULL。对于公开给 Lua 的函数，建议使用 luaL_check 确保参数类型正确。

## 进阶用法

### 元表与面向对象

为用户数据设置元表，实现面向对象风格：

```c
/* __index 元方法：支持 obj:method() 调用 */
static int l_pointIndex(lua_State *L) {
    Point *p = (Point *)luaL_checkudata(L, 1, "Point");
    const char *key = luaL_checkstring(L, 2);

    if (strcmp(key, "x") == 0) {
        lua_pushnumber(L, p->x);
    } else if (strcmp(key, "y") == 0) {
        lua_pushnumber(L, p->y);
    } else {
        lua_pushnil(L);
    }
    return 1;
}

/* __newindex 元方法：支持 obj.field = value */
static int l_pointNewIndex(lua_State *L) {
    Point *p = (Point *)luaL_checkudata(L, 1, "Point");
    const char *key = luaL_checkstring(L, 2);
    double value = luaL_checknumber(L, 3);

    if (strcmp(key, "x") == 0) {
        p->x = value;
    } else if (strcmp(key, "y") == 0) {
        p->y = value;
    }
    return 0;
}
```

### 嵌入 Lua 解释器

在 C 程序中嵌入完整的 Lua 解释器：

```c
#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

int main(int argc, char *argv[]) {
    /* 创建 Lua 状态 */
    lua_State *L = luaL_newstate();

    /* 打开标准库 */
    luaL_openlibs(L);

    /* 执行 Lua 脚本 */
    if (luaL_dofile(L, "script.lua") != LUA_OK) {
        fprintf(stderr, "错误: %s\n", lua_tostring(L, -1));
        lua_pop(L, 1);
    }

    /* 注册 C 函数供 Lua 调用 */
    lua_register(L, "c_add", l_add);

    /* 关闭 Lua 状态 */
    lua_close(L);
    return 0;
}
```
