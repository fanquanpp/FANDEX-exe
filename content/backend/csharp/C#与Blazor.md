---
order: 58
title: 'C#与Blazor'
module: csharp
category: 'C#'
difficulty: intermediate
description: 'Blazor WebAssembly与Server'
author: fanquanpp
updated: '2026-06-14'
related:
  - csharp/源生成器
  - 'csharp/C#与Unity游戏开发'
  - 'csharp/C#与MAUI'
  - 'csharp/C#与EF Core'
prerequisites:
  - csharp/概述与环境配置
---

## 概述

Blazor 是微软推出的 Web 框架，允许你使用 C# 而非 JavaScript 来构建交互式 Web 应用。它有两种托管模型：Blazor Server 在服务端运行 C# 代码，通过 SignalR 实时通信更新界面；Blazor WebAssembly 将 C# 代码编译为 WebAssembly，直接在浏览器中运行，无需服务端持续连接。

为什么需要 Blazor？如果你已经熟悉 C# 和 .NET 生态，不想再学习 JavaScript/TypeScript 和 Node.js 前端工具链，Blazor 让你用同一门语言完成前后端开发。它特别适合企业内部应用、管理后台等场景。

## 基础概念

**组件**：Blazor 的基本构建单元是组件（Component），每个组件是一个 .razor 文件，包含 HTML 标记和 C# 逻辑。组件可以嵌套、复用和传参。

**渲染模式**：Blazor 支持多种渲染模式。Server 模式在服务端运行，通过 WebSocket 通信；WebAssembly 模式在浏览器中运行；Auto 模式先使用 Server 快速加载，然后切换到 WebAssembly。

**数据绑定**：Blazor 支持单向绑定和双向绑定。单向绑定用 `@` 语法，双向绑定用 `@bind` 语法。

**事件处理**：通过 `@onclick`、`@onchange` 等指令处理用户交互，类似 HTML 事件但绑定的是 C# 方法。

## 快速上手

创建一个 Blazor 项目：

```bash
# 创建 Blazor Server 项目
dotnet new blazor -n MyBlazorApp

# 或者创建 Blazor WebAssembly 项目
dotnet new blazorwasm -n MyBlazorWasmApp

# 运行项目
cd MyBlazorApp
dotnet run
```

最简单的 Blazor 组件：

```razor
@* Counter.razor - 计数器组件 *@
@page "/counter"

<h1>计数器</h1>
<p>当前计数: @count</p>
<button @onclick="Increment">点击加一</button>

@code {
    // 组件状态
    private int count = 0;

    // 事件处理方法
    private void Increment()
    {
        count++;
    }
}
```

`@page` 指令定义了组件的路由路径，`@code` 块包含 C# 逻辑，`@onclick` 绑定点击事件。

## 详细用法

### 组件参数

组件之间通过参数传递数据：

```razor
@* 子组件: ProductCard.razor *@
<div class="card">
    <h3>@Title</h3>
    <p>价格: @Price 元</p>
    <button @onclick="OnBuy">购买</button>
</div>

@code {
    // 接收父组件传入的参数
    [Parameter]
    public string Title { get; set; } = "";

    [Parameter]
    public decimal Price { get; set; }

    // 事件回调参数，通知父组件
    [Parameter]
    public EventCallback<ProductCard> OnBuyClicked { get; set; }

    private async Task OnBuy()
    {
        // 触发回调事件
        await OnBuyClicked.InvokeAsync(this);
    }
}
```

```razor
@* 父组件: ProductList.razor *@
@page "/products"

<h1>商品列表</h1>

@foreach (var product in products)
{
    <ProductCard Title="@product.Name"
                 Price="@product.Price"
                 OnBuyClicked="HandleBuy" />
}

@code {
    private List<Product> products = new()
    {
        new Product { Name = "笔记本电脑", Price = 5999 },
        new Product { Name = "手机", Price = 3999 },
        new Product { Name = "耳机", Price = 299 }
    };

    private void HandleBuy(ProductCard card)
    {
        // 处理购买逻辑
    }
}

public class Product
{
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
}
```

### 数据绑定

```razor
@page "/binding"

<h2>数据绑定示例</h2>

@* 单向绑定 - 显示值 *@
<p>用户名: @userName</p>

@* 双向绑定 - 输入框与变量同步 *@
<input @bind="userName" placeholder="请输入用户名" />
<input @bind="age" type="number" placeholder="请输入年龄" />

@* 带格式化的绑定 *@
<input @bind="birthDate" @bind:format="yyyy-MM-dd" type="date" />
<p>生日: @birthDate.ToString("yyyy年MM月dd日")</p>

@* 绑定选择框 *@
<select @bind="selectedCity">
    <option value="">请选择城市</option>
    <option value="beijing">北京</option>
    <option value="shanghai">上海</option>
    <option value="guangzhou">广州</option>
</select>
<p>已选择: @selectedCity</p>

@code {
    private string userName = "";
    private int age = 0;
    private DateTime birthDate = DateTime.Today;
    private string selectedCity = "";
}
```

