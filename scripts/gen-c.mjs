import fs from 'fs';
import path from 'path';

const BASE = 'c:\\Atian\\Project\\Trae\\FANDEX-vue\\src\\content\\docs';

function fm(order, title, module, category, difficulty, description) {
  return `---
order: ${order}
title: '${title}'
module: '${module}'
category: '${category}'
difficulty: '${difficulty}'
description: '${description}'
author: 'fanquanpp'
updated: 2026-06-14
---`;
}

function writeFile(dir, filename, content) {
  const fullPath = path.join(BASE, dir, filename);
  if (fs.existsSync(fullPath)) {
    console.log(`SKIP: ${fullPath}`);
    return 0;
  }
  fs.writeFileSync(fullPath, content, 'utf-8');
  return 1;
}

let total = 0;
function addFile(moduleDir, category, order, title, desc, difficulty, content) {
  const filename = title + '.md';
  const fullContent = fm(order, title, moduleDir, category, difficulty, desc) + '\n\n' + content;
  total += writeFile(moduleDir, filename, fullContent);
}

// ==================== C (26 files) ====================
addFile(
  'c',
  'C',
  50,
  '位运算与位域',
  '位操作与位域结构',
  'intermediate',
  `## 1. 位运算符

| 运算符 | 说明 | 示例 |
|--------|------|------|
| \`&\` | 按位与 | \`a & b\` |
| \`|\` | 按位或 | \`a | b\` |
| \`^\` | 按位异或 | \`a ^ b\` |
| \`~\` | 按位取反 | \`~a\` |
| \`<<\` | 左移 | \`a << n\` |
| \`>>\` | 右移 | \`a >> n\` |

\`\`\`c
// 设置位
flags |= (1 << 3);    // 设置第3位
// 清除位
flags &= ~(1 << 3);   // 清除第3位
// 切换位
flags ^= (1 << 3);    // 切换第3位
// 检查位
if (flags & (1 << 3)) // 检查第3位是否设置
\`\`\`

## 2. 位域

\`\`\`c
struct Flags {
  unsigned int is_active : 1;
  unsigned int priority  : 3;
  unsigned int mode      : 4;
  unsigned int reserved  : 24;
};

sizeof(struct Flags); // 4 字节
\`\`\`

## 3. 位操作技巧

\`\`\`c
// 判断2的幂
int isPowerOf2(int n) { return n > 0 && (n & (n - 1)) == 0; }

// 统计1的位数
int popcount(int n) { return __builtin_popcount(n); }

// 最低位1
int lowbit(int n) { return n & (-n); }
\`\`\`
`
);

addFile(
  'c',
  'C',
  51,
  '枚举与typedef',
  '枚举类型与类型别名',
  'beginner',
  `## 1. 枚举

\`\`\`c
enum Color { RED, GREEN, BLUE };
enum Color c = GREEN;

// 指定值
enum Status {
  OK = 200,
  NOT_FOUND = 404,
  ERROR = 500
};
\`\`\`

## 2. typedef

\`\`\`c
typedef unsigned long ulong;
typedef int (*Comparator)(const void*, const void*);
typedef struct { double x; double y; } Point;

Point p = {1.0, 2.0};
\`\`\`
`
);

addFile(
  'c',
  'C',
  52,
  '多文件编译',
  '多文件项目与头文件组织',
  'intermediate',
  `## 1. 头文件

\`\`\`c
// utils.h
#ifndef UTILS_H
#define UTILS_H

int add(int a, int b);
void print_hello(void);

#endif
\`\`\`

\`\`\`c
// utils.c
#include "utils.h"
#include <stdio.h>

int add(int a, int b) { return a + b; }
void print_hello(void) { printf("Hello!\\n"); }
\`\`\`

## 2. 编译

\`\`\`bash
gcc -c utils.c -o utils.o
gcc -c main.c -o main.o
gcc utils.o main.o -o program
\`\`\`

## 3. Makefile

\`\`\`makefile
CC = gcc
CFLAGS = -Wall -Wextra -std=c17

SRCS = main.c utils.c
OBJS = $(SRCS:.c=.o)
TARGET = program

$(TARGET): $(OBJS)
\t$(CC) $(CFLAGS) -o $@ $^

%.o: %.c
\t$(CC) $(CFLAGS) -c -o $@ $<

clean:
\trm -f $(OBJS) $(TARGET)
\`\`\`
`
);

