# 17. RDBMS 기초와 SQL

> **키워드**: `RDBMS` `MySQL` `PostgreSQL` `DDL` `DML` `SELECT` `JOIN` `INDEX` `정규화` `ERD`

---

## 1. 데이터베이스가 왜 필요한가?

Phase 1~2에서 만든 API를 떠올려보자. 학습 일지 데이터를 어디에 저장했나?

```java
// Phase 1-2 복습 프로젝트에서 쓴 방식
private final Map<Long, StudyLog> store = new HashMap<>();
```

**HashMap의 치명적인 문제:**

| 문제 | 설명 |
|------|------|
| **서버 꺼지면 데이터 사라짐** | HashMap은 메모리(RAM)에만 존재. 서버 재시작 = 데이터 전부 삭제 |
| **여러 서버에서 공유 불가** | 서버 A의 HashMap과 서버 B의 HashMap은 서로 다른 데이터 |
| **검색이 느림** | 10만 건의 데이터에서 "SPRING 카테고리인 것만" 찾으려면 전부 순회해야 함 |
| **관계 표현 불가** | "이 학습 일지를 작성한 사용자" 같은 관계를 표현하기 어렵다 |
| **동시 접근 위험** | 여러 요청이 동시에 put/remove하면 데이터가 꼬일 수 있다 |

→ 이 모든 문제를 해결하는 게 **데이터베이스(Database)**다.

---

## 2. RDBMS란?

### 한 줄 정의

**R**elational **D**ata**b**ase **M**anagement **S**ystem — 데이터를 **테이블(표)** 형태로 저장하고, 테이블 간 **관계(Relation)**를 정의해서 관리하는 소프트웨어다.

### 핵심 개념을 표로 이해하기

엑셀을 떠올리면 쉽다:

```
┌─────────────────────────────────────────────────┐
│               study_log (테이블)                  │
├─────┬────────────┬────────────┬─────────────────┤
│ id  │   title    │  category  │   created_at    │  ← 컬럼(Column) = 속성
├─────┼────────────┼────────────┼─────────────────┤
│  1  │ Spring DI  │  SPRING    │  2026-03-10     │  ← 행(Row) = 레코드 = 데이터 1건
│  2  │ SQL 기초   │  DATABASE  │  2026-03-11     │
│  3  │ JPA 입문   │  SPRING    │  2026-03-12     │
└─────┴────────────┴────────────┴─────────────────┘
```

| 용어 | 엑셀 비유 | 설명 |
|------|-----------|------|
| **테이블 (Table)** | 시트 | 데이터를 담는 표. 하나의 주제를 표현 |
| **컬럼 (Column)** | 열 (A열, B열...) | 데이터의 속성. `title`, `category` 등 |
| **행/레코드 (Row)** | 행 (1행, 2행...) | 데이터 1건. study_log 하나 |
| **기본키 (Primary Key, PK)** | — | 각 행을 유일하게 식별하는 값. 보통 `id` |
| **외래키 (Foreign Key, FK)** | — | 다른 테이블의 PK를 참조해서 관계를 만드는 값 |
| **스키마 (Schema)** | 시트 구조 | 테이블의 구조 정의 (어떤 컬럼이 있고, 타입은 뭔지) |

### HashMap vs RDBMS 비교

| 비교 항목 | HashMap | RDBMS |
|-----------|---------|-------|
| 저장 위치 | 메모리(RAM) | 디스크 + 메모리 캐시 |
| 서버 재시작 | 데이터 소멸 | **데이터 영구 보존** |
| 검색 | 키(key)로만 빠름 | **어떤 컬럼으로든 검색 가능** (인덱스) |
| 관계 표현 | 불가능 | **FK로 테이블 간 관계 정의** |
| 동시 접근 | 위험 | **트랜잭션으로 안전하게 처리** |
| 데이터 정합성 | 보장 안 됨 | **제약 조건(NOT NULL, UNIQUE 등)**으로 보장 |

---

## 3. MySQL vs PostgreSQL

Spring Boot에서 가장 많이 쓰는 두 가지 RDBMS:

| 비교 항목 | MySQL | PostgreSQL |
|-----------|-------|------------|
| **한 줄 소개** | 가장 널리 쓰이는 오픈소스 DB | 가장 기능이 풍부한 오픈소스 DB |
| **점유율** | 1위 (압도적) | 2위 (빠르게 성장 중) |
| **학습 난이도** | 쉬움 | 약간 어려움 |
| **JSON 지원** | 기본적 | **매우 강력 (JSONB)** |
| **성능 특성** | 읽기(SELECT) 빠름 | 복잡한 쿼리에 강함 |
| **사용처** | 스타트업, 웹서비스 | 금융, 데이터 분석, 대기업 |
| **Spring Boot 설정** | `spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver` | `spring.datasource.driver-class-name=org.postgresql.Driver` |

### 어떤 걸 배울까?

**이 커리큘럼에서는 MySQL을 기준으로 학습한다.** 이유:
- 부트캠프에서 가장 많이 채택
- 학습 자료가 풍부
- 취업 시장에서 요구하는 비율이 가장 높음

> 💡 SQL 문법의 **90% 이상은 MySQL이나 PostgreSQL이나 동일**하다. 하나를 제대로 배우면 다른 건 금방 적응한다.

---

## 4. MySQL 설치와 접속

