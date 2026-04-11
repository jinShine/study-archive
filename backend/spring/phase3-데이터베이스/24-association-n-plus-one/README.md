# 24. 연관 관계 매핑과 N+1 문제 — "테이블 관계를 Java 코드로 표현하기"

> **키워드**: `@ManyToOne` `@OneToMany` `mappedBy` `LAZY` `EAGER` `Proxy` `N+1` `Fetch Join` `@EntityGraph` `Batch Size` `cascade` `orphanRemoval`

---

## 핵심만 한 문장

**학생 1명이 여러 과목을 수강 → @ManyToOne/@OneToMany로 표현하고, "N+1 문제"를 Fetch Join으로 해결하는 것이 JPA의 핵심이다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 연관관계 필요성, @ManyToOne, LAZY, Proxy, N+1 문제와 해결 | 면접 최다 출제 + 실무 핵심 |
| 🟡 이해 | @OneToMany, mappedBy, cascade, orphanRemoval | 실무에서 자주 쓰이는 부분 |
| 🟢 참고 | @OneToOne LAZY 주의 | 트러블슈팅할 때 필요 |

> 💡 **20번에서 우리는 이렇게 했었다:**
> ```java
> // StudyLog에 memberId를 숫자로 들고 있었다
> private Long memberId;
> ```
> 이러면 "이 학습 로그 작성자 이름이 뭐야?" 알려면 **직접 2번 쿼리**해야 한다.
> 이번에 `@ManyToOne`을 배우면, **`studyLog.getMember().getName()`** 한 줄로 끝난다.

---

## 1. 왜 연관 관계가 필요한가? 🔴

### ❌ Before: FK를 숫자로 들고 있을 때

```java
// 20번의 StudyLog 엔티티
@Column(nullable = false)
private Long memberId;     // 그냥 숫자
```

```java
// Service: 작성자 이름을 보려면?
StudyLog log = studyLogRepository.findById(1L).orElseThrow();
Member member = memberRepository.findById(log.getMemberId()).orElseThrow();
//                                          ↑ ID 꺼내서 다시 조회!
String name = member.getName();
```

문제:
- 매번 ID를 꺼내서 **직접 조회**해야 한다
- Java 객체인데 **객체답게 못 쓴다**
- DB에는 FK로 연결되어 있는데, Java 코드에서는 그 관계가 안 보인다

### ✅ After: @ManyToOne으로 객체 참조

```java
// 이번에 바꿀 StudyLog 엔티티
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "member_id")
private Member member;     // 객체 참조!
```

```java
// Service: 바로 접근!
StudyLog log = studyLogRepository.findById(1L).orElseThrow();
String name = log.getMember().getName();  // 한 줄로 끝!
```

---

## 2. DB 관계 → JPA 어노테이션 매핑 🔴

19번 ERD에서 배운 관계를 JPA로 표현하면:

```
┌──────────┐         ┌─────────────┐
│  Member  │ 1    N  │  StudyLog   │
│──────────│─────────│─────────────│
│  id (PK) │         │  id (PK)    │
│  name    │         │  title      │
│  email   │         │  member_id  │←── FK (외래키)
└──────────┘         └─────────────┘

"한 명의 회원이 여러 개의 학습 로그를 작성한다"
→ Member : StudyLog = 1 : N
```

| DB 관계 | FK 위치 | JPA 어노테이션 | 예시 |
|---------|---------|---------------|------|
| 1:N | N쪽에 FK | `@ManyToOne` (N쪽) | StudyLog → Member |
| N:1 | 위와 동일 | `@OneToMany` (1쪽) | Member → StudyLog |
| 1:1 | 둘 중 하나 | `@OneToOne` | Member → Profile |
| N:M | 중간 테이블 | `@ManyToMany` (비추) | StudyLog ↔ Tag |

> ⚠️ `@ManyToMany`는 실무에서 **거의 안 쓴다**. 중간 테이블에 추가 컬럼(등록일 등)이 필요한 경우가 대부분이기 때문.

---

## 3. 따라쳐보기 — Entity 변경하기 🔴

> 20번 jpa-practice 프로젝트에서 이어서 진행한다!
> `com.study.jpapractice` 패키지, MySQL DB.

### Step 1: Member 엔티티 (변경 없음 확인)

`src/main/java/com/study/jpapractice/entity/Member.java`:

```java
package com.study.jpapractice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "member")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Builder
    public Member(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public void updateName(String name) {
        this.name = name;
    }
}
```

