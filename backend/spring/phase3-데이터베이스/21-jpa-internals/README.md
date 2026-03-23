# 21. JPA 동작 원리 — 영속성 컨텍스트 완전 정복

> **키워드**: `EntityManager` `영속성 컨텍스트` `1차 캐시` `Dirty Checking` `쓰기 지연` `Entity Lifecycle` `flush` `JDBC Batch` `@DynamicUpdate` `merge` `OSIV`

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 영속성 컨텍스트, 1차 캐시, Dirty Checking, 쓰기 지연, Entity 생명주기 | 면접 최다 출제 + JPA 트러블슈팅의 핵심 |
| 🟡 이해 | flush, merge vs 변경감지, OSIV, @DynamicUpdate | 개념 이해 + 실무 이슈 해결에 필요 |
| 🟢 참고 | JDBC Batch 최적화, 3개 저장소 내부 구조 | 성능 튜닝 시 필요 |

> 💡 **20번에서 "JPA가 뭐하는 녀석인지" 배웠다. 이번엔 "JPA가 내부에서 어떻게 돌아가는지" 배운다.** 면접에서 가장 많이 물어보는 주제가 바로 이 영속성 컨텍스트다.

---

## 1. 왜 내부 동작을 알아야 하는가? 🔴

### 20번에서 한 코드를 다시 보자

```java
// 저장
studyLogRepository.save(studyLog);

// 수정 — save() 안 불러도 DB에 반영된다고?
StudyLog log = studyLogRepository.findById(1L).orElseThrow();
log.update("새 제목", "새 내용", Category.JPA, 90);
// 여기서 끝. save()를 안 불렀는데 DB가 바뀐다..? 마법인가?
```

이게 어떻게 가능한지 모르면:
- **왜 save()를 안 불러도 되는지** 설명 못 한다 → 면접 탈락
- **왜 가끔 save()를 불러야 하는지** 판단 못 한다 → 버그 발생
- **왜 조회를 2번 해도 SQL이 1번만 나가는지** 이해 못 한다 → 성능 분석 불가

> 🔴 **영속성 컨텍스트를 이해하면 JPA의 80%를 이해한 것이다.**

---

## 2. EntityManager — JPA의 리모컨 🔴

### 비유: TV 리모컨

```
EntityManager = TV 리모컨
  → 리모컨으로 TV(DB)를 조작한다
  → 채널 변경(조회), 녹화(저장), 삭제 등

리모컨 하나당 TV 한 대
  → EntityManager 하나당 영속성 컨텍스트 한 개
  → 요청(트랜잭션) 하나당 EntityManager 한 개
```

### EntityManager의 핵심 메서드

```java
EntityManager em = ...;

em.persist(entity);     // 영속성 컨텍스트에 저장 (INSERT 예약)
em.find(Class, id);     // 1차 캐시 → 없으면 DB 조회
em.merge(entity);       // 준영속 → 영속 (병합)
em.remove(entity);      // 삭제 예약 (DELETE 예약)
em.flush();             // 쓰기 지연 SQL을 DB로 발사
em.clear();             // 영속성 컨텍스트 초기화
em.detach(entity);      // 특정 엔티티를 준영속으로 전환
```

> 💡 **Spring Data JPA를 쓰면 EntityManager를 직접 쓸 일은 거의 없다.** `repository.save()` → 내부적으로 `em.persist()` 또는 `em.merge()`를 호출한다. 하지만 **원리를 아는 것**과 **모르는 것**은 천지 차이다.

---

## 3. 영속성 컨텍스트 — JPA의 심장 🔴

### 비유: 장바구니

```
온라인 쇼핑을 생각하자.

1. 상품을 장바구니에 담는다 (→ 아직 결제 안 됨)
2. 장바구니에서 수량을 바꾼다 (→ 아직 결제 안 됨)
3. 장바구니에서 상품을 빼기도 한다 (→ 아직 결제 안 됨)
4. "결제하기" 버튼을 누른다 → 진짜 결제가 된다!

영속성 컨텍스트 = 장바구니
  → Entity를 저장/수정/삭제해도 바로 DB에 가지 않는다
  → "장바구니"에 모아뒀다가
  → flush() 또는 트랜잭션 커밋 시점에 한꺼번에 DB로 보낸다
  → 이게 "쓰기 지연"이다!
```

### 정의

> **영속성 컨텍스트(Persistence Context)** = Entity를 영구 저장하는 **논리적 공간**
>
> EntityManager를 통해 접근하며, Entity의 상태를 관리하고, DB와의 동기화를 담당한다.

### 영속성 컨텍스트의 3가지 저장소 🟢

내부적으로 영속성 컨텍스트는 3가지 저장소를 가진다:

