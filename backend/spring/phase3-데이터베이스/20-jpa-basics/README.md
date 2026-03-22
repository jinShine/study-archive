# 20. JPA 기초 — ORM 개념과 Entity

> **키워드**: `ORM` `JPA` `Hibernate` `패러다임 불일치` `JdbcTemplate` `@Entity` `@Id` `@GeneratedValue` `@Column` `@Enumerated` `@Table` `ddl-auto`

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | ORM이 뭔지, 패러다임 불일치, Entity 매핑 어노테이션, ddl-auto | 면접 단골 + 매일 쓰는 코드 |
| 🟡 이해 | JPA vs Hibernate vs Spring Data JPA 관계, JdbcTemplate과 비교 | 구조를 알면 트러블슈팅 가능 |
| 🟢 참고 | JPA 탄생 역사, 다른 ORM 프레임워크 | 있다는 것만 알면 됨 |

> 💡 **드디어 Java 코드와 DB가 연결된다!** 17~19번에서 SQL과 DB 설계를 배웠으니, 이제 그걸 Java로 다루는 방법을 배운다.

---

## 1. SQL을 직접 쓰는 게 왜 힘든가? 🔴

### Phase 2까지의 코드를 돌아보자

Phase 2에서 만든 학습 일지 API, 데이터를 HashMap에 저장했다:

```java
// Phase 2 — HashMap 저장
private final Map<Long, StudyLog> store = new HashMap<>();

public StudyLog save(StudyLog studyLog) {
    store.put(studyLog.getId(), studyLog);
    return studyLog;
}
```

이걸 DB에 저장하려면? SQL을 직접 써야 한다:

```java
// JdbcTemplate — SQL 직접 작성
public StudyLog save(StudyLog studyLog) {
    String sql = "INSERT INTO study_log (title, content, category, study_date) VALUES (?, ?, ?, ?)";
    jdbcTemplate.update(sql,
        studyLog.getTitle(),
        studyLog.getContent(),
        studyLog.getCategory().name(),  // enum → String 변환 직접 해야 함
        studyLog.getStudyDate()
    );
    return studyLog;
}

public Optional<StudyLog> findById(Long id) {
    String sql = "SELECT * FROM study_log WHERE id = ?";
    return jdbcTemplate.query(sql, (rs, rowNum) -> {
        StudyLog log = new StudyLog();
        log.setId(rs.getLong("id"));
        log.setTitle(rs.getString("title"));
        log.setContent(rs.getString("content"));
        log.setCategory(Category.valueOf(rs.getString("category")));  // String → enum 변환
        log.setStudyDate(rs.getDate("study_date").toLocalDate());
        return log;
    }, id).stream().findFirst();
}
```

### 뭐가 문제인가?

```
1. SQL을 문자열로 직접 작성 → 오타나면 런타임에서야 발견
2. 컬럼 하나 추가되면? → 모든 SQL 문자열 수정
3. rs.getString("title") 같은 매핑 코드 → 노가다, 실수 위험
4. enum ↔ String 변환을 개발자가 직접 해야 함
5. 테이블이 10개면? → SQL이 수십 개... 😱
```

> 🔴 **이 고통을 해결하는 게 ORM(JPA)이다.**

---

## 2. ORM이 뭔가? 🔴

### 비유: 통역사

```
한국어를 쓰는 사람(Java)이 영어를 쓰는 사람(DB)과 대화해야 한다.

방법 1: 직접 영어 배우기 (JdbcTemplate)
  → 매번 영어(SQL)를 직접 써야 한다
  → 문법 틀리면 상대방이 못 알아듣는다
  → 힘들다...

방법 2: 통역사 고용하기 (ORM)
  → 한국어(Java 객체)로 말하면
  → 통역사(ORM)가 영어(SQL)로 변환해준다
  → 편하다!
```

### 정의

> **ORM** = **O**bject **R**elational **M**apping
>
> Java **객체(Object)**와 DB **테이블(Relational)**을 **자동으로 매핑(Mapping)**해주는 기술

```
Java 세계              ORM이 변환           DB 세계
──────────            ──────────          ──────────
클래스(Class)    ←→    테이블(Table)
필드(Field)      ←→    컬럼(Column)
객체(Instance)   ←→    행(Row)
참조(Reference)  ←→    FK(Foreign Key)
```

### JPA로 바꾸면 코드가 이렇게 된다

```java
// JPA — SQL 없이 Java 객체만으로!
@Entity
public class StudyLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String content;

    @Enumerated(EnumType.STRING)
    private Category category;

    private LocalDate studyDate;
}

// 저장
studyLogRepository.save(studyLog);      // INSERT 자동 생성!

// 조회
studyLogRepository.findById(1L);        // SELECT 자동 생성!

// 수정
studyLog.setTitle("새 제목");            // UPDATE 자동 생성! (Dirty Checking)

// 삭제
studyLogRepository.delete(studyLog);    // DELETE 자동 생성!
```

```
JdbcTemplate: SQL 직접 작성 + 매핑 코드 수십 줄
JPA:          어노테이션 몇 개 + 메서드 한 줄

→ 코드량이 1/5로 줄어든다
```

---

## 3. JPA, Hibernate, Spring Data JPA — 뭐가 뭔지 🟡

### 비유: 법률 → 법률사무소 → 법률 AI

```
JPA            = 법률 (표준 규격서, 인터페이스)
Hibernate      = 법률사무소 (법률을 실제로 실행하는 구현체)
Spring Data JPA = 법률 AI (법률사무소를 더 쉽게 이용하는 도구)
```

### 계층 구조

