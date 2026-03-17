# Phase 1~2 복습 프로젝트: 학습 일지 API

> **목표:** Phase 1~2에서 배운 16개 주제를 **하나의 프로젝트**에 전부 적용하며 체화한다

---

## 프로젝트 소개

**학습 일지 API** — 매일 공부한 내용을 기록하고, 카테고리별로 조회하며, 첨부파일도 관리하는 REST API

### 왜 이 프로젝트인가?

| Phase 1~2 주제 | 프로젝트에서 적용하는 부분 |
|---|---|
| 01. Spring Boot 기초 | 프로젝트 생성, 자동 설정 |
| 02. Resources & 설정 | application.yml 프로필 분리 |
| 03. 로깅 | Logback 설정, 로그 레벨 |
| 04. IoC/DI | @Component, @Service, 생성자 주입 |
| 05. AOP | 실행 시간 측정, API 로깅 |
| 06. 예외 처리 | @RestControllerAdvice, 커스텀 예외 |
| 07. HTTP & REST | REST 설계 원칙, HTTP Method/Status |
| 08. Spring MVC | @RestController, 요청/응답 흐름 |
| 09. Layered Architecture | Controller → Service → Repository 계층 |
| 10. Lombok | @Getter, @Builder, @RequiredArgsConstructor |
| 11. DTO & Validation | @Valid, @NotBlank, 요청/응답 분리 |
| 12. MapStruct | Entity ↔ DTO 자동 변환 |
| 13. ResponseEntity | ApiResponse<T> 공통 응답 |
| 14. 파일 업로드/다운로드 | MultipartFile, Resource |
| 15. API 문서화 | SpringDoc, Swagger UI |
| 16. 디버깅 | Breakpoint 활용 (가이드) |

### 최종 패키지 구조

```
com.example.studydiary
├── StudyDiaryApplication.java
│
├── domain/
│   └── studylog/
│       ├── controller/
│       │   └── StudyLogController.java
│       ├── service/
│       │   └── StudyLogService.java
│       ├── repository/
│       │   └── StudyLogRepository.java       ← HashMap 기반 (JPA는 Phase 3)
│       ├── entity/
│       │   ├── StudyLog.java
│       │   └── Category.java (enum)
│       ├── dto/
│       │   ├── StudyLogCreateRequest.java
│       │   ├── StudyLogUpdateRequest.java
│       │   └── StudyLogResponse.java
│       └── mapper/
│           └── StudyLogMapper.java
│
├── global/
│   ├── common/
│   │   └── ApiResponse.java
│   ├── config/
│   │   └── SwaggerConfig.java
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   ├── BusinessException.java
│   │   └── ErrorCode.java
│   ├── aop/
│   │   └── LoggingAspect.java
│   └── file/
│       ├── FileController.java
│       ├── FileService.java
│       └── FileEntity.java
│
└── resources/
    ├── application.yml
    ├── application-dev.yml
    ├── application-prod.yml
    └── logback-spring.xml
```

> ⚠️ **JPA 없이 HashMap으로 Repository를 구현한다.** DB는 Phase 3에서 배우니까, 지금은 비즈니스 로직과 계층 구조에 집중!

---

## Step 1. 프로젝트 생성

> 📖 **복습 주제: [01. Servlet, Spring, Spring Boot](../phase1-기초체력/01-servlet-spring-springboot/) 참고!**

### Spring Initializr로 프로젝트 생성

```
https://start.spring.io 접속

설정:
- Project: Gradle - Groovy
- Language: Java
- Spring Boot: 3.4.x (안정 버전)
- Group: com.example
- Artifact: study-diary
- Java: 17

Dependencies:
- Spring Web
- Validation
- Lombok
```

### 리마인드: Spring Boot가 해주는 것

```
✅ Tomcat 서버 내장         → 별도 서버 설치 불필요
✅ 자동 설정 (Auto Config)  → @EnableAutoConfiguration
✅ 의존성 관리              → spring-boot-starter-* 로 한 번에
✅ 실행 가능한 JAR          → java -jar study-diary.jar
```

```java
// 이 한 줄이 모든 것을 시작한다
@SpringBootApplication  // = @Configuration + @EnableAutoConfiguration + @ComponentScan
public class StudyDiaryApplication {
    public static void main(String[] args) {
        SpringApplication.run(StudyDiaryApplication.class, args);
    }
}
```

> **@SpringBootApplication 하나면** 컴포넌트 스캔, 자동 설정, 설정 클래스 등록이 모두 완료된다

### Spring Initializr에서 선택할 Dependencies

```
✅ Spring Web       → REST API 개발 (07, 08번)
✅ Validation       → @Valid, @NotBlank 등 (11번)
✅ Lombok           → @Getter, @Builder 등 (10번)
✅ Spring Boot DevTools → 코드 수정 시 자동 재시작 (선택)
```

> 위 4개는 Spring Initializr에서 바로 선택 가능!

### 프로젝트 생성 후 직접 추가할 의존성 (build.gradle)

> MapStruct, SpringDoc은 **서드파티 라이브러리**라서 Spring Initializr에 없다. 프로젝트 생성 후 build.gradle에 직접 추가!

```groovy
dependencies {
    // ── Spring Initializr에서 이미 추가된 것들 ──
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    developmentOnly 'org.springframework.boot:spring-boot-devtools'

    // ── 여기부터 직접 추가 (서드파티) ──

    // MapStruct (12번 주제) — Entity ↔ DTO 자동 변환
    implementation 'org.mapstruct:mapstruct:1.6.3'
    annotationProcessor 'org.mapstruct:mapstruct-processor:1.6.3'

    // SpringDoc Swagger (15번 주제) — API 문서 자동 생성
    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.6'

    // Lombok + MapStruct 함께 쓸 때 필수 (바인딩)
    annotationProcessor 'org.projectlombok:lombok-mapstruct-binding:0.2.0'
}
```

> 📖 **Lombok + MapStruct 순서 중요!** [12-mapstruct](../phase2-API개발/12-mapstruct/) 참고!

---

## Step 2. 설정 파일 구성

> 📖 **복습 주제: [02. Resources 폴더 구조](../phase1-기초체력/02-resources/) 참고!**

### 리마인드: application.yml이 하는 일

```
application.yml = Spring Boot의 모든 설정을 관리하는 중앙 설정 파일

서버 포트, 로그 레벨, 파일 업로드 크기, Swagger 설정 등
→ 코드를 수정하지 않고 설정만으로 동작을 바꿀 수 있다
```

### application.yml (공통)

```yaml
# 공통 설정
spring:
  application:
    name: study-diary

  # 프로필 설정 — 기본은 dev
  profiles:
    active: dev

  # 파일 업로드 설정 (14번 주제)
  servlet:
    multipart:
      enabled: true
      max-file-size: 10MB
      max-request-size: 50MB

  # 날짜 포맷 (JSON 응답에서 LocalDateTime 형식)
  jackson:
    serialization:
      write-dates-as-timestamps: false

# Swagger 설정 (15번 주제)
springdoc:
  swagger-ui:
    path: /swagger-ui.html
    tags-sorter: alpha
    operations-sorter: method
    display-request-duration: true
  api-docs:
    path: /v3/api-docs
  packages-to-scan: com.example.studydiary
```

