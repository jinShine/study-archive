# 6회차(2026/09/28) — Index와 멀티스레드 동시성

- Part 1. Index
- Part 2. 멀티스레드와 동시성

---

# Part 1. Index

B+Tree 구조 자체는 [4회차 STUDY_GUIDE 6절](<../04회차(2026-09-17)/STUDY_GUIDE.md>)에 정리되어 있다. 여기서는 짧게 복기하고, 이번 수업에서 새로 나온 내용(Clustered/Secondary, Covering, 복합 인덱스, 카디널리티)을 깊게 다룬다.

```text
인덱스 = 정렬된 B+Tree
→ 찾는 방법은 둘: Full Scan vs Index Scan
→ InnoDB의 인덱스는 두 종류: Clustered(PK) vs Secondary
→ Secondary는 PK를 거쳐 원본을 한 번 더 찾는다 → 그 비용을 없애는 것이 Covering Index
→ 컬럼 여러 개로 만들면 복합 인덱스 → 컬럼 순서가 중요
→ 어떤 컬럼에 걸어야 효과적인가 → 카디널리티
→ 어디에 쓰이는가 → WHERE, 범위, JOIN, ORDER BY, GROUP BY
→ 대가 → 저장 공간, 쓰기 성능
```

예제 테이블은 끝까지 이것 하나를 쓴다.

```sql
CREATE TABLE members (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    name       VARCHAR(50),
    age        INT,
    created_at DATETIME
);
```

| id  | name | age | created_at |
| --- | ---- | --- | ---------- |
| 1   | kim  | 30  | 2026-01-10 |
| 2   | lee  | 25  | 2026-02-03 |
| 3   | park | 30  | 2026-01-05 |
| 4   | choi | 40  | 2026-03-01 |
| 5   | jung | 25  | 2026-01-20 |

---

## 1. Index와 B+Tree (4회차 복기)

**정의**: 인덱스는 특정 컬럼 값을 **정렬된 상태로 따로 저장**하고, 각 값이 어느 행에 있는지 기록한 자료구조다. **읽기를 빠르게 하기 위해 쓰기 시점에 미리 만들어 두는 것**이다.

**RDB가 B+Tree를 쓰는 이유**

1. **균형 트리**: 어떤 순서로 넣어도 모든 리프의 깊이가 같다. 이진 트리처럼 한쪽으로 쏠리지 않는다.
2. **노드 1개 = 디스크 페이지 1개(16KB)에 키 수백 개**: 트리가 낮고 넓다. 10억 건이어도 **디스크 읽기 3~4번**으로 찾는다.
3. **데이터는 리프에만, 리프끼리 연결**: 시작점만 찾으면 **옆으로 쭉 읽어서** 범위 검색과 정렬을 처리한다.