```
┌─────────────────────────────────────────────────┐
│              영속성 컨텍스트                       │
│                                                 │
│  ┌──────────────────┐                           │
│  │  ① 1차 캐시       │  Entity를 Map으로 저장     │
│  │  (First-Level     │  key = @Id 값             │
│  │   Cache)          │  value = Entity 객체       │
│  └──────────────────┘                           │
│                                                 │
│  ┌──────────────────┐                           │
│  │  ② 스냅샷 저장소   │  Entity의 최초 상태 복사본  │
│  │  (Snapshot Store) │  Dirty Checking에 사용     │
│  └──────────────────┘                           │
│                                                 │
│  ┌──────────────────┐                           │
│  │  ③ 쓰기 지연      │  실행할 SQL을 모아두는 곳   │
│  │  SQL 저장소       │  flush() 시 한꺼번에 실행   │
│  │  (Write-Behind    │                           │
│  │   SQL Store)      │                           │
│  └──────────────────┘                           │
└─────────────────────────────────────────────────┘
```

> 이 3개가 어떻게 협력하는지 아래에서 하나씩 본다.

---

## 4. Entity 생명주기 (Lifecycle) 🔴

### 4가지 상태

```
                    persist()
  [비영속] ─────────────────────→ [영속]
  (new/transient)                (managed)
                                   │  ↑
                          detach() │  │ merge()
                                   ↓  │
                                [준영속]
                                (detached)
                                   │
                                   │ (GC)
                                   ↓
       remove()                 [삭제]
  [영속] ──────────────────────→ (removed)
```

### 비유: 학생의 상태

```
비영속 = 입학 전 학생
  → 학교(영속성 컨텍스트)와 아무 관계 없다
  → new Student()만 한 상태

영속 = 재학생
  → 학교에 등록되어 관리를 받는다
  → 성적 변경(필드 수정)이 자동으로 추적(Dirty Checking)된다

준영속 = 휴학생
  → 한때 학교에 있었지만, 지금은 관리 대상이 아니다
  → 성적 변경해도 학교가 모른다

삭제 = 자퇴
  → 학교에서 제거될 예정
```

### 코드로 이해하기

```java
@Transactional
public void lifecycle() {
    // ① 비영속 (new) — 아직 영속성 컨텍스트와 무관
    StudyLog log = StudyLog.builder()
        .title("JPA 학습")
        .category(Category.JPA)
        .studyTime(120)
        .studyDate(LocalDate.now())
        .memberId(1L)
        .build();
    // 이 시점: log는 그냥 Java 객체. DB와 아무 관계 없음.

    // ② 영속 (managed) — 영속성 컨텍스트에 저장
    em.persist(log);
    // 이 시점: 1차 캐시에 저장됨. SQL은 아직 안 나감!
    // log.getId() → null일 수도 있고 값이 있을 수도 있음 (전략에 따라)

    // ③ 수정 — Dirty Checking 대상
    log.update("JPA 심화 학습", "영속성 컨텍스트를 배웠다", Category.JPA, 150);
    // 이 시점: 아직 DB에 UPDATE 안 나감. 커밋 때 감지.

    // ④ 준영속 (detached) — 영속성 컨텍스트에서 분리
    em.detach(log);
    // 이 시점: log는 더 이상 관리 대상이 아님.
    log.update("이건 무시됨", "DB에 안 반영됨", Category.JPA, 999);
    // → Dirty Checking 안 됨! DB에 안 반영!

    // ⑤ 다시 영속 (merge) — 준영속 → 영속
    StudyLog mergedLog = em.merge(log);
    // 이 시점: mergedLog가 영속 상태. (주의: log가 아니라 mergedLog!)

    // ⑥ 삭제 (removed)
    em.remove(mergedLog);
    // 이 시점: 삭제 예약. 커밋 때 DELETE SQL 실행.
}
```

> 🔴 **면접에서 "Entity의 생명주기를 설명해주세요"라고 물어본다.** 비영속 → 영속 → 준영속/삭제, 이 흐름을 코드와 함께 설명할 수 있어야 한다.

---

## 5. 1차 캐시 — 같은 걸 두 번 안 가져온다 🔴

### 비유: 핸드폰 연락처

```
친구한테 전화하려면?

방법 1: 전화번호부(DB)를 매번 찾는다 → 느리다
방법 2: 자주 거는 번호를 핸드폰(1차 캐시)에 저장해둔다 → 빠르다!

1차 캐시 = 핸드폰 연락처
  → 한 번 조회한 Entity를 Map에 저장해둔다
  → 다시 조회하면 DB에 안 가고 캐시에서 바로 꺼낸다
```

### 동작 과정 — Step by Step

