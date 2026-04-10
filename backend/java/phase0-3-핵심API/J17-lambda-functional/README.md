# J17. 람다와 함수형 인터페이스 — "코드를 값처럼 전달하기"

> **키워드**: `람다` `@FunctionalInterface` `Predicate` `Function` `Consumer` `Supplier` `메서드 레퍼런스`

---

## 핵심만 한 문장

**람다는 "메서드를 한 줄로 줄인 것"이고, 함수형 인터페이스는 "메서드 1개짜리 인터페이스"다. 스트림(J18)의 기반이 된다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~2장 (람다 기본, 함수형 인터페이스 4대장) | 스트림/Spring에서 매일 씀 |
| 🟡 이해 | 3장 (메서드 레퍼런스) | 코드 더 간결하게 |
| 🟢 참고 | 4장 (커스텀 함수형 인터페이스) | 특수 상황 |

---

## 1장. 람다 기본 🔴

### 비유

```
기존 = 편지 쓰기 (봉투에 넣고 주소 쓰고...)
람다 = 문자 메시지 (내용만 보내기)
```

### 코드

```java
// ❌ 기존 방식 (익명 클래스)
Comparator<String> comp = new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.length() - b.length();
    }
};

// ✅ 람다 (한 줄!)
Comparator<String> comp = (a, b) -> a.length() - b.length();

// 사용
List<String> names = new ArrayList<>(List.of("홍길동", "김", "이길동동"));
names.sort(comp);  // ["김", "홍길동", "이길동동"]
```

### 람다 문법

```java
// 기본 형태
(매개변수) -> { 본문 }

// 본문이 한 줄이면 {} 생략 + return 생략
(a, b) -> a + b

// 매개변수가 1개면 () 생략
name -> name.length()

// 매개변수 없으면
() -> System.out.println("hello")

// 예시
Runnable r = () -> System.out.println("실행!");
r.run();  // "실행!"
```

---

## 2장. 함수형 인터페이스 4대장 🔴

### 4가지만 기억하면 된다!

```java
import java.util.function.*;

// 1️⃣ Predicate<T> — 조건 판단 (T → boolean)
Predicate<String> isLong = s -> s.length() > 3;
isLong.test("hello");  // true
isLong.test("hi");     // false

// 2️⃣ Function<T, R> — 변환 (T → R)
Function<String, Integer> toLength = s -> s.length();
toLength.apply("hello");  // 5

// 3️⃣ Consumer<T> — 소비 (T → void)
Consumer<String> printer = s -> System.out.println(s);
printer.accept("hello");  // "hello" 출력

// 4️⃣ Supplier<T> — 공급 (() → T)
Supplier<String> greeting = () -> "안녕하세요!";
greeting.get();  // "안녕하세요!"
```

### 정리표

| 인터페이스 | 메서드 | 입력 | 출력 | 비유 |
|-----------|--------|------|------|------|
| `Predicate<T>` | `test(T)` | T | boolean | 필터 (맞아? 틀려?) |
| `Function<T,R>` | `apply(T)` | T | R | 변환기 (A → B) |
| `Consumer<T>` | `accept(T)` | T | void | 먹기만 (출력, 저장) |
| `Supplier<T>` | `get()` | 없음 | T | 만들기만 (생성) |

### Spring에서 쓰이는 곳

```java
// Predicate: Stream의 filter
students.stream().filter(s -> s.getScore() > 80).collect(...);

// Function: Stream의 map
students.stream().map(s -> s.getName()).collect(...);

// Consumer: forEach
students.forEach(s -> System.out.println(s.getName()));

// Supplier: orElseGet
Optional<Student> s = repository.findById(id);
s.orElseGet(() -> new Student("기본"));
```

---

## 3장. 메서드 레퍼런스 🟡

```java
// 람다
Function<String, Integer> f1 = s -> s.length();

// 메서드 레퍼런스 (더 간결!)
Function<String, Integer> f2 = String::length;

// 4가지 형태
// 1. 정적 메서드
Function<String, Integer> f = Integer::parseInt;

// 2. 인스턴스 메서드 (특정 객체)
Consumer<String> c = System.out::println;

// 3. 인스턴스 메서드 (임의 객체)
Function<String, String> f = String::toUpperCase;

// 4. 생성자
Supplier<ArrayList> s = ArrayList::new;
```

---

## 면접 대비

### 🔴 필수

**Q: "람다가 뭔가요?"**

> 익명 함수를 간결하게 표현하는 문법입니다. 함수형 인터페이스(메서드 1개짜리 인터페이스)의 구현을 한 줄로 작성할 수 있습니다. Java 8에서 도입되었고, Stream API와 함께 사용합니다.

**Q: "함수형 인터페이스란?"**

> 추상 메서드가 정확히 1개인 인터페이스입니다. `@FunctionalInterface`로 선언하며, 대표적으로 `Predicate`(판단), `Function`(변환), `Consumer`(소비), `Supplier`(생성)가 있습니다.

---

## 정리

```
🎯 람다 = 메서드를 한 줄로
  (매개변수) -> 결과

🎯 함수형 인터페이스 4대장:
  Predicate<T>   → 판단 (filter)
  Function<T,R>  → 변환 (map)
  Consumer<T>    → 소비 (forEach)
  Supplier<T>    → 생성 (orElseGet)
```

---

> 🎯 **다음 주제**: J18 "스트림 API" — 람다를 활용해서 컬렉션을 함수형으로 처리!

