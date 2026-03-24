# 23. Spring Data JPA

> **키워드**: `JpaRepository` `쿼리 메서드` `@Query` `JPQL` `Native Query` `Projection` `Specification` `Pageable` `Page` `Slice` `Cursor 기반 페이징`

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | JpaRepository, 쿼리 메서드, @Query, Pageable/Page | 면접 필수 + 실무 매일 사용 |
| 🟡 이해 | Page vs Slice, Projection, Native Query | 알면 성능 개선에 도움 |
| 🟢 참고 | Specification, Cursor 기반 페이징 | 대규모 서비스에서 필요 |

> 💡 **22번에서 @Transactional과 동시성 제어를 배웠다.**
> 이번에는 "그래서 데이터를 어떻게 조회하지?"에 대한 답이다.
> Spring Data JPA가 제공하는 강력한 쿼리 생성 기능을 배워보자.

---

## 1. Spring Data JPA란? 🔴

### 비유: 식당 키오스크

JPA를 직접 쓰는 건 주방에 들어가서 직접 요리하는 것이다.
Spring Data JPA는 **키오스크**다 — 버튼만 누르면 주문이 들어가고 음식이 나온다.

```
┌─────────────────────────────────────────────────┐
│                 우리가 쓰는 것                     │
│                                                   │
│   StudyLogRepository                              │
│   (interface만 만들면 끝!)                         │
│       │                                           │
│       ▼                                           │
│   Spring Data JPA  ← 메서드 이름 → 쿼리 자동 생성  │
│       │                                           │
│       ▼                                           │
│   JPA (Hibernate)  ← JPQL → SQL 변환              │
│       │                                           │
│       ▼                                           │
│   JDBC             ← SQL → DB 통신                │
│       │                                           │
│       ▼                                           │
│   Database (MySQL)                                │
└─────────────────────────────────────────────────┘
```

> **Spring Data JPA** = JPA를 더 쉽게 쓸 수 있도록 감싸준 Spring 프로젝트.
> **인터페이스만 만들면** 구현체를 자동으로 만들어준다.

### 20번에서 이미 맛봤다

```java
// 20번에서 만든 바로 그것!
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {
}
```

이게 전부다. 구현 클래스(Impl)를 만든 적 없는데, `save()`, `findById()`, `findAll()`, `delete()` 다 쓸 수 있었다.
이번에는 이 마법의 원리와, 더 다양한 조회 방법을 배운다.

---

## 2. Repository 계층 구조 🔴

### 인터페이스 상속 계층

```
Repository (최상위 — 마커 인터페이스)
    │
    ▼
CrudRepository (기본 CRUD: save, findById, delete...)
    │
    ▼
ListCrudRepository (findAll() → List 반환)
    │
    ▼
PagingAndSortingRepository (페이징 + 정렬)
    │
    ▼
JpaRepository (JPA 전용: flush, saveAll, deleteInBatch...)
```

### JpaRepository가 제공하는 주요 메서드

| 메서드 | 설명 | 반환 타입 |
|--------|------|-----------|
| `save(entity)` | 저장 (없으면 INSERT, 있으면 UPDATE) | `T` |
| `saveAll(entities)` | 여러 건 저장 | `List<T>` |
| `findById(id)` | PK로 조회 | `Optional<T>` |
| `findAll()` | 전체 조회 | `List<T>` |
| `findAll(Sort)` | 정렬 조회 | `List<T>` |
| `findAll(Pageable)` | 페이징 조회 | `Page<T>` |
| `count()` | 전체 개수 | `long` |
| `delete(entity)` | 삭제 | `void` |
| `deleteById(id)` | PK로 삭제 | `void` |
| `existsById(id)` | 존재 여부 | `boolean` |
| `flush()` | SQL 즉시 실행 | `void` |
| `deleteAllInBatch()` | 한 번에 DELETE (벌크) | `void` |

> ⚠️ **deleteAll() vs deleteAllInBatch()**
> - `deleteAll()` = 하나씩 SELECT → 하나씩 DELETE (N+1 발생!)
> - `deleteAllInBatch()` = `DELETE FROM study_log` 한 방 쿼리

---

## 3. 쿼리 메서드 (Query Methods) 🔴

### 비유: 메뉴판에 이름 쓰면 자동으로 요리가 나오는 식당

메서드 이름만 **규칙대로** 쓰면, Spring Data JPA가 자동으로 SQL을 만들어준다.

### 기본 문법

```
findBy + 필드명 + 조건키워드
```

### 실전 예제: StudyLogRepository

```java
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    // === 기본 조회 ===

    // SELECT * FROM study_log WHERE title = ?
    List<StudyLog> findByTitle(String title);

    // SELECT * FROM study_log WHERE category = ?
    List<StudyLog> findByCategory(Category category);

    // SELECT * FROM study_log WHERE member_id = ?
    List<StudyLog> findByMemberId(Long memberId);


    // === 복합 조건 ===

    // SELECT * FROM study_log WHERE category = ? AND study_date = ?
    List<StudyLog> findByCategoryAndStudyDate(Category category, LocalDate studyDate);

    // SELECT * FROM study_log WHERE title LIKE '%keyword%'
    List<StudyLog> findByTitleContaining(String keyword);

    // SELECT * FROM study_log WHERE study_time >= ?
    List<StudyLog> findByStudyTimeGreaterThanEqual(Integer minTime);


    // === 정렬 ===

    // SELECT * FROM study_log WHERE category = ? ORDER BY study_date DESC
    List<StudyLog> findByCategoryOrderByStudyDateDesc(Category category);


    // === 개수 / 존재 여부 ===

    // SELECT COUNT(*) FROM study_log WHERE member_id = ?
    long countByMemberId(Long memberId);

    // SELECT EXISTS(SELECT 1 FROM study_log WHERE title = ?)
    boolean existsByTitle(String title);


    // === 삭제 ===

    // DELETE FROM study_log WHERE member_id = ?
    void deleteByMemberId(Long memberId);


    // === Top / First ===

    // SELECT * FROM study_log ORDER BY study_time DESC LIMIT 3
    List<StudyLog> findTop3ByOrderByStudyTimeDesc();
}
```

