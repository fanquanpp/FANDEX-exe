---
order: 60
title: Lua与Nginx
module: lua
category: Lua
difficulty: intermediate
description: 'OpenResty Lua开发'
author: fanquanpp
updated: '2026-06-14'
related:
  - lua/Lua与Neovim
  - lua/Lua与Redis脚本
  - lua/模块与包
  - lua/Lua错误处理
prerequisites:
  - lua/概述与环境配置
---

## 概述

OpenResty 是一个基于 Nginx 的高性能 Web 平台，其核心思想是将 Lua 嵌入 Nginx 中，使得开发者可以用 Lua 脚本直接处理请求、访问数据库、执行复杂逻辑，而无需依赖外部应用服务器。OpenResty 内置了大量精心编写的 Lua 库和第三方模块，能够轻松构建高并发、低延迟的 Web 应用、API 网关和微服务。

传统 Nginx 只能通过配置文件定义静态路由和反向代理规则，而 OpenResty 通过 Lua 脚本赋予了 Nginx 动态编程能力。每个请求的处理过程被划分为多个阶段（phase），开发者可以在不同阶段插入 Lua 代码，实现认证、限流、缓存、日志记录等功能。这种架构使得请求在 Nginx 进程内即可完成全部处理，避免了进程间通信的开销。

## 基本概念

**请求处理阶段**是 OpenResty 的核心机制。Nginx 将一个 HTTP 请求的处理过程拆分为多个阶段，OpenResty 为每个阶段提供了对应的 Lua 指令。最常用的阶段包括：set_by_lua 用于变量赋值，rewrite_by_lua 用于 URL 重写，access_by_lua 用于访问控制，content_by_lua 用于生成响应内容，header_filter_by_lua 用于修改响应头，body_filter_by_lua 用于修改响应体，log_by_lua 用于日志记录。

**ngx.shared.DICT** 是 OpenResty 提供的进程间共享内存字典。Nginx 采用多进程模型，每个 worker 进程拥有独立的内存空间，而共享内存字典则允许不同 worker 进程之间交换数据。它支持原子操作，非常适合实现缓存、限流计数器等场景。

**cosocket** 是 OpenResty 提供的非阻塞 socket API，全称为 cosocket（coroutine-based socket）。它基于 Lua 协程实现，在等待网络 I/O 时会自动让出当前协程，不会阻塞 Nginx 的 worker 进程。这使得在 Lua 中进行 HTTP 请求、数据库查询等网络操作时，不会影响其他请求的处理。

**ngx.timer** 是 OpenResty 的定时器机制，用于在后台异步执行任务。定时器运行在独立的协程中，不会阻塞任何请求。它常用于定时刷新缓存、后台数据同步、健康检查等场景。

## 快速开始

首先需要安装 OpenResty。以 Ubuntu 为例，可以通过官方源安装：

```bash
# 添加 OpenResty 官方源
wget -qO - https://openresty.org/package/pubkey.gpg | sudo apt-key add -
sudo apt-get update
sudo apt-get install openresty
```

安装完成后，创建一个最简单的 OpenResty 应用。创建工作目录和配置文件：

```bash
mkdir -p ~/openresty-app/conf ~/openresty-app/logs
```

编写 Nginx 配置文件 `conf/nginx.conf`：

```nginx
worker_processes 1;
error_log logs/error.log;
events {
    worker_connections 1024;
}
http {
    server {
        listen 8080;
        location /hello {
            content_by_lua_block {
                ngx.say("Hello from OpenResty!")
            }
        }
    }
}
```

启动服务并测试：

```bash
# 启动 OpenResty
openresty -p ~/openresty-app -c conf/nginx.conf

# 测试请求
curl http://localhost:8080/hello
# 输出: Hello from OpenResty!
```

这是一个最基础的示例，在 content 阶段通过 Lua 脚本直接返回响应内容。

## 详细用法

### 请求阶段处理

OpenResty 最强大的能力在于可以在请求的各个阶段插入 Lua 逻辑。以下示例展示了多阶段协同工作：

```nginx
server {
    listen 8080;

    # set 阶段：初始化变量
    set_by_lua_block $my_var {
        return "default_value"
    }

    # rewrite 阶段：URL 重写
    rewrite_by_lua_block {
        -- 将 /api/old 路径重写为 /api/new
        local uri = ngx.var.uri
        if uri == "/api/old" then
            ngx.req.set_uri("/api/new", true)
        end
    }

    # access 阶段：访问控制与认证
    access_by_lua_block {
        local token = ngx.var.http_authorization
        if not token then
            ngx.status = 401
            ngx.say('{"error": "未提供认证令牌"}')
            ngx.exit(401)
        end

        -- 验证令牌格式
        if not token:match("^Bearer%s+%S+$") then
            ngx.status = 403
            ngx.say('{"error": "令牌格式无效"}')
            ngx.exit(403)
        end
    }

    # content 阶段：生成响应
    location /api/data {
        content_by_lua_block {
            ngx.header.content_type = "application/json"
            ngx.say('{"status": "ok", "data": []}')
        }
    }

    # log 阶段：记录请求日志
    log_by_lua_block {
        local request_time = ngx.now() - ngx.req.start_time()
        ngx.log(ngx.INFO, "请求耗时: " .. request_time .. "秒")
    }
}
```

