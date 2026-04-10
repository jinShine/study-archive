# 02. Resources 폴더 구조와 설정 파일 — "코드 말고 나머지 전부"

> **키워드**: `resources` `static` `templates` `application.yml` `Profile` `@Value` `@ConfigurationProperties`

---

## 핵심만 한 문장

**`src/main/java`에는 코드, `src/main/resources`에는 "코드가 아닌 모든 것"(설정, 정적 파일)이 들어간다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~3장 (폴더 구조, application.yml, Profile) | 매일 쓰는 설정 |
| 🟡 이해 | 4장 (@Value vs @ConfigurationProperties) | 설정값 읽기 |
| 🟢 참고 | 5장 (설정 우선순위, Jasypt) | 운영/배포 시 필요 |

---

## 1장. 프로젝트 폴더 구조 🔴

### 비유

```
Spring Boot 프로젝트 = 레스토랑

src/main/java/       ← 주방 (요리하는 코드)
src/main/resources/  ← 창고 (재료, 레시피, 메뉴판)
src/test/            ← 검수실 (테스트)
build.gradle         ← 식자재 주문서 (의존성)
```

### 실제 구조

```
my-project/
├── src/
│   ├── main/
│   │   ├── java/                  ← Java 코드 (Controller, Service, Entity)
│   │   │   └── com/example/demo/
│   │   │       └── DemoApplication.java
│   │   │
│   │   └── resources/             ← ★ 코드가 아닌 모든 것
│   │       ├── static/            ← CSS, JS, 이미지 (브라우저에서 직접 접근)
│   │       ├── templates/         ← HTML 템플릿 (Thymeleaf 등)
│   │       ├── application.yml    ← ★ 설정 파일 (가장 중요!)
│   │       └── application-dev.yml ← 개발 환경 전용 설정
│   │
│   └── test/                      ← 테스트 코드
│
├── build.gradle                   ← 의존성 관리
└── settings.gradle
```

### resources 폴더별 역할

| 폴더/파일 | 역할 | REST API에서 쓰나? |
|----------|------|-------------------|
| `static/` | CSS, JS, 이미지 | ❌ 거의 안 씀 |
| `templates/` | 서버 사이드 HTML | ❌ 거의 안 씀 |
| `application.yml` | **설정 파일** | **✅ 매일 씀!** |
| `application-{env}.yml` | 환경별 설정 | ✅ 배포할 때 필수 |

**💡 REST API 개발자가 가장 많이 건드리는 건 `application.yml`이다!**

---

## 2장. application.yml — 설정의 모든 것 🔴

### 비유

```
application.yml = 레스토랑 설정표

- 영업시간: 8080 (포트)
- 식자재 창고 주소: localhost:3306 (DB)
- 로그 레벨: DEBUG (로그)
- 영업 모드: dev (프로파일)
```

### yml vs properties — 같은 내용, 다른 문법

```yaml
# ✅ application.yml (요즘 주류)
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: 1234
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

logging:
  level:
    root: info
```

```properties
# application.properties (예전 방식)
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=root
spring.datasource.password=1234
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
logging.level.root=info
```

| 비교 | .yml | .properties |
|------|------|-------------|
| 가독성 | ✅ 계층 구조로 깔끔 | 키가 반복됨 |
| 주의점 | 들여쓰기 실수 | 없음 |
| 요즘 추세 | **✅ 주류** | 레거시 프로젝트 |

### yml 3대 규칙 (실수 방지)

```yaml
# ✅ 올바른 예
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb

# ❌ 탭 사용 → 에러!
spring:
	datasource:     # ← 탭(Tab) 쓰면 안 됨! 스페이스만!

# ❌ 콜론 뒤 스페이스 누락 → 에러!
spring:
  datasource:
    url:jdbc:mysql://...  # ← 콜론 뒤에 스페이스 필수!
```

**규칙:**

1. 들여쓰기: **스페이스만** (2칸). **탭 절대 금지!**
2. `key: value` → **콜론 뒤 스페이스 1칸 필수**
3. 대소문자 구분함

### 따라 쳐보기: 내 프로젝트 설정

`src/main/resources/application.yml` 파일을 열고:

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: 1234
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true

logging:
  level:
    root: info
    com.example: debug
```

```bash
# 서버 실행
gradle bootRun

# 콘솔에서 확인:
# Tomcat started on port 8080
# ← 포트 설정 적용됨!
```

---

## 3장. Profile — 환경별 설정 분리 🔴

### 비유

```
Profile = 레스토랑의 영업 모드

개발 모드 (dev):  집에서 연습 → 싼 재료, 자세한 기록
운영 모드 (prod): 실제 영업 → 고급 재료, 최소 기록
```

### 왜 필요한가?

```
개발할 때:  localhost DB, DEBUG 로그
운영할 때:  AWS DB, WARN 로그

→ 코드를 바꾸지 않고 "설정만 전환"하고 싶다!
```

### 파일 분리 방식

```yaml
# application.yml — 공통 설정
server:
  port: 8080

spring:
  profiles:
    active: dev    # ← 기본 프로파일
```

```yaml
# application-dev.yml — 개발 환경
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver

logging:
  level:
    root: DEBUG