### application-dev.yml (개발 환경)

```yaml
server:
  port: 8080

logging:
  level:
    root: INFO
    com.example.studydiary: DEBUG    # 우리 코드는 DEBUG 레벨

# 파일 저장 경로
file:
  upload-dir: ./uploads-dev
```

### application-prod.yml (운영 환경)

```yaml
server:
  port: 80

logging:
  level:
    root: WARN
    com.example.studydiary: INFO

# 운영에서는 Swagger 비활성화 (15번 주제)
springdoc:
  api-docs:
    enabled: false
  swagger-ui:
    enabled: false

file:
  upload-dir: /var/app/uploads
```

### 리마인드: 프로필 분리 이유

```
application.yml      → 공통 설정
application-dev.yml  → 개발용 (DEBUG 로그, 8080 포트)
application-prod.yml → 운영용 (WARN 로그, Swagger 비활성화)

실행 시: java -jar study-diary.jar --spring.profiles.active=prod
```

> 📖 **운영에서 Swagger를 끄는 이유는 보안!** [15-api-docs](../phase2-API개발/15-api-docs/) 참고!

---

## Step 3. 로깅 설정

> 📖 **복습 주제: [03. 첫 번째 REST API 만들기](../phase1-기초체력/03-first-rest-api/) 참고!**

### logback-spring.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>

    <!-- 콘솔 출력 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 파일 출력 (일별 롤링) -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>logs/study-diary.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>logs/study-diary.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- 개발 환경: DEBUG + 콘솔 -->
    <springProfile name="dev">
        <root level="INFO">
            <appender-ref ref="CONSOLE" />
        </root>
        <logger name="com.example.studydiary" level="DEBUG" />
    </springProfile>

    <!-- 운영 환경: INFO + 파일 -->
    <springProfile name="prod">
        <root level="WARN">
            <appender-ref ref="FILE" />
        </root>
        <logger name="com.example.studydiary" level="INFO" />
    </springProfile>

</configuration>
```

### 리마인드: 로그 레벨

```
TRACE → DEBUG → INFO → WARN → ERROR

개발: DEBUG 이상 출력 (세부 흐름 추적)
운영: INFO 이상 출력 (필요한 정보만)
```

### 리마인드: System.out.println vs 로깅

```
❌ System.out.println("디버그: " + value);   → 레벨 제어 불가, 파일 저장 불가
✅ log.debug("디버그: {}", value);            → 레벨 제어 가능, 파일 저장 가능
```

> 이후 코드에서 `@Slf4j` (Lombok)으로 로거를 사용한다

---

## Step 4. Entity와 IoC/DI 설계

> 📖 **복습 주제: [04. IoC와 DI](../phase1-기초체력/04-ioc-and-di/) 참고!**

### Category enum

```java
package com.example.studydiary.domain.studylog.entity;

public enum Category {
    JAVA("Java"),
    SPRING("Spring"),
    JPA("JPA"),
    DATABASE("Database"),
    NETWORK("Network"),
    CS("CS"),
    ETC("기타");

    private final String displayName;

    Category(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
```

### StudyLog Entity

```java
package com.example.studydiary.domain.studylog.entity;

import lombok.Builder;       // ← 10번 Lombok
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 📖 10-lombok 참고!
 *
 * @Getter — 모든 필드의 getter 자동 생성
 * @Builder — 빌더 패턴으로 객체 생성 (new 대신 .builder().build())
 *
 * ⚠️ @Setter는 안 쓴다! Entity의 값을 함부로 바꾸면 안 되니까
 *    → 값 변경이 필요하면 update() 같은 명시적 메서드를 만든다
 */
@Getter
@Builder
public class StudyLog {

    private Long id;
    private String title;          // 학습 주제
    private String content;        // 학습 내용
    private Category category;     // 카테고리
    private int studyMinutes;      // 학습 시간 (분)
    private LocalDate studyDate;   // 학습 날짜
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 📖 05-예측 가능한 코드 참고 (React에서도 배웠던 불변 원칙!)
     *
     * @Setter 대신 명시적 update 메서드
     * → "어디서 값이 바뀌었지?" 추적이 쉬워진다
     */
    public void update(String title, String content, Category category,
                       int studyMinutes, LocalDate studyDate) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.studyMinutes = studyMinutes;
        this.studyDate = studyDate;
        this.updatedAt = LocalDateTime.now();
    }
}
```

### StudyLogRepository (HashMap 기반)

```java
package com.example.studydiary.domain.studylog.repository;

import com.example.studydiary.domain.studylog.entity.Category;
import com.example.studydiary.domain.studylog.entity.StudyLog;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 📖 04-ioc-di, 09-layered-architecture-dao 참고!
 *
 * @Repository — Spring이 이 클래스를 Bean으로 등록한다
 *   = Spring IoC 컨테이너가 관리하는 객체가 된다
 *   = 다른 곳에서 생성자 주입으로 사용할 수 있다
 *
 * JPA 없이 HashMap으로 Repository 구현 (Phase 3에서 JPA로 교체 예정)
 * ConcurrentHashMap → 멀티스레드 환경에서 안전
 * AtomicLong → ID 자동 증가 (DB의 AUTO_INCREMENT 역할)
 */
@Repository
public class StudyLogRepository {

    private final Map<Long, StudyLog> store = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(1);

    public StudyLog save(StudyLog studyLog) {
        if (studyLog.getId() == null) {
            // 새로 저장 — ID 부여
            StudyLog saved = StudyLog.builder()
                    .id(sequence.getAndIncrement())
                    .title(studyLog.getTitle())
                    .content(studyLog.getContent())
                    .category(studyLog.getCategory())
                    .studyMinutes(studyLog.getStudyMinutes())
                    .studyDate(studyLog.getStudyDate())
                    .createdAt(studyLog.getCreatedAt())
                    .updatedAt(studyLog.getUpdatedAt())
                    .build();
            store.put(saved.getId(), saved);
            return saved;
        }
        // 기존 것 업데이트
        store.put(studyLog.getId(), studyLog);
        return studyLog;
    }

    public Optional<StudyLog> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    public List<StudyLog> findAll() {
        return new ArrayList<>(store.values());
    }

    public List<StudyLog> findByCategory(Category category) {
        return store.values().stream()
                .filter(log -> log.getCategory() == category)
                .toList();
    }

    public void deleteById(Long id) {
        store.remove(id);
    }

