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

// ==================== Java (38 files) ====================
addFile(
  'java',
  'Java',
  50,
  '枚举与注解',
  'Java枚举类型与注解系统',
  'intermediate',
  `## 1. 枚举

\`\`\`java
public enum Status {
  ACTIVE("活跃"), INACTIVE("停用"), PENDING("待审核");

  private final String description;

  Status(String description) { this.description = description; }

  public String getDescription() { return description; }
}
\`\`\`

## 2. 注解

\`\`\`java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Cacheable {
  int ttl() default 3600;
  String key() default "";
}

@Cacheable(ttl = 600, key = "user:#id")
public User getUser(String id) { ... }
\`\`\`
`
);

addFile(
  'java',
  'Java',
  51,
  '泛型进阶',
  '泛型擦除、通配符与边界',
  'advanced',
  `## 1. 类型擦除

\`\`\`java
List<String> strings = new ArrayList<>();
List<Integer> ints = new ArrayList<>();
// 运行时都是 ArrayList，泛型信息被擦除
\`\`\`

## 2. 通配符

\`\`\`java
// 上界通配符 — 只读
void printList(List<? extends Number> list) { }

// 下界通配符 — 只写
void addNumbers(List<? super Integer> list) { }

// PECS 原则：Producer Extends, Consumer Super
\`\`\`
`
);

addFile(
  'java',
  'Java',
  52,
  '并发编程基础',
  '线程、锁与并发工具',
  'intermediate',
  `## 1. 线程创建

\`\`\`java
// 继承 Thread
class MyThread extends Thread {
  public void run() { System.out.println("Running"); }
}

// 实现 Runnable
Thread t = new Thread(() -> System.out.println("Running"));

// Callable + Future
FutureTask<String> task = new FutureTask<>(() -> "result");
new Thread(task).start();
String result = task.get();
\`\`\`

## 2. synchronized

\`\`\`java
synchronized (lock) { /* 临界区 */ }

public synchronized void method() { /* 同步方法 */ }
\`\`\`

## 3. Lock

\`\`\`java
ReentrantLock lock = new ReentrantLock();
lock.lock();
try { /* 临界区 */ } finally { lock.unlock(); }
\`\`\`
`
);

addFile(
  'java',
  'Java',
  53,
  'JUC并发包',
  'java.util.concurrent并发工具',
  'advanced',
  `## 1. 线程池

\`\`\`java
ExecutorService pool = Executors.newFixedThreadPool(4);
pool.submit(() -> doWork());
pool.shutdown();

// 自定义线程池
ThreadPoolExecutor executor = new ThreadPoolExecutor(
  2, 4, 60L, TimeUnit.SECONDS,
  new LinkedBlockingQueue<>(100),
  new ThreadPoolExecutor.CallerRunsPolicy()
);
\`\`\`

## 2. 并发集合

| 类 | 说明 |
|-----|------|
| \`ConcurrentHashMap\` | 并发哈希表 |
| \`CopyOnWriteArrayList\` | 写时复制列表 |
| \`BlockingQueue\` | 阻塞队列 |
| \`ConcurrentSkipListMap\` | 并发跳表 |

## 3. 原子类

\`\`\`java
AtomicInteger counter = new AtomicInteger(0);
counter.incrementAndGet();
counter.compareAndSet(0, 1);
\`\`\`
`
);

addFile(
  'java',
  'Java',
  54,
  'JVM类加载机制',
  '类加载器与双亲委派',
  'advanced',
  `## 1. 类加载过程

加载 → 验证 → 准备 → 解析 → 初始化

## 2. 双亲委派

\`\`\`
Bootstrap ClassLoader（rt.jar）
  ↑
Extension ClassLoader（ext目录）
  ↑
Application ClassLoader（classpath）
  ↑
自定义 ClassLoader
\`\`\`

## 3. 打破双亲委派

\`\`\`java
class CustomClassLoader extends ClassLoader {
  @Override
  protected Class<?> findClass(String name) {
    byte[] classData = loadClassData(name);
    return defineClass(name, classData, 0, classData.length);
  }
}
\`\`\`
`
);

addFile(
  'java',
  'Java',
  55,
  'JVM垃圾回收',
  'GC算法与垃圾回收器',
  'advanced',
  `## 1. GC 算法

| 算法 | 说明 |
|------|------|
| 标记-清除 | 产生碎片 |
| 标记-整理 | 无碎片，但移动开销 |
| 复制算法 | 无碎片，但空间浪费 |
| 分代收集 | 结合以上算法 |

## 2. 垃圾回收器

| 回收器 | 说明 | 适用场景 |
|--------|------|---------|
| Serial | 单线程 | 客户端 |
| Parallel | 多线程 | 吞吐量优先 |
| CMS | 低停顿 | 已废弃 |
| G1 | 分区收集 | 服务端默认 |
| ZGC | 超低延迟 | 大内存 |
| Shenandoah | 低延迟 | 大内存 |
`
);

