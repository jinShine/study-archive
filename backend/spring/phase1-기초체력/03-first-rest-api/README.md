# 03. 첫 번째 REST API 만들기 — "Hello World부터 CRUD까지"

> **키워드**: `@RestController` `@GetMapping` `@PostMapping` `@PathVariable` `@RequestBody` `@Slf4j` `Logging` `Postman`

---

## 핵심만 한 문장

**@RestController 클래스에 @GetMapping/@PostMapping 메서드를 만들면 API가 된다. 이것만 알면 시작할 수 있다!**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~4장 (Hello World, CRUD API, 파라미터 받기, Postman 테스트) | 이거 못하면 아무것도 못 함 |
| 🟡 이해 | 5장 (Logging) | 개발하면서 매일 씀 |
| 🟢 참고 | 6장 (Logging 심화) | 운영 시 필요 |

> 💡 **01번과의 연결**: Spring Boot가 왜 편한지 배웠다. 이제 실제로 API를 만들어보자!

---

## 1장. Hello World API 🔴

### 비유

```
REST API = 식당의 주문 시스템

손님 → "메뉴 주세요" (GET 요청)    → 서버 → "여기요!" (응답)
손님 → "주문할게요" (POST 요청)    → 서버 → "주문 완료!" (응답)
```

### Step 1. 프로젝트 생성

