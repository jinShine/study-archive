# 3회차 Spring 실습

개념과 실습 설명은 [STUDY_GUIDE.md](../../STUDY_GUIDE.md)에 모았습니다. 23절의 10단계를 직접 입력하며 진행합니다.

## 진행 순서

1. MySQL 학습 테이블과 기준값 준비
2. autocommit으로 부분 저장 관찰
3. 명시적 rollback 확인
4. commit과 세션 설정 비교
5. 두 DB 세션의 변경 가시성 확인
6. 빈 프로젝트에서 DriverManager로 연결
7. DataSource Bean과 JdbcTemplate 확인
8. 트랜잭션 어노테이션 없이 실패 재현
9. @Transactional 적용 후 성공/rollback 비교
10. 내부 호출로 트랜잭션 설정이 빠지는 상황 확인

## 작업 위치

새 프로젝트를 직접 만들 때 이 폴더 아래 `tx-practice/`를 사용합니다. 아직 프로젝트를 생성하거나 MySQL 명령을 실행한 상태는 아닙니다.

```text
practice/spring/
  README.md
  tx-practice/                 # 실습 6단계에서 직접 생성
    build.gradle
    src/main/java/com/buzz/txpractice/
      TxPracticeApplication.java
      DriverProbe.java
      TransferService.java
    src/main/resources/
      application.properties
```

프로젝트는 Java 21, JDBC API, MySQL Driver로 시작합니다. 처음에는 웹 서버 없이 ApplicationRunner로 실행합니다. 환경변수 설정, 전체 입력 예제, 예상 DB 값은 대표 가이드에 있습니다. 각 실행 전에 학습 데이터를 초기화하고, 가이드의 결과 기록표에 실제 결과를 남깁니다.
