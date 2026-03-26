# 20. JPA 기초 — ORM 개념과 Entity

> **키워드**: `ORM` `JPA` `Hibernate` `@Entity` `@Id` `@GeneratedValue` `@Column` `@Enumerated` `ddl-auto`

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | ORM 개념, Entity 작성, 프로젝트 따라쳐보기 | 면접 + 실무 매일 사용 |
| 🟡 이해 | 패러다임 불일치, ddl-auto 전략 | 개념 이해하면 됨 |
| 🟢 참고 | JPA vs Hibernate 계층 구조 | 있다는 것만 알면 됨 |

> 💡 17~19번에서는 SQL을 직접 썼다. 이번부터는 **Java 코드로 DB를 다루는 방법**을 배운다. SQL을 직접 안 써도 된다!

---

## 1. SQL을 직접 쓰는 건 왜 피곤한가? 🔴

```java
// ❌ SQL 직접 작성 (피곤한 방식)
public StudyLog findById(Long id) {
    String sql = "SELECT id, title, content, category FROM study_log WHERE id = ?";
    return jdbcTemplate.queryForObject(sql, new Object[]{id}, (rs, rowNum) -> {
        StudyLog log = new StudyLog();
        log.setId(rs.getLong("id"));
        log.setTitle(rs.getString("title"));      // 컬럼 하나하나 매핑
        log.setContent(rs.getString("content"));
        return log;
    });
}
```

**문제:**
- 컬럼 추가 → SQL 수정 + Java 매핑 수정 = **2곳 수정**
- 컬럼명 오타 → **런타임 에러** (컴파일에서 안 잡힘)
- CRUD마다 반복 코드

```java
// ✅ JPA (편한 방식)
public StudyLog findById(Long id) {
    return studyLogRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("없는 일지"));
}
```

→ SQL 안 쓰고, 매핑 자동, 컬럼 추가해도 Entity만 수정하면 끝!

---

## 2. ORM이란? 🔴

### 비유

```
번역기:  한국어 ↔ 영어 자동 번역
ORM:     Java 객체 ↔ DB 테이블 자동 변환
```

### 한 줄 정의

**O**bject **R**elational **M**apping — Java **객체**와 DB **테이블**을 자동으로 연결해주는 기술.

```
Java:  studyLogRepository.save(new StudyLog("Spring DI", "SPRING"));
       ↕ ORM이 자동 변환
SQL:   INSERT INTO study_log (title, category) VALUES ('Spring DI', 'SPRING');
```

### JPA / Hibernate / Spring Data JPA 🟢

```
┌───────────────────────────────────┐
│     Spring Data JPA               │  ← 가장 편리 (우리가 쓰는 것)
│  ┌───────────────────────────┐    │
│  │     JPA (표준 인터페이스)   │    │  ← 규격서 (Java 공식)
│  │  ┌───────────────────┐    │    │
│  │  │   Hibernate        │    │    │  ← 실제 구현체
│  │  └───────────────────┘    │    │
│  └───────────────────────────┘    │
└───────────────────────────────────┘
```

| 이름 | 역할 | 비유 |
|------|------|------|
| **JPA** | 표준 **규격서** | USB 규격 |
| **Hibernate** | JPA **구현체** | 삼성 USB 케이블 |
| **Spring Data JPA** | 편의 계층 | USB 어댑터 |

---

## 3. 패러다임 불일치 🟡

Java(객체)와 DB(테이블)의 생각 방식이 다르다:

| 비교 | Java | DB |
|------|------|-----|
| 상속 | `Admin extends Member` | 상속 없음 |
| 연관관계 | `member.getStudyLogs()` | FK + JOIN |
| 데이터 타입 | Enum, List | VARCHAR, INT |
| 탐색 | 점(.)으로 탐색 | 매번 JOIN |

> 💡 이 차이를 ORM이 자동으로 메꿔준다.

---

## 4. 프로젝트 만들기 — 따라쳐보기 🔴

### Step 1: Spring Initializr

