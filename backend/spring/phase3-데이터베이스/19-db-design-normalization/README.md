# 19. DB 모델링과 정규화 — "테이블을 어떤 기준으로 나눌까?"

> **키워드**: `ERD` `엔티티` `관계` `카디널리티` `1NF` `2NF` `3NF` `반정규화` `테이블 설계`

---

## 핵심만 한 문장

**"A를 수정하면 B도 수정해야 하나?" → Yes면 테이블을 나눠야 한다. 이 기준이 정규화다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | ERD 기초, 1NF~3NF, 설계 실습 | 면접 단골 + 실무 매일 사용 |
| 🟡 이해 | BCNF, 반정규화 | 개념 이해하고 설명할 수 있으면 됨 |
| 🟢 참고 | 4NF/5NF | 존재만 알면 됨 |

> 💡 17번에서 "테이블을 왜 나누는가?"를 맛봤다. 이번에는 **어떤 기준으로** 나눠야 하는지를 배운다. JPA Entity 설계에 직접 쓰이는 지식이다.

---

## 1. DB 설계가 왜 중요한가? 🔴

### 비유: 옷장 정리

```
❌ 정리 안 된 옷장                    ✅ 정리된 옷장
┌──────────────────────┐             ┌──────┬──────┬──────┐
│ 양말+셔츠+바지+코트   │             │ 양말 │ 상의 │ 하의 │
│ 전부 한 칸에 쑤셔넣음  │             │      │      │      │
│ 양말 찾으려면 다 뒤짐  │             │ 바로 │ 바로 │ 바로 │
│ 같은게 여기저기 중복   │             │ 찾음 │ 찾음 │ 찾음 │
└──────────────────────┘             └──────┴──────┴──────┘
```

### 나쁜 설계 — 따라쳐보기

직접 느껴보자. MySQL에 접속해서 이 테이블을 만들어보자:

```sql
USE study_db;

-- 나쁜 설계: 모든 걸 한 테이블에 때려넣기
CREATE TABLE bad_order (
    order_id    BIGINT NOT NULL AUTO_INCREMENT,
    product     VARCHAR(100) NOT NULL,
    price       INT NOT NULL,
    customer    VARCHAR(50) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    address     VARCHAR(500) NOT NULL,
    PRIMARY KEY (order_id)
);

INSERT INTO bad_order (product, price, customer, email, address) VALUES
    ('키보드', 50000, '홍길동', 'hong@mail.com', '서울시 강남구'),
    ('마우스', 30000, '홍길동', 'hong@mail.com', '서울시 강남구'),
    ('모니터', 300000, '홍길동', 'hong@mail.com', '서울시 강남구'),
    ('키보드', 50000, '김철수', 'kim@mail.com', '부산시 해운대구');
```

**💻 결과:**

```
Query OK, 4 rows affected (0.01 sec)
```

확인:

```sql
SELECT * FROM bad_order;
```

**💻 결과:**

```
+----------+---------+--------+----------+---------------+----------------+
| order_id | product | price  | customer | email         | address        |
+----------+---------+--------+----------+---------------+----------------+
|        1 | 키보드  |  50000 | 홍길동   | hong@mail.com | 서울시 강남구  |
|        2 | 마우스  |  30000 | 홍길동   | hong@mail.com | 서울시 강남구  |
|        3 | 모니터  | 300000 | 홍길동   | hong@mail.com | 서울시 강남구  |
|        4 | 키보드  |  50000 | 김철수   | kim@mail.com  | 부산시 해운대구 |
+----------+---------+--------+----------+---------------+----------------+
```

**문제가 보이는가?**

| 문제 | 예시 |
|------|------|
| **데이터 중복** | 홍길동의 email, address가 3번 반복! |
| **수정 이상** | 홍길동 이메일 변경 → 3곳 다 수정해야 함 (한 곳 빠뜨리면?) |
| **삭제 이상** | 홍길동의 모니터 주문 취소 → 주문 삭제 시 고객 정보도 사라질 수 있음 |

