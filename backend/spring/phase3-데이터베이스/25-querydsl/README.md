# 25. QueryDSL — 타입 안전한 동적 쿼리 작성

> **키워드**: `QueryDSL` `JPAQueryFactory` `Q클래스` `BooleanExpression` `동적 쿼리` `Projections` `@QueryProjection`

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | QueryDSL 개념, Q클래스, BooleanExpression, JPAQueryFactory, 실전 패턴 | 면접 + 실무에서 거의 매일 사용 |
| 🟡 이해 | Projections, @QueryProjection, 페이징 | 개념 이해하고 구현할 수 있으면 됨 |
| 🟢 참고 | 집계 함수 | 필요할 때 찾아 쓸 수 있으면 됨 |

> 💡 **24번과의 연결**: N+1 문제를 해결했는데, 이번엔 **복잡한 검색 조건을 쉽게 작성**하는 방법을 배운다. "AND/OR 조건이 많을 때" 특히 유용하다!

---

## 1. Spring Data JPA 쿼리 메서드의 한계 🔴

### 1-1. 문제 상황

Spring Data JPA로 복잡한 검색을 하려면?

```java
// ❌ 쿼리 메서드 방식 (Spring Data JPA)
List<StudyLog> findByTitleContainingAndCategoryAndStatusAndCreatedAtBetween(
    String title, 
    String category, 
    String status, 
    LocalDateTime startDate, 
    LocalDateTime endDate
);
```

**문제:**
- 메서드명이 너무 길다 (읽기 힘들다)
- 조건이 추가될 때마다 새로운 메서드 필요
- "title이 있을 때만 검색" 같은 **동적 조건** 어려움
- SQL 오류는 **런타임에 발견** (타입 체크 없음)

### 1-2. QueryDSL로 해결

```java
// ✅ QueryDSL 방식
List<StudyLog> logs = queryFactory
    .selectFrom(qStudyLog)
    .where(
        qStudyLog.title.contains("Spring"),
        qStudyLog.category.eq("SPRING"),
        qStudyLog.status.eq("COMPLETED")
    )
    .fetch();
```

**장점:**
- 코드가 짧고 읽기 쉽다
- 조건을 동적으로 추가/제거 가능
- **컴파일 타임에 오류 발견** (변수명 오타 불가)
- 복잡한 JOIN, GROUP BY, HAVING도 쉽게 작성

---

## 2. QueryDSL이란? 🔴

### 비유

```
쿼리 빌더:  문장을 단계별로 조립하는 것 (사람이 말하듯이)
QueryDSL:   Java 코드로 SQL을 조립하되, 문법 오류를 컴파일 때 미리 잡는 것
```

### 한 줄 정의

**Q**uery **D**omain **S**pecific **L**anguage — Java 코드로 **타입 안전한** SQL을 작성하는 라이브러리.

```
특징:
✅ 문법 오류: 컴파일 타임에 발견
✅ 자동완성: IDE가 지원 (컬럼명 오타 불가)
✅ 동적 쿼리: 조건을 런타임에 추가/제거
✅ 복잡한 쿼리: JOIN, GROUP BY 간단함
```

---

## 3. 프로젝트 설정 🔴

### 3-1. 의존성 추가

```gradle
// build.gradle
plugins {
    id "com.ewerk.gradle.plugins.querydsl" version "1.0.10"
}

dependencies {
    implementation 'com.querydsl:querydsl-jpa:5.0.0:jakarta'
    annotationProcessor 'com.querydsl:querydsl-apt:5.0.0:jakarta'
    annotationProcessor 'jakarta.persistence:jakarta.persistence-api:3.1.0'
    annotationProcessor 'jakarta.annotation:jakarta.annotation-api:2.1.1'
}

def querydslDir = "$buildDir/generated/querydsl"

querydsl {
    jpa = true
    querydslSourcesDir = querydslDir
}

sourceSets {
    main.java.srcDir querydslDir
}
```

