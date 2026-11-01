# 2회차 REVIEW — Spring Bean, DI, Lifecycle, Graceful Shutdown

- 원본 정리: [STUDY_GUIDE.md](./STUDY_GUIDE.md)
- 실습 코드: [my-bean-di-practice](./practice/spring/my-bean-di-practice), [lessonapp2](./practice/spring/lessonapp2)
- 복습일: 2026-10-12
- 설명 방식: 정의 → 왜 필요한가 → 동작 원리 → 한계

2회차도 하나의 인과 사슬이다.

```text
객체가 의존성을 직접 new → 생성 책임이 코드에 고정됨
→ DI: 외부에서 주입 → 조립 코드가 점점 커짐
→ Spring Container가 생성·조립을 대신함 (Bean)
→ 등록 방법 (Annotation / @Bean / XML), 주입 방법 (필드 / 세터 / 생성자)
→ 컨테이너가 관리하니 Bean에도 생명주기가 있음 (@PostConstruct / @PreDestroy)
→ 종료는 어디서 시작되나? → OS 프로세스, 시스템콜, 시그널
→ SIGTERM vs SIGKILL → Signal → JVM → Context close → @PreDestroy
→ Graceful Shutdown → Kubernetes grace period
```

1회차와의 연결:

```text
1회차: Client → LB → [Spring Server] → DB/Redis/MQ        (서버 바깥)
2회차:               [Controller → Service → Repository]   (서버 안)
```

---

## 1. Dependency (의존성)

**정의**: 어떤 객체가 자기 일을 완성하기 위해 필요로 하는 다른 객체.

```java
// my-bean-di-practice/ProductService.java
public class ProductService {
    private final ProductRepository productRepository;  // 의존성 1
    private final PaymentClient paymentClient;          // 의존성 2
}
```

`ProductService`는 `ProductRepository`와 `PaymentClient` 없이는 `getProducts()`를 완성할 수 없다. 따라서 **ProductService는 이 둘에 의존한다.**

---

## 2. DI (Dependency Injection, 의존성 주입)

**정의**: 객체가 필요한 의존성을 **내부에서 직접 생성하지 않고 외부에서 전달받는** 설계 방식.

```java
// ❌ 직접 생성 — 어떤 구현을 쓸지가 내부에 고정된다
public class PayService {
    private final PointService pointService = new PointService();
}

// ✅ 주입 — 무엇을 쓸지는 바깥이 결정한다
public class PayService {
    private final PointService pointService;
    public PayService(PointService pointService) {
        this.pointService = pointService;
    }
}
```

**왜 필요한가**

- **교체 가능성**: 테스트에서는 가짜 객체(Mock), 운영에서는 실제 객체를 넣을 수 있다.
- **변경 격리**: 의존성의 생성 방식(생성자 인자, 설정값)이 바뀌어도 사용하는 쪽 코드는 바뀌지 않는다.

**⚠️ DI는 Spring 기능이 아니라 설계 방식이다.** `lessonapp2/DiMain.java`가 Spring 없이 순수 Java로 DI를 한 예다.

```java
// lessonapp2/DiMain.java
PointService pointService = new PointService();
PayService payService = new PayService(pointService);   // 이것이 DI
```

**한계**: 객체가 수십~수백 개가 되면 **조립 코드(누구를 먼저 만들어 어디에 넣을지)** 를 직접 관리하기 어렵다. → Spring Container의 등장.

---

## 3. Spring Bean과 Spring Container

**정의**

- **Spring Container (ApplicationContext)**: 객체를 생성하고, 의존 관계를 연결하고, 생명주기를 관리하는 Spring의 핵심 구성요소.
- **Spring Bean**: Spring Container가 **생성하고 관리하는 객체**.

**원리**: 각 클래스는 **생성자로 "나는 무엇이 필요하다"를 선언**만 한다. Container가 의존 관계를 분석해 **필요한 Bean을 먼저 만들고 주입하는 순서**를 정한다.

