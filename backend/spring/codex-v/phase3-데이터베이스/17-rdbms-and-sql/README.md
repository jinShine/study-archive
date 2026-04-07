# 17. RDBMS 기초와 SQL

> 오늘의 목표: DB를 "그냥 저장소"가 아니라, 백엔드가 데이터를 오래 보관하고 정확하게 조회하기 위한 시스템으로 이해한다.

---

## 오늘 끝나면 되는 것

- 왜 `HashMap` 대신 데이터베이스가 필요한지 설명할 수 있다.
- 테이블, 행, 컬럼, PK, FK 개념을 구분할 수 있다.
- DDL과 DML 차이를 이해할 수 있다.
- `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `JOIN`의 기본을 직접 써볼 수 있다.
- 인덱스가 왜 빠른지 아주 기초 수준에서 설명할 수 있다.

---

## 머릿속 그림

```text
애플리케이션 메모리
  -> 서버 재시작 시 사라짐

데이터베이스
  -> 디스크에 저장
  -> 재시작해도 남음
  -> 여러 요청이 함께 접근 가능
```

Phase 1~2에서는 이런 코드를 많이 봤습니다.

```java
private final Map<Long, StudyLog> store = new HashMap<>();
```

이 방식은 학습용으로는 좋지만, 서버를 껐다 켜면 데이터가 모두 사라집니다.

그래서 실제 서비스는 데이터를 DB에 저장합니다.

---

## RDBMS를 아주 쉽게 이해하기

RDBMS는 표 형태로 데이터를 저장합니다.

엑셀과 비슷하게 떠올리면 편합니다.

```text
study_log 테이블
+----+------------------+-----------+------------+
| id | title            | category  | study_date |
+----+------------------+-----------+------------+
| 1  | Spring DI 정리   | SPRING    | 2026-04-01 |
| 2  | SQL JOIN 연습    | DATABASE  | 2026-04-02 |
+----+------------------+-----------+------------+
```

- 테이블: 하나의 주제별 표
- 컬럼: 속성
- 행(Row): 실제 데이터 한 건
- PK(기본키): 각 행을 구분하는 고유값
- FK(외래키): 다른 테이블의 PK를 참조하는 값

---

## 왜 "관계형" 데이터베이스일까

예를 들어 회원과 학습 일지가 있다고 해봅시다.

```text
member
+----+-------+
| id | name  |
+----+-------+
| 1  | buzz  |
+----+-------+

study_log
+----+----------------+-----------+
| id | title          | member_id |
+----+----------------+-----------+
| 1  | JPA 기초 정리  | 1         |
+----+----------------+-----------+
```

`study_log.member_id`는 `member.id`를 참조합니다.

이렇게 테이블끼리 관계를 맺으니까 관계형 데이터베이스입니다.

---

## SQL의 큰 분류

### DDL

구조를 다룹니다.

- `CREATE`
- `ALTER`
- `DROP`

### DML

데이터를 다룹니다.

- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`

처음에는 이 둘만 확실히 구분해도 충분합니다.

---

## 따라쳐보기 1: 테이블 만들기

```sql
CREATE TABLE member (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    PRIMARY KEY (id)
);

CREATE TABLE study_log (
    id BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    study_date DATE NOT NULL,
    member_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (member_id) REFERENCES member(id)
);
```

이 코드에서 봐야 할 포인트:

- `AUTO_INCREMENT`: id 자동 증가
- `NOT NULL`: 필수값
- `UNIQUE`: 중복 금지
- `PRIMARY KEY`: 기본키
- `FOREIGN KEY`: 다른 테이블 연결

---

## 따라쳐보기 2: 데이터 넣기

```sql
INSERT INTO member (name, email)
VALUES ('buzz', 'buzz@example.com');

INSERT INTO study_log (title, category, study_date, member_id)
VALUES ('Spring MVC 복습', 'SPRING', '2026-04-07', 1);
```

---

## 따라쳐보기 3: 조회하기

```sql
SELECT * FROM member;

SELECT title, category
FROM study_log;
```

조건 조회:

```sql
SELECT *
FROM study_log
WHERE category = 'SPRING';
```

정렬:

```sql
SELECT *
FROM study_log
ORDER BY study_date DESC;
```

---

## JOIN 감각 잡기

회원 이름과 학습 일지 제목을 같이 보고 싶을 때 `JOIN`을 씁니다.

```sql
SELECT m.name, s.title, s.study_date
FROM study_log s
JOIN member m ON s.member_id = m.id;
```

이 한 줄이 아주 중요합니다.

> 테이블을 나눠 저장하고, 필요할 때 JOIN으로 합쳐서 본다.

---

## 인덱스는 왜 빠를까

인덱스가 없으면 책 전체를 처음부터 끝까지 뒤져야 합니다.

인덱스가 있으면 목차나 색인으로 바로 찾는 느낌입니다.

예:

```sql
CREATE INDEX idx_study_log_category ON study_log(category);
```

기본 감각:

- 조회가 빨라질 수 있음
- 대신 저장/수정 시 비용이 약간 늘어남
- 무조건 많이 만든다고 좋은 게 아님

---

## 자주 하는 실수

- PK 없이 테이블을 만들려는 것
- 문자열로 날짜를 막 저장하는 것
- FK 관계를 무시하고 중복 데이터를 마구 넣는 것
- `SELECT *`만 계속 쓰며 어떤 컬럼이 필요한지 생각하지 않는 것

---

## 면접 체크

1. RDBMS는 무엇인가요?
2. PK와 FK의 차이는 무엇인가요?
3. DDL과 DML은 어떻게 다른가요?
4. JOIN은 왜 필요한가요?
5. 인덱스는 왜 조회를 빠르게 해주나요?

---

## 직접 해보기

1. `member`, `study_log` 테이블을 직접 만들어보세요.
2. 회원 2명, 학습 일지 3건을 넣어보세요.
3. 특정 회원이 작성한 학습 일지만 조회해보세요.
4. 카테고리별로 조회해보고 정렬도 바꿔보세요.

---

## 다음 주제 연결

이제 SQL로 데이터를 넣고 꺼낼 수 있습니다. 다음에는 `GROUP BY`, 서브쿼리, 윈도우 함수처럼 조금 더 "실무다운 SQL"로 넘어갑니다.
