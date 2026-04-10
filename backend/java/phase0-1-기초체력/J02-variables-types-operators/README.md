# J02. 변수, 자료형, 연산자 — "데이터를 담는 그릇"

> **키워드**: `변수` `기본형` `참조형` `int` `long` `double` `boolean` `String` `형변환` `연산자`

---

## 핵심만 한 문장

**변수는 데이터를 담는 그릇이고, 자료형은 그릇의 종류(정수/실수/문자...)이다. 연산자는 그릇 안의 데이터를 계산하는 도구다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~3장 (변수, 기본형, 연산자) | 모든 코드의 기본 |
| 🟡 이해 | 4장 (형변환, 기본형 vs 참조형) | 버그 원인 이해 |
| 🟢 참고 | 5장 (비트 연산자) | 특수 상황 |

---

## 1장. 변수 — 데이터를 담는 그릇 🔴

### 비유

```
변수 = 이름표가 붙은 상자

int age = 25;
→ "age"라는 이름표가 붙은 상자에 25를 넣음

String name = "홍길동";
→ "name"이라는 상자에 "홍길동"을 넣음
```

### 선언과 초기화

```java
// 선언: 상자를 만듦
int age;

// 초기화: 상자에 값을 넣음
age = 25;

// 선언 + 초기화 (한 줄로)
int age = 25;
String name = "홍길동";
boolean isStudent = true;
```

### 변수 이름 규칙

```java
// ✅ 올바른 이름
int studentAge = 25;      // 카멜 케이스 (소문자 시작, 단어 대문자)
String firstName = "길동";
boolean isActive = true;   // boolean은 is로 시작

// ❌ 잘못된 이름
int 1age = 25;            // 숫자로 시작 불가
int my age = 25;          // 공백 불가
int class = 25;           // 예약어 불가
```

---

## 2장. 기본형 8가지 🔴

### 정수형

```java
byte  b = 127;              // 1바이트 (-128 ~ 127)
short s = 32000;             // 2바이트 (-32,768 ~ 32,767)
int   i = 2_000_000_000;    // 4바이트 ← 가장 많이 씀!
long  l = 9_000_000_000L;   // 8바이트 (L 붙여야 함!)

// 💡 실무에서는 거의 int와 long만 쓴다
// int: 일반 숫자 (나이, 개수)
// long: 큰 숫자 (ID, 타임스탬프)
```

### 실수형

```java
float  f = 3.14f;    // 4바이트 (f 붙여야 함!)
double d = 3.14;     // 8바이트 ← 기본! 가장 많이 씀

// 💡 돈 계산에는 double 쓰면 안 됨!
// → BigDecimal 사용 (오차 발생 방지)
```

### 문자형 & 논리형

```java
char   c = 'A';       // 2바이트, 문자 하나 (작은따옴표)
boolean b = true;      // true 또는 false

// ⚠️ char vs String
char   c = 'A';       // 문자 하나 (작은따옴표)
String s = "ABC";     // 문자열 (큰따옴표) — 참조형!
```

### 한눈에 정리

```
정수: byte(1) → short(2) → int(4) → long(8)
실수: float(4) → double(8)
문자: char(2)
논리: boolean

💡 실무에서 쓰는 것: int, long, double, boolean, String
```

---

## 3장. 연산자 🔴

### 산술 연산자

```java
int a = 10, b = 3;

a + b   // 13 (더하기)
a - b   // 7  (빼기)
a * b   // 30 (곱하기)
a / b   // 3  (나누기 — 정수끼리는 소수점 버림!)
a % b   // 1  (나머지)
```

### ⚠️ 주의: 정수 나눗셈

```java
// ❌ 예상과 다른 결과
int result = 10 / 3;        // 3 (소수점 버림!)
System.out.println(result);  // 3

// ✅ 하나를 double로 바꾸면 됨
double result = 10.0 / 3;   // 3.3333...
System.out.println(result);  // 3.3333333333333335
```

### 비교 연산자

```java
int a = 10, b = 20;

a == b   // false (같은가?)
a != b   // true  (다른가?)
a > b    // false (큰가?)
a < b    // true  (작은가?)
a >= b   // false (크거나 같은가?)
a <= b   // true  (작거나 같은가?)
```

### 논리 연산자

```java
boolean x = true, y = false;

x && y   // false (AND: 둘 다 true여야)
x || y   // true  (OR: 하나만 true면)
!x       // false (NOT: 반대)
```

### 따라 쳐보기

```java
public class OperatorTest {
    public static void main(String[] args) {
        int age = 25;
        boolean isAdult = age >= 19;
        boolean isStudent = true;
        
        System.out.println("성인인가? " + isAdult);           // true
        System.out.println("성인 학생인가? " + (isAdult && isStudent));  // true
        
        // 정수 나눗셈 주의
        System.out.println("10 / 3 = " + (10 / 3));          // 3
        System.out.println("10.0 / 3 = " + (10.0 / 3));      // 3.333...
    }
}
```

---

## 4장. 형변환 🟡

### 자동 형변환 (작은 → 큰)

```java
int i = 100;
long l = i;        // int → long (자동)
double d = l;      // long → double (자동)

// 작은 그릇 → 큰 그릇: 데이터 손실 없음!
```

### 강제 형변환 (큰 → 작은)

```java
double d = 3.14;
int i = (int) d;   // double → int (강제, 소수점 버림!)
// i = 3

long l = 10_000_000_000L;
int i = (int) l;   // ⚠️ 데이터 손실 가능!
```

### 기본형 vs 참조형

```java
// 기본형: 값 자체를 저장
int a = 10;        // Stack에 10 저장

// 참조형: 주소를 저장
String s = "hello"; // Heap에 "hello", Stack에 주소 저장

// ⚠️ 이 차이가 J06 메모리 구조에서 중요해진다!
```

---

## 면접 대비

### 🔴 필수

**Q: "기본형과 참조형의 차이는?"**

> 기본형(int, long 등)은 Stack에 값 자체를 저장하고, 참조형(String, 배열, 객체)은 Heap에 데이터를 저장하고 Stack에는 주소를 저장합니다. 기본형은 8가지(byte, short, int, long, float, double, char, boolean)이고 나머지는 전부 참조형입니다.

**Q: "int와 long은 언제 구분해서 쓰나요?"**

> 일반적인 숫자(나이, 개수, 점수)에는 int를 쓰고, DB의 ID값이나 타임스탬프처럼 큰 숫자에는 long을 씁니다. Spring에서 Entity의 @Id 필드는 보통 Long을 사용합니다.

---

## 정리: 이것만 기억하기

```
🎯 변수 = 데이터를 담는 그릇

실무에서 쓰는 자료형:
  int     → 일반 숫자
  long    → ID, 큰 숫자
  double  → 실수 (돈은 BigDecimal!)
  boolean → true/false
  String  → 문자열 (참조형!)

연산자 주의:
  10 / 3 = 3 (정수 나눗셈은 소수점 버림!)
  == 으로 String 비교하면 안 됨 (equals 사용!)
```

---

> 🎯 **다음 주제**: J03 "제어문과 반복문" — if, for, while로 코드의 흐름을 제어하는 방법!

