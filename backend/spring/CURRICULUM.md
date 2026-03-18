# Spring Boot 백엔드 개발자 커리큘럼

> 목표: Spring Boot 기반 백엔드 개발자로서 **혼자서 REST API 서버를 설계·구현·배포**할 수 있는 수준

---

## 로드맵 한눈에 보기

```
Phase 1: 기초 체력        ██████████ (01~06)   ✅ 완료!
Phase 2: API 개발         ██████████ (07~16)   ✅ 완료!
Phase 3: 데이터베이스      ██████████ (17~26)   ← 지금 여기
Phase 4: 실전 심화        ██████████ (27~32)
Phase 5: 배포 & 운영      ██████████ (33~39)
Phase 6: 미니 프로젝트     ██████████ (40~44)
```

---

## Phase 1: 기초 체력 — Spring의 뼈대 이해하기

> 스프링이 왜 존재하는지, 어떻게 돌아가는지 체감하는 단계

| # | 주제 | 핵심 키워드 | 상태 |
|---|------|------------|------|
| 01 | Servlet, Spring, Spring Boot | POJO, AOP, WebMVC, DispatcherServlet | ✅ 완료 |
| 02 | Resources 폴더 구조 | static, templates, application.yml, Profile | ✅ 완료 |
| 03 | 첫 번째 REST API 만들기 | @RestController, @GetMapping, @PostMapping, Logging, Postman | ✅ 완료 |
| 04 | **IoC와 DI 깊게 파기** | @Component, @Autowired, @Qualifier, Bean Lifecycle, Scope | ✅ 완료 |
| 05 | **AOP 실전** | @Aspect, @Before/@After/@Around, Pointcut 표현식, 로깅/트랜잭션 적용 | ✅ 완료 |
| 06 | **예외 처리 전략** | @ExceptionHandler, @ControllerAdvice, @RestControllerAdvice, ErrorResponse 설계 | ✅ 완료 |

> 📝 **보충 예정 (02, 03)**
> - 02에 추가: `@ConfigurationProperties`, Jasypt 암호화, 설정 우선순위, 환경별 설정 전략
> - 03에 추가: MDC(요청 추적), `logback-spring.xml`, JSON 구조화 로깅, 비동기 로깅

---

## Phase 2: API 개발 — REST API 제대로 만들기 ✅ 완료

> CRUD를 넘어서, "잘 만든 API"가 뭔지 아는 단계

| # | 주제 | 핵심 키워드 | 상태 |
|---|------|------------|------|
| 07 | **HTTP 기초와 REST 설계 원칙** | HTTP Method, Status Code, URI 설계, Richardson Maturity Model | ✅ 완료 |
| 08 | **Spring MVC 요청/응답 흐름** | @RequestMapping, @PathVariable, @RequestParam, @RequestBody, @ResponseBody | ✅ 완료 |
| 09 | **Layered 아키텍처와 DAO 패턴** | Controller-Service-Repository 계층, DAO vs Repository, 의존성 방향 | ✅ 완료 |
| 10 | **Lombok 활용** | @Getter/@Setter, @Builder, @RequiredArgsConstructor, @Data, @Slf4j, 주의사항 | ✅ 완료 |
| 11 | **DTO와 Validation** | DTO 패턴, @Valid, @NotNull, @Size, BindingResult, 커스텀 Validator | ✅ 완료 |
| 12 | **MapStruct — 객체 매핑 자동화** | @Mapper, @Mapping, Entity↔DTO 변환, 컴파일 타임 매핑, vs ModelMapper | ✅ 완료 |
| 13 | **ResponseEntity와 API 응답 표준화** | ResponseEntity, 공통 응답 포맷, 페이징 응답 설계 | ✅ 완료 |
| 14 | **파일 업로드/다운로드** | MultipartFile, Resource, Content-Disposition, 저장 전략 | ✅ 완료 |
| 15 | **API 문서화** | Swagger/SpringDoc, @Operation, @Schema, OpenAPI 3.0, Swagger 트러블슈팅 | ✅ 완료 |
| 16 | **디버깅 완벽 가이드** | IntelliJ 디버거, Breakpoint, Step Over/Into, Watch, 조건부 BP, Remote Debug | ✅ 완료 |

