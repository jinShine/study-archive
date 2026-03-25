# 23. Spring Data JPA

> **키워드**: `JpaRepository` `쿼리 메서드` `@Query` `JPQL` `Native Query` `Projection` `Specification` `Pageable` `Page` `Slice` `Cursor 기반 페이징`

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~7 (Repository ~ 페이징) | 면접 필수 + 실무 매일 사용 |
| 🟡 이해 | 8~9 (Page vs Slice, Projection) | 알면 성능 개선에 도움 |
| 🟢 참고 | 10~11 (Cursor, Specification) | 대규모 서비스에서 필요 |

> 💡 **20번에서 우리는 이미 Repository를 만들어 봤다.**
> ```java
> public interface StudyLogRepository extends JpaRepository<StudyLog, Long> { }
> ```
> `save()`, `findById()` 정도만 써봤는데... 실무에서는 이것만으로 부족하다.
> **"카테고리별 조회는? 검색은? 페이징은?"** — 이번에 이걸 전부 해결한다.

---

## 1. 출발점 — 지금 우리 Repository 🔴

20번에서 만든 것을 다시 보자.

```java
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {
    // 비어있다!
}
```

비어있는데, 이미 이런 것들이 가능했다:

```java
repository.save(studyLog);          // INSERT
repository.findById(1L);            // SELECT WHERE id = 1
repository.findAll();               // SELECT * (전체)
repository.delete(studyLog);        // DELETE
repository.count();                 // SELECT COUNT(*)
```

> 💡 **왜?** `JpaRepository`를 상속하면 Spring이 **구현체를 자동으로** 만들어주기 때문이다.
> 우리가 만든 건 interface뿐인데, Spring이 뒤에서 실제 클래스를 생성한다.

### JpaRepository가 공짜로 주는 것들

| 메서드 | SQL | 반환 |
|--------|-----|------|
| `save(entity)` | INSERT / UPDATE | `T` |
| `findById(id)` | `WHERE id = ?` | `Optional<T>` |
| `findAll()` | `SELECT *` | `List<T>` |
| `findAll(Pageable)` | `SELECT * LIMIT ? OFFSET ?` | `Page<T>` |
| `delete(entity)` | DELETE | `void` |
| `deleteById(id)` | `WHERE id = ?` DELETE | `void` |
| `count()` | `SELECT COUNT(*)` | `long` |
| `existsById(id)` | `SELECT EXISTS(...)` | `boolean` |

---

## 2. 문제 발생 — "카테고리별 조회가 안 돼!" 🔴

Service에서 이런 기능이 필요해졌다:

```java
// StudyLogService.java
public List<StudyLog> getByCategory(Category category) {
    return studyLogRepository.??? // 카테고리로 조회하고 싶은데... 메서드가 없다!
}
```

`findById()`는 있는데 `findByCategory()`는 없다.
JpaRepository는 **PK(id) 기준 조회**만 기본 제공하니까.

### 해결: 이름만 쓰면 된다!

```java
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    List<StudyLog> findByCategory(Category category);  // 이거 한 줄 추가!
}
```

끝이다. 구현 코드 없이 **메서드 이름만** 썼다. 이게 **쿼리 메서드(Query Method)** 다.

### Spring이 뒤에서 하는 일

```
우리가 쓴 것:
  findByCategory(Category category)

Spring이 분석:
  findBy  →  "SELECT 하겠구나"
  Category  →  "category 필드로 조건을 걸겠구나"

Spring이 만들어주는 SQL:
  SELECT * FROM study_log WHERE category = ?
```

이제 Service에서 바로 쓸 수 있다:

```java
// StudyLogService.java
public List<StudyLog> getByCategory(Category category) {
    return studyLogRepository.findByCategory(category);  // 작동한다!
}
```

> ⚠️ **이름이 곧 쿼리다.**
> `findByCategori(...)` 처럼 오타를 내면? → **앱 시작 시 에러!**
> Spring이 뜰 때 "StudyLog에 categori라는 필드 없는데?" 하고 알려준다.
> 오히려 안전하다.

---

## 3. 쿼리 메서드 — 이름 규칙 배우기 🔴

### 기본 공식

```
findBy + 필드명 + 조건키워드
```

### 하나씩 만들어보자: 요구사항 → 메서드

**요구사항 1: "제목에 'JPA'가 포함된 학습 로그"**

