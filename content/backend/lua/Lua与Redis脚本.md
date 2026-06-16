---
order: 59
title: Lua与Redis脚本
module: lua
category: Lua
difficulty: intermediate
description: 'Redis Lua脚本'
author: fanquanpp
updated: '2026-06-14'
related:
  - lua/Lua与Love2D
  - lua/Lua与Neovim
  - lua/Lua与Nginx
  - lua/模块与包
prerequisites:
  - lua/概述与环境配置
---

## 概述

Redis 从 2.6 版本开始内置了 Lua 脚本支持，允许开发者将多个 Redis 命令打包为一个原子操作在服务端执行。这一特性极大地扩展了 Redis 的能力边界，使得原本需要多次网络往返的复杂逻辑可以在服务端一次性完成，既减少了网络延迟，又保证了操作的原子性。

Redis 中的 Lua 脚本运行在一个受限的沙箱环境中。脚本不能访问外部文件系统、网络或系统调用，只能通过 redis.call 和 redis.pcall 函数执行 Redis 命令，通过 KEYS 和 ARGV 数组接收参数。这种设计确保了脚本执行的安全性和可预测性。Redis 保证同一个脚本在所有节点上执行的结果一致，这也是 Redis Cluster 中脚本正确运行的基础。

## 基本概念

**EVAL 命令**是执行 Lua 脚本的基本方式。语法为 `EVAL script numkeys key [key ...] arg [arg ...]`，其中 script 是 Lua 脚本代码，numkeys 指定键的数量，之后的参数分为键（KEYS）和参数（ARGV）两部分。Redis 将键和参数分别传递给脚本中的 KEYS 和 ARGV 全局变量。

**EVALSHA 命令**是 EVAL 的优化版本。Redis 会对每个脚本计算 SHA1 校验和并缓存编译结果，EVALSHA 通过校验和引用已缓存的脚本，避免了每次传输完整脚本的开销。大多数 Redis 客户端库会自动使用 EVALSHA 并在脚本未缓存时回退到 EVAL。

**redis.call 和 redis.pcall** 是脚本中执行 Redis 命令的两种方式。两者功能相同，区别在于命令执行失败时的处理方式：redis.call 会直接将错误返回给调用者，而 redis.pcall 会以 Lua 表的形式返回错误信息，允许脚本自行处理错误。

**原子性**是 Redis Lua 脚本最重要的特性。当一个脚本开始执行后，Redis 不会执行其他客户端的命令，直到脚本执行完毕。这意味着脚本中的所有 Redis 命令作为一个不可分割的整体执行，不会被其他命令穿插。但这也意味着长脚本会阻塞 Redis，应尽量保持脚本简短。

**KEYS 和 ARGV** 是脚本与外部通信的参数接口。KEYS 数组包含脚本要操作的 Redis 键名，ARGV 数组包含其他参数。遵循规范应将所有键名放在 KEYS 中，而非硬编码在脚本里，这是 Redis Cluster 正确路由请求的前提。

## 快速开始

使用 redis-cli 执行一个简单的 Lua 脚本：

```bash
# 最简单的 Lua 脚本：设置一个键并返回结果
redis-cli EVAL "return redis.call('SET', KEYS[1], ARGV[1])" 1 mykey myvalue
# 输出: OK

# 读取键值
redis-cli EVAL "return redis.call('GET', KEYS[1])" 1 mykey
# 输出: "myvalue"
```

在脚本中使用 Lua 逻辑：

```bash
# 条件设置：仅当键不存在时才设置
redis-cli EVAL "
if redis.call('EXISTS', KEYS[1]) == 0 then
    return redis.call('SET', KEYS[1], ARGV[1])
else
    return 0
end
" 1 mykey newvalue
```

使用编程语言（以 Python 为例）执行 Lua 脚本：

```python
import redis

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# 限流脚本
rate_limit_script = """
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])

local current = tonumber(redis.call('GET', key) or '0')
if current >= limit then
    return 0
end

redis.call('INCR', key)
redis.call('EXPIRE', key, window)
return 1
"""

# 执行脚本
result = r.eval(rate_limit_script, 1, "rate:192.168.1.1", 100, 60)
print("请求是否允许:", "是" if result == 1 else "否")
```

## 详细用法

### 基本数据类型操作

在 Lua 脚本中操作 Redis 的各种数据类型：

