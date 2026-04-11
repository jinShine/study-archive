# 23. Spring Data JPA — "인터페이스만 만들면 CRUD가 끝난다"

> **키워드**: `JpaRepository` `쿼리 메서드` `@Query` `JPQL` `Native Query` `Projection` `Pageable` `Page` `Slice` `Cursor 페이징` `Specification`

---

## 핵심만 한 문장

**JpaRepository를 상속하면 save(), findById(), findAll()이 자동으로 생긴다. 복잡한 쿼리는 메서드명 규칙이나 @Query로 작성한다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | JpaRepository, 쿼리 메서드, @Query, Pageable, 따라쳐보기 | 면접 + 실무 매일 사용 |
| 🟡 이해 | Page vs Slice, Projection, @Modifying, Native Query | 알면 성능 개선에 도움 |
| 🟢 참고 | Cursor 페이징, Specification | 대규모 서비스에서 필요 |

> 💡 **20번에서 만든 Repository를 기억하자:**
> ```java
> public interface MemberRepository extends JpaRepository<Member, Long> { }
> ```
> `save()`, `findById()`, `findAll()` 정도만 써봤다. 실무에서는 이것만으로 부족하다.
> **"카테고리별 조회는? 검색은? 페이징은?"** — 이번에 이걸 전부 해결한다.

---

## 1. Spring Data JPA가 하는 일 — 한 줄 요약 🔴

```
네가 쓰는 것:    findByTitle("JPA")
Spring이 하는 것: SELECT * FROM study_log WHERE title = 'JPA'
```

**메서드 이름을 SQL로 바꿔주는 것.** 이게 전부다.

나머지는 전부 이 원리의 변형이다:
- 쿼리 메서드 = "이름 규칙대로 쓰면 SQL 자동 생성"
- @Query = "이름으로 못 만드니까 내가 직접 JPQL 쓸게"
- Pageable = "전부 말고 10개씩만 줘"

---

## 2. JpaRepository — 공짜로 주는 것들 🔴

20번에서 만든 빈 Repository를 다시 보자:

```java
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {
    // 비어있다!
}
```

비어있는데 이미 이런 것들이 가능했다:

| 메서드 | 하는 일 | SQL |
|--------|---------|-----|
| `save(entity)` | 저장/수정 | INSERT / UPDATE |
| `findById(id)` | PK로 조회 | SELECT WHERE id = ? |
| `findAll()` | 전체 조회 | SELECT * |
| `findAll(Pageable)` | 페이징 조회 | SELECT ... LIMIT ? OFFSET ? |
| `delete(entity)` | 삭제 | DELETE WHERE id = ? |
| `count()` | 개수 | SELECT COUNT(*) |
| `existsById(id)` | 존재 여부 | SELECT EXISTS(...) |

> 💡 `JpaRepository`를 상속하면 Spring이 **구현체를 자동으로** 만들어주기 때문이다.

---

## 3. 쿼리 메서드 — 이름이 곧 쿼리 🔴

### 문제: "카테고리별 조회가 안 돼!"

```java
// 카테고리로 조회하고 싶은데... 메서드가 없다!
return studyLogRepository.???
```

### 해결: 이름만 쓰면 된다

```java
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    List<StudyLog> findByCategory(Category category);  // 이거 한 줄!
}
```

**구현 코드 없이 이름만 썼다.** Spring이 알아서 SQL을 만들어준다:

```
네가 쓴 것: findByCategory(Category category)

Spring이 분석:
  findBy     → "SELECT 하자"
  Category   → "category 필드로 조건 걸자"

Spring이 만든 SQL:
  SELECT * FROM study_log WHERE category = ?
```

### 이름 공식

```
findBy + 필드명 + 조건키워드
```

### 키워드 표

