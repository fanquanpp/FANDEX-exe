---
order: 74
title: 嵌入式C编程
module: c
category: C
difficulty: advanced
description: 嵌入式系统C编程要点
author: fanquanpp
updated: '2026-06-14'
related:
  - c/静态分析与调试
  - c/跨平台编程
  - c/C与汇编交互
  - c/数组详解
prerequisites:
  - c/概述
---

## 概述

嵌入式C编程是在资源受限的微控制器（MCU）上编写软件的技术。与桌面开发不同，嵌入式系统通常内存有限（几KB到几MB）、没有操作系统或只有实时操作系统（RTOS）、需要直接操作硬件寄存器。嵌入式C编程强调确定性、低内存占用和对硬件的精确控制。

## 基础概念

### 嵌入式系统的特点

- 资源受限：内存小、CPU频率低、功耗敏感
- 实时性要求：必须在确定时间内响应事件
- 可靠性要求高：系统可能运行数年不重启
- 直接操作硬件：通过寄存器和中断与外设交互
- 通常没有标准库的完整支持

### 嵌入式开发工具链

| 工具       | 说明                    |
| ---------- | ----------------------- |
| 交叉编译器 | 如 arm-none-eabi-gcc    |
| 烧录器     | 如 OpenOCD、J-Link      |
| 调试器     | 如 GDB（通过 JTAG/SWD） |
| 仿真器     | 如 QEMU                 |

### 关键字和修饰符

```c
// volatile: 告诉编译器变量可能被外部修改，不要优化
volatile uint32_t *reg = (volatile uint32_t *)0x40020000;

// const: 常量，通常放在Flash中节省RAM
const char message[] = "Hello";

// static: 限制作用域，或持久化局部变量
static int counter = 0;

// register: 建议编译器将变量放在寄存器中
register int fast_var;
```

## 快速上手

### 寄存器操作

```c
#include <stdint.h>

// 定义寄存器访问宏
#define REG(addr) (*(volatile uint32_t *)(addr))

// STM32 GPIOA 基地址
#define GPIOA_BASE   0x40020000
#define GPIOA_MODER  REG(GPIOA_BASE + 0x00)  // 模式寄存器
#define GPIOA_OTYPER REG(GPIOA_BASE + 0x04)  // 输出类型寄存器
#define GPIOA_ODR    REG(GPIOA_BASE + 0x14)  // 输出数据寄存器
#define GPIOA_IDR    REG(GPIOA_BASE + 0x10)  // 输入数据寄存器

// 设置PA5为输出模式（LED引脚）
void led_init(void) {
    // 清除第10-11位（PA5的模式位），然后设为01（通用输出）
    GPIOA_MODER &= ~(3U << 10);  // 清除
    GPIOA_MODER |= (1U << 10);   // 设为输出
}

// 点亮LED
void led_on(void) {
    GPIOA_ODR |= (1U << 5);  // 设置第5位
}

// 熄灭LED
void led_off(void) {
    GPIOA_ODR &= ~(1U << 5); // 清除第5位
}

// 翻转LED
void led_toggle(void) {
    GPIOA_ODR ^= (1U << 5);  // 翻转第5位
}
```

### 简单的延时函数

```c
#include <stdint.h>

// 简单的忙等待延时（不精确，依赖时钟频率）
void delay(volatile uint32_t count) {
    while (count--) {
        // 空循环，编译器不会优化掉 volatile 变量
    }
}

// 使用 SysTick 定时器的精确延时
#define SYSTICK_LOAD  (*(volatile uint32_t *)0xE000E014)
#define SYSTICK_VAL   (*(volatile uint32_t *)0xE000E018)
#define SYSTICK_CTRL  (*(volatile uint32_t *)0xE000E010)

void systick_init(uint32_t reload_value) {
    SYSTICK_LOAD = reload_value - 1;
    SYSTICK_VAL = 0;
    SYSTICK_CTRL = 0x07; // 使能，中断，系统时钟
}

void delay_ms(uint32_t ms) {
    for (uint32_t i = 0; i < ms; i++) {
        SYSTICK_VAL = 0;
        while (!(SYSTICK_CTRL & (1U << 16))); // 等待计数标志
    }
}
```

