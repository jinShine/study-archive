# 24. 연관 관계 매핑과 N+1 문제

> **키워드**: `@ManyToOne` `@OneToMany` `@OneToOne` `cascade` `orphanRemoval` `Fetch 전략` `Proxy` `LAZY` `EAGER` `N+1 문제` `Fetch Join` `@EntityGraph` `Batch Size`

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~9 (연관관계 ~ N+1 해결) | 면접 최다 출제 + 실무 핵심 |
| 🟡 이해 | 10~11 (cascade, orphanRemoval) | 실무에서 자주 충돌하는 부분 |
| 🟢 참고 | 12 (@OneToOne LAZY 주의) | 트러블슈팅할 때 필요 |

> 💡 **20번에서 우리는 이렇게 했었다:**
> ```java
> // StudyLog 엔티티
> private Long memberId;  // FK를 그냥 숫자로 들고 있었다
> ```
> 이러면 "이 학습 로그 작성한 사람 이름이 뭐야?"를 알려면 **직접 2번 쿼리**해야 한다.
> 이번에 `@ManyToOne`을 배우면, **객체처럼 자연스럽게** `studyLog.getMember().getName()` 이 가능해진다.

---

## 1. 왜 연관 관계가 필요한가? 🔴

### ❌ Before: FK를 숫자로 들고 있을 때

```java
// StudyLog 엔티티 (20번에서 만든 것)
@Column(nullable = false)
private Long memberId;     // 그냥 숫자
```

```java
// Service: "학습 로그와 작성자 이름을 같이 보여주려면?"
StudyLog log = studyLogRepository.findById(1L).orElseThrow();
Member member = memberRepository.findById(log.getMemberId()).orElseThrow();
//                                          ↑ ID 꺼내서 다시 조회해야 함!

String writerName = member.getName();
```

문제점:
- 매번 ID를 꺼내서 **직접 조회**해야 한다
- Java 객체인데 **객체답게 못 쓴다** (객체 그래프 탐색 불가)
- DB에는 FK로 연결되어 있는데, Java 코드에서는 그 관계가 보이지 않는다

### ✅ After: @ManyToOne으로 객체 참조

```java
// StudyLog 엔티티 (이번에 바꿀 것)
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "member_id")
private Member member;     // 객체 참조!
```

```java
// Service: 바로 접근 가능!
StudyLog log = studyLogRepository.findById(1L).orElseThrow();
String writerName = log.getMember().getName();  // 객체 그래프 탐색!
//                      ↑ 바로 접근!
```

---

## 2. DB 관계 → JPA 어노테이션 매핑 🔴

19번에서 배운 ERD 관계를 JPA로 어떻게 표현하는지 보자.

### 우리 도메인 관계

```
┌──────────┐         ┌────────────┐
│  Member  │ 1    N  │  StudyLog  │
│──────────│─────────│────────────│
│  id (PK) │         │  id (PK)   │
│  name    │         │  title     │
│  email   │         │  member_id │←── FK (외래키)
└──────────┘         └────────────┘

"한 명의 회원이 여러 개의 학습 로그를 작성한다"
→ Member : StudyLog = 1 : N
```

### DB 관계 → JPA 어노테이션 대응표

| DB 관계 | FK 위치 | JPA 어노테이션 | 예시 |
|---------|---------|---------------|------|
| 1:N | N쪽에 FK | `@ManyToOne` (N쪽) | StudyLog → Member |
| N:1 | 위와 동일 | `@OneToMany` (1쪽) | Member → StudyLog |
| 1:1 | 둘 중 하나 | `@OneToOne` | Member → Profile |
| N:M | 중간 테이블 | `@ManyToMany` (비추) | StudyLog ↔ Tag |

> ⚠️ `@ManyToMany`는 실무에서 **거의 안 쓴다**. 중간 테이블을 직접 엔티티로 만든다.
> 이유: 중간 테이블에 추가 컬럼(등록일 등)이 필요한 경우가 대부분이기 때문.

---

## 3. @ManyToOne — 가장 중요한 연관 관계 🔴

### 비유: 학생과 반

학생(StudyLog)이 반(Member)에 소속된다.
학생 입장에서 "내가 어느 반이지?" = 학생이 반을 참조한다 = **Many(학생) → One(반)**

### 엔티티 코드

```java
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StudyLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Category category;

    @Column(nullable = false)
    private int studyTime;

    @Column(nullable = false)
    private LocalDate studyDate;

    // ═══ 20번에서 Long memberId였던 것이 이렇게 바뀐다! ═══
    @ManyToOne(fetch = FetchType.LAZY)    // Many(StudyLog) → One(Member)
    @JoinColumn(name = "member_id")        // DB 컬럼명 지정
    private Member member;                 // 객체 참조!

    @Builder
    public StudyLog(String title, String content, Category category,
                    int studyTime, LocalDate studyDate, Member member) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.studyTime = studyTime;
        this.studyDate = studyDate;
        this.member = member;    // Member 객체를 직접 받는다!
    }
}
```