### 共享内存字典

共享内存字典需要在 http 块中声明，然后即可在各阶段使用：

```nginx
http {
    # 声明共享内存区域，大小为 1MB
    lua_shared_dict rate_limit 1m;

    server {
        listen 8080;

        location /api {
            access_by_lua_block {
                local limit_dict = ngx.shared.rate_limit
                -- 获取客户端 IP 作为限流键
                local client_ip = ngx.var.remote_addr
                local key = "rate:" .. client_ip

                -- 原子递增计数器
                local count, err = limit_dict:incr(key, 1, 0)
                if not count then
                    ngx.log(ngx.ERR, "限流计数器更新失败: ", err)
                    ngx.exit(500)
                end

                -- 首次访问时设置过期时间（60秒窗口）
                if count == 1 then
                    limit_dict:expire(key, 60)
                end

                -- 每分钟最多 100 次请求
                if count > 100 then
                    ngx.status = 429
                    ngx.say('{"error": "请求过于频繁，请稍后再试"}')
                    ngx.exit(429)
                end
            }

            content_by_lua_block {
                ngx.say('{"status": "ok"}')
            }
        }
    }
}
```

### cosocket 非阻塞网络请求

cosocket 允许在 Lua 中发起非阻塞的网络请求，这是 OpenResty 实现微服务网关的关键能力：

```lua
-- content_by_lua_block 中发起 HTTP 子请求
local res = ngx.location.capture("/internal_backend")
if res.status == 200 then
    ngx.say(res.body)
else
    ngx.status = res.status
    ngx.say("上游服务不可用")
end
```

使用 lua-resty-http 库发起完整的 HTTP 请求：

```lua
-- 需要先安装 lua-resty-http
-- opm get ledgetech/lua-resty-http
local http = require("resty.http")
local httpc = http.new()

-- 发起 GET 请求
local res, err = httpc:request_uri("http://backend-service:8080/api/data", {
    method = "GET",
    headers = {
        ["Authorization"] = ngx.var.http_authorization,
    },
    timeout = 3000,  -- 3秒超时
})

if not res then
    ngx.log(ngx.ERR, "请求上游失败: ", err)
    ngx.status = 502
    ngx.say('{"error": "上游服务不可达"}')
    return
end

-- 转发上游响应
ngx.status = res.status
ngx.header.content_type = res.headers["Content-Type"]
ngx.say(res.body)
```

### 连接 Redis

OpenResty 内置了 lua-resty-redis 库，可以直接在 Nginx 中操作 Redis：

```lua
local redis = require "resty.redis"
local red = redis:new()

-- 设置超时时间（毫秒）
red:set_timeouts(1000, 1000, 1000)

-- 连接 Redis
local ok, err = red:connect("127.0.0.1", 6379)
if not ok then
    ngx.log(ngx.ERR, "连接 Redis 失败: ", err)
    return
end

-- 从 Redis 获取缓存数据
local key = "cache:" .. ngx.var.uri
local cached, err = red:get(key)

if cached and cached ~= ngx.null then
    -- 缓存命中，直接返回
    ngx.header.content_type = "application/json"
    ngx.header["X-Cache"] = "HIT"
    ngx.say(cached)
    return
end

-- 缓存未命中，回源获取数据（此处模拟）
local data = '{"status":"ok","source":"origin"}'

-- 写入缓存，设置 60 秒过期
local ok, err = red:setex(key, 60, data)
if not ok then
    ngx.log(ngx.ERR, "写入缓存失败: ", err)
end

ngx.header["X-Cache"] = "MISS"
ngx.say(data)

-- 将连接归还到连接池（重要！）
local ok, err = red:set_keepalive(10000, 100)
if not ok then
    ngx.log(ngx.ERR, "归还连接池失败: ", err)
end
```

### 连接 MySQL

使用 lua-resty-mysql 操作数据库：

