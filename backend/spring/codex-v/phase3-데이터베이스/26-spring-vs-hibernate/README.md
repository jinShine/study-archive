# 26. Spring vs Hibernate 총정리

> 오늘의 목표: 지금까지 배운 JPA, 트랜잭션, Repository, QueryDSL이 실제로는 Spring과 Hibernate의 어떤 역할 분담 위에서 돌아가는지 정리한다.

---

## 오늘 끝나면 되는 것

- Spring과 Hibernate가 각각 무엇을 담당하는지 설명할 수 있다.
- `@Transactional`과 Dirty Checking의 역할을 구분할 수 있다.
- `readOnly = true`가 Spring/Hibernate 레벨에서 어떤 의미를 가지는지 말할 수 있다.
- flush, 커넥션, 예외 처리 흐름을 큰 그림으로 설명할 수 있다.

---

## 머릿속 그림

```text
Spring
 -> 트랜잭션 경계 관리
 -> Bean 관리
 -> 예외 변환

Hibernate
 -> JPA 구현
 -> 영속성 컨텍스트 관리
 -> Dirty Checking
 -> SQL 생성/실행 준비
```

즉, 둘은 경쟁 관계가 아니라 역할 분담 관계입니다.

---

## 서비스 코드에서 무슨 일이 일어날까

```java
@Transactional
public void updateTitle(Long id, String title) {
    StudyLog log = repository.findById(id).orElseThrow();
    log.changeTitle(title);
}
```

겉보기엔 단순하지만 내부에서는:

1. Spring이 트랜잭션 시작
2. Hibernate가 엔티티 조회 및 관리
3. 객체 값 변경
4. Hibernate가 변경 감지
5. Spring이 트랜잭션 종료 시점 관리
6. Hibernate가 flush
7. DB commit

이 흐름이 함께 작동합니다.

---

## Spring이 담당하는 것

- `@Transactional` 해석
- 트랜잭션 시작/종료
- AOP 프록시 기반 서비스 감싸기
- 예외를 스프링 예외 체계로 변환

즉, 경계와 실행 흐름을 잡아주는 역할이 큽니다.

---

## Hibernate가 담당하는 것

- 엔티티를 영속성 컨텍스트에서 관리
- 1차 캐시
- Dirty Checking
- flush 시점 SQL 생성
- LAZY 로딩과 Proxy 처리

즉, 객체와 테이블 사이 매핑 엔진 역할입니다.

---

## `readOnly = true`는 어디에 영향을 줄까

```java
@Transactional(readOnly = true)
public List<StudyLog> findAll() {
    return repository.findAll();
}
```

Spring 관점:

- 이 메서드는 조회용이라고 선언

Hibernate 관점:

- 변경 감지 부담을 줄이는 데 도움

즉, 스프링이 트랜잭션 의도를 전달하고,
Hibernate가 그 힌트를 활용하는 느낌으로 이해하면 좋습니다.

---

## flush와 commit의 역할 분리

- Hibernate: flush를 통해 SQL 반영 준비/실행
- Spring/DB 트랜잭션: commit으로 최종 확정

면접에서는 이 차이를 섞지 않는 것이 중요합니다.

---

## 예외는 어디서 어떻게 다뤄지나

JPA/Hibernate 예외가 발생하면,
스프링이 DataAccessException 계열로 변환해주는 경우가 많습니다.

그래서 서비스 계층에서는 벤더 종속 예외보다,
스프링 예외 계층으로 다루는 경우가 많습니다.

---

## 실무에서 자주 나오는 판단

### 조회 서비스

- `@Transactional(readOnly = true)` 고려
- Projection/Fetch Join으로 불필요한 로딩 줄이기

### 수정 서비스

- 트랜잭션 안에서 조회 후 변경
- 변경 감지 활용

### 고성능 읽기

- 경우에 따라 리플리카 라우팅
- 엔티티 대신 DTO 조회

초보 단계에서는 "왜 그렇게 나누는지" 감각을 얻는 것이 더 중요합니다.

---

## 전체 한 줄 정리

> Spring은 트랜잭션과 실행 경계를 관리하고, Hibernate는 엔티티 상태와 SQL 반영을 관리한다.

이 문장을 자기 말로 설명할 수 있으면 Phase 3 핵심이 꽤 잘 붙은 상태입니다.

---

## 자주 하는 실수

- `@Transactional`이 직접 SQL을 만들어준다고 생각하는 것
- Hibernate가 트랜잭션까지 다 알아서 한다고 보는 것
- `readOnly = true`를 단순 성능 스위치 정도로만 이해하는 것
- flush와 commit을 같은 개념으로 말하는 것

---

## 면접 체크

1. Spring과 Hibernate는 각각 무엇을 담당하나요?
2. `@Transactional`과 Dirty Checking은 어떤 차이가 있나요?
3. `readOnly = true`는 왜 사용하나요?
4. flush와 commit은 어떻게 다른가요?

---

## 직접 해보기

1. 조회 서비스와 수정 서비스를 각각 만들고 트랜잭션 설정을 비교해보세요.
2. 변경 감지가 동작하는 흐름을 글로 설명해보세요.
3. "Spring이 하는 일"과 "Hibernate가 하는 일"을 표로 정리해보세요.

---

## Phase 3 마무리

여기까지 오면 Phase 3의 핵심은 이렇게 이어집니다.

```text
SQL 기초
 -> DB 설계
 -> JPA 매핑
 -> 영속성 컨텍스트
 -> 트랜잭션
 -> Repository/검색
 -> 연관관계와 성능
 -> Spring과 Hibernate의 역할 분담
```

이 흐름이 머릿속에 연결되면, 이제 단순 CRUD를 넘어서 "운영 가능한 백엔드"에 가까워집니다.