### Step 2: StudyLog 엔티티 (핵심 변경!)

20번에서는 `member_id`를 숫자로 갖고 있었다. 이제 **객체 참조로 바꾼다**.

`src/main/java/com/study/jpapractice/entity/StudyLog.java`:

```java
package com.study.jpapractice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_log")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StudyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Category category;

    @Column(nullable = false)
    private int studyTime;

    @Column(nullable = false)
    private LocalDate studyDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ═══ 핵심 변경! Long memberId 대신 객체 참조 ═══
    @ManyToOne(fetch = FetchType.LAZY)    // Many(StudyLog) → One(Member)
    @JoinColumn(name = "member_id")        // DB 컬럼명 = member_id
    private Member member;                 // 객체 참조!

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

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

**💻 서버 시작 시 콘솔 — 테이블 생성 SQL:**

```sql
Hibernate:
    create table study_log (
        id bigint not null auto_increment,
        category varchar(50) not null,
        content TEXT not null,
        created_at datetime(6) not null,
        study_date date not null,
        study_time integer not null,
        title varchar(200) not null,
        member_id bigint,
        primary key (id)
    ) engine=InnoDB

Hibernate:
    alter table study_log
        add constraint FK_study_log_member
        foreign key (member_id)
        references member (id)
```

→ DB 테이블은 이전과 동일! `member_id` FK 컬럼이 그대로. 바뀐 건 **Java 코드**뿐이다.

### Step 3: DataInit 수정

`src/main/java/com/study/jpapractice/DataInit.java`:

```java
package com.study.jpapractice;

import com.study.jpapractice.entity.*;
import com.study.jpapractice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataInit implements CommandLineRunner {

    private final MemberRepository memberRepository;
    private final StudyLogRepository studyLogRepository;

    @Override
    public void run(String... args) {
        // 회원 3명
        Member hong = memberRepository.save(
            Member.builder().name("홍길동").email("hong@mail.com").build());
        Member kim = memberRepository.save(
            Member.builder().name("김철수").email("kim@mail.com").build());
        Member lee = memberRepository.save(
            Member.builder().name("이영희").email("lee@mail.com").build());

        // 학습 로그 6개 (3명이 나눠서 작성)
        studyLogRepository.save(StudyLog.builder()
            .title("JPA 기초").content("ORM 개념 학습")
            .category(Category.JPA).studyTime(60)
            .studyDate(LocalDate.of(2026, 3, 10))
            .member(hong).build());    // ← 숫자 ID 대신 Member 객체!

        studyLogRepository.save(StudyLog.builder()
            .title("Spring MVC").content("컨트롤러와 서비스")
            .category(Category.SPRING).studyTime(90)
            .studyDate(LocalDate.of(2026, 3, 11))
            .member(hong).build());

        studyLogRepository.save(StudyLog.builder()
            .title("JPA 심화").content("영속성 컨텍스트 학습")
            .category(Category.JPA).studyTime(120)
            .studyDate(LocalDate.of(2026, 3, 12))
            .member(kim).build());

        studyLogRepository.save(StudyLog.builder()
            .title("SQL 연습").content("JOIN과 서브쿼리")
            .category(Category.DATABASE).studyTime(80)
            .studyDate(LocalDate.of(2026, 3, 13))
            .member(kim).build());

        studyLogRepository.save(StudyLog.builder()
            .title("Spring Security").content("인증과 인가")
            .category(Category.SPRING).studyTime(100)
            .studyDate(LocalDate.of(2026, 3, 14))
            .member(lee).build());

        studyLogRepository.save(StudyLog.builder()
            .title("Docker 입문").content("컨테이너 개념")
            .category(Category.DEVOPS).studyTime(45)
            .studyDate(LocalDate.of(2026, 3, 15))
            .member(lee).build());

        System.out.println("=== 데이터 초기화 완료 ===");
        System.out.println("회원: " + memberRepository.count() + "명");
        System.out.println("학습 로그: " + studyLogRepository.count() + "건");
    }
}
```

**💻 서버 시작 시 콘솔:**

```sql
Hibernate:
    insert into member (email, name) values (?, ?)
Hibernate:
    insert into member (email, name) values (?, ?)
Hibernate:
    insert into member (email, name) values (?, ?)
Hibernate:
    insert into study_log (category, content, created_at, member_id, study_date, study_time, title)
    values (?, ?, ?, ?, ?, ?, ?)
