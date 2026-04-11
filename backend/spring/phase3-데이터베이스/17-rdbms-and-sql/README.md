# 17. RDBMS 기초와 SQL — "데이터를 영구 저장하기"

> **키워드**: `RDBMS` `MySQL` `DDL` `DML` `SELECT` `JOIN` `GROUP BY` `INDEX`

---

## 핵심만 한 문장

**HashMap은 서버 끄면 사라진다. DB는 디스크에 저장하니까 안 사라진다. SQL은 그 DB에 명령하는 언어다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | SELECT, WHERE, JOIN, Docker MySQL 설정 | 매일 쓰는 기본 SQL |
| 🟡 이해 | GROUP BY, INDEX, DDL/DML | 개념 이해 필요 |
| 🟢 참고 | 서브쿼리, HAVING | 18번에서 심화 |

---

## 1. 데이터베이스가 왜 필요한가? 🔴

Phase 1~2에서 만든 API를 떠올려보자.

```java
private final Map<Long, StudyLog> store = new HashMap<>();
```

서버를 껐다 켜면? **데이터가 전부 사라진다.**

> 💡 HashMap은 메모리(RAM)에만 있다. 서버 재시작 = 데이터 증발.
> 이 문제를 해결하는 게 **데이터베이스**다. 디스크에 저장하니까 안 사라진다.

---

## 2. RDBMS 30초 이해 🔴

**엑셀을 떠올리면 된다:**

```
┌──────────────────────────────────────────────┐
│             study_log (테이블 = 시트)           │
├─────┬───────────┬──────────┬─────────────────┤
│ id  │   title   │ category │   study_date    │  ← 컬럼(Column) = 열
├─────┼───────────┼──────────┼─────────────────┤
│  1  │ Spring DI │  SPRING  │  2026-03-10     │  ← 행(Row) = 데이터 1건
│  2  │ SQL 기초  │ DATABASE │  2026-03-11     │
└─────┴───────────┴──────────┴─────────────────┘
```

| 엑셀 | RDBMS |
|------|-------|
| 시트 | **테이블 (Table)** |
| 열 (A, B, C...) | **컬럼 (Column)** |
| 행 (1, 2, 3...) | **행/레코드 (Row)** |
| — | **기본키 (PK)**: 각 행의 고유 번호 (보통 `id`) |
| — | **외래키 (FK)**: 다른 테이블의 PK를 참조 |

> 💡 **RDBMS** = Relational Database Management System. 데이터를 **표(테이블)** 로 저장하고, 테이블 끼리 **관계(FK)** 를 맺어 관리하는 소프트웨어다.

---

## 3. MySQL 설치 — 따라쳐보기 🔴

이 커리큘럼은 **MySQL**을 사용한다. (취업 시장 점유율 1위, 학습 자료 풍부)

### 방법 1: Docker (추천)

Docker가 설치된 상태에서 터미널에 **그대로 복사-붙여넣기** 하자:

```bash
docker run -d \
  --name mysql-study \
  -e MYSQL_ROOT_PASSWORD=1234 \
  -e MYSQL_DATABASE=study_db \
  -p 3306:3306 \
  mysql:8.0
```

**💻 따라쳐보기 — 실행 결과:**

```
Unable to find image 'mysql:8.0' locally
8.0: Pulling from library/mysql
...
Status: Downloaded newer image for mysql:8.0
a1b2c3d4e5f6...  ← 컨테이너 ID가 뜨면 성공!
```

확인:
```bash
docker ps
```
```
CONTAINER ID   IMAGE       STATUS         PORTS                    NAMES
a1b2c3d4e5f6   mysql:8.0   Up 5 seconds   0.0.0.0:3306->3306/tcp   mysql-study
```

STATUS가 `Up`이면 MySQL이 돌아가고 있는 거다!

### 방법 2: Mac (Homebrew)

```bash
brew install mysql
brew services start mysql
```

### 방법 3: Windows