> 수업 참고 링크: [B-Tree search/insert/delete — opengenus](https://iq.opengenus.org/b-tree-search-insert-delete-operations/)
> 핵심은 **insert 때 노드가 꽉 차면 split하고 중간 키를 부모로 올린다**는 점이다. 이것이 8장 tradeoff(쓰기 비용)의 원인이다.

---

## 2. Full Table Scan vs Index Scan

### Full Table Scan

**정의**: 테이블의 **모든 행을 처음부터 끝까지** 읽으면서 조건에 맞는 행을 골라내는 방식.

- 비용이 **행 수에 비례**한다(O(N)).
- 대신 페이지를 **순서대로 연속 읽기(sequential I/O)** 한다.

### Index Scan

**정의**: 인덱스 B+Tree에서 조건에 맞는 **시작 위치를 찾고(seek)**, 필요한 범위만 읽는 방식.

- 트리 높이만큼만 읽어 위치를 찾는다. 행 수가 늘어도 비용이 거의 그대로다(O(log N)).
- 단, 원본 행을 가져올 때 **흩어진 페이지를 읽는 random I/O**가 생길 수 있다(3장).

### 인덱스가 항상 빠른 것은 아니다

조건에 맞는 행이 **테이블의 상당 부분**이면, 인덱스로 하나씩 찾아가는 random I/O가 처음부터 쭉 읽는 Full Scan보다 느리다. 그래서 **옵티마이저**(실행 계획 결정기)는 비용을 계산해 인덱스가 있어도 Full Scan을 고를 수 있다. 이 판단은 6장 카디널리티와 연결된다.

### 확인 방법 — `EXPLAIN` (보충)

```sql
EXPLAIN SELECT * FROM members WHERE age = 30;
```

| 컬럼    | 볼 것                                                                                                              |
| ------- | ------------------------------------------------------------------------------------------------------------------ |
| `type`  | `ALL` = Full Table Scan, `index` = 인덱스 전체 스캔, `range` = 범위 스캔, `ref` = 인덱스 동등 비교, `const` = PK/Unique로 1건 |
| `key`   | 실제 사용한 인덱스 이름 (NULL이면 미사용)                                                                          |
| `rows`  | 옵티마이저가 예상한 읽을 행 수                                                                                     |
| `Extra` | `Using index` = 커버링 인덱스(4장), `Using filesort` = 별도 정렬 발생                                              |

---

## 3. Clustered Index vs Secondary Index

MySQL **InnoDB** 기준. 인덱스 파트의 핵심이다.

### Clustered Index (= Primary Index)

**정의**: **PK 기준으로 정렬된 B+Tree이고, 리프에 행 전체 데이터가 들어 있는** 인덱스.

InnoDB는 **테이블 자체를 PK 순서의 B+Tree로 저장**한다. 그래서 Clustered Index는 별도의 인덱스가 아니라 **테이블 그 자체**다.

```text
Clustered Index (PK = id)
                    [ 3 ]
                  /       \
리프: [1|kim|30|..] ⇄ [2|lee|25|..] ⇄ [3|park|30|..] ⇄ [4|choi|40|..] ⇄ [5|jung|25|..]
      └──────────────────── 행 전체 데이터가 리프에 있다 ────────────────────┘
```

- 테이블당 **1개**. 데이터를 물리적으로 정렬하는 기준은 하나뿐이기 때문이다.
- PK가 없으면 InnoDB는 `UNIQUE NOT NULL` 컬럼을 쓰고, 그것도 없으면 숨겨진 row id를 만든다.

```sql
SELECT * FROM members WHERE id = 3;
-- Clustered 트리를 한 번 타면 리프에 행 전체가 있다 → 끝
```

### Secondary Index (보조 인덱스)

**정의**: PK가 아닌 컬럼으로 만든 인덱스. **리프에는 행 전체가 아니라 `(인덱스 컬럼 값, PK 값)`만** 들어 있다.

```sql
CREATE INDEX idx_members_age ON members (age);
```

> ⚠️ 수업 메모의 `create index members (age);`는 문법이 빠져 있다. 형태는 `CREATE INDEX 인덱스명 ON 테이블명 (컬럼);`이다.

```text
idx_members_age 리프 (age 순 정렬, 같은 age는 PK 순)
[25 → id 2] ⇄ [25 → id 5] ⇄ [30 → id 1] ⇄ [30 → id 3] ⇄ [40 → id 4]
```

### Secondary Index 조회 추적

```sql
SELECT * FROM members WHERE age = 30;
```

```text
Step 1. idx_members_age 트리 탐색 → age = 30 시작 위치를 찾는다
Step 2. 리프를 옆으로 읽는다 → (30, id 1), (30, id 3). 다음이 40이라 멈춘다
Step 3. 필요한 것은 name, created_at까지 전부(*) → 인덱스에 없다
Step 4. id 1로 Clustered Index 트리를 다시 탐색 → 행 전체
Step 5. id 3으로 Clustered Index 트리를 다시 탐색 → 행 전체
```

**트리를 두 번 탄다**: Secondary → PK → Clustered. 이 두 번째 탐색을 **테이블 룩업(lookup)** 이라 한다. 결과 행마다 한 번씩 일어나고, PK가 흩어져 있으면 **random I/O**가 된다.

|                | Clustered     | Secondary                         |
| -------------- | ------------- | --------------------------------- |
| 정렬 기준      | PK            | 지정한 컬럼                       |
| 리프에 있는 것 | **행 전체**   | **컬럼 값 + PK**                  |
| 개수           | 테이블당 1개  | 여러 개 가능                      |
| 조회           | 트리 1번      | 트리 1번 + 행마다 Clustered 룩업 |

**왜 리프에 행 주소가 아니라 PK를 두는가**: 행의 물리적 위치는 page split 등으로 계속 바뀐다. PK는 바뀌지 않으므로, 위치가 바뀌어도 Secondary Index를 고칠 필요가 없다.

**4회차와 연결**: 모든 Secondary Index 리프에 PK가 복사되어 들어간다. 그래서 **PK가 크면(UUID 문자열 등) 모든 보조 인덱스가 커진다.** "PK는 작고 단조 증가하는 값이 좋다"의 이유가 하나 더 생겼다.

---

## 4. Covering Index (인덱스 커버링)

**정의**: 쿼리에 필요한 **모든 컬럼이 인덱스 안에 있어서**, Clustered Index 룩업 없이 **인덱스만으로 결과를 만드는** 경우. 인덱스의 종류가 아니라 **쿼리와 인덱스의 관계**를 말한다.

```sql
-- 인덱스: idx_members_age (age)  → 리프 = (age, id)

SELECT *       FROM members WHERE age = 30;   -- ❌ name, created_at이 인덱스에 없음 → 룩업 발생
SELECT id, age FROM members WHERE age = 30;   -- ✅ age, id 모두 인덱스 리프에 있음 → 룩업 없음
```

```text
SELECT id, age ... WHERE age = 30
Step 1. idx_members_age 탐색 → (30, id 1), (30, id 3)
Step 2. 필요한 컬럼이 id, age → 이미 다 있다 → 바로 반환. 끝.
```

`id`는 인덱스를 만들 때 지정하지 않았는데도 커버된다. **Secondary Index 리프에 PK가 자동으로 들어 있기 때문**이다(3장).

- `EXPLAIN`의 `Extra`에 **`Using index`** 가 보이면 커버링이다.
- 실무 교훈: `SELECT *` 대신 **필요한 컬럼만 조회**해야 커버링이 될 여지가 생긴다.

---

## 5. 복합 인덱스 (Composite Index)

**정의**: **여러 컬럼을 묶어 하나의 인덱스**로 만든 것.

```sql
CREATE INDEX idx_members_age_created ON members (age, created_at);
```

### 정렬 방식 — 첫 번째 컬럼, 같으면 두 번째 컬럼

```text
리프: (age, created_at, id)
[25, 01-20, id5] ⇄ [25, 02-03, id2] ⇄ [30, 01-05, id3] ⇄ [30, 01-10, id1] ⇄ [40, 03-01, id4]
└── age 25 안에서 created_at 정렬 ──┘  └── age 30 안에서 created_at 정렬 ──┘
```

`created_at`은 **같은 age 안에서만** 정렬되어 있다. 인덱스 전체로 보면 created_at은 정렬되어 있지 않다(01-20, 02-03, 01-05, ...).

### 🔴 Leftmost Prefix 규칙

인덱스는 **왼쪽 컬럼부터 순서대로** 조건이 있어야 탐색(seek)에 쓸 수 있다.

| 조건                                           | 인덱스 탐색   | 이유                                                                     |
| ---------------------------------------------- | ------------- | ------------------------------------------------------------------------ |
| `WHERE age = 30`                               | ✅            | 첫 컬럼                                                                  |
| `WHERE age = 30 AND created_at > '2026-01-07'` | ✅ 두 컬럼 다 | age 고정 → 그 안에서 created_at은 정렬되어 있다                          |
| `WHERE created_at > '2026-01-07'`              | ❌            | age 없이는 created_at이 전체적으로 정렬되어 있지 않다                    |
| `WHERE age > 25 AND created_at = '2026-01-10'` | △ age만       | age가 범위면 그 안의 created_at은 age별로 따로 정렬되어 있어 탐색에 못 쓴다 |

**컬럼 순서 원칙**: **동등 조건(`=`) 컬럼을 앞에, 범위 조건 컬럼을 뒤에** 둔다.

> 🟢 참고: MySQL 8.0.13+에는 첫 컬럼이 빠져도 제한적으로 쓰는 **Skip Scan**이 있다. 첫 컬럼의 종류가 적을 때만 효과가 있으므로, 기본은 leftmost 규칙으로 기억한다.

### 수업 예제 해석

```sql
SELECT id, age, created_at FROM members;   -- WHERE 없음
```

조건이 없으니 탐색은 못 한다. 그러나 필요한 컬럼(id, age, created_at)이 **전부 복합 인덱스 리프에 있다** → **커버링**이다. 그래서 MySQL은 행 전체가 든 무거운 Clustered Index 대신 **가벼운 인덱스를 처음부터 끝까지** 읽을 수 있다(`type = index`, `Extra = Using index`). 같은 "전체 읽기"여도 읽는 페이지 수가 훨씬 적다.

---

## 6. 카디널리티 (Cardinality)

**정의**: 컬럼에 들어 있는 **서로 다른 값의 개수**.

| 컬럼                   | 카디널리티            | 중복도 |
| ---------------------- | --------------------- | ------ |
| `id`, `email`          | 높음 (거의 행 수만큼) | 낮음   |
| `age`                  | 중간 (수십~100)       | 중간   |
| `gender`, `is_deleted` | 낮음 (2~3)            | 높음   |

**왜 카디널리티가 높은(중복도가 낮은) 컬럼에 걸어야 효율적인가**: 인덱스의 가치는 **후보를 얼마나 많이 걸러내는가(선택도, selectivity)** 에 있다.

```text
100만 명, WHERE email = 'a@b.com'  → 1건         → 인덱스 탐색 + 룩업 1번 ✅
100만 명, WHERE gender = 'M'       → 약 50만 건  → 인덱스 탐색 + 룩업 50만 번(random I/O) ❌
                                                   → Full Scan(sequential)이 더 싸다
```

카디널리티가 낮으면 걸러지는 것이 거의 없고 **룩업 비용만 늘어난다.** 그래서 옵티마이저가 인덱스를 무시하고 Full Scan을 고르기도 한다(2장).

**복합 인덱스와의 관계**: 카디널리티가 낮은 컬럼도 **다른 컬럼과 묶으면** 의미가 생길 수 있다. 컬럼 순서는 쿼리 패턴(동등 → 범위)을 먼저 보고, 그다음 카디널리티를 고려한다.

---

## 7. 인덱스가 쓰이는 상황

| 상황               | 예                      | B+Tree 관점의 이유                                     |
| ------------------ | ----------------------- | ------------------------------------------------------ |
| 1. **WHERE**       | `WHERE age = 30`        | 트리 탐색으로 위치를 바로 찾는다                       |
| 2. **범위**        | `BETWEEN`, `>`, `<`     | 시작점을 찾고 **리프를 옆으로** 읽는다                 |
| 3. **JOIN 컬럼**   | `ON o.member_id = m.id` | 조인 대상 행을 찾을 때마다 Full Scan 대신 탐색한다     |
| 4. **ORDER BY**    | `ORDER BY age`          | 리프가 이미 정렬되어 있어 **별도 정렬(filesort)이 없다** |
| 5. **GROUP BY**    | `GROUP BY age`          | 같은 값이 리프에 **붙어 있어** 순서대로 묶기만 하면 된다 |

**JOIN 보충**: `members` 1,000명과 `orders`를 조인할 때 `orders.member_id`에 인덱스가 없으면, 회원 한 명마다 `orders`를 Full Scan한다 → Full Scan 1,000번. 그래서 **FK(조인 컬럼)에는 인덱스를 거는 것이 기본**이다.

### ⚠️ 인덱스가 있는데 안 타는 경우 (보충)

| ❌                                               | 이유                                                    | ✅                                                                 |
| ------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------ |
| `WHERE YEAR(created_at) = 2026`                  | 컬럼을 **가공**하면 인덱스의 정렬된 값과 비교할 수 없다 | `WHERE created_at >= '2026-01-01' AND created_at < '2027-01-01'` |
| `WHERE age + 1 = 31`                             | 컬럼 가공                                               | `WHERE age = 30`                                                   |
| `WHERE name LIKE '%kim'`                         | 앞부분을 모르면 정렬 위치를 찾을 수 없다                | `LIKE 'kim%'`는 가능                                               |
| 복합 `(age, created_at)`에 `WHERE created_at = ...` | leftmost 위반                                         | 조건 추가 또는 인덱스 재설계                                       |

---

## 8. Index Tradeoff

### ① 저장 공간

인덱스는 원본과 **별개의 B+Tree**다. 수업 기준으로 **원본 대비 약 10~15%가 추가**된다. 실제로는 인덱스 컬럼의 크기와 개수, PK 크기에 따라 달라진다. Secondary Index에는 PK가 들어가므로 **PK가 클수록 커진다.**

### ② 쓰기 성능 저하

`INSERT / UPDATE / DELETE`가 일어나면 **원본(Clustered)뿐 아니라 모든 Secondary Index도 갱신**해야 한다.

```text
INSERT 1건, Secondary Index 3개
→ Clustered 1번 + Secondary 3번 = B+Tree 4개 수정
→ 각 트리에서 정렬 위치를 찾아 삽입, 꽉 차면 page split
```

- **UPDATE**는 인덱스 컬럼 값이 바뀌면 인덱스 안에서 위치가 바뀌어야 하므로 **삭제 + 삽입**으로 처리된다.
- 인덱스가 늘수록 쓰기가 느려지고, 쓰기 중 **락을 잡는 시간**도 길어진다.

**결론**: 인덱스는 **읽기 성능을 위해 저장 공간과 쓰기 성능을 지불하는 것**이다. **실제 조회 패턴(WHERE, JOIN, ORDER BY)에 맞춰** 필요한 것만 만들고, 쓰지 않는 인덱스는 지운다.

---

## Index 요약

| 개념               | 한 줄                                                         |
| ------------------ | ------------------------------------------------------------- |
| B+Tree             | 균형 + 넓은 노드 + 리프 연결 → 탐색·범위·정렬이 빠르다        |
| Full vs Index Scan | 많이 읽으면 Full(sequential)이 나을 수 있다. 옵티마이저가 판단 |
| Clustered          | PK 순 B+Tree = 테이블 자체. 리프에 행 전체. 1개               |
| Secondary          | 리프에 (컬럼 값, PK) → 행마다 Clustered 룩업                  |
| Covering           | 필요한 컬럼이 다 인덱스에 있어 룩업 없음 (`Using index`)       |
| 복합 인덱스        | 왼쪽부터 정렬. leftmost prefix. `=` 앞, 범위 뒤               |
| 카디널리티         | 서로 다른 값의 수. 높을수록 걸러내는 힘이 크다                |
| 적용               | WHERE, 범위, JOIN, ORDER BY, GROUP BY                         |
| Tradeoff           | 저장 공간 +10~15%, 모든 쓰기에서 인덱스 갱신                  |

---

# Part 2. 멀티스레드와 동시성

```text
5회차 결론: 스레드는 STACK만 따로, HEAP·DATA는 공유
→ 공유 데이터를 여러 스레드가 동시에 수정하면 결과가 틀어진다 = 동시성 문제
→ 원인: x++는 load → add → store 3단계 + 그 사이 컨텍스트 스위칭
→ 해결의 핵심: 3단계를 쪼갤 수 없게(원자적으로) 만든다
→ 하드웨어: TAS, CAS, FAA 원자 명령
→ OS: 그 위에 Mutex(락)를 만들어 임계 구역을 상호 배제
→ Java: synchronized, ReentrantLock (+ CAS 기반 AtomicInteger)
→ 라이브러리: thread-safe 컬렉션 (StringBuffer, Vector, ConcurrentHashMap, ConcurrentLinkedQueue)
```

실행 결과는 JDK 21에서 직접 실행한 값이다.

---

## 1. 동시성 문제 (Concurrency Problem)

**정의**: 여러 스레드가 **공유 데이터에 동시에 접근하고, 그중 하나 이상이 쓰기**를 할 때, 실행 순서에 따라 결과가 달라지거나 틀어지는 현상. 실행 타이밍에 따라 결과가 달라지는 상황을 **경쟁 조건(Race Condition)** 이라 한다.

> 수업 참고 그림: [멀티스레드 동시성 문제](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcjsUVo%2FbtssVVplUNC%2FUgwYHzvEPFnC2zZ7Z6271K%2Fimg.png)

**성립 조건 — 세 가지가 모두 있어야 한다**

1. **공유 데이터**가 있다 (HEAP의 객체 필드, static 변수)
2. **여러 스레드**가 동시에 접근한다
3. 그중 **쓰기**가 있다

하나라도 빠지면 동시성 문제는 없다.

- **지역 변수**는 각 스레드의 STACK에 있어 공유되지 않는다 → 안전
- **읽기만** 하는 불변 데이터 → 안전

**5회차와 연결**: 멀티프로세스(fork)는 메모리가 분리되어 이 문제가 없었다. 멀티스레드는 HEAP을 공유하기 때문에 생기는 **대가**다.

| 용어                            | 정의                                          |
| ------------------------------- | --------------------------------------------- |
| **Shared data**                 | 여러 스레드가 접근하는 데이터                 |
| **Critical Section (임계 구역)** | 공유 데이터에 접근하는 코드 구간              |
| **Mutual Exclusion (상호 배제)** | 임계 구역에 **한 번에 한 스레드만** 들어가게 하는 것 |

---

## 2. 원인 — 레지스터와 컨텍스트 스위칭

### CPU는 메모리 값을 직접 계산하지 않는다

CPU는 **레지스터**(CPU 내부의 작고 빠른 저장 공간)로 값을 가져와 계산한 뒤 메모리에 다시 쓴다. 그래서 `x++` 한 줄은 실제로 **명령 3개**다.

```text
1. load   메모리의 x → 레지스터
2. add    레지스터 값 + 1
3. store  레지스터 → 메모리의 x
```

**Java 바이트코드로 확인** (`count++`를 `javap -c`로 본 결과)

```text
getstatic   count     ← load
iconst_1
iadd                  ← add
putstatic   count     ← store
```

소스는 한 줄이지만 바이트코드는 읽기 → 더하기 → 쓰기로 나뉜다. 이 패턴을 **Read-Modify-Write**라 한다.

### 컨텍스트 스위칭 (Context Switching)

**정의**: CPU가 실행 중인 스레드를 멈추고 다른 스레드를 실행하는 전환.

- **save**: 현재 스레드의 레지스터 값(실행 위치 포함)을 메모리(스레드 제어 블록)에 저장
- **restore**: 다음 스레드의 저장된 레지스터 값을 레지스터로 다시 불러옴

> 수업 참고 링크: [Context switching — HCL Informix](https://help.hcl-software.com/hclinformix/1410/admin/ids_admin_0273.html)

스위칭은 **명령 단위 어디서든** 일어날 수 있다. `load`와 `store` 사이에서도 일어난다. 멀티코어라면 두 스레드가 **실제로 동시에** 실행되기도 한다.

### 수업 예제 추적 (x = 0, A와 B가 각각 x++)

```text
        Thread A                Thread B             메모리 x
   ──────────────────────────────────────────────────────
   load  x → regA = 0                                    0
   add   regA = 1                                        0
   ── 컨텍스트 스위칭 (A의 regA=1 save) ──
                            load  x → regB = 0           0   ← A가 아직 안 썼으니 0
                            add   regB = 1               0
                            store regB → x               1
   ── 컨텍스트 스위칭 (A의 regA=1 restore) ──
   store regA → x                                        1   ← B의 결과를 덮어씀
```

**결론: 두 번 증가했는데 x = 1.** A는 B가 쓰기 전의 낡은 값(0)을 기준으로 계산했다. 증가 하나가 **유실(lost update)** 됐다.

### 따라 쳐보기 — UnsafeCounter.java

```java
public class UnsafeCounter {
    static int count = 0;

    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> {
            for (int i = 0; i < 100_000; i++) {
                count++;
            }
        };
        Thread a = new Thread(task);
        Thread b = new Thread(task);
        a.start(); b.start();
        a.join(); b.join();
        System.out.println("count = " + count + " (기대값 200000)");
    }
}
```

```bash
java UnsafeCounter.java
```

실행 결과 (3회):

```text
count = 102782 (기대값 200000)
count = 105699 (기대값 200000)
count = 106755 (기대값 200000)
```

20만 번 중 **약 9만 4천~9만 7천 번이 유실**됐고, **실행할 때마다 값이 다르다.** 동시성 버그는 재현이 어렵고 테스트에서 놓치기 쉽다.

> 반복 변수 `i`는 지역 변수(STACK)라 안전하다. 문제는 `count`(static → 공유)뿐이다.

### 해결 방향

본질은 **load–add–store 사이에 다른 스레드가 끼어드는 것**이다. 이 3단계를 **원자적(Atomic)**, 즉 **중간에 끼어들 수 없는 하나의 동작**으로 만들어야 한다.

소프트웨어만으로는 어렵다. "락이 비어 있나 확인 → 비어 있으면 잠금"도 결국 **읽기 → 쓰기 두 단계**라 그 사이에 또 끼어들 수 있다. 그래서 **하드웨어 지원**이 필요하다.

---

## 3. 하드웨어 레벨 지원 — 원자적 명령어

CPU가 **읽기와 쓰기를 한 명령으로, 중간에 끼어들 수 없게** 실행해 주는 명령어. 실행되는 동안 다른 코어는 그 메모리 위치에 접근할 수 없다. 모든 락과 동기화 도구는 이 명령들 위에 만들어진다.

### ① Test-and-Set (TAS)

> [Test-and-set — Wikipedia](https://en.wikipedia.org/wiki/Test-and-set)

**동작**: 메모리 값을 **true로 설정하고, 원래 값을 반환**한다. 두 동작이 원자적이다.

```text
TAS(lock):            ← 이 전체가 한 명령
    old = lock
    lock = true
    return old
```

**락 구현 (Spinlock)**

```text
acquire: while (TAS(lock) == true) { }   // 원래 값이 true면 누가 잡고 있음 → 계속 재시도
         // false를 받았다 = 내가 처음으로 true로 바꿨다 = 락 획득
release: lock = false
```

두 스레드가 동시에 TAS를 해도 하드웨어가 순서를 정한다. **한 스레드만 false를 받는다.**

### ② Compare-and-Swap (CAS)

> [Compare-and-swap — Wikipedia](https://en.wikipedia.org/wiki/Compare-and-swap)

**동작**: 메모리 값이 **기대값(expected)과 같으면 새 값으로 바꾸고 성공**을 반환한다. **다르면 아무것도 하지 않고 실패**를 반환한다.

```text
CAS(addr, expected, new):     ← 이 전체가 한 명령
    if (*addr == expected) { *addr = new; return true }
    return false
```

**x++를 CAS로 — 실패하면 재시도**

```text
do {
    old = x                    // 읽기
    new = old + 1              // 계산
} while (!CAS(&x, old, new))   // "아직 old 그대로면" 쓰기. 누가 바꿨으면 다시
```

2장의 시나리오에 적용하면:

```text
A: old = 0, new = 1
B: old = 0, new = 1, CAS(x, 0, 1) 성공 → x = 1
A: CAS(x, 0, 1) → x는 이미 1, 기대값 0과 다름 → 실패 → 재시도
A: old = 1, new = 2, CAS(x, 1, 2) 성공 → x = 2   ✅
```

**특징**: 락을 잡지 않는다(**Lock-free**). 충돌하면 재시도만 한다. 경합이 적으면 매우 빠르고, 경합이 심하면 재시도가 반복되며 CPU를 소모한다.

> 🟢 참고 (보충): **ABA 문제** — 값이 A → B → A로 바뀌면 CAS는 "안 바뀌었다"고 판단한다. 버전 번호를 함께 비교해 해결한다(`AtomicStampedReference`).

### ③ Fetch-and-Add (FAA)

> [Fetch-and-add — Wikipedia](https://en.wikipedia.org/wiki/Fetch-and-add)

**동작**: 메모리 값에 **지정한 값을 더하고, 더하기 전 값을 반환**한다. 원자적이다.

```text
FAA(addr, n):     ← 한 명령
    old = *addr
    *addr = old + n
    return old
```

카운터 증가 자체가 명령 하나로 끝난다. 재시도가 필요 없다. (x86의 `lock xadd` 명령)

| 명령 | 하는 일                      | 대표 용도                              |
| ---- | ---------------------------- | -------------------------------------- |
| TAS  | true로 설정 + 원래 값 반환   | 단순 스핀락                            |
| CAS  | 기대값과 같으면 교체         | lock-free 자료구조, Java Atomic 클래스 |
| FAA  | 더하기 + 원래 값 반환        | 카운터, 티켓 번호 발급                 |

---

## 4. OS 레벨 지원 — Mutex, Semaphore

### 스핀락의 한계

TAS/CAS 루프로 기다리면 락을 얻을 때까지 **CPU를 계속 쓰면서 돈다(busy waiting).** 락을 잡은 스레드가 오래 걸리면 기다리는 스레드들이 CPU를 낭비한다.

### Mutex (Mutual Exclusion)

**정의**: 임계 구역에 **한 번에 한 스레드만** 들어가게 하는 OS 동기화 도구(락).

```text
lock(mutex)       ← 획득. 다른 스레드가 갖고 있으면 대기
  임계 구역
unlock(mutex)     ← 해제. 대기 중인 스레드 하나를 깨움
```

**스핀락과의 차이**: 락을 못 얻은 스레드를 **OS가 재운다(sleep).** 대기 큐에 넣고 CPU를 다른 스레드에 준다. unlock될 때 깨운다.

- 장점: 기다리는 동안 CPU를 낭비하지 않는다.
- 비용: 재우고 깨울 때 **컨텍스트 스위칭**이 발생한다.
- 그래서 임계 구역이 아주 짧으면 스핀락이, 길면 Mutex가 유리하다. (실제 구현은 잠깐 스핀하다가 재우는 혼합 방식이 많다.)

**소유권**: Mutex는 **잠근 스레드만 풀 수 있다.**

Mutex 내부의 "락 상태 변경"도 결국 3장의 **원자적 명령(CAS 등)** 으로 구현된다.

```text
하드웨어 (TAS / CAS / FAA)
   ↓ 위에 구현
OS (Mutex, Semaphore)
   ↓ 위에 구현
Java (synchronized, ReentrantLock)
```

### Semaphore (보충 — 참고 링크의 비교 대상)

> 수업 참고 링크: [Mutex vs Semaphore — GeeksforGeeks](https://www.geeksforgeeks.org/mutex-vs-semaphore/)

**정의**: **N개의 허가(permit)** 를 관리하는 카운터. 동시에 **최대 N개 스레드**가 들어갈 수 있다.

```text
wait (P):   count--, 0보다 작으면 대기
signal (V): count++, 대기 중인 스레드 깨움
```

|           | Mutex                       | Semaphore                                |
| --------- | --------------------------- | ---------------------------------------- |
| 동시 진입 | 1개                         | N개                                      |
| 목적      | 공유 데이터 보호(상호 배제) | 한정된 자원의 동시 사용 수 제한          |
| 소유권    | 잠근 스레드만 해제          | 소유 개념 없음. 다른 스레드가 signal 가능 |

**3회차와 연결**: 커넥션 풀(최대 10개)은 개념적으로 Semaphore다. 최대 N개까지 빌려주고 나머지는 대기한다.

---

## 5. Java의 동기화 — synchronized, ReentrantLock

OS의 Lock(Mutex) 같은 동기화 도구를 Java에서는 어떻게 쓰는가.

### synchronized

**정의**: Java 언어에 내장된 락. **모든 객체는 하나의 모니터 락(monitor lock)을 갖고 있고**, `synchronized`는 그 락을 잡고 들어간다.

```java
// ① 메서드: this 객체의 락
public synchronized void increase() { count++; }

// ② 블록: 지정한 객체의 락 (필요한 구간만 보호 → 권장)
public void increase() {
    synchronized (this) { count++; }
}

// ③ static 메서드: 클래스 객체(Counter.class)의 락
public static synchronized void increaseStatic() { ... }
```

**특징**

- **블록을 벗어나면 자동 해제**된다. **예외가 나도** 해제된다.
- 락을 못 얻은 스레드는 **BLOCKED** 상태가 된다. (5회차 생명주기의 BLOCKED)
- **재진입 가능(Reentrant)**: 락을 가진 스레드가 같은 락이 필요한 다른 synchronized 메서드를 호출해도 자기 자신에게 막히지 않는다.
- **가시성 보장**: 락을 해제할 때 변경 사항이 메모리에 반영되고, 락을 잡을 때 최신 값을 읽는다.
- JVM 내부에서는 경합이 없으면 CAS로 가볍게 처리하고, **경합이 생기면 OS Mutex**로 전환한다.

**한계**: 대기 시간 제한이 없고, 대기 중 interrupt로 빠져나올 수 없고, 공정성(먼저 온 순서)을 보장하지 않는다.

### ReentrantLock

**정의**: `java.util.concurrent.locks` 패키지의 **명시적 락**. synchronized의 한계를 보완한다.

```java
private final ReentrantLock lock = new ReentrantLock();

public void increase() {
    lock.lock();
    try {
        count++;
    } finally {
        lock.unlock();   // ⚠️ 반드시 finally에서. 안 하면 예외 시 락이 영원히 안 풀린다
    }
}
```

**synchronized에 없는 기능**

| 기능                              | 의미                                                                |
| --------------------------------- | ------------------------------------------------------------------- |
| `tryLock()` / `tryLock(timeout)`  | 락을 못 얻으면 **바로 또는 시간 후 포기** (3회차 fail fast와 같은 발상) |
| `lockInterruptibly()`             | 대기 중 **interrupt로 빠져나올 수 있다**                            |
| `new ReentrantLock(true)`         | **공정 모드**: 먼저 기다린 스레드가 먼저 획득                       |
| `Condition`                       | 여러 대기 조건을 분리해 기다리기/깨우기                             |

**Reentrant(재진입)의 의미**: 같은 스레드가 이미 가진 락을 다시 잡을 수 있다. 내부에 **보유 횟수(hold count)** 가 있어, lock 2번이면 unlock도 2번 해야 풀린다.

> 보충: ReentrantLock을 기다리는 스레드는 BLOCKED가 아니라 **WAITING** 상태로 보인다. synchronized와 대기 방식이 다르기 때문이다.

### 비교

|                   | synchronized | ReentrantLock         | AtomicInteger              |
| ----------------- | ------------ | --------------------- | -------------------------- |
| 방식              | 모니터 락    | 명시적 락             | **CAS (lock-free)**        |
| 해제              | 자동         | `finally`에서 직접    | 해당 없음                  |
| 타임아웃·인터럽트 | ❌           | ✅                    | 해당 없음                  |
| 적합한 곳         | 기본 선택    | 대기 제어가 필요할 때 | **단일 변수**의 원자적 연산 |

`AtomicInteger.incrementAndGet()`은 3장의 **CAS 재시도 루프**로 구현되어 있다(x86에서는 JIT가 FAA 명령으로 바꿔 실행하기도 한다). 하드웨어 원자 명령을 Java에서 직접 쓰는 창구다.

### 따라 쳐보기 — RaceDemo.java (4가지 방식 비교)

```java
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;

public class RaceDemo {
    static int unsafeCount = 0;
    static int syncCount = 0;
    static int lockCount = 0;
    static AtomicInteger atomicCount = new AtomicInteger();
    static final Object monitor = new Object();
    static final ReentrantLock lock = new ReentrantLock();

    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> {
            for (int i = 0; i < 100_000; i++) {
                unsafeCount++;                                           // 보호 없음
                synchronized (monitor) { syncCount++; }                  // synchronized
                lock.lock();
                try { lockCount++; } finally { lock.unlock(); }          // ReentrantLock
                atomicCount.incrementAndGet();                           // CAS
            }
        };
        Thread a = new Thread(task);
        Thread b = new Thread(task);
        a.start(); b.start();
        a.join(); b.join();
        System.out.println("unsafe       = " + unsafeCount);
        System.out.println("synchronized = " + syncCount);
        System.out.println("ReentrantLock= " + lockCount);
        System.out.println("AtomicInteger= " + atomicCount.get());
    }
}
```

```bash
java RaceDemo.java
```

실행 결과 (첫 번째 실행):

```text
unsafe       = 199952
synchronized = 200000
ReentrantLock= 200000
AtomicInteger= 200000
```

3회 실행 모두 보호한 세 방식은 **정확히 200000**, 보호 없는 쪽은 매번 달랐다(199952, 199992, 199971).

> unsafe 유실이 2장(약 9만)보다 훨씬 적은 이유: 같은 루프 안의 락 코드가 두 스레드를 사실상 번갈아 실행하게 만들어 충돌 확률이 줄었기 때문이다. **유실 정도는 타이밍에 따라 달라진다. "가끔만 틀린다"가 더 위험하다.**

---

## 6. Thread-safe 객체

**정의**: 여러 스레드가 동시에 사용해도 **내부 상태가 깨지지 않도록 동기화가 구현된** 클래스.

### ① StringBuffer vs StringBuilder

|        | StringBuffer              | StringBuilder |
| ------ | ------------------------- | ------------- |
| 동기화 | 메서드마다 `synchronized` | 없음          |
| 성능   | 락 비용만큼 느림          | 빠름          |

**판단 기준**: 문자열 조립은 대부분 **메서드 안의 지역 변수**다 → STACK → 공유되지 않는다 → **StringBuilder**.

### ② Vector vs ArrayList

|        | Vector                     | ArrayList |
| ------ | -------------------------- | --------- |
| 동기화 | 모든 메서드 `synchronized` | 없음      |
| 상태   | 레거시                     | 기본      |

Vector는 메서드 하나하나는 안전하지만, **여러 메서드를 조합한 동작은 안전하지 않다.**

```java
// ❌ Vector여도 깨진다: 확인(size)과 행동(get) 사이에 다른 스레드가 remove 가능
if (vector.size() > 0) {
    vector.get(0);
}
```

이런 **Check-then-Act** 패턴은 전체를 하나의 락으로 묶어야 한다. 대안은 `Collections.synchronizedList()`, 읽기가 압도적으로 많으면 `CopyOnWriteArrayList`.

### ③ ConcurrentHashMap vs HashMap

|            | HashMap                | Hashtable                  | ConcurrentHashMap                          |
| ---------- | ---------------------- | -------------------------- | ------------------------------------------ |
| 동기화     | 없음                   | 맵 전체에 락 하나          | **버킷 단위의 세분화된 락 + CAS**          |
| 동시 쓰기  | 데이터 유실, 구조 손상 | 안전, 한 번에 1스레드      | 안전, **서로 다른 버킷은 동시에** 가능     |
| 읽기       | —                      | 락 필요                    | **락 없이**                                |
| null 키·값 | 허용                   | 불가                       | 불가                                       |

**ConcurrentHashMap 원리 (Java 8+)**: 빈 버킷에 넣을 때는 **CAS**, 이미 노드가 있는 버킷에 넣을 때는 **그 버킷의 첫 노드만 synchronized**로 잠근다. 맵 전체가 아니라 **버킷 하나만 잠그므로** 동시성이 높다.

**⚠️ 조합 연산 주의**

```java
// ❌ get과 put 사이에 다른 스레드가 끼어든다 → 2장과 같은 lost update
map.put(key, map.get(key) + 1);

// ✅ 원자적 메서드 사용
map.merge(key, 1, Integer::sum);
map.compute(key, (k, v) -> v == null ? 1 : v + 1);
map.putIfAbsent(key, 0);
```

### ④ ConcurrentLinkedQueue

**정의**: **CAS 기반 lock-free** 큐. 락 없이 여러 스레드가 동시에 넣고 뺄 수 있다.

|                  | ConcurrentLinkedQueue                    | LinkedBlockingQueue              |
| ---------------- | ---------------------------------------- | -------------------------------- |
| 방식             | CAS (lock-free)                          | 락                               |
| 비었을 때 꺼내기 | `poll()` → **null 반환** (기다리지 않음) | `take()` → **비어 있으면 대기**  |
| 용도             | 빠른 비차단 큐                           | 생산자–소비자 (작업 큐)          |

**5회차와 연결**: ThreadPoolExecutor의 작업 큐가 `LinkedBlockingQueue`다. 풀 스레드가 `take()`로 **작업이 올 때까지 기다리는(WAITING)** 동작이 이 blocking 특성 덕분이다.

### 🔴 핵심 교훈

**Thread-safe 객체를 쓴다고 코드 전체가 thread-safe해지지 않는다.** 개별 메서드는 안전해도 **여러 호출의 조합(check-then-act, read-modify-write)** 은 따로 원자적으로 만들어야 한다.

---

## 7. Spring과 연결 (보충)

2회차의 **Spring Bean은 기본 싱글톤**이고, 5회차의 **Tomcat은 요청마다 스레드 하나**다. 둘을 합치면 **여러 요청 스레드가 같은 Bean 객체를 동시에 사용**한다.

```java
// ❌ Bean 필드 = HEAP = 모든 요청 스레드가 공유 → 2장의 lost update
@Service
public class VisitService {
    private int visitCount = 0;
    public void visit() { visitCount++; }
}

// ✅ Bean은 상태 없이(stateless), 상태는 지역 변수 또는 DB/Redis에
@Service
@RequiredArgsConstructor
public class VisitService {
    private final VisitRepository visitRepository;   // final 의존성만
    public void visit(Long id) { visitRepository.increase(id); }
}
```

1회차 "서버는 stateless", 2회차 "Bean은 싱글톤", 5회차 "HEAP 공유", 6회차 "동시성 문제"가 하나로 이어진다.

> 다만 `visitRepository.increase(id)`도 DB의 같은 행을 여러 요청이 동시에 갱신하는 같은 문제를 DB 레벨에서 안고 있다. 이것은 4회차 트랜잭션·격리 수준, 그리고 이후의 DB 락(비관적/낙관적 락) 영역이다.

---

## Part 2 요약

| 개념               | 한 줄                                                                |
| ------------------ | -------------------------------------------------------------------- |
| 동시성 문제        | 공유 데이터 + 여러 스레드 + 쓰기 → 실행 순서에 따라 결과가 틀어짐    |
| 원인               | `x++` = load → add → store, 그 사이 컨텍스트 스위칭(레지스터 save/restore) |
| 해결 핵심          | Read-Modify-Write를 **원자적으로**                                   |
| TAS / CAS / FAA    | 하드웨어가 읽기+쓰기를 한 명령으로 보장                              |
| Mutex              | 한 번에 1스레드, 못 얻으면 OS가 재움, 소유권 있음                    |
| Semaphore          | N개까지 동시 진입, 자원 수 제한                                      |
| synchronized       | 객체 모니터 락, 자동 해제, 대기 시 BLOCKED                           |
| ReentrantLock      | 명시적 락, `finally`에서 unlock, tryLock·interrupt·공정성            |
| AtomicInteger      | CAS 기반 lock-free 단일 변수 연산                                    |
| Thread-safe 컬렉션 | 개별 메서드는 안전, **조합 연산은 별도로** 원자화                    |
