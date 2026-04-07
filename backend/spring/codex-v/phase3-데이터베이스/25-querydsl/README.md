# 25. QueryDSL

> 오늘의 목표: 조건이 늘어나는 검색 API를 메서드 이름 지옥 없이, 타입 안전한 Java 코드로 조립하는 방법을 익힌다.

---

## 오늘 끝나면 되는 것

- QueryDSL을 왜 쓰는지 설명할 수 있다.
- Q 클래스가 무엇인지 이해할 수 있다.
- `BooleanExpression`으로 동적 조건을 조립할 수 있다.
- Projection, 페이징, 집계 쿼리의 기본 감각을 잡는다.

---

## 머릿속 그림

Spring Data JPA 쿼리 메서드는 단순할 때 좋습니다.

하지만 조건이 늘어나면 금방 이런 상황이 옵니다.

```java
findByCategoryAndTitleContainingAndStudyDateBetweenAndStatus(...)
```

이럴 때 QueryDSL은 조건을 함수처럼 조립하게 해줍니다.

---

## QueryDSL을 왜 쓰나

장점:

- 동적 조건 작성이 쉬움
- 문자열 JPQL보다 타입 안전함
- IDE 자동완성 도움 큼

즉:

> "검색 조건이 선택적으로 붙는 API"에서 특히 강하다.

---

## Q 클래스란

엔티티 기반으로 생성되는 메타 클래스입니다.

예:

- 엔티티: `StudyLog`
- Q 클래스: `QStudyLog`

이 클래스 덕분에 필드명을 문자열로 쓰지 않고 코드로 다룰 수 있습니다.

```java
QStudyLog studyLog = QStudyLog.studyLog;
studyLog.title
studyLog.category
```

---

## 기본 형태

```java
List<StudyLog> result = queryFactory
        .selectFrom(studyLog)
        .where(studyLog.category.eq(Category.SPRING))
        .fetch();
```

읽는 법:

- 어떤 엔티티를 조회할지
- 어떤 조건을 걸지
- 결과를 어떻게 가져올지

를 Java 코드처럼 쓴다고 생각하면 됩니다.

---

## `BooleanExpression`으로 동적 조건 만들기

```java
private BooleanExpression titleContains(String keyword) {
    return keyword == null || keyword.isBlank()
            ? null
            : studyLog.title.contains(keyword);
}

private BooleanExpression categoryEq(Category category) {
    return category == null ? null : studyLog.category.eq(category);
}
```

사용:

```java
List<StudyLog> result = queryFactory
        .selectFrom(studyLog)
        .where(
                titleContains(keyword),
                categoryEq(category)
        )
        .fetch();
```

QueryDSL은 `null` 조건을 무시할 수 있어서 동적 검색에 편합니다.

---

## Projection

엔티티 전체 대신 원하는 필드만 DTO로 바로 뽑을 수 있습니다.

```java
List<StudyLogSummaryResponse> result = queryFactory
        .select(Projections.constructor(
                StudyLogSummaryResponse.class,
                studyLog.id,
                studyLog.title,
                studyLog.category
        ))
        .from(studyLog)
        .fetch();
```

이 패턴은 목록 조회에서 자주 씁니다.

---

## 페이징

```java
List<StudyLog> content = queryFactory
        .selectFrom(studyLog)
        .offset(pageable.getOffset())
        .limit(pageable.getPageSize())
        .fetch();
```

count 쿼리는 별도로 관리해야 할 수 있습니다.

그래서 QueryDSL 페이징은 편하긴 하지만,
자동으로 모든 걸 해결해주지는 않는다는 점도 기억하세요.

---

## 집계도 가능하다

```java
List<Tuple> result = queryFactory
        .select(studyLog.category, studyLog.count())
        .from(studyLog)
        .groupBy(studyLog.category)
        .fetch();
```

즉, QueryDSL은 검색만이 아니라 집계 쿼리에도 사용할 수 있습니다.

---

## 자주 하는 실수

- QueryDSL이 모든 조회의 기본이라고 생각하는 것
- 단순 조회까지 전부 QueryDSL로 과하게 작성하는 것
- DTO Projection과 엔티티 조회를 구분하지 않는 것
- build 설정이 안 되어 Q 클래스가 안 생기는데 코드만 보고 헤매는 것

---

## 면접 체크

1. QueryDSL은 왜 사용하나요?
2. Q 클래스는 무엇인가요?
3. `BooleanExpression`은 어떤 상황에서 유용한가요?
4. QueryDSL과 쿼리 메서드는 언제 각각 적합한가요?

---

## 직접 해보기

1. 키워드와 카테고리를 선택적으로 받는 검색 API를 QueryDSL로 만들어보세요.
2. `BooleanExpression`을 메서드로 분리해보세요.
3. 목록 조회를 Projection DTO로 바로 받아보세요.
4. 카테고리별 개수 집계 쿼리를 작성해보세요.

---

## 다음 주제 연결

이제 Phase 3 핵심 기술을 거의 다 배웠습니다. 마지막으로 Spring이 하는 일과 Hibernate가 하는 일을 한 번에 정리하면서 전체 그림을 연결합니다.
