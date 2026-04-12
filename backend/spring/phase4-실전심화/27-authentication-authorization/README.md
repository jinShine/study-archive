# 27. 인증/인가 기초 — "너 누구야? 그래서 뭐 할 수 있는데?"

> **키워드**: `Spring Security` `SecurityFilterChain` `인증(Authentication)` `인가(Authorization)` `세션` `JWT` `CORS`

---

## 핵심만 한 문장

**"로그인" = 인증(너 누구야?) + 인가(뭐 할 수 있어?) 를 Spring Security가 처리해주는 것**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~5장 (인증/인가, Security, 비밀번호 암호화, 세션 vs JWT, 따라쳐보기) | 면접 단골 + 모든 프로젝트에 필수 |
| 🟡 이해 | 6장 (CORS) | 프론트엔드 연동 시 반드시 필요 |
| 🟢 참고 | 7장 (OAuth 개념) | 소셜 로그인 구현 시 필요 |

> 💡 **Phase 3과의 연결**: DB에 데이터를 저장/조회할 수 있게 됐다. 그런데 "아무나" 내 API를 호출하면? → 인증/인가가 필요하다!

---

## 1장. 인증과 인가: 뭐가 다른가? 🔴

### 비유: 회사 출입

```
1️⃣ 인증 (Authentication) = "너 누구야?"
   → 사원증 보여주기
   → "아, 김개발 사원이구나" 확인

2️⃣ 인가 (Authorization) = "너 뭐 할 수 있어?"
   → 사원증에 "3층 출입 가능" 적혀있음
   → "3층은 가도 되지만, 서버실은 안 돼"
```

### 코드로 보면

```java
// 1️⃣ 인증: "이 사람이 진짜 김개발인가?"
POST /api/login
{
    "email": "kim@example.com",
    "password": "1234"
}
// → DB에서 확인 → 맞으면 토큰 발급

// 2️⃣ 인가: "김개발이 이 API를 호출할 수 있는가?"
GET /api/admin/users    (관리자 전용)
Authorization: Bearer eyJhbGciOi...
// → 토큰 확인 → "김개발은 ADMIN이 아님" → 403 Forbidden
```

### 정리

| 구분 | 인증 (Authentication) | 인가 (Authorization) |
|------|----------------------|---------------------|
| 질문 | "너 누구야?" | "뭐 할 수 있어?" |
| 시점 | 로그인할 때 | API 호출할 때마다 |
| 실패 시 | 401 Unauthorized | 403 Forbidden |
| 예시 | 이메일+비밀번호 확인 | ADMIN만 접근 가능 |

---

## 2장. Spring Security란? 🔴

### 비유: 건물 보안 시스템

```
Spring Security = 건물 출입 관리 시스템

1. 정문에서 사원증 확인 (인증)
2. 각 층마다 출입 권한 확인 (인가)
3. 수상한 행동 감지 (보안)

이걸 Spring이 자동으로 해줌!
```

### Spring Security 없이 하면?

```java
// ❌ 직접 구현 (모든 Controller에서 반복)
@GetMapping("/api/admin/users")
public List<User> getUsers(HttpServletRequest request) {
    // 1. 토큰 꺼내기
    String token = request.getHeader("Authorization");
    
    // 2. 토큰 검증
    if (token == null || !tokenService.isValid(token)) {
        throw new UnauthorizedException("로그인 필요");  // 401
    }
    
    // 3. 권한 확인
    String role = tokenService.getRole(token);
    if (!"ADMIN".equals(role)) {
        throw new ForbiddenException("관리자만 가능");    // 403
    }
    
    // 4. 실제 로직
    return userService.getAll();
}

// 이 코드를 모든 API마다 반복해야 함... 😫
```

### Spring Security 쓰면?

```java
// ✅ Spring Security (설정 한 번이면 끝)
@GetMapping("/api/admin/users")
public List<User> getUsers() {
    return userService.getAll();  // 비즈니스 로직만!
}

// 인증/인가는 SecurityFilterChain이 자동으로 처리함
```

### SecurityFilterChain의 동작 흐름