### 生命周期

Blazor 组件有一系列生命周期方法，按顺序执行：

```razor
@page "/lifecycle"

<p>当前时间: @currentTime</p>

@code {
    private string currentTime = "";

    // 1. 组件初始化时调用（设置初始状态）
    protected override void OnInitialized()
    {
        currentTime = DateTime.Now.ToString();
    }

    // 2. 异步初始化（适合加载数据）
    protected override async Task OnInitializedAsync()
    {
        // 模拟异步数据加载
        await Task.Delay(500);
        currentTime = DateTime.Now.ToString();
    }

    // 3. 参数设置后调用
    protected override void OnParametersSet()
    {
        // 当父组件传入的参数变化时执行
    }

    // 4. 组件渲染后调用（可操作 DOM）
    protected override void OnAfterRender(bool firstRender)
    {
        if (firstRender)
        {
            // 只在首次渲染后执行
            // 适合初始化 JavaScript 交互
        }
    }

    // 5. 实现 IAsyncDisposable 释放资源
    public async ValueTask DisposeAsync()
    {
        // 清理定时器、取消订阅等
    }
}
```

### 路由与导航

```razor
@* 定义带参数的路由 *@
@page "/user/{id:int}"
@page "/user/{id:int}/{name}"

@inject NavigationManager Navigation

<h2>用户详情</h2>
<p>ID: @Id</p>
<p>姓名: @Name</p>

<button @onclick="GoBack">返回</button>
<button @onclick="GoToHome">回到首页</button>

@code {
    // 从路由中获取参数
    [Parameter]
    public int Id { get; set; }

    [Parameter]
    public string Name { get; set; } = "未知";

    [Inject]
    public NavigationManager Navigation { get; set; } = default!;

    private void GoBack()
    {
        // 导航到上一页
        Navigation.NavigateTo("/users");
    }

    private void GoToHome()
    {
        // 导航到指定路径
        Navigation.NavigateTo("/");
    }
}
```

### 依赖注入

```razor
@page "/di"
@inject IUserService UserService
@inject ILogger<DiPage> Logger

<h2>依赖注入示例</h2>
<p>@message</p>

@code {
    private string message = "";

    protected override void OnInitialized()
    {
        // 使用注入的服务
        var user = UserService.GetCurrentUser();
        message = $"欢迎, {user.Name}";
        Logger.LogInformation("页面已初始化");
    }
}
```

```csharp
// 在 Program.cs 中注册服务
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddSingleton<IConfigService, ConfigService>();
```

### 调用 JavaScript

当需要使用浏览器 API 或现有 JavaScript 库时：

```razor
@page "/js-interop"
@inject IJSRuntime JS

<h2>JavaScript 互操作</h2>
<button @onclick="ShowAlert">弹出提示</button>
<button @onclick="GetBrowserInfo">获取浏览器信息</button>
<p>浏览器: @browserInfo</p>

@code {
    private string browserInfo = "";

    // 调用 JavaScript 函数
    private async Task ShowAlert()
    {
        await JS.InvokeVoidAsync("alert", "这是来自 C# 的消息");
    }

    // 从 JavaScript 获取返回值
    private async Task GetBrowserInfo()
    {
        browserInfo = await JS.InvokeAsync<string>(
            "eval", "navigator.userAgent");
    }
}
```

```javascript
// wwwroot/js/myLib.js
// 供 C# 调用的 JavaScript 函数
window.myLib = {
  showToast: function (message) {
    alert(message);
  },
  getElementWidth: function (selector) {
    return document.querySelector(selector)?.offsetWidth || 0;
  },
};
```

```razor
@* 调用自定义 JavaScript 库 *@
@inject IJSRuntime JS

@code {
    private async Task CallCustomJs()
    {
        await JS.InvokeVoidAsync("myLib.showToast", "你好");
        var width = await JS.InvokeAsync<int>("myLib.getElementWidth", ".card");
    }
}
```

## 常见场景

### 表单验证

