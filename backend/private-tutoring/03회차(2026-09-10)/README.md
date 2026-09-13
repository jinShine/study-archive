# 3회차(2026/09/10)

## 상태

예습 자료에 실제 수업 메모와 질문별 설명을 누적하고 있습니다. 현재 함께 학습하는 범위는 애플리케이션과 DB 통신부터 DriverManager까지입니다.

## 주제

DB 연결, TCP 소켓 통신, JDBC, Transaction, Spring `@Transactional`

## 이번 예습 핵심

Spring 서버가 DB와 대화하려면 먼저 네트워크 연결이 필요합니다. 그 연결 위에서 JDBC가 SQL을 보내고, 여러 SQL을 하나의 작업 단위로 묶는 개념이 Transaction입니다. Spring의 `@Transactional`은 이 트랜잭션 시작, 커밋, 롤백을 대신 관리해주는 기능입니다.

## 바로가기

- 대표 학습 가이드: [STUDY_GUIDE.md](./STUDY_GUIDE.md)
- 예습 키워드 원본: [preview-keywords.md](./source-materials/preview-keywords.md)
- 수업 메모: [강사님 정리 전달본](./source-materials/lesson-notes-2026-09-11.md)
- 추가 참고 원본: [Claude Code 작성 문서](./source-materials/spring-db-transaction-claude.md)
- Spring 실습 준비: [practice/spring/README.md](./practice/spring/README.md)

개념 설명, 질문별 보완, 실습은 모두 대표 학습 가이드에 모았습니다. 지금은 2~4절과 4절의 확인 질문부터 진행합니다. 이후 절은 기존 예습 자료이며 질문에 맞춰 보완합니다.

## 예습 키워드

- DriverManager
- DataSource
- TCP socket communication
- TCP SYN, ACK, 3-way handshake
- Transaction
- Transaction in MySQL
- Transaction in JDBC
- Transaction in Spring, `@Transactional`
- 여유되면: transaction propagation, transaction isolation level