```java
// findBy + Title + Containing
List<StudyLog> findByTitleContaining(String keyword);
// → WHERE title LIKE '%JPA%'
```

**요구사항 2: "SPRING 카테고리이면서, 3월 이후 학습 로그"**

```java
// findBy + Category + And + StudyDate + GreaterThanEqual
List<StudyLog> findByCategoryAndStudyDateGreaterThanEqual(Category category, LocalDate date);
// → WHERE category = 'SPRING' AND study_date >= '2026-03-01'
```

**요구사항 3: "학습 시간 많은 순으로 상위 3개"**

```java
// findTop3By + OrderBy + StudyTime + Desc
List<StudyLog> findTop3ByOrderByStudyTimeDesc();
// → SELECT * FROM study_log ORDER BY study_time DESC LIMIT 3
```

**요구사항 4: "이 회원의 학습 로그가 몇 개야?"**

```java
// countBy + MemberId
long countByMemberId(Long memberId);
// → SELECT COUNT(*) FROM study_log WHERE member_id = ?
```

**요구사항 5: "이 제목의 학습 로그가 이미 있어?"**

```java
// existsBy + Title
boolean existsByTitle(String title);
// → SELECT EXISTS(SELECT 1 FROM study_log WHERE title = ?)
```

### 키워드 레퍼런스 (필요할 때 찾아보는 표)

| 키워드 | 의미 | 예시 |
|--------|------|------|
| `And` | 그리고 | `findByTitleAndCategory` |
| `Or` | 또는 | `findByTitleOrContent` |
| `Between` | 사이 | `findByStudyDateBetween(start, end)` |
| `LessThan` | 미만 | `findByStudyTimeLessThan(60)` |
| `GreaterThanEqual` | 이상 | `findByStudyTimeGreaterThanEqual(60)` |
| `Containing` | 포함 (자동 %) | `findByTitleContaining("JPA")` → `LIKE '%JPA%'` |
| `StartingWith` | ~로 시작 | `LIKE 'JPA%'` |
| `IsNull` | NULL인 것 | `findByDeletedAtIsNull` |
| `In` | 목록 중 하나 | `findByCategoryIn(List<Category>)` |
| `OrderBy` | 정렬 | `findByCategoryOrderByStudyDateDesc` |
| `Not` | 아닌 것 | `findByCategoryNot(JPA)` |
| `Top` / `First` | 상위 N개 | `findTop3ByOrderByStudyTimeDesc` |

> 💡 **외울 필요 없다.** IDE에서 `findBy`까지 치면 자동완성이 된다.
> 필드명은 엔티티 클래스에서 가져오면 된다.

---

## 4. 쿼리 메서드의 한계 → @Query 등장 🔴

조건이 복잡해지면 이름이 엉망이 된다:

```java
// ❌ 이름이 미쳤다...
List<StudyLog> findByCategoryAndStudyDateBetweenAndStudyTimeGreaterThanEqualOrderByStudyDateDesc(
    Category category, LocalDate start, LocalDate end, Integer minTime
);
```

그리고 이름으로 **아예 표현 못 하는 것**도 있다:

```java
// ❌ SUM, AVG, GROUP BY 같은 집계는 이름으로 못 만든다
// "카테고리별 총 학습 시간" → findBy...??? 방법이 없다!
```

### 해결: @Query로 직접 쓰기

```java
// ✅ 복잡한 조건 → 직접 쿼리 작성
@Query("SELECT s FROM StudyLog s " +
       "WHERE s.category = :category " +
       "AND s.studyDate BETWEEN :start AND :end " +
       "AND s.studyTime >= :minTime " +
       "ORDER BY s.studyDate DESC")
List<StudyLog> findByCategoryAndPeriod(
    @Param("category") Category category,
    @Param("start") LocalDate start,
    @Param("end") LocalDate end,
    @Param("minTime") Integer minTime
);

// ✅ 집계 → 직접 쿼리 작성
@Query("SELECT SUM(s.studyTime) FROM StudyLog s WHERE s.category = :category")
Integer getTotalStudyTimeByCategory(@Param("category") Category category);
```

### 잠깐, 이게 SQL인가? JPQL인가?

`@Query`에 쓰는 건 기본적으로 **JPQL**이다. SQL이랑 비슷한데 약간 다르다:

```
┌────────────────────────────────────────┐
│  SQL:   SELECT * FROM study_log s      │
│         WHERE s.study_date = ?         │
│                    ^^^^^^^^^^          │
│                    테이블 컬럼 (snake)   │
│                                        │
│  JPQL:  SELECT s FROM StudyLog s       │
│         WHERE s.studyDate = ?          │
│                  ^^^^^^^^^             │
│                  Java 필드 (camel)      │
└────────────────────────────────────────┘
```

| | SQL | JPQL |
|---|---|---|
| FROM | 테이블명 (`study_log`) | 엔티티명 (`StudyLog`) |
| 필드 | 컬럼명 (`study_date`) | 필드명 (`s.studyDate`) |
| 별칭 | 선택 | **필수** |
| DB 종속 | MySQL 문법 | DB 독립 (MySQL→PostgreSQL 변경 OK) |

### 파라미터 바인딩

```java
// ✅ 이름 기반 (권장) — 순서 상관없이 이름으로 매칭
@Query("SELECT s FROM StudyLog s WHERE s.title = :title")
List<StudyLog> findByTitle(@Param("title") String title);

// ❌ 위치 기반 (비권장) — 파라미터 순서 바뀌면 버그
@Query("SELECT s FROM StudyLog s WHERE s.title = ?1")
List<StudyLog> findByTitle(String title);
```

### 쿼리 선택 기준 — 언제 뭘 쓸까?

```
요구사항이 들어왔다!
    │
    ├─ 단순 조회? (필드 1~2개 조건)
    │   → 쿼리 메서드  ✅  findByCategory(...)
    │
    ├─ 조건 3개+ or 이름이 길어짐?
    │   → @Query + JPQL  ✅
    │
    └─ MySQL 전용 함수가 필요? (MATCH AGAINST, DATE_FORMAT 등)
        → @Query + nativeQuery = true  ✅ (최후의 수단!)
```

---

## 5. @Modifying — UPDATE/DELETE를 쿼리로 🟡

`@Query`는 기본적으로 SELECT용이다. UPDATE/DELETE를 하려면 `@Modifying`을 붙여야 한다.

```java
// 벌크 업데이트: SPRING 카테고리의 학습 시간을 일괄 90분으로
@Modifying(clearAutomatically = true)
@Query("UPDATE StudyLog s SET s.studyTime = :time WHERE s.category = :category")
int updateStudyTimeBulk(@Param("category") Category category, @Param("time") Integer time);
```

> ⚠️ **`clearAutomatically = true`가 왜 필요한가?**
>
> 벌크 연산은 영속성 컨텍스트를 **건너뛰고** DB에 직접 쿼리한다 (21번 복습).
>
> ```
> 영속성 컨텍스트: studyTime = 60  ← 예전 값 그대로!
> DB:             studyTime = 90  ← 벌크로 변경됨!
> ```
>
> `clearAutomatically = true`를 붙이면 벌크 연산 후 영속성 컨텍스트를 자동 초기화한다.
> 다음 조회 시 DB에서 새로 읽어오니까 안전하다.

---

## 6. 데이터가 많아졌다 — 페이징의 필요성 🔴

기능이 잘 돌아가다가, 학습 로그가 1000건이 넘었다.

```java
// ❌ 1000건을 전부 가져와?!
List<StudyLog> logs = repository.findByCategory(SPRING);
// → SELECT * FROM study_log WHERE category = 'SPRING'
// → 1000건 전부 메모리에 올라감... 😱
```

### 해결: Pageable — "10개씩만 줘!"

```java
// ✅ 0번째 페이지, 10개씩, 최신순
Pageable pageable = PageRequest.of(0, 10, Sort.by("studyDate").descending());
Page<StudyLog> result = repository.findByCategory(SPRING, pageable);
```

> ⚠️ **page는 0부터 시작!** 1이 아니다. 첫 페이지 = 0.

### Repository에는 뭘 바꿔야 하나?

```java
// Before: 전체 리스트 반환
List<StudyLog> findByCategory(Category category);

// After: Pageable 파라미터 추가, Page 반환
Page<StudyLog> findByCategory(Category category, Pageable pageable);
```

**바뀐 건 딱 2가지:**
1. 파라미터에 `Pageable` 추가
2. 반환 타입을 `Page<>` 로 변경

나머지는 Spring이 알아서 LIMIT/OFFSET을 붙여준다!

### Page가 알려주는 것들

