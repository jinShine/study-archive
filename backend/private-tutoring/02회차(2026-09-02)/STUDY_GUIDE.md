# 2회차(2026/09/02) - Spring Bean, DI, Bean Lifecycle, Graceful Shutdown

- 강사님 예제 프로젝트: [lessonapp2](./practice/spring/lessonapp2)
- 내가 직접 치는 빈 프로젝트: [my-bean-di-practice](./practice/spring/my-bean-di-practice)
- 빈 프로젝트 따라치기: [02-from-empty-project-bean-di.md](./practice/spring/02-from-empty-project-bean-di.md)
- `@PreDestroy` 실습: [03-predestroy-graceful-shutdown.md](./practice/spring/03-predestroy-graceful-shutdown.md)
- 원본 메모: [0909-original-notes.txt](./source-materials/0909-original-notes.txt)

## 오늘의 핵심 한 문장

Spring은 객체를 대신 만들고 Bean으로 관리합니다. 그리고 Bean끼리 필요한 의존성을 주입해주며, 애플리케이션이 종료될 때 Bean이 정리할 기회도 줍니다. 그 종료 정리 지점 중 하나가 `@PreDestroy`이고, 이것은 graceful shutdown과 연결됩니다.

전체 흐름은 이렇게 잡으면 됩니다.

```text
Spring Boot 시작
-> Spring Container 생성
-> Bean 생성
-> Dependency Injection
-> @PostConstruct 실행
-> 서버 동작
-> 종료 시그널 수신
-> ApplicationContext 종료
-> @PreDestroy 실행
-> 프로세스 종료
```

## 1. Spring Bean이란 무엇인가

Bean은 Spring이 `new`해서 만들고, Spring Container 안에 들고 있는 객체입니다.

일반 Java에서는 내가 직접 객체를 만듭니다.

```java
PointService pointService = new PointService();
PayService payService = new PayService(pointService);
```

Spring에서는 자주 쓰는 객체를 Spring이 대신 만들고 관리합니다.

```text
내가 직접 new
-> 객체 생성 책임이 내 코드에 있음

Spring Bean
-> 객체 생성과 관리 책임이 Spring Container에 있음
```

그래서 Bean을 이해할 때는 이 질문이 중요합니다.

```text
이 객체는 내가 만든 객체인가?
아니면 Spring이 만들고 들고 있는 객체인가?
```

Controller, Service, Repository는 보통 Spring이 Bean으로 만들어 관리합니다.

## 2. Dependency란 무엇인가

Dependency는 어떤 객체가 동작하기 위해 필요로 하는 다른 객체입니다.

예를 들어 `PayService`가 포인트 적립을 위해 `PointService`를 필요로 한다고 해봅니다.

```java
public class PayService {
    private final PointService pointService;

    public PayService(PointService pointService) {
        this.pointService = pointService;
    }
}
```

여기서 `PointService`는 `PayService`의 dependency입니다.

말로 풀면:

```text
PayService는 PointService 없이는 자기 일을 완성하기 어렵다.
따라서 PayService는 PointService에 의존한다.
```

이 개념은 Spring 전용이 아닙니다. 프론트엔드에서도 컴포넌트가 API client, formatter, auth store를 필요로 하면 그것들이 dependency입니다.

## 3. DI란 무엇인가

DI는 Dependency Injection입니다. 필요한 객체를 내부에서 직접 만들지 않고, 바깥에서 넣어주는 방식입니다.

직접 만드는 코드:

```java
public class PayService {
    private final PointService pointService = new PointService();
}
```

DI 코드:

```java
public class PayService {
    private final PointService pointService;

    public PayService(PointService pointService) {
        this.pointService = pointService;
    }
}
```

DI의 장점은 객체가 자기 dependency를 직접 만들지 않는다는 점입니다. 그래서 테스트할 때 가짜 객체를 넣기 쉽고, 객체 생성 방식이 바뀌어도 사용하는 쪽 코드를 덜 바꾸게 됩니다.

