# J08. 상속과 다형성 — "코드를 물려받고 확장하기"

> **키워드**: `extends` `super` `오버라이딩` `업캐스팅` `다운캐스팅` `instanceof` `다형성`

---

## 핵심만 한 문장

**상속은 부모의 코드를 물려받는 것이고, 다형성은 "같은 메서드 호출인데 객체에 따라 다르게 동작"하는 것이다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~3장 (상속, 오버라이딩, 다형성) | OOP 핵심 + 면접 단골 |
| 🟡 이해 | 4장 (업/다운캐스팅, instanceof) | 실무에서 가끔 필요 |
| 🟢 참고 | 5장 (상속의 한계) | 왜 인터페이스를 쓰는지 (J09 연결) |

---

## 1장. 상속 🔴

### 비유

```
상속 = 부모가 자식에게 재산을 물려주는 것

부모 클래스: 기본 기능 (이름, 나이, 자기소개)
자식 클래스: 기본 기능 + 추가 기능 (학년, 전공)
```

### 코드

```java
// 부모 클래스
public class Person {
    String name;
    int age;
    
    void introduce() {
        System.out.println("이름: " + name + ", 나이: " + age);
    }
}

// 자식 클래스 (Person을 상속)
public class Student extends Person {
    int grade;  // 추가 필드
    
    void study() {
        System.out.println(name + "이(가) 공부 중...");  // 부모의 name 사용 가능!
    }
}

// 사용
Student s = new Student();
s.name = "홍길동";   // 부모에게 물려받은 필드
s.age = 25;          // 부모에게 물려받은 필드
s.grade = 3;         // 자식만의 필드
s.introduce();       // 부모에게 물려받은 메서드
s.study();           // 자식만의 메서드
```

### super = "부모 참조"

```java
public class Student extends Person {
    
    public Student(String name, int age, int grade) {
        super(name, age);  // 부모 생성자 호출 (반드시 첫 줄!)
        this.grade = grade;
    }
}
```

---

## 2장. 오버라이딩 — 부모 메서드를 재정의 🔴

```java
public class Person {
    void introduce() {
        System.out.println("사람입니다");
    }
}

public class Student extends Person {
    @Override  // ← "부모 메서드를 재정의한다" 표시 (안 써도 되지만 쓰는 게 규칙)
    void introduce() {
        System.out.println("학생입니다");  // 부모와 다르게 동작!
    }
}

Person p = new Person();
p.introduce();  // "사람입니다"

Student s = new Student();
s.introduce();  // "학생입니다" (오버라이딩된 버전!)
```

---

## 3장. 다형성 — OOP의 꽃 🔴

### 비유

```
다형성 = 리모컨 하나로 여러 TV를 조작

리모컨(부모 타입)은 같은데, 실제 TV(자식 객체)에 따라 다르게 동작!
```

### 코드

```java
public class Animal {
    void sound() {
        System.out.println("...");
    }
}

public class Dog extends Animal {
    @Override
    void sound() { System.out.println("멍멍!"); }
}

public class Cat extends Animal {
    @Override
    void sound() { System.out.println("야옹!"); }
}

// 다형성: 부모 타입으로 자식 객체를 담음!
Animal a1 = new Dog();
Animal a2 = new Cat();

a1.sound();  // "멍멍!" (Dog의 sound 실행)
a2.sound();  // "야옹!" (Cat의 sound 실행)

// 배열로 한 번에 관리 가능!
Animal[] animals = {new Dog(), new Cat(), new Dog()};
for (Animal a : animals) {
    a.sound();  // 각 객체에 맞는 메서드가 실행됨
}
```

**💡 Spring에서 다형성이 핵심:**
```java
// Repository 인터페이스로 선언하고
private final StudentRepository repository;

// 실제 구현체(JPA, JDBC 등)를 주입 → 다형성!
```

---

## 4장. 캐스팅과 instanceof 🟡

```java
// 업캐스팅 (자동): 자식 → 부모 타입
Animal a = new Dog();  // Dog → Animal (자동)

// 다운캐스팅 (강제): 부모 → 자식 타입
Dog d = (Dog) a;       // Animal → Dog (강제)

// instanceof로 타입 확인 (안전한 다운캐스팅)
if (a instanceof Dog dog) {  // Java 16+ 패턴 매칭
    dog.fetch();  // Dog만의 메서드
}
```

---

## 5장. 상속의 한계 🟢

```java
// ❌ Java는 다중 상속 불가!
class Student extends Person, Employee { }  // 컴파일 에러!

// ✅ 인터페이스로 해결 (J09에서 배움)
class Student extends Person implements Studyable, Employable { }
```

---

## 면접 대비

### 🔴 필수

**Q: "다형성이 뭔가요?"**

> 같은 타입(부모/인터페이스)으로 선언했지만, 실제 객체에 따라 다르게 동작하는 것입니다. 부모 타입 변수에 자식 객체를 담으면 오버라이딩된 메서드가 실행됩니다. Spring DI가 이 다형성을 기반으로 동작합니다.

**Q: "오버로딩과 오버라이딩의 차이는?"**

> 오버로딩은 같은 이름, 다른 매개변수(같은 클래스 안)이고, 오버라이딩은 부모 메서드를 자식이 재정의(상속 관계)하는 것입니다.

---

## 정리

```
🎯 상속: extends로 부모 코드를 물려받기
🎯 오버라이딩: @Override로 부모 메서드 재정의
🎯 다형성: 부모 타입으로 자식 객체 사용 → 객체에 따라 다르게 동작
🎯 super: 부모 참조 (생성자, 메서드)
🎯 Java는 단일 상속만 가능 → 인터페이스로 보완 (J09)
```

---

> 🎯 **다음 주제**: J09 "추상 클래스와 인터페이스" — 다중 상속 문제를 해결하고, Spring DI의 기반이 되는 개념!

