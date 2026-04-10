# J24. 디자인 패턴 — 구조/행위 — "Spring이 쓰는 패턴들"

> **키워드**: `어댑터` `데코레이터` `전략` `템플릿 메서드` `옵저버` `Spring 연결`

---

## 핵심만 한 문장

**Spring 내부가 이 패턴들로 만들어져 있다. 패턴을 알면 "Spring이 왜 이렇게 생겼는지" 이해된다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~2장 (전략, 템플릿 메서드) | Spring에서 가장 많이 쓰이는 패턴 |
| 🟡 이해 | 3장 (어댑터, 옵저버) | Spring 내부 구조 이해 |
| 🟢 참고 | 4장 (데코레이터) | 특수 상황 |

---

## 1장. 전략 패턴 — "알고리즘을 갈아끼우기" 🔴

### 비유

```
전략 패턴 = 교통수단 선택

목적지는 같은데, 가는 방법(전략)을 바꿀 수 있다
  → 버스로 가기
  → 택시로 가기
  → 자전거로 가기
```

### 코드

```java
// 전략 인터페이스
public interface SortStrategy {
    void sort(int[] data);
}

// 전략 구현
public class BubbleSort implements SortStrategy {
    public void sort(int[] data) { /* 버블 정렬 */ }
}

public class QuickSort implements SortStrategy {
    public void sort(int[] data) { /* 퀵 정렬 */ }
}

// 컨텍스트 (전략을 사용하는 쪽)
public class Sorter {
    private final SortStrategy strategy;
    
    public Sorter(SortStrategy strategy) {
        this.strategy = strategy;  // 전략을 주입!
    }
    
    public void doSort(int[] data) {
        strategy.sort(data);
    }
}

// 사용 (전략 교체가 자유!)
Sorter sorter = new Sorter(new QuickSort());
sorter.doSort(data);
```

### Spring에서

```java
// Spring DI가 바로 전략 패턴!
@Service
public class StudentService {
    private final StudentRepository repository;  // ← 전략 (인터페이스)
    // Memory? JPA? 구현체를 갈아끼울 수 있다!
}
```

---

## 2장. 템플릿 메서드 — "뼈대는 고정, 세부만 변경" 🔴

### 비유

```
템플릿 = 서류 양식
  → 양식은 정해져 있고, 내용만 채우면 됨
```

### 코드

```java
// 추상 클래스 (뼈대)
public abstract class DataProcessor {
    
    // 템플릿 메서드 (순서 고정!)
    public final void process() {
        readData();      // Step 1
        processData();   // Step 2 (하위 클래스가 구현)
        saveResult();    // Step 3
    }
    
    private void readData() { System.out.println("데이터 읽기"); }
    protected abstract void processData();  // ← 이것만 바꿈!
    private void saveResult() { System.out.println("결과 저장"); }
}

// 구현
public class CsvProcessor extends DataProcessor {
    @Override
    protected void processData() {
        System.out.println("CSV 데이터 처리");
    }
}

public class JsonProcessor extends DataProcessor {
    @Override
    protected void processData() {
        System.out.println("JSON 데이터 처리");
    }
}
```

### Spring에서

```java
// JdbcTemplate이 대표적 템플릿 메서드 패턴!
// → 커넥션 연결/해제는 고정, SQL 실행만 사용자가 제공
jdbcTemplate.query("SELECT * FROM users", (rs, row) -> {
    return new User(rs.getLong("id"), rs.getString("name"));
});
```

---

## 3장. 어댑터, 옵저버 🟡

### 어댑터 — "호환되지 않는 인터페이스 연결"

```java
// Spring: HandlerAdapter가 어댑터 패턴!
// DispatcherServlet → HandlerAdapter → Controller
// 다양한 형태의 Controller를 통일된 방식으로 호출
```

### 옵저버 — "이벤트 발생 시 알림"

```java
// Spring: @EventListener가 옵저버 패턴!
@EventListener
public void handleOrderCreated(OrderCreatedEvent event) {
    // 주문 생성 이벤트가 발생하면 자동 호출!
    sendEmail(event.getOrder());
}
```

---

## 4장. 데코레이터 🟢

```java
// 기존 기능에 추가 기능을 감싸서 덧붙이기
// Java I/O가 데코레이터 패턴!
new BufferedReader(new InputStreamReader(new FileInputStream("file.txt")));
//  버퍼 기능  +   문자 변환 기능  +  파일 읽기 기능
```

---

## 면접 대비

### 🔴 필수

**Q: "전략 패턴이 뭔가요?"**

> 동일한 인터페이스를 구현한 여러 알고리즘(전략)을 런타임에 교체할 수 있는 패턴입니다. Spring DI가 전략 패턴의 대표적 활용 사례입니다. Repository 인터페이스를 선언하고 JPA/Memory 구현체를 교체하는 것이 전략 패턴입니다.

---

## 정리

```
🎯 전략 패턴: 알고리즘 교체 (Spring DI!)
🎯 템플릿 메서드: 뼈대 고정 + 세부 변경 (JdbcTemplate!)
🎯 어댑터: 호환되지 않는 인터페이스 연결 (HandlerAdapter!)
🎯 옵저버: 이벤트 알림 (@EventListener!)
```

---

> 🎯 **다음 주제**: J25 "Java 버전별 핵심 기능"

