---
order: 64
title: Go与Kubernetes
module: go
category: Go
difficulty: advanced
description: 'client-go与K8s开发'
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与GraphQL
  - go/Go与Docker
  - go/Go与数据库
  - go/Go与Redis
prerequisites:
  - go/概述与环境配置
---

## 概述

Kubernetes（简称 K8s）是当前最流行的容器编排平台，用于自动化部署、扩展和管理容器化应用。Go 是 Kubernetes 的开发语言，Kubernetes 官方提供了 client-go 库，让 Go 程序可以方便地与 Kubernetes API 交互，实现自定义控制器、Operator 和管理工具。

## 基础概念

在开始编码之前，需要理解 Kubernetes 编程的几个核心概念：

- **client-go**：Kubernetes 官方 Go 客户端库，提供了类型安全的 API 调用。
- **Clientset**：一组预生成的客户端，用于操作 Kubernetes 内置资源（Pod、Service 等）。
- **CRD（Custom Resource Definition）**：自定义资源定义，扩展 Kubernetes API。
- **Controller**：控制器模式，监听资源变化并执行相应操作，是 Kubernetes 的核心编程模式。
- **Informer**：client-go 提供的缓存机制，本地缓存资源数据，减少 API Server 压力。
- **Operator**：使用 CRD + Controller 模式管理应用的模式，如数据库 Operator。

## 快速上手

首先安装 client-go：

```bash
go get k8s.io/client-go@latest
```

最简单的示例 -- 列出集群中的 Pod：

```go
package main

import (
    "context"
    "fmt"
    "log"

    metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
    "k8s.io/client-go/kubernetes"
    "k8s.io/client-go/tools/clientcmd"
)

func main() {
    // 从 kubeconfig 文件创建配置
    config, err := clientcmd.BuildConfigFromFlags("", clientcmd.RecommendedHomeFile)
    if err != nil {
        log.Fatal(err)
    }

    // 创建 Clientset
    clientset, err := kubernetes.NewForConfig(config)
    if err != nil {
        log.Fatal(err)
    }

    // 列出 default 命名空间的 Pod
    pods, err := clientset.CoreV1().Pods("default").List(context.TODO(), metav1.ListOptions{})
    if err != nil {
        log.Fatal(err)
    }

    for _, pod := range pods.Items {
        fmt.Printf("Pod: %s, 状态: %s\n", pod.Name, pod.Status.Phase)
    }
}
```

## 详细用法

### 1. 连接配置

根据运行环境选择不同的配置方式：

```go
import "k8s.io/client-go/tools/clientcmd"

// 方式1：从 kubeconfig 文件读取（开发环境）
config, err := clientcmd.BuildConfigFromFlags("", clientcmd.RecommendedHomeFile)

// 方式2：从集群内部读取（Pod 内运行时）
config, err := rest.InClusterConfig()

// 方式3：手动配置
config := &rest.Config{
    Host:        "https://k8s-api.example.com:6443",
    BearerToken: "your-token",
    TLSClientConfig: rest.TLSClientConfig{
        Insecure: true, // 仅开发环境
    },
}
```

### 2. 操作内置资源

```go
// 创建 Clientset
clientset, _ := kubernetes.NewForConfig(config)

// --- Pod 操作 ---
// 列出 Pod
pods, _ := clientset.CoreV1().Pods("default").List(ctx, metav1.ListOptions{})

// 获取单个 Pod
pod, _ := clientset.CoreV1().Pods("default").Get(ctx, "my-pod", metav1.GetOptions{})

// 删除 Pod
clientset.CoreV1().Pods("default").Delete(ctx, "my-pod", metav1.DeleteOptions{})

// --- Deployment 操作 ---
// 创建 Deployment
deployment := &appsv1.Deployment{
    ObjectMeta: metav1.ObjectMeta{Name: "my-app"},
    Spec: appsv1.DeploymentSpec{
        Replicas: ptr.To(int32(3)),
        Selector: &metav1.LabelSelector{
            MatchLabels: map[string]string{"app": "my-app"},
        },
        Template: corev1.PodTemplateSpec{
            ObjectMeta: metav1.ObjectMeta{
                Labels: map[string]string{"app": "my-app"},
            },
            Spec: corev1.PodSpec{
                Containers: []corev1.Container{{
                    Name:  "my-app",
                    Image: "my-app:1.0",
                    Ports: []corev1.ContainerPort{{ContainerPort: 8080}},
                }},
            },
        },
    },
}
clientset.AppsV1().Deployments("default").Create(ctx, deployment, metav1.CreateOptions{})

// --- Service 操作 ---
svc, _ := clientset.CoreV1().Services("default").Get(ctx, "my-service", metav1.GetOptions{})
fmt.Printf("ClusterIP: %s\n", svc.Spec.ClusterIP)
```

### 3. 使用 Informer 监听资源变化

Informer 提供了本地缓存和事件通知机制：

```go
import (
    "k8s.io/client-go/informers"
    "k8s.io/client-go/tools/cache"
)

// 创建 SharedInformerFactory
factory := informers.NewSharedInformerFactory(clientset, 30*time.Second)
podInformer := factory.Core().V1().Pods().Informer()

// 注册事件处理器
podInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
    AddFunc: func(obj interface{}) {
        pod := obj.(*corev1.Pod)
        fmt.Printf("Pod 新增: %s\n", pod.Name)
    },
    UpdateFunc: func(oldObj, newObj interface{}) {
        oldPod := oldObj.(*corev1.Pod)
        newPod := newObj.(*corev1.Pod)
        if oldPod.Status.Phase != newPod.Status.Phase {
            fmt.Printf("Pod 状态变更: %s %s -> %s\n",
                newPod.Name, oldPod.Status.Phase, newPod.Status.Phase)
        }
    },
    DeleteFunc: func(obj interface{}) {
        pod := obj.(*corev1.Pod)
        fmt.Printf("Pod 删除: %s\n", pod.Name)
    },
})

// 启动 Informer
ctx, cancel := context.WithCancel(context.Background())
defer cancel()
factory.Start(ctx.Done())
factory.WaitForCacheSync(ctx.Done())

// 阻塞等待
select {}
```

