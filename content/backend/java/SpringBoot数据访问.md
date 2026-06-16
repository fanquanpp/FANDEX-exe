---
order: 64
title: SpringBoot数据访问
module: java
category: Java
difficulty: intermediate
description: JPA、MyBatis与数据访问
author: fanquanpp
updated: '2026-06-14'
related:
  - java/SpringBoot进阶
  - java/SpringBoot安全
  - java/Java设计模式
  - java/Java函数式编程
prerequisites:
  - java/概述与开发环境
---

## 概述

Spring Boot 提供了丰富的数据访问支持，包括 Spring Data JPA、MyBatis、JDBC Template 等。JPA 适合快速开发和领域驱动设计，MyBatis 适合对 SQL 有精细控制需求的场景。本文介绍两者的集成方式和最佳实践。

## 基础概念

### 数据访问方案对比

| 方案            | 特点                   | 适用场景           |
| --------------- | ---------------------- | ------------------ |
| Spring Data JPA | 面向对象，自动生成 SQL | 快速开发、简单查询 |
| MyBatis         | SQL 可控，灵活度高     | 复杂查询、性能优化 |
| JdbcTemplate    | 轻量级，直接写 SQL     | 简单场景、脚本操作 |
| R2DBC           | 响应式，非阻塞         | 高并发响应式应用   |

## 快速上手

### Spring Data JPA

```java
// 定义实体类
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    private Integer age;
    private LocalDateTime createdAt = LocalDateTime.now();
    // 省略 getter/setter
}

// 定义 Repository 接口，无需实现类
public interface UserRepository extends JpaRepository<User, Long> {
    // 方法名自动生成查询
    List<User> findByName(String name);
    List<User> findByAgeGreaterThan(int age);
    Optional<User> findByEmail(String email);
}
```

### MyBatis

```java
// 使用注解方式
@Mapper
public interface UserMapper {
    @Select("SELECT * FROM users WHERE id = #{id}")
    User findById(@Param("id") Long id);

    @Insert("INSERT INTO users(name, email, age) VALUES(#{name}, #{email}, #{age})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(User user);
}
```

## 详细用法

### JPA 自定义查询

```java
// 使用 @Query 自定义 JPQL 查询
public interface UserRepository extends JpaRepository<User, Long> {
    // JPQL 查询
    @Query("SELECT u FROM User u WHERE u.email LIKE %:domain")
    List<User> findByEmailDomain(@Param("domain") String domain);

    // 原生 SQL 查询
    @Query(value = "SELECT * FROM users WHERE created_at > :date",
           nativeQuery = true)
    List<User> findRecentUsers(@Param("date") LocalDateTime date);

    // 更新操作
    @Modifying
    @Query("UPDATE User u SET u.name = :name WHERE u.id = :id")
    int updateName(@Param("id") Long id, @Param("name") String name);

    // 分页查询
    Page<User> findByAgeGreaterThan(int age, Pageable pageable);
}

// 使用分页
Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
Page<User> page = userRepository.findByAgeGreaterThan(18, pageable);
List<User> users = page.getContent();
long total = page.getTotalElements();
```

### JPA 实体关联

```java
// 一对多关联
@Entity
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) // 懒加载，避免 N+1 问题
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    // 便捷方法：维护双向关联
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}

@Entity
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    private String productName;
    private BigDecimal price;
    private Integer quantity;
}
```

### MyBatis XML 映射

```xml
<!-- UserMapper.xml - 复杂查询使用 XML 映射 -->
<mapper namespace="com.example.mapper.UserMapper">
    <!-- 结果映射 -->
    <resultMap id="userWithOrders" type="User">
        <id property="id" column="user_id"/>
        <result property="name" column="user_name"/>
        <collection property="orders" ofType="Order">
            <id property="id" column="order_id"/>
            <result property="totalAmount" column="total_amount"/>
        </collection>
    </resultMap>

    <!-- 动态 SQL -->
    <select id="searchUsers" resultMap="userWithOrders">
        SELECT u.id as user_id, u.name as user_name,
               o.id as order_id, o.total_amount
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        <where>
            <if test="name != null">
                AND u.name LIKE CONCAT('%', #{name}, '%')
            </if>
            <if test="minAge != null">
                AND u.age >= #{minAge}
            </if>
            <if test="maxAge != null">
                AND u.age &lt;= #{maxAge}
            </if>
        </where>
        ORDER BY u.id
    </select>
</mapper>
```

## 常见场景

### JPA 审计功能

```java
// 自动填充创建时间和修改时间
@EntityListeners(AuditingEntityListener.class)
@Entity
public class BaseEntity {
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedBy
    private String lastModifiedBy;
}

// 配置审计
@Configuration
@EnableJpaAuditing
public class JpaConfig {
    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            // 从安全上下文获取当前用户
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            return Optional.ofNullable(auth != null ? auth.getName() : "system");
        };
    }
}
```

### 多数据源配置

```java
// 主数据源配置
@Configuration
@MapperScan(basePackages = "com.example.mapper.primary",
            sqlSessionFactoryRef = "primarySqlSessionFactory")
public class PrimaryDataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.primary")
    public DataSource primaryDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean
    @Primary
    public SqlSessionFactory primarySqlSessionFactory(
            @Qualifier("primaryDataSource") DataSource dataSource) throws Exception {
        SqlSessionFactoryBean bean = new SqlSessionFactoryBean();
        bean.setDataSource(dataSource);
        bean.setMapperLocations(new PathMatchingResourcePatternResolver()
            .getResources("classpath:mapper/primary/*.xml"));
        return bean.getObject();
    }
}
```

## 注意事项

- JPA 的 N+1 问题：使用 @EntityGraph 或 JOIN FETCH 解决懒加载导致的多次查询
- JPA 实体必须有默认构造方法（无参构造器）
- MyBatis 的 #{} 使用预编译参数，${} 直接拼接字符串，有 SQL 注入风险
- JPA 的 CascadeType.ALL 会级联所有操作，谨慎使用
- 大批量操作不要使用 JPA 的 saveAll，应使用原生 SQL 或批量插入
- 事务默认在 RuntimeException 时回滚，受检异常需要手动配置

## 进阶用法

### JPA Specification 动态查询

```java
// 使用 Specification 构建动态查询条件
public class UserSpecs {
    public static Specification<User> nameContains(String name) {
        return (root, query, cb) ->
            name == null ? null : cb.like(root.get("name"), "%" + name + "%");
    }

    public static Specification<User> ageBetween(int min, int max) {
        return (root, query, cb) ->
            cb.between(root.get("age"), min, max);
    }
}

// 组合查询条件
Specification<User> spec = Specification
    .where(UserSpecs.nameContains("张"))
    .and(UserSpecs.ageBetween(20, 40));
List<User> users = userRepository.findAll(spec);
```

### MyBatis-Plus 增强

```java
// 使用 MyBatis-Plus 简化开发
@Mapper
public interface UserMapper extends BaseMapper<User> {
    // 继承 BaseMapper，自动拥有 CRUD 方法
}

// Service 层使用 IService
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User>
        implements UserService {
    // 自动拥有 save、removeById、updateById、getById 等方法

    // Lambda 条件构造器
    public List<User> findActiveUsers(String name) {
        return lambdaQuery()
            .like(User::getName, name)
            .gt(User::getAge, 18)
            .eq(User::getStatus, 1)
            .orderByDesc(User::getCreatedAt)
            .list();
    }
}
```