```
┌──────────────────────────────────────┐
│         Spring Data JPA              │  ← 제일 위. 개발자가 쓰는 층
│   (JpaRepository, 쿼리 메서드)        │     "save(), findById() 한 줄"
├──────────────────────────────────────┤
│            Hibernate                 │  ← 중간. 실제 SQL 생성
│   (EntityManager, Session)           │     "INSERT INTO ... 생성"
├──────────────────────────────────────┤
│              JPA                     │  ← 맨 밑. 표준 인터페이스
│   (javax.persistence / jakarta.*)    │     "이렇게 만들어야 한다" 규격서
├──────────────────────────────────────┤
│             JDBC                     │  ← DB 연결 담당
│   (Connection, Statement)            │     "DB야, 이 SQL 실행해줘"
└──────────────────────────────────────┘
```

**중요한 포인트:**

| 구분 | JPA | Hibernate | Spring Data JPA |
|------|-----|-----------|-----------------|
| 뭐냐 | 인터페이스 (규격서) | 구현체 (실제 동작) | Spring이 만든 편의 도구 |
| 비유 | "자동차는 핸들과 브레이크가 있어야 한다" | "현대자동차가 만든 실제 자동차" | "자율주행 모드" |
| SQL 생성 | ❌ 규격만 정의 | ✅ 직접 생성 | ❌ Hibernate에 위임 |

> 🟡 **면접에서 "JPA가 뭔가요?"라고 물으면**: "JPA는 자바 ORM 표준 인터페이스이고, Hibernate가 그 대표적인 구현체입니다. Spring Data JPA는 Hibernate 위에서 Repository 패턴을 자동화해주는 Spring의 편의 모듈입니다."

---

## 4. 패러다임 불일치 — ORM이 풀어야 하는 5가지 문제 🔴

### "패러다임 불일치"란?

Java(객체지향)와 DB(관계형)는 **설계 철학이 다르다**. 이 차이를 "패러다임 불일치"라고 한다.

```
Java: 객체끼리 참조(reference)로 연결된다 → 그래프 구조
DB:   테이블끼리 FK로 연결된다            → 테이블 구조

둘이 구조가 다르니까, 변환할 때 문제가 생긴다.
```

### 불일치 1: 상속 🟡

```java
// Java — 상속이 자연스럽다
public abstract class Item {
    private Long id;
    private String name;
    private int price;
}

public class Book extends Item {
    private String author;
    private String isbn;
}

public class Movie extends Item {
    private String director;
}
```

```
DB — 상속이라는 개념이 없다!

방법 1: 단일 테이블 전략 (가장 많이 씀)
item
┌────┬──────┬───────┬────────┬──────┬──────────┬──────────┐
│ id │ type │ name  │ price  │author│  isbn    │ director │
├────┼──────┼───────┼────────┼──────┼──────────┼──────────┤
│  1 │ BOOK │ 자바  │ 30000  │ 조슈아│ 978-...  │  NULL    │
│  2 │ MOVIE│ 토르  │ 12000  │ NULL │  NULL    │  타이카   │
└────┴──────┴───────┴────────┴──────┴──────────┴──────────┘
→ NULL이 많아지는 단점이 있지만, JOIN이 없어서 빠르다

방법 2: 조인 전략
item (id, name, price) + book (item_id, author, isbn) + movie (item_id, director)
→ 정규화는 좋지만, 조회할 때 항상 JOIN 필요

방법 3: 테이블 per 클래스
book (id, name, price, author, isbn) + movie (id, name, price, director)
→ Item 전체를 조회하려면 UNION ALL 필요
```

> JPA는 `@Inheritance` 어노테이션 하나로 이 3가지 전략을 선택할 수 있다. (24번에서 자세히)

### 불일치 2: 연관관계 방향 🔴

```java
// Java — 단방향 참조
class Member {
    private Team team;     // Member → Team (갈 수 있다)
}

class Team {
    // Member를 참조하는 필드가 없다 → Team에서 Member로 못 간다
}
```

```sql
-- DB — FK로 양방향 JOIN 가능
SELECT * FROM member m JOIN team t ON m.team_id = t.id;  -- Member → Team ✅
SELECT * FROM team t JOIN member m ON m.team_id = t.id;  -- Team → Member ✅
```

```
Java: 참조가 있는 쪽에서만 갈 수 있다 (단방향)
DB:   FK 하나면 양쪽 다 JOIN 가능 (양방향)

→ 이 차이를 JPA가 @ManyToOne, @OneToMany로 해결한다 (24번에서 자세히)
```

### 불일치 3: 객체 그래프 탐색 🔴

```java
// Java — 자유롭게 객체를 타고 갈 수 있다
member.getTeam().getName();
member.getOrders().get(0).getProduct().getCategory();

// 하지만 SQL로 조회했다면?
// SELECT * FROM member WHERE id = 1;
// → team 정보가 없다! member.getTeam() → NULL 💀
// → SQL에서 JOIN을 안 했으니까!
```

```
Java: 객체 그래프를 자유롭게 탐색하고 싶다
DB:   SQL에 JOIN을 넣은 만큼만 탐색 가능

→ JPA가 Lazy Loading으로 해결한다 (필요한 순간에 자동으로 SQL 발사)
→ 하지만 이게 N+1 문제를 일으킨다 (24번에서 자세히)
```

### 불일치 4: 동일성 비교 🟡

```java
// Java — 같은 PK인데 다른 객체?
StudyLog log1 = jdbcTemplate.queryForObject("SELECT ...", mapper, 1L);
StudyLog log2 = jdbcTemplate.queryForObject("SELECT ...", mapper, 1L);

log1 == log2;       // false! 😱 (서로 다른 new 객체)
log1.equals(log2);  // equals 오버라이드 안 했으면 이것도 false

// JPA — 같은 PK면 같은 객체!
StudyLog log1 = em.find(StudyLog.class, 1L);
StudyLog log2 = em.find(StudyLog.class, 1L);

log1 == log2;       // true! ✅ (1차 캐시에서 같은 객체를 반환)
```

