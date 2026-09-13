# Backend Private Tutoring

프론트엔드 경험을 바탕으로 백엔드 전향을 준비하는 개인 과외 정리 공간입니다.

수업은 주 1회, 약 1시간으로 진행합니다. 예습 키워드를 받고, 수업 시간에는 큰 흐름과 용어를 설명받은 뒤 피드백을 받는 방식입니다. 이 폴더의 목적은 수업 내용을 단순 기록으로 남기는 것이 아니라, 나중에 다시 봤을 때 "왜 이 개념이 필요한지"까지 떠올릴 수 있게 만드는 것입니다.

## 회차 구분 방식

문서 안에서는 `1회차(2026/08/25)`, `2회차(2026/09/02)`처럼 표기합니다.

실제 폴더명에는 `/`를 쓸 수 없기 때문에 아래처럼 `-`를 사용합니다.

```text
01회차(2026-08-25)/
02회차(2026-09-02)/
03회차(2026-09-10)/
```

## 폴더 구조

각 회차는 하나의 작은 학습 프로젝트처럼 관리합니다.

```text
private-tutoring/
  README.md
  _templates/
    session-template.md
    spring-practice-template.md

  01회차(2026-08-25)/
    README.md
    STUDY_GUIDE.md
    notes/
      01-backend-architecture.md
    practice/
      README.md
      spring/
        README.md
    assets/
      01-client-server-db.png
      02-scale-up.png
      03-scale-out-read-replica.png
      04-sharding-modulo.png
      05-msa-overview.png
    source-materials/
      01-session-original.pdf

  02회차(2026-09-02)/
    README.md
    STUDY_GUIDE.md
    notes/
      01-spring-bean-di-lifecycle.md
    practice/
      README.md
      spring/
        README.md
    assets/
    source-materials/

  03회차(2026-09-10)/
    README.md
    STUDY_GUIDE.md
    notes/
      01-preview-db-connection-transaction.md
    practice/
      README.md
      spring/
        README.md
    assets/
    source-materials/
      preview-keywords.md
      spring-db-transaction-claude.md
```

## 수업별 인덱스

| 회차 | 날짜 | 주제 | 바로가기 | 상태 |
| --- | --- | --- | --- | --- |
| 1회차 | 2026/08/25 | 백엔드 전체 흐름, 확장, 모니터링, DB 복제, 샤딩, Redis, 메시지 큐, MSA | [STUDY_GUIDE.md](./01회차(2026-08-25)/STUDY_GUIDE.md) | 정리 완료 |
| 2회차 | 2026/09/02 | Spring Bean, Bean 생성 방법, Dependency/DI, Bean 라이프사이클, Graceful Shutdown | [STUDY_GUIDE.md](./02회차(2026-09-02)/STUDY_GUIDE.md) | 정리 완료 |
| 3회차 | 2026/09/10 | DriverManager, DataSource, TCP, Transaction, JDBC, Spring `@Transactional` | [STUDY_GUIDE.md](./03회차(2026-09-10)/STUDY_GUIDE.md) | 예습·참고 자료 통합, 10단계 실습 가이드 |

## 회차별 하위 폴더 역할

| 폴더 | 역할 |
| --- | --- |
| `STUDY_GUIDE.md` | 해당 회차를 한 번에 복습하는 대표 문서 |
| `notes/` | 수업 내용을 사람이 읽는 글로 정리 |
| `practice/` | 수업 중/수업 후 진행한 실습 기록 |
| `practice/spring/` | Spring 관련 실습 프로젝트 또는 코드 조각 |
| `assets/` | 손그림, 스크린샷, 다이어그램 |
| `source-materials/` | PDF, 원본 메모, 강사 자료 |

## STUDY_GUIDE.md 작성 기준

앞으로 매 회차의 대표 문서는 `STUDY_GUIDE.md`로 통일합니다. 아래 흐름으로 정리합니다.

1. 오늘의 핵심 한 문장
2. 전체 그림
3. 개념별 설명
4. 프론트엔드 경험과 연결되는 지점
5. 실무에서 조심할 점
6. 면접에서 말할 수 있는 문장
7. 복습 질문
8. Spring 실습과 연결
9. 다음 수업 키워드와 연결

`notes/` 아래의 세부 문서는 보조 자료로 남기고, 나중에 다시 볼 때는 각 회차의 `STUDY_GUIDE.md`부터 읽습니다.

## Spring 실습 정리 기준

수업이 Spring 실습과 같이 진행되므로, 실습은 단순 코드 보관이 아니라 아래 기준으로 기록합니다.

```text
practice/spring/
  README.md
  concept-notes.md
  src/ 또는 프로젝트 폴더
```

실습 README에는 매번 아래를 남깁니다.

- 오늘 만든 것
- 실행 방법
- 핵심 코드 흐름
- 수업 개념과 연결되는 지점
- 막혔던 부분
- 다음에 다시 볼 질문

## 4-5개월 학습 지도

1. 전체 구조 감 잡기: 클라이언트, 서버, DB, 캐시, 메시지 큐, 인프라
2. Java 기본기: 객체지향, 컬렉션, 예외, 제네릭, 스트림, 테스트
3. Spring 기본기: Bean, DI, MVC, Controller/Service/Repository, 설정
4. DB와 JPA: SQL, 인덱스, 트랜잭션, 영속성 컨텍스트, 연관관계, N+1
5. API 실무: 인증/인가, 예외 처리, 검증, DTO, 문서화, 로깅
6. 운영 관점: 모니터링, 배포, 장애 대응, 성능 개선
7. 포트폴리오와 면접: 프로젝트 설명, 트레이드오프, 문제 해결 경험 정리

## 나에게 중요한 관점

프론트엔드에서는 `fetch`나 API 클라이언트로 요청을 보내고 응답을 받는 경험이 많았습니다. 백엔드는 그 요청을 받은 뒤에 벌어지는 일을 책임집니다.

- 이 요청은 어떤 서버가 받는가?
- 같은 요청이 동시에 많이 들어오면 어떻게 되는가?
- DB가 느려지면 사용자는 어떤 현상을 겪는가?
- 장애가 났을 때 서비스는 계속 살아 있는가?
- "저장 완료"라고 응답했는데 조회가 안 되는 상황은 왜 생기는가?

앞으로의 학습은 이 질문들에 답할 수 있는 힘을 쌓는 과정입니다.