[MySQL Community Downloads](https://dev.mysql.com/downloads/installer/) → Developer Default → Root 비밀번호 설정

---

## 4. MySQL 접속 — 따라쳐보기 🔴

### Docker 사용자:

```bash
docker exec -it mysql-study mysql -u root -p1234
```

### Mac (Homebrew) 사용자:

```bash
mysql -u root
```

**💻 따라쳐보기 — 접속 성공하면 이렇게 보인다:**

```
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.0.xx MySQL Community Server

mysql>     ← 이 프롬프트가 뜨면 접속 성공!
```

### 첫 번째 SQL 쳐보기

```sql
SHOW DATABASES;
```

**💻 결과:**

```
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| study_db           |
| sys                |
+--------------------+
5 rows in set (0.01 sec)
```

`study_db`가 보이면 성공! 이제 이 데이터베이스를 사용하자:

```sql
USE study_db;
```

**💻 결과:**

```
Database changed
```

> 💡 앞으로 모든 SQL은 `USE study_db;` 한 상태에서 실행한다.

---

## 5. SQL이란? 🔴

**한 줄**: 데이터베이스에 명령을 내리는 전용 언어.

| 분류 | 역할 | 대표 명령어 | 비유 |
|------|------|------------|------|
| **DDL** | 테이블 **구조** 만들기/변경 | `CREATE`, `ALTER`, `DROP` | "엑셀 시트 만들기" |
| **DML** | 데이터 **조작** | `SELECT`, `INSERT`, `UPDATE`, `DELETE` | "셀에 데이터 입력/수정/삭제" |

> 💡 백엔드 개발자가 매일 쓰는 건 **DDL + DML**이다.

---

## 6. DDL — 테이블 만들기 — 따라쳐보기 🔴

### Step 1: member 테이블 만들기

MySQL 프롬프트에서 **그대로 쳐보자:**

```sql
CREATE TABLE member (
    id       BIGINT       NOT NULL AUTO_INCREMENT,
    name     VARCHAR(50)  NOT NULL,
    email    VARCHAR(255) NOT NULL,

    PRIMARY KEY (id),
    UNIQUE (email)
);
```

**💻 결과:**

```
Query OK, 0 rows affected (0.03 sec)
```

`Query OK`가 나오면 성공! 잘 만들어졌는지 확인:

```sql
DESC member;
```

**💻 결과:**

```
+-------+--------------+------+-----+---------+----------------+
| Field | Type         | Null | Key | Default | Extra          |
+-------+--------------+------+-----+---------+----------------+
| id    | bigint       | NO   | PRI | NULL    | auto_increment |
| name  | varchar(50)  | NO   |     | NULL    |                |
| email | varchar(255) | NO   | UNI | NULL    |                |
+-------+--------------+------+-----+---------+----------------+
3 rows in set (0.00 sec)
```

**한 줄씩 해석:**

| 코드 | 의미 |
|------|------|
| `BIGINT` | 큰 정수 (Java의 `Long`) |
| `NOT NULL` | 비어있으면 안 됨 |
| `AUTO_INCREMENT` | 1, 2, 3... 자동으로 번호 매겨줌 |
| `VARCHAR(50)` | 최대 50글자 문자열 (Java의 `String`) |
| `PRIMARY KEY (id)` | id를 이 테이블의 "주민번호"로 지정 |
| `UNIQUE (email)` | 이메일 중복 불가 |

### Step 2: study_log 테이블 만들기

```sql
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
```

**💻 결과:**

```
Query OK, 0 rows affected (0.03 sec)
```

확인:

```sql
DESC study_log;
```

**💻 결과:**

```
+------------+--------------+------+-----+---------+-------------------+
| Field      | Type         | Null | Key | Default | Extra             |
+------------+--------------+------+-----+---------+-------------------+
| id         | bigint       | NO   | PRI | NULL    | auto_increment    |
| title      | varchar(200) | NO   |     | NULL    |                   |
| content    | text         | NO   |     | NULL    |                   |
| category   | varchar(50)  | NO   |     | NULL    |                   |
| study_date | date         | NO   |     | NULL    |                   |
| member_id  | bigint       | NO   | MUL | NULL    |                   |
| created_at | datetime     | NO   |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
+------------+--------------+------+-----+---------+-------------------+
7 rows in set (0.00 sec)
```

**새로 등장한 것들:**

| 코드 | 의미 |
|------|------|
| `TEXT` | 긴 텍스트 (본문용) |
| `DATE` | 날짜만 (2026-03-17) |
| `DATETIME` | 날짜+시간 (2026-03-17 14:30:00) |
| `DEFAULT NOW()` | 값을 안 넣으면 현재 시각이 자동으로 들어감 |
| `FOREIGN KEY (member_id) REFERENCES member(id)` | "member_id에는 member 테이블의 id에 있는 값만 넣을 수 있다" |

> 💡 `member_id`의 Key가 `MUL`인 이유: FK를 걸면 MySQL이 자동으로 인덱스를 만들어준다.

### 자주 쓰는 데이터 타입 정리

| SQL 타입 | 설명 | Java 대응 |
|----------|------|-----------|
| `BIGINT` | 큰 정수 | `Long` |
| `INT` | 정수 | `Integer` |
| `VARCHAR(n)` | 최대 n글자 문자열 | `String` |
| `TEXT` | 긴 텍스트 | `String` |
| `BOOLEAN` | true/false | `Boolean` |
| `DATE` | 날짜 | `LocalDate` |
| `DATETIME` | 날짜+시간 | `LocalDateTime` |

### 제약 조건 정리

| 제약 조건 | 의미 | 비유 |
|-----------|------|------|
| `NOT NULL` | 비어있으면 안 됨 | "제목 없는 일지는 안 됨" |
| `UNIQUE` | 중복 불가 | "이메일은 1인 1개" |
| `PRIMARY KEY` | NOT NULL + UNIQUE + 대표값 | "주민번호" |
| `FOREIGN KEY` | 다른 테이블 PK 참조 | "소속 팀 번호" |
| `DEFAULT` | 값 안 주면 기본값 | "기본 배송지" |

---

## 7. DML: INSERT — 데이터 넣기 — 따라쳐보기 🔴

### Step 1: member 데이터 넣기

```sql
INSERT INTO member (name, email) VALUES ('김코딩', 'kim@example.com');
INSERT INTO member (name, email) VALUES ('이영희', 'lee@example.com');
INSERT INTO member (name, email) VALUES ('박민수', 'park@example.com');
```

**💻 결과 (각각):**

```
Query OK, 1 row affected (0.01 sec)
```

잘 들어갔는지 확인:

```sql
SELECT * FROM member;
```

**💻 결과:**

```
+----+--------+------------------+
| id | name   | email            |
+----+--------+------------------+
|  1 | 김코딩 | kim@example.com  |
|  2 | 이영희 | lee@example.com  |
|  3 | 박민수 | park@example.com |
+----+--------+------------------+
3 rows in set (0.00 sec)
```

> 💡 `id`를 안 넣었는데 1, 2, 3이 들어갔다 → `AUTO_INCREMENT` 덕분!

### Step 2: study_log 데이터 넣기

여러 건을 한 번에 넣을 수도 있다:

```sql
INSERT INTO study_log (title, content, category, study_date, member_id) VALUES
    ('Spring DI 학습', 'IoC 컨테이너가 객체를 관리한다', 'SPRING', '2026-03-10', 1),
    ('SQL 기초', 'SELECT, INSERT를 배웠다', 'DATABASE', '2026-03-11', 1),
    ('JPA 입문', 'ORM이 뭔지 개념을 잡았다', 'SPRING', '2026-03-12', 2),
    ('REST API 설계', 'URI 네이밍 규칙을 정리했다', 'SPRING', '2026-03-13', 1),
    ('인덱스 이해', 'B-Tree 인덱스 구조를 배웠다', 'DATABASE', '2026-03-14', 2),
    ('Docker 기초', '컨테이너와 이미지 개념을 잡았다', 'DEVOPS', '2026-03-15', 3),
    ('Spring MVC', '컨트롤러와 서비스 계층을 배웠다', 'SPRING', '2026-03-16', 3);
```

**💻 결과:**

```
Query OK, 7 rows affected (0.01 sec)
Records: 7  Duplicates: 0  Warnings: 0
```

확인:

```sql
SELECT * FROM study_log;
```

**💻 결과:**

```
+----+----------------+----------------------------------------+----------+------------+-----------+---------------------+
| id | title          | content                                | category | study_date | member_id | created_at          |
+----+----------------+----------------------------------------+----------+------------+-----------+---------------------+
|  1 | Spring DI 학습 | IoC 컨테이너가 객체를 관리한다           | SPRING   | 2026-03-10 |         1 | 2026-03-26 12:00:00 |
|  2 | SQL 기초       | SELECT, INSERT를 배웠다                 | DATABASE | 2026-03-11 |         1 | 2026-03-26 12:00:00 |
|  3 | JPA 입문       | ORM이 뭔지 개념을 잡았다                 | SPRING   | 2026-03-12 |         2 | 2026-03-26 12:00:00 |
|  4 | REST API 설계  | URI 네이밍 규칙을 정리했다               | SPRING   | 2026-03-13 |         1 | 2026-03-26 12:00:00 |
|  5 | 인덱스 이해     | B-Tree 인덱스 구조를 배웠다              | DATABASE | 2026-03-14 |         2 | 2026-03-26 12:00:00 |
|  6 | Docker 기초    | 컨테이너와 이미지 개념을 잡았다           | DEVOPS   | 2026-03-15 |         3 | 2026-03-26 12:00:00 |
|  7 | Spring MVC     | 컨트롤러와 서비스 계층을 배웠다           | SPRING   | 2026-03-16 |         3 | 2026-03-26 12:00:00 |
+----+----------------+----------------------------------------+----------+------------+-----------+---------------------+
7 rows in set (0.00 sec)
```

> 💡 `created_at`도 안 넣었는데 자동으로 들어갔다 → `DEFAULT NOW()` 덕분!

### 🚨 UNIQUE 제약 조건 체험

같은 이메일로 다시 넣어보자:

```sql
INSERT INTO member (name, email) VALUES ('가짜김코딩', 'kim@example.com');
```

**💻 결과:**

```
ERROR 1062 (23000): Duplicate entry 'kim@example.com' for key 'member.email'
```

→ `UNIQUE (email)` 제약 조건이 막아줬다! 이메일 중복은 불가.

### 🚨 FOREIGN KEY 제약 조건 체험

존재하지 않는 member_id로 넣어보자:

```sql
INSERT INTO study_log (title, content, category, study_date, member_id)
VALUES ('테스트', '테스트', 'TEST', '2026-03-20', 999);
```

**💻 결과:**

```
ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails
```

→ member 테이블에 id=999가 없으니까 거절! FK가 데이터 정합성을 지켜준다.

---

## 8. DML: SELECT — 데이터 조회 — 따라쳐보기 🔴

**SELECT가 SQL에서 가장 중요하다.** 백엔드 개발자의 SQL 업무 80%가 SELECT다.

### 8-1. 기본 조회

```sql
-- 전체 조회
SELECT * FROM study_log;

-- 특정 컬럼만 조회
SELECT title, category FROM study_log;
```

**💻 두 번째 결과:**

```
+----------------+----------+
| title          | category |
+----------------+----------+
| Spring DI 학습 | SPRING   |
| SQL 기초       | DATABASE |
| JPA 입문       | SPRING   |
| REST API 설계  | SPRING   |
| 인덱스 이해     | DATABASE |
| Docker 기초    | DEVOPS   |
| Spring MVC     | SPRING   |
+----------------+----------+
7 rows in set (0.00 sec)
```

### 8-2. WHERE — 조건 조회

**💻 따라쳐보기:**

```sql
-- SPRING 카테고리만
SELECT * FROM study_log WHERE category = 'SPRING';
```

**💻 결과:**

```
+----+----------------+-------------------------------------+----------+------------+-----------+
| id | title          | content                             | category | study_date | member_id |
+----+----------------+-------------------------------------+----------+------------+-----------+
|  1 | Spring DI 학습 | IoC 컨테이너가 객체를 관리한다        | SPRING   | 2026-03-10 |         1 |
|  3 | JPA 입문       | ORM이 뭔지 개념을 잡았다              | SPRING   | 2026-03-12 |         2 |
|  4 | REST API 설계  | URI 네이밍 규칙을 정리했다            | SPRING   | 2026-03-13 |         1 |
|  7 | Spring MVC     | 컨트롤러와 서비스 계층을 배웠다        | SPRING   | 2026-03-16 |         3 |
+----+----------------+-------------------------------------+----------+------------+-----------+
4 rows in set (0.00 sec)
```

```sql
-- 여러 조건: SPRING이면서 3월 12일 이후
SELECT title, study_date FROM study_log
WHERE category = 'SPRING' AND study_date >= '2026-03-12';
```

**💻 결과:**

```
+---------------+------------+
| title         | study_date |
+---------------+------------+
| JPA 입문      | 2026-03-12 |
| REST API 설계 | 2026-03-13 |
| Spring MVC    | 2026-03-16 |
+---------------+------------+
3 rows in set (0.00 sec)
```

```sql
-- 제목에 "Spring"이 포함된 것 (부분 검색)
SELECT title FROM study_log WHERE title LIKE '%Spring%';
```

**💻 결과:**

```
+----------------+
| title          |
+----------------+
| Spring DI 학습 |
| Spring MVC     |
+----------------+
2 rows in set (0.00 sec)
```

> 💡 `%` = 아무 글자 0개 이상. `%Spring%` = "앞뒤로 뭐가 오든 Spring이 포함된 것"

```sql
-- 여러 값 중 하나에 해당 (IN)
SELECT title, category FROM study_log
WHERE category IN ('SPRING', 'DATABASE');
```

**💻 결과:**

```
+----------------+----------+
| title          | category |
+----------------+----------+
| Spring DI 학습 | SPRING   |
| SQL 기초       | DATABASE |
| JPA 입문       | SPRING   |
| REST API 설계  | SPRING   |
| 인덱스 이해     | DATABASE |
| Spring MVC     | SPRING   |
+----------------+----------+
6 rows in set (0.00 sec)
```

### 8-3. ORDER BY — 정렬

```sql
-- 최신순 (내림차순)
SELECT title, study_date FROM study_log ORDER BY study_date DESC;
```

**💻 결과:**

```
+----------------+------------+
| title          | study_date |
+----------------+------------+
| Spring MVC     | 2026-03-16 |
| Docker 기초    | 2026-03-15 |
| 인덱스 이해     | 2026-03-14 |
| REST API 설계  | 2026-03-13 |
| JPA 입문       | 2026-03-12 |
| SQL 기초       | 2026-03-11 |
| Spring DI 학습 | 2026-03-10 |
+----------------+------------+
7 rows in set (0.00 sec)
```

### 8-4. LIMIT — 개수 제한

```sql
-- 최신 3개만
SELECT title, study_date FROM study_log
ORDER BY study_date DESC
LIMIT 3;
```

**💻 결과:**

```
+-------------+------------+
| title       | study_date |
+-------------+------------+
| Spring MVC  | 2026-03-16 |
| Docker 기초 | 2026-03-15 |
| 인덱스 이해  | 2026-03-14 |
+-------------+------------+
3 rows in set (0.00 sec)
```

```sql
-- 페이징: 2번째 페이지 (3개씩)
SELECT title FROM study_log
ORDER BY id DESC
LIMIT 3 OFFSET 3;
```

**💻 결과:**

```
+----------------+
| title          |
+----------------+
| REST API 설계  |
| JPA 입문       |
| SQL 기초       |
+----------------+
3 rows in set (0.00 sec)
```

> 💡 `LIMIT 3 OFFSET 3` = "3개 건너뛰고, 그 다음 3개를 가져와"

### WHERE 조건 연산자 정리

| 연산자 | 의미 | 예시 |
|--------|------|------|
| `=` | 같다 | `category = 'SPRING'` |
| `!=` | 다르다 | `category != 'DEVOPS'` |
| `>`, `>=`, `<`, `<=` | 크기 비교 | `study_date >= '2026-03-12'` |
| `BETWEEN A AND B` | A 이상 B 이하 | `study_date BETWEEN '2026-03-10' AND '2026-03-13'` |
| `IN (값1, 값2)` | 목록 중 하나 | `category IN ('SPRING', 'DATABASE')` |
| `LIKE '패턴'` | 부분 검색 | `title LIKE '%JPA%'` |
| `IS NULL` | NULL인 것 | `memo IS NULL` |
| `AND` | 그리고 | `a = 1 AND b = 2` |
| `OR` | 또는 | `a = 1 OR a = 2` |

---

## 9. DML: UPDATE & DELETE — 따라쳐보기 🔴

### 9-1. UPDATE — 데이터 수정

```sql
-- id=1의 제목을 수정
UPDATE study_log
SET title = 'Spring DI 완벽 이해'
WHERE id = 1;
```

**💻 결과:**

```
Query OK, 1 row affected (0.01 sec)
Rows matched: 1  Changed: 1  Warnings: 0
```

확인:

```sql
SELECT id, title FROM study_log WHERE id = 1;
```

**💻 결과:**

```
+----+---------------------+
| id | title               |
+----+---------------------+
|  1 | Spring DI 완벽 이해 |
+----+---------------------+
1 row in set (0.00 sec)
```

> ⚠️ **WHERE 없이 UPDATE하면 전체 행이 수정된다!** 실무 사고 1순위.

### 9-2. DELETE — 데이터 삭제

```sql
-- DEVOPS 카테고리 삭제
DELETE FROM study_log WHERE category = 'DEVOPS';
```

**💻 결과:**

```
Query OK, 1 row affected (0.01 sec)
```

확인:

```sql
SELECT id, title, category FROM study_log;
```

**💻 결과:**

```
+----+---------------------+----------+
| id | title               | category |
+----+---------------------+----------+
|  1 | Spring DI 완벽 이해 | SPRING   |
|  2 | SQL 기초            | DATABASE |
|  3 | JPA 입문            | SPRING   |
|  4 | REST API 설계       | SPRING   |
|  5 | 인덱스 이해          | DATABASE |
|  7 | Spring MVC          | SPRING   |
+----+---------------------+----------+
6 rows in set (0.00 sec)
```

> 💡 id=6(Docker 기초)이 사라졌다! 그리고 id는 6을 건너뛰고 7이 그대로 남아있다.
> AUTO_INCREMENT는 한 번 쓰면 **재사용하지 않는다.**

> ⚠️ **WHERE 없이 DELETE하면 전체 데이터가 삭제된다!** 복구 불가.

### CRUD와 Spring API 대응표

| API 동작 | HTTP Method | SQL |
|----------|-------------|-----|
| 목록 조회 | `GET /study-logs` | `SELECT * FROM study_log` |
| 단건 조회 | `GET /study-logs/1` | `SELECT * FROM study_log WHERE id = 1` |
| 생성 | `POST /study-logs` | `INSERT INTO study_log (...) VALUES (...)` |
| 수정 | `PATCH /study-logs/1` | `UPDATE study_log SET ... WHERE id = 1` |
| 삭제 | `DELETE /study-logs/1` | `DELETE FROM study_log WHERE id = 1` |

---

## 10. JOIN — 테이블 합치기 — 따라쳐보기 🔴

### 왜 테이블을 나누는가?

**❌ 나쁜 방법 — 한 테이블에 다 넣기:**

```
| id | title      | author_name | author_email      |
|----|------------|-------------|-------------------|
|  1 | Spring DI  | 김코딩      | kim@example.com   |
|  2 | SQL 기초   | 김코딩      | kim@example.com   |  ← 중복!
```

→ 김코딩의 이메일이 바뀌면 2곳을 다 고쳐야 한다 (한곳 빠뜨리면? 데이터 불일치!)

**✅ 좋은 방법 — 우리가 이미 만든 구조:**

member 테이블 + study_log 테이블 + FK로 연결!

→ 김코딩의 이메일이 바뀌면 **member 1곳만** 수정하면 된다.

그런데... 조회할 때 "어떤 일지를 누가 썼는지" 같이 보려면? → **JOIN**

### 10-1. INNER JOIN — 따라쳐보기

```sql
SELECT
    s.id,
    s.title,
    s.category,
    m.name AS author
FROM study_log s
INNER JOIN member m ON s.member_id = m.id;
```

**💻 결과:**

```
+----+---------------------+----------+--------+
| id | title               | category | author |
+----+---------------------+----------+--------+
|  1 | Spring DI 완벽 이해 | SPRING   | 김코딩 |
|  2 | SQL 기초            | DATABASE | 김코딩 |
|  3 | JPA 입문            | SPRING   | 이영희 |
|  4 | REST API 설계       | SPRING   | 김코딩 |
|  5 | 인덱스 이해          | DATABASE | 이영희 |
|  7 | Spring MVC          | SPRING   | 박민수 |
+----+---------------------+----------+--------+
6 rows in set (0.00 sec)
```

**해석:**

```
FROM study_log s                     ← study_log를 s라는 별칭으로
INNER JOIN member m                  ← member를 m이라는 별칭으로
ON s.member_id = m.id                ← s.member_id = m.id 인 것끼리 합쳐!
```

> 💡 **INNER JOIN** = 양쪽 모두 매칭되는 행만 가져온다.

### 10-2. LEFT JOIN — 따라쳐보기

"학습 일지가 한 건도 없는 회원도 보고 싶다면?" → LEFT JOIN

먼저 일지가 없는 회원을 추가하자:

```sql
INSERT INTO member (name, email) VALUES ('최신입', 'choi@example.com');
```

```sql
SELECT
    m.name,
    s.title
FROM member m
LEFT JOIN study_log s ON m.id = s.member_id;
```

**💻 결과:**

```
+--------+---------------------+
| name   | title               |
+--------+---------------------+
| 김코딩 | Spring DI 완벽 이해 |
| 김코딩 | SQL 기초            |
| 김코딩 | REST API 설계       |
| 이영희 | JPA 입문            |
| 이영희 | 인덱스 이해          |
| 박민수 | Spring MVC          |
| 최신입 | NULL                |   ← 일지가 없어도 나온다!
+--------+---------------------+
7 rows in set (0.00 sec)
```

> 💡 **LEFT JOIN** = 왼쪽 테이블(member)은 **전부** 나오고, 오른쪽(study_log)에 매칭이 없으면 NULL.

### JOIN 정리

| JOIN | 결과 | 사용 빈도 |
|------|------|-----------|
| `INNER JOIN` | 양쪽 모두 있는 것만 | ⭐⭐⭐⭐⭐ |
| `LEFT JOIN` | 왼쪽 전부 + 오른쪽 없으면 NULL | ⭐⭐⭐⭐ |
| `RIGHT JOIN` | LEFT JOIN 반대 (거의 안 씀) | ⭐ |

> 💡 **INNER JOIN과 LEFT JOIN만 알면 실무의 99%를 커버한다.**

---

## 11. GROUP BY와 집계 함수 — 따라쳐보기 🟡

### 11-1. 집계 함수

```sql
-- 전체 일지 수
SELECT COUNT(*) AS total FROM study_log;
```

**💻 결과:**

```
+-------+
| total |
+-------+
|     6 |
+-------+
1 row in set (0.00 sec)
```

### 11-2. GROUP BY — 그룹별 집계

```sql
-- 카테고리별 일지 수
SELECT category, COUNT(*) AS count
FROM study_log
GROUP BY category;
```

**💻 결과:**

```
+----------+-------+
| category | count |
+----------+-------+
| SPRING   |     4 |
| DATABASE |     2 |
+----------+-------+
2 rows in set (0.00 sec)
```

```sql
-- 회원별 일지 수 (JOIN + GROUP BY)
SELECT m.name, COUNT(s.id) AS log_count
FROM member m
LEFT JOIN study_log s ON m.id = s.member_id
GROUP BY m.name;
```

**💻 결과:**

```
+--------+-----------+
| name   | log_count |
+--------+-----------+
| 김코딩 |         3 |
| 이영희 |         2 |
| 박민수 |         1 |
| 최신입 |         0 |
+--------+-----------+
4 rows in set (0.00 sec)
```

### 11-3. HAVING — 그룹 필터링

```sql
-- 일지가 2개 이상인 카테고리만
SELECT category, COUNT(*) AS count
FROM study_log
GROUP BY category
HAVING COUNT(*) >= 2;
```

**💻 결과:**

```
+----------+-------+
| category | count |
+----------+-------+
| SPRING   |     4 |
| DATABASE |     2 |
+----------+-------+
2 rows in set (0.00 sec)
```

> 💡 **WHERE vs HAVING:**
> - `WHERE` = 그룹 만들기 **전에** 행을 거름
> - `HAVING` = 그룹 만든 **후에** 그룹을 거름

### 집계 함수 정리

| 함수 | 설명 |
|------|------|
| `COUNT(*)` | 행 수 |
| `SUM(컬럼)` | 합계 |
| `AVG(컬럼)` | 평균 |
| `MAX(컬럼)` | 최대값 |
| `MIN(컬럼)` | 최소값 |

### SELECT 실행 순서

SQL은 작성 순서와 실행 순서가 다르다:

```
작성 순서                실행 순서
─────────               ─────────
SELECT   ← 5번째        FROM     ← 1번째  "어디서?"
FROM     ← 1번째        WHERE    ← 2번째  "어떤 행?"
WHERE    ← 2번째        GROUP BY ← 3번째  "그룹 묶기"
GROUP BY ← 3번째        HAVING   ← 4번째  "어떤 그룹?"
HAVING   ← 4번째        SELECT   ← 5번째  "어떤 컬럼?"
ORDER BY ← 6번째        ORDER BY ← 6번째  "정렬"
LIMIT    ← 7번째        LIMIT    ← 7번째  "몇 개?"
```

---

## 12. 인덱스 (INDEX) — 따라쳐보기 🟡

### 인덱스란?

**책 뒤의 "색인(찾아보기)"** 과 같다.

- 색인 없으면: 책 처음부터 끝까지 넘겨서 찾아야 함 → **느림**
- 색인 있으면: "Spring → p.42" 바로 찾아감 → **빠름**

데이터 10만 건에서 `WHERE category = 'SPRING'`을 실행하면?
- 인덱스 없으면: **10만 건 전부 스캔** (Full Table Scan)
- 인덱스 있으면: **바로 해당 위치로 이동**

### 따라쳐보기 — 인덱스 생성

```sql
-- category 컬럼에 인덱스 생성
CREATE INDEX idx_study_log_category ON study_log (category);
```

**💻 결과:**

```
Query OK, 0 rows affected (0.03 sec)
Records: 0  Duplicates: 0  Warnings: 0
```

인덱스 확인:

```sql
SHOW INDEX FROM study_log;
```

**💻 결과 (핵심 컬럼만):**

```
+-----------+----------------------------+--------------+
| Table     | Key_name                   | Column_name  |
+-----------+----------------------------+--------------+
| study_log | PRIMARY                    | id           |  ← PK는 자동으로 인덱스
| study_log | member_id                  | member_id    |  ← FK도 자동으로 인덱스
| study_log | idx_study_log_category     | category     |  ← 우리가 방금 만든 것!
+-----------+----------------------------+--------------+
```

### 따라쳐보기 — EXPLAIN으로 인덱스 사용 확인

```sql
EXPLAIN SELECT * FROM study_log WHERE category = 'SPRING';
```

**💻 결과:**

```
+----+------+------------------------+------+------+----------+-------+
| id | type | possible_keys          | key  | rows | filtered | Extra |
+----+------+------------------------+------+------+----------+-------+
|  1 | ref  | idx_study_log_category | idx_study_log_category | 4 | 100.00 | NULL |
+----+------+------------------------+------+------+----------+-------+
```

- `key` = `idx_study_log_category` → 우리가 만든 인덱스를 사용하고 있다!
- `rows` = 4 → 4건만 스캔 (전체 6건 중)

```sql
-- 인덱스 삭제 (원하면)
DROP INDEX idx_study_log_category ON study_log;
```

### 인덱스를 만들어야 하는 컬럼

| 조건 | 이유 |
|------|------|
| `WHERE`에 자주 쓰는 컬럼 | 조건 검색이 빨라짐 |
| `JOIN`의 ON 조건 컬럼 | FK에는 자동 생성됨 |
| `ORDER BY`에 쓰는 컬럼 | 정렬이 빨라짐 |

### 인덱스를 만들면 안 되는 컬럼

| 조건 | 이유 |
|------|------|
| 데이터가 수백 건밖에 없는 테이블 | 풀 스캔이 더 빠름 |
| INSERT/UPDATE가 아주 빈번한 컬럼 | 인덱스도 같이 갱신 → 쓰기 느려짐 |
| `BOOLEAN` 같은 값 종류가 적은 컬럼 | 효과 미미 |

> 💡 **PK에는 자동으로 인덱스가 생긴다.** 그래서 `WHERE id = 1`은 항상 빠르다.

---

## 13. DDL 추가: 테이블 수정/삭제 🟡

실무에서 테이블 구조를 바꿀 때 쓰는 명령어:

```sql
-- 컬럼 추가
ALTER TABLE study_log ADD COLUMN memo VARCHAR(500) NULL;

-- 컬럼 타입 변경
ALTER TABLE study_log MODIFY COLUMN memo TEXT NULL;

-- 컬럼 삭제
ALTER TABLE study_log DROP COLUMN memo;

-- 테이블 삭제 (⚠️ 데이터도 삭제!)
DROP TABLE IF EXISTS study_log;
```

> 💡 지금은 "이런 게 있구나" 수준으로 넘어가자. 우리는 JPA를 쓰면 `ddl-auto`가 대신 해준다.

---

## 14. 정규화 — 3줄 요약 🟡

테이블을 **올바르게 나누는 기준**:

| 정규형 | 규칙 | 위반 예시 |
|--------|------|-----------|
| **1NF** | 하나의 셀에 하나의 값 | tags = "spring, java, di" (❌) → 별도 테이블로 분리 |
| **2NF** | PK 전체에 종속 | 복합PK 중 일부에만 종속되는 컬럼 분리 |
| **3NF** | PK가 아닌 컬럼에 종속 금지 | member_name이 member_id에 종속 → member 테이블 분리 |

> 💡 우리가 member + study_log로 나눈 것 자체가 3NF를 지킨 설계다!

---

## 15. Spring Boot에서 MySQL 연결 (미리보기) 🟡

> 아직 직접 하지는 않는다. 19번(JDBC)과 20번(JPA)에서 실제로 연결한다.

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/study_db
    username: root
    password: 1234
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: create    # 서버 시작 시 테이블 자동 생성
    show-sql: true         # 실행되는 SQL을 콘솔에 출력
```

```java
// Java Entity = SQL의 CREATE TABLE과 대응
@Entity
@Table(name = "study_log")
public class StudyLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;            // BIGINT AUTO_INCREMENT

    @Column(nullable = false, length = 200)
    private String title;       // VARCHAR(200) NOT NULL
}
```

| SQL | JPA |
|-----|-----|
| `CREATE TABLE` | `@Entity` |
| `BIGINT AUTO_INCREMENT` | `@Id` + `@GeneratedValue(IDENTITY)` |
| `VARCHAR(200) NOT NULL` | `@Column(nullable = false, length = 200)` |
| `FOREIGN KEY` | `@ManyToOne` + `@JoinColumn` |

---

## 16. 실습 문제

### 문제 1: SELECT 연습

위에서 만든 데이터로 다음을 조회하는 SQL을 작성하시오:

1. 김코딩이 작성한 모든 학습 일지의 제목과 카테고리
2. 카테고리가 SPRING이고, 3월 12일 이후에 작성된 일지
3. 회원별 학습 일지 수를 일지가 많은 순서로 정렬

<details>
<summary>정답 보기</summary>

```sql
-- 1번
SELECT s.title, s.category
FROM study_log s
INNER JOIN member m ON s.member_id = m.id
WHERE m.name = '김코딩';