## 详细用法

### 中断服务程序

```c
#include <stdint.h>

// 外部中断0的中断服务程序
void EXTI0_IRQHandler(void) {
    // 检查中断标志
    if (EXTI->PR & (1U << 0)) {
        EXTI->PR |= (1U << 0); // 清除中断标志（写1清除）

        // 处理中断事件
        led_toggle();
    }
}

// 配置外部中断
void exti_init(void) {
    // 使能SYSCFG时钟
    RCC->APB2ENR |= RCC_APB2ENR_SYSCFGEN;

    // 将PA0映射到EXTI0
    SYSCFG->EXTICR[0] &= ~0x000F;

    // 使能EXTI0中断
    EXTI->IMR |= (1U << 0);

    // 设置下降沿触发
    EXTI->FTSR |= (1U << 0);

    // 使能NVIC中断
    NVIC_EnableIRQ(EXTI0_IRQn);
}
```

### 串口通信（UART）

```c
#include <stdint.h>

#define USART2_BASE  0x40004400
#define USART2_SR    (*(volatile uint32_t *)(USART2_BASE + 0x00))
#define USART2_DR    (*(volatile uint32_t *)(USART2_BASE + 0x04))
#define USART2_BRR   (*(volatile uint32_t *)(USART2_BASE + 0x08))
#define USART2_CR1   (*(volatile uint32_t *)(USART2_BASE + 0x0C))

// 初始化串口
void uart_init(uint32_t baudrate) {
    // 使能GPIOA和USART2时钟
    RCC->AHB1ENR |= RCC_AHB1ENR_GPIOAEN;
    RCC->APB1ENR |= RCC_APB1ENR_USART2EN;

    // 配置PA2(TX)和PA3(RX)为复用功能
    GPIOA->MODER &= ~(3U << 4) & ~(3U << 6);
    GPIOA->MODER |= (2U << 4) | (2U << 6);
    GPIOA->AFR[0] |= (7U << 8) | (7U << 12); // AF7

    // 设置波特率
    USART2_BRR = SystemCoreClock / baudrate;

    // 使能发送和接收
    USART2_CR1 |= (1U << 13) | (1U << 3) | (1U << 2);
}

// 发送一个字节
void uart_putc(char c) {
    while (!(USART2_SR & (1U << 7))); // 等待发送缓冲区空
    USART2_DR = c;
}

// 发送字符串
void uart_puts(const char *str) {
    while (*str) {
        uart_putc(*str++);
    }
}

// 接收一个字节
char uart_getc(void) {
    while (!(USART2_SR & (1U << 5))); // 等待接收缓冲区非空
    return (char)(USART2_DR & 0xFF);
}
```

### 内存池替代 malloc

```c
#include <stdint.h>
#include <string.h>

#define POOL_BLOCK_SIZE  32
#define POOL_BLOCK_COUNT 64

// 内存池
static uint8_t pool_buffer[POOL_BLOCK_SIZE * POOL_BLOCK_COUNT];
static uint8_t pool_used[POOL_BLOCK_COUNT]; // 使用标志

// 从内存池分配
void *pool_alloc(void) {
    for (int i = 0; i < POOL_BLOCK_COUNT; i++) {
        if (!pool_used[i]) {
            pool_used[i] = 1;
            return &pool_buffer[i * POOL_BLOCK_SIZE];
        }
    }
    return NULL; // 内存不足
}

// 释放到内存池
void pool_free(void *ptr) {
    if (!ptr) return;

    // 计算块索引
    uintptr_t offset = (uintptr_t)ptr - (uintptr_t)pool_buffer;
    if (offset % POOL_BLOCK_SIZE != 0) return; // 非法指针

    int index = offset / POOL_BLOCK_SIZE;
    if (index >= 0 && index < POOL_BLOCK_COUNT) {
        pool_used[index] = 0;
    }
}
```