[start.spring.io](https://start.spring.io) 접속:

| 항목 | 설정값 |
|------|--------|
| Project | **Gradle - Groovy** |
| Language | **Java** |
| Spring Boot | **최신 안정 버전** (SNAPSHOT 제외) |
| Java | **17** 이상 |
| Dependencies | **Spring Web**, **Lombok** |

→ Generate → 다운로드 → IntelliJ에서 열기

### Step 2. HelloController 작성

`src/main/java/com/example/demo/HelloController.java`:

```java
package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
    
    @GetMapping("/hello")
    public String hello(@RequestParam(defaultValue = "세계") String name) {
        return "안녕하세요, " + name + "!";
    }
}
```

### Step 3. 실행 + 확인

```bash
# 서버 실행
gradle bootRun

# 콘솔에 이게 보이면 성공:
# Started DemoApplication in 1.892 seconds
```

```bash
# 브라우저에서 확인
http://localhost:8080/hello
# → "안녕하세요, 세계!"

http://localhost:8080/hello?name=김개발
# → "안녕하세요, 김개발!"
```

### 뭐가 일어난 거지?

```
브라우저: GET /hello?name=김개발
  ↓
Spring Boot (DispatcherServlet):
  "GET /hello에 매핑된 메서드 찾자"
  ↓
HelloController.hello(name="김개발") 실행
  ↓
"안녕하세요, 김개발!" 반환
  ↓
브라우저에 텍스트 표시
```

---

## 2장. 학생 관리 CRUD API 만들기 🔴

### CRUD란?

| 동작 | HTTP 메서드 | 어노테이션 | 예시 |
|------|-----------|-----------|------|
| **C**reate (생성) | POST | `@PostMapping` | 학생 등록 |
| **R**ead (조회) | GET | `@GetMapping` | 학생 조회 |
| **U**pdate (수정) | PUT | `@PutMapping` | 학생 수정 |
| **D**elete (삭제) | DELETE | `@DeleteMapping` | 학생 삭제 |

### Step 1. Student 클래스

`src/main/java/com/example/demo/Student.java`:

```java
package com.example.demo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    private Long id;
    private String name;
    private String email;
    private int grade;
}
```

### Step 2. StudentController (전체 코드)

`src/main/java/com/example/demo/StudentController.java`:

**⚠️ 이 코드 전체를 복사하세요!**

```java
package com.example.demo;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/students")
public class StudentController {
    
    // 임시 저장소 (DB 대신 HashMap 사용)
    private final Map<Long, Student> studentMap = new HashMap<>();
    private Long nextId = 1L;
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CREATE: 학생 등록
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    @PostMapping
    public Student createStudent(@RequestBody Student student) {
        student.setId(nextId++);
        studentMap.put(student.getId(), student);
        log.info("학생 등록: id={}, name={}", student.getId(), student.getName());
        return student;
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // READ: 전체 조회
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    @GetMapping
    public List<Student> getAllStudents() {
        log.info("전체 조회: {}명", studentMap.size());
        return new ArrayList<>(studentMap.values());
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // READ: 단건 조회
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    @GetMapping("/{id}")
    public Student getStudent(@PathVariable Long id) {
        Student student = studentMap.get(id);
        if (student == null) {
            throw new RuntimeException("학생을 찾을 수 없습니다: id=" + id);
        }
        return student;
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // UPDATE: 학생 수정
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    @PutMapping("/{id}")
    public Student updateStudent(@PathVariable Long id, @RequestBody Student student) {
        if (!studentMap.containsKey(id)) {
            throw new RuntimeException("학생을 찾을 수 없습니다: id=" + id);
        }
        student.setId(id);
        studentMap.put(id, student);
        log.info("학생 수정: id={}, name={}", id, student.getName());
        return student;
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // DELETE: 학생 삭제
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    @DeleteMapping("/{id}")
    public String deleteStudent(@PathVariable Long id) {
        Student removed = studentMap.remove(id);
        if (removed == null) {
            throw new RuntimeException("학생을 찾을 수 없습니다: id=" + id);
        }
        log.info("학생 삭제: id={}, name={}", id, removed.getName());
        return "삭제 완료: " + removed.getName();
    }
}
```

---

## 3장. 파라미터 받는 3가지 방법 🔴

### @PathVariable — URL 경로에서 받기

```java
// GET /students/42
@GetMapping("/{id}")
public Student getStudent(@PathVariable Long id) {
    // id = 42
}
```

### @RequestBody — JSON 바디에서 받기

```java
// POST /students
// Body: {"name": "홍길동", "email": "hong@example.com", "grade": 3}
@PostMapping
public Student createStudent(@RequestBody Student student) {
    // student.getName() = "홍길동"
}
```

### @RequestParam — 쿼리 파라미터에서 받기

```java
// GET /students?grade=3
@GetMapping
public List<Student> search(@RequestParam(required = false) Integer grade) {
    // grade = 3
}
```

### 정리

```
/students/42              → @PathVariable (경로 변수)
/students?grade=3         → @RequestParam (쿼리 파라미터)
POST /students + JSON     → @RequestBody  (바디)
```

---

## 4장. Postman으로 테스트하기 🔴

브라우저는 GET만 가능하다. POST, PUT, DELETE를 테스트하려면 **Postman**이 필요하다.

### 설치

[Postman 다운로드](https://www.postman.com/downloads/) → 설치

### 테스트 시나리오

```bash
# 1️⃣ 학생 등록 (POST)
POST http://localhost:8080/students
Headers: Content-Type: application/json
Body:
{
    "name": "홍길동",
    "email": "hong@example.com",
    "grade": 3
}

# 응답:
{
    "id": 1,
    "name": "홍길동",
    "email": "hong@example.com",
    "grade": 3
}
```

```bash
# 2️⃣ 전체 조회 (GET)
GET http://localhost:8080/students

# 응답:
[
    { "id": 1, "name": "홍길동", "email": "hong@example.com", "grade": 3 }
]
```

```bash
# 3️⃣ 단건 조회 (GET)
GET http://localhost:8080/students/1

# 응답:
{ "id": 1, "name": "홍길동", "email": "hong@example.com", "grade": 3 }
```

```bash
# 4️⃣ 학생 수정 (PUT)
PUT http://localhost:8080/students/1
Body: { "name": "홍길동", "email": "hong_new@example.com", "grade": 4 }

# 응답:
{ "id": 1, "name": "홍길동", "email": "hong_new@example.com", "grade": 4 }
```

```bash
# 5️⃣ 학생 삭제 (DELETE)
DELETE http://localhost:8080/students/1

# 응답: "삭제 완료: 홍길동"
```

### 콘솔 로그 확인

```
14:23:45 INFO  StudentController - 학생 등록: id=1, name=홍길동
14:23:50 INFO  StudentController - 전체 조회: 1명
14:23:55 INFO  StudentController - 학생 수정: id=1, name=홍길동
14:24:00 INFO  StudentController - 학생 삭제: id=1, name=홍길동
```

---

## 5장. Logging — 개발자의 눈 🟡

### System.out.println()을 쓰면 안 되는 이유

```java
// ❌ println
System.out.println("학생 등록: " + student.getName());
// → 레벨 구분 없음, 파일 저장 불가, 성능 나쁨

// ✅ Logger
log.info("학생 등록: name={}", student.getName());
// → 레벨 구분 O, 파일 저장 O, 성능 O
```

### @Slf4j — 한 줄로 Logger 생성

```java
@Slf4j          // ← Lombok이 log 변수를 자동 생성
@RestController
public class HelloController {
    
    @GetMapping("/hello")
    public String hello() {
        log.info("Hello API 호출됨");  // ← 바로 사용
        return "안녕하세요!";
    }
}
```

### Log Level 5단계

```
낮음 (상세)                                높음 (심각)
  ←──────────────────────────────────────→
  TRACE    DEBUG    INFO    WARN    ERROR
  모든흐름  디버깅   운영정보  주의    에러
```

**설정한 레벨 이상만 출력된다!** (INFO로 설정 → INFO, WARN, ERROR만)

```java
log.debug("개발 중 디버깅: id={}", id);     // 개발에서만
log.info("주문 완료: orderId={}", id);       // 운영에서도
log.warn("재시도 발생: count={}", cnt);      // 주의
log.error("결제 실패: orderId={}", id, e);   // 즉시 확인
```

### application.yml 로그 설정

```yaml
logging:
  level:
    root: info                     # 전체: INFO 이상
    com.example.demo: debug        # 내 코드: DEBUG까지
```

---

## 6장. 지금까지 한 일 돌아보기 🟢

지금 만든 코드에는 **앞으로 배울 것들의 씨앗**이 담겨 있다:

| 지금 코드 | 문제점 | 해결 주제 |
|-----------|--------|----------|
| `new HashMap<>()` | Spring이 관리 안 함 | 04. IoC와 DI |
| 모든 곳에 `log.info()` | 반복 코드 | 05. AOP |
| `throw new RuntimeException()` | 에러 형식 통일 안 됨 | 06. 예외 처리 |
| 모든 코드가 Controller에 | 계층 분리 안 됨 | 09. Layered Architecture |
| Student를 그대로 반환 | 내부 엔티티 노출 | 11. DTO와 Validation |

**지금은 몰라도 괜찮다.** 04번부터 하나씩 해결하면서 체감하게 될 것이다!

---

## 면접 대비

### 🔴 필수

**Q: "@RestController와 @Controller의 차이는?"**

> `@RestController`는 `@Controller` + `@ResponseBody`의 조합입니다. `@Controller`는 View(HTML)를 반환하고, `@RestController`는 데이터(JSON)를 반환합니다. REST API 서버에서는 `@RestController`를 사용합니다.

**Q: "@PathVariable과 @RequestParam의 차이는?"**

> `@PathVariable`은 URL 경로의 변수(`/users/{id}`)를 받고, `@RequestParam`은 쿼리 파라미터(`/users?name=kim`)를 받습니다. 리소스를 식별할 때는 PathVariable, 필터링/정렬 조건에는 RequestParam을 사용합니다.

**Q: "@RequestBody는 언제 쓰나요?"**

> POST, PUT 요청에서 클라이언트가 보낸 JSON을 Java 객체로 변환할 때 사용합니다. Jackson 라이브러리가 자동으로 JSON → 객체 변환을 해주고, `spring-boot-starter-web`에 이미 포함되어 있습니다.

### 🟡 개념

**Q: "Log Level을 설명해주세요"**

> TRACE < DEBUG < INFO < WARN < ERROR 5단계가 있습니다. 설정한 레벨 이상만 출력됩니다. 개발에서는 DEBUG, 운영에서는 INFO나 WARN으로 설정합니다. `System.out.println()` 대신 Logger를 써야 레벨 구분, 파일 저장, 성능 최적화가 가능합니다.

---

## 정리: 이것만 기억하기

```
🎯 REST API 만드는 패턴:

@RestController           ← "이 클래스가 API다"
@RequestMapping("/xxx")   ← "공통 URL 접두사"

@PostMapping              ← 생성 (Create)
@GetMapping               ← 조회 (Read)
@PutMapping               ← 수정 (Update)
@DeleteMapping            ← 삭제 (Delete)

파라미터 받기:
  /students/42        → @PathVariable
  /students?grade=3   → @RequestParam
  POST + JSON Body    → @RequestBody
```

---

> 🎯 **다음 주제**: 04번 "IoC와 DI" — 지금은 `new HashMap()`으로 직접 객체를 만들었다. Spring이 대신 관리해주는 방법을 배운다!