| 키워드 | 의미 | 예시 |
|--------|------|------|
| `And` | 그리고 | `findByTitleAndCategory` |
| `Or` | 또는 | `findByTitleOrContent` |
| `Between` | 사이 | `findByStudyDateBetween(start, end)` |
| `LessThan` | 미만 | `findByStudyTimeLessThan(60)` |
| `GreaterThanEqual` | 이상 | `findByStudyTimeGreaterThanEqual(60)` |
| `Containing` | 포함 (자동 %) | `findByTitleContaining("JPA")` |
| `IsNull` | NULL인 것 | `findByDeletedAtIsNull` |
| `In` | 목록 중 하나 | `findByCategoryIn(List)` |
| `OrderBy` | 정렬 | `OrderByStudyDateDesc` |
| `Top` / `First` | 상위 N개 | `findTop3By...` |

> ⚠️ **오타 내면?** `findByCategori(...)` → 앱 시작할 때 바로 에러! Spring이 "categori라는 필드 없는데?" 하고 알려준다. 오히려 안전하다.

---

## 4. @Query — 이름으로 안 될 때 🔴

조건이 복잡해지면 이름이 미쳐간다:

```java
// ❌ 이름이 한 줄에 안 들어온다...
findByCategoryAndStudyDateBetweenAndStudyTimeGreaterThanEqualOrderByStudyDateDesc(...)
```

그리고 이름으로 **아예 못 만드는** 것도 있다:

```java
// "카테고리별 총 학습 시간" → findBy...??? 방법이 없다!
// SUM, AVG, GROUP BY 같은 건 이름으로 표현 불가
```

### 해결: JPQL 쿼리를 직접 써주자

```java
@Query("SELECT SUM(s.studyTime) FROM StudyLog s WHERE s.category = :category")
Integer getTotalStudyTimeByCategory(@Param("category") Category category);
```

### JPQL vs SQL — 차이 딱 하나

```
SQL:   SELECT * FROM study_log  WHERE study_date = ?
                     ^^^^^^^^^^       ^^^^^^^^^^
                     테이블명          컬럼명 (snake_case)

JPQL:  SELECT s FROM StudyLog s WHERE s.studyDate = ?
                     ^^^^^^^^^       ^^^^^^^^^^^
                     엔티티명         필드명 (camelCase)
```

**테이블/컬럼 대신 엔티티/필드를 쓴다.** 이것만 기억하면 된다.

> 💡 **`:파라미터명` + `@Param("파라미터명")`** 으로 값을 넘긴다.
> `?1` 같은 위치 기반은 쓰지 말자 (순서 바뀌면 버그).

### 언제 뭘 쓸까?

```
단순한 조건 (필드 1~2개)?
  → 쿼리 메서드  findByCategory(...)

이름이 길어지거나, SUM/AVG/GROUP BY가 필요하면?
  → @Query
```

---

## 5. 페이징 — "전부 말고 10개씩만 줘" 🔴

데이터가 1000건인데 전부 가져오면 메모리가 터진다.
**10개씩 나눠서 보자** = 페이징.

### 사용법 3단계

```
1단계: Repository에 Pageable 파라미터 추가
2단계: Pageable 만들기 (PageRequest.of)
3단계: Page 결과에서 데이터 꺼내기
```

```java
// 1단계: Repository
Page<StudyLog> findByCategory(Category category, Pageable pageable);

// 2단계: Pageable 만들기
Pageable pageable = PageRequest.of(0, 10, Sort.by("studyDate").descending());
//                                ↑ 페이지는 0부터 시작! 1이 아니다!

// 3단계: 결과 사용
Page<StudyLog> result = repository.findByCategory(SPRING, pageable);

result.getContent();        // 현재 페이지 데이터 (List)
result.getTotalElements();  // 전체 데이터 수 (53건)
result.getTotalPages();     // 전체 페이지 수 (6페이지)
result.hasNext();           // 다음 페이지 있어?
result.isLast();            // 마지막 페이지야?
```

---

## 6. 따라쳐보기 — 직접 만들고 SQL 확인하기 🔴

> 💡 **가장 중요한 섹션!** 위의 개념을 직접 코드로 쳐보면서 SQL이 콘솔에 찍히는 걸 확인하자.

### Step 0: 프로젝트 확인

20번에서 만든 `jpa-practice` 프로젝트를 사용한다. `application.yml`에 SQL 출력이 설정되어 있는지 확인하자:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/study_db
    username: root
    password: 1234
  jpa:
    hibernate:
      ddl-auto: create
    show-sql: true           # SQL이 콘솔에 찍힘!
    properties:
      hibernate:
        format_sql: true     # SQL을 보기 좋게 정렬!