### 3-2. JPAQueryFactory 빈으로 등록

```java
@Configuration
public class QuerydslConfig {
    
    @Bean
    public JPAQueryFactory jpaQueryFactory(EntityManager em) {
        return new JPAQueryFactory(em);
    }
}
```

**→ 프로젝트 빌드 후 `/build/generated/querydsl` 폴더에 Q클래스들이 자동 생성됨**

---

## 4. Q클래스란? 🔴

### 4-1. Q클래스 자동 생성

Entity를 정의하면:

```java
@Entity
@Table(name = "study_log")
public class StudyLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String category;
    private String status;
}
```

**빌드 후 자동으로 생성됨:**

```java
// QStudyLog.java (자동 생성, 수정 금지)
public class QStudyLog extends EntityPathBase<StudyLog> {
    public static final QStudyLog qStudyLog = new QStudyLog("studyLog");
    
    public final StringPath title = createString("title");
    public final StringPath category = createString("category");
    public final StringPath status = createString("status");
    // ...
}
```

### 4-2. 사용 방법

```java
import static com.example.entity.QStudyLog.*;  // 정적 import

@Repository
public class StudyLogQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    public StudyLogQueryRepository(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }
    
    public List<StudyLog> findAll() {
        return queryFactory
            .selectFrom(qStudyLog)  // ← Q클래스 사용
            .fetch();
    }
}
```

**→ `qStudyLog.title`, `qStudyLog.category` 같이 컬럼에 자동완성 지원!**

---

## 5. 기본 쿼리 작성 패턴 🔴

### 5-1. 단순 SELECT + WHERE

```java
// SQL:
// SELECT * FROM study_log 
// WHERE title = 'Spring DI' AND status = 'COMPLETED'

List<StudyLog> logs = queryFactory
    .selectFrom(qStudyLog)
    .where(
        qStudyLog.title.eq("Spring DI"),
        qStudyLog.status.eq("COMPLETED")
    )
    .fetch();  // ← List<StudyLog> 반환

// 참고: fetch() vs fetchOne() vs fetchFirst()
queryFactory.selectFrom(qStudyLog).fetch();          // List
queryFactory.selectFrom(qStudyLog).fetchOne();       // Optional (없으면 null)
queryFactory.selectFrom(qStudyLog).fetchFirst();     // 첫 1개 (Optional)
```

### 5-2. 자주 쓰는 WHERE 조건들

```java
// 1. 정확히 일치
.where(qStudyLog.status.eq("COMPLETED"))

// 2. 포함 (LIKE)
.where(qStudyLog.title.contains("Spring"))
.where(qStudyLog.title.startsWith("Spring"))
.where(qStudyLog.title.endsWith("DI"))

// 3. 비교
.where(qStudyLog.createdAt.after(LocalDate.now()))
.where(qStudyLog.createdAt.before(LocalDate.now()))
.where(qStudyLog.createdAt.between(start, end))

// 4. IN 조건
.where(qStudyLog.category.in("SPRING", "JPA", "QUERYDSL"))

// 5. NULL 체크
.where(qStudyLog.deletedAt.isNull())
.where(qStudyLog.deletedAt.isNotNull())

// 6. 공백(EMPTY) 체크
.where(qStudyLog.title.isEmpty())
.where(qStudyLog.title.isNotEmpty())
```

### 5-3. ORDER BY, LIMIT

```java
List<StudyLog> topLogs = queryFactory
    .selectFrom(qStudyLog)
    .where(qStudyLog.status.eq("COMPLETED"))
    .orderBy(qStudyLog.createdAt.desc())  // 최신순
    .limit(10)
    .fetch();
```

---

## 6. 동적 쿼리 작성 (BooleanExpression) 🔴

### 6-1. 문제: 조건이 선택적일 때?

검색 API 예:

```
GET /api/study-logs?title=Spring&category=SPRING&status=

→ title만 있음 (category, status는 공백)
→ title과 category만 있음
→ 모두 있음

매번 다른 조건이 들어온다!
```

### 6-2. BooleanExpression으로 해결

```java
// Step 1: 각 조건을 BooleanExpression으로 분리
private BooleanExpression titleContains(String title) {
    return title != null ? qStudyLog.title.contains(title) : null;
}

private BooleanExpression categoryEq(String category) {
    return category != null ? qStudyLog.category.eq(category) : null;
}

private BooleanExpression statusEq(String status) {
    return status != null && !status.isEmpty() 
        ? qStudyLog.status.eq(status) 
        : null;
}

// Step 2: where()에 null이 아닌 것들만 추가
public List<StudyLog> searchByDynamic(String title, String category, String status) {
    return queryFactory
        .selectFrom(qStudyLog)
        .where(
            titleContains(title),
            categoryEq(category),
            statusEq(status)
        )
        .fetch();  // ← null 조건은 자동 무시됨
}
```

**동작 흐름:**

```
입력: title="Spring", category="SPRING", status="" (공백)

Step 1:
  titleContains("Spring") → qStudyLog.title.contains("Spring")
  categoryEq("SPRING") → qStudyLog.category.eq("SPRING")
  statusEq("") → null (조건 없음)

Step 2:
  where(
    qStudyLog.title.contains("Spring"),  ← O 실행
    qStudyLog.category.eq("SPRING"),     ← O 실행
    null                                  ← X 무시됨
  )

최종 SQL:
  SELECT * FROM study_log 
  WHERE title LIKE '%Spring%' AND category = 'SPRING'
```

### 6-3. 체이닝 방식 (더 간결)

```java
public List<StudyLog> searchByDynamic(String title, String category, String status) {
    return queryFactory
        .selectFrom(qStudyLog)
        .where(
            titleContains(title),
            categoryEq(category),
            statusEq(status)
        )
        .fetch();
}

// private 헬퍼 메서드들 (BooleanExpression 반환)
private BooleanExpression titleContains(String title) {
    return StringUtils.hasText(title) 
        ? qStudyLog.title.contains(title) 
        : null;
}

private BooleanExpression categoryEq(String category) {
    return StringUtils.hasText(category) 
        ? qStudyLog.category.eq(category) 
        : null;
}

private BooleanExpression statusEq(String status) {
    return StringUtils.hasText(status) 
        ? qStudyLog.status.eq(status) 
        : null;
}
```

---

## 7. Projections — 필요한 컬럼만 조회 🟡

### 7-1. 모든 컬럼 vs 일부만 필요

```java
// ❌ 모든 컬럼 조회 (비효율)
List<StudyLog> logs = queryFactory
    .selectFrom(qStudyLog)
    .fetch();
// → id, title, category, status, content, createdAt, updatedAt, deletedAt 모두 SELECT

// ✅ 필요한 컬럼만 조회 (효율)
List<StudyLogSummaryDto> summaries = queryFactory
    .select(Projections.constructor(
        StudyLogSummaryDto.class,
        qStudyLog.id,
        qStudyLog.title,
        qStudyLog.category
    ))
    .from(qStudyLog)
    .fetch();
// → SELECT id, title, category FROM study_log
```

### 7-2. Projection 방식들

```java
// 1️⃣ Projections.constructor (생성자)
Projections.constructor(StudyLogDto.class, 
    qStudyLog.id, 
    qStudyLog.title)

// 2️⃣ Projections.bean (Setter)
Projections.bean(StudyLogDto.class,
    qStudyLog.id.as("id"),
    qStudyLog.title.as("title"))

// 3️⃣ Projections.fields (리플렉션)
Projections.fields(StudyLogDto.class,
    qStudyLog.id,
    qStudyLog.title)
```

### 7-3. DTO 정의 (Projection용)

