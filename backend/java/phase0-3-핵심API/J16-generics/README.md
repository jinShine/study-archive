# J16. 제네릭 — "타입을 파라미터로 받기"

> **키워드**: `<T>` `타입 파라미터` `와일드카드` `? extends` `? super` `타입 소거`

---

## 핵심만 한 문장

**`List<String>`에서 `<String>`이 제네릭이다. "어떤 타입이든 담을 수 있되, 한번 정하면 그 타입만"이라는 안전장치다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~2장 (왜 필요한가, 기본 사용) | 컬렉션/Spring에서 매일 봄 |
| 🟡 이해 | 3장 (와일드카드) | 라이브러리 API 읽을 때 필요 |
| 🟢 참고 | 4장 (타입 소거) | 면접 심화 |

---

## 1장. 왜 필요한가? 🔴

```java
// ❌ 제네릭 없이 (Object로 받음)
List list = new ArrayList();
list.add("홍길동");
list.add(123);          // 문자열과 숫자가 섞임!
String name = (String) list.get(1);  // ❌ ClassCastException! (런타임 에러)

// ✅ 제네릭 사용
List<String> list = new ArrayList<>();
list.add("홍길동");
// list.add(123);       // ❌ 컴파일 에러! (숫자 넣기 불가)
String name = list.get(0);  // 캐스팅 불필요!
```

---

## 2장. 제네릭 클래스/메서드 🔴

### 제네릭 클래스

```java
// T = "어떤 타입이든 될 수 있다" (Type의 약자)
public class Box<T> {
    private T item;
    
    public void put(T item) { this.item = item; }
    public T get() { return item; }
}

// 사용
Box<String> stringBox = new Box<>();
stringBox.put("사과");
String fruit = stringBox.get();  // "사과" (캐스팅 불필요)

Box<Integer> intBox = new Box<>();
intBox.put(42);
int num = intBox.get();  // 42
```

### 제네릭 메서드

```java
// 메서드에만 제네릭 적용
public static <T> T getFirst(List<T> list) {
    return list.get(0);
}

String name = getFirst(List.of("홍길동", "김길동"));  // "홍길동"
Integer num = getFirst(List.of(1, 2, 3));             // 1
```

### 관례

```
T = Type (일반적인 타입)
E = Element (컬렉션의 요소)
K = Key (Map의 키)
V = Value (Map의 값)
R = Return (반환 타입)
```

---

## 3장. 와일드카드 🟡

```java
// ? = 어떤 타입이든 (읽기 전용)
public void printAll(List<?> list) {
    for (Object item : list) {
        System.out.println(item);
    }
}

// ? extends = 상한 제한 (Number의 자식만)
public double sum(List<? extends Number> list) {
    double total = 0;
    for (Number num : list) {
        total += num.doubleValue();
    }
    return total;
}
sum(List.of(1, 2, 3));       // int도 OK (Integer extends Number)
sum(List.of(1.5, 2.5));      // double도 OK (Double extends Number)

// ? super = 하한 제한 (Integer의 부모만)
public void addNumbers(List<? super Integer> list) {
    list.add(1);  // Integer 추가 가능
    list.add(2);
}
```

### PECS 원칙

```
Producer → extends (읽기)
Consumer → super (쓰기)

"읽기만 할 때 extends, 쓰기만 할 때 super"
```

---

## 4장. 타입 소거 🟢

```java
// 컴파일 후 제네릭 정보가 사라짐!
List<String> list1 = new ArrayList<>();
List<Integer> list2 = new ArrayList<>();

// 런타임에는 둘 다 그냥 List
System.out.println(list1.getClass() == list2.getClass());  // true!

// 그래서 런타임에 타입 체크가 안 됨
// if (list instanceof List<String>) { }  // ❌ 컴파일 에러
```

---

## 면접 대비

### 🔴 필수

**Q: "제네릭을 사용하는 이유는?"**

> 컴파일 타임에 타입 안전성을 보장하기 위해서입니다. 제네릭 없이 Object를 사용하면 런타임에 ClassCastException이 발생할 수 있지만, 제네릭을 사용하면 잘못된 타입을 컴파일 시점에 잡을 수 있습니다.

---

## 정리

```
🎯 제네릭 = "타입을 파라미터로" (List<String>의 <String>)
🎯 컴파일 타임에 타입 안전성 보장
🎯 T, E, K, V = 관례적 타입 파라미터 이름
🎯 와일드카드: ? (아무 타입), ? extends (읽기), ? super (쓰기)
```

---

> 🎯 **다음 주제**: J17 "람다와 함수형 인터페이스" — 코드를 더 간결하게!