### 쿼리 메서드 키워드 정리

| 키워드 | 예시 | SQL |
|--------|------|-----|
| `And` | `findByTitleAndCategory` | `WHERE title = ? AND category = ?` |
| `Or` | `findByTitleOrContent` | `WHERE title = ? OR content = ?` |
| `Between` | `findByStudyDateBetween` | `WHERE study_date BETWEEN ? AND ?` |
| `LessThan` | `findByStudyTimeLessThan` | `WHERE study_time < ?` |
| `GreaterThanEqual` | `findByStudyTimeGreaterThanEqual` | `WHERE study_time >= ?` |
| `Like` | `findByTitleLike` | `WHERE title LIKE ?` (직접 % 붙여야 함) |
| `Containing` | `findByTitleContaining` | `WHERE title LIKE '%?%'` (자동 %) |
| `StartingWith` | `findByTitleStartingWith` | `WHERE title LIKE '?%'` |
| `EndingWith` | `findByTitleEndingWith` | `WHERE title LIKE '%?'` |
| `IsNull` | `findByDeletedAtIsNull` | `WHERE deleted_at IS NULL` |
| `IsNotNull` | `findByDeletedAtIsNotNull` | `WHERE deleted_at IS NOT NULL` |
| `In` | `findByCategoryIn` | `WHERE category IN (?, ?, ?)` |
| `OrderBy` | `findByCategoryOrderByStudyDateDesc` | `ORDER BY study_date DESC` |
| `Not` | `findByCategoryNot` | `WHERE category != ?` |
| `True` / `False` | `findByActiveTrue` | `WHERE active = true` |

> 💡 **Containing vs Like**
> - `Containing("JPA")` → `LIKE '%JPA%'` (자동으로 % 감싸줌)
> - `Like("%JPA%")` → `LIKE '%JPA%'` (직접 % 전달해야 함)
> - 실무에서는 `Containing`을 더 많이 쓴다.

### ❌ 쿼리 메서드의 한계

```java
// 이름이 점점 길어진다...
List<StudyLog> findByCategoryAndStudyDateBetweenAndStudyTimeGreaterThanEqualOrderByStudyDateDesc(
    Category category, LocalDate start, LocalDate end, Integer minTime
);
```

메서드 이름이 이렇게 길어지면? → `@Query`를 써야 할 때다!

---

## 4. @Query — 직접 쿼리 작성하기 🔴

### 비유: 키오스크에 없는 메뉴 → 직접 주문서 쓰기

쿼리 메서드로 표현하기 어렵거나 이름이 너무 길어질 때, 직접 JPQL 또는 SQL을 작성한다.

### JPQL (Java Persistence Query Language)

> **JPQL** = SQL이랑 비슷한데, **테이블이 아닌 엔티티**를 대상으로 쿼리하는 언어.

```
┌─────────────────────────────────────────────────┐
│  SQL:   SELECT * FROM study_log WHERE title = ? │
│  JPQL:  SELECT s FROM StudyLog s WHERE s.title = ? │
│                  ^^^^^^^^                       │
│                  엔티티명! (테이블명 아님)         │
└─────────────────────────────────────────────────┘
```

### JPQL vs SQL 핵심 차이

| | SQL | JPQL |
|---|---|---|
| 대상 | 테이블, 컬럼 | 엔티티, 필드 |
| FROM절 | `FROM study_log` | `FROM StudyLog` |
| 필드 참조 | `study_date` (스네이크) | `s.studyDate` (카멜) |
| 별칭 | 선택 | **필수** (`StudyLog s`) |
| DB 종속 | MySQL 문법 | DB 독립적 |

### @Query 실전 예제

```java
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    // === JPQL ===

    // 카테고리별 학습 시간 합계
    @Query("SELECT SUM(s.studyTime) FROM StudyLog s WHERE s.category = :category")
    Integer getTotalStudyTimeByCategory(@Param("category") Category category);

    // 특정 기간의 학습 로그 조회
    @Query("SELECT s FROM StudyLog s " +
           "WHERE s.memberId = :memberId " +
           "AND s.studyDate BETWEEN :start AND :end " +
           "ORDER BY s.studyDate DESC")
    List<StudyLog> findByMemberAndDateRange(
        @Param("memberId") Long memberId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );

    // 제목 또는 내용에서 키워드 검색
    @Query("SELECT s FROM StudyLog s " +
           "WHERE s.title LIKE %:keyword% OR s.content LIKE %:keyword%")
    List<StudyLog> searchByKeyword(@Param("keyword") String keyword);

    // 카테고리별 학습 로그 수
    @Query("SELECT s.category, COUNT(s) FROM StudyLog s GROUP BY s.category")
    List<Object[]> countByCategory();
}
```

### 파라미터 바인딩 방식

```java
// 방법 1: 이름 기반 ✅ (권장)
@Query("SELECT s FROM StudyLog s WHERE s.title = :title")
List<StudyLog> findByTitle(@Param("title") String title);

// 방법 2: 위치 기반 ❌ (비권장 — 순서 바뀌면 버그)
@Query("SELECT s FROM StudyLog s WHERE s.title = ?1")
List<StudyLog> findByTitle(String title);
```

> ⚠️ 항상 **이름 기반(:paramName + @Param)** 을 쓰자. 위치 기반은 파라미터가 늘어나면 헷갈린다.

### @Modifying — UPDATE/DELETE 쿼리 🟡

조회가 아닌 **수정/삭제** 쿼리를 쓸 때는 `@Modifying`을 함께 붙여야 한다.

```java
// 벌크 업데이트: 특정 카테고리의 학습 시간을 일괄 변경
@Modifying
@Query("UPDATE StudyLog s SET s.studyTime = :time WHERE s.category = :category")
int updateStudyTimeBulk(@Param("category") Category category, @Param("time") Integer time);

// 벌크 삭제: 특정 회원의 학습 로그 전체 삭제
@Modifying
@Query("DELETE FROM StudyLog s WHERE s.memberId = :memberId")
int deleteByMemberIdBulk(@Param("memberId") Long memberId);
```