-- ... (6번 반복)
=== 데이터 초기화 완료 ===
회원: 3명
학습 로그: 6건
```

→ `member_id`에 숫자가 아니라 **Member 객체의 id**가 자동으로 들어간다!

---

## 4. @ManyToOne 한 줄씩 뜯어보기 🔴

```java
@ManyToOne(fetch = FetchType.LAZY)
```
- `@ManyToOne` → StudyLog(**Many**)가 Member(**One**)를 참조
- `fetch = FetchType.LAZY` → **지금 당장 Member를 안 가져온다** (나중에 필요할 때 가져옴)

```java
@JoinColumn(name = "member_id")
```
- DB에 만들어지는 FK 컬럼명 = `member_id`
- 안 쓰면 `member_id`가 기본이긴 한데, **명시하는 게 좋다** (가독성)

```java
private Member member;
```
- `Long memberId` 대신 **객체 참조**
- `studyLog.getMember().getName()` 으로 바로 접근!

---

## 5. LAZY vs EAGER — 따라쳐보기 🔴

### 비유: 배달 앱

- **EAGER** = 짜장면 시키면 군만두도 무조건 같이 오는 세트 메뉴
- **LAZY** = 짜장면만 일단 오고, 군만두는 추가 주문해야 옴

### 따라쳐보기 — LAZY 동작 확인

`src/main/java/com/study/jpapractice/controller/TestController.java`에 추가:

```java
// ⭐ LAZY 동작 확인
@GetMapping("/test/lazy")
@Transactional(readOnly = true)
public String testLazy() {
    System.out.println("=== LAZY 테스트 시작 ===");

    StudyLog log = studyLogRepository.findById(1L).orElseThrow();
    System.out.println("1. StudyLog 조회 완료 — 여기까지 SQL 1개");

    System.out.println("2. getMember() 호출 — 아직 SQL 안 나감!");
    Member member = log.getMember();
    System.out.println("   member 클래스: " + member.getClass().getName());

    System.out.println("3. getName() 호출 — 이 순간 SQL 발사!");
    String name = member.getName();

    return log.getTitle() + " - " + name;
}
```

**💻 브라우저: `http://localhost:8080/test/lazy`**

```
JPA 기초 - 홍길동
```

**💻 콘솔:**

```
=== LAZY 테스트 시작 ===
Hibernate:
    select s1_0.id, s1_0.category, s1_0.content, s1_0.created_at,
           s1_0.member_id, s1_0.study_date, s1_0.study_time, s1_0.title
    from study_log s1_0
    where s1_0.id=?
1. StudyLog 조회 완료 — 여기까지 SQL 1개
2. getMember() 호출 — 아직 SQL 안 나감!
   member 클래스: com.study.jpapractice.entity.Member$HibernateProxy$abcd1234
3. getName() 호출 — 이 순간 SQL 발사!
Hibernate:
    select m1_0.id, m1_0.email, m1_0.name
    from member m1_0
    where m1_0.id=?
```

**핵심 포인트:**
1. `findById(1L)` → StudyLog만 SELECT (Member는 안 가져옴)
2. `getMember()` → **Proxy 객체** 반환 (SQL 안 나감!)
3. `getName()` → **이 순간 SELECT** 발사!
4. member 클래스명이 `Member$HibernateProxy$...` → **가짜 객체!**

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
> 안 쓰면 항상 JOIN이 나가서 성능 문제. **반드시 LAZY를 명시하자.**
>
> 참고: `@OneToMany`, `@ManyToMany`는 기본값이 LAZY다.

---

## 6. Proxy — LAZY의 비밀 🔴

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
    title: "JPA 기초"
    member: HibernateProxy$$Member  ← 가짜 객체! (빈 껍데기)
                 │
                 └─ id: 1 만 알고 있다 (나머지는 모름)
}

studyLog.getMember()          → Proxy 반환 (SQL 안 나감)
studyLog.getMember().getId()  → 1 반환 (이것도 SQL 안 나감! id는 이미 앎)
studyLog.getMember().getName() → 이 순간 SQL 발사!
    │
    ▼
SELECT * FROM member WHERE id = 1;  ← 비로소 DB 조회!
    │
    ▼
Proxy가 진짜 Member 데이터로 채워진다
```

> 💡 **핵심: Proxy는 id만 알고 있다.**
> - `getMember()` → SQL 안 나감
> - `getMember().getId()` → SQL 안 나감 (id는 이미 FK로 알고 있음)
> - `getMember().getName()` → SQL 나감! (id 외의 필드 접근 시)

### Proxy 주의사항 — LazyInitializationException

```java
// ❌ 트랜잭션 밖에서 LAZY 로딩 → 에러!
@Transactional(readOnly = true)
public StudyLog getStudyLog(Long id) {
    return studyLogRepository.findById(id).orElseThrow();
}