[start.spring.io](https://start.spring.io/) 에서:

| 항목 | 값 |
|------|-----|
| Project | Gradle - Groovy |
| Language | Java |
| Spring Boot | 3.x.x (최신) |
| Group | com.study |
| Artifact | jpa-practice |
| Dependencies | **Spring Web**, **Spring Data JPA**, **MySQL Driver**, **Lombok** |

→ GENERATE → 압축 해제 → IntelliJ로 열기

### Step 2: application.yml

`src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/study_db
    username: root
    password: 1234
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: create
    show-sql: true
    properties:
      hibernate:
        format_sql: true
```

| 설정 | 의미 |
|------|------|
| `url` | 17번에서 만든 Docker MySQL의 study_db |
| `ddl-auto: create` | 서버 시작 시 Entity 기반으로 테이블 자동 생성 |
| `show-sql: true` | 실행 SQL을 콘솔에 출력 |
| `format_sql: true` | SQL 보기 좋게 포맷팅 |

### Step 3: Entity 만들기

`src/main/java/com/study/jpapractice/entity/Category.java`:

```java
package com.study.jpapractice.entity;

public enum Category {
    SPRING, DATABASE, JPA, REACT, DEVOPS
}
```

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
}
```

**💻 어노테이션 해석:**

| 어노테이션 | SQL 대응 | 의미 |
|-----------|---------|------|
| `@Entity` | `CREATE TABLE` | "이 클래스는 테이블이다" |
| `@Table(name = "member")` | 테이블 이름 | 생략 시 클래스명 |
| `@Id` | `PRIMARY KEY` | PK |
| `@GeneratedValue(IDENTITY)` | `AUTO_INCREMENT` | 자동 증가 |
| `@Column(nullable = false)` | `NOT NULL` | 필수값 |
| `@Column(unique = true)` | `UNIQUE` | 중복 불가 |

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
    private LocalDate studyDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public StudyLog(String title, String content, Category category, LocalDate studyDate) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.studyDate = studyDate;
    }
}
```

**새로 등장한 것:**

| 어노테이션 | 의미 |
|-----------|------|
| `@Enumerated(EnumType.STRING)` | Enum을 **문자열**로 저장 ("SPRING") |
| `@Column(columnDefinition = "TEXT")` | 컬럼 타입 직접 지정 |
| `@PrePersist` | INSERT 직전에 자동 실행 |

> ⚠️ `EnumType.STRING` 필수! `ORDINAL`(기본값)은 숫자로 저장 → Enum 순서 바뀌면 **데이터 꼬임**

### Step 4: 서버 시작 — 콘솔 확인

**💻 콘솔 출력:**

```sql
Hibernate:
    create table member (
        id bigint not null auto_increment,
        email varchar(255) not null,
        name varchar(50) not null,
        primary key (id)
    ) engine=InnoDB
Hibernate:
    create table study_log (
        id bigint not null auto_increment,
        category varchar(50) not null,
        content TEXT not null,
        created_at datetime(6) not null,
        study_date date not null,
        title varchar(200) not null,
        primary key (id)
    ) engine=InnoDB
```

→ Entity 클래스를 보고 **테이블을 자동 생성!** Java만 썼는데 SQL이 자동으로 나왔다.

### Step 5: Repository 만들기

```java
// MemberRepository.java
package com.study.jpapractice.repository;

import com.study.jpapractice.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {
}
```

```java
// StudyLogRepository.java
package com.study.jpapractice.repository;

import com.study.jpapractice.entity.StudyLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {
}
```

### Step 6: 데이터 초기화 + API

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
        memberRepository.save(Member.builder()
            .name("홍길동").email("hong@mail.com").build());

        studyLogRepository.save(StudyLog.builder()
            .title("Spring DI 학습")
            .content("IoC 컨테이너가 객체를 관리한다")
            .category(Category.SPRING)
            .studyDate(LocalDate.of(2026, 3, 10))
            .build());

        System.out.println("=== 데이터 초기화 완료 ===");
        System.out.println("회원: " + memberRepository.count() + "명");
        System.out.println("일지: " + studyLogRepository.count() + "건");
    }
}
```

`src/main/java/com/study/jpapractice/controller/MemberController.java`:

```java
package com.study.jpapractice.controller;

import com.study.jpapractice.entity.Member;
import com.study.jpapractice.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberRepository memberRepository;

    @GetMapping
    public List<Member> findAll() {
        return memberRepository.findAll();
    }
}
```

**💻 서버 시작 콘솔:**

```sql
Hibernate:
    insert into member (email, name) values (?, ?)
Hibernate:
    insert into study_log (category, content, created_at, study_date, title) values (?, ?, ?, ?, ?)
