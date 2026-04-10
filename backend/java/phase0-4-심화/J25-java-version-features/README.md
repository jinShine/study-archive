# J25. Java 버전별 핵심 기능 — "Java 8부터 21까지"

> **키워드**: `Java 8` `Java 11` `Java 17` `Java 21` `LTS` `람다` `var` `sealed` `Virtual Thread`

---

## 핵심만 한 문장

**Java 8(람다/스트림), 11(var), 17(sealed/패턴매칭), 21(Virtual Thread)이 핵심이다. 실무는 17 또는 21을 쓴다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~2장 (Java 8, 11) | 현재 가장 많이 쓰이는 버전 |
| 🟡 이해 | 3장 (Java 17) | 최신 LTS |
| 🟢 참고 | 4장 (Java 21) | 최신 LTS |

---

## LTS란?

```
LTS = Long Term Support (장기 지원 버전)

Java 8  (2014) ← 아직 레거시에서 사용
Java 11 (2018) ← 많은 회사에서 사용
Java 17 (2021) ← 현재 주류 ✅
Java 21 (2023) ← 최신 LTS

비LTS (9, 10, 12~16, 18~20): 6개월 지원 → 실무에서 안 씀
```

---

## 1장. Java 8 — 혁명의 시작 🔴

| 기능 | 설명 | 커리큘럼 |
|------|------|---------|
| **람다** | 익명 함수 한 줄 | J17 |
| **스트림** | 함수형 데이터 처리 | J18 |
| **Optional** | null 안전 처리 | J19 |
| **인터페이스 default 메서드** | 인터페이스에 구현 가능 | J09 |
| **LocalDate/Time** | 새로운 날짜/시간 API | - |

```java
// Java 8의 핵심들 (이미 배운 것!)
students.stream()
    .filter(s -> s.getScore() >= 80)
    .map(Student::getName)
    .collect(Collectors.toList());

Optional<Student> opt = repository.findById(id);
```

---

## 2장. Java 11 🔴

| 기능 | 설명 |
|------|------|
| **var** | 지역 변수 타입 추론 |
| **String 메서드** | isBlank(), strip(), repeat(), lines() |
| **Files.readString** | 파일 한 줄로 읽기 |
| **HttpClient** | 새로운 HTTP 클라이언트 |

```java
// var: 타입 추론
var list = new ArrayList<String>();   // ArrayList<String>로 추론
var name = "홍길동";                  // String으로 추론
var count = 42;                       // int로 추론

// ⚠️ var 쓸 때 주의
var result = someMethod();  // 반환 타입이 뭔지 한눈에 안 보임
// → 타입이 명확할 때만 사용!

// String 새 메서드
"  ".isBlank();          // true (공백만)
" hello ".strip();        // "hello" (trim 개선, 유니코드 지원)
"ha".repeat(3);          // "hahaha"
"a\nb\nc".lines().toList(); // ["a", "b", "c"]
```

---

## 3장. Java 17 🟡

| 기능 | 설명 |
|------|------|
| **sealed class** | 상속 제한 |
| **패턴 매칭 instanceof** | 캐스팅 간소화 |
| **switch 표현식** | 완전한 switch 식 |
| **텍스트 블록** | 여러 줄 문자열 |
| **record** | 불변 데이터 클래스 (J10 참고) |

```java
// 패턴 매칭 instanceof (Java 16+)
// ❌ 기존
if (obj instanceof String) {
    String s = (String) obj;
    System.out.println(s.length());
}

// ✅ 패턴 매칭
if (obj instanceof String s) {
    System.out.println(s.length());  // 바로 사용!
}

// 텍스트 블록 (Java 15+)
String json = """
    {
        "name": "홍길동",
        "age": 25
    }
    """;

// sealed class: 허용된 클래스만 상속 가능
public sealed class Shape permits Circle, Rectangle, Triangle { }
```

---

## 4장. Java 21 🟢

| 기능 | 설명 |
|------|------|
| **Virtual Thread** | 경량 스레드 (J22 참고) |
| **Record 패턴** | record 분해 |
| **switch 패턴 매칭** | 타입별 분기 |

```java
// switch 패턴 매칭
String describe(Object obj) {
    return switch (obj) {
        case Integer i -> "정수: " + i;
        case String s  -> "문자열: " + s;
        case null      -> "null!";
        default        -> "기타: " + obj;
    };
}

// Virtual Thread
Thread.ofVirtual().start(() -> doWork());
```

---

## 면접 대비

### 🔴 필수

**Q: "프로젝트에서 Java 몇 버전을 사용하시나요?"**

> Java 17 LTS를 사용합니다. Java 8의 람다/스트림/Optional은 기본이고, var(11), record(16), sealed class(17), 텍스트 블록(15) 등 최신 문법도 활용합니다.

---

## 정리

```
🎯 LTS 버전만 실무에서 사용 (8, 11, 17, 21)

Java 8:  람다, 스트림, Optional ← 혁명
Java 11: var, String 메서드
Java 17: record, sealed, 패턴 매칭 ← 현재 주류
Java 21: Virtual Thread ← 최신
```

---

> 🎯 **다음 주제**: J26 "Effective Java 핵심 정리" — Java를 잘 쓰는 방법의 바이블!

