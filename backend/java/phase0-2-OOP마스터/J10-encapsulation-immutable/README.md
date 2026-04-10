# J10. 캡슐화와 불변 객체 — "데이터를 안전하게 보호하기"

> **키워드**: `캡슐화` `불변 객체` `final` `방어적 복사` `record` `VO` `Entity`

---

## 핵심만 한 문장

**캡슐화는 "내부를 숨기고 필요한 것만 공개", 불변 객체는 "한 번 만들면 절대 안 바뀜" — 이 둘이 안전한 코드의 핵심이다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~2장 (캡슐화, 불변 객체) | 코드 품질의 핵심 |
| 🟡 이해 | 3장 (record, VO vs Entity) | Spring DTO 설계에 직결 |
| 🟢 참고 | 4장 (방어적 복사) | 심화 |

---

## 1장. 캡슐화 — getter/setter를 넘어서 🔴

### 나쁜 캡슐화 vs 좋은 캡슐화

```java
// ❌ 나쁜 예: setter로 아무 값이나 넣을 수 있음
public class Account {
    private int balance;
    
    public void setBalance(int balance) {
        this.balance = balance;  // 음수도 가능? 위험!
    }
}

account.setBalance(-1000);  // 잔고가 -1000? 😱

// ✅ 좋은 예: 의미 있는 메서드로 제어
public class Account {
    private int balance;
    
    public void deposit(int amount) {
        if (amount <= 0) throw new IllegalArgumentException("0보다 커야 함");
        this.balance += amount;
    }
    
    public void withdraw(int amount) {
        if (amount > balance) throw new IllegalArgumentException("잔고 부족");
        this.balance -= amount;
    }
    
    public int getBalance() { return balance; }  // 조회만 허용
    // setBalance()는 없음! (직접 변경 불가)
}
```

---

## 2장. 불변 객체 🔴

### 비유

```
가변 객체 = 화이트보드 (지우고 다시 쓸 수 있음)
불변 객체 = 돌에 새긴 글씨 (한 번 새기면 변경 불가)
```

### 불변 객체 만드는 규칙

```java
public final class Money {           // 1. final class (상속 금지)
    private final int amount;         // 2. final 필드 (변경 금지)
    private final String currency;
    
    public Money(int amount, String currency) {  // 3. 생성자로만 값 설정
        this.amount = amount;
        this.currency = currency;
    }
    
    // 4. getter만 제공 (setter 없음!)
    public int getAmount() { return amount; }
    public String getCurrency() { return currency; }
    
    // 5. 변경이 필요하면 새 객체를 반환
    public Money add(Money other) {
        return new Money(this.amount + other.amount, this.currency);
    }
}

Money m1 = new Money(1000, "KRW");
Money m2 = m1.add(new Money(500, "KRW"));  // 새 객체!
// m1은 여전히 1000원 (불변!)
// m2는 1500원 (새로 생성)
```

### 왜 불변이 좋은가?

```
✅ 스레드 안전 (동시에 접근해도 값이 안 바뀜)
✅ 예측 가능 (한 번 만들면 절대 안 바뀜)
✅ HashMap 키로 안전하게 사용 가능
✅ 버그 추적 쉬움 ("누가 이 값을 바꿨지?" 가 없음)
```

---

## 3장. record (Java 16+)와 VO vs Entity 🟡

### record = 불변 DTO를 한 줄로

```java
// ❌ 기존 DTO (20줄)
public class StudentDto {
    private final String name;
    private final int age;
    
    public StudentDto(String name, int age) {
        this.name = name; this.age = age;
    }
    public String getName() { return name; }
    public int getAge() { return age; }
    // equals, hashCode, toString...
}

// ✅ record (1줄!)
public record StudentDto(String name, int age) {}
// → 생성자, getter, equals, hashCode, toString 전부 자동!

StudentDto dto = new StudentDto("홍길동", 25);
dto.name();  // "홍길동" (getter는 name() 형태)
dto.age();   // 25
```

### VO vs Entity

| 구분 | VO (Value Object) | Entity |
|------|-------------------|--------|
| 정체성 | 값으로 비교 (100원 = 100원) | ID로 비교 (학생 #1 ≠ 학생 #2) |
| 불변? | **불변** (값이 같으면 같은 것) | 가변 (상태가 변할 수 있음) |
| equals | 모든 필드 비교 | ID만 비교 |
| 예시 | Money, Address | Student, Order |

**💡 Spring에서: DTO는 VO에 가깝고(불변 추천), Entity는 JPA가 관리하는 가변 객체다**

---

## 4장. 방어적 복사 🟢

```java
// ❌ 위험: 외부에서 내부 컬렉션을 수정할 수 있음
public class Team {
    private final List<String> members;
    
    public Team(List<String> members) {
        this.members = members;  // ← 원본 참조를 그대로 저장!
    }
    
    public List<String> getMembers() {
        return members;  // ← 원본을 그대로 반환!
    }
}

List<String> list = new ArrayList<>(List.of("홍길동"));
Team team = new Team(list);
list.add("해커");          // 외부에서 내부 데이터 변경됨! 😱

// ✅ 안전: 방어적 복사
public class Team {
    private final List<String> members;
    
    public Team(List<String> members) {
        this.members = new ArrayList<>(members);  // 복사해서 저장!
    }
    
    public List<String> getMembers() {
        return Collections.unmodifiableList(members);  // 읽기전용 반환!
    }
}
```

---

## 면접 대비

### 🔴 필수

**Q: "불변 객체가 뭔가요? 왜 좋은가요?"**

> 한 번 생성하면 내부 상태를 변경할 수 없는 객체입니다. final 필드, setter 없음, 변경 시 새 객체 반환이 핵심입니다. 스레드 안전하고, 예측 가능하며, HashMap 키로 안전하게 사용할 수 있어서 좋습니다. String, Integer 등이 대표적인 불변 객체입니다.

---

## 정리

```
🎯 캡슐화: setter 대신 의미 있는 메서드 (deposit, withdraw)
🎯 불변 객체: final 필드 + setter 없음 + 새 객체 반환
🎯 record: 불변 DTO를 한 줄로 (Java 16+)
🎯 VO = 값으로 비교 (불변), Entity = ID로 비교 (가변)
```

---

> 🎯 **다음 주제**: J11 "Object 클래스와 핵심 메서드" — equals, hashCode, toString의 규약을 배운다!