> ⚠️ **벌크 연산 주의사항**
> 벌크 연산은 **영속성 컨텍스트를 무시**하고 DB에 직접 쿼리한다.
>
> ```java
> // 문제 상황
> studyLog.getStudyTime();  // 영속성 컨텍스트: 60분
> repository.updateStudyTimeBulk(SPRING, 90);  // DB는 90분으로 변경
> studyLog.getStudyTime();  // 영속성 컨텍스트: 여전히 60분!! 😱
> ```
>
> **해결: `clearAutomatically = true`**
> ```java
> @Modifying(clearAutomatically = true)  // 벌크 연산 후 영속성 컨텍스트 자동 초기화
> @Query("UPDATE StudyLog s SET s.studyTime = :time WHERE s.category = :category")
> int updateStudyTimeBulk(@Param("category") Category category, @Param("time") Integer time);
> ```

---

## 5. Native Query — 진짜 SQL 쓰기 🟡

### 언제 쓸까?

- JPQL로 표현 못 하는 DB 전용 함수를 쓸 때
- 복잡한 통계 쿼리
- 이미 검증된 SQL이 있을 때

```java
// Native Query 사용
@Query(value = "SELECT * FROM study_log WHERE MATCH(title, content) AGAINST(:keyword IN BOOLEAN MODE)",
       nativeQuery = true)
List<StudyLog> fullTextSearch(@Param("keyword") String keyword);

// MySQL 전용 함수 사용
@Query(value = "SELECT DATE_FORMAT(study_date, '%Y-%m') as month, " +
               "SUM(study_time) as totalTime " +
               "FROM study_log " +
               "WHERE member_id = :memberId " +
               "GROUP BY DATE_FORMAT(study_date, '%Y-%m')",
       nativeQuery = true)
List<Object[]> getMonthlyStudyStats(@Param("memberId") Long memberId);
```

### JPQL vs Native Query 선택 기준

```
쿼리 메서드로 가능한가?
    │
    ├─ Yes → 쿼리 메서드 사용 ✅
    │
    └─ No → JPQL로 가능한가?
              │
              ├─ Yes → @Query + JPQL ✅
              │
              └─ No → @Query + nativeQuery = true
                      (DB 종속 함수가 필요할 때만!)
```

> 💡 **우선순위: 쿼리 메서드 > JPQL > Native Query**
> 왜? 쿼리 메서드와 JPQL은 **DB를 바꿔도** 그대로 동작한다.
> Native Query는 MySQL에서 PostgreSQL로 바꾸면 깨질 수 있다.

---

## 6. Projection — 필요한 것만 가져오기 🟡

### 비유: 마트에서 장보기

엔티티를 통째로 가져오는 건 = 마트에서 진열대 하나를 통째로 카트에 넣는 것이다.
Projection은 = **필요한 물건만 골라 담는 것**이다.

```
SELECT * FROM study_log;              ← 진열대 통째로 (비효율)
SELECT title, study_time FROM study_log; ← 필요한 것만 (효율적)
```

### 방법 1: 인터페이스 기반 Projection ✅ (가장 많이 씀)

```java
// 1. Projection 인터페이스 정의
public interface StudyLogSummary {
    String getTitle();
    Integer getStudyTime();
    LocalDate getStudyDate();
}

// 2. Repository에서 사용
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    // 반환 타입을 Projection 인터페이스로!
    List<StudyLogSummary> findByCategory(Category category);
}
```

```sql
-- 생성되는 SQL (필요한 컬럼만!)
SELECT s.title, s.study_time, s.study_date
FROM study_log s
WHERE s.category = ?
```

### 방법 2: DTO 기반 Projection

```java
// 1. DTO 클래스 (record 사용 — Java 16+)
public record StudyLogDto(
    String title,
    Integer studyTime,
    LocalDate studyDate
) {}

// 2. @Query + new 키워드
@Query("SELECT new com.example.dto.StudyLogDto(s.title, s.studyTime, s.studyDate) " +
       "FROM StudyLog s WHERE s.category = :category")
List<StudyLogDto> findDtoByCategory(@Param("category") Category category);
```

### 방법 3: 클래스 기반 Projection

```java
// 생성자 파라미터 이름이 엔티티 필드명과 일치해야 함
@Getter
@AllArgsConstructor
public class StudyLogSummaryDto {
    private final String title;
    private final Integer studyTime;
}

// Repository
List<StudyLogSummaryDto> findByMemberId(Long memberId);
```

### 언제 어떤 Projection?

| 방식 | 장점 | 단점 | 추천 상황 |
|------|------|------|-----------|
| 인터페이스 Projection | 간단, 메서드명만으로 OK | 복잡한 변환 어려움 | 단순 조회 |
| DTO + @Query | 풀 패키지명 필요, 좀 길어짐 | 타입 안전 | 통계/가공 필요 시 |
| 클래스 Projection | 생성자만 맞추면 OK | 불변객체 강제 | API 응답용 |

---

## 7. Pageable과 Page 🔴

### 비유: 도서관 검색 결과

도서관에서 "Spring" 검색하면 결과가 500건이다.
한 화면에 500건을 다 보여줄 순 없으니 **1페이지에 10건씩** 보여준다.
이게 **페이징(Paging)** 이다.

### 기본 사용법

```java
// Controller
@GetMapping("/study-logs")
public Page<StudyLog> getStudyLogs(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size
) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("studyDate").descending());
    return studyLogRepository.findAll(pageable);
}
```

### PageRequest 만들기

```java
// 기본 (0페이지, 10개)
Pageable pageable = PageRequest.of(0, 10);

// 정렬 추가 (최신순)
Pageable pageable = PageRequest.of(0, 10, Sort.by("studyDate").descending());

// 복합 정렬 (카테고리 오름차순 → 날짜 내림차순)
Pageable pageable = PageRequest.of(0, 10,
    Sort.by("category").ascending()
        .and(Sort.by("studyDate").descending())
);
```

