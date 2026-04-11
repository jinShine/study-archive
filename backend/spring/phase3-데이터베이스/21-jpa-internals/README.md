# 21. JPA 동작 원리 — "save() 했을 때 안에서 무슨 일이 벌어지나?"

> **키워드**: `EntityManager` `영속성 컨텍스트` `1차 캐시` `Dirty Checking` `쓰기 지연` `flush` `merge` `OSIV`

---

## 핵심만 한 문장

**JPA는 바로 DB에 저장하지 않는다. 영속성 컨텍스트(메모리)에 먼저 보관하고, 커밋할 때 한꺼번에 DB로 보낸다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 영속성 컨텍스트, 1차 캐시, Dirty Checking, Entity 생명주기 | 면접 단골 + 실무 버그 70%의 원인 |
| 🟡 이해 | 쓰기 지연, flush vs commit, merge vs 변경감지 | 알면 성능 개선에 도움 |
| 🟢 참고 | JDBC Batch, @DynamicUpdate, OSIV | 있다는 것만 알면 됨 |

> 💡 20번에서 Entity를 만들고 save/findAll이 되는 걸 봤다. 이번에는 **내부에서 어떻게 돌아가는지**를 배운다. 이걸 모르면 JPA 버그를 절대 못 잡는다.

---

## 1. EntityManager — JPA의 리모컨 🔴

### 비유

```
TV를 보려면 → 리모컨이 필요하다
DB를 다루려면  → EntityManager가 필요하다
```

EntityManager가 하는 일:
- `persist()` → INSERT
- `find()` → SELECT
- `remove()` → DELETE
- 수정? → **따로 메서드가 없다!** (이게 핵심. 뒤에서 설명)

> 💡 Spring Data JPA의 `repository.save()`는 내부적으로 EntityManager의 `persist()`를 호출한다. 우리가 직접 쓸 일은 드물지만, 동작을 이해해야 한다.

---

## 2. 영속성 컨텍스트 — JPA의 핵심 🔴

### 비유: 장바구니

```
쇼핑몰에서 "구매" 버튼을 누르기 전까지
장바구니에 담은 상품은 실제로 결제되지 않는다.

JPA도 마찬가지:
"commit" 전까지 영속성 컨텍스트라는 장바구니에
변경사항을 모아둔다.
```

### 영속성 컨텍스트 안의 3개 저장소

```
┌────────────────────────────────────────────┐
│           영속성 컨텍스트                     │
│                                            │
│  ┌─────────────────────────────────┐       │
│  │ 1. 1차 캐시 (Map<PK, Entity>)    │       │
│  │    key=1 → Member(1, "홍길동")   │       │
│  │    key=2 → Member(2, "김철수")   │       │
│  └─────────────────────────────────┘       │
│                                            │
│  ┌─────────────────────────────────┐       │
│  │ 2. 스냅샷 저장소                  │       │
│  │    key=1 → {원본: "홍길동"}       │       │
│  │    key=2 → {원본: "김철수"}       │       │
│  └─────────────────────────────────┘       │
│                                            │
│  ┌─────────────────────────────────┐       │
│  │ 3. 쓰기 지연 SQL 저장소           │       │
│  │    INSERT INTO member ...        │       │
│  │    UPDATE member SET ...         │       │
│  └─────────────────────────────────┘       │
└────────────────────────────────────────────┘
```

| 저장소 | 역할 |
|--------|------|
| **1차 캐시** | 같은 Entity를 2번 조회하면 DB 안 가고 캐시에서 꺼냄 |
| **스냅샷** | Entity의 원본 상태를 저장. 변경 감지(Dirty Checking)에 사용 |
| **쓰기 지연 SQL** | SQL을 모아뒀다가 flush 할 때 한 번에 DB로 보냄 |

---

## 3. Entity 생명주기 — 따라쳐보기 🔴

```
비영속 (new)        영속 (managed)        준영속 (detached)       삭제 (removed)
┌─────────┐        ┌─────────────┐       ┌──────────────┐       ┌─────────┐
│ new로    │─save()→│ 영속성 컨텍스트│─detach→│ 컨텍스트에서  │       │ DB에서   │
│ 생성만 함 │        │ 에서 관리 중  │  ()   │ 분리됨       │       │ 삭제 예정 │
└─────────┘        └─────────────┘       └──────────────┘       └─────────┘
                         │                                           ↑
                         └──────────── remove() ─────────────────────┘
```

**💻 따라쳐보기 — 코드로 확인:**

20번 프로젝트에서 테스트 API를 추가하자:

`src/main/java/com/study/jpapractice/controller/TestController.java`:

```java
package com.study.jpapractice.controller;

import com.study.jpapractice.entity.Member;
import com.study.jpapractice.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class TestController {

    private final MemberRepository memberRepository;

    // 1차 캐시 확인
    @GetMapping("/cache")
    @Transactional(readOnly = true)
    public String testCache() {
        // 첫 번째 조회: DB에서 SELECT
        Member m1 = memberRepository.findById(1L).orElseThrow();

        // 두 번째 조회: 1차 캐시에서 꺼냄 (SQL 안 나감!)
        Member m2 = memberRepository.findById(1L).orElseThrow();

        return "같은 객체? " + (m1 == m2);  // true!
    }

    // Dirty Checking 확인
    @GetMapping("/dirty")
    @Transactional
    public String testDirty() {
        Member member = memberRepository.findById(1L).orElseThrow();

        // setter 없이 수정 메서드 호출만으로 UPDATE 발생!
        // (Member에 updateName 메서드 추가 필요)
        // member.updateName("변경된이름");

        return "Dirty Checking 확인 - 콘솔에 UPDATE SQL 확인!";
    }
}
```

**💻 `/test/cache` 호출 시 콘솔:**

```sql
Hibernate:
    select m1_0.id, m1_0.email, m1_0.name
    from member m1_0
    where m1_0.id=?
```

→ SELECT가 **1번만** 나간다! 두 번째 `findById`는 1차 캐시에서 꺼냈기 때문.
→ 그리고 `m1 == m2`가 `true`! 같은 트랜잭션 안에서 같은 PK로 조회하면 **같은 객체**를 반환한다.

---

## 4. 1차 캐시 상세 🔴

```
findById(1L) 호출 과정:

Step 1: 1차 캐시에 id=1이 있나? → 없다
Step 2: DB에서 SELECT → 결과를 1차 캐시에 저장
Step 3: 1차 캐시에서 Entity 반환

findById(1L) 다시 호출:

Step 1: 1차 캐시에 id=1이 있나? → 있다!
Step 2: DB 안 가고 바로 반환 (SQL 없음!)
```

> 💡 1차 캐시는 **같은 트랜잭션 안에서만** 유효하다. 트랜잭션이 끝나면 캐시도 사라진다.

---

## 5. Dirty Checking (변경 감지) — 따라쳐보기 🔴

**JPA에서 가장 마법 같은 기능.** UPDATE SQL을 직접 안 써도 된다!

### 동작 원리

```
Step 1: findById(1L) → DB에서 가져옴 + 스냅샷 저장
        1차 캐시: Member(1, "홍길동")
        스냅샷:   {name: "홍길동"}

Step 2: member.updateName("변경됨")
        1차 캐시: Member(1, "변경됨")   ← Java 객체만 바뀜
        스냅샷:   {name: "홍길동"}      ← 원본은 그대로

Step 3: 트랜잭션 commit 시점 (= flush)
        JPA가 1차 캐시와 스냅샷을 비교!
        "name이 홍길동 → 변경됨으로 바뀌었네?"
        → UPDATE SQL 자동 생성!

        Hibernate:
            update member
            set name=?
            where id=?
```

**💻 따라쳐보기 — Member에 수정 메서드 추가:**

```java
// Member.java에 추가
public void updateName(String name) {
    this.name = name;
}
```

```java
// TestController.java에 추가
@GetMapping("/dirty-check")
@Transactional
public String testDirtyCheck() {
    Member member = memberRepository.findById(1L).orElseThrow();
    member.updateName("홍길동_수정됨");  // 이 한 줄이면 끝!
    // save()를 안 불러도 UPDATE가 된다!
    return "콘솔에서 UPDATE SQL 확인!";
}
```

**💻 `/test/dirty-check` 호출 시 콘솔:**

```sql
Hibernate:
    select m1_0.id, m1_0.email, m1_0.name
    from member m1_0
    where m1_0.id=?
Hibernate:
    update member
    set email=?, name=?
    where id=?
```

→ `save()`를 안 불렀는데 **UPDATE가 자동으로 나갔다!** 이게 Dirty Checking.

> 💡 **"영속 상태의 Entity를 수정하면, 트랜잭션 커밋 시 자동으로 UPDATE SQL이 생성된다"** — 면접 필수 답변!

---

## 6. 쓰기 지연 (Write-Behind) 🟡

```
save(member1) → SQL 안 나감! (쓰기 지연 저장소에 INSERT 대기)
save(member2) → SQL 안 나감! (쓰기 지연 저장소에 INSERT 대기)
save(member3) → SQL 안 나감! (쓰기 지연 저장소에 INSERT 대기)

commit()      → 이때 3개 INSERT가 한번에 DB로 나감!
```

> 💡 SQL을 모아서 한번에 보내므로 **네트워크 왕복이 줄어든다**.

---

## 7. flush vs commit 🟡

| 동작 | 설명 |
|------|------|
| `flush` | 쓰기 지연 SQL을 DB로 **보내기만** 함 (아직 되돌릴 수 있음) |
| `commit` | flush + DB에 **확정** (되돌릴 수 없음) |

```
flush:  "주문서를 가게에 보냄" (아직 취소 가능)
commit: "결제 완료" (취소 불가)
```

> 💡 Spring에서 `@Transactional` 메서드가 정상 종료하면 자동으로 commit이 호출된다.

---

## 8. save() 내부 — persist vs merge 🟡

```java
// SimpleJpaRepository.save() 내부 코드
public <S extends T> S save(S entity) {
    if (isNew(entity)) {
        em.persist(entity);   // id가 null → INSERT
        return entity;
    } else {
        return em.merge(entity);  // id가 있음 → SELECT + UPDATE
    }
}
```