```java
@Transactional
public void cacheExample() {
    // 1. 첫 번째 조회 — DB에서 가져온다
    StudyLog log1 = em.find(StudyLog.class, 1L);
    // SQL 실행: SELECT * FROM study_log WHERE id = 1
    // → 결과를 1차 캐시에 저장

    // 2. 두 번째 조회 — DB에 안 간다!
    StudyLog log2 = em.find(StudyLog.class, 1L);
    // SQL 실행: 없음! 1차 캐시에서 바로 꺼냄

    // 3. 동일성 보장
    System.out.println(log1 == log2);  // true!
    // → 같은 객체를 반환한다 (20번에서 배운 동일성 보장)
}
```

```
내부 동작:

1차 캐시 (Map 구조)
┌──────────┬────────────────────┐
│  @Id 값   │  Entity 객체        │
├──────────┼────────────────────┤
│  1L      │  StudyLog{id=1, ...}│  ← find(1L) → 여기서 반환!
│  2L      │  StudyLog{id=2, ...}│
└──────────┴────────────────────┘

em.find(StudyLog.class, 1L)
  ① 1차 캐시에 1L이 있나? → YES → 캐시에서 반환 (DB 안 감!)
                          → NO  → DB 조회 → 결과를 캐시에 저장 → 반환
```

### persist() 후 바로 조회하면?

```java
@Transactional
public void persistAndFind() {
    StudyLog log = StudyLog.builder().title("JPA").build();
    em.persist(log);
    // → 1차 캐시에 저장됨 (INSERT SQL은 아직 안 나감!)

    StudyLog found = em.find(StudyLog.class, log.getId());
    // → 1차 캐시에 있으니까 DB에 안 간다!
    // → SQL 0번 실행!
}
```

### 1차 캐시의 범위

```
⚠️ 중요: 1차 캐시는 트랜잭션 범위!

트랜잭션 시작 ─────────────── 트랜잭션 종료
    │  1차 캐시 생존 구간  │
    └──────────────────────┘

→ 트랜잭션이 끝나면(커밋/롤백) 1차 캐시도 사라진다
→ 다른 트랜잭션에서는 같은 데이터를 다시 DB에서 가져온다
→ Redis 같은 글로벌 캐시와는 다르다! (1차 캐시 = 로컬, 짧은 수명)
```

> 🔴 **"1차 캐시의 범위는?"** → "트랜잭션 범위입니다. 같은 트랜잭션 안에서 같은 id로 조회하면 DB에 가지 않고 캐시에서 반환합니다."

---

## 6. Dirty Checking — 변경 감지 🔴

### 가장 중요한 기능. 20번에서 "마법"이라고 했던 그것.

### 비유: CCTV

```
편의점에 CCTV가 있다.

1. 손님이 들어온다 (Entity가 영속 상태가 된다)
2. CCTV가 입장 시 모습을 사진 찍어둔다 (스냅샷 저장)
3. 손님이 돌아다닌다 (Entity 필드 변경)
4. 퇴장할 때 CCTV가 비교한다: "입장 때 모습 vs 지금 모습"
5. 달라진 점이 있으면 기록한다 (UPDATE SQL 생성)
```

### 동작 과정 — Step by Step

```java
@Transactional
public void dirtyCheckingExample() {
    // Step 1: DB에서 조회 → 영속 상태
    StudyLog log = em.find(StudyLog.class, 1L);
    // SQL: SELECT * FROM study_log WHERE id = 1
    // 내부:
    //   1차 캐시에 저장: {1L → StudyLog{title="JPA 학습", studyTime=120}}
    //   스냅샷 저장:     {1L → StudyLog{title="JPA 학습", studyTime=120}}  ← 복사본!

    // Step 2: 필드 변경
    log.update("JPA 심화", "영속성 컨텍스트 학습", Category.JPA, 150);
    // 현재 Entity: {title="JPA 심화", studyTime=150}
    // 스냅샷:      {title="JPA 학습", studyTime=120}  ← 안 바뀜!

    // Step 3: 트랜잭션 커밋 시 (자동으로 flush 호출)
    // JPA가 비교한다:
    //   Entity 현재값:  title="JPA 심화", studyTime=150
    //   스냅샷 원본값:   title="JPA 학습", studyTime=120
    //   → title 바뀜! studyTime 바뀜! → UPDATE SQL 생성!
}
// 트랜잭션 커밋 → flush()
// SQL: UPDATE study_log SET title='JPA 심화', content='...', study_time=150 WHERE id=1
```

### 전체 흐름을 그림으로

