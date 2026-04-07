# 23. Spring Data JPA

> 오늘의 목표: 기본 CRUD를 넘어서, 쿼리 메서드, `@Query`, 페이징, Projection까지 실무에서 자주 쓰는 Spring Data JPA 기능을 익힌다.

---

## 오늘 끝나면 되는 것

- `JpaRepository`가 제공하는 기본 기능을 설명할 수 있다.
- 쿼리 메서드를 직접 만들 수 있다.
- `@Query`를 언제 쓰는지 이해한다.
- `Page`, `Slice`, `Pageable` 차이를 설명할 수 있다.
- Projection과 Cursor 페이징의 감각을 잡는다.

---

## 머릿속 그림

Spring Data JPA는 JPA를 더 편하게 쓰게 해주는 계층입니다.

```text
Repository 인터페이스 선언
 -> 스프링이 구현체 생성
 -> 이름/어노테이션 기반 쿼리 실행
```

즉, 반복적인 Repository 구현 코드를 많이 줄여줍니다.

---

## `JpaRepository`가 주는 기본 기능

```java
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {
}
```

이 한 줄만으로도:

- `save`
- `findById`
- `findAll`
- `delete`
- `count`

등이 바로 생깁니다.

---

## 쿼리 메서드

메서드 이름을 분석해 조건 쿼리를 만듭니다.

```java
List<StudyLog> findByCategory(Category category);

List<StudyLog> findByTitleContaining(String keyword);

List<StudyLog> findByCategoryAndStudyDateBetween(
        Category category,
        LocalDate start,
        LocalDate end
);
```

이 방식은 단순 조회에서는 아주 강력합니다.

---

## 언제 `@Query`를 쓰나

메서드 이름이 너무 길어지거나,
집계/복잡한 조건이 필요할 때 사용합니다.

```java
@Query("""
    select s
    from StudyLog s
    where s.category = :category
      and s.title like concat('%', :keyword, '%')
""")
List<StudyLog> search(@Param("category") Category category,
                      @Param("keyword") String keyword);
```

JPQL은 테이블명이 아니라 엔티티명과 필드명을 씁니다.

---

## Pageable과 Page

데이터가 많아지면 전부 다 가져오면 안 됩니다.

```java
Page<StudyLog> findByCategory(Category category, Pageable pageable);
```

호출:

```java
PageRequest.of(0, 10, Sort.by("studyDate").descending())
```

### 차이 감각

- `Page`: 전체 개수까지 포함
- `Slice`: 다음 페이지 존재 여부 정도만

`Page`는 편하지만 count 쿼리가 추가될 수 있습니다.

---

## Projection

엔티티 전체가 아니라 필요한 필드만 조회하고 싶을 때 사용합니다.

예:

```java
public interface StudyLogSummary {
    String getTitle();
    Category getCategory();
}
```

```java
List<StudyLogSummary> findByCategory(Category category);
```

장점:

- 필요한 필드만 조회
- 응답 최적화 가능

---

## Specification과 Cursor는 어디서 쓰나

- `Specification`: 동적 조건이 조금 더 복잡할 때
- Cursor 페이징: 대량 데이터에서 offset 기반보다 더 효율적으로 다음 목록을 가져올 때

지금 단계에서는:

> "Pageable만이 페이징의 전부는 아니다"

정도 감각을 잡아두면 충분합니다.

---

## 실무 감각

- 단순 조건: 쿼리 메서드
- 조금 복잡: `@Query`
- 복잡한 동적 검색: QueryDSL 쪽이 더 나은 경우 많음

즉, Spring Data JPA 하나로 모든 문제를 다 푼다고 생각하면 안 됩니다.

---

## 자주 하는 실수

- 메서드 이름이 너무 길어지는데도 계속 쿼리 메서드로 버티는 것
- JPQL에서 테이블명/컬럼명을 써버리는 것
- `Page`가 항상 좋은 줄 알고 count 비용을 안 보는 것
- Projection을 DTO와 같은 개념으로 섞어 이해하는 것

---

## 면접 체크

1. `JpaRepository`는 어떤 역할을 하나요?
2. 쿼리 메서드는 어떻게 동작하나요?
3. `@Query`는 언제 사용하나요?
4. `Page`와 `Slice`는 무엇이 다른가요?
5. Projection은 왜 사용하나요?

---

## 직접 해보기

1. `findByCategory`, `findByTitleContaining` 메서드를 만들어보세요.
2. `@Query`로 카테고리 + 키워드 검색 메서드를 작성해보세요.
3. `Pageable`을 받아서 최신순 목록 조회를 구현해보세요.
4. Projection으로 목록용 간단 조회를 만들어보세요.

---

## 다음 주제 연결

이제 단일 엔티티 조회는 꽤 익숙해졌습니다. 다음에는 연관 관계와 N+1 문제를 보며, JPA에서 가장 자주 부딪히는 성능 이슈를 다룹니다.