**💻 따라쳐보기 — 수정 이상 직접 체험:**

```sql
-- 홍길동 이메일을 변경하는데 1건만 바꿔버리면?
UPDATE bad_order SET email = 'hong_new@mail.com' WHERE order_id = 1;

SELECT customer, email FROM bad_order WHERE customer = '홍길동';
```

**💻 결과:**

```
+----------+-------------------+
| customer | email             |
+----------+-------------------+
| 홍길동   | hong_new@mail.com |   ← 이건 바꿈
| 홍길동   | hong@mail.com     |   ← 이건 안 바꿈!
| 홍길동   | hong@mail.com     |   ← 이것도!
+----------+-------------------+
```

→ **같은 사람인데 이메일이 2개!** 이게 "수정 이상(Update Anomaly)"이다.

정리하자:

```sql
DROP TABLE bad_order;
```

> 💡 이런 문제를 없애는 과정이 **정규화**다.

---

## 2. ERD — 테이블 관계를 그림으로 🔴

### ERD란?

**E**ntity **R**elationship **D**iagram — 테이블 간 관계를 그림으로 그린 **설계도**.

코딩 전에 ERD를 먼저 그린다. 건축의 설계도와 같은 역할.

### 엔티티(Entity) = 테이블이 될 것들

"학습 일지 서비스"에서 엔티티를 찾으면:

| 엔티티 | 설명 |
|--------|------|
| **member** | 회원 |
| **study_log** | 학습 일지 |
| **comment** | 댓글 |
| **tag** | 태그 |

> 💡 엔티티 찾는 법: 시스템에서 **"관리해야 할 것"** 을 명사로 나열하면 된다.

### 관계(Relationship)와 카디널리티

| 관계 | 의미 | 비유 |
|------|------|------|
| **1:1** | 하나 대 하나 | 사람 ↔ 주민등록증 |
| **1:N** | 하나 대 여럿 | 회원 → 학습 일지 (한 명이 여러 개 작성) |
| **N:M** | 여럿 대 여럿 | 학습 일지 ↔ 태그 |

### ERD 그림으로 보기

```
member                          study_log
┌──────────┐     1 : N     ┌──────────────┐
│ id (PK)  │──────────────→│ id (PK)      │
│ name     │               │ title        │
│ email    │               │ content      │
└──────────┘               │ member_id(FK)│
                           └──────────────┘

"회원 1명이 학습 일지 여러 개를 작성한다"
```

### 카디널리티 표기 (Crow's Foot)

```
member ──||────────<○── study_log
          필수1개        0개이상

읽는 법: "member 1명은 study_log를 0개 이상 가진다"
```

| 기호 | 의미 |
|------|------|
| `──||──` | 반드시 1개 (필수) |
| `──○──` | 0개 가능 (선택적) |
| `──<──` | 여러 개 가능 (Many) |

### N:M 관계 — 중간 테이블로 해결

학습 일지에 태그를 붙이고 싶다면:

```
study_log          study_log_tag           tag
┌──────────┐      ┌──────────────┐      ┌──────────┐
│ id (PK)  │─┐    │ study_log_id │    ┌─│ id (PK)  │
│ title    │ └───→│ tag_id       │←───┘ │ name     │
└──────────┘      └──────────────┘      └──────────┘

N:M → 중간 테이블 → 1:N + N:1로 분해됨!
```

### ERD 도구

| 도구 | 특징 |
|------|------|
| **dbdiagram.io** | 코드로 ERD 작성 (추천!) |
| ERDCloud | 한국어, 협업 가능 |
| IntelliJ Database Tools | DB 연결하면 자동 생성 |

---

## 3. 함수적 종속 — 정규화의 핵심 개념 🔴

### 비유: 주민번호를 알면 이름이 결정된다