### 4. 自定义资源（CRD）

操作自定义资源需要使用 Dynamic Client：

```go
import (
    "k8s.io/client-go/dynamic"
    "k8s.io/apimachinery/pkg/runtime/schema"
)

// 创建 Dynamic Client
dynamicClient, _ := dynamic.NewForConfig(config)

// 定义 CRD 的 GVR（Group/Version/Resource）
gvr := schema.GroupVersionResource{
    Group:    "myapp.example.com",
    Version:  "v1",
    Resource: "widgets",
}

// 列出自定义资源
list, _ := dynamicClient.Resource(gvr).Namespace("default").List(ctx, metav1.ListOptions{})
for _, item := range list.Items {
    fmt.Printf("Widget: %s\n", item.GetName())
}

// 创建自定义资源
widget := &unstructured.Unstructured{
    Object: map[string]interface{}{
        "apiVersion": "myapp.example.com/v1",
        "kind":       "Widget",
        "metadata": map[string]interface{}{
            "name": "my-widget",
        },
        "spec": map[string]interface{}{
            "size":  3,
            "color": "blue",
        },
    },
}
dynamicClient.Resource(gvr).Namespace("default").Create(ctx, widget, metav1.CreateOptions{})
```

## 常见场景

### 场景一：自定义控制器

监听 CRD 变化并执行相应操作：

```go
func RunController(ctx context.Context, clientset *kubernetes.Clientset, dynamicClient dynamic.Interface) {
    gvr := schema.GroupVersionResource{
        Group: "myapp.example.com", Version: "v1", Resource: "widgets",
    }

    factory := dynamicinformer.NewFilteredDynamicSharedInformerFactory(
        dynamicClient, 30*time.Second, "default", nil,
    )
    informer := factory.ForResource(gvr).Informer()

    informer.AddEventHandler(cache.ResourceEventHandlerFuncs{
        AddFunc: func(obj interface{}) {
            widget := obj.(*unstructured.Unstructured)
            // 创建对应的 Deployment 或其他资源
            reconcileWidget(ctx, clientset, widget)
        },
        UpdateFunc: func(_, newObj interface{}) {
            widget := newObj.(*unstructured.Unstructured)
            reconcileWidget(ctx, clientset, widget)
        },
    })

    factory.Start(ctx.Done())
    factory.WaitForCacheSync(ctx.Done())
    select {}
}
```

### 场景二：健康检查工具

检查集群中所有 Pod 的状态：

```go
func CheckPodHealth(ctx context.Context, clientset *kubernetes.Clientset) {
    pods, err := clientset.CoreV1().Pods("").List(ctx, metav1.ListOptions{})
    if err != nil {
        log.Fatal(err)
    }

    for _, pod := range pods.Items {
        for _, cs := range pod.Status.ContainerStatuses {
            if !cs.Ready {
                fmt.Printf("不健康的容器: %s/%s (重启次数: %d)\n",
                    pod.Namespace, cs.Name, cs.RestartCount)
            }
        }
    }
}
```

### 场景三：配置热更新

监听 ConfigMap 变化并通知应用重新加载：

```go
cmInformer := factory.Core().V1().ConfigMaps().Informer()
cmInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
    UpdateFunc: func(_, newObj interface{}) {
        cm := newObj.(*corev1.ConfigMap)
        if cm.Name == "app-config" {
            // 通知应用重新加载配置
            notifyConfigReload(cm.Data)
        }
    },
})
```

## 注意事项与常见错误

1. **InClusterConfig 仅在 Pod 内有效**：在集群外开发时使用 kubeconfig，在 Pod 内运行时使用 InClusterConfig。

2. **API 版本选择**：Kubernetes API 有多个版本（v1、apps/v1 等），使用正确的 API 版本。`kubectl api-resources` 可以查看。

3. **RBAC 权限**：Pod 访问 Kubernetes API 需要配置 ServiceAccount 和 RBAC 规则，否则会返回 403。

4. **Informer 的 Resync**：Informer 的 resync 间隔不是重新从 API Server 拉取数据，而是重新触发 Update 事件，确保控制器状态同步。

5. **不要频繁调用 List/Get**：直接调用 API 会增加 API Server 压力。使用 Informer 的 Lister 从本地缓存读取。

6. **资源版本冲突**：更新资源时可能遇到版本冲突（Optimistic Locking），需要重新获取最新版本后再更新。

## 进阶用法

### Operator 框架

使用 Kubebuilder 或 Operator SDK 快速创建 Operator：

```bash
# 使用 Kubebuilder 初始化项目
kubebuilder init --domain myapp.example.com
kubebuilder create api --group myapp --version v1 --kind Widget
```

### Leader Election

多实例部署时，只有一个实例运行控制器：

```go
import "k8s.io/client-go/tools/leaderelection"

leaderElection, _ := leaderelection.NewLeaderElector(leaderelection.LeaderElectionConfig{
    Lock:          lock,
    LeaseDuration: 15 * time.Second,
    RenewDeadline: 10 * time.Second,
    RetryPeriod:   2 * time.Second,
    Callbacks: leaderelection.LeaderCallbacks{
        OnStartedLeading: func(ctx context.Context) {
            // 当选为 Leader，启动控制器
            RunController(ctx)
        },
        OnStoppedLeading: func() {
            // 不再是 Leader
        },
    },
})
leaderElection.Run(ctx)
```