addFile(
  'java',
  'Java',
  56,
  'JVM调优',
  'JVM参数与性能调优',
  'advanced',
  `## 1. 常用参数

\`\`\`bash
-Xms512m          # 初始堆大小
-Xmx2g            # 最大堆大小
-Xmn256m          # 新生代大小
-XX:+UseG1GC      # 使用 G1
-XX:MaxGCPauseMillis=200  # 目标停顿时间
\`\`\`

## 2. 诊断工具

\`\`\`bash
jps               # 查看Java进程
jstat -gc pid     # GC统计
jmap -heap pid    # 堆信息
jstack pid        # 线程栈
jcmd pid GC.heap_info  # 堆信息
\`\`\`
`
);

addFile(
  'java',
  'Java',
  57,
  'Java反射',
  '反射API与动态代理',
  'intermediate',
  `## 1. 基本反射

\`\`\`java
Class<?> clazz = Class.forName("com.example.User");
Method[] methods = clazz.getDeclaredMethods();
Field field = clazz.getDeclaredField("name");
field.setAccessible(true);
\`\`\`

## 2. 动态代理

\`\`\`java
interface Service { void execute(); }

Service proxy = (Service) Proxy.newProxyInstance(
  Service.class.getClassLoader(),
  new Class[]{Service.class},
  (obj, method, args) -> {
    System.out.println("Before: " + method.getName());
    Object result = method.invoke(target, args);
    System.out.println("After");
    return result;
  }
);
\`\`\`
`
);

addFile(
  'java',
  'Java',
  58,
  'Java序列化',
  '序列化与反序列化',
  'intermediate',
  `## 1. Serializable

\`\`\`java
public class User implements Serializable {
  private static final long serialVersionUID = 1L;
  private String name;
  private transient String password; // 不序列化
}
\`\`\`

## 2. 替代方案

| 方案 | 优点 |
|------|------|
| JSON (Jackson/Gson) | 可读、跨语言 |
| Protocol Buffers | 高效、跨语言 |
| Kryo | Java 高性能 |
| Avro | Schema 演化 |
`
);

addFile(
  'java',
  'Java',
  59,
  'JavaIO与NIO',
  'BIO、NIO与AIO',
  'intermediate',
  `## 1. BIO vs NIO vs AIO

| 模型 | 说明 |
|------|------|
| BIO | 同步阻塞，一个连接一个线程 |
| NIO | 同步非阻塞，Selector 多路复用 |
| AIO | 异步非阻塞，回调通知 |

## 2. NIO 核心

\`\`\`java
// Buffer
ByteBuffer buf = ByteBuffer.allocate(1024);
buf.put(data);
buf.flip();
buf.get();

// Channel
FileChannel channel = FileChannel.open(path, StandardOpenOption.READ);

// Selector
Selector selector = Selector.open();
channel.register(selector, SelectionKey.OP_READ);
\`\`\`
`
);

addFile(
  'java',
  'Java',
  60,
  'Java新特性',
  'Java 17-21新特性',
  'intermediate',
  `## 1. Record（Java 16）

\`\`\`java
public record Point(int x, int y) {}
\`\`\`

## 2. Sealed Classes（Java 17）

\`\`\`java
public sealed interface Shape permits Circle, Rectangle {}
public record Circle(double radius) implements Shape {}
public record Rectangle(double w, double h) implements Shape {}
\`\`\`

## 3. Pattern Matching（Java 21）

\`\`\`java
if (obj instanceof String s && s.length() > 5) {
  System.out.println(s.toUpperCase());
}

switch (shape) {
  case Circle(var r) -> Math.PI * r * r;
  case Rectangle(var w, var h) -> w * h;
}
\`\`\`

## 4. Virtual Threads（Java 21）

\`\`\`java
Thread.startVirtualThread(() -> doWork());
\`\`\`
`
);

addFile(
  'java',
  'Java',
  61,
  'Spring基础',
  'Spring框架核心概念',
  'intermediate',
  `## 1. IoC 容器

\`\`\`java
@Service
public class UserService {
  @Autowired
  private UserRepository repo;
}
\`\`\`

## 2. AOP

\`\`\`java
@Aspect
@Component
public class LoggingAspect {
  @Around("@annotation(Loggable)")
  public Object log(ProceedingJoinPoint pjp) throws Throwable {
    log.info("Before: {}", pjp.getSignature());
    Object result = pjp.proceed();
    log.info("After");
    return result;
  }
}
\`\`\`
`
);

addFile(
  'java',
  'Java',
  62,
  'SpringBoot进阶',
  'SpringBoot高级特性',
  'intermediate',
  `## 1. 自动配置

\`\`\`java
@Configuration
@ConditionalOnClass(DataSource.class)
@EnableConfigurationProperties(DataSourceProperties.class)
public class DataSourceAutoConfiguration { }
\`\`\`

## 2. 自定义 Starter

\`\`\`
my-spring-boot-starter/
├── autoconfigure/
│   └── MyAutoConfiguration.java
├── starter/
└── pom.xml
\`\`\`
`
);

addFile(
  'java',
  'Java',
  63,
  'SpringBoot安全',
  'Spring Security与认证授权',
  'intermediate',
  `## 1. 基本配置

\`\`\`java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      .authorizeHttpRequests(auth -> auth
        .requestMatchers("/public/**").permitAll()
        .anyRequest().authenticated()
      )
      .oauth2Login(Customizer.withDefaults());
    return http.build();
  }
}
\`\`\`
`
);

