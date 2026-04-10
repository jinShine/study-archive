# J14. 컬렉션 — Map — "Key로 Value를 찾기"

> **키워드**: `HashMap` `TreeMap` `LinkedHashMap` `Map.of()` `해시 충돌` `ConcurrentHashMap`

---

## 핵심만 한 문장

**Map은 "키(key) → 값(value)" 쌍으로 저장하는 자료구조다. HashMap이 기본이고, 키의 equals/hashCode가 정확해야 한다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~2장 (HashMap 사용법, 내부 구조) | 매일 쓰는 자료구조 |
| 🟡 이해 | 3장 (TreeMap, LinkedHashMap) | 특수 상황 |
| 🟢 참고 | 4장 (ConcurrentHashMap) | 멀티스레드 |

---

## 1장. HashMap 기본 사용 🔴

### 비유

```
Map = 사전 (단어 → 뜻)

"apple" → "사과"
"banana" → "바나나"

key로 검색하면 value를 찾을 수 있다!
```

### 코드

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Integer> scores = new HashMap<>();

// 추가
scores.put("홍길동", 90);
scores.put("김길동", 85);
scores.put("이길동", 95);

// 조회
scores.get("홍길동");          // 90
scores.get("없는사람");         // null

// 안전한 조회
scores.getOrDefault("없는사람", 0);  // 0 (없으면 기본값)

// 포함 여부
scores.containsKey("홍길동");   // true
scores.containsValue(90);       // true

// 삭제
scores.remove("김길동");

// 크기
scores.size();                  // 2

// 순회
for (Map.Entry<String, Integer> entry : scores.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}

// 또는
scores.forEach((name, score) -> {
    System.out.println(name + ": " + score);
});
```

### 불변 Map

```java
Map<String, Integer> immutable = Map.of(
    "홍길동", 90,
    "김길동", 85
);
// immutable.put("이길동", 95);  // ❌ UnsupportedOperationException!
```

---

## 2장. HashMap 내부 구조 🔴

```
HashMap = 배열 + 연결 리스트 (또는 트리)

put("홍길동", 90) 호출 시:
1. "홍길동".hashCode() → 해시값 계산 (예: 12345)
2. 12345 % 배열크기 → 인덱스 결정 (예: 5)
3. 배열[5]에 저장

get("홍길동") 호출 시:
1. "홍길동".hashCode() → 12345
2. 12345 % 배열크기 → 5
3. 배열[5]에서 equals()로 비교해서 찾기

→ 그래서 hashCode()와 equals()가 중요한 것! (J11 참고)
```

### 해시 충돌

```
"홍길동".hashCode() % 16 = 5
"박길동".hashCode() % 16 = 5  ← 같은 인덱스! (충돌)

해결: 배열[5]에 연결 리스트로 체이닝
  배열[5] → [홍길동:90] → [박길동:88]

Java 8+: 충돌이 8개 넘으면 트리로 변환 (O(n) → O(log n))
```

---

## 3장. TreeMap, LinkedHashMap 🟡

| Map | 특징 | 순서 |
|-----|------|------|
| **HashMap** | 가장 빠름 | 순서 없음 |
| **LinkedHashMap** | 입력 순서 유지 | 삽입 순서 |
| **TreeMap** | 키 기준 자동 정렬 | 키 오름차순 |

```java
// TreeMap: 키 정렬
Map<String, Integer> sorted = new TreeMap<>();
sorted.put("바나나", 3);
sorted.put("사과", 1);
sorted.put("포도", 2);
// 순회하면: 바나나, 사과, 포도 (가나다순)
```

---

## 4장. ConcurrentHashMap 🟢

```java
// 멀티스레드에서 안전한 HashMap
Map<String, Integer> concurrent = new ConcurrentHashMap<>();
// 여러 스레드가 동시에 put/get해도 안전!

// ❌ HashMap은 멀티스레드에서 위험
// ✅ ConcurrentHashMap 사용 (J21 동시성에서 자세히)
```

---

## 면접 대비

### 🔴 필수

**Q: "HashMap의 동작 원리는?"**

> 키의 hashCode()로 배열 인덱스를 결정하고, 해당 위치에 키-값 쌍을 저장합니다. 조회 시에도 hashCode()로 위치를 찾고 equals()로 정확한 키를 비교합니다. 해시 충돌 시 연결 리스트나 트리로 체이닝합니다. 평균 O(1), 최악 O(log n)입니다.

**Q: "HashMap과 TreeMap의 차이는?"**

> HashMap은 해시 기반으로 순서가 없고 O(1)이며, TreeMap은 레드-블랙 트리 기반으로 키가 자동 정렬되고 O(log n)입니다. 정렬이 필요하면 TreeMap, 아니면 HashMap을 사용합니다.

---

## 정리

```
🎯 Map = Key → Value (사전처럼)
🎯 HashMap: 가장 빠름, 순서 없음 (기본!)
🎯 getOrDefault(): null 방지
🎯 내부: hashCode()로 인덱스 → equals()로 비교
🎯 불변: Map.of("key", value)
```

---

> 🎯 **다음 주제**: J15 "예외 처리" — try-catch와 체크/언체크 예외의 차이!

