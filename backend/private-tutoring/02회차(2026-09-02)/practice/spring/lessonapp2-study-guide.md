# lessonapp2 실습 해설

이 문서는 2회차(2026/09/02) 수업의 Spring 실습 프로젝트 `lessonapp2`를 다시 보기 위한 해설입니다.

## 한눈에 보기

이번 프로젝트는 기능을 많이 만드는 실습이 아니라, Spring Bean과 DI, Bean lifecycle을 눈으로 확인하는 실습입니다.

```text
Spring Boot 실행
-> Component Scan
-> Bean 생성
-> Dependency Injection
-> @PostConstruct 실행
-> GET /product 요청 처리
-> 종료 시그널
-> @PreDestroy 실행
```

## 프로젝트 기본 정보

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | `lessonapp2` |
| Java | 21 |
| Build tool | Gradle |
| Spring Boot | 4.1.1 |
| 서버 포트 | 8081 |
| 주요 의존성 | `spring-boot-starter-webmvc`, Lombok |

관련 파일:

- [build.gradle](./lessonapp2/build.gradle)
- [settings.gradle](./lessonapp2/settings.gradle)
- [application.properties](./lessonapp2/src/main/resources/application.properties)

## 실행 방법

```bash
cd private-tutoring/02회차(2026-09-02)/practice/spring/lessonapp2
./gradlew bootRun
```

실행 후 확인:

```http
GET http://localhost:8081/product
```

기대 응답:

```text
Ok
```

## 검증 결과

정리하면서 복사본 기준으로 Gradle 검증을 진행했습니다.

```bash
./gradlew classes
```

결과: 성공.

```bash
./gradlew test
```

결과: 실패. 테스트 클래스 파일은 생성되지만 테스트 실행 단계에서 아래 오류가 발생했습니다.

```text
ClassNotFoundException: org.backend.lessonapp2.Lessonapp2ApplicationTests
```

지금 수업의 핵심은 Bean, DI, lifecycle을 이해하는 것이므로 main source compile 성공까지 확인했습니다. 테스트 실패는 추후 Spring Boot 테스트 설정을 배울 때 다시 확인할 좋은 체크포인트입니다.

## 파일별 역할

| 파일 | 역할 | 핵심 개념 |
| --- | --- | --- |
| [Lessonapp2Application.java](./lessonapp2/src/main/java/org/backend/lessonapp2/Lessonapp2Application.java) | Spring Boot 시작점 | `@SpringBootApplication`, component scan |
| [ProductController.java](./lessonapp2/src/main/java/org/backend/lessonapp2/ProductController.java) | HTTP 요청 처리 | `@RestController`, `@GetMapping`, field injection |
| [ProductService.java](./lessonapp2/src/main/java/org/backend/lessonapp2/ProductService.java) | 서비스 Bean | `@Component`, `@RequiredArgsConstructor`, `@PostConstruct`, `@PreDestroy` |
| [CountService.java](./lessonapp2/src/main/java/org/backend/lessonapp2/CountService.java) | `ProductService`의 의존성 | `@Component` |
| [BeanConfig.java](./lessonapp2/src/main/java/org/backend/lessonapp2/BeanConfig.java) | 수동 Bean 등록 | `@Configuration`, `@Bean` |
| [PayService.java](./lessonapp2/src/main/java/org/backend/lessonapp2/PayService.java) | 생성자 DI 예시 | dependency |
| [PointService.java](./lessonapp2/src/main/java/org/backend/lessonapp2/PointService.java) | `PayService`의 의존성 | 순수 Java 객체 |
| [DiMain.java](./lessonapp2/src/main/java/org/backend/lessonapp2/DiMain.java) | Spring 없는 DI 예시 | 순수 Java DI |
| [SignalMain.java](./lessonapp2/src/main/java/org/backend/lessonapp2/SignalMain.java) | Signal 핸들링 예시 | `SIGINT`, process signal |

## 1. Spring Boot 시작점

