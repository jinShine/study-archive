# Codex V Spring Boot 학습 트랙

기존 `CURRICULUM.md`의 **주제, 번호, 순서**는 그대로 유지하고, 설명 방식만 Codex 스타일로 다시 구성한 학습 트랙입니다.

핵심 원칙은 하나입니다.

`외우기`보다 `흐름 이해`에 집중합니다.

그래서 모든 문서는 아래 순서로 전개됩니다.

1. 오늘 끝나면 무엇을 이해해야 하는가
2. 요청이나 객체가 실제로 어떻게 흘러가는가
3. 최소 예제로 어떻게 확인하는가
4. 실무에서 어디서 자주 틀리는가
5. 면접에서 어떻게 설명하는가
6. 직접 손으로 풀어볼 과제는 무엇인가

---

## 진행 상태

현재 이 트랙은 **Phase 1**, **Phase 2**, **Phase 3**, 그리고 **Phase 1~2 통합 복습 프로젝트**까지 준비되어 있습니다.

> 같은 커리큘럼을 따라가되, 설명은 더 "연결형"으로 읽히게 만들었습니다.

---

## Phase 1. 기초 체력

| # | 주제 | 포인트 |
|---|---|---|
| 01 | [Servlet, Spring, Spring Boot](./phase1-기초체력/01-servlet-spring-springboot/) | 왜 Spring Boot가 편한지 내부 구조까지 연결해서 이해 |
| 02 | [Resources 폴더 구조](./phase1-기초체력/02-resources/) | 설정은 코드 밖으로 분리된다는 감각 만들기 |
| 03 | [첫 번째 REST API 만들기](./phase1-기초체력/03-first-rest-api/) | 요청을 받아 JSON으로 응답하는 최소 단위 경험 |
| 04 | [IoC와 DI 깊게 파기](./phase1-기초체력/04-ioc-and-di/) | Spring의 심장인 컨테이너와 의존성 주입 이해 |
| 05 | [AOP 실전](./phase1-기초체력/05-aop/) | 공통 관심사를 비즈니스 로직에서 분리하는 이유 체감 |
| 06 | [예외 처리 전략](./phase1-기초체력/06-exception-handling/) | 실패 케이스까지 설계하는 백엔드 감각 만들기 |
| P1 | [Phase 1 복습 실습](./phase1-기초체력/phase1-practice/) | Phase 1 개념만으로 작은 API 조립 |

---

## Phase 2. API 개발

| # | 주제 | 포인트 |
|---|---|---|
| 07 | [HTTP 기초와 REST 설계 원칙](./phase2-API개발/07-http-and-rest/) | API를 "잘" 만든다는 감각 익히기 |
| 08 | [Spring MVC 요청/응답 흐름](./phase2-API개발/08-spring-mvc-flow/) | 요청이 DispatcherServlet을 지나가는 경로 이해 |
| 09 | [Layered 아키텍처와 DAO 패턴](./phase2-API개발/09-layered-architecture-dao/) | 계층 분리의 이유와 책임 경계 정리 |
| 10 | [Lombok 활용](./phase2-API개발/10-lombok/) | 줄이는 코드와 숨겨지는 코드를 같이 보기 |
| 11 | [DTO와 Validation](./phase2-API개발/11-dto-and-validation/) | 안전한 입출력 경계 만들기 |
| 12 | [MapStruct](./phase2-API개발/12-mapstruct/) | 반복 매핑 코드를 자동화하는 방법 익히기 |
| 13 | [ResponseEntity와 응답 표준화](./phase2-API개발/13-responseentity/) | 상태코드, 헤더, 응답 포맷을 명확하게 다루기 |
| 14 | [파일 업로드/다운로드](./phase2-API개발/14-file-upload-download/) | Multipart와 Resource를 안전하게 다루기 |
| 15 | [API 문서화](./phase2-API개발/15-api-docs/) | SpringDoc으로 문서와 테스트 환경 같이 만들기 |
| 16 | [디버깅 완벽 가이드](./phase2-API개발/16-debugging/) | 막혔을 때 추측이 아니라 추적으로 해결하기 |

---

## Phase 3. 데이터베이스

| # | 주제 | 포인트 |
|---|---|---|
| 17 | [RDBMS 기초와 SQL](./phase3-데이터베이스/17-rdbms-and-sql/) | 데이터가 왜 DB에 가야 하는지와 SQL의 기본기 익히기 |
| 18 | [SQL 심화](./phase3-데이터베이스/18-sql-advanced/) | 집계, 서브쿼리, 윈도우 함수, 실행 계획 감각 만들기 |
| 19 | [DB 모델링과 정규화](./phase3-데이터베이스/19-db-design-normalization/) | ERD와 정규화로 테이블 설계 기준 세우기 |
| 20 | [JPA 기초](./phase3-데이터베이스/20-jpa-basics/) | ORM과 Entity 매핑의 출발점 이해하기 |
| 21 | [JPA 동작 원리](./phase3-데이터베이스/21-jpa-internals/) | 영속성 컨텍스트, Dirty Checking, flush 흐름 이해 |
| 22 | [트랜잭션과 동시성](./phase3-데이터베이스/22-transaction-concurrency/) | 안전한 데이터 처리와 락 전략 감각 익히기 |
| 23 | [Spring Data JPA](./phase3-데이터베이스/23-spring-data-jpa/) | 쿼리 메서드, 페이징, Projection 실전 감각 얻기 |
| 24 | [연관 관계 매핑과 N+1 문제](./phase3-데이터베이스/24-association-n-plus-one/) | 객체 관계와 성능 이슈를 함께 이해하기 |
| 25 | [QueryDSL](./phase3-데이터베이스/25-querydsl/) | 동적 검색을 타입 안전하게 조립하기 |
| 26 | [Spring vs Hibernate 총정리](./phase3-데이터베이스/26-spring-vs-hibernate/) | 지금까지 배운 DB/JPA 흐름 전체를 한 번에 연결하기 |

---

## 통합 복습

| 프로젝트 | 설명 |
|---|---|
| [Phase 1~2 Review](./phase1-2-review/) | 지금까지 배운 16개 주제를 하나의 프로젝트로 묶어 체화하는 실습 |

---

## 추천 사용법

각 문서를 읽을 때 아래 리듬으로 공부하면 효율이 좋습니다.

1. `오늘 끝나면 되는 것` 먼저 읽기
2. `머릿속 그림`을 보고 개념 간 연결 이해하기
3. 코드 예제를 직접 타이핑하기
4. `자주 하는 실수`를 체크해서 오답노트 만들기
5. `직접 해보기`를 실제로 수정해보기
6. 마지막에 `면접 체크`를 입으로 설명해보기

---

## 이 트랙의 차별점

- 개념을 따로따로 설명하지 않고 요청 흐름 안에서 묶어서 설명합니다.
- 면접용 문장과 실무용 판단 기준을 같이 적습니다.
- 과제를 "정답 맞히기"가 아니라 "설계 이유 설명하기" 중심으로 냅니다.
- 지금 배우는 것이 다음 Phase에서 어디에 연결되는지 계속 미리 보여줍니다.