    public boolean existsById(Long id) {
        return store.containsKey(id);
    }
}
```

### 리마인드: IoC/DI 핵심

```
IoC (제어의 역전)
  → 객체 생성을 내가 하는 게 아니라 Spring이 해준다
  → new StudyLogRepository() ❌
  → @Repository 붙이면 Spring이 알아서 생성 ✅

DI (의존성 주입)
  → Spring이 만든 객체를 필요한 곳에 넣어준다
  → 생성자 주입이 가장 권장됨 (final + @RequiredArgsConstructor)
```

```java
// ❌ 직접 생성 — 강한 결합
public class StudyLogService {
    private StudyLogRepository repo = new StudyLogRepository();
}

// ✅ DI — 느슨한 결합, 테스트 용이
@RequiredArgsConstructor  // Lombok이 생성자 자동 생성
public class StudyLogService {
    private final StudyLogRepository repo;  // Spring이 주입해줌
}
```

---

## Step 5. AOP — 횡단 관심사 분리

> 📖 **복습 주제: [05. AOP 실전](../phase1-기초체력/05-aop/) 참고!**

### LoggingAspect — API 실행 로깅 & 시간 측정

```java
package com.example.studydiary.global.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

/**
 * 📖 05-aop 참고!
 *
 * @Aspect — 이 클래스가 AOP 관심사를 담당한다고 선언
 * @Component — Spring Bean으로 등록 (AOP가 동작하려면 Bean이어야 함)
 *
 * AOP = 핵심 로직(CRUD)과 부가 로직(로깅, 시간 측정)을 분리
 * → Controller/Service에 log.info()를 하나하나 넣지 않아도 된다!
 */
@Aspect
@Component
@Slf4j
public class LoggingAspect {

    /**
     * @Around — 메서드 실행 전/후를 모두 감싼다
     *
     * 포인트컷 해석:
     * execution(* com.example.studydiary.domain..controller..*(..))
     *   → domain 패키지 하위의 모든 controller 패키지의 모든 메서드
     *
     * 이 하나의 Aspect로 모든 Controller 메서드에 자동 적용!
     */
    @Around("execution(* com.example.studydiary.domain..controller..*(..))")
    public Object logApiCall(ProceedingJoinPoint joinPoint) throws Throwable {

        // 메서드 이름: "createStudyLog", "getStudyLog" 등
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();

        log.info("▶ [API 호출] {}.{}() 시작", className, methodName);

        long startTime = System.currentTimeMillis();

        try {
            // 실제 메서드 실행
            Object result = joinPoint.proceed();

            long elapsed = System.currentTimeMillis() - startTime;
            log.info("◀ [API 완료] {}.{}() — {}ms", className, methodName, elapsed);

            return result;
        } catch (Exception e) {
            long elapsed = System.currentTimeMillis() - startTime;
            log.error("✖ [API 에러] {}.{}() — {}ms — {}", className, methodName, elapsed, e.getMessage());
            throw e;  // 예외는 다시 던져서 GlobalExceptionHandler가 처리
        }
    }
}
```

### 리마인드: AOP가 없으면?

```java
// ❌ 모든 Controller 메서드마다 로깅 코드를 넣어야 함
@PostMapping
public ResponseEntity<?> createStudyLog(...) {
    log.info("createStudyLog 시작");       // 반복!
    long start = System.currentTimeMillis(); // 반복!
    // ... 핵심 로직 ...
    log.info("createStudyLog 끝 - {}ms", ...); // 반복!
}

// ✅ AOP를 쓰면 → Controller는 핵심 로직만!
@PostMapping
public ResponseEntity<?> createStudyLog(...) {
    // 핵심 로직만 있으면 됨. 로깅은 AOP가 자동 처리!
}
```

---

## Step 6. 예외 처리 — 글로벌 에러 핸들링

> 📖 **복습 주제: [06. 예외 처리 전략](../phase1-기초체력/06-exception-handling/) 참고!**

### ErrorCode — 에러 코드 중앙 관리

```java
package com.example.studydiary.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * 📖 06-exception-handling 참고!
 *
 * 에러 코드를 enum으로 한 곳에서 관리
 * → 에러 응답이 일관되고, 새 에러 추가도 쉽다
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 400 Bad Request
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "잘못된 입력값입니다"),
    INVALID_CATEGORY(HttpStatus.BAD_REQUEST, "유효하지 않은 카테고리입니다"),

    // 404 Not Found
    STUDY_LOG_NOT_FOUND(HttpStatus.NOT_FOUND, "학습 기록을 찾을 수 없습니다"),
    FILE_NOT_FOUND(HttpStatus.NOT_FOUND, "파일을 찾을 수 없습니다"),

    // 413 Payload Too Large
    FILE_SIZE_EXCEEDED(HttpStatus.PAYLOAD_TOO_LARGE, "파일 크기가 제한을 초과했습니다"),

    // 500 Internal Server Error
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다");

    private final HttpStatus status;
    private final String message;
}
```

### BusinessException — 커스텀 예외

```java
package com.example.studydiary.global.exception;

import lombok.Getter;

/**
 * 비즈니스 로직에서 발생하는 모든 예외의 부모 클래스
 *
 * throw new BusinessException(ErrorCode.STUDY_LOG_NOT_FOUND);
 * → GlobalExceptionHandler가 잡아서 일관된 응답으로 변환
 */
@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
```

### GlobalExceptionHandler — 모든 예외를 한 곳에서 처리

```java
package com.example.studydiary.global.exception;