### 4-1. Mac (Homebrew)

```bash
# 설치
brew install mysql

# MySQL 서버 시작
brew services start mysql

# 접속 (처음에는 비밀번호 없음)
mysql -u root
```

### 4-2. Windows (MySQL Installer)

1. [MySQL Community Downloads](https://dev.mysql.com/downloads/installer/) 에서 다운로드
2. **Developer Default** 선택 → Next → Execute
3. Root 비밀번호 설정
4. MySQL Workbench 또는 터미널에서 접속

### 4-3. Docker (추천 — 환경 오염 없음)

Docker를 쓰면 내 Mac/Windows에 MySQL을 직접 설치하지 않고, **컨테이너라는 격리된 공간**에서 실행한다. 삭제도 깔끔하고, 여러 버전을 동시에 쓸 수도 있다.

#### Step 1. Docker 설치 확인

```bash
# Docker가 설치되어 있는지 확인
docker --version
# Docker version 24.x.x 같은 게 나오면 OK

# Docker Desktop이 실행 중인지 확인
docker ps
# 에러 없이 빈 목록이 나오면 OK
```

> 💡 Docker가 없다면 [Docker Desktop](https://www.docker.com/products/docker-desktop/) 설치 후 실행

#### Step 2. MySQL 컨테이너 생성 & 실행

```bash
docker run -d \
  --name mysql-study \
  -e MYSQL_ROOT_PASSWORD=1234 \
  -e MYSQL_DATABASE=study_db \
  -p 3306:3306 \
  mysql:8.0
```

**한 줄씩 해석:**

| 옵션 | 의미 |
|------|------|
| `docker run` | 새 컨테이너를 만들고 실행 |
| `-d` | 백그라운드 실행 (터미널 안 잡아먹음) |
| `--name mysql-study` | 컨테이너 이름을 `mysql-study`로 지정 |
| `-e MYSQL_ROOT_PASSWORD=1234` | root 비밀번호를 `1234`로 설정 |
| `-e MYSQL_DATABASE=study_db` | `study_db`라는 데이터베이스를 자동 생성 |
| `-p 3306:3306` | 내 PC의 3306 포트 → 컨테이너의 3306 포트로 연결 |
| `mysql:8.0` | MySQL 8.0 이미지 사용 |

> 💡 처음 실행하면 MySQL 이미지를 다운로드하느라 시간이 좀 걸린다 (약 500MB)

#### Step 3. 컨테이너 상태 확인

```bash
# 실행 중인 컨테이너 목록
docker ps

# 결과 예시:
# CONTAINER ID   IMAGE       STATUS          PORTS                    NAMES
# a1b2c3d4e5f6   mysql:8.0   Up 10 seconds   0.0.0.0:3306->3306/tcp   mysql-study
```

`STATUS`가 `Up`이면 정상 실행 중!

#### Step 4. MySQL 접속

```bash
# 방법 1: 컨테이너 안에서 mysql 클라이언트로 접속
docker exec -it mysql-study mysql -u root -p1234

# 방법 2: 컨테이너 안에 bash로 들어간 후 접속
docker exec -it mysql-study bash
mysql -u root -p1234
```

| 옵션 | 의미 |
|------|------|
| `docker exec` | 실행 중인 컨테이너에 명령 실행 |
| `-it` | **i**nteractive + **t**ty = 터미널처럼 입력/출력 가능하게 |
| `mysql-study` | 접속할 컨테이너 이름 |
| `mysql -u root -p1234` | MySQL 클라이언트로 root 계정 접속 |

#### Step 5. 자주 쓰는 Docker 명령어

```bash
# 컨테이너 중지
docker stop mysql-study

# 컨테이너 다시 시작
docker start mysql-study

# 컨테이너 삭제 (중지 후에만 가능)
docker stop mysql-study && docker rm mysql-study

# 로그 확인 (에러 날 때 유용)
docker logs mysql-study

# 실행 중인 모든 컨테이너 확인
docker ps

# 중지된 것까지 포함해서 전체 확인
docker ps -a
```

#### ⚠️ 주의: 컨테이너 삭제하면 데이터도 사라진다!

기본적으로 컨테이너 안의 데이터는 컨테이너와 함께 삭제된다. **데이터를 보존하려면 Volume을 사용:**

```bash
# Volume을 사용한 MySQL 컨테이너 (데이터 영구 보존)
docker run -d \
  --name mysql-study \
  -e MYSQL_ROOT_PASSWORD=1234 \
  -e MYSQL_DATABASE=study_db \
  -p 3306:3306 \
  -v mysql-study-data:/var/lib/mysql \
  mysql:8.0
```

| 추가 옵션 | 의미 |
|-----------|------|
| `-v mysql-study-data:/var/lib/mysql` | `mysql-study-data`라는 Docker Volume에 MySQL 데이터를 저장. 컨테이너를 삭제해도 데이터가 남아있음 |

> 💡 **학습 단계에서는 Volume 없이 써도 된다.** 어차피 연습 데이터니까 날려도 상관없음. 하지만 나중에 실제 프로젝트에서는 반드시 Volume을 쓰자!

#### 🔌 IntelliJ에서 Docker MySQL 접속하기

터미널 말고 **IntelliJ의 Database 도구**로도 접속할 수 있다:

1. IntelliJ 우측 사이드바 → **Database** 탭 클릭
2. **+** → **Data Source** → **MySQL** 선택
3. 접속 정보 입력:

| 항목 | 값 |
|------|-----|
| Host | `localhost` |
| Port | `3306` |
| User | `root` |
| Password | `1234` |
| Database | `study_db` |

4. **Test Connection** 클릭 → 초록색 체크 뜨면 성공
5. **OK** → 왼쪽 패널에서 테이블 확인, SQL 실행 가능

> 💡 IntelliJ에서 SQL을 직접 실행하고 결과를 표로 볼 수 있어서, 터미널보다 훨씬 편하다!

### 4-4. 접속 확인

```sql
-- 접속 후 이 명령어가 되면 성공
SHOW DATABASES;

-- 결과 예시:
-- +--------------------+
-- | Database           |
-- +--------------------+
-- | information_schema |
-- | mysql              |
-- | performance_schema |
-- | study_db           |
-- +--------------------+
```

---

## 5. SQL이란?

### 한 줄 정의

**S**tructured **Q**uery **L**anguage — 데이터베이스에 명령을 내리는 **전용 언어**다.

### SQL의 3가지 분류

Java에서 "변수 선언"과 "메서드 호출"이 다르듯, SQL도 역할별로 나뉜다:

| 분류 | 이름 | 역할 | 대표 명령어 |
|------|------|------|------------|
| **DDL** | Data Definition Language | 테이블 **구조**를 만들고 변경 | `CREATE`, `ALTER`, `DROP` |
| **DML** | Data Manipulation Language | 데이터를 **조작** (CRUD) | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| **DCL** | Data Control Language | **권한**을 제어 | `GRANT`, `REVOKE` |

> 💡 백엔드 개발자가 매일 쓰는 건 **DDL + DML**이다. DCL은 DBA(데이터베이스 관리자)의 영역.

---

## 6. DDL — 테이블 만들기

### 6-1. 데이터베이스 생성

```sql
-- 데이터베이스 생성
CREATE DATABASE study_db;

-- 사용할 데이터베이스 선택
USE study_db;
```

### 6-2. 테이블 생성 (CREATE TABLE)

학습 일지 테이블을 만들어보자:

```sql
CREATE TABLE study_log (
    id         BIGINT       NOT NULL AUTO_INCREMENT,  -- 자동 증가 PK
    title      VARCHAR(200) NOT NULL,                  -- 최대 200자, 필수
    content    TEXT         NOT NULL,                  -- 긴 텍스트
    category   VARCHAR(50)  NOT NULL,                  -- 카테고리
    study_date DATE         NOT NULL,                  -- 학습 날짜
    created_at DATETIME     NOT NULL DEFAULT NOW(),    -- 생성 시각 (자동)
    updated_at DATETIME     NOT NULL DEFAULT NOW() ON UPDATE NOW(),  -- 수정 시각 (자동)

    PRIMARY KEY (id)  -- id를 기본키로 지정
);
```

**한 줄씩 해석:**

| 라인 | 의미 |
|------|------|
| `id BIGINT NOT NULL AUTO_INCREMENT` | 정수형, 비어있으면 안 됨, 1부터 자동으로 1씩 증가 |
| `title VARCHAR(200) NOT NULL` | 가변 문자열 최대 200자, 필수값 |
| `content TEXT NOT NULL` | 긴 텍스트 (65,535자까지), 필수값 |
| `category VARCHAR(50) NOT NULL` | 카테고리 이름 저장 |
| `study_date DATE NOT NULL` | 날짜만 저장 (2026-03-17) |
| `created_at DATETIME NOT NULL DEFAULT NOW()` | 날짜+시간 저장, INSERT 시 자동으로 현재 시각 |
| `ON UPDATE NOW()` | UPDATE할 때 자동으로 현재 시각으로 갱신 |
| `PRIMARY KEY (id)` | id 컬럼을 기본키로 지정 |

### 6-3. 자주 쓰는 데이터 타입

| 타입 | 설명 | Java 대응 |
|------|------|-----------|
| `BIGINT` | 큰 정수 (8바이트) | `Long` |
| `INT` | 정수 (4바이트) | `Integer` |
| `VARCHAR(n)` | 가변 문자열 (최대 n자) | `String` |
| `TEXT` | 긴 텍스트 | `String` |
| `BOOLEAN` | true/false | `Boolean` |
| `DATE` | 날짜 (2026-03-17) | `LocalDate` |
| `DATETIME` | 날짜+시간 (2026-03-17 14:30:00) | `LocalDateTime` |
| `DECIMAL(p,s)` | 정밀한 소수 (금액 등) | `BigDecimal` |

> 💡 **VARCHAR vs TEXT**: 제목처럼 길이가 예측 가능하면 `VARCHAR`, 본문처럼 길이를 모르면 `TEXT`.

### 6-4. 제약 조건 (Constraints)

데이터의 무결성을 보장하는 규칙:

```sql
CREATE TABLE member (
    id       BIGINT       NOT NULL AUTO_INCREMENT,
    email    VARCHAR(255) NOT NULL,
    nickname VARCHAR(50)  NOT NULL,
    age      INT          NULL,       -- NULL 허용 (선택 입력)

    PRIMARY KEY (id),
    UNIQUE (email),                   -- 이메일 중복 불가
    CHECK (age >= 0 AND age <= 150)   -- 나이 범위 제한
);
```

| 제약 조건 | 설명 | 예시 |
|-----------|------|------|
| `NOT NULL` | 비어있으면 안 됨 | 제목 없는 일지는 안 됨 |
| `UNIQUE` | 중복 불가 | 이메일은 한 사람만 가능 |
| `PRIMARY KEY` | NOT NULL + UNIQUE + 테이블 대표 | id |
| `FOREIGN KEY` | 다른 테이블의 PK 참조 | 뒤에서 자세히 |
| `DEFAULT` | 값 안 주면 기본값 사용 | `created_at DEFAULT NOW()` |
| `CHECK` | 조건을 만족해야 저장 가능 | 나이 0~150만 허용 |

### 6-5. 테이블 수정과 삭제

```sql
-- 컬럼 추가
ALTER TABLE study_log ADD COLUMN memo VARCHAR(500) NULL;

-- 컬럼 타입 변경
ALTER TABLE study_log MODIFY COLUMN memo TEXT NULL;

-- 컬럼 삭제
ALTER TABLE study_log DROP COLUMN memo;

-- 컬럼 이름 변경
ALTER TABLE study_log CHANGE COLUMN category category_name VARCHAR(50) NOT NULL;

-- 테이블 삭제 (⚠️ 데이터도 전부 삭제됨!)
DROP TABLE study_log;

-- 테이블 존재 시에만 삭제 (에러 방지)
DROP TABLE IF EXISTS study_log;

-- 테이블 구조 확인
DESC study_log;
-- 또는
SHOW CREATE TABLE study_log;
```

---

## 7. DML — 데이터 CRUD

### 7-1. INSERT — 데이터 추가

```sql
-- 단건 추가
INSERT INTO study_log (title, content, category, study_date)
VALUES ('Spring DI 학습', 'IoC 컨테이너가 객체를 관리한다', 'SPRING', '2026-03-10');

-- 여러 건 한 번에 추가
INSERT INTO study_log (title, content, category, study_date)
VALUES
    ('SQL 기초', 'SELECT, INSERT, UPDATE, DELETE를 배웠다', 'DATABASE', '2026-03-11'),
    ('JPA 입문', 'ORM이 뭔지 개념을 잡았다', 'SPRING', '2026-03-12'),
    ('REST API 설계', 'URI 네이밍 규칙을 정리했다', 'SPRING', '2026-03-13'),
    ('인덱스 이해', 'B-Tree 인덱스의 구조를 배웠다', 'DATABASE', '2026-03-14'),
    ('Docker 기초', '컨테이너와 이미지 개념을 잡았다', 'DEVOPS', '2026-03-15');
```

> 💡 `id`, `created_at`, `updated_at`은 AUTO_INCREMENT와 DEFAULT로 자동 생성되니까 안 넣어도 된다.

### 7-2. SELECT — 데이터 조회

**SELECT가 SQL에서 가장 중요하다.** 백엔드 개발자의 SQL 업무 중 80%가 SELECT.

```sql
-- 전체 조회
SELECT * FROM study_log;

-- 특정 컬럼만 조회
SELECT title, category, study_date FROM study_log;

-- 조건 조회 (WHERE)
SELECT * FROM study_log WHERE category = 'SPRING';

-- 여러 조건 (AND, OR)
SELECT * FROM study_log
WHERE category = 'SPRING' AND study_date >= '2026-03-12';

-- 부분 검색 (LIKE)
SELECT * FROM study_log WHERE title LIKE '%JPA%';
-- % = 아무 글자 (0개 이상)
-- _ = 아무 글자 1개

-- NULL 체크
SELECT * FROM study_log WHERE memo IS NULL;
SELECT * FROM study_log WHERE memo IS NOT NULL;

-- 정렬 (ORDER BY)
SELECT * FROM study_log ORDER BY study_date DESC;  -- 최신순
SELECT * FROM study_log ORDER BY category ASC, study_date DESC;  -- 카테고리 오름차순 → 같으면 최신순

-- 개수 제한 (LIMIT)
SELECT * FROM study_log ORDER BY created_at DESC LIMIT 5;  -- 최신 5개만

-- OFFSET과 LIMIT으로 페이징
SELECT * FROM study_log ORDER BY id DESC LIMIT 10 OFFSET 0;   -- 1페이지 (1~10번째)
SELECT * FROM study_log ORDER BY id DESC LIMIT 10 OFFSET 10;  -- 2페이지 (11~20번째)
SELECT * FROM study_log ORDER BY id DESC LIMIT 10 OFFSET 20;  -- 3페이지 (21~30번째)
```

### 7-3. WHERE 조건 정리

| 연산자 | 의미 | 예시 |
|--------|------|------|
| `=` | 같다 | `category = 'SPRING'` |
| `!=` 또는 `<>` | 다르다 | `category != 'DEVOPS'` |
| `>`, `>=`, `<`, `<=` | 크기 비교 | `study_date >= '2026-03-10'` |
| `BETWEEN A AND B` | A 이상 B 이하 | `study_date BETWEEN '2026-03-10' AND '2026-03-15'` |
| `IN (값1, 값2, ...)` | 목록 중 하나 | `category IN ('SPRING', 'DATABASE')` |
| `LIKE '패턴'` | 패턴 매칭 | `title LIKE '%JPA%'` |
| `IS NULL` | NULL인 것 | `memo IS NULL` |
| `IS NOT NULL` | NULL이 아닌 것 | `memo IS NOT NULL` |
| `AND` | 두 조건 모두 | `a = 1 AND b = 2` |
| `OR` | 둘 중 하나 | `a = 1 OR a = 2` |
| `NOT` | 부정 | `NOT category = 'DEVOPS'` |

### 7-4. UPDATE — 데이터 수정

```sql
-- 특정 행 수정
UPDATE study_log
SET title = 'Spring DI 완벽 이해', content = '생성자 주입이 가장 권장된다'
WHERE id = 1;

-- 조건에 맞는 여러 행 수정
UPDATE study_log
SET category = 'JPA'
WHERE category = 'SPRING' AND title LIKE '%JPA%';
```

> ⚠️ **WHERE 없이 UPDATE하면 전체 행이 수정된다!** 실무에서 가장 위험한 실수 중 하나.

### 7-5. DELETE — 데이터 삭제

```sql
-- 특정 행 삭제
DELETE FROM study_log WHERE id = 3;

-- 조건에 맞는 여러 행 삭제
DELETE FROM study_log WHERE category = 'DEVOPS';
```

> ⚠️ **WHERE 없이 DELETE하면 전체 데이터가 삭제된다!** 복구 불가.

### 7-6. CRUD와 Spring API 대응표

Phase 2에서 만든 API와 SQL이 어떻게 연결되는지:

| API 동작 | HTTP Method | SQL | 예시 |
|----------|-------------|-----|------|
| 목록 조회 | `GET /study-logs` | `SELECT` | `SELECT * FROM study_log ORDER BY id DESC` |
| 단건 조회 | `GET /study-logs/1` | `SELECT` | `SELECT * FROM study_log WHERE id = 1` |
| 생성 | `POST /study-logs` | `INSERT` | `INSERT INTO study_log (...) VALUES (...)` |
| 수정 | `PATCH /study-logs/1` | `UPDATE` | `UPDATE study_log SET ... WHERE id = 1` |
| 삭제 | `DELETE /study-logs/1` | `DELETE` | `DELETE FROM study_log WHERE id = 1` |

---

## 8. 집계 함수와 GROUP BY

### 8-1. 집계 함수

데이터를 **요약**할 때 사용:

```sql
-- 전체 학습 일지 수
SELECT COUNT(*) FROM study_log;
-- 결과: 6

-- 카테고리별 일지 수
SELECT category, COUNT(*) AS count
FROM study_log
GROUP BY category;
-- 결과:
-- | category  | count |
-- |-----------|-------|
-- | SPRING    | 3     |
-- | DATABASE  | 2     |
-- | DEVOPS    | 1     |
```

| 함수 | 설명 | 예시 |
|------|------|------|
| `COUNT(*)` | 행 수 | 총 몇 건인지 |
| `COUNT(컬럼)` | NULL 제외 행 수 | 메모가 있는 일지 수 |
| `SUM(컬럼)` | 합계 | 총 학습 시간 |
| `AVG(컬럼)` | 평균 | 평균 학습 시간 |
| `MAX(컬럼)` | 최대값 | 가장 최근 학습 날짜 |
| `MIN(컬럼)` | 최소값 | 가장 오래된 학습 날짜 |

### 8-2. GROUP BY — 그룹별 집계

```sql
-- 카테고리별 일지 수와 최신 학습 날짜
SELECT
    category,
    COUNT(*) AS log_count,
    MAX(study_date) AS latest_date
FROM study_log
GROUP BY category;
```

### 8-3. HAVING — 그룹 조건 필터링

```sql
-- 일지가 2개 이상인 카테고리만 조회
SELECT category, COUNT(*) AS log_count
FROM study_log
GROUP BY category
HAVING COUNT(*) >= 2;
-- 결과:
-- | category  | log_count |
-- |-----------|-----------|
-- | SPRING    | 3         |
-- | DATABASE  | 2         |
```

> 💡 **WHERE vs HAVING 차이:**
> - `WHERE`: 그룹 만들기 **전에** 행을 필터링
> - `HAVING`: 그룹 만든 **후에** 그룹을 필터링

```sql
-- WHERE와 HAVING 함께 사용
SELECT category, COUNT(*) AS log_count
FROM study_log
WHERE study_date >= '2026-03-12'  -- 먼저 3/12 이후 데이터만 추림
GROUP BY category                  -- 그 다음 카테고리별로 묶음
HAVING COUNT(*) >= 1;              -- 1개 이상인 그룹만 표시
```

### 8-4. SELECT 실행 순서

SQL은 작성 순서와 실행 순서가 다르다. 이걸 알아야 에러가 안 난다:

```
작성 순서                    실행 순서
────────                    ────────
SELECT    ← 5번째           FROM      ← 1번째 (어떤 테이블?)
FROM      ← 1번째           WHERE     ← 2번째 (행 필터링)
WHERE     ← 2번째           GROUP BY  ← 3번째 (그룹 만들기)
GROUP BY  ← 3번째           HAVING    ← 4번째 (그룹 필터링)
HAVING    ← 4번째           SELECT    ← 5번째 (컬럼 선택)
ORDER BY  ← 6번째           ORDER BY  ← 6번째 (정렬)
LIMIT     ← 7번째           LIMIT     ← 7번째 (개수 제한)
```

> 💡 이 순서 때문에 `WHERE`에서는 별칭(AS)을 쓸 수 없고, `HAVING`과 `ORDER BY`에서는 쓸 수 있다.

---

## 9. JOIN — 테이블 연결하기

### 왜 테이블을 나누는가?

학습 일지에 "작성자" 정보를 추가하고 싶다고 하자:

**❌ 나쁜 방법 — 한 테이블에 다 넣기:**

```
study_log
| id | title       | author_name | author_email       |
|----|-------------|-------------|-------------------|
|  1 | Spring DI   | 홍길동      | hong@example.com  |
|  2 | SQL 기초    | 홍길동      | hong@example.com  |  ← 중복!
|  3 | JPA 입문    | 김철수      | kim@example.com   |
```

→ 홍길동의 이메일이 바뀌면 2개 행을 다 수정해야 함 (데이터 불일치 위험)

**✅ 좋은 방법 — 테이블 분리 + FK:**

```
member                              study_log
| id | name   | email             | | id | title      | member_id |
|----|--------|-------------------| |----|------------|-----------|
|  1 | 홍길동  | hong@example.com | |  1 | Spring DI  |     1     | ← member.id = 1 참조
|  2 | 김철수  | kim@example.com  | |  2 | SQL 기초   |     1     | ← member.id = 1 참조
                                    |  3 | JPA 입문   |     2     | ← member.id = 2 참조
```

→ 홍길동의 이메일이 바뀌면 member 테이블 1곳만 수정하면 됨!

### 테이블 생성 (FK 포함)

```sql
-- 회원 테이블
CREATE TABLE member (
    id    BIGINT       NOT NULL AUTO_INCREMENT,
    name  VARCHAR(50)  NOT NULL,
    email VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (email)
);

-- 학습 일지 테이블 (member를 참조)
CREATE TABLE study_log (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    title      VARCHAR(200) NOT NULL,
    content    TEXT         NOT NULL,
    category   VARCHAR(50)  NOT NULL,
    study_date DATE         NOT NULL,
    member_id  BIGINT       NOT NULL,  -- FK: member 테이블의 id를 참조
    created_at DATETIME     NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id),
    FOREIGN KEY (member_id) REFERENCES member(id)  -- FK 제약 조건
);
```

> 💡 `FOREIGN KEY (member_id) REFERENCES member(id)` = "study_log.member_id에는 member.id에 존재하는 값만 넣을 수 있다"

### 9-1. INNER JOIN (내부 조인)

**양쪽 테이블에 모두 매칭되는 행만** 가져온다:

```sql
-- 학습 일지 + 작성자 이름 함께 조회
SELECT
    s.id,
    s.title,
    s.category,
    m.name AS author_name
FROM study_log s
INNER JOIN member m ON s.member_id = m.id;

-- 결과:
-- | id | title      | category | author_name |
-- |----|------------|----------|-------------|
-- |  1 | Spring DI  | SPRING   | 홍길동       |
-- |  2 | SQL 기초   | DATABASE | 홍길동       |
-- |  3 | JPA 입문   | SPRING   | 김철수       |
```

**해석**: `study_log` 테이블(별칭 `s`)과 `member` 테이블(별칭 `m`)을 `s.member_id = m.id` 조건으로 연결

### 9-2. LEFT JOIN (왼쪽 외부 조인)

**왼쪽 테이블의 모든 행** + 매칭되는 오른쪽 행 (없으면 NULL):

```sql
-- 모든 회원 + 학습 일지 (일지가 없는 회원도 포함)
SELECT
    m.name,
    s.title
FROM member m
LEFT JOIN study_log s ON m.id = s.member_id;

-- 결과:
-- | name   | title      |
-- |--------|------------|
-- | 홍길동  | Spring DI  |
-- | 홍길동  | SQL 기초   |
-- | 김철수  | JPA 입문   |
-- | 박영희  | NULL       |  ← 일지가 없는 회원도 나옴!
```

### 9-3. JOIN 종류 비교

```
INNER JOIN:     LEFT JOIN:      RIGHT JOIN:     FULL OUTER JOIN:
  A ∩ B           A 전부 + B       A + B 전부      A ∪ B
  ┌───┐           ┌───┐           ┌───┐           ┌───┐
 ┌┤   ├┐         ┌┤███├┐         ┌┤   ├┐         ┌┤███├┐
 │├───┤│         │├───┤│         │├───┤│         │├───┤│
 ││███││         ││███││         ││███││         ││███││
 │├───┤│         │├───┤│         │├───┤│         │├───┤│
 └┤   ├┘         └┤   ├┘         └┤███├┘         └┤███├┘
  └───┘           └───┘           └───┘           └───┘
```

| JOIN 종류 | 반환 결과 | 사용 빈도 |
|-----------|-----------|-----------|
| `INNER JOIN` | 양쪽 모두 매칭되는 행만 | ⭐⭐⭐⭐⭐ (가장 많이 씀) |
| `LEFT JOIN` | 왼쪽 전체 + 오른쪽 매칭 (없으면 NULL) | ⭐⭐⭐⭐ |
| `RIGHT JOIN` | 오른쪽 전체 + 왼쪽 매칭 (없으면 NULL) | ⭐ (LEFT JOIN으로 대체 가능) |
| `FULL OUTER JOIN` | 양쪽 전체 (MySQL은 미지원) | ⭐ |

> 💡 **실무 팁**: `INNER JOIN`과 `LEFT JOIN`만 알면 99%의 상황을 커버할 수 있다.

---

## 10. 인덱스 (INDEX) 기초

### 인덱스란?

**데이터를 빠르게 찾기 위한 목차**. 책의 맨 뒤에 있는 "색인(Index)"과 같은 개념이다.

### 인덱스가 없으면?

```sql
SELECT * FROM study_log WHERE category = 'SPRING';
```

10만 건의 데이터가 있다면 → **10만 건을 처음부터 끝까지 다 읽어야 한다** (Full Table Scan)

### 인덱스가 있으면?

```sql
-- category 컬럼에 인덱스 생성
CREATE INDEX idx_study_log_category ON study_log (category);

-- 이제 같은 쿼리가 훨씬 빨라짐
SELECT * FROM study_log WHERE category = 'SPRING';
```

→ 인덱스를 통해 **해당 데이터의 위치를 바로 찾아감** (B-Tree 탐색)

### B-Tree 인덱스 구조 (간단 이해)

```
                    [DATABASE, DEVOPS, SPRING]
                   /            |            \
         [DATABASE]        [DEVOPS]        [SPRING]
          ↓     ↓            ↓              ↓    ↓    ↓
        row 2  row 5       row 6          row 1  row 3  row 4
```

→ 트리 구조로 정렬되어 있어서 "SPRING"을 찾으려면 **3번만 비교**하면 된다 (vs 10만 번)

### 인덱스를 만들어야 하는 경우

| 상황 | 이유 |
|------|------|
| `WHERE`에 자주 쓰는 컬럼 | 조건 검색이 빨라짐 |
| `JOIN`의 ON 조건 컬럼 | 테이블 연결이 빨라짐 |
| `ORDER BY`에 쓰는 컬럼 | 정렬이 빨라짐 |
| `UNIQUE` 제약이 있는 컬럼 | 자동으로 인덱스 생성됨 |

### 인덱스를 만들면 안 되는 경우

| 상황 | 이유 |
|------|------|
| 데이터가 적은 테이블 (수백 건) | 풀 스캔이 더 빠름 |
| INSERT/UPDATE가 매우 빈번한 컬럼 | 인덱스도 같이 업데이트 → 쓰기 성능 저하 |
| 값의 종류가 적은 컬럼 (BOOLEAN 등) | 인덱스 효과 미미 (카디널리티 낮음) |

### 인덱스 관련 명령어

```sql
-- 인덱스 생성
CREATE INDEX idx_study_log_category ON study_log (category);

-- 복합 인덱스 (컬럼 2개를 합쳐서 인덱스)
CREATE INDEX idx_study_log_category_date ON study_log (category, study_date);

-- 인덱스 확인
SHOW INDEX FROM study_log;

-- 인덱스 삭제
DROP INDEX idx_study_log_category ON study_log;
```

> 💡 **PK에는 자동으로 인덱스가 생성된다.** 그래서 `WHERE id = 1` 같은 PK 검색은 항상 빠르다.

---

## 11. 정규화 — 테이블을 올바르게 나누는 기준

### 정규화란?

데이터의 **중복을 최소화**하고 **무결성을 보장**하기 위해 테이블을 분리하는 과정이다.

### 핵심 3가지만 알면 된다

#### 제1정규형 (1NF): 하나의 셀에 하나의 값

```
❌ 위반:
| id | title     | tags              |
|----|-----------|-------------------|
|  1 | Spring DI | spring, java, di  |  ← 하나의 셀에 여러 값!

✅ 해결: 태그를 별도 테이블로 분리
study_log_tag
| study_log_id | tag    |
|--------------|--------|
|      1       | spring |
|      1       | java   |
|      1       | di     |
```

#### 제2정규형 (2NF): PK 전체에 종속

```
❌ 위반: (복합 PK인 경우)
| student_id | course_id | course_name  | grade |
|------------|-----------|-------------|-------|
|     1      |    101    | Spring Boot | A     |

course_name은 course_id만으로 결정됨 (student_id는 필요 없음)

✅ 해결: course 테이블 분리
course
| id  | name        |
|-----|-------------|
| 101 | Spring Boot |
```

#### 제3정규형 (3NF): PK가 아닌 컬럼에 종속 금지

```
❌ 위반:
| id | title     | member_id | member_name |
|----|-----------|-----------|-------------|
|  1 | Spring DI |     1     | 홍길동       |

member_name은 member_id에 종속 (PK인 id가 아니라)

✅ 해결: member 테이블 분리 (9번 섹션에서 이미 했던 것!)
```

> 💡 **실무 팁**: 1NF~3NF까지만 지키면 대부분의 설계 문제를 예방할 수 있다. 면접에서도 이 3가지를 물어본다.

---

## 12. ERD — Entity Relationship Diagram

### ERD란?

테이블 간의 관계를 **그림으로** 표현한 설계도. 코딩 전에 ERD를 먼저 그린다.

### 관계의 종류

| 관계 | 의미 | 예시 |
|------|------|------|
| **1:1** | 하나 대 하나 | 회원 ↔ 프로필 |
| **1:N** | 하나 대 여럿 | 회원 → 학습 일지 (한 명이 여러 개 작성) |
| **N:M** | 여럿 대 여럿 | 학습 일지 ↔ 태그 (하나의 일지에 여러 태그, 하나의 태그에 여러 일지) |

### ERD 표기법 (간략)

```
member                          study_log
┌──────────┐     1 : N     ┌──────────────┐
│ id (PK)  │──────────────→│ id (PK)      │
│ name     │               │ title        │
│ email    │               │ content      │
└──────────┘               │ member_id(FK)│
                           └──────────────┘
```

→ member 1명이 study_log 여러 개를 작성할 수 있다 (1:N 관계)

### N:M 관계는 중간 테이블로 해결

학습 일지에 태그를 붙이고 싶다면:

```
study_log          study_log_tag (중간 테이블)         tag
┌──────────┐       ┌──────────────────┐        ┌──────────┐
│ id (PK)  │──┐    │ study_log_id(FK) │    ┌──│ id (PK)  │
│ title    │  └───→│ tag_id (FK)      │←───┘  │ name     │
└──────────┘       └──────────────────┘        └──────────┘
```

```sql
-- 태그 테이블
CREATE TABLE tag (
    id   BIGINT      NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (name)
);

-- 중간 테이블 (N:M → 1:N + N:1로 분해)
CREATE TABLE study_log_tag (
    study_log_id BIGINT NOT NULL,
    tag_id       BIGINT NOT NULL,
    PRIMARY KEY (study_log_id, tag_id),  -- 복합 PK
    FOREIGN KEY (study_log_id) REFERENCES study_log(id),
    FOREIGN KEY (tag_id) REFERENCES tag(id)
);
```

> 💡 **Phase 3의 20~24번(JPA)**에서 이 관계를 Java 코드로 매핑하는 방법을 배운다.

### ERD 도구

| 도구 | 특징 |
|------|------|
| **dbdiagram.io** | 웹 기반, 코드로 ERD 작성 (추천!) |
| MySQL Workbench | MySQL 공식 도구, GUI로 ERD 생성 |
| ERDCloud | 한국어 지원, 협업 가능 |
| IntelliJ Database Tools | IDE 내장, DB 연결하면 자동 생성 |

---

## 13. Spring Boot에서 MySQL 연결 (미리보기)

> 아직 직접 하지는 않는다. 19번(JDBC)과 20번(JPA)에서 실제로 연결한다. "이렇게 연결되는구나" 감만 잡자.

### application.yml 설정

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/study_db?useSSL=false&serverTimezone=Asia/Seoul
    username: root
    password: 1234
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: create  # 개발 환경에서만! (서버 시작 시 테이블 자동 생성)
    show-sql: true       # 실행되는 SQL을 콘솔에 출력
```

### Java Entity 클래스 (JPA)

```java
@Entity
@Table(name = "study_log")
public class StudyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // AUTO_INCREMENT
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 50)
    private String category;
}
```

| SQL | JPA 어노테이션 |
|-----|----------------|
| `CREATE TABLE` | `@Entity` + `@Table` |
| `BIGINT AUTO_INCREMENT` | `@Id` + `@GeneratedValue(IDENTITY)` |
| `VARCHAR(200) NOT NULL` | `@Column(nullable = false, length = 200)` |
| `TEXT NOT NULL` | `@Column(nullable = false, columnDefinition = "TEXT")` |
| `FOREIGN KEY` | `@ManyToOne` + `@JoinColumn` |

> 📖 자세한 내용은 [20-jpa-basics](../20-jpa-basics/)에서!

---

## 면접 대비

| 질문 | 핵심 답변 |
|------|-----------|
| RDBMS가 뭔가요? | 데이터를 테이블(행+열)로 저장하고, 테이블 간 관계를 FK로 정의해서 관리하는 시스템 |
| DDL과 DML의 차이는? | DDL은 테이블 구조(CREATE/ALTER/DROP), DML은 데이터 조작(SELECT/INSERT/UPDATE/DELETE) |
| PRIMARY KEY와 UNIQUE의 차이는? | PK = NOT NULL + UNIQUE + 테이블당 1개. UNIQUE = NULL 허용 가능 + 여러 개 가능 |
| WHERE와 HAVING의 차이는? | WHERE는 그룹핑 전에 행을 필터링, HAVING은 그룹핑 후에 그룹을 필터링 |
| INNER JOIN과 LEFT JOIN의 차이는? | INNER JOIN은 양쪽 매칭되는 것만, LEFT JOIN은 왼쪽 전체 + 오른쪽 매칭(없으면 NULL) |
| 인덱스란? | 데이터를 빠르게 찾기 위한 B-Tree 기반 목차. SELECT 성능 향상, INSERT/UPDATE 시 약간의 오버헤드 |
| 인덱스를 아무 컬럼에나 걸면 안 되는 이유는? | 쓰기(INSERT/UPDATE) 시 인덱스도 갱신해야 하고, 카디널리티가 낮으면 효과 미미 |
| 정규화란? | 데이터 중복을 제거하고 무결성을 보장하기 위해 테이블을 분리하는 과정. 1NF(원자값), 2NF(완전 함수 종속), 3NF(이행 종속 제거) |
| N:M 관계는 어떻게 구현하나요? | 중간 테이블(매핑 테이블)을 만들어 1:N + N:1로 분해 |