```java
Page<StudyLog> result = repository.findByCategory(SPRING, pageable);

result.getContent();        // 현재 페이지 데이터 (List<StudyLog>)
result.getTotalElements();  // 전체 데이터 수 (예: 53)
result.getTotalPages();     // 전체 페이지 수 (예: 6)
result.getNumber();         // 현재 페이지 번호 (0부터)
result.getSize();           // 페이지 크기 (10)
result.hasNext();           // 다음 페이지 있는지
result.isFirst();           // 첫 페이지인지
result.isLast();            // 마지막 페이지인지
```

### Page가 실행하는 SQL — 2개!

```sql
-- 1. 데이터 조회
SELECT * FROM study_log
WHERE category = 'SPRING'
ORDER BY study_date DESC
LIMIT 10 OFFSET 0;

-- 2. 전체 개수 (페이지 수 계산용) ← 이게 추가로 나간다!
SELECT COUNT(*) FROM study_log
WHERE category = 'SPRING';
```

---

## 7. 전체 흐름으로 보기 — Repository + Service 🔴

지금까지 배운 걸 합치면, **실전에서 쓰는 Repository + Service**가 이렇게 된다.

### Repository — 조회 메뉴판

```java
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    // ─────────────────────────────────────────────
    // JpaRepository가 이미 제공 (안 써도 있음!)
    //   save(), findById(), findAll(), delete(), count()
    // ─────────────────────────────────────────────

    // 쿼리 메서드: 이름 → SQL 자동 생성
    Page<StudyLog> findByCategory(Category category, Pageable pageable);
    Page<StudyLog> findByTitleContaining(String keyword, Pageable pageable);

    // @Query: 이름으로 표현 못 하는 것
    @Query("SELECT SUM(s.studyTime) FROM StudyLog s WHERE s.category = :category")
    Integer getTotalStudyTimeByCategory(@Param("category") Category category);
}
```

### Service — Repository를 조합해서 비즈니스 로직 수행

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)   // 기본은 읽기 전용 (22번 복습)
public class StudyLogService {

    private final StudyLogRepository studyLogRepository;


    // ═══ 조회 (readOnly) ═══

    public StudyLog getStudyLog(Long id) {
        return studyLogRepository.findById(id)                // ← JPA 내장
            .orElseThrow(() -> new IllegalArgumentException(
                "학습 로그를 찾을 수 없습니다. id=" + id));
    }

    public Page<StudyLog> getStudyLogs(Category category, Pageable pageable) {
        if (category != null) {
            return studyLogRepository.findByCategory(category, pageable);
            //                       ↑ 우리가 이름만 쓴 쿼리 메서드
        }
        return studyLogRepository.findAll(pageable);          // ← JPA 내장
    }

    public Page<StudyLog> searchStudyLogs(String keyword, Pageable pageable) {
        return studyLogRepository.findByTitleContaining(keyword, pageable);
        //                       ↑ 우리가 이름만 쓴 쿼리 메서드
    }

    public Integer getTotalStudyTime(Category category) {
        return studyLogRepository.getTotalStudyTimeByCategory(category);
        //                       ↑ @Query로 직접 JPQL 작성한 것
    }


    // ═══ 쓰기 (@Transactional) ═══

    @Transactional
    public StudyLog createStudyLog(String title, String content, Category category,
                                    Integer studyTime, LocalDate studyDate, Long memberId) {
        StudyLog studyLog = StudyLog.builder()
            .title(title).content(content).category(category)
            .studyTime(studyTime).studyDate(studyDate).memberId(memberId)
            .build();
        return studyLogRepository.save(studyLog);             // ← JPA 내장
    }

    @Transactional
    public StudyLog updateStudyLog(Long id, String title, String content, Integer studyTime) {
        StudyLog studyLog = getStudyLog(id);       // 1. 조회 (영속 상태)
        studyLog.update(title, content, studyTime); // 2. 필드 변경 → Dirty Checking!
        return studyLog;                            // save() 안 써도 자동 UPDATE (21번)
    }