import com.example.studydiary.global.common.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/**
 * 📖 06-exception-handling, 13-responseentity 참고!
 *
 * @RestControllerAdvice — 모든 Controller에서 발생하는 예외를 여기서 잡는다
 *
 * 장점:
 * 1. Controller에 try-catch 안 써도 됨
 * 2. 에러 응답 형태가 통일됨 (ApiResponse 형태)
 * 3. 예외 종류별로 적절한 HTTP 상태 코드 반환
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * 비즈니스 예외 처리
     * ex) "학습 기록을 찾을 수 없습니다" (404)
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException e) {
        log.warn("비즈니스 예외: {}", e.getMessage());
        ErrorCode errorCode = e.getErrorCode();
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ApiResponse.error(errorCode.getStatus().value(), errorCode.getMessage()));
    }

    /**
     * 📖 11-dto-and-validation 참고!
     *
     * @Valid 검증 실패 시 처리
     * ex) "학습 주제는 필수입니다" (400)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(
            MethodArgumentNotValidException e) {
        String message = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("입력값 검증에 실패했습니다");

        log.warn("Validation 실패: {}", message);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(400, message));
    }

    /**
     * 📖 14-file-upload-download 참고!
     *
     * 파일 크기 초과 시 처리
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxSizeException(
            MaxUploadSizeExceededException e) {
        log.warn("파일 크기 초과: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiResponse.error(413, "파일 크기가 제한을 초과했습니다 (최대 10MB)"));
    }

    /**
     * 예상 못한 예외 (최후의 안전망)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("예상 못한 예외 발생", e);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, "서버 내부 오류가 발생했습니다"));
    }
}
```

### 리마인드: 예외 처리 흐름

```
Client → Controller → Service에서 예외 발생!
                          ↓
                  throw new BusinessException(ErrorCode.STUDY_LOG_NOT_FOUND)
                          ↓
                  GlobalExceptionHandler가 잡음
                          ↓
                  ApiResponse.error(404, "학습 기록을 찾을 수 없습니다")
                          ↓
Client ← { "status": 404, "data": null, "message": "학습 기록을 찾을 수 없습니다" }
```

---

## Step 7. 공통 응답 포맷 설계

> 📖 **복습 주제: [13. ResponseEntity와 API 응답 표준화](../phase2-API개발/13-responseentity/) 참고!**

### ApiResponse — 모든 API의 응답 껍데기

```java
package com.example.studydiary.global.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

/**
 * 📖 13-responseentity 참고!
 *
 * 모든 API 응답을 이 형태로 통일:
 * {
 *   "status": 200,
 *   "data": { ... },      ← 성공 시 데이터
 *   "message": null        ← 에러 시 메시지
 * }
 *
 * @JsonInclude(NON_NULL) — null인 필드는 JSON에 포함하지 않음
 * 성공 시: { "status": 200, "data": {...} }          ← message 없음
 * 실패 시: { "status": 404, "message": "에러 메시지" } ← data 없음
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final int status;
    private final T data;
    private final String message;

    // 성공 응답
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .status(200)
                .data(data)
                .build();
    }

    // 성공 응답 (커스텀 상태 코드)
    public static <T> ApiResponse<T> success(int status, T data) {
        return ApiResponse.<T>builder()
                .status(status)
                .data(data)
                .build();
    }

    // 에러 응답
    public static <Void> ApiResponse<Void> error(int status, String message) {
        return ApiResponse.<Void>builder()
                .status(status)
                .message(message)
                .build();
    }
}
```

### 리마인드: 왜 공통 응답이 필요한가?

```json
// ❌ 공통 포맷 없을 때 — API마다 응답 형태가 다름
GET /api/logs    → [{ "id": 1 }, ...]         // 배열
GET /api/logs/1  → { "id": 1, "title": "..." } // 객체
POST /api/logs   → "생성 완료"                  // 문자열
에러             → { "error": "not found" }     // 또 다른 형태

// ✅ 공통 포맷 — 항상 같은 구조
GET /api/logs    → { "status": 200, "data": [...] }
GET /api/logs/1  → { "status": 200, "data": { ... } }
POST /api/logs   → { "status": 201, "data": { ... } }
에러             → { "status": 404, "message": "..." }
```

> **프론트엔드 개발자가 `response.data.data`로 항상 접근 가능!**

---

## Step 8. DTO 설계 + Validation

> 📖 **복습 주제: [11. DTO와 Validation](../phase2-API개발/11-dto-and-validation/) 참고!**

### StudyLogCreateRequest — 생성 요청 DTO

```java
package com.example.studydiary.domain.studylog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Getter;

/**
 * 📖 11-dto-and-validation, 15-api-docs 참고!
 *
 * DTO를 요청/응답으로 분리하는 이유:
 * - 요청: 클라이언트가 보내는 데이터 (검증 필요)
 * - 응답: 클라이언트에게 보여줄 데이터 (검증 불필요)
 * - Entity의 내부 구조를 외부에 노출하지 않는다
 *
 * @Valid를 Controller에서 걸면, 여기의 @NotBlank 등이 자동 검증됨
 * → 검증 실패 시 MethodArgumentNotValidException 발생
 * → GlobalExceptionHandler가 400 에러로 응답
 */
@Schema(description = "학습 기록 생성 요청")  // ← 15번 Swagger
@Getter
@Builder
public class StudyLogCreateRequest {

    @Schema(description = "학습 주제", example = "Spring AOP 개념 학습", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "학습 주제는 필수입니다")
    @Size(max = 100, message = "학습 주제는 100자 이내여야 합니다")
    private String title;

    @Schema(description = "학습 내용", example = "AOP의 핵심 개념과 포인트컷 표현식을 학습했다")
    @NotBlank(message = "학습 내용은 필수입니다")
    @Size(max = 2000, message = "학습 내용은 2000자 이내여야 합니다")
    private String content;

    @Schema(description = "카테고리", example = "SPRING",
            allowableValues = {"JAVA", "SPRING", "JPA", "DATABASE", "NETWORK", "CS", "ETC"})
    @NotBlank(message = "카테고리는 필수입니다")
    private String category;

    @Schema(description = "학습 시간 (분)", example = "90", minimum = "1", maximum = "1440")
    @NotNull(message = "학습 시간은 필수입니다")
    @Min(value = 1, message = "학습 시간은 1분 이상이어야 합니다")
    @Max(value = 1440, message = "학습 시간은 1440분(24시간) 이내여야 합니다")
    private Integer studyMinutes;

    @Schema(description = "학습 날짜 (YYYY-MM-DD)", example = "2026-03-12", type = "string", format = "date")
    private String studyDate;  // null이면 오늘 날짜 사용
}
```

### StudyLogUpdateRequest — 수정 요청 DTO

```java
package com.example.studydiary.domain.studylog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "학습 기록 수정 요청")
@Getter
@Builder
public class StudyLogUpdateRequest {

    @Schema(description = "학습 주제", example = "Spring AOP 실전 적용")
    @NotBlank(message = "학습 주제는 필수입니다")
    @Size(max = 100, message = "학습 주제는 100자 이내여야 합니다")
    private String title;

    @Schema(description = "학습 내용", example = "LoggingAspect를 직접 구현하고 프로젝트에 적용했다")
    @NotBlank(message = "학습 내용은 필수입니다")
    @Size(max = 2000)
    private String content;

    @Schema(description = "카테고리", example = "SPRING")
    @NotBlank(message = "카테고리는 필수입니다")
    private String category;

    @Schema(description = "학습 시간 (분)", example = "120")
    @NotNull(message = "학습 시간은 필수입니다")
    @Min(1) @Max(1440)
    private Integer studyMinutes;

    @Schema(description = "학습 날짜", example = "2026-03-12")
    private String studyDate;
}
```

### StudyLogResponse — 응답 DTO

```java
package com.example.studydiary.domain.studylog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 📖 11-dto-and-validation 참고!
 *
 * 응답 DTO는 Validation이 필요 없다 (서버가 만드는 데이터니까)
 * 대신 @Schema로 Swagger 문서화만 해준다
 */
@Schema(description = "학습 기록 응답")
@Getter
@Builder
public class StudyLogResponse {

    @Schema(description = "학습 기록 ID", example = "1")
    private Long id;

    @Schema(description = "학습 주제", example = "Spring AOP 개념 학습")
    private String title;

    @Schema(description = "학습 내용")
    private String content;

    @Schema(description = "카테고리", example = "SPRING")
    private String category;

    @Schema(description = "카테고리 한글명", example = "Spring")
    private String categoryDisplayName;

    @Schema(description = "학습 시간 (분)", example = "90")
    private int studyMinutes;

    @Schema(description = "학습 날짜", example = "2026-03-12")
    private LocalDate studyDate;

    @Schema(description = "생성 일시")
    private LocalDateTime createdAt;

    @Schema(description = "수정 일시")
    private LocalDateTime updatedAt;
}
```

### 리마인드: DTO 분리 패턴

```
Client                    Server
  │                          │
  │  StudyLogCreateRequest  │  → 생성 시 필요한 필드만
  │  ─────────────────────> │
  │                          │
  │  StudyLogUpdateRequest  │  → 수정 시 필요한 필드만
  │  ─────────────────────> │
  │                          │
  │  StudyLogResponse       │  ← id, createdAt 등 포함
  │  <───────────────────── │
  │                          │