```text
ProductController → ProductService 필요
ProductService    → ProductRepository, PaymentClient 필요

Container 생성 순서:
ProductRepository, PaymentClient → ProductService → ProductController
```

**용어 — IoC (Inversion of Control, 제어의 역전)** (보충): 객체 생성과 연결의 **제어권이 내 코드에서 프레임워크로 넘어간 것**. DI는 IoC를 구현하는 대표적인 방법이다.

**Bean의 기본 스코프는 싱글톤이다** (보충): Container는 Bean을 **하나만 만들어 모든 곳에 같은 인스턴스를 주입**한다. 여러 요청 스레드가 **같은 Bean 객체를 공유**하므로, Bean에 변경 가능한 상태(필드)를 두면 안 된다. → 5·6회차 동시성과 연결.

---

## 4. Bean 등록 방법

### ① Annotation (Component Scan)

클래스에 Annotation을 붙이면 Spring이 스캔해서 Bean으로 등록한다.

| Annotation        | 계층       | 역할                         |
| ----------------- | ---------- | ---------------------------- |
| `@Component`      | 일반       | 특정 계층에 속하지 않는 Bean |
| `@RestController` | Controller | HTTP 요청·응답 (JSON)        |
| `@Controller`     | Controller | View를 반환하는 MVC          |
| `@Service`        | Service    | 비즈니스 로직                |
| `@Repository`     | Repository | DB 접근                      |

`@Service`, `@Repository`, `@Controller`는 모두 `@Component`의 특수화다. Bean 등록 기능은 같고, **계층의 역할을 표현**하려고 이름을 나눴다.

### ② `@Configuration` + `@Bean`

설정 클래스의 메서드가 **반환하는 객체**를 Bean으로 등록한다.

```java
// my-bean-di-practice/AppConfig.java
@Configuration
public class AppConfig {
    @Bean
    public PaymentClient paymentClient() {
        return new PaymentClient();
    }
}
```

**언제 쓰나**

- **소스를 수정할 수 없는 클래스**(외부 라이브러리)라 Annotation을 붙일 수 없을 때
- 생성에 **조건 분기, 설정값, Builder/Factory**가 필요할 때
- **환경별로 다른 구현체**를 등록할 때

`PaymentClient`에는 `@Component`가 없다. 외부 라이브러리 클래스라고 가정한 것이다. 그래서 `AppConfig`에서 등록하고, `ProductService`는 생성자로 주입받는다.

### ③ XML

```xml
<bean id="payService" class="org.backend.lessonapp2.PayService" />
```

레거시 방식. 읽을 수만 있으면 된다.

**우선순위**: Annotation > `@Configuration`/`@Bean` > XML(읽기만)

---

## 5. DI 방법 (주입 방식)

| 방식            | 형태                  | 평가                    |
| --------------- | --------------------- | ----------------------- |
| **필드 주입**   | 필드에 `@Autowired`   | ❌ 신규 코드에서 비권장 |
| **세터 주입**   | setter에 `@Autowired` | △ 선택적 의존성에만     |
| **생성자 주입** | 생성자 파라미터       | ✅ 기본값               |

**필드 주입이 비권장인 이유**

- `final`을 쓸 수 없어 불변이 보장되지 않는다.
- 의존성이 외부에 드러나지 않는다(숨은 의존성).
- Spring 없이 `new`로 만들면 필드가 null이라 **순수 Java 테스트가 어렵다.**

**생성자 주입을 권장하는 이유**

1. **필수 의존성이 생성 시점에 반드시 채워진다.** 없으면 객체 자체가 만들어지지 않는다.
2. **`private final`** 로 불변을 보장한다.
3. **테스트에서 `new ProductService(가짜Repo, 가짜Client)`로 바로 생성**할 수 있다.
4. 생성자 파라미터가 길어지면 **"이 클래스는 책임이 너무 많다"** 는 설계 신호가 된다.

```java
@RequiredArgsConstructor   // Lombok: final 필드를 받는 생성자를 자동 생성
@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final PaymentClient paymentClient;
}
```