```
          영속성 컨텍스트
┌────────────────────────────────────┐
│                                    │
│  1차 캐시                스냅샷      │
│  ┌───────────────┐  ┌───────────┐ │
│  │ id=1          │  │ id=1      │ │
│  │ title=JPA 심화 │  │ title=JPA │ │  ← 현재값 vs 스냅샷 비교!
│  │ time=150      │  │ time=120  │ │
│  └───────────────┘  └───────────┘ │
│                                    │
│  쓰기 지연 SQL 저장소                │
│  ┌────────────────────────────┐   │
│  │ UPDATE study_log           │   │  ← 비교 결과 다르면 SQL 생성!
│  │ SET title='JPA 심화',      │   │
│  │     study_time=150         │   │
│  │ WHERE id=1                 │   │
│  └────────────────────────────┘   │
│                                    │
└────────────────────────────────────┘
         │
         │ flush() (트랜잭션 커밋 시)
         ▼
       ┌────┐
       │ DB │
       └────┘
```

### Dirty Checking이 안 되는 경우 (자주 하는 실수!)

```java
// ❌ Case 1: 비영속 객체는 Dirty Checking 안 됨
StudyLog log = new StudyLog();  // 비영속
log.update("새 제목", ...);
// → 영속성 컨텍스트가 모르는 객체. UPDATE 안 나감!
// → save()를 명시적으로 호출해야 한다

// ❌ Case 2: 준영속 객체는 Dirty Checking 안 됨
StudyLog log = em.find(StudyLog.class, 1L);  // 영속
em.detach(log);  // 준영속으로 전환!
log.update("새 제목", ...);
// → 더 이상 관리 대상이 아님. UPDATE 안 나감!

// ❌ Case 3: 트랜잭션 밖에서 수정
// @Transactional이 없는 메서드에서 수정하면 Dirty Checking 안 됨!
public void noTransaction() {  // @Transactional 없음!
    StudyLog log = studyLogRepository.findById(1L).orElseThrow();
    log.update("새 제목", ...);
    // → 트랜잭션이 없으니 flush도 안 되고 UPDATE도 안 나감!
}
```

> 🔴 **Dirty Checking 조건 3가지:**
> 1. Entity가 **영속 상태**여야 한다
> 2. **트랜잭션 안**에서 수정해야 한다
> 3. 트랜잭션이 **커밋**되어야 한다 (flush 시점에 SQL 생성)

---

## 7. 쓰기 지연 (Write-Behind) 🔴

### 비유: 택배 모아보내기

```
택배를 보내는 2가지 방법:

방법 1: 택배가 생길 때마다 바로 보낸다
  → 10건이면 택배차가 10번 왕복 → 비효율!

방법 2: 택배를 모아뒀다가 한꺼번에 보낸다
  → 10건을 한 번에 → 택배차 1번 왕복 → 효율적!

쓰기 지연 = 방법 2
  → INSERT/UPDATE/DELETE SQL을 바로 실행하지 않고
  → 쓰기 지연 SQL 저장소에 모아뒀다가
  → flush() 시점에 한꺼번에 DB로 보낸다
```

### 동작 과정 — Step by Step

```java
@Transactional
public void writeBehindExample() {
    // Step 1: persist
    StudyLog log1 = StudyLog.builder().title("JPA 1").build();
    em.persist(log1);
    // SQL 저장소: [INSERT log1]
    // DB: 아직 안 감!

    // Step 2: persist 하나 더
    StudyLog log2 = StudyLog.builder().title("JPA 2").build();
    em.persist(log2);
    // SQL 저장소: [INSERT log1, INSERT log2]
    // DB: 아직 안 감!

    // Step 3: 수정
    log1.update("JPA 심화 1", ...);
    // SQL 저장소: [INSERT log1, INSERT log2, UPDATE log1]
    // DB: 아직 안 감!

    System.out.println("여기까지 SQL 0건!");
}
// Step 4: 트랜잭션 커밋 → flush() 자동 호출
// SQL 저장소의 쿼리를 한꺼번에 실행:
//   → INSERT INTO study_log ... (log1)
//   → INSERT INTO study_log ... (log2)
//   → UPDATE study_log SET ... WHERE id = ?
// 이 시점에 비로소 DB에 반영!
```

### 쓰기 지연의 장점

```
1. 네트워크 비용 절감
   → DB와 통신 횟수를 줄인다

2. 트랜잭션 롤백이 쉽다
   → 중간에 예외가 발생하면? SQL을 안 보냈으니 롤백할 것도 없다!

3. JDBC Batch 최적화 가능
   → 같은 종류의 INSERT를 모아서 한 번에 실행 (아래에서 설명)
```

---

## 8. flush — 쓰기 지연 SQL을 DB로 보내는 순간 🟡

### flush란?

> 쓰기 지연 SQL 저장소에 쌓인 SQL을 **DB에 실행**하는 것

```
⚠️ flush ≠ 커밋!

flush: SQL을 DB에 보내기만 함 (아직 확정 안 됨)
커밋:  DB가 결과를 확정함

예: 은행 송금
  flush = "100만원 이체 요청서 제출" (아직 이체 안 됨)
  커밋  = "이체 승인" (실제 돈이 이동)
```

### flush가 발생하는 3가지 시점

