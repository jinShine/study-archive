# 06. 예외 처리 전략 — "에러도 깔끔하게 응답하기"

> **키워드**: `@ExceptionHandler` `@RestControllerAdvice` `ErrorResponse` `커스텀 예외` `HTTP 상태 코드`

---

## 핵심만 한 문장

**에러가 발생하면 "어떤 형식으로, 어떤 HTTP 상태 코드로" 응답할지 통일하는 것**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~4장 (문제, @RestControllerAdvice, 커스텀 예외, 따라쳐보기) | 모든 프로젝트에 필수 |
| 🟡 이해 | 5장 (HTTP 상태 코드 매핑) | 올바른 응답 코드 |
| 🟢 참고 | 6장 (@Valid 예외 처리) | DTO 검증 시 필요 |

> 💡 **03번과의 연결**: CRUD API에서 `throw new RuntimeException()`으로 에러를 던졌다. 이러면 클라이언트가 HTML 에러 페이지를 받는다. JSON으로 깔끔하게 바꾸자!

---

## 1장. 문제: 예외 처리를 안 하면? 🔴

### 지금 상태 (03번에서 만든 코드)

```java
// StudentService.java
public Student getById(Long id) {
    return repository.findById(id)
        .orElseThrow(() -> new RuntimeException("학생을 찾을 수 없습니다: id=" + id));
}
```

### 클라이언트가 받는 응답

```bash
GET http://localhost:8080/students/999

# 응답: 500 Internal Server Error + 이상한 JSON
{
    "timestamp": "2026-04-07T14:23:45.123",
    "status": 500,
    "error": "Internal Server Error",
    "path": "/students/999"
}
```

**문제:**
- 500이 아니라 **404 (Not Found)**여야 함
- 어떤 에러인지 **메시지가 불친절**
- 모든 에러가 **같은 형식이 아님**

### 원하는 응답

```json
{
    "status": 404,
    "code": "STUDENT_NOT_FOUND",
    "message": "학생을 찾을 수 없습니다: id=999"
}
```

---

## 2장. @RestControllerAdvice — 전역 예외 처리 🔴

### 비유

```
❌ 예외 처리 없이 = 각 교실에서 알아서 화재 대응
  → 1반은 소화기, 2반은 물통, 3반은 아무것도 없음

✅ @RestControllerAdvice = 중앙 방재 센터
  → 어디서 화재가 나든 방재 센터가 통일된 방식으로 대응
```

### 동작 원리

```
요청 → Controller → Service → 예외 발생!
                                  ↓
                  @RestControllerAdvice가 가로챔
                                  ↓
                  "이 예외에 맞는 응답을 만들어서 반환"
                                  ↓
                  깔끔한 JSON 응답 반환 ✅
```

---

## 3장. 따라 쳐보기: 전역 예외 처리 구현 🔴

### 전체 파일 구조

```
src/main/java/com/example/demo/
├── exception/
│   ├── ErrorResponse.java           ← 에러 응답 형식
│   ├── StudentNotFoundException.java ← 커스텀 예외
│   └── GlobalExceptionHandler.java  ← 전역 예외 처리
├── controller/
│   └── StudentController.java
├── service/
│   └── StudentService.java
└── ...
```

### Step 1. ErrorResponse — 에러 응답 형식

`src/main/java/com/example/demo/exception/ErrorResponse.java`:

```java
package com.example.demo.exception;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ErrorResponse {
    private int status;      // HTTP 상태 코드 (404, 400, 500 등)
    private String code;     // 에러 코드 ("STUDENT_NOT_FOUND" 등)
    private String message;  // 사용자에게 보여줄 메시지
}
```

### Step 2. 커스텀 예외 만들기

`src/main/java/com/example/demo/exception/StudentNotFoundException.java`:

```java
package com.example.demo.exception;

public class StudentNotFoundException extends RuntimeException {
    
    public StudentNotFoundException(Long id) {
        super("학생을 찾을 수 없습니다: id=" + id);
    }
}
```

### Step 3. GlobalExceptionHandler — 핵심!

`src/main/java/com/example/demo/exception/GlobalExceptionHandler.java`:

**⚠️ 이 파일이 프로젝트의 모든 예외를 처리한다. 전체 복사!**

```java
package com.example.demo.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice  // ← "모든 Controller의 예외를 여기서 처리"
public class GlobalExceptionHandler {
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1️⃣ 학생 못 찾음 → 404 Not Found
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    @ExceptionHandler(StudentNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleStudentNotFound(StudentNotFoundException e) {
        log.warn("StudentNotFoundException: {}", e.getMessage());
        
        ErrorResponse response = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),    // 404
            "STUDENT_NOT_FOUND",
            e.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2️⃣ 잘못된 요청 → 400 Bad Request
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException e) {
        log.warn("IllegalArgumentException: {}", e.getMessage());
        
        ErrorResponse response = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),  // 400
            "BAD_REQUEST",
            e.getMessage()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 3️⃣ 나머지 모든 예외 → 500 Internal Server Error
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAll(Exception e) {
        log.error("예상치 못한 에러 발생", e);
        
        ErrorResponse response = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),  // 500
            "INTERNAL_ERROR",
            "서버 내부 오류가 발생했습니다"
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
```

### Step 4. Service에서 커스텀 예외 사용

```java
// ❌ 이전 (RuntimeException)
public Student getById(Long id) {
    return repository.findById(id)
        .orElseThrow(() -> new RuntimeException("학생을 찾을 수 없습니다"));
}

// ✅ 개선 (커스텀 예외)
public Student getById(Long id) {
    return repository.findById(id)
        .orElseThrow(() -> new StudentNotFoundException(id));
}
```

