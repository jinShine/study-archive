# 18. SQL 심화

> **키워드**: `서브쿼리` `윈도우 함수` `ROW_NUMBER` `RANK` `LAG/LEAD` `CTE` `EXPLAIN` `복합 인덱스`

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 서브쿼리, EXPLAIN, 인덱스 함정, 복합 인덱스 | 면접 + 실무 반드시 필요 |
| 🟡 이해 | 윈도우 함수(ROW_NUMBER, LAG), CTE | 개념 이해하고, 필요할 때 찾아보면 됨 |
| 🟢 참고 | 재귀 CTE, NTILE, ROLLUP | 있다는 것만 알면 됨 |

> 💡 **JPA를 쓰면 SQL 직접 작성이 줄어든다.** 복잡한 윈도우 함수보다 **인덱스 + EXPLAIN + 서브쿼리↔JOIN 변환**이 100배 더 중요하다.

---

## 1. 실습 테이블 준비 — 따라쳐보기 🔴

17번에서 만든 테이블을 초기화하고, 이번 장 전용 데이터를 넣자.

**Docker MySQL에 접속:**

```bash
docker exec -it mysql-study mysql -u root -p1234
```

```sql
USE study_db;

-- 기존 테이블 삭제 (FK 있는 쪽 먼저!)
DROP TABLE IF EXISTS study_log;
DROP TABLE IF EXISTS member;

-- 회원 테이블
CREATE TABLE member (
    id       BIGINT       NOT NULL AUTO_INCREMENT,
    name     VARCHAR(50)  NOT NULL,
    team     VARCHAR(50)  NOT NULL,
    PRIMARY KEY (id)
);

-- 학습 기록 테이블
CREATE TABLE study_log (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    member_id  BIGINT       NOT NULL,
    title      VARCHAR(200) NOT NULL,
    category   VARCHAR(50)  NOT NULL,
    study_time INT          NOT NULL,
    study_date DATE         NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (member_id) REFERENCES member(id)
);
```

**💻 결과 (각각):**

```
Query OK, 0 rows affected
```

데이터 넣기:

```sql
INSERT INTO member (name, team) VALUES
    ('홍길동', '백엔드'), ('김철수', '백엔드'), ('이영희', '프론트엔드'),
    ('박민수', '백엔드'), ('정수진', '프론트엔드');

INSERT INTO study_log (member_id, title, category, study_time, study_date) VALUES
    (1, 'Spring DI',       'SPRING',   120, '2026-03-01'),
    (1, 'Spring AOP',      'SPRING',    90, '2026-03-02'),
    (1, 'SQL 기초',        'DATABASE',  60, '2026-03-03'),
    (1, 'JPA 입문',        'JPA',      150, '2026-03-05'),
    (2, 'Spring MVC',      'SPRING',    80, '2026-03-01'),
    (2, 'REST API',        'SPRING',   100, '2026-03-03'),
    (2, 'SQL 기초',        'DATABASE',  70, '2026-03-04'),
    (3, 'React 기초',      'REACT',    110, '2026-03-01'),
    (3, 'TypeScript',      'REACT',     90, '2026-03-02'),
    (4, 'Spring Security', 'SPRING',   130, '2026-03-02'),
    (4, 'JPA 심화',        'JPA',      180, '2026-03-04'),
    (4, 'QueryDSL',        'JPA',      100, '2026-03-05'),
    (5, 'CSS Grid',        'REACT',     60, '2026-03-03');
```

확인:

```sql
SELECT COUNT(*) FROM member;
SELECT COUNT(*) FROM study_log;
```

**💻 결과:**

```
+----------+
| COUNT(*) |
+----------+
|        5 |
+----------+

+----------+
| COUNT(*) |
+----------+
|       13 |
+----------+
```

회원 5명, 학습 기록 13건 준비 완료!

---

## 2. 서브쿼리 (Subquery) — 따라쳐보기 🔴