```java
// DTO는 read-only
@Data
@NoArgsConstructor  // ← Projections.bean 사용 시 필요
public class StudyLogSummaryDto {
    private Long id;
    private String title;
    private String category;
    
    // Projections.constructor 사용 시 필요한 생성자
    public StudyLogSummaryDto(Long id, String title, String category) {
        this.id = id;
        this.title = title;
        this.category = category;
    }
}
```

---

## 8. @QueryProjection으로 더 안전하게 🟡

### 8-1. @QueryProjection이란?

컴파일 타임에 Q클래스 기반 Projection을 만들어서 **런타임 오류 방지**

### 8-2. 사용 방법

```java
// Step 1: DTO에 @QueryProjection 붙이기
@Data
public class StudyLogSummaryDto {
    private Long id;
    private String title;
    private String category;
    
    @QueryProjection
    public StudyLogSummaryDto(Long id, String title, String category) {
        this.id = id;
        this.title = title;
        this.category = category;
    }
}
```

```bash
# Step 2: 프로젝트 빌드
gradle build

# → QStudyLogSummaryDto 자동 생성
```

```java
// Step 3: 쿼리에서 사용
List<StudyLogSummaryDto> results = queryFactory
    .select(new QStudyLogSummaryDto(
        qStudyLog.id,
        qStudyLog.title,
        qStudyLog.category
    ))
    .from(qStudyLog)
    .fetch();
```

**vs Projections.constructor():**

```
Projections.constructor()     @QueryProjection
├─ 런타임 반영(Reflection)     ├─ 컴파일 타임 생성
├─ 성능 약간 느림             ├─ 성능 우수
├─ 컬럼명 오타 런타임 에러      └─ 컬럼명 오타 컴파일 에러 (안전!)
└─ Reflection 필요 없음       
```

---

## 9. 페이징과 정렬 🟡

### 9-1. offset 기반 페이징

```java
List<StudyLog> page1 = queryFactory
    .selectFrom(qStudyLog)
    .orderBy(qStudyLog.createdAt.desc())
    .offset(0)      // 건너뛸 개수
    .limit(10)      // 가져올 개수
    .fetch();
// → 1번째부터 10번째 (1~10)

List<StudyLog> page2 = queryFactory
    .selectFrom(qStudyLog)
    .orderBy(qStudyLog.createdAt.desc())
    .offset(10)     // 10개 건너뛰기
    .limit(10)      // 다음 10개
    .fetch();
// → 11번째부터 20번째 (11~20)
```

### 9-2. fetchResults() — 페이징 + 전체 개수

```java
// 페이징 + 전체 개수를 한 번에 가져오기
QueryResults<StudyLog> results = queryFactory
    .selectFrom(qStudyLog)
    .where(qStudyLog.status.eq("COMPLETED"))
    .orderBy(qStudyLog.createdAt.desc())
    .offset(0)
    .limit(10)
    .fetchResults();  // ← 2개 쿼리 발생 (SELECT + COUNT)

// results.getResults() → List<StudyLog> (페이징된 데이터)
// results.getTotal()   → Long (전체 개수)
```

### 9-3. 여러 정렬 기준

```java
List<StudyLog> logs = queryFactory
    .selectFrom(qStudyLog)
    .orderBy(
        qStudyLog.createdAt.desc(),   // 1순위: 최신 기준
        qStudyLog.title.asc()         // 2순위: 제목 가나다순
    )
    .fetch();
```

---

## 10. 집계 함수 (GROUP BY, COUNT, SUM, AVG) 🟢

### 10-1. COUNT, SUM, AVG, MAX, MIN

```java
// COUNT: 전체 개수
long totalCount = queryFactory
    .selectFrom(qStudyLog)
    .fetchCount();
// → SELECT COUNT(*) FROM study_log

// COUNT (WHERE 조건 포함)
long completedCount = queryFactory
    .select(qStudyLog.count())
    .from(qStudyLog)
    .where(qStudyLog.status.eq("COMPLETED"))
    .fetchOne();
```

