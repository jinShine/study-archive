# J03. 제어문과 반복문 — "코드의 흐름을 바꾸기"

> **키워드**: `if` `else` `switch` `for` `while` `do-while` `break` `continue` `향상된 for`

---

## 핵심만 한 문장

**if는 "조건에 따라 다르게", for/while은 "반복해서" 실행한다. 이 둘로 모든 프로그램의 흐름을 제어한다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~3장 (if/else, for, while) | 모든 코드의 기본 |
| 🟡 이해 | 4장 (switch, 향상된 for) | 자주 쓰이는 문법 |
| 🟢 참고 | 5장 (switch 표현식 Java 14+) | 최신 문법 |

---

## 1장. if / else — 조건 분기 🔴

### 비유

```
if = 갈림길

"비가 오면 우산을 가져가고, 아니면 그냥 나간다"
```

### 기본 구조

```java
int score = 85;

if (score >= 90) {
    System.out.println("A학점");
} else if (score >= 80) {
    System.out.println("B학점");
} else if (score >= 70) {
    System.out.println("C학점");
} else {
    System.out.println("F학점");
}
// 출력: B학점
```

### 삼항 연산자 (if-else 축약)

```java
int age = 25;
String result = (age >= 19) ? "성인" : "미성년자";
System.out.println(result);  // "성인"
```

---

## 2장. for — 정해진 횟수 반복 🔴

### 비유

```
for = "1번부터 10번까지 반복해"
     → 횟수가 정해져 있을 때
```

### 기본 구조

```java
// 1부터 5까지 출력
for (int i = 1; i <= 5; i++) {
    System.out.println(i);
}
// 출력: 1, 2, 3, 4, 5

// 구구단 2단
for (int i = 1; i <= 9; i++) {
    System.out.println("2 x " + i + " = " + (2 * i));
}
```

### 중첩 for (구구단 전체)

```java
for (int dan = 2; dan <= 9; dan++) {
    System.out.println("--- " + dan + "단 ---");
    for (int i = 1; i <= 9; i++) {
        System.out.println(dan + " x " + i + " = " + (dan * i));
    }
}
```

### break / continue

```java
// break: 반복 중단
for (int i = 1; i <= 10; i++) {
    if (i == 5) break;  // 5에서 멈춤
    System.out.println(i);
}
// 출력: 1, 2, 3, 4

// continue: 이번만 건너뛰기
for (int i = 1; i <= 5; i++) {
    if (i == 3) continue;  // 3만 건너뜀
    System.out.println(i);
}
// 출력: 1, 2, 4, 5
```

---

## 3장. while — 조건이 true인 동안 반복 🔴

### 비유

```
while = "배고프면 계속 먹어"
       → 조건이 만족하는 동안 반복 (횟수 모름)
```

### 기본 구조

```java
int count = 0;
while (count < 3) {
    System.out.println("count: " + count);
    count++;
}
// 출력: count: 0, count: 1, count: 2

// ⚠️ count++ 빼먹으면 무한 루프!
```

### for vs while 선택 기준

```
횟수가 정해져 있다  → for   (1부터 10까지)
조건이 변할 수 있다 → while (사용자가 "종료" 입력할 때까지)
```

---

## 4장. switch와 향상된 for 🟡

### switch

```java
String grade = "B";

switch (grade) {
    case "A":
        System.out.println("우수");
        break;
    case "B":
        System.out.println("양호");
        break;
    case "C":
        System.out.println("보통");
        break;
    default:
        System.out.println("기타");
}
// 출력: 양호
```

### 향상된 for (for-each)

```java
String[] fruits = {"사과", "바나나", "포도"};

// 일반 for
for (int i = 0; i < fruits.length; i++) {
    System.out.println(fruits[i]);
}

// 향상된 for (더 간결!)
for (String fruit : fruits) {
    System.out.println(fruit);
}
// 둘 다 같은 결과: 사과, 바나나, 포도
```

---

## 5장. switch 표현식 (Java 14+) 🟢

```java
// 기존 switch (break 필요)
String result;
switch (grade) {
    case "A": result = "우수"; break;
    case "B": result = "양호"; break;
    default: result = "기타"; break;
}

// Java 14+ switch 표현식 (break 불필요, 간결!)
String result = switch (grade) {
    case "A" -> "우수";
    case "B" -> "양호";
    default -> "기타";
};
```

---

## 면접 대비

### 🔴 필수

**Q: "for와 while의 차이는?"**

> for는 반복 횟수가 정해져 있을 때, while은 조건이 동적으로 변할 때 사용합니다. for는 초기값, 조건, 증감이 한 줄에 있어서 가독성이 좋고, while은 반복 종료 시점을 모를 때 유연합니다.

---

## 정리: 이것만 기억하기

```
🎯 흐름 제어:

조건 분기: if / else if / else
반복 (횟수): for
반복 (조건): while
배열 순회: for-each (for (Type item : array))
중단: break
건너뛰기: continue
```

---

> 🎯 **다음 주제**: J04 "배열과 문자열" — 여러 데이터를 한 번에 다루는 방법!