### 서브쿼리란?

**쿼리 안에 들어가는 또 다른 쿼리.** 괄호 `()` 안에 작성한다.

```
일반 쿼리:  "학습 시간이 100분 넘는 기록 보여줘"
서브쿼리:   "학습 시간이 [평균]보다 큰 기록 보여줘"
                        ↑ 이 평균을 구하는 것도 쿼리!
```

### 2-1. WHERE 절 서브쿼리 — 따라쳐보기

**💻 따라쳐보기 — 먼저 평균을 구해보자:**

```sql
SELECT AVG(study_time) FROM study_log;
```

**💻 결과:**

```
+--------------------+
| AVG(study_time)    |
+--------------------+
|           103.0769 |
+--------------------+
```

평균이 약 103분이다. 이제 103보다 큰 걸 찾으면 되는데... 숫자를 직접 넣지 않고 **쿼리로 넣을 수 있다:**

```sql
SELECT title, study_time
FROM study_log
WHERE study_time > (SELECT AVG(study_time) FROM study_log);
```

**💻 결과:**

```
+-----------------+------------+
| title           | study_time |
+-----------------+------------+
| Spring DI       |        120 |
| JPA 입문        |        150 |
| React 기초      |        110 |
| Spring Security |        130 |
| JPA 심화        |        180 |
+-----------------+------------+
5 rows in set (0.00 sec)
```

**실행 순서:**

```
Step 1: 안쪽 쿼리 먼저 → AVG = 103.08
Step 2: 바깥 쿼리에 대입 → WHERE study_time > 103.08
Step 3: 103.08보다 큰 5건이 나옴
```

### 2-2. IN 서브쿼리 — 따라쳐보기

"학습 기록이 있는 회원"만 보고 싶다면?

```sql
SELECT name FROM member
WHERE id IN (SELECT DISTINCT member_id FROM study_log);
```

**💻 결과:**

```
+--------+
| name   |
+--------+
| 홍길동 |
| 김철수 |
| 이영희 |
| 박민수 |
| 정수진 |
+--------+
5 rows in set (0.00 sec)
```

> 💡 안쪽 `SELECT DISTINCT member_id FROM study_log`가 먼저 실행 → `(1,2,3,4,5)` → `WHERE id IN (1,2,3,4,5)`

### 2-3. EXISTS — 따라쳐보기

IN과 비슷하지만 동작이 다르다:

```sql
SELECT m.name FROM member m
WHERE EXISTS (
    SELECT 1 FROM study_log s WHERE s.member_id = m.id
);
```

**💻 결과:** (위와 동일)

```
+--------+
| name   |
+--------+
| 홍길동 |
| 김철수 |
| 이영희 |
| 박민수 |
| 정수진 |
+--------+
```

**IN vs EXISTS 차이:**

```
IN:     목록을 전부 만든 뒤 → 비교
EXISTS: 하나만 찾으면 → 즉시 "있다!" 하고 멈춤

→ 서브쿼리 결과가 작으면 IN, 크면 EXISTS가 유리
```

### 2-4. 서브쿼리 → JOIN 변환 (면접 단골!) 🔴

```sql
-- ❌ 서브쿼리 버전 (study_log 행마다 서브쿼리 1번씩 = 13번 실행!)
SELECT
    id, title,
    (SELECT name FROM member WHERE id = s.member_id) AS author
FROM study_log s;
```

```sql
-- ✅ JOIN 버전 (한 번에 연결)
SELECT s.id, s.title, m.name AS author
FROM study_log s
JOIN member m ON s.member_id = m.id;
```

**💻 두 쿼리 모두 같은 결과:**

