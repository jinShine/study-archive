# J09. 추상 클래스와 인터페이스 — "규격을 정하고 구현은 자유롭게"

> **키워드**: `abstract` `interface` `default 메서드` `다중 구현` `추상 vs 인터페이스`

---

## 핵심만 한 문장

**추상 클래스는 "미완성 설계도"이고, 인터페이스는 "규격(스펙)"이다. Spring DI가 인터페이스 기반으로 동작한다!**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~3장 (추상 클래스, 인터페이스, 둘의 차이) | Spring 이해의 기반 |
| 🟡 이해 | 4장 (default 메서드) | Java 8+ 기능 |
| 🟢 참고 | 5장 (선택 기준 정리) | 실무 판단 |

---

## 1장. 추상 클래스 🔴

### 비유

```
추상 클래스 = 미완성 설계도

"자동차를 만들어"라는 설계도에
  - 바퀴 4개 (완성)
  - 엔진 (미완성 → 가솔린? 전기? 자식이 결정!)
```

### 코드

```java
// 추상 클래스 (직접 new 불가!)
public abstract class Animal {
    String name;
    
    // 일반 메서드 (완성된 것)
    void breathe() {
        System.out.println(name + "이(가) 숨을 쉼");
    }
    
    // 추상 메서드 (미완성 → 자식이 반드시 구현!)
    abstract void sound();
}

// 자식 클래스 (추상 메서드를 구현)
public class Dog extends Animal {
    @Override
    void sound() { System.out.println("멍멍!"); }
}

public class Cat extends Animal {
    @Override
    void sound() { System.out.println("야옹!"); }
}

// Animal a = new Animal();  // ❌ 추상 클래스는 new 불가!
Animal a = new Dog();        // ✅ 자식으로만 생성
a.sound();                   // "멍멍!"
a.breathe();                 // "Dog이(가) 숨을 쉼"
```

---

## 2장. 인터페이스 🔴

### 비유

```
인터페이스 = USB 규격

"데이터를 전송할 수 있어야 한다" (규격만 정의)
→ 삼성 USB, 샌디스크 USB (각자 다르게 구현)
→ 어떤 USB든 규격만 맞으면 꽂아서 쓸 수 있다!
```

### 코드

```java
// 인터페이스 (규격 정의)
public interface Movable {
    void move();  // 구현 없음 (규격만!)
}

public interface Attackable {
    void attack();
}

// 다중 구현 가능! (상속은 1개만, 인터페이스는 여러 개)
public class Warrior implements Movable, Attackable {
    @Override
    public void move() { System.out.println("달려간다!"); }
    
    @Override
    public void attack() { System.out.println("검으로 공격!"); }
}

public class Archer implements Movable, Attackable {
    @Override
    public void move() { System.out.println("뛰어간다!"); }
    
    @Override
    public void attack() { System.out.println("활로 공격!"); }
}

// 다형성! 인터페이스 타입으로 사용
Movable m = new Warrior();
m.move();  // "달려간다!"

Attackable a = new Archer();
a.attack(); // "활로 공격!"
```

### Spring에서의 인터페이스

```java
// 인터페이스
public interface StudentRepository {
    Student findById(Long id);
    void save(Student student);
}

// 구현체 1: 메모리 저장
@Repository
public class MemoryStudentRepository implements StudentRepository { ... }

// 구현체 2: JPA 저장
@Repository
public class JpaStudentRepository implements StudentRepository { ... }

// Service는 인터페이스에만 의존 → 구현체 교체 자유!
@Service
public class StudentService {
    private final StudentRepository repository;  // ← 인터페이스!
}
```

---

## 3장. 추상 클래스 vs 인터페이스 🔴

| 비교 | 추상 클래스 | 인터페이스 |
|------|-----------|-----------|
| 키워드 | `abstract class` | `interface` |
| 상속/구현 | `extends` (1개만) | `implements` (여러 개) |
| 필드 | 가능 (인스턴스 변수) | 상수만 (`static final`) |
| 생성자 | 가능 | 불가능 |
| 일반 메서드 | 가능 | `default` 메서드로 가능 (Java 8+) |
| 용도 | "~이다" (is-a) | "~할 수 있다" (can-do) |
| 예시 | Animal (Dog is Animal) | Movable (Dog can Move) |

---

## 4장. default 메서드 (Java 8+) 🟡

```java
public interface Loggable {
    // 추상 메서드 (구현 필수)
    String getName();
    
    // default 메서드 (구현 안 해도 됨, 기본 구현 제공)
    default void log(String message) {
        System.out.println("[" + getName() + "] " + message);
    }
}

public class Student implements Loggable {
    @Override
    public String getName() { return "홍길동"; }
    // log()는 구현 안 해도 기본 동작!
}

new Student().log("안녕!");  // "[홍길동] 안녕!"
```

---

## 5장. 선택 기준 🟢

```
"이미 공통 코드가 있고, 일부만 다르게?"
  → 추상 클래스 (공통 코드 + 추상 메서드)

"규격만 정의하고, 구현은 완전히 자유?"
  → 인터페이스

"다중 구현이 필요?"
  → 인터페이스 (Java는 다중 상속 불가)

"Spring에서 DI 쓸 때?"
  → 인터페이스 (거의 항상)
```

---

## 면접 대비

### 🔴 필수

**Q: "추상 클래스와 인터페이스의 차이는?"**

> 추상 클래스는 공통 코드를 가질 수 있고 단일 상속만 가능하며 "is-a" 관계를 표현합니다. 인터페이스는 규격(메서드 시그니처)만 정의하고 다중 구현이 가능하며 "can-do" 관계를 표현합니다. Spring에서는 DI를 위해 주로 인터페이스를 사용합니다.

---

## 정리

```
🎯 추상 클래스: 미완성 설계도 (공통 코드 + 추상 메서드)
🎯 인터페이스: 규격서 (메서드 시그니처만)
🎯 다중 구현: 인터페이스만 가능
🎯 Spring DI = 인터페이스 기반!
```

---

> 🎯 **다음 주제**: J10 "캡슐화와 불변 객체" — private + getter/setter를 넘어서, 진짜 캡슐화와 불변 객체!