### 10-2. GROUP BY (카테고리별 개수)

```java
// SQL:
// SELECT category, COUNT(*) FROM study_log GROUP BY category

@Data
public class CategoryStatsDto {
    private String category;
    private Long count;
    
    public CategoryStatsDto(String category, Long count) {
        this.category = category;
        this.count = count;
    }
}

// 쿼리
List<CategoryStatsDto> stats = queryFactory
    .select(Projections.constructor(
        CategoryStatsDto.class,
        qStudyLog.category,
        qStudyLog.id.count()  // ← COUNT(*)
    ))
    .from(qStudyLog)
    .groupBy(qStudyLog.category)
    .fetch();

// 결과:
// category | count
// SPRING   | 15
// JPA      | 8
// QUERYDSL | 5
```

### 10-3. HAVING (그룹 조건)

```java
// SQL:
// SELECT category, COUNT(*) 
// FROM study_log 
// GROUP BY category 
// HAVING COUNT(*) > 5

List<CategoryStatsDto> stats = queryFactory
    .select(Projections.constructor(
        CategoryStatsDto.class,
        qStudyLog.category,
        qStudyLog.id.count()
    ))
    .from(qStudyLog)
    .groupBy(qStudyLog.category)
    .having(qStudyLog.id.count().gt(5))  // ← HAVING
    .fetch();
```

---

## 11. 실전 패턴: 검색 + 페이징 Repository 🔴

### 11-1. 요구사항

```
POST /api/study-logs/search
{
    "title": "Spring",
    "category": "SPRING",
    "status": "",
    "page": 0,
    "size": 20,
    "sort": "createdAt,desc"
}

응답:
{
    "content": [...],
    "totalElements": 150,
    "totalPages": 8,
    "currentPage": 0,
    "pageSize": 20
}
```

### 11-2. SearchRequest DTO

```java
@Data
public class StudyLogSearchRequest {
    private String title;
    private String category;
    private String status;
    private int page = 0;
    private int size = 20;
    private String sort = "createdAt,desc";
}
```

### 11-3. QueryRepository 구현

```java
import static com.example.entity.QStudyLog.*;

@Repository
public class StudyLogQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    public StudyLogQueryRepository(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }
    
    // 동적 쿼리 + 페이징
    public Page<StudyLogSummaryDto> search(StudyLogSearchRequest req) {
        // Step 1: 데이터 조회 (페이징 적용)
        List<StudyLogSummaryDto> content = queryFactory
            .select(Projections.constructor(
                StudyLogSummaryDto.class,
                qStudyLog.id,
                qStudyLog.title,
                qStudyLog.category,
                qStudyLog.status,
                qStudyLog.createdAt
            ))
            .from(qStudyLog)
            .where(
                titleContains(req.getTitle()),
                categoryEq(req.getCategory()),
                statusEq(req.getStatus())
            )
            .orderBy(qStudyLog.createdAt.desc())
            .offset((long) req.getPage() * req.getSize())
            .limit(req.getSize())
            .fetch();
        
        // Step 2: 전체 개수 조회
        long total = queryFactory
            .select(qStudyLog.count())
            .from(qStudyLog)
            .where(
                titleContains(req.getTitle()),
                categoryEq(req.getCategory()),
                statusEq(req.getStatus())
            )
            .fetchOne();
        
        // Step 3: Page 객체로 변환
        return new PageImpl<>(
            content,
            PageRequest.of(req.getPage(), req.getSize()),
            total
        );
    }
    
    // 동적 조건 헬퍼 메서드들
    private BooleanExpression titleContains(String title) {
        return StringUtils.hasText(title) 
            ? qStudyLog.title.contains(title) 
            : null;
    }
    
    private BooleanExpression categoryEq(String category) {
        return StringUtils.hasText(category) 
            ? qStudyLog.category.eq(category) 
            : null;
    }
    
    private BooleanExpression statusEq(String status) {
        return StringUtils.hasText(status) 
            ? qStudyLog.status.eq(status) 
            : null;
    }
}
```