addFile(
  'java',
  'Java',
  64,
  'SpringBoot数据访问',
  'JPA、MyBatis与数据访问',
  'intermediate',
  `## 1. JPA

\`\`\`java
@Entity
public class User {
  @Id @GeneratedValue
  private Long id;
  private String name;
}

public interface UserRepository extends JpaRepository<User, Long> {
  List<User> findByName(String name);
}
\`\`\`

## 2. MyBatis

\`\`\`java
@Mapper
public interface UserMapper {
  @Select("SELECT * FROM users WHERE id = #{id}")
  User findById(Long id);
}
\`\`\`
`
);

addFile(
  'java',
  'Java',
  65,
  'Java设计模式',
  'GoF设计模式Java实现',
  'intermediate',
  `## 1. 创建型

- 单例：\`enum Singleton { INSTANCE }\`
- 工厂方法：\`interface Factory<T> { T create(); }\`
- 建造者：\`User.builder().name("A").age(25).build()\`

## 2. 结构型

- 适配器：\`class Adapter implements Target { delegate() }\`
- 装饰器：\`class Decorator implements Component { wrapped() }\`
- 代理：\`java.lang.reflect.Proxy\`

## 3. 行为型

- 策略：\`interface Strategy { void execute(); }\`
- 观察者：\`interface Listener { void onEvent(Event e); }\`
- 模板方法：\`abstract class Template { final void run() { step1(); step2(); } }\`
`
);

addFile(
  'java',
  'Java',
  66,
  'Java函数式编程',
  'Lambda、Stream与函数式接口',
  'intermediate',
  `## 1. 函数式接口

\`\`\`java
@FunctionalInterface
interface Transformer<T, R> { R transform(T input); }

// 内置
Function<T, R>       // T → R
Consumer<T>          // T → void
Supplier<T>          // () → T
Predicate<T>         // T → boolean
BiFunction<T, U, R>  // (T, U) → R
\`\`\`

## 2. Stream API

\`\`\`java
List<String> names = users.stream()
  .filter(u -> u.getAge() > 18)
  .map(User::getName)
  .sorted()
  .collect(Collectors.toList());

// 并行流
long count = list.parallelStream().filter(x -> x > 0).count();
\`\`\`
`
);

addFile(
  'java',
  'Java',
  67,
  'Java网络编程',
  'Socket与HTTP客户端',
  'intermediate',
  `## 1. HttpClient（Java 11+）

\`\`\`java
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
  .uri(URI.create("https://api.example.com/data"))
  .header("Accept", "application/json")
  .GET()
  .build();

HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
\`\`\`

## 2. 异步请求

\`\`\`java
CompletableFuture<HttpResponse<String>> future =
  client.sendAsync(request, BodyHandlers.ofString());
\`\`\`
`
);

addFile(
  'java',
  'Java',
  68,
  'Java日志系统',
  'SLF4J、Logback与日志框架',
  'intermediate',
  `## 1. SLF4J + Logback

\`\`\`java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

Logger logger = LoggerFactory.getLogger(MyClass.class);
logger.info("User {} logged in", userId);
logger.error("Error processing", exception);
\`\`\`

## 2. logback.xml

\`\`\`xml
<configuration>
  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder><pattern>%d{HH:mm:ss} [%thread] %-5level %logger - %msg%n</pattern></encoder>
  </appender>
  <root level="INFO"><appender-ref ref="STDOUT"/></root>
</configuration>
\`\`\`
`
);

addFile(
  'java',
  'Java',
  69,
  'Java单元测试',
  'JUnit 5与Mockito',
  'intermediate',
  `## 1. JUnit 5

\`\`\`java
import org.junit.jupiter.api.*;

class UserServiceTest {
  @Test
  @DisplayName("Should create user")
  void createUser() {
    assertThrows(IllegalArgumentException.class, () -> new User(null));
  }

  @ParameterizedTest
  @ValueSource(strings = {"alice", "bob"})
  void validNames(String name) {
    assertNotNull(new User(name));
  }
}
\`\`\`

## 2. Mockito

\`\`\`java
@ExtendWith(MockitoExtension.class)
class Test {
  @Mock UserRepository repo;
  @InjectMocks UserService service;

  @Test
  void test() {
    when(repo.findById(1L)).thenReturn(Optional.of(user));
    User found = service.getUser(1L);
    assertEquals("Alice", found.getName());
  }
}
\`\`\`
`
);

addFile(
  'java',
  'Java',
  70,
  'Java构建工具',
  'Maven与Gradle',
  'intermediate',
  `## 1. Maven

\`\`\`xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
  <version>3.2.0</version>
</dependency>
\`\`\`

## 2. Gradle

\`\`\`groovy
dependencies {
  implementation 'org.springframework.boot:spring-boot-starter-web:3.2.0'
  testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'
}
\`\`\`
`
);

addFile(
  'java',
  'Java',
  71,
  'Java与微服务',
  'Spring Cloud微服务架构',
  'advanced',
  `## 1. 核心组件

| 组件 | 说明 |
|------|------|
| Eureka/Nacos | 服务注册与发现 |
| Ribbon/LoadBalancer | 负载均衡 |
| Feign/OpenFeign | 声明式HTTP客户端 |
| Hystrix/Sentinel | 熔断降级 |
| Gateway | API 网关 |
| Config/Nacos | 配置中心 |

## 2. 服务注册

\`\`\`java
@EnableDiscoveryClient
@SpringBootApplication
public class Application { public static void main(String[] args) { SpringApplication.run(Application.class, args); } }
\`\`\`
`
);