> ⚠️ **page는 0부터 시작!** 1이 아니라 0이 첫 페이지다.

### Page 객체가 제공하는 정보

```java
Page<StudyLog> result = repository.findAll(pageable);

result.getContent();        // 현재 페이지의 데이터 (List<StudyLog>)
result.getTotalElements();  // 전체 데이터 수 (예: 53)
result.getTotalPages();     // 전체 페이지 수 (예: 6)
result.getNumber();         // 현재 페이지 번호 (0부터)
result.getSize();           // 페이지 크기 (10)
result.isFirst();           // 첫 페이지인지
result.isLast();            // 마지막 페이지인지
result.hasNext();           // 다음 페이지 있는지
result.hasPrevious();       // 이전 페이지 있는지
```

### 쿼리 메서드 + Pageable

```java
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    // 카테고리별 페이징 조회
    Page<StudyLog> findByCategory(Category category, Pageable pageable);

    // 키워드 검색 + 페이징
    Page<StudyLog> findByTitleContaining(String keyword, Pageable pageable);

    // @Query + 페이징
    @Query("SELECT s FROM StudyLog s WHERE s.memberId = :memberId")
    Page<StudyLog> findByMemberId(@Param("memberId") Long memberId, Pageable pageable);
}
```

### Page가 실행하는 SQL (2개!)

```sql
-- 1. 데이터 조회 쿼리
SELECT * FROM study_log
WHERE category = 'SPRING'
ORDER BY study_date DESC
LIMIT 10 OFFSET 0;

-- 2. COUNT 쿼리 (전체 개수 파악용) ← 추가 쿼리!
SELECT COUNT(*) FROM study_log
WHERE category = 'SPRING';
```

> ⚠️ Page를 쓰면 **항상 COUNT 쿼리가 추가로 실행**된다.
> 데이터가 수백만 건이면 COUNT 자체가 느려질 수 있다.

### countQuery 분리 (성능 최적화)

```java
// COUNT 쿼리를 별도로 최적화
@Query(value = "SELECT s FROM StudyLog s WHERE s.memberId = :memberId",
       countQuery = "SELECT COUNT(s.id) FROM StudyLog s WHERE s.memberId = :memberId")
Page<StudyLog> findByMemberId(@Param("memberId") Long memberId, Pageable pageable);
```

---

## 8. Page vs Slice 🟡

### 비유: 게시판 vs 인스타그램

```
┌──────────────────────────────┐    ┌──────────────────────────────┐
│         Page (게시판)          │    │      Slice (인스타그램)        │
│                              │    │                              │
│  글 목록                      │    │  [사진]                       │
│  ─────────                   │    │  [사진]                       │
│  1. 제목A                     │    │  [사진]                       │
│  2. 제목B                     │    │  [사진]                       │
│  3. 제목C                     │    │  [사진]                       │
│  ...                         │    │  ...                         │
│  10. 제목J                    │    │                              │
│                              │    │  ┌──────────────────────┐    │
│  [1] [2] [3] ... [50]        │    │  │    더 보기 ▼          │    │
│   ← 전체 페이지 수 필요!  →    │    │  └──────────────────────┘    │
│   ← COUNT 쿼리 필수!     →    │    │   ← 다음 있는지만 알면 OK →    │
│                              │    │   ← COUNT 불필요!        →    │
└──────────────────────────────┘    └──────────────────────────────┘
```

### 핵심 차이

| | Page | Slice |
|---|---|---|
| COUNT 쿼리 | 실행함 ✅ | 안 함 ❌ |
| 전체 페이지 수 | 알 수 있음 | 모름 |
| 전체 데이터 수 | 알 수 있음 | 모름 |
| `hasNext()` | 있음 | 있음 |
| 용도 | 게시판 (페이지 번호 UI) | 무한 스크롤, 더 보기 |
| 성능 | COUNT 쿼리 비용 있음 | 더 빠름 |

### Slice 사용법

```java
// Repository
Slice<StudyLog> findByCategory(Category category, Pageable pageable);
```

```java
// Service / Controller
Pageable pageable = PageRequest.of(0, 10, Sort.by("studyDate").descending());
Slice<StudyLog> result = repository.findByCategory(SPRING, pageable);

result.getContent();    // 현재 데이터
result.hasNext();       // 다음 페이지 있는지
result.hasPrevious();   // 이전 페이지 있는지
result.getNumber();     // 현재 페이지 번호
// result.getTotalPages()   ← 없음! 컴파일 에러!
// result.getTotalElements() ← 없음! 컴파일 에러!
```

### Slice의 트릭: size + 1

```
요청: 10개 조회해줘
Slice 내부: 11개 조회 (size + 1)

결과가 11개면 → hasNext = true  (11번째는 버림)
결과가 10개 이하면 → hasNext = false
```

```sql
-- Slice가 실행하는 SQL (1개만!)
SELECT * FROM study_log
WHERE category = 'SPRING'
ORDER BY study_date DESC
LIMIT 11;  -- 10 + 1 = 11개 조회!
```

> 💡 **선택 기준**
> - 페이지 번호가 필요한 UI → `Page`
> - "더 보기" / 무한 스크롤 → `Slice`
> - 그냥 리스트만 필요 → `List`

---

## 9. Cursor 기반 페이징 (Keyset Pagination) 🟢

### 비유: 도서관 책 찾기

Offset 페이징 = "**처음부터 100번째**까지 세고, 101~110번째 책을 달라."
Cursor 페이징 = "**마지막으로 본 책 다음**부터 10권 달라."

### Offset 페이징의 문제

```
100만 건 데이터에서 99,990번째부터 10개 조회

SELECT * FROM study_log ORDER BY id LIMIT 10 OFFSET 99990;

→ DB가 내부적으로 99,990건을 읽고 버린 뒤 10건만 반환!
→ 뒤로 갈수록 느려진다! 📉
```

