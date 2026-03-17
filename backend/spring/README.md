# Spring Boot 부트캠프 학습 노트

백엔드 부트캠프에서 배운 내용을 키워드 중심으로 정리한 학습 자료입니다.

> 📋 [전체 커리큘럼 보기](./CURRICULUM.md) — 6단계, 43개 주제

---

## Phase 1: 기초 체력 ✅

| # | 주제 | 날짜 | 키워드 |
|---|------|------|--------|
| 01 | [Servlet, Spring, Spring Boot](./phase1-기초체력/01-servlet-spring-springboot/) | 2026-02-23 | POJO, AOP, WebMVC, DispatcherServlet, @SpringBootApplication, @Configuration, @Bean 등 |
| 02 | [Resources 폴더 구조](./phase1-기초체력/02-resources/) | 2026-02-23 | static, public, templates, META-INF, application.yml, Profile 등 |
| 03 | [첫 번째 REST API 만들기](./phase1-기초체력/03-first-rest-api/) | 2026-02-24 | @RestController, @GetMapping, @PostMapping, @PathVariable, @RequestBody, @Slf4j, Logging, Postman 등 |
| 04 | [IoC와 DI 깊게 파기](./phase1-기초체력/04-ioc-and-di/) | 2026-02-27 | @Component, @Autowired, @Qualifier, @Primary, Bean Lifecycle, Scope, @RequiredArgsConstructor 등 |
| 05 | [AOP 실전](./phase1-기초체력/05-aop/) | 2026-03-04 | @Aspect, @Around, Pointcut, @annotation, JoinPoint, Proxy, Self-invocation 등 |
| 06 | [예외 처리 전략](./phase1-기초체력/06-exception-handling/) | 2026-03-04 | @ExceptionHandler, @RestControllerAdvice, BusinessException, ErrorResponse, HTTP Status Code 등 |
| 🔨 | [**Phase 1 복습 실습**](./phase1-기초체력/phase1-practice/) | 2026-03-04 | 주문 API 직접 만들기 — Phase 1 전체 복습 |

---

## Phase 2: API 개발 ✅

| # | 주제 | 날짜 | 키워드 |
|---|------|------|--------|
| 07 | [HTTP 기초와 REST 설계 원칙](./phase2-API개발/07-http-and-rest/) | 2026-03-05 | HTTP Method, Status Code, URI 설계, REST, @PathVariable, @RequestParam, ResponseEntity 등 |
| 08 | [Spring MVC 요청/응답 흐름](./phase2-API개발/08-spring-mvc-flow/) | 2026-03-05 | @RequestMapping, @PathVariable, @RequestParam, @RequestBody, @ResponseBody, Jackson, HttpMessageConverter 등 |
| 09 | [Layered 아키텍처와 DAO 패턴](./phase2-API개발/09-layered-architecture-dao/) | 2026-03-06 | Controller-Service-Repository 계층, DAO vs Repository, 의존성 방향, 패키지 구조 등 |
| 10 | [Lombok 활용](./phase2-API개발/10-lombok/) | 2026-03-08 | @Getter, @Setter, @Builder, @RequiredArgsConstructor, @Data, @Slf4j, 실무 추천 조합 등 |
| 11 | [DTO와 Validation](./phase2-API개발/11-dto-and-validation/) | 2026-03-08 | @Valid, @NotBlank, @Email, @Size, DTO 설계, 커스텀 Validator, 에러 응답 처리 등 |
| 12 | [MapStruct — 객체 매핑 자동화](./phase2-API개발/12-mapstruct/) | 2026-03-09 | @Mapper, @Mapping, Entity↔DTO 자동 변환, 컴파일 타임 매핑, @MappingTarget 등 |
| 13 | [ResponseEntity와 API 응답 표준화](./phase2-API개발/13-responseentity/) | 2026-03-11 | ResponseEntity, ApiResponse, 공통 응답 포맷, 페이징 응답, 에러 응답 통일 등 |
| 14 | [파일 업로드/다운로드](./phase2-API개발/14-file-upload-download/) | 2026-03-12 | MultipartFile, Resource, Content-Disposition, UUID 파일명, 다중 업로드, 저장 전략 등 |
| 15 | [API 문서화](./phase2-API개발/15-api-docs/) | 2026-03-12 | SpringDoc, Swagger UI, OpenAPI 3.0, @Operation, @Schema, @Tag, 트러블슈팅 등 |
| 16 | [디버깅 완벽 가이드](./phase2-API개발/16-debugging/) | 2026-03-12 | Breakpoint, Step Over/Into/Out, Variables, Watches, 조건부 BP, 예외 BP 등 |

### 복습 프로젝트

| 프로젝트 | 범위 | 설명 |
|---|---|---|
| [Phase 1~2 복습: 학습 일지 API](./phase1-2-review/) | 01~16번 전체 | Phase 1~2에서 배운 16개 주제를 하나의 프로젝트에 전부 적용하는 실전 복습 |

---

## Phase 3: 데이터베이스 ← 진행 중

| # | 주제 | 날짜 | 키워드 |
|---|------|------|--------|
| 17 | [RDBMS 기초와 SQL](./phase3-데이터베이스/17-rdbms-and-sql/) | 2026-03-17 | RDBMS, MySQL, DDL, DML, SELECT, JOIN, INDEX, 정규화, ERD |
