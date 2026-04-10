# 05. AOP 실전 — "공통 작업을 한 곳에서 처리하기"

> **키워드**: `AOP` `@Aspect` `@Before` `@After` `@Around` `Pointcut` `JoinPoint` `로깅` `실행시간 측정`

---

## 핵심만 한 문장

**모든 메서드에 반복되는 코드(로깅, 시간 측정, 권한 체크)를 한 곳에서 처리하는 기술**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~3장 (왜 필요한가, @Around, 따라쳐보기) | 실무에서 로깅/시간 측정에 매일 씀 |
| 🟡 이해 | 4장 (Pointcut 표현식) | 적용 범위 제어 |
| 🟢 참고 | 5장 (@Before/@After) | @Around로 다 됨 |

> 💡 **03번과의 연결**: CRUD API에서 모든 메서드에 `log.info()`를 넣었다. API가 100개면 100번 반복해야 한다. AOP로 한 번에 해결!

---

## 1장. 왜 필요한가? 🔴

### 비유

```
❌ AOP 없이 = 모든 교실에 CCTV 직접 설치
  1반에 설치, 2반에 설치, 3반에 설치...
  → 100개 교실이면 100번 설치!

✅ AOP 사용 = 복도에 CCTV 하나 설치
  복도를 지나가면 자동으로 기록됨
  → 1번 설치로 모든 교실 커버!
```

### 코드로 보면

```java
// ❌ AOP 없이 — 모든 메서드에 로깅 코드 반복
@Service
public class StudentService {
    
    public Student create(Student student) {
        long start = System.currentTimeMillis();           // 반복!
        log.info("[StudentService.create] 시작");           // 반복!
        
        Student result = repository.save(student);         // 실제 로직
        
        long end = System.currentTimeMillis();             // 반복!
        log.info("[StudentService.create] 종료 ({}ms)", end - start);  // 반복!
        return result;
    }
    
    public Student getById(Long id) {
        long start = System.currentTimeMillis();           // 또 반복!
        log.info("[StudentService.getById] 시작");          // 또 반복!
        
        Student result = repository.findById(id)...;       // 실제 로직
        
        long end = System.currentTimeMillis();             // 또 반복!
        log.info("[StudentService.getById] 종료 ({}ms)", end - start);  // 또 반복!
        return result;
    }
    
    // 메서드가 10개면 이 코드가 10번 반복됨... 😫
}
```

```java
// ✅ AOP 사용 — 공통 코드를 한 곳에서 처리
@Service
public class StudentService {
    
    public Student create(Student student) {
        return repository.save(student);  // 비즈니스 로직만!
    }
    
    public Student getById(Long id) {
        return repository.findById(id)...;  // 비즈니스 로직만!
    }
}

// 로깅 + 시간 측정은 AOP가 자동으로 처리 ✅
```

---

## 2장. @Around — 가장 많이 쓰는 AOP 🔴

### 개념

```
@Around = 메서드 실행 "전후"를 감싸는 것

요청 → [AOP: 시작 로그] → 실제 메서드 실행 → [AOP: 종료 로그] → 응답
```

### 실행 시간 측정 Aspect

```java
package com.example.demo;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect       // ← "이 클래스가 AOP다"
@Component    // ← Bean으로 등록
public class ExecutionTimeAspect {
    
    // Service 계층의 모든 메서드에 적용
    @Around("execution(* com.example.demo..*Service.*(..))")
    public Object measureTime(ProceedingJoinPoint joinPoint) throws Throwable {
        
        // 1️⃣ 메서드 실행 전
        String methodName = joinPoint.getSignature().toShortString();
        long start = System.currentTimeMillis();
        log.info("[AOP] {} 시작", methodName);
        
        try {
            // 2️⃣ 실제 메서드 실행
            Object result = joinPoint.proceed();
            
            // 3️⃣ 메서드 실행 후 (성공)
            long elapsed = System.currentTimeMillis() - start;
            log.info("[AOP] {} 완료 ({}ms)", methodName, elapsed);
            
            return result;
            
        } catch (Exception e) {
            // 4️⃣ 예외 발생 시
            long elapsed = System.currentTimeMillis() - start;
            log.error("[AOP] {} 실패 ({}ms) - {}", methodName, elapsed, e.getMessage());
            throw e;
        }
    }
}
```

### 동작 흐름

```
POST /students + { "name": "홍길동" }
  ↓
StudentController.create() 호출
  ↓
StudentService.create() 호출하려는 순간!
  ↓
🎯 AOP 가로챔!
  ↓
[AOP] StudentService.create(..) 시작        ← 1️⃣ 전
  ↓
StudentService.create() 실제 실행            ← 2️⃣ 실행
  ↓
[AOP] StudentService.create(..) 완료 (15ms) ← 3️⃣ 후
  ↓
응답 반환
```

### 콘솔 결과

```
14:23:45 INFO  ExecutionTimeAspect - [AOP] StudentService.create(..) 시작
14:23:45 INFO  ExecutionTimeAspect - [AOP] StudentService.create(..) 완료 (15ms)
14:23:50 INFO  ExecutionTimeAspect - [AOP] StudentService.getAll(..) 시작
14:23:50 INFO  ExecutionTimeAspect - [AOP] StudentService.getAll(..) 완료 (3ms)
```

**Service 코드에는 로깅 코드가 한 줄도 없는데, 자동으로 로그가 찍힌다!**

---

## 3장. 따라 쳐보기 🔴

### Step 1. 의존성 확인

```gradle
// build.gradle — spring-boot-starter-web에 AOP가 이미 포함됨!
// 별도 추가 불필요. 만약 안 되면 아래 추가:
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-aop'
}
```