```
+----+-----------------+--------+
| id | title           | author |
+----+-----------------+--------+
|  1 | Spring DI       | 홍길동 |
|  2 | Spring AOP      | 홍길동 |
|  3 | SQL 기초        | 홍길동 |
|  4 | JPA 입문        | 홍길동 |
|  5 | Spring MVC      | 김철수 |
|  6 | REST API        | 김철수 |
|  7 | SQL 기초        | 김철수 |
|  8 | React 기초      | 이영희 |
|  9 | TypeScript      | 이영희 |
| 10 | Spring Security | 박민수 |
| 11 | JPA 심화        | 박민수 |
| 12 | QueryDSL        | 박민수 |
| 13 | CSS Grid        | 정수진 |
+----+-----------------+--------+
13 rows in set (0.00 sec)
```

> 💡 **규칙**: SELECT 절의 서브쿼리(스칼라 서브쿼리)는 웬만하면 **JOIN으로 바꿔라**. 데이터가 많을수록 성능 차이가 극적이다.

---

## 3. 윈도우 함수 — 따라쳐보기 🟡

> 전부 외울 필요 없다. **"이런 게 가능하구나"** 를 알고, 필요할 때 찾아보면 된다.

### GROUP BY vs 윈도우 함수 — 따라쳐보기

```sql
-- GROUP BY: 행이 줄어든다 (13행 → 4행)
SELECT category, SUM(study_time) AS total
FROM study_log
GROUP BY category;
```

**💻 결과:**

```
+----------+-------+
| category | total |
+----------+-------+
| DATABASE |   130 |
| JPA      |   430 |
| REACT    |   260 |
| SPRING   |   520 |
+----------+-------+
4 rows in set (0.00 sec)
```

```sql
-- 윈도우 함수: 행이 안 줄어든다 (13행 그대로 + 옆에 합계 붙음)
SELECT title, category, study_time,
    SUM(study_time) OVER (PARTITION BY category) AS category_total
FROM study_log;
```

**💻 결과:**

```
+-----------------+----------+------------+----------------+
| title           | category | study_time | category_total |
+-----------------+----------+------------+----------------+
| SQL 기초        | DATABASE |         60 |            130 |
| SQL 기초        | DATABASE |         70 |            130 |
| JPA 입문        | JPA      |        150 |            430 |
| JPA 심화        | JPA      |        180 |            430 |
| QueryDSL        | JPA      |        100 |            430 |
| React 기초      | REACT    |        110 |            260 |
| TypeScript      | REACT    |         90 |            260 |
| CSS Grid        | REACT    |         60 |            260 |
| Spring DI       | SPRING   |        120 |            520 |
| Spring AOP      | SPRING   |         90 |            520 |
| Spring MVC      | SPRING   |         80 |            520 |
| REST API        | SPRING   |        100 |            520 |
| Spring Security | SPRING   |        130 |            520 |
+-----------------+----------+------------+----------------+
13 rows in set (0.00 sec)
```

**비유:**

```
GROUP BY:     시험 후 반 평균만 발표 → 개인 점수 안 보임
윈도우 함수:  개인 성적표에 반 평균을 옆에 적어줌 → 둘 다 보임
```

### 3-1. ROW_NUMBER — 순번 매기기 — 따라쳐보기

```sql
SELECT title, study_time,
    ROW_NUMBER() OVER (ORDER BY study_time DESC) AS ranking
FROM study_log;
```

**💻 결과:**

```
+-----------------+------------+---------+
| title           | study_time | ranking |
+-----------------+------------+---------+
| JPA 심화        |        180 |       1 |
| JPA 입문        |        150 |       2 |
| Spring Security |        130 |       3 |
| Spring DI       |        120 |       4 |
| React 기초      |        110 |       5 |
| REST API        |        100 |       6 |
| QueryDSL        |        100 |       7 |  ← 같은 100분이어도 번호 다름!
| Spring AOP      |         90 |       8 |
| TypeScript      |         90 |       9 |
| Spring MVC      |         80 |      10 |
| SQL 기초        |         70 |      11 |
| CSS Grid        |         60 |      12 |
| SQL 기초        |         60 |      13 |
+-----------------+------------+---------+
13 rows in set (0.00 sec)
```