### Step 5. 테스트

```bash
# 존재하지 않는 학생 조회
GET http://localhost:8080/students/999

# 응답: 404 Not Found
{
    "status": 404,
    "code": "STUDENT_NOT_FOUND",
    "message": "학생을 찾을 수 없습니다: id=999"
}
```

```bash
# 정상 조회
GET http://localhost:8080/students/1

# 응답: 200 OK
{ "id": 1, "name": "홍길동", ... }
```

### 콘솔 로그

```
14:23:45 WARN  GlobalExceptionHandler - StudentNotFoundException: 학생을 찾을 수 없습니다: id=999
```

**모든 에러가 통일된 형식으로 응답된다!** ✅

---

## 4장. 커스텀 예외 더 만들기 🔴

### 패턴

```java
// 예외마다 클래스 하나
public class StudentNotFoundException extends RuntimeException {
    public StudentNotFoundException(Long id) {
        super("학생을 찾을 수 없습니다: id=" + id);
    }
}

public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String email) {
        super("이미 등록된 이메일입니다: " + email);
    }
}
```

```java
// GlobalExceptionHandler에 추가
@ExceptionHandler(DuplicateEmailException.class)
public ResponseEntity<ErrorResponse> handleDuplicateEmail(DuplicateEmailException e) {
    ErrorResponse response = new ErrorResponse(
        HttpStatus.CONFLICT.value(),  // 409
        "DUPLICATE_EMAIL",
        e.getMessage()
    );
    return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
}
```

```java
// Service에서 사용
public Student create(Student student) {
    if (repository.existsByEmail(student.getEmail())) {
        throw new DuplicateEmailException(student.getEmail());
    }
    return repository.save(student);
}
```

---

## 5장. HTTP 상태 코드 매핑 🟡

| 상황 | HTTP 코드 | 예외 |
|------|----------|------|
| 리소스 못 찾음 | **404** Not Found | `StudentNotFoundException` |
| 잘못된 요청 | **400** Bad Request | `IllegalArgumentException` |
| 중복 데이터 | **409** Conflict | `DuplicateEmailException` |
| 권한 없음 | **403** Forbidden | `AccessDeniedException` |
| 인증 안 됨 | **401** Unauthorized | `AuthenticationException` |
| 서버 내부 오류 | **500** Internal Error | `Exception` (최후의 보루) |

---

## 6장. @Valid 예외 처리 🟢

DTO 검증(11번에서 배움)에서 발생하는 예외도 처리해야 한다:

```java
// GlobalExceptionHandler에 추가
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e) {
    String message = e.getBindingResult().getFieldErrors().stream()
        .map(error -> error.getField() + ": " + error.getDefaultMessage())
        .reduce((a, b) -> a + ", " + b)
        .orElse("입력값이 올바르지 않습니다");
    
    ErrorResponse response = new ErrorResponse(
        HttpStatus.BAD_REQUEST.value(),
        "VALIDATION_ERROR",
        message
    );
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
}
```

```bash
# 이름 없이 등록 시도
POST /students + { "email": "hong@example.com" }

# 응답: 400 Bad Request
{
    "status": 400,
    "code": "VALIDATION_ERROR",
    "message": "name: 이름은 필수입니다"
}
```

---

## 면접 대비

### 🔴 필수

**Q: "Spring에서 예외 처리는 어떻게 하나요?"**

> `@RestControllerAdvice`와 `@ExceptionHandler`를 사용합니다. `@RestControllerAdvice` 클래스를 만들고, 예외 타입별로 `@ExceptionHandler` 메서드를 정의하면 모든 Controller에서 발생하는 예외를 한 곳에서 처리할 수 있습니다. 통일된 에러 응답 형식(ErrorResponse)을 만들어서 JSON으로 반환합니다.

**Q: "@ControllerAdvice와 @RestControllerAdvice의 차이는?"**

> `@RestControllerAdvice`는 `@ControllerAdvice` + `@ResponseBody`입니다. `@ControllerAdvice`는 View를 반환하고, `@RestControllerAdvice`는 JSON을 반환합니다. REST API 서버에서는 `@RestControllerAdvice`를 사용합니다.

**Q: "커스텀 예외를 만드는 이유는?"**

> `RuntimeException`으로 모든 에러를 던지면 어떤 에러인지 구분할 수 없습니다. `StudentNotFoundException`, `DuplicateEmailException` 같은 커스텀 예외를 만들면 `@ExceptionHandler`에서 예외 타입별로 다른 HTTP 상태 코드와 에러 메시지를 반환할 수 있습니다.

---

## 정리: 이것만 기억하기

```
🎯 예외 처리 = "에러도 깔끔한 JSON으로"

파일 3개만 만들면 끝:
  1. ErrorResponse.java              ← 에러 응답 형식
  2. XxxNotFoundException.java       ← 커스텀 예외
  3. GlobalExceptionHandler.java     ← 전역 예외 처리

패턴:
  Controller → Service에서 예외 발생
    → @RestControllerAdvice가 가로챔
    → @ExceptionHandler가 예외 타입별로 처리
    → ErrorResponse JSON 반환

핵심 규칙:
  ✅ 404 = 못 찾음 (StudentNotFoundException)
  ✅ 400 = 잘못된 요청 (IllegalArgumentException)
  ✅ 409 = 중복 (DuplicateEmailException)
  ✅ 500 = 서버 오류 (Exception — 최후의 보루)
```

---

> 🎯 **Phase 1 완료!** 다음은 Phase 2 "API 개발" — HTTP 설계 원칙, Spring MVC 흐름, Layered Architecture, DTO, Validation 등을 배운다!