### 11-4. Service + Controller

```java
// Service
@Service
@RequiredArgsConstructor
public class StudyLogService {
    
    private final StudyLogQueryRepository queryRepository;
    
    public Page<StudyLogSummaryDto> search(StudyLogSearchRequest req) {
        return queryRepository.search(req);
    }
}

// Controller
@RestController
@RequestMapping("/api/study-logs")
@RequiredArgsConstructor
public class StudyLogController {
    
    private final StudyLogService service;
    
    @PostMapping("/search")
    public ResponseEntity<Page<StudyLogSummaryDto>> search(
        @RequestBody StudyLogSearchRequest req
    ) {
        return ResponseEntity.ok(service.search(req));
    }
}
```

---

## 12. JOIN 쿼리 예제 🟡

### 12-1. INNER JOIN

```java
// SQL:
// SELECT s.id, s.title, c.name 
// FROM study_log s 
// INNER JOIN category c ON s.category_id = c.id

@Data
public class StudyLogWithCategoryDto {
    private Long logId;
    private String title;
    private String categoryName;
}

List<StudyLogWithCategoryDto> results = queryFactory
    .select(Projections.constructor(
        StudyLogWithCategoryDto.class,
        qStudyLog.id,
        qStudyLog.title,
        qCategory.name
    ))
    .from(qStudyLog)
    .innerJoin(qStudyLog.category, qCategory)
    .fetch();
```

### 12-2. LEFT JOIN

```java
List<StudyLogWithCategoryDto> results = queryFactory
    .select(Projections.constructor(
        StudyLogWithCategoryDto.class,
        qStudyLog.id,
        qStudyLog.title,
        qCategory.name
    ))
    .from(qStudyLog)
    .leftJoin(qStudyLog.category, qCategory)  // ← LEFT JOIN
    .fetch();
```

---

## 13. 주의사항 & 팁 🔴

### 13-1. where() null 처리

```java
// ✅ 올바른 사용 (null은 무시됨)
.where(
    qStudyLog.title.contains(title),    // title이 null이면 무시
    qStudyLog.category.eq(category)     // category가 null이면 무시
)

// ❌ 틀린 사용 (런타임 에러)
if (title != null) {
    .where(qStudyLog.title.contains(title))
}
```

### 13-2. 페이징 + fetchResults() 성능

```java
// ⚠️ fetchResults()는 2개 쿼리 발생 (SELECT + COUNT)
QueryResults<StudyLog> results = queryFactory
    .selectFrom(qStudyLog)
    .fetchResults();

// 💡 대안: 직접 count 조회 (필요할 때만)
long total = queryFactory
    .select(qStudyLog.count())
    .from(qStudyLog)
    .fetchOne();
```

### 13-3. 엔티티 vs DTO 조회

```java
// 엔티티 조회 → 1차 캐시 + 더티 체킹 비용
List<StudyLog> entities = queryFactory
    .selectFrom(qStudyLog)
    .fetch();

// DTO 조회 → 가볍고 빠름 (read-only)
List<StudyLogSummaryDto> dtos = queryFactory
    .select(Projections.constructor(StudyLogSummaryDto.class, ...))
    .from(qStudyLog)
    .fetch();
```

---

## 14. 따라 쳐보기 (실습)

### 14-1. 프로젝트 설정

```bash
# 1. QueryDSL 의존성 추가 (build.gradle)
# 2. JPAQueryFactory 빈 등록 (QuerydslConfig.java)
# 3. 프로젝트 빌드
gradle build

# 4. Q클래스 생성 확인
ls -la build/generated/querydsl/
# → QStudyLog.java 생성됨
```

### 14-2. 기본 쿼리 테스트

