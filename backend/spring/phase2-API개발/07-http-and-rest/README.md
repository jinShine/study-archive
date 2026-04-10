# 07. HTTP 기초와 REST 설계 원칙 — "API를 잘 만드는 법"

> **키워드**: `HTTP Method` `Status Code` `URI 설계` `REST` `Richardson Maturity Model`

---

## 핵심만 한 문장

**HTTP는 "어떻게 통신하나", REST는 "URL을 어떻게 설계하나" — 이 둘을 알아야 "잘 만든 API"가 된다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~3장 (HTTP 구조, Method, Status Code) | API 개발의 기본 문법 |
| 🔴 필수 | 4장 (REST URI 설계) | 면접 단골 + 코드 리뷰에서 가장 많이 지적됨 |
| 🟡 이해 | 5장 (Richardson Maturity Model) | 개념만 알면 됨 |

> 💡 **03번과의 연결**: CRUD API를 만들었지만, "왜 GET으로 조회하고 POST로 생성하는지" 원리를 모른다. 이번에 배운다!

---

## 1장. HTTP 기본 구조 🔴

### 비유

```
HTTP = 편지 시스템

요청(Request) = 편지 보내기
  → 받는 사람 주소 (URL)
  → 용건 (Method: GET, POST, PUT, DELETE)
  → 내용 (Body)

응답(Response) = 답장 받기
  → 결과 (Status Code: 200, 404, 500)
  → 내용 (Body: JSON)
```

### 요청 구조

```
POST /api/students HTTP/1.1          ← 메서드 + URL
Host: localhost:8080                  ← 서버 주소
Content-Type: application/json        ← "JSON으로 보낼게"
Authorization: Bearer eyJhbG...       ← 인증 토큰

{                                     ← Body (보내는 데이터)
    "name": "홍길동",
    "email": "hong@example.com"
}
```

### 응답 구조

```
HTTP/1.1 201 Created                  ← 상태 코드
Content-Type: application/json        ← "JSON으로 줄게"

{                                     ← Body (응답 데이터)
    "id": 1,
    "name": "홍길동",
    "email": "hong@example.com"
}
```

---

## 2장. HTTP Method — "뭘 하고 싶은 건데?" 🔴

### 비유

```
GET    = "보여줘" (메뉴판 보기)
POST   = "만들어줘" (주문하기)
PUT    = "바꿔줘" (주문 변경)
PATCH  = "일부만 바꿔줘" (토핑만 변경)
DELETE = "취소해줘" (주문 취소)
```

### 5가지 메서드

| Method | 용도 | Body | 멱등성 | 예시 |
|--------|------|------|--------|------|
| **GET** | 조회 | ❌ 없음 | ✅ | `GET /students/1` |
| **POST** | 생성 | ✅ 있음 | ❌ | `POST /students` |
| **PUT** | 전체 수정 | ✅ 있음 | ✅ | `PUT /students/1` |
| **PATCH** | 일부 수정 | ✅ 있음 | ✅ | `PATCH /students/1` |
| **DELETE** | 삭제 | ❌ 없음 | ✅ | `DELETE /students/1` |

### 멱등성(Idempotent)이란?

```
멱등성 = "여러 번 실행해도 결과가 같은 것"

GET /students/1   → 홍길동 (1번 실행)
GET /students/1   → 홍길동 (10번 실행해도 같음) → ✅ 멱등

POST /students    → id=1 생성 (1번 실행)
POST /students    → id=2 생성 (2번 실행하면 다른 결과!) → ❌ 비멱등

DELETE /students/1 → 삭제됨 (1번 실행)
DELETE /students/1 → 이미 없음 (2번 실행해도 결과 같음) → ✅ 멱등
```

---

## 3장. HTTP Status Code — "결과가 어떻게 됐는데?" 🔴

### 분류

```
2xx = 성공 ✅
3xx = 리다이렉트 ↩️
4xx = 클라이언트 잘못 ❌ (너가 잘못 보냄)
5xx = 서버 잘못 💥 (내가 잘못함)
```

### 자주 쓰는 코드

| 코드 | 의미 | 언제? |
|------|------|-------|
| **200** | OK | 조회/수정/삭제 성공 |
| **201** | Created | 생성 성공 (POST) |
| **204** | No Content | 성공했지만 응답 본문 없음 |
| **400** | Bad Request | 잘못된 요청 (Validation 실패) |
| **401** | Unauthorized | 인증 안 됨 (로그인 필요) |
| **403** | Forbidden | 권한 없음 (로그인은 했지만) |
| **404** | Not Found | 리소스 없음 |
| **409** | Conflict | 중복 데이터 |
| **500** | Internal Server Error | 서버 오류 |

### Spring에서 사용