```
요청: GET /api/admin/users
  ↓
Spring Security FilterChain 시작
  ↓
1️⃣ "/api/admin/**" 패턴 매칭 → hasRole("ADMIN") 필요
  ↓
2️⃣ 인증 정보 확인
  ├─ 토큰/세션 없음 → 401 Unauthorized ❌
  ├─ 토큰 있는데 ADMIN 아님 → 403 Forbidden ❌
  └─ 토큰 있고 ADMIN임 → Controller로 전달 ✅
  ↓
3️⃣ Controller 실행
  ↓
응답 반환
```

```
요청: POST /api/auth/login
  ↓
Spring Security FilterChain 시작
  ↓
1️⃣ "/api/auth/**" 패턴 매칭 → permitAll()
  ↓
2️⃣ 인증 없이 바로 Controller로 전달 ✅
  ↓
3️⃣ Controller 실행
  ↓
응답 반환
```

---

## 3장. 비밀번호 암호화: 왜 필요한가? 🔴

> 💡 5장에서 회원가입 코드를 만드는데, 거기서 `passwordEncoder`를 쓴다. 먼저 왜 필요한지 알고 가자!

### 암호화 안 하면?

```sql
-- ❌ 비밀번호 평문 저장
SELECT * FROM users;
-- id | email           | password | name
-- 1  | kim@example.com | 1234     | 김개발    ← 해커가 DB 탈취하면 비번 노출!
```

### 암호화 하면?

```sql
-- ✅ BCrypt 암호화
SELECT * FROM users;
-- id | email           | password                           | name
-- 1  | kim@example.com | $2a$10$xK9ZvG...  (60자 해시값)   | 김개발
-- 해커가 DB 탈취해도 원래 비밀번호를 알 수 없음!
```

### BCrypt의 특징

```java
PasswordEncoder encoder = new BCryptPasswordEncoder();

// 같은 비밀번호도 매번 다른 해시값!
encoder.encode("1234");  // → $2a$10$xK9ZvG...
encoder.encode("1234");  // → $2a$10$Abc123...  (다름!)

// 그런데 비교는 가능!
encoder.matches("1234", "$2a$10$xK9ZvG...");   // → true
encoder.matches("wrong", "$2a$10$xK9ZvG...");  // → false
```

**Spring Security에서:**

```java
// SecurityConfig에 Bean으로 등록하면 어디서든 주입해서 사용 가능
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

---

## 4장. 세션 vs JWT: 뭘 써야 하나? 🔴

### 비유

```
세션 (Session):
  → 놀이공원 손목밴드
  → 입장할 때 밴드 채워줌
  → 놀이기구 탈 때마다 밴드 확인
  → 밴드 정보는 놀이공원(서버)이 보관

JWT (JSON Web Token):
  → 신분증
  → 발급받으면 내가 들고 다님
  → 어디서든 신분증 보여주면 확인 가능
  → 서버가 정보를 보관하지 않음
```

### 세션 방식 (개념만)

```
[로그인]
클라이언트 → POST /login (email, password) → 서버
클라이언트 ← Set-Cookie: JSESSIONID=abc123 ← 서버 (세션 저장)

[API 호출]
클라이언트 → GET /api/logs (Cookie: JSESSIONID=abc123) → 서버
서버: "abc123 세션이 있나?" → 세션 저장소에서 확인 → "김개발이네!" → 응답
```

### JWT 방식 (우리가 쓸 것!)

```
[로그인]
클라이언트 → POST /login (email, password) → 서버
클라이언트 ← { "token": "eyJhbGciOi..." } ← 서버 (JWT 생성)