addFile(
  'c',
  'C',
  53,
  '动态内存管理',
  'malloc/calloc/realloc/free详解',
  'intermediate',
  `## 1. 内存分配函数

\`\`\`c
// malloc — 分配未初始化内存
int *arr = (int*)malloc(10 * sizeof(int));

// calloc — 分配并初始化为零
int *arr2 = (int*)calloc(10, sizeof(int));

// realloc — 调整大小
arr = (int*)realloc(arr, 20 * sizeof(int));

// free — 释放
free(arr);
arr = NULL; // 避免悬空指针
\`\`\`

## 2. 常见错误

| 错误 | 说明 |
|------|------|
| 忘记 free | 内存泄漏 |
| 重复 free | 双重释放 |
| 使用已释放内存 | 悬空指针 |
| 越界访问 | 缓冲区溢出 |

## 3. 内存检测

\`\`\`bash
gcc -fsanitize=address -g program.c
valgrind --leak-check=full ./program
\`\`\`
`
);

addFile(
  'c',
  'C',
  54,
  '函数指针与回调',
  '函数指针与回调函数模式',
  'intermediate',
  `## 1. 函数指针

\`\`\`c
int add(int a, int b) { return a + b; }
int (*op)(int, int) = add;
printf("%d\\n", op(3, 4)); // 7
\`\`\`

## 2. 回调函数

\`\`\`c
void forEach(int *arr, int n, void (*callback)(int)) {
  for (int i = 0; i < n; i++) callback(arr[i]);
}

void printInt(int x) { printf("%d ", x); }

int main() {
  int arr[] = {1, 2, 3, 4, 5};
  forEach(arr, 5, printInt);
}
\`\`\`

## 3. qsort 回调

\`\`\`c
int compare(const void *a, const void *b) {
  return *(int*)a - *(int*)b;
}

qsort(arr, n, sizeof(int), compare);
\`\`\`
`
);

addFile(
  'c',
  'C',
  55,
  '可变参数函数',
  'stdarg.h与可变参数',
  'intermediate',
  `## 1. 可变参数

\`\`\`c
#include <stdarg.h>

int sum(int count, ...) {
  va_list args;
  va_start(args, count);
  int total = 0;
  for (int i = 0; i < count; i++) {
    total += va_arg(args, int);
  }
  va_end(args);
  return total;
}

printf("%d\\n", sum(3, 1, 2, 3)); // 6
\`\`\`
`
);

addFile(
  'c',
  'C',
  56,
  '信号处理',
  'signal.h与信号处理',
  'intermediate',
  `## 1. 信号类型

| 信号 | 说明 |
|------|------|
| SIGINT | 中断 (Ctrl+C) |
| SIGTERM | 终止 |
| SIGSEGV | 段错误 |
| SIGABRT | 异常终止 |
| SIGKILL | 强制终止（不可捕获） |

\`\`\`c
#include <signal.h>

void handler(int sig) {
  printf("Received signal %d\\n", sig);
}

signal(SIGINT, handler);
\`\`\`
`
);

addFile(
  'c',
  'C',
  57,
  '原子操作与内存模型',
  'C11原子操作与内存序',
  'advanced',
  `## 1. 原子类型

\`\`\`c
#include <stdatomic.h>

atomic_int counter = ATOMIC_VAR_INIT(0);

atomic_fetch_add(&counter, 1);
atomic_load(&counter);
atomic_store(&counter, 0);
\`\`\`

## 2. 内存序

| 内存序 | 说明 |
|--------|------|
| \`memory_order_relaxed\` | 无顺序保证 |
| \`memory_order_acquire\` | 读操作，后续不能重排到此之前 |
| \`memory_order_release\` | 写操作，之前不能重排到此之后 |
| \`memory_order_seq_cst\` | 顺序一致（默认） |
`
);

addFile(
  'c',
  'C',
  58,
  '泛型选择',
  'C11 _Generic泛型选择',
  'intermediate',
  `## 1. _Generic 语法

\`\`\`c
#define type_name(x) _Generic((x), \\
  char: "char", \\
  int: "int", \\
  float: "float", \\
  double: "double", \\
  default: "other")

printf("%s\\n", type_name(42));    // "int"
printf("%s\\n", type_name(3.14));  // "double"
\`\`\`

## 2. 泛型打印

\`\`\`c
#define print(x) _Generic((x), \\
  int: print_int, \\
  double: print_double, \\
  char*: print_string \\
)(x)

void print_int(int x) { printf("%d", x); }
void print_double(double x) { printf("%f", x); }
void print_string(char *x) { printf("%s", x); }
\`\`\`
`
);