```lua
-- 字符串操作
redis.call('SET', KEYS[1], ARGV[1])           -- 设置字符串
local value = redis.call('GET', KEYS[1])       -- 获取字符串
redis.call('INCR', KEYS[2])                    -- 自增
redis.call('INCRBY', KEYS[2], 10)              -- 增加指定值

-- 哈希操作
redis.call('HSET', KEYS[1], 'name', ARGV[1])  -- 设置哈希字段
redis.call('HSET', KEYS[1], 'age', ARGV[2])   -- 设置另一个字段
local name = redis.call('HGET', KEYS[1], 'name')  -- 获取字段
local all = redis.call('HGETALL', KEYS[1])     -- 获取所有字段

-- 列表操作
redis.call('LPUSH', KEYS[1], ARGV[1], ARGV[2])  -- 左侧插入
redis.call('RPUSH', KEYS[1], ARGV[3])            -- 右侧插入
local item = redis.call('LPOP', KEYS[1])         -- 左侧弹出
local len = redis.call('LLEN', KEYS[1])           -- 列表长度

-- 集合操作
redis.call('SADD', KEYS[1], ARGV[1], ARGV[2])   -- 添加成员
local is_member = redis.call('SISMEMBER', KEYS[1], ARGV[1])  -- 是否成员
local count = redis.call('SCARD', KEYS[1])        -- 成员数量

-- 有序集合操作
redis.call('ZADD', KEYS[1], ARGV[1], ARGV[2])   -- 添加成员和分数
local top = redis.call('ZREVRANGE', KEYS[1], 0, 9, 'WITHSCORES')  -- 前10名
```

### 类型转换注意事项

Redis 和 Lua 之间的类型转换需要特别注意：

```lua
-- Redis 返回值的 Lua 类型映射
-- Redis 整数 -> Lua 数字
local int_result = redis.call('INCR', KEYS[1])  -- 返回 number 类型

-- Redis 字符串 -> Lua 字符串
local str_result = redis.call('GET', KEYS[1])    -- 返回 string 类型

-- Redis 列表 -> Lua 表（索引从 1 开始）
local list_result = redis.call('LRANGE', KEYS[1], 0, -1)  -- 返回 table

-- Redis 空值 -> Lua false
local nil_result = redis.call('GET', 'nonexistent')  -- 返回 false（不是 nil！）

-- Redis 状态回复 -> Lua 表 {ok = message}
local status_result = redis.call('SET', KEYS[1], ARGV[1])  -- 返回 {ok = "OK"}

-- 检查空值的正确方式
local value = redis.call('GET', KEYS[1])
if value == false then
    -- 键不存在
    return "键不存在"
else
    -- 键存在
    return value
end
```

数字类型的精度问题：

```lua
-- Lua 中只有浮点数，大整数可能丢失精度
-- Redis 的 INCR 返回整数，但 Lua 可能将其转为浮点数
local count = redis.call('INCR', KEYS[1])

-- 使用 tonumber 确保数字类型
local limit = tonumber(ARGV[1])
local current = tonumber(redis.call('GET', KEYS[1]) or '0')

-- 比较时注意类型
if current >= limit then
    return 0
end
```

### 分布式锁实现

使用 Lua 脚本实现可重入的分布式锁：

```lua
-- 加锁脚本
-- KEYS[1]: 锁的键名
-- ARGV[1]: 锁的持有者标识（如客户端 ID）
-- ARGV[2]: 锁的过期时间（毫秒）
-- ARGV[3]: 可重入计数（默认为 1）

local lock_key = KEYS[1]
local lock_holder = ARGV[1]
local lock_timeout = tonumber(ARGV[2])

-- 检查锁是否已被持有
local current_holder = redis.call('GET', lock_key)

if current_holder == false then
    -- 锁未被持有，直接加锁
    redis.call('SET', lock_key, lock_holder)
    redis.call('PEXPIRE', lock_key, lock_timeout)
    return 1
end

if current_holder == lock_holder then
    -- 同一个持有者，重入加锁（续期）
    redis.call('PEXPIRE', lock_key, lock_timeout)
    return 1
end

-- 锁被其他持有者占用
return 0
```

解锁脚本：

```lua
-- 解锁脚本
-- KEYS[1]: 锁的键名
-- ARGV[1]: 锁的持有者标识

local lock_key = KEYS[1]
local lock_holder = ARGV[1]

local current_holder = redis.call('GET', lock_key)

-- 只有持有者才能解锁
if current_holder == lock_holder then
    redis.call('DEL', lock_key)
    return 1
end

-- 不是持有者，无法解锁
if current_holder == false then
    return -1  -- 锁已过期
end

return 0  -- 锁被其他持有者持有
```

### 滑动窗口限流

实现精确的滑动窗口限流算法：

