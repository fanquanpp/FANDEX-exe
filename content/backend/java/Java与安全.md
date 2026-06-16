---
order: 78
title: Java与安全
module: java
category: Java
difficulty: intermediate
description: Java安全编程
author: fanquanpp
updated: '2026-06-14'
related:
  - java/Java性能调优
  - java/Java与AI
  - java/Java与WebAssembly
  - java/Java与响应式编程
prerequisites:
  - java/概述与开发环境
---

## 概述

Java 安全编程涵盖加密解密、身份认证、访问控制和安全编码规范等多个方面。Java 标准库提供了丰富的安全 API（JCA/JCE），配合 Spring Security 等框架，可以构建企业级安全系统。本文介绍 Java 安全编程的核心技术和最佳实践。

## 基础概念

### 安全核心术语

| 术语         | 说明                               |
| ------------ | ---------------------------------- |
| 对称加密     | 加密和解密使用同一密钥，如 AES     |
| 非对称加密   | 使用公钥加密、私钥解密，如 RSA     |
| 哈希         | 单向不可逆，用于数据完整性校验     |
| 数字签名     | 用私钥签名、公钥验证，确保来源可信 |
| 盐值（Salt） | 哈希前追加的随机值，防止彩虹表攻击 |

### Java 安全架构

- **JCA（Java Cryptography Architecture）**：提供加密、哈希、签名等基础 API
- **JCE（Java Cryptography Extension）**：扩展 JCA，支持 AES、RSA 等强加密算法
- **JSSE（Java Secure Socket Extension）**：提供 SSL/TLS 支持
- **JAAS（Java Authentication and Authorization Service）**：认证与授权框架

## 快速上手

### AES 对称加密

```java
// 生成 AES 密钥
KeyGenerator keyGen = KeyGenerator.getInstance("AES");
keyGen.init(256); // 使用 256 位密钥
SecretKey secretKey = keyGen.generateKey();

// AES-GCM 加密（推荐模式，自带认证）
Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
cipher.init(Cipher.ENCRYPT_MODE, secretKey);
byte[] encrypted = cipher.doFinal(plainText.getBytes());

// 获取初始化向量（解密时需要）
byte[] iv = cipher.getIV();
```

### 密码哈希

```java
// 使用 SHA-256 进行哈希
MessageDigest md = MessageDigest.getInstance("SHA-256");
byte[] hash = md.digest("password".getBytes(StandardCharsets.UTF_8));

// 转换为十六进制字符串
String hexHash = HexFormat.of().formatHex(hash);
System.out.println("SHA-256 哈希值: " + hexHash);
```

## 详细用法

### AES-GCM 完整加解密

```java
// 完整的 AES-GCM 加密与解密流程
public class AesGcmCrypto {
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int TAG_LENGTH = 128; // 认证标签长度（位）
    private static final int IV_LENGTH = 12;   // 初始化向量长度（字节）

    // 加密
    public static String encrypt(String plainText, SecretKey key) throws Exception {
        byte[] iv = new byte[IV_LENGTH];
        SecureRandom.getInstanceStrong().nextBytes(iv);

        Cipher cipher = Cipher.getInstance(ALGORITHM);
        GCMParameterSpec spec = new GCMParameterSpec(TAG_LENGTH, iv);
        cipher.init(Cipher.ENCRYPT_MODE, key, spec);
        byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

        // 将 IV 和密文拼接在一起
        ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
        byteBuffer.put(iv);
        byteBuffer.put(cipherText);
        return Base64.getEncoder().encodeToString(byteBuffer.array());
    }

    // 解密
    public static String decrypt(String encryptedText, SecretKey key) throws Exception {
        byte[] decoded = Base64.getDecoder().decode(encryptedText);
        ByteBuffer byteBuffer = ByteBuffer.wrap(decoded);

        byte[] iv = new byte[IV_LENGTH];
        byteBuffer.get(iv);
        byte[] cipherText = new byte[byteBuffer.remaining()];
        byteBuffer.get(cipherText);

        Cipher cipher = Cipher.getInstance(ALGORITHM);
        GCMParameterSpec spec = new GCMParameterSpec(TAG_LENGTH, iv);
        cipher.init(Cipher.DECRYPT_MODE, key, spec);
        byte[] plainText = cipher.doFinal(cipherText);
        return new String(plainText, StandardCharsets.UTF_8);
    }
}
```

