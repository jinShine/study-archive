# 2회차(2026/09/02) Spring 실습

## 상태

정리 완료.

## 프로젝트

- 실습 프로젝트: [lessonapp2](./lessonapp2)
- 내가 직접 처음부터 치는 빈 프로젝트: [my-bean-di-practice](./my-bean-di-practice)
- 빈 프로젝트 따라치기 실습: [02-from-empty-project-bean-di.md](./02-from-empty-project-bean-di.md)
- `@PreDestroy`와 Graceful Shutdown 실습: [03-predestroy-graceful-shutdown.md](./03-predestroy-graceful-shutdown.md)
- 1-10번 따라치기 실습: [01-hands-on-bean-di-1-to-10.md](./01-hands-on-bean-di-1-to-10.md)
- 코드 해설: [lessonapp2-study-guide.md](./lessonapp2-study-guide.md)
- 원본 메모: [../../source-materials/0909-original-notes.txt](../../source-materials/0909-original-notes.txt)

`lessonapp2`는 강사님이 작성해준 예제입니다. 내가 직접 손으로 익히는 실습은 `my-bean-di-practice`에서 진행합니다.

## 실행 방법

```bash
cd lessonapp2
./gradlew bootRun
```

서버 포트는 `src/main/resources/application.properties`에 설정된 `8081`입니다.

```properties
server.port=8081
```

실행 후 브라우저 또는 HTTP 클라이언트에서 확인합니다.

```http
GET http://localhost:8081/product
```

기대 응답:

```text
Ok
```

## 검증 결과

- `./gradlew classes`: 성공
- `./gradlew test`: 테스트 클래스 실행 단계에서 `ClassNotFoundException: org.backend.lessonapp2.Lessonapp2ApplicationTests` 발생

현재 실습 핵심인 main source compile은 성공했습니다. 테스트 실패는 Spring Bean/DI 개념 실습 자체보다는 Gradle/Spring Boot 테스트 런타임 설정 쪽 점검 대상으로 남겨둡니다.

## 이번 실습에서 보는 것

```text
ProductController
-> ProductService
-> CountService
```

```text
BeanConfig
-> PayService
-> PointService
```

```text
SignalMain
-> SIGINT 핸들링 감각 확인
```

## 실습 기록 템플릿

### 실행 방법

```bash
# 예: ./gradlew bootRun
```

### 만든 클래스

| 클래스 | 역할 | Bean 등록 방식 |
| --- | --- | --- |
| 예: `PostController` | HTTP 요청 받기 | `@RestController` |
| 예: `PostService` | 비즈니스 로직 | `@Service` |
| 예: `PostRepository` | DB 접근 | `@Repository` |

### DI 흐름

```text
PostController
-> PostService
-> PostRepository
```

### 이해 포인트

- 어떤 클래스가 Bean인가?
- 어떤 클래스가 다른 Bean에 의존하는가?
- 의존성은 생성자로 주입되는가?
- 직접 `new`를 쓰지 않아도 객체가 연결되는 이유는 무엇인가?