addFile(
  'java',
  'Java',
  72,
  'Java与消息队列',
  'Kafka与RabbitMQ集成',
  'intermediate',
  `## 1. Kafka

\`\`\`java
@KafkaListener(topics = "orders")
public void handleOrder(OrderEvent event) {
  processOrder(event);
}

kafkaTemplate.send("orders", orderEvent);
\`\`\`

## 2. RabbitMQ

\`\`\`java
@RabbitListener(queues = "task-queue")
public void handleTask(Task task) { process(task); }

rabbitTemplate.convertAndSend("task-queue", task);
\`\`\`
`
);

addFile(
  'java',
  'Java',
  73,
  'Java与Redis',
  'Redis缓存与数据结构',
  'intermediate',
  `## 1. Spring Data Redis

\`\`\`java
@Cacheable(value = "users", key = "#id")
public User getUser(Long id) { return repo.findById(id); }

@CacheEvict(value = "users", key = "#user.id")
public void updateUser(User user) { repo.save(user); }
\`\`\`
`
);

addFile(
  'java',
  'Java',
  74,
  'Java与Docker',
  'Java容器化部署',
  'intermediate',
  `## 1. Dockerfile

\`\`\`dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/app.jar .
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
\`\`\`

## 2. 多阶段构建

\`\`\`dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
COPY . .
RUN mvn package -DskipTests

FROM eclipse-temurin:21-jre-alpine
COPY --from=build target/app.jar .
ENTRYPOINT ["java", "-jar", "app.jar"]
\`\`\`
`
);

addFile(
  'java',
  'Java',
  75,
  'Java与GraphQL',
  'GraphQL API开发',
  'intermediate',
  `## 1. Spring for GraphQL

\`\`\`java
@Controller
public class UserGraphQLController {
  @QueryMapping
  public User user(@Argument Long id) { return userService.getUser(id); }

  @SchemaMapping
  public List<Post> posts(User user) { return postService.getByUser(user.getId()); }
}
\`\`\`
`
);

addFile(
  'java',
  'Java',
  76,
  'Java性能调优',
  'Java应用性能优化',
  'advanced',
  `## 1. 性能分析工具

\`\`\`bash
jvisualvm     # 可视化监控
async-profiler # CPU/内存分析
JFR           # Java Flight Recorder
\`\`\`

## 2. 常见优化

- 使用 StringBuilder 代替字符串拼接
- 使用基本类型代替包装类
- 合理设置线程池大小
- 使用缓存减少重复计算
- 选择合适的 GC 算法
`
);

addFile(
  'java',
  'Java',
  77,
  'Java与AI',
  'Java机器学习与AI集成',
  'intermediate',
  `## 1. DJL (Deep Java Library)

\`\`\`java
Model model = Model.newInstance("resnet");
model.load(Paths.get("model"));

Predictor<Image, Classifications> predictor = model.newPredictor(translator);
Classifications result = predictor.predict(image);
\`\`\`

## 2. LangChain4j

\`\`\`java
ChatLanguageModel model = OpenAiChatModel.builder()
  .apiKey(System.getenv("OPENAI_API_KEY"))
  .modelName("gpt-4")
  .build();

String response = model.generate("Hello!");
\`\`\`
`
);

addFile(
  'java',
  'Java',
  78,
  'Java与安全',
  'Java安全编程',
  'intermediate',
  `## 1. 加密

\`\`\`java
// AES 加密
Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
cipher.init(Cipher.ENCRYPT_MODE, secretKey);
byte[] encrypted = cipher.doFinal(data);

// 哈希
MessageDigest md = MessageDigest.getInstance("SHA-256");
byte[] hash = md.digest(input.getBytes());
\`\`\`

## 2. 安全最佳实践

- 使用 BCrypt 存储密码
- 验证所有输入
- 使用参数化查询防 SQL 注入
- 启用 HTTPS
- 使用 SecurityManager
`
);

addFile(
  'java',
  'Java',
  79,
  'Java与WebAssembly',
  'Java与Wasm交互',
  'advanced',
  `## 1. Chicory (Java Wasm Runtime)

\`\`\`java
import com.dylibso.chicory.runtime.Instance;

Instance instance = Instance.builder(Paths.get("module.wasm")).build();
int result = instance.export("add").apply(1, 2)[0];
\`\`\`
`
);

addFile(
  'java',
  'Java',
  80,
  'Java与响应式编程',
  'Project Reactor与WebFlux',
  'advanced',
  `## 1. Mono & Flux

\`\`\`java
Mono<String> mono = Mono.just("Hello");
Flux<Integer> flux = Flux.range(1, 10);

mono.map(String::toUpperCase)
    .flatMap(this::processAsync)
    .subscribe(System.out::println);
\`\`\`

## 2. WebFlux

\`\`\`java
@RestController
public class UserController {
  @GetMapping("/users/{id}")
  public Mono<User> getUser(@PathVariable String id) {
    return userService.findById(id);
  }
}
\`\`\`
`
);