### RSA 非对称加密

```java
// 生成 RSA 密钥对
KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
keyGen.initialize(2048);
KeyPair keyPair = keyGen.generateKeyPair();

// 用公钥加密
Cipher encryptCipher = Cipher.getInstance("RSA");
encryptCipher.init(Cipher.ENCRYPT_MODE, keyPair.getPublic());
byte[] encrypted = encryptCipher.doFinal("敏感数据".getBytes());

// 用私钥解密
Cipher decryptCipher = Cipher.getInstance("RSA");
decryptCipher.init(Cipher.DECRYPT_MODE, keyPair.getPrivate());
byte[] decrypted = decryptCipher.doFinal(encrypted);
System.out.println(new String(decrypted));
```

### 数字签名

```java
// 使用 RSA 私钥签名
Signature signature = Signature.getInstance("SHA256withRSA");
signature.initSign(keyPair.getPrivate());
signature.update("重要文件内容".getBytes());
byte[] digitalSignature = signature.sign();

// 使用 RSA 公钥验证签名
Signature verifySig = Signature.getInstance("SHA256withRSA");
verifySig.initVerify(keyPair.getPublic());
verifySig.update("重要文件内容".getBytes());
boolean isValid = verifySig.verify(digitalSignature);
System.out.println("签名验证结果: " + isValid);
```

## 常见场景

### BCrypt 密码存储

```java
// 使用 BCrypt 安全存储密码（推荐方式）
import org.mindrot.jbcrypt.BCrypt;

// 注册时：哈希密码
String hashedPassword = BCrypt.hashpw("userPassword123", BCrypt.gensalt(12));

// 登录时：验证密码
boolean isMatch = BCrypt.checkpw("userPassword123", hashedPassword);
System.out.println("密码匹配: " + isMatch);
```

### JWT Token 生成与验证

```java
// 使用 JJWT 库生成和验证 JWT
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

// 生成密钥
SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

// 生成 Token
String token = Jwts.builder()
    .setSubject("user123")
    .claim("role", "admin")
    .setIssuedAt(new Date())
    .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // 1小时过期
    .signWith(key)
    .compact();

// 验证并解析 Token
Claims claims = Jwts.parserBuilder()
    .setSigningKey(key)
    .build()
    .parseClaimsJws(token)
    .getBody();
String userId = claims.getSubject();
String role = claims.get("role", String.class);
```

## 注意事项

- 永远不要自己实现加密算法，使用标准库提供的实现
- AES 推荐使用 GCM 模式，避免使用 ECB 模式（ECB 不安全）
- 密码存储必须使用 BCrypt/Argon2 等慢哈希算法，不要使用 MD5/SHA
- RSA 加密有长度限制（密钥长度减去填充开销），大数据应使用 AES 加密后用 RSA 加密 AES 密钥
- 随机数生成应使用 SecureRandom，不要使用 Math.random()
- 生产环境中密钥应通过密钥管理系统（KMS）管理，不要硬编码在代码中

## 进阶用法

### SSL/TLS 配置

```java
// 配置 HTTPS 客户端，自定义信任策略
SSLContext sslContext = SSLContext.getInstance("TLS");
sslContext.init(null, new TrustManager[]{
    new X509TrustManager() {
        public void checkClientTrusted(X509Certificate[] chain, String authType) {}
        public void checkServerTrusted(X509Certificate[] chain, String authType) {
            // 生产环境应验证证书链
        }
        public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
    }
}, new SecureRandom());

HttpsURLConnection connection = (HttpsURLConnection) url.openConnection();
connection.setSSLSocketFactory(sslContext.getSocketFactory());
```

### Spring Security 基础配置

```java
// Spring Security 安全配置示例
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // REST API 可禁用 CSRF
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // 使用 BCrypt，强度因子 12
    }
}
```
