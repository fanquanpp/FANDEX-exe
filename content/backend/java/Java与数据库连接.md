---
order: 87
title: Java与数据库连接
module: java
category: Java
difficulty: intermediate
description: JDBC与连接池
author: fanquanpp
updated: '2026-06-14'
related:
  - java/Java文本块
  - java/Java模块系统
  - java/Java新特性与生态
  - java/数组详解
prerequisites:
  - java/概述与开发环境
---

## 概述

Java 通过 JDBC（Java Database Connectivity）提供统一的数据库访问接口。在实际项目中，通常使用连接池（如 HikariCP）管理数据库连接，配合 Spring Data JPA 或 MyBatis 等 ORM 框架简化数据访问层的开发。本文从 JDBC 基础出发，逐步介绍连接池配置和 ORM 集成。

## 基础概念

### JDBC 核心组件

| 组件              | 说明                          |
| ----------------- | ----------------------------- |
| DriverManager     | 管理数据库驱动，创建连接      |
| Connection        | 表示与数据库的一次会话        |
| Statement         | 执行静态 SQL 语句             |
| PreparedStatement | 执行预编译 SQL，防止 SQL 注入 |
| ResultSet         | 查询结果集                    |
| DataSource        | 连接池的标准接口              |

### 连接池的作用

- 避免频繁创建和销毁连接的开销
- 控制最大连接数，防止数据库过载
- 提供连接健康检查和自动恢复机制

## 快速上手

### 基本 JDBC 操作

```java
// 使用 try-with-resources 自动关闭资源
try (Connection conn = dataSource.getConnection();
     PreparedStatement ps = conn.prepareStatement(
         "SELECT * FROM users WHERE id = ?")) {
    ps.setLong(1, userId);
    try (ResultSet rs = ps.executeQuery()) {
        if (rs.next()) {
            String name = rs.getString("name");
            int age = rs.getInt("age");
            System.out.println(name + ", " + age);
        }
    }
}
```

### HikariCP 连接池配置

```java
// 创建 HikariCP 连接池
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:postgresql://localhost:5432/mydb");
config.setUsername("postgres");
config.setPassword("secret");
config.setMaximumPoolSize(10);
config.setMinimumIdle(5);
config.setIdleTimeout(600000);       // 空闲连接超时（毫秒）
config.setMaxLifetime(1800000);      // 连接最大存活时间
config.setConnectionTimeout(30000);  // 获取连接超时
DataSource ds = new HikariDataSource(config);
```

## 详细用法

### CRUD 完整示例

```java
// 用户数据访问对象
public class UserDao {
    private final DataSource dataSource;

    public UserDao(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // 新增用户
    public long insert(User user) throws SQLException {
        String sql = "INSERT INTO users (name, email, age) VALUES (?, ?, ?)";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, user.getName());
            ps.setString(2, user.getEmail());
            ps.setInt(3, user.getAge());
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) return rs.getLong(1);
            }
        }
        throw new SQLException("插入用户失败");
    }

    // 查询用户
    public User findById(long id) throws SQLException {
        String sql = "SELECT id, name, email, age FROM users WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRow(rs);
            }
        }
        return null;
    }

    // 更新用户
    public boolean update(User user) throws SQLException {
        String sql = "UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, user.getName());
            ps.setString(2, user.getEmail());
            ps.setInt(3, user.getAge());
            ps.setLong(4, user.getId());
            return ps.executeUpdate() > 0;
        }
    }

    // 删除用户
    public boolean delete(long id) throws SQLException {
        String sql = "DELETE FROM users WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    private User mapRow(ResultSet rs) throws SQLException {
        return new User(rs.getLong("id"), rs.getString("name"),
            rs.getString("email"), rs.getInt("age"));
    }
}
```

### 批量操作

```java
// 使用批量插入提升性能
public void batchInsert(List<User> users) throws SQLException {
    String sql = "INSERT INTO users (name, email, age) VALUES (?, ?, ?)";
    try (Connection conn = dataSource.getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {
        conn.setAutoCommit(false); // 关闭自动提交
        for (int i = 0; i < users.size(); i++) {
            User u = users.get(i);
            ps.setString(1, u.getName());
            ps.setString(2, u.getEmail());
            ps.setInt(3, u.getAge());
            ps.addBatch(); // 添加到批处理
            if (i % 500 == 0) {
                ps.executeBatch(); // 每 500 条执行一次
            }
        }
        ps.executeBatch(); // 执行剩余的批处理
        conn.commit();     // 提交事务
    }
}
```