```
JDBC:  같은 데이터를 2번 조회하면 서로 다른 객체 → 동일성 보장 X
JPA:   같은 데이터를 2번 조회하면 같은 객체 반환 → 동일성 보장 O (1차 캐시)
```

### 불일치 5: 데이터 타입 매핑 🟢

```
Java                    DB (MySQL)
──────                  ──────────
String           ←→     VARCHAR, TEXT, CHAR
int / Integer    ←→     INT
long / Long      ←→     BIGINT
boolean          ←→     TINYINT(1), BIT
LocalDate        ←→     DATE
LocalDateTime    ←→     DATETIME, TIMESTAMP
BigDecimal       ←→     DECIMAL
enum             ←→     VARCHAR (이름) 또는 INT (순서)
byte[]           ←→     BLOB
```

> JPA가 이 타입 변환을 전부 자동으로 해준다.

### 패러다임 불일치 요약 (면접용)

```
┌────────────────────┬────────────────────┬──────────────────┐
│     불일치          │   Java(객체)       │   DB(관계형)      │
├────────────────────┼────────────────────┼──────────────────┤
│ 1. 상속            │ extends 가능       │ 상속 개념 없음     │
│ 2. 연관관계 방향    │ 단방향 참조        │ FK로 양방향 JOIN   │
│ 3. 객체 그래프 탐색 │ 자유롭게 탐색      │ SQL 범위만 탐색    │
│ 4. 동일성 비교      │ == 보장 안 됨      │ PK로 동일성 보장   │
│ 5. 데이터 타입      │ Java 타입         │ DB 타입           │
└────────────────────┴────────────────────┴──────────────────┘

→ JPA(ORM)가 이 5가지 차이를 전부 자동 변환해준다!
```

---

## 5. 프로젝트 설정 🔴

### build.gradle 의존성 추가

```groovy
dependencies {
    // Spring Data JPA (JPA + Hibernate + Spring 편의 기능)
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'

    // MySQL 드라이버
    runtimeOnly 'com.mysql:mysql-connector-j'

    // Lombok (이전에 추가했을 수 있음)
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
}
```

> 💡 `spring-boot-starter-data-jpa` 하나만 추가하면 JPA + Hibernate + Spring Data JPA가 전부 들어온다.

### application.yml 설정

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/study_db?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
    username: root
    password: 1234
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: create          # ⚠️ 개발 환경에서만!
    show-sql: true              # 실행되는 SQL을 콘솔에 출력
    properties:
      hibernate:
        format_sql: true        # SQL을 예쁘게 포맷팅
        use_sql_comments: true  # 어떤 엔티티에서 발생한 SQL인지 주석 추가
```

### ddl-auto 옵션 — 반드시 이해해야 한다 🔴

| 옵션 | 동작 | 사용 시점 |
|------|------|----------|
| `create` | 기존 테이블 DROP 후 새로 CREATE | 개발 초기 (데이터 날아감!) |
| `create-drop` | create + 애플리케이션 종료 시 DROP | 테스트 |
| `update` | 변경된 부분만 ALTER | 개발 중 (컬럼 추가는 됨, 삭제는 안 됨) |
| `validate` | 엔티티와 테이블이 맞는지 **검증만** | 스테이징/운영 |
| `none` | 아무것도 안 함 | 운영 |

```
⚠️ 운영 환경에서 절대로 create, create-drop, update 사용 금지!

실무 패턴:
  개발: create 또는 update
  테스트: create-drop
  스테이징: validate
  운영: validate 또는 none

→ 운영 DB는 Flyway나 Liquibase 같은 마이그레이션 도구로 관리한다
```

> 🔴 **면접에서 "ddl-auto를 운영에서 어떻게 설정하나요?"라고 물어본다.** 답: "validate 또는 none으로 설정하고, 스키마 변경은 Flyway 같은 마이그레이션 도구로 관리합니다."

---

## 6. @Entity — Java 클래스를 테이블로 만들기 🔴

### 비유: 이력서와 인사 시스템

```
@Entity = "이 클래스를 DB 테이블로 등록해주세요" 라는 표시
마치 이력서를 인사팀에 제출하면 사원 목록에 등록되는 것과 같다.
```

### 기본 Entity 만들기

```java
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity                     // ① "이 클래스는 DB 테이블이다"
@Getter                     // Lombok
@NoArgsConstructor(access = AccessLevel.PROTECTED)  // ② JPA 필수: 기본 생성자
@Table(name = "study_log")  // ③ 테이블명 지정 (생략하면 클래스명 그대로)
public class StudyLog {

    @Id                                             // ④ PK
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // ⑤ AUTO_INCREMENT
    private Long id;

    @Column(nullable = false, length = 200)         // ⑥ 컬럼 옵션
    private String title;

    @Column(columnDefinition = "TEXT")              // ⑦ DDL 직접 지정
    private String content;

    @Enumerated(EnumType.STRING)                    // ⑧ enum → 문자열 저장
    @Column(nullable = false, length = 50)
    private Category category;

    @Column(nullable = false)
    private int studyTime;                          // → study_time 컬럼 (자동 변환)

    @Column(nullable = false)
    private LocalDate studyDate;                    // → study_date 컬럼

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;                // → created_at 컬럼

    private LocalDateTime updatedAt;                // → updated_at 컬럼