// Controller에서...
StudyLog log = service.getStudyLog(1L);
log.getMember().getName();  // 💥 LazyInitializationException!
// 트랜잭션이 끝나서 영속성 컨텍스트가 닫혔는데 Proxy를 초기화하려 함
```

> ⚠️ **LazyInitializationException** — LAZY 사용 시 가장 흔한 에러.
> 해결법: 서비스 안에서 필요한 데이터를 미리 로딩하거나, Fetch Join/DTO 변환.

---

## 7. N+1 문제 — 따라쳐보기 🔴

### 비유: 출석부 확인

선생님이 30명 학생의 **부모님 이름**을 확인하려 한다.

```
1. 학생 목록 가져오기 (SELECT 1번)
2. 학생1의 부모 조회      ← 1번
3. 학생2의 부모 조회      ← 2번
...
31. 학생30의 부모 조회     ← 30번

총 SQL: 1 + 30 = 31개 😱
```

이게 **N+1 문제**다. 1번 조회했는데 N번 추가 쿼리가 나가는 것.

### 따라쳐보기 — N+1을 직접 눈으로 보자!

`TestController.java`에 추가:

```java
// ⭐ N+1 이 터지는 API
@GetMapping("/test/n-plus-one")
@Transactional(readOnly = true)
public String nPlusOne() {
    System.out.println("=== N+1 테스트 시작 ===");

    List<StudyLog> logs = studyLogRepository.findAll();
    System.out.println("1번 쿼리 완료 — 학습 로그 " + logs.size() + "개 조회");

    StringBuilder sb = new StringBuilder();
    for (StudyLog log : logs) {
        // 여기서 getMember().getName() 할 때마다 SQL 추가 발사!
        sb.append(log.getTitle())
          .append(" - ")
          .append(log.getMember().getName())  // ⭐ 이 순간 SQL!
          .append("\n");
    }
    return sb.toString();
}
```

**💻 브라우저: `http://localhost:8080/test/n-plus-one`**

```
JPA 기초 - 홍길동
Spring MVC - 홍길동
JPA 심화 - 김철수
SQL 연습 - 김철수
Spring Security - 이영희
Docker 입문 - 이영희
```

**💻 콘솔 — SQL을 확인하자!**

```sql
=== N+1 테스트 시작 ===
-- 1번: 학습 로그 전체 조회
Hibernate:
    select s1_0.id, s1_0.category, s1_0.content, s1_0.created_at,
           s1_0.member_id, s1_0.study_date, s1_0.study_time, s1_0.title
    from study_log s1_0
1번 쿼리 완료 — 학습 로그 6개 조회

-- 2번: 홍길동 조회 (첫 번째 로그의 member)
Hibernate:
    select m1_0.id, m1_0.email, m1_0.name
    from member m1_0
    where m1_0.id=?

-- 3번: 김철수 조회 (세 번째 로그의 member)
Hibernate:
    select m1_0.id, m1_0.email, m1_0.name
    from member m1_0
    where m1_0.id=?

-- 4번: 이영희 조회 (다섯 번째 로그의 member)
Hibernate:
    select m1_0.id, m1_0.email, m1_0.name
    from member m1_0
    where m1_0.id=?

-- 총 SQL 4개! (1 + 회원 3명)
-- 회원이 100명이면? 1 + 100 = 101개!!
```

> 🔥 **이게 N+1이다!**
> `findAll()`로 1번 조회 → `getMember().getName()` 할 때마다 추가 쿼리!
>
> 💡 홍길동은 로그 2개인데 SQL은 1번만? → 21번에서 배운 **1차 캐시**! 같은 트랜잭션에서 같은 PK(id=1)는 캐시에서 반환.

### N+1은 LAZY에서만 발생하나?

**둘 다 발생한다!**

```
EAGER:
  findAll() → study_log 6개 SELECT
  → EAGER니까 바로 member 3번 SELECT
  → SQL 4개 (자동으로 N+1!)

LAZY:
  findAll() → study_log 6개 SELECT (member는 Proxy)
  → getMember().getName() 할 때마다 SELECT
  → SQL 1 + 사용한 만큼 (최대 4개)
```