### 한 줄씩 뜯어보기

```java
@ManyToOne(fetch = FetchType.LAZY)
```
- `@ManyToOne` → StudyLog(Many)가 Member(One)를 참조
- `fetch = FetchType.LAZY` →  **지금 당장 Member를 안 가져온다** (나중에 필요할 때 가져옴)

```java
@JoinColumn(name = "member_id")
```
- DB에 만들어지는 FK 컬럼명 = `member_id`
- 안 쓰면 `member_id`가 기본이긴 한데, **명시하는 게 좋다** (가독성)

```java
private Member member;
```
- `Long memberId` 대신 **객체 참조**
- `studyLog.getMember()` 로 바로 Member에 접근 가능!

### DB 테이블은 달라지나?

**아니, 변하지 않는다!**

```sql
-- Before나 After나 DB 테이블은 동일하다:
CREATE TABLE study_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    ...
    member_id BIGINT NOT NULL,    -- FK 컬럼 그대로!
    FOREIGN KEY (member_id) REFERENCES member(id)
);
```

바뀌는 건 **Java 코드**뿐이다. DB는 원래부터 FK로 연결되어 있었다.
JPA가 `Member member` ↔ `member_id` 컬럼을 자동 매핑해주는 것이다.

---

## 4. LAZY vs EAGER — Fetch 전략 🔴

### 비유: 배달 앱에서 주문하기

- **EAGER** = 짜장면 시키면 군만두도 같이 오는 세트 메뉴 (항상 같이 가져옴)
- **LAZY** = 짜장면만 일단 오고, 군만두는 추가 주문해야 옴 (필요할 때만)

### EAGER (즉시 로딩)

```java
@ManyToOne(fetch = FetchType.EAGER)  // 기본값!
private Member member;
```

```java
StudyLog log = repository.findById(1L).orElseThrow();
// → SQL 2개가 한 번에 나간다:
//   1. SELECT * FROM study_log WHERE id = 1
//   2. SELECT * FROM member WHERE id = ?   ← 안 썼는데도 나감!
```

### LAZY (지연 로딩)

```java
@ManyToOne(fetch = FetchType.LAZY)   // 명시적으로!
private Member member;
```

```java
StudyLog log = repository.findById(1L).orElseThrow();
// → SQL 1개만 나간다:
//   1. SELECT * FROM study_log WHERE id = 1

log.getMember().getName();  // 이 순간!
// → SQL이 추가로 나간다:
//   2. SELECT * FROM member WHERE id = ?
```

### 무조건 LAZY!

```
┌───────────────────────────────────────────────┐
│  🔴 규칙: 모든 @XxxToOne에는 반드시             │
│     fetch = FetchType.LAZY 를 써라!            │
│                                               │
│  @ManyToOne(fetch = FetchType.LAZY)   ✅      │
│  @OneToOne(fetch = FetchType.LAZY)    ✅      │
│                                               │
│  @ManyToOne                           ❌      │
│  (기본값이 EAGER! 안 쓰면 EAGER가 된다!)       │
└───────────────────────────────────────────────┘
```

> ⚠️ `@ManyToOne`, `@OneToOne`의 **기본값은 EAGER**다!
> 안 쓰면 항상 JOIN이 나가서 성능 문제가 생긴다.
> **반드시 LAZY를 명시하자.**
>
> 참고: `@OneToMany`, `@ManyToMany`는 기본값이 LAZY다.

### 왜 EAGER가 나쁜가?

```java
// StudyLog를 100개 조회하는데...
List<StudyLog> logs = repository.findAll();

// EAGER면: StudyLog 100개 + Member 100번 조회 = SQL 101개!! 😱
// LAZY면:  StudyLog 100개만 조회 = SQL 1개 ✅
//          (Member가 필요할 때만 추가 조회)
```

---

## 5. Proxy — LAZY의 비밀 🔴

### 비유: 택배 상자

LAZY로 가져온 Member는 **진짜 Member가 아니다**.
택배 상자(Proxy)만 와 있고, 열어보는 순간(`.getName()`) 진짜 물건이 배달된다.

### Proxy 동작 원리

