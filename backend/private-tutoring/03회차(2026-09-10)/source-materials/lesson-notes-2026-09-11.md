# 3회차 수업 메모

- 전달일: 2026/09/11
- 출처: 사용자가 전달한 강사님 수업 정리
- 아래는 전달 내용을 보존한 참고 메모입니다. 축약·비유 표현을 포함하며, 학습 설명과 보완은 STUDY_GUIDE.md에 반영합니다.
- 이번 반영 범위: 애플리케이션과 데이터베이스 통신, DriverManager까지. 이후 주제는 질문에 맞춰 순서대로 진행합니다.

## 전달 내용

- 어플리케이션 데이터베이스 통신
  - 현대에는 socket 통신으로 뭉쳤음
  - 서버와 데이터베이스도 소켓으로 통신한다.

- DriverManager
  - interface 있고 (java 에서 만들어놓음)
  - driver 있음 (각 db 회사에서 만들어놓음)

- DataSource interface
  - 이거를 어떤식으로 구현하고싶냐면,
  - 미리 여러개 만들어놓고
  - 원할때 바로 반환하는 방식으로 -> 풀링 (pooling)
  - 데이터베이스 커넥션 풀링

- hikaricp
  - 커넥션풀 구현체 라이브러리

## 풀링 이유

1. tcp 3way handshake
2. tcp slow start
3. 인증 및 초기화 작업들
4. database 과부하 방지(context switching, memory, mysql thread per connection)

- 타임아웃설정
  - fail fast system

## 트랜잭션

- Transaction
  - all or nothing

- Transaction 원리
  - 임시데이터에 반영
  - commit 포인터 바꾸기
  - rollback 임시데이터 버리기

- Transaction in mysql

- Transaction in JDBC
  - https://www.tutorialspoint.com/jdbc/jdbc-transactions.htm

- Transaction in spring
  - @Transactional
  - 붙은 메서드가 시작하기 전에 -> 커넥션을 획득하고 트랜잭션을 시작
  - 메서드가 끝나면 -> 커밋
  - 메서드에서 익셉션이 발생하면 -> 롤백
