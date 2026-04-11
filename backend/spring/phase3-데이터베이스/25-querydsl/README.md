# 25. QueryDSL — "검색 조건 만들기"를 쉽게

> **키워드**: `QueryDSL` `동적 조건` `Q클래스` `BooleanExpression` `타입 안전`

---

## 핵심만 한 문장

**검색 조건이 자꾸 추가되는 상황에서, 메서드명 긴 스파게티가 아니라 Java 코드처럼 "조건 조립"하는 것**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~3장 (환경설정, Q클래스, 동적 검색) | 실제 프로젝트에서 매일 쓰는 것 |
| 🟡 이해 | 4장 (응용 패턴) | 상황에 따라 필요 |
| 🟢 참고 | 5장 (GROUP BY 등) | 필요할 때 찾으면 됨 |

---

## 1장. 문제: 조건이 계속 늘어난다 🔴

### 상황: 검색 API

사용자가 검색할 때 조건을 선택적으로 줄 수 있음:

```
GET /api/logs?title=Spring       (title만)
GET /api/logs?title=Spring&category=SPRING    (title + category)
GET /api/logs?category=SPRING&status=DONE     (category + status)
...조건의 모든 조합이 가능
```

### Spring Data JPA로 하면?

```java
// 😫 메서드가 계속 늘어난다
List<StudyLog> findByTitle(String title);
List<StudyLog> findByCategory(String category);
List<StudyLog> findByTitleAndCategory(String title, String category);
List<StudyLog> findByTitleAndCategoryAndStatus(String title, String category, String status);
List<StudyLog> findByTitleAndCategoryAndStatusAndCreatedAtBetween(...);
// 이건 유지보수 악몽이다!
```

### QueryDSL로 하면?

```java
// ✅ 조건을 "조립"한다 (조건이 몇 개든 상관없음)
List<StudyLog> logs = queryFactory
    .selectFrom(log)
    .where(
        titleContains("Spring"),        // 조건 1
        categoryEq("SPRING"),          // 조건 2
        statusEq("DONE")               // 조건 3
        // 필요하면 여기에 조건 추가해도 됨
    )
    .fetch();
```

**차이점:**
- Spring Data JPA: 조건 조합마다 메서드 추가 필요
- QueryDSL: 조건을 함수로 분리하고 where()에 "조합"

---

## 2장. 환경설정: 내 프로젝트에 QueryDSL 추가하기 🔴

### Step 1. build.gradle 수정

현재 파일을 열고, 아래 내용을 **복사-붙여넣기**하세요.

**⚠️ 주의: 기존 내용 위에 추가, 덮어씌우지 마세요**

```gradle
// build.gradle 최상단 (plugins 블록)

plugins {
    id 'java'
    id 'org.springframework.boot' version '3.3.0'
    id 'io.spring.dependency-management' version '1.1.4'
    id "com.ewerk.gradle.plugins.querydsl" version "1.0.10"  // ← 이 줄 추가
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'
java {
    sourceCompatibility = '17'
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    
    // QueryDSL 의존성 (복사-붙여넣기)
    implementation 'com.querydsl:querydsl-jpa:5.0.0:jakarta'
    annotationProcessor 'com.querydsl:querydsl-apt:5.0.0:jakarta'
    annotationProcessor 'jakarta.persistence:jakarta.persistence-api:3.1.0'
    annotationProcessor 'jakarta.annotation:jakarta.annotation-api:2.1.1'
    
    runtimeOnly 'com.mysql:mysql-connector-j'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

// QueryDSL 설정 (복사-붙여넣기)
def querydslDir = "$buildDir/generated/querydsl"

querydsl {
    jpa = true
    querydslSourcesDir = querydslDir
}

sourceSets {
    main.java.srcDir querydslDir
}

compileQuerydsl {
    options.annotationProcessorPath = configurations.annotationProcessor
}
```

**👉 실행:**

```bash
cd 프로젝트폴더
gradle build

# 빌드가 성공하면, 이 폴더가 생성됨:
# build/generated/querydsl/
```

### Step 2. QuerydslConfig 클래스 생성

`src/main/java/com/example/config/` 폴더에 `QuerydslConfig.java` 파일을 만들고 복사-붙여넣기:

```java
package com.example.config;

import jakarta.persistence.EntityManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.querydsl.jpa.impl.JPAQueryFactory;

@Configuration
public class QuerydslConfig {
    
    @Bean
    public JPAQueryFactory jpaQueryFactory(EntityManager em) {
        return new JPAQueryFactory(em);
    }
}
```

**무슨 뜻인가?**
- `JPAQueryFactory`: 쿼리를 작성하는 공장
- `EntityManager`: Spring이 자동으로 주입 (손댈 필요 없음)
- `@Bean`: Spring이 이 객체를 자동으로 만들어서 필요한 곳에 주입

### Step 3. 프로젝트 빌드

```bash
gradle clean build

# 빌드가 끝나면, 터미널에 이렇게 나타남
# BUILD SUCCESSFUL
```

**성공 확인:**

```bash
ls -la build/generated/querydsl/

# 이런 파일들이 보여야 함:
# QStudyLog.java
# QCategory.java
# ... (Entity마다 Q클래스가 생성됨)
```

이제 **Q클래스가 자동으로 생성되었다!**

---

## 3장. 동적 검색: 한 가지 기능 깊게 파기 🔴

여기서 "동적 검색"이라는 가장 중요한 개념을 배운다.

### 목표: 이 API를 만들기

```
POST /api/study-logs/search
{
    "title": "Spring",
    "category": "SPRING",
    "status": ""    // 비어있을 수도, 없을 수도 있음
}

응답:
[
    { id: 1, title: "Spring DI", category: "SPRING", ... },
    { id: 2, title: "Spring AOP", category: "SPRING", ... }
]
```

**핵심:** 조건이 비어있으면 "그 조건은 무시하고" 나머지로만 검색

### Step 1. Entity 확인

`StudyLog` Entity가 이미 있다고 가정:

```java
@Entity
@Table(name = "study_log")
@Data
@NoArgsConstructor
public class StudyLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String category;
    private String status;     // "DONE", "PENDING", "IN_PROGRESS"
    private LocalDateTime createdAt;
}
```

### Step 2. QueryRepository 만들기

`src/main/java/com/example/repository/` 폴더에 `StudyLogQueryRepository.java` 생성:

**⚠️ 중요: 아래 코드를 **전부** 복사해야 합니다. 메인 메서드와 헬퍼 메서드가 같은 클래스에 있습니다.**

```java
package com.example.repository;

import static com.example.entity.QStudyLog.*;  // ← 중요! Q클래스를 정적 import
// 이 import 덕분에 아래에서 'studyLog'를 바로 쓸 수 있음

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.example.entity.StudyLog;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class StudyLogQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 핵심 메서드: 동적 검색
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    public List<StudyLog> search(String title, String category, String status) {
        return queryFactory
            .selectFrom(studyLog)  // ← QStudyLog 안의 static 객체 (정적 import로 사용 가능)
            .where(
                titleContains(title),      // 조건 1: null이면 무시됨
                categoryEq(category),      // 조건 2: null이면 무시됨
                statusEq(status)           // 조건 3: null이면 무시됨
            )
            .fetch();
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⬇️ 헬퍼 메서드들 (search() 메서드 아래에 추가)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    private BooleanExpression titleContains(String title) {
        // title이 공백이 아니면 조건을 반환, 아니면 null을 반환
        return StringUtils.hasText(title) 
            ? studyLog.title.contains(title) 
            : null;
    }
    
    private BooleanExpression categoryEq(String category) {
        return StringUtils.hasText(category) 
            ? studyLog.category.eq(category) 
            : null;
    }
    
    private BooleanExpression statusEq(String status) {
        return StringUtils.hasText(status) 
            ? studyLog.status.eq(status) 
            : null;
    }
}
```

**복사 체크리스트:**

- ✅ import 문 (정적 import 포함)
- ✅ @Repository, @RequiredArgsConstructor
- ✅ JPAQueryFactory 필드
- ✅ search() 메서드
- ✅ titleContains() 메서드
- ✅ categoryEq() 메서드
- ✅ statusEq() 메서드

### Step 3. 동작 원리 추적 (중요!)

**예제 1: title="Spring", category="SPRING", status=""**

