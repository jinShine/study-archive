# 18. SQL 심화

> **키워드**: `서브쿼리` `윈도우 함수` `ROW_NUMBER` `RANK` `LAG/LEAD` `CTE` `재귀 CTE` `GROUP BY 심화` `EXPLAIN` `실행 계획`

---

## 학습 우선순위

이 문서는 내용이 많다. 전부 외울 필요 없다. 우선순위를 먼저 확인하자.

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 서브쿼리, EXPLAIN, 인덱스 함정, 복합 인덱스 | 면접 + 실무에서 반드시 필요 |
| 🟡 이해 | 윈도우 함수(ROW_NUMBER, LAG), CTE 기본 | 개념을 이해하고, 쓸 때 찾아보면 됨 |
| 🟢 참고 | 재귀 CTE, NTILE, 누적 합계, ROLLUP | 있다는 것만 알면 됨 |

> 💡 **JPA를 쓰면 SQL을 직접 작성하는 비율이 크게 줄어든다.** 복잡한 윈도우 함수보다 인덱스 + EXPLAIN + 서브쿼리↔JOIN 변환이 100배 더 중요하다.

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

이번 장 전체에서 사용할 테이블이다. **Docker MySQL에 접속해서 직접 실행해보자.**

```sql
-- 기존 테이블이 있다면 삭제 (순서 중요: FK가 있는 테이블 먼저)
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
    study_time INT          NOT NULL,  -- 분 단위
    study_date DATE         NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (member_id) REFERENCES member(id)
);

-- 샘플 데이터 (회원 5명)
INSERT INTO member (name, team) VALUES
    ('홍길동', '백엔드'), ('김철수', '백엔드'), ('이영희', '프론트엔드'),
    ('박민수', '백엔드'), ('정수진', '프론트엔드');

-- 샘플 데이터 (학습 기록 13건)
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

데이터를 넣었으면 확인:

```sql
SELECT * FROM member;          -- 5명
SELECT * FROM study_log;       -- 13건
SELECT COUNT(*) FROM study_log; -- 13
```

---

## 🔴 3. 서브쿼리 (Subquery) — 면접 필수

### 서브쿼리란?

**쿼리 안에 들어가는 또 다른 쿼리**다. 괄호 `()` 안에 작성한다.

비유하면 이렇다:

```
일반 쿼리:  "학습 시간이 100분 넘는 기록 보여줘"
서브쿼리:   "학습 시간이 [평균]보다 큰 기록 보여줘"
                        ↑ 이 평균을 구하는 것도 쿼리!
```

### 3-1. WHERE 절 서브쿼리 — 가장 흔한 사용법

#### 단일 값 비교

```sql
-- "평균보다 오래 공부한 기록"을 보고 싶다면?
-- 문제: 평균이 몇 분인지 모른다

-- 방법 1: 먼저 평균을 구하고
SELECT AVG(study_time) FROM study_log;
-- 결과: 103.0769...

-- 그 다음 그 값으로 조회
SELECT title, study_time FROM study_log WHERE study_time > 103;

-- 방법 2: 서브쿼리로 한 번에! (이게 서브쿼리)
SELECT title, study_time
FROM study_log
WHERE study_time > (SELECT AVG(study_time) FROM study_log);
--                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
--                  이 부분이 서브쿼리. 먼저 실행되어 103이 됨.
--                  그러면 WHERE study_time > 103 과 같아진다.
```

**실행 순서를 단계별로 보자:**

```
Step 1: 안쪽 쿼리 먼저 실행
        SELECT AVG(study_time) FROM study_log
        → 결과: 103.08

Step 2: 바깥 쿼리에 값 대입
        SELECT title, study_time
        FROM study_log
        WHERE study_time > 103.08

Step 3: 결과
        | JPA 입문        | 150 |  ← 103보다 큼 ✅
        | React 기초      | 110 |
        | Spring Security | 130 |
        | JPA 심화        | 180 |
        | Spring DI       | 120 |
```

#### IN — "이 목록 안에 있는가?"

```sql
-- 질문: "학습 기록이 있는 회원"만 보고 싶다
-- 생각: study_log 테이블에 member_id가 존재하는 회원만 member에서 골라내면 되겠네

