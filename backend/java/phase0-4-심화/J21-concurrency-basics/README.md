# J21. 동시성 기초 — "여러 일을 동시에 처리하기"

> **키워드**: `Thread` `Runnable` `synchronized` `volatile` `데드락` `ExecutorService` `Thread Pool`

---

## 핵심만 한 문장

**Thread는 "동시에 실행되는 작업 단위"다. 여러 스레드가 같은 데이터를 수정하면 문제가 생기고, synchronized로 해결한다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~2장 (Thread 기본, synchronized) | 동시성 문제 이해 |
| 🟡 이해 | 3장 (ExecutorService) | 실무 패턴 |
| 🟢 참고 | 4장 (데드락, volatile) | 면접 심화 |

---

## 1장. Thread 기본 🔴

### 비유

```
스레드 = 요리사

요리사 1명 = 싱글 스레드 (한 번에 한 요리)
요리사 3명 = 멀티 스레드 (동시에 3개 요리)
```

### Thread 생성

```java
// 방법 1: Runnable (추천!)
Runnable task = () -> {
    System.out.println(Thread.currentThread().getName() + " 실행 중");
};

Thread t = new Thread(task);
t.start();  // 새 스레드에서 실행!

// 방법 2: Thread 상속
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("스레드 실행!");
    }
}
new MyThread().start();
```

---

## 2장. 동시성 문제와 synchronized 🔴

### 문제: 경쟁 조건

```java
public class Counter {
    private int count = 0;
    
    public void increment() {
        count++;  // ← 이게 한 번에 안 끝남! (읽기 → 증가 → 쓰기)
    }
}

Counter counter = new Counter();

// 2개 스레드가 동시에 increment
Thread t1 = new Thread(() -> { for (int i = 0; i < 10000; i++) counter.increment(); });
Thread t2 = new Thread(() -> { for (int i = 0; i < 10000; i++) counter.increment(); });
t1.start(); t2.start();
t1.join(); t2.join();

System.out.println(counter.count);  // 20000이 아닐 수 있음! (예: 18543)
```

### 해결: synchronized

```java
public class Counter {
    private int count = 0;
    
    public synchronized void increment() {  // ← 한 번에 하나의 스레드만!
        count++;
    }
}
// 이제 항상 20000!
```

---

## 3장. ExecutorService — 스레드 풀 🟡

```java
// ❌ 매번 new Thread() (스레드 생성 비용이 큼)
for (int i = 0; i < 100; i++) {
    new Thread(() -> doWork()).start();
}

// ✅ ExecutorService (스레드를 재사용)
ExecutorService executor = Executors.newFixedThreadPool(10);  // 10개 스레드 풀

for (int i = 0; i < 100; i++) {
    executor.submit(() -> doWork());  // 10개 스레드가 100개 작업을 나눠서 처리
}

executor.shutdown();  // 모든 작업 완료 후 종료
```

---

## 4장. 데드락과 volatile 🟢

### 데드락

```
스레드 A: 자원1을 잠그고 → 자원2를 기다림
스레드 B: 자원2를 잠그고 → 자원1을 기다림
→ 둘 다 영원히 대기! (데드락)

방지: 항상 같은 순서로 잠그기
```

### volatile

```java
private volatile boolean running = true;  // 다른 스레드에서 변경한 값을 즉시 반영
```

---

## 면접 대비

### 🔴 필수

**Q: "synchronized가 뭔가요?"**

> 한 번에 하나의 스레드만 해당 코드 블록에 접근할 수 있게 하는 키워드입니다. 여러 스레드가 같은 데이터를 동시에 수정하면 경쟁 조건이 발생하는데, synchronized로 상호 배제를 보장합니다.

---

## 정리

```
🎯 Thread = 동시 실행 단위
🎯 경쟁 조건: 여러 스레드가 같은 데이터 수정 → 버그!
🎯 synchronized: 한 번에 하나만 접근
🎯 ExecutorService: 스레드 풀 (스레드 재사용)
🎯 데드락: 서로 상대방 자원을 기다림 → 영원히 멈춤
```

---

> 🎯 **다음 주제**: J22 "동시성 심화" — CompletableFuture, Atomic, Virtual Thread!

