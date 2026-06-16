---
order: 59
title: 'C#与MAUI'
module: csharp
category: 'C#'
difficulty: intermediate
description: '.NET MAUI跨平台开发'
author: fanquanpp
updated: '2026-06-14'
related:
  - 'csharp/C#与Unity游戏开发'
  - 'csharp/C#与Blazor'
  - 'csharp/C#与EF Core'
  - 'csharp/C#与依赖注入'
prerequisites:
  - csharp/概述与环境配置
---

## 概述

.NET MAUI（Multi-platform App UI）是微软推出的跨平台应用开发框架。它允许你用一套 C# 和 XAML 代码，同时构建 Android、iOS、macOS 和 Windows 应用程序。MAUI 是 Xamarin.Forms 的演进版本，采用了单一项目结构、源生成器优化和统一的资源管理系统，大幅简化了跨平台开发流程。

为什么需要 MAUI？如果你希望用 C# 同时覆盖移动端和桌面端，不想为每个平台分别学习 Swift、Kotlin 或原生 Windows 开发技术，MAUI 提供了一条统一的路径。它将平台差异封装在底层，让你专注于业务逻辑和界面设计。

## 基础概念

**单一项目模型**：与 Xamarin.Forms 每个平台一个项目不同，MAUI 使用单一项目，所有平台共享同一份代码和资源。平台特定的代码通过条件编译或部分类来处理。

**Handler 架构**：MAUI 用 Handler 替代了 Xamarin.Forms 的 Renderer 架构。Handler 更轻量，只映射你需要修改的属性，而不是整个控件。这意味着更好的性能和更简单的自定义。

**XAML**：XAML 是一种声明式标记语言，用于定义界面布局。每个页面是一个 XAML 文件，配合一个 C# 代码隐藏文件处理逻辑。

**数据绑定**：MAUI 支持强大的数据绑定机制，可以将界面元素与数据源关联起来，当数据变化时界面自动更新。

## 快速上手

首先确保安装了 .NET 8.0 或更高版本的 SDK，然后安装 MAUI 工作负载：

```bash
# 安装 MAUI 工作负载
dotnet workload install maui

# 创建新的 MAUI 项目
dotnet new maui -n MyFirstApp

# 进入项目目录
cd MyFirstApp

# 在 Windows 上运行
dotnet run -f net8.0-windows

# 在 Android 上运行（需要连接设备或模拟器）
dotnet run -f net8.0-android
```

创建项目后，你会看到以下项目结构：

```
MyFirstApp/
├── App.xaml              # 应用入口
├── App.xaml.cs           # 应用逻辑
├── MainPage.xaml         # 主页面布局
├── MainPage.xaml.cs      # 主页面逻辑
├── Platforms/            # 平台特定代码
│   ├── Android/
│   ├── iOS/
│   ├── MacCatalyst/
│   └── Windows/
└── Resources/            # 共享资源
    ├── Fonts/
    ├── Images/
    └── AppIcon/
```

最简单的页面示例如下：

```xml
<!-- MainPage.xaml -->
<ContentPage xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             x:Class="MyFirstApp.MainPage">
    <VerticalStackLayout Spacing="20" Padding="30">
        <Label Text="Hello MAUI!"
               FontSize="32"
               HorizontalOptions="Center" />
        <Button Text="点击我"
                Clicked="OnButtonClicked"
                HorizontalOptions="Center" />
    </VerticalStackLayout>
</ContentPage>
```

```csharp
// MainPage.xaml.cs
namespace MyFirstApp;

public partial class MainPage : ContentPage
{
    private int _clickCount = 0;

    public MainPage()
    {
        InitializeComponent();
    }

    // 按钮点击事件处理
    private void OnButtonClicked(object sender, EventArgs e)
    {
        _clickCount++;
        DisplayAlert("提示", $"你点击了 {_clickCount} 次", "确定");
    }
}
```

## 详细用法

### 布局系统

MAUI 提供了多种布局容器来组织界面元素：

```xml
<!-- 垂直堆叠布局 -->
<VerticalStackLayout Spacing="10" Padding="20">
    <Label Text="第一行" />
    <Label Text="第二行" />
</VerticalStackLayout>

<!-- 水平堆叠布局 -->
<HorizontalStackLayout Spacing="10">
    <Label Text="左侧" />
    <Label Text="右侧" />
</HorizontalStackLayout>

<!-- 网格布局 -->
<Grid RowDefinitions="Auto,*,Auto" ColumnDefinitions="*,*">
    <Label Text="左上" Grid.Row="0" Grid.Column="0" />
    <Label Text="右上" Grid.Row="0" Grid.Column="1" />
    <Label Text="左下" Grid.Row="1" Grid.Column="0" />
    <Label Text="右下" Grid.Row="1" Grid.Column="1" />
</Grid>

<!-- 绝对布局 -->
<AbsoluteLayout>
    <BoxView Color="Red"
             AbsoluteLayout.LayoutBounds="0,0,100,100" />
    <BoxView Color="Blue"
             AbsoluteLayout.LayoutBounds="50,50,100,100" />
</AbsoluteLayout>
```