```lua
-- 滑动窗口限流脚本
-- KEYS[1]: 限流键名
-- ARGV[1]: 窗口内最大请求数
-- ARGV[2]: 窗口大小（秒）
-- ARGV[3]: 当前时间戳（毫秒）

local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

-- 移除窗口外的旧记录
local window_start = now - window * 1000
redis.call('ZREMRANGEBYSCORE', key, '-inf', window_start)

-- 统计当前窗口内的请求数
local current = redis.call('ZCARD', key)

if current >= limit then
    return 0  -- 请求被拒绝
end

-- 记录本次请求（使用时间戳作为分数和成员）
redis.call('ZADD', key, now, now .. ':' .. math.random(1000000))

-- 设置键的过期时间，避免无限增长
redis.call('EXPIRE', key, window + 1)

return 1  -- 请求被允许
```

### 令牌桶限流

实现令牌桶算法：

```lua
-- 令牌桶限流脚本
-- KEYS[1]: 令牌桶键名
-- ARGV[1]: 桶容量（最大令牌数）
-- ARGV[2]: 令牌生成速率（每秒生成的令牌数）
-- ARGV[3]: 当前时间戳（秒）
-- ARGV[4]: 请求消耗的令牌数

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

-- 获取当前令牌数和上次更新时间
local bucket = redis.call('HMGET', key, 'tokens', 'timestamp')
local tokens = tonumber(bucket[1])
local last_time = tonumber(bucket[2])

-- 首次使用，初始化满桶
if tokens == nil then
    tokens = capacity
    last_time = now
end

-- 计算新增的令牌数
local elapsed = now - last_time
local new_tokens = elapsed * rate

-- 更新令牌数（不超过桶容量）
tokens = math.min(capacity, tokens + new_tokens)

-- 检查是否有足够的令牌
if tokens >= requested then
    tokens = tokens - requested
    -- 保存更新后的状态
    redis.call('HMSET', key, 'tokens', tokens, 'timestamp', now)
    redis.call('EXPIRE', key, math.ceil(capacity / rate) + 1)
    return 1  -- 请求被允许
else
    -- 仍然更新令牌数，但不消耗
    redis.call('HMSET', key, 'tokens', tokens, 'timestamp', now)
    redis.call('EXPIRE', key, math.ceil(capacity / rate) + 1)
    return 0  -- 请求被拒绝
end
```

## 常见场景

### 库存扣减

使用 Lua 脚本实现原子性的库存扣减，防止超卖：

```lua
-- 库存扣减脚本
-- KEYS[1]: 库存键名
-- ARGV[1]: 扣减数量

local stock_key = KEYS[1]
local quantity = tonumber(ARGV[1])

-- 获取当前库存
local stock = tonumber(redis.call('GET', stock_key) or '0')

if stock < quantity then
    -- 库存不足
    return {err = "库存不足", stock = stock}
end

-- 扣减库存
local remaining = stock - quantity
redis.call('SET', stock_key, remaining)

return {ok = "扣减成功", stock = remaining}
```

使用哈希存储更丰富的库存信息：

```lua
-- 带订单记录的库存扣减
-- KEYS[1]: 库存键名
-- KEYS[2]: 订单记录键名
-- ARGV[1]: 用户 ID
-- ARGV[2]: 扣减数量

local stock_key = KEYS[1]
local order_key = KEYS[2]
local user_id = ARGV[1]
local quantity = tonumber(ARGV[2])

-- 检查用户是否已下单
if redis.call('HEXISTS', order_key, user_id) == 1 then
    return -1  -- 用户已下单
end

-- 检查库存
local stock = tonumber(redis.call('GET', stock_key) or '0')
if stock < quantity then
    return 0  -- 库存不足
end

-- 扣减库存并记录订单
redis.call('DECRBY', stock_key, quantity)
redis.call('HSET', order_key, user_id, quantity)

return 1  -- 下单成功
```

### 消息队列

实现简单的消息队列：

```lua
-- 生产者：发送消息
-- KEYS[1]: 队列键名
-- ARGV[1]: 消息内容
-- ARGV[2]: 消息优先级（可选）

local queue_key = KEYS[1]
local message = ARGV[1]
local priority = tonumber(ARGV[2]) or 0

-- 使用有序集合实现优先级队列
local message_id = redis.call('INCR', queue_key .. ':id')
redis.call('ZADD', queue_key .. ':pending', priority, message_id .. ':' .. message)

return message_id
```

消费者脚本：