    @Transactional
    public void deleteStudyLog(Long id) {
        StudyLog studyLog = getStudyLog(id);
        studyLogRepository.delete(studyLog);                  // ← JPA 내장
    }
}
```

### 한눈에 정리

```
┌─────────────────────────────────────────────────────────────┐
│  Service 메서드           →  Repository 메서드     →  출처    │
├─────────────────────────────────────────────────────────────┤
│  getStudyLog(id)          →  findById(id)          → 내장   │
│  getStudyLogs(cat, page)  →  findByCategory(...)   → 이름   │
│                           →  findAll(pageable)     → 내장   │
│  searchStudyLogs(kw)      →  findByTitleContaining → 이름   │
│  getTotalStudyTime(cat)   →  @Query(SUM...)        → JPQL  │
│  createStudyLog(...)      →  save(entity)          → 내장   │
│  updateStudyLog(...)      →  (Dirty Checking)      → 없음!  │
│  deleteStudyLog(id)       →  delete(entity)        → 내장   │
└─────────────────────────────────────────────────────────────┘

"내장" = JpaRepository가 공짜로 제공
"이름" = 메서드 이름만 쓰면 Spring이 SQL 생성
"JPQL" = @Query로 직접 작성
"없음" = save() 호출 자체가 불필요 (변경 감지!)
```

---

## 8. Page vs Slice — 페이징 최적화 🟡

### 비유: 게시판 vs 인스타그램

```
┌──────────────────────────┐    ┌──────────────────────────┐
│       Page (게시판)        │    │    Slice (인스타그램)      │
│                          │    │                          │
│  1. 제목A                 │    │  [사진]                   │
│  2. 제목B                 │    │  [사진]                   │
│  3. 제목C                 │    │  [사진]                   │
│  ...                     │    │  ...                     │
│  10. 제목J                │    │                          │
│                          │    │  ┌────────────────────┐  │
│  [1] [2] [3] ... [50]    │    │  │    더 보기 ▼        │  │
│  ← 전체 페이지 수 필요 →   │    │  └────────────────────┘  │
│  ← COUNT 쿼리 필수! →     │    │  ← 다음 있는지만 알면 OK → │
│                          │    │  ← COUNT 불필요!      →  │
└──────────────────────────┘    └──────────────────────────┘
```

| | Page | Slice |
|---|---|---|
| COUNT 쿼리 | 실행함 (느릴 수 있음) | 안 함 (빠름) |
| 전체 페이지 수 | 알 수 있음 | 모름 |
| `hasNext()` | 있음 | 있음 |
| **용도** | 페이지 번호 UI | 무한 스크롤 / 더 보기 |

### Slice 사용법

Repository의 반환 타입만 바꾸면 된다:

```java
// Page → Slice로 변경
Slice<StudyLog> findByCategory(Category category, Pageable pageable);
```

```java
Slice<StudyLog> result = repository.findByCategory(SPRING, pageable);

result.getContent();     // 현재 데이터
result.hasNext();        // 다음 페이지 있는지
// result.getTotalPages()   ← 컴파일 에러! Slice엔 없다!
```

### Slice의 트릭: size + 1

```
10개 달라고 요청했는데, Slice는 내부적으로 11개를 조회한다.

결과가 11개 → "아, 다음이 더 있구나" → hasNext = true (11번째는 버림)
결과가 10개 이하 → "이게 끝이구나" → hasNext = false
```

```sql
-- Slice가 실행하는 SQL (1개만!)
SELECT * FROM study_log WHERE category = 'SPRING'
ORDER BY study_date DESC LIMIT 11;   -- 10 + 1!

-- COUNT 쿼리 없음!
```

> 💡 **선택 기준**
> - 하단에 페이지 번호 `[1][2][3]...[50]` → **Page**
> - "더 보기" / 무한 스크롤 → **Slice**
> - 페이징 없이 리스트만 → **List**

---

## 9. Projection — 필요한 컬럼만 가져오기 🟡

### 비유: 마트에서 장보기

엔티티를 통째로 가져오는 건 = 진열대를 통째로 카트에 넣는 것.
Projection = **필요한 물건만 골라 담는 것**.

```sql
SELECT * FROM study_log;                    -- 전체 컬럼 (비효율)
SELECT title, study_time FROM study_log;    -- 필요한 것만 (효율적)
```

### 인터페이스 Projection (가장 많이 씀)

```java
// 1. 원하는 필드만 담은 인터페이스
public interface StudyLogSummary {
    String getTitle();
    Integer getStudyTime();
    LocalDate getStudyDate();
}