addFile(
  'java',
  'Java',
  81,
  'Java与虚拟线程',
  'Project Loom虚拟线程',
  'intermediate',
  `## 1. 虚拟线程（Java 21）

\`\`\`java
// 创建虚拟线程
Thread.startVirtualThread(() -> doWork());

// ExecutorService
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
  IntStream.range(0, 10000).forEach(i -> {
    executor.submit(() -> {
      Thread.sleep(Duration.ofSeconds(1));
      return i;
    });
  });
}
\`\`\`

## 2. 虚拟线程 vs 平台线程

| 特性 | 虚拟线程 | 平台线程 |
|------|---------|---------|
| 创建成本 | 极低 | 高 |
| 数量 | 百万级 | 千级 |
| 阻塞 | 不占用OS线程 | 占用OS线程 |
| 适用 | IO密集 | CPU密集 |
`
);

addFile(
  'java',
  'Java',
  82,
  'Java与GraalVM',
  'GraalVM原生镜像',
  'advanced',
  `## 1. Native Image

\`\`\`bash
native-image -jar myapp.jar
./myapp # 毫秒级启动
\`\`\`

## 2. Spring Boot Native

\`\`\`bash
mvn -Pnative native:compile
\`\`\`

## 3. 限制

- 反射需要配置
- 动态代理需要配置
- JNI 有限制
- 类加载受限
`
);

addFile(
  'java',
  'Java',
  83,
  'Java与Kubernetes',
  'Java云原生部署',
  'intermediate',
  `## 1. Kubernetes 部署

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: myapp }
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        resources:
          requests: { memory: "512Mi", cpu: "500m" }
          limits: { memory: "1Gi", cpu: "1000m" }
\`\`\`

## 2. 健康检查

\`\`\`java
@RestController
class HealthController {
  @GetMapping("/actuator/health")
  Map<String, String> health() { return Map.of("status", "UP"); }
}
\`\`\`
`
);

addFile(
  'java',
  'Java',
  84,
  'Java记录类',
  'Record类与密封接口',
  'intermediate',
  `## 1. Record 类（Java 16+）

\`\`\`java
public record Point(int x, int y) {
  // 自动生成：构造器、getter、equals、hashCode、toString
  public Point { // 紧凑构造器
    if (x < 0 || y < 0) throw new IllegalArgumentException();
  }
}

var p = new Point(3, 4);
p.x(); // 3
\`\`\`

## 2. 密封接口（Java 17+）

\`\`\`java
public sealed interface Expr permits Add, Mul, Val {}
public record Add(Expr left, Expr right) implements Expr {}
public record Mul(Expr left, Expr right) implements Expr {}
public record Val(int value) implements Expr {}
\`\`\`
`
);

addFile(
  'java',
  'Java',
  85,
  'Java文本块',
  '文本块与字符串模板',
  'beginner',
  `## 1. 文本块（Java 15+）

\`\`\`java
String json = """
  {
    "name": "Alice",
    "age": 25
  }
  """;
\`\`\`

## 2. 字符串模板（Java 21 Preview）

\`\`\`java
String msg = STR."Hello \\{name}, age \\{age}";
\`\`\`
`
);

addFile(
  'java',
  'Java',
  86,
  'Java模块系统',
  'JPMS模块系统',
  'advanced',
  `## 1. module-info.java

\`\`\`java
module com.example.app {
  requires java.sql;
  requires transitive com.example.api;
  exports com.example.app.service;
  opens com.example.app.model to com.fasterxml.jackson.databind;
}
\`\`\`
`
);

addFile(
  'java',
  'Java',
  87,
  'Java与数据库连接',
  'JDBC与连接池',
  'intermediate',
  `## 1. JDBC

\`\`\`java
try (Connection conn = dataSource.getConnection();
     PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE id = ?")) {
  ps.setLong(1, userId);
  try (ResultSet rs = ps.executeQuery()) {
    if (rs.next()) return mapUser(rs);
  }
}
\`\`\`

## 2. HikariCP 连接池

\`\`\`java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:postgresql://localhost/mydb");
config.setMaximumPoolSize(10);
DataSource ds = new HikariDataSource(config);
\`\`\`
`
);

