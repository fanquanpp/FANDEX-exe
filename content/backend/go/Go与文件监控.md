---
order: 79
title: Go与文件监控
module: go
category: Go
difficulty: intermediate
description: fsnotify包
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与信号处理
  - go/Go与配置管理
  - go/Go与日志
  - go/Go与正则表达式
prerequisites:
  - go/概述与环境配置
---

## 概述

文件监控是监听文件系统变化（创建、修改、删除、重命名）的技术。在开发中，文件监控常用于配置热加载、日志收集、自动构建等场景。Go 社区最常用的文件监控库是 fsnotify，它封装了操作系统的原生文件监控机制（Linux 的 inotify、macOS 的 kqueue、Windows 的 ReadDirectoryChangesW）。

## 基础概念

在开始编码之前，需要理解文件监控的几个核心概念：

- **Watch**：监控注册，指定要监控的目录或文件。
- **Event**：文件系统事件，包含事件类型（创建、修改、删除等）和文件路径。
- **inotify/kqueue**：操作系统提供的文件系统事件通知机制，fsnotify 在底层使用。
- **递归监控**：监控一个目录时，默认会递归监控其所有子目录。

## 快速上手

首先安装 fsnotify：

```bash
go get github.com/fsnotify/fsnotify
```

最简单的文件监控示例：

```go
package main

import (
    "fmt"
    "log"
    "github.com/fsnotify/fsnotify"
)

func main() {
    // 创建监控器
    watcher, err := fsnotify.NewWatcher()
    if err != nil {
        log.Fatal(err)
    }
    defer watcher.Close()

    // 添加要监控的目录
    err = watcher.Add("./config")
    if err != nil {
        log.Fatal(err)
    }

    fmt.Println("正在监控 ./config 目录...")

    // 事件循环
    for {
        select {
        case event, ok := <-watcher.Events:
            if !ok {
                return
            }
            fmt.Printf("事件: %s %s\n", event.Name, event.Op)

            if event.Has(fsnotify.Write) {
                fmt.Printf("文件被修改: %s\n", event.Name)
            }
            if event.Has(fsnotify.Create) {
                fmt.Printf("文件被创建: %s\n", event.Name)
            }

        case err, ok := <-watcher.Errors:
            if !ok {
                return
            }
            fmt.Println("错误:", err)
        }
    }
}
```

## 详细用法

### 1. 事件类型

fsnotify 支持以下事件类型：

```go
// 创建：新文件或目录被创建
event.Has(fsnotify.Create)

// 写入：文件内容被修改
event.Has(fsnotify.Write)

// 删除：文件或目录被删除
event.Has(fsnotify.Remove)

// 重命名：文件或目录被重命名
event.Has(fsnotify.Rename)

// 权限变更：文件权限被修改
event.Has(fsnotify.Chmod)
```

### 2. 监控多个目录

```go
watcher, _ := fsnotify.NewWatcher()
defer watcher.Close()

// 监控多个目录
dirs := []string{"./config", "./templates", "./static"}
for _, dir := range dirs {
    err := watcher.Add(dir)
    if err != nil {
        log.Printf("无法监控 %s: %v\n", dir, err)
    }
}
```

### 3. 配置热加载

监控配置文件变化，自动重新加载：

```go
type ConfigWatcher struct {
    watcher  *fsnotify.Watcher
    config   *Config
    mu       sync.RWMutex
    onChange func(*Config)
}

func NewConfigWatcher(path string, onChange func(*Config)) (*ConfigWatcher, error) {
    watcher, err := fsnotify.NewWatcher()
    if err != nil {
        return nil, err
    }

    cw := &ConfigWatcher{
        watcher:  watcher,
        onChange: onChange,
    }

    // 加载初始配置
    cw.config, _ = loadConfig(path)
    watcher.Add(path)

    // 启动监控
    go cw.watch()

    return cw, nil
}

func (cw *ConfigWatcher) watch() {
    // 使用防抖避免频繁触发
    var timer *time.Timer

    for {
        select {
        case event, ok := <-cw.watcher.Events:
            if !ok {
                return
            }
            if event.Has(fsnotify.Write) {
                // 防抖：500ms 内的多次写入只触发一次
                if timer != nil {
                    timer.Stop()
                }
                timer = time.AfterFunc(500*time.Millisecond, func() {
                    newConfig, err := loadConfig(event.Name)
                    if err != nil {
                        log.Printf("加载配置失败: %v\n", err)
                        return
                    }
                    cw.mu.Lock()
                    cw.config = newConfig
                    cw.mu.Unlock()
                    if cw.onChange != nil {
                        cw.onChange(newConfig)
                    }
                    log.Println("配置已重新加载")
                })
            }
        case err, ok := <-cw.watcher.Errors:
            if !ok {
                return
            }
            log.Printf("监控错误: %v\n", err)
        }
    }
}

func (cw *ConfigWatcher) GetConfig() *Config {
    cw.mu.RLock()
    defer cw.mu.RUnlock()
    return cw.config
}
```

