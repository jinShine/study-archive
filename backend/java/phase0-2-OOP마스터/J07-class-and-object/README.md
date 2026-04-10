# J07. 클래스와 객체 — "설계도와 실제 물건"

> **키워드**: `class` `객체` `필드` `메서드` `생성자` `this` `접근 제어자` `패키지`

---

## 핵심만 한 문장

**클래스는 설계도(붕어빵 틀)이고, 객체는 그 설계도로 만든 실제 물건(붕어빵)이다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~3장 (클래스/객체, 생성자, this) | OOP의 출발점 |
| 🔴 필수 | 4장 (접근 제어자) | 캡슐화의 기초 |
| 🟡 이해 | 5장 (패키지) | 프로젝트 구조 |

---

## 1장. 클래스와 객체 🔴

### 비유

```
클래스 = 붕어빵 틀 (설계도)
객체   = 붕어빵 (틀로 만든 실제 물건)

하나의 틀(클래스)로 여러 개의 붕어빵(객체)을 만들 수 있다!
```

### 코드로 보면

```java
// 설계도 (클래스)
public class Student {
    // 필드 (데이터)
    String name;
    int age;
    String email;
    
    // 메서드 (행동)
    void introduce() {
        System.out.println("안녕! 나는 " + name + ", " + age + "살이야!");
    }
}

// 실제 물건 만들기 (객체 생성)
Student hong = new Student();
hong.name = "홍길동";
hong.age = 25;
hong.introduce();  // "안녕! 나는 홍길동, 25살이야!"

Student kim = new Student();
kim.name = "김길동";
kim.age = 22;
kim.introduce();   // "안녕! 나는 김길동, 22살이야!"
```

---

## 2장. 생성자 — 객체 생성 시 초기화 🔴

```java
public class Student {
    String name;
    int age;
    
    // 기본 생성자 (매개변수 없음)
    public Student() {
        this.name = "이름없음";
        this.age = 0;
    }
    
    // 매개변수 있는 생성자
    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }
}

// 사용
Student s1 = new Student();              // "이름없음", 0
Student s2 = new Student("홍길동", 25);   // "홍길동", 25
```

### this = "나 자신"

```java
public Student(String name, int age) {
    this.name = name;   // this.name = 내 필드, name = 매개변수
    this.age = age;     // 이름이 같을 때 구분하기 위해 this 사용
}
```

---

## 3장. 필드와 메서드 🔴

### 인스턴스 vs 클래스(static)

```java
public class Counter {
    int count = 0;              // 인스턴스 변수 (객체마다 다름)
    static int totalCount = 0;  // 클래스 변수 (모든 객체가 공유)
    
    void increment() {          // 인스턴스 메서드
        count++;
        totalCount++;
    }
    
    static int getTotal() {     // 클래스 메서드 (static)
        return totalCount;
    }
}

Counter c1 = new Counter();
Counter c2 = new Counter();
c1.increment();
c2.increment();

System.out.println(c1.count);          // 1 (c1만의 값)
System.out.println(c2.count);          // 1 (c2만의 값)
System.out.println(Counter.totalCount); // 2 (공유!)
```

---

## 4장. 접근 제어자 🔴

```java
public class Student {
    public String name;      // 어디서든 접근 가능
    protected int age;       // 같은 패키지 + 자식 클래스
    int grade;               // (default) 같은 패키지만
    private String password; // 이 클래스 안에서만!
}
```

| 제어자 | 같은 클래스 | 같은 패키지 | 자식 클래스 | 외부 |
|--------|:---------:|:---------:|:---------:|:---:|
| `public` | ✅ | ✅ | ✅ | ✅ |
| `protected` | ✅ | ✅ | ✅ | ❌ |
| `(default)` | ✅ | ✅ | ❌ | ❌ |
| `private` | ✅ | ❌ | ❌ | ❌ |

**💡 실무 규칙: 필드는 `private`, 메서드는 `public` 이 기본!**

```java
public class Student {
    private String name;    // 외부에서 직접 접근 불가
    
    public String getName() {      // getter
        return this.name;
    }
    
    public void setName(String name) {  // setter
        this.name = name;
    }
}
```

---

## 5장. 패키지 🟡

```java
// 패키지 = 폴더 (관련 클래스를 묶음)
package com.example.student;

// 다른 패키지의 클래스 사용
import com.example.course.Course;
import java.util.List;     // Java 기본 라이브러리
import java.util.*;        // 와일드카드 (전부 import)
```

```
프로젝트 구조:
com/example/
├── student/
│   ├── Student.java
│   └── StudentService.java
├── course/
│   ├── Course.java
│   └── CourseService.java
└── Main.java
```

---

## 면접 대비

### 🔴 필수

**Q: "클래스와 객체의 차이는?"**

> 클래스는 객체를 만들기 위한 설계도(틀)이고, 객체는 클래스를 기반으로 `new`로 생성한 실체입니다. 하나의 클래스로 여러 객체를 만들 수 있고, 각 객체는 독립적인 필드 값을 가집니다.

**Q: "접근 제어자 4가지를 설명해주세요"**

> `public`은 어디서든 접근, `protected`는 같은 패키지와 자식 클래스, `default`(생략)는 같은 패키지만, `private`은 해당 클래스 안에서만 접근 가능합니다. 캡슐화를 위해 필드는 `private`으로, 메서드는 `public`으로 선언하는 것이 기본 원칙입니다.

---

## 정리

```
🎯 클래스 = 설계도, 객체 = 실체 (new로 생성)
🎯 생성자 = 객체 생성 시 초기화
🎯 this = "나 자신"의 필드/메서드
🎯 접근 제어자: private(필드) + public(메서드) = 캡슐화
🎯 static = 모든 객체가 공유
```

---

> 🎯 **다음 주제**: J08 "상속과 다형성" — 코드를 재사용하고 확장하는 OOP 핵심!

