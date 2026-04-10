# 08. Spring MVC 요청/응답 흐름 — "요청이 들어오면 어떤 순서로 처리되나?"

> **키워드**: `DispatcherServlet` `HandlerMapping` `HandlerAdapter` `MessageConverter` `요청 흐름`

---

## 핵심만 한 문장

**모든 HTTP 요청은 DispatcherServlet이 받아서 적절한 Controller에 전달한다. 이 흐름을 아는 게 Spring을 아는 것이다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~2장 (전체 흐름, DispatcherServlet) | 면접 단골 + Spring 이해의 핵심 |
| 🟡 이해 | 3장 (어노테이션별 동작) | 03번에서 배운 것의 "왜" |
| 🟢 참고 | 4장 (ModelAttribute, Header/Cookie) | 특수 상황에서 필요 |

> 💡 **03번과의 연결**: `@GetMapping("/hello")`를 쓰면 알아서 동작했다. 그런데 "왜 알아서 되는 건지?" 그 내부 흐름을 배운다!

---

## 1장. Spring MVC 전체 흐름 (Big Picture) 🔴

### 비유

```
DispatcherServlet = 식당의 홀 매니저

1. 손님(요청)이 들어옴
2. 홀 매니저가 "어떤 테이블(Controller)로 안내할지" 결정
3. 웨이터(HandlerAdapter)가 주문을 전달
4. 주방(Service)에서 요리
5. 홀 매니저가 결과를 손님에게 전달
```

### 요청 → 응답 전체 흐름

```
Client (브라우저/Postman)
    │
    │  GET /api/students/1
    ▼
┌─────────────────────────────────────┐
│         DispatcherServlet            │  ← 모든 요청을 여기서 받음
│  "GET /api/students/1 요청이 왔네"   │
└───────────────┬─────────────────────┘
                │
    ① HandlerMapping에게 물어봄
       "이 URL 처리할 Controller가 누구야?"
                │
                ▼
    ② HandlerAdapter가 실행
       StudentController.getById(1) 호출
                │
                ▼
    ③ Controller → Service → Repository
       실제 비즈니스 로직 실행
                │
                ▼
    ④ MessageConverter가 변환
       Java 객체 → JSON 변환 (Jackson)
                │
                ▼
┌─────────────────────────────────────┐
│         DispatcherServlet            │
│  "응답 보내줄게"                     │
└───────────────┬─────────────────────┘
                │
                ▼
Client ← { "id": 1, "name": "홍길동" }
```

### 각 단계별 역할

| 단계 | 컴포넌트 | 역할 |
|------|---------|------|
| ① | **HandlerMapping** | URL → Controller 메서드 매핑 찾기 |
| ② | **HandlerAdapter** | Controller 메서드 실행 |
| ③ | **Controller/Service** | 비즈니스 로직 처리 |
| ④ | **MessageConverter** | 객체 ↔ JSON 변환 (Jackson) |

---

## 2장. DispatcherServlet — Spring의 심장 🔴

### 왜 중요한가?

```
❌ DispatcherServlet 없이:
  /students → StudentServlet
  /orders   → OrderServlet
  /products → ProductServlet
  → 서블릿마다 따로 등록해야 함!

✅ DispatcherServlet 있으면:
  /students → DispatcherServlet → StudentController
  /orders   → DispatcherServlet → OrderController
  /products → DispatcherServlet → ProductController
  → 모든 요청을 하나가 받아서 분배!
```

### 코드에서 확인

```java
// 우리가 만든 코드
@RestController
@RequestMapping("/api/students")
public class StudentController {
    
    @GetMapping("/{id}")
    public Student getById(@PathVariable Long id) {
        return service.getById(id);
    }
}
```

**내부 동작 추적:**

```
GET /api/students/1 요청
  ↓
DispatcherServlet: "이 URL에 매핑된 메서드 찾자"
  ↓
HandlerMapping: "@GetMapping("/api/students/{id}") 찾았다!"
  → StudentController.getById()
  ↓
HandlerAdapter: "파라미터 바인딩하자"
  → @PathVariable Long id = 1
  ↓
StudentController.getById(1) 실행
  → Student 객체 반환
  ↓
MessageConverter (Jackson): "Student → JSON 변환"
  → { "id": 1, "name": "홍길동" }
  ↓
HTTP 200 OK + JSON 응답
```

---

## 3장. 어노테이션별 동작 원리 🟡

### @PathVariable — URL에서 값 추출

```java
// GET /api/students/42
@GetMapping("/{id}")
public Student getById(@PathVariable Long id) {
    // HandlerAdapter가 URL의 "42"를 Long 42로 변환해서 주입
}
```

