# Java 마스터 커리큘럼

> 목표: Spring Boot를 제대로 이해하기 위한 **Java 기초부터 심화까지** 완전 정복

---

## 로드맵 한눈에 보기

```
Phase 0-1: Java 기초 체력    ██████████ (J01~J06)
Phase 0-2: OOP 마스터        ██████████ (J07~J12)
Phase 0-3: 핵심 API/도구     ██████████ (J13~J19)
Phase 0-4: 심화              ██████████ (J20~J26)
→ 이후 Spring Boot 커리큘럼 (Phase 1~6)으로 연결
```

---

## Phase 0-1: Java 기초 체력 — 코드 한 줄이 어떻게 실행되는지

> 프로그래밍 언어의 뼈대를 체감하는 단계

| # | 주제 | 핵심 키워드 | 상태 |
|---|------|------------|------|
| J01 | **JVM과 Java 실행 구조** | JDK/JRE/JVM, 컴파일→바이트코드, IntelliJ 세팅 | ⬜ |
| J02 | **변수, 자료형, 연산자** | 기본형 8개, 참조형, 형변환, 연산자 | ⬜ |
| J03 | **제어문과 반복문** | if/switch, for/while, break/continue | ⬜ |
| J04 | **배열과 문자열** | 배열, String 불변성, StringBuilder, String Pool | ⬜ |
| J05 | **메서드와 스코프** | call by value, 오버로딩, 가변 인자 | ⬜ |
| J06 | **Java 메모리 구조** | Stack, Heap, GC 기초, null/NPE | ⬜ |

---

## Phase 0-2: OOP 마스터 — 객체지향을 뼈에 새기기

> Spring을 쓰기 전에 OOP를 확실히 이해하는 단계

| # | 주제 | 핵심 키워드 | 상태 |
|---|------|------------|------|
| J07 | **클래스와 객체** | 필드/메서드/생성자, this, 접근 제어자, 패키지 | ⬜ |
| J08 | **상속과 다형성** | extends, 오버라이딩, 업/다운캐스팅, instanceof | ⬜ |
| J09 | **추상 클래스와 인터페이스** | abstract, interface, default 메서드, 선택 기준 | ⬜ |
| J10 | **캡슐화와 불변 객체** | 불변 객체, final, record, VO vs Entity | ⬜ |
| J11 | **Object 클래스와 핵심 메서드** | equals/hashCode 계약, toString | ⬜ |
| J12 | **Enum과 중첩 클래스** | enum 활용, static inner class, 익명 클래스 | ⬜ |

---

## Phase 0-3: 핵심 API와 도구 — 이것만 알면 코드가 2배 짧아진다

> 실무에서 매일 쓰는 API를 익히는 단계

| # | 주제 | 핵심 키워드 | 상태 |
|---|------|------------|------|
| J13 | **컬렉션 — List와 Set** | ArrayList vs LinkedList, HashSet, Comparable/Comparator | ⬜ |
| J14 | **컬렉션 — Map** | HashMap 내부 구조, TreeMap, ConcurrentHashMap | ⬜ |
| J15 | **예외 처리** | try-catch, 체크/언체크 예외, 커스텀 예외, 예외 전환 | ⬜ |
| J16 | **제네릭** | 타입 파라미터, 와일드카드, 타입 소거 | ⬜ |
| J17 | **람다와 함수형 인터페이스** | @FunctionalInterface, Predicate/Function/Consumer | ⬜ |
| J18 | **스트림 API** | filter/map/collect, reduce, 중간·최종 연산 | ⬜ |
| J19 | **Optional** | of/ofNullable, orElse vs orElseGet, 안티패턴 | ⬜ |

---

## Phase 0-4: 심화 — "자바 좀 아는 사람"이 되는 구간

> 면접에서 차이를 만드는 구간

| # | 주제 | 핵심 키워드 | 상태 |
|---|------|------------|------|
| J20 | **I/O와 파일 처리** | InputStream, NIO(Path/Files), try-with-resources | ⬜ |
| J21 | **동시성 기초** | Thread, synchronized, volatile, ExecutorService | ⬜ |
| J22 | **동시성 심화** | CompletableFuture, Atomic, Virtual Thread(21) | ⬜ |
| J23 | **디자인 패턴 — 생성** | 싱글톤, 빌더, 팩토리 메서드, 정적 팩토리 | ⬜ |
| J24 | **디자인 패턴 — 구조/행위** | 어댑터, 전략, 템플릿 메서드 (Spring 연결) | ⬜ |
| J25 | **Java 버전별 핵심 기능** | 8(람다), 11(var), 17(sealed), 21(Virtual Thread) | ⬜ |
| J26 | **Effective Java 핵심 정리** | 정적 팩토리, 불변 객체, 상속보다 컴포지션 | ⬜ |

---

## 학습 가이드

### 난이도 범례
- Phase 0-1~0-2: 기초 (따라하면 된다)
- Phase 0-3: 핵심 (여기서 코드 품질이 갈린다)
- Phase 0-4: 심화 (면접에서 차이 만드는 구간)

### 예상 진행 속도
- 하루 1~2개 주제
- 전체 약 2~3주 소요

### Spring 연결 포인트
| Java 주제 | Spring에서 쓰이는 곳 |
|----------|---------------------|
| J06 메모리 구조 | JPA 영속성 컨텍스트 이해 |
| J09 인터페이스 | Spring DI, Repository 패턴 |
| J10 불변 객체 | DTO, VO 설계 |
| J12 Enum | Entity 상태값, @Enumerated |
| J15 예외 처리 | @ExceptionHandler, 커스텀 예외 |
| J17 람다 | Stream API, QueryDSL |
| J19 Optional | JPA findById() 반환값 |
| J23~24 디자인 패턴 | Spring 내부 구조 전반 |

---

> 💡 이 커리큘럼을 마치면 Spring Boot 커리큘럼 (Phase 1~6)으로 자연스럽게 연결됩니다.
> → [Spring Boot 커리큘럼](../spring/CURRICULUM.md)