```
페이지 1 (OFFSET 0):     빠름 ⚡️
페이지 100 (OFFSET 990):  괜찮음
페이지 10000 (OFFSET 99990): 느림... 🐌
페이지 100000 (OFFSET 999990): 매우 느림!!! 🐢
```

### Cursor 페이징 원리

```
"마지막으로 본 데이터의 ID(또는 기준값)" 을 기억해두고,
그 다음부터 조회한다.

SELECT * FROM study_log
WHERE id > 99990          -- 마지막 본 ID 이후
ORDER BY id
LIMIT 10;

→ 인덱스로 99990 바로 찾아서 그 다음 10건만!
→ 몇 페이지든 동일한 속도! ⚡️
```

### 구현 예제

```java
// Repository
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    // Cursor 기반: lastId 이후 size개 조회
    @Query("SELECT s FROM StudyLog s WHERE s.id > :lastId ORDER BY s.id ASC")
    List<StudyLog> findByIdGreaterThan(@Param("lastId") Long lastId, Pageable pageable);
}
```

```java
// Service
@Transactional(readOnly = true)
public List<StudyLog> getStudyLogs(Long lastId, int size) {
    Pageable pageable = PageRequest.of(0, size);  // page는 항상 0!

    if (lastId == null) {
        // 첫 페이지
        return repository.findAll(PageRequest.of(0, size, Sort.by("id").ascending()))
                         .getContent();
    }
    return repository.findByIdGreaterThan(lastId, pageable);
}
```

```java
// Controller
@GetMapping("/study-logs")
public List<StudyLog> getStudyLogs(
    @RequestParam(required = false) Long lastId,
    @RequestParam(defaultValue = "10") int size
) {
    return studyLogService.getStudyLogs(lastId, size);
}
```

```
// API 호출 예시

// 첫 페이지
GET /study-logs?size=10
→ [id=1, id=2, ... id=10]

// 다음 페이지 (마지막 id = 10)
GET /study-logs?lastId=10&size=10
→ [id=11, id=12, ... id=20]

// 그 다음 페이지 (마지막 id = 20)
GET /study-logs?lastId=20&size=10
→ [id=21, id=22, ... id=30]
```

### Offset vs Cursor 비교

| | Offset 페이징 | Cursor 페이징 |
|---|---|---|
| 구현 | 간단 (JPA 기본 지원) | 직접 구현 필요 |
| 성능 | 뒤로 갈수록 느림 | 항상 일정 |
| 특정 페이지 이동 | 가능 (3페이지로 바로!) | 불가능 (순서대로만) |
| 데이터 추가/삭제 시 | 중복/누락 발생 가능 | 안전 |
| 용도 | 관리자 페이지, 게시판 | 무한 스크롤, 피드, 채팅 |
| 데이터 규모 | 소~중규모 OK | 대규모 필수 |

> 💡 **실무 선택 가이드**
> - 데이터 1만 건 이하, 페이지 번호 필요 → **Offset (Page)**
> - 무한 스크롤, 모바일 피드 → **Cursor**
> - 데이터 100만 건 이상 → **Cursor 필수**

---

## 10. Specification — 동적 쿼리 만들기 🟢

### 비유: 레고 블록

Specification은 검색 조건을 **레고 블록**처럼 조립하는 것이다.
"카테고리 블록" + "날짜 블록" + "키워드 블록"을 원하는 대로 끼워 맞춘다.

### 문제 상황: 검색 필터가 여러 개

```
검색 필터:
☑ 카테고리: SPRING
☑ 학습 시간: 60분 이상
☐ 키워드: (없음)
☑ 기간: 2026-01-01 ~ 2026-03-31
```

이걸 쿼리 메서드로 만들려면?

```java
// 모든 조합을 다 만들어야 한다!! 😱
findByCategory(category);
findByCategoryAndStudyTimeGreaterThanEqual(category, minTime);
findByCategoryAndStudyDateBetween(category, start, end);
findByCategoryAndStudyTimeGreaterThanEqualAndStudyDateBetween(category, minTime, start, end);
findByTitleContaining(keyword);
findByTitleContainingAndCategory(keyword, category);
// ... 조합이 폭발적으로 증가!
```

### Specification으로 해결

**Step 1: JpaSpecificationExecutor 추가**

```java
public interface StudyLogRepository extends
        JpaRepository<StudyLog, Long>,
        JpaSpecificationExecutor<StudyLog> {  // 이거 추가!
}
```

**Step 2: Specification 조건 블록 만들기**

```java
public class StudyLogSpec {

    // 카테고리 블록
    public static Specification<StudyLog> hasCategory(Category category) {
        return (root, query, cb) ->
            category == null ? null : cb.equal(root.get("category"), category);
    }

    // 최소 학습 시간 블록
    public static Specification<StudyLog> hasMinStudyTime(Integer minTime) {
        return (root, query, cb) ->
            minTime == null ? null : cb.greaterThanOrEqualTo(root.get("studyTime"), minTime);
    }

    // 기간 블록
    public static Specification<StudyLog> betweenDates(LocalDate start, LocalDate end) {
        return (root, query, cb) -> {
            if (start == null || end == null) return null;
            return cb.between(root.get("studyDate"), start, end);
        };
    }

    // 키워드 검색 블록
    public static Specification<StudyLog> titleContains(String keyword) {
        return (root, query, cb) ->
            keyword == null ? null : cb.like(root.get("title"), "%" + keyword + "%");
    }
}
```