```

20번에서 만든 Entity를 기억하자:

```
Member: id, name, email
StudyLog: id, title, content, category(Enum), studyDate, createdAt
```

### Step 1: StudyLog에 studyTime 필드 추가

검색과 통계에 쓸 `studyTime` 필드를 추가하자:

`src/main/java/com/study/jpapractice/entity/StudyLog.java` 수정:

```java
@Entity
@Table(name = "study_log")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StudyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Category category;

    @Column(nullable = false)
    private int studyTime;  // ← 추가! (분 단위)

    @Column(nullable = false)
    private LocalDate studyDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public StudyLog(String title, String content, Category category,
                    int studyTime, LocalDate studyDate) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.studyTime = studyTime;
        this.studyDate = studyDate;
    }
}
```

### Step 2: 테스트 데이터 넣기

`DataInit.java`를 수정하자:

```java
@Component
@RequiredArgsConstructor
public class DataInit implements CommandLineRunner {

    private final MemberRepository memberRepository;
    private final StudyLogRepository studyLogRepository;

    @Override
    public void run(String... args) {
        // 회원
        memberRepository.save(Member.builder()
            .name("홍길동").email("hong@mail.com").build());
        memberRepository.save(Member.builder()
            .name("김철수").email("kim@mail.com").build());

        // 학습 일지 5개
        studyLogRepository.save(StudyLog.builder()
            .title("JPA 기초").content("엔티티 매핑 학습")
            .category(Category.JPA).studyTime(60)
            .studyDate(LocalDate.of(2026, 3, 1)).build());

        studyLogRepository.save(StudyLog.builder()
            .title("Spring MVC").content("컨트롤러 학습")
            .category(Category.SPRING).studyTime(90)
            .studyDate(LocalDate.of(2026, 3, 2)).build());

        studyLogRepository.save(StudyLog.builder()
            .title("JPA 심화").content("영속성 컨텍스트")
            .category(Category.JPA).studyTime(120)
            .studyDate(LocalDate.of(2026, 3, 3)).build());

        studyLogRepository.save(StudyLog.builder()
            .title("Spring Security").content("인증 인가")
            .category(Category.SPRING).studyTime(80)
            .studyDate(LocalDate.of(2026, 3, 4)).build());

        studyLogRepository.save(StudyLog.builder()
            .title("JPA N+1 해결").content("Fetch Join 학습")
            .category(Category.JPA).studyTime(45)
            .studyDate(LocalDate.of(2026, 3, 5)).build());

        System.out.println("=== 데이터 초기화 완료 ===");
        System.out.println("회원: " + memberRepository.count() + "명");
        System.out.println("일지: " + studyLogRepository.count() + "건");
    }
}
```

**💻 서버 시작 콘솔:**

```sql
Hibernate:
    insert into study_log (category, content, created_at, study_date, study_time, title) values (?, ?, ?, ?, ?, ?)
Hibernate:
    insert into study_log (category, content, created_at, study_date, study_time, title) values (?, ?, ?, ?, ?, ?)
-- (5번 반복)
=== 데이터 초기화 완료 ===
회원: 2명
일지: 5건
```

### Step 3: 쿼리 메서드 추가 — 따라쳐보기

`StudyLogRepository.java`에 메서드를 추가하자:

```java
package com.study.jpapractice.repository;

import com.study.jpapractice.entity.Category;
import com.study.jpapractice.entity.StudyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    // 카테고리로 조회
    List<StudyLog> findByCategory(Category category);

    // 제목에 키워드 포함
    List<StudyLog> findByTitleContaining(String keyword);

    // 학습 시간 이상
    List<StudyLog> findByStudyTimeGreaterThanEqual(int minTime);

    // 상위 2개 (학습 시간 많은 순)
    List<StudyLog> findTop2ByOrderByStudyTimeDesc();
}
```

테스트 API 추가 (`TestController.java`에):

```java
private final StudyLogRepository studyLogRepository;

