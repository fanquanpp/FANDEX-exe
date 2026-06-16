---
order: 57
title: 'C#与Unity游戏开发'
module: csharp
category: 'C#'
difficulty: intermediate
description: Unity脚本与组件系统
author: fanquanpp
updated: '2026-06-14'
related:
  - csharp/Span与Memory
  - csharp/源生成器
  - 'csharp/C#与Blazor'
  - 'csharp/C#与MAUI'
prerequisites:
  - csharp/概述与环境配置
---

## 概述

Unity 是目前最流行的游戏引擎之一，使用 C# 作为脚本语言。Unity 的核心设计理念是组件化，所有游戏对象通过挂载不同组件获得行为。本文介绍 Unity 开发的基础概念、脚本编写和常用设计模式。

## 基础概念

### Unity 核心概念

| 概念          | 说明                                         |
| ------------- | -------------------------------------------- |
| GameObject    | 游戏中的实体，本身无行为                     |
| Component     | 挂载在 GameObject 上的功能模块               |
| MonoBehaviour | 所有 Unity 脚本的基类                        |
| Transform     | 每个 GameObject 必备组件，控制位置/旋转/缩放 |
| Scene         | 游戏场景，包含所有 GameObject                |
| Prefab        | 预制体，可复用的 GameObject 模板             |

### 脚本生命周期

```
Awake -> OnEnable -> Start -> FixedUpdate -> Update -> LateUpdate -> OnDisable -> OnDestroy
```

- **Awake**：对象创建时调用，早于 Start，适合初始化自身
- **Start**：第一帧更新前调用，适合获取其他组件引用
- **Update**：每帧调用，处理输入和逻辑
- **FixedUpdate**：固定时间间隔调用，处理物理
- **LateUpdate**：所有 Update 完成后调用，适合相机跟随

## 快速上手

### MonoBehaviour 基本脚本

```csharp
public class PlayerController : MonoBehaviour {
    // 公开字段在 Inspector 中可见
    public float speed = 5f;
    public float jumpForce = 7f;

    // 私有字段使用 SerializeField 在 Inspector 中可见
    [SerializeField] private LayerMask groundLayer;

    private Rigidbody rb;
    private bool isGrounded;

    void Awake() {
        // 获取组件引用
        rb = GetComponent<Rigidbody>();
    }

    void Update() {
        // 处理输入
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");

        // 移动
        Vector3 movement = new Vector3(h, 0, v) * speed * Time.deltaTime;
        transform.Translate(movement);

        // 跳跃
        if (Input.GetButtonDown("Jump") && isGrounded) {
            rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
        }
    }

    void FixedUpdate() {
        // 物理检测：是否着地
        isGrounded = Physics.Raycast(
            transform.position, Vector3.down, 1.1f, groundLayer);
    }
}
```

### 协程

```csharp
// 协程：实现延时和异步逻辑
IEnumerator SpawnWaves() {
    while (true) {
        yield return new WaitForSeconds(2f); // 等待2秒
        Instantiate(enemyPrefab, spawnPoint.position, Quaternion.identity);
    }
}

// 启动协程
StartCoroutine(SpawnWaves());

// 带返回值的协程
IEnumerator FadeOut(GameObject obj, float duration) {
    var renderer = obj.GetComponent<Renderer>();
    float elapsed = 0f;
    while (elapsed < duration) {
        elapsed += Time.deltaTime;
        float alpha = 1f - elapsed / duration;
        renderer.material.color = new Color(1, 1, 1, alpha);
        yield return null; // 等待下一帧
    }
    Destroy(obj);
}
```

## 详细用法

### 组件间通信

```csharp
// 方式一：GetComponent 获取其他组件
var health = GetComponent<HealthComponent>();
health.TakeDamage(10);

// 方式二：事件系统（推荐解耦方式）
public class GameEvents {
    public static event Action<int> OnScoreChanged;
    public static event Action OnPlayerDied;

    public static void TriggerScoreChanged(int score) => OnScoreChanged?.Invoke(score);
    public static void TriggerPlayerDied() => OnPlayerDied?.Invoke();
}

// 订阅事件
void OnEnable() {
    GameEvents.OnScoreChanged += HandleScoreChanged;
}

void OnDisable() {
    GameEvents.OnScoreChanged -= HandleScoreChanged;
}

void HandleScoreChanged(int newScore) {
    scoreText.text = "分数: " + newScore;
}
```

### ScriptableObject 配置数据

