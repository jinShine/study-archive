# 13. ResponseEntity와 API 응답 표준화 — "모든 API가 같은 형식으로"

> **키워드**: `ResponseEntity` `공통 응답 포맷` `ApiResponse` `HTTP 상태 코드`

---

## 핵심만 한 문장

**모든 API 응답을 `{ success, status, data, message }` 같은 통일된 형식으로 반환하면, 프론트엔드가 편하다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~2장 (ResponseEntity, 공통 응답 포맷) | 모든 프로젝트에 필수 |
| 🟡 이해 | 3장 (페이징 응답) | 목록 API에 필요 |

---

## 1장. ResponseEntity — HTTP 상태 코드 제어 🔴

### 왜 필요한가?

```java
// ❌ 상태 코드 제어 불가 (항상 200)
@PostMapping
public Student create(@RequestBody Student student) {
    return service.create(student);  // → 200 OK (생성인데 200?)
}

// ✅ 상태 코드 제어 가능
@PostMapping
public ResponseEntity<Student> create(@RequestBody Student student) {
    Student created = service.create(student);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);  // → 201 Created
}
```

### 자주 쓰는 패턴

```java
// 200 OK
return ResponseEntity.ok(data);

// 201 Created
return ResponseEntity.status(HttpStatus.CREATED).body(data);

// 204 No Content (삭제 후)
return ResponseEntity.noContent().build();

// 400 Bad Request
return ResponseEntity.badRequest().body(errorResponse);

// 404 Not Found
return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
```

---

## 2장. 공통 응답 포맷 🔴

### 문제: API마다 응답 형식이 다르다

```json
// GET /students/1 → 객체
{ "id": 1, "name": "홍길동" }

// GET /students → 배열
[{ "id": 1 }, { "id": 2 }]

// POST /students → 객체
{ "id": 3, "name": "김길동" }

// DELETE /students/1 → 문자열?
"삭제 완료"

// 프론트: "응답 형식이 다 다르니까 파싱이 힘들어!"
```

### 해결: 공통 응답 포맷

```java
@Data
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private int status;
    private String message;
    private T data;
    
    // 성공 응답
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, 200, "성공", data);
    }
    
    public static <T> ApiResponse<T> created(T data) {
        return new ApiResponse<>(true, 201, "생성 성공", data);
    }
    
    // 실패 응답
    public static <T> ApiResponse<T> error(int status, String message) {
        return new ApiResponse<>(false, status, message, null);
    }
}
```

### 적용

```java
@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {
    
    private final StudentService service;
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> getById(@PathVariable Long id) {
        StudentResponse student = service.getById(id);
        return ResponseEntity.ok(ApiResponse.ok(student));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<StudentResponse>> create(@Valid @RequestBody StudentCreateRequest req) {
        StudentResponse student = service.create(req);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.created(student));
    }
}
```

### 결과

```json
// 모든 API가 같은 형식!
// 성공
{
    "success": true,
    "status": 200,
    "message": "성공",
    "data": { "id": 1, "name": "홍길동" }
}

// 실패
{
    "success": false,
    "status": 404,
    "message": "학생을 찾을 수 없습니다: id=999",
    "data": null
}
```

---

## 3장. 페이징 응답 🟡

```java
// 목록 API는 페이징 정보도 필요
@Data
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private int pageSize;
}
```

```json
// GET /api/students?page=0&size=20
{
    "success": true,
    "status": 200,
    "message": "성공",
    "data": {
        "content": [...],
        "currentPage": 0,
        "totalPages": 5,
        "totalElements": 100,
        "pageSize": 20
    }
}
```

---

## 면접 대비

### 🔴 필수

**Q: "API 응답을 표준화하는 이유는?"**

> 프론트엔드가 모든 API에서 동일한 구조로 응답을 파싱할 수 있기 때문입니다. `success`, `status`, `data`, `message` 같은 공통 필드를 정의하면, 에러 처리도 통일되고 협업이 쉬워집니다.

---

## 정리

```
🎯 ResponseEntity = HTTP 상태 코드 제어
🎯 ApiResponse<T> = 통일된 응답 형식

패턴:
  성공: { success: true, status: 200, data: {...} }
  실패: { success: false, status: 404, message: "..." }
```

---

> 🎯 **다음 주제**: 14번 "파일 업로드/다운로드"

