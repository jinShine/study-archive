# 18. SQL 심화

> 오늘의 목표: 단순 CRUD를 넘어서 집계, 분석, 복잡한 조회를 SQL로 표현할 수 있는 기초 체력을 만든다.

---

## 오늘 끝나면 되는 것

- `GROUP BY`와 `HAVING` 차이를 이해할 수 있다.
- 서브쿼리가 왜 필요한지 설명할 수 있다.
- 윈도우 함수의 기본 감각을 잡을 수 있다.
- CTE가 왜 긴 쿼리를 읽기 쉽게 만드는지 이해할 수 있다.
- `EXPLAIN`으로 실행 계획을 보는 이유를 안다.

---

## 머릿속 그림

기본 SQL은 "한 번에 한 건씩 찾기"에 가깝습니다.

심화 SQL은 이런 질문을 다룹니다.

- 카테고리별 학습 일지 개수는?
- 가장 많이 공부한 사람은 누구인가?
- 최근 3건만 보고 싶다
- 각 회원별 최신 학습 기록 1건만 뽑고 싶다

즉, 데이터를 "분석"하고 "가공"하는 SQL입니다.

---

## `GROUP BY`와 `HAVING`

### 카테고리별 개수 구하기

```sql
SELECT category, COUNT(*) AS cnt
FROM study_log
GROUP BY category;
```

이 쿼리는 같은 카테고리끼리 묶어서 개수를 셉니다.

### `WHERE`와 `HAVING` 차이

- `WHERE`: 묶기 전 필터
- `HAVING`: 묶은 뒤 필터

예:

```sql
SELECT category, COUNT(*) AS cnt
FROM study_log
GROUP BY category
HAVING COUNT(*) >= 2;
```

이건 2건 이상 있는 카테고리만 보여줍니다.

---

## 서브쿼리

쿼리 안에 또 다른 쿼리를 넣는 방식입니다.

예:

```sql
SELECT *
FROM study_log
WHERE member_id = (
    SELECT id
    FROM member
    WHERE email = 'buzz@example.com'
);
```

이럴 때 좋습니다.

- "먼저 하나 찾고, 그 결과를 가지고 다시 조회"
- JOIN보다 직관적인 경우

하지만 서브쿼리가 무조건 좋은 건 아닙니다.

복잡해지면 JOIN이나 CTE가 더 읽기 쉬울 수 있습니다.

---

## 윈도우 함수 첫 감각

### 순위 매기기

```sql
SELECT
    member_id,
    title,
    study_date,
    ROW_NUMBER() OVER (PARTITION BY member_id ORDER BY study_date DESC) AS rn
FROM study_log;
```

이 쿼리는 회원별로 최신 순서 번호를 붙입니다.

핵심:

- `GROUP BY`는 행 수를 줄임
- 윈도우 함수는 행은 유지하면서 계산 결과를 추가함

### 자주 보는 함수

- `ROW_NUMBER()`
- `RANK()`
- `LAG()`
- `LEAD()`

예를 들어 `LAG()`는 이전 행 값을 보고 싶을 때 씁니다.

---

## CTE(Common Table Expression)

긴 쿼리를 중간 결과 이름 붙여서 읽기 쉽게 만드는 방법입니다.

```sql
WITH category_count AS (
    SELECT category, COUNT(*) AS cnt
    FROM study_log
    GROUP BY category
)
SELECT *
FROM category_count
WHERE cnt >= 2;
```

장점:

- 긴 쿼리가 읽기 쉬워짐
- 서브쿼리를 이름 붙여 분리 가능

재귀 CTE는 트리 구조나 계층 구조에서 쓰이지만, 초급 단계에서는 "존재를 안다" 정도면 충분합니다.

---

## `EXPLAIN`은 왜 보나

DB도 결국 프로그램입니다.

같은 SQL이라도:

- 어떤 인덱스를 타는지
- 전체 테이블을 훑는지
- JOIN 순서가 어떤지

에 따라 성능이 달라집니다.

```sql
EXPLAIN
SELECT *
FROM study_log
WHERE category = 'SPRING';
```

처음엔 결과를 다 외울 필요는 없습니다.

지금 단계에서는 이 정도면 충분합니다.

- `type`
- `key`
- `rows`

즉, "얼마나 많은 데이터를 어떻게 읽는가"를 보는 도구라고 이해하면 됩니다.

---

## 자주 하는 실수

- `GROUP BY`와 일반 컬럼을 섞어 쓰며 의미를 이해하지 못하는 것
- `WHERE COUNT(*) > 1`처럼 집계 함수를 `WHERE`에 쓰는 것
- 너무 긴 쿼리를 한 번에 쓰고 스스로도 못 읽는 것
- 성능이 느린데도 실행 계획을 안 보는 것

---

## 면접 체크

1. `WHERE`와 `HAVING`의 차이는 무엇인가요?
2. 서브쿼리는 언제 사용하나요?
3. 윈도우 함수와 `GROUP BY`는 어떤 차이가 있나요?
4. `EXPLAIN`은 왜 사용하나요?

---

## 직접 해보기

1. 카테고리별 학습 일지 개수를 구해보세요.
2. 특정 회원의 가장 최신 학습 일지 1건을 뽑아보세요.
3. 윈도우 함수로 회원별 학습 일지에 최신순 번호를 붙여보세요.
4. 같은 쿼리에 `EXPLAIN`을 붙여 실행 계획을 확인해보세요.

---

## 다음 주제 연결

이제 쿼리는 꽤 다룰 수 있습니다. 다음에는 "애초에 테이블을 어떻게 나눠야 나중에 안 망하는지"를 설계 관점에서 봅니다.