```
repository.findById(1L);
    │
    ▼
StudyLog {
    id: 1
    title: "JPA 공부"
    member: HibernateProxy$$Member  ← 가짜 객체! (빈 껍데기)
                 │
                 └─ id: 5 만 알고 있다 (나머지는 모름)
}

studyLog.getMember()        → Proxy 반환 (아직 SQL 안 나감)
studyLog.getMember().getId() → 5 반환 (이것도 SQL 안 나감! id는 이미 앎)
studyLog.getMember().getName() → 이 순간 SQL 발사!
    │
    ▼
SELECT * FROM member WHERE id = 5;  ← 비로소 DB 조회!
    │
    ▼
Proxy가 진짜 Member 데이터로 채워진다
```

> 💡 **핵심: Proxy는 id만 알고 있다.**
> - `getMember()` → SQL 안 나감
> - `getMember().getId()` → SQL 안 나감 (id는 이미 앎)
> - `getMember().getName()` → SQL 나감! (id 외의 필드 접근 시)

### Proxy 주의사항

```java
// ❌ 트랜잭션 밖에서 LAZY 로딩 → 에러!
@Transactional(readOnly = true)
public StudyLog getStudyLog(Long id) {
    return studyLogRepository.findById(id).orElseThrow();
}

// Controller에서...
StudyLog log = service.getStudyLog(1L);
log.getMember().getName();  // 💥 LazyInitializationException!
// 트랜잭션이 끝나서 영속성 컨텍스트가 닫혔는데 Proxy를 로딩하려 함
```

> ⚠️ **LazyInitializationException** — LAZY 사용 시 가장 흔한 에러.
> Proxy를 초기화(진짜 데이터 로딩)하려면 **영속성 컨텍스트가 살아있어야** 한다.
> 해결법: 서비스 안에서 필요한 데이터를 미리 로딩하거나, Fetch Join/DTO로 변환.

---

## 6. @OneToMany — 양방향 관계 (그리고 왜 조심해야 하는지) 🔴

### 지금까지: 단방향

```
StudyLog → Member  (StudyLog가 Member를 안다)
Member → ???       (Member는 StudyLog를 모른다)
```

### 양방향이 필요한 순간

"이 회원이 작성한 학습 로그 목록을 보고 싶어."

```java
// 단방향이면 → Repository에서 조회
List<StudyLog> logs = studyLogRepository.findByMember(member);

// 양방향이면 → 객체에서 바로 접근
List<StudyLog> logs = member.getStudyLogs();
```

### @OneToMany 추가 (Member 쪽)

```java
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    // ═══ 양방향: Member → StudyLog ═══
    @OneToMany(mappedBy = "member")    // "내가 주인이 아니야, StudyLog.member가 주인이야"
    private List<StudyLog> studyLogs = new ArrayList<>();

    @Builder
    public Member(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }
}
```

### mappedBy가 뭔데?

DB에서 FK는 **한 쪽에만** 있다 (`study_log.member_id`).
Java에서 양방향이면 **양쪽 다 참조**가 있다.

그러면 **누가 FK를 관리하지?** → 이걸 정하는 게 `mappedBy`.

```
┌─────────────────────────────────────────────────────────────┐
│                     연관관계의 주인                            │
│                                                             │
│  FK가 있는 쪽 = 주인 = @ManyToOne 쪽                         │
│  FK가 없는 쪽 = 거울 = @OneToMany(mappedBy = "필드명")        │
│                                                             │
│  StudyLog.member → 주인 ✅ (FK 관리, INSERT/UPDATE에 반영)   │
│  Member.studyLogs → 거울 🪞 (읽기 전용, DB에 영향 없음)       │
└─────────────────────────────────────────────────────────────┘
```

### 🔴 핵심 규칙: FK가 있는 쪽이 주인!

```
"FK가 어디 있어?" → study_log 테이블에 member_id가 있다
→ StudyLog.member가 주인 → @ManyToOne
→ Member.studyLogs는 거울 → @OneToMany(mappedBy = "member")
```

### ❌ 흔한 실수: 거울 쪽으로 저장

```java
// ❌ 거울(Member.studyLogs)에 추가해도 DB에 반영 안 됨!
member.getStudyLogs().add(studyLog);
repository.save(member);
// → study_log.member_id = NULL !! (FK가 안 들어간다)

// ✅ 주인(StudyLog.member)에 값을 넣어야 한다!
studyLog = StudyLog.builder()
    .title("JPA 공부")
    .member(member)           // ← 주인 쪽에 설정!
    .build();
studyLogRepository.save(studyLog);
// → study_log.member_id = 5 (정상!)
```

### 양방향 편의 메서드

실수를 방지하려면 **양쪽 다 설정하는 편의 메서드**를 만든다:

```java
// StudyLog 엔티티에 추가
public void setMember(Member member) {
    this.member = member;                    // 주인 쪽 설정
    member.getStudyLogs().add(this);         // 거울 쪽도 동기화
}
```

### 양방향, 꼭 필요한가?