중요합니다.

> DI 자체는 Spring 기능이 아니라 객체를 조립하는 설계 방식입니다.

Spring은 이 DI를 자동으로 해주는 도구입니다.

## 4. Spring DI란 무엇인가

Spring DI는 Spring Container가 Bean들을 만들고, 필요한 Bean을 찾아서 주입해주는 기능입니다.

직접 조립하면 이런 코드가 필요합니다.

```java
CountService countService = new CountService();
ProductService productService = new ProductService(countService);
ProductController productController = new ProductController(productService);
```

Spring을 쓰면 각 클래스를 Bean으로 등록해두고, 생성자로 필요한 의존성을 표현합니다.

```java
@RequiredArgsConstructor
@RestController
public class ProductController {
    private final ProductService productService;
}
```

```java
@RequiredArgsConstructor
@Service
public class ProductService {
    private final ProductRepository productRepository;
}
```

Spring은 이 관계를 보고 객체를 자동으로 연결합니다.

```text
ProductController 필요
-> ProductService Bean 찾아서 주입

ProductService 필요
-> ProductRepository Bean 찾아서 주입
```

## 5. Bean 생성 방법 1 - Annotation

실무에서 가장 자주 보는 방식입니다.

| Annotation | 역할 | 실무 감각 |
| --- | --- | --- |
| `@Component` | 일반 Bean | 특별한 계층 의미가 없을 때 |
| `@RestController` | API Controller Bean | HTTP 요청을 받음 |
| `@Controller` | MVC Controller Bean | View를 반환하는 MVC에서 사용 |
| `@Service` | Service Bean | 비즈니스 로직 |
| `@Repository` | Repository Bean | DB 접근 계층 |

예시:

```java
@Service
public class ProductService {
}
```

```java
@Repository
public class ProductRepository {
}
```

전부 Spring Bean입니다. 이름을 다르게 붙이는 이유는 역할을 구분하기 위해서입니다.

실무에서 중요한 건 이겁니다.

> Controller는 요청/응답, Service는 비즈니스 로직, Repository는 DB 접근을 맡긴다.

## 6. Bean 생성 방법 2 - `@Configuration`, `@Bean`

두 번째 방식은 설정 클래스에서 Bean을 직접 만들어 반환하는 것입니다.

```java
@Configuration
public class BeanConfig {
    @Bean
    public PayService payService() {
        return new PayService(new PointService());
    }
}
```

`@Bean` 메서드가 반환한 객체를 Spring이 Bean으로 등록합니다.

이 방식은 실무에서 중요합니다. 특히 다음 상황에서 씁니다.

- 외부 라이브러리 클래스라서 `@Component`를 붙일 수 없을 때
- 객체 생성에 `if` 문 같은 조건 로직이 필요할 때
- 환경별로 다른 구현체를 Bean으로 등록해야 할 때
- 생성자가 복잡하거나 Builder/Factory를 써야 할 때
- 설정값을 읽어서 객체를 만들어야 할 때

예를 들어 외부 결제 클라이언트는 내가 만든 클래스가 아닐 수 있습니다. 그럴 때는 클래스에 Annotation을 못 붙입니다.

```java
public class ExternalPaymentClient {
    public String ready() {
        return "payment ready";
    }
}
```

이런 경우 Config에서 등록합니다.

```java
@Configuration
public class AppConfig {
    @Bean
    public ExternalPaymentClient externalPaymentClient() {
        return new ExternalPaymentClient();
    }
}
```

핵심:

> 내가 소스 코드를 수정할 수 없는 객체도 `@Bean`으로 Spring Container에 넣을 수 있습니다.

## 7. Bean 생성 방법 3 - XML

예전 Spring에서는 XML로 Bean 설정을 많이 했습니다.

