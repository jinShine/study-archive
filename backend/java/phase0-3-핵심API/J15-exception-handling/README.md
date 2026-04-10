# J15. 예외 처리 — "에러가 나도 죽지 않기"

> **키워드**: `try-catch-finally` `throws` `체크 예외` `언체크 예외` `커스텀 예외` `예외 전환`

---

## 핵심만 한 문장

**체크 예외는 "컴파일러가 강제로 처리하게 하는 것", 언체크 예외(RuntimeException)는 "선택적으로 처리하는 것"이다. 실무에서는 언체크 예외를 주로 쓴다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~3장 (try-catch, 체크/언체크, 커스텀 예외) | Spring 예외 처리의 기반 |
| 🟡 이해 | 4장 (예외 전환, 예외 계층) | 실무 패턴 |
| 🟢 참고 | 5장 (try-with-resources) | J20 I/O에서 다시 |

---

## 1장. try-catch 기본 🔴

### 비유

```
try   = "이 코드를 실행해볼게"
catch = "에러 나면 이렇게 대응할게"
finally = "에러 나든 안 나든 이건 반드시 실행"
```

### 코드

```java
try {
    int result = 10 / 0;  // ArithmeticException 발생!
    System.out.println(result);  // 이 줄은 실행 안 됨
} catch (ArithmeticException e) {
    System.out.println("0으로 나눌 수 없음: " + e.getMessage());
} finally {
    System.out.println("항상 실행됨");
}
// 출력:
// 0으로 나눌 수 없음: / by zero
// 항상 실행됨
```

### 여러 예외 잡기

```java
try {
    String s = null;
    s.length();  // NullPointerException!
} catch (NullPointerException e) {
    System.out.println("null이네!");
} catch (Exception e) {
    System.out.println("그 외 에러: " + e.getMessage());
}

// Java 7+ 멀티 캐치
try {
    // ...
} catch (NullPointerException | IllegalArgumentException e) {
    System.out.println("둘 중 하나: " + e.getMessage());
}
```

---

## 2장. 체크 예외 vs 언체크 예외 🔴

### 예외 계층 구조

```
Throwable
├── Error (시스템 에러 → 처리 불가)
│   └── OutOfMemoryError, StackOverflowError
└── Exception
    ├── 체크 예외 (컴파일러가 강제)
    │   └── IOException, SQLException
    └── RuntimeException (언체크 예외)
        └── NullPointerException, IllegalArgumentException
```

### 차이

| 구분 | 체크 예외 | 언체크 예외 (RuntimeException) |
|------|----------|-------------------------------|
| 처리 강제 | ✅ 컴파일러가 강제 | ❌ 선택 |
| try-catch/throws | 반드시 필요 | 안 써도 됨 |
| 예시 | IOException, SQLException | NPE, IllegalArgumentException |
| **실무 사용** | 거의 안 씀 | **주로 사용** ✅ |

```java
// 체크 예외: 반드시 처리해야 함
public void readFile() throws IOException {  // throws 필수!
    FileReader reader = new FileReader("test.txt");
}

// 언체크 예외: 처리 안 해도 컴파일 됨
public void validate(String name) {
    if (name == null) {
        throw new IllegalArgumentException("이름은 필수!");
    }
}
```

---

## 3장. 커스텀 예외 🔴

### Spring에서 쓰는 패턴

```java
// 커스텀 예외 (RuntimeException 상속!)
public class StudentNotFoundException extends RuntimeException {
    
    public StudentNotFoundException(Long id) {
        super("학생을 찾을 수 없습니다: id=" + id);
    }
}

// 사용
public Student findById(Long id) {
    return repository.findById(id)
        .orElseThrow(() -> new StudentNotFoundException(id));
}
```

**💡 Spring Phase 1-06 "예외 처리 전략"에서 @RestControllerAdvice와 함께 사용!**

---

## 4장. 예외 전환 🟡

```java
// 저수준 예외 → 의미 있는 비즈니스 예외로 변환
public Student findById(Long id) {
    try {
        return repository.findById(id);
    } catch (SQLException e) {
        // 기술적 예외 → 비즈니스 예외로 전환
        throw new StudentNotFoundException(id);
    }
}
```

---

## 5장. try-with-resources 🟢

```java
// ❌ 기존 (finally에서 close)
FileReader reader = null;
try {
    reader = new FileReader("test.txt");
    // 파일 읽기
} catch (IOException e) {
    e.printStackTrace();
} finally {
    if (reader != null) reader.close();  // 번거로움
}

// ✅ try-with-resources (자동 close!)
try (FileReader reader = new FileReader("test.txt")) {
    // 파일 읽기
} catch (IOException e) {
    e.printStackTrace();
}
// → reader가 자동으로 close됨!
```

---

## 면접 대비

### 🔴 필수

**Q: "체크 예외와 언체크 예외의 차이는?"**

> 체크 예외는 Exception을 상속하며 컴파일러가 try-catch나 throws를 강제합니다. 언체크 예외는 RuntimeException을 상속하며 처리가 선택적입니다. 실무에서는 비즈니스 로직의 예외는 RuntimeException을 상속한 커스텀 예외를 주로 사용합니다.

---

## 정리

```
🎯 try-catch: 에러를 잡아서 대응
🎯 체크 예외: 컴파일러가 강제 (IOException)
🎯 언체크 예외: 선택적 (RuntimeException) ← 실무 주력!
🎯 커스텀 예외: RuntimeException 상속 → Spring에서 @ExceptionHandler
🎯 try-with-resources: AutoCloseable 자동 close
```

---

> 🎯 **다음 주제**: J16 "제네릭" — `List<String>`에서 `<String>`이 뭔지!