```
"양방향 하면 편하겠지?"  → 진짜 필요할 때만!

✅ 양방향이 필요한 경우:
   - cascade/orphanRemoval이 필요할 때 (부모가 자식 관리)
   - 비즈니스 로직에서 member.getStudyLogs()를 자주 쓸 때

❌ 양방향 없이도 되는 경우:
   - Repository에서 findByMember(member)로 충분할 때
   - 조회만 하고 관계 관리가 필요 없을 때

💡 실무 팁: 일단 단방향(@ManyToOne)만 만들고,
             필요해지면 그때 @OneToMany를 추가한다.
```

---

## 7. N+1 문제 — JPA의 가장 유명한 함정 🔴

### 비유: 출석부 확인

선생님이 30명 학생의 **부모님 이름**을 확인하려 한다.

```
1. 학생 목록 가져오기 (SELECT 1번)
2. 학생1의 부모 조회      ← 1번
3. 학생2의 부모 조회      ← 2번
4. 학생3의 부모 조회      ← 3번
...
31. 학생30의 부모 조회     ← 30번

총 SQL: 1 + 30 = 31개 😱
```

이게 **N+1 문제**다. 1번 조회했는데 N번 추가 쿼리가 나가는 것.

### 코드로 보기

```java
// Controller or Service
List<StudyLog> logs = studyLogRepository.findAll();  // 1. 학습 로그 100개 조회

for (StudyLog log : logs) {
    log.getMember().getName();  // 2. 각 로그마다 Member 조회!
}
```

```sql
-- 실행되는 SQL:
SELECT * FROM study_log;                      -- 1번 (100개 가져옴)
SELECT * FROM member WHERE id = 1;            -- +1
SELECT * FROM member WHERE id = 2;            -- +1
SELECT * FROM member WHERE id = 3;            -- +1
...
SELECT * FROM member WHERE id = 100;          -- +1
-- 총 101개 SQL!! 😱
```

### N+1은 LAZY에서 발생하나? EAGER에서 발생하나?

**둘 다 발생한다!**

```
EAGER:
  findAll() 실행 → study_log 100개 SELECT
  → EAGER니까 바로 member 100번 SELECT
  → SQL 101개 (자동으로 N+1 발생!)

LAZY:
  findAll() 실행 → study_log 100개 SELECT
  → member는 Proxy (아직 안 가져옴)
  → getMember().getName() 호출할 때마다 SELECT
  → SQL 1 + 사용한 만큼 (최대 101개)
```

> 💡 **LAZY라고 N+1이 안 생기는 게 아니다!**
> LAZY는 "발생 시점을 늦출 뿐"이다. 결국 전부 접근하면 동일하게 N+1 발생.
> 핵심은 **N+1을 해결하는 방법**을 아는 것이다.

---

## 8. N+1 해결법 1: Fetch Join 🔴

### 비유: 한 번에 세트로 가져오기

N+1이 "하나씩 가져오기"의 문제라면, Fetch Join은 "**한 번에 다 가져오기**"다.

### 사용법

```java
// Repository
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    @Query("SELECT s FROM StudyLog s JOIN FETCH s.member")
    List<StudyLog> findAllWithMember();
    //                    ↑ JOIN FETCH = member를 한 방에 같이 가져와!
}
```

```sql
-- 실행되는 SQL (1개만!)
SELECT s.*, m.*
FROM study_log s
INNER JOIN member m ON s.member_id = m.id;

-- N+1 해결! SQL 1개로 끝!
```

### Fetch Join 전 vs 후

```
❌ N+1 (findAll + getMember):
  SQL 1: SELECT * FROM study_log          (100개)
  SQL 2: SELECT * FROM member WHERE id=1
  SQL 3: SELECT * FROM member WHERE id=2
  ...
  SQL 101: SELECT * FROM member WHERE id=100
  → 총 101개 SQL

✅ Fetch Join (findAllWithMember):
  SQL 1: SELECT s.*, m.* FROM study_log s
         JOIN member m ON s.member_id = m.id
  → 총 1개 SQL !!
```

### Fetch Join + 페이징 주의

```java
// ⚠️ Fetch Join + Pageable은 주의!
@Query("SELECT s FROM StudyLog s JOIN FETCH s.member")
Page<StudyLog> findAllWithMember(Pageable pageable);
// → 경고: HHH90003004: firstResult/maxResults specified with collection fetch
// → 데이터를 전부 메모리에 올린 뒤 페이징 → 위험!
```

> ⚠️ **@ManyToOne Fetch Join + 페이징 = OK** (데이터 뻥튀기가 없으니까)
>
> **@OneToMany Fetch Join + 페이징 = 위험!** (1:N 조인하면 row가 뻥튀기)
> → 이 경우 Batch Size를 쓴다 (아래에서 설명)