```java
// StudyLogQueryRepository.java
@Repository
@RequiredArgsConstructor
public class StudyLogQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    // 1. 모든 로그 조회
    public List<StudyLog> findAll() {
        return queryFactory
            .selectFrom(qStudyLog)
            .fetch();
    }
    
    // 2. 카테고리별 조회
    public List<StudyLog> findByCategory(String category) {
        return queryFactory
            .selectFrom(qStudyLog)
            .where(qStudyLog.category.eq(category))
            .fetch();
    }
    
    // 3. 검색 (동적 조건)
    public List<StudyLog> search(String title, String category) {
        return queryFactory
            .selectFrom(qStudyLog)
            .where(
                titleContains(title),
                categoryEq(category)
            )
            .fetch();
    }
    
    private BooleanExpression titleContains(String title) {
        return StringUtils.hasText(title) 
            ? qStudyLog.title.contains(title) 
            : null;
    }
    
    private BooleanExpression categoryEq(String category) {
        return StringUtils.hasText(category) 
            ? qStudyLog.category.eq(category) 
            : null;
    }
}
```

### 14-3. 테스트

```java
@SpringBootTest
@Transactional
class StudyLogQueryRepositoryTest {
    
    @Autowired
    private StudyLogQueryRepository repository;
    
    @Autowired
    private StudyLogRepository studyLogRepository;
    
    @Test
    void testFindAll() {
        // Given
        StudyLog log = new StudyLog("Spring DI", "SPRING");
        studyLogRepository.save(log);
        
        // When
        List<StudyLog> results = repository.findAll();
        
        // Then
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getTitle()).isEqualTo("Spring DI");
    }
    
    @Test
    void testSearch_WithTitle() {
        // Given
        studyLogRepository.save(new StudyLog("Spring DI", "SPRING"));
        studyLogRepository.save(new StudyLog("Spring AOP", "SPRING"));
        studyLogRepository.save(new StudyLog("JPA 매핑", "JPA"));
        
        // When
        List<StudyLog> results = repository.search("Spring", null);
        
        // Then
        assertThat(results).hasSize(2);
    }
}
```

---

## 15. 대비 정보 (23번과의 차이)

### Spring Data JPA 메서드 vs QueryDSL

| 상황 | Spring Data JPA | QueryDSL |
|------|-----------------|----------|
| 간단한 CRUD | ✅ 추천 | 오버엔지니어링 |
| 동적 조건 (검색) | ❌ 한계 | ✅ 추천 |
| 복잡한 JOIN | 🔶 @Query 필요 | ✅ 추천 |
| 컬럼 선택 | 🔶 Projection | ✅ 간단함 |
| 타입 안전성 | ❌ 문자열 기반 | ✅ 컴파일 체크 |
| 학습곡선 | 낮음 | 중간 |

**💡 조합 전략:**
- `JpaRepository` (기본 CRUD) + `QueryRepository` (복잡한 쿼리) 함께 사용

---

## 16. 핵심 요약