[Lessonapp2Application.java](./lessonapp2/src/main/java/org/backend/lessonapp2/Lessonapp2Application.java)

```java
@SpringBootApplication
public class Lessonapp2Application {
    public static void main(String[] args) {
        SpringApplication.run(Lessonapp2Application.class, args);
    }
}
```

`SpringApplication.run(...)`이 실행되면 Spring Boot 애플리케이션이 시작됩니다. 이때 Spring은 현재 패키지인 `org.backend.lessonapp2` 아래를 훑으면서 Bean으로 등록할 클래스를 찾습니다. 이것을 component scan이라고 생각하면 됩니다.

`@SpringBootApplication`은 여러 설정을 합친 Annotation입니다. 지금 단계에서는 "Spring Boot 시작 클래스이고, 이 위치 아래의 컴포넌트를 찾아 Bean으로 등록한다" 정도로 이해하면 충분합니다.

## 2. Annotation으로 Bean 등록하기

[CountService.java](./lessonapp2/src/main/java/org/backend/lessonapp2/CountService.java)

```java
@Component
public class CountService {
}
```

`@Component`가 붙으면 Spring이 이 클래스를 Bean으로 등록합니다.

즉, 개발자가 직접 아래처럼 만들지 않아도 됩니다.

```java
CountService countService = new CountService();
```

Spring이 애플리케이션 시작 시점에 대신 만들고 컨테이너에 보관합니다.

## 3. Controller Bean

[ProductController.java](./lessonapp2/src/main/java/org/backend/lessonapp2/ProductController.java)

```java
@RestController
public class ProductController {
    @Autowired
    public ProductService productService;

    @GetMapping("/product")
    public String get() {
        return "Ok";
    }
}
```

`@RestController`도 Bean 등록 대상입니다. 동시에 HTTP 요청을 받을 수 있는 Controller 역할을 합니다.

`GET /product` 요청이 오면 `get()` 메서드가 실행되고 `"Ok"`를 반환합니다.

여기서는 `ProductService`를 필드 주입으로 받고 있습니다.

```java
@Autowired
public ProductService productService;
```

학습용으로는 이해하기 쉽지만, 실무에서는 생성자 주입을 더 권장합니다.

## 4. Service Bean과 생성자 주입

[ProductService.java](./lessonapp2/src/main/java/org/backend/lessonapp2/ProductService.java)

```java
@RequiredArgsConstructor
@Component
public class ProductService {
    private final CountService countService;
}
```

`ProductService`는 `@Component`가 붙어서 Bean이 됩니다. 그리고 `CountService`를 필요로 합니다.

`private final CountService countService;`는 반드시 생성자에서 값이 들어와야 하는 필드입니다.

`@RequiredArgsConstructor`는 Lombok Annotation입니다. `final` 필드를 파라미터로 받는 생성자를 자동으로 만들어줍니다.

실제로는 아래 코드가 생긴다고 생각하면 됩니다.

```java
public ProductService(CountService countService) {
    this.countService = countService;
}
```

Spring은 이 생성자를 보고 `CountService` Bean을 찾아서 넣어줍니다.

```text
Spring Container 안에 CountService Bean 있음
-> ProductService를 만들 때 생성자에 넣음
-> ProductService Bean 완성
```

## 5. Field Injection, Setter Injection, Constructor Injection 비교

실습 코드에는 세 가지 DI 방식을 비교할 수 있는 흔적이 있습니다.

Field Injection:

```java
@Autowired
public ProductService productService;
```

Setter Injection:

```java
@Autowired
public void setCountService(CountService countService) {
    this.countService = countService;
}
```

Constructor Injection:

```java
public ProductService(CountService countService) {
    this.countService = countService;
}
```

비교:

| 방식 | 장점 | 단점 | 추천 |
| --- | --- | --- | --- |
| Field Injection | 코드가 짧음 | 테스트 어려움, `final` 불가, 의존성이 숨음 | 학습용으로만 |
| Setter Injection | 선택 의존성에 사용 가능 | 객체 생성 후 의존성이 늦게 들어옴 | 선택 의존성일 때 |
| Constructor Injection | 필수 의존성 보장, 테스트 쉬움, `final` 가능 | 생성자가 길어질 수 있음 | 기본 추천 |

네가 메모한 "순수한 자바코드로 쉽게 생성 가능하고, 초기에 1회만 호출되고, `@RequiredArgsConstructor`랑 `private final`을 쓸 수 있다"가 생성자 주입을 쓰는 핵심 이유입니다.

## 6. `@Configuration`, `@Bean`으로 Bean 등록하기

[BeanConfig.java](./lessonapp2/src/main/java/org/backend/lessonapp2/BeanConfig.java)

```java
@Configuration
public class BeanConfig {
    @Bean
    public PayService payService() {
        return new PayService(new PointService());
    }
}
```

`PayService`에는 `@Component`가 붙어 있지 않습니다.

그런데도 `@Bean` 메서드가 `PayService` 객체를 반환하므로 Spring은 이 객체를 Bean으로 등록합니다.

이 방식은 이런 경우에 씁니다.

- 외부 라이브러리 클래스라 `@Component`를 붙일 수 없을 때
- 객체 생성에 조건문이 필요할 때
- 설정값을 읽어서 객체를 만들어야 할 때
- Builder나 Factory를 통해 복잡하게 만들어야 할 때

지금 코드는 `new PointService()`를 직접 하고 있습니다. 수업용으로는 `@Bean`이 객체를 반환한다는 점이 잘 보입니다. 실무에서는 `PointService`도 Bean으로 등록해두고 메서드 파라미터로 주입받는 식으로 작성할 수도 있습니다.

```java
@Bean
public PayService payService(PointService pointService) {
    return new PayService(pointService);
}
```

이렇게 하면 `PointService` 생성도 Spring 컨테이너가 관리합니다.

## 7. Spring 없는 DI

[DiMain.java](./lessonapp2/src/main/java/org/backend/lessonapp2/DiMain.java)

```java
public class DiMain {
    public static void main(String[] args) {
        PointService pointService = new PointService();
        PayService payService = new PayService(pointService);

        ProductService productService = new ProductService(new CountService());
    }
}
```

이 파일이 중요한 이유는 DI가 Spring 없이도 된다는 점을 보여주기 때문입니다.

DI는 그냥 "필요한 객체를 바깥에서 넣어준다"는 설계 방식입니다.

Spring을 쓰면 이 조립 작업을 컨테이너가 자동으로 해줍니다.

```text
순수 Java DI:
내가 직접 객체를 만들고 생성자에 넣음

Spring DI:
Spring이 Bean을 만들고 생성자에 넣음
```

## 8. `@PostConstruct`

[ProductService.java](./lessonapp2/src/main/java/org/backend/lessonapp2/ProductService.java)

```java
@PostConstruct
public void 프러덕트서비스가만들어지고디펜던시인젝션됐을때() {
    System.out.println("객체 만들어졌을때 하고싶은 액션");
}
```

`@PostConstruct`는 Bean 생성과 DI가 끝난 뒤 실행됩니다.

흐름:

```text
ProductService 객체 생성
-> CountService 주입 완료
-> @PostConstruct 메서드 실행
```

즉, 이 시점에는 `countService`를 사용할 수 있습니다.

실무에서는 초기화 작업, 연결 확인, 캐시 준비 같은 것을 넣을 수 있지만, 너무 무거운 작업은 피하는 편이 좋습니다. 시작이 느려지거나 실패하면 서버가 뜨지 않을 수 있기 때문입니다.

## 9. `@PreDestroy`

[ProductService.java](./lessonapp2/src/main/java/org/backend/lessonapp2/ProductService.java)

```java
@PreDestroy
public void preDestroy() throws InterruptedException {
    System.out.println("나 파괴되기 직전이에요.");
    Thread.sleep(5000);
    System.out.println("종료");
}
```