```
Step 1. 각 헬퍼 메서드 호출:
  titleContains("Spring")      → studyLog.title.contains("Spring")  ✅ 조건
  categoryEq("SPRING")         → studyLog.category.eq("SPRING")      ✅ 조건
  statusEq("")                 → null                                ❌ 무시됨

Step 2. where()에 조건들을 전달:
  .where(
    studyLog.title.contains("Spring"),   // 실행
    studyLog.category.eq("SPRING"),      // 실행
    null                                 // 자동 무시 (QueryDSL 기능!)
  )

Step 3. 생성되는 SQL:
  SELECT * FROM study_log 
  WHERE 
    title LIKE '%Spring%' 
    AND category = 'SPRING'
  
  ← status 조건이 없다!
```

**예제 2: title="", category="SPRING", status="DONE"**

```
Step 1. 각 헬퍼 메서드 호출:
  titleContains("")            → null                                ❌ 무시됨
  categoryEq("SPRING")         → studyLog.category.eq("SPRING")      ✅ 조건
  statusEq("DONE")             → studyLog.status.eq("DONE")          ✅ 조건

Step 2. where()에 조건들을 전달:
  .where(
    null,                                  // 자동 무시
    studyLog.category.eq("SPRING"),        // 실행
    studyLog.status.eq("DONE")             // 실행
  )

Step 3. 생성되는 SQL:
  SELECT * FROM study_log 
  WHERE 
    category = 'SPRING' 
    AND status = 'DONE'
  
  ← title 조건이 없다!
```

**💡 핵심:** "조건이 null이면 where()가 자동으로 무시한다"는 게 동적 쿼리의 비결이다!

### Step 4. Service + Controller 만들기

`StudyLogService.java`:

```java
package com.example.service;

import com.example.entity.StudyLog;
import com.example.repository.StudyLogQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudyLogService {
    
    private final StudyLogQueryRepository queryRepository;
    
    public List<StudyLog> search(String title, String category, String status) {
        return queryRepository.search(title, category, status);
    }
}
```

`StudyLogController.java`:

```java
package com.example.controller;

import com.example.entity.StudyLog;
import com.example.service.StudyLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-logs")
@RequiredArgsConstructor
public class StudyLogController {
    
    private final StudyLogService service;
    
    @PostMapping("/search")
    public List<StudyLog> search(
        @RequestParam(required = false) String title,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String status
    ) {
        return service.search(title, category, status);
    }
}
```

### Step 5. 테스트해보기

`StudyLogQueryRepositoryTest.java`:

```java
package com.example.repository;

import com.example.entity.StudyLog;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@Import({QuerydslConfig.class})  // ← QuerydslConfig를 테스트에서도 로드
class StudyLogQueryRepositoryTest {
    
    @Autowired
    private StudyLogRepository jpaRepository;  // 기본 CRUD용
    
    @Autowired
    private StudyLogQueryRepository queryRepository;  // 검색용
    
    @BeforeEach
    void setUp() {
        // 테스트 데이터 생성
        jpaRepository.save(new StudyLog("Spring DI", "SPRING", "DONE"));
        jpaRepository.save(new StudyLog("Spring AOP", "SPRING", "DONE"));
        jpaRepository.save(new StudyLog("Spring Boot", "SPRING", "PENDING"));
        jpaRepository.save(new StudyLog("JPA 기초", "JPA", "DONE"));
    }
    
    @Test
    void 검색_title만_입력() {
        // When: title만 검색
        List<StudyLog> results = queryRepository.search("Spring", null, null);
        
        // Then: Spring 포함된 것 3개 반환
        assertThat(results)
            .hasSize(3)
            .extracting("title")
            .contains("Spring DI", "Spring AOP", "Spring Boot");
    }
    
    @Test
    void 검색_category와_status_조합() {
        // When: category = SPRING AND status = DONE
        List<StudyLog> results = queryRepository.search(null, "SPRING", "DONE");
        
        // Then: 2개만 반환
        assertThat(results)
            .hasSize(2)
            .extracting("title")
            .contains("Spring DI", "Spring AOP");
    }
    
    @Test
    void 검색_모든_조건_입력() {
        // When: title, category, status 모두 입력
        List<StudyLog> results = queryRepository.search("Spring DI", "SPRING", "DONE");
        
        // Then: 정확하게 1개
        assertThat(results)
            .hasSize(1)
            .extracting("title")
            .contains("Spring DI");
    }
    
    @Test
    void 검색_조건_없음() {
        // When: 모든 조건 null
        List<StudyLog> results = queryRepository.search(null, null, null);
        
        // Then: 모든 로그 4개 반환
        assertThat(results).hasSize(4);
    }
}
```