    // ⑨ 생성 메서드 (빌더 또는 정적 팩토리)
    @Builder
    public StudyLog(String title, String content, Category category,
                    int studyTime, LocalDate studyDate) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.studyTime = studyTime;
        this.studyDate = studyDate;
        this.createdAt = LocalDateTime.now();
    }

    // ⑩ 수정 메서드 (Setter 대신!)
    public void update(String title, String content, Category category) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.updatedAt = LocalDateTime.now();
    }
}
```

```java
// enum 클래스
public enum Category {
    SPRING, DATABASE, JPA, DEVOPS, REACT
}
```

### 하나씩 뜯어보자

---

### ① @Entity 🔴

```java
@Entity
public class StudyLog { ... }
```

- 이 클래스가 DB 테이블과 매핑된다는 선언
- **반드시 `@Id`가 있어야 한다** (PK 없는 테이블은 없으니까)
- **기본 생성자가 반드시 있어야 한다** (JPA가 리플렉션으로 객체를 만들기 때문)

---

### ② 기본 생성자 (NoArgsConstructor) 🔴

```java
@NoArgsConstructor(access = AccessLevel.PROTECTED)
```

```
왜 PROTECTED?

public:    아무 데서나 new StudyLog() 가능 → 빈 객체가 돌아다님 위험
protected: JPA만 쓸 수 있게 제한 → 개발자는 Builder/정적 팩토리로만 생성
private:   ❌ JPA가 접근 못 함 → 에러!

→ PROTECTED가 "JPA는 쓸 수 있지만, 개발자는 못 쓰게" 하는 최적 접근제어
```

> 🔴 **"왜 기본 생성자가 필요한가요?"** → "JPA(Hibernate)가 DB에서 데이터를 조회한 후 리플렉션으로 객체를 생성하기 때문입니다. 리플렉션은 기본 생성자가 필요합니다."

---

### ③ @Table 🟡

```java
@Table(name = "study_log")
```

```
생략하면?
  → 클래스명 StudyLog가 그대로 테이블명이 된다
  → Spring Boot의 기본 전략: camelCase → snake_case 자동 변환
  → StudyLog → study_log (자동!)

명시하는 경우:
  → 테이블명이 클래스명과 다를 때
  → 예: @Table(name = "tbl_study_log")
```

---

### ④ @Id — PK 매핑 🔴

```java
@Id
private Long id;
```

- 이 필드가 테이블의 **Primary Key**라는 선언
- **모든 Entity에 반드시 있어야 한다**
- `Long` 타입 권장 (int는 21억까지, Long은 사실상 무한)

---

### ⑤ @GeneratedValue — PK 생성 전략 🔴

```java
@GeneratedValue(strategy = GenerationType.IDENTITY)
```

| 전략 | 설명 | DB | 추천 |
|------|------|-----|------|
| `IDENTITY` | DB의 AUTO_INCREMENT 사용 | MySQL | ✅ MySQL이면 이거! |
| `SEQUENCE` | DB 시퀀스 사용 | PostgreSQL, Oracle | PostgreSQL이면 이거 |
| `TABLE` | 별도 키 생성 테이블 사용 | 모든 DB | ❌ 성능 나쁨 |
| `AUTO` | DB에 맞게 자동 선택 | 모든 DB | ⚠️ 예측 어려움 |

```
우리는 MySQL을 쓰니까 IDENTITY!

IDENTITY의 동작:
  1. JPA가 INSERT SQL을 실행한다
  2. MySQL이 AUTO_INCREMENT로 id를 생성한다
  3. JPA가 생성된 id를 가져와서 Entity 객체에 넣어준다

→ save() 호출 후에 studyLog.getId()로 생성된 id를 바로 쓸 수 있다
```

---

### ⑥ @Column — 컬럼 옵션 🔴

```java
@Column(nullable = false, length = 200)
private String title;
```

| 속성 | 기본값 | 설명 |
|------|--------|------|
| `name` | 필드명 (snake_case 변환) | 컬럼명 직접 지정 |
| `nullable` | `true` | `false`면 NOT NULL |
| `length` | `255` | VARCHAR 길이 (String에만) |
| `unique` | `false` | UNIQUE 제약조건 |
| `updatable` | `true` | `false`면 UPDATE 시 이 컬럼 제외 |
| `insertable` | `true` | `false`면 INSERT 시 이 컬럼 제외 |
| `columnDefinition` | - | DDL 직접 지정 (예: `"TEXT"`) |

```java
// 자주 쓰는 패턴들
@Column(nullable = false, length = 200)
private String title;                    // VARCHAR(200) NOT NULL

@Column(columnDefinition = "TEXT")
private String content;                  // TEXT 타입

@Column(nullable = false, updatable = false)
private LocalDateTime createdAt;         // NOT NULL, 수정 불가

@Column(unique = true, nullable = false)
private String email;                    // UNIQUE NOT NULL
```

**@Column 생략하면?**

```java
private String title;
// → @Column() 기본값이 적용된다
// → nullable = true, length = 255
// → 컬럼명은 title (Spring Boot가 camelCase → snake_case 변환)
```

> 💡 **실무 팁**: `@Column`을 생략해도 컬럼이 만들어지긴 하지만, `nullable = false` 같은 제약조건은 명시하는 게 좋다. 코드만 봐도 "이 필드는 필수구나"를 알 수 있으니까.

---

### ⑦ @Enumerated — enum 매핑 🔴

```java
@Enumerated(EnumType.STRING)
private Category category;
```

| 옵션 | 저장 값 | 예시 | 추천 |
|------|---------|------|------|
| `EnumType.STRING` | enum 이름 | `"SPRING"` | ✅ 반드시 이거! |
| `EnumType.ORDINAL` | enum 순서 (0, 1, 2...) | `0` | ❌ 절대 쓰지 마! |

```
왜 ORDINAL이 위험한가?

public enum Category {
    SPRING,    // 0
    DATABASE,  // 1
    JPA        // 2
}