SELECT name
FROM member
WHERE id IN (SELECT DISTINCT member_id FROM study_log);
--           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
--           먼저 실행: study_log에 있는 member_id 목록 → (1, 2, 3, 4, 5)
--           그러면 WHERE id IN (1, 2, 3, 4, 5) 와 같아진다.
```

```sql
-- 반대: "학습 기록이 없는 회원"
SELECT name
FROM member
WHERE id NOT IN (SELECT DISTINCT member_id FROM study_log);
-- 모든 회원이 기록이 있으므로 결과 0건
```

> 💡 **IN 서브쿼리**는 "목록을 먼저 만들고, 그 목록에 포함되는지 확인"하는 패턴이다.

### 3-2. EXISTS — "존재하는가?" 확인

IN과 비슷하지만 동작 방식이 다르다:

```sql
-- "학습 기록이 1건이라도 있는 회원"
SELECT m.name
FROM member m
WHERE EXISTS (
    SELECT 1 FROM study_log s WHERE s.member_id = m.id
);
```

**IN vs EXISTS 동작 차이를 비유하면:**

```
IN:     전화번호부를 전부 복사해서 → 내 번호가 있는지 찾는다
EXISTS: 전화번호부를 한 줄씩 보다가 → 내 번호 발견하면 즉시 "있다!" 하고 멈춘다

→ 전화번호부(= 서브쿼리 대상 테이블)가 크면 EXISTS가 빠르다
→ 전화번호부가 작으면 IN이 편하다
```

| 비교 | IN | EXISTS |
|------|-----|--------|
| 동작 | 서브쿼리 결과를 **전부** 가져와서 비교 | 매칭되는 첫 행을 찾으면 **즉시 중단** |
| 적합한 상황 | 서브쿼리 결과가 적을 때 | 서브쿼리 대상 테이블이 클 때 |
| 면접 답변 | "IN은 결과셋을 메모리에 올려서 비교하고, EXISTS는 조건 만족 시 즉시 반환합니다" |

### 3-3. 상관 서브쿼리 — 바깥 쿼리를 참조하는 서브쿼리

지금까지의 서브쿼리는 안쪽이 독립적으로 실행됐다. 하지만 **상관 서브쿼리**는 바깥 쿼리의 값을 참조한다:

```sql
-- "각 카테고리에서 학습 시간이 가장 긴 기록"
SELECT s1.title, s1.category, s1.study_time
FROM study_log s1
WHERE s1.study_time = (
    SELECT MAX(s2.study_time)
    FROM study_log s2
    WHERE s2.category = s1.category   -- ← 바깥의 s1.category를 참조!
);
```

**실행 과정을 추적하면:**

```
바깥 쿼리가 study_log의 1행째를 읽음: category = 'SPRING'
  → 안쪽 쿼리: SELECT MAX(study_time) FROM study_log WHERE category = 'SPRING' → 130
  → 1행의 study_time(120) == 130? → No → 제외

바깥 쿼리가 2행째를 읽음: category = 'SPRING'
  → 안쪽 쿼리: 같은 SPRING → 130
  → 2행의 study_time(90) == 130? → No → 제외

...

바깥 쿼리가 10행째를 읽음: category = 'SPRING', study_time = 130
  → 안쪽 쿼리: SPRING의 MAX → 130
  → 130 == 130? → Yes! → 결과에 포함

→ 바깥 행이 13개면 안쪽 쿼리가 13번 실행됨!
→ 데이터가 많으면 매우 느려진다
```

> ⚠️ 상관 서브쿼리는 **행마다 서브쿼리가 실행**되므로 느리다. 뒤에서 배울 **윈도우 함수**로 대체하는 게 일반적이다.

### 🔴 3-4. 서브쿼리 → JOIN 변환 (면접 단골!)

**면접에서 "이 서브쿼리를 JOIN으로 바꿔보세요"라고 자주 물어본다.**

```sql
-- ❌ 서브쿼리 버전 (SELECT 절 — 스칼라 서브쿼리)
SELECT
    id,
    title,
    (SELECT name FROM member WHERE id = s.member_id) AS author_name
FROM study_log s;

-- 이 서브쿼리는 study_log 행마다 1번씩 실행됨
-- 13건이면 13번, 10만 건이면 10만 번!
```

```sql
-- ✅ JOIN 버전 (같은 결과, 훨씬 빠름)
SELECT
    s.id,
    s.title,
    m.name AS author_name
FROM study_log s
JOIN member m ON s.member_id = m.id;

-- JOIN은 한 번에 연결해서 가져옴
```

**왜 JOIN이 빠른가?**

```
서브쿼리:  "학습 기록 1건 읽고 → 회원 찾고 → 학습 기록 1건 읽고 → 회원 찾고..."
           = 왔다 갔다 13번

JOIN:      "학습 기록과 회원을 한 번에 연결해서 가져와"
           = 한 번에 처리