Entity는 이 과정에 직접 노출되지 않는다!
→ Entity 구조가 바뀌어도 API 응답은 그대로 유지 가능
```

---

## Step 9. MapStruct — Entity ↔ DTO 변환

> 📖 **복습 주제: [12. MapStruct](../phase2-API개발/12-mapstruct/) 참고!**

### StudyLogMapper

```java
package com.example.studydiary.domain.studylog.mapper;

import com.example.studydiary.domain.studylog.dto.StudyLogCreateRequest;
import com.example.studydiary.domain.studylog.dto.StudyLogResponse;
import com.example.studydiary.domain.studylog.entity.Category;
import com.example.studydiary.domain.studylog.entity.StudyLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 📖 12-mapstruct 참고!
 *
 * @Mapper(componentModel = "spring")
 * → Spring Bean으로 등록되어 @RequiredArgsConstructor로 주입 가능
 *
 * MapStruct가 컴파일 시점에 구현 클래스를 자동 생성해준다
 * → 런타임 리플렉션 없음, 타입 안전, 빠름
 */
@Mapper(componentModel = "spring")
public interface StudyLogMapper {

    /**
     * Request DTO → Entity 변환
     *
     * 📖 12-mapstruct 참고: @Mapping은 자동 매핑이 안 되는 필드만 명시!
     *
     * 자동 매핑 가능: title, content, studyMinutes
     * 수동 매핑 필요: category(String→Enum), studyDate(String→LocalDate), createdAt, updatedAt
     */
    @Mapping(target = "id", ignore = true)  // 새로 생성이니까 ID는 무시
    @Mapping(target = "category", expression = "java(Category.valueOf(request.getCategory()))")
    @Mapping(target = "studyDate", expression = "java(parseStudyDate(request.getStudyDate()))")
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "updatedAt", expression = "java(java.time.LocalDateTime.now())")
    StudyLog toEntity(StudyLogCreateRequest request);

    /**
     * Entity → Response DTO 변환
     *
     * 📖 12-mapstruct 참고: category 필드명은 같지만 타입이 다름 (Enum→String)
     * MapStruct가 자동으로 .name() 호출해줌!
     */
    @Mapping(target = "category", expression = "java(studyLog.getCategory().name())")
    @Mapping(target = "categoryDisplayName", expression = "java(studyLog.getCategory().getDisplayName())")
    StudyLogResponse toResponse(StudyLog studyLog);

    /**
     * 커스텀 매핑 메서드: String → LocalDate 변환
     * null이면 오늘 날짜 반환
     */
    default LocalDate parseStudyDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return LocalDate.now();
        }
        return LocalDate.parse(dateStr);
    }
}
```

### 리마인드: MapStruct 핵심 원리

```
@Mapping은 자동 매핑이 안 될 때만 쓴다!

자동 매핑 조건:
  ✅ 필드명이 같다
  ✅ 타입이 같다 (또는 자동 변환 가능)

@Mapping이 필요한 경우:
  ❌ 필드명이 다르다 (source="a", target="b")
  ❌ 타입 변환이 필요하다 (String → Enum, String → LocalDate)
  ❌ 무시할 필드가 있다 (ignore = true)
```

---

## Step 10. Service 계층 — 비즈니스 로직

> 📖 **복습 주제: [09. Layered Architecture](../phase2-API개발/09-layered-architecture-dao/) 참고!**

### StudyLogService

```java
package com.example.studydiary.domain.studylog.service;

import com.example.studydiary.domain.studylog.dto.StudyLogCreateRequest;
import com.example.studydiary.domain.studylog.dto.StudyLogResponse;
import com.example.studydiary.domain.studylog.dto.StudyLogUpdateRequest;
import com.example.studydiary.domain.studylog.entity.Category;
import com.example.studydiary.domain.studylog.entity.StudyLog;
import com.example.studydiary.domain.studylog.mapper.StudyLogMapper;
import com.example.studydiary.domain.studylog.repository.StudyLogRepository;
import com.example.studydiary.global.exception.BusinessException;
import com.example.studydiary.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * 📖 09-layered-architecture-dao, 04-ioc-di, 10-lombok 참고!
 *
 * @Service — 비즈니스 로직을 담당하는 계층
 * @RequiredArgsConstructor — final 필드의 생성자를 Lombok이 자동 생성
 *   → Spring이 StudyLogRepository, StudyLogMapper를 자동 주입 (DI)
 * @Slf4j — log 변수 자동 생성 (Lombok)
 *
 * 계층 구조:
 * Controller (요청 수신) → Service (비즈니스 로직) → Repository (데이터 접근)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StudyLogService {

    private final StudyLogRepository studyLogRepository;
    private final StudyLogMapper studyLogMapper;

    /**
     * 학습 기록 생성
     */
    public StudyLogResponse create(StudyLogCreateRequest request) {
        // 1. 카테고리 유효성 검증
        validateCategory(request.getCategory());

        // 2. DTO → Entity 변환 (MapStruct)
        StudyLog studyLog = studyLogMapper.toEntity(request);
        log.debug("생성할 학습 기록: title={}, category={}", studyLog.getTitle(), studyLog.getCategory());

        // 3. 저장
        StudyLog saved = studyLogRepository.save(studyLog);
        log.info("학습 기록 생성 완료: id={}", saved.getId());

        // 4. Entity → Response DTO 변환 (MapStruct)
        return studyLogMapper.toResponse(saved);
    }

    /**
     * 학습 기록 단건 조회
     */
    public StudyLogResponse findById(Long id) {
        StudyLog studyLog = studyLogRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_LOG_NOT_FOUND));
        // ↑ 📖 06-exception-handling 참고! 없으면 404 에러

        return studyLogMapper.toResponse(studyLog);
    }

    /**
     * 전체 목록 조회
     */
    public List<StudyLogResponse> findAll() {
        return studyLogRepository.findAll().stream()
                .map(studyLogMapper::toResponse)  // 각 Entity를 Response로 변환
                .toList();
    }

    /**
     * 카테고리별 조회
     */
    public List<StudyLogResponse> findByCategory(String categoryName) {
        Category category = parseCategory(categoryName);
        return studyLogRepository.findByCategory(category).stream()
                .map(studyLogMapper::toResponse)
                .toList();
    }

    /**
     * 학습 기록 수정
     */
    public StudyLogResponse update(Long id, StudyLogUpdateRequest request) {
        // 1. 기존 기록 조회 (없으면 404)
        StudyLog studyLog = studyLogRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_LOG_NOT_FOUND));

        // 2. 카테고리 검증
        Category category = parseCategory(request.getCategory());

        // 3. Entity 업데이트 (@Setter 대신 명시적 메서드)
        LocalDate studyDate = (request.getStudyDate() != null && !request.getStudyDate().isBlank())
                ? LocalDate.parse(request.getStudyDate())
                : studyLog.getStudyDate();

        studyLog.update(
                request.getTitle(),
                request.getContent(),
                category,
                request.getStudyMinutes(),
                studyDate
        );

        // 4. 저장 & 응답
        StudyLog saved = studyLogRepository.save(studyLog);
        log.info("학습 기록 수정 완료: id={}", saved.getId());
        return studyLogMapper.toResponse(saved);
    }

    /**
     * 학습 기록 삭제
     */
    public void delete(Long id) {
        if (!studyLogRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.STUDY_LOG_NOT_FOUND);
        }
        studyLogRepository.deleteById(id);
        log.info("학습 기록 삭제 완료: id={}", id);
    }

    // ── private 헬퍼 메서드 ──

    private void validateCategory(String categoryName) {
        try {
            Category.valueOf(categoryName);
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_CATEGORY);
        }
    }

    private Category parseCategory(String categoryName) {
        try {
            return Category.valueOf(categoryName);
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_CATEGORY);
        }
    }
}
```

### 리마인드: Layered Architecture 의존 방향

```
Controller  →  Service  →  Repository
  (요청)       (로직)       (데이터)