```csharp
// 使用 ScriptableObject 创建可复用的数据资产
[CreateAssetMenu(fileName = "WeaponConfig", menuName = "Game/Weapon")]
public class WeaponConfig : ScriptableObject {
    public string weaponName;
    public int damage;
    public float attackSpeed;
    public GameObject prefab;
    public AudioClip attackSound;
}

// 在 MonoBehaviour 中引用
public class WeaponSystem : MonoBehaviour {
    [SerializeField] private WeaponConfig currentWeapon;

    void Attack() {
        // 使用配置数据
        Instantiate(currentWeapon.prefab, firePoint.position, firePoint.rotation);
        AudioSource.PlayClipAtPoint(currentWeapon.attackSound, transform.position);
    }
}
```

### 对象池

```csharp
// 对象池模式：避免频繁创建和销毁
public class ObjectPool : MonoBehaviour {
    [SerializeField] private GameObject prefab;
    [SerializeField] private int initialSize = 10;

    private readonly Queue<GameObject> pool = new();

    void Start() {
        for (int i = 0; i < initialSize; i++) {
            var obj = Instantiate(prefab);
            obj.SetActive(false);
            pool.Enqueue(obj);
        }
    }

    public GameObject Get() {
        if (pool.Count > 0) {
            var obj = pool.Dequeue();
            obj.SetActive(true);
            return obj;
        }
        // 池为空时创建新对象
        return Instantiate(prefab);
    }

    public void Return(GameObject obj) {
        obj.SetActive(false);
        pool.Enqueue(obj);
    }
}
```

## 常见场景

### 单例模式

```csharp
// Unity 中的单例模式（线程安全，DontDestroyOnLoad）
public class GameManager : MonoBehaviour {
    public static GameManager Instance { get; private set; }

    void Awake() {
        if (Instance != null && Instance != this) {
            Destroy(gameObject); // 防止重复创建
            return;
        }
        Instance = this;
        DontDestroyOnLoad(gameObject); // 切换场景时不销毁
    }
}
```

### 状态机

```csharp
// 简单的状态机实现
public enum EnemyState { Idle, Patrol, Chase, Attack }

public class EnemyAI : MonoBehaviour {
    private EnemyState currentState = EnemyState.Idle;
    private Transform player;

    void Update() {
        // 状态切换
        switch (currentState) {
            case EnemyState.Idle:
                if (CanSeePlayer()) currentState = EnemyState.Chase;
                break;
            case EnemyState.Patrol:
                Patrol();
                if (CanSeePlayer()) currentState = EnemyState.Chase;
                break;
            case EnemyState.Chase:
                ChasePlayer();
                if (!CanSeePlayer()) currentState = EnemyState.Patrol;
                if (IsInRange()) currentState = EnemyState.Attack;
                break;
            case EnemyState.Attack:
                Attack();
                if (!IsInRange()) currentState = EnemyState.Chase;
                break;
        }
    }
}
```

## 注意事项

- 不要在构造函数中初始化 Unity 组件，应使用 Awake 或 Start
- 协程中修改 UI 必须在主线程执行
- 避免在 Update 中使用 GetComponent，应在 Awake/Start 中缓存引用
- 使用对象池替代频繁的 Instantiate/Destroy
- 公开字段会暴露在 Inspector 中，敏感数据使用 [HideInInspector] 或私有 + [SerializeField]
- Time.deltaTime 是帧间隔时间，物理操作使用 Time.fixedDeltaTime

## 进阶用法

### Unity 的 async/await

```csharp
// 使用 UniTask 库在 Unity 中使用 async/await
using Cysharp.Threading.Tasks;

async UniTaskVoid LoadGameAsync() {
    var playerData = await LoadPlayerAsync();
    var worldData = await LoadWorldAsync();
    InitializeGame(playerData, worldData);
}

// 带超时的异步操作
async UniTask<string> FetchDataWithTimeout(string url) {
    try {
        return await HttpClient.GetStringAsync(url)
            .Timeout(TimeSpan.FromSeconds(10));
    }
    catch (TimeoutException) {
        return "请求超时";
    }
}
```

### 编辑器扩展

```csharp
// 自定义 Inspector 编辑器
[CustomEditor(typeof(EnemyAI))]
public class EnemyAIEditor : Editor {
    public override void OnInspectorGUI() {
        DrawDefaultInspector();

        var ai = (EnemyAI)target;
        if (GUILayout.Button("切换到巡逻状态")) {
            ai.SetState(EnemyState.Patrol);
        }
    }
}
```
