# 04. IoC와 DI 깊게 파기 — "내가 안 만들어. Spring이 갖다 줘"

> **키워드**: `IoC` `DI` `@Component` `@Service` `@Repository` `@Autowired` `Bean` `생성자 주입`

---

## 핵심만 한 문장

**Spring이 객체를 대신 만들어서(@Component), 필요한 곳에 알아서 넣어주는 것(DI) — 이게 Spring의 존재 이유다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~4장 (왜 필요한가, Bean, DI, 생성자 주입) | Spring의 심장. 이것 모르면 나머지 전부 이해 불가 |
| 🟡 이해 | 5장 (Bean Scope, 생명주기) | 가끔 필요 |
| 🟢 참고 | 6장 (@Qualifier, @Primary) | 특수 상황에서 필요 |

> 💡 **03번과의 연결**: CRUD API에서 `new HashMap<>()`으로 직접 저장소를 만들었다. 이걸 Spring이 대신 관리하게 바꾸는 게 이번 주제다!

---

## 1장. 왜 필요한가? — new의 문제 🔴

### 비유

```
❌ new 방식 = 식당에서 직접 농사짓기
  "토마토 필요해" → 직접 밭에 가서 키움 → 수확 → 요리
  → 농사짓다 요리할 시간이 없다!

✅ DI 방식 = 식자재 배달 받기
  "토마토 필요해" → 배달 업체(Spring)가 갖다 줌 → 바로 요리
  → 요리(비즈니스 로직)에만 집중!
```

### 코드로 보면

```java
// ❌ 직접 생성 (강한 결합)
public class StudentService {
    private final StudentRepository repository = new StudentRepository();
    //                                            ↑ 직접 만듦!
    
    public Student findById(Long id) {
        return repository.findById(id);
    }
}
```

**문제:**
- `StudentRepository`를 `JpaStudentRepository`로 바꾸고 싶으면? → **코드 수정 필요**
- 테스트에서 가짜 저장소를 쓰고 싶으면? → **불가능**
- `StudentService`가 "누구를 쓸지" 직접 결정함 → **결합도 높음**

```java
// ✅ Spring이 주입 (느슨한 결합)
@Service
public class StudentService {
    private final StudentRepository repository;
    //                                ↑ 직접 안 만듦!
    
    // Spring이 알아서 넣어줌 (생성자 주입)
    public StudentService(StudentRepository repository) {
        this.repository = repository;
    }
    
    public Student findById(Long id) {
        return repository.findById(id);
    }
}
```

**장점:**
- `StudentRepository` 구현체가 바뀌어도 → **코드 수정 불필요**
- 테스트에서 가짜 객체 주입 가능
- `StudentService`는 "누구를 쓸지" 몰라도 됨 → **결합도 낮음**

---

## 2장. Bean이란? 🔴

### 비유

```
Bean = Spring이 관리하는 객체

Spring 컨테이너 = 큰 창고
Bean = 창고에 보관된 물건

"StudentService 필요해!" → Spring: "창고에서 꺼내줄게"
```

### Bean 등록하는 방법

```java
// 방법 1: @Component (가장 기본)
@Component
public class StudentRepository {
    // Spring이 이 객체를 자동으로 만들어서 창고에 보관
}

// 방법 2: @Service (비즈니스 로직)
@Service
public class StudentService {
    // @Service = @Component + "이건 비즈니스 로직이다"라는 의미
}

// 방법 3: @Repository (DB 접근)
@Repository
public class StudentJpaRepository {
    // @Repository = @Component + "이건 DB 접근 코드다"라는 의미
}

// 방법 4: @Controller (API)
@RestController
public class StudentController {
    // @RestController 안에 @Controller가 있고, @Controller 안에 @Component가 있다
}
```

### 관계도

```
@Component ← 기본
  ├── @Service      ← 비즈니스 로직 (Service 계층)
  ├── @Repository   ← DB 접근 (Repository 계층)
  └── @Controller   ← 요청 처리 (Controller 계층)

전부 @Component의 특수화!
기능 차이 없고, "역할"을 명시하는 것
```

---

## 3장. DI (의존성 주입) 🔴

### 비유

```
DI = 배달

StudentService: "나 StudentRepository 필요해!"
Spring:         "알겠어, 만들어서 갖다 줄게"
  ↓
StudentService 생성자에 StudentRepository를 넣어줌
```

### 3가지 주입 방법

```java
// ✅ 1. 생성자 주입 (추천! 실무 표준)
@Service
public class StudentService {
    private final StudentRepository repository;
    
    // 생성자가 1개면 @Autowired 생략 가능!
    public StudentService(StudentRepository repository) {
        this.repository = repository;
    }
}

// 🔶 2. 필드 주입 (간단하지만 비추천)
@Service
public class StudentService {
    @Autowired
    private StudentRepository repository;
    // 테스트하기 어려움, final 못 씀
}

// 🔶 3. Setter 주입 (거의 안 씀)
@Service
public class StudentService {
    private StudentRepository repository;
    
    @Autowired
    public void setRepository(StudentRepository repository) {
        this.repository = repository;
    }
}
```

