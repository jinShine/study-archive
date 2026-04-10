# J19. Optional — "null을 안전하게 다루기"

> **키워드**: `Optional` `of` `ofNullable` `empty` `orElse` `orElseGet` `map` `안티패턴`

---

## 핵심만 한 문장

**Optional은 "값이 있을 수도, 없을 수도 있다"를 표현하는 컨테이너다. null 대신 Optional을 쓰면 NPE를 방지할 수 있다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~2장 (왜 필요한가, 기본 사용) | JPA findById() 반환값! |
| 🔴 필수 | 3장 (안티패턴) | 잘못 쓰면 더 복잡해짐 |
| 🟡 이해 | 4장 (map/flatMap) | 체이닝 |

---

## 1장. 왜 필요한가? 🔴

```java
// ❌ null 반환 (NPE 위험!)
public Student findById(Long id) {
    return studentMap.get(id);  // 없으면 null!
}

Student s = findById(999L);
s.getName();  // ❌ NullPointerException!

// ✅ Optional 반환 (NPE 방지!)
public Optional<Student> findById(Long id) {
    return Optional.ofNullable(studentMap.get(id));
}

Optional<Student> s = findById(999L);
s.ifPresent(student -> System.out.println(student.getName()));  // ✅ 안전!
```

---

## 2장. 기본 사용 🔴

### 생성

```java
// 값이 반드시 있을 때
Optional<String> opt1 = Optional.of("hello");

// 값이 null일 수도 있을 때
Optional<String> opt2 = Optional.ofNullable(getName());  // null이면 empty

// 빈 Optional
Optional<String> opt3 = Optional.empty();
```

### 값 꺼내기

```java
Optional<Student> opt = repository.findById(1L);

// 1️⃣ isPresent + get (기본적이지만 불편)
if (opt.isPresent()) {
    Student s = opt.get();
}

// 2️⃣ orElse: 없으면 기본값
Student s = opt.orElse(new Student("기본"));

// 3️⃣ orElseGet: 없으면 생성 로직 실행 (지연 실행)
Student s = opt.orElseGet(() -> createDefault());

// 4️⃣ orElseThrow: 없으면 예외 던지기 ← 가장 많이 씀!
Student s = opt.orElseThrow(() -> new StudentNotFoundException(id));

// 5️⃣ ifPresent: 있을 때만 실행
opt.ifPresent(s -> System.out.println(s.getName()));
```

### ⚠️ orElse vs orElseGet

```java
// orElse: 값이 있어도 기본값 생성이 실행됨!
opt.orElse(heavyOperation());  // ← heavyOperation()이 항상 실행!

// orElseGet: 값이 없을 때만 실행됨
opt.orElseGet(() -> heavyOperation());  // ← 없을 때만 실행!

// 💡 비싼 연산이면 orElseGet, 단순 값이면 orElse
opt.orElse("기본값");                    // ✅ OK (단순 문자열)
opt.orElseGet(() -> db.findDefault());   // ✅ OK (DB 조회)
```

---

## 3장. 안티패턴 — 이렇게 쓰면 안 된다! 🔴

```java
// ❌ 안티패턴 1: Optional을 필드로 사용
public class Student {
    private Optional<String> email;  // ❌ 필드에 Optional 쓰면 안 됨!
    // Optional은 "반환값"에만 사용!
}

// ❌ 안티패턴 2: Optional.get() 직접 호출
Optional<Student> opt = repository.findById(id);
Student s = opt.get();  // ❌ 비어있으면 NoSuchElementException!

// ❌ 안티패턴 3: isPresent + get (if-null과 똑같음)
if (opt.isPresent()) {
    Student s = opt.get();
}
// 이럴 거면 그냥 null 체크와 뭐가 다르지?

// ✅ 올바른 사용
Student s = opt.orElseThrow(() -> new StudentNotFoundException(id));
```

### Optional 사용 규칙

```
✅ 메서드 반환값으로 사용
✅ orElseThrow / orElseGet / ifPresent 사용
❌ 필드로 사용하지 않기
❌ 매개변수로 사용하지 않기
❌ get() 직접 호출하지 않기
❌ isPresent() + get() 조합 하지 않기
```

---

## 4장. map / flatMap 🟡

```java
// map: Optional 안의 값을 변환
Optional<String> name = repository.findById(1L)
    .map(Student::getName);    // Student → String

// flatMap: Optional을 반환하는 경우
Optional<String> email = repository.findById(1L)
    .flatMap(Student::getEmail);  // Student.getEmail()이 Optional<String> 반환할 때

// 체이닝
String result = repository.findById(1L)
    .map(Student::getName)
    .map(String::toUpperCase)
    .orElse("UNKNOWN");
```

---

## 면접 대비

### 🔴 필수

**Q: "Optional을 쓰는 이유는?"**

> null 반환 대신 Optional을 사용하면 메서드 시그니처만으로 "값이 없을 수 있다"는 의도를 명확히 전달하고, `orElseThrow`, `ifPresent` 등으로 NPE를 방지할 수 있습니다. JPA의 `findById()`가 Optional을 반환하는 것이 대표적 예시입니다.

**Q: "orElse와 orElseGet의 차이는?"**

> `orElse`는 값이 있어도 기본값 표현식이 항상 실행되고, `orElseGet`은 값이 없을 때만 실행됩니다. DB 조회 같은 비용이 큰 연산은 `orElseGet`을 사용해야 합니다.

---

## 정리

```
🎯 Optional = "값이 있을 수도 없을 수도" (null 대체)

생성: Optional.ofNullable(value)
꺼내기:
  .orElseThrow(() -> new XxxException())  ← 가장 많이 씀!
  .orElseGet(() -> 기본값 생성)
  .ifPresent(value -> 처리)

안티패턴:
  ❌ 필드에 Optional
  ❌ .get() 직접 호출
  ❌ isPresent() + get()
```

---

> 🎯 **Phase 0-3 완료!** 다음은 Phase 0-4 "심화" — I/O, 동시성, 디자인 패턴, Effective Java!