| 상황 | 내부 호출 | SQL |
|------|----------|-----|
| `id`가 null | `persist()` | INSERT |
| `id`가 있음 | `merge()` | SELECT → UPDATE |

> 💡 **"save()를 호출하면 isNew() 판단 → persist 또는 merge"** — 면접에서 물어보면 이렇게 답하자.

### merge vs Dirty Checking

| 비교 | merge | Dirty Checking |
|------|-------|----------------|
| 사용 방법 | `save(entity)` 직접 호출 | 영속 Entity 수정만 하면 자동 |
| SELECT 추가 쿼리 | 있음 (현재 DB 상태를 먼저 조회) | 없음 (이미 1차 캐시에 있기 때문) |
| 추천 | 준영속 Entity일 때만 | **항상 이걸 써라!** |

```java
// ❌ merge 방식 (SELECT + UPDATE = 쿼리 2번)
studyLog.setTitle("새제목");
studyLogRepository.save(studyLog);

// ✅ Dirty Checking 방식 (UPDATE만 = 쿼리 1번)
@Transactional
public void updateTitle(Long id, String title) {
    StudyLog log = studyLogRepository.findById(id).orElseThrow();
    log.updateTitle(title);  // 끝! save() 안 불러도 됨
}
```

---

## 9. OSIV (Open Session In View) 🟢

| 설정 | 동작 |
|------|------|
| `spring.jpa.open-in-view=true` (기본값) | 영속성 컨텍스트가 **View(Controller)까지** 살아있음 |
| `spring.jpa.open-in-view=false` | 영속성 컨텍스트가 **Service까지만** 살아있음 |

> 💡 실무에서는 `false`로 끄는 걸 권장한다. 이유는 24번(N+1)에서 자세히 다룬다.

---

## 10. 전체 흐름 정리 🔴

```
@Transactional
public void update(Long id) {
    // 1. findById → DB SELECT → 1차 캐시에 Entity 저장 + 스냅샷 저장
    Member member = memberRepository.findById(id).orElseThrow();

    // 2. Java 객체를 수정 (1차 캐시의 Entity가 바뀜)
    member.updateName("새이름");

    // 3. 메서드 끝 → @Transactional이 commit 호출
    //    → flush: 1차 캐시와 스냅샷 비교
    //    → "name이 바뀌었네!" → UPDATE SQL 생성
    //    → DB에 UPDATE 실행
    //    → commit 확정
}
```

---

## 11. 실습 문제

### 문제: 다음 코드의 SQL 출력을 예측하시오

```java
@Transactional
public void test() {
    Member m = memberRepository.save(
        Member.builder().name("테스트").email("test@mail.com").build()
    );

    Member found = memberRepository.findById(m.getId()).orElseThrow();

    found.updateName("수정됨");
}
```

<details>
<summary>정답 보기</summary>

```sql
-- 1. save() → persist() → INSERT
INSERT INTO member (email, name) VALUES (?, ?)

-- 2. findById() → 1차 캐시에 이미 있으므로 SQL 없음!

-- 3. updateName() → Dirty Checking → commit 시점에 UPDATE
UPDATE member SET email=?, name=? WHERE id=?
```

총 SQL: INSERT 1번 + UPDATE 1번 = **2번**
(findById는 1차 캐시 히트로 **0번**)

</details>

---

## 12. 면접 대비 🔴

| 질문 | 핵심 답변 |
|------|-----------|
| 영속성 컨텍스트란? | Entity를 관리하는 1차 캐시 공간. 1차 캐시, 스냅샷, 쓰기 지연 SQL 저장소로 구성 |
| 1차 캐시의 장점? | 같은 트랜잭션에서 같은 PK 조회 시 DB를 안 가고 캐시에서 반환. 동일성(==) 보장 |
| Dirty Checking이란? | 영속 Entity가 변경되면 스냅샷과 비교하여 트랜잭션 커밋 시 자동 UPDATE SQL 생성 |
| Entity 생명주기? | 비영속(new) → 영속(persist) → 준영속(detach) → 삭제(remove) |
| flush와 commit 차이? | flush는 SQL을 DB로 보내기만(롤백 가능), commit은 확정(롤백 불가) |
| save() 내부 동작? | isNew() → id null이면 persist(INSERT), 있으면 merge(SELECT+UPDATE) |

---

## 13. 핵심 요약

```
📌 이번에 배운 것:

1. 영속성 컨텍스트 = Entity 관리 공간 (장바구니)
2. 3개 저장소: 1차 캐시, 스냅샷, 쓰기 지연 SQL
3. 1차 캐시: 같은 PK → DB 안 가고 캐시에서 반환
4. Dirty Checking: 영속 Entity 수정 → 커밋 시 자동 UPDATE
5. 쓰기 지연: SQL을 모아뒀다가 flush 시 한번에 실행
6. save() = id null → persist(INSERT), id 있음 → merge
7. Dirty Checking이 merge보다 좋다 (SELECT 1번 절약)
```