```
주민번호 → 이름, 주소, 생년월일

"주민번호를 알면 나머지가 한 가지로 결정된다"
이게 함수적 종속(Functional Dependency)이다.
```

| 결정자 | 종속자 | 의미 |
|--------|--------|------|
| `order_id` | product, price, customer | 주문번호를 알면 나머지가 결정됨 |
| `member.id` | name, email | 회원 id를 알면 이름, 이메일이 결정됨 |
| `study_log.id` | title, content, category | 일지 id를 알면 제목, 내용이 결정됨 |

> 💡 정규화 = "결정자가 아닌 것에 종속된 컬럼을 분리하는 과정"

---

## 4. 정규화 — 따라쳐보기 🔴

### 4-1. 제1정규형 (1NF): 하나의 셀에 하나의 값

**❌ 위반:**

```sql
CREATE TABLE bad_1nf (
    id    BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    tags  VARCHAR(500) NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO bad_1nf (title, tags) VALUES
    ('Spring DI', 'spring, java, di'),
    ('SQL 기초', 'database, sql');

SELECT * FROM bad_1nf;
```

**💻 결과:**

```
+----+-----------+-------------------+
| id | title     | tags              |
+----+-----------+-------------------+
|  1 | Spring DI | spring, java, di  |  ← 하나의 셀에 값 3개!
|  2 | SQL 기초  | database, sql     |  ← 하나의 셀에 값 2개!
+----+-----------+-------------------+
```

문제: "spring 태그가 달린 일지"를 찾으려면?

```sql
-- LIKE로 찾아야 하고, 인덱스도 못 탄다
SELECT * FROM bad_1nf WHERE tags LIKE '%spring%';
```

**✅ 해결: 태그를 별도 테이블로 분리**

```sql
CREATE TABLE good_study_log (
    id    BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE study_log_tag (
    study_log_id BIGINT NOT NULL,
    tag          VARCHAR(50) NOT NULL,
    FOREIGN KEY (study_log_id) REFERENCES good_study_log(id)
);

INSERT INTO good_study_log (title) VALUES ('Spring DI'), ('SQL 기초');

INSERT INTO study_log_tag (study_log_id, tag) VALUES
    (1, 'spring'), (1, 'java'), (1, 'di'),
    (2, 'database'), (2, 'sql');

-- spring 태그 찾기: 깔끔!
SELECT g.title
FROM good_study_log g
JOIN study_log_tag t ON g.id = t.study_log_id
WHERE t.tag = 'spring';
```

**💻 결과:**

```
+-----------+
| title     |
+-----------+
| Spring DI |
+-----------+
```

정리:

```sql
DROP TABLE study_log_tag;
DROP TABLE good_study_log;
DROP TABLE bad_1nf;
```

> 💡 **1NF 규칙**: 하나의 셀에 하나의 값만! 여러 값이면 별도 테이블로 분리.

### 4-2. 제2정규형 (2NF): PK 전체에 종속

> 💡 **복합 PK**가 있을 때만 적용되는 규칙. 단일 PK면 자동으로 2NF를 만족한다.

**❌ 위반 예시:**

```
수강_테이블 (학생id, 과목id가 복합 PK)
+----------+-----------+-------------+-------+
| student_id | course_id | course_name | grade |
+----------+-----------+-------------+-------+
|     1      |    101    | Spring Boot |   A   |
|     2      |    101    | Spring Boot |   B   |  ← course_name이 중복!
+----------+-----------+-------------+-------+
```

`course_name`은 `course_id`만으로 결정된다 (student_id는 필요 없음).
→ PK 전체(student_id + course_id)가 아니라 **일부(course_id)에만 종속** → 2NF 위반!

**✅ 해결: course 테이블 분리**

```
course                  enrollment
+-----+-------------+  +----------+-----------+-------+
| id  | name        |  | student_id | course_id | grade |
| 101 | Spring Boot |  |     1      |    101    |   A   |
+-----+-------------+  |     2      |    101    |   B   |
                        +----------+-----------+-------+
```

