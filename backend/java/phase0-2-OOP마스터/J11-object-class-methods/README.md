# J11. Object 클래스와 핵심 메서드 — "모든 클래스의 부모"

> **키워드**: `Object` `equals` `hashCode` `toString` `계약(Contract)` `Objects 유틸`

---

## 핵심만 한 문장

**Java의 모든 클래스는 Object를 상속한다. equals/hashCode를 올바르게 재정의하지 않으면 HashMap, HashSet에서 버그가 발생한다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~2장 (equals/hashCode 계약, toString) | 면접 단골 + 실무 버그 원인 |
| 🟡 이해 | 3장 (Objects 유틸) | null-safe 비교 |
| 🟢 참고 | 4장 (clone) | 거의 안 씀 |

---

## 1장. equals와 hashCode 계약 🔴

### 문제: == vs equals

```java
Student s1 = new Student(1L, "홍길동");
Student s2 = new Student(1L, "홍길동");

System.out.println(s1 == s2);      // false (주소 비교 → 다른 객체)
System.out.println(s1.equals(s2)); // false (기본 Object.equals도 주소 비교!)
```

### 해결: equals 재정의

```java
public class Student {
    private Long id;
    private String name;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;                    // 같은 객체
        if (o == null || getClass() != o.getClass()) return false; // 타입 다름
        Student student = (Student) o;
        return Objects.equals(id, student.id);         // ID로 비교
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);                       // ID로 해시 생성
    }
}

// 이제 동작!
System.out.println(s1.equals(s2)); // true (ID가 같으니까)
```

### 핵심 규칙 (계약)

```
equals()가 true인 두 객체는 반드시 같은 hashCode()를 반환해야 한다!

✅ equals = true  → hashCode 같음 (필수!)
✅ equals = false → hashCode 다를 수도, 같을 수도
❌ equals = true  → hashCode 다름 (규칙 위반! → HashMap 버그!)
```

### 왜 중요한가?

```java
// hashCode를 재정의하지 않으면 → HashMap에서 찾을 수 없음!
Map<Student, String> map = new HashMap<>();
Student s1 = new Student(1L, "홍길동");
map.put(s1, "A학점");

Student s2 = new Student(1L, "홍길동");  // 같은 학생
map.get(s2);  // null! (hashCode가 달라서 못 찾음!)

// equals + hashCode 둘 다 재정의하면 → 정상 동작
map.get(s2);  // "A학점" ✅
```

**💡 Lombok의 @Data나 @EqualsAndHashCode가 이걸 자동으로 해준다!**

---

## 2장. toString 🔴

```java
// ❌ 기본 toString (쓸모없음)
Student s = new Student(1L, "홍길동");
System.out.println(s);  // Student@4e25154f (주소값...)

// ✅ toString 재정의
@Override
public String toString() {
    return "Student{id=" + id + ", name=" + name + "}";
}
System.out.println(s);  // Student{id=1, name=홍길동} (유용!)
```

**💡 Lombok의 @ToString이 자동 생성해준다!**

---

## 3장. Objects 유틸 🟡

```java
import java.util.Objects;

// null-safe equals (NPE 방지)
Objects.equals(null, null);    // true
Objects.equals(null, "hello"); // false (NPE 안 남!)
Objects.equals("hello", null); // false

// null-safe hashCode
Objects.hash(id, name);       // null이어도 안전

// null 체크
Objects.requireNonNull(name, "이름은 필수입니다");
// name이 null이면 → NullPointerException 즉시 발생 (빠른 실패)
```

---

## 면접 대비

### 🔴 필수

**Q: "equals와 hashCode를 함께 재정의해야 하는 이유는?"**

> HashMap, HashSet은 먼저 hashCode로 버킷을 찾고, 그 안에서 equals로 비교합니다. equals만 재정의하고 hashCode를 안 하면 같은 객체인데 다른 버킷에 들어가서 찾을 수 없게 됩니다. "equals가 true이면 hashCode도 같아야 한다"는 계약을 지켜야 합니다.

---

## 정리

```
🎯 모든 클래스는 Object를 상속
🎯 equals: 값이 같은지 비교 (재정의 필수!)
🎯 hashCode: 해시 기반 컬렉션 동작에 필수 (equals와 함께!)
🎯 toString: 디버깅에 유용 (재정의 추천)
🎯 Lombok: @Data, @EqualsAndHashCode, @ToString으로 자동 생성
```

---

> 🎯 **다음 주제**: J12 "Enum과 중첩 클래스" — 상수를 안전하게 관리하고, Spring에서 자주 쓰는 Enum 패턴!

