# J18. 스트림 API — "컬렉션을 함수형으로 처리하기"

> **키워드**: `stream()` `filter` `map` `collect` `reduce` `flatMap` `중간 연산` `최종 연산`

---

## 핵심만 한 문장

**for문 대신 `.stream().filter().map().collect()`로 데이터를 변환/필터링한다. "무엇을 할지"만 선언하면 된다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~3장 (filter, map, collect) | 매일 쓰는 핵심 |
| 🟡 이해 | 4장 (reduce, flatMap, groupingBy) | 복잡한 처리 |
| 🟢 참고 | 5장 (병렬 스트림) | 성능 최적화 |

---

## 1장. for문 vs 스트림 🔴

```java
List<Student> students = List.of(
    new Student("홍길동", 85),
    new Student("김길동", 92),
    new Student("이길동", 70),
    new Student("박길동", 95)
);

// ❌ for문 (어떻게 할지 = 명령형)
List<String> result = new ArrayList<>();
for (Student s : students) {
    if (s.getScore() >= 80) {
        result.add(s.getName());
    }
}

// ✅ 스트림 (무엇을 할지 = 선언형)
List<String> result = students.stream()
    .filter(s -> s.getScore() >= 80)    // 80점 이상만
    .map(Student::getName)              // 이름만 추출
    .collect(Collectors.toList());      // 리스트로 변환

// 결과: ["홍길동", "김길동", "박길동"]
```

---

## 2장. 중간 연산 vs 최종 연산 🔴

```
stream()              ← 스트림 생성
  .filter(...)        ← 중간 연산 (게으른 실행)
  .map(...)           ← 중간 연산
  .sorted(...)        ← 중간 연산
  .collect(...)       ← 최종 연산 (여기서 실행!)
```

### 자주 쓰는 중간 연산

```java
List<Student> students = ...;

// filter: 조건에 맞는 것만
students.stream().filter(s -> s.getScore() >= 80)

// map: 변환
students.stream().map(Student::getName)         // Student → String
students.stream().map(s -> s.getScore() * 1.1)  // 점수 10% 가산

// sorted: 정렬
students.stream().sorted(Comparator.comparing(Student::getScore))

// distinct: 중복 제거
List.of(1, 2, 2, 3, 3).stream().distinct()  // [1, 2, 3]

// limit: 개수 제한
students.stream().limit(3)  // 처음 3개만

// peek: 디버깅 (값 확인)
students.stream()
    .peek(s -> System.out.println("처리 중: " + s.getName()))
    .filter(...)
```

### 자주 쓰는 최종 연산

```java
// collect: 결과를 컬렉션으로
List<String> names = stream.collect(Collectors.toList());
Set<String> nameSet = stream.collect(Collectors.toSet());

// toList() (Java 16+, 더 간결)
List<String> names = stream.toList();

// forEach: 각 요소에 대해 실행
stream.forEach(System.out::println);

// count: 개수
long count = stream.filter(s -> s.getScore() >= 80).count();

// findFirst: 첫 번째 요소
Optional<Student> first = stream.findFirst();

// anyMatch / allMatch / noneMatch: 조건 확인
boolean hasTop = stream.anyMatch(s -> s.getScore() >= 95);  // 95점 이상 있나?
```

---

## 3장. 실전 패턴 🔴

### 패턴 1: 필터 + 변환 + 수집

```java
// 80점 이상 학생의 이름 목록
List<String> topNames = students.stream()
    .filter(s -> s.getScore() >= 80)
    .map(Student::getName)
    .collect(Collectors.toList());
```

### 패턴 2: 최대/최소

```java
Optional<Student> top = students.stream()
    .max(Comparator.comparing(Student::getScore));
top.ifPresent(s -> System.out.println("1등: " + s.getName()));
```

### 패턴 3: 문자열 합치기

```java
String nameList = students.stream()
    .map(Student::getName)
    .collect(Collectors.joining(", "));
// "홍길동, 김길동, 이길동, 박길동"
```

---

## 4장. 심화 연산 🟡

### reduce: 누적 계산

```java
int totalScore = students.stream()
    .map(Student::getScore)
    .reduce(0, Integer::sum);  // 0 + 85 + 92 + 70 + 95 = 342
```

### groupingBy: 그룹핑

```java
Map<String, List<Student>> byGrade = students.stream()
    .collect(Collectors.groupingBy(Student::getGrade));
// { "A": [...], "B": [...] }
```

### flatMap: 중첩 컬렉션 평탄화

```java
List<List<String>> nested = List.of(
    List.of("a", "b"),
    List.of("c", "d")
);
List<String> flat = nested.stream()
    .flatMap(Collection::stream)
    .toList();
// ["a", "b", "c", "d"]
```

---

## 5장. 주의사항 🟢

```java
// ⚠️ 스트림은 1회용! 재사용 불가
Stream<Student> stream = students.stream();
stream.filter(...).collect(...);
stream.map(...).collect(...);  // ❌ IllegalStateException!

// ⚠️ 병렬 스트림은 주의
students.parallelStream()...  // 대용량에서만, 순서 보장 안 됨

// ⚠️ 부작용(side effect) 피하기
// ❌
List<String> result = new ArrayList<>();
stream.forEach(s -> result.add(s.getName()));  // 외부 상태 변경!

// ✅
List<String> result = stream.map(Student::getName).toList();
```

---

## 면접 대비

### 🔴 필수

**Q: "Stream API의 장점은?"**

> for문 대신 선언적으로 데이터를 처리할 수 있습니다. `filter`(필터링), `map`(변환), `collect`(수집) 체이닝으로 가독성이 좋고, 지연 평가로 필요한 만큼만 처리합니다. 병렬 처리도 `parallelStream()`으로 쉽게 전환 가능합니다.

---

## 정리

```
🎯 스트림 = for문의 함수형 대안

핵심 패턴:
  .stream()
  .filter(조건)      ← 걸러내기
  .map(변환)         ← 바꾸기
  .sorted(정렬)      ← 정렬
  .collect(수집)     ← 결과 만들기

최종 연산: collect, forEach, count, findFirst, anyMatch
주의: 1회용! 재사용 불가
```

---

> 🎯 **다음 주제**: J19 "Optional" — null 대신 Optional로 안전하게!

