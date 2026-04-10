# 11. DTO와 Validation — "입구에서 걸러내기"

> **키워드**: `DTO` `@Valid` `@NotBlank` `@NotNull` `@Size` `@Email` `Request/Response DTO`

---

## 핵심만 한 문장

**Entity를 직접 노출하지 않고 DTO로 감싸고, @Valid로 잘못된 입력을 서버에 들어오기 전에 차단한다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~3장 (왜 DTO, Request/Response DTO, @Valid) | 모든 API에 필수 |
| 🟡 이해 | 4장 (커스텀 Validator) | 복잡한 검증 시 필요 |
| 🟢 참고 | 5장 (그룹 검증) | 특수 상황 |

---

## 1장. Entity를 직접 반환하면 안 되는 이유 🔴

### 비유

```
Entity = 주민등록증 (모든 정보 포함)
DTO    = 명함 (필요한 정보만)

API 응답에 주민등록증을 주면? → 주민번호, 주소 다 노출!
명함만 주면?                → 이름, 이메일만 노출 (안전!)
```

### 코드로 보면

```java
// ❌ Entity 직접 반환 (위험)
@GetMapping("/{id}")
public Student getById(@PathVariable Long id) {
    return service.getById(id);
    // → { "id": 1, "name": "홍길동", "password": "1234", "role": "USER" }
    //   password가 노출됨!
}

// ✅ DTO로 감싸서 반환 (안전)
@GetMapping("/{id}")
public StudentResponse getById(@PathVariable Long id) {
    Student student = service.getById(id);
    return new StudentResponse(student.getId(), student.getName(), student.getEmail());
    // → { "id": 1, "name": "홍길동", "email": "hong@example.com" }
    //   필요한 정보만!
}
```

---

## 2장. Request DTO와 Response DTO 🔴

### 구조

```
클라이언트 → [Request DTO] → Controller → Service → Repository → DB
클라이언트 ← [Response DTO] ← Controller ← Service ← Repository ← DB
```

### 따라 쳐보기

```java
// Request DTO — 클라이언트가 보내는 데이터
@Data
public class StudentCreateRequest {
    private String name;
    private String email;
    private int grade;
    // id는 서버가 생성하므로 없음!
    // password는 별도 API에서 처리
}
```

```java
// Response DTO — 클라이언트에게 보내는 데이터
@Data
@AllArgsConstructor
public class StudentResponse {
    private Long id;
    private String name;
    private String email;
    private int grade;
    // password는 절대 포함하지 않음!
    
    // Entity → DTO 변환 (정적 팩토리 메서드)
    public static StudentResponse from(Student student) {
        return new StudentResponse(
            student.getId(),
            student.getName(),
            student.getEmail(),
            student.getGrade()
        );
    }
}
```

```java
// Controller에서 사용
@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {
    
    private final StudentService service;
    
    @PostMapping
    public ResponseEntity<StudentResponse> create(@RequestBody StudentCreateRequest req) {
        Student student = service.create(req);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(StudentResponse.from(student));
    }
    
    @GetMapping("/{id}")
    public StudentResponse getById(@PathVariable Long id) {
        return StudentResponse.from(service.getById(id));
    }
}
```

---

## 3장. @Valid — 입력값 검증 🔴

### 의존성 추가

```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-validation'
}
```

### DTO에 검증 규칙 추가

```java
@Data
public class StudentCreateRequest {
    
    @NotBlank(message = "이름은 필수입니다")
    private String name;
    
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "이메일 형식이 올바르지 않습니다")
    private String email;
    
    @Min(value = 1, message = "학년은 1 이상이어야 합니다")
    @Max(value = 6, message = "학년은 6 이하이어야 합니다")
    private int grade;
}
```

### Controller에 @Valid 추가

```java
@PostMapping
public ResponseEntity<StudentResponse> create(
    @Valid @RequestBody StudentCreateRequest req  // ← @Valid 추가!
) {
    Student student = service.create(req);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(StudentResponse.from(student));
}
```

### 테스트

```bash
# ❌ 이름 없이 요청
curl -X POST http://localhost:8080/api/students \
  -H "Content-Type: application/json" \
  -d '{"email":"hong@example.com", "grade":3}'

# 응답: 400 Bad Request
# (06번에서 만든 GlobalExceptionHandler가 처리)
```

### 자주 쓰는 검증 어노테이션

| 어노테이션 | 용도 | 예시 |
|-----------|------|------|
| `@NotNull` | null 불가 | 숫자, 객체 |
| `@NotBlank` | null + 빈 문자열 불가 | 문자열 (가장 많이 씀) |
| `@NotEmpty` | null + 빈 컬렉션 불가 | 리스트 |
| `@Email` | 이메일 형식 | 이메일 필드 |
| `@Size(min, max)` | 길이 제한 | 비밀번호 (8~20자) |
| `@Min` / `@Max` | 숫자 범위 | 학년 (1~6) |
| `@Pattern` | 정규식 | 전화번호 형식 |

---

## 4장. 커스텀 Validator 🟡

기본 어노테이션으로 부족할 때:

```java
// 커스텀 어노테이션
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneNumberValidator.class)
public @interface ValidPhoneNumber {
    String message() default "전화번호 형식이 올바르지 않습니다";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// Validator 구현
public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return true;  // null은 @NotBlank가 처리
        return value.matches("^01[0-9]-\\d{4}-\\d{4}$");
    }
}

// DTO에서 사용
@Data
public class StudentCreateRequest {
    @ValidPhoneNumber
    private String phone;
}
```

---

## 면접 대비

### 🔴 필수

**Q: "DTO를 쓰는 이유는?"**

> Entity를 직접 노출하면 민감한 필드(password 등)가 클라이언트에 전달될 수 있고, Entity 구조가 바뀌면 API 응답도 바뀌어서 클라이언트에 영향을 줍니다. DTO로 감싸면 필요한 필드만 노출하고, Entity와 API 응답을 독립적으로 관리할 수 있습니다.

**Q: "@Valid 동작 원리는?"**

> Controller 메서드의 파라미터에 `@Valid`를 붙이면 Spring이 해당 객체의 필드에 선언된 검증 어노테이션(`@NotBlank`, `@Email` 등)을 확인합니다. 검증에 실패하면 `MethodArgumentNotValidException`이 발생하고, `@RestControllerAdvice`에서 400 응답으로 처리합니다.

---

## 정리: 이것만 기억하기

```
🎯 DTO = "필요한 정보만 주고받기"
🎯 @Valid = "잘못된 입력은 입구에서 차단"

패턴:
  Request DTO  → 클라이언트가 보내는 것 (@Valid로 검증)
  Response DTO → 클라이언트에게 주는 것 (Entity 숨기기)

실무 규칙:
  ✅ Entity는 절대 직접 반환하지 않는다
  ✅ Request/Response DTO를 분리한다
  ✅ @Valid + @NotBlank/@Email 등으로 입력 검증
  ✅ 검증 실패 → GlobalExceptionHandler가 400 반환
```

---

> 🎯 **다음 주제**: 12번 "MapStruct" — Entity ↔ DTO 변환을 자동화하는 도구를 배운다!

