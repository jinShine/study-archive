# 18. SQL 심화

> **키워드**: `서브쿼리` `윈도우 함수` `ROW_NUMBER` `RANK` `LAG/LEAD` `CTE` `재귀 CTE` `GROUP BY 심화` `EXPLAIN` `실행 계획`

---

## 1. 17번 복습 — 여기서 출발한다

17번에서 배운 것:
- `SELECT`, `WHERE`, `JOIN`, `GROUP BY`, `HAVING`, `ORDER BY`, `LIMIT`
- 집계 함수: `COUNT`, `SUM`, `AVG`, `MAX`, `MIN`

이번에 배울 것:
- **서브쿼리**: 쿼리 안에 쿼리를 넣는 기법
- **윈도우 함수**: 행을 줄이지 않고 집계하는 함수
- **CTE**: 복잡한 쿼리를 읽기 쉽게 분리하는 기법
- **EXPLAIN**: 쿼리가 느린 이유를 진단하는 도구

> 💡 이 내용은 **MySQL 8.0 이상** 기준이다. 윈도우 함수와 CTE는 8.0부터 지원된다.

---

## 2. 실습 테이블 준비

이번 장 전체에서 사용할 테이블:

```sql
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
    study_time INT          NOT NULL,  -- 분 단위
    study_date DATE         NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (member_id) REFERENCES member(id)
);

-- 샘플 데이터
INSERT INTO member (name, team) VALUES
    ('홍길동', '백엔드'), ('김철수', '백엔드'), ('이영희', '프론트엔드'),
    ('박민수', '백엔드'), ('정수진', '프론트엔드');

INSERT INTO study_log (member_id, title, category, study_time, study_date) VALUES
    (1, 'Spring DI',      'SPRING',   120, '2026-03-01'),
    (1, 'Spring AOP',     'SPRING',   90,  '2026-03-02'),
    (1, 'SQL 기초',       'DATABASE', 60,  '2026-03-03'),
    (1, 'JPA 입문',       'JPA',      150, '2026-03-05'),
    (2, 'Spring MVC',     'SPRING',   80,  '2026-03-01'),
    (2, 'REST API',       'SPRING',   100, '2026-03-03'),
    (2, 'SQL 기초',       'DATABASE', 70,  '2026-03-04'),
    (3, 'React 기초',     'REACT',    110, '2026-03-01'),
    (3, 'TypeScript',     'REACT',    90,  '2026-03-02'),
    (4, 'Spring Security','SPRING',   130, '2026-03-02'),
    (4, 'JPA 심화',       'JPA',      180, '2026-03-04'),
    (4, 'QueryDSL',       'JPA',      100, '2026-03-05'),
    (5, 'CSS Grid',       'REACT',    60,  '2026-03-03');
```

---

## 3. 서브쿼리 (Subquery)

### 서브쿼리란?

**쿼리 안에 들어가는 또 다른 쿼리**. 괄호 `()` 안에 작성한다.

### 3-1. WHERE 절 서브쿼리 — 가장 흔한 사용법

```sql
-- 평균보다 오래 공부한 기록 조회
SELECT title, study_time
FROM study_log
WHERE study_time > (SELECT AVG(study_time) FROM study_log);

-- 해석:
-- 1. 안쪽 쿼리: 전체 평균 학습 시간 계산 (약 103분)
-- 2. 바깥 쿼리: study_time > 103인 행만 필터링
```

```sql
-- 학습 기록이 있는 회원만 조회 (IN)
SELECT name
FROM member
WHERE id IN (SELECT DISTINCT member_id FROM study_log);

-- 학습 기록이 없는 회원만 조회 (NOT IN)
SELECT name
FROM member
WHERE id NOT IN (SELECT DISTINCT member_id FROM study_log);
```

### 3-2. 상관 서브쿼리 — 바깥 쿼리를 참조

```sql
-- 각 카테고리에서 가장 오래 공부한 기록
SELECT s1.title, s1.category, s1.study_time
FROM study_log s1
WHERE s1.study_time = (
    SELECT MAX(s2.study_time)
    FROM study_log s2
    WHERE s2.category = s1.category  -- 바깥의 s1.category를 참조!
);
```