```

> 💡 **규칙**: SELECT 절의 서브쿼리(스칼라 서브쿼리)는 웬만하면 **JOIN으로 바꿔라**. 데이터가 많아지면 성능 차이가 극적이다.

---

## 🟡 4. 윈도우 함수 (Window Functions)

> 전부 외울 필요 없다. **"이런 게 가능하구나"**를 알고, 필요할 때 찾아보면 된다.

### 윈도우 함수란?

**행의 개수를 줄이지 않으면서** 집계 계산을 하는 함수.

가장 쉽게 이해하는 방법은 GROUP BY와 비교하는 것이다:

```sql
-- GROUP BY: 카테고리를 "뭉개서" 4행으로 만든다
SELECT category, SUM(study_time) AS total
FROM study_log
GROUP BY category;

-- 결과: 4행 (원래 13행이었는데 카테고리별로 합쳐짐)
-- | SPRING   | 520 |
-- | DATABASE | 130 |
-- | JPA      | 430 |
-- | REACT    | 260 |
```

```sql
-- 윈도우 함수: 원래 13행 그대로 유지 + 옆에 합계 컬럼을 붙여준다
SELECT
    title,
    category,
    study_time,
    SUM(study_time) OVER (PARTITION BY category) AS category_total
FROM study_log;

-- 결과: 13행 그대로!
-- | Spring DI       | SPRING   | 120 | 520 |  ← SPRING 합계 520이 옆에 붙음
-- | Spring AOP      | SPRING   |  90 | 520 |  ← 같은 SPRING이니 520
-- | Spring MVC      | SPRING   |  80 | 520 |
-- | SQL 기초(홍)    | DATABASE |  60 | 130 |  ← DATABASE 합계 130
-- | SQL 기초(김)    | DATABASE |  70 | 130 |
-- | JPA 입문        | JPA      | 150 | 430 |  ← JPA 합계 430
-- | ...
```

**비유:**

```
GROUP BY:     반 평균을 구하면 → 학생 개인 성적은 사라지고 "평균 85점"만 남음
윈도우 함수:  반 평균을 구하되 → 학생 개인 성적은 그대로 두고, 옆에 "반 평균 85점"을 적어줌
```

### 윈도우 함수 기본 문법

```sql
함수() OVER (
    PARTITION BY 그룹_기준    -- "어떤 그룹 안에서?" (선택사항)
    ORDER BY 정렬_기준        -- "그룹 안에서 어떤 순서로?" (선택사항)
)
```

| 부분 | 역할 | GROUP BY 비유 |
|------|------|---------------|
| `PARTITION BY` | 어떤 그룹으로 나눌지 | `GROUP BY`와 비슷 |
| `ORDER BY` | 그룹 안에서 정렬 순서 | 순위를 매기거나 누적 계산할 때 필요 |

### 4-1. ROW_NUMBER — 순번 매기기

**가장 많이 쓰는 윈도우 함수**다.

```sql
-- 학습 시간이 긴 순서대로 번호 매기기
SELECT
    title,
    study_time,
    ROW_NUMBER() OVER (ORDER BY study_time DESC) AS ranking
FROM study_log;

-- 결과:
-- | JPA 심화        | 180 | 1 |  ← 가장 오래 공부
-- | JPA 입문        | 150 | 2 |
-- | Spring Security | 130 | 3 |
-- | Spring DI       | 120 | 4 |
-- | React 기초      | 110 | 5 |
-- | REST API        | 100 | 6 |
-- | QueryDSL        | 100 | 7 |  ← 같은 100분이어도 번호가 다름!
-- | Spring AOP      |  90 | 8 |
-- | ...
```

### 4-2. ROW_NUMBER vs RANK vs DENSE_RANK

**동점일 때** 처리가 다르다:

```sql
SELECT
    title,
    study_time,
    ROW_NUMBER() OVER (ORDER BY study_time DESC) AS row_num,
    RANK()       OVER (ORDER BY study_time DESC) AS rank_num,
    DENSE_RANK() OVER (ORDER BY study_time DESC) AS dense_num