// 쿼리 메서드 테스트
@GetMapping("/query-method")
@Transactional(readOnly = true)
public String testQueryMethod() {
    StringBuilder sb = new StringBuilder();

    // 1. 카테고리로 조회
    sb.append("=== JPA 카테고리 ===\n");
    studyLogRepository.findByCategory(Category.JPA).forEach(log ->
        sb.append(log.getTitle()).append(" (").append(log.getStudyTime()).append("분)\n")
    );

    // 2. 제목에 "Spring" 포함
    sb.append("\n=== 제목에 Spring 포함 ===\n");
    studyLogRepository.findByTitleContaining("Spring").forEach(log ->
        sb.append(log.getTitle()).append("\n")
    );

    // 3. 80분 이상
    sb.append("\n=== 80분 이상 ===\n");
    studyLogRepository.findByStudyTimeGreaterThanEqual(80).forEach(log ->
        sb.append(log.getTitle()).append(" (").append(log.getStudyTime()).append("분)\n")
    );

    // 4. Top 2
    sb.append("\n=== 가장 많이 공부한 2개 ===\n");
    studyLogRepository.findTop2ByOrderByStudyTimeDesc().forEach(log ->
        sb.append(log.getTitle()).append(" (").append(log.getStudyTime()).append("분)\n")
    );

    return sb.toString();
}
```

**💻 `http://localhost:8080/test/query-method` 결과:**

```
=== JPA 카테고리 ===
JPA 기초 (60분)
JPA 심화 (120분)
JPA N+1 해결 (45분)

=== 제목에 Spring 포함 ===
Spring MVC
Spring Security

=== 80분 이상 ===
Spring MVC (90분)
JPA 심화 (120분)
Spring Security (80분)

=== 가장 많이 공부한 2개 ===
JPA 심화 (120분)
Spring MVC (90분)
```

**💻 콘솔에 찍힌 SQL들:**

```sql
-- findByCategory(JPA)
Hibernate:
    select s1_0.id, s1_0.category, s1_0.content, s1_0.created_at, s1_0.study_date, s1_0.study_time, s1_0.title
    from study_log s1_0
    where s1_0.category=?

-- findByTitleContaining("Spring")
Hibernate:
    select s1_0.id, s1_0.category, s1_0.content, s1_0.created_at, s1_0.study_date, s1_0.study_time, s1_0.title
    from study_log s1_0
    where s1_0.title like ? escape ''

-- findByStudyTimeGreaterThanEqual(80)
Hibernate:
    select s1_0.id, ...
    from study_log s1_0
    where s1_0.study_time>=?

-- findTop2ByOrderByStudyTimeDesc()
Hibernate:
    select s1_0.id, ...
    from study_log s1_0
    order by s1_0.study_time desc
    limit ?
```

→ **메서드 이름이 SQL로 바뀌는 걸 직접 확인!** 이게 쿼리 메서드의 핵심이다.

### Step 4: @Query 추가 — 따라쳐보기

`StudyLogRepository.java`에 추가:

```java
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    // ... 위에서 만든 쿼리 메서드들 ...

    // @Query: 카테고리별 총 학습 시간
    @Query("SELECT SUM(s.studyTime) FROM StudyLog s WHERE s.category = :category")
    Integer getTotalStudyTimeByCategory(@Param("category") Category category);

    // @Query: 제목 OR 내용에서 검색
    @Query("SELECT s FROM StudyLog s WHERE s.title LIKE %:kw% OR s.content LIKE %:kw%")
    List<StudyLog> searchByKeyword(@Param("kw") String keyword);

    // @Query: 카테고리별 평균 학습 시간
    @Query("SELECT AVG(s.studyTime) FROM StudyLog s WHERE s.category = :category")
    Double getAvgStudyTimeByCategory(@Param("category") Category category);
}
```

테스트 API 추가:

```java
@GetMapping("/query-jpql")
@Transactional(readOnly = true)
public String testQuery() {
    StringBuilder sb = new StringBuilder();

    // 1. 총 학습 시간
    Integer total = studyLogRepository.getTotalStudyTimeByCategory(Category.JPA);
    sb.append("JPA 총 학습 시간: ").append(total).append("분\n");

    // 2. 키워드 검색
    sb.append("\n=== '영속성' 검색 ===\n");
    studyLogRepository.searchByKeyword("영속성").forEach(log ->
        sb.append(log.getTitle()).append("\n")
    );

    // 3. 평균 학습 시간
    Double avg = studyLogRepository.getAvgStudyTimeByCategory(Category.SPRING);
    sb.append("\nSPRING 평균 학습 시간: ").append(avg).append("분\n");

    return sb.toString();
}
```

**💻 `http://localhost:8080/test/query-jpql` 결과:**

```
JPA 총 학습 시간: 225분

=== '영속성' 검색 ===
JPA 심화

SPRING 평균 학습 시간: 85.0분
```

**💻 콘솔:**

```sql
-- SUM
Hibernate:
    select sum(s1_0.study_time)
    from study_log s1_0
    where s1_0.category=?

-- 키워드 검색 (LIKE OR)
Hibernate:
    select s1_0.id, ...
    from study_log s1_0
    where s1_0.title like ? escape '' or s1_0.content like ? escape ''

-- AVG
Hibernate:
    select avg(s1_0.study_time)
    from study_log s1_0
    where s1_0.category=?
```

→ SUM(60+120+45) = **225분**, AVG(90+80)/2 = **85.0분** 맞다!

### Step 5: 페이징 — 따라쳐보기

테스트 API 추가:

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@GetMapping("/paging")
@Transactional(readOnly = true)
public String testPaging() {
    // 0번째 페이지, 2개씩, 최신순
    Pageable pageable = PageRequest.of(0, 2, Sort.by("studyDate").descending());
    Page<StudyLog> page = studyLogRepository.findAll(pageable);

    StringBuilder sb = new StringBuilder();
    sb.append("전체 ").append(page.getTotalElements()).append("건\n");
    sb.append("전체 ").append(page.getTotalPages()).append("페이지\n");
    sb.append("현재 ").append(page.getNumber()).append("페이지\n");
    sb.append("다음 페이지 있어? ").append(page.hasNext()).append("\n\n");

    page.getContent().forEach(log ->
        sb.append(log.getTitle()).append(" (").append(log.getStudyDate()).append(")\n")
    );

    return sb.toString();
}
```

**💻 `http://localhost:8080/test/paging` 결과:**

```
전체 5건
전체 3페이지
현재 0페이지
다음 페이지 있어? true

JPA N+1 해결 (2026-03-05)
Spring Security (2026-03-04)
```

**💻 콘솔 — SQL이 2개 나간다!**

```sql
-- 1. 데이터 조회 (LIMIT + ORDER BY)
Hibernate:
    select s1_0.id, ...
    from study_log s1_0
    order by s1_0.study_date desc
    limit ?

-- 2. COUNT 쿼리 (전체 개수 파악)
Hibernate:
    select count(s1_0.id)
    from study_log s1_0
```

→ Page는 **데이터 + COUNT** 2개의 쿼리를 실행한다! 이게 2페이지를 요청하면:

**💻 `http://localhost:8080/test/paging?page=1` (2번째 페이지로 바꿔보면):**

`TestController`를 RequestParam으로 수정:

```java
@GetMapping("/paging")
@Transactional(readOnly = true)
public String testPaging(@RequestParam(defaultValue = "0") int page) {
    Pageable pageable = PageRequest.of(page, 2, Sort.by("studyDate").descending());
    Page<StudyLog> result = studyLogRepository.findAll(pageable);
    // ... 나머지 동일
}
```

**💻 `http://localhost:8080/test/paging?page=2` 결과 (마지막 페이지):**

```
전체 5건
전체 3페이지
현재 2페이지
다음 페이지 있어? false

JPA 기초 (2026-03-01)
```

→ 5건을 2개씩 나누면 3페이지 (2, 2, 1). 마지막 페이지는 1건만!

---

## 7. 전체 흐름 — Repository + Service 🔴

### Repository — 메뉴판