### 导航

MAUI 支持基于页面的导航，最常用的是 Shell 导航：

```csharp
// App.xaml.cs 中注册路由
public partial class App : Application
{
    public App()
    {
        InitializeComponent();
        // 使用 Shell 作为主页面
        MainPage = new AppShell();
    }
}
```

```xml
<!-- AppShell.xaml -->
<Shell xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
       xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
       xmlns:local="clr-namespace:MyFirstApp"
       x:Class="MyFirstApp.AppShell">
    <!-- 底部标签页 -->
    <TabBar>
        <ShellContent Title="首页"
                      Icon="home.png"
                      ContentTemplate="{DataTemplate local:MainPage}" />
        <ShellContent Title="设置"
                      Icon="settings.png"
                      ContentTemplate="{DataTemplate local:SettingsPage}" />
    </TabBar>
</Shell>
```

```csharp
// 代码中进行页面导航
await Shell.Current.GoToAsync("//details?id=42");

// 目标页面接收参数
[QueryProperty(nameof(ItemId), "id")]
public partial class DetailPage : ContentPage
{
    private string _itemId;
    public string ItemId
    {
        get => _itemId;
        set { _itemId = value; LoadItem(value); }
    }

    private void LoadItem(string id)
    {
        // 根据 id 加载数据
    }
}
```

### 数据绑定与 MVVM

MVVM 模式是 MAUI 推荐的架构模式，它将界面、逻辑和数据分离：

```csharp
// ViewModel 基类，实现属性变更通知
public class ViewModelBase : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler PropertyChanged;

    protected void OnPropertyChanged([CallerMemberName] string name = "")
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
    }

    // 通用属性设置方法，自动触发通知
    protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string name = "")
    {
        if (EqualityComparer<T>.Default.Equals(field, value))
            return false;
        field = value;
        OnPropertyChanged(name);
        return true;
    }
}

// 具体 ViewModel
public class MainViewModel : ViewModelBase
{
    private string _greeting = "你好，MAUI";
    public string Greeting
    {
        get => _greeting;
        set => SetProperty(ref _greeting, value);
    }

    // 命令绑定
    public ICommand UpdateCommand { get; }

    public MainViewModel()
    {
        UpdateCommand = new Command(UpdateGreeting);
    }

    private void UpdateGreeting()
    {
        Greeting = "更新后的问候";
    }
}
```

```xml
<!-- 在 XAML 中绑定 ViewModel -->
<ContentPage xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             xmlns:vm="clr-namespace:MyFirstApp.ViewModels"
             x:Class="MyFirstApp.MainPage"
             x:DataType="vm:MainViewModel">
    <VerticalStackLayout Padding="30">
        <!-- 绑定属性 -->
        <Label Text="{Binding Greeting}"
               FontSize="24" />
        <!-- 绑定命令 -->
        <Button Text="更新"
                Command="{Binding UpdateCommand}" />
    </VerticalStackLayout>
</ContentPage>
```

```csharp
// 在代码隐藏中设置绑定上下文
public partial class MainPage : ContentPage
{
    public MainPage()
    {
        InitializeComponent();
        BindingContext = new MainViewModel();
    }
}
```

### 平台特定代码

当需要处理平台差异时，可以使用条件编译或部分类：

```csharp
// 在 Platforms/Android/PlatformClass.android.cs 中
#if ANDROID
public static string GetPlatformName() => "Android";
#endif

// 在 Platforms/iOS/PlatformClass.ios.cs 中
#if IOS
public static string GetPlatformName() => "iOS";
#endif

// 也可以通过部分类实现
// Shared/PlatformService.cs
public partial class PlatformService
{
    // 共享代码
    public string GetInfo() => $"运行在 {GetPlatformName()}";
}

// 部分方法由各平台实现
public partial class PlatformService
{
    partial string GetPlatformName();
}
```

### 自定义 Handler

当内置控件不能满足需求时，可以通过 Handler 自定义原生控件的行为：