FROM study_log;
```

100분인 기록이 2개 있을 때를 보자:

```
... (위에 5개는 동일) ...
| REST API   | 100 | 6 | 6 | 6 |
| QueryDSL   | 100 | 7 | 6 | 6 |  ← 여기가 다름!
| Spring AOP |  90 | 8 | 8 | 7 |  ← 여기도 다름!
```

| 함수 | 100분 2명 처리 | 그 다음(90분) 순위 | 쉽게 기억 |
|------|---------------|-------------------|----------|
| `ROW_NUMBER` | 6번, **7**번 (무조건 다른 번호) | **8**번 | 엑셀 행 번호 |
| `RANK` | **6**번, **6**번 (동점 = 같은 순위) | **8**번 (6,6 → 8로 건너뜀) | 운동회 등수 |
| `DENSE_RANK` | **6**번, **6**번 | **7**번 (안 건너뜀) | 빽빽한 등수 |

> 💡 실무에서는 **ROW_NUMBER를 가장 많이** 쓴다. 페이징, Top N 등에 쓰임.

### 4-3. PARTITION BY — 그룹별로 순위 매기기

**"카테고리별로 학습 시간 1등은?"** 같은 질문에 쓴다:

```sql
SELECT
    category,
    title,
    study_time,
    ROW_NUMBER() OVER (
        PARTITION BY category      -- 카테고리별로 따로 번호 매김
        ORDER BY study_time DESC   -- 학습 시간 긴 순
    ) AS rn
FROM study_log;
```

```
-- 결과: 각 카테고리 안에서 1번부터 다시 시작!
-- | DATABASE | SQL 기초(김)    |  70 | 1 |  ← DATABASE 1등
-- | DATABASE | SQL 기초(홍)    |  60 | 2 |
-- | JPA      | JPA 심화        | 180 | 1 |  ← JPA 1등
-- | JPA      | JPA 입문        | 150 | 2 |
-- | JPA      | QueryDSL        | 100 | 3 |
-- | REACT    | React 기초      | 110 | 1 |  ← REACT 1등
-- | REACT    | TypeScript      |  90 | 2 |
-- | REACT    | CSS Grid        |  60 | 3 |
-- | SPRING   | Spring Security | 130 | 1 |  ← SPRING 1등
-- | SPRING   | Spring DI       | 120 | 2 |
-- | ...
```

### 4-4. 실전 패턴: 그룹별 Top N (자주 쓰임!)

**"각 카테고리에서 1등만 보여줘"** — 이 패턴은 실무에서 정말 자주 쓴다.

원리: ROW_NUMBER로 순번을 매긴 다음, `WHERE rn = 1`로 1등만 골라낸다.

문제는 `WHERE`에서 윈도우 함수를 직접 쓸 수 없다는 것이다:

```sql
-- ❌ 이렇게 안 됨!
SELECT *
FROM study_log
WHERE ROW_NUMBER() OVER (...) = 1;  -- 에러!
```

그래서 **서브쿼리(또는 CTE)로 감싸야** 한다:

```sql
-- ✅ 서브쿼리로 감싸기
SELECT category, title, study_time
FROM (
    SELECT
        category,
        title,
        study_time,
        ROW_NUMBER() OVER (
            PARTITION BY category
            ORDER BY study_time DESC
        ) AS rn
    FROM study_log
) ranked
WHERE rn = 1;

-- 결과:
-- | DATABASE | SQL 기초(김)    |  70 |
-- | JPA      | JPA 심화        | 180 |
-- | REACT    | React 기초      | 110 |
-- | SPRING   | Spring Security | 130 |
```

> 💡 `WHERE rn <= 3`으로 바꾸면 **카테고리별 Top 3**이 된다. 이 패턴만 기억하자!

### 4-5. LAG / LEAD — 이전/다음 행 참조

"어제보다 얼마나 더/덜 공부했는가?"를 구할 때 쓴다:

```sql
-- 홍길동의 학습 기록: 이전 기록과 비교
SELECT
    study_date,
    title,
    study_time,
    LAG(study_time, 1) OVER (ORDER BY study_date) AS prev_time
FROM study_log
WHERE member_id = 1
ORDER BY study_date;
```

```
-- 결과:
-- | 2026-03-01 | Spring DI  | 120 | NULL |  ← 첫 행은 이전이 없으니 NULL
-- | 2026-03-02 | Spring AOP |  90 |  120 |  ← 이전 행의 study_time = 120
-- | 2026-03-03 | SQL 기초   |  60 |   90 |  ← 이전 행의 study_time = 90
-- | 2026-03-05 | JPA 입문   | 150 |   60 |  ← 이전 행의 study_time = 60
```

**LAG가 하는 일을 그림으로 보면:**

```
행 1: Spring DI   120  ← LAG: 위를 봄 → 없음 → NULL
행 2: Spring AOP   90  ← LAG: 위를 봄 → 120
행 3: SQL 기초     60  ← LAG: 위를 봄 → 90
행 4: JPA 입문    150  ← LAG: 위를 봄 → 60
```

| 함수 | 방향 | 의미 | 쉬운 기억 |
|------|------|------|----------|
| `LAG(컬럼, 1)` | ↑ 위 | 바로 이전 행의 값 | "뒤돌아봄 (lag = 지연)" |
| `LEAD(컬럼, 1)` | ↓ 아래 | 바로 다음 행의 값 | "앞을 봄 (lead = 앞서감)" |

> 💡 면접 수준: "LAG/LEAD가 뭔지" 한 줄로 설명할 수 있으면 된다. 구문을 외울 필요는 없다.

### 🟢 4-6. 누적 합계 / 이동 평균 (참고만)

> 이 부분은 데이터 분석 영역에 가깝다. "이런 것도 가능하구나" 수준으로만 보자.

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

### 🟢 4-7. NTILE — 분위 나누기 (참고만)

```sql
-- 학습 시간 기준으로 4분위
SELECT title, study_time,
    NTILE(4) OVER (ORDER BY study_time DESC) AS quartile