[API 호출]
클라이언트 → GET /api/logs (Authorization: Bearer eyJhbGciOi...) → 서버
서버: "이 토큰이 유효한가?" → 서명 검증 → "김개발이네!" → 응답
```

### 비교표

| 구분 | 세션 | JWT |
|------|------|-----|
| 저장 위치 | 서버 (메모리/Redis) | 클라이언트 (localStorage/Cookie) |
| 서버 부담 | 있음 (세션 저장) | 없음 (토큰만 검증) |
| 확장성 | 서버 늘리면 세션 공유 필요 | 서버 늘려도 상관없음 |
| 보안 | 서버에서 즉시 만료 가능 | 만료 전까지 무효화 어려움 |
| 사용처 | 전통적 웹 (SSR) | REST API, 모바일 앱 |
| **실무 추천** | 소규모/전통 웹 | **대부분의 프로젝트** ✅ |

**💡 결론: REST API 서버라면 JWT를 쓴다!** (28번에서 토큰 발급/검증 직접 구현함)

---

## 5장. 따라 쳐보기: 회원가입 + 로그인 API 만들기 🔴

### 전체 파일 구조

```
src/main/java/com/example/
├── config/
│   └── SecurityConfig.java      ← 보안 설정 (이 파일 하나로 끝!)
├── controller/
│   └── AuthController.java      ← 로그인/회원가입
├── entity/
│   └── User.java                ← 사용자 엔티티
└── repository/
    └── UserRepository.java      ← 사용자 조회
```

### Step 1. 의존성 추가

```gradle
// build.gradle의 dependencies에 추가
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-security'
}
```

### Step 2. User 엔티티

`src/main/java/com/example/entity/User.java`:

```java
package com.example.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;  // 기본값: 일반 사용자
    
    public User(String email, String password, String name) {
        this.email = email;
        this.password = password;
        this.name = name;
    }
    
    // 역할 종류
    public enum Role {
        USER,    // 일반 사용자
        ADMIN    // 관리자
    }
}
```

### Step 3. UserRepository

`src/main/java/com/example/repository/UserRepository.java`:

```java
package com.example.repository;

import com.example.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

### Step 4. SecurityConfig (최종 버전 — 이것만 복사하면 됨!)

`src/main/java/com/example/config/SecurityConfig.java`:

**⚠️ 이 파일이 프로젝트의 보안 설정 전부다. 이것 하나만 복사하면 됨!**

```java
package com.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 핵심: 보안 필터 체인
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. CSRF 비활성화 (REST API는 쿠키 안 쓰니까 필요 없음)
            .csrf(csrf -> csrf.disable())
            
            // 2. CORS 설정 (프론트엔드에서 호출할 수 있게)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 3. 세션 사용 안 함 (JWT 사용 준비)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // 4. URL별 권한 설정 (구체적인 것부터 위에!)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()       // 누구나 OK
                .requestMatchers("/api/admin/**").hasRole("ADMIN") // 관리자만
                .anyRequest().authenticated()                      // 나머지: 로그인 필수
            )
            
            // 5. 폼 로그인, Basic 인증 비활성화 (REST API니까)
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable());
        
        return http.build();
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 비밀번호 암호화 (3장에서 배운 BCrypt)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CORS 설정 (프론트엔드 허용)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

### Step 5. AuthController (회원가입 + 로그인)

`src/main/java/com/example/controller/AuthController.java`:

```java
package com.example.controller;

import com.example.entity.User;
import com.example.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 회원가입
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignupRequest req) {
        // 1. 이메일 중복 확인
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body("이미 가입된 이메일입니다");
        }
        
        // 2. 비밀번호 암호화 후 저장
        User user = new User(
            req.getEmail(),
            passwordEncoder.encode(req.getPassword()),  // ← BCrypt 암호화!
            req.getName()
        );
        userRepository.save(user);
        
        return ResponseEntity.ok("회원가입 성공");
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 로그인
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest req) {
        // 1. 이메일로 사용자 조회
        User user = userRepository.findByEmail(req.getEmail())
            .orElse(null);
        
        if (user == null) {
            return ResponseEntity.status(401).body("이메일 또는 비밀번호가 틀렸습니다");
        }
        
        // 2. 비밀번호 확인 (BCrypt 비교)
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("이메일 또는 비밀번호가 틀렸습니다");
        }
        
        // 3. 로그인 성공
        // ⚠️ 지금은 "성공"만 반환. 28번에서 여기에 JWT 토큰 발급을 추가함!
        return ResponseEntity.ok("로그인 성공 - email: " + user.getEmail() + ", role: " + user.getRole());
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 요청 DTO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    @Data
    static class SignupRequest {
        private String email;
        private String password;
        private String name;
    }
    
    @Data
    static class LoginRequest {
        private String email;
        private String password;
    }
}
```

### Step 6. 서버 실행 + 테스트

```bash
# 서버 실행
gradle bootRun
```

```bash
# 1️⃣ 회원가입
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"kim@example.com", "password":"1234", "name":"김개발"}'

