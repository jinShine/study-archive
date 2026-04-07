# Codex V 커리큘럼

기준 커리큘럼과 **주제, 번호, 순서, 범위는 동일**합니다.

차이는 설명 방식입니다.

- 기존 버전: 주제별 정리 중심
- Codex V 버전: 개념 연결, 실무 판단, 면접 설명, 과제 중심

---

## 로드맵

``` 
Phase 1: 기초 체력        ██████████ (01~06)   ✅ 완료
Phase 2: API 개발         ██████████ (07~16)   ✅ 완료
Phase 1~2 Review          ██████████           ⏳ 진행 중
Phase 3: 데이터베이스      ██████████ (17~26)   ✅ 준비 완료
Phase 4: 실전 심화        ██████████ (27~32)   ⬜ 예정
Phase 5: 배포 & 운영      ██████████ (33~39)   ⬜ 예정
Phase 6: 미니 프로젝트     ██████████ (40~44)   ⬜ 예정
```

---

## Phase 1. 기초 체력

| # | 주제 | 핵심 키워드 | 상태 |
|---|---|---|---|
| 01 | Servlet, Spring, Spring Boot | POJO, DispatcherServlet, AutoConfiguration | ✅ |
| 02 | Resources 폴더 구조 | static, templates, application.yml, profile | ✅ |
| 03 | 첫 번째 REST API 만들기 | @RestController, JSON, Logging, Postman | ✅ |
| 04 | IoC와 DI 깊게 파기 | Bean, ApplicationContext, 생성자 주입 | ✅ |
| 05 | AOP 실전 | @Aspect, Pointcut, Proxy, Around Advice | ✅ |
| 06 | 예외 처리 전략 | @ExceptionHandler, @RestControllerAdvice, ErrorResponse | ✅ |

---

## Phase 2. API 개발

| # | 주제 | 핵심 키워드 | 상태 |
|---|---|---|---|
| 07 | HTTP 기초와 REST 설계 원칙 | Method, Status, URI, Idempotent | ✅ |
| 08 | Spring MVC 요청/응답 흐름 | DispatcherServlet, ArgumentResolver, MessageConverter | ✅ |
| 09 | Layered 아키텍처와 DAO 패턴 | Controller-Service-Repository, 책임 분리 | ✅ |
| 10 | Lombok 활용 | @Getter, @Builder, @RequiredArgsConstructor | ✅ |
| 11 | DTO와 Validation | Request DTO, Response DTO, @Valid, BindingResult | ✅ |
| 12 | MapStruct | @Mapper, @Mapping, 컴파일 타임 매핑 | ✅ |
| 13 | ResponseEntity와 API 응답 표준화 | ResponseEntity, ApiResponse, 헤더 제어 | ✅ |
| 14 | 파일 업로드/다운로드 | MultipartFile, Resource, 저장 전략 | ✅ |
| 15 | API 문서화 | SpringDoc, Swagger UI, OpenAPI 3.0 | ✅ |
| 16 | 디버깅 완벽 가이드 | Breakpoint, Watches, Call Stack, 조건부 BP | ✅ |

---

## Phase 3. 데이터베이스

| # | 주제 | 핵심 키워드 | 상태 |
|---|---|---|---|
| 17 | RDBMS 기초와 SQL | DDL, DML, JOIN, Index | ✅ |
| 18 | SQL 심화 | Subquery, Window Function, CTE, EXPLAIN | ✅ |
| 19 | DB 모델링과 정규화 | ERD, 정규화, 반정규화, 테이블 설계 | ✅ |
| 20 | JPA 기초 | ORM, Entity, @Id, ddl-auto | ✅ |
| 21 | JPA 동작 원리 | 영속성 컨텍스트, Dirty Checking, Proxy | ✅ |
| 22 | 트랜잭션과 동시성 | @Transactional, 격리수준, 락 전략 | ✅ |
| 23 | Spring Data JPA | JpaRepository, Pageable, @Query | ✅ |
| 24 | 연관 관계 매핑과 N+1 문제 | Fetch Join, EntityGraph, Batch Size | ✅ |
| 25 | QueryDSL | QClass, 동적 쿼리, Projection | ✅ |
| 26 | Spring vs Hibernate 총정리 | 트랜잭션 경계, Dirty Checking, flush, readOnly | ✅ |

---

## Phase 4. 실전 심화

| # | 주제 | 핵심 키워드 | 상태 |
|---|---|---|---|
| 27 | 인증/인가 기초 | SecurityFilterChain, 세션 vs JWT, CORS | ⬜ |
| 28 | JWT 인증 구현 | Access Token, Refresh Token, Filter | ⬜ |
| 29 | 테스트 코드 작성 | JUnit 5, Mockito, WebMvcTest, SpringBootTest | ⬜ |
| 30 | 캐싱과 성능 | @Cacheable, Redis, TTL, Eviction | ⬜ |
| 31 | 비동기와 이벤트 기반 설계 | @Async, EventListener, CompletableFuture | ⬜ |
| 32 | 외부 API 연동 | RestClient, WebClient, Retry, Circuit Breaker | ⬜ |

---

## Phase 5. 배포 & 운영

| # | 주제 | 핵심 키워드 | 상태 |
|---|---|---|---|
| 33 | Git 브랜치 전략과 협업 | Git Flow, PR, Commit Convention | ⬜ |
| 34 | Docker 기초 | Dockerfile, Compose, 이미지 빌드 | ⬜ |
| 35 | CI/CD 파이프라인 | GitHub Actions, Build, Test, Deploy | ⬜ |
| 36 | 클라우드 배포 | AWS EC2, RDS, 환경변수, 보안 그룹 | ⬜ |
| 37 | 모니터링과 로그 관리 | Actuator, Prometheus, Grafana | ⬜ |
| 38 | 서버 최적화와 유지보수 | 커넥션 풀, JVM, 부하 테스트, 프로파일링 | ⬜ |
| 39 | API 보안 체크리스트 | HTTPS, Rate Limiting, OWASP Top 10 | ⬜ |

---

## Phase 6. 미니 프로젝트

| # | 주제 | 설명 | 상태 |
|---|---|---|---|
| 40 | 프로젝트 설계 | 요구사항 분석, ERD, API 명세서 | ⬜ |
| 41 | 게시판 API 구현 | CRUD, 검색, 페이징, 파일 첨부 | ⬜ |
| 42 | 인증 시스템 통합 | 회원가입, 로그인, 권한 처리 | ⬜ |
| 43 | 테스트 & 문서화 | 테스트 코드, Swagger, README | ⬜ |
| 44 | 배포 & 회고 | Docker, CI/CD, 회고 정리 | ⬜ |

---

## Codex V 학습 방식

각 주제는 아래 6개 질문에 답하도록 설계됩니다.

1. 왜 이 기술이 필요한가
2. 내부에서 무엇이 움직이는가
3. 최소 예제로 어떻게 확인하는가
4. 실무에서는 어디를 조심해야 하는가
5. 면접에서는 어떤 문장으로 설명하는가
6. 직접 바꿔보면 무엇이 학습되는가