```xml
<bean id="payService" class="org.backend.lessonapp2.PayService" />
```

요즘 Spring Boot 신규 프로젝트에서는 Annotation과 Java Config를 더 많이 씁니다.

그래도 XML을 완전히 무시하면 안 됩니다. 오래된 회사 코드나 레거시 프로젝트에서 만날 수 있기 때문입니다.

지금 학습 우선순위:

```text
1순위: Annotation
2순위: @Configuration + @Bean
3순위: XML은 읽을 수만 있게
```

## 8. DI 방법 1 - Field Injection

필드 주입은 필드에 `@Autowired`를 붙입니다.

```java
@Autowired
private PaymentService paymentService;
```

짧고 쉬워 보이지만, 새 실무 코드에서는 보통 권장하지 않습니다.

이유:

- `final`을 쓸 수 없습니다.
- 객체 생성 시점에 필수 의존성이 채워졌는지 코드만 보고 알기 어렵습니다.
- 순수 Java 테스트가 불편합니다.
- 의존성이 숨겨져 보입니다.

필드 주입은 기존 코드에서 읽을 줄만 알면 됩니다.

## 9. DI 방법 2 - Setter Injection

세터 주입은 setter 메서드에 `@Autowired`를 붙입니다.

```java
@Autowired
public void setPaymentService(PaymentService paymentService) {
    this.paymentService = paymentService;
}
```

선택 의존성에는 사용할 수 있습니다. 하지만 반드시 필요한 의존성이라면 생성자 주입이 더 좋습니다.

```text
필수 의존성
-> 생성자 주입

있어도 되고 없어도 되는 선택 의존성
-> 세터 주입 고려 가능
```

지금은 세터 주입을 많이 연습하지 않아도 됩니다.

## 10. DI 방법 3 - Constructor Injection

생성자 주입은 실무 기본값으로 가져가면 됩니다.

```java
@RequiredArgsConstructor
@Service
public class ProductService {
    private final ProductRepository productRepository;
}
```

`@RequiredArgsConstructor`는 Lombok이 `final` 필드를 받는 생성자를 자동으로 만들어주는 Annotation입니다.

실제로는 이런 생성자가 생긴다고 보면 됩니다.

```java
public ProductService(ProductRepository productRepository) {
    this.productRepository = productRepository;
}
```

생성자 주입을 권장하는 이유:

- 필수 의존성이 객체 생성 시점에 반드시 들어옵니다.
- `private final`을 쓸 수 있어 객체가 더 안정적입니다.
- 테스트에서 직접 생성하기 쉽습니다.
- 생성자는 객체 생성 시 1회만 호출됩니다.
- 의존성이 많아지면 생성자 파라미터가 길어져 설계 문제를 빨리 알아차릴 수 있습니다.

실무에서 손에 익힐 패턴:

```java
@RequiredArgsConstructor
@RestController
public class ProductController {
    private final ProductService productService;
}
```

```java
@RequiredArgsConstructor
@Service
public class ProductService {
    private final ProductRepository productRepository;
}
```

## 11. Bean Lifecycle

Bean lifecycle은 Spring Bean이 태어나고 사라지는 흐름입니다.

```text
1. Bean 객체 생성
2. Dependency Injection
3. 초기화 콜백 실행
4. 애플리케이션에서 사용
5. 종료 콜백 실행
6. Bean 제거
```

여기서 초기화 콜백의 대표 예가 `@PostConstruct`, 종료 콜백의 대표 예가 `@PreDestroy`입니다.

## 12. `@PostConstruct`

`@PostConstruct`는 Bean이 만들어지고 DI가 끝난 뒤 실행됩니다.

```java
@PostConstruct
public void init() {
    System.out.println("Bean 생성과 DI 완료 후 실행");
}
```

이 시점에는 주입받은 dependency를 사용할 수 있습니다.