```java
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {

    // save(), findById(), findAll(), delete() → 안 써도 이미 있음!

    // 쿼리 메서드 (이름 → SQL 자동)
    List<StudyLog> findByCategory(Category category);
    List<StudyLog> findByTitleContaining(String keyword);
    Page<StudyLog> findByCategory(Category category, Pageable pageable);

    // @Query (이름으로 안 되는 것)
    @Query("SELECT SUM(s.studyTime) FROM StudyLog s WHERE s.category = :category")
    Integer getTotalStudyTimeByCategory(@Param("category") Category category);
}
```

### Service — 메뉴판에서 주문하기

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)  // 22번에서 배운 패턴!
public class StudyLogService {

    private final StudyLogRepository studyLogRepository;

    // 단건 조회 → findById (내장)
    public StudyLog findById(Long id) {
        return studyLogRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("없는 학습 일지입니다"));
    }

    // 목록 조회 → findByCategory (쿼리 메서드 + 페이징)
    public Page<StudyLog> findByCategory(Category category, Pageable pageable) {
        return studyLogRepository.findByCategory(category, pageable);
    }

    // 통계 → @Query
    public Integer getTotalStudyTime(Category category) {
        return studyLogRepository.getTotalStudyTimeByCategory(category);
    }

    // 수정 → Dirty Checking (save 안 씀! 21번 복습)
    @Transactional
    public StudyLog update(Long id, String title, String content) {
        StudyLog log = findById(id);
        log.updateTitle(title);  // setter 대신 의미 있는 메서드
        return log;  // 트랜잭션 끝나면 자동 UPDATE
    }
}
```

### 매핑 정리

```
┌─────────────────────────────────────────────────────────┐
│  Service 메서드       →  Repository 메서드     →  출처    │
├─────────────────────────────────────────────────────────┤
│  findById(id)         →  findById(id)          → 내장   │
│  findByCategory(cat)  →  findByCategory(...)   → 이름   │
│  getTotalStudyTime    →  @Query(SUM...)        → JPQL  │
│  update(...)          →  (Dirty Checking)      → 없음!  │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Page vs Slice 🟡

### 비유: 게시판 vs 인스타그램

```
Page (게시판)                    Slice (인스타그램)
─────────────                   ─────────────────
글 목록...                       사진들...
[1] [2] [3] ... [50]            [ 더 보기 ▼ ]
← 전체 페이지 수 필요 →          ← 다음 있는지만 알면 OK →
← COUNT 쿼리 필수! →            ← COUNT 불필요! →
```

| | Page | Slice |
|---|---|---|
| COUNT 쿼리 | 함 (느릴 수 있음) | 안 함 (빠름) |
| 전체 페이지 수 | 알 수 있음 | 모름 |
| **용도** | 페이지 번호 UI | 무한 스크롤 |

```java
// Page → Slice로 바꾸려면 반환 타입만 변경!
Slice<StudyLog> findByCategory(Category category, Pageable pageable);

Slice<StudyLog> result = repository.findByCategory(Category.JPA, pageable);
result.hasNext();         // 다음 있어?
// result.getTotalPages() ← 컴파일 에러! Slice엔 없다
```

> 💡 Slice는 내부적으로 **size + 1개**를 조회해서 다음 존재 여부를 판단한다.
> 10개 요청 → 11개 조회 → 11개 나오면 "다음 있음", 10개 이하면 "끝"

---

## 9. Projection — 필요한 컬럼만 🟡

엔티티 전체(`SELECT *`)가 아닌, 필요한 필드만 가져오기:

```java
// 인터페이스 정의
public interface StudyLogSummary {
    String getTitle();
    Integer getStudyTime();
}

// Repository — 반환 타입을 인터페이스로!
List<StudyLogSummary> findByCategory(Category category);
```

**💻 생성되는 SQL:**

```sql
-- SELECT * 대신 필요한 것만!
SELECT s.title, s.study_time FROM study_log s WHERE s.category = ?
```

→ content 같은 무거운 컬럼을 안 가져옴! 성능에 유리.

---

## 10. @Modifying — UPDATE/DELETE 벌크 연산 🟡

@Query는 기본이 SELECT다. UPDATE/DELETE를 하려면 `@Modifying` 추가:

```java
@Modifying(clearAutomatically = true)
@Query("UPDATE StudyLog s SET s.studyTime = :time WHERE s.category = :category")
int updateStudyTimeBulk(@Param("category") Category category, @Param("time") int time);
```

```
clearAutomatically = true → 벌크 연산 후 영속성 컨텍스트 초기화

왜 필요한가?
  → 벌크 UPDATE는 영속성 컨텍스트를 거치지 않고 DB에 직접 실행
  → 영속성 컨텍스트의 1차 캐시에는 옛날 데이터가 남아있음!
  → clearAutomatically = true → 1차 캐시 초기화 → 다음 조회 시 DB에서 새로 가져옴
  → (21번에서 배운 영속성 컨텍스트 동작 원리가 여기서 쓰인다!)
```

### 💻 따라쳐보기

`StudyLogRepository.java`에 추가:

```java
@Modifying(clearAutomatically = true)
@Query("UPDATE StudyLog s SET s.studyTime = :time WHERE s.category = :category")
int updateStudyTimeBulk(@Param("category") Category category, @Param("time") int time);
```

테스트:

```java
@GetMapping("/bulk-update")
@Transactional
public String testBulkUpdate() {
    int count = studyLogRepository.updateStudyTimeBulk(Category.JPA, 100);
    return "JPA 카테고리 " + count + "건의 학습 시간을 100분으로 변경!";
}
```

**💻 `http://localhost:8080/test/bulk-update` 콘솔:**

```sql
Hibernate:
    update study_log
    set study_time=?
    where category=?
```

**💻 결과:**

```
JPA 카테고리 3건의 학습 시간을 100분으로 변경!
```

→ JPA 카테고리 3건(JPA 기초, JPA 심화, JPA N+1 해결)의 studyTime이 모두 100으로 변경!

---

## 11. Native Query — 진짜 SQL 🟡

JPQL로 안 되는 DB 전용 기능에만 쓴다 (최후의 수단):

```java
@Query(value = "SELECT * FROM study_log WHERE MATCH(title) AGAINST(:kw)",
       nativeQuery = true)
List<StudyLog> fullTextSearch(@Param("kw") String keyword);
```

> ⚠️ DB를 바꾸면 깨진다. 가능하면 JPQL을 쓰자.

---

## 12. Cursor 페이징 🟢

Offset(`LIMIT 10 OFFSET 99990`)은 뒤로 갈수록 느려진다 (앞의 99,990건을 읽고 버림).
Cursor는 "마지막으로 본 ID 다음부터" 조회해서 항상 빠르다:

```java
@Query("SELECT s FROM StudyLog s WHERE s.id > :lastId ORDER BY s.id ASC")
List<StudyLog> findAfter(@Param("lastId") Long lastId, Pageable pageable);

// GET /logs?lastId=10&size=10 → id=11부터 10개
```

| | Offset (Page) | Cursor |
|---|---|---|
| 속도 | 뒤로 갈수록 느림 | 항상 일정 |
| 특정 페이지 이동 | 가능 (3페이지로!) | 불가능 (순서대로만) |
| **용도** | 게시판 | 무한 스크롤, 피드 |

---

## 13. Specification — 동적 검색 필터 🟢

검색 조건이 여러 개이고, 조합이 다양할 때:

```java
// 조건 블록을 레고처럼 조립
Specification<StudyLog> spec = Specification
    .where(StudyLogSpec.hasCategory(Category.SPRING))  // ☑ 카테고리
    .and(StudyLogSpec.hasMinStudyTime(60));             // ☑ 60분 이상
    // 키워드는 null → 자동 무시!

repository.findAll(spec, pageable);
```

> 더 복잡한 동적 쿼리는 **QueryDSL**이 낫다.

---

## 14. 실습 문제

### 문제 1: 쿼리 메서드 작성

`MemberRepository`에 다음을 쿼리 메서드로 만들어라.

```java
public interface MemberRepository extends JpaRepository<Member, Long> {
    // 1. 이메일로 회원 조회 (1건 또는 없음)
    // 2. 이름에 키워드 포함된 회원 목록
    // 3. 이메일 존재 여부
}
```

<details>
<summary>정답 보기</summary>