### 3-2. ROW_NUMBER vs RANK vs DENSE_RANK

```sql
SELECT title, study_time,
    ROW_NUMBER() OVER (ORDER BY study_time DESC) AS row_num,
    RANK()       OVER (ORDER BY study_time DESC) AS rank_num,
    DENSE_RANK() OVER (ORDER BY study_time DESC) AS dense_num
FROM study_log;
```

**💻 결과 (100분인 행 2개에 주목):**

```
+-----------------+------------+---------+----------+-----------+
| title           | study_time | row_num | rank_num | dense_num |
+-----------------+------------+---------+----------+-----------+
| JPA 심화        |        180 |       1 |        1 |         1 |
| JPA 입문        |        150 |       2 |        2 |         2 |
| Spring Security |        130 |       3 |        3 |         3 |
| Spring DI       |        120 |       4 |        4 |         4 |
| React 기초      |        110 |       5 |        5 |         5 |
| REST API        |        100 |       6 |        6 |         6 |
| QueryDSL        |        100 |       7 |        6 |         6 |  ← 여기!
| Spring AOP      |         90 |       8 |        8 |         7 |  ← 여기!
+-----------------+------------+---------+----------+-----------+
```

| 함수 | 동점(100분) 처리 | 그 다음(90분) | 기억법 |
|------|----------------|-------------|--------|
| `ROW_NUMBER` | 6번, **7**번 | **8**번 | 엑셀 행 번호 |
| `RANK` | **6**번, **6**번 | **8**번 (건너뜀) | 운동회 등수 |
| `DENSE_RANK` | **6**번, **6**번 | **7**번 (안 건너뜀) | 빽빽한 등수 |

### 3-3. 카테고리별 Top 1 — 따라쳐보기 (실전 자주 씀!)

"각 카테고리에서 가장 오래 공부한 1건"을 구하는 패턴:

```sql
SELECT category, title, study_time
FROM (
    SELECT category, title, study_time,
        ROW_NUMBER() OVER (
            PARTITION BY category
            ORDER BY study_time DESC
        ) AS rn
    FROM study_log
) ranked
WHERE rn = 1;
```

**💻 결과:**

```
+----------+-----------------+------------+
| category | title           | study_time |
+----------+-----------------+------------+
| DATABASE | SQL 기초        |         70 |
| JPA      | JPA 심화        |        180 |
| REACT    | React 기초      |        110 |
| SPRING   | Spring Security |        130 |
+----------+-----------------+------------+
4 rows in set (0.00 sec)
```

> 💡 `WHERE rn <= 3`으로 바꾸면 **카테고리별 Top 3**이 된다!

### 3-4. LAG — 이전 행 참조 — 따라쳐보기

```sql
SELECT study_date, title, study_time,
    LAG(study_time, 1) OVER (ORDER BY study_date) AS prev_time
FROM study_log
WHERE member_id = 1;
```

**💻 결과:**

```
+------------+-----------+------------+-----------+
| study_date | title     | study_time | prev_time |
+------------+-----------+------------+-----------+
| 2026-03-01 | Spring DI |        120 |      NULL |  ← 첫 행은 이전 없음
| 2026-03-02 | Spring AOP|         90 |       120 |  ← 이전: 120
| 2026-03-03 | SQL 기초  |         60 |        90 |  ← 이전: 90
| 2026-03-05 | JPA 입문  |        150 |        60 |  ← 이전: 60
+------------+-----------+------------+-----------+
4 rows in set (0.00 sec)
```

| 함수 | 방향 | 의미 |
|------|------|------|
| `LAG(컬럼, 1)` | ↑ 위 | 이전 행의 값 |
| `LEAD(컬럼, 1)` | ↓ 아래 | 다음 행의 값 |

---

