---
order: 86
title: Go与OAuth2
module: go
category: Go
difficulty: intermediate
description: OAuth2与JWT
author: fanquanpp
updated: '2026-06-14'
related:
  - go/Go与HTTP服务器
  - go/Go与HTTP客户端
  - go/Go与加密
  - go/Go与中间件
prerequisites:
  - go/概述与环境配置
---

## 概述

OAuth2 是一种授权框架，允许用户授权第三方应用访问其在其他服务上的资源，而无需分享密码。JWT（JSON Web Token）是一种轻量级的身份认证令牌格式。Go 的 `golang.org/x/oauth2` 包提供了 OAuth2 客户端实现，社区也有丰富的 JWT 库。

## 基础概念

在开始编码之前，需要理解 OAuth2 和 JWT 的几个核心概念：

- **授权码模式（Authorization Code）**：最安全的 OAuth2 流程，适合有后端的 Web 应用。用户在授权页面登录后，服务端用授权码换取令牌。
- **Access Token**：访问令牌，用于访问受保护的资源，有有效期。
- **Refresh Token**：刷新令牌，用于在 Access Token 过期后获取新的 Access Token。
- **JWT**：由三部分组成（Header.Payload.Signature），自包含用户信息，不需要查询数据库验证。
- **Scope**：权限范围，限制令牌可以访问的资源。

## 快速上手

### OAuth2 客户端

```bash
go get golang.org/x/oauth2
go get golang.org/x/oauth2/github
```

```go
package main

import (
    "fmt"
    "log"
    "net/http"

    "golang.org/x/oauth2"
    "golang.org/x/oauth2/github"
)

var githubOAuthConfig = &oauth2.Config{
    ClientID:     "your-client-id",
    ClientSecret: "your-client-secret",
    Scopes:       []string{"user:email"},
    Endpoint:     github.Endpoint,
    RedirectURL:  "http://localhost:8080/callback",
}

func main() {
    http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
        // 生成授权 URL，重定向用户到 GitHub 登录
        url := githubOAuthConfig.AuthCodeURL("random-state")
        http.Redirect(w, r, url, http.StatusTemporaryRedirect)
    })

    http.HandleFunc("/callback", func(w http.ResponseWriter, r *http.Request) {
        // 用授权码换取令牌
        code := r.URL.Query().Get("code")
        token, err := githubOAuthConfig.Exchange(r.Context(), code)
        if err != nil {
            http.Error(w, "获取令牌失败", http.StatusBadRequest)
            return
        }
        fmt.Fprintf(w, "Access Token: %s", token.AccessToken)
    })

    log.Println("服务器启动在 :8080")
    http.ListenAndServe(":8080", nil)
}
```

### JWT 令牌

```bash
go get github.com/golang-jwt/jwt/v5
```

```go
package main

import (
    "fmt"
    "time"
    "github.com/golang-jwt/jwt/v5"
)

var secretKey = []byte("your-secret-key")

// 生成 JWT
func GenerateToken(userID string) (string, error) {
    claims := jwt.MapClaims{
        "user_id": userID,
        "exp":     time.Now().Add(24 * time.Hour).Unix(), // 24小时过期
        "iat":     time.Now().Unix(),                      // 签发时间
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(secretKey)
}

// 验证 JWT
func ParseToken(tokenString string) (jwt.MapClaims, error) {
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return secretKey, nil
    })
    if err != nil {
        return nil, err
    }
    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        return claims, nil
    }
    return nil, fmt.Errorf("无效令牌")
}

func main() {
    // 生成
    token, _ := GenerateToken("user-123")
    fmt.Println("Token:", token)

    // 验证
    claims, err := ParseToken(token)
    if err != nil {
        fmt.Println("验证失败:", err)
        return
    }
    fmt.Println("用户ID:", claims["user_id"])
}
```

## 详细用法

### 1. OAuth2 多种授权模式