```
┌─────────────────────────────────────────────────────────────┐
│                     QueryDSL 핵심 체크리스트                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 🔴 필수 이해:                                                │
│   ✓ Q클래스는 컴파일 타임에 자동 생성되는 메타데이터         │
│   ✓ BooleanExpression null은 where()에서 무시됨            │
│   ✓ 동적 쿼리 = 조건 메서드 분리 + where() 조합            │
│   ✓ JPAQueryFactory는 EntityManager 기반                   │
│   ✓ DTO 조회가 엔티티보다 성능 우수                         │
│                                                              │
│ 🟡 개념만 알면 됨:                                           │
│   ✓ Projections.constructor() vs @QueryProjection          │
│   ✓ fetchResults() 2개 쿼리 비용                            │
│   ✓ GROUP BY + HAVING 문법                                  │
│                                                              │
│ 🟢 필요할 때 찾으면 됨:                                      │
│   ✓ 집계 함수 (SUM, AVG, MAX, MIN)                          │
│   ✓ 복잡한 CASE/WHEN 표현                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 면접 대비

### 🔴 필수 질문

**Q1: "QueryDSL이 Spring Data JPA 쿼리 메서드보다 나은 점이 뭔가요?"**

> 동적 쿼리 작성이 쉽습니다. 검색 조건이 없을 때만 필터링 안 하는데, 쿼리 메서드 방식은 모든 조합마다 메서드를 만들어야 하고 유지보수가 힘듭니다. QueryDSL은 `BooleanExpression`으로 조건을 분리하고 `where()`에 null을 무시하는 특성을 이용해서 동적으로 추가/제거할 수 있습니다. 또한 컴파일 타임에 컬럼명 오타를 잡을 수 있어서 타입 안전합니다.

**Q2: "Q클래스가 뭔가요?"**

> 쿼리를 작성할 때 타입 안전성을 위해 자동으로 생성되는 메타데이터 클래스입니다. Entity를 만들면 빌드할 때 `build/generated/querydsl` 폴더에 Q클래스가 자동 생성되는데, 이를 통해 컬럼명을 자동완성할 수 있고 오타를 컴파일 단계에서 미리 발견할 수 있습니다.

**Q3: "where()에 여러 조건을 넣을 때 null이 어떻게 처리되나요?"**

> QueryDSL의 `where()`에서 null 값은 자동으로 무시됩니다. 예를 들어 `where(titleContains(title), categoryEq(category))`에서 `title`이 null이면 첫 번째 조건이 null을 반환하고 이는 무시되므로 `category` 조건만 적용됩니다. 이것이 동적 쿼리를 간단하게 만들어줍니다.

**Q4: "Projections.constructor와 @QueryProjection의 차이는?"**

> `Projections.constructor()`는 런타임에 리플렉션을 사용하므로 약간의 성능 비용이 있고, 컬럼 개수나 타입 불일치 오류가 런타임에 발견됩니다. `@QueryProjection`은 컴파일 타임에 Q클래스처럼 메타데이터를 생성하므로 타입이 미리 체크되고 성능도 약간 더 좋습니다.

**Q5: "따라쳐보기 코드를 한번 설명해봐요."**

> [StudyLogQueryRepository 설명] 먼저 동적 조건을 헬퍼 메서드로 분리합니다. `titleContains()`는 title이 비어있지 않으면 `contains()` 조건을 반환하고 그렇지 않으면 null을 반환합니다. 그 후 `search()` 메서드에서 `where()` 호출할 때 이 헬퍼 메서드들을 전달하면, null인 조건들은 무시되고 null이 아닌 조건들만 적용돩니다. 이렇게 하면 조건이 몇 개든 쉽게 추가/제거할 수 있습니다.

### 🟡 개념 질문

**Q1: "페이징할 때 offset과 limit 외에 다른 방법이 있나요?"**

> offset 기반 페이징은 큰 번호의 페이지(예: 1000번째)에서 성능이 떨어집니다. 커서 기반 페이징(Keyset Pagination)을 사용하면, 마지막 ID를 기준으로 "그 다음부터"를 조회하므로 훨씬 빠릅니다. 예를 들어 `where(qStudyLog.id.gt(lastId))`로 구현할 수 있습니다.

**Q2: "GROUP BY는 QueryDSL에서 어떻게 작성하나요?"**

> `groupBy()`와 `having()`을 사용합니다. 예를 들어 카테고리별 로그 개수를 구하려면:
> ```java
> .select(..., qStudyLog.id.count())
> .from(qStudyLog)
> .groupBy(qStudyLog.category)
> .having(qStudyLog.id.count().gt(5))
> ```
> 이렇게 작성하면 `GROUP BY category HAVING COUNT(*) > 5`가 됩니다.

---

> 🎯 **다음 주제**: 26번 "Spring vs Hibernate 총정리" — 데이터베이스 Phase를 마무리하면서 **계층별 책임**, **readOnly 최적화 차이**, **실무 패턴**을 정리한다.

