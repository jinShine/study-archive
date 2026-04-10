# J22. 동시성 심화 — "현대적인 동시성 도구들"

> **키워드**: `CompletableFuture` `Atomic` `ReentrantLock` `Virtual Thread` `동시성 컬렉션`

---

## 핵심만 한 문장

**synchronized는 무거움. CompletableFuture로 비동기 처리하고, AtomicInteger로 가벼운 동기화를, Virtual Thread(Java 21)로 대량 동시성을 해결한다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1장 (CompletableFuture) | Spring @Async의 기반 |
| 🟡 이해 | 2장 (Atomic, ConcurrentHashMap) | 가벼운 동기화 |
| 🟢 참고 | 3장 (Virtual Thread) | Java 21+ 최신 기능 |

---

## 1장. CompletableFuture 🔴

### 비유

```
동기 = 음식 주문하고 기다림 (할 일 없이 서 있음)
비동기 = 주문하고 번호표 받음 (다른 일 하다가 호출되면 가져감)
```

### 코드

```java
import java.util.concurrent.CompletableFuture;

// 비동기 작업 실행
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    // 다른 스레드에서 실행
    return "결과!";
});

// 결과 받기
String result = future.get();  // "결과!" (완료될 때까지 대기)

// 체이닝 (콜백)
CompletableFuture.supplyAsync(() -> "홍길동")
    .thenApply(name -> name + "님")            // 변환
    .thenApply(String::toUpperCase)             // 또 변환
    .thenAccept(System.out::println);           // 소비
// 출력: "홍길동님" → "홍길동님" (대문자 변환 안 됨, 한글이라)

// 여러 비동기 작업 병렬 실행
CompletableFuture<String> f1 = CompletableFuture.supplyAsync(() -> callApi1());
CompletableFuture<String> f2 = CompletableFuture.supplyAsync(() -> callApi2());

CompletableFuture.allOf(f1, f2).join();  // 둘 다 끝날 때까지 대기
```

**💡 Spring의 @Async가 내부적으로 CompletableFuture를 사용!**

---

## 2장. Atomic 클래스 🟡

```java
import java.util.concurrent.atomic.AtomicInteger;

// synchronized보다 가벼운 동기화
AtomicInteger count = new AtomicInteger(0);

count.incrementAndGet();  // 1 (원자적 증가)
count.get();              // 1
count.compareAndSet(1, 5); // true (1이면 5로 변경)

// 여러 스레드에서 안전!
// synchronized 없이도 정확한 카운팅!
```

### ConcurrentHashMap

```java
import java.util.concurrent.ConcurrentHashMap;

// 멀티스레드에서 안전한 HashMap
Map<String, Integer> map = new ConcurrentHashMap<>();
map.put("count", 0);
map.compute("count", (key, val) -> val + 1);  // 원자적 업데이트
```

---

## 3장. Virtual Thread (Java 21) 🟢

```java
// 기존 Thread: OS 스레드 (무거움, 수천 개가 한계)
Thread t = new Thread(() -> doWork());

// Virtual Thread: JVM이 관리 (가벼움, 수백만 개 가능!)
Thread vt = Thread.ofVirtual().start(() -> doWork());

// ExecutorService와 함께
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 100_000; i++) {
        executor.submit(() -> doWork());  // 10만 개도 OK!
    }
}
```

---

## 면접 대비

### 🔴 필수

**Q: "CompletableFuture가 뭔가요?"**

> Java 8에서 도입된 비동기 프로그래밍 도구입니다. `supplyAsync()`로 다른 스레드에서 작업을 실행하고, `thenApply()`로 결과를 변환하는 체이닝이 가능합니다. `allOf()`로 여러 비동기 작업을 병렬로 실행할 수도 있습니다.

---

## 정리

```
🎯 CompletableFuture: 비동기 작업 + 체이닝 (Spring @Async 기반)
🎯 AtomicInteger: synchronized보다 가벼운 원자적 연산
🎯 ConcurrentHashMap: 멀티스레드 안전 Map
🎯 Virtual Thread: 수백만 동시 작업 (Java 21)
```

---

> 🎯 **다음 주제**: J23 "디자인 패턴 — 생성" — 싱글톤, 빌더, 팩토리!