규칙:
✅ Controller → Service 호출 OK
✅ Service → Repository 호출 OK
❌ Repository → Service 호출 금지!
❌ Controller → Repository 직접 호출 금지! (Service 거쳐야 함)
```

---

## Step 11. Controller — REST API 엔드포인트

> 📖 **복습 주제: [07. HTTP & REST](../phase2-API개발/07-http-and-rest/), [08. Spring MVC](../phase2-API개발/08-spring-mvc-flow/), [15. API 문서화](../phase2-API개발/15-api-docs/) 참고!**

### StudyLogController

```java
package com.example.studydiary.domain.studylog.controller;

import com.example.studydiary.domain.studylog.dto.StudyLogCreateRequest;
import com.example.studydiary.domain.studylog.dto.StudyLogResponse;
import com.example.studydiary.domain.studylog.dto.StudyLogUpdateRequest;
import com.example.studydiary.domain.studylog.service.StudyLogService;
import com.example.studydiary.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 📖 07-http-and-rest, 08-spring-mvc-flow, 13-responseentity, 15-api-docs 참고!
 *
 * @RestController = @Controller + @ResponseBody
 *   → 반환값을 JSON으로 자동 변환 (Jackson이 처리)
 *
 * @RequestMapping("/api/v1/study-logs")
 *   → 이 컨트롤러의 모든 API의 기본 경로
 *   → REST 설계: 복수형 명사, 소문자, 하이픈 사용
 *
 * @Tag — Swagger UI에서 "학습 기록" 그룹으로 표시
 *
 * @RequiredArgsConstructor — StudyLogService 생성자 주입 (DI)
 */
@Tag(name = "학습 기록", description = "학습 기록 CRUD API")
@RestController
@RequestMapping("/api/v1/study-logs")
@RequiredArgsConstructor
public class StudyLogController {

    private final StudyLogService studyLogService;