---

## 9. N+1 해결법 2: @EntityGraph 🔴

Fetch Join을 @Query 없이 쓰는 방법이다.

```java
// @EntityGraph로 Fetch Join과 같은 효과
@EntityGraph(attributePaths = {"member"})
List<StudyLog> findByCategory(Category category);
```

```sql
-- 자동으로 LEFT JOIN FETCH가 생성된다
SELECT s.*, m.*
FROM study_log s
LEFT JOIN member m ON s.member_id = m.id
WHERE s.category = ?
```

### Fetch Join vs @EntityGraph

| | Fetch Join | @EntityGraph |
|---|---|---|
| 방식 | `@Query` + JPQL 직접 작성 | 쿼리 메서드에 어노테이션 |
| JOIN 타입 | INNER JOIN | LEFT JOIN |
| 유연성 | 높음 (WHERE, ORDER 자유) | 쿼리 메서드에 종속 |
| 추천 | 복잡한 쿼리 | 단순한 쿼리 |

---

## 10. N+1 해결법 3: Batch Size 🔴

### 비유: 택배 모아보내기 (21번에서 봤던 그것!)

Fetch Join이 **한 번에 전부** 가져오는 것이라면,
Batch Size는 **N번을 묶어서 몇 번으로** 줄이는 것이다.

### 설정 방법

```yaml
# application.yml
spring:
  jpa:
    properties:
      hibernate:
        default_batch_fetch_size: 100    # IN 절에 최대 100개씩 묶기
```

### 동작 원리

```
❌ N+1 (기본):
  SELECT * FROM member WHERE id = 1;
  SELECT * FROM member WHERE id = 2;
  SELECT * FROM member WHERE id = 3;
  ...
  SELECT * FROM member WHERE id = 100;
  → 100개 SQL

✅ Batch Size = 100:
  SELECT * FROM member WHERE id IN (1, 2, 3, ... 100);
  → 1개 SQL !!
```

```
학습 로그 500개, 작성자가 500명이라면:

Batch Size 없음:  1 + 500 = 501개 SQL
Batch Size 100:   1 + 5 = 6개 SQL (100개씩 5번)
Batch Size 500:   1 + 1 = 2개 SQL
```

### Batch Size가 Fetch Join보다 나은 경우

```
@OneToMany (member.getStudyLogs()) + 페이징이 필요할 때

Fetch Join → 1:N 조인으로 row 뻥튀기 → 페이징 불가 ❌
Batch Size → 원래 쿼리 그대로 + IN절로 추가 조회 → 페이징 가능 ✅
```

### 실무에서의 선택 가이드

```
┌──────────────────────────────────────────────────┐
│  N+1 해결 선택 가이드                              │
│                                                  │
│  1순위: Fetch Join (@ManyToOne과 함께)             │
│     → 가장 확실, SQL 1개로 해결                    │
│     → @ManyToOne + 페이징 = OK                   │
│                                                  │
│  2순위: @EntityGraph (간단한 쿼리)                  │
│     → @Query 없이 쿼리 메서드에 바로 적용            │
│                                                  │
│  3순위: Batch Size (전역 설정)                      │
│     → application.yml에 한 줄이면 전체 적용         │
│     → @OneToMany + 페이징에서도 동작               │
│                                                  │
│  💡 실무 꿀팁:                                     │
│     Batch Size를 전역으로 깔고 (100~500),           │
│     핵심 쿼리는 Fetch Join으로 최적화               │
└──────────────────────────────────────────────────┘
```

---

## 11. cascade와 orphanRemoval — 부모가 자식을 관리 🟡

### 비유: 가족 여행

- **cascade** = 부모(Member)가 여행을 가면 자식(StudyLog)도 함께 간다
  - 부모 저장 → 자식도 저장 / 부모 삭제 → 자식도 삭제
- **orphanRemoval** = 부모가 자식을 내쫓으면(리스트에서 제거) 자식은 사라진다(DB에서 삭제)

### cascade

```java
@Entity
public class Member extends BaseEntity {

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL)
    private List<StudyLog> studyLogs = new ArrayList<>();
}
```

```java
// cascade = ALL이면:
Member member = Member.builder().name("김철수").build();

StudyLog log1 = StudyLog.builder().title("JPA 공부").member(member).build();
StudyLog log2 = StudyLog.builder().title("Spring 공부").member(member).build();
member.getStudyLogs().add(log1);
member.getStudyLogs().add(log2);

memberRepository.save(member);
// → member INSERT + log1 INSERT + log2 INSERT (3개 동시 저장!)
// → studyLogRepository.save() 안 불러도 된다!

memberRepository.delete(member);
// → log1 DELETE + log2 DELETE + member DELETE (자식 먼저 삭제!)
```