// ==================== Kotlin (34 files) ====================
addFile(
  'kotlin',
  'Kotlin',
  50,
  '空安全详解',
  'Kotlin空安全与智能转换',
  'beginner',
  `## 1. 可空类型

\`\`\`kotlin
var name: String = "Alice"  // 不可空
var nick: String? = null    // 可空

// 安全调用
nick?.length

// Elvis 运算符
val len = nick?.length ?: 0

// 非空断言
nick!!.length  // 如果为 null 抛出 NPE

// 安全转换
val num: Int? = value as? Int
\`\`\`

## 2. 智能转换

\`\`\`kotlin
fun process(s: String?) {
  if (s != null) {
    s.length  // 自动智能转换为 String
  }
}

when (x) {
  is String -> x.length  // 自动转换
  is Int -> x.toDouble()
}
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  51,
  '扩展函数',
  'Kotlin扩展函数与属性',
  'intermediate',
  `## 1. 扩展函数

\`\`\`kotlin
fun String.addExclamation() = this + "!"

"Hello".addExclamation()  // "Hello!"

fun List<Int>.sumOfSquares() = sumOf { it * it }
\`\`\`

## 2. 扩展属性

\`\`\`kotlin
val String.isNumeric: Boolean
  get() = all { it.isDigit() }

"123".isNumeric  // true
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  52,
  '密封类与代数数据类型',
  '密封类与when穷举',
  'intermediate',
  `## 1. 密封类

\`\`\`kotlin
sealed interface Result<out T> {
  data class Success<T>(val value: T) : Result<T>
  data class Failure(val error: String) : Result<Nothing>
}

fun handle(result: Result<Int>) = when (result) {
  is Result.Success -> println(result.value)
  is Result.Failure -> println(result.error)
  // 编译器确保穷举所有分支
}
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  53,
  '委托属性',
  '委托属性与标准委托',
  'intermediate',
  `## 1. 标准委托

\`\`\`kotlin
import kotlin.properties.Delegates

class User {
  var name: String by Delegates.observable("") { _, old, new ->
    println("Name changed: $old -> $new")
  }

  var age: Int by Delegates.vetoable(0) { _, _, new ->
    new >= 0  // 只有非负值才接受
  }

  val config: Config by lazy { loadConfig() }
}
\`\`\`

## 2. Map 委托

\`\`\`kotlin
class User(map: Map<String, Any?>) {
  val name: String by map
  val age: Int by map
}
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  54,
  '协程基础',
  'Kotlin协程入门',
  'intermediate',
  `## 1. 启动协程

\`\`\`kotlin
import kotlinx.coroutines.*

// launch — 启动协程（不返回结果）
GlobalScope.launch {
  delay(1000)
  println("World!")
}

// async — 启动协程（返回结果）
val deferred = async { fetchUser() }
val user = deferred.await()
\`\`\`

## 2. 协程作用域

\`\`\`kotlin
class MyViewModel : ViewModel() {
  fun loadData() {
    viewModelScope.launch {
      val data = repository.fetch()
      _state.value = data
    }
  }
}
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  55,
  'Flow与响应式流',
  'Kotlin Flow与Channel',
  'advanced',
  `## 1. Flow

\`\`\`kotlin
fun numbers(): Flow<Int> = flow {
  for (i in 1..10) {
    emit(i)
    delay(100)
  }
}

numbers()
  .filter { it % 2 == 0 }
  .map { it * it }
  .collect { println(it) }
\`\`\`

## 2. StateFlow & SharedFlow

\`\`\`kotlin
private val _state = MutableStateFlow(initialValue)
val state: StateFlow<T> = _state.asStateFlow()
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  56,
  'Kotlin与Spring',
  'Kotlin Spring Boot开发',
  'intermediate',
  `## 1. Spring Boot with Kotlin

\`\`\`kotlin
@RestController
class UserController(private val service: UserService) {
  @GetMapping("/users/{id}")
  suspend fun getUser(@PathVariable id: String): User =
    service.findById(id)
}

@Service
class UserService(private val repo: UserRepository) {
  suspend fun findById(id: String): User = coroutineScope {
    repo.findById(id) ?: throw NotFoundException()
  }
}
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  57,
  'Kotlin与Android',
  'Kotlin Android开发',
  'intermediate',
  `## 1. Activity

\`\`\`kotlin
class MainActivity : AppCompatActivity() {
  private val viewModel: MainViewModel by viewModels()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent {
      MaterialTheme {
        MainScreen(viewModel)
      }
    }
  }
}
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  58,
  'Kotlin内联类',
  'value class与内联优化',
  'intermediate',
  `## 1. Value Class

\`\`\`kotlin
@JvmInline
value class UserId(val value: String)
@JvmInline
value class Email(val value: String)

fun findUser(id: UserId) { /* ... */ }
findUser(UserId("123"))  // 类型安全，运行时无开销
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  59,
  'Kotlin契约',
  '契约与编译器提示',
  'advanced',
  `## 1. 契约

\`\`\`kotlin
fun requireNonNull(value: Any?) {
  contract { returns() implies (value != null) }
  if (value == null) throw IllegalArgumentException()
}

fun process(s: String?) {
  requireNonNull(s)
  s.length  // 编译器知道 s 不为 null
}
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  60,
  'Kotlin多平台',
  'Kotlin Multiplatform项目',
  'advanced',
  `## 1. 项目结构

\`\`\`
shared/
├── src/
│   ├── commonMain/kotlin/   # 共享代码
│   ├── jvmMain/kotlin/      # JVM 特定
│   ├── jsMain/kotlin/       # JS 特定
│   └── nativeMain/kotlin/   # Native 特定
└── build.gradle.kts
\`\`\`

## 2. expect/actual

\`\`\`kotlin
// commonMain
expect fun getPlatformName(): String

// jvmMain
actual fun getPlatformName() = "JVM"

// jsMain
actual fun getPlatformName() = "JS"
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  61,
  'Kotlin序列化',
  'kotlinx.serialization',
  'intermediate',
  `## 1. 序列化

\`\`\`kotlin
@Serializable
data class User(val name: String, val age: Int)

val json = Json { ignoreUnknownKeys = true }
val user = json.decodeFromString<User>("""{"name":"Alice","age":25}""")
val jsonString = json.encodeToString(user)
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  62,
  'Kotlin集合操作',
  '函数式集合操作',
  'beginner',
  `## 1. 常用操作

\`\`\`kotlin
val result = users
  .filter { it.age > 18 }
  .map { it.name }
  .sorted()
  .distinct()

// 聚合
val totalAge = users.sumOf { it.age }
val grouped = users.groupBy { it.city }

// 关联
val userMap = users.associateBy { it.id }
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  63,
  'Kotlin作用域函数',
  'let/run/with/apply/also',
  'beginner',
  `## 1. 作用域函数对比

| 函数 | 对象引用 | 返回值 | 适用场景 |
|------|---------|--------|---------|
| \`let\` | \`it\` | Lambda 结果 | 空检查、转换 |
| \`run\` | \`this\` | Lambda 结果 | 初始化+计算 |
| \`with\` | \`this\` | Lambda 结果 | 非空对象操作 |
| \`apply\` | \`this\` | 对象本身 | 对象配置 |
| \`also\` | \`it\` | 对象本身 | 附加操作 |

\`\`\`kotlin
val person = Person().apply {
  name = "Alice"
  age = 25
}.also {
  println("Created: $it")
}
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  64,
  'Kotlin类型系统',
  '泛型、型变与星投影',
  'advanced',
  `## 1. 型变

\`\`\`kotlin
// 协变 — out（生产者）
interface Source<out T> { fun next(): T }

// 逆变 — in（消费者）
interface Sink<in T> { fun put(value: T) }

// 不变
class MutableStack<T> { fun push(item: T) {} fun pop(): T }
\`\`\`

## 2. 星投影

\`\`\`kotlin
fun printSize(list: List<*>) {
  println(list.size) // 可以，不依赖 T
}
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  65,
  'Kotlin与Compose',
  'Jetpack Compose桌面/移动',
  'intermediate',
  `## 1. Compose 基础

\`\`\`kotlin
@Composable
fun Greeting(name: String) {
  var count by remember { mutableStateOf(0) }
  Column {
    Text("Hello, $name! Count: $count")
    Button(onClick = { count++ }) {
      Text("Click")
    }
  }
}
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  66,
  'Kotlin与Gradle',
  'Kotlin DSL构建脚本',
  'intermediate',
  `## 1. build.gradle.kts

\`\`\`kotlin
plugins {
  kotlin("jvm") version "2.0.0"
  kotlin("plugin.serialization") version "2.0.0"
}

dependencies {
  implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.0")
  implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
  testImplementation(kotlin("test"))
}

tasks.test { useJUnitPlatform() }
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  67,
  'Kotlin与Arrow',
  '函数式编程库Arrow',
  'advanced',
  `## 1. Either

\`\`\`kotlin
import arrow.core.Either

fun divide(a: Int, b: Int): Either<String, Int> =
  if (b == 0) Either.Left("Division by zero")
  else Either.Right(a / b)

val result = divide(10, 0)
  .map { it * 2 }
  .getOrElse { 0 }
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  68,
  'Kotlin与Ktor',
  'Ktor服务端框架',
  'intermediate',
  `## 1. Ktor 服务器

\`\`\`kotlin
embeddedServer(Netty, port = 8080) {
  routing {
    get("/hello") {
      call.respondText("Hello, World!")
    }
    get("/users/{id}") {
      val id = call.parameters["id"]!!
      call.respond(userService.findById(id))
    }
  }
}.start(wait = true)
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  69,
  'Kotlin与Exposed',
  'Kotlin SQL框架Exposed',
  'intermediate',
  `## 1. Exposed DSL

\`\`\`kotlin
object Users : Table() {
  val id = integer("id").autoIncrement()
  val name = varchar("name", 50)
  override val primaryKey = PrimaryKey(id)
}

transaction {
  Users.insert { it[name] = "Alice" }
  Users.selectAll().map { it[Users.name] }
}
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  70,
  'Kotlin与Koin',
  'Koin依赖注入',
  'intermediate',
  `## 1. Koin 配置

\`\`\`kotlin
val appModule = module {
  single { UserRepository(get()) }
  viewModel { UserViewModel(get()) }
}

startKoin {
  modules(appModule)
}
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  71,
  'Kotlin与ktor-client',
  'Ktor HTTP客户端',
  'intermediate',
  `## 1. HTTP 客户端

\`\`\`kotlin
val client = HttpClient(CIO) {
  install(ContentNegotiation) { json() }
}

suspend fun fetchUsers(): List<User> =
  client.get("https://api.example.com/users").body()
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  72,
  'Kotlin与测试',
  'Kotlin测试框架',
  'intermediate',
  `## 1. Kotlin Test

\`\`\`kotlin
class UserTest : StringSpec({
  "should create user" {
    val user = User("Alice", 25)
    user.name shouldBe "Alice"
  }

  "should validate age" {
    shouldThrow<IllegalArgumentException> {
      User("Alice", -1)
    }
  }
})
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  73,
  'Kotlin与协程Channel',
  'Channel与Select',
  'advanced',
  `## 1. Channel

\`\`\`kotlin
val channel = Channel<Int>()

launch { for (x in 1..5) channel.send(x) }
launch { repeat(5) { println(channel.receive()) } }
\`\`\`

## 2. Select

\`\`\`kotlin
select<Unit> {
  channel1.onReceive { value -> process(value) }
  channel2.onReceive { value -> process(value) }
  onTimeout(1000) { println("Timeout") }
}
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  74,
  'Kotlin与编译器插件',
  'kapt、KSP与编译器插件',
  'advanced',
  `## 1. KSP（Kotlin Symbol Processing）

\`\`\`kotlin
// build.gradle.kts
plugins {
  id("com.google.devtools.ksp") version "2.0.0-1.0.21"
}

dependencies {
  ksp("com.example:processor:1.0.0")
}
\`\`\`

KSP 比 kapt 更快，因为直接操作 Kotlin AST。
`
);