**테스트 실행:**

```bash
gradle test --tests StudyLogQueryRepositoryTest

# 결과:
# StudyLogQueryRepositoryTest.검색_title만_입력 ... PASSED
# StudyLogQueryRepositoryTest.검색_category와_status_조합 ... PASSED
# StudyLogQueryRepositoryTest.검색_모든_조건_입력 ... PASSED
# StudyLogQueryRepositoryTest.검색_조건_없음 ... PASSED
```

**모든 테스트 통과!** ✅

---

## 4장. WHERE 조건 패턴들 🟡

### contains / startsWith / endsWith

```java
private BooleanExpression titleContains(String title) {
    return StringUtils.hasText(title) 
        ? studyLog.title.contains(title)        // LIKE '%title%'
        : null;
}

private BooleanExpression titleStartsWith(String title) {
    return StringUtils.hasText(title) 
        ? studyLog.title.startsWith(title)      // LIKE 'title%'
        : null;
}

private BooleanExpression titleEndsWith(String title) {
    return StringUtils.hasText(title) 
        ? studyLog.title.endsWith(title)        // LIKE '%title'
        : null;
}
```

### 비교 연산자

```java
private BooleanExpression createdAfter(LocalDateTime date) {
    return date != null 
        ? studyLog.createdAt.after(date)        // createdAt > date
        : null;
}

private BooleanExpression createdBetween(LocalDateTime start, LocalDateTime end) {
    return start != null && end != null
        ? studyLog.createdAt.between(start, end)  // createdAt BETWEEN
        : null;
}

private BooleanExpression idIn(List<Long> ids) {
    return ids != null && !ids.isEmpty()
        ? studyLog.id.in(ids)                   // id IN (1, 2, 3)
        : null;
}
```

### NULL 체크

```java
private BooleanExpression deletedIsNull() {
    return studyLog.deletedAt.isNull();         // deletedAt IS NULL
}

private BooleanExpression deletedIsNotNull() {
    return studyLog.deletedAt.isNotNull();      // deletedAt IS NOT NULL
}
```

---

## 5장. 응용: 페이징 추가하기 🟡

### 페이징이 필요한 이유

데이터가 1000개 있을 때, 한 번에 모두 조회하면 메모리가 터진다.
→ "페이지 1 (1~20개)", "페이지 2 (21~40개)" 이렇게 나눠서 조회

### 페이징 코드

```java
@Repository
@RequiredArgsConstructor
public class StudyLogQueryRepository {
    
    private final JPAQueryFactory queryFactory;
    
    // 페이징 추가
    public List<StudyLog> search(
        String title, 
        String category, 
        String status,
        int page,        // 0 = 첫 페이지
        int size         // 페이지당 개수 (보통 20)
    ) {
        return queryFactory
            .selectFrom(studyLog)
            .where(
                titleContains(title),
                categoryEq(category),
                statusEq(status)
            )
            .orderBy(studyLog.createdAt.desc())     // 최신 순으로 정렬
            .offset((long) page * size)             // 건너뛸 개수
            .limit(size)                            // 가져올 개수
            .fetch();
    }
    
    // 전체 개수도 함께 반환 (프론트에서 "총 10페이지" 표시 용)
    public long searchCount(String title, String category, String status) {
        return queryFactory
            .select(studyLog.count())
            .from(studyLog)
            .where(
                titleContains(title),
                categoryEq(category),
                statusEq(status)
            )
            .fetchOne();
    }
    
    // ... 헬퍼 메서드들은 동일
}
```

### 테스트

```java
@Test
void 페이징_첫_페이지() {
    // page=0, size=2 → 0~1번째 데이터
    List<StudyLog> page1 = queryRepository.search(
        null, null, null, 
        0,    // 첫 페이지
        2     // 페이지당 2개
    );
    
    assertThat(page1).hasSize(2);
}

@Test
void 페이징_두_번째_페이지() {
    // page=1, size=2 → 2~3번째 데이터
    List<StudyLog> page2 = queryRepository.search(
        null, null, null, 
        1,    // 두 번째 페이지
        2     // 페이지당 2개
    );
    
    assertThat(page2).hasSize(2);
}
```