생성자가 하나뿐이면 `@Autowired`를 생략해도 Spring이 그 생성자로 주입한다.

---

## 6. Bean Lifecycle (생명주기)

**정의**: Container가 Bean을 관리하는 전체 과정.

```text
1. 객체 생성 (생성자 호출)
2. 의존성 주입
3. 초기화 콜백      ← @PostConstruct
4. 사용
5. 종료 콜백        ← @PreDestroy  (Container가 닫힐 때)
6. 소멸
```

### `@PostConstruct`

- **시점**: 객체 생성과 **DI가 끝난 직후**.
- **왜 생성자가 아닌가**: 생성자 시점에는 의존성 주입이 끝나지 않은 경우가 있다(필드·세터 주입). `@PostConstruct`는 **주입된 의존성을 안전하게 쓸 수 있는 첫 시점**이다.
- **주의**: 무거운 작업을 넣으면 서버 기동이 느려지고, 실패하면 **애플리케이션이 뜨지 않는다.**

### `@PreDestroy`

- **시점**: Container가 종료될 때, Bean이 제거되기 **직전**.
- **목적**: 리소스 정리 기회.

```java
// my-bean-di-practice/ShutDownLogService.java
@PreDestroy
public void destroy() {
    System.out.println("[destroy] 종료 전 정리 작업 시작");
    ...
}
```

| ✅ 넣기 좋은 것                  | ❌ 넣으면 안 되는 것                       |
| -------------------------------- | ------------------------------------------ |
| 짧은 로그, scheduler/worker 중지 | 오래 걸리는 대량 DB 작업                   |
| connection·file close, flush     | 새로운 비즈니스 작업 시작                  |
| thread pool shutdown 요청        | 무한 대기, 응답이 불확실한 외부 API 호출   |
| 처리 중 작업 상태 저장           | 종료 시간을 예측할 수 없는 작업            |

`@PreDestroy`는 **마지막 정리 기회**이지, 일을 새로 시작하는 자리가 아니다.

그러면 **"Container가 종료될 때"는 언제인가?** 이것을 이해하려면 OS 레벨로 내려가야 한다.

---

## 7. 프로세스와 시스템콜

**프로세스**: 실행 중인 프로그램. Spring 서버도 OS 위의 **JVM 프로세스 하나**다.

**시스템콜**: 프로그램이 **OS 커널에 기능을 요청하는 인터페이스**. 프로그램은 하드웨어(파일, 네트워크, 메모리)를 직접 다룰 수 없어 반드시 커널을 거친다.

| 분류    | 예                        | 백엔드에서              |
| ------- | ------------------------- | ----------------------- |
| File    | `open`, `read`, `write`   | 로그·설정 파일          |
| Socket  | `listen`, `read`, `write` | HTTP 요청 수신, DB 통신 |
| Memory  | 할당·해제                 | 객체 메모리             |
| Process | `fork`, `exit`, `signal`  | 프로세스 생성·종료      |

사용자 모드 → 커널 모드 전환 비용이 있어 일반 함수 호출보다 느리다.

**핵심**: 서버는 OS 위의 프로세스이고, **종료도 OS의 프로세스 제어(시그널)로 시작된다.** (5회차의 `fork`, `clone` 시스템콜로 이어진다.)

---

## 8. 시그널 (Signal)

**정의**: OS가 프로세스에게 보내는 **비동기 알림**. 프로세스는 시그널마다 **핸들러를 등록해 직접 처리**할 수 있다(일부 제외).

| Signal         | 발생                       | 의미              | 핸들링        |
| -------------- | -------------------------- | ----------------- | ------------- |
| `SIGINT` (2)   | `Ctrl+C`                   | 인터럽트          | ✅ 가능       |
| `SIGTERM` (15) | `kill PID`, `kill -15 PID` | 정상 종료 **요청** | ✅ 가능       |
| `SIGKILL` (9)  | `kill -9 PID`              | 강제 종료         | ❌ **불가능** |