```

```yaml
# application-prod.yml — 운영 환경
spring:
  datasource:
    url: jdbc:mysql://prod-server:3306/mydb
    username: admin
    password: ${DB_PASSWORD}    # 환경변수에서 읽음

logging:
  level:
    root: WARN
```

### 프로파일 전환 방법

```bash
# 1️⃣ application.yml에서 (개발 시)
spring.profiles.active=dev

# 2️⃣ 실행 시 인자로 (운영 배포 시)
java -jar app.jar --spring.profiles.active=prod

# 3️⃣ 환경변수로 (Docker, CI/CD)
export SPRING_PROFILES_ACTIVE=prod
```

### 동작 흐름

```
gradle bootRun
  ↓
Spring Boot: "application.yml 읽자"
  ↓
spring.profiles.active=dev 확인
  ↓
"application-dev.yml도 읽자"
  ↓
dev 설정이 공통 설정을 덮어씀
  ↓
DB: H2 인메모리, 로그: DEBUG
```

---

## 4장. 설정값 읽기: @Value vs @ConfigurationProperties 🟡

### @Value — 간단한 설정 읽기

```yaml
# application.yml
app:
  name: 내 멋진 서비스
  version: 1.0.0
```

```java
@Component
public class AppInfo {
    
    @Value("${app.name}")
    private String appName;
    
    @Value("${app.version}")
    private String version;
    
    // 기본값 지정 (설정이 없으면 이 값 사용)
    @Value("${app.max-size:10485760}")
    private long maxSize;
}
```

### @ConfigurationProperties — 설정이 많을 때

```yaml
# application.yml
app:
  name: 내 멋진 서비스
  version: 1.0.0
  upload:
    path: /uploads
    max-size: 10485760
    allowed-types:
      - image/png
      - image/jpeg
```

```java
@Getter
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    
    private String name;
    private String version;
    private Upload upload = new Upload();
    
    @Getter
    @Setter
    public static class Upload {
        private String path;
        private long maxSize;
        private List<String> allowedTypes;
    }
}
```

```java
// 사용하는 쪽
@Service
@RequiredArgsConstructor
public class FileService {
    
    private final AppProperties appProperties;
    
    public void upload(MultipartFile file) {
        String path = appProperties.getUpload().getPath();     // "/uploads"
        long maxSize = appProperties.getUpload().getMaxSize();  // 10485760
    }
}
```

### 비교

| 상황 | 추천 |
|------|------|
| 설정 1~2개 간단히 읽기 | `@Value` |
| 설정이 많고 그룹으로 묶기 | `@ConfigurationProperties` |
| 타입 안전 + 검증 필요 | `@ConfigurationProperties` |

---

## 5장. 설정 우선순위 & 민감 정보 🟢

### 설정 우선순위

```
같은 설정이 여러 곳에 있으면, 위에 있는 게 이긴다:

1순위: 커맨드라인 인자      --server.port=9090
2순위: 환경 변수            SERVER_PORT=9090
3순위: application-{profile}.yml
4순위: application.yml
```

### 민감 정보 관리

```yaml
# ❌ 비밀번호를 yml에 직접 쓰면 Git에 올라간다!
spring:
  datasource:
    password: mySecret123

# ✅ 환경변수 사용
spring:
  datasource:
    password: ${DB_PASSWORD}
```

```bash
# 실행 시 환경변수 전달
export DB_PASSWORD=mySecret123
java -jar app.jar
```

---

## 면접 대비

### 🔴 필수

**Q: "application.yml과 application.properties의 차이는?"**

> 기능은 동일하고 문법만 다릅니다. properties는 key=value 형식이고, yml은 들여쓰기 기반 계층 구조입니다. yml이 가독성이 좋아서 요즘 신규 프로젝트에서 주로 사용합니다. 두 파일이 동시에 존재하면 properties가 우선 적용됩니다.

**Q: "Profile이 뭔가요?"**

> 환경별로 다른 설정을 적용하는 기능입니다. application-dev.yml, application-prod.yml처럼 환경별 파일을 만들고, `spring.profiles.active`로 어떤 환경을 사용할지 지정합니다. 코드 변경 없이 설정만 전환할 수 있습니다.

### 🟡 개념

**Q: "@Value와 @ConfigurationProperties의 차이는?"**

> `@Value`는 필드마다 `@Value("${key}")`를 붙여서 설정값을 읽는 방식이고, `@ConfigurationProperties`는 prefix를 지정해서 설정을 자바 객체에 자동 매핑하는 방식입니다. 설정이 많을 때는 `@ConfigurationProperties`가 타입 안전하고 관리하기 편합니다.

---

## 정리: 이것만 기억하기

```
🎯 resources 폴더 = "코드가 아닌 모든 것"

가장 중요한 파일:
  ✅ application.yml — 서버 포트, DB, 로그 등 모든 설정
  ✅ application-dev.yml — 개발 환경 설정
  ✅ application-prod.yml — 운영 환경 설정

yml 3대 규칙:
  1. 스페이스만 (탭 금지!)
  2. 콜론 뒤 스페이스 필수
  3. 대소문자 구분

프로파일 전환:
  개발: spring.profiles.active=dev
  운영: java -jar app.jar --spring.profiles.active=prod
```

---

> 🎯 **다음 주제**: 03번 "첫 번째 REST API 만들기" — 실제로 API를 만들어서 Postman으로 테스트한다!