---

## 6장. 주의: 자주 하는 실수 🔴

### ❌ 실수 1: 조건 메서드에서 예외 던지기

```java
// 나쁜 예
private BooleanExpression statusEq(String status) {
    if (status == null) {
        throw new IllegalArgumentException("status is required");  // ❌
    }
    return studyLog.status.eq(status);
}

// 좋은 예
private BooleanExpression statusEq(String status) {
    return StringUtils.hasText(status) 
        ? studyLog.status.eq(status)
        : null;  // ✅ null을 반환하면 where()에서 무시됨
}
```

### ❌ 실수 2: .fetch() vs .fetchOne() vs .fetchFirst() 혼동

```java
// .fetch()         → List 반환 (0개~N개)
List<StudyLog> list = queryFactory.selectFrom(studyLog).fetch();

// .fetchOne()      → 객체 1개 반환 (없으면 null, 2개 이상이면 예외)
StudyLog single = queryFactory.selectFrom(studyLog).fetchOne();

// .fetchFirst()    → 처음 1개만 (Optional)
Optional<StudyLog> first = queryFactory.selectFrom(studyLog).fetchFirst();
```

**규칙:** 보통은 `.fetch()` 쓰면 된다!

---

## 면접 대비

### 🔴 필수

**Q: "QueryDSL이 Spring Data JPA보다 뭐가 좋아요?"**

> 동적 검색이 쉽습니다. Spring Data JPA는 조건 조합마다 메서드를 만들어야 하는데, QueryDSL은 조건을 함수로 분리하고 `where()`에 조합하기만 하면 됩니다. 또한 컴파일 타임에 오타를 잡아줍니다.

**Q: "BooleanExpression이 뭔가요?"**

> 쿼리의 WHERE 조건 하나를 Java 객체로 만든 것입니다. `studyLog.title.contains("Spring")`이 BooleanExpression이고, 이걸 여러 개 모아서 `where()`에 넣으면 AND로 연결됩니다. null이 들어오면 자동으로 무시돼서 동적 쿼리를 구현할 수 있습니다.

**Q: "Q클래스가 뭔가요?"**

> 쿼리를 안전하게 작성하기 위한 메타데이터입니다. Entity를 정의하면 컴파일 때 자동으로 생성되는데, 이를 통해 `studyLog.title`, `studyLog.category` 같이 자동완성이 되고 오타를 컴파일 시점에 발견할 수 있습니다.

**Q: "따라쳐보기 코드를 설명해봐요."**

> QueryRepository에서 `titleContains()` 같은 헬퍼 메서드를 만들어서 각 조건을 분리합니다. 각 메서드는 입력이 비어있으면 null, 아니면 WHERE 조건을 반환합니다. 그 다음 search() 메서드에서 이 헬퍼들을 where()에 전달하면, null인 조건은 자동으로 무시되고 null이 아닌 조건들만 SQL에 포함됩니다. 이게 동적 쿼리입니다.

### 🟡 개념

**Q: "offset 페이징이 느린 이유는?"**

> `offset(1000).limit(20)`이면 "처음 1000개를 건너뛰고 다음 20개"를 가져오는데, DB가 내부적으로 1020개를 모두 읽어야 합니다. 페이지 번호가 커질수록 점점 느려집니다. 해결책은 "마지막 ID를 기준으로 그다음부터" 조회하는 커서 기반 페이징입니다.

---

## 정리: 이것만 기억하기

```
🎯 QueryDSL = "조건 조립 도구"

Step 1. 조건을 함수로 분리
  private BooleanExpression titleContains(String title)

Step 2. null은 "조건 없음" (자동 무시됨)
  return title != null ? condition : null

Step 3. where()에 조건들을 전달
  .where(condition1, condition2, condition3)
  → 실행될 조건만 AND로 연결됨

Step 4. 조건이 몇 개든 상관없음
  → 유지보수 쉬움!
```

---

## 다음 주제

**26번 "Spring vs Hibernate 총정리"** — 지금까지 배운 JPA/QueryDSL이 내부적으로 어떻게 동작하는지, 그리고 Spring과 Hibernate의 역할이 뭔지 정리합니다.