다만 실무에서는 너무 무거운 작업을 넣지 않는 것이 좋습니다. 서버 시작이 늦어지고, 실패하면 애플리케이션이 뜨지 않을 수 있습니다.

## 13. `@PreDestroy`

`@PreDestroy`는 Bean이 제거되기 직전에 실행되는 종료 콜백입니다.

```java
@PreDestroy
public void destroy() {
    System.out.println("종료 전 정리 작업");
}
```

강사님이 이 부분을 강조한 이유는 단순히 Annotation 하나를 외우라는 뜻이 아닙니다.

실무 서버는 종료될 때도 처리 중인 일이 남아 있을 수 있습니다.

- HTTP 요청 처리 중
- DB transaction 진행 중
- 메시지 큐 작업 처리 중
- 스케줄러 실행 중
- 파일 write 중
- 외부 API 호출 중
- 메모리나 캐시에만 있는 데이터를 아직 저장하지 못한 상태

이때 아무 정리 없이 서버가 죽으면 데이터 유실, 중복 처리, 사용자 오류가 생길 수 있습니다.

그래서 `@PreDestroy`는 graceful shutdown을 이해하는 입구입니다.

## 14. 시스템콜부터 이해하기

Spring 서버도 결국 운영체제 위에서 돌아가는 프로세스입니다.

Java 코드가 파일을 열고, 네트워크 요청을 받고, DB와 통신하는 것처럼 보여도 실제 핵심 기능은 운영체제에게 부탁합니다. 그 통로가 시스템콜입니다.

| 종류 | 예시 | 백엔드에서 만나는 장면 |
| --- | --- | --- |
| File | `open`, `read`, `write` | 로그 파일 쓰기, 설정 파일 읽기 |
| Socket | `listen`, `read`, `write` | HTTP 요청 받기, DB와 통신 |
| Memory | `alloc`, `free` | 메모리 할당 |
| Process | `fork`, `exit`, `signal` | 프로세스 생성/종료/신호 |
| Time | time, sleep | timeout, scheduler |

시스템콜은 일반 메서드 호출보다 상대적으로 느립니다. 사용자 프로그램에서 운영체제 커널 기능으로 넘어갔다가 돌아오는 과정이 있기 때문입니다.

하지만 백엔드 개발자가 여기서 가져가야 할 핵심은 성능 숫자가 아닙니다.

> 서버는 운영체제 위의 프로세스이고, 종료도 운영체제의 프로세스 제어와 연결된다.

## 15. 시그널 이해하기

시그널은 운영체제가 프로세스에게 보내는 알림입니다.

종료와 관련해서 꼭 알아야 하는 것은 세 개입니다.

| Signal | 명령/상황 | 의미 | 핸들링 |
| --- | --- | --- | --- |
| `SIGINT` | `Ctrl+C`, IDE 중단 버튼과 연결해서 이해 | 인터럽트 | 가능 |
| `SIGTERM` | `kill -15 PID` | 정상 종료 요청 | 가능 |
| `SIGKILL` | `kill -9 PID` | 강제 종료 | 불가능 |

`SIGINT`와 `SIGTERM`은 프로그램이 받을 수 있습니다. 잘 만든 프로그램은 이 신호를 받으면 바로 죽지 않고 뒤정리를 합니다.

`SIGKILL`은 다릅니다. 절대 핸들링할 수 없습니다. 운영체제가 바로 프로세스를 제거합니다.

```text
SIGTERM
-> 정리할 기회 있음

SIGKILL
-> 정리할 기회 없음
```

## 16. 프로세스를 종료한다는 것

내가 서버를 종료하는 상황을 나눠봅니다.

먼저 정상 종료 요청입니다.

```bash
kill -15 PID
```

이 명령은 `SIGTERM`을 보냅니다.

프로그램이 잘 만들어져 있으면:

```text
SIGTERM 받음
-> 새 작업 중단
-> 진행 중인 작업 마무리
-> 리소스 정리
-> 종료
```