> 💡 **LAZY라고 N+1이 안 생기는 게 아니다!**
> LAZY는 "발생 시점을 늦출 뿐"이다. 핵심은 **N+1을 해결하는 방법**을 아는 것이다.

---

## 8. N+1 해결법 1: Fetch Join — 따라쳐보기 🔴

### 비유: 한 번에 세트로 가져오기

N+1이 "하나씩 가져오기"의 문제라면, Fetch Join은 "**한 번에 다 가져오기**"다.

### 따라쳐보기

`StudyLogRepository.java`에 메서드 추가:

```java
package com.study.jpapractice.repository;

import com.study.jpapractice.entity.StudyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    // ⭐ Fetch Join 추가!
    @Query("SELECT s FROM StudyLog s JOIN FETCH s.member")
    List<StudyLog> findAllWithMember();
}
```

`TestController.java`에 추가:

```java
// ⭐ Fetch Join으로 해결한 API
@GetMapping("/test/fetch-join")
@Transactional(readOnly = true)
public String fetchJoin() {
    System.out.println("=== Fetch Join 테스트 시작 ===");

    List<StudyLog> logs = studyLogRepository.findAllWithMember();

    StringBuilder sb = new StringBuilder();
    for (StudyLog log : logs) {
        sb.append(log.getTitle())
          .append(" - ")
          .append(log.getMember().getName())  // 추가 SQL 없음!
          .append("\n");
    }
    return sb.toString();
}
```

**💻 브라우저: `http://localhost:8080/test/fetch-join`**

```
JPA 기초 - 홍길동
Spring MVC - 홍길동
JPA 심화 - 김철수
SQL 연습 - 김철수
Spring Security - 이영희
Docker 입문 - 이영희
```

**💻 콘솔 — SQL이 1개만 찍힌다!**

```sql
=== Fetch Join 테스트 시작 ===
Hibernate:
    select s1_0.id, s1_0.category, s1_0.content, s1_0.created_at,
           s1_0.member_id, s1_0.study_date, s1_0.study_time, s1_0.title,
           m1_0.id, m1_0.email, m1_0.name
    from study_log s1_0
    join member m1_0 on m1_0.id = s1_0.member_id

-- 끝!! SQL 1개!!
-- getMember().getName() 해도 추가 SQL 없음!
```

> ✅ **`JOIN FETCH` 한 줄 추가했을 뿐인데, SQL이 4개 → 1개로 줄었다!**

### Fetch Join vs 일반 JOIN 차이

```
일반 JOIN:
  SELECT s.* FROM study_log s JOIN member m ON ...
  → study_log만 SELECT (member 데이터 안 가져옴)
  → 결국 getMember() 하면 또 SQL 나감

Fetch JOIN:
  SELECT s.*, m.* FROM study_log s JOIN FETCH s.member m
  → study_log + member 둘 다 SELECT (한 방에!)
  → getMember() 해도 SQL 안 나감 (이미 가져왔으니까)
```

---

## 9. N+1 해결법 2: @EntityGraph — 따라쳐보기 🔴

Fetch Join을 `@Query` 없이 쓰는 방법.

`StudyLogRepository.java`에 추가:

```java
// @EntityGraph로 Fetch Join과 같은 효과
@EntityGraph(attributePaths = {"member"})
List<StudyLog> findByCategory(Category category);
```

`TestController.java`에 추가:

```java
// ⭐ @EntityGraph 테스트
@GetMapping("/test/entity-graph")
@Transactional(readOnly = true)
public String entityGraph() {
    System.out.println("=== @EntityGraph 테스트 시작 ===");

    List<StudyLog> logs = studyLogRepository.findByCategory(Category.JPA);

    StringBuilder sb = new StringBuilder();
    for (StudyLog log : logs) {
        sb.append(log.getTitle())
          .append(" - ")
          .append(log.getMember().getName())
          .append("\n");
    }
    return sb.toString();
}
```

**💻 브라우저: `http://localhost:8080/test/entity-graph`**

```
JPA 기초 - 홍길동
JPA 심화 - 김철수
```

**💻 콘솔:**

```sql
=== @EntityGraph 테스트 시작 ===
Hibernate:
    select s1_0.id, s1_0.category, s1_0.content, s1_0.created_at,
           s1_0.member_id, s1_0.study_date, s1_0.study_time, s1_0.title,
           m1_0.id, m1_0.email, m1_0.name
    from study_log s1_0
    left join member m1_0 on m1_0.id = s1_0.member_id
    where s1_0.category=?

-- SQL 1개! @Query 안 쓰고도 Fetch Join 효과!
```