**Step 3: 블록 조립해서 사용**

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyLogService {

    private final StudyLogRepository repository;

    public Page<StudyLog> search(Category category, Integer minTime,
                                 LocalDate start, LocalDate end,
                                 String keyword, Pageable pageable) {

        Specification<StudyLog> spec = Specification
            .where(StudyLogSpec.hasCategory(category))       // 카테고리 블록
            .and(StudyLogSpec.hasMinStudyTime(minTime))      // 시간 블록
            .and(StudyLogSpec.betweenDates(start, end))      // 기간 블록
            .and(StudyLogSpec.titleContains(keyword));        // 키워드 블록

        return repository.findAll(spec, pageable);
    }
}
```

> 💡 **null이면 조건을 무시!**
> Specification에서 `null`을 반환하면 해당 조건은 자동으로 빠진다.
> 체크박스를 끄면 그 블록은 사라지는 것과 같다.

> ⚠️ Specification은 **간단한 동적 쿼리**에 적합하다.
> 복잡한 쿼리(JOIN, 서브쿼리, GROUP BY)는 **QueryDSL**(25번에서 배울 예정)이 더 낫다.

---

## 11. 실전 Service 패턴 정리 🔴

지금까지 배운 것을 종합해서, Repository → Service 순서로 따라가 보자.
**"Repository에서 뭘 정의하면 → Service에서 어떻게 쓰는지"** 짝꿍으로 본다.

### Step 1: Repository — 메뉴판 만들기

```java
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    // ─────────────────────────────────────
    // ✅ JpaRepository가 이미 제공하는 것들 (안 써도 있음!)
    // ─────────────────────────────────────
    // save(entity)        → 저장/수정
    // findById(id)        → PK로 조회 (Optional)
    // findAll()           → 전체 조회
    // findAll(Pageable)   → 페이징 조회
    // delete(entity)      → 삭제
    // count()             → 개수

    // ─────────────────────────────────────
    // ✏️ 우리가 직접 추가하는 것들 (이름만 쓰면 Spring이 SQL 자동 생성!)
    // ─────────────────────────────────────

    // 1) 카테고리로 페이징 조회
    //    → SELECT * FROM study_log WHERE category = ? LIMIT ? OFFSET ?
    //    → 이름 분석: findBy + Category → WHERE category = ?
    //    → 파라미터에 Pageable 있으면 → 자동으로 LIMIT/OFFSET 추가
    Page<StudyLog> findByCategory(Category category, Pageable pageable);

    // 2) 제목 검색 + 페이징
    //    → SELECT * FROM study_log WHERE title LIKE '%keyword%' LIMIT ? OFFSET ?
    //    → 이름 분석: findBy + Title + Containing → WHERE title LIKE '%?%'
    Page<StudyLog> findByTitleContaining(String keyword, Pageable pageable);

    // 3) 카테고리별 총 학습 시간 (집계는 이름으로 못 만듦 → @Query)
    //    → SELECT SUM(study_time) FROM study_log WHERE category = ?
    @Query("SELECT SUM(s.studyTime) FROM StudyLog s WHERE s.category = :category")
    Integer getTotalStudyTimeByCategory(@Param("category") Category category);
}
```

> 💡 **핵심 포인트**
> - `save()`, `findById()`, `findAll()`, `delete()` → **안 만들어도 있다** (JpaRepository가 제공)
> - `findByCategory()`, `findByTitleContaining()` → **이름만 규칙대로 쓰면** Spring이 SQL을 자동 생성
> - `getTotalStudyTimeByCategory()` → 집계(SUM)는 이름으로 표현 못 하니 **@Query 직접 작성**

### 이름 → SQL 변환 과정을 추적해보자

```
findByCategory(Category category, Pageable pageable)
  │
  ├─ findBy  → SELECT ... FROM study_log WHERE ...
  │
  ├─ Category → category = ?  (StudyLog 엔티티에 category 필드 있으니까)
  │
  └─ Pageable → ORDER BY ... LIMIT ? OFFSET ?  (자동 추가)

최종 SQL:
SELECT * FROM study_log
WHERE category = 'SPRING'
ORDER BY study_date DESC
LIMIT 10 OFFSET 0;
```

```
findByTitleContaining(String keyword, Pageable pageable)
  │
  ├─ findBy  → SELECT ... FROM study_log WHERE ...
  │
  ├─ Title  → title 필드 대상
  │
  ├─ Containing → LIKE '%keyword%'
  │
  └─ Pageable → ORDER BY ... LIMIT ? OFFSET ?

최종 SQL:
SELECT * FROM study_log
WHERE title LIKE '%JPA%'
ORDER BY study_date DESC
LIMIT 10 OFFSET 0;
```

> ⚠️ **자주 하는 실수: 필드명 오타**
> ```java
> findByCategori(...)  // ❌ 'categori'라는 필드 없음 → 앱 시작 시 에러!
> findByCategory(...)  // ✅ StudyLog에 category 필드 있음
> ```
> Spring Data JPA는 **앱이 뜰 때** 메서드 이름을 검증한다.
> 오타가 있으면 바로 에러가 나니까 오히려 안전하다!

### Step 2: Service — 메뉴판의 메뉴를 주문하기

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)  // 클래스 레벨: 읽기 전용 (22번 복습)
public class StudyLogService {

    private final StudyLogRepository studyLogRepository;
    //            ↑ Repository를 주입받아서 사용


    // ════════════════════════════════════
    //  조회 (읽기) — @Transactional(readOnly = true) 적용됨
    // ════════════════════════════════════

    // === 단건 조회 ===
    // → Repository의 findById() 사용 (JpaRepository 내장 메서드)
    public StudyLog getStudyLog(Long id) {
        return studyLogRepository.findById(id)      // Optional<StudyLog> 반환
            .orElseThrow(() -> new IllegalArgumentException(
                "학습 로그를 찾을 수 없습니다. id=" + id));
    }

    // === 목록 조회 (페이징) ===
    // → Repository의 findByCategory() 또는 findAll() 사용
    public Page<StudyLog> getStudyLogs(Category category, Pageable pageable) {
        if (category != null) {
            return studyLogRepository.findByCategory(category, pageable);
            //                       ↑ 우리가 Repository에 정의한 메서드!
            //                         이름만 썼더니 Spring이 SQL을 만들어줌
        }
        return studyLogRepository.findAll(pageable);
        //                       ↑ JpaRepository 내장 메서드 (전체 조회 + 페이징)
    }

    // === 검색 ===
    // → Repository의 findByTitleContaining() 사용
    public Page<StudyLog> searchStudyLogs(String keyword, Pageable pageable) {
        return studyLogRepository.findByTitleContaining(keyword, pageable);
        //                       ↑ 우리가 Repository에 정의한 메서드!
        //                         제목에 keyword가 포함된 것만 조회
    }

    // === 통계 ===
    // → Repository의 @Query 메서드 사용
    public Integer getTotalStudyTime(Category category) {
        return studyLogRepository.getTotalStudyTimeByCategory(category);
        //                       ↑ @Query로 직접 JPQL을 작성한 메서드!
    }


    // ════════════════════════════════════
    //  쓰기 — @Transactional 개별 지정 (readOnly 해제!)
    // ════════════════════════════════════

    // === 생성 ===
    // → Repository의 save() 사용 (JpaRepository 내장 메서드)
    @Transactional
    public StudyLog createStudyLog(String title, String content, Category category,
                                    Integer studyTime, LocalDate studyDate, Long memberId) {
        StudyLog studyLog = StudyLog.builder()
            .title(title)
            .content(content)
            .category(category)
            .studyTime(studyTime)
            .studyDate(studyDate)
            .memberId(memberId)
            .build();

        return studyLogRepository.save(studyLog);
        //                       ↑ JpaRepository 내장 메서드 (INSERT 실행)
    }

    // === 수정 (Dirty Checking) ===
    // → Repository에서 findById()로 조회 후, 엔티티 필드 변경 → 알아서 UPDATE
    @Transactional
    public StudyLog updateStudyLog(Long id, String title, String content,
                                    Integer studyTime) {
        StudyLog studyLog = getStudyLog(id);             // 1. 조회 (영속 상태)
        studyLog.update(title, content, studyTime);      // 2. 필드 변경
        return studyLog;
        // save() 호출 불필요! — 21번에서 배운 Dirty Checking!
        // @Transactional 끝날 때 변경 감지 → 자동 UPDATE
    }

    // === 삭제 ===
    // → Repository의 delete() 사용 (JpaRepository 내장 메서드)
    @Transactional
    public void deleteStudyLog(Long id) {
        StudyLog studyLog = getStudyLog(id);
        studyLogRepository.delete(studyLog);
        //                 ↑ JpaRepository 내장 메서드 (DELETE 실행)
    }
}
```