### Step 2. ExecutionTimeAspect 생성

`src/main/java/com/example/demo/ExecutionTimeAspect.java` 파일 생성:

**⚠️ 2장의 코드를 그대로 복사하면 됨!**

### Step 3. 서버 실행 + 테스트

```bash
# 서버 실행
gradle bootRun

# 학생 등록
curl -X POST http://localhost:8080/students \
  -H "Content-Type: application/json" \
  -d '{"name":"홍길동","email":"hong@example.com","grade":3}'
```

### Step 4. 콘솔 확인

```
[AOP] StudentService.create(..) 시작
[AOP] StudentService.create(..) 완료 (12ms)
```

**Service 메서드가 추가되어도 AOP 코드는 수정할 필요 없다!**

---

## 4장. Pointcut 표현식 — 어디에 적용할까? 🟡

### 기본 문법

```
execution(반환타입 패키지..클래스.메서드(파라미터))
```

### 자주 쓰는 패턴

```java
// 1️⃣ Service 계층 전체
@Around("execution(* com.example.demo..*Service.*(..))")
// → *Service로 끝나는 클래스의 모든 메서드

// 2️⃣ 특정 패키지 전체
@Around("execution(* com.example.demo.service..*(..))")
// → service 패키지의 모든 클래스의 모든 메서드

// 3️⃣ Controller 계층 전체
@Around("execution(* com.example.demo..*Controller.*(..))")
// → *Controller로 끝나는 클래스의 모든 메서드

// 4️⃣ 특정 어노테이션이 붙은 메서드
@Around("@annotation(org.springframework.transaction.annotation.Transactional)")
// → @Transactional이 붙은 메서드만
```

### 패턴 해석

```
execution(* com.example.demo..*Service.*(..))
           ↑         ↑            ↑     ↑  ↑
       반환타입   패키지         클래스  메서드 파라미터
       (아무거나) (하위 전체)  (*Service) (전부) (아무거나)
```

---

## 5장. @Before, @After, @AfterReturning, @AfterThrowing 🟢

```java
@Aspect
@Component
@Slf4j
public class LoggingAspect {
    
    // 메서드 실행 전
    @Before("execution(* com.example.demo..*Service.*(..))")
    public void beforeLog(JoinPoint joinPoint) {
        log.info("[Before] {}", joinPoint.getSignature().toShortString());
    }
    
    // 메서드 실행 후 (성공/실패 모두)
    @After("execution(* com.example.demo..*Service.*(..))")
    public void afterLog(JoinPoint joinPoint) {
        log.info("[After] {}", joinPoint.getSignature().toShortString());
    }
    
    // 성공적으로 반환 후
    @AfterReturning(pointcut = "execution(* com.example.demo..*Service.*(..))", 
                    returning = "result")
    public void afterReturningLog(JoinPoint joinPoint, Object result) {
        log.info("[Return] {} → {}", joinPoint.getSignature().toShortString(), result);
    }
    
    // 예외 발생 후
    @AfterThrowing(pointcut = "execution(* com.example.demo..*Service.*(..))", 
                   throwing = "ex")
    public void afterThrowingLog(JoinPoint joinPoint, Exception ex) {
        log.error("[Error] {} → {}", joinPoint.getSignature().toShortString(), ex.getMessage());
    }
}
```

**💡 실무에서는 `@Around` 하나로 전부 처리하는 게 일반적이다!**

---

## 면접 대비

### 🔴 필수

**Q: "AOP가 뭔가요?"**

> Aspect Oriented Programming, 관점 지향 프로그래밍입니다. 로깅, 트랜잭션, 보안 같은 공통 관심사를 비즈니스 로직과 분리해서 한 곳에서 관리하는 기술입니다. `@Aspect` 클래스를 만들고 Pointcut으로 적용 범위를 지정하면, 해당 메서드 실행 전후에 자동으로 공통 코드가 실행됩니다.

**Q: "AOP를 실무에서 어디에 쓰나요?"**

> 실행 시간 측정, API 요청/응답 로깅, 트랜잭션 처리(`@Transactional`이 내부적으로 AOP), 권한 체크에 사용합니다. 특히 `@Transactional`은 AOP로 구현되어 있어서, AOP 동작 원리를 알아야 트랜잭션 문제를 디버깅할 수 있습니다.

**Q: "@Around와 @Before/@After의 차이는?"**

> `@Around`는 메서드 실행 전후를 모두 제어하고 반환값도 변경할 수 있습니다. `@Before`는 실행 전에만, `@After`는 실행 후에만 동작합니다. 실무에서는 `@Around`가 가장 유연해서 주로 사용합니다.

---

## 정리: 이것만 기억하기

```
🎯 AOP = "공통 작업을 한 곳에서"

실무 패턴:
  @Slf4j
  @Aspect
  @Component
  public class XxxAspect {
      
      @Around("execution(* com.example..*Service.*(..))")
      public Object measure(ProceedingJoinPoint joinPoint) throws Throwable {
          // 전처리
          Object result = joinPoint.proceed();  ← 실제 메서드 실행
          // 후처리
          return result;
      }
  }

핵심:
  ✅ @Aspect + @Component = AOP 클래스
  ✅ @Around = 메서드 전후를 감싸는 것
  ✅ joinPoint.proceed() = 실제 메서드 실행
  ✅ Pointcut = 어디에 적용할지 (execution 표현식)
```

---

> 🎯 **다음 주제**: 06번 "예외 처리 전략" — `throw new RuntimeException()`으로 던졌던 에러를 통일된 형식으로 깔끔하게 처리하는 방법을 배운다!