DB에는 0, 1, 2가 저장된다.

나중에 enum에 JAVA를 맨 앞에 추가하면?

public enum Category {
    JAVA,      // 0  ← 새로 추가!
    SPRING,    // 1  ← 원래 0이었는데 1로 바뀜!
    DATABASE,  // 2  ← 원래 1이었는데 2로 바뀜!
    JPA        // 3  ← 원래 2였는데 3으로 바뀜!
}

→ 기존 데이터가 전부 엉뚱한 카테고리를 가리키게 된다! 💀
→ "SPRING"이었던 데이터가 "JAVA"로 바뀌어 버림
```

> 🔴 **@Enumerated(EnumType.STRING)을 반드시 사용하라.** ORDINAL은 절대 쓰지 않는다. 면접에서 "왜 STRING을 써야 하나요?"라고 물어본다.

---

### ⑧ 필드명 → 컬럼명 자동 변환 🟡

Spring Boot의 기본 네이밍 전략:

```
Java 필드 (camelCase)     →    DB 컬럼 (snake_case)
─────────────────────          ──────────────────────
studyTime                →    study_time
studyDate                →    study_date
createdAt                →    created_at
memberId                 →    member_id
```

> 19번에서 배운 "DB는 snake_case" 규칙이 여기서 자동으로 적용된다!

---

## 7. Entity 설계 규칙 — 이것만 지키자 🔴

### 규칙 1: Setter를 쓰지 않는다

```java
// ❌ Setter 사용
studyLog.setTitle("새 제목");
studyLog.setContent("새 내용");
studyLog.setCategory(Category.JPA);
// → 어디서든 아무 필드나 바꿀 수 있다
// → 어떤 의도로 바꾼 건지 알 수 없다

// ✅ 의미 있는 메서드 사용
studyLog.update("새 제목", "새 내용", Category.JPA);
// → "수정"이라는 의도가 명확하다
// → update() 안에서 검증 로직도 넣을 수 있다
```

```java
// Entity 안에서
public void update(String title, String content, Category category) {
    if (title == null || title.isBlank()) {
        throw new IllegalArgumentException("제목은 필수입니다");
    }
    this.title = title;
    this.content = content;
    this.category = category;
    this.updatedAt = LocalDateTime.now();
}
```

> 🔴 **Setter 대신 의미 있는 메서드(update, cancel, complete 등)를 만들어라.** 이건 Phase 2의 DTO 편에서도 강조했던 원칙이다.

### 규칙 2: @Builder는 생성 시에만

```java
// 생성할 때는 Builder OK
StudyLog log = StudyLog.builder()
    .title("Spring DI 학습")
    .content("IoC 컨테이너란...")
    .category(Category.SPRING)
    .studyTime(120)
    .studyDate(LocalDate.now())
    .build();

// 수정할 때는 Builder가 아니라 메서드!
log.update("새 제목", "새 내용", Category.JPA);
```

### 규칙 3: equals()와 hashCode()는 id 기반

```java
@Entity
@EqualsAndHashCode(of = "id")  // Lombok: id 필드만으로 비교
public class StudyLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // ...
}
```

```
왜 id만으로 비교?
  → DB에서 PK가 같으면 같은 데이터다
  → title이 같다고 같은 StudyLog가 아니다
  → Set, Map에 넣을 때 id 기반으로 동작해야 한다
```

### 규칙 4: @ToString에서 연관관계 제외

```java
// ❌ 위험
@ToString
public class StudyLog {
    @ManyToOne
    private Member member;  // toString() 호출 시 member도 로딩 → 무한 루프 위험!
}

// ✅ 안전
@ToString(exclude = "member")
public class StudyLog {
    @ManyToOne
    private Member member;
}
```

> 이건 24번(연관 관계 매핑)에서 자세히 다루지만, 처음부터 습관 들이자.

---

## 8. JdbcTemplate → JPA 비교 🟡

### 같은 CRUD를 두 가지 방식으로 비교해보자

#### 저장 (Create)

```java
// JdbcTemplate
public StudyLog save(StudyLog log) {
    String sql = "INSERT INTO study_log (title, content, category, study_time, study_date, created_at) "
               + "VALUES (?, ?, ?, ?, ?, ?)";
    KeyHolder keyHolder = new GeneratedKeyHolder();
    jdbcTemplate.update(con -> {
        PreparedStatement ps = con.prepareStatement(sql, new String[]{"id"});
        ps.setString(1, log.getTitle());
        ps.setString(2, log.getContent());
        ps.setString(3, log.getCategory().name());
        ps.setInt(4, log.getStudyTime());
        ps.setDate(5, Date.valueOf(log.getStudyDate()));
        ps.setTimestamp(6, Timestamp.valueOf(log.getCreatedAt()));
        return ps;
    }, keyHolder);
    log.setId(keyHolder.getKey().longValue());
    return log;
}

// JPA
studyLogRepository.save(log);  // 끝! 😎
```

#### 단건 조회 (Read)

```java
// JdbcTemplate
public Optional<StudyLog> findById(Long id) {
    String sql = "SELECT * FROM study_log WHERE id = ?";
    return jdbcTemplate.query(sql, (rs, rowNum) -> {
        StudyLog log = new StudyLog();
        log.setId(rs.getLong("id"));
        log.setTitle(rs.getString("title"));
        log.setContent(rs.getString("content"));
        log.setCategory(Category.valueOf(rs.getString("category")));
        log.setStudyTime(rs.getInt("study_time"));
        log.setStudyDate(rs.getDate("study_date").toLocalDate());
        log.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return log;
    }, id).stream().findFirst();
}

