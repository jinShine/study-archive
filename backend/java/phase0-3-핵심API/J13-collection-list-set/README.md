# J13. 컬렉션 — List와 Set — "데이터를 묶어서 관리하기"

> **키워드**: `List` `ArrayList` `LinkedList` `Set` `HashSet` `TreeSet` `Comparable` `Comparator`

---

## 핵심만 한 문장

**배열은 크기가 고정이고, List는 크기가 자동으로 늘어난다. Set은 중복을 허용하지 않는다. 실무에서는 ArrayList를 가장 많이 쓴다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~2장 (ArrayList, HashSet) | 매일 쓰는 컬렉션 |
| 🟡 이해 | 3장 (Comparable/Comparator) | 정렬 시 필요 |
| 🟢 참고 | 4장 (LinkedList, TreeSet) | 특수 상황 |

---

## 1장. List — 순서 있는 데이터 묶음 🔴

### 배열 vs List

```java
// ❌ 배열: 크기 고정
int[] arr = new int[3];  // 3개만! 더 넣을 수 없음

// ✅ List: 크기 자동 증가
List<Integer> list = new ArrayList<>();
list.add(1);  // [1]
list.add(2);  // [1, 2]
list.add(3);  // [1, 2, 3]
list.add(4);  // [1, 2, 3, 4] ← 자동으로 늘어남!
```

### ArrayList 기본 사용

```java
import java.util.ArrayList;
import java.util.List;

List<String> names = new ArrayList<>();

// 추가
names.add("홍길동");       // [홍길동]
names.add("김길동");       // [홍길동, 김길동]
names.add(0, "이길동");    // [이길동, 홍길동, 김길동] (0번 위치에 삽입)

// 조회
names.get(0);              // "이길동"
names.size();              // 3
names.contains("홍길동");   // true
names.indexOf("김길동");    // 2

// 수정
names.set(0, "박길동");    // [박길동, 홍길동, 김길동]

// 삭제
names.remove(0);           // [홍길동, 김길동]
names.remove("김길동");     // [홍길동]

// 순회
for (String name : names) {
    System.out.println(name);
}
```

### 불변 리스트

```java
// Java 9+
List<String> immutable = List.of("a", "b", "c");
// immutable.add("d");  // ❌ UnsupportedOperationException!

// 가변 리스트로 변환
List<String> mutable = new ArrayList<>(List.of("a", "b", "c"));
mutable.add("d");  // ✅ OK
```

---

## 2장. Set — 중복 없는 데이터 묶음 🔴

### 비유

```
List = 출석부 (같은 이름 여러 개 가능)
Set  = 투표함 (한 사람은 한 표만!)
```

### HashSet 기본 사용

```java
import java.util.HashSet;
import java.util.Set;

Set<String> fruits = new HashSet<>();
fruits.add("사과");    // [사과]
fruits.add("바나나");  // [사과, 바나나]
fruits.add("사과");    // [사과, 바나나] ← 중복 무시!

System.out.println(fruits.size());       // 2
System.out.println(fruits.contains("사과")); // true
```

### List vs Set

| 비교 | List | Set |
|------|------|-----|
| 중복 | ✅ 허용 | ❌ 불허 |
| 순서 | ✅ 유지 | ❌ 보장 안 함 (HashSet) |
| 인덱스 접근 | ✅ `get(i)` | ❌ 불가 |
| 사용 시기 | 순서가 중요할 때 | 유일한 값만 필요할 때 |

---

## 3장. 정렬 — Comparable / Comparator 🟡

### Comparable — "나 자신이 비교 기준을 가짐"

```java
public class Student implements Comparable<Student> {
    String name;
    int score;
    
    @Override
    public int compareTo(Student other) {
        return this.score - other.score;  // 점수 오름차순
    }
}

List<Student> students = new ArrayList<>();
students.add(new Student("홍길동", 85));
students.add(new Student("김길동", 92));
Collections.sort(students);  // score 기준 정렬
```

### Comparator — "외부에서 비교 기준 제공"

```java
// 이름순 정렬
students.sort(Comparator.comparing(s -> s.name));

// 점수 역순 정렬
students.sort(Comparator.comparingInt(s -> s.score).reversed());

// 람다 (J17에서 자세히)
students.sort((a, b) -> b.score - a.score);
```

---

## 4장. LinkedList, TreeSet 🟢

| 컬렉션 | 특징 | 언제? |
|--------|------|-------|
| **ArrayList** | 조회 빠름, 삽입/삭제 느림 | **99% 이것 사용** |
| **LinkedList** | 삽입/삭제 빠름, 조회 느림 | 잦은 삽입/삭제 |
| **HashSet** | 순서 없음, 가장 빠름 | **기본 Set** |
| **TreeSet** | 자동 정렬 | 정렬된 Set |
| **LinkedHashSet** | 입력 순서 유지 | 순서 + 중복 제거 |

---

## 면접 대비

### 🔴 필수

**Q: "ArrayList와 LinkedList의 차이는?"**

> ArrayList는 내부적으로 배열을 사용하므로 인덱스 접근(get)이 O(1)로 빠르지만, 중간 삽입/삭제는 O(n)입니다. LinkedList는 노드 기반이라 삽입/삭제가 O(1)이지만 조회가 O(n)입니다. 대부분의 경우 ArrayList가 성능이 좋아서 기본으로 사용합니다.

---

## 정리

```
🎯 List: 순서 O, 중복 O → ArrayList (99%)
🎯 Set: 순서 X, 중복 X → HashSet (기본)
🎯 정렬: Comparable(내부), Comparator(외부)
🎯 불변 리스트: List.of("a", "b")
```

---

> 🎯 **다음 주제**: J14 "컬렉션 — Map" — Key-Value 쌍으로 데이터를 관리하는 HashMap!

