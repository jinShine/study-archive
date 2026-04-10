# J26. Effective Java 핵심 정리 — "Java를 잘 쓰는 법"

> **키워드**: `정적 팩토리 메서드` `불변 객체` `상속보다 컴포지션` `try-with-resources` `방어적 복사` `equals 규약`

---

## 핵심만 한 문장

**Effective Java는 "Java를 어떻게 잘 쓸까?"의 바이블이다. 여기서 핵심 원칙 10개만 뽑아서 정리한다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~5 (정적 팩토리, 불변, try-with-resources, equals, 컴포지션) | 코드 품질의 핵심 |
| 🟡 이해 | 6~8 (방어적 복사, 인터페이스 설계, 열거 타입) | 중급 이상 |
| 🟢 참고 | 9~10 (예외, 최적화) | 심화 |

---

## 1. 정적 팩토리 메서드를 써라 (Item 1) 🔴

```java
// ❌ 생성자 (의도가 불분명)
Money m = new Money(10000, "KRW");

// ✅ 정적 팩토리 (의도가 명확!)
Money m = Money.won(10000);
Money m = Money.zero();
Money m = Money.from(dto);

// 관례: of, from, valueOf, create, getInstance
List<String> list = List.of("a", "b");
Optional<String> opt = Optional.of("hello");
```

**→ J23에서 자세히 배움!**

---

## 2. 불변 객체를 사용하라 (Item 17) 🔴

```java
// ✅ 불변 객체 규칙:
// 1. 모든 필드 private final
// 2. setter 없음
// 3. 변경 시 새 객체 반환
// 4. class를 final로 (또는 record 사용)

public record Money(int amount, String currency) {
    public Money add(Money other) {
        return new Money(this.amount + other.amount, this.currency);
    }
}
```

**→ J10에서 자세히 배움!**

---

## 3. try-with-resources를 써라 (Item 9) 🔴

```java
// ❌ try-finally (장황하고 실수하기 쉬움)
BufferedReader br = null;
try {
    br = new BufferedReader(new FileReader("file.txt"));
    return br.readLine();
} finally {
    if (br != null) br.close();
}

// ✅ try-with-resources (간결하고 안전!)
try (BufferedReader br = new BufferedReader(new FileReader("file.txt"))) {
    return br.readLine();
}
```

---

## 4. equals 재정의 시 hashCode도 재정의하라 (Item 11) 🔴

```java
// equals만 재정의하면 → HashMap에서 못 찾음!
// 반드시 hashCode도 함께 재정의!

@Override
public boolean equals(Object o) { ... }

@Override
public int hashCode() {
    return Objects.hash(id);  // equals에서 비교하는 필드로!
}

// 💡 Lombok @EqualsAndHashCode가 자동 생성!
```

**→ J11에서 자세히 배움!**

---

## 5. 상속보다 컴포지션을 사용하라 (Item 18) 🔴

```java
// ❌ 상속 (부모가 바뀌면 자식도 영향)
public class InstrumentedHashSet<E> extends HashSet<E> {
    private int addCount = 0;
    
    @Override
    public boolean add(E e) {
        addCount++;
        return super.add(e);  // 부모의 내부 구현에 의존!
    }
}

// ✅ 컴포지션 (감싸기)
public class InstrumentedSet<E> {
    private final Set<E> set;  // ← 상속 대신 필드로 가지기!
    private int addCount = 0;
    
    public InstrumentedSet(Set<E> set) {
        this.set = set;
    }
    
    public boolean add(E e) {
        addCount++;
        return set.add(e);  // 위임!
    }
}
```

**Spring에서:**
```java
// Spring은 상속 대신 "인터페이스 + DI"를 사용!
// 이것이 컴포지션의 실전 형태
@Service
public class StudentService {
    private final StudentRepository repository;  // ← 컴포지션!
}
```

---

## 6. 방어적 복사를 고려하라 (Item 50) 🟡

```java
// 외부에서 전달받은 가변 객체는 복사해서 저장!
public class Period {
    private final Date start;
    
    public Period(Date start) {
        this.start = new Date(start.getTime());  // 복사!
    }
    
    public Date getStart() {
        return new Date(start.getTime());  // 복사해서 반환!
    }
}
```

**→ J10에서 자세히 배움!**

---

## 7. 인터페이스는 타입 정의에만 써라 (Item 22) 🟡

```java
// ❌ 상수 인터페이스 (안티패턴)
public interface Constants {
    int MAX_SIZE = 100;
}

// ✅ 상수는 클래스에
public class Constants {
    public static final int MAX_SIZE = 100;
    private Constants() {}  // 인스턴스 생성 방지
}

// ✅ 또는 Enum
public enum Size { SMALL, MEDIUM, LARGE }
```

---

## 8. Enum을 활용하라 (Item 34) 🟡

```java
// ❌ int 상수
public static final int SEASON_SPRING = 0;
public static final int SEASON_SUMMER = 1;

// ✅ Enum
public enum Season {
    SPRING("봄"), SUMMER("여름"), FALL("가을"), WINTER("겨울");
    
    private final String korean;
    Season(String korean) { this.korean = korean; }
}
```

**→ J12에서 자세히 배움!**

---

## 9. 예외는 예외 상황에만 써라 (Item 69) 🟢

```java
// ❌ 예외를 흐름 제어에 사용
try {
    int i = 0;
    while (true) arr[i++].doSomething();  // 배열 끝나면 예외로 탈출
} catch (ArrayIndexOutOfBoundsException e) {}

// ✅ 정상적인 흐름 제어
for (int i = 0; i < arr.length; i++) {
    arr[i].doSomething();
}
```

---

## 10. 최적화는 하지 마라 (Item 67) 🟢

```
"빠른 프로그램보다 좋은 프로그램을 작성하라"

1. 먼저 올바르게 동작하는 코드를 작성한다
2. 성능 문제가 실제로 발생하면 프로파일링한다
3. 프로파일링 결과를 보고 병목을 최적화한다

"추측하지 말고, 측정하라!"
```

---

## 면접 대비

### 🔴 필수

**Q: "Effective Java에서 기억나는 원칙이 있나요?"**

> 정적 팩토리 메서드 사용(Item 1), 불변 객체 권장(Item 17), 상속보다 컴포지션(Item 18), equals 재정의 시 hashCode도 함께(Item 11), try-with-resources 사용(Item 9) 등이 있습니다. 특히 Spring에서 인터페이스 + DI를 사용하는 것이 컴포지션 원칙의 실전 적용입니다.

---

## 정리

```
🎯 Effective Java 핵심 10가지:

🔴 필수:
  1. 정적 팩토리 메서드 > 생성자
  2. 불변 객체 사용
  3. try-with-resources
  4. equals + hashCode 함께 재정의
  5. 상속보다 컴포지션 (Spring DI!)

🟡 이해:
  6. 방어적 복사
  7. 인터페이스 = 타입 정의만
  8. Enum 활용

🟢 참고:
  9. 예외는 예외 상황에만
  10. 최적화는 나중에
```

---

> 🎯 **Phase 0 완료!** 이제 Spring Boot 커리큘럼 (Phase 1~6)으로 넘어갈 준비가 되었다!
> → [Spring Boot 커리큘럼](../../spring/CURRICULUM.md)