---

## Phase 3: 데이터베이스 — 데이터를 다루는 기술

> 백엔드의 핵심. DB 없이는 아무것도 못 한다

| # | 주제 | 핵심 키워드 | 상태 |
|---|------|------------|------|
| 17 | **RDBMS 기초와 SQL** | MySQL, DDL/DML, JOIN, 인덱스 기본, Docker MySQL | ⬜ |
| 18 | **SQL 심화** | 서브쿼리, GROUP BY/HAVING, 윈도우 함수(ROW_NUMBER/RANK/LAG/LEAD), CTE, 재귀 CTE, EXPLAIN 실행 계획 | ⬜ |
| 19 | **DB 설계와 정규화** | ERD, 1NF~BCNF, 반정규화, 테이블 설계 실습 | ⬜ |
| 20 | **JPA 기초 — ORM 개념과 Entity** | 패러다임 불일치(5가지), JdbcTemplate→JPA 비교, @Entity, @Id, @GeneratedValue, @Column, @Enumerated, ddl-auto | ⬜ |
| 21 | **JPA 동작 원리** | 영속성 컨텍스트(3개 저장소), Entity Lifecycle, 1차 캐시, Dirty Checking, 쓰기 지연, JDBC Batch, @DynamicUpdate, Proxy, merge vs 변경감지, OSIV | ⬜ |
| 22 | **트랜잭션과 동시성** | @Transactional, ACID, isolation level, propagation, 낙관적/비관적 락, Gap Lock, Named Lock, Redis 분산 락(Redisson) | ⬜ |
| 23 | **Spring Data JPA** | JpaRepository, 쿼리 메서드, @Query(JPQL/Native), Projection, Specification, Pageable, Page vs Slice, Cursor 기반 페이징 | ⬜ |
| 24 | **연관 관계 매핑과 N+1 문제** | @OneToMany, @ManyToOne, @OneToOne LAZY 주의사항, cascade, orphanRemoval, Fetch 전략, Proxy 동작, Fetch Join, @EntityGraph, Batch Size | ⬜ |
| 25 | **QueryDSL** | JPAQueryFactory, Q클래스, BooleanExpression, 동적 쿼리, Projections, @QueryProjection, 페이징, 집계 | ⬜ |
| 26 | **Spring vs Hibernate 총정리** | 계층별 책임, 트랜잭션 경계 vs 엔티티 관리, Flush/커넥션/예외 처리, readOnly 최적화(Spring vs Hibernate 레벨), 리플리카 라우팅, 실무 패턴 | ⬜ |

---

## Phase 4: 실전 심화 — 현업에서 필요한 것들

> "돌아가는 코드"를 "운영 가능한 코드"로 만드는 단계

| # | 주제 | 핵심 키워드 | 상태 |
|---|------|------------|------|
| 27 | **인증/인가 기초** | Spring Security, SecurityFilterChain, 세션 vs JWT 비교, CORS | ⬜ |
| 28 | **JWT 인증 구현** | JWT 구조, Access/Refresh Token, 토큰 저장 전략, Filter 구현 | ⬜ |
| 29 | **테스트 코드 작성** | JUnit 5, @SpringBootTest, @WebMvcTest, Mockito, AssertJ, @ParameterizedTest | ⬜ |
| 30 | **캐싱과 성능** | @Cacheable, Redis 기초, 캐시 전략(TTL, Eviction) | ⬜ |
| 31 | **비동기와 이벤트 기반 설계** | @Async, CompletableFuture, @EventListener, @TransactionalEventListener, 이벤트 패턴 | ⬜ |
| 32 | **외부 API 연동** | RestClient, WebClient, Circuit Breaker(Resilience4j), 소셜 로그인(OAuth), 타임아웃/재시도 | ⬜ |

