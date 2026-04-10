# J04. 배열과 문자열 — "여러 데이터를 한 번에 다루기"

> **키워드**: `배열` `String` `불변성` `StringBuilder` `String Pool` `Arrays`

---

## 핵심만 한 문장

**배열은 같은 타입 데이터를 묶어서 저장하고, String은 불변(바꿀 수 없는) 객체다. 이 "불변"을 이해하는 게 핵심이다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~2장 (배열, String 불변성) | 매일 쓰는 기본 |
| 🟡 이해 | 3장 (StringBuilder, String Pool) | 성능 이해 |
| 🟢 참고 | 4장 (Arrays 유틸) | 필요할 때 찾기 |

---

## 1장. 배열 🔴

### 비유

```
변수 = 상자 1개
배열 = 사물함 (번호가 매겨진 상자 여러 개)

int score = 90;           → 상자 1개
int[] scores = {90, 85, 70}; → 사물함 (0번, 1번, 2번)
```

### 선언과 사용

```java
// 선언 + 초기화
int[] scores = {90, 85, 70, 95, 80};

// 접근 (0번부터 시작!)
System.out.println(scores[0]);  // 90 (첫 번째)
System.out.println(scores[4]);  // 80 (마지막)
System.out.println(scores.length); // 5 (길이)

// ⚠️ 범위 초과 → 에러!
System.out.println(scores[5]);  // ArrayIndexOutOfBoundsException!

// 순회
for (int score : scores) {
    System.out.println(score);
}
```

### 따라 쳐보기: 최대값 찾기

```java
public class ArrayTest {
    public static void main(String[] args) {
        int[] scores = {90, 85, 70, 95, 80};
        
        int max = scores[0];  // 첫 번째 값으로 시작
        for (int score : scores) {
            if (score > max) {
                max = score;
            }
        }
        System.out.println("최대값: " + max);  // 95
    }
}
```

---

## 2장. String 불변성 🔴

### 핵심: String은 한 번 만들면 바꿀 수 없다

```java
String name = "홍길동";
name = "김길동";  // ← 바꾼 게 아니라, 새로 만든 것!
```

```
메모리에서 일어나는 일:

Step 1: String name = "홍길동";
  Heap: ["홍길동"] ← name이 가리킴

Step 2: name = "김길동";
  Heap: ["홍길동"] ← 아무도 안 가리킴 (나중에 GC가 정리)
        ["김길동"] ← name이 가리킴 (새로 생성!)
```

### String 비교: == vs equals()

```java
// ❌ == 으로 비교하면 안 됨 (주소 비교)
String a = new String("hello");
String b = new String("hello");
System.out.println(a == b);       // false (주소가 다름!)

// ✅ equals()로 비교 (값 비교)
System.out.println(a.equals(b));   // true (값이 같음!)
```

### 자주 쓰는 String 메서드

```java
String s = "Hello, World!";

s.length()          // 13
s.charAt(0)         // 'H'
s.substring(0, 5)   // "Hello"
s.contains("World") // true
s.indexOf("World")  // 7
s.toLowerCase()     // "hello, world!"
s.toUpperCase()     // "HELLO, WORLD!"
s.trim()            // 앞뒤 공백 제거
s.replace("World", "Java")  // "Hello, Java!"
s.split(",")        // ["Hello", " World!"]
s.isEmpty()         // false
s.isBlank()         // false (Java 11+)
```

---

## 3장. StringBuilder와 String Pool 🟡

### StringBuilder: 문자열을 자주 수정할 때

```java
// ❌ String으로 반복 연결 (매번 새 객체 생성 → 느림)
String result = "";
for (int i = 0; i < 1000; i++) {
    result += i;  // 매번 새 String 생성!
}

// ✅ StringBuilder (하나의 객체에서 수정 → 빠름)
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append(i);
}
String result = sb.toString();
```

### String Pool

```java
// 리터럴로 생성 → String Pool에 저장 (같은 값은 재사용)
String a = "hello";
String b = "hello";
System.out.println(a == b);  // true! (같은 Pool 객체)

// new로 생성 → Heap에 새 객체
String c = new String("hello");
System.out.println(a == c);  // false (다른 객체)
System.out.println(a.equals(c));  // true (값은 같음)
```

---

## 4장. Arrays 유틸 🟢

```java
import java.util.Arrays;

int[] arr = {3, 1, 4, 1, 5};

Arrays.sort(arr);                // 정렬: [1, 1, 3, 4, 5]
Arrays.toString(arr);            // 출력: "[1, 1, 3, 4, 5]"
Arrays.fill(arr, 0);             // 전부 0으로: [0, 0, 0, 0, 0]
Arrays.copyOf(arr, 3);           // 앞 3개 복사: [0, 0, 0]
Arrays.equals(arr1, arr2);       // 배열 비교
```

---

## 면접 대비

### 🔴 필수

**Q: "String이 불변인 이유는?"**

> 보안(비밀번호 등이 변경되면 안 됨), String Pool 재사용(같은 문자열을 공유), 해시코드 캐싱(HashMap 키로 안전하게 사용), 스레드 안전성 때문입니다.

**Q: "== 과 equals()의 차이는?"**

> `==`는 주소(참조값)를 비교하고, `equals()`는 값(내용)을 비교합니다. String을 비교할 때는 반드시 `equals()`를 사용해야 합니다. String Pool에서 같은 리터럴은 `==`이 true일 수 있지만, `new String()`으로 만들면 false가 됩니다.

---

## 정리

```
🎯 배열 = 번호가 매겨진 상자 묶음 (0번부터!)
🎯 String = 불변 객체 (수정 = 새로 생성)
🎯 String 비교 = equals() 사용 (== 쓰면 안 됨!)
🎯 문자열 반복 수정 = StringBuilder 사용
```

---

> 🎯 **다음 주제**: J05 "메서드와 스코프" — 코드를 재사용 가능한 단위로 쪼개기!