- `SIGINT`/`SIGTERM`: 프로세스가 받아서 **정리 후 종료**할 수 있다. 핸들러가 없으면 기본 동작은 종료다.
- `SIGKILL`: 커널이 프로세스를 **즉시 제거**한다. 프로세스에 처리 기회가 없다.

`lessonapp2/SignalMain.java`는 SIGINT 핸들러를 직접 등록한 예다.

```java
Signal.handle(new Signal("INT"), sig -> {
    System.out.println("SIGINT received!");
    // System.exit(0);
});
while (true) { Thread.sleep(1000); System.out.println("RUNNING..."); }
```

**SIGTERM에도 안 꺼지는 경우**: 종료 플래그를 확인하지 않는 무한 루프, 끝나지 않는 non-daemon 스레드, 무한 대기하는 외부 호출. 이때 최후 수단으로 `kill -9`를 쓴다.

---

## 9. 시그널에서 `@PreDestroy`까지

**⚠️ `@PreDestroy`는 시그널을 직접 받지 않는다.**

```text
1. OS / IDE / Kubernetes → JVM 프로세스에 SIGTERM(또는 SIGINT)
2. JVM이 종료 절차 시작 → 등록된 shutdown hook 실행
3. Spring Boot가 등록해 둔 shutdown hook → ApplicationContext.close()
4. Container가 Bean들의 destroy callback 호출
5. @PreDestroy 메서드 실행
6. 프로세스 종료
```

```text
Signal → JVM shutdown → Spring context close → destroy callback → @PreDestroy
```

`SIGKILL`이면 1번에서 프로세스가 사라지므로 **2번 이후가 전부 실행되지 않는다.**

---

## 10. Graceful Shutdown

**정의**: 종료 신호를 받으면 즉시 죽지 않고, **새 요청을 막고 진행 중인 작업을 마무리한 뒤** 종료하는 방식.

```text
종료 신호
→ 새 요청 수신 중단
→ 처리 중인 요청 완료 대기
→ 리소스 정리 (DB connection, file, socket, thread pool)
→ Bean destroy callback (@PreDestroy)
→ 종료
```

**왜 필요한가**: 종료 시점에도 진행 중인 작업이 있다. 그냥 끊으면:

- HTTP 요청 중인 사용자가 **에러**를 받는다.
- **DB 트랜잭션**이 중간에 끊긴다.
- 메시지 큐 작업이 **유실되거나 중복 처리**된다.
- 메모리에만 있던 데이터가 **유실**된다.

배포는 결국 "기존 서버 종료 + 새 서버 시작"이므로, **graceful shutdown이 없으면 배포할 때마다 장애가 난다.** (1회차 Scale out의 무중단 배포와 연결)

> 보충: Spring Boot에서는 `server.shutdown=graceful`과 `spring.lifecycle.timeout-per-shutdown-phase`(대기 상한)로 웹 서버의 graceful shutdown을 제어한다. 최신 버전(3.4+)은 graceful이 기본값이다.

**핵심 문장**: 서버는 시작보다 종료가 더 어렵다. 시작은 새로 뜨면 되지만, 종료는 하던 일을 안전하게 내려놓아야 한다.

---

## 11. Kubernetes와 종료 제한 시간

```text
1. Pod 종료 결정
2. Service endpoint에서 제외 시작 (새 트래픽 차단)
3. 컨테이너 메인 프로세스에 SIGTERM
4. Spring graceful shutdown → @PreDestroy
5. terminationGracePeriodSeconds(기본 30초) 안에 끝나야 함
6. 시간 초과 → SIGKILL
```

**핵심**: graceful shutdown은 **플랫폼의 제한 시간 안에** 끝나야 의미가 있다. 정리 작업이 제한 시간을 넘으면 결국 SIGKILL로 끊긴다.

---

## 2회차 요약