// JPA
studyLogRepository.findById(id);  // 끝! 😎
```

#### 수정 (Update)

```java
// JdbcTemplate
public void update(Long id, String title, String content) {
    String sql = "UPDATE study_log SET title = ?, content = ?, updated_at = ? WHERE id = ?";
    jdbcTemplate.update(sql, title, content, Timestamp.valueOf(LocalDateTime.now()), id);
}

// JPA — SQL 작성 없이!
StudyLog log = studyLogRepository.findById(id).orElseThrow();
log.update(title, content, category);
// → 트랜잭션 커밋 시 변경 사항을 감지해서 UPDATE SQL이 자동 실행된다 (Dirty Checking)
// → save()를 다시 호출할 필요도 없다!
```

#### 삭제 (Delete)

```java
// JdbcTemplate
public void delete(Long id) {
    String sql = "DELETE FROM study_log WHERE id = ?";
    jdbcTemplate.update(sql, id);
}

// JPA
studyLogRepository.deleteById(id);  // 끝!
```

### 비교 요약

```
┌──────────────────┬──────────────────────┬──────────────────┐
│                  │ JdbcTemplate         │ JPA              │
├──────────────────┼──────────────────────┼──────────────────┤
│ SQL 작성         │ 직접 문자열로 작성     │ 자동 생성         │
│ 매핑 코드         │ rs.getString() 노가다 │ 자동 매핑         │
│ 타입 변환         │ 개발자가 직접         │ 자동              │
│ 컬럼 추가 시      │ 모든 SQL 수정        │ 필드 추가만 하면 됨│
│ 수정(UPDATE)     │ SQL 작성 필요        │ 필드 값만 바꾸면 됨│
│ 학습 곡선         │ 낮음 (SQL만 알면 됨)  │ 높음 (개념 필요)  │
│ 복잡한 쿼리       │ SQL 자유도 높음      │ JPQL/QueryDSL    │
└──────────────────┴──────────────────────┴──────────────────┘
```

> 🟡 **JdbcTemplate이 나쁜 건 아니다.** 단순하고 직관적이다. 하지만 테이블이 많아지고 연관관계가 복잡해지면 코드량이 폭발한다. JPA는 그 반복 코드를 줄여주는 도구다.

---

## 9. 실전 Entity 만들기 — 학습 일지 서비스 🔴

### 19번에서 설계한 ERD를 Entity로 변환하자

19번에서 설계한 학습 일지 서비스:

```
member ──||──────<○── study_log
member ──||──────<○── comment
study_log ──||───<○── comment
study_log ──<○───<○── tag (중간: study_log_tag)
```

#### BaseEntity (가장 먼저 만든다!)

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
public abstract class BaseEntity {

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

#### Member Entity

```java
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "member")
public class Member extends BaseEntity {   // ← BaseEntity 상속!

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    // createdAt, updatedAt은 BaseEntity에서 자동!

    @Builder
    public Member(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }
}
```

#### StudyLog Entity

```java
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "study_log")
public class StudyLog extends BaseEntity {   // ← BaseEntity 상속!

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

    // createdAt, updatedAt은 BaseEntity에서 자동!

    // ⚠️ 연관관계(@ManyToOne 등)는 24번에서 추가한다
    // 지금은 FK를 직접 필드로 가진다
    @Column(nullable = false)
    private Long memberId;

    @Builder
    public StudyLog(String title, String content, Category category,
                    int studyTime, LocalDate studyDate, Long memberId) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.studyTime = studyTime;
        this.studyDate = studyDate;
        this.memberId = memberId;
    }

    public void update(String title, String content, Category category, int studyTime) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.studyTime = studyTime;
        // updatedAt? @LastModifiedDate가 자동 갱신!
    }
}
```

> 💡 **지금은 `@ManyToOne`을 안 쓰고 `Long memberId`로 FK를 직접 가진다.** 연관관계 매핑은 24번에서 배운다. 한 번에 다 하면 머리 터진다. 😅

---

## 10. Repository 맛보기 🔴

### JpaRepository 인터페이스

```java
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {
    // 이것만으로 기본 CRUD가 전부 제공된다!
}
```

```
JpaRepository<StudyLog, Long>
                 ↑          ↑
           Entity 타입    PK 타입
```

### 제공되는 메서드들

```java
// 저장
StudyLog saved = repository.save(studyLog);

// 단건 조회
Optional<StudyLog> found = repository.findById(1L);

// 전체 조회
List<StudyLog> all = repository.findAll();

// 삭제
repository.deleteById(1L);
repository.delete(studyLog);

// 존재 확인
boolean exists = repository.existsById(1L);

// 개수
long count = repository.count();
```

> 💡 이 메서드들의 내부 동작(영속성 컨텍스트, 1차 캐시 등)은 21번에서 자세히 배운다. 지금은 "이렇게 쓰면 된다"만 알면 OK.

### Service 계층에서 사용

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyLogService {

    private final StudyLogRepository studyLogRepository;

    // 저장
    @Transactional
    public StudyLogResponse create(StudyLogCreateRequest request) {
        StudyLog studyLog = StudyLog.builder()
            .title(request.getTitle())
            .content(request.getContent())
            .category(request.getCategory())
            .studyTime(request.getStudyTime())
            .studyDate(request.getStudyDate())
            .memberId(request.getMemberId())
            .build();

        StudyLog saved = studyLogRepository.save(studyLog);
        return StudyLogResponse.from(saved);
    }

    // 단건 조회
    public StudyLogResponse findById(Long id) {
        StudyLog studyLog = studyLogRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("학습 일지를 찾을 수 없습니다. id=" + id));
        return StudyLogResponse.from(studyLog);
    }

    // 수정
    @Transactional
    public StudyLogResponse update(Long id, StudyLogUpdateRequest request) {
        StudyLog studyLog = studyLogRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("학습 일지를 찾을 수 없습니다. id=" + id));

        studyLog.update(
            request.getTitle(),
            request.getContent(),
            request.getCategory(),
            request.getStudyTime()
        );
        // save() 안 불러도 된다! Dirty Checking이 자동으로 UPDATE 해줌
        return StudyLogResponse.from(studyLog);
    }

    // 삭제
    @Transactional
    public void delete(Long id) {
        if (!studyLogRepository.existsById(id)) {
            throw new EntityNotFoundException("학습 일지를 찾을 수 없습니다. id=" + id);
        }
        studyLogRepository.deleteById(id);
    }
}
```