FROM study_log;
-- quartile = 1이면 상위 25%, 4이면 하위 25%
```

---

## 🟡 5. CTE (Common Table Expression)

### CTE란?

**복잡한 쿼리에 이름을 붙여서** 읽기 쉽게 만드는 기법이다.

비유하면:

```
서브쿼리:  함수 없이 모든 로직을 main()에 다 때려넣는 것
CTE:       로직을 함수로 분리하는 것 (가독성 ↑)
```

### 5-1. 기본 CTE — WITH 키워드

```sql
-- 서브쿼리 버전: 괄호가 중첩되어 읽기 어려움
SELECT *
FROM (
    SELECT category, COUNT(*) AS cnt, SUM(study_time) AS total
    FROM study_log
    GROUP BY category
) sub
WHERE sub.cnt >= 2;
```

```sql
-- CTE 버전: 같은 결과인데 읽기 훨씬 쉬움!
WITH category_stats AS (
    -- Step 1: 카테고리별 통계를 먼저 구한다
    SELECT
        category,
        COUNT(*) AS cnt,
        SUM(study_time) AS total,
        ROUND(AVG(study_time), 1) AS avg_time
    FROM study_log
    GROUP BY category
)
-- Step 2: 그 결과에서 2건 이상만 필터링
SELECT category, cnt, total, avg_time
FROM category_stats
WHERE cnt >= 2
ORDER BY total DESC;
```

**CTE 구조:**

```sql
WITH 이름 AS (
    -- 여기에 쿼리 작성 (이 결과에 "이름"이라는 별명이 붙음)
)
SELECT ...
FROM 이름   -- 위에서 만든 결과를 테이블처럼 사용
WHERE ...
```

> 💡 `WITH`는 "임시 테이블을 하나 만들겠다"고 생각하면 쉽다. 실제 테이블은 아니고, 쿼리 안에서만 존재한다.

### 5-2. 다중 CTE

여러 단계로 분리할 수도 있다:

```sql
WITH
-- Step 1: 활발한 회원 찾기
active_members AS (
    SELECT member_id, COUNT(*) AS log_count
    FROM study_log
    GROUP BY member_id
    HAVING COUNT(*) >= 3
),
-- Step 2: 활발한 회원의 카테고리별 통계
member_category AS (
    SELECT s.member_id, m.name, s.category, SUM(s.study_time) AS total_time
    FROM study_log s
    JOIN member m ON s.member_id = m.id
    JOIN active_members am ON s.member_id = am.member_id  -- Step 1 결과 사용!
    GROUP BY s.member_id, m.name, s.category
)
-- Step 3: 최종 출력
SELECT * FROM member_category ORDER BY name, total_time DESC;
```

### CTE + ROW_NUMBER 조합 (Top N 패턴의 읽기 좋은 버전)

4-4에서 서브쿼리로 했던 것을 CTE로 더 깔끔하게:

```sql
-- "각 카테고리에서 가장 오래 공부한 1건"
WITH ranked AS (
    SELECT
        category, title, study_time,
        ROW_NUMBER() OVER (PARTITION BY category ORDER BY study_time DESC) AS rn
    FROM study_log
)
SELECT category, title, study_time
FROM ranked
WHERE rn = 1;
```

### 🟢 5-3. 재귀 CTE (참고만 — 실무에서 거의 안 씀)

게시판 댓글 트리처럼 **부모-자식 관계가 반복**되는 데이터를 조회할 때 사용한다. 개념만 알아두자:

```sql
-- 댓글 계층 구조 조회 (이런 게 가능하다는 것만 알면 됨)
WITH RECURSIVE comment_tree AS (
    -- 시작점: 최상위 댓글
    SELECT id, content, 1 AS depth
    FROM comment WHERE parent_id IS NULL

    UNION ALL

    -- 반복: 자식 댓글을 찾아 내려감
    SELECT c.id, c.content, ct.depth + 1
    FROM comment c
    JOIN comment_tree ct ON c.parent_id = ct.id
    WHERE ct.depth < 10  -- 무한 루프 방지 필수!
)
SELECT * FROM comment_tree;
```

---

## 🟢 6. GROUP BY 심화 — WITH ROLLUP (참고만)

```sql
-- 카테고리별 통계 + 전체 합계를 자동으로 붙여줌
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
-- | == 전체 == |13 |1340 |  ← ROLLUP이 자동으로 추가한 합계 행
```

> 💡 엑셀의 "부분합" 기능과 비슷하다. 있다는 것만 알면 된다.

---

## 🔴 7. EXPLAIN — 쿼리 성능 진단 (면접 필수)

### 7-1. EXPLAIN이란?

**"이 쿼리를 MySQL이 어떻게 실행할 계획인지"** 보여주는 명령어.

쿼리를 실제로 실행하는 게 아니라, **실행 계획만 보여준다.**

```sql
-- 사용법: 쿼리 앞에 EXPLAIN만 붙이면 됨!
EXPLAIN SELECT * FROM study_log WHERE category = 'SPRING';
```

### 7-2. EXPLAIN 결과에서 봐야 할 것

EXPLAIN을 실행하면 여러 컬럼이 나오는데, **4개만 보면 된다:**

| 컬럼 | 의미 | 이것만 봐라 |
|------|------|-----------|
| **type** | MySQL이 테이블에 접근하는 방식 | **ALL이면 위험!** (풀 스캔) |
| **key** | 실제로 사용한 인덱스 이름 | **NULL이면 인덱스 안 탔다** |
| **rows** | 검색할 것으로 예상되는 행 수 | **클수록 느림** |
| **Extra** | 추가 정보 | Using filesort, Using temporary 주의 |

### 7-3. type 컬럼 — 가장 중요!

`type`은 **"MySQL이 데이터를 어떻게 찾는가"**를 알려준다.

**성능 좋은 순서대로:**

| type | 의미 | 비유 | 성능 |
|------|------|------|------|
| `const` | PK/UNIQUE 인덱스로 **딱 1건** | "3번 서랍 열어!" | 최상 |
| `eq_ref` | JOIN에서 PK/UNIQUE로 매칭 | "이름표 보고 찾기" | 우수 |
| `ref` | 일반 인덱스로 동등 조건 | "목차에서 'SPRING' 찾기" | 양호 |
| `range` | 인덱스 범위 스캔 | "목차에서 3월 1일~5일 범위 찾기" | 보통 |
| `index` | 인덱스 전체를 순회 | "목차를 처음부터 끝까지 읽기" | 낮음 |
| **`ALL`** | **테이블 전체를 순회 (풀 스캔)** | **"책을 1페이지부터 끝까지 다 넘기기"** | **최악** |

```sql
-- 직접 실행해보자!