그런데 가끔 종료 요청을 보내도 프로세스가 안 꺼질 수 있습니다. 30초, 1분, 5분, 10분 동안 버티는 경우도 있습니다.

예를 들면:

- 무한 루프가 종료 플래그를 확인하지 않음
- worker thread가 계속 살아 있음
- 외부 API 응답을 무한정 기다림
- DB connection close가 막힘
- non-daemon thread가 끝나지 않음

이때 마지막 수단으로 강제 종료를 합니다.

```bash
kill -9 PID
```

이건 `SIGKILL`입니다.

```text
SIGKILL 받음
-> 애플리케이션이 처리할 수 없음
-> 운영체제가 즉시 제거
-> @PreDestroy 기대 불가
```

## 17. `@PreDestroy`는 어떻게 실행되는가

정확히 이해해야 합니다.

`@PreDestroy`가 운영체제 시그널을 직접 받는 것은 아닙니다.

더 정확한 흐름은 이렇습니다.

```text
1. 운영체제/IDE/Kubernetes가 Java 프로세스에 종료 신호 전달
2. JVM이 종료 절차 시작
3. Spring Boot가 ApplicationContext 종료
4. Spring Container가 Bean destroy callback 실행
5. @PreDestroy가 붙은 메서드 호출
6. 프로세스 종료
```

즉:

```text
Signal
-> JVM shutdown
-> Spring context close
-> Bean destroy callback
-> @PreDestroy
```

Spring이 종료 신호를 받았을 때 `@PreDestroy`가 붙은 것들을 전부 호출하고 종료하도록 연결되어 있다고 이해하면 됩니다. 단, 이것은 정상 종료 흐름일 때의 이야기입니다.

`SIGKILL`이면 이 흐름을 기대할 수 없습니다.

## 18. Graceful Shutdown

Graceful shutdown은 서버를 그냥 끄는 것이 아니라, 안전하게 끄는 것입니다.

단순 종료:

```text
종료 신호
-> 바로 종료
```

graceful shutdown:

```text
종료 신호
-> 새 요청 받지 않기
-> 처리 중인 요청 마무리
-> 메시지 처리 상태 저장
-> DB/파일/socket 리소스 정리
-> Bean destroy callback 실행
-> 종료
```

실무에서 graceful shutdown이 중요한 이유:

- 사용자가 요청 중에 갑자기 실패를 보지 않게 하기
- DB transaction이 어중간하게 끝나지 않게 하기
- 메시지 큐 작업이 중복 처리되거나 유실되지 않게 하기
- 파일/소켓/connection pool을 정리하기
- 배포 중에도 서비스 장애를 줄이기

중요한 감각:

> 서버는 시작보다 종료가 더 어렵습니다. 시작은 새로 뜨면 되지만, 종료는 하던 일을 안전하게 내려놓아야 합니다.

## 19. `@PreDestroy`에 넣기 좋은 것과 나쁜 것

넣기 좋은 것:

- 짧은 로그 기록
- scheduler stop
- worker stop 요청
- 외부 connection close
- file flush/close
- thread pool shutdown 요청
- 처리 중인 작업 상태 저장

넣기 나쁜 것:

- 오래 걸리는 대량 DB 작업
- 새로운 비즈니스 작업 시작
- 무한 대기
- 사용자 입력 기다리기
- 실패 가능성이 큰 외부 API를 오래 기다리기
- 종료 시간을 예측할 수 없는 작업

핵심:

> `@PreDestroy`는 마지막 정리 기회이지, 큰일을 새로 시작하는 자리가 아닙니다.

## 20. Kubernetes와 연결

운영에서는 서버를 직접 `kill`하는 것보다 Kubernetes 같은 플랫폼이 컨테이너를 종료하는 경우가 많습니다.

Kubernetes에서 Pod 종료를 단순화하면:

```text
1. Kubernetes가 Pod 종료 결정
2. Pod를 Service endpoint에서 제외하기 시작
3. 컨테이너 메인 프로세스에 SIGTERM 전달
4. Spring Boot가 graceful shutdown 시작
5. @PreDestroy 실행 가능
6. termination grace period 안에 종료해야 함
7. 시간이 지나도 안 꺼지면 SIGKILL
```

여기서 중요한 것은 제한 시간입니다.

예를 들어 Kubernetes가 30초를 줬는데, 내 `@PreDestroy`가 60초 걸리면 어떻게 될까요?

```text
30초 동안 기다림
-> 아직 안 끝남
-> SIGKILL
-> 정리 중이던 작업도 끊김
```

그래서 graceful shutdown은 구현만 하면 끝이 아닙니다. 운영 환경의 종료 제한 시간과 맞아야 합니다.

## 21. 직접 쳐보는 실습

실습은 [my-bean-di-practice](./practice/spring/my-bean-di-practice)에서 합니다.

자세한 순서는 [03-predestroy-graceful-shutdown.md](./practice/spring/03-predestroy-graceful-shutdown.md)에 따로 정리했습니다.

핵심 코드는 다음입니다.

```java
package com.buzz.practice;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;

@Component
public class ShutdownLogService {
    @PostConstruct
    public void init() {
        System.out.println("[init] Bean 생성 완료");
    }

    @PreDestroy
    public void destroy() {
        System.out.println("[destroy] 종료 전 정리 작업 시작");
        System.out.println("[destroy] 종료 전 정리 작업 완료");
    }
}
```

실행:

```bash
./gradlew bootRun
```

종료:

```text
Ctrl+C
```

볼 것:

```text
[init] Bean 생성 완료
[destroy] 종료 전 정리 작업 시작
[destroy] 종료 전 정리 작업 완료
```

## 22. 실무에서 제일 중요한 코드 습관

2회차에서 손에 익힐 실무 기본값은 이겁니다.

Controller:

```java
@RequiredArgsConstructor
@RestController
public class ProductController {
    private final ProductService productService;
}
```

Service:

```java
@RequiredArgsConstructor
@Service
public class ProductService {
    private final ProductRepository productRepository;
}
```

Repository:

```java
@Repository
public class ProductRepository {
}
```

External client:

```java
@Configuration
public class AppConfig {
    @Bean
    public PaymentClient paymentClient() {
        return new PaymentClient();
    }
}
```

Lifecycle:

```java
@PreDestroy
public void destroy() {
    // 짧고 확실한 종료 정리
}
```

## 23. 면접에서 말할 수 있는 문장

### Q. Spring Bean이 무엇인가요?

Spring Bean은 Spring Container가 생성하고 관리하는 객체입니다. `@Component`, `@Service`, `@Repository`, `@Controller` 같은 Annotation으로 등록하거나, `@Configuration` 클래스의 `@Bean` 메서드로 등록할 수 있습니다.

### Q. DI가 무엇인가요?

DI는 객체가 필요한 의존성을 내부에서 직접 만들지 않고 외부에서 주입받는 방식입니다. DI 자체는 Spring 전용 개념이 아니고, Spring은 Bean Container를 통해 DI를 자동으로 처리해줍니다.

### Q. 생성자 주입을 권장하는 이유는 무엇인가요?

생성자 주입은 객체 생성 시 필수 의존성을 반드시 받을 수 있고, `final` 필드를 사용할 수 있으며, 순수 Java 테스트가 쉽습니다. 또한 생성자는 1회만 호출되므로 객체를 안정적으로 만들기 좋습니다.

### Q. `@Bean`은 언제 쓰나요?

외부 라이브러리 클래스처럼 직접 Annotation을 붙일 수 없거나, 조건에 따라 복잡하게 객체를 생성해야 할 때 사용합니다. `@Bean` 메서드가 반환한 객체를 Spring Container가 Bean으로 관리합니다.