```java
// 200 OK (기본)
@GetMapping("/{id}")
public Student getById(@PathVariable Long id) {
    return service.getById(id);  // 자동으로 200
}

// 201 Created
@PostMapping
public ResponseEntity<Student> create(@RequestBody Student student) {
    Student created = service.create(student);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);  // 201
}

// 204 No Content
@DeleteMapping("/{id}")
public ResponseEntity<Void> delete(@PathVariable Long id) {
    service.delete(id);
    return ResponseEntity.noContent().build();  // 204
}
```

---

## 4장. REST URI 설계 — 면접 단골! 🔴

### 핵심 규칙

```
REST = "URL로 자원(Resource)을 표현하고, Method로 행위를 표현한다"
```

### ❌ 나쁜 예 vs ✅ 좋은 예

```
❌ 동사를 URL에 넣지 마라
  GET /getStudents           → ✅ GET /students
  POST /createStudent        → ✅ POST /students
  POST /deleteStudent/1      → ✅ DELETE /students/1
  GET /getStudentById?id=1   → ✅ GET /students/1

❌ 단수 쓰지 마라 (복수형 사용)
  GET /student               → ✅ GET /students
  GET /student/1             → ✅ GET /students/1

❌ 대문자 쓰지 마라
  GET /Students              → ✅ GET /students
  GET /studyLogs             → ✅ GET /study-logs (케밥 케이스)
```

### URI 설계 패턴

```
컬렉션 (전체):  /students
단건:          /students/{id}
하위 리소스:    /students/{id}/courses
검색:          /students?grade=3&name=홍
페이징:        /students?page=0&size=20&sort=name,asc
```

### 실무 예시

| 기능 | Method | URI |
|------|--------|-----|
| 학생 목록 조회 | GET | `/api/students` |
| 학생 상세 조회 | GET | `/api/students/{id}` |
| 학생 등록 | POST | `/api/students` |
| 학생 수정 | PUT | `/api/students/{id}` |
| 학생 삭제 | DELETE | `/api/students/{id}` |
| 학생의 수강 목록 | GET | `/api/students/{id}/courses` |
| 학생 검색 | GET | `/api/students?name=홍&grade=3` |

---

## 5장. Richardson Maturity Model 🟡

REST API의 성숙도를 4단계로 나눈 모델:

```
Level 0: 하나의 URL에 모든 것
  POST /api → { "action": "getStudent", "id": 1 }

Level 1: URL로 리소스 구분
  POST /api/students/1 → { "action": "get" }

Level 2: HTTP Method 활용 ← 대부분의 프로젝트가 여기!
  GET /api/students/1

Level 3: HATEOAS (링크 포함)
  GET /api/students/1
  → { "name": "홍길동", "_links": { "courses": "/api/students/1/courses" } }
```

**💡 실무에서는 Level 2면 충분하다!** Level 3은 이론적으로 알면 됨.

---

## 면접 대비

### 🔴 필수

**Q: "REST API 설계 원칙을 설명해주세요"**

> URL로 자원을 표현하고, HTTP Method로 행위를 표현합니다. URL에 동사를 쓰지 않고 복수형 명사를 사용합니다. 예를 들어 학생 조회는 `GET /students/1`, 생성은 `POST /students`입니다. 상태 코드도 200, 201, 404 등 의미에 맞게 반환합니다.

**Q: "GET과 POST의 차이는?"**

> GET은 데이터 조회용으로 Body가 없고 멱등성이 있습니다. POST는 데이터 생성용으로 Body에 JSON을 담아 보내고, 호출할 때마다 새로운 리소스가 만들어지므로 멱등하지 않습니다.

**Q: "PUT과 PATCH의 차이는?"**

> PUT은 리소스 전체를 교체하고, PATCH는 일부만 수정합니다. PUT은 보내지 않은 필드가 null로 덮어씌워질 수 있지만, PATCH는 보낸 필드만 변경됩니다.

**Q: "401과 403의 차이는?"**

> 401 Unauthorized는 인증이 안 된 상태(로그인 필요)이고, 403 Forbidden은 인증은 됐지만 권한이 없는 상태입니다. 예를 들어 일반 사용자가 관리자 API에 접근하면 403입니다.

---

## 정리: 이것만 기억하기

```
🎯 HTTP = 통신 규약, REST = URL 설계 규칙

Method:
  GET    = 조회 (Body 없음)
  POST   = 생성 (Body 있음)
  PUT    = 전체 수정
  PATCH  = 일부 수정
  DELETE = 삭제

Status Code:
  200 = 성공, 201 = 생성됨
  400 = 잘못된 요청, 401 = 인증 필요
  403 = 권한 없음, 404 = 못 찾음
  500 = 서버 오류

URI 설계:
  ✅ GET /students (복수형, 명사)
  ❌ GET /getStudents (동사 금지)
  ❌ GET /Student (대문자 금지)
```

---

> 🎯 **다음 주제**: 08번 "Spring MVC 요청/응답 흐름" — GET /students 요청이 들어오면 Spring 내부에서 어떤 순서로 처리되는지 배운다!