### Fetch Join vs @EntityGraph

| 비교 | Fetch Join | @EntityGraph |
|------|-----------|-------------|
| 방식 | `@Query` + JPQL 직접 작성 | 쿼리 메서드에 어노테이션 |
| JOIN 타입 | INNER JOIN | LEFT JOIN |
| 유연성 | 높음 (WHERE, ORDER 자유) | 쿼리 메서드에 종속 |
| 추천 | 복잡한 쿼리 | 단순한 쿼리 |

---

## 10. N+1 해결법 3: Batch Size — 따라쳐보기 🔴

### 비유: 택배 모아보내기

Fetch Join이 **한 번에 전부** 가져오는 것이라면,
Batch Size는 **N번을 묶어서 몇 번으로** 줄이는 것이다.

### 따라쳐보기

`application.yml`에 한 줄 추가:

```yaml
spring:
  jpa:
    properties:
      hibernate:
        format_sql: true
        default_batch_fetch_size: 100   # ⭐ 이거 추가!
```

앱 재시작 후 다시 접속: `http://localhost:8080/test/n-plus-one`

**💻 콘솔 — SQL이 줄었다!**

```sql
=== N+1 테스트 시작 ===
-- 1번: 학습 로그 전체 조회
Hibernate:
    select s1_0.id, s1_0.category, s1_0.content, s1_0.created_at,
           s1_0.member_id, s1_0.study_date, s1_0.study_time, s1_0.title
    from study_log s1_0
1번 쿼리 완료 — 학습 로그 6개 조회

-- 2번: member를 IN절로 한 번에 조회! (3명을 한 방에!)
Hibernate:
    select m1_0.id, m1_0.email, m1_0.name
    from member m1_0
    where m1_0.id in (?, ?, ?)

-- 총 SQL 2개!! (N+1이 아니라 1+1!)
```

> ✅ **application.yml 한 줄로 N+1이 완화됐다!**
> 하나씩 SELECT하던 걸 `WHERE id IN (1, 2, 3)` 으로 묶어서 한 번에!

### 동작 원리

```
❌ N+1 (기본):
  SELECT * FROM member WHERE id = 1;
  SELECT * FROM member WHERE id = 2;
  SELECT * FROM member WHERE id = 3;
  → 3개 SQL

✅ Batch Size = 100:
  SELECT * FROM member WHERE id IN (1, 2, 3);
  → 1개 SQL !!

만약 회원이 500명이고 batch_size=100이면:
  SELECT * FROM member WHERE id IN (1,2,...,100);
  SELECT * FROM member WHERE id IN (101,102,...,200);
  SELECT * FROM member WHERE id IN (201,202,...,300);
  SELECT * FROM member WHERE id IN (301,302,...,400);
  SELECT * FROM member WHERE id IN (401,402,...,500);
  → 5개 SQL (500개 → 5개로!)
```

### 결과 비교 정리

```
┌──────────────────────────┬─────────┬─────────────────────┐
│          방법             │ SQL 수  │ 한 일                │
├──────────────────────────┼─────────┼─────────────────────┤
│ ❌ 그냥 findAll()         │ 4개     │ 아무것도 안 함        │
│ ✅ Fetch Join             │ 1개     │ @Query 한 줄 추가    │
│ ✅ @EntityGraph           │ 1개     │ 어노테이션 한 줄 추가  │
│ ✅ Batch Size             │ 2개     │ yml 설정 한 줄 추가   │
└──────────────────────────┴─────────┴─────────────────────┘

회원이 100명이라면?
  ❌ 그냥: 101개 SQL
  ✅ Fetch Join: 1개 SQL
  ✅ Batch Size (100): 2개 SQL
```

---

## 11. N+1 해결 — 실무 선택 가이드 🔴

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

### Fetch Join + 페이징 주의

```java
// ✅ @ManyToOne + Fetch Join + 페이징 = OK (데이터 뻥튀기 없음)
@Query("SELECT s FROM StudyLog s JOIN FETCH s.member")
Page<StudyLog> findAllWithMember(Pageable pageable);

// ❌ @OneToMany + Fetch Join + 페이징 = 위험!
@Query("SELECT m FROM Member m JOIN FETCH m.studyLogs")
Page<Member> findAllWithStudyLogs(Pageable pageable);
// → 1:N 조인하면 row가 뻥튀기 → 메모리에 전부 올린 뒤 페이징 → 위험!
```

