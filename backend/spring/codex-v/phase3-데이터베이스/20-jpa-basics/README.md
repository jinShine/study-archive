# 20. JPA 기초

> 오늘의 목표: SQL 중심 사고에서 한 걸음 나아가, Java 객체와 테이블을 연결하는 ORM과 JPA의 기본 감각을 익힌다.

---

## 오늘 끝나면 되는 것

- ORM이 왜 필요한지 설명할 수 있다.
- JPA, Hibernate, Spring Data JPA 차이를 구분할 수 있다.
- `@Entity`, `@Id`, `@GeneratedValue`, `@Column`, `@Enumerated`를 사용할 수 있다.
- 가장 기본적인 JPA 프로젝트를 시작할 수 있다.

---

## 머릿속 그림

```text
Java 객체
  <-> ORM
  <-> DB 테이블
```

즉:

- 우리는 Java 객체를 다루고
- ORM이 SQL과 매핑을 도와줍니다

---

## 왜 ORM이 필요할까

SQL을 직접 쓰면 이런 코드가 자주 나옵니다.

```java
String sql = "select id, title, category from study_log where id = ?";
```

그리고 결과를 다시 객체로 매핑해야 합니다.

```java
StudyLog log = new StudyLog(
        rs.getLong("id"),
        rs.getString("title"),
        rs.getString("category")
);
```

처음엔 괜찮지만:

- SQL이 늘고
- 컬럼이 늘고
- 매핑 코드가 반복되면

피로도가 커집니다.

이 문제를 줄여주는 것이 ORM입니다.

---

## JPA, Hibernate, Spring Data JPA

- JPA: 표준 규약
- Hibernate: JPA 구현체
- Spring Data JPA: 더 편하게 쓰게 해주는 스프링 계층

비유하면:

- JPA: 규칙
- Hibernate: 실제 엔진
- Spring Data JPA: 사용하기 쉬운 도구 세트

---

## 패러다임 불일치 감각

객체 세계와 테이블 세계는 다르게 움직입니다.

- 객체는 참조로 연결됨
- DB는 FK와 JOIN으로 연결됨
- 객체는 상속이 쉬움
- 테이블은 상속 표현이 불편함

ORM은 이 차이를 메워주는 도구입니다.

---

## 기본 설정 예시

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/study_db
    username: root
    password: 1234

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
```

처음 학습할 때는 `show-sql`을 켜서 실제 SQL이 어떻게 나가는지 보는 것이 좋습니다.

---

## 가장 기본적인 Entity

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

    @Builder
    public StudyLog(String title, String content, Category category) {
        this.title = title;
        this.content = content;
        this.category = category;
    }
}
```

### 꼭 봐야 하는 어노테이션

- `@Entity`: 이 클래스는 JPA가 관리할 테이블 대상
- `@Table`: 테이블 이름 지정
- `@Id`: 기본키
- `@GeneratedValue`: PK 생성 전략
- `@Column`: 컬럼 옵션
- `@Enumerated(EnumType.STRING)`: enum을 문자열로 저장

---

## 왜 기본 생성자가 필요할까

JPA는 엔티티를 생성할 때 기본 생성자를 사용합니다.

그래서 보통 이렇게 둡니다.

```java
@NoArgsConstructor(access = AccessLevel.PROTECTED)
```

완전 공개는 막고, JPA는 사용할 수 있게 하는 패턴입니다.

---

## Repository 맛보기

```java
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {
}
```

이 한 줄만으로도 아래가 가능합니다.

- 저장
- 단건 조회
- 전체 조회
- 삭제

즉, JPA 학습의 시작점은 `Entity`와 `Repository`입니다.

---

## `ddl-auto`는 조심해서 보기

학습 단계:

- `create`: 실행 때마다 새로 생성
- `update`: 테이블 구조 반영

실무에서는 운영에 무심코 쓰면 위험합니다.

초급 단계에서는 "학습용 편의 기능" 정도로 이해하면 됩니다.

---

## 자주 하는 실수

- `@Entity`만 붙이고 기본 생성자를 안 두는 것
- enum을 기본 설정으로 저장해 순서값이 들어가는 것
- Entity에 `@Setter`를 남발하는 것
- JPA가 SQL을 안 쓴다고 오해하는 것

---

## 면접 체크

1. ORM은 왜 사용하나요?
2. JPA와 Hibernate는 어떤 관계인가요?
3. `@Entity`, `@Id`, `@GeneratedValue`는 각각 무엇을 하나요?
4. enum은 왜 `EnumType.STRING`으로 저장하는 경우가 많나요?

---

## 직접 해보기

1. `StudyLog` Entity를 직접 만들어보세요.
2. `Category` enum을 만들고 `EnumType.STRING`으로 저장해보세요.
3. `JpaRepository`를 상속한 Repository를 만들어 `save()`와 `findById()`를 호출해보세요.
4. 콘솔에 출력되는 SQL을 확인해보세요.

---

## 다음 주제 연결

이제 JPA를 "쓸 수는" 있습니다. 다음에는 JPA가 내부에서 왜 save 없이도 update가 되는지, 영속성 컨텍스트가 무엇인지 배웁니다.