addFile(
  'c',
  'C',
  59,
  '线程与并发',
  'C11 threads.h多线程',
  'advanced',
  `## 1. 线程创建

\`\`\`c
#include <threads.h>

int thread_func(void *arg) {
  printf("Thread running\\n");
  return 0;
}

thrd_t thread;
thrd_create(&thread, thread_func, NULL);
thrd_join(thread, NULL);
\`\`\`

## 2. 互斥锁

\`\`\`c
mtx_t mutex;
mtx_init(&mutex, mtx_plain);

mtx_lock(&mutex);
// 临界区
mtx_unlock(&mutex);
mtx_destroy(&mutex);
\`\`\`

## 3. 条件变量

\`\`\`c
cnd_t cond;
cnd_init(&cond);
cnd_wait(&cond, &mutex);
cnd_signal(&cond);
cnd_broadcast(&cond);
\`\`\`
`
);

addFile(
  'c',
  'C',
  60,
  '对齐与内存布局',
  '内存对齐与结构体布局',
  'intermediate',
  `## 1. 对齐规则

\`\`\`c
struct Example {
  char a;    // 1 字节 + 3 字节填充
  int b;     // 4 字节
  short c;   // 2 字节 + 2 字节填充
};
sizeof(struct Example); // 12

// 优化排列
struct Optimized {
  int b;     // 4 字节
  short c;   // 2 字节
  char a;    // 1 字节 + 1 字节填充
};
sizeof(struct Optimized); // 8
\`\`\`

## 2. alignof/alignas

\`\`\`c
#include <stdalign.h>
alignas(16) int aligned_var;
printf("Alignment: %zu\\n", alignof(int));
\`\`\`
`
);

addFile(
  'c',
  'C',
  61,
  '属性与编译器扩展',
  'GCC/Clang属性与扩展',
  'intermediate',
  `## 1. __attribute__

\`\`\`c
// 格式化检查
__attribute__((format(printf, 1, 2)))
void my_printf(const char *fmt, ...);

// 废弃标记
__attribute__((deprecated("use new_func instead")))
void old_func(void);

// 对齐
__attribute__((aligned(16))) int buffer[1024];

// 打包
struct __attribute__((packed)) Packed {
  char a;
  int b;
};
\`\`\`
`
);

addFile(
  'c',
  'C',
  62,
  '安全函数与边界检查',
  'C11 Annex K安全函数',
  'intermediate',
  `## 1. 安全函数

\`\`\`c
// 边界检查版本
errno_t err = fopen_s(&fp, "file.txt", "r");
sprintf_s(buf, sizeof(buf), "%d", value);
strcpy_s(dest, sizeof(dest), src);
strcat_s(dest, sizeof(dest), src);
\`\`\`

## 2. 边界检查

\`\`\`c
// 使用 snprintf 替代 sprintf
snprintf(buf, sizeof(buf), "%s", input);

// 使用 strnlen 替代 strlen
size_t len = strnlen(str, max_len);
\`\`\`
`
);

addFile(
  'c',
  'C',
  63,
  '内联函数与宏',
  'inline函数与预处理器宏',
  'intermediate',
  `## 1. inline 函数

\`\`\`c
static inline int max(int a, int b) {
  return a > b ? a : b;
}
\`\`\`

## 2. 宏 vs inline

| 特性 | 宏 | inline |
|------|-----|--------|
| 类型检查 | ❌ | ✅ |
| 调试 | 困难 | 容易 |
| 副作用 | 可能有 | 无 |
| 作用域 | 全局 | 遵循作用域 |

## 3. 安全的宏

\`\`\`c
#define MAX(a, b) ({ \\
  __typeof__(a) _a = (a); \\
  __typeof__(b) _b = (b); \\
  _a > _b ? _a : _b; \\
})
\`\`\`
`
);