// 2. Repository에서 반환 타입으로 사용
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {
    List<StudyLogSummary> findByCategory(Category category);
    //   ^^^^^^^^^^^^^^^^ 엔티티가 아닌 Projection 인터페이스!
}
```

```sql
-- 자동 생성 SQL (필요한 컬럼만!)
SELECT s.title, s.study_time, s.study_date FROM study_log s WHERE s.category = ?
```

### DTO Projection (@Query와 함께)

통계나 가공이 필요하면 DTO + @Query를 쓴다:

```java
public record StudyLogDto(String title, Integer studyTime, LocalDate studyDate) {}

@Query("SELECT new com.example.dto.StudyLogDto(s.title, s.studyTime, s.studyDate) " +
       "FROM StudyLog s WHERE s.category = :category")
List<StudyLogDto> findDtoByCategory(@Param("category") Category category);
```

> 💡 **Projection은 API 응답 최적화에 특히 유용하다.**
> 프론트엔드에 제목과 날짜만 보여줄 건데 content(긴 본문)까지 보낼 필요 없다.

---

## 10. Cursor 페이징 — 대규모 데이터 🟢

### Offset 페이징의 문제

```
100만 건에서 99,990번째부터 10개 조회?

SELECT * FROM study_log ORDER BY id LIMIT 10 OFFSET 99990;
→ DB가 99,990건을 읽고 버린 뒤 10건만 반환!
→ 뒤로 갈수록 느려진다 🐌
```

### Cursor 페이징: "마지막으로 본 ID 다음부터"

```sql
SELECT * FROM study_log WHERE id > 99990 ORDER BY id LIMIT 10;
-- → 인덱스로 바로 점프! 몇 페이지든 같은 속도 ⚡
```

### 구현

```java
// Repository
@Query("SELECT s FROM StudyLog s WHERE s.id > :lastId ORDER BY s.id ASC")
List<StudyLog> findAfter(@Param("lastId") Long lastId, Pageable pageable);
```

```java
// Controller
@GetMapping("/study-logs")
public List<StudyLog> getStudyLogs(
    @RequestParam(required = false) Long lastId,       // 마지막으로 본 ID
    @RequestParam(defaultValue = "10") int size) {

    Pageable pageable = PageRequest.of(0, size);       // page는 항상 0!
    if (lastId == null) {
        return repository.findAll(PageRequest.of(0, size, Sort.by("id"))).getContent();
    }
    return repository.findAfter(lastId, pageable);
}
```

```
// 사용 흐름
GET /study-logs?size=10           → [id=1 ~ id=10]
GET /study-logs?lastId=10&size=10 → [id=11 ~ id=20]
GET /study-logs?lastId=20&size=10 → [id=21 ~ id=30]
```

| | Offset (Page) | Cursor |
|---|---|---|
| 구현 | 간단 (JPA 기본) | 직접 구현 |
| 성능 | 뒤로 갈수록 느림 | 항상 일정 |
| 특정 페이지 이동 | 가능 (3페이지로!) | 불가능 (순서대로만) |
| **용도** | 게시판, 관리자 | 무한 스크롤, 피드, 채팅 |
| **규모** | 소~중 | **대규모 필수** |

---

## 11. Specification — 동적 검색 필터 🟢

### 문제: 검색 조건이 여러 개인데, 조합이 다양하다

```
☑ 카테고리: SPRING     ← 있을 수도, 없을 수도
☑ 학습 시간: 60분 이상  ← 있을 수도, 없을 수도
☐ 키워드: (없음)
☑ 기간: 3월~6월        ← 있을 수도, 없을 수도
```

쿼리 메서드로 만들면 **모든 조합**을 다 만들어야 한다:

```java
findByCategory(...)
findByCategoryAndStudyTimeGreaterThanEqual(...)
findByCategoryAndStudyDateBetween(...)
findByCategoryAndStudyTimeGreaterThanEqualAndStudyDateBetween(...)
// ... 조합 폭발!! 😱
```

### 해결: 조건을 레고 블록처럼 조립하기

```java
// 1. Repository에 추가
public interface StudyLogRepository extends JpaRepository<StudyLog, Long>,
        JpaSpecificationExecutor<StudyLog> { }   // 이것만 추가!

// 2. 조건 블록 각각 만들기
public class StudyLogSpec {
    public static Specification<StudyLog> hasCategory(Category category) {
        return (root, query, cb) ->
            category == null ? null : cb.equal(root.get("category"), category);
    }
    public static Specification<StudyLog> hasMinStudyTime(Integer minTime) {
        return (root, query, cb) ->
            minTime == null ? null : cb.greaterThanOrEqualTo(root.get("studyTime"), minTime);
    }
    // ... 필요한 만큼 추가
}