## 常见场景

### 场景一：状态机实现

```c
#include <stdint.h>

typedef enum {
    STATE_IDLE,
    STATE_RUNNING,
    STATE_ERROR
} SystemState;

typedef struct {
    SystemState state;
    uint32_t timer;
    uint32_t error_code;
} System;

void system_init(System *sys) {
    sys->state = STATE_IDLE;
    sys->timer = 0;
    sys->error_code = 0;
}

void system_update(System *sys) {
    switch (sys->state) {
        case STATE_IDLE:
            if (start_button_pressed()) {
                sys->state = STATE_RUNNING;
                sys->timer = 1000;
            }
            break;

        case STATE_RUNNING:
            sys->timer--;
            if (sys->timer == 0) {
                sys->state = STATE_IDLE;
            }
            if (sensor_error()) {
                sys->state = STATE_ERROR;
                sys->error_code = 0x01;
            }
            break;

        case STATE_ERROR:
            if (reset_button_pressed()) {
                sys->state = STATE_IDLE;
                sys->error_code = 0;
            }
            break;
    }
}
```

### 场景二：环形缓冲区

```c
#include <stdint.h>
#include <stdbool.h>

#define BUF_SIZE 64

typedef struct {
    uint8_t data[BUF_SIZE];
    volatile uint16_t head;
    volatile uint16_t tail;
} RingBuffer;

// 初始化
void rb_init(RingBuffer *rb) {
    rb->head = 0;
    rb->tail = 0;
}

// 写入一个字节（中断中调用）
bool rb_put(RingBuffer *rb, uint8_t byte) {
    uint16_t next = (rb->head + 1) % BUF_SIZE;
    if (next == rb->tail) return false; // 缓冲区满
    rb->data[rb->head] = byte;
    rb->head = next;
    return true;
}

// 读取一个字节（主循环中调用）
bool rb_get(RingBuffer *rb, uint8_t *byte) {
    if (rb->head == rb->tail) return false; // 缓冲区空
    *byte = rb->data[rb->tail];
    rb->tail = (rb->tail + 1) % BUF_SIZE;
    return true;
}

// 检查是否为空
bool rb_empty(RingBuffer *rb) {
    return rb->head == rb->tail;
}
```

### 场景三：看门狗

```c
#include <stdint.h>

#define IWDG_BASE   0x40003000
#define IWDG_KR     (*(volatile uint32_t *)(IWDG_BASE + 0x00))
#define IWDG_PR     (*(volatile uint32_t *)(IWDG_BASE + 0x04))
#define IWDG_RLR    (*(volatile uint32_t *)(IWDG_BASE + 0x08))
#define IWDG_SR     (*(volatile uint32_t *)(IWDG_BASE + 0x0C))

// 初始化独立看门狗
void watchdog_init(uint32_t timeout_ms) {
    // 启用寄存器访问
    IWDG_KR = 0x5555;

    // 设置预分频器
    IWDG_PR = 4; // 64分频

    // 设置重载值
    uint32_t reload = (timeout_ms * 40) / 64; // 40kHz LSI时钟
    IWDG_RLR = reload > 0xFFF ? 0xFFF : reload;

    // 启动看门狗
    IWDG_KR = 0xCCCC;
}

// 喂狗（必须在超时前调用）
void watchdog_feed(void) {
    IWDG_KR = 0xAAAA;
}

// 在主循环中定期喂狗
int main(void) {
    watchdog_init(1000); // 1秒超时

    while (1) {
        // 执行任务
        do_work();

        // 喂狗
        watchdog_feed();
    }
}
```

## 注意事项

### volatile 的重要性

在嵌入式编程中，硬件寄存器和中断变量必须使用 `volatile`：