```lua
local mysql = require "resty.mysql"
local db, err = mysql:new()

db:set_timeout(5000)

local ok, err = db:connect({
    host = "127.0.0.1",
    port = 3306,
    database = "myapp",
    user = "root",
    password = "secret",
    charset = "utf8mb4",
})

if not ok then
    ngx.log(ngx.ERR, "数据库连接失败: ", err)
    ngx.status = 500
    ngx.say('{"error": "服务内部错误"}')
    return
end

-- 执行查询
local res, err = db:query("SELECT id, name FROM users LIMIT 10")
if not res then
    ngx.log(ngx.ERR, "查询失败: ", err)
    ngx.status = 500
    return
end

-- 构造 JSON 响应
local cjson = require "cjson"
ngx.header.content_type = "application/json"
ngx.say(cjson.encode(res))

-- 归还连接池
db:set_keepalive(10000, 50)
```

### 定时器任务

使用 ngx.timer 在后台执行定时任务：

```lua
-- 在 init_worker_by_lua_block 中启动定时器
init_worker_by_lua_block {
    local function refresh_config(premature)
        if premature then
            return  -- Nginx 正在关闭
        end

        -- 从配置中心拉取最新配置
        local http = require("resty.http")
        local httpc = http.new()
        local res, err = httpc:request_uri("http://config-server:8080/api/config", {
            method = "GET",
            timeout = 5000,
        })

        if res and res.status == 200 then
            local cjson = require "cjson"
            local config = cjson.decode(res.body)
            -- 将配置存入共享内存
            local dict = ngx.shared.app_config
            dict:set("routes", res.body)
            ngx.log(ngx.INFO, "配置刷新成功")
        else
            ngx.log(ngx.ERR, "配置刷新失败: ", err or "HTTP " .. (res and res.status or "unknown"))
        end

        -- 每隔 30 秒再次执行
        local ok, err = ngx.timer.at(30, refresh_config)
        if not ok then
            ngx.log(ngx.ERR, "创建定时器失败: ", err)
        end
    end

    -- 首次延迟 1 秒执行
    local ok, err = ngx.timer.at(1, refresh_config)
    if not ok then
        ngx.log(ngx.ERR, "创建定时器失败: ", err)
    end
}
```

## 常见场景

### API 网关路由分发

OpenResty 非常适合作为 API 网关，根据请求路径将流量分发到不同的后端服务：

```nginx
location /api/ {
    access_by_lua_block {
        local uri = ngx.var.uri
        local backend

        -- 根据路径前缀路由到不同服务
        if uri:match("^/api/users") then
            backend = "user-service"
        elseif uri:match("^/api/orders") then
            backend = "order-service"
        elseif uri:match("^/api/products") then
            backend = "product-service"
        else
            ngx.status = 404
            ngx.say('{"error": "未知的 API 路径"}')
            ngx.exit(404)
        end

        -- 将后端服务名存入变量，供 proxy_pass 使用
        ngx.var.backend = backend
    }

    proxy_pass http://$backend;
}
```

### JWT 认证中间件

在 access 阶段实现 JWT 令牌验证：

```lua
access_by_lua_block {
    local jwt = require "resty.jwt"
    local cjson = require "cjson"

    local auth_header = ngx.var.http_authorization
    if not auth_header then
        ngx.status = 401
        ngx.say('{"error": "缺少认证头"}')
        ngx.exit(401)
    end

    -- 提取 Bearer 令牌
    local token = auth_header:match("Bearer%s+(.+)")
    if not token then
        ngx.status = 401
        ngx.say('{"error": "令牌格式错误"}')
        ngx.exit(401)
    end

    -- 验证 JWT
    local secret = "your-jwt-secret-key"
    local jwt_obj = jwt:verify(secret, token)

    if not jwt_obj.verified then
        ngx.status = 401
        ngx.say('{"error": "令牌无效或已过期"}')
        ngx.exit(401)
    end

    -- 将用户信息存入请求上下文，供后续阶段使用
    ngx.ctx.user_id = jwt_obj.payload.sub
    ngx.ctx.user_role = jwt_obj.payload.role
}
```

### 响应缓存

利用共享内存实现响应缓存：

```lua
content_by_lua_block {
    local dict = ngx.shared.response_cache
    local cache_key = ngx.var.request_method .. ":" .. ngx.var.uri

    -- 尝试从缓存获取
    local cached = dict:get(cache_key)
    if cached then
        ngx.header.content_type = "application/json"
        ngx.header["X-Cache"] = "HIT"
        ngx.say(cached)
        return
    end

    -- 缓存未命中，回源获取
    local http = require("resty.http")
    local httpc = http.new()
    local res, err = httpc:request_uri("http://backend:8080" .. ngx.var.uri, {
        method = ngx.var.request_method,
    })

    if not res or res.status ~= 200 then
        ngx.status = 502
        ngx.say('{"error": "上游服务不可用"}')
        return
    end

    -- 写入缓存，TTL 为 30 秒
    dict:set(cache_key, res.body, 30)

    ngx.header.content_type = "application/json"
    ngx.header["X-Cache"] = "MISS"
    ngx.say(res.body)
}
```

## 注意事项与常见错误