```go
// 客户端凭证模式（服务间调用）
config := &oauth2.Config{
    ClientID:     "client-id",
    ClientSecret: "client-secret",
    Endpoint: oauth2.Endpoint{
        TokenURL: "https://auth.example.com/token",
    },
}
token, err := config.PasswordCredentialsToken(ctx, "username", "password")

// 使用 Token 获取受保护资源
client := config.Client(ctx, token)
resp, _ := client.Get("https://api.example.com/userinfo")
```

### 2. JWT 中间件

```go
func JWTMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 从 Header 获取 Token
        authHeader := r.Header.Get("Authorization")
        if authHeader == "" {
            http.Error(w, "缺少认证信息", http.StatusUnauthorized)
            return
        }

        // 去掉 "Bearer " 前缀
        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        claims, err := ParseToken(tokenString)
        if err != nil {
            http.Error(w, "令牌无效", http.StatusUnauthorized)
            return
        }

        // 将用户信息存入 Context
        ctx := context.WithValue(r.Context(), "userID", claims["user_id"])
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

### 3. Token 刷新

```go
func RefreshToken(refreshToken string) (*oauth2.Token, error) {
    config := &oauth2.Config{ /* ... */ }
    token := &oauth2.Token{
        RefreshToken: refreshToken,
    }
    // 使用 refresh token 获取新的 access token
    newToken, err := config.TokenSource(context.Background(), token).Token()
    return newToken, err
}
```

### 4. 自定义 JWT Claims

```go
type CustomClaims struct {
    UserID string `json:"user_id"`
    Role   string `json:"role"`
    jwt.RegisteredClaims
}

func GenerateCustomToken(userID, role string) (string, error) {
    claims := CustomClaims{
        UserID: userID,
        Role:   role,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
            Issuer:    "my-app",
        },
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(secretKey)
}
```

## 常见场景

### 场景一：完整的登录流程

```go
// 登录接口：验证密码后返回 JWT
func LoginHandler(w http.ResponseWriter, r *http.Request) {
    var req struct {
        Username string `json:"username"`
        Password string `json:"password"`
    }
    json.NewDecoder(r.Body).Decode(&req)

    // 验证用户名密码
    user, err := authService.Authenticate(req.Username, req.Password)
    if err != nil {
        http.Error(w, "用户名或密码错误", http.StatusUnauthorized)
        return
    }

    // 生成 JWT
    token, _ := GenerateToken(user.ID)
    json.NewEncoder(w).Encode(map[string]string{
        "token": token,
    })
}

// 受保护接口
func ProfileHandler(w http.ResponseWriter, r *http.Request) {
    userID := r.Context().Value("userID").(string)
    // 查询用户信息
    user := userService.GetByID(userID)
    json.NewEncoder(w).Encode(user)
}
```

### 场景二：第三方登录

```go
// Google OAuth2
var googleConfig = &oauth2.Config{
    ClientID:     "google-client-id",
    ClientSecret: "google-client-secret",
    Scopes:       []string{"openid", "email", "profile"},
    Endpoint:     google.Endpoint,
    RedirectURL:  "http://localhost:8080/auth/google/callback",
}
```

## 注意事项与常见错误

1. **State 参数**：OAuth2 授权码模式必须使用 state 参数防止 CSRF 攻击。生成随机值，回调时验证。

2. **JWT 密钥安全**：密钥不应硬编码在代码中。使用环境变量或密钥管理服务。

3. **HTTPS**：OAuth2 和 JWT 传输必须使用 HTTPS，否则令牌可能被窃取。

4. **Token 过期时间**：Access Token 过期时间不宜太长（建议 15-30 分钟），Refresh Token 可以更长。

5. **JWT 不加密**：JWT 只是签名，不是加密。不要在 JWT 中存储敏感信息。

6. **算法选择**：使用 HS256（对称）或 RS256（非对称）。不要使用 `none` 算法。

## 进阶用法

### RS256 非对称签名

```go
import "crypto/rsa"

// 用私钥签名
token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
tokenString, _ := token.SignedString(privateKey)

// 用公钥验证
token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
    return publicKey, nil
})
```

### OAuth2 服务器

使用 `github.com/go-oauth2/oauth2` 搭建自己的 OAuth2 服务器。
