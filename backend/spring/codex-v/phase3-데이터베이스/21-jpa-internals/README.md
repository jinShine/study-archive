# 21. JPA 동작 원리

> 오늘의 목표: JPA가 내부에서 어떻게 움직이는지 이해해서, "왜 update가 자동 반영되지?" 같은 의문을 구조적으로 설명할 수 있다.

---

## 오늘 끝나면 되는 것

- 영속성 컨텍스트가 무엇인지 설명할 수 있다.
- 엔티티 생명주기(비영속, 영속, 준영속, 삭제)를 말할 수 있다.
- 1차 캐시와 Dirty Checking 개념을 이해할 수 있다.
- `flush`와 `commit`의 차이를 큰 흐름에서 설명할 수 있다.
- Proxy와 OSIV를 아주 기초 수준에서 이해할 수 있다.

---

## 머릿속 그림

```text
트랜잭션 시작
 -> 영속성 컨텍스트 생성
 -> 엔티티 조회/변경 추적
 -> flush
 -> commit
```

JPA는 단순히 "메서드 호출 즉시 DB 반영"이 아닙니다.

중간에 영속성 컨텍스트라는 관리 공간이 있습니다.

---

## 영속성 컨텍스트란

JPA가 엔티티를 관리하는 메모리 공간입니다.

쉽게 말하면:

- 조회한 엔티티를 기억해두고
- 변경을 추적하고
- 필요한 시점에 SQL로 반영하는 곳

---

## 엔티티 생명주기

### 비영속

```java
StudyLog log = new StudyLog(...);
```

객체는 만들었지만 JPA가 아직 관리하지 않습니다.

### 영속

```java
entityManager.persist(log);
```

이제 영속성 컨텍스트가 관리합니다.

### 준영속

관리하던 엔티티가 컨텍스트에서 분리된 상태입니다.

### 삭제

삭제 예정 상태입니다.

초급 단계에서는 "영속 상태일 때 JPA가 진가를 발휘한다"만 확실히 기억하면 됩니다.

---

## 1차 캐시

같은 트랜잭션 안에서 같은 PK를 두 번 조회하면,
두 번째는 DB에 다시 가지 않을 수 있습니다.

```java
StudyLog a = repository.findById(1L).orElseThrow();
StudyLog b = repository.findById(1L).orElseThrow();
```

같은 트랜잭션 안이라면 `a == b`가 성립할 수 있습니다.

이게 1차 캐시 감각입니다.

---

## Dirty Checking

JPA에서 가장 신기하게 느껴지는 부분입니다.

```java
@Transactional
public void updateTitle(Long id, String title) {
    StudyLog log = repository.findById(id).orElseThrow();
    log.changeTitle(title);
}
```

여기엔 `save()`가 없습니다.

그런데도 수정이 반영될 수 있습니다.

이유:

1. 영속 상태 엔티티를 JPA가 관리함
2. 트랜잭션 안에서 값이 바뀐 것을 감지함
3. 커밋 직전 UPDATE SQL 생성

이 과정을 Dirty Checking이라고 합니다.

---

## flush와 commit

- `flush`: 변경 내용을 DB에 반영할 준비를 하고 SQL을 보냄
- `commit`: 트랜잭션을 최종 확정

처음에는 이렇게 이해하면 충분합니다.

> flush는 "DB에 반영 시도", commit은 "최종 확정"

둘은 같은 것이 아닙니다.

---

## 쓰기 지연

JPA는 INSERT/UPDATE SQL을 즉시 다 날리지 않고 모아둘 수 있습니다.

이것이 쓰기 지연입니다.

장점:

- 한 트랜잭션 안에서 효율적으로 반영 가능
- 배치 처리와도 연결됨

---

## Proxy와 LAZY 로딩

연관 객체를 바로 다 가져오지 않고,
필요할 때 실제 조회하는 방식이 있습니다.

그때 JPA는 프록시 객체를 줄 수 있습니다.

예:

```java
StudyLog log = repository.findById(1L).orElseThrow();
log.getMember().getName();
```

여기서 `getMember()` 시점까지는 실제 Member를 안 가져오고,
필요한 순간 SELECT가 나갈 수 있습니다.

이게 LAZY 로딩과 프록시의 핵심 감각입니다.

---

## merge vs 변경 감지

실무에서는 "조회해서 수정"하는 패턴이 보통 더 안전합니다.

```java
StudyLog log = repository.findById(id).orElseThrow();
log.changeTitle(newTitle);
```

이 방식이 변경 감지 기반입니다.

`merge`는 동작이 직관적이지 않아 초급 단계에서 남발하지 않는 편이 좋습니다.

---

## OSIV는 뭐냐

Open Session In View.

웹 요청이 끝날 때까지 영속성 컨텍스트를 열어두는 전략입니다.

장점:

- 컨트롤러/뷰 단계에서도 LAZY 로딩 가능

주의점:

- 쿼리 시점이 늦게 발생할 수 있음
- 트랜잭션 경계를 흐리게 느낄 수 있음

지금 단계에서는 "존재와 장단점" 정도만 이해하면 충분합니다.

---

## 자주 하는 실수

- `save()`가 없으면 수정이 안 된다고 생각하는 것
- 트랜잭션 없이 변경 감지를 기대하는 것
- 프록시와 실제 객체 차이를 전혀 의식하지 않는 것
- LAZY 초기화 예외를 단순 버그로만 보는 것

---

## 면접 체크

1. 영속성 컨텍스트란 무엇인가요?
2. Dirty Checking은 어떻게 동작하나요?
3. 1차 캐시는 무엇인가요?
4. `flush`와 `commit`은 어떻게 다른가요?
5. LAZY 로딩과 프록시는 어떤 관계가 있나요?

---

## 직접 해보기

1. 같은 트랜잭션 안에서 같은 엔티티를 두 번 조회하고 같은 객체인지 확인해보세요.
2. `save()` 없이 필드 변경만 하고 업데이트 SQL이 나가는지 확인해보세요.
3. 트랜잭션을 제거했을 때 어떤 차이가 생기는지 비교해보세요.

---

## 다음 주제 연결

JPA가 내부에서 트랜잭션과 강하게 연결되어 있다는 걸 봤습니다. 다음에는 트랜잭션이 정확히 무엇이고, 동시 수정 문제를 어떻게 막는지 배웁니다.