    /**
     * 📖 07-http-and-rest 참고!
     * POST = 새로운 리소스 "생성"
     * 응답: 201 Created
     *
     * 📖 11-dto-and-validation 참고!
     * @Valid → StudyLogCreateRequest의 @NotBlank, @Min 등 자동 검증
     *
     * 📖 08-spring-mvc-flow 참고!
     * @RequestBody → JSON 요청 본문을 DTO 객체로 변환 (Jackson)
     */
    @Operation(summary = "학습 기록 생성", description = "새로운 학습 기록을 생성합니다")
    @PostMapping
    public ResponseEntity<ApiResponse<StudyLogResponse>> create(
            @Valid @RequestBody StudyLogCreateRequest request) {

        StudyLogResponse response = studyLogService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)                    // 201
                .body(ApiResponse.success(201, response));
    }

    /**
     * 📖 07-http-and-rest 참고!
     * GET = 리소스 "조회" (데이터 변경 없음)
     *
     * 📖 08-spring-mvc-flow 참고!
     * @RequestParam → 쿼리 파라미터 (?category=SPRING)
     * required = false → 없으면 전체 조회
     */
    @Operation(summary = "학습 기록 목록 조회", description = "전체 또는 카테고리별 학습 기록 조회")
    @GetMapping
    public ResponseEntity<ApiResponse<List<StudyLogResponse>>> getAll(
            @Parameter(description = "카테고리 필터 (없으면 전체 조회)", example = "SPRING")
            @RequestParam(required = false) String category) {

        List<StudyLogResponse> responses = (category != null)
                ? studyLogService.findByCategory(category)
                : studyLogService.findAll();

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /**
     * 📖 08-spring-mvc-flow 참고!
     * @PathVariable → URL 경로의 변수 (/study-logs/{id})
     */
    @Operation(summary = "학습 기록 상세 조회")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudyLogResponse>> getById(
            @Parameter(description = "학습 기록 ID", example = "1")
            @PathVariable Long id) {

        StudyLogResponse response = studyLogService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 📖 07-http-and-rest 참고!
     * PUT = 리소스 전체 "수정" (모든 필드 전송)
     */
    @Operation(summary = "학습 기록 수정")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StudyLogResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody StudyLogUpdateRequest request) {

        StudyLogResponse response = studyLogService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 📖 07-http-and-rest 참고!
     * DELETE = 리소스 "삭제"
     * 응답: 204 No Content (본문 없이 성공)
     */
    @Operation(summary = "학습 기록 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        studyLogService.delete(id);
        return ResponseEntity.noContent().build();  // 204
    }
}
```

### 리마인드: REST API 설계 원칙

```
📖 07-http-and-rest 참고!

리소스 URI = 명사, 복수형
✅ /api/v1/study-logs
❌ /api/v1/getStudyLog
❌ /api/v1/study_log

HTTP Method가 동사 역할:
POST   /api/v1/study-logs          → 생성 (201)
GET    /api/v1/study-logs          → 목록 조회 (200)
GET    /api/v1/study-logs/{id}     → 단건 조회 (200)
PUT    /api/v1/study-logs/{id}     → 수정 (200)
DELETE /api/v1/study-logs/{id}     → 삭제 (204)
```

### 리마인드: Spring MVC 요청 처리 흐름

```
📖 08-spring-mvc-flow 참고!

1. 클라이언트가 POST /api/v1/study-logs 요청
       ↓
2. DispatcherServlet이 요청 수신
       ↓
3. HandlerMapping이 StudyLogController.create() 찾기
       ↓
4. @RequestBody → Jackson이 JSON을 StudyLogCreateRequest로 변환
       ↓
5. @Valid → Bean Validation 실행 (실패 시 400 에러)
       ↓
6. Controller → Service → Repository 흐름으로 처리
       ↓
7. 반환값을 Jackson이 JSON으로 변환 → 클라이언트에 응답
```

---

## Step 12. 파일 업로드/다운로드

> 📖 **복습 주제: [14. 파일 업로드/다운로드](../phase2-API개발/14-file-upload-download/) 참고!**

### FileEntity — 파일 정보

```java
package com.example.studydiary.global.file;

import lombok.Builder;
import lombok.Getter;

/**
 * 📖 14-file-upload-download 참고!
 *
 * 원본 파일명과 저장 파일명을 분리하는 이유:
 * - 유저A: profile.png 업로드
 * - 유저B: profile.png 업로드
 * → 같은 이름이라 덮어쓰기 발생!
 * → UUID로 저장명을 만들어 충돌 방지
 */
@Getter
@Builder
public class FileEntity {
    private Long id;
    private String originalName;   // 원본명: "학습노트.pdf"
    private String savedName;      // 저장명: "550e8400-...pdf"
    private String contentType;    // "application/pdf"
    private long fileSize;
    private String filePath;       // "2026/03/12/550e8400-...pdf"
}
```

### FileService — 파일 저장/조회

```java
package com.example.studydiary.global.file;

import com.example.studydiary.global.exception.BusinessException;
import com.example.studydiary.global.exception.ErrorCode;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 📖 14-file-upload-download 참고!
 *
 * @Value("${file.upload-dir}") — application.yml에서 설정한 업로드 경로 주입
 * @PostConstruct — Bean 생성 후 초기화 메서드 (업로드 폴더 생성)
 */
@Service
@Slf4j
public class FileService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path uploadPath;
    private final Map<Long, FileEntity> fileStore = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(1);

    // 허용 확장자
    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of(".jpg", ".jpeg", ".png", ".gif", ".pdf", ".txt", ".md");

    @PostConstruct
    public void init() {
        uploadPath = Paths.get(uploadDir);
        try {
            Files.createDirectories(uploadPath);
            log.info("업로드 폴더 생성: {}", uploadPath.toAbsolutePath());
        } catch (IOException e) {
            throw new RuntimeException("업로드 폴더 생성 실패", e);
        }
    }

    /**
     * 📖 14-file-upload-download 참고!
     * MultipartFile → 로컬 파일 시스템에 저장
     */
    public FileEntity upload(MultipartFile file) throws IOException {
        // 1. 빈 파일 체크
        if (file.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }

        // 2. 확장자 검증
        String originalName = file.getOriginalFilename();
        String extension = getExtension(originalName);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }

        // 3. 날짜별 디렉토리 + UUID 파일명
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        Path targetDir = uploadPath.resolve(datePath);
        Files.createDirectories(targetDir);

        String savedName = UUID.randomUUID() + extension;
        Path targetPath = targetDir.resolve(savedName);

        // 4. 파일 저장
        file.transferTo(targetPath.toFile());

        // 5. 파일 정보 저장 (DB 대신 Map)
        FileEntity fileEntity = FileEntity.builder()
                .id(sequence.getAndIncrement())
                .originalName(originalName)
                .savedName(savedName)
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .filePath(datePath + "/" + savedName)
                .build();
        fileStore.put(fileEntity.getId(), fileEntity);

        log.info("파일 업로드 완료: {} → {}", originalName, fileEntity.getFilePath());
        return fileEntity;
    }

    /**
     * 📖 14-file-upload-download 참고!
     * Resource로 파일을 감싸서 다운로드 응답 생성
     */
    public Resource loadAsResource(Long fileId) throws IOException {
        FileEntity fileEntity = fileStore.get(fileId);
        if (fileEntity == null) {
            throw new BusinessException(ErrorCode.FILE_NOT_FOUND);
        }

        Path filePath = uploadPath.resolve(fileEntity.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            throw new BusinessException(ErrorCode.FILE_NOT_FOUND);
        }

        return resource;
    }

    public FileEntity getFileInfo(Long fileId) {
        FileEntity fileEntity = fileStore.get(fileId);
        if (fileEntity == null) {
            throw new BusinessException(ErrorCode.FILE_NOT_FOUND);
        }
        return fileEntity;
    }

    /**
     * 한글 파일명 인코딩 (RFC 5987)
     */
    public String encodeFileName(String originalName) {
        return URLEncoder.encode(originalName, StandardCharsets.UTF_8)
                .replace("+", "%20");
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int dotIndex = filename.lastIndexOf(".");
        return (dotIndex == -1) ? "" : filename.substring(dotIndex);
    }
}
```

### FileController — 업로드/다운로드 API

```java
package com.example.studydiary.global.file;

import com.example.studydiary.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * 📖 14-file-upload-download 참고!
 */
@Tag(name = "파일", description = "파일 업로드/다운로드 API")
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    /**
     * 📖 14-file-upload-download 참고!
     *
     * @RequestParam("file") MultipartFile
     * → multipart/form-data 형식으로 파일 수신
     */
    @Operation(summary = "파일 업로드")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> upload(
            @RequestParam("file") MultipartFile file) throws IOException {

        FileEntity saved = fileService.upload(file);

        Map<String, Object> result = Map.of(
                "fileId", saved.getId(),
                "originalName", saved.getOriginalName(),
                "fileSize", saved.getFileSize(),
                "contentType", saved.getContentType()
        );

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * 📖 14-file-upload-download 참고!
     *
     * Content-Disposition: attachment → 다운로드 대화상자
     * filename*=UTF-8'' → 한글 파일명 깨짐 방지 (RFC 5987)
     */
    @Operation(summary = "파일 다운로드")
    @GetMapping("/download/{fileId}")
    public ResponseEntity<Resource> download(@PathVariable Long fileId) throws IOException {
        FileEntity fileInfo = fileService.getFileInfo(fileId);
        Resource resource = fileService.loadAsResource(fileId);
        String encodedName = fileService.encodeFileName(fileInfo.getOriginalName());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileInfo.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + encodedName)
                .body(resource);
    }

    /**
     * 📖 14-file-upload-download 참고!
     *
     * Content-Disposition: inline → 브라우저에서 직접 표시 (이미지, PDF 등)
     */
    @Operation(summary = "이미지 미리보기")
    @GetMapping("/images/{fileId}")
    public ResponseEntity<Resource> viewImage(@PathVariable Long fileId) throws IOException {
        FileEntity fileInfo = fileService.getFileInfo(fileId);
        Resource resource = fileService.loadAsResource(fileId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileInfo.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }
}
```

### 리마인드: 업로드 vs 다운로드 핵심

```
📖 14-file-upload-download 참고!

[업로드]
Client  →  MultipartFile  →  UUID 이름으로 저장  →  DB에 파일 정보 기록

[다운로드]
Client  ←  Resource  ←  Content-Disposition: attachment  ←  파일 로드

