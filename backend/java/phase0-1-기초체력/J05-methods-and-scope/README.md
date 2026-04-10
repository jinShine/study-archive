# J05. 메서드와 스코프 — "코드를 재사용 가능한 단위로 쪼개기"

> **키워드**: `메서드` `매개변수` `반환값` `call by value` `오버로딩` `가변 인자` `스코프`

---

## 핵심만 한 문장

**메서드는 "이름 붙인 코드 묶음"이다. 한 번 만들면 어디서든 호출해서 재사용할 수 있다. Java는 무조건 "값 복사"(call by value)다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~3장 (메서드 기본, call by value, 스코프) | 모든 코드의 기본 단위 |
| 🟡 이해 | 4장 (오버로딩) | 자주 쓰이는 문법 |
| 🟢 참고 | 5장 (가변 인자) | 특수 상황 |

---

## 1장. 메서드 기본 🔴

### 비유

```
메서드 = 자판기

입력(매개변수): 동전 넣기
처리(본문):    음료 제조
출력(반환값):  음료 나옴

add(3, 5) → 내부에서 3+5 계산 → 8 반환
```

### 구조

```java
//  반환타입  메서드이름(매개변수)
    int      add(int a, int b) {
        return a + b;   // 반환값
    }
```

### 따라 쳐보기

```java
public class MethodTest {
    
    // 반환값 있는 메서드
    static int add(int a, int b) {
        return a + b;
    }
    
    // 반환값 없는 메서드 (void)
    static void greet(String name) {
        System.out.println("안녕, " + name + "!");
    }
    
    // 매개변수 없는 메서드
    static String getGreeting() {
        return "Hello!";
    }
    
    public static void main(String[] args) {
        int result = add(3, 5);
        System.out.println("3 + 5 = " + result);  // 8
        
        greet("홍길동");  // "안녕, 홍길동!"
        
        System.out.println(getGreeting());  // "Hello!"
    }
}
```

---

## 2장. Call by Value — Java의 핵심 규칙 🔴

### Java는 항상 "값을 복사"해서 전달한다

```java
// 기본형: 값 자체를 복사
static void change(int num) {
    num = 100;  // 복사본을 변경 (원본 영향 없음!)
}

public static void main(String[] args) {
    int x = 10;
    change(x);
    System.out.println(x);  // 10 (변경 안 됨!)
}
```

```
x = 10 → change(10) → num = 10 (복사본)
                        num = 100 (복사본만 변경)
x는 여전히 10!
```

### 참조형: 주소를 복사 (객체 내용은 변경 가능)

```java
static void changeName(String[] arr) {
    arr[0] = "김길동";  // 같은 배열을 가리키니까 변경됨!
}

public static void main(String[] args) {
    String[] names = {"홍길동"};
    changeName(names);
    System.out.println(names[0]);  // "김길동" (변경됨!)
}
```

```
names → [홍길동] ← arr도 같은 주소를 가리킴
         ↓
         [김길동] (내용이 변경됨)

주소를 복사했기 때문에, 같은 객체를 수정한 것!
```

---

## 3장. 스코프 — 변수의 생존 범위 🔴

```java
public class ScopeTest {
    static int globalVar = 100;  // 클래스 변수 (어디서든 접근)
    
    public static void main(String[] args) {
        int localVar = 10;  // main 안에서만 살아있음
        
        if (true) {
            int blockVar = 20;  // if 블록 안에서만 살아있음
            System.out.println(localVar);  // ✅ 접근 가능
            System.out.println(blockVar);  // ✅ 접근 가능
        }
        
        System.out.println(localVar);  // ✅ 접근 가능
        // System.out.println(blockVar);  // ❌ 에러! if 블록 밖
    }
}
```

```
스코프 규칙: 변수는 선언된 {} 안에서만 살아있다

클래스 { 
    클래스 변수 (어디서든)
    
    메서드 { 
        지역 변수 (메서드 안에서만)
        
        if { 
            블록 변수 (블록 안에서만)
        }  ← 여기서 블록 변수 소멸
    }  ← 여기서 지역 변수 소멸
}
```

---

## 4장. 오버로딩 🟡

```java
// 같은 이름, 다른 매개변수 = 오버로딩!
static int add(int a, int b) {
    return a + b;
}

static double add(double a, double b) {
    return a + b;
}

static int add(int a, int b, int c) {
    return a + b + c;
}

// 호출할 때 매개변수에 맞는 메서드가 자동 선택됨
add(3, 5);        // int 버전 → 8
add(3.0, 5.0);    // double 버전 → 8.0
add(1, 2, 3);     // 3개짜리 버전 → 6
```

**💡 Spring에서 자주 봄: `findById(Long id)`, `findByName(String name)` 같은 것도 오버로딩!**

---

## 5장. 가변 인자 🟢

```java
// 매개변수 개수를 모를 때
static int sum(int... numbers) {  // ← 가변 인자 (0개~N개)
    int total = 0;
    for (int num : numbers) {
        total += num;
    }
    return total;
}

sum();           // 0
sum(1, 2);       // 3
sum(1, 2, 3, 4); // 10
```

---

## 면접 대비

### 🔴 필수

**Q: "Java는 call by value인가 call by reference인가?"**

> Java는 항상 call by value입니다. 기본형은 값 자체를 복사하고, 참조형은 주소값을 복사합니다. 참조형의 경우 같은 객체를 가리키는 주소가 복사되므로 객체 내부 값은 변경할 수 있지만, 참조 자체를 바꿀 수는 없습니다.

**Q: "오버로딩과 오버라이딩의 차이는?"**

> 오버로딩은 같은 클래스에서 같은 이름의 메서드를 매개변수를 다르게 해서 여러 개 정의하는 것이고, 오버라이딩은 상속 관계에서 부모의 메서드를 자식이 재정의하는 것입니다. 오버로딩은 컴파일 타임에, 오버라이딩은 런타임에 결정됩니다.

---

## 정리

```
🎯 메서드 = 재사용 가능한 코드 묶음
🎯 Java는 항상 call by value (값 복사!)
🎯 기본형 → 값 복사 (원본 안 바뀜)
🎯 참조형 → 주소 복사 (객체 내용은 바뀔 수 있음)
🎯 스코프 → 변수는 {} 안에서만 살아있다
🎯 오버로딩 → 같은 이름, 다른 매개변수
```

---

> 🎯 **다음 주제**: J06 "Java 메모리 구조" — Stack, Heap이 뭔지, GC가 뭔지 배운다!