→ course_name 중복이 사라졌다!

### 4-3. 제3정규형 (3NF): PK가 아닌 컬럼에 종속 금지

**❌ 위반 — 따라쳐보기:**

```sql
CREATE TABLE bad_3nf (
    id          BIGINT NOT NULL AUTO_INCREMENT,
    title       VARCHAR(200) NOT NULL,
    member_id   BIGINT NOT NULL,
    member_name VARCHAR(50) NOT NULL,
    member_email VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO bad_3nf (title, member_id, member_name, member_email) VALUES
    ('Spring DI', 1, '홍길동', 'hong@mail.com'),
    ('SQL 기초',  1, '홍길동', 'hong@mail.com'),
    ('JPA 입문',  2, '김철수', 'kim@mail.com');

SELECT * FROM bad_3nf;
```

**💻 결과:**

```
+----+-----------+-----------+-------------+--------------+
| id | title     | member_id | member_name | member_email |
+----+-----------+-----------+-------------+--------------+
|  1 | Spring DI |         1 | 홍길동      | hong@mail.com |
|  2 | SQL 기초  |         1 | 홍길동      | hong@mail.com |  ← 중복!
|  3 | JPA 입문  |         2 | 김철수      | kim@mail.com  |
+----+-----------+-----------+-------------+--------------+
```

`member_name`과 `member_email`은 `member_id`에 종속된다 (PK인 `id`가 아니라).
→ **이행적 종속** → 3NF 위반!

**✅ 해결: 17번에서 이미 했다!**

```
member (id, name, email)  +  study_log (id, title, member_id FK)
```

```sql
DROP TABLE bad_3nf;
```

> 💡 **우리가 17번에서 member + study_log로 나눈 것 자체가 3NF를 지킨 설계다!**

### 정규화 요약

| 정규형 | 한 줄 규칙 | 비유 |
|--------|-----------|------|
| **1NF** | 하나의 셀에 하나의 값 | 한 서랍에 한 종류만 |
| **2NF** | PK **전체**에 종속 (부분 종속 금지) | 복합키의 일부에만 걸리면 분리 |
| **3NF** | PK **아닌** 컬럼에 종속 금지 | member_name이 member_id에 종속? → 분리! |

---

## 5. BCNF (Boyce-Codd) 🟡

3NF를 더 엄격하게 만든 것. **모든 결정자가 PK여야 한다.**

```
❌ 3NF는 만족하지만 BCNF 위반:
교수가 과목을 결정하는데, 교수가 PK가 아닌 경우

실무에서 BCNF를 의식적으로 적용할 일은 드물다.
3NF까지 잘 지키면 대부분 자연스럽게 BCNF도 만족한다.
```

---

## 6. 반정규화 — 일부러 중복을 넣는 경우 🟡

### 반정규화란?

정규화로 테이블을 잘 나눴는데... JOIN이 너무 많아서 성능이 느려질 때, **일부러 중복을 허용**하는 것.

### 비유: 도서관 vs 내 책상

```
정규화 = 도서관:   모든 책이 주제별로 정리. 찾으러 가야 함 (JOIN)
반정규화 = 내 책상: 자주 보는 책을 복사해서 책상에 놓음 (중복이지만 빠름!)
```

### 반정규화 예시

```sql
-- 정규화된 구조: 게시글 목록에서 작성자 이름을 보려면 JOIN 필수
SELECT p.title, m.name
FROM post p
JOIN member m ON p.member_id = m.id;

-- 반정규화: 게시글 테이블에 작성자 이름을 중복 저장
-- 장점: JOIN 없이 바로 조회 가능
-- 단점: 작성자 이름 변경 시 여기도 업데이트해야 함
```

### 반정규화 판단 기준