## 4. CTE — 복잡한 쿼리를 읽기 쉽게 — 따라쳐보기 🟡

### CTE란?

```
서브쿼리:  함수 없이 main()에 모든 로직을 때려넣는 것
CTE:       로직을 함수로 분리하는 것 → 가독성 ↑
```

### 따라쳐보기 — 서브쿼리 vs CTE 비교

```sql
-- ❌ 서브쿼리: 괄호 중첩으로 읽기 어려움
SELECT * FROM (
    SELECT category, COUNT(*) AS cnt, SUM(study_time) AS total
    FROM study_log GROUP BY category
) sub WHERE sub.cnt >= 3;
```

```sql
-- ✅ CTE: 같은 결과인데 읽기 쉬움
WITH category_stats AS (
    SELECT category, COUNT(*) AS cnt, SUM(study_time) AS total
    FROM study_log
    GROUP BY category
)
SELECT * FROM category_stats WHERE cnt >= 3;
```

**💻 결과 (둘 다 같음):**

```
+----------+-----+-------+
| category | cnt | total |
+----------+-----+-------+
| JPA      |   3 |   430 |
| REACT    |   3 |   260 |
| SPRING   |   5 |   520 |
+----------+-----+-------+
3 rows in set (0.00 sec)
```

> 💡 `WITH 이름 AS (쿼리)` = "이 쿼리 결과에 이름을 붙여두고, 아래서 테이블처럼 쓰겠다"

### CTE + ROW_NUMBER — 더 깔끔한 Top N

3-3에서 했던 것을 CTE로 다시 써보면:

```sql
WITH ranked AS (
    SELECT category, title, study_time,
        ROW_NUMBER() OVER (PARTITION BY category ORDER BY study_time DESC) AS rn
    FROM study_log
)
SELECT category, title, study_time
FROM ranked
WHERE rn = 1;
```

**💻 결과:** (3-3과 동일)

```
+----------+-----------------+------------+
| category | title           | study_time |
+----------+-----------------+------------+
| DATABASE | SQL 기초        |         70 |
| JPA      | JPA 심화        |        180 |
| REACT    | React 기초      |        110 |
| SPRING   | Spring Security |        130 |
+----------+-----------------+------------+
```

---

## 5. EXPLAIN — 쿼리 성능 진단 — 따라쳐보기 🔴

### EXPLAIN이란?

**"이 쿼리를 MySQL이 어떻게 실행할 계획인지"** 보여주는 명령어.

### 따라쳐보기 — PK 검색

```sql
EXPLAIN SELECT * FROM study_log WHERE id = 1;
```

**💻 결과:**

```
+----+-------+------+---------+------+----------+-------+
| id | type  | key  | key_len | ref  | rows     | Extra |
+----+-------+------+---------+------+----------+-------+
|  1 | const | PRIMARY | 8    | const|        1 | NULL  |
+----+-------+------+---------+------+----------+-------+
```

- `type` = **const** → PK로 딱 1건 찾음 (최상의 성능!)
- `rows` = **1** → 1건만 스캔

### 따라쳐보기 — 인덱스 없는 검색

```sql
EXPLAIN SELECT * FROM study_log WHERE category = 'SPRING';
```

**💻 결과:**

```
+----+------+------+---------+------+------+-------------+
| id | type | key  | key_len | ref  | rows | Extra       |
+----+------+------+---------+------+------+-------------+
|  1 | ALL  | NULL | NULL    | NULL |   13 | Using where |
+----+------+------+---------+------+------+-------------+
```

- `type` = **ALL** → 전체 스캔 (최악!)
- `key` = **NULL** → 인덱스 안 탐
- `rows` = **13** → 13건 전부 읽음

### 따라쳐보기 — 인덱스 추가 후 다시

```sql
CREATE INDEX idx_category ON study_log (category);

EXPLAIN SELECT * FROM study_log WHERE category = 'SPRING';
```