```lua
-- 消费者：获取并处理消息
-- KEYS[1]: 队列键名
-- ARGV[1]: 消费者 ID
-- ARGV[2]: 可见性超时（秒）

local queue_key = KEYS[1]
local consumer_id = ARGV[1]
local timeout = tonumber(ARGV[2])
local now = tonumber(ARGV[3]) or math.floor(redis.call('TIME')[1])

-- 从待处理队列获取优先级最高的消息
local messages = redis.call('ZRANGE', queue_key .. ':pending', 0, 0, 'WITHSCORES')

if #messages == 0 then
    return nil  -- 队列为空
end

local message = messages[1]
local score = tonumber(messages[2])

-- 从待处理队列移除
redis.call('ZREM', queue_key .. ':pending', message)

-- 添加到处理中队列，设置超时
redis.call('ZADD', queue_key .. ':processing', now + timeout, message)

-- 记录消费者
redis.call('HSET', queue_key .. ':consumers', message, consumer_id)

return message
```

### 缓存更新策略

实现缓存的双写一致性：

```lua
-- 缓存更新脚本（先更新数据库标记，再更新缓存）
-- KEYS[1]: 缓存键名
-- KEYS[2]: 更新标记键名
-- ARGV[1]: 新的缓存值
-- ARGV[2]: 缓存过期时间（秒）

local cache_key = KEYS[1]
local mark_key = KEYS[2]
local new_value = ARGV[1]
local ttl = tonumber(ARGV[2])

-- 设置更新标记，防止并发读取到旧数据
redis.call('SET', mark_key, 'updating')
redis.call('EXPIRE', mark_key, 10)

-- 更新缓存
redis.call('SET', cache_key, new_value)
redis.call('EXPIRE', cache_key, ttl)

-- 清除更新标记
redis.call('DEL', mark_key)

return 1
```

缓存读取脚本：

```lua
-- 缓存读取脚本（带更新标记检查）
-- KEYS[1]: 缓存键名
-- KEYS[2]: 更新标记键名

local cache_key = KEYS[1]
local mark_key = KEYS[2]

-- 检查是否有更新操作正在进行
if redis.call('EXISTS', mark_key) == 1 then
    return {status = "updating"}  -- 缓存正在更新，建议回源
end

-- 读取缓存
local value = redis.call('GET', cache_key)

if value == false then
    return {status = "miss"}  -- 缓存未命中
else
    return {status = "hit", value = value}  -- 缓存命中
end
```

## 注意事项与常见错误

**不要在脚本中硬编码键名**。所有键名必须通过 KEYS 数组传入，这是 Redis Cluster 的强制要求。如果键名硬编码在脚本中，Redis Cluster 无法正确判断键所在的节点，可能导致脚本在错误的节点上执行。虽然单节点模式下硬编码不会报错，但为了兼容性和可维护性，应始终使用 KEYS 参数。

**脚本执行时间不能过长**。Redis 是单线程的，Lua 脚本执行期间会阻塞所有其他客户端的请求。默认的脚本超时时间为 5 秒（可通过 lua-time-limit 配置修改），超过此时间 Redis 会开始接受其他客户端的 SCRIPT KILL 命令。应尽量将复杂逻辑拆分为多个简短的脚本。

**注意 Lua 的浮点数精度**。Lua 中只有一种数字类型（双精度浮点数），而 Redis 的整数操作返回的是精确整数。当整数超过 2^53 时，Lua 可能丢失精度。对于大整数操作，建议在脚本中使用字符串处理。

**redis.call 与 redis.pcall 的选择**。如果脚本中的 Redis 命令可能失败且需要自行处理错误，使用 redis.pcall；否则使用 redis.call 让错误直接传播。大多数情况下使用 redis.call 更简单，因为脚本中的命令通常不应失败。

**KEYS 和 ARGV 的索引从 1 开始**。Lua 的数组索引从 1 开始，因此 KEYS[1] 是第一个键，ARGV[1] 是第一个参数。这与许多编程语言从 0 开始的索引不同，容易导致越界错误。

## 高级用法

### 脚本缓存管理

使用 SCRIPT 命令管理脚本缓存：

```bash
# 加载脚本到缓存（不执行），返回 SHA1 校验和
redis-cli SCRIPT LOAD "return redis.call('GET', KEYS[1])"
# 输出: faab5f8b4d0d31e9852e1d97c5b8c6e7e5c5d5a1

# 使用 EVALSHA 执行已缓存的脚本
redis-cli EVALSHA faab5f8b4d0d31e9852e1d97c5b8c6e7e5c5d5a1 1 mykey

# 检查脚本是否在缓存中
redis-cli SCRIPT EXISTS faab5f8b4d0d31e9852e1d97c5b8c6e7e5c5d5a1
# 输出: 1

# 清除所有脚本缓存
redis-cli SCRIPT FLUSH

# 杀死正在执行的脚本
redis-cli SCRIPT KILL
```