> 상관 서브쿼리는 **바깥 행마다 안쪽 쿼리가 실행**되므로 데이터가 많으면 느리다. 뒤에서 배울 윈도우 함수로 대체하는 게 일반적.

### 3-3. EXISTS — "존재하는가?" 확인

```sql
-- 학습 기록이 1건이라도 있는 회원
SELECT m.name
FROM member m
WHERE EXISTS (
    SELECT 1 FROM study_log s WHERE s.member_id = m.id
);
```

**IN vs EXISTS 차이:**

| 비교 | IN | EXISTS |
|------|-----|--------|
| 동작 | 서브쿼리 결과를 **전부** 가져와서 비교 | 매칭되는 첫 행을 찾으면 **즉시 중단** |
| 적합한 상황 | 서브쿼리 결과가 적을 때 | 서브쿼리 대상 테이블이 클 때 |

### 3-4. 서브쿼리 → JOIN 변환 (성능 최적화)

서브쿼리보다 JOIN이 보통 빠르다. 옵티마이저가 최적화하기 쉽기 때문.

```sql
-- 서브쿼리 (비효율적인 경우가 많음)
SELECT id, title,
    (SELECT name FROM member WHERE id = s.member_id) AS author_name
FROM study_log s;

-- JOIN (효율적)
SELECT s.id, s.title, m.name AS author_name
FROM study_log s
JOIN member m ON s.member_id = m.id;
```

> 💡 **규칙**: SELECT 절의 스칼라 서브쿼리는 웬만하면 JOIN으로 바꿔라. 행이 많아지면 성능 차이가 크다.

---

## 4. 윈도우 함수 (Window Functions)

### 윈도우 함수란?

**행의 개수를 줄이지 않으면서** 집계 계산을 하는 함수.

GROUP BY와의 핵심 차이:

```sql
-- GROUP BY: 카테고리별로 행이 "합쳐짐" → 결과 4행
SELECT category, SUM(study_time) AS total
FROM study_log
GROUP BY category;
-- | SPRING   | 520 |
-- | DATABASE | 130 |
-- | JPA      | 430 |
-- | REACT    | 260 |

-- 윈도우 함수: 모든 행이 "유지됨" + 옆에 합계 컬럼 추가 → 결과 13행
SELECT title, category, study_time,
       SUM(study_time) OVER (PARTITION BY category) AS category_total
FROM study_log;
-- | Spring DI       | SPRING   | 120 | 520 |
-- | Spring AOP      | SPRING   |  90 | 520 |
-- | Spring MVC      | SPRING   |  80 | 520 |
-- | ...             | ...      | ... | ... |
```

**핵심 구문:**

```
함수() OVER (
    PARTITION BY 그룹_기준    -- GROUP BY 같은 역할 (선택)
    ORDER BY 정렬_기준        -- 그룹 내 정렬 (선택)
)
```

### 4-1. 순위 함수 — ROW_NUMBER, RANK, DENSE_RANK

```sql
SELECT
    title,
    study_time,
    ROW_NUMBER() OVER (ORDER BY study_time DESC) AS row_num,
    RANK()       OVER (ORDER BY study_time DESC) AS rank_num,
    DENSE_RANK() OVER (ORDER BY study_time DESC) AS dense_num
FROM study_log;
```

| title | study_time | row_num | rank_num | dense_num |
|-------|-----------|---------|----------|-----------|
| JPA 심화 | 180 | 1 | 1 | 1 |
| JPA 입문 | 150 | 2 | 2 | 2 |
| Spring Security | 130 | 3 | 3 | 3 |
| Spring DI | 120 | 4 | 4 | 4 |
| React 기초 | 110 | 5 | 5 | 5 |
| REST API | 100 | 6 | 6 | 6 |
| QueryDSL | 100 | 7 | **6** | **6** |
| Spring AOP | 90 | 8 | **8** | **7** |
| TypeScript | 90 | 9 | **8** | **7** |

**차이점:**