### 한눈에 보는 흐름: Repository ↔ Service 매핑

```
┌──────────────────────────────────────────────────────────────────┐
│  Service 메서드          →  Repository 메서드    →  출처           │
├──────────────────────────────────────────────────────────────────┤
│  getStudyLog(id)         →  findById(id)         → JPA 내장      │
│  getStudyLogs(cat, page) →  findByCategory(...)  → 우리가 정의    │
│                          →  findAll(pageable)    → JPA 내장      │
│  searchStudyLogs(kw)     →  findByTitleContaining → 우리가 정의   │
│  getTotalStudyTime(cat)  →  getTotalStudyTimeBy.. → @Query 직접   │
│  createStudyLog(...)     →  save(entity)         → JPA 내장      │
│  updateStudyLog(...)     →  (Dirty Checking)     → save 안 씀!   │
│  deleteStudyLog(id)      →  delete(entity)       → JPA 내장      │
└──────────────────────────────────────────────────────────────────┘
```

> 💡 **패턴 요약**
> - `findById`, `save`, `delete`, `findAll` → **JpaRepository에 이미 있다** (안 만들어도 됨!)
> - `findByCategory`, `findByTitleContaining` → **이름 규칙만 지키면** Spring이 구현체를 만들어줌
> - `@Query("SELECT SUM...")` → 이름으로 표현 못 하는 건 **JPQL 직접 작성**
> - 클래스 레벨: `@Transactional(readOnly = true)` — 기본 읽기 전용
> - 쓰기 메서드만: `@Transactional` — 개별 메서드에 오버라이드

---

## 12. 실습 문제

### 문제 1: 쿼리 메서드 작성

아래 요구사항에 맞는 `MemberRepository` 쿼리 메서드를 작성하라.

```java
public interface MemberRepository extends JpaRepository<Member, Long> {

    // 1. 이메일로 회원 조회 (결과는 1건 또는 없음)

    // 2. 이름에 특정 키워드가 포함된 회원 목록

    // 3. 이메일이 존재하는지 확인

    // 4. 가장 최근 가입한 회원 5명 (createdAt 기준)
}
```

<details>
<summary>정답 보기</summary>

```java
public interface MemberRepository extends JpaRepository<Member, Long> {

    // 1. 이메일로 회원 조회
    Optional<Member> findByEmail(String email);

    // 2. 이름에 키워드 포함
    List<Member> findByNameContaining(String keyword);

    // 3. 이메일 존재 여부
    boolean existsByEmail(String email);

    // 4. 최근 가입 5명
    List<Member> findTop5ByOrderByCreatedAtDesc();
}
```

</details>

### 문제 2: @Query 작성

아래 요구사항에 맞는 JPQL을 작성하라.

```java
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    // 1. 특정 회원의 카테고리별 학습 시간 합계
    //    반환: [카테고리, 총 학습시간] 목록

    // 2. 학습 시간이 평균 이상인 학습 로그만 조회
}
```

<details>
<summary>정답 보기</summary>

```java
// 1. 카테고리별 학습 시간 합계
@Query("SELECT s.category, SUM(s.studyTime) " +
       "FROM StudyLog s " +
       "WHERE s.memberId = :memberId " +
       "GROUP BY s.category")
List<Object[]> getStudyTimeSummary(@Param("memberId") Long memberId);

// 2. 평균 이상 학습 로그
@Query("SELECT s FROM StudyLog s " +
       "WHERE s.studyTime >= (SELECT AVG(s2.studyTime) FROM StudyLog s2)")
List<StudyLog> findAboveAverage();
```

</details>

### 문제 3: Page vs Slice 선택

아래 UI에 적합한 반환 타입을 고르라.

1. 관리자 대시보드 — 전체 회원 목록 (하단에 페이지 번호 1, 2, 3 ... 50)
2. 모바일 앱 — 학습 피드 (스크롤하면 계속 로딩)
3. 검색 API — 결과 중 상위 20건만 보여주기 (페이징 없음)