| 조건 | 판단 |
|------|------|
| 조회가 압도적으로 많고, 조회 성능이 중요 | 반정규화 고려 |
| 중복 데이터가 자주 변경됨 | 반정규화 하지 마라 |
| JOIN 대상 테이블이 매우 큼 | 반정규화 고려 |

> 💡 **기본은 정규화다!** 반정규화는 **성능 문제가 실제로 발생했을 때** 하는 것이지, 처음부터 하는 게 아니다.

---

## 7. 진짜 중복 vs 가짜 중복 🔴

되게 중요한 개념인데, 많은 초보자가 헷갈린다.

### 진짜 중복: 분리해야 한다

```
주문 테이블:
| order_id | product | customer | customer_email |
|    1     | 키보드  | 홍길동   | hong@mail.com  |
|    2     | 마우스  | 홍길동   | hong@mail.com  |  ← 같은 사람이니 무조건 같음!

→ 홍길동의 email이 바뀌면 두 곳 다 바꿔야 한다
→ 진짜 중복! → customer 테이블로 분리
```

### 가짜 중복: 분리하면 안 된다

```
주문 테이블:
| order_id | product | price  | shipping_address |
|    1     | 키보드  | 50000  | 서울시 강남구     |
|    2     | 마우스  | 30000  | 서울시 강남구     |
|    3     | 모니터  | 300000 | 부산시 해운대구   |

→ 배송 주소가 같은 건 우연일 뿐!
→ 한 주문의 배송지를 바꿔도 다른 주문에 영향 없어야 한다
→ 가짜 중복! → 분리하면 안 됨
```

### 판단 기준

```
"A를 수정하면 B도 수정해야 하는가?"

Yes → 진짜 중복 → 분리!
No  → 가짜 중복 → 그대로 둬!
```

---

## 8. 테이블 네이밍 규칙 🟡

| 규칙 | 예시 |
|------|------|
| 테이블명: **snake_case, 소문자, 단수형** | `study_log`, `member` |
| 컬럼명: **snake_case, 소문자** | `study_date`, `member_id` |
| PK: `id` | 모든 테이블에 `id BIGINT AUTO_INCREMENT` |
| FK: `참조테이블_id` | `member_id`, `study_log_id` |
| 인덱스: `idx_테이블_컬럼` | `idx_study_log_category` |
| Boolean: `is_` 또는 `has_` 접두사 | `is_deleted`, `has_attachment` |

---

## 9. 설계 실습 — 따라쳐보기 🔴

### 미니 프로젝트: 학습 일지 서비스 ERD

요구사항:
1. 회원이 있다 (이름, 이메일)
2. 회원은 학습 일지를 작성한다 (제목, 내용, 카테고리, 학습일)
3. 학습 일지에 댓글을 달 수 있다 (내용, 작성자)
4. 학습 일지에 태그를 붙일 수 있다 (여러 개)

**Step 1: 엔티티 찾기**

"관리해야 할 것"을 명사로 나열:

```
member, study_log, comment, tag
```

**Step 2: 관계 정하기**

| 관계 | 타입 | 이유 |
|------|------|------|
| member → study_log | 1:N | 한 명이 여러 일지 작성 |
| member → comment | 1:N | 한 명이 여러 댓글 작성 |
| study_log → comment | 1:N | 한 일지에 여러 댓글 |
| study_log ↔ tag | N:M | 한 일지에 태그 여러 개, 한 태그에 일지 여러 개 |

**Step 3: ERD**

```
member                 study_log              comment
┌──────────┐     1:N  ┌──────────────┐  1:N  ┌──────────────┐
│ id (PK)  │─────────→│ id (PK)      │←──────│ id (PK)      │
│ name     │          │ title        │       │ content      │
│ email    │─┐        │ content      │       │ study_log_id │
└──────────┘ │        │ category     │       │ member_id    │
             │        │ member_id(FK)│       └──────────────┘
             │        └──────────────┘
             │               │
             │               │ N:M (중간 테이블)
             │               ↓
             │        study_log_tag          tag
             │        ┌──────────────┐      ┌──────────┐
             │        │ study_log_id │      │ id (PK)  │
             │        │ tag_id       │←─────│ name     │
             │        └──────────────┘      └──────────┘
             └──────────────────────→ comment.member_id(FK)
```