**💻 결과:**

```
+----+------+--------------+---------+-------+------+-------+
| id | type | key          | key_len | ref   | rows | Extra |
+----+------+--------------+---------+-------+------+-------+
|  1 | ref  | idx_category | 202     | const |    5 | NULL  |
+----+------+--------------+---------+-------+------+-------+
```

- `type` = **ref** → 인덱스 사용! (양호)
- `key` = **idx_category** → 우리가 만든 인덱스
- `rows` = **5** → 5건만 스캔 (13건 → 5건으로 줄어듦)

### EXPLAIN type 정리 (성능 좋은 순)

| type | 의미 | 비유 | 성능 |
|------|------|------|------|
| `const` | PK/UNIQUE로 딱 1건 | "3번 서랍 열어!" | 최상 |
| `eq_ref` | JOIN에서 PK로 매칭 | "이름표 보고 찾기" | 우수 |
| `ref` | 일반 인덱스로 조건 검색 | "목차에서 SPRING 찾기" | 양호 |
| `range` | 인덱스 범위 스캔 | "목차에서 3/1~3/5 범위" | 보통 |
| `index` | 인덱스 전체 순회 | "목차를 처음부터 끝까지" | 낮음 |
| **`ALL`** | **테이블 전체 순회** | **"책 전체를 다 넘기기"** | **최악** |

> 💡 **ALL이 나오면 인덱스가 필요하다!**

---

## 6. 인덱스가 안 타는 경우 — 따라쳐보기 🔴

**"인덱스를 걸었는데 왜 안 타죠?"** — 면접 단골!

### 함정 1: 컬럼에 함수 쓰면 인덱스 무효화

```sql
CREATE INDEX idx_study_date ON study_log (study_date);

-- ❌ 함수로 감싸면 인덱스 못 탐
EXPLAIN SELECT * FROM study_log WHERE YEAR(study_date) = 2026;
```

**💻 결과:**

```
+----+------+------+------+------+-------------+
| id | type | key  | ref  | rows | Extra       |
+----+------+------+------+------+-------------+
|  1 | ALL  | NULL | NULL |   13 | Using where |
+----+------+------+------+------+-------------+
```

→ type = ALL! 인덱스가 있는데 못 탄다.

**왜?** 인덱스에는 `2026-03-01` 같은 원본값이 정렬되어 있다. `YEAR(study_date)`는 가공된 값이라 인덱스에서 찾을 수 없다.

```sql
-- ✅ 범위 조건으로 바꾸면 인덱스 사용!
EXPLAIN SELECT * FROM study_log
WHERE study_date >= '2026-01-01' AND study_date < '2027-01-01';
```

**💻 결과:**

```
+----+-------+----------------+------+------+-------------+
| id | type  | key            | ref  | rows | Extra       |
+----+-------+----------------+------+------+-------------+
|  1 | range | idx_study_date | NULL |   13 | Using where |
+----+-------+----------------+------+------+-------------+
```

→ type = range! 인덱스 탔다!

### 함정 2: LIKE 앞에 % 쓰면 인덱스 무효화

```sql
-- ❌ %가 앞에 오면 안 됨
EXPLAIN SELECT * FROM study_log WHERE title LIKE '%Spring%';
-- type: ALL (전부 읽어야 함)

-- ✅ %가 뒤에만 있으면 OK
EXPLAIN SELECT * FROM study_log WHERE title LIKE 'Spring%';
-- type: range (인덱스 사용!)
```

**왜?** 인덱스는 사전처럼 정렬되어 있다:
- `Spring%` → "S 섹션에서 찾으면 됨" ✅
- `%Spring%` → "어디에 있을지 모름. 전부 읽어야 함" ❌

### 함정 3: 타입 불일치

```sql
-- ❌ BIGINT 컬럼에 문자열로 비교
SELECT * FROM study_log WHERE member_id = '1';

-- ✅ 올바른 타입으로 비교
SELECT * FROM study_log WHERE member_id = 1;
```