| 개념                    | 해결하는 문제                        | 주의할 점                         |
| ----------------------- | ------------------------------------ | --------------------------------- |
| DI                      | 의존성 생성 책임 고정, 테스트 어려움 | Spring 전용 개념이 아님           |
| Spring Container / Bean | 대규모 조립 코드 관리                | 기본 싱글톤 → 상태를 두면 안 됨   |
| `@Bean`                 | 수정할 수 없는 클래스 등록, 복잡한 생성 | —                              |
| 생성자 주입             | 필수 의존성 보장, 불변, 테스트       | 파라미터가 길면 설계 신호         |
| `@PostConstruct`        | DI 완료 후 초기화                    | 무거운 작업 → 기동 실패·지연      |
| `@PreDestroy`           | 종료 전 리소스 정리                  | SIGKILL이면 실행 안 됨            |
| Graceful Shutdown       | 종료·배포 시 요청·데이터 유실        | 플랫폼 제한 시간 안에 끝나야 함   |

---

## 확인 질문

### Q1. Dependency와 DI를 정의하고, DI가 Spring 전용 개념이 아닌 이유는?

<details><summary>모범 답안</summary>

Dependency는 객체가 자기 일을 완성하기 위해 필요한 다른 객체다. DI는 그 의존성을 내부에서 `new`하지 않고 외부(생성자 등)에서 전달받는 설계 방식이다. `DiMain.java`처럼 순수 Java에서도 생성자에 넘기기만 하면 DI이므로 Spring 전용이 아니다. Spring은 이 조립을 자동으로 해주는 도구다.

</details>

### Q2. `@Bean` 방식은 어떤 경우에 쓰나?

<details><summary>모범 답안</summary>

소스를 수정할 수 없는 외부 라이브러리 클래스라 `@Component`를 붙일 수 없을 때, 생성에 조건 분기·설정값·Builder/Factory가 필요할 때, 환경별로 다른 구현체를 등록할 때 쓴다. 메서드가 반환한 객체를 Container가 Bean으로 관리한다.

</details>

### Q3. 생성자 주입을 필드 주입보다 권장하는 이유는?

<details><summary>모범 답안</summary>

1. 필수 의존성이 객체 생성 시점에 반드시 채워진다.
2. `final`로 불변을 보장한다.
3. 테스트에서 `new`로 가짜 객체를 넣어 바로 생성할 수 있다.
4. 파라미터가 길어지면 책임 과다라는 설계 신호를 준다.

</details>

### Q4. `SignalMain`을 실행하고 `Ctrl+C`를 누르면? 이 프로그램은 어떻게 종료하나?

<details><summary>모범 답안</summary>

`Ctrl+C`는 SIGINT를 보낸다. 등록한 핸들러가 SIGINT를 가로채 `SIGINT received!`만 출력하고 `System.exit()`를 호출하지 않으므로(주석 처리됨) 프로그램은 계속 `RUNNING...`을 출력한다.

종료하려면 다른 터미널에서 `kill PID`(SIGTERM — 핸들러를 등록하지 않았으므로 JVM이 종료 절차를 시작)를 보내거나, 최후 수단으로 `kill -9 PID`(SIGKILL — 핸들링 불가, 즉시 제거)를 보낸다.

</details>

### Q5. "`@PreDestroy`는 SIGTERM을 받아서 실행된다"는 왜 부정확한가?

<details><summary>모범 답안</summary>

`@PreDestroy`는 시그널을 직접 받지 않는다. SIGTERM을 받은 JVM이 종료 절차를 시작해 shutdown hook을 실행하고, Spring Boot가 등록한 hook이 ApplicationContext를 닫으면서 Bean의 destroy callback으로 `@PreDestroy`를 호출한다. SIGKILL이면 이 흐름 자체가 실행되지 않는다.

</details>

### Q6. Kubernetes grace period가 30초인데 `@PreDestroy` 정리가 60초 걸리면?

<details><summary>모범 답안</summary>

30초가 지나면 Kubernetes가 SIGKILL을 보내 프로세스가 즉시 제거되고, 정리 작업은 중간에 끊긴다. 정리 작업을 제한 시간 안에 끝나도록 짧게 만들거나, 필요한 만큼 `terminationGracePeriodSeconds`와 Spring의 shutdown 대기 시간을 함께 맞춘다.

</details>