<details>
<summary>정답 보기</summary>

1. **Page** — 전체 페이지 수를 알아야 하므로 COUNT 쿼리 필요
2. **Slice** — "다음이 있는지"만 알면 되고, COUNT 불필요. 무한 스크롤에 적합
3. **List** — 페이징 자체가 필요 없음. `findTop20By...` 또는 `Pageable`로 LIMIT만

</details>

---

## 13. 면접 대비 🔴🟡

### 🔴 필수 — 이것만은 반드시 답할 수 있어야 한다

**Q1: Spring Data JPA에서 쿼리 메서드(Query Method)란?**

> 메서드 이름 규칙(findBy + 필드명 + 조건키워드)을 지키면, Spring Data JPA가 자동으로 JPQL을 생성해서 실행해주는 기능이다. `findByTitleContaining`, `findByCategoryAndStudyDate` 같은 형태로 사용한다.

**Q2: @Query 어노테이션은 왜 사용하나?**

> 쿼리 메서드로 표현하기 어려운 복잡한 쿼리(JOIN, 서브쿼리, 집계 함수 등)나 메서드 이름이 너무 길어질 때 사용한다. JPQL을 직접 작성하며, DB에 종속적인 함수가 필요할 때는 `nativeQuery = true`로 네이티브 SQL도 쓸 수 있다.

**Q3: JPQL과 SQL의 차이는?**

> SQL은 테이블과 컬럼을 대상으로 쿼리하고, JPQL은 엔티티와 필드를 대상으로 쿼리한다. JPQL은 `FROM StudyLog s`처럼 엔티티명을 쓰고, `s.studyDate`처럼 Java 필드명을 쓴다. DB에 독립적이라 DB를 변경해도 쿼리를 수정할 필요가 없다.

**Q4: Page와 Slice의 차이점은?**

> Page는 전체 데이터 수를 알기 위해 COUNT 쿼리를 추가로 실행한다. 전체 페이지 수(`getTotalPages()`)를 알 수 있어 페이지 번호 UI에 적합하다. Slice는 COUNT 쿼리 없이 size + 1개를 조회해서 다음 페이지 존재 여부만 판단한다. 무한 스크롤에 적합하고 성능이 더 좋다.

**Q5: @Modifying은 왜 필요한가?**

> @Query로 UPDATE/DELETE 같은 변경 쿼리를 실행할 때 붙여야 한다. 기본적으로 @Query는 SELECT로 간주하기 때문이다. 추가로 `clearAutomatically = true`를 설정하면 벌크 연산 후 영속성 컨텍스트를 자동으로 초기화해서 데이터 불일치를 방지할 수 있다.

**Q6: findById()로 조회한 결과가 없을 때 어떻게 처리하나?**

> `findById()`는 `Optional<T>`를 반환한다. `orElseThrow()`로 예외를 던지거나, `orElse()`로 기본값을 반환하거나, `isPresent()`로 존재 여부를 확인할 수 있다. 실무에서는 보통 커스텀 예외와 함께 `orElseThrow()`를 사용한다.

### 🟡 개념만 — 물어보면 설명할 수 있으면 OK

**Q7: Projection이란?**

> 엔티티의 모든 필드가 아닌, 필요한 필드만 선택적으로 가져오는 기법이다. 인터페이스 기반 Projection은 getter 메서드만 정의한 인터페이스를 반환 타입으로 사용하면 Spring Data JPA가 해당 필드만 SELECT한다. 불필요한 데이터 전송을 줄여 성능을 개선할 수 있다.

**Q8: Offset 기반 페이징의 단점과 대안은?**

> Offset 페이징은 `LIMIT 10 OFFSET 99990`처럼 앞의 데이터를 모두 스캔하고 버리기 때문에 뒤로 갈수록 느려진다. 대안은 Cursor(Keyset) 기반 페이징으로, `WHERE id > 99990 LIMIT 10`처럼 인덱스를 활용해 마지막으로 본 데이터 이후부터 조회한다. 몇 페이지든 일정한 성능을 유지하며, 무한 스크롤이나 대규모 데이터에 적합하다.

**Q9: Specification 패턴은 무엇이고 언제 사용하나?**

> 검색 조건을 각각 독립적인 객체(Specification)로 만들고, 이를 `and()`, `or()`로 조합해서 동적 쿼리를 생성하는 패턴이다. 검색 필터가 여러 개이고 조합이 다양할 때 사용한다. 각 조건이 null이면 자동으로 무시되어 동적으로 쿼리가 구성된다. 더 복잡한 동적 쿼리는 QueryDSL이 적합하다.

---

## 14. 핵심 요약

```
┌─────────────────────────────────────────────────────────┐
│                  Spring Data JPA 정리                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📦 Repository                                          │
│    JpaRepository<Entity, ID> 상속하면                    │
│    save, findById, findAll, delete 등 기본 CRUD 제공      │
│                                                         │
│  🔍 쿼리 작성 3가지 방법                                   │
│    1. 쿼리 메서드 — findByTitle, findByCategoryAnd...     │
│    2. @Query (JPQL) — 복잡한 쿼리 직접 작성                │
│    3. Native Query — DB 전용 함수 쓸 때만                  │
│                                                         │
│  📄 페이징 3가지                                          │
│    Page  — COUNT 쿼리 O, 페이지 번호 UI (게시판)           │
│    Slice — COUNT 쿼리 X, 무한 스크롤 (인스타)              │
│    Cursor — Offset 대신 마지막 ID 기준, 대규모 데이터       │
│                                                         │
│  🎯 선택 우선순위                                         │
│    쿼리 메서드 > JPQL > Native Query                      │
│    Page (소규모) > Slice (중규모) > Cursor (대규모)         │
│                                                         │
│  🔗 다음 단계 (24번 연관 관계 매핑과 N+1)                   │
│    @ManyToOne, @OneToMany, cascade, Fetch Join,          │
│    N+1 문제 — JPA의 꽃이자 면접 최다 출제!                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
