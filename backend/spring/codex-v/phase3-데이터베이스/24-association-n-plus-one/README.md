# 24. 연관 관계 매핑과 N+1 문제

> 오늘의 목표: 객체 참조로 관계를 표현하는 법을 익히고, JPA에서 가장 유명한 성능 문제인 N+1을 이해하고 해결 전략을 말할 수 있다.

---

## 오늘 끝나면 되는 것

- `@ManyToOne`, `@OneToMany` 기본 사용법을 이해할 수 있다.
- 연관 관계 주인 개념을 설명할 수 있다.
- LAZY와 EAGER 차이를 이해할 수 있다.
- Proxy가 왜 등장하는지 말할 수 있다.
- N+1 문제와 해결책(Fetch Join, EntityGraph, Batch Size)을 설명할 수 있다.

---

## 머릿속 그림

DB에서는 FK로 연결되어 있고,
JPA에서는 객체 참조로 연결됩니다.

```text
StudyLog -> Member
```

즉, 숫자 `member_id`를 직접 다루는 대신,
`studyLog.getMember()`처럼 객체 탐색을 하게 됩니다.

---

## 가장 먼저 익힐 관계: `@ManyToOne`

학습 일지 여러 건은 한 회원에 속할 수 있습니다.

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "member_id")
private Member member;
```

처음 JPA 연관관계는 거의 여기서 시작합니다.

이유:

- FK가 N쪽에 있음
- 설계가 비교적 단순함

---

## `@OneToMany`는 왜 더 조심할까

```java
@OneToMany(mappedBy = "member")
private List<StudyLog> studyLogs = new ArrayList<>();
```

이것도 가능하지만,
초급 단계에서는 먼저 `@ManyToOne` 중심으로 생각하는 편이 좋습니다.

왜냐하면 관계 주인과 관리 포인트가 더 명확하기 때문입니다.

---

## 연관 관계 주인

FK를 실제로 관리하는 쪽이 주인입니다.

보통 `@ManyToOne` 쪽이 주인이 됩니다.

즉:

- `StudyLog.member`가 주인
- `Member.studyLogs`는 읽기용 반대편

이 감각이 아주 중요합니다.

---

## LAZY vs EAGER

### LAZY

필요할 때 실제 데이터를 가져옵니다.

### EAGER

처음부터 같이 가져옵니다.

초급 단계 기준 추천 감각:

> 기본은 LAZY로 생각하기

EAGER는 편해 보여도 예상치 못한 쿼리와 성능 문제를 만들 수 있습니다.

---

## Proxy는 왜 필요할까

LAZY 로딩을 하려면 당장 진짜 객체를 만들지 않고,
"나중에 필요하면 가져오겠다"는 대리 객체가 필요합니다.

그게 프록시입니다.

즉:

- 아직 실제 Member를 DB에서 안 읽었을 수도 있음
- 하지만 객체처럼 보이게 해야 함

---

## N+1 문제란

예를 들어 학습 일지 10건을 조회하고,
각 일지의 작성자 이름을 읽는다고 해봅시다.

```java
List<StudyLog> logs = studyLogRepository.findAll();

for (StudyLog log : logs) {
    System.out.println(log.getMember().getName());
}
```

문제:

1. 먼저 학습 일지 목록 1번 조회
2. 그다음 각 행마다 회원 조회가 추가로 발생

즉, 1 + N번 쿼리.

이것이 N+1 문제입니다.

---

## 해결 방법 1: Fetch Join

```java
@Query("""
    select s
    from StudyLog s
    join fetch s.member
""")
List<StudyLog> findAllWithMember();
```

연관 객체를 한 번에 같이 가져옵니다.

가장 먼저 익혀야 할 해결책입니다.

---

## 해결 방법 2: `@EntityGraph`

```java
@EntityGraph(attributePaths = {"member"})
List<StudyLog> findAll();
```

코드가 비교적 간결하고,
연관 로딩 전략을 선언적으로 줄 수 있습니다.

---

## 해결 방법 3: Batch Size

LAZY를 유지하면서도 한 번에 묶어서 가져오도록 도와줍니다.

특정 상황에서 유용하지만,
첫 감각은 Fetch Join과 EntityGraph를 먼저 익히는 편이 좋습니다.

---

## cascade와 orphanRemoval

### cascade

부모 저장/삭제 시 자식도 같이 처리할지 정합니다.

### orphanRemoval

부모 컬렉션에서 빠진 자식을 삭제 대상으로 볼지 정합니다.

둘 다 강력한 기능이라서,
초보 단계에서는 "무조건 편하다"보다 "영향 범위가 크다"를 먼저 기억하세요.

---

## 자주 하는 실수

- FK 컬럼 값과 객체 참조를 동시에 따로 관리하려는 것
- EAGER를 기본처럼 사용하는 것
- N+1을 모르고 서비스/DTO 변환 중 쿼리가 폭증하는 것
- 관계 주인을 반대편으로 착각하는 것

---

## 면접 체크

1. `@ManyToOne`과 `@OneToMany`는 어떻게 다른가요?
2. 연관 관계 주인이란 무엇인가요?
3. LAZY와 EAGER 차이는 무엇인가요?
4. N+1 문제는 왜 생기고 어떻게 해결하나요?

---

## 직접 해보기

1. `StudyLog -> Member` 관계를 `@ManyToOne`으로 매핑해보세요.
2. 목록 조회 후 작성자 이름을 출력하며 N+1이 발생하는지 로그를 보세요.
3. Fetch Join 버전으로 바꾸고 쿼리 개수를 비교해보세요.
4. `@EntityGraph`로도 같은 효과를 비교해보세요.

---

## 다음 주제 연결

연관관계가 많아지고 검색 조건이 늘어나면 Spring Data JPA 메서드만으로는 한계가 옵니다. 다음에는 QueryDSL로 동적 검색을 다룹니다.