```
1. 트랜잭션 커밋 시 (가장 일반적)
   → @Transactional 메서드가 끝날 때 자동으로 flush → commit

2. em.flush() 직접 호출
   → 테스트나 특수한 상황에서 강제 flush

3. JPQL 쿼리 실행 전 자동 flush
   → JPQL은 DB에 직접 날리는 쿼리다
   → 쓰기 지연 SQL이 먼저 반영되어야 정확한 결과를 가져올 수 있으니까
```

```java
@Transactional
public void autoFlushExample() {
    StudyLog log = StudyLog.builder().title("JPA").build();
    em.persist(log);
    // 쓰기 지연: [INSERT log]  — DB에 아직 없음!

    // JPQL 실행 → 자동 flush 발생!
    List<StudyLog> logs = em.createQuery("SELECT s FROM StudyLog s", StudyLog.class)
        .getResultList();
    // ① 먼저 flush → INSERT 실행 (DB에 반영)
    // ② 그 다음 SELECT 실행 (방금 INSERT한 데이터도 포함됨)
}
```

### flush 후 1차 캐시는?

```
flush해도 1차 캐시는 유지된다!
  → flush = SQL만 보내는 것
  → clear = 1차 캐시 비우는 것

em.flush()  → SQL 실행 O,  1차 캐시 유지 O
em.clear()  → SQL 실행 X,  1차 캐시 삭제 O
```

---

## 9. save()는 내부에서 뭘 하나? 🔴

### Spring Data JPA의 save() 열어보기

```java
// SimpleJpaRepository.java (Spring Data JPA 내부 코드)
@Transactional
public <S extends T> S save(S entity) {
    if (entityInformation.isNew(entity)) {
        em.persist(entity);    // 새 엔티티면 persist (INSERT)
        return entity;
    } else {
        return em.merge(entity);  // 기존 엔티티면 merge (UPDATE)
    }
}
```

### isNew() 판단 기준

```
id가 null이면? → 새 엔티티 → persist()
id가 있으면?   → 기존 엔티티 → merge()

@GeneratedValue를 쓰면:
  → persist() 전에는 id가 null
  → persist() 후에 id가 채워짐 (DB가 생성)

id를 직접 넣으면 (@GeneratedValue 없이):
  → id가 이미 있으니까 merge()로 간다
  → merge()는 DB에서 SELECT 한 번 더 실행 → 비효율!
  → 이걸 해결하려면 Persistable 인터페이스를 구현해야 한다
```

> 💡 **그래서 @GeneratedValue를 쓰는 게 편하다.** id를 DB가 생성하면 isNew() 판단이 명확하고, 불필요한 SELECT가 발생하지 않는다.

---

## 10. merge vs 변경감지 (Dirty Checking) 🟡

### 이 두 가지를 헷갈리면 안 된다!

```
변경감지 (Dirty Checking):
  → 영속 상태의 Entity 필드를 수정하면 자동으로 UPDATE
  → save() 호출 불필요
  → 추천 방식! ✅

merge:
  → 준영속 상태의 Entity를 다시 영속으로 만듦
  → DB에서 SELECT 한 번 실행 후, 값을 복사
  → save()를 호출해야 함
  → 비추 ❌ (특수한 경우에만)
```

### 비교 코드

```java
// ✅ 변경감지 — 추천!
@Transactional
public void updateByDirtyChecking(Long id, String newTitle) {
    StudyLog log = studyLogRepository.findById(id).orElseThrow();  // 영속 상태
    log.update(newTitle, ...);  // 필드 변경
    // 끝! save() 필요 없음. 트랜잭션 커밋 시 자동 UPDATE
}

// ❌ merge — 비추
@Transactional
public void updateByMerge(StudyLogUpdateRequest request) {
    StudyLog detached = new StudyLog();  // 비영속 또는 준영속
    detached.setId(request.getId());
    detached.setTitle(request.getTitle());

    studyLogRepository.save(detached);  // → 내부적으로 merge() 호출
    // ① SELECT * FROM study_log WHERE id = ?  (DB 조회)
    // ② 조회 결과에 detached의 값을 복사
    // ③ UPDATE study_log SET ...
    // → SELECT가 추가로 실행된다! 비효율!
}
```

### merge의 위험한 점

```java
// merge는 모든 필드를 덮어쓴다!
StudyLog detached = new StudyLog();
detached.setId(1L);
detached.setTitle("새 제목");
// content, category, studyTime 등은 null!

em.merge(detached);
// → UPDATE study_log SET title='새 제목', content=NULL, category=NULL, ...
// → 😱 의도하지 않은 필드가 NULL로 덮어써진다!
```

> 🟡 **결론: 수정은 항상 변경감지를 쓰자.** findById로 조회 → 필드 수정 → 트랜잭션 커밋. merge는 특수한 경우(API에서 전체 교체 요청 등)에만 쓴다.