### 왜 생성자 주입이 최고인가?

| 비교 | 생성자 주입 | 필드 주입 |
|------|-----------|----------|
| `final` 사용 | ✅ 가능 (불변 보장) | ❌ 불가능 |
| 테스트 | ✅ 쉬움 (생성자에 Mock 전달) | ❌ 어려움 (리플렉션 필요) |
| 순환 참조 감지 | ✅ 앱 시작 시 즉시 발견 | ❌ 런타임에 발견 |
| 실무 권장 | **✅ 표준** | ❌ 비추천 |

### Lombok으로 더 간단하게

```java
// @RequiredArgsConstructor = final 필드의 생성자를 자동 생성
@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository repository;
    // ↑ 생성자를 직접 안 써도 Lombok이 만들어줌!
    
    public Student findById(Long id) {
        return repository.findById(id);
    }
}
```

**이게 실무에서 가장 많이 쓰는 패턴이다!**

---

## 4장. 따라 쳐보기: 03번 코드를 DI로 개선 🔴

### 03번에서 만든 코드 (문제)

```java
// ❌ Controller가 직접 HashMap을 만들어서 사용
@RestController
@RequestMapping("/students")
public class StudentController {
    private final Map<Long, Student> studentMap = new HashMap<>();  // ← 직접 생성!
    // ...
}
```

### 개선: 3계층으로 분리

```
Controller → Service → Repository

각 계층을 Bean으로 등록하고
Spring이 DI로 연결해줌!
```

### Step 1. StudentRepository (저장소)

```java
package com.example.demo;

import org.springframework.stereotype.Repository;
import java.util.*;

@Repository  // ← Spring이 이 객체를 Bean으로 관리
public class StudentRepository {
    
    private final Map<Long, Student> store = new HashMap<>();
    private Long nextId = 1L;
    
    public Student save(Student student) {
        student.setId(nextId++);
        store.put(student.getId(), student);
        return student;
    }
    
    // Optional = "값이 있을 수도, 없을 수도 있다"를 표현
    // store.get(id)가 null이면 Optional.empty() 반환
    public Optional<Student> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }
    
    public List<Student> findAll() {
        return new ArrayList<>(store.values());
    }
    
    public void deleteById(Long id) {
        store.remove(id);
    }
    
    public boolean existsById(Long id) {
        return store.containsKey(id);
    }
}
```

### Step 2. StudentService (비즈니스 로직)

```java
package com.example.demo;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service                      // ← Bean 등록
@RequiredArgsConstructor      // ← 생성자 자동 생성 (DI!)
public class StudentService {
    
    private final StudentRepository repository;  // ← Spring이 주입
    
    public Student create(Student student) {
        return repository.save(student);
    }
    
    public Student getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("학생을 찾을 수 없습니다: id=" + id));
    }
    
    public List<Student> getAll() {
        return repository.findAll();
    }
    
    public Student update(Long id, Student student) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("학생을 찾을 수 없습니다: id=" + id);
        }
        student.setId(id);
        return repository.save(student);
    }
    
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("학생을 찾을 수 없습니다: id=" + id);
        }
        repository.deleteById(id);
    }
}
```

### Step 3. StudentController (요청 처리만!)

```java
package com.example.demo;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor      // ← DI!
public class StudentController {
    
    private final StudentService service;  // ← Spring이 주입
    
    @PostMapping
    public Student create(@RequestBody Student student) {
        return service.create(student);
    }
    
    @GetMapping
    public List<Student> getAll() {
        return service.getAll();
    }
    
    @GetMapping("/{id}")
    public Student getById(@PathVariable Long id) {
        return service.getById(id);
    }
    
    @PutMapping("/{id}")
    public Student update(@PathVariable Long id, @RequestBody Student student) {
        return service.update(id, student);
    }
    
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
```

### 동작 흐름

```
POST /students + { "name": "홍길동" }
  ↓
Spring: "StudentController에 StudentService 주입해뒀지"
  ↓
StudentController.create() 호출
  ↓
Spring: "StudentService에 StudentRepository 주입해뒀지"
  ↓
StudentService.create() → StudentRepository.save() 호출
  ↓
응답 반환
```

### 테스트 (Postman)

```bash
# 등록
POST http://localhost:8080/students
Body: { "name": "홍길동", "email": "hong@example.com", "grade": 3 }

# 응답: { "id": 1, "name": "홍길동", ... }
```

**03번과 동일하게 작동하지만, 코드가 계층별로 깔끔하게 분리됐다!**

---

## 5장. Bean Scope와 생명주기 🟡

### Bean Scope (범위)