addFile(
  'c',
  'C',
  64,
  '复杂声明解析',
  'C语言复杂声明与解析',
  'intermediate',
  `## 1. 声明解析规则

\`\`\`c
// 右左法则：从变量名开始，先向右再向左
int *arr[10];       // arr 是10个指针的数组，指向int
int (*arr)[10];     // arr 是指针，指向10个int的数组
int *func(void);    // func 是函数，返回int指针
int (*func)(void);  // func 是函数指针，返回int
int (*arr[10])(void); // arr 是10个函数指针的数组
\`\`\`

## 2. 使用 typedef 简化

\`\`\`c
typedef int (*Comparator)(const void*, const void*);
typedef void (*SignalHandler)(int);
\`\`\`
`
);

addFile(
  'c',
  'C',
  65,
  'POSIX线程',
  'pthread多线程编程',
  'advanced',
  `## 1. 基本用法

\`\`\`c
#include <pthread.h>

void* thread_func(void *arg) {
  printf("Thread %ld\\n", (long)arg);
  return NULL;
}

pthread_t thread;
pthread_create(&thread, NULL, thread_func, (void*)1);
pthread_join(thread, NULL);
\`\`\`

## 2. 互斥锁

\`\`\`c
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_lock(&mutex);
// 临界区
pthread_mutex_unlock(&mutex);
\`\`\`

## 3. 条件变量

\`\`\`c
pthread_cond_t cond = PTHREAD_COND_INITIALIZER;
pthread_cond_wait(&cond, &mutex);
pthread_cond_signal(&cond);
\`\`\`
`
);

addFile(
  'c',
  'C',
  66,
  'Socket网络编程',
  'TCP/UDP套接字编程',
  'advanced',
  `## 1. TCP 服务器

\`\`\`c
int server_fd = socket(AF_INET, SOCK_STREAM, 0);

struct sockaddr_in addr = {
  .sin_family = AF_INET,
  .sin_port = htons(8080),
  .sin_addr.s_addr = INADDR_ANY
};

bind(server_fd, (struct sockaddr*)&addr, sizeof(addr));
listen(server_fd, 5);

int client_fd = accept(server_fd, NULL, NULL);
char buf[1024];
read(client_fd, buf, sizeof(buf));
write(client_fd, "Hello", 5);
\`\`\`

## 2. TCP 客户端

\`\`\`c
int sock = socket(AF_INET, SOCK_STREAM, 0);
struct sockaddr_in addr = {
  .sin_family = AF_INET,
  .sin_port = htons(8080),
  .sin_addr.s_addr = inet_addr("127.0.0.1")
};
connect(sock, (struct sockaddr*)&addr, sizeof(addr));
\`\`\`
`
);

addFile(
  'c',
  'C',
  67,
  '进程与管道',
  '进程创建与进程间通信',
  'advanced',
  `## 1. fork

\`\`\`c
pid_t pid = fork();
if (pid == 0) {
  // 子进程
  execlp("ls", "ls", "-l", NULL);
} else {
  // 父进程
  wait(NULL);
}
\`\`\`

## 2. 管道

\`\`\`c
int pipefd[2];
pipe(pipefd);

if (fork() == 0) {
  close(pipefd[0]);
  write(pipefd[1], "Hello", 5);
  close(pipefd[1]);
} else {
  close(pipefd[1]);
  char buf[100];
  read(pipefd[0], buf, sizeof(buf));
  close(pipefd[0]);
}
\`\`\`
`
);

addFile(
  'c',
  'C',
  68,
  '共享内存与信号量',
  'System V与POSIX IPC',
  'advanced',
  `## 1. 共享内存

\`\`\`c
#include <sys/mman.h>

// POSIX 共享内存
int fd = shm_open("/myshm", O_CREAT | O_RDWR, 0666);
ftruncate(fd, 4096);
void *ptr = mmap(NULL, 4096, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
\`\`\`

## 2. 信号量

\`\`\`c
#include <semaphore.h>

sem_t *sem = sem_open("/mysem", O_CREAT, 0666, 1);
sem_wait(sem);
// 临界区
sem_post(sem);
sem_close(sem);
\`\`\`
`
);

addFile(
  'c',
  'C',
  69,
  '文件系统操作',
  '目录操作与文件属性',
  'intermediate',
  `## 1. 目录操作

\`\`\`c
#include <dirent.h>

DIR *dir = opendir(".");
struct dirent *entry;
while ((entry = readdir(dir)) != NULL) {
  printf("%s\\n", entry->d_name);
}
closedir(dir);
\`\`\`

## 2. 文件属性

\`\`\`c
#include <sys/stat.h>

struct stat st;
stat("file.txt", &st);
printf("Size: %ld\\n", st.st_size);
printf("Mode: %o\\n", st.st_mode);
\`\`\`
`
);