---

## Phase 5: 배포 & 운영 — 서버를 세상에 내보내기

> 로컬에서만 돌리면 의미 없다. 배포까지가 개발이다

| # | 주제 | 핵심 키워드 | 상태 |
|---|------|------------|------|
| 33 | **Git 브랜치 전략과 협업** | Git Flow, PR, 코드 리뷰, .gitignore, 커밋 컨벤션 | ⬜ |
| 34 | **Docker 기초** | Dockerfile, docker-compose, 이미지 빌드, 컨테이너 실행 | ⬜ |
| 35 | **CI/CD 파이프라인** | GitHub Actions, 빌드→테스트→배포 자동화 | ⬜ |
| 36 | **클라우드 배포** | AWS EC2/RDS, 환경변수 관리, 보안 그룹 설정 | ⬜ |
| 37 | **모니터링과 로그 관리** | Actuator, Prometheus, Grafana, Docker Compose 모니터링 스택 | ⬜ |
| 38 | **서버 최적화와 유지보수** | 커넥션 풀, 쿼리 튜닝, JVM 메모리, 프로파일링, 부하 테스트 | ⬜ |
| 39 | **API 보안 체크리스트** | HTTPS, Rate Limiting, SQL Injection 방지, OWASP Top 10 | ⬜ |

---

## Phase 6: 미니 프로젝트 — 배운 걸 증명하기

> 포트폴리오가 될 실전 프로젝트

| # | 주제 | 설명 | 상태 |
|---|------|------|------|
| 40 | **프로젝트 설계** | 요구사항 분석, ERD 설계, API 명세서 작성 | ⬜ |
| 41 | **게시판 API 구현** | CRUD + 검색 + 페이징 + 파일 첨부 | ⬜ |
| 42 | **인증 시스템 통합** | 회원가입/로그인/권한 관리 적용 | ⬜ |
| 43 | **테스트 & 문서화** | 단위/통합 테스트, Swagger 문서, README 정리 | ⬜ |
| 44 | **배포 & 회고** | Docker + CI/CD로 배포, 프로젝트 회고록 작성 | ⬜ |

---

## 부트캠프 커버리지 매핑

> 내 커리큘럼 ↔ 부트캠프 커리큘럼 대응표

| 부트캠프 과정 | 내 커리큘럼 # | 비고 |
|---|---|---|
| Spring 초급 (Day 0~8) | 01, 07~09, 13, Phase 1 실습 | CRUD + DAO + Layered |
| Spring 고급 (15일) | 03, 05, 06, 10~16, 27~32 | Lombok, MapStruct, Security, 테스트, 문서화 등 |
| DB와 ORM (Day 1~13) | 17~26 | SQL, 정규화, JPA, QueryDSL, 트랜잭션, Spring vs Hibernate |
| 웹 개발 심화 (4일) | 33, 35, 38 | 협업, CI/CD, 서버 최적화 |
| RESTful API 설계 (5일) | 07~08, 16 | REST + MVC + 디버깅 |
| 클라우드 배포 (8일) | 36 | AWS EC2/RDS |

---

## 변경 이력

| 날짜 | 변경 내용 |
|---|---|
| 2026-03-05 | 부트캠프 커리큘럼 병합 — 7개 주제 추가 (35→42) |
| 2026-03-11 | 부트캠프 자료 비교 분석 후 커리큘럼 재구성 (42→43) |
| 2026-03-17 | Phase 2 완료 처리, Phase 3 시작 |
| 2026-03-18 | Phase 3 구조 개편: 19번 JDBC→정규화 교체, 26번 Spring vs Hibernate 신설 (43→44) |

### 2026-03-18 변경 상세