=== 데이터 초기화 완료 ===
회원: 1명
일지: 1건
```

**💻 브라우저: `http://localhost:8080/members`**

```json
[
  {
    "id": 1,
    "name": "홍길동",
    "email": "hong@mail.com"
  }
]
```

**💻 이때 콘솔:**

```sql
Hibernate:
    select m1_0.id, m1_0.email, m1_0.name
    from member m1_0
```

→ `findAll()` 한 줄이 `SELECT * FROM member`로 자동 변환!

---

## 5. ddl-auto 전략 🟡

| 값 | 동작 | 사용 시점 |
|-----|------|----------|
| `create` | DROP + CREATE | 개발 초기 (지금) |
| `create-drop` | CREATE → 종료 시 DROP | 테스트 |
| `update` | 변경분만 ALTER | 개발 중 |
| `validate` | 검증만 | 스테이징/운영 |
| `none` | 아무것도 안 함 | **운영 서버** |

> ⚠️ 운영에서 `create`/`update` 쓰면 **데이터 날아감!** 운영은 `validate` 또는 `none`.

---

## 6. Entity 설계 규칙 🔴

```
✅ @NoArgsConstructor(access = PROTECTED) → JPA용 기본 생성자
✅ @Builder → 생성용 (Setter 대신)
✅ @Getter → 조회용
❌ @Setter → 사용 금지!
✅ 수정은 의미 있는 메서드로 (updateTitle, changePassword)
✅ Enum은 반드시 @Enumerated(EnumType.STRING)
```

```java
// ❌ Setter (어디서든 값 변경 가능 → 추적 불가)
studyLog.setTitle("새 제목");

// ✅ 의미 있는 메서드 (변경 이유가 명확)
studyLog.updateTitle("새 제목");
```

---

## 7. JPA 어노테이션 정리 🔴

| 어노테이션 | SQL 대응 | 의미 |
|-----------|---------|------|
| `@Entity` | `CREATE TABLE` | 테이블 매핑 |
| `@Table(name)` | 테이블 이름 | 생략 시 클래스명 |
| `@Id` | `PRIMARY KEY` | PK |
| `@GeneratedValue(IDENTITY)` | `AUTO_INCREMENT` | 자동 증가 |
| `@Column(nullable, length, unique)` | 제약 조건 | NOT NULL, VARCHAR, UNIQUE |
| `@Enumerated(STRING)` | VARCHAR | Enum 문자열 저장 |
| `@Transient` | — | DB 저장 안 함 |
| `@PrePersist` | — | INSERT 전 실행 |

---

## 8. 실습 문제

### 문제: Comment Entity 만들기

- id: 자동 증가 PK
- content: 최대 500자, 필수
- createdAt: 생성 시각 자동

<details>
<summary>정답 보기</summary>

```java
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String content;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public Comment(String content) {
        this.content = content;
    }
}
```

</details>

---

## 9. 면접 대비 🔴

| 질문 | 핵심 답변 |
|------|-----------|
| JPA란? | Java ORM 표준 인터페이스. 객체와 테이블을 자동 매핑 |
| JPA와 Hibernate 차이? | JPA = 표준(인터페이스), Hibernate = 구현체 |
| Entity에 기본 생성자가 필요한 이유? | JPA가 리플렉션으로 객체를 생성하기 때문 |
| @Enumerated(STRING) 왜 필수? | ORDINAL은 숫자 저장 → Enum 순서 변경 시 데이터 꼬임 |
| ddl-auto 운영에서 뭐 쓰나? | validate 또는 none |
| Entity에 Setter 왜 안 쓰나? | 어디서든 변경 가능 → 추적 불가. 의미 있는 메서드 사용 |

---

## 10. 핵심 요약

```
📌 이번에 배운 것:

1. ORM = Java 객체 ↔ DB 테이블 자동 변환
2. JPA = 표준, Hibernate = 구현체, Spring Data JPA = 편의 계층
3. @Entity → 클래스를 테이블로 매핑
4. @Id + @GeneratedValue(IDENTITY) = AUTO_INCREMENT PK
5. @Column으로 제약 조건 (nullable, length, unique)
6. @Enumerated(STRING) 필수!
7. ddl-auto: 개발=create, 운영=validate/none
8. Setter 금지 → Builder 생성, 의미 있는 메서드로 수정
9. show-sql: true로 JPA가 만든 SQL을 콘솔에서 확인 가능
```
