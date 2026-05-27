---
title: "Java 标准库名词注释 (Standard Library Glossary)"
module: "java"
category: "Standard Library"
description: "Java 标准库：集合/IO/并发/流等 | Java standard library: Collections, I/O, Concurrency, Streams"
---

## A

| 术语 | 英文 | 释义 |
|------|------|------|
| ArrayList | ArrayList | 基于动态数组的 List 实现，查询 O(1)，增删 O(n)，初始容量 10，扩容因子 1.5 |
| Arrays 类 | Arrays | 提供数组操作的静态工具方法：排序、搜索、填充、转字符串等 |

## B

| 术语 | 英文 | 释义 |
|------|------|------|
| BufferedReader | BufferedReader | 字符缓冲输入流，提供 `readLine()` 方法，默认缓冲区 8192 字符 |
| BufferedWriter | BufferedWriter | 字符缓冲输出流，提供 `newLine()` 跨平台换行方法 |
| BlockingQueue | BlockingQueue | 阻塞队列接口，`put()` 阻塞入队、`take()` 阻塞出队，用于生产者-消费者模式 |
| BitSet | BitSet | 位集合，动态增长的位向量，节省内存的布尔集合实现 |

## C

| 术语 | 英文 | 释义 |
|------|------|------|
| Collection | Collection | 所有单列集合的根接口，定义 `add`、`remove`、`contains`、`size` 等基本操作 |
| Collections | Collections | 集合工具类，提供排序、查找、同步包装、不可变包装等静态方法 |
| ConcurrentHashMap | ConcurrentHashMap | 线程安全的哈希表实现，JDK8 使用 CAS + synchronized 优化，分段锁已弃用 |
| Callable | Callable | 类似 `Runnable` 但可返回结果和抛出异常的函数式接口，配合 `Future` 使用 |
| CountDownLatch | CountDownLatch | 同步辅助类，允许一个或多个线程等待其他线程完成操作 |
| CyclicBarrier | CyclicBarrier | 同步辅助类，让一组线程互相等待到达屏障点后继续执行，可循环使用 |
| CompletableFuture | CompletableFuture | Java 8 引入的异步编程工具，支持链式调用、组合多个异步任务 |
| 字符流 | Character Stream | 以字符为单位处理文本数据的 I/O 流，基类 `Reader` 和 `Writer` |
| 字节流 | Byte Stream | 以字节为单位处理二进制数据的 I/O 流，基类 `InputStream` 和 `OutputStream` |

## D

| 术语 | 英文 | 释义 |
|------|------|------|
| Deque | Deque | 双端队列接口，支持两端插入和删除，`ArrayDeque` 为常用实现 |
| 数据流 | Data Stream | `DataInputStream`/`DataOutputStream`，以机器无关方式读写基本类型数据 |

## E

| 术语 | 英文 | 释义 |
|------|------|------|
| EnumMap | EnumMap | 以枚举为键的 Map 实现，内部用数组存储，性能优于 HashMap |
| EnumSet | EnumSet | 枚举集合的高效实现，内部用位向量存储 |

## F

| 术语 | 英文 | 释义 |
|------|------|------|
| FileInputStream | FileInputStream | 从文件读取字节数据的节点流 |
| FileOutputStream | FileOutputStream | 向文件写入字节数据的节点流 |
| FileReader | FileReader | 读取文本文件的字符流便捷类，使用系统默认编码 |
| FileWriter | FileWriter | 写入文本文件的字符流便捷类，使用系统默认编码 |
| Future | Future | 表示异步计算结果，提供 `get()`（阻塞获取）、`cancel()`、`isDone()` 等方法 |
| ForkJoinPool | ForkJoinPool | Java 7 引入的工作窃取线程池，适合分治递归任务 |
| 函数式接口 | Functional Interface | 只包含一个抽象方法的接口，可用 `@FunctionalInterface` 标注，支持 Lambda |

## G

| 术语 | 英文 | 释义 |
|------|------|------|
| HashMap | HashMap | 基于哈希表的 Map 实现，允许 null 键和 null 值，非线程安全，初始容量 16，负载因子 0.75 |
| HashSet | HashSet | 基于 HashMap 实现的 Set，元素唯一，无序，允许 null |
| Hashtable | Hashtable | 线程安全的哈希表（遗留类），方法级 synchronized，不允许 null 键/值 |

## I

| 术语 | 英文 | 释义 |
|------|------|------|
| InputStreamReader | InputStreamReader | 字节流到字符流的桥梁，使用指定字符集解码字节 |
| OutputStreamWriter | OutputStreamWriter | 字符流到字节流的桥梁，使用指定字符集编码字符 |
| Iterator | Iterator | 集合迭代器，提供 `hasNext()`、`next()`、`remove()` 方法，单向遍历 |
| Iterable | Iterable | 实现 `iterator()` 方法的接口，增强 for 循环的目标类型 |

## J