### 4. 监控新创建的子目录

fsnotify 默认递归监控，但新创建的子目录不会自动添加监控：

```go
func watchRecursive(watcher *fsnotify.Watcher, root string) {
    filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
        if err != nil {
            return err
        }
        if info.IsDir() {
            watcher.Add(path)
        }
        return nil
    })
}

// 在事件处理中添加新目录
case event.Has(fsnotify.Create):
    info, _ := os.Stat(event.Name)
    if info != nil && info.IsDir() {
        watcher.Add(event.Name) // 添加新目录的监控
    }
```

### 5. 过滤事件

只关注特定类型的文件：

```go
func isConfigFile(path string) bool {
    ext := strings.ToLower(filepath.Ext(path))
    return ext == ".yaml" || ext == ".yml" || ext == ".json" || ext == ".toml"
}

// 在事件处理中过滤
case event, ok := <-watcher.Events:
    if !ok {
        return
    }
    if !isConfigFile(event.Name) {
        continue // 忽略非配置文件
    }
    // 处理配置文件变化
```

## 常见场景

### 场景一：自动构建

监控源代码变化，自动触发构建：

```go
func AutoBuild(srcDir, buildCmd string) {
    watcher, _ := fsnotify.NewWatcher()
    defer watcher.Close()

    filepath.Walk(srcDir, func(path string, info os.FileInfo, err error) error {
        if info.IsDir() {
            watcher.Add(path)
        }
        return nil
    })

    var timer *time.Timer
    for {
        select {
        case event := <-watcher.Events:
            if event.Has(fsnotify.Write) && strings.HasSuffix(event.Name, ".go") {
                if timer != nil {
                    timer.Stop()
                }
                timer = time.AfterFunc(1*time.Second, func() {
                    fmt.Println("检测到代码变更，开始构建...")
                    exec.Command("sh", "-c", buildCmd).Run()
                })
            }
        }
    }
}
```

### 场景二：日志文件轮转

监控日志文件被轮转（重命名）后重新打开：

```go
case event.Has(fsnotify.Rename):
    if event.Name == logFilePath {
        // 日志文件被轮转，重新打开
        newFile, _ := os.OpenFile(logFilePath, os.O_APPEND|os.O_CREATE, 0644)
        logFile.Close()
        logFile = newFile
    }
```

## 注意事项与常见错误

1. **编辑器的多次写入**：很多编辑器保存文件时会先写入临时文件再重命名，这会产生 Create+Rename 事件而非 Write。需要使用防抖机制处理。

2. **防抖是必需的**：文件保存可能触发多个事件（Write、Chmod 等）。使用 timer 防抖，避免重复处理。

3. **watcher 数量限制**：Linux 的 inotify 有最大监控数量限制（默认 8192）。监控大量目录时可能需要调整系统参数。

4. **不监控文件内容**：fsnotify 只通知文件发生了变化，不提供变化的内容。需要自己读取文件。

5. **删除后重新添加**：如果监控的文件被删除后重新创建，需要重新添加监控。

6. **Windows 路径**：Windows 上事件中的路径使用反斜杠，处理时注意统一路径格式。

## 进阶用法

### 递归监控封装

```go
type RecursiveWatcher struct {
    watcher *fsnotify.Watcher
    roots   map[string]bool
}

func NewRecursiveWatcher() (*RecursiveWatcher, error) {
    w, err := fsnotify.NewWatcher()
    if err != nil {
        return nil, err
    }
    return &RecursiveWatcher{watcher: w, roots: make(map[string]bool)}, nil
}

func (rw *RecursiveWatcher) Add(root string) error {
    return filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
        if err != nil {
            return err
        }
        if info.IsDir() {
            rw.watcher.Add(path)
        }
        return nil
    })
}

func (rw *RecursiveWatcher) Events() <-chan fsnotify.Event { return rw.watcher.Events }
func (rw *RecursiveWatcher) Errors() <-chan error          { return rw.watcher.Errors }
func (rw *RecursiveWatcher) Close()                        { rw.watcher.Close() }
```
