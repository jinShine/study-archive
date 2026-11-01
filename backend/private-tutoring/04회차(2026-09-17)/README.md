# 4회차(2026/09/17)

## 상태

수업 후 실제 설명과 코드를 바탕으로 정리하고 있습니다. 현재 `STUDY_GUIDE.md`에는 트랜잭션 전파, 커넥션 획득, ThreadLocal, 새 스레드와 원자성의 관계를 정리했습니다. 예습 전체 내용은 `STUDY_GUIDE_BACKUP.md`에 보관합니다.

## 현재 정리한 수업 내용

- Transaction propagation: `REQUIRED`, `REQUIRES_NEW`
- `DataSource.getConnection()`과 `DataSourceUtils.getConnection()`
- ThreadLocal과 Spring의 트랜잭션 자원 관리
- 새 스레드에서 부모 트랜잭션이 자동 전달되지 않는 이유
- 커넥션 동일성 확인 코드와 자원 반환

## 이번 수업 핵심

트랜잭션 전파는 기존 트랜잭션에 참여할지 분리할지 정합니다. 같은 JDBC 트랜잭션에 참여하는 SQL은 같은 커넥션을 사용해야 하며, Spring은 현재 스레드에 연결한 자원을 찾아 재사용합니다. 새 스레드로 DB 작업을 옮기면 부모의 트랜잭션 문맥이 자동 전달되지 않아 업무 전체의 원자성이 유지되지 않을 수 있습니다.

## 바로가기

- 대표 학습 가이드: [STUDY_GUIDE.md](./STUDY_GUIDE.md)
- 이전 예습 정리: [STUDY_GUIDE_BACKUP.md](./STUDY_GUIDE_BACKUP.md)
- 예습 키워드 원본: [preview-keywords.md](./source-materials/preview-keywords.md)
- 수업 후 메모: [01-lesson-notes.md](./notes/01-lesson-notes.md)
- 실습 기록: [practice/README.md](./practice/README.md)