---

## 11. @DynamicUpdate — 바뀐 필드만 UPDATE 🟡

### 기본 동작: 모든 필드를 UPDATE

```java
log.update("새 제목", ...);  // title만 바꿈

// 기본 생성되는 SQL
UPDATE study_log
SET title = '새 제목',
    content = '기존 내용',     -- 안 바뀌었는데도 포함!
    category = 'JPA',         -- 안 바뀌었는데도 포함!
    study_time = 120,          -- 안 바뀌었는데도 포함!
    study_date = '2026-03-21', -- 안 바뀌었는데도 포함!
    updated_at = '...'
WHERE id = 1;
```

```
왜 모든 필드를 보낼까?
  → Hibernate가 SQL을 미리 만들어두고 재사용하기 위해서
  → 컬럼 조합마다 다른 SQL을 만들면 오히려 비효율
  → 대부분의 경우 이게 더 빠르다 (SQL 파싱 캐시 활용)
```

### @DynamicUpdate 적용

```java
@Entity
@DynamicUpdate  // ← 바뀐 필드만 UPDATE!
public class StudyLog extends BaseEntity {
    ...
}
```

```sql
-- @DynamicUpdate 적용 후: title만 바뀌었으면
UPDATE study_log
SET title = '새 제목',
    updated_at = '...'
WHERE id = 1;
-- → 나머지 필드는 안 보낸다!
```

### 언제 쓰나?

```
@DynamicUpdate를 쓰면 좋은 경우:
  ✅ 컬럼이 20개 이상으로 많은 테이블
  ✅ 특정 컬럼만 자주 수정되는 경우
  ✅ DB에 컬럼 레벨 락이 중요한 경우

안 써도 되는 경우 (대부분):
  ✅ 컬럼이 적은 테이블 (10개 이하)
  ✅ 수정할 때 대부분의 필드가 바뀌는 경우
```

> 🟡 **기본적으로 안 붙여도 된다.** 컬럼이 아주 많은 테이블에서 성능 이슈가 측정되면 그때 붙이면 된다.

---

## 12. JDBC Batch — INSERT를 모아서 한 번에 🟢

### 설정

```yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 50  # INSERT를 최대 50개씩 모아서 실행
        order_inserts: true   # 같은 테이블 INSERT끼리 모아서 정렬
        order_updates: true   # 같은 테이블 UPDATE끼리 모아서 정렬
```

### 효과

```
batch_size 없이 100건 INSERT:
  INSERT INTO study_log VALUES (1, ...);  -- 1번
  INSERT INTO study_log VALUES (2, ...);  -- 2번
  ...
  INSERT INTO study_log VALUES (100, ...); -- 100번
  → DB와 100번 통신

batch_size: 50으로 100건 INSERT:
  INSERT INTO study_log VALUES (1, ...), (2, ...), ..., (50, ...);  -- 1번 (50건)
  INSERT INTO study_log VALUES (51, ...), (52, ...), ..., (100, ...); -- 2번 (50건)
  → DB와 2번 통신! (50배 빠르다)
```

> ⚠️ **IDENTITY 전략(MySQL AUTO_INCREMENT)에서는 JDBC Batch INSERT가 안 된다!** INSERT 시점에 DB가 id를 생성해야 하므로 한 건씩 INSERT해야 id를 받을 수 있기 때문이다. SEQUENCE 전략(PostgreSQL)에서는 Batch가 잘 동작한다.

---

## 13. OSIV (Open Session In View) 🟡

### 비유: 출입증

```
OSIV = ON (기본값):
  → "영속성 컨텍스트 출입증"을 HTTP 요청 시작부터 응답 끝까지 발급
  → Controller, View에서도 Lazy Loading 가능
  → 편하지만, DB 커넥션을 오래 잡고 있음

OSIV = OFF:
  → "출입증"을 @Transactional 범위에서만 발급
  → Controller, View에서 Lazy Loading 불가
  → 커넥션을 빨리 반납하므로 성능에 유리
```

### 그림으로 이해