addFile(
  'c',
  'C',
  70,
  '国际化与本地化',
  'C语言国际化支持',
  'intermediate',
  `## 1. setlocale

\`\`\`c
#include <locale.h>

setlocale(LC_ALL, "zh_CN.UTF-8");
printf("宽字符: %lc\\n", L'中');
\`\`\`

## 2. 宽字符

\`\`\`c
#include <wchar.h>

wchar_t *str = L"你好世界";
wprintf(L"%ls\\n", str);
\`\`\`
`
);

addFile(
  'c',
  'C',
  71,
  '构建系统',
  'CMake与构建工具',
  'intermediate',
  `## 1. CMakeLists.txt

\`\`\`cmake
cmake_minimum_required(VERSION 3.20)
project(MyProject C)

set(CMAKE_C_STANDARD 17)

add_executable(program main.c utils.c)

target_include_directories(program PRIVATE include)
target_link_libraries(program m)
\`\`\`

## 2. 构建命令

\`\`\`bash
mkdir build && cd build
cmake ..
cmake --build .
\`\`\`
`
);

addFile(
  'c',
  'C',
  72,
  '静态分析与调试',
  '代码静态分析与调试技巧',
  'intermediate',
  `## 1. GDB 调试

\`\`\`bash
gcc -g program.c
gdb ./program

# GDB 命令
break main
run
next
print variable
backtrace
continue
\`\`\`

## 2. 静态分析

\`\`\`bash
# clang-tidy
clang-tidy program.c -- -std=c17

# cppcheck
cppcheck --enable=all program.c

# AddressSanitizer
gcc -fsanitize=address -g program.c
\`\`\`
`
);

addFile(
  'c',
  'C',
  73,
  '跨平台编程',
  'C语言跨平台开发',
  'intermediate',
  `## 1. 平台检测

\`\`\`c
#ifdef _WIN32
  #include <windows.h>
  #define PATH_SEPARATOR "\\\\"
#elif defined(__linux__)
  #include <unistd.h>
  #define PATH_SEPARATOR "/"
#elif defined(__APPLE__)
  #include <mach-o/dyld.h>
  #define PATH_SEPARATOR "/"
#endif
\`\`\`

## 2. 跨平台抽象

\`\`\`c
#ifdef _WIN32
  #define sleep_ms(ms) Sleep(ms)
#else
  #define sleep_ms(ms) usleep((ms) * 1000)
#endif
\`\`\`
`
);

addFile(
  'c',
  'C',
  74,
  '嵌入式C编程',
  '嵌入式系统C编程要点',
  'advanced',
  `## 1. 寄存器操作

\`\`\`c
#define REG(addr) (*(volatile uint32_t*)(addr))

#define GPIO_BASE  0x40020000
#define GPIO_MODER REG(GPIO_BASE + 0x00)
#define GPIO_ODR   REG(GPIO_BASE + 0x14)

GPIO_MODER |= (1 << 10);  // 设置模式
GPIO_ODR   |= (1 << 5);   // 输出高电平
\`\`\`

## 2. 中断服务程序

\`\`\`c
void __attribute__((interrupt)) TIM2_IRQHandler(void) {
  if (TIM2->SR & TIM_SR_UIF) {
    TIM2->SR &= ~TIM_SR_UIF; // 清除标志
    // 处理中断
  }
}
\`\`\`

## 3. 内存约束

\`\`\`c
// 避免动态内存分配
// 使用静态分配和内存池
#define POOL_SIZE 1024
static uint8_t memory_pool[POOL_SIZE];
\`\`\`
`
);

addFile(
  'c',
  'C',
  75,
  'C与汇编交互',
  '内联汇编与外部汇编',
  'advanced',
  `## 1. 内联汇编

\`\`\`c
// GCC 内联汇编
static inline uint64_t rdtsc(void) {
  unsigned int lo, hi;
  __asm__ __volatile__ ("rdtsc" : "=a"(lo), "=d"(hi));
  return ((uint64_t)hi << 32) | lo;
}
\`\`\`

## 2. 扩展汇编

\`\`\`c
int add(int a, int b) {
  int result;
  __asm__ (
    "addl %%ebx, %%eax"
    : "=a" (result)
    : "a" (a), "b" (b)
  );
  return result;
}
\`\`\`
`
);

console.log(`\nDone! Total C files created: ${total}`);