**Step 4: SQL로 만들기 — 따라쳐보기**

```sql
USE study_db;

-- 기존 테이블 정리
DROP TABLE IF EXISTS study_log_tag;
DROP TABLE IF EXISTS comment;
DROP TABLE IF EXISTS tag;
DROP TABLE IF EXISTS study_log;
DROP TABLE IF EXISTS member;

-- 1. member
CREATE TABLE member (
    id    BIGINT       NOT NULL AUTO_INCREMENT,
    name  VARCHAR(50)  NOT NULL,
    email VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (email)
);

-- 2. study_log
CREATE TABLE study_log (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    title      VARCHAR(200) NOT NULL,
    content    TEXT         NOT NULL,
    category   VARCHAR(50)  NOT NULL,
    study_date DATE         NOT NULL,
    member_id  BIGINT       NOT NULL,
    created_at DATETIME     NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    FOREIGN KEY (member_id) REFERENCES member(id)
);

-- 3. comment
CREATE TABLE comment (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    content       VARCHAR(500) NOT NULL,
    study_log_id  BIGINT       NOT NULL,
    member_id     BIGINT       NOT NULL,
    created_at    DATETIME     NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    FOREIGN KEY (study_log_id) REFERENCES study_log(id),
    FOREIGN KEY (member_id) REFERENCES member(id)
);

-- 4. tag
CREATE TABLE tag (
    id   BIGINT      NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (name)
);

-- 5. study_log_tag (N:M 중간 테이블)
CREATE TABLE study_log_tag (
    study_log_id BIGINT NOT NULL,
    tag_id       BIGINT NOT NULL,
    PRIMARY KEY (study_log_id, tag_id),
    FOREIGN KEY (study_log_id) REFERENCES study_log(id),
    FOREIGN KEY (tag_id) REFERENCES tag(id)
);
```

**💻 결과 (각각):**

```
Query OK, 0 rows affected
```

확인:

```sql
SHOW TABLES;
```

**💻 결과:**

```
+--------------------+
| Tables_in_study_db |
+--------------------+
| comment            |
| member             |
| study_log          |
| study_log_tag      |
| tag                |
+--------------------+
5 rows in set (0.00 sec)
```

5개 테이블이 깔끔하게 만들어졌다!

**Step 5: 데이터 넣어서 확인**

```sql
INSERT INTO member (name, email) VALUES ('홍길동', 'hong@mail.com'), ('김철수', 'kim@mail.com');

INSERT INTO study_log (title, content, category, study_date, member_id) VALUES
    ('Spring DI', 'IoC 컨테이너 학습', 'SPRING', '2026-03-10', 1),
    ('SQL 기초', 'SELECT 학습', 'DATABASE', '2026-03-11', 1);

INSERT INTO tag (name) VALUES ('spring'), ('java'), ('database');

INSERT INTO study_log_tag (study_log_id, tag_id) VALUES
    (1, 1), (1, 2), (2, 3);

INSERT INTO comment (content, study_log_id, member_id) VALUES
    ('좋은 정리네요!', 1, 2);
```

**"Spring DI" 일지에 붙은 태그 조회:**

```sql
SELECT s.title, t.name AS tag
FROM study_log s
JOIN study_log_tag st ON s.id = st.study_log_id
JOIN tag t ON st.tag_id = t.id
WHERE s.id = 1;
```

**💻 결과:**

```
+-----------+--------+
| title     | tag    |
+-----------+--------+
| Spring DI | spring |
| Spring DI | java   |
+-----------+--------+
2 rows in set (0.00 sec)
```

N:M 관계가 중간 테이블을 통해 잘 작동한다!