// 3. Service에서 블록 조립
Specification<StudyLog> spec = Specification
    .where(StudyLogSpec.hasCategory(SPRING))        // 카테고리 블록 ✅
    .and(StudyLogSpec.hasMinStudyTime(60));          // 시간 블록 ✅
    // 키워드 블록은 null → 자동으로 무시됨!

repository.findAll(spec, pageable);
```

> 💡 `null`을 반환하면 그 조건은 자동으로 빠진다 → 동적 쿼리 완성!
>
> ⚠️ 더 복잡한 동적 쿼리(JOIN, 서브쿼리)는 **QueryDSL**(25번에서 배울 예정)이 더 낫다.

---

## 12. Native Query — 진짜 SQL 🟡

JPQL로도 안 되는 DB 전용 기능이 필요할 때만 **최후의 수단**으로 쓴다:

```java
// MySQL 전용: Full-Text Search
@Query(value = "SELECT * FROM study_log WHERE MATCH(title, content) AGAINST(:keyword)",
       nativeQuery = true)
List<StudyLog> fullTextSearch(@Param("keyword") String keyword);

// MySQL 전용: DATE_FORMAT
@Query(value = "SELECT DATE_FORMAT(study_date, '%Y-%m') as month, SUM(study_time) " +
               "FROM study_log WHERE member_id = :id GROUP BY month",
       nativeQuery = true)
List<Object[]> getMonthlyStats(@Param("id") Long memberId);
```

> ⚠️ Native Query는 **DB를 바꾸면 깨진다** (MySQL→PostgreSQL).
> 가능하면 JPQL을 쓰고, 정말 안 될 때만 쓰자.

---

## 13. 실습 문제

### 문제 1: 쿼리 메서드 작성

`MemberRepository`에 다음 요구사항을 쿼리 메서드로 만들어라.

```java
public interface MemberRepository extends JpaRepository<Member, Long> {
    // 1. 이메일로 회원 조회 (결과 1건 또는 없음)
    // 2. 이름에 키워드가 포함된 회원 목록
    // 3. 이메일 존재 여부 확인
    // 4. 가장 최근 가입한 회원 5명
}
```

<details>
<summary>정답 보기</summary>

```java
Optional<Member> findByEmail(String email);
List<Member> findByNameContaining(String keyword);
boolean existsByEmail(String email);
List<Member> findTop5ByOrderByCreatedAtDesc();
```

</details>

### 문제 2: @Query 작성

```java
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {
    // 1. 특정 회원의 카테고리별 학습 시간 합계 (카테고리, 합계 쌍)
    // 2. 학습 시간이 전체 평균 이상인 학습 로그만 조회
}
```

<details>
<summary>정답 보기</summary>

```java
@Query("SELECT s.category, SUM(s.studyTime) FROM StudyLog s " +
       "WHERE s.memberId = :memberId GROUP BY s.category")
List<Object[]> getStudyTimeSummary(@Param("memberId") Long memberId);

@Query("SELECT s FROM StudyLog s " +
       "WHERE s.studyTime >= (SELECT AVG(s2.studyTime) FROM StudyLog s2)")