| 함수 | 동점 처리 | 다음 순위 |
|------|----------|----------|
| `ROW_NUMBER()` | 동점이어도 순서대로 1, 2, 3... | 항상 연속 |
| `RANK()` | 동점이면 같은 순위 (6, 6) | 건너뜀 (→ 8) |
| `DENSE_RANK()` | 동점이면 같은 순위 (6, 6) | 안 건너뜀 (→ 7) |

### 4-2. PARTITION BY — 그룹 내 순위

```sql
-- 카테고리별로 학습 시간이 가장 긴 순서
SELECT
    category,
    title,
    study_time,
    ROW_NUMBER() OVER (
        PARTITION BY category     -- 카테고리별로 그룹
        ORDER BY study_time DESC  -- 그룹 안에서 학습 시간 내림차순
    ) AS rn
FROM study_log;

-- 결과:
-- | DATABASE | SQL 기초(김)   |  70 | 1 |
-- | DATABASE | SQL 기초(홍)   |  60 | 2 |
-- | JPA      | JPA 심화       | 180 | 1 |
-- | JPA      | JPA 입문       | 150 | 2 |
-- | JPA      | QueryDSL       | 100 | 3 |
-- | SPRING   | Spring Security| 130 | 1 |
-- | SPRING   | Spring DI      | 120 | 2 |
-- | ...
```

### 4-3. 실전 패턴: 그룹별 Top N 조회

**"각 카테고리에서 가장 오래 공부한 1건씩만"** — 실무에서 매우 자주 쓰인다.

```sql
-- CTE + ROW_NUMBER 조합 (가장 깔끔한 방법)
WITH ranked AS (
    SELECT
        category,
        title,
        study_time,
        ROW_NUMBER() OVER (
            PARTITION BY category
            ORDER BY study_time DESC
        ) AS rn
    FROM study_log
)
SELECT category, title, study_time
FROM ranked
WHERE rn = 1;

-- 결과:
-- | DATABASE | SQL 기초(김)    |  70 |
-- | JPA      | JPA 심화        | 180 |
-- | REACT    | React 기초      | 110 |
-- | SPRING   | Spring Security | 130 |
```

> 💡 `WHERE rn <= 3`으로 바꾸면 **카테고리별 Top 3**이 된다. 아주 유용한 패턴이니 기억하자!

### 4-4. LAG / LEAD — 이전/다음 행 참조

```sql
-- 홍길동의 학습 기록: 이전 기록과 학습 시간 비교
SELECT
    study_date,
    title,
    study_time,
    LAG(study_time, 1) OVER (ORDER BY study_date)  AS prev_time,
    study_time - LAG(study_time, 1) OVER (ORDER BY study_date) AS diff
FROM study_log
WHERE member_id = 1
ORDER BY study_date;

-- 결과:
-- | 2026-03-01 | Spring DI  | 120 | NULL |  NULL |  ← 이전이 없으니 NULL
-- | 2026-03-02 | Spring AOP |  90 |  120 |   -30 |  ← 전날보다 30분 적게
-- | 2026-03-03 | SQL 기초   |  60 |   90 |   -30 |
-- | 2026-03-05 | JPA 입문   | 150 |   60 |   +90 |  ← 전날보다 90분 많이
```

| 함수 | 의미 | 예시 |
|------|------|------|
| `LAG(컬럼, n)` | **n행 이전** 값 | `LAG(study_time, 1)` = 바로 이전 행의 study_time |
| `LEAD(컬럼, n)` | **n행 다음** 값 | `LEAD(study_time, 1)` = 바로 다음 행의 study_time |

### 4-5. 누적 합계 / 이동 평균

```sql
-- 홍길동의 누적 학습 시간
SELECT
    study_date,
    study_time,
    SUM(study_time) OVER (
        ORDER BY study_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_time
FROM study_log
WHERE member_id = 1;

-- 결과:
-- | 2026-03-01 | 120 | 120 |
-- | 2026-03-02 |  90 | 210 |  ← 120 + 90
-- | 2026-03-03 |  60 | 270 |  ← 120 + 90 + 60
-- | 2026-03-05 | 150 | 420 |  ← 120 + 90 + 60 + 150
```