# 응답: "회원가입 성공"
```

```bash
# 2️⃣ 로그인
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kim@example.com", "password":"1234"}'

# 응답: "로그인 성공 - email: kim@example.com, role: USER"
```

```bash
# 3️⃣ 틀린 비밀번호로 로그인
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"kim@example.com", "password":"wrong"}'

# 응답: 401 "이메일 또는 비밀번호가 틀렸습니다"
```

```bash
# 4️⃣ 인증 없이 일반 API 접근
curl http://localhost:8080/api/study-logs

# 응답: 401 Unauthorized (로그인 안 했으니까!)
```

### Step 7. DB 확인

```sql
SELECT * FROM users;

-- 결과:
-- id | email             | password                          | name   | role
-- 1  | kim@example.com   | $2a$10$xK9Zv...  (암호화됨!)    | 김개발 | USER
--
-- ✅ 비밀번호가 $2a$10$... 형태 = BCrypt 암호화 성공!
-- ✅ role이 USER = 기본값 적용됨!
```

---

## 6장. CORS: 프론트엔드 연동 시 필수 🟡

### 상황

```
프론트엔드: http://localhost:3000 (React)
백엔드:     http://localhost:8080 (Spring Boot)

프론트에서 백엔드 API를 호출하면?
→ ❌ CORS 에러! (브라우저가 차단)
```

### 왜 차단하나?

```
브라우저: "localhost:3000에서 localhost:8080으로 요청?
          포트가 다르니까 위험할 수 있어! 차단!"
```

### 해결

SecurityConfig에 이미 CORS 설정을 넣어뒀다 (Step 4 참고):

```java
// 허용할 출처 (프론트엔드 주소)
config.setAllowedOrigins(List.of("http://localhost:3000"));

// 허용할 HTTP 메서드
config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH"));
```

**설정 후:**

```
프론트엔드(3000) → GET /api/logs → 백엔드(8080)
                                     ↓
                        "localhost:3000은 허용된 출처야"
                                     ↓
                                응답 반환 ✅
```

**💡 배포할 때는 `setAllowedOrigins`에 실제 도메인을 추가해야 한다!**

---

## 7장. OAuth 개념 (소셜 로그인) 🟢

### 비유

```
일반 로그인:
  사용자 → "내 이메일/비번으로 로그인해줘" → 우리 서버

소셜 로그인 (OAuth):
  사용자 → "구글한테 물어봐, 나 진짜야" → 구글 → "맞아, 이 사람 진짜야" → 우리 서버
```

### OAuth 흐름 (간단 버전)

```
1️⃣ 사용자가 "구글로 로그인" 버튼 클릭
      ↓
2️⃣ 구글 로그인 페이지로 이동
      ↓
3️⃣ 사용자가 구글에서 로그인
      ↓
4️⃣ 구글이 "이 사람 맞아" + 사용자 정보 전달
      ↓
