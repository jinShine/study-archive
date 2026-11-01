# Spring 실습 기록

전달받은 `PayController`, `PointService` 코드의 설명과 보완한 커넥션 비교 코드는 [STUDY_GUIDE.md](../../STUDY_GUIDE.md)에 모았습니다. 이 폴더에는 아직 별도 실행 프로젝트를 생성하지 않았습니다.

수업 프로젝트에서 아래 항목을 확인하고 실제 결과를 기록합니다. 가이드의 DB 비교 결과는 예상값이며, 이 정리 과정에서 DB 연결 실험을 실행하지는 않았습니다.

- `@Transactional`의 기본 propagation인 `REQUIRED`
- 별도 Bean의 메서드에 적용한 `REQUIRES_NEW`
- 외부 호출과 self-invocation의 차이
- 트랜잭션 안에서 같은 DB 커넥션이 재사용되는지 확인
- 비동기 실행 시 기존 스레드의 트랜잭션이 전달되지 않는 이유
