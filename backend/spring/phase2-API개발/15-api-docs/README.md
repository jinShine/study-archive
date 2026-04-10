# 15. API 문서화 🟡 — "Swagger로 API 명세서 자동 생성"

> **키워드**: `SpringDoc` `Swagger` `OpenAPI 3.0` `@Operation` `@Schema`

---

## 핵심만 한 문장

**코드에 어노테이션만 달면 API 명세서가 자동 생성되고, 브라우저에서 바로 테스트까지 가능하다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🟡 이해 | 1~2장 (설정, 기본 사용) | 팀 프로젝트에서 필수 |
| 🟢 참고 | 3장 (커스텀 설정) | 꾸미기 |

---

## 1장. 설정 (1분 컷)

### 의존성 추가

```gradle
dependencies {
    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0'
}
```

### 서버 실행 후 접속

```
http://localhost:8080/swagger-ui.html
```

**끝!** Controller에 있는 모든 API가 자동으로 문서화됨.

---

## 2장. 어노테이션으로 설명 추가

### Controller에 설명

```java
@RestController
@RequestMapping("/api/students")
@Tag(name = "Student", description = "학생 관리 API")
@RequiredArgsConstructor
public class StudentController {
    
    @Operation(summary = "학생 등록", description = "새로운 학생을 등록합니다")
    @PostMapping
    public ResponseEntity<StudentResponse> create(
        @Valid @RequestBody StudentCreateRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(service.create(req));
    }
    
    @Operation(summary = "학생 상세 조회", description = "ID로 학생을 조회합니다")
    @GetMapping("/{id}")
    public StudentResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }
}
```

### DTO에 설명

```java
@Data
@Schema(description = "학생 등록 요청")
public class StudentCreateRequest {
    
    @Schema(description = "학생 이름", example = "홍길동")
    @NotBlank
    private String name;
    
    @Schema(description = "이메일", example = "hong@example.com")
    @Email
    private String email;
    
    @Schema(description = "학년 (1~6)", example = "3")
    @Min(1) @Max(6)
    private int grade;
}
```

### Swagger UI 결과

```
브라우저에서 http://localhost:8080/swagger-ui.html 접속하면:

┌─────────────────────────────────────┐
│ Student - 학생 관리 API              │
├─────────────────────────────────────┤
│ POST /api/students   학생 등록       │
│ GET  /api/students   전체 조회       │
│ GET  /api/students/{id}  상세 조회   │
│ DELETE /api/students/{id}  삭제      │
└─────────────────────────────────────┘

각 API를 클릭하면 → "Try it out" 버튼으로 바로 테스트!
```

---

## 3장. 설정 커스텀 🟢

```yaml
# application.yml
springdoc:
  swagger-ui:
    path: /swagger-ui.html     # Swagger UI 경로
    tags-sorter: alpha          # 태그 알파벳 정렬
    operations-sorter: alpha    # API 알파벳 정렬
  api-docs:
    path: /v3/api-docs          # OpenAPI JSON 경로
```

```java
// OpenAPI 설정 (선택)
@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("학생 관리 API")
                .version("1.0.0")
                .description("Spring Boot 학습 프로젝트"));
    }
}
```

---

## 정리

```
🎯 Swagger = API 문서 자동 생성 + 브라우저 테스트

설정: springdoc 의존성 추가 → localhost:8080/swagger-ui.html
꾸미기: @Tag, @Operation, @Schema 어노테이션
```

---

> 🎯 **다음 주제**: 16번 "디버깅 완벽 가이드"