[미리보기]
Client  ←  Resource  ←  Content-Disposition: inline     ←  파일 로드
```

---

## Step 13. Swagger 설정

> 📖 **복습 주제: [15. API 문서화](../phase2-API개발/15-api-docs/) 참고!**

### SwaggerConfig

```java
package com.example.studydiary.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 📖 15-api-docs 참고!
 *
 * Swagger UI 접속: http://localhost:8080/swagger-ui.html
 * OpenAPI JSON: http://localhost:8080/v3/api-docs
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("학습 일지 API")
                        .description("Phase 1~2 복습 프로젝트 — 학습 기록 관리 REST API")
                        .version("v1.0.0")
                        .contact(new Contact().name("Study Archive")))
                .components(new Components());
    }
}
```

### 확인 방법

```
1. 애플리케이션 실행 (./gradlew bootRun)
2. 브라우저에서 http://localhost:8080/swagger-ui.html 접속
3. "학습 기록" 그룹과 "파일" 그룹 확인
4. "Try it out"으로 직접 API 테스트!
```

---

## Step 14. 디버깅 실습 가이드

> 📖 **복습 주제: [16. 디버깅 완벽 가이드](../phase2-API개발/16-debugging/) 참고!**

### 이 프로젝트에서 디버깅 연습하기

프로젝트가 완성되면 아래를 따라 디버깅을 연습해보자:

#### 연습 1: 기본 Breakpoint

```
1. StudyLogService.create() 첫 줄에 Breakpoint 🔴
2. 디버그 모드로 실행 (Shift + F9)
3. Swagger UI에서 POST /api/v1/study-logs 요청
4. Breakpoint에서 멈추면:
   - Variables 패널에서 request 값 확인
   - F8 (Step Over)로 한 줄씩 진행
   - studyLog 변수에 MapStruct가 변환한 결과 확인
```

#### 연습 2: 예외 Breakpoint

```
1. Run > View Breakpoints (Cmd + Shift + F8)
2. + → "Java Exception Breakpoints" → BusinessException 등록
3. 존재하지 않는 ID로 GET /api/v1/study-logs/999 요청
4. BusinessException이 throw되는 바로 그 줄에서 멈춤!
5. Variables에서 errorCode 확인
```

#### 연습 3: 조건부 Breakpoint

```
1. StudyLogRepository.findByCategory()에 Breakpoint
2. Breakpoint 우클릭 → Condition: "log.getCategory() == Category.SPRING"
3. 여러 카테고리 데이터 생성 후 카테고리별 조회
4. SPRING 카테고리만 멈춤!
```

> **디버깅은 직접 해봐야 체화된다.** 프로젝트 완성 후 위 3가지를 꼭 해보자!

---

## 전체 복습 체크리스트

프로젝트를 만들면서 아래를 하나씩 체크해보자:

### Phase 1 — 기초체력

| # | 주제 | 프로젝트 적용 | 체크 |
|---|---|---|---|
| 01 | Spring Boot 기초 | @SpringBootApplication, Gradle 설정 | ⬜ |
| 02 | Resources & 설정 | application.yml, 프로필 분리 (dev/prod) | ⬜ |
| 03 | 로깅 | logback-spring.xml, @Slf4j, log.debug/info | ⬜ |
| 04 | IoC/DI | @Component, @Service, @Repository, 생성자 주입 | ⬜ |
| 05 | AOP | LoggingAspect (API 실행 로깅 & 시간 측정) | ⬜ |
| 06 | 예외 처리 | @RestControllerAdvice, BusinessException, ErrorCode | ⬜ |

### Phase 2 — API 개발

| # | 주제 | 프로젝트 적용 | 체크 |
|---|---|---|---|
| 07 | HTTP & REST | REST URI 설계, HTTP Method, Status Code | ⬜ |
| 08 | Spring MVC | @RestController, @RequestBody, @PathVariable, @RequestParam | ⬜ |
| 09 | Layered Architecture | Controller → Service → Repository 계층 분리 | ⬜ |
| 10 | Lombok | @Getter, @Builder, @RequiredArgsConstructor, @Slf4j | ⬜ |
| 11 | DTO & Validation | 요청/응답 DTO 분리, @Valid, @NotBlank, @Min, @Size | ⬜ |
| 12 | MapStruct | Entity ↔ DTO 자동 변환, @Mapper, @Mapping | ⬜ |
| 13 | ResponseEntity | ApiResponse<T> 공통 응답, 상태 코드 제어 | ⬜ |
| 14 | 파일 업로드/다운로드 | MultipartFile, Resource, Content-Disposition | ⬜ |
| 15 | API 문서화 | SwaggerConfig, @Tag, @Operation, @Schema | ⬜ |
| 16 | 디버깅 | Breakpoint 연습 (프로젝트 완성 후) | ⬜ |

---

## API 테스트 시나리오

프로젝트를 완성하고 Swagger UI에서 이 순서대로 테스트해보자:

### 1. 학습 기록 생성

```http
POST /api/v1/study-logs

{
  "title": "Spring AOP 개념 학습",
  "content": "AOP의 핵심 개념과 포인트컷 표현식을 학습했다",
  "category": "SPRING",
  "studyMinutes": 90,
  "studyDate": "2026-03-12"
}

→ 201 Created
```

### 2. Validation 에러 확인

```http
POST /api/v1/study-logs

{
  "title": "",
  "content": "내용",
  "category": "SPRING",
  "studyMinutes": 0
}

→ 400 Bad Request: "title: 학습 주제는 필수입니다"
```

### 3. 전체 조회

```http
GET /api/v1/study-logs
→ 200 OK: [{ ... }, { ... }]
```

### 4. 카테고리별 조회

```http
GET /api/v1/study-logs?category=SPRING
→ 200 OK: SPRING 카테고리만 필터링
```

### 5. 상세 조회

```http
GET /api/v1/study-logs/1
→ 200 OK: { "id": 1, ... }
```

### 6. 없는 ID 조회 (에러 확인)

```http
GET /api/v1/study-logs/999
→ 404 Not Found: "학습 기록을 찾을 수 없습니다"
```

### 7. 수정

```http
PUT /api/v1/study-logs/1

{
  "title": "Spring AOP 실전 적용",
  "content": "LoggingAspect를 직접 구현해봤다",
  "category": "SPRING",
  "studyMinutes": 120,
  "studyDate": "2026-03-12"
}

→ 200 OK
```

### 8. 삭제

```http
DELETE /api/v1/study-logs/1
→ 204 No Content
```

### 9. 파일 업로드

```http
POST /api/v1/files
Content-Type: multipart/form-data
file: (학습노트.png 첨부)

→ 200 OK: { "fileId": 1, "originalName": "학습노트.png" }
```

### 10. 파일 다운로드

```http
GET /api/v1/files/download/1
→ 파일 다운로드 (Content-Disposition: attachment)
```

---

## 마무리

이 프로젝트를 직접 따라 만들면 **Phase 1~2의 16개 주제가 하나로 연결되는 감각**을 얻을 수 있다.

```
"아, IoC/DI로 Bean을 만들고,
 Layered Architecture로 계층을 나누고,
 DTO + Validation으로 요청을 검증하고,
 MapStruct로 변환하고,
 ResponseEntity로 응답을 만들고,
 AOP로 로깅을 자동화하고,
 GlobalExceptionHandler로 에러를 처리하는구나!"
```

**모든 것이 연결된다.** 하나하나 따로 배울 때는 몰랐던 **전체 그림**이 이 프로젝트에서 보일 거야!

> 📖 각 주제를 더 깊이 복습하고 싶으면, 코드 주석에 적어둔 참고 링크를 따라가자!