`@PreDestroy`는 Bean이 제거되기 직전 실행됩니다.

Spring Boot 서버를 실행한 뒤 IntelliJ 중단 버튼이나 `Ctrl+C`로 종료하면 Spring 컨텍스트가 닫히면서 이 메서드가 호출될 수 있습니다.

여기서 `Thread.sleep(5000)`은 graceful shutdown이 "정리할 시간을 가진다"는 것을 눈으로 보기 위한 실습 장치입니다.

주의할 점:

- `@PreDestroy`는 정상 종료 흐름에서만 기대할 수 있습니다.
- `SIGKILL`처럼 강제 종료되면 실행되지 않습니다.
- 너무 오래 걸리는 작업을 넣으면 종료 제한 시간에 걸릴 수 있습니다.

## 10. Signal 실습

[SignalMain.java](./lessonapp2/src/main/java/org/backend/lessonapp2/SignalMain.java)

```java
Signal.handle(new Signal("INT"), sig -> {
    System.out.println("SIGINT received!");
});
```

이 코드는 Java 프로세스가 `SIGINT`를 받았을 때 메시지를 출력하도록 합니다.

`SIGINT`는 터미널에서 `Ctrl+C`를 누르거나 IDE 중단 버튼을 누를 때 연결해서 이해하면 됩니다.

다만 `sun.misc.Signal`은 JDK 내부 API입니다. 실무 Spring 애플리케이션에서 직접 이 API를 자주 쓰라는 뜻이 아니라, "프로세스는 운영체제의 종료 신호를 받을 수 있다"는 감각을 잡기 위한 코드로 보면 됩니다.

## 11. 이 실습을 실행하면서 볼 순서

1. `./gradlew bootRun`으로 Spring Boot를 실행합니다.
2. 콘솔에 `@PostConstruct` 로그가 찍히는지 봅니다.
3. `GET /product` 요청을 보내 `"Ok"`가 오는지 봅니다.
4. 종료 버튼 또는 `Ctrl+C`로 애플리케이션을 종료합니다.
5. 콘솔에 `@PreDestroy` 로그가 찍히는지 봅니다.
6. `Thread.sleep(5000)` 때문에 종료가 잠시 기다리는 것을 확인합니다.

## 12. 지금 코드에서 리팩토링한다면

학습이 조금 더 진행된 뒤에는 아래처럼 바꿔볼 수 있습니다.

`ProductController`도 생성자 주입으로 변경:

```java
@RequiredArgsConstructor
@RestController
public class ProductController {
    private final ProductService productService;

    @GetMapping("/product")
    public String get() {
        return "Ok";
    }
}
```

`PointService`도 Bean으로 등록하고 `BeanConfig`에서 주입받기:

```java
@Bean
public PointService pointService() {
    return new PointService();
}

@Bean
public PayService payService(PointService pointService) {
    return new PayService(pointService);
}
```

다만 현재 실습에서는 여러 방식을 일부러 보여주기 위해 필드 주입과 직접 `new`가 남아 있다고 보면 됩니다.

## 13. 반드시 기억할 것

- Bean은 Spring이 만들고 관리하는 객체입니다.
- Dependency는 어떤 객체가 필요로 하는 다른 객체입니다.
- DI는 의존성을 외부에서 넣어주는 방식입니다.
- DI 자체는 Spring 전용 개념이 아닙니다.
- Spring DI는 Spring 컨테이너가 Bean끼리 자동으로 연결해주는 기능입니다.
- Bean 등록은 Annotation, `@Configuration/@Bean`, XML 방식이 있습니다.
- 실무 기본값은 생성자 주입입니다.
- `@PostConstruct`는 생성과 DI 이후 실행됩니다.
- `@PreDestroy`는 정상 종료 과정에서 Bean 제거 직전 실행됩니다.
- `SIGKILL`은 핸들링할 수 없으므로 graceful shutdown 기회를 주지 않습니다.