```
OSIV = ON (spring.jpa.open-in-view: true) — 기본값!
┌─────────────────────────────────────────────────────┐
│  HTTP 요청                                           │
│  ┌──────────┬──────────────┬──────────┬──────────┐  │
│  │Controller│  Service     │Repository│  View    │  │
│  │          │@Transactional│          │          │  │
│  └──────────┴──────────────┴──────────┴──────────┘  │
│  │←── 영속성 컨텍스트 생존 범위 (요청 전체) ────────→│  │
│  │←── DB 커넥션 유지 ─────────────────────────────→│  │
└─────────────────────────────────────────────────────┘
→ Controller에서 entity.getTeam().getName() 가능! (Lazy Loading OK)
→ 하지만 DB 커넥션을 너무 오래 잡고 있다...


OSIV = OFF (spring.jpa.open-in-view: false) — 실무 권장!
┌─────────────────────────────────────────────────────┐
│  HTTP 요청                                           │
│  ┌──────────┬──────────────┬──────────┬──────────┐  │
│  │Controller│  Service     │Repository│  View    │  │
│  │          │@Transactional│          │          │  │
│  └──────────┴──────────────┴──────────┴──────────┘  │
│              │←── 영속성 컨텍스트 ──→│                │
│              │←── DB 커넥션 유지 ──→│                │
└─────────────────────────────────────────────────────┘
→ Controller에서 entity.getTeam().getName() → LazyInitializationException! 💥
→ Service 계층에서 필요한 데이터를 미리 DTO로 변환해서 반환해야 한다
→ 하지만 DB 커넥션을 빨리 반납하므로 동시 접속자가 많아도 안정적
```

### 실무 설정

```yaml
spring:
  jpa:
    open-in-view: false  # 실무에서는 끄는 것을 권장
```

```
OSIV를 끄면 코딩이 좀 더 귀찮아진다:
  → Service에서 필요한 데이터를 미리 다 조회해야 한다
  → DTO로 변환해서 Controller에 넘겨야 한다
  → 하지만 이게 더 안전하고 성능이 좋다

Spring Boot는 기본값이 true라서 시작할 때 이런 경고가 뜬다:
  WARN: spring.jpa.open-in-view is enabled by default.
```

> 🟡 **면접에서 "OSIV가 뭔가요?"라고 물어본다.** "영속성 컨텍스트의 생존 범위를 HTTP 요청 전체로 확장하는 설정입니다. true면 편하지만 DB 커넥션을 오래 잡고, false면 Service 범위로 제한되어 커넥션을 빨리 반납하지만 Controller에서 Lazy Loading이 불가합니다."

---

## 14. 전체 동작 흐름 — 처음부터 끝까지 🔴

### save() + 수정 + 커밋 전체 추적

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyLogService {

    private final StudyLogRepository studyLogRepository;

    @Transactional
    public StudyLogResponse update(Long id, StudyLogUpdateRequest request) {
        // ── Step 1: 조회 ──
        StudyLog log = studyLogRepository.findById(id).orElseThrow();
        // 내부: em.find(StudyLog.class, id)
        // → 1차 캐시 확인 → 없음 → DB SELECT
        // → SQL: SELECT * FROM study_log WHERE id = ?
        // → 결과를 1차 캐시에 저장
        // → 스냅샷도 저장 (원본 복사본)

        // ── Step 2: 수정 ──
        log.update(request.getTitle(), request.getContent(),
                   request.getCategory(), request.getStudyTime());
        // → 1차 캐시의 Entity 필드가 변경됨
        // → 스냅샷은 그대로 (원본 유지)
        // → SQL은 아직 안 나감!

        // ── Step 3: DTO 변환 ──
        return StudyLogResponse.from(log);
    }
    // ── Step 4: 메서드 종료 → @Transactional 커밋 → flush() 자동 호출 ──
    // → Dirty Checking: Entity 현재값 vs 스냅샷 비교
    // → title, content 등이 바뀌었네? → UPDATE SQL 생성
    // → SQL: UPDATE study_log SET title=?, content=?, ... WHERE id=?
    // → DB에 실행 → 커밋 완료!
}
```

```
시간순 정리:

     시간 ──────────────────────────────────────────→

     │  findById()  │  update()  │  return  │ 커밋  │
     │              │            │          │       │
SQL: │  SELECT      │  (없음)     │  (없음)   │UPDATE │
     │              │            │          │       │
     └──────────────────────────────────────────────┘
                  @Transactional 범위

