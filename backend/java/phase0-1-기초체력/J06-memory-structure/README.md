# J06. Java 메모리 구조 — "변수는 어디에 저장되나?"

> **키워드**: `Stack` `Heap` `Method Area` `GC` `null` `NullPointerException` `Young/Old Generation`

---

## 핵심만 한 문장

**기본형은 Stack에, 객체는 Heap에 저장된다. 안 쓰는 객체는 GC(가비지 컬렉터)가 자동으로 정리한다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~2장 (Stack vs Heap, null/NPE) | 버그 원인의 50% |
| 🟡 이해 | 3장 (GC 기초) | 성능 이해 |
| 🟢 참고 | 4장 (GC 세대별 구조) | 면접 심화 |

> 💡 **이 주제가 중요한 이유**: JPA 영속성 컨텍스트(Phase 3)가 Heap 메모리에서 동작한다. 메모리를 이해해야 Spring이 이해된다!

---

## 1장. Stack vs Heap 🔴

### 비유

```
Stack = 내 책상 (작고 빠르고, 메서드 끝나면 치워짐)
Heap  = 큰 창고 (크고 느리고, GC가 정리해줌)
```

### 코드로 추적

```java
public class MemoryTest {
    public static void main(String[] args) {
        int age = 25;                    // ① Stack에 저장
        String name = "홍길동";           // ② Heap에 "홍길동", Stack에 주소
        int[] scores = {90, 85, 70};     // ③ Heap에 배열, Stack에 주소
        
        doSomething(age);               // ④ 새 Stack 프레임 생성
    }
    
    static void doSomething(int num) {
        int local = num * 2;             // ⑤ doSomething의 Stack에 저장
    }                                    // ⑥ 메서드 끝 → Stack 프레임 제거
}
```

```
         Stack                     Heap
┌──────────────────┐    ┌──────────────────────┐
│ doSomething()    │    │                      │
│   local = 50     │    │  "홍길동"             │
│   num = 25       │    │  [90, 85, 70]        │
├──────────────────┤    │                      │
│ main()           │    │                      │
│   age = 25       │    │                      │
│   name = 0x100 ──┼───→│  "홍길동" (주소 0x100) │
│   scores = 0x200─┼───→│  [90,85,70] (0x200)  │
└──────────────────┘    └──────────────────────┘

doSomething() 끝나면 → Stack에서 local, num 사라짐
main() 끝나면 → Stack 전부 사라짐
Heap의 "홍길동", [90,85,70]은 GC가 나중에 정리
```

### Stack vs Heap 정리

| 구분 | Stack | Heap |
|------|-------|------|
| 저장 대상 | 기본형, 참조 주소 | 객체, 배열, 문자열 |
| 크기 | 작음 (스레드당 1개) | 큼 (앱 전체 공유) |
| 속도 | 빠름 | 느림 |
| 정리 | 메서드 끝나면 자동 | **GC가 정리** |
| 생명주기 | 메서드 실행 동안 | 참조가 사라질 때까지 |

---

## 2장. null과 NullPointerException 🔴

### null = "아무것도 안 가리키고 있다"

```java
String name = null;  // 주소가 없음 (아무것도 안 가리킴)

System.out.println(name.length());  
// ❌ NullPointerException! (null에 .length() 호출 불가)
```

### NPE 방지 패턴

```java
// ❌ NPE 위험
String name = getName();  // null일 수 있음!
System.out.println(name.length());

// ✅ null 체크
String name = getName();
if (name != null) {
    System.out.println(name.length());
}

// ✅ 더 좋은 방법 (Java 8+, J19에서 자세히)
Optional<String> name = Optional.ofNullable(getName());
name.ifPresent(n -> System.out.println(n.length()));
```

### NPE가 자주 발생하는 상황

```java
// 1. 초기화 안 한 참조형
String name;           // null
name.length();         // NPE!

// 2. Map에서 없는 키 조회
Map<String, String> map = new HashMap<>();
map.get("없는키").length();  // NPE! (get이 null 반환)

// 3. 배열 안의 null
String[] arr = new String[3];  // [null, null, null]
arr[0].length();               // NPE!
```

---

## 3장. GC (Garbage Collector) 🟡

### 비유

```
GC = 청소부

프로그래머가 new로 객체를 만들면 Heap에 쌓임
아무도 안 쓰는 객체가 있으면 GC가 자동으로 치워줌
프로그래머가 직접 메모리 해제할 필요 없음!
```

### 동작 원리

```java
String name = new String("홍길동");  // Heap에 생성
name = null;                         // 참조 끊김

// → "홍길동" 객체를 가리키는 변수가 없음
// → GC가 "이거 쓰레기네" → 정리
```

```
name → "홍길동"    (참조 있음 → 살아있음)
name = null
name    "홍길동"    (참조 없음 → GC 대상!)
```

### C 언어 vs Java

```
C:    malloc()으로 할당 → free()로 직접 해제 (깜빡하면 메모리 누수!)
Java: new로 할당 → GC가 자동 해제 (프로그래머가 신경 안 써도 됨!)
```

---

## 4장. GC 세대별 구조 🟢

```
Heap 메모리 구조:

┌────────────────────────────────────┐
│           Young Generation          │  ← 새로 생성된 객체
│  ┌──────┬──────────┬──────────┐    │
│  │ Eden │ Survivor0│ Survivor1│    │
│  └──────┴──────────┴──────────┘    │
├────────────────────────────────────┤
│            Old Generation           │  ← 오래 살아남은 객체
└────────────────────────────────────┘

Minor GC: Young에서 안 쓰는 객체 정리 (자주, 빠름)
Major GC: Old에서 안 쓰는 객체 정리 (가끔, 느림 = Stop-the-World)
```

**💡 이 구조는 JVM 성능 튜닝에서 중요하다. 지금은 "Young → Old로 승격"된다는 것만 알면 됨!**

---

## 면접 대비

### 🔴 필수

**Q: "Stack과 Heap의 차이는?"**

> Stack은 기본형 값과 참조 주소를 저장하며 메서드 종료 시 자동 정리됩니다. Heap은 객체와 배열을 저장하며 GC가 정리합니다. Stack은 스레드마다 독립적이고, Heap은 모든 스레드가 공유합니다.

**Q: "GC가 뭔가요?"**

> Garbage Collector로, Heap에서 더 이상 참조되지 않는 객체를 자동으로 정리하는 메커니즘입니다. C와 달리 Java에서는 프로그래머가 직접 메모리를 해제할 필요가 없습니다. Young/Old Generation으로 나뉘어 관리됩니다.

**Q: "NullPointerException이 뭔가요?"**

> null(아무것도 가리키지 않는 참조)에 메서드를 호출하거나 필드에 접근할 때 발생하는 예외입니다. `null.length()` 같은 상황에서 발생하며, null 체크나 Optional을 사용해서 방지합니다.

---

## 정리

```
🎯 메모리 구조:
  Stack → 기본형, 참조 주소 (메서드 끝나면 사라짐)
  Heap  → 객체, 배열 (GC가 정리)

🎯 null = "아무것도 안 가리킴"
  null.xxx() → NullPointerException!
  → null 체크 또는 Optional로 방지

🎯 GC = 자동 메모리 청소
  참조 없는 객체 → GC가 정리
  프로그래머가 free() 안 해도 됨!
```

---

> 🎯 **Phase 0-1 완료!** 다음은 Phase 0-2 "OOP 마스터" — 클래스, 상속, 다형성, 인터페이스를 배운다!