### 인덱스 안 타는 경우 정리

| 원인 | 예시 | 해결 |
|------|------|------|
| 컬럼에 함수 | `YEAR(date) = 2026` | 범위 조건으로 변환 |
| LIKE 앞 % | `LIKE '%abc'` | `LIKE 'abc%'` 또는 Full-Text |
| 타입 불일치 | 숫자에 문자열 비교 | 올바른 타입 사용 |
| 복합 인덱스 왼쪽 누락 | (A,B)인데 B만 조건 | A도 조건 추가 |

> 💡 **한 줄 규칙: 인덱스 컬럼을 가공하지 마라!**

---

## 7. 복합 인덱스 전략 — 따라쳐보기 🔴

### 복합 인덱스란?

여러 컬럼을 합쳐서 하나의 인덱스로 만드는 것:

```sql
-- 정리를 위해 기존 인덱스 삭제
DROP INDEX idx_category ON study_log;
DROP INDEX idx_study_date ON study_log;

-- 복합 인덱스 생성
CREATE INDEX idx_cat_date ON study_log (category, study_date);
```

**💻 결과:**

```
Query OK, 0 rows affected (0.03 sec)
```

### Leftmost Prefix Rule — 따라쳐보기 (면접 단골!)

**복합 인덱스는 왼쪽 컬럼부터 순서대로 사용된다.**

```sql
-- ✅ 왼쪽(category)만 → 인덱스 OK
EXPLAIN SELECT * FROM study_log WHERE category = 'SPRING';
```

**💻 결과:**

```
+------+--------------+
| type | key          |
+------+--------------+
| ref  | idx_cat_date |  ← 인덱스 사용!
+------+--------------+
```

```sql
-- ✅ 왼쪽 + 오른쪽 둘 다 → 인덱스 OK
EXPLAIN SELECT * FROM study_log
WHERE category = 'SPRING' AND study_date >= '2026-03-01';
```

**💻 결과:**

```
+-------+--------------+
| type  | key          |
+-------+--------------+
| range | idx_cat_date |  ← 인덱스 사용!
+-------+--------------+
```

```sql
-- ❌ 오른쪽(study_date)만 → 인덱스 못 탐!
EXPLAIN SELECT * FROM study_log WHERE study_date >= '2026-03-01';
```

**💻 결과:**

```
+------+------+
| type | key  |
+------+------+
| ALL  | NULL |  ← 인덱스 못 탔다!
+------+------+
```

**비유:**

```
복합 인덱스 (category, study_date) = 전화번호부

전화번호부가 "성(category) → 이름(study_date)" 순으로 정렬되어 있다면:

✅ "김씨 찾아줘"                → 김씨 섹션으로 바로 이동
✅ "김씨 중에서 철수 찾아줘"     → 김씨 섹션에서 철수 검색
❌ "철수 찾아줘" (성 모름)       → 처음부터 끝까지 봐야 함!
```

### (A, B, C) 복합 인덱스 인덱스 사용표

| WHERE 조건 | 인덱스 사용? | 이유 |
|------------|-------------|------|
| `WHERE A = 1` | ✅ | 왼쪽부터 매칭 |
| `WHERE A = 1 AND B = 2` | ✅ | 왼쪽 2개 매칭 |
| `WHERE A = 1 AND B = 2 AND C = 3` | ✅ | 전부 매칭 |
| `WHERE B = 2` | ❌ | A가 빠짐 |
| `WHERE C = 3` | ❌ | A, B 빠짐 |
| `WHERE A = 1 AND C = 3` | 🔺 | A만 인덱스, C는 필터링 |

### 복합 인덱스 설계 팁

```
순서 정하는 기준:
1. = 조건 컬럼 → 왼쪽
2. 범위(>, <) 조건 컬럼 → 오른쪽
3. 자주 쓰는 WHERE 컬럼 먼저
```