### Q. `@PreDestroy`는 언제 실행되나요?

Spring ApplicationContext가 종료될 때 Bean destroy callback 과정에서 실행됩니다. 일반적으로 서버가 `SIGTERM`이나 `SIGINT` 같은 종료 신호를 받아 정상 종료 절차에 들어가면 Spring Container가 닫히면서 `@PreDestroy`가 붙은 메서드를 호출합니다. 단, `SIGKILL`처럼 강제로 프로세스가 종료되면 실행을 보장할 수 없습니다.

### Q. Graceful shutdown이 왜 중요한가요?

서버 종료 시 처리 중인 HTTP 요청, 메시지 큐 작업, DB transaction, 외부 리소스 정리 등이 남아 있을 수 있습니다. Graceful shutdown은 새 요청은 막고 이미 진행 중인 작업을 마무리한 뒤 종료해서 데이터 유실, 중복 처리, 사용자 오류를 줄이기 위해 필요합니다.

### Q. `SIGTERM`과 `SIGKILL`의 차이는 무엇인가요?

`SIGTERM`은 프로세스에게 정상 종료를 요청하는 신호라서 애플리케이션이 받아 정리 작업을 수행할 수 있습니다. 반면 `SIGKILL`은 운영체제가 즉시 프로세스를 종료시키는 신호라서 애플리케이션이 핸들링할 수 없고 `@PreDestroy` 같은 종료 콜백도 기대할 수 없습니다.

## 24. 복습 질문

1. Bean은 그냥 Java 객체와 무엇이 다른가?
2. Dependency는 무엇인가?
3. DI는 왜 Spring 전용 개념이 아닌가?
4. Spring DI는 무엇을 자동으로 해주는가?
5. `@Component`, `@Service`, `@Repository`, `@RestController`는 모두 무엇과 관련 있는가?
6. `@Configuration`과 `@Bean`은 언제 쓰는가?
7. 필드 주입보다 생성자 주입을 권장하는 이유는 무엇인가?
8. Bean lifecycle에서 `@PostConstruct`와 `@PreDestroy`는 각각 언제 실행되는가?
9. 시스템콜은 왜 운영체제와 연결되는가?
10. 시그널은 무엇인가?
11. `SIGTERM`과 `SIGKILL`의 차이는 무엇인가?
12. `@PreDestroy`가 시그널을 직접 받는다고 말하면 왜 부정확한가?
13. graceful shutdown이 실패하면 실무에서 어떤 문제가 생길 수 있는가?
14. Kubernetes에서 termination grace period가 왜 중요한가?

## 25. 다음 수업 예습 키워드

다음 예습 키워드는 DB 연결과 트랜잭션으로 이어집니다.

- `DriverManager`
- `DataSource`
- TCP socket communication
- TCP SYN, ACK, 3-way handshake
- Transaction
- Transaction in MySQL
- Transaction in JDBC
- Transaction in Spring, `@Transactional`
- 여유되면: transaction propagation, transaction isolation level

2회차와 다음 회차는 이렇게 연결됩니다.

```text
Spring Bean/DI
-> Repository Bean이 DataSource를 주입받음
-> DataSource가 DB Connection 관리
-> JDBC로 SQL 실행
-> Transaction으로 여러 SQL을 하나의 작업 단위로 묶음
-> @Transactional로 Spring이 트랜잭션 시작/커밋/롤백 관리
```

## 참고 자료

- [Spring Framework - Lifecycle Callbacks](https://docs.spring.io/spring-framework/reference/core/beans/factory-nature.html#beans-factory-lifecycle)
- [Java Runtime - Shutdown Sequence](https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/lang/Runtime.html)
- [Kubernetes - Pod Termination](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination)
- [GNU C Library - Termination Signals](https://sourceware.org/glibc/manual/latest/html_mono/libc.html#Termination-Signals)