> ⚠️ `@OneToMany` Fetch Join + 페이징이 필요하면 → **Batch Size를 써라!**

---

## 12. @OneToMany — 양방향 관계 🟡

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

### Member에 @OneToMany 추가

```java
@Entity
@Table(name = "member")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    // ═══ 양방향: Member → StudyLog ═══
    @OneToMany(mappedBy = "member")    // "나는 주인이 아니야, StudyLog.member가 주인이야"
    private List<StudyLog> studyLogs = new ArrayList<>();

    @Builder
    public Member(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public void updateName(String name) {
        this.name = name;
    }
}
```

> 💡 `import java.util.ArrayList;`와 `import java.util.List;` 추가 필요!

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
memberRepository.save(member);
// → study_log.member_id = NULL !! (FK가 안 들어간다)

// ✅ 주인(StudyLog.member)에 값을 넣어야 한다!
studyLog = StudyLog.builder()
    .title("JPA 공부")
    .member(member)           // ← 주인 쪽에 설정!
    .build();
studyLogRepository.save(studyLog);
// → study_log.member_id = 1 (정상!)
```

### 양방향, 꼭 필요한가?

```
✅ 양방향이 필요한 경우:
   - cascade/orphanRemoval이 필요할 때
   - 비즈니스 로직에서 member.getStudyLogs()를 자주 쓸 때

❌ 양방향 없이도 되는 경우:
   - Repository에서 findByMember(member)로 충분할 때
   - 조회만 하고 관계 관리가 필요 없을 때

💡 실무 팁: 일단 단방향(@ManyToOne)만 만들고,
             필요해지면 그때 @OneToMany를 추가한다.
```

---

## 13. cascade와 orphanRemoval 🟡

### 비유: 가족 여행

- **cascade** = 부모가 여행 가면 자식도 같이 간다 (부모 저장 → 자식도 저장)
- **orphanRemoval** = 부모가 자식을 내쫓으면 자식은 사라진다 (리스트에서 제거 → DB 삭제)

### cascade

```java
@OneToMany(mappedBy = "member", cascade = CascadeType.ALL)
private List<StudyLog> studyLogs = new ArrayList<>();
```

```java
// cascade = ALL이면:
Member member = Member.builder().name("박민수").email("park@mail.com").build();

StudyLog log1 = StudyLog.builder().title("테스트1").member(member).build();
StudyLog log2 = StudyLog.builder().title("테스트2").member(member).build();
member.getStudyLogs().add(log1);
member.getStudyLogs().add(log2);

memberRepository.save(member);
// → member INSERT + log1 INSERT + log2 INSERT (3개 동시 저장!)
// → studyLogRepository.save() 안 불러도 된다!
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

## 14. @OneToOne LAZY가 안 먹는 경우 🟢

### 문제

```java
// Member → Profile (Member가 FK를 가짐)
@Entity
public class Member {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private Profile profile;
}
// → LAZY 정상 동작 ✅

// Profile → Member (Profile에 FK 없음, mappedBy)
@Entity
public class Profile {
    @OneToOne(mappedBy = "profile", fetch = FetchType.LAZY)
    private Member member;
}
// → LAZY 안 먹음! EAGER처럼 동작 ❌
```

### 왜?

FK가 없는 쪽은 "상대방이 있는지 없는지" 알 수 없다.
- Profile 테이블에 `member_id` FK가 없으니까
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

## 15. 전체 흐름 정리 — 실전 코드 🔴

### Repository