```java
Optional<Member> findByEmail(String email);
List<Member> findByNameContaining(String keyword);
boolean existsByEmail(String email);
```

</details>

### 문제 2: @Query 작성

```java
// 1. 특정 카테고리의 학습 일지 개수
// 2. 학습 시간이 전체 평균 이상인 학습 일지
```

<details>
<summary>정답 보기</summary>

```java
@Query("SELECT COUNT(s) FROM StudyLog s WHERE s.category = :category")
Long countByCategory(@Param("category") Category category);

@Query("SELECT s FROM StudyLog s WHERE s.studyTime >= " +
       "(SELECT AVG(s2.studyTime) FROM StudyLog s2)")
List<StudyLog> findAboveAverage();
```

`findAboveAverage()`의 평균: (60+90+120+80+45)/5 = 79분
→ 80분 이상인 Spring MVC(90), JPA 심화(120), Spring Security(80) 3건 반환

</details>

### 문제 3: Page vs Slice 선택

1. 관리자 화면 — `[1] [2] [3] ... [50]`
2. 모바일 피드 — 스크롤하면 계속 로딩
3. 상위 20건만 보여주기

<details>
<summary>정답 보기</summary>

1. **Page** — 전체 페이지 수 필요
2. **Slice** — "다음 있어?"만 알면 됨
3. **List** — `findTop20By...`로 충분 (페이징 자체가 불필요)

</details>

---

## 15. 면접 대비 🔴🟡

### 🔴 필수

**Q1: 쿼리 메서드란?**

> `findBy + 필드명 + 조건키워드` 규칙으로 메서드 이름을 작성하면 Spring Data JPA가 자동으로 SQL을 생성해주는 기능입니다.

**Q2: @Query는 왜 사용하나?**

> 쿼리 메서드로 표현하기 어려운 복잡한 쿼리(집계, 서브쿼리)나 이름이 너무 길어질 때 JPQL을 직접 작성하기 위해서입니다.

**Q3: JPQL과 SQL의 차이?**

> SQL은 테이블과 컬럼 대상, JPQL은 엔티티와 필드 대상입니다. JPQL은 DB에 독립적이라 DB를 변경해도 쿼리 수정이 필요 없습니다.

**Q4: Page와 Slice의 차이?**

> Page는 COUNT 쿼리를 추가 실행해 전체 페이지 수를 알 수 있습니다 (게시판). Slice는 COUNT 없이 size + 1개를 조회해 다음 페이지 존재 여부만 판단합니다 (무한 스크롤).

**Q5: @Modifying은 왜 필요?**

> @Query는 기본이 SELECT이므로, UPDATE/DELETE 쿼리에는 @Modifying을 붙여야 합니다. `clearAutomatically = true`로 벌크 연산 후 영속성 컨텍스트를 초기화해 1차 캐시와 DB 간 불일치를 방지합니다.

### 🟡 개념만

**Q6: Projection이란?**

> 엔티티 전체가 아닌 필요한 필드만 선택적으로 가져오는 기법입니다. 인터페이스에 getter만 정의하면 해당 필드만 SELECT합니다.

**Q7: Offset 페이징의 단점과 대안?**

> 뒤로 갈수록 느려집니다 (앞 데이터를 읽고 버림). 대안은 Cursor 페이징으로 `WHERE id > 마지막ID`로 항상 일정한 속도를 유지합니다.

---

## 16. 핵심 요약

```
📌 이번에 배운 것:

1. JpaRepository 상속 → save, findById, findAll 공짜!
2. 쿼리 메서드: findBy + 필드명 + 키워드 → SQL 자동 생성
3. @Query: 복잡한 조건, SUM/AVG/GROUP BY → JPQL 직접 작성
4. JPQL vs SQL: 테이블 대신 엔티티, 컬럼 대신 필드
5. 페이징: PageRequest.of(page, size, Sort) → Page 반환
   - Page = COUNT O (게시판)
   - Slice = COUNT X (무한 스크롤)
6. @Modifying: UPDATE/DELETE 벌크 연산 + clearAutomatically
7. Projection: 필요한 필드만 SELECT (성능 최적화)
8. Native Query: DB 전용 기능에만 (최후의 수단)
```