addFile(
  'kotlin',
  'Kotlin',
  75,
  'Kotlin与DSL',
  'Kotlin DSL设计',
  'intermediate',
  `## 1. DSL 构建

\`\`\`kotlin
fun html(block: HTML.() -> Unit): HTML = HTML().apply(block)

class HTML {
  private val children = mutableListOf<String>()
  fun body(block: Body.() -> Unit) { children.add(Body().apply(block).toString()) }
  override fun toString() = children.joinToString("\\n")
}

html {
  body {
    h1("Title")
    p("Content")
  }
}
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  76,
  'Kotlin与原子操作',
  'kotlinx.atomicfu',
  'intermediate',
  `## 1. 原子操作

\`\`\`kotlin
import kotlinx.atomicfu.atomic

class Counter {
  private val count = atomic(0)
  fun increment() = count.incrementAndGet()
  fun get() = count.value
}
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  77,
  'Kotlin与Benchmark',
  'Kotlin性能基准测试',
  'intermediate',
  `## 1. JMH with Kotlin

\`\`\`kotlin
@BenchmarkMode(Mode.AverageTime)
@State(Scope.Benchmark)
class StringBenchmark {
  @Benchmark fun stringConcat() = "Hello" + " " + "World"
  @Benchmark fun stringBuilder() = StringBuilder().append("Hello").append(" ").append("World").toString()
}
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  78,
  'Kotlin与IO',
  'kotlinx-io与文件操作',
  'intermediate',
  `## 1. 文件操作

\`\`\`kotlin
// 读取
val lines = File("data.txt").readLines()
val text = File("data.txt").readText()

// 写入
File("output.txt").writeText("Hello, World!")
File("output.txt").appendText("More content")

// 遍历
File(".").walkTopDown().filter { it.extension == "kt" }.forEach { println(it) }
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  79,
  'Kotlin与正则',
  'Kotlin正则表达式',
  'beginner',
  `## 1. 正则操作

\`\`\`kotlin
val regex = Regex("""\\d{4}-\\d{2}-\\d{2}""")
"Date: 2026-06-14".contains(regex)  // true

val match = regex.find("2026-06-14")
match?.value  // "2026-06-14"

// 替换
"2026-06-14".replace(regex, "YYYY-MM-DD")

// 分割
"a,b,c".split(Regex(","))
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  80,
  'Kotlin与时间',
  'kotlinx-datetime',
  'intermediate',
  `## 1. 日期时间

\`\`\`kotlin
import kotlinx.datetime.*

val now = Clock.System.now()
val today = now.toLocalDateTime(TimeZone.currentSystemDefault()).date

val birthday = LocalDate(2000, Month.JANUARY, 15)
val age = today.year - birthday.year

val duration = 30.minutes
val instant = now + duration
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  81,
  'Kotlin与并发安全',
  '协程并发与线程安全',
  'advanced',
  `## 1. Mutex

\`\`\`kotlin
val mutex = Mutex()
var counter = 0

repeat(1000) {
  launch {
    mutex.withLock {
      counter++
    }
  }
}
\`\`\`

## 2. Actor

\`\`\`kotlin
fun CoroutineScope.counterActor() = actor<CounterMsg> {
  var counter = 0
  for (msg in channel) {
    when (msg) {
      is Inc -> counter++
      is Get -> msg.response.complete(counter)
    }
  }
}
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  82,
  'Kotlin与WebSocket',
  'Ktor WebSocket',
  'intermediate',
  `## 1. WebSocket 服务器

\`\`\`kotlin
routing {
  webSocket("/ws") {
    for (frame in incoming) {
      if (frame is Frame.Text) {
        val text = frame.readText()
        send(Frame.Text("Echo: $text"))
      }
    }
  }
}
\`\`\`
`
);

addFile(
  'kotlin',
  'Kotlin',
  83,
  'Kotlin与安全',
  'Kotlin安全编程',
  'intermediate',
  `## 1. 安全实践

\`\`\`kotlin
// 使用空安全避免 NPE
fun process(value: String?) {
  value?.let { /* 非空时执行 */ }
}

// 密码哈希
import org.mindrot.jbcrypt.BCrypt
val hash = BCrypt.hashpw(password, BCrypt.gensalt())
BCrypt.checkpw(input, hash)
\`\`\`
`
);

console.log(`\nDone! Total Java+Kotlin files created: ${total}`);