5️⃣ 우리 서버가 정보 받아서 회원 처리 + JWT 발급
```

**💡 이건 32번(외부 API 연동)에서 직접 구현한다. 지금은 개념만 알면 됨!**

---

## 8장. 자주 쓰는 권한 설정 패턴 🟡

### URL별 권한 메서드

```java
.authorizeHttpRequests(auth -> auth
    // 패턴이 구체적인 것부터 위에 써야 함!

    // ✅ 올바른 순서 (구체적 → 일반적)
    .requestMatchers("/api/auth/**").permitAll()        // 1순위
    .requestMatchers("/api/admin/**").hasRole("ADMIN")  // 2순위
    .anyRequest().authenticated()                       // 마지막 (나머지 전부)
    
    // ❌ 잘못된 순서
    // .anyRequest().authenticated()     // 이게 먼저 오면
    // .requestMatchers("/api/auth/**")  // 이건 절대 실행 안 됨!
)
```

| 메서드 | 의미 | 예시 |
|--------|------|------|
| `permitAll()` | 누구나 OK | 로그인, 회원가입 |
| `authenticated()` | 로그인한 사람만 | 일반 API |
| `hasRole("ADMIN")` | 특정 역할만 | 관리자 페이지 |
| `hasAnyRole("ADMIN", "MANAGER")` | 여러 역할 중 하나 | 관리 기능 |
| `denyAll()` | 아무도 안 됨 | 테스트용 |

---

## 면접 대비

### 🔴 필수

**Q: "인증과 인가의 차이는?"**

> 인증은 "너 누구야?"이고 인가는 "뭐 할 수 있어?"입니다. 인증은 로그인 시점에 이메일+비밀번호를 확인하는 것이고, 인가는 API 호출 시 해당 사용자의 역할(ADMIN, USER)에 따라 접근 가능 여부를 판단하는 것입니다. 인증 실패는 401, 인가 실패는 403입니다.

**Q: "Spring Security의 동작 원리를 설명해주세요"**

> HTTP 요청이 Controller에 도달하기 전에 SecurityFilterChain을 거칩니다. 이 필터 체인이 URL 패턴별로 설정된 권한을 확인하고, 인증/인가가 통과해야만 Controller에 요청을 전달합니다. 설정은 SecurityConfig에서 `authorizeHttpRequests()`로 하며, `permitAll()`, `authenticated()`, `hasRole()` 등으로 제어합니다.

**Q: "세션과 JWT의 차이는?"**

> 세션은 인증 정보를 서버에 저장하고 클라이언트에는 세션 ID만 쿠키로 줍니다. JWT는 인증 정보 자체를 토큰에 담아서 클라이언트가 보관합니다. 세션은 서버 메모리를 사용하므로 서버를 늘리면 세션 공유가 필요하지만, JWT는 서버가 상태를 보관하지 않아서(Stateless) 확장성이 좋습니다. REST API에서는 보통 JWT를 사용합니다.

**Q: "비밀번호를 왜 암호화하나요?"**

> DB가 해킹당했을 때 사용자 비밀번호가 평문으로 노출되지 않도록 하기 위해서입니다. BCrypt를 사용하면 같은 비밀번호도 매번 다른 해시값이 나오고, 해시값으로부터 원래 비밀번호를 알아낼 수 없습니다. Spring Security에서는 `PasswordEncoder` 인터페이스로 추상화되어 있고, `BCryptPasswordEncoder`가 가장 많이 쓰입니다.

### 🟡 개념

**Q: "CORS가 뭔가요?"**

> Cross-Origin Resource Sharing의 약자로, 브라우저가 다른 도메인(출처)의 API를 호출할 때 발생하는 보안 정책입니다. 예를 들어 localhost:3000(프론트)에서 localhost:8080(백엔드)으로 요청하면 브라우저가 차단합니다. Spring Security에서 `CorsConfigurationSource`를 설정해서 허용할 출처, 메서드, 헤더를 지정하면 해결됩니다.

**Q: "CSRF를 왜 비활성화하나요?"**

> CSRF(Cross-Site Request Forgery)는 쿠키 기반 인증에서 발생하는 공격입니다. REST API는 쿠키 대신 Authorization 헤더에 JWT를 담아서 보내므로 CSRF 공격에 노출되지 않습니다. 그래서 `csrf.disable()`을 해도 안전합니다.

---

## 정리: 이것만 기억하기

```
🎯 인증/인가 = Spring Security가 처리

파일 4개만 만들면 끝:
  1. User.java          (엔티티)
  2. UserRepository.java (DB 조회)
  3. SecurityConfig.java (보안 설정 — 핵심!)
  4. AuthController.java (회원가입/로그인)

SecurityConfig 핵심:
  ✅ csrf.disable()          → REST API니까
  ✅ STATELESS               → JWT 쓸 준비
  ✅ /api/auth/** permitAll  → 누구나
  ✅ /api/admin/** hasRole   → 관리자만
  ✅ anyRequest authenticated → 나머지 로그인 필수
  ✅ BCryptPasswordEncoder   → 비밀번호 암호화
  ✅ CORS 설정               → 프론트 연동
```

---

> 🎯 **다음 주제**: 28번 "JWT 인증 구현" — 지금은 로그인해도 "성공"만 반환한다. 28번에서 **JWT 토큰 발급 + 검증 필터**를 추가해서, 진짜로 인증이 작동하는 API를 만든다!