```
내부 동작:
  URL: /api/students/42
  패턴: /api/students/{id}
  ↓
  HandlerAdapter: "{id}" 자리에 "42" 있네 → Long.parseLong("42") → 42
  ↓
  getById(42) 호출
```

### @RequestParam — 쿼리에서 값 추출

```java
// GET /api/students?grade=3&name=홍
@GetMapping
public List<Student> search(
    @RequestParam(required = false) Integer grade,
    @RequestParam(required = false) String name
) {
    // HandlerAdapter가 쿼리 파라미터를 파싱해서 주입
}
```

```
내부 동작:
  URL: /api/students?grade=3&name=홍
  ↓
  HandlerAdapter: "grade=3" → Integer.parseInt("3") → 3
                  "name=홍" → String "홍"
  ↓
  search(3, "홍") 호출
```

### @RequestBody — JSON을 객체로 변환

```java
// POST /api/students + JSON Body
@PostMapping
public Student create(@RequestBody Student student) {
    // MessageConverter(Jackson)가 JSON → Student 객체로 변환
}
```

```
내부 동작:
  Body: { "name": "홍길동", "email": "hong@example.com" }
  ↓
  MessageConverter (Jackson):
    JSON의 "name" → Student.setName("홍길동")
    JSON의 "email" → Student.setEmail("hong@example.com")
  ↓
  create(student) 호출
```

### @ResponseBody — 객체를 JSON으로 변환

```java
// @RestController = @Controller + @ResponseBody
// 반환값이 자동으로 JSON 변환됨

@GetMapping("/{id}")
public Student getById(@PathVariable Long id) {
    return service.getById(id);  // Student 객체 반환
    // → Jackson이 자동으로 JSON 변환
}
```

```
내부 동작:
  Student { id=1, name="홍길동" }
  ↓
  MessageConverter (Jackson):
    Student.getId() → "id": 1
    Student.getName() → "name": "홍길동"
  ↓
  { "id": 1, "name": "홍길동" }
```

---

## 4장. 특수 어노테이션 🟢

### @ModelAttribute — 폼 데이터 바인딩

```java
// HTML 폼에서 보낸 데이터를 객체로 변환 (REST API에서는 거의 안 씀)
@PostMapping("/form")
public String submitForm(@ModelAttribute Student student) {
    // Content-Type: application/x-www-form-urlencoded
    // name=홍길동&email=hong@example.com → Student 객체
}
```

### @RequestHeader — 헤더 값 받기

```java
@GetMapping("/info")
public String getInfo(@RequestHeader("Authorization") String token,
                      @RequestHeader("User-Agent") String userAgent) {
    // 요청 헤더에서 값을 꺼냄
}
```

### @CookieValue — 쿠키 값 받기

```java
@GetMapping("/profile")
public String getProfile(@CookieValue(value = "sessionId", required = false) String sessionId) {
    // 쿠키에서 값을 꺼냄 (JWT 쓰면 거의 안 씀)
}
```

---

## 면접 대비

### 🔴 필수

**Q: "Spring MVC의 요청 처리 흐름을 설명해주세요"**

> 모든 HTTP 요청은 DispatcherServlet이 받습니다. HandlerMapping이 URL에 매핑된 Controller 메서드를 찾고, HandlerAdapter가 파라미터를 바인딩해서 메서드를 실행합니다. Controller가 반환한 객체는 MessageConverter(Jackson)가 JSON으로 변환해서 응답합니다.

**Q: "DispatcherServlet이 뭔가요?"**

> 모든 HTTP 요청을 가장 먼저 받는 프론트 컨트롤러입니다. 직접 비즈니스 로직을 처리하지 않고, URL 패턴을 보고 적절한 Controller에 요청을 분배하는 역할입니다. Spring Boot에서는 자동으로 등록됩니다.

**Q: "@RestController와 @Controller의 차이는?"**

> `@Controller`는 View(HTML)를 반환하고, `@RestController`는 `@Controller` + `@ResponseBody`로 데이터(JSON)를 반환합니다. REST API에서는 `@RestController`를 사용합니다.

---

## 정리: 이것만 기억하기

```
🎯 Spring MVC = DispatcherServlet이 교통정리

요청 흐름:
  Client → DispatcherServlet
    → HandlerMapping (URL → Controller 찾기)
    → HandlerAdapter (파라미터 바인딩 + 실행)
    → Controller → Service → Repository
    → MessageConverter (객체 → JSON)
  → Client

어노테이션 정리:
  @PathVariable  ← URL 경로 변수 (/students/{id})
  @RequestParam  ← 쿼리 파라미터 (?grade=3)
  @RequestBody   ← JSON Body → 객체
  @ResponseBody  ← 객체 → JSON (RestController면 자동)
```

---

> 🎯 **다음 주제**: 09번 "Layered 아키텍처" — Controller/Service/Repository 3계층 분리 패턴을 배운다!