### Redis 函数（Redis 7.0+）

Redis 7.0 引入了 Redis Functions，是 Lua 脚本的增强替代方案：

```lua
-- 注册 Redis 函数
-- 使用 redis-cli --functions-rdb 或 FUNCTION LOAD 加载

#!lua name=mylib

-- 注册函数
redis.register_function('rate_limit', function(keys, args)
    local key = keys[1]
    local limit = tonumber(args[1])
    local window = tonumber(args[2])

    local current = tonumber(redis.call('GET', key) or '0')
    if current >= limit then
        return 0
    end

    redis.call('INCR', key)
    redis.call('EXPIRE', key, window)
    return 1
end)

-- 注册带标志的函数（允许在从库执行）
redis.register_function{
    function_name='get_cache',
    callback=function(keys, args)
        return redis.call('GET', keys[1])
    end,
    flags={ 'no-writes' }  -- 标记为只读函数
}
```

调用 Redis 函数：

```bash
# 调用函数
redis-cli FCALL rate_limit 1 rate:192.168.1.1 100 60

# 只读调用（可在从库执行）
redis-cli FCALL_RO get_cache 1 mykey
```

### 流式处理

使用 Lua 脚本处理 Redis Stream：

```lua
-- 消费者组消息处理脚本
-- KEYS[1]: Stream 键名
-- KEYS[2]: 处理结果键名
-- ARGV[1]: 消费者组名
-- ARGV[2]: 消费者名
-- ARGV[3]: 最大处理数量

local stream_key = KEYS[1]
local result_key = KEYS[2]
local group = ARGV[1]
local consumer = ARGV[2]
local count = tonumber(ARGV[3])

-- 从消费者组读取未处理的消息
local messages = redis.call('XREADGROUP', 'GROUP', group, consumer,
    'COUNT', count, 'STREAMS', stream_key, '>')

if not messages then
    return {}  -- 没有新消息
end

-- 处理每条消息
local processed = {}
for _, stream_data in ipairs(messages) do
    local entries = stream_data[2]
    for _, entry in ipairs(entries) do
        local id = entry[1]
        local fields = entry[2]

        -- 提取消息字段
        local data = {}
        for i = 1, #fields, 2 do
            data[fields[i]] = fields[i + 1]
        end

        -- 模拟处理逻辑（此处为简单存储）
        redis.call('HSET', result_key, id, data['value'] or '')

        -- 确认消息已处理
        redis.call('XACK', stream_key, group, id)

        processed[#processed + 1] = id
    end
end

return processed
```

### 多键事务

使用 Lua 脚本实现跨键的事务操作：

```lua
-- 转账脚本：从账户 A 转账到账户 B
-- KEYS[1]: 账户 A 的键名
-- KEYS[2]: 账户 B 的键名
-- ARGV[1]: 转账金额

local account_a = KEYS[1]
local account_b = KEYS[2]
local amount = tonumber(ARGV[1])

-- 获取两个账户的余额
local balance_a = tonumber(redis.call('GET', account_a) or '0')
local balance_b = tonumber(redis.call('GET', account_b) or '0')

-- 检查账户 A 余额是否充足
if balance_a < amount then
    return {err = "余额不足", balance = balance_a}
end

-- 执行转账
local new_balance_a = balance_a - amount
local new_balance_b = balance_b + amount

redis.call('SET', account_a, new_balance_a)
redis.call('SET', account_b, new_balance_b)

-- 记录转账日志
local log_key = 'transfer:log'
local log_entry = string.format('%s -> %s: %d', account_a, account_b, amount)
redis.call('LPUSH', log_key, log_entry)

return {
    ok = "转账成功",
    from_balance = new_balance_a,
    to_balance = new_balance_b,
}
```

### 发布订阅与脚本

在 Lua 脚本中发布消息：

```lua
-- 带条件检查的发布脚本
-- KEYS[1]: 状态键名
-- ARGV[1]: 频道名
-- ARGV[2]: 消息内容
-- ARGV[3]: 期望的状态值

local state_key = KEYS[1]
local channel = ARGV[1]
local message = ARGV[2]
local expected_state = ARGV[3]

-- 检查当前状态
local current_state = redis.call('GET', state_key)

if current_state == expected_state then
    -- 状态匹配，发布消息
    redis.call('PUBLISH', channel, message)
    return 1
end

-- 状态不匹配，不发布
return 0
```
