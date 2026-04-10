# J12. Enum과 중첩 클래스 — "상수를 안전하게, 클래스를 깔끔하게"

> **키워드**: `enum` `열거 타입` `필드/메서드 가진 enum` `static inner class` `익명 클래스`

---

## 핵심만 한 문장

**Enum은 "정해진 값 중 하나"를 안전하게 표현하는 타입이다. String 상수보다 훨씬 안전하고 Spring Entity에서 매일 쓴다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~2장 (Enum 기본, 필드/메서드 Enum) | Spring Entity @Enumerated에 필수 |
| 🟡 이해 | 3장 (static inner class) | DTO, Builder에서 사용 |
| 🟢 참고 | 4장 (익명 클래스) | 람다(J17) 이전 문법 |

---

## 1장. Enum 기본 🔴

### 왜 필요한가?

```java
// ❌ String 상수 (위험!)
public class Student {
    private String status;  // "ACTIVE", "INACTIVE", "GRADUATED"
}

student.setStatus("ACTVE");  // ← 오타! 컴파일에서 안 잡힘!
student.setStatus("삭제됨");   // ← 예상 못한 값! 런타임 에러!

// ✅ Enum (안전!)
public enum StudentStatus {
    ACTIVE, INACTIVE, GRADUATED
}

public class Student {
    private StudentStatus status;
}

student.setStatus(StudentStatus.ACTIVE);  // ✅ 안전!
student.setStatus("ACTVE");               // ❌ 컴파일 에러! (오타 잡힘)
```

### 기본 사용

```java
public enum Grade {
    A, B, C, D, F
}

// 사용
Grade grade = Grade.A;

// 비교 (== 사용 가능! equals 불필요)
if (grade == Grade.A) {
    System.out.println("우수");
}

// switch와 함께
switch (grade) {
    case A -> System.out.println("우수");
    case B -> System.out.println("양호");
    default -> System.out.println("기타");
}

// 문자열 변환
String s = grade.name();           // "A"
Grade g = Grade.valueOf("A");      // Grade.A
Grade[] all = Grade.values();      // [A, B, C, D, F]
```

---

## 2장. 필드/메서드가 있는 Enum 🔴

### 비유

```
단순 Enum    = 이름만 있는 명찰
필드 있는 Enum = 이름 + 부서 + 전화번호가 있는 사원증
```

### 코드

```java
public enum OrderStatus {
    PENDING("주문 대기", 1),
    CONFIRMED("주문 확인", 2),
    SHIPPING("배송 중", 3),
    DELIVERED("배송 완료", 4),
    CANCELLED("주문 취소", 0);
    
    private final String description;  // 설명
    private final int step;            // 단계
    
    // 생성자 (private만 가능!)
    OrderStatus(String description, int step) {
        this.description = description;
        this.step = step;
    }
    
    public String getDescription() { return description; }
    public int getStep() { return step; }
    
    // 메서드도 가능!
    public boolean isCompleted() {
        return this == DELIVERED;
    }
}

// 사용
OrderStatus status = OrderStatus.SHIPPING;
System.out.println(status.getDescription());  // "배송 중"
System.out.println(status.getStep());         // 3
System.out.println(status.isCompleted());     // false
```

### Spring Entity에서

```java
@Entity
public class Order {
    @Id
    private Long id;
    
    @Enumerated(EnumType.STRING)  // ← DB에 "PENDING" 문자열로 저장
    private OrderStatus status;
}
```

---

## 3장. static inner class 🟡

```java
// 외부 클래스
public class Student {
    private String name;
    
    // static 내부 클래스 (바깥 클래스의 인스턴스 없이 사용 가능)
    public static class Builder {
        private String name;
        
        public Builder name(String name) {
            this.name = name;
            return this;
        }
        
        public Student build() {
            Student s = new Student();
            s.name = this.name;
            return s;
        }
    }
}

// 사용
Student s = new Student.Builder()
    .name("홍길동")
    .build();
```

**💡 Lombok의 @Builder가 이 패턴을 자동 생성한다!**

---

## 4장. 익명 클래스 🟢

```java
// 인터페이스를 즉석에서 구현 (1회용)
Comparator<String> comparator = new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return a.length() - b.length();
    }
};

// Java 8+ 람다로 더 간결하게 (J17에서 배움)
Comparator<String> comparator = (a, b) -> a.length() - b.length();
```

---

## 면접 대비

### 🔴 필수

**Q: "Enum을 쓰는 이유는?"**

> String 상수는 오타를 컴파일에서 잡을 수 없고 예상 못한 값이 들어올 수 있지만, Enum은 정해진 값만 허용하므로 타입 안전합니다. 필드와 메서드도 가질 수 있어서 상태에 따른 로직도 Enum에 넣을 수 있습니다. JPA Entity에서 `@Enumerated`로 DB에 저장합니다.

---

## 정리

```
🎯 Enum = 정해진 값 중 하나 (타입 안전!)
🎯 String 상수 대신 Enum (오타 방지, 자동완성)
🎯 Enum에 필드/메서드 추가 가능
🎯 Spring Entity: @Enumerated(EnumType.STRING)
🎯 static inner class: Builder 패턴에 사용
```

---

> 🎯 **Phase 0-2 완료!** 다음은 Phase 0-3 "핵심 API" — 컬렉션, 예외, 제네릭, 람다, 스트림, Optional!