→ SQL은 총 2번만 실행된다: SELECT 1번, UPDATE 1번
→ update() 시점에는 SQL이 안 나간다 (쓰기 지연!)
→ 트랜잭션 커밋 시점에 Dirty Checking으로 UPDATE가 나간다
```

---

## 15. 면접 대비 🔴🟡

### 🔴 필수 — 이것만은 반드시 답할 수 있어야 한다

**Q1: 영속성 컨텍스트가 뭔가요?**

> Entity를 관리하는 논리적 공간입니다. EntityManager가 관리하며, 1차 캐시, 변경 감지, 쓰기 지연 등의 기능을 제공합니다. 트랜잭션 범위에서 동작합니다.

**Q2: Dirty Checking(변경 감지)이 뭔가요?**

> 영속 상태의 Entity 필드가 변경되면, 트랜잭션 커밋 시점에 스냅샷(최초 조회 시 저장한 원본)과 비교하여 변경된 부분을 자동으로 UPDATE SQL로 생성하는 기능입니다. 별도로 save()를 호출하지 않아도 됩니다.

**Q3: 쓰기 지연(Write-Behind)이 뭔가요?**

> INSERT, UPDATE, DELETE SQL을 즉시 실행하지 않고 쓰기 지연 SQL 저장소에 모아뒀다가, flush() 시점(주로 트랜잭션 커밋)에 한꺼번에 DB에 실행하는 기능입니다. 네트워크 비용을 줄이고, 배치 처리를 가능하게 합니다.

**Q4: Entity의 생명주기 4가지를 설명해주세요.**

> - **비영속(new)**: `new`로 생성만 한 상태, 영속성 컨텍스트와 무관
> - **영속(managed)**: persist() 또는 조회로 영속성 컨텍스트에 관리되는 상태, Dirty Checking 대상
> - **준영속(detached)**: 영속 상태였다가 분리된 상태, Dirty Checking 안 됨
> - **삭제(removed)**: remove() 호출로 삭제 예약된 상태, 커밋 시 DELETE 실행

**Q5: 1차 캐시의 범위와 동작은?**

> 트랜잭션 범위에서 동작합니다. 같은 트랜잭션 내에서 같은 id로 조회하면 DB에 SQL을 보내지 않고 캐시에서 반환합니다. 트랜잭션이 끝나면 1차 캐시도 소멸됩니다. 동일한 id의 Entity에 대해 == 동일성을 보장합니다.

**Q6: save()를 호출하지 않아도 UPDATE가 되는 이유는?**

> 영속 상태의 Entity는 Dirty Checking 대상입니다. 트랜잭션 커밋 시 flush()가 자동 호출되면서, 스냅샷과 현재 값을 비교하여 변경이 있으면 UPDATE SQL을 자동 생성합니다. 따라서 영속 Entity를 수정하면 save() 없이도 DB에 반영됩니다.

### 🟡 개념만 — 물어보면 설명할 수 있으면 OK

**Q7: flush와 commit의 차이는?**

> flush는 쓰기 지연 SQL을 DB에 **전송**하는 것이고, commit은 트랜잭션을 **확정**하는 것입니다. flush 후에도 롤백이 가능하지만, commit 후에는 롤백이 불가합니다. 일반적으로 커밋 직전에 flush가 자동 호출됩니다.

**Q8: merge와 변경감지의 차이는?**

> 변경감지는 **영속 상태** Entity를 수정하면 자동으로 UPDATE가 되는 것이고, merge는 **준영속 또는 비영속** Entity를 다시 영속으로 만드는 것입니다. merge는 DB SELECT가 추가로 발생하고 모든 필드를 덮어쓰는 위험이 있어, 수정은 변경감지를 사용하는 것이 권장됩니다.

**Q9: OSIV란 무엇이고, 실무에서는 어떻게 설정하나요?**

> Open Session In View로, 영속성 컨텍스트의 생존 범위를 HTTP 요청 전체로 확장하는 설정입니다. true(기본값)면 Controller에서도 Lazy Loading이 가능하지만 DB 커넥션을 오래 잡습니다. 실무에서는 false로 설정하고, Service 계층에서 DTO로 변환하여 반환하는 방식을 권장합니다.

---

## 16. 핵심 요약

```
┌──────────────────────────────────────────────────────┐
│           JPA 동작 원리 — 영속성 컨텍스트 요약          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  🏗️ 영속성 컨텍스트 = Entity 관리 공간                 │
│    3개 저장소: 1차 캐시 / 스냅샷 / 쓰기 지연 SQL       │
│                                                      │
│  📋 Entity 생명주기                                    │
│    비영속(new) → 영속(managed) → 준영속/삭제            │
│    영속 상태만 Dirty Checking 대상!                     │
│                                                      │
│  ⚡ 핵심 기능 3가지                                    │
│    1차 캐시: 같은 id 2번 조회 → SQL 1번만              │
│    Dirty Checking: 필드 수정 → 자동 UPDATE             │
│    쓰기 지연: SQL 모았다가 커밋 시 한꺼번에 실행         │
│                                                      │
│  🔒 Dirty Checking 조건 3가지                         │
│    ① 영속 상태 Entity                                 │
│    ② @Transactional 안에서 수정                       │
│    ③ 트랜잭션 커밋 (flush 시점)                        │
│                                                      │
│  ⚠️ 주의                                              │
│    merge 대신 변경감지 사용!                            │
│    OSIV는 실무에서 false 권장                           │
│    IDENTITY 전략은 Batch INSERT 불가                   │
│                                                      │
│  🔗 다음 단계 (22번 트랜잭션과 동시성)                   │
│    @Transactional의 옵션들, ACID, 격리 수준,           │
│    낙관적/비관적 락 — "동시에 같은 데이터를 수정하면?"    │
│                                                      │
└──────────────────────────────────────────────────────┘
```