```c
// 错误：编译器可能优化掉对寄存器的读取
uint32_t *reg = (uint32_t *)0x40020000;
uint32_t val = *reg; // 可能被优化掉

// 正确：使用 volatile 防止优化
volatile uint32_t *reg = (volatile uint32_t *)0x40020000;
uint32_t val = *reg; // 每次都会实际读取
```

### 避免使用标准库函数

嵌入式环境中可能没有完整的标准库支持，应避免使用：

- `printf`/`scanf`（太重，使用自定义串口输出）
- `malloc`/`free`（不确定的执行时间，使用静态分配或内存池）
- `float`运算（某些MCU没有FPU，使用定点数）

### 中断中的注意事项

中断服务程序（ISR）应尽量短小：

```c
// 错误：ISR中做太多工作
void UART_IRQHandler(void) {
    char buf[256];
    process_data(buf); // 太耗时
}

// 正确：ISR中只做最少的工作
volatile uint8_t rx_byte;
volatile bool rx_ready = false;

void UART_IRQHandler(void) {
    rx_byte = UART->DR;   // 只读取数据
    rx_ready = true;       // 设置标志
}

// 主循环中处理
while (1) {
    if (rx_ready) {
        process_byte(rx_byte);
        rx_ready = false;
    }
}
```

## 进阶用法

### 使用链接脚本控制内存布局

```ld
/* linker.ld - 链接脚本 */
MEMORY {
    FLASH (rx)  : ORIGIN = 0x08000000, LENGTH = 512K
    RAM   (rwx) : ORIGIN = 0x20000000, LENGTH = 128K
}

SECTIONS {
    .text : {
        *(.vectors)    /* 中断向量表 */
        *(.text)       /* 代码 */
        *(.rodata)     /* 只读数据 */
    } > FLASH

    .data : {
        *(.data)       /* 已初始化数据 */
    } > RAM AT > FLASH

    .bss : {
        *(.bss)        /* 未初始化数据 */
    } > RAM
}
```

### DMA 传输

```c
#include <stdint.h>

#define DMA1_BASE    0x40026000
#define DMA1_STREAM5 (*(volatile uint32_t *)(DMA1_BASE + 0x50))

// 配置DMA传输（内存到串口）
void dma_uart_send(const uint8_t *data, uint16_t length) {
    // 禁用DMA流
    DMA1_STREAM5 &= ~(1U << 0);

    // 等待DMA流完全禁用
    while (DMA1_STREAM5 & (1U << 0));

    // 配置DMA
    DMA1->S5CR = (4U << 25)   // 通道4（USART2_TX）
               | (1U << 10)   // 内存地址递增
               | (0U << 13)   // 8位内存宽度
               | (0U << 16);  // 8位外设宽度

    DMA1->S5NDTR = length;    // 传输长度
    DMA1->S5M0AR = (uint32_t)data;    // 内存地址
    DMA1->S5PAR  = (uint32_t)&USART2_DR; // 外设地址

    // 使能DMA流
    DMA1->S5CR |= (1U << 0);
}
```

### RTOS 任务

```c
#include "FreeRTOS.h"
#include "task.h"

// LED闪烁任务
void led_task(void *param) {
    while (1) {
        led_toggle();
        vTaskDelay(pdMS_TO_TICKS(500)); // 延时500ms
    }
}

// 传感器读取任务
void sensor_task(void *param) {
    while (1) {
        uint16_t value = adc_read();
        process_sensor(value);
        vTaskDelay(pdMS_TO_TICKS(100)); // 延时100ms
    }
}

int main(void) {
    // 硬件初始化
    led_init();
    adc_init();

    // 创建任务
    xTaskCreate(led_task, "LED", 128, NULL, 1, NULL);
    xTaskCreate(sensor_task, "Sensor", 256, NULL, 2, NULL);

    // 启动调度器
    vTaskStartScheduler();

    while (1); // 不应到达此处
}
```