```
부트캠프 강사 자료 (DB와 ORM Day 1~13) 전체 수령 후 커리큘럼 재구성.

주제 교체 (1건):
  └─ 19. JDBC와 Spring JDBC → DB 설계와 정규화
     (JDBC 독립 주제 제거, JdbcTemplate 비교는 20번에 흡수.
      17번의 간략한 정규화를 19번으로 이동·확장하여 BCNF/반정규화 포함)

신규 추가 (+1):
  └─ 26. Spring vs Hibernate 총정리
     (Phase 3 마무리 총정리. 계층별 책임, readOnly 최적화 차이,
      리플리카 라우팅, 실무 패턴)

키워드 보강 (기존 주제):
  ├─ 17. RDBMS → Docker MySQL 명시
  ├─ 18. SQL 심화 → LAG/LEAD, 재귀 CTE 추가
  ├─ 20. JPA 기초 → 패러다임 불일치(5가지), JdbcTemplate→JPA 비교, @Enumerated 추가
  ├─ 21. JPA 동작 원리 → 3개 저장소, JDBC Batch, @DynamicUpdate, merge vs 변경감지, OSIV 추가
  ├─ 22. 트랜잭션 → ACID, Gap Lock, Redisson 명시
  ├─ 23. Spring Data JPA → Projection, Specification, Cursor 기반 페이징 추가
  ├─ 24. 연관 관계 → @OneToOne LAZY 주의사항, cascade, orphanRemoval, Proxy 동작 추가
  └─ 25. QueryDSL → @QueryProjection, Projections, 집계 추가

번호 재조정:
  └─ Phase 4~6 전체 +1 (구 26~43 → 신 27~44)
```

### 2026-03-11 변경 상세

```
신규 추가 (+1):
  └─ 21. JPA 동작 원리 (영속성 컨텍스트, Entity Lifecycle, Dirty Checking)

기존 주제 보강:
  ├─ 18. SQL 심화 → 윈도우 함수(ROW_NUMBER/RANK), CTE, EXPLAIN 추가
  ├─ 20. JPA 기초 → 패러다임 불일치(5가지) 추가
  ├─ 22. 트랜잭션 → Named Lock, Redis 분산 락 추가 + 순서 위로 이동
  ├─ 24. 연관 관계 → N+1 해법 3종 비교 강화 (Fetch Join, @EntityGraph, Batch Size)
  ├─ 25. QueryDSL → BooleanExpression 방식 강조
  ├─ 26. 인증/인가 → 세션 vs JWT 비교 관점 추가
  ├─ 30. 비동기 → @TransactionalEventListener, 이벤트 기반 설계 추가
  └─ 31. 외부 API → Circuit Breaker(Resilience4j), 소셜 로그인(OAuth) 추가

순서 변경:
  └─ Phase 3: 트랜잭션(구 24→신 22)을 Spring Data JPA보다 앞으로 이동
     (Dirty Checking, flush 이해에 트랜잭션 지식이 선행되어야 함)

보충 예정 (완료된 주제):
  ├─ 02. Resources → @ConfigurationProperties, Jasypt, 설정 우선순위
  └─ 03. Logging → MDC, logback-spring.xml, JSON 로깅, 비동기 로깅

번호 재조정:
  └─ Phase 3 이후 전체 +1 (구 25~42 → 신 26~43)
```

---

## 학습 가이드

### 매일 학습 루틴
```
1. 부트캠프에서 배운 키워드 정리
2. 나한테 키워드 보내기 → 학습 자료 생성
3. 자료 읽고 코드 따라 쳐보기
4. 모르는 부분 질문하기
```

### 난이도 범례
- Phase 1~2: 기초 (따라하면 된다)
- Phase 3: 핵심 (여기서 실력 갈린다)
- Phase 4: 심화 (면접에서 차이 만드는 구간)
- Phase 5~6: 실전 (취업용 포트폴리오)

### 예상 진행 속도
- 부트캠프 병행 시: 하루 1~2개 주제
- 전체 약 5~7주 소요

---

> 💡 이 커리큘럼은 부트캠프 진도에 맞춰 유동적으로 조정합니다.
> 새로운 키워드가 오면 기존 주제에 추가하거나, 순서를 바꿀 수 있습니다.