---

## 8. 실습 문제

### 문제 1: 서브쿼리

"팀이 '백엔드'인 회원들의 학습 기록"을 서브쿼리로 조회하시오.

<details>
<summary>정답 보기</summary>

```sql
SELECT * FROM study_log
WHERE member_id IN (
    SELECT id FROM member WHERE team = '백엔드'
);
```

</details>

### 문제 2: 윈도우 함수

"각 회원별로 가장 오래 공부한 1건"만 조회하시오.

<details>
<summary>정답 보기</summary>

```sql
WITH ranked AS (
    SELECT s.*, m.name,
        ROW_NUMBER() OVER (PARTITION BY member_id ORDER BY study_time DESC) AS rn
    FROM study_log s
    JOIN member m ON s.member_id = m.id
)
SELECT name, title, study_time FROM ranked WHERE rn = 1;
```

</details>

### 문제 3: EXPLAIN

다음 쿼리의 EXPLAIN 결과에서 type이 ALL일 때, 어떻게 개선하겠는가?

```sql
SELECT * FROM study_log WHERE YEAR(study_date) = 2026 AND category = 'SPRING';
```

<details>
<summary>정답 보기</summary>

```sql
-- 1. YEAR() 함수를 범위 조건으로 변환
-- 2. 복합 인덱스 생성 (= 조건이 왼쪽, 범위가 오른쪽)
CREATE INDEX idx_cat_date ON study_log (category, study_date);

SELECT * FROM study_log
WHERE category = 'SPRING'
  AND study_date >= '2026-01-01' AND study_date < '2027-01-01';
```

</details>

---

## 9. 면접 대비 🔴

### 🔴 반드시 답할 수 있어야 하는 것

| 질문 | 핵심 답변 |
|------|-----------|
| 서브쿼리와 JOIN 차이는? | 서브쿼리는 쿼리 안의 쿼리, JOIN은 테이블 연결. 일반적으로 JOIN이 옵티마이저 최적화에 유리 |
| EXPLAIN에서 type: ALL이면? | 테이블 풀 스캔. WHERE 컬럼에 인덱스를 추가해야 함 |
| 인덱스를 걸었는데 안 타는 이유? | ① 컬럼에 함수 사용 ② LIKE '%abc' ③ 타입 불일치 ④ 복합 인덱스 왼쪽 누락 |
| 복합 인덱스 순서가 중요한 이유? | Leftmost Prefix Rule — (A,B,C) 인덱스는 A, AB, ABC 조건에서만 사용 |

### 🟡 개념만 설명하면 되는 것

| 질문 | 핵심 답변 |
|------|-----------|
| 윈도우 함수란? | GROUP BY와 달리 행을 안 줄이면서 집계하는 함수. `OVER()` 사용 |
| ROW_NUMBER vs RANK? | ROW_NUMBER는 동점이어도 번호 다름, RANK는 동점이면 같은 순위 + 건너뜀 |
| CTE란? | `WITH` 절로 쿼리에 이름을 붙여 가독성을 높이는 기법 |

---

## 10. 핵심 요약

```
📌 이번에 배운 것:

1. 서브쿼리 = 쿼리 안의 쿼리 (WHERE, IN, EXISTS에서 사용)
2. 스칼라 서브쿼리는 JOIN으로 바꿔라 (면접 단골!)
3. 윈도우 함수 = 행을 안 줄이면서 집계 (ROW_NUMBER, LAG)
4. CTE = WITH 절로 쿼리를 읽기 쉽게 분리
5. EXPLAIN = 쿼리 실행 계획 확인 (type: ALL이면 위험!)
6. 인덱스 함정 = 함수 감싸기, LIKE 앞%, 타입 불일치
7. 복합 인덱스 = 왼쪽부터 순서대로 (Leftmost Prefix Rule)
```
