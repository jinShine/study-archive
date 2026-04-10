# J23. 디자인 패턴 — 생성 — "객체를 잘 만드는 방법"

> **키워드**: `싱글톤` `빌더` `팩토리 메서드` `정적 팩토리 메서드`

---

## 핵심만 한 문장

**"객체를 어떻게 만들 것인가?"에 대한 검증된 해결책. 싱글톤(1개만), 빌더(복잡한 생성), 정적 팩토리(이름 있는 생성자)**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~2장 (싱글톤, 빌더) | Spring Bean이 싱글톤, Lombok @Builder |
| 🔴 필수 | 3장 (정적 팩토리 메서드) | Effective Java #1 |
| 🟡 이해 | 4장 (팩토리 메서드 패턴) | Spring 내부 구조 |

---

## 1장. 싱글톤 — 앱에서 딱 1개만 🔴

### 비유

```
싱글톤 = 대통령 (한 나라에 1명만)
       = Spring Bean (기본이 싱글톤!)
```

### 구현

```java
// 가장 안전한 방식: Enum 싱글톤
public enum DatabaseConnection {
    INSTANCE;
    
    public void query(String sql) {
        System.out.println("실행: " + sql);
    }
}

// 사용
DatabaseConnection.INSTANCE.query("SELECT * FROM users");

// 💡 Spring에서는 직접 싱글톤 안 만들어도 됨!
// @Component, @Service → 자동으로 싱글톤 Bean!
```

---

## 2장. 빌더 패턴 🔴

### 문제: 생성자 매개변수가 많을 때

```java
// ❌ 매개변수가 뭐가 뭔지 모름
Student s = new Student("홍길동", 25, "hong@email.com", 3, "컴공", true, "서울");
//                       이름?  나이? 이메일?          뭐?  뭐?    뭐?  뭐?

// ✅ 빌더 패턴 (Lombok @Builder)
Student s = Student.builder()
    .name("홍길동")
    .age(25)
    .email("hong@email.com")
    .grade(3)
    .major("컴공")
    .active(true)
    .city("서울")
    .build();
// 어떤 필드에 어떤 값인지 명확!
```

### Lombok으로 자동 생성

```java
@Builder
@Data
public class Student {
    private String name;
    private int age;
    private String email;
    // → Student.builder().name("홍길동").age(25).build(); 자동!
}
```

---

## 3장. 정적 팩토리 메서드 — Effective Java #1 🔴

### 생성자 대신 이름 있는 메서드로 객체 생성

```java
public class Money {
    private final int amount;
    private final String currency;
    
    // private 생성자
    private Money(int amount, String currency) {
        this.amount = amount;
        this.currency = currency;
    }
    
    // 정적 팩토리 메서드 (이름이 있어서 의도가 명확!)
    public static Money won(int amount) {
        return new Money(amount, "KRW");
    }
    
    public static Money dollar(int amount) {
        return new Money(amount, "USD");
    }
    
    public static Money zero() {
        return new Money(0, "KRW");
    }
}

// 사용
Money price = Money.won(10000);     // 의도 명확!
Money tip = Money.dollar(5);        // 의도 명확!
Money empty = Money.zero();         // 의도 명확!
```

### 장점

```
1. 이름이 있다 (of, from, valueOf, create...)
2. 호출할 때마다 새 객체를 만들지 않아도 됨 (캐싱)
3. 반환 타입의 하위 타입 반환 가능

Java 표준 라이브러리 예:
  List.of(1, 2, 3)           ← 정적 팩토리
  Optional.of(value)         ← 정적 팩토리
  Integer.valueOf(42)        ← 정적 팩토리 (캐싱)
```

---

## 4장. 팩토리 메서드 패턴 🟡

```java
// 인터페이스
public interface Notification {
    void send(String message);
}

// 구현체
public class EmailNotification implements Notification { ... }
public class SmsNotification implements Notification { ... }

// 팩토리
public class NotificationFactory {
    public static Notification create(String type) {
        return switch (type) {
            case "EMAIL" -> new EmailNotification();
            case "SMS" -> new SmsNotification();
            default -> throw new IllegalArgumentException("Unknown: " + type);
        };
    }
}

// 사용 (구현체를 직접 몰라도 됨!)
Notification noti = NotificationFactory.create("EMAIL");
noti.send("안녕!");
```

---

## 면접 대비

### 🔴 필수

**Q: "싱글톤 패턴이 뭔가요?"**

> 앱 전체에서 인스턴스가 딱 1개만 존재하도록 보장하는 패턴입니다. Spring Bean의 기본 스코프가 싱글톤이라서, Spring에서는 직접 구현할 필요 없이 @Component로 등록하면 됩니다.

**Q: "정적 팩토리 메서드의 장점은?"**

> 첫째, 이름이 있어서 의도가 명확합니다. 둘째, 호출할 때마다 새 객체를 안 만들어도 됩니다(캐싱). 셋째, 반환 타입의 하위 타입을 반환할 수 있습니다. `List.of()`, `Optional.of()` 등이 대표적입니다.

---

## 정리

```
🎯 싱글톤: 1개만 (Spring Bean 기본!)
🎯 빌더: 복잡한 생성을 깔끔하게 (Lombok @Builder)
🎯 정적 팩토리: 이름 있는 생성자 (Money.won(10000))
🎯 팩토리 메서드: 구현체를 몰라도 생성 가능
```

---

> 🎯 **다음 주제**: J24 "디자인 패턴 — 구조/행위" — 어댑터, 전략, 템플릿 메서드와 Spring 연결!