> 🔴 **수정 시 `save()`를 다시 호출하지 않아도 된다!** 이게 JPA의 핵심 기능인 **Dirty Checking**(변경 감지)이다. 21번에서 자세히 배운다.

---

## 11. 자주 쓰는 추가 어노테이션 🟡

### @CreatedDate, @LastModifiedDate — 자동 시간 기록

```java
@Entity
@EntityListeners(AuditingEntityListener.class)  // ← 이거 추가!
public class StudyLog {

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

```java
// Application 클래스에 활성화 필요
@SpringBootApplication
@EnableJpaAuditing      // ← 이거 추가!
public class Application { ... }
```

> 이렇게 하면 `createdAt`과 `updatedAt`을 직접 set하지 않아도 자동으로 채워진다!

### BaseEntity — 실무 필수 패턴 🔴

모든 Entity에 `createdAt`, `updatedAt`이 필요하다. 매번 복붙하면 귀찮으니까 **공통 부모 클래스**로 뽑는다.

```java
@MappedSuperclass   // "이건 테이블이 아니라, 자식에게 필드만 물려주는 클래스야"
@EntityListeners(AuditingEntityListener.class)
@Getter
public abstract class BaseEntity {

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

```
@MappedSuperclass가 뭔데?

비유: 유전자
  → 부모의 유전자(createdAt, updatedAt)가 자식에게 전달된다
  → 하지만 "부모"라는 별도의 사람(테이블)이 생기는 건 아니다
  → BaseEntity 테이블은 안 생긴다! 필드만 상속될 뿐.

vs @Entity 상속(@Inheritance):
  → 부모 테이블이 실제로 생긴다
  → 목적이 다르다 (이건 24번에서 배움)
```

이제 모든 Entity가 상속만 하면 끝이다:

```java
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StudyLog extends BaseEntity {   // ← 상속!

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    // ... createdAt, updatedAt은 BaseEntity에서 자동으로 가져온다!

    public void update(String title) {
        this.title = title;
        // updatedAt? 안 써도 된다. @LastModifiedDate가 자동 갱신!
    }
}

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member extends BaseEntity {     // ← 상속!

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    // ... 역시 createdAt, updatedAt이 자동으로 있다!
}
```

```
결과:
  ✅ 모든 Entity에 createdAt, updatedAt이 자동으로 들어간다
  ✅ 코드 중복 없음
  ✅ 시간 기록 까먹을 일 없음
  ✅ 나중에 createdBy(작성자) 같은 필드를 추가할 때 BaseEntity만 수정하면 됨
```

> 🔴 **실무에서 BaseEntity가 없는 프로젝트는 거의 없다.** 프로젝트 시작할 때 가장 먼저 만드는 클래스 중 하나다.

### @Lob — 대용량 데이터

```java
@Lob
private String content;      // → CLOB (텍스트)

@Lob
private byte[] image;        // → BLOB (바이너리)
```

### @Transient — DB에 저장하지 않는 필드

```java
@Transient
private int tempCalculation;  // DB 컬럼으로 매핑되지 않음

// 비즈니스 로직에서만 사용하는 임시 값
```

### @PrePersist, @PreUpdate — 엔티티 콜백

```java
@PrePersist   // INSERT 되기 전에 실행
public void prePersist() {
    this.createdAt = LocalDateTime.now();
}

@PreUpdate    // UPDATE 되기 전에 실행
public void preUpdate() {
    this.updatedAt = LocalDateTime.now();
}
```

> @CreatedDate 대신 이 방식을 쓸 수도 있다. 취향 차이.

---

## 12. 실습: 학습 일지 API를 JPA로 전환하기

### 미션: Phase 2에서 만든 학습 일지 API를 JPA로 바꿔보자

**체크리스트:**

- [ ] `build.gradle`에 `spring-boot-starter-data-jpa` + MySQL 드라이버 추가
- [ ] `application.yml`에 datasource + JPA 설정 추가
- [ ] `StudyLog` Entity 클래스 작성 (@Entity, @Id, @GeneratedValue 등)
- [ ] `Category` enum 작성 + @Enumerated(EnumType.STRING)
- [ ] `StudyLogRepository` 인터페이스 작성 (JpaRepository 상속)
- [ ] `StudyLogService`에서 Repository 사용하도록 수정
- [ ] Docker MySQL 실행 후 애플리케이션 시작해서 테이블 자동 생성 확인
- [ ] Postman/Swagger로 CRUD 테스트

<details>
<summary>힌트: 막히면 펼쳐보기</summary>

**1. Docker MySQL 실행 (17번에서 이미 했으면 생략)**

```bash
docker run --name study-mysql -e MYSQL_ROOT_PASSWORD=1234 -e MYSQL_DATABASE=study_db -p 3306:3306 -d mysql:8.0
```

**2. ddl-auto: create로 설정하면 Entity 기반으로 테이블이 자동 생성된다.**

```
콘솔에 이런 로그가 보이면 성공:
Hibernate: drop table if exists study_log
Hibernate: create table study_log (id bigint not null auto_increment, ...)
```

**3. 저장 테스트 — Postman에서 POST 요청**

```json
POST /api/study-logs
{
  "title": "JPA 기초 학습",
  "content": "Entity 매핑을 배웠다",
  "category": "JPA",
  "studyTime": 120,
  "studyDate": "2026-03-21",
  "memberId": 1
}
```

</details>

---

## 13. 면접 대비 🔴🟡

### 🔴 필수 — 이것만은 반드시 답할 수 있어야 한다

**Q1: ORM이 뭔가요?**

> Object Relational Mapping의 약자로, 객체와 관계형 데이터베이스의 테이블을 자동으로 매핑해주는 기술입니다. SQL을 직접 작성하지 않고도 객체를 통해 DB를 조작할 수 있게 해줍니다.

**Q2: JPA, Hibernate, Spring Data JPA의 차이점은?**

> JPA는 자바 ORM **표준 인터페이스**(규격서)이고, Hibernate는 JPA의 대표적인 **구현체**입니다. Spring Data JPA는 Hibernate 위에서 Repository 패턴을 자동화해주는 **Spring의 편의 모듈**입니다.

**Q3: 패러다임 불일치 5가지를 설명해주세요.**

> 상속, 연관관계 방향, 객체 그래프 탐색, 동일성 비교, 데이터 타입의 차이입니다. Java는 상속/참조/자유 탐색이 가능하지만, DB는 테이블/FK/SQL 범위 제한이라는 구조적 차이가 있고, ORM이 이를 자동으로 변환해줍니다.

**Q4: @Enumerated에서 EnumType.STRING을 써야 하는 이유는?**

> ORDINAL은 enum의 순서(0, 1, 2)를 저장하는데, enum에 값이 추가/삭제되면 순서가 바뀌어 기존 데이터가 잘못된 값을 가리키게 됩니다. STRING은 enum의 이름을 저장하므로 순서 변경에 안전합니다.

**Q5: Entity에 기본 생성자가 필요한 이유는?**

> JPA(Hibernate)가 DB에서 조회한 데이터를 객체로 만들 때 **리플렉션**을 사용하기 때문입니다. 리플렉션은 기본 생성자를 통해 객체를 먼저 생성한 후, 필드 값을 채워넣습니다.

**Q6: ddl-auto를 운영 환경에서 어떻게 설정하나요?**

> `validate` 또는 `none`으로 설정합니다. 운영 DB의 스키마 변경은 Flyway나 Liquibase 같은 **마이그레이션 도구**로 관리합니다. `create`나 `update`는 데이터 손실 위험이 있어 운영에서 사용하면 안 됩니다.

### 🟡 개념만 — 물어보면 설명할 수 있으면 OK

**Q7: Setter를 쓰지 않는 이유는?**

> Setter는 어디서든 아무 필드나 바꿀 수 있어 **변경 의도가 불명확**합니다. 대신 `update()`, `cancel()` 같은 **의미 있는 메서드**를 만들면 비즈니스 로직과 검증을 한 곳에서 관리할 수 있습니다.

**Q8: JPA의 Dirty Checking이란?**

> 영속성 컨텍스트가 관리하는 Entity의 필드 값이 변경되면, 트랜잭션 커밋 시점에 **변경 사항을 자동으로 감지**하여 UPDATE SQL을 실행하는 기능입니다. 별도로 save()를 호출할 필요가 없습니다. (21번에서 상세히 다룸)

**Q9: @GeneratedValue의 IDENTITY와 SEQUENCE 전략의 차이는?**

> IDENTITY는 DB의 AUTO_INCREMENT를 사용하며 INSERT 후에 id를 알 수 있습니다. SEQUENCE는 DB 시퀀스에서 id를 미리 받아와 INSERT 전에 id를 알 수 있어 **JDBC 배치 처리**에 유리합니다. MySQL은 IDENTITY, PostgreSQL은 SEQUENCE를 주로 사용합니다.

---

## 14. 핵심 요약

```
┌────────────────────────────────────────────────────┐
│             JPA 기초 — ORM과 Entity 요약             │
├────────────────────────────────────────────────────┤
│                                                    │
│  🎯 ORM이란                                        │
│    Java 객체 ↔ DB 테이블 자동 매핑                   │
│    SQL 직접 작성 → 어노테이션 선언으로 전환            │
│                                                    │
│  🏗️ 계층 구조                                       │
│    Spring Data JPA → Hibernate → JPA → JDBC        │
│                                                    │
│  ⚡ 패러다임 불일치 5가지                              │
│    상속 / 연관관계 방향 / 객체 그래프 탐색             │
│    동일성 비교 / 데이터 타입                          │
│                                                    │
│  📝 필수 어노테이션                                   │
│    @Entity: 테이블 매핑 선언                          │
│    @Id + @GeneratedValue: PK + 자동 생성             │
│    @Column: 컬럼 옵션 (nullable, length 등)          │
│    @Enumerated(EnumType.STRING): enum 매핑 (필수!)   │
│    @Table: 테이블명 지정                              │
│                                                    │
│  🔒 Entity 설계 규칙                                 │
│    - Setter 금지 → 의미 있는 메서드 사용              │
│    - 기본 생성자 PROTECTED                           │
│    - @Builder는 생성 시에만                           │
│    - equals/hashCode는 id 기반                      │
│                                                    │
│  ⚠️ ddl-auto 설정                                   │
│    개발: create/update                              │
│    운영: validate/none + Flyway                     │
│                                                    │
│  🔗 다음 단계 (21번 JPA 동작 원리)                    │
│    영속성 컨텍스트, 1차 캐시, Dirty Checking,         │
│    쓰기 지연 — JPA가 내부에서 어떻게 돌아가는지 배운다  │
│                                                    │
└────────────────────────────────────────────────────┘
```