### 事务管理

```java
// 手动管理事务
public void transferMoney(long fromId, long toId, BigDecimal amount) throws SQLException {
    try (Connection conn = dataSource.getConnection()) {
        conn.setAutoCommit(false); // 开启手动事务
        try {
            // 扣减转出方余额
            try (PreparedStatement ps = conn.prepareStatement(
                    "UPDATE accounts SET balance = balance - ? WHERE id = ?")) {
                ps.setBigDecimal(1, amount);
                ps.setLong(2, fromId);
                ps.executeUpdate();
            }
            // 增加转入方余额
            try (PreparedStatement ps = conn.prepareStatement(
                    "UPDATE accounts SET balance = balance + ? WHERE id = ?")) {
                ps.setBigDecimal(1, amount);
                ps.setLong(2, toId);
                ps.executeUpdate();
            }
            conn.commit(); // 提交事务
        } catch (SQLException e) {
            conn.rollback(); // 回滚事务
            throw e;
        }
    }
}
```

## 常见场景

### Spring Data JPA 集成

```java
// 使用 Spring Data JPA 简化数据访问
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    private Integer age;
    // 省略 getter/setter
}

// 定义 Repository 接口，无需实现类
public interface UserRepository extends JpaRepository<User, Long> {
    // 方法名自动生成查询
    List<User> findByAgeGreaterThan(int age);

    // 自定义 JPQL 查询
    @Query("SELECT u FROM User u WHERE u.email LIKE %:domain")
    List<User> findByEmailDomain(@Param("domain") String domain);
}
```

### MyBatis 集成

```java
// 使用 MyBatis 进行数据访问
@Mapper
public interface UserMapper {
    @Select("SELECT * FROM users WHERE id = #{id}")
    User findById(@Param("id") Long id);

    @Insert("INSERT INTO users(name, email, age) VALUES(#{name}, #{email}, #{age})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(User user);

    @Update("UPDATE users SET name=#{name}, email=#{email} WHERE id=#{id}")
    void update(User user);

    @Delete("DELETE FROM users WHERE id = #{id}")
    void delete(@Param("id") Long id);
}
```

## 注意事项

- 始终使用 PreparedStatement 而非 Statement，防止 SQL 注入攻击
- 连接池大小不是越大越好，一般设置为 CPU 核心数的 2-4 倍加有效磁盘数
- 批量操作时关闭自动提交，手动控制事务边界
- ResultSet 和 Statement 必须及时关闭，推荐使用 try-with-resources
- 避免在循环中执行单条 SQL，应使用批量操作
- 长事务会占用连接资源，影响连接池的可用性

## 进阶用法

### Spring Boot 多数据源配置

```java
// 配置主数据源和从数据源
@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.primary")
    public DataSource primaryDataSource() {
        return DataSourceBuilder.create().type(HikariDataSource.class).build();
    }

    @Bean
    @ConfigurationProperties("spring.datasource.secondary")
    public DataSource secondaryDataSource() {
        return DataSourceBuilder.create().type(HikariDataSource.class).build();
    }

    @Bean
    @Primary
    public PlatformTransactionManager primaryTransactionManager(
            @Qualifier("primaryDataSource") DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
```

### R2DBC 响应式数据库访问

```java
// 使用 R2DBC 进行响应式数据库操作
public class ReactiveUserRepository {
    private final DatabaseClient client;

    public Mono<User> findById(Long id) {
        return client.sql("SELECT * FROM users WHERE id = :id")
            .bind("id", id)
            .map((row, meta) -> new User(
                row.get("id", Long.class),
                row.get("name", String.class),
                row.get("email", String.class)))
            .one();
    }

    public Flux<User> findAll() {
        return client.sql("SELECT * FROM users")
            .map((row, meta) -> new User(
                row.get("id", Long.class),
                row.get("name", String.class),
                row.get("email", String.class)))
            .all();
    }
}
```