-- 2번
SELECT * FROM study_log
WHERE category = 'SPRING' AND study_date >= '2026-03-12';

-- 3번
SELECT m.name, COUNT(s.id) AS log_count
FROM member m
LEFT JOIN study_log s ON m.id = s.member_id
GROUP BY m.name
ORDER BY log_count DESC;
```

</details>

### 문제 2: DDL 연습

다음 요구사항에 맞는 `comment` 테이블을 만드시오:
- id: 자동 증가 PK
- content: 최대 500자, 필수
- study_log_id: study_log의 id를 참조하는 FK
- member_id: member의 id를 참조하는 FK
- created_at: 생성 시각, 자동 입력

<details>
<summary>정답 보기</summary>

```sql
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
```

</details>

---

## 17. 면접 대비 🔴

| 질문 | 핵심 답변 |
|------|-----------|
| RDBMS가 뭔가요? | 데이터를 테이블(행+열)로 저장하고, FK로 테이블 간 관계를 정의해서 관리하는 시스템 |
| DDL과 DML의 차이는? | DDL은 테이블 구조(CREATE/ALTER/DROP), DML은 데이터 조작(SELECT/INSERT/UPDATE/DELETE) |
| PRIMARY KEY와 UNIQUE 차이는? | PK = NOT NULL + UNIQUE + 테이블당 1개. UNIQUE = NULL 가능 + 여러 개 가능 |
| WHERE와 HAVING 차이는? | WHERE는 GROUP BY 전에 행 필터, HAVING은 GROUP BY 후에 그룹 필터 |
| INNER JOIN과 LEFT JOIN 차이는? | INNER = 양쪽 매칭만, LEFT = 왼쪽 전부 + 오른쪽 없으면 NULL |
| 인덱스란? | B-Tree 기반 목차. SELECT 속도 향상, INSERT/UPDATE 시 약간의 오버헤드 |
| 인덱스를 아무데나 걸면 안 되는 이유? | 쓰기 시 인덱스도 갱신해야 하고, 값 종류가 적으면 효과 미미 |
| 정규화란? | 데이터 중복 제거 + 무결성 보장을 위해 테이블을 분리하는 과정 |

---

## 18. 핵심 요약

```
📌 이번에 배운 것:

1. RDBMS = 엑셀과 비슷한 표(테이블)에 데이터를 저장하는 시스템
2. DDL = 테이블 만들기 (CREATE TABLE)
3. DML = 데이터 CRUD (INSERT / SELECT / UPDATE / DELETE)
4. SELECT가 가장 중요! (WHERE, ORDER BY, LIMIT)
5. JOIN = 나눠진 테이블을 합쳐서 조회 (INNER JOIN, LEFT JOIN)
6. GROUP BY = 그룹별 집계 (COUNT, SUM, AVG)
7. INDEX = 검색 속도를 위한 목차 (EXPLAIN으로 확인)
8. 정규화 = 테이블을 올바르게 나누는 기준 (1NF, 2NF, 3NF)
```