### cascade 종류

| 타입 | 동작 |
|------|------|
| `PERSIST` | 부모 저장 → 자식도 저장 |
| `REMOVE` | 부모 삭제 → 자식도 삭제 |
| `MERGE` | 부모 병합 → 자식도 병합 |
| `ALL` | 위 전부 다 |

### orphanRemoval

```java
@OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
private List<StudyLog> studyLogs = new ArrayList<>();
```

```java
// orphanRemoval = true면:
member.getStudyLogs().remove(0);  // 리스트에서 제거
// → DB에서도 DELETE! (고아가 된 자식은 삭제된다)
```

### ⚠️ cascade/orphanRemoval 사용 규칙

```
┌─────────────────────────────────────────────────────────┐
│  cascade/orphanRemoval을 쓸 수 있는 조건:                │
│                                                         │
│  1. 자식의 소유자(부모)가 딱 하나일 때                     │
│     StudyLog의 소유자 = Member (O)                      │
│     Tag를 여러 StudyLog가 공유 (X) → cascade 쓰면 안 됨!  │
│                                                         │
│  2. 자식의 생명주기가 부모에 종속될 때                      │
│     "회원 삭제하면 학습 로그도 삭제" (O)                    │
│     "주문 삭제하면 상품도 삭제" (X) → 상품은 독립적!        │
└─────────────────────────────────────────────────────────┘
```

---

## 12. @OneToOne LAZY가 안 먹는 경우 🟢

### 문제

```java
@Entity
public class Member {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private Profile profile;
}
```

Member → Profile (Member가 FK를 가짐) → **LAZY 정상 동작** ✅

```java
@Entity
public class Profile {
    @OneToOne(mappedBy = "profile", fetch = FetchType.LAZY)
    private Member member;
}
```

Profile → Member (Profile에 FK 없음, mappedBy) → **LAZY 안 먹음! EAGER처럼 동작** ❌

### 왜?

FK가 없는 쪽은 "상대방이 있는지 없는지" 알 수 없다.
- `member_id` FK가 Profile 테이블에 없으니까
- Profile 입장에서 "나를 참조하는 Member가 있어? 없어?" → DB를 조회해봐야 안다
- Proxy를 만들려 해도 null인지 Proxy인지 결정할 수 없다 → 어쩔 수 없이 즉시 로딩

### 해결법

```
1. FK가 있는 쪽에서만 @OneToOne을 쓴다 (반대쪽 참조 포기)
2. @OneToOne 대신 @ManyToOne으로 바꾼다 (unique 제약으로 1:1 보장)
3. 반대쪽이 꼭 필요하면 DTO에서 조합한다
```

> 💡 실무에서 @OneToOne 양방향은 피하는 경우가 많다.
> FK를 가진 쪽에서만 단방향으로 쓰는 게 안전하다.

---

## 13. 전체 흐름 — 실전 코드 정리 🔴

지금까지 배운 것을 우리 도메인에 종합 적용해보자.

### Entity

```java
// ═══ Member (1 쪽) ═══
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @OneToMany(mappedBy = "member")  // 거울 (읽기 전용)
    private List<StudyLog> studyLogs = new ArrayList<>();

    @Builder
    public Member(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }
}
```

```java
// ═══ StudyLog (N 쪽) ═══
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StudyLog extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Category category;

    @Column(nullable = false)
    private int studyTime;

    @Column(nullable = false)
    private LocalDate studyDate;

    @ManyToOne(fetch = FetchType.LAZY)     // 주인 (FK 관리)
    @JoinColumn(name = "member_id")
    private Member member;

    @Builder
    public StudyLog(String title, String content, Category category,
                    int studyTime, LocalDate studyDate, Member member) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.studyTime = studyTime;
        this.studyDate = studyDate;
        this.member = member;
    }

    public void update(String title, String content, int studyTime) {
        this.title = title;
        this.content = content;
        this.studyTime = studyTime;
    }
}
```

### Repository

```java
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    // N+1 방지: Fetch Join
    @Query("SELECT s FROM StudyLog s JOIN FETCH s.member")
    List<StudyLog> findAllWithMember();

    // N+1 방지: @EntityGraph
    @EntityGraph(attributePaths = {"member"})
    Page<StudyLog> findByCategory(Category category, Pageable pageable);

    // Fetch Join + 페이징 (@ManyToOne이라 OK)
    @Query("SELECT s FROM StudyLog s JOIN FETCH s.member WHERE s.category = :category")
    List<StudyLog> findByCategoryWithMember(@Param("category") Category category);
}
```