```sql
-- 최근 3건 이동 평균 (Moving Average)
SELECT
    study_date,
    study_time,
    ROUND(AVG(study_time) OVER (
        ORDER BY study_date
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ), 1) AS moving_avg_3
FROM study_log
WHERE member_id = 1;

-- 결과:
-- | 2026-03-01 | 120 | 120.0 |  ← 120/1
-- | 2026-03-02 |  90 | 105.0 |  ← (120+90)/2
-- | 2026-03-03 |  60 |  90.0 |  ← (120+90+60)/3
-- | 2026-03-05 | 150 | 100.0 |  ← (90+60+150)/3
```

**ROWS BETWEEN 정리:**

| 구문 | 의미 |
|------|------|
| `UNBOUNDED PRECEDING` | 그룹의 첫 행부터 |
| `n PRECEDING` | 현재 행에서 n행 전부터 |
| `CURRENT ROW` | 현재 행 |
| `n FOLLOWING` | 현재 행에서 n행 후까지 |
| `UNBOUNDED FOLLOWING` | 그룹의 마지막 행까지 |

### 4-6. NTILE — 분위 나누기

```sql
-- 학습 시간 기준으로 4분위 (상위 25%, 50%, 75%, 하위 25%)
SELECT
    title,
    study_time,
    NTILE(4) OVER (ORDER BY study_time DESC) AS quartile
FROM study_log;

-- quartile = 1이면 상위 25%, 4이면 하위 25%
```

---

## 5. CTE (Common Table Expression)

### CTE란?

**쿼리에 이름을 붙여서 재사용**하는 기법. `WITH` 키워드로 선언한다.

서브쿼리와 같은 결과를 내지만, **가독성이 훨씬 좋다**.

### 5-1. 기본 CTE

```sql
-- 서브쿼리 버전 (읽기 어려움)
SELECT *
FROM (
    SELECT category, COUNT(*) AS cnt, SUM(study_time) AS total
    FROM study_log
    GROUP BY category
) sub
WHERE sub.cnt >= 2;

-- CTE 버전 (읽기 좋음)
WITH category_stats AS (
    SELECT
        category,
        COUNT(*) AS cnt,
        SUM(study_time) AS total,
        ROUND(AVG(study_time), 1) AS avg_time
    FROM study_log
    GROUP BY category
)
SELECT category, cnt, total, avg_time
FROM category_stats
WHERE cnt >= 2
ORDER BY total DESC;
```

### 5-2. 다중 CTE

여러 개의 CTE를 쉼표로 연결할 수 있다:

```sql
-- 활발한 회원의 카테고리별 통계
WITH active_members AS (
    -- 학습 기록이 3건 이상인 회원
    SELECT member_id, COUNT(*) AS log_count
    FROM study_log
    GROUP BY member_id
    HAVING COUNT(*) >= 3
),
member_category_stats AS (
    -- 활발한 회원의 카테고리별 학습 시간
    SELECT
        s.member_id,
        m.name,
        s.category,
        SUM(s.study_time) AS total_time
    FROM study_log s
    JOIN member m ON s.member_id = m.id
    JOIN active_members am ON s.member_id = am.member_id
    GROUP BY s.member_id, m.name, s.category
)
SELECT *
FROM member_category_stats
ORDER BY name, total_time DESC;
```

> 💡 **CTE의 장점**: 복잡한 쿼리를 **단계별로 분리**해서 읽을 수 있다. 실무에서 긴 쿼리를 작성할 때 거의 필수.

### 5-3. 재귀 CTE — 계층 구조 조회

게시판 댓글처럼 **부모-자식 관계가 반복**되는 데이터를 조회할 때 사용한다.

```sql
-- 댓글 테이블 (자기 참조)
CREATE TABLE comment (
    id        BIGINT NOT NULL AUTO_INCREMENT,
    parent_id BIGINT NULL,      -- 최상위 댓글은 NULL
    content   VARCHAR(500) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (parent_id) REFERENCES comment(id)
);

INSERT INTO comment (id, parent_id, content) VALUES
    (1, NULL, '좋은 글이네요'),
    (2, 1,    '동의합니다'),
    (3, 1,    '저도요'),
    (4, 2,    '감사합니다'),
    (5, NULL, '질문이 있어요'),
    (6, 5,    '답변드립니다');
```