```java
@Component
@Scope("singleton")  // 기본값 (생략 가능)
public class StudentService {
    // 앱 전체에서 딱 1개만 존재
}

@Component
@Scope("prototype")
public class TemporaryTask {
    // 요청할 때마다 새로 생성
}
```

| Scope | 설명 | 사용 빈도 |
|-------|------|----------|
| `singleton` | 앱 전체에서 1개 (기본값) | **99%** |
| `prototype` | 요청마다 새로 생성 | 거의 안 씀 |
| `request` | HTTP 요청마다 1개 | 웹에서 가끔 |
| `session` | HTTP 세션마다 1개 | 웹에서 가끔 |

**💡 대부분 기본값(singleton)이면 된다!**

### Bean 생명주기

```
Spring 시작
  ↓
1. Bean 생성 (@Component 스캔)
  ↓
2. 의존성 주입 (DI)
  ↓
3. 초기화 (@PostConstruct)
  ↓
4. 사용
  ↓
5. 소멸 (@PreDestroy)
  ↓
Spring 종료
```

```java
@Service
public class StudentService {
    
    @PostConstruct
    public void init() {
        // Bean 생성 직후 실행 (초기화 작업)
        System.out.println("StudentService 초기화!");
    }
    
    @PreDestroy
    public void destroy() {
        // 앱 종료 직전 실행 (정리 작업)
        System.out.println("StudentService 종료!");
    }
}
```

---

## 6장. 같은 타입의 Bean이 여러 개일 때 🟢

### 문제 상황

```java
public interface NotificationService {
    void send(String message);
}

@Service
public class EmailNotificationService implements NotificationService { ... }

@Service
public class SmsNotificationService implements NotificationService { ... }

// 어떤 걸 주입해야 하지?
@Service
public class OrderService {
    private final NotificationService notificationService;
    // → 에러! 2개 중 뭘 넣어야 할지 모름
}
```

### 해결: @Primary 또는 @Qualifier

```java
// 방법 1: @Primary (기본으로 쓸 것 지정)
@Primary
@Service
public class EmailNotificationService implements NotificationService { ... }

// 방법 2: @Qualifier (이름으로 지정)
@Service
public class OrderService {
    public OrderService(
        @Qualifier("smsNotificationService") NotificationService service
    ) {
        this.notificationService = service;
    }
}
```

---

## 면접 대비

### 🔴 필수

**Q: "IoC가 뭔가요?"**

> Inversion of Control, 제어의 역전입니다. 기존에는 개발자가 `new`로 직접 객체를 만들었는데, Spring에서는 컨테이너가 대신 객체를 만들고 관리합니다. 개발자는 필요한 객체를 선언만 하면 Spring이 주입해줍니다.

**Q: "DI가 뭔가요?"**

> Dependency Injection, 의존성 주입입니다. 객체가 필요한 의존 객체를 직접 생성하지 않고 외부(Spring 컨테이너)에서 전달받는 것입니다. 생성자 주입이 실무 표준이고, `@RequiredArgsConstructor`와 함께 사용합니다.

**Q: "생성자 주입을 권장하는 이유는?"**

> 세 가지입니다. 첫째, `final`을 쓸 수 있어서 불변성이 보장됩니다. 둘째, 테스트할 때 생성자에 Mock 객체를 넣기 쉽습니다. 셋째, 순환 참조를 앱 시작 시 즉시 발견할 수 있습니다. 필드 주입(`@Autowired`)은 이 장점들이 없어서 비추천됩니다.

**Q: "@Component, @Service, @Repository 차이는?"**

> 전부 `@Component`의 특수화입니다. 기능 차이는 없고, 코드를 읽는 사람에게 "이 클래스의 역할"을 알려주는 것입니다. `@Service`는 비즈니스 로직, `@Repository`는 DB 접근, `@Controller`는 요청 처리 계층에 사용합니다.

### 🟡 개념

**Q: "Bean Scope를 설명해주세요"**

> Bean이 존재하는 범위입니다. 기본값은 `singleton`으로 앱 전체에서 1개만 만들어집니다. `prototype`은 요청마다 새로 만들고, `request`/`session`은 웹 환경에서 사용합니다. 실무에서는 99% singleton입니다.

---

## 정리: 이것만 기억하기

```
🎯 Spring의 핵심 = "내가 안 만들어. Spring이 갖다 줘"

Bean 등록: @Component (@Service, @Repository, @Controller)
DI 주입:   생성자 주입 + @RequiredArgsConstructor

실무 패턴:
  @Service
  @RequiredArgsConstructor
  public class XxxService {
      private final XxxRepository repository;  ← Spring이 주입!
  }

3계층 구조:
  Controller → Service → Repository
  (요청처리)   (비즈니스)  (DB접근)
```

---

> 🎯 **다음 주제**: 05번 "AOP" — 모든 메서드에 로깅을 넣으려면 반복 코드가 엄청나다. AOP로 "공통 관심사"를 분리하는 방법을 배운다!