### Service

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyLogService {

    private final StudyLogRepository studyLogRepository;
    private final MemberRepository memberRepository;

    // 단건 조회 — member 접근이 필요하면 서비스 안에서!
    public StudyLog getStudyLog(Long id) {
        StudyLog log = studyLogRepository.findById(id).orElseThrow();
        log.getMember().getName();   // LAZY 초기화 (트랜잭션 안에서!)
        return log;
    }

    // 목록 조회 — Fetch Join으로 N+1 방지
    public List<StudyLog> getAllWithMember() {
        return studyLogRepository.findAllWithMember();
    }

    // 페이징 조회 — @EntityGraph로 N+1 방지
    public Page<StudyLog> getByCategory(Category category, Pageable pageable) {
        return studyLogRepository.findByCategory(category, pageable);
    }

    // 생성
    @Transactional
    public StudyLog create(String title, String content, Category category,
                           int studyTime, LocalDate date, Long memberId) {
        Member member = memberRepository.findById(memberId).orElseThrow();

        StudyLog log = StudyLog.builder()
            .title(title).content(content).category(category)
            .studyTime(studyTime).studyDate(date)
            .member(member)      // ← Long memberId 대신 Member 객체!
            .build();

        return studyLogRepository.save(log);
    }
}
```

---

## 14. 실습 문제

### 문제 1: 연관 관계 방향

Comment 엔티티를 만들려 한다. Comment는 하나의 StudyLog에 속한다.
```
StudyLog : Comment = 1 : N
```

1. Comment 엔티티에 어떤 어노테이션을 쓸까?
2. FK를 관리하는 주인은 누구인가?
3. fetch 전략은 뭘로 해야 하나?

<details>
<summary>정답 보기</summary>

1. `@ManyToOne(fetch = FetchType.LAZY)` + `@JoinColumn(name = "study_log_id")`
2. Comment가 주인 (FK인 study_log_id가 Comment 테이블에 있으므로)
3. `FetchType.LAZY` — @ManyToOne 기본값은 EAGER이므로 반드시 명시!

</details>

### 문제 2: N+1 판별

```java
List<StudyLog> logs = studyLogRepository.findAll();
for (StudyLog log : logs) {
    System.out.println(log.getMember().getName());
}
```

1. N+1 문제가 발생하나?
2. 학습 로그 50개, 작성자가 10명이면 SQL은 총 몇 개?
3. 이를 SQL 1개로 줄이려면?

<details>
<summary>정답 보기</summary>

1. 발생한다! `findAll()`은 일반 쿼리라 Member를 LAZY로 둔다. for문에서 `getMember().getName()` 호출 시 매번 SQL이 나간다.
2. SQL = 1 + 10 = 11개. (LAZY이므로 같은 Member는 1차 캐시에서 반환 → 중복 제거. 작성자 10명이므로 최대 10번만 추가 조회)
3. `@Query("SELECT s FROM StudyLog s JOIN FETCH s.member")` 사용

</details>

### 문제 3: cascade 판단

주문(Order)과 주문상품(OrderItem)이 있다.

```
Order : OrderItem = 1 : N
```

1. `cascade = CascadeType.ALL`을 쓸 수 있는가?
2. 상품(Product)과 주문상품(OrderItem)에도 cascade를 쓸 수 있는가?

<details>
<summary>정답 보기</summary>

1. 쓸 수 있다. OrderItem의 소유자는 Order 하나뿐이고, 주문 삭제 시 주문상품도 삭제되는 게 자연스럽다.
2. 쓸 수 없다. Product는 여러 OrderItem이 공유한다 (한 상품이 여러 주문에 포함). 한 주문을 삭제한다고 상품까지 삭제되면 안 된다.

> 핵심: **소유자가 하나**이고 **생명주기가 종속**될 때만 cascade!

</details>

---

## 15. 면접 대비 🔴🟡

### 🔴 필수 — 반드시 답할 수 있어야 한다

**Q1: N+1 문제가 무엇이고 어떻게 해결하나?**

> 1번의 쿼리로 N개의 엔티티를 조회한 후, 연관된 엔티티에 접근할 때 N번의 추가 쿼리가 발생하는 문제다. 해결 방법: (1) Fetch Join — JPQL에 `JOIN FETCH`를 써서 한 번에 조회, (2) @EntityGraph — 쿼리 메서드에 어노테이션으로 Fetch Join 효과, (3) Batch Size(hibernate.default_batch_fetch_size) — IN절로 묶어서 조회 횟수를 줄임. 실무에서는 Batch Size를 전역으로 깔고, 핵심 쿼리는 Fetch Join으로 최적화한다.

**Q2: EAGER와 LAZY의 차이는?**

> EAGER는 엔티티 조회 시 연관 엔티티를 즉시 함께 로딩한다. LAZY는 연관 엔티티를 Proxy로 두고, 실제 접근 시점에 SQL을 실행해 로딩한다. 모든 @ManyToOne, @OneToOne에는 LAZY를 명시해야 한다. 기본값이 EAGER이기 때문에 명시하지 않으면 불필요한 쿼리가 발생한다.

**Q3: 연관관계의 주인(Owner)이란?**

> 양방향 연관관계에서 FK를 실제로 관리하는 쪽이다. FK가 있는 테이블의 엔티티가 주인이 된다. @ManyToOne 쪽이 주인이고, @OneToMany(mappedBy) 쪽은 읽기 전용 거울이다. DB에 반영되려면 주인 쪽에 값을 설정해야 한다.

**Q4: Fetch Join과 일반 JOIN의 차이는?**

> 일반 JOIN은 WHERE 조건으로만 사용하고 연관 엔티티를 SELECT하지 않는다. Fetch Join(JOIN FETCH)은 연관 엔티티의 데이터까지 한 번에 SELECT해서 영속성 컨텍스트에 올린다. Fetch Join을 써야 N+1이 해결된다.

**Q5: @ManyToOne과 @OneToMany의 차이는?**

> @ManyToOne은 N쪽 엔티티에서 1쪽을 참조한다(FK 관리, 연관관계 주인). @OneToMany는 1쪽에서 N쪽의 컬렉션을 참조한다(mappedBy, 읽기 전용). 실무에서는 @ManyToOne 단방향만으로 충분한 경우가 많고, @OneToMany는 필요할 때만 추가한다.

**Q6: Proxy란?**

> LAZY 로딩 시 실제 엔티티 대신 생성되는 가짜 객체다. 엔티티를 상속받은 형태로, ID만 가지고 있다. ID 외의 필드에 접근하는 순간 DB를 조회해서 실제 데이터를 채운다. 영속성 컨텍스트가 닫힌 후에 접근하면 LazyInitializationException이 발생한다.

### 🟡 개념만 — 물어보면 설명할 수 있으면 OK

**Q7: cascade와 orphanRemoval의 차이는?**

> cascade는 부모 엔티티에 대한 영속성 전이다(부모 저장/삭제 시 자식도 함께). orphanRemoval은 부모의 컬렉션에서 자식을 제거하면(remove) DB에서도 삭제하는 기능이다. 둘 다 자식의 소유자가 하나이고 생명주기가 부모에 종속될 때만 사용해야 한다.

**Q8: @OneToOne에서 LAZY가 안 먹는 경우는?**

> FK가 없는 쪽(mappedBy 쪽)에서는 LAZY가 동작하지 않는다. FK가 없으면 상대방 존재 여부를 알 수 없어서 Proxy를 만들지 null로 둘지 결정할 수 없기 때문이다. 해결법은 FK가 있는 쪽에서만 단방향으로 쓰는 것이다.

**Q9: Batch Size는 어떻게 동작하나?**

> LAZY 로딩 시 하나씩 SELECT하는 대신, `WHERE id IN (1,2,3,...,N)`으로 묶어서 조회한다. `hibernate.default_batch_fetch_size=100`이면 최대 100개씩 한 번의 쿼리로 가져온다. Fetch Join이 불가능한 상황(@OneToMany + 페이징)에서도 사용 가능하다.

---

## 16. 핵심 요약

```
┌─────────────────────────────────────────────────────────┐
│              연관 관계 매핑과 N+1 정리                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🔗 연관관계 매핑                                        │
│    @ManyToOne(LAZY) → FK 있는 N쪽 (주인)                │
│    @OneToMany(mappedBy) → FK 없는 1쪽 (거울)             │
│    주인 쪽에 값을 넣어야 DB에 반영!                        │
│                                                         │
│  ⚡ Fetch 전략                                           │
│    LAZY = 필요할 때 로딩 (무조건 이거!)                    │
│    EAGER = 즉시 로딩 (쓰지 마!)                           │
│    @XxxToOne 기본값 = EAGER (반드시 LAZY 명시!)            │
│                                                         │
│  💥 N+1 문제 해결 (핵심!)                                 │
│    1. Fetch Join → SQL 1개로 한 방 해결                   │
│    2. @EntityGraph → 쿼리 메서드에 어노테이션               │
│    3. Batch Size → IN절로 묶기 (전역 설정)                 │
│    실무: Batch Size 전역 + 핵심 쿼리 Fetch Join            │
│                                                         │
│  🔗 다음 단계 (25번 QueryDSL)                             │
│    복잡한 동적 쿼리를 타입 안전하게                         │
│    BooleanExpression, Projections, 페이징                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