---

## 10. 흔한 설계 실수 🟡

| 실수 | 왜 나쁜가 | 해결 |
|------|-----------|------|
| 모든 걸 한 테이블에 | 중복, 수정/삭제 이상 | 정규화 (테이블 분리) |
| 컬럼에 `,`로 여러 값 | 검색 불가, 인덱스 못 탐 | 별도 테이블 (1NF) |
| PK를 VARCHAR로 | 성능 저하, JOIN 느림 | BIGINT AUTO_INCREMENT |
| FK 없이 id만 저장 | 잘못된 값 허용됨 | FK 제약 조건 추가 |
| 테이블명 대문자/복수형 | 혼란, 컨벤션 불통일 | snake_case, 단수형 |

---

## 11. 실습 문제

### 문제: 온라인 쇼핑몰 ERD

요구사항:
1. 고객이 있다 (이름, 이메일, 주소)
2. 상품이 있다 (이름, 가격, 카테고리)
3. 고객이 주문한다 (주문일, 총금액)
4. 하나의 주문에 여러 상품이 담긴다 (상품별 수량)

<details>
<summary>정답 보기</summary>

```sql
-- 1. customer
CREATE TABLE customer (
    id      BIGINT NOT NULL AUTO_INCREMENT,
    name    VARCHAR(50) NOT NULL,
    email   VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (email)
);

-- 2. product
CREATE TABLE product (
    id       BIGINT NOT NULL AUTO_INCREMENT,
    name     VARCHAR(200) NOT NULL,
    price    INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    PRIMARY KEY (id)
);

-- 3. orders (order는 예약어라 orders 사용)
CREATE TABLE orders (
    id          BIGINT NOT NULL AUTO_INCREMENT,
    customer_id BIGINT NOT NULL,
    order_date  DATE NOT NULL,
    total_price INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- 4. order_item (주문-상품 중간 테이블)
CREATE TABLE order_item (
    id        BIGINT NOT NULL AUTO_INCREMENT,
    order_id  BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity  INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);
```

ERD:
```
customer → orders → order_item ← product
  1:N        1:N                    N:1
```

</details>

---

## 12. 면접 대비 🔴

| 질문 | 핵심 답변 |
|------|-----------|
| 정규화란? | 데이터 중복 제거 + 무결성 보장을 위해 테이블을 분리하는 과정 |
| 1NF~3NF 설명해보세요 | 1NF: 원자값, 2NF: 부분 종속 제거, 3NF: 이행 종속 제거 |
| 반정규화란? | 조회 성능을 위해 의도적으로 중복을 허용하는 것. 기본은 정규화를 한 후, 성능 문제가 생겼을 때 적용 |
| N:M 관계 구현 방법? | 중간 테이블을 만들어 1:N + N:1로 분해 |
| 진짜 중복 vs 가짜 중복? | 진짜: A 바꾸면 B도 바꿔야 함 → 분리. 가짜: 값이 같은 건 우연 → 분리하지 않음 |
| ERD를 왜 그리는가? | 코딩 전에 테이블 관계를 시각화해서 설계 오류를 미리 잡기 위해 |

---

## 13. 핵심 요약

```
📌 이번에 배운 것:

1. ERD = 테이블 관계를 그림으로 그린 설계도
2. 관계: 1:1, 1:N, N:M (N:M은 중간 테이블로 해결)
3. 정규화 = 중복 제거를 위해 테이블을 분리하는 과정
   - 1NF: 하나의 셀에 하나의 값
   - 2NF: PK 전체에 종속 (복합PK일 때)
   - 3NF: PK가 아닌 컬럼에 종속 금지
4. 반정규화 = 성능을 위해 일부러 중복 허용 (나중에!)
5. 진짜 중복(→분리) vs 가짜 중복(→그대로)
6. 네이밍: snake_case, 단수형, FK는 참조테이블_id
```