**不要在 Lua 中使用阻塞操作**。这是 OpenResty 开发中最重要的规则。标准的 Lua I/O 库（如 io.open）、socket 库、os.execute 等都是阻塞调用，会导致整个 Nginx worker 进程被挂起，严重影响并发性能。必须使用 OpenResty 提供的非阻塞 API，如 lua-resty-http、lua-resty-redis、lua-resty-mysql 等。

**连接必须归还连接池**。使用 cosocket 连接 Redis、MySQL 等服务后，务必调用 set_keepalive 方法将连接归还到连接池，而不是调用 close 关闭连接。每次请求都新建连接会导致严重的性能损耗。连接池参数中，第一个是最大空闲时间（毫秒），第二个是连接池大小。

**共享内存字典的大小在配置时确定**。lua_shared_dict 的大小在 Nginx 配置中声明后无法动态调整，修改后需要重启 Nginx。设计时需要根据业务量合理估算所需空间，避免因空间不足导致数据被提前淘汰。

**init_by_lua_block 中不能使用 cosocket**。在 Nginx 启动初始化阶段（init_by_lua_block），cosocket API 尚不可用，因为此时 worker 进程还未启动。如果需要在启动时加载配置，可以使用 ngx.location.capture 发起子请求，或者使用 io.open 读取本地文件。

**注意 Lua 代码的热加载**。修改 Lua 源文件后，默认不会立即生效。需要在 Nginx 配置中设置 `lua_code_cache off`（仅用于开发环境），或者通过 `HUP` 信号重新加载 Nginx 配置。生产环境务必开启代码缓存，否则每次请求都会重新编译 Lua 代码，性能极差。

## 高级用法

### 动态上游与负载均衡

利用 OpenResty 实现动态负载均衡，根据共享内存中的后端列表分发请求：

```lua
-- 在 init_worker_by_lua_block 中初始化后端列表
local dict = ngx.shared.upstreams
dict:set("backends", "10.0.0.1:8080,10.0.0.2:8080,10.0.0.3:8080")

-- 在 balancer_by_lua_block 中实现负载均衡
balancer_by_lua_block {
    local dict = ngx.shared.upstreams
    local backends_str = dict:get("backends")

    if not backends_str then
        ngx.log(ngx.ERR, "未找到后端列表")
        ngx.exit(500)
    end

    -- 解析后端列表
    local backends = {}
    for backend in backends_str:gmatch("[^,]+") do
        backends[#backends + 1] = backend
    end

    -- 简单轮询负载均衡
    local idx = ngx.shared.balancer:incr("counter", 1, 0) % #backends + 1
    local host, port = backends[idx]:match("([^:]+):(%d+)")

    local balancer = require "ngx.balancer"
    local ok, err = balancer.set_current_peer(host, tonumber(port))
    if not ok then
        ngx.log(ngx.ERR, "设置后端失败: ", err)
        ngx.exit(500)
    end
}
```

### 请求链路追踪

在分布式系统中实现请求链路追踪：

```lua
-- 生成唯一的请求追踪 ID
local function generate_trace_id()
    local resty_random = require "resty.random"
    local str = require "resty.string"
    local random_bytes = resty_random.bytes(16)
    return str.to_hex(random_bytes)
end

-- 在 access 阶段注入追踪头
access_by_lua_block {
    local trace_id = ngx.var.http_x_trace_id
    if not trace_id or trace_id == "" then
        trace_id = generate_trace_id()
    end

    -- 将追踪 ID 存入上下文
    ngx.ctx.trace_id = trace_id

    -- 设置响应头，方便客户端追踪
    ngx.header["X-Trace-Id"] = trace_id
end

-- 在 log 阶段记录追踪信息
log_by_lua_block {
    local trace_id = ngx.ctx.trace_id
    local request_time = ngx.now() - ngx.req.start_time()
    ngx.log(ngx.INFO, "trace_id=", trace_id,
            " method=", ngx.var.request_method,
            " uri=", ngx.var.uri,
            " status=", ngx.var.status,
            " time=", request_time)
end
```

### 流式响应处理

使用 body_filter 实现响应体的流式处理，例如在响应中注入统计脚本：

```nginx
header_filter_by_lua_block {
    -- 仅处理 HTML 响应
    local content_type = ngx.header.content_type
    if content_type and content_type:match("text/html") then
        ngx.ctx.is_html = true
    end
}

body_filter_by_lua_block {
    if not ngx.ctx.is_html then
        return
    end

    local chunk = ngx.arg[1]
    local eof = ngx.arg[2]

    if eof and chunk then
        -- 在响应末尾注入统计脚本
        local script = '<script>console.log("tracked");</script>'
        chunk = chunk:gsub("</body>", script .. "</body>", 1)
        ngx.arg[1] = chunk
    end
}
```