-- 1) const: PK로 1건 조회 → 최상의 성능
EXPLAIN SELECT * FROM study_log WHERE id = 1;
-- type: const ✅

-- 2) ALL: 인덱스 없는 컬럼 조회 → 풀 스캔!
EXPLAIN SELECT * FROM study_log WHERE category = 'SPRING';
-- type: ALL ❌ (category에 인덱스가 없으니까)

-- 3) 인덱스를 추가하면?
CREATE INDEX idx_category ON study_log (category);
EXPLAIN SELECT * FROM study_log WHERE category = 'SPRING';
-- type: ref ✅ (인덱스를 타게 됐다!)
```

> 💡 **면접 답변**: "EXPLAIN에서 type이 ALL이면 풀 스캔이므로, WHERE 조건의 컬럼에 인덱스를 추가해야 합니다."

### 🔴 7-4. 인덱스가 안 타는 경우 (면접 단골!)

**"인덱스를 걸었는데 왜 안 타나요?"** — 이 질문에 답할 수 있어야 한다.

#### 함정 1: 컬럼에 함수를 쓰면 인덱스 무효화

```sql
-- study_date에 인덱스가 있다고 가정

-- ❌ 함수로 감싸면 인덱스를 못 탄다!
SELECT * FROM study_log WHERE YEAR(study_date) = 2026;
-- MySQL: "YEAR()의 결과값은 인덱스에 없는데... 전부 읽어야 하네"
-- type: ALL (풀 스캔!)
```

**왜 안 되는가?** 인덱스에는 `study_date` 원본 값(2026-03-01, 2026-03-02...)이 정렬되어 있다. 그런데 `YEAR(study_date)`는 **가공된 값**이니까 인덱스에서 찾을 수 없다.

```sql
-- ✅ 해결: 범위 조건으로 바꾸면 인덱스 사용 가능!
SELECT * FROM study_log
WHERE study_date >= '2026-01-01' AND study_date < '2027-01-01';
-- MySQL: "2026-01-01 ~ 2027-01-01 사이를 인덱스에서 범위 검색"
-- type: range (인덱스 사용!)
```

#### 함정 2: LIKE 앞에 %를 쓰면 인덱스 무효화

```sql
-- title에 인덱스가 있다고 가정