| 术语 | 英文 | 释义 |
|------|------|------|
| 节点流 | Node Stream | 直接与数据源（文件/网络/内存）相连的流，如 `FileInputStream` |
| 处理流 | Processing Stream | 包装节点流提供额外功能的流，如 `BufferedInputStream` |

## L

| 术语 | 英文 | 释义 |
|------|------|------|
| LinkedList | LinkedList | 基于双向链表的 List 和 Deque 实现，增删 O(1)，查询 O(n) |
| LinkedHashMap | LinkedHashMap | 保持插入/访问顺序的 HashMap，支持 LRU 缓存模式 |
| LinkedHashSet | LinkedHashSet | 保持插入顺序的 HashSet |
| List | List | 有序集合接口，允许重复元素，支持索引访问 |
| ListIterator | ListIterator | List 的双向迭代器，支持正向/反向遍历和修改操作 |

## M

| 术语 | 英文 | 释义 |
|------|------|------|
| Map | Map | 键值对映射接口，键唯一，一个键最多映射一个值 |
| 对象流 | Object Stream | `ObjectInputStream`/`ObjectOutputStream`，用于对象序列化和反序列化 |

## N

| 术语 | 英文 | 释义 |
|------|------|------|
| NIO | New I/O | Java 1.4 引入的非阻塞 I/O，基于 Channel 和 Buffer，支持文件锁和内存映射 |
| NIO.2 | NIO.2 | Java 7 增强的 I/O API，引入 `Path`、`Files`、`FileSystem` 等 |

## O

| 术语 | 英文 | 释义 |
|------|------|------|
| Optional | Optional | Java 8 引入的容器类，优雅处理可能为 null 的值，避免 `NullPointerException` |
| 对象序列化 | Serialization | 将对象转换为字节序列的过程，类须实现 `Serializable` 接口 |

## P

| 术语 | 英文 | 释义 |
|------|------|------|
| Properties | Properties | 继承 Hashtable 的属性配置类，`load()`/`store()` 读写 `.properties` 文件 |
| PriorityQueue | PriorityQueue | 基于堆的优先队列，元素按自然顺序或 Comparator 排序，队首为最小/最大元素 |
| Phaser | Phaser | Java 7 引入的同步屏障，支持动态注册/注销参与者，比 CyclicBarrier 更灵活 |

## Q

| 术语 | 英文 | 释义 |
|------|------|------|
| Queue | Queue | 队列接口，FIFO 原则，`offer()` 入队、`poll()` 出队、`peek()` 查看队首 |
| Stream API | Stream API | Java 8 引入的函数式数据处理管道，支持链式操作：filter、map、reduce、collect |

## R

| 术语 | 英文 | 释义 |
|------|------|------|
| Random | Random | 伪随机数生成器，线程安全但性能较低，推荐使用 `ThreadLocalRandom` |
| ReadWriteLock | ReadWriteLock | 读写锁接口，读读共享、读写互斥、写写互斥，`ReentrantReadWriteLock` 为常用实现 |

## S

| 术语 | 英文 | 释义 |
|------|------|------|
| Set | Set | 不允许重复元素的集合接口 |
| Semaphore | Semaphore | 信号量，控制同时访问某资源的线程数量，`acquire()` 获取许可、`release()` 释放 |
| SequencedCollection | SequencedCollection | Java 21 引入的有顺序集合接口，提供 `addFirst`、`addLast`、`reversed` 等方法 |
| SortedMap | SortedMap | 键有序的 Map 接口，`TreeMap` 为实现类 |
| SortedSet | SortedSet | 元素有序的 Set 接口，`TreeSet` 为实现类 |
| 序列化 ID | serialVersionUID | 序列化版本号，用于验证反序列化时类的兼容性 |

## T

| 术语 | 英文 | 释义 |
|------|------|------|
| TreeMap | TreeMap | 基于红黑树的有序 Map，键自然排序或 Comparator 排序，查询 O(log n) |
| TreeSet | TreeSet | 基于红黑树的有序 Set，元素自然排序或 Comparator 排序 |
| ThreadLocal | ThreadLocal | 线程局部变量，每个线程独立持有副本，避免共享同步 |
| ThreadLocalRandom | ThreadLocalRandom | Java 7 引入的线程局部随机数生成器，性能优于 `Random` |
| 线程池 | Thread Pool | `ExecutorService` 管理的工作线程集合，避免频繁创建销毁线程 |
| ThreadPoolExecutor | ThreadPoolExecutor | 线程池核心实现类，可配置核心线程数、最大线程数、队列、拒绝策略 |

## V

| 术语 | 英文 | 释义 |
|------|------|------|
| Vector | Vector | 线程安全的动态数组（遗留类），方法级 synchronized，性能低于 ArrayList |

## W

| 术语 | 英文 | 释义 |
|------|------|------|
| WeakHashMap | WeakHashMap | 键为弱引用的 Map，键对象被 GC 后条目自动移除，适合缓存场景 |
| 线程安全集合 | Thread-Safe Collection | `ConcurrentHashMap`、`CopyOnWriteArrayList`、`BlockingQueue` 等并发安全集合 |
