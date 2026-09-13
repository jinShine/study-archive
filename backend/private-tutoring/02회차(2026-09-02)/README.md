# 2회차(2026/09/02)

## 주제

Spring Bean, Bean 생성 방법, Dependency/DI, Bean 라이프사이클, Graceful Shutdown

## 이번 회차 핵심

Spring이 객체를 직접 생성하고 관리하는 방식인 Bean을 배웠습니다. 그리고 객체가 다른 객체를 필요로 하는 Dependency, 그 Dependency를 외부에서 넣어주는 DI, Spring이 DI를 자동으로 해주는 방식, Bean이 생성되고 종료될 때 실행되는 라이프사이클 메서드까지 실습 코드로 확인했습니다.

이번 회차의 핵심은 이 문장입니다.

> Spring은 객체를 대신 만들고, 필요한 객체끼리 연결하고, 종료할 때 정리할 기회까지 준다.

## 바로가기

- 대표 학습 가이드: [STUDY_GUIDE.md](./STUDY_GUIDE.md)
- 세부 수업 정리: [01-spring-bean-di-lifecycle.md](./notes/01-spring-bean-di-lifecycle.md)
- Spring 실습: [practice/spring/README.md](./practice/spring/README.md)
- 빈 프로젝트 따라치기 실습: [02-from-empty-project-bean-di.md](./practice/spring/02-from-empty-project-bean-di.md)
- `@PreDestroy`와 Graceful Shutdown 실습: [03-predestroy-graceful-shutdown.md](./practice/spring/03-predestroy-graceful-shutdown.md)
- 1-10번 따라치기 실습: [01-hands-on-bean-di-1-to-10.md](./practice/spring/01-hands-on-bean-di-1-to-10.md)
- 실습 코드 해설: [lessonapp2-study-guide.md](./practice/spring/lessonapp2-study-guide.md)
- 원본 메모: [0909-original-notes.txt](./source-materials/0909-original-notes.txt)

## 정리할 키워드

- Spring Bean
- Bean 생성 방법
- Dependency
- DI, Dependency Injection
- Bean Lifecycle
- `@Autowired`
- `@Configuration`, `@Bean`
- `@PostConstruct`, `@PreDestroy`
- System call, Signal, SIGINT, SIGTERM, SIGKILL
- Graceful Shutdown
- Controller, Service, Repository가 Bean으로 등록되는 흐름

## 실습 메모

강사님이 작성해준 예제 프로젝트 `lessonapp2`는 `practice/spring/lessonapp2/` 아래에 보관했습니다. 내가 직접 처음부터 치면서 익힐 빈 프로젝트는 `practice/spring/my-bean-di-practice/` 아래에 따로 만들었습니다.

## 다음 예습 키워드

- DriverManager
- DataSource
- TCP socket communication
- TCP SYN, ACK, 3-way handshake
- Transaction
- Transaction in MySQL
- Transaction in JDBC
- Transaction in Spring, `@Transactional`
- 여유되면: transaction propagation, transaction isolation level