```sql
-- 재귀 CTE로 댓글 트리 조회
WITH RECURSIVE comment_tree AS (
    -- 기본 케이스: 최상위 댓글
    SELECT id, parent_id, content, 1 AS depth,
           CAST(id AS CHAR(200)) AS path
    FROM comment
    WHERE parent_id IS NULL

    UNION ALL

    -- 재귀 케이스: 자식 댓글을 찾아가기
    SELECT c.id, c.parent_id, c.content, ct.depth + 1,
           CONCAT(ct.path, ' > ', c.id)
    FROM comment c
    JOIN comment_tree ct ON c.parent_id = ct.id
    WHERE ct.depth < 10  -- 무한 루프 방지
)
SELECT
    REPEAT('  ', depth - 1) AS indent,  -- 들여쓰기
    content,
    depth
FROM comment_tree
ORDER BY path;
```

```
-- 결과:
-- |          | 좋은 글이네요   | 1 |
-- |   ·      | 동의합니다     | 2 |
-- |   · ·    | 감사합니다     | 3 |
-- |   ·      | 저도요         | 2 |
-- |          | 질문이 있어요   | 1 |
-- |   ·      | 답변드립니다    | 2 |
```

> 💡 **재귀 CTE 구조**: `기본 케이스 UNION ALL 재귀 케이스`. 반드시 **종료 조건**(depth < 10)을 넣어야 무한 루프를 방지한다.

---

## 6. GROUP BY 심화

### 6-1. WITH ROLLUP — 소계/총계 자동 생성

```sql
-- 카테고리별 통계 + 전체 합계
SELECT
    IFNULL(category, '== 전체 ==') AS category,
    COUNT(*) AS cnt,
    SUM(study_time) AS total_time
FROM study_log
GROUP BY category WITH ROLLUP;

-- 결과:
-- | DATABASE   | 2 | 130 |
-- | JPA        | 3 | 430 |
-- | REACT      | 3 | 260 |
-- | SPRING     | 5 | 520 |
-- | == 전체 == |13 |1340 |  ← ROLLUP이 자동 추가
```

### 6-2. 2차원 ROLLUP

```sql
-- 팀 + 카테고리 2단계 소계
SELECT
    IFNULL(m.team, '== 전체 ==') AS team,
    IFNULL(s.category, '소계') AS category,
    COUNT(*) AS cnt,
    SUM(s.study_time) AS total
FROM study_log s
JOIN member m ON s.member_id = m.id
GROUP BY m.team, s.category WITH ROLLUP;

-- 결과:
-- | 백엔드       | DATABASE | 2 | 130 |
-- | 백엔드       | JPA      | 3 | 430 |
-- | 백엔드       | SPRING   | 5 | 520 |
-- | 백엔드       | 소계     |10 |1080 |  ← 백엔드 소계
-- | 프론트엔드   | REACT    | 3 | 260 |
-- | 프론트엔드   | 소계     | 3 | 260 |  ← 프론트엔드 소계
-- | == 전체 ==   | 소계     |13 |1340 |  ← 전체 합계
```

---

## 7. EXPLAIN — 쿼리 성능 진단

### 7-1. EXPLAIN이란?

**쿼리를 실행하지 않고**, MySQL이 이 쿼리를 **어떻게 실행할 계획인지** 보여주는 명령어.

```sql
EXPLAIN SELECT * FROM study_log WHERE category = 'SPRING';
```

### 7-2. EXPLAIN 결과 읽기

핵심 컬럼:

| 컬럼 | 의미 | 봐야 할 것 |
|------|------|-----------|
| **type** | 접근 방식 | ALL이면 위험 (풀 스캔) |
| **key** | 사용한 인덱스 | NULL이면 인덱스 안 탐 |
| **rows** | 예상 조회 행 수 | 클수록 느림 |
| **Extra** | 추가 정보 | Using filesort, Using temporary 주의 |

### 7-3. type 컬럼 — 가장 중요

성능 좋은 순서:

| type | 의미 | 성능 |
|------|------|------|
| `const` | PK 또는 UNIQUE 인덱스로 1건 조회 | 최상 |
| `eq_ref` | JOIN에서 PK/UNIQUE 인덱스 사용 | 우수 |
| `ref` | 일반 인덱스로 동등 조건 | 양호 |
| `range` | 인덱스 범위 스캔 (`BETWEEN`, `>`, `<`) | 보통 |
| `index` | 인덱스 풀 스캔 (데이터는 안 읽지만 인덱스 전체 순회) | 낮음 |
| **`ALL`** | **테이블 풀 스캔** (최악) | 최악 |

```sql
-- const: PK로 1건 조회
EXPLAIN SELECT * FROM study_log WHERE id = 1;
-- type: const ✅

-- ALL: 인덱스 없는 컬럼으로 조회
EXPLAIN SELECT * FROM study_log WHERE category = 'SPRING';
-- type: ALL ❌ (category에 인덱스 없으면)

-- 인덱스 추가 후
CREATE INDEX idx_category ON study_log (category);
EXPLAIN SELECT * FROM study_log WHERE category = 'SPRING';
-- type: ref ✅ (인덱스 사용!)
```

### 7-4. 인덱스가 안 타는 경우 (함정!)

```sql
-- ❌ 컬럼에 함수를 쓰면 인덱스가 무효화
EXPLAIN SELECT * FROM study_log WHERE YEAR(study_date) = 2026;
-- type: ALL  (인덱스 안 탐!)

-- ✅ 범위 조건으로 바꾸면 인덱스 사용 가능
EXPLAIN SELECT * FROM study_log
WHERE study_date >= '2026-01-01' AND study_date < '2027-01-01';
-- type: range  (인덱스 탐!)
```

```sql
-- ❌ LIKE 앞에 %를 쓰면 인덱스 무효화
EXPLAIN SELECT * FROM study_log WHERE title LIKE '%Spring%';
-- type: ALL

-- ✅ 앞부분 매칭은 인덱스 사용 가능
EXPLAIN SELECT * FROM study_log WHERE title LIKE 'Spring%';
-- type: range
```

> 💡 **규칙**: 인덱스 컬럼을 **가공하지 마라**. 함수(`YEAR()`, `LOWER()`), 연산(`+ 1`), 타입 변환이 걸리면 인덱스를 못 탄다.

### 7-5. EXPLAIN ANALYZE (MySQL 8.0.18+)

실제로 쿼리를 **실행하면서** 소요 시간과 실제 처리 행 수를 보여준다:

```sql
EXPLAIN ANALYZE
SELECT s.title, m.name
FROM study_log s
JOIN member m ON s.member_id = m.id
WHERE s.category = 'SPRING';
```

---

## 8. 복합 인덱스 전략

### 복합 인덱스란?

여러 컬럼을 합쳐서 하나의 인덱스로 만드는 것:

```sql
-- category + study_date 복합 인덱스
CREATE INDEX idx_category_date ON study_log (category, study_date);
```

### 복합 인덱스의 규칙 — 왼쪽부터 순서대로

```sql
-- 인덱스: (category, study_date)

-- ✅ category만 조건 → 인덱스 사용
SELECT * FROM study_log WHERE category = 'SPRING';

-- ✅ category + study_date 모두 조건 → 인덱스 사용
SELECT * FROM study_log WHERE category = 'SPRING' AND study_date >= '2026-03-01';

-- ❌ study_date만 조건 → 인덱스 사용 불가!
SELECT * FROM study_log WHERE study_date >= '2026-03-01';
```

> 💡 **왼쪽 컬럼부터 매칭된다** (Leftmost Prefix Rule). (A, B, C) 인덱스는 A, AB, ABC 조건에서 사용되지만, B만, C만, BC만으로는 사용 안 된다.

### 복합 인덱스 설계 팁

```
1. WHERE에 자주 쓰는 컬럼을 왼쪽에
2. 카디널리티(값의 종류)가 높은 컬럼을 왼쪽에
3. 범위 조건(>, <, BETWEEN) 컬럼은 오른쪽에
```