-- ❌ %가 앞에 오면 안 됨
SELECT * FROM study_log WHERE title LIKE '%Spring%';
-- MySQL: "'Spring'이 어디에 있을지 모르니까 전부 확인해야 해"
-- type: ALL

-- ✅ %가 뒤에만 있으면 OK
SELECT * FROM study_log WHERE title LIKE 'Spring%';
-- MySQL: "'Spring'으로 시작하는 것을 인덱스에서 범위 검색"
-- type: range
```

**왜 안 되는가?** 인덱스는 **"사전순"으로 정렬**되어 있다.
- `Spring%` → "S로 시작하는 곳부터 찾으면 됨" ✅
- `%Spring%` → "어디에 Spring이 있을지 모름. 전부 읽어야 함" ❌

#### 함정 3: 타입이 다르면 인덱스 무효화

```sql
-- member_id는 BIGINT(숫자)인데 문자열로 비교하면
SELECT * FROM study_log WHERE member_id = '1';
-- MySQL이 내부적으로 타입 변환 → 인덱스 못 탈 수 있음

-- ✅ 올바른 타입으로 비교
SELECT * FROM study_log WHERE member_id = 1;
```

#### 인덱스 안 타는 경우 정리

| 원인 | 예시 | 해결 |
|------|------|------|
| 컬럼에 함수 사용 | `WHERE YEAR(date) = 2026` | 범위 조건으로 변환 |
| LIKE 앞에 % | `WHERE title LIKE '%abc'` | 앞부분 매칭으로 변경, 또는 Full-Text 인덱스 |
| 타입 불일치 | 숫자 컬럼에 문자열 비교 | 올바른 타입 사용 |
| 복합 인덱스 왼쪽 컬럼 누락 | (A, B) 인덱스에서 B만 조건 | A 조건 추가 또는 B 단독 인덱스 생성 |

> 💡 **한 줄 규칙: 인덱스 컬럼을 가공하지 마라!** 함수, 연산(`+ 1`), 타입 변환이 걸리면 인덱스를 못 탄다.

---

## 🔴 8. 복합 인덱스 전략 (면접 필수)

### 복합 인덱스란?

**여러 컬럼을 합쳐서** 하나의 인덱스로 만드는 것:

```sql
CREATE INDEX idx_category_date ON study_log (category, study_date);
-- category + study_date를 합쳐서 하나의 인덱스
```

### 왜 필요한가?

```sql
-- 이런 쿼리가 자주 실행된다면:
SELECT * FROM study_log
WHERE category = 'SPRING' AND study_date >= '2026-03-01';

-- category 인덱스만 있으면:
-- Step 1: category = 'SPRING' → 인덱스로 5건 찾음
-- Step 2: 그 5건에서 study_date >= 3/1 → 하나씩 확인 (추가 필터링)

-- 복합 인덱스 (category, study_date)가 있으면:
-- Step 1: category = 'SPRING' AND study_date >= 3/1 → 한 번에 찾음!
```

### 🔴 Leftmost Prefix Rule (면접 단골!)

**복합 인덱스는 왼쪽 컬럼부터 순서대로 사용된다.**

```sql
-- 인덱스: (category, study_date) — 이 순서가 중요!

-- ✅ 왼쪽(category)만 조건 → 인덱스 사용 OK
SELECT * FROM study_log WHERE category = 'SPRING';

-- ✅ 왼쪽 + 오른쪽 둘 다 조건 → 인덱스 사용 OK
SELECT * FROM study_log
WHERE category = 'SPRING' AND study_date >= '2026-03-01';

-- ❌ 오른쪽(study_date)만 조건 → 인덱스 사용 불가!
SELECT * FROM study_log WHERE study_date >= '2026-03-01';
```

**비유로 이해하기:**

```
복합 인덱스 (category, study_date)는 전화번호부와 같다.

전화번호부가 "성(category) → 이름(study_date)" 순서로 정렬되어 있다면:

✅ "김씨를 찾아줘"                    → 김씨 섹션으로 바로 이동 가능
✅ "김씨 중에서 '철수'를 찾아줘"       → 김씨 섹션에서 철수를 찾을 수 있음
❌ "'철수'를 찾아줘" (성 모름)          → 처음부터 끝까지 전부 봐야 함!
```

**더 큰 예시: (A, B, C) 복합 인덱스**

| WHERE 조건 | 인덱스 사용? | 이유 |
|------------|-------------|------|
| `WHERE A = 1` | ✅ | 왼쪽부터 매칭 |
| `WHERE A = 1 AND B = 2` | ✅ | 왼쪽 2개 매칭 |
| `WHERE A = 1 AND B = 2 AND C = 3` | ✅ | 전부 매칭 |
| `WHERE B = 2` | ❌ | A가 빠짐 |
| `WHERE C = 3` | ❌ | A, B가 빠짐 |
| `WHERE B = 2 AND C = 3` | ❌ | A가 빠짐 |
| `WHERE A = 1 AND C = 3` | 🔺 부분 | A만 인덱스 사용, C는 필터링 |

### 복합 인덱스 설계 팁 (실무)

```
순서 정하는 기준:
1. WHERE에 자주 쓰는 컬럼을 왼쪽에
2. = 조건 컬럼을 왼쪽, 범위(>, <) 조건 컬럼을 오른쪽에
3. 카디널리티(값의 종류 수)가 높은 컬럼을 왼쪽에
```

```sql
-- 예시: 이 쿼리를 자주 실행한다면
SELECT * FROM study_log
WHERE member_id = 1            -- = 조건, 카디널리티 높음 (5명)
  AND category = 'SPRING'      -- = 조건, 카디널리티 중간 (4종류)
  AND study_date >= '2026-03-01'; -- 범위 조건

-- 최적 인덱스:
CREATE INDEX idx_member_cat_date
ON study_log (member_id, category, study_date);
--            ① = 조건   ② = 조건   ③ 범위 조건 (맨 오른쪽)
```

---

## 9. 실전 종합 문제 (도전해보기)

> 여유가 있으면 풀어보자. 못 풀어도 전혀 문제없다.

### 문제 1: 월별 학습 시간 추이

```sql
-- CTE + LAG로 전월 대비 성장률 계산
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
            * 100.0 / LAG(total_time) OVER (ORDER BY month), 1
        ), 0
    ) AS growth_rate_pct
FROM monthly;
```

### 문제 2: 각 회원이 가장 많이 공부한 카테고리

```sql
-- ROW_NUMBER + PARTITION BY로 회원별 Top 1 카테고리
WITH member_cat AS (
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
FROM member_cat
WHERE rn = 1;
```

---

## 면접 대비

### 🔴 반드시 답할 수 있어야 하는 것

| 질문 | 핵심 답변 |
|------|-----------|
| **서브쿼리와 JOIN의 차이는?** | 서브쿼리는 쿼리 안의 쿼리, JOIN은 테이블 연결. 일반적으로 JOIN이 옵티마이저 최적화에 유리하다 |
| **EXPLAIN에서 type: ALL이 나오면?** | 테이블 풀 스캔. 인덱스가 없거나 안 타는 상태. WHERE 컬럼에 인덱스를 추가해야 함 |
| **인덱스를 걸었는데 안 타는 이유?** | ① 컬럼에 함수 사용 ② LIKE '%abc' ③ 타입 불일치 ④ 복합 인덱스의 왼쪽 컬럼 누락 |
| **복합 인덱스의 순서가 중요한 이유?** | Leftmost Prefix Rule — 왼쪽 컬럼부터 순서대로 매칭. (A,B,C) 인덱스는 A, AB, ABC 조건에서만 사용됨 |

### 🟡 개념만 설명하면 되는 것

| 질문 | 핵심 답변 |
|------|-----------|
| 윈도우 함수란? | GROUP BY와 달리 행을 줄이지 않으면서 집계할 수 있는 함수. `OVER()` 절을 사용 |
| ROW_NUMBER vs RANK 차이? | ROW_NUMBER는 동점이어도 순번이 다름, RANK는 동점이면 같은 순위 + 다음 순위 건너뜀 |
| CTE란? | `WITH` 절로 쿼리에 이름을 붙여 가독성을 높이는 기법 |
| LAG/LEAD란? | 현재 행 기준으로 이전/다음 행의 값을 참조하는 윈도우 함수 |

---

> **다음**: [19. DB 설계와 정규화](../19-db-design-normalization/) — ERD 설계와 1NF~BCNF, 반정규화를 깊게 다룬다