```java
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    // N+1 방지: Fetch Join
    @Query("SELECT s FROM StudyLog s JOIN FETCH s.member")
    List<StudyLog> findAllWithMember();

    // N+1 방지: @EntityGraph
    @EntityGraph(attributePaths = {"member"})
    List<StudyLog> findByCategory(Category category);

    // Fetch Join + 조건
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

    // 목록 조회 — Fetch Join으로 N+1 방지
    public List<StudyLog> getAllWithMember() {
        return studyLogRepository.findAllWithMember();
    }

    // 카테고리별 조회 — @EntityGraph로 N+1 방지
    public List<StudyLog> getByCategory(Category category) {
        return studyLogRepository.findByCategory(category);
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

## 16. 실습 문제

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

1. 발생한다! `findAll()`은 일반 쿼리라 Member를 LAZY로 둔다. for문에서 `getMember().getName()` 호출 시 추가 SQL 발생.
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
2. 쓸 수 없다. Product는 여러 OrderItem이 공유한다. 한 주문을 삭제한다고 상품까지 삭제되면 안 된다.

> 핵심: **소유자가 하나**이고 **생명주기가 종속**될 때만 cascade!

</details>

---

## 17. 면접 대비 🔴🟡

### 🔴 필수 — 반드시 답할 수 있어야 한다

**Q1: N+1 문제가 무엇이고 어떻게 해결하나?**

> 1번의 쿼리로 N개의 엔티티를 조회한 후, 연관된 엔티티에 접근할 때 N번의 추가 쿼리가 발생하는 문제다. 해결 방법: (1) Fetch Join — JPQL에 `JOIN FETCH`를 써서 한 번에 조회, (2) @EntityGraph — 쿼리 메서드에 어노테이션으로 Fetch Join 효과, (3) Batch Size — IN절로 묶어서 조회 횟수를 줄임. 실무에서는 Batch Size를 전역으로 깔고, 핵심 쿼리는 Fetch Join으로 최적화한다.

**Q2: EAGER와 LAZY의 차이는?**

> EAGER는 엔티티 조회 시 연관 엔티티를 즉시 함께 로딩한다. LAZY는 연관 엔티티를 Proxy로 두고, 실제 접근 시점에 SQL을 실행해 로딩한다. 모든 @ManyToOne, @OneToOne에는 LAZY를 명시해야 한다. 기본값이 EAGER이기 때문이다.

**Q3: 연관관계의 주인(Owner)이란?**

> 양방향 연관관계에서 FK를 실제로 관리하는 쪽이다. FK가 있는 테이블의 엔티티가 주인이 된다. @ManyToOne 쪽이 주인이고, @OneToMany(mappedBy) 쪽은 읽기 전용 거울이다. DB에 반영되려면 주인 쪽에 값을 설정해야 한다.

**Q4: Fetch Join과 일반 JOIN의 차이는?**

> 일반 JOIN은 WHERE 조건으로만 사용하고 연관 엔티티를 SELECT하지 않는다. Fetch Join(JOIN FETCH)은 연관 엔티티의 데이터까지 한 번에 SELECT해서 영속성 컨텍스트에 올린다. Fetch Join을 써야 N+1이 해결된다.

**Q5: Proxy란?**

> LAZY 로딩 시 실제 엔티티 대신 생성되는 가짜 객체다. 엔티티를 상속받은 형태로, ID만 가지고 있다. ID 외의 필드에 접근하는 순간 DB를 조회해서 실제 데이터를 채운다. 영속성 컨텍스트가 닫힌 후에 접근하면 LazyInitializationException이 발생한다.

### 🟡 개념만 — 물어보면 설명할 수 있으면 OK

**Q6: cascade와 orphanRemoval의 차이는?**

> cascade는 부모 엔티티에 대한 영속성 전이다(부모 저장/삭제 시 자식도 함께). orphanRemoval은 부모의 컬렉션에서 자식을 제거하면 DB에서도 삭제하는 기능이다. 둘 다 자식의 소유자가 하나이고 생명주기가 부모에 종속될 때만 사용해야 한다.

**Q7: @OneToOne에서 LAZY가 안 먹는 경우는?**

> FK가 없는 쪽(mappedBy 쪽)에서는 LAZY가 동작하지 않는다. FK가 없으면 상대방 존재 여부를 알 수 없어서 Proxy를 만들지 null로 둘지 결정할 수 없기 때문이다. 해결법은 FK가 있는 쪽에서만 단방향으로 쓰는 것이다.

**Q8: Batch Size는 어떻게 동작하나?**

> LAZY 로딩 시 하나씩 SELECT하는 대신, `WHERE id IN (1,2,3,...,N)`으로 묶어서 조회한다. `hibernate.default_batch_fetch_size=100`이면 최대 100개씩 한 번의 쿼리로 가져온다. Fetch Join이 불가능한 상황(@OneToMany + 페이징)에서도 사용 가능하다.

---

## 18. 핵심 요약

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
│  💥 N+1 문제와 해결 (핵심!!)                               │
│    1. Fetch Join → SQL 1개로 한 방 해결                   │
│    2. @EntityGraph → 쿼리 메서드에 어노테이션               │
│    3. Batch Size → IN절로 묶기 (전역 설정)                 │
│    실무: Batch Size 전역 + 핵심 쿼리 Fetch Join            │
│                                                         │
│  🛡️ cascade/orphanRemoval                                │
│    소유자가 하나 + 생명주기 종속 → 사용 OK                  │
│    그 외 → 사용 금지!                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