```sql
-- 예: member_id(카디널리티 높음) + category + study_date(범위)
CREATE INDEX idx_member_category_date
ON study_log (member_id, category, study_date);

-- 이 인덱스가 효과적인 쿼리:
SELECT * FROM study_log
WHERE member_id = 1
  AND category = 'SPRING'
  AND study_date >= '2026-03-01';
```

---

## 9. 실전 종합 문제

### 문제 1: 월별 성장률

```sql
-- 월별 학습 시간 추이와 전월 대비 성장률
WITH monthly AS (
    SELECT
        DATE_FORMAT(study_date, '%Y-%m') AS month,
        SUM(study_time) AS total_time
    FROM study_log
    GROUP BY DATE_FORMAT(study_date, '%Y-%m')
)
SELECT
    month,
    total_time,
    LAG(total_time) OVER (ORDER BY month) AS prev_month,
    IFNULL(
        ROUND(
            (total_time - LAG(total_time) OVER (ORDER BY month))
            * 100.0 / LAG(total_time) OVER (ORDER BY month),
            1
        ),
        0
    ) AS growth_rate_pct
FROM monthly;
```

### 문제 2: 회원별 카테고리 순위와 비중

```sql
-- 각 회원이 가장 많이 공부한 카테고리 TOP 1
WITH member_category AS (
    SELECT
        m.name,
        s.category,
        SUM(s.study_time) AS total,
        ROW_NUMBER() OVER (
            PARTITION BY m.name
            ORDER BY SUM(s.study_time) DESC
        ) AS rn
    FROM study_log s
    JOIN member m ON s.member_id = m.id
    GROUP BY m.name, s.category
)
SELECT name, category, total
FROM member_category
WHERE rn = 1;
```

### 문제 3: 연속 학습일 계산

```sql
-- 홍길동의 학습 날짜와 전날 학습 여부
SELECT
    study_date,
    LAG(study_date) OVER (ORDER BY study_date) AS prev_date,
    DATEDIFF(
        study_date,
        LAG(study_date) OVER (ORDER BY study_date)
    ) AS gap_days
FROM study_log
WHERE member_id = 1
ORDER BY study_date;

-- gap_days = 1이면 연속, 2 이상이면 중간에 빠진 날이 있음
```

---

## 면접 대비

| 질문 | 핵심 답변 |
|------|-----------|
| 서브쿼리와 JOIN의 차이는? | 서브쿼리는 쿼리 안의 쿼리, JOIN은 테이블 연결. 일반적으로 JOIN이 옵티마이저 최적화에 유리하다 |
| 윈도우 함수란? | GROUP BY와 달리 행을 줄이지 않으면서 집계할 수 있는 함수. OVER(PARTITION BY ... ORDER BY ...)로 사용 |
| ROW_NUMBER vs RANK 차이? | ROW_NUMBER는 동점이어도 순번이 다름, RANK는 동점이면 같은 순위 + 다음 순위 건너뜀 |
| CTE란? | WITH 절로 쿼리에 이름을 붙여 가독성과 재사용성을 높이는 기법. MySQL 8.0+ 지원 |
| EXPLAIN에서 type: ALL이 나오면? | 테이블 풀 스캔. 인덱스가 없거나 안 타는 상태. WHERE 조건 컬럼에 인덱스를 추가하거나, 함수 사용을 제거해야 함 |
| 인덱스를 걸었는데 안 타는 이유? | 컬럼에 함수 사용(`YEAR(date)`), `LIKE '%xxx'`(앞에 %), 타입 불일치, 복합 인덱스의 왼쪽 컬럼 누락 등 |
| 복합 인덱스의 순서가 중요한 이유? | Leftmost Prefix Rule — 왼쪽 컬럼부터 순서대로 매칭. (A, B, C) 인덱스는 A, AB, ABC 조건에서만 사용됨 |
| LAG/LEAD란? | 현재 행 기준으로 이전/다음 행의 값을 참조하는 윈도우 함수. 시계열 비교(전월 대비 등)에 유용 |

---

> **다음**: [19. DB 설계와 정규화](../19-db-design-normalization/) — ERD 설계와 1NF~BCNF, 반정규화를 깊게 파고든다