```razor
@page "/form"

<h2>注册表单</h2>

<EditForm Model="model" OnValidSubmit="HandleSubmit">
    <DataAnnotationsValidator />

    <div>
        <label>用户名</label>
        <InputText @bind-Value="model.UserName" />
        <ValidationMessage For="() => model.UserName" />
    </div>

    <div>
        <label>邮箱</label>
        <InputText @bind-Value="model.Email" />
        <ValidationMessage For="() => model.Email" />
    </div>

    <div>
        <label>年龄</label>
        <InputNumber @bind-Value="model.Age" />
        <ValidationMessage For="() => model.Age" />
    </div>

    <button type="submit">提交</button>
</EditForm>

@if (submitted)
{
    <p>注册成功！</p>
}

@code {
    private RegisterModel model = new();
    private bool submitted = false;

    private void HandleSubmit()
    {
        submitted = true;
    }
}

public class RegisterModel
{
    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "用户名不能为空")]
    [System.ComponentModel.DataAnnotations.MinLength(3, ErrorMessage = "用户名至少3个字符")]
    public string UserName { get; set; } = "";

    [System.ComponentModel.DataAnnotations.Required(ErrorMessage = "邮箱不能为空")]
    [System.ComponentModel.DataAnnotations.EmailAddress(ErrorMessage = "邮箱格式不正确")]
    public string Email { get; set; } = "";

    [System.ComponentModel.DataAnnotations.Range(18, 120, ErrorMessage = "年龄必须在18到120之间")]
    public int Age { get; set; }
}
```

### HTTP 请求

```razor
@page "/weather"
@inject HttpClient Http

<h2>天气预报</h2>

@if (forecasts == null)
{
    <p>加载中...</p>
}
else
{
    @foreach (var forecast in forecasts)
    {
        <div>
            <strong>@forecast.Date.ToShortDateString()</strong>
            @forecast.Summary, @forecast.TemperatureC 度
        </div>
    }
}

@code {
    private WeatherForecast[]? forecasts;

    protected override async Task OnInitializedAsync()
    {
        // 发送 HTTP 请求获取数据
        forecasts = await Http.GetFromJsonAsync<WeatherForecast[]>(
            "/api/weatherforecast");
    }
}

public class WeatherForecast
{
    public DateTime Date { get; set; }
    public int TemperatureC { get; set; }
    public string Summary { get; set; } = "";
}
```

## 注意事项

**Blazor Server 的延迟**：Server 模式依赖 WebSocket 连接，网络延迟会影响交互体验。如果用户网络不稳定，操作会有明显卡顿。

**WebAssembly 的首次加载**：WebAssembly 模式需要下载 .NET 运行时和应用代码，首次加载可能较慢。可以通过裁剪（Trimming）和延迟加载来优化。

**线程安全**：Blazor Server 中每个用户连接对应一个电路（Circuit），不要在组件中直接使用多线程操作状态，应使用 `InvokeAsync` 回到正确的同步上下文。

**JavaScript 互操作开销**：频繁的 JS 互操作调用会有性能开销。尽量批量传递数据，减少调用次数。

## 进阶用法

### 状态管理

在复杂应用中管理共享状态：

```csharp
// 定义状态容器服务
public class AppState
{
    private int _counter = 0;

    public int Counter
    {
        get => _counter;
        set
        {
            if (_counter != value)
            {
                _counter = value;
                // 通知状态变化
                OnStateChanged?.Invoke();
            }
        }
    }

    // 状态变化事件
    public event Action? OnStateChanged;
}

// 在 Program.cs 中注册为单例
builder.Services.AddSingleton<AppState>();
```

```razor
@* 使用状态容器 *@
@page "/state"
@inject AppState State

<p>全局计数: @State.Counter</p>
<button @onclick="Increment">加一</button>

@code {
    // 订阅状态变化以触发重新渲染
    protected override void OnInitialized()
    {
        State.OnStateChanged += StateChanged;
    }

    private void StateChanged()
    {
        InvokeAsync(StateHasChanged);
    }

    private void Increment()
    {
        State.Counter++;
    }

    public void Dispose()
    {
        State.OnStateChanged -= StateChanged;
    }
}
```

### 虚拟化长列表

```razor
@page "/virtualize"

<h2>虚拟化列表</h2>

@* 只渲染可见区域的项，大幅提升性能 *@
<Virtualize Items="@items" Context="item" OverscanCount="5">
    <div class="item">
        <strong>@item.Id</strong>: @item.Name
    </div>
</Virtualize>

@code {
    private List<Item> items = Enumerable.Range(1, 10000)
        .Select(i => new Item { Id = i, Name = $"项目 {i}" })
        .ToList();
}

public class Item
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}
```