```csharp
// 定义自定义控件
public class CustomEntry : Entry
{
    // 自定义属性
    public static readonly BindableProperty BorderColorProperty =
        BindableProperty.Create(nameof(BorderColor), typeof(Color), typeof(CustomEntry), Colors.Gray);

    public Color BorderColor
    {
        get => (Color)GetValue(BorderColorProperty);
        set => SetValue(BorderColorProperty, value);
    }
}

// 定义 Handler
public class CustomEntryHandler : EntryHandler
{
    public CustomEntryHandler() : base(Mapper)
    {
    }

    // 属性映射：当 BorderColor 变化时更新原生控件
    public static IPropertyMapper<CustomEntry, CustomEntryHandler> Mapper =
        new PropertyMapper<CustomEntry, CustomEntryHandler>(EntryHandler.Mapper)
        {
            [nameof(CustomEntry.BorderColor)] = MapBorderColor
        };

    private static void MapBorderColor(CustomEntryHandler handler, CustomEntry entry)
    {
#if ANDROID
        // Android 平台设置边框颜色
        handler.PlatformView.BackgroundTintList =
            Android.Content.Res.ColorStateList.ValueOf(entry.BorderColor.ToPlatform());
#elif IOS
        // iOS 平台设置边框颜色
        handler.PlatformView.Layer.BorderColor = entry.BorderColor.ToPlatform().CGColor;
        handler.PlatformView.Layer.BorderWidth = 1;
#endif
    }
}
```

## 常见场景

### 列表页面

展示数据列表是最常见的场景之一：

```xml
<ContentPage xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             x:Class="MyFirstApp.ListPage">
    <CollectionView ItemsSource="{Binding Items}"
                    SelectionMode="Single"
                    SelectionChangedCommand="{Binding ItemSelectedCommand}"
                    SelectedItem="{Binding SelectedItem}">
        <CollectionView.ItemTemplate>
            <DataTemplate>
                <Frame Margin="10" Padding="15">
                    <HorizontalStackLayout Spacing="15">
                        <Image Source="{Binding ImageUrl}"
                               WidthRequest="60" HeightRequest="60" />
                        <VerticalStackLayout>
                            <Label Text="{Binding Title}" FontSize="18" />
                            <Label Text="{Binding Subtitle}" FontSize="14" />
                        </VerticalStackLayout>
                    </HorizontalStackLayout>
                </Frame>
            </DataTemplate>
        </CollectionView.ItemTemplate>
    </CollectionView>
</ContentPage>
```

### 偏好设置存储

使用 Preferences 存储简单的键值对数据：

```csharp
// 保存设置
Preferences.Set("username", "张三");
Preferences.Set("dark_mode", true);
Preferences.Set("font_size", 14.0);

// 读取设置，可指定默认值
string username = Preferences.Get("username", "默认用户");
bool darkMode = Preferences.Get("dark_mode", false);
double fontSize = Preferences.Get("font_size", 12.0);

// 检查键是否存在
bool hasKey = Preferences.ContainsKey("username");

// 删除某个键
Preferences.Remove("username");

// 清除所有设置
Preferences.Clear();
```

## 注意事项

**首次运行较慢**：MAUI 项目首次编译和部署可能需要较长时间，尤其是 Android 平台。这是正常的，后续运行会快很多。

**热重载限制**：XAML 热重载对布局修改支持较好，但 C# 代码修改通常需要重新编译。建议先设计好界面再编写逻辑。

**平台差异**：虽然 MAUI 尽量统一了各平台的 API，但某些功能在不同平台上的行为可能不同。例如状态栏颜色、导航栏样式等需要分别处理。

**性能优化**：避免在循环中创建大量对象，使用 CollectionView 代替 ListView 处理大数据列表，合理使用虚拟化。

**Android SDK 版本**：确保安装了正确版本的 Android SDK。MAUI 通常要求较新的 API Level，具体版本随 .NET 版本更新。

## 进阶用法

### 使用 CommunityToolkit.Mvvm

社区工具包提供了更简洁的 MVVM 写法，减少样板代码：

```csharp
// 使用源生成器自动生成绑定代码
public partial class MainViewModel : ObservableObject
{
    // 自动生成属性变更通知代码
    [ObservableProperty]
    private string _greeting = "你好";

    // 自动生成命令代码
    [RelayCommand]
    private void UpdateGreeting()
    {
        Greeting = "更新后的问候";
    }

    // 带条件的命令
    [RelayCommand(CanExecute = nameof(CanSave))]
    private void Save() { /* 保存逻辑 */ }

    private bool CanSave() => !string.IsNullOrEmpty(Greeting);
}
```

### 集成 EF Core 数据库

在 MAUI 应用中使用 SQLite 数据库：

```csharp
// 定义数据上下文
public class AppDbContext : DbContext
{
    public DbSet<TodoItem> TodoItems => Set<TodoItem>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        // 使用应用数据目录存放数据库文件
        var dbPath = Path.Combine(
            FileSystem.AppDataDirectory, "app.db");
        options.UseSqlite($"Data Source={dbPath}");
    }
}

public class TodoItem
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public bool IsDone { get; set; }
}
```

### 多窗口支持

在桌面平台上支持多窗口：

```csharp
// 打开新窗口
var window = new Window(new DetailPage());
Application.Current.OpenWindow(window);

// 关闭当前窗口
Application.Current.CloseWindow(Window);
```