List<StudyLog> findAboveAverage();
```

</details>

### 문제 3: Page vs Slice 선택

1. 관리자 화면 — 전체 회원 목록 (하단에 `[1] [2] [3] ... [50]`)
2. 모바일 앱 — 학습 피드 (스크롤하면 계속 로딩)
3. 검색 API — 상위 20건만 (페이징 없음)

<details>
<summary>정답 보기</summary>

1. **Page** — 전체 페이지 수가 필요하므로 COUNT 쿼리 필수
2. **Slice** — "다음이 있는지"만 알면 됨, COUNT 불필요
3. **List** — 페이징 자체가 필요 없음. `findTop20By...`로 충분

</details>

---

## 14. 면접 대비 🔴🟡

### 🔴 필수 — 반드시 답할 수 있어야 한다

**Q1: Spring Data JPA에서 쿼리 메서드란?**

> `findBy + 필드명 + 조건키워드` 규칙으로 메서드 이름을 작성하면, Spring Data JPA가 자동으로 JPQL을 생성해서 실행해주는 기능이다. `findByTitleContaining`, `findByCategoryAndStudyDate` 같은 형태로 사용한다.

**Q2: @Query는 왜 사용하나?**

> 쿼리 메서드로 표현하기 어려운 복잡한 쿼리(JOIN, 집계 함수, 서브쿼리)나 메서드 이름이 너무 길어질 때 JPQL을 직접 작성하기 위해 사용한다. DB 전용 함수가 필요하면 `nativeQuery = true`로 네이티브 SQL도 쓸 수 있다.

**Q3: JPQL과 SQL의 차이는?**

> SQL은 테이블과 컬럼 대상, JPQL은 엔티티와 필드 대상이다. JPQL은 `FROM StudyLog s`, `s.studyDate`처럼 Java 엔티티/필드명을 쓴다. DB에 독립적이라 MySQL→PostgreSQL로 변경해도 쿼리 수정이 필요 없다.

**Q4: Page와 Slice의 차이는?**

> Page는 COUNT 쿼리를 추가로 실행해 전체 페이지 수를 알 수 있다. 페이지 번호 UI에 적합하다. Slice는 COUNT 없이 size + 1개를 조회해 다음 페이지 존재 여부만 판단한다. 무한 스크롤에 적합하고 성능이 더 좋다.

**Q5: @Modifying은 왜 필요한가?**

> @Query는 기본적으로 SELECT로 취급된다. UPDATE/DELETE 쿼리를 실행하려면 @Modifying을 붙여야 한다. `clearAutomatically = true`를 함께 쓰면 벌크 연산 후 영속성 컨텍스트를 자동 초기화해 데이터 불일치를 방지할 수 있다.

**Q6: findById()의 반환 타입이 Optional인 이유는?**

> 해당 ID의 데이터가 없을 수 있기 때문에 null 대신 Optional을 반환한다. 실무에서는 `orElseThrow()`로 커스텀 예외를 던지는 패턴을 가장 많이 쓴다.

### 🟡 개념만 — 물어보면 설명할 수 있으면 OK

**Q7: Projection이란?**

> 엔티티의 모든 필드가 아닌, 필요한 필드만 선택적으로 가져오는 기법이다. 인터페이스에 getter만 정의하고 반환 타입으로 쓰면, Spring Data JPA가 해당 필드만 SELECT한다. 불필요한 데이터 전송을 줄여 성능을 개선할 수 있다.

**Q8: Offset 페이징의 단점과 대안은?**

> Offset 페이징은 `LIMIT 10 OFFSET 99990`처럼 앞의 데이터를 모두 스캔하고 버리기 때문에 뒤로 갈수록 느려진다. 대안은 Cursor(Keyset) 페이징으로, `WHERE id > 마지막ID LIMIT 10`처럼 인덱스를 활용해 항상 일정한 성능을 유지한다. 무한 스크롤이나 대규모 데이터에 적합하다.

**Q9: Specification 패턴이란?**

> 검색 조건을 각각 독립 객체(Specification)로 만들고 `and()`, `or()`로 조합해 동적 쿼리를 생성하는 패턴이다. 조건이 null이면 자동으로 무시되어 검색 필터가 다양한 경우에 유용하다. 더 복잡한 동적 쿼리는 QueryDSL이 적합하다.

---

## 15. 핵심 요약

```
┌─────────────────────────────────────────────────────────┐
│                 Spring Data JPA 정리                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📦 Repository                                          │
│    JpaRepository 상속 → save, findById, findAll 공짜!    │
│                                                         │
│  🔍 쿼리 3단계 (쉬운 것부터!)                              │
│    1단계: 쿼리 메서드 — findByTitle, findByCategory...   │
│    2단계: @Query JPQL — 복잡한 조건, 집계                 │
│    3단계: Native Query — DB 전용 함수 (최후의 수단)        │
│                                                         │
│  📄 페이징 (데이터가 많을 때)                               │
│    Page  — COUNT O, 페이지 번호 UI (게시판)               │
│    Slice — COUNT X, 무한 스크롤 (인스타)                  │
│    Cursor — 대규모 데이터, 항상 일정 속도                  │
│                                                         │
│  🔗 다음 단계 (24번 연관 관계 매핑과 N+1)                  │
│    @ManyToOne, @OneToMany, cascade, Fetch Join,         │
│    N+1 문제 — JPA의 꽃이자 면접 최다 출제!                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
