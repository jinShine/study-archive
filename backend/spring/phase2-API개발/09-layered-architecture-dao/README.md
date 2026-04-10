# 09. Layered 아키텍처와 DAO 패턴 — "코드를 역할별로 나누기"

> **키워드**: `Controller` `Service` `Repository` `DAO` `의존성 방향` `패키지 구조`

---

## 핵심만 한 문장

**Controller(요청 처리) → Service(비즈니스 로직) → Repository(DB 접근) 3계층으로 나누는 것. 이게 Spring 프로젝트의 기본 구조다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~3장 (왜 나누나, 3계층 구조, 따라쳐보기) | 모든 Spring 프로젝트의 기본 |
| 🟡 이해 | 4장 (의존성 방향, 패키지 구조) | 코드 리뷰에서 자주 지적됨 |
| 🟢 참고 | 5장 (DAO vs Repository) | 개념만 알면 됨 |

> 💡 **04번과의 연결**: IoC/DI로 객체 주입을 배웠다. 이번에는 "어떤 구조로 나눠서" 주입할지 배운다!

---

## 1장. 왜 계층을 나누는가? 🔴

### 비유

```
❌ 계층 없이 = 1인 식당
  사장 한 명이 주문도 받고, 요리도 하고, 서빙도 함
  → 바빠지면 엉망진창

✅ 계층 분리 = 대형 식당
  홀 직원 (Controller)  → 주문 받기
  주방장 (Service)       → 요리하기
  식자재 담당 (Repository) → 재료 관리
  → 각자 자기 일만 함!
```

### 코드로 보면

```java
// ❌ Controller에 모든 코드가 몰려있음
@RestController
public class StudentController {
    
    @PostMapping("/students")
    public Student create(@RequestBody Student student) {
        // 유효성 검사 (Service 역할)
        if (student.getName() == null) throw new RuntimeException("이름 필수");
        
        // DB 저장 (Repository 역할)
        student.setId(nextId++);
        studentMap.put(student.getId(), student);
        
        // 로그 (공통 관심사)
        log.info("학생 등록: {}", student.getName());
        
        return student;
    }
}
// → 코드 수정 시 어디를 봐야 하는지 모름
// → 테스트 불가능 (DB와 로직이 섞여있음)
```

```java
// ✅ 3계층으로 분리
@RestController          // ← 요청/응답만 담당
class StudentController {
    private final StudentService service;
    
    @PostMapping("/students")
    public Student create(@RequestBody Student student) {
        return service.create(student);  // Service에 위임!
    }
}

@Service                 // ← 비즈니스 로직만 담당
class StudentService {
    private final StudentRepository repository;
    
    public Student create(Student student) {
        if (student.getName() == null) throw new RuntimeException("이름 필수");
        return repository.save(student);  // Repository에 위임!
    }
}

@Repository              // ← DB 접근만 담당
class StudentRepository {
    public Student save(Student student) {
        student.setId(nextId++);
        store.put(student.getId(), student);
        return student;
    }
}
```

---

## 2장. 3계층 구조 🔴

### 전체 그림

```
클라이언트 (브라우저/앱)
    ↕
┌──────────────────────┐
│   Controller 계층     │  @RestController
│   "요청 받고 응답"     │  → HTTP 요청/응답 처리
│   "비즈니스 로직 없음"  │  → Service 호출만 함
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│   Service 계층        │  @Service
│   "비즈니스 로직"      │  → 핵심 로직 처리
│   "DB 직접 안 건드림"  │  → Repository 호출
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│   Repository 계층     │  @Repository
│   "DB 접근만"         │  → 데이터 저장/조회/삭제
│   "비즈니스 로직 없음"  │
└──────────────────────┘
           ↕
        Database
```

### 각 계층의 규칙

| 계층 | 어노테이션 | 하는 일 | 하면 안 되는 일 |
|------|-----------|--------|---------------|
| **Controller** | `@RestController` | HTTP 요청/응답 처리 | 비즈니스 로직 |
| **Service** | `@Service` | 비즈니스 로직, 유효성 검사 | DB 직접 접근 |
| **Repository** | `@Repository` | DB CRUD | 비즈니스 로직 |

### 예시: "이 코드는 어디에?"

```
"학생 등록 요청을 받자"            → Controller
"이름이 비어있으면 에러를 던지자"    → Service
"DB에 학생을 저장하자"             → Repository
"등록 완료 응답을 보내자"           → Controller
"이메일 중복인지 확인하자"          → Service
"이메일로 학생을 조회하자"          → Repository
```

---

## 3장. 따라 쳐보기: 완전한 3계층 프로젝트 🔴

### 파일 구조

```
src/main/java/com/example/demo/
├── controller/
│   └── StudentController.java
├── service/
│   └── StudentService.java
├── repository/
│   └── StudentRepository.java
├── entity/
│   └── Student.java
└── DemoApplication.java
```

### Student.java (엔티티)

```java
package com.example.demo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    private Long id;
    private String name;
    private String email;
    private int grade;
}
```

### StudentRepository.java (DB 접근)

```java
package com.example.demo.repository;

import com.example.demo.entity.Student;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class StudentRepository {
    
    private final Map<Long, Student> store = new HashMap<>();
    private Long nextId = 1L;
    
    public Student save(Student student) {
        if (student.getId() == null) {
            student.setId(nextId++);
        }
        store.put(student.getId(), student);
        return student;
    }
    
    public Optional<Student> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }
    
    public List<Student> findAll() {
        return new ArrayList<>(store.values());
    }
    
    public boolean existsByEmail(String email) {
        return store.values().stream()
            .anyMatch(s -> s.getEmail().equals(email));
    }
    
    public void deleteById(Long id) {
        store.remove(id);
    }
}
```

### StudentService.java (비즈니스 로직)

```java
package com.example.demo.service;

import com.example.demo.entity.Student;
import com.example.demo.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {
    
    private final StudentRepository repository;
    
    public Student create(Student student) {
        // 비즈니스 로직: 이메일 중복 체크
        if (repository.existsByEmail(student.getEmail())) {
            throw new RuntimeException("이미 등록된 이메일: " + student.getEmail());
        }
        return repository.save(student);
    }
    
    public Student getById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("학생 없음: id=" + id));
    }
    
    public List<Student> getAll() {
        return repository.findAll();
    }
    
    public void delete(Long id) {
        repository.findById(id)
            .orElseThrow(() -> new RuntimeException("학생 없음: id=" + id));
        repository.deleteById(id);
    }
}
```

### StudentController.java (요청 처리)

```java
package com.example.demo.controller;

import com.example.demo.entity.Student;
import com.example.demo.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {
    
    private final StudentService service;
    
    @PostMapping
    public ResponseEntity<Student> create(@RequestBody Student student) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(student));
    }
    
    @GetMapping
    public List<Student> getAll() {
        return service.getAll();
    }
    
    @GetMapping("/{id}")
    public Student getById(@PathVariable Long id) {
        return service.getById(id);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

### 테스트

```bash
# 등록
curl -X POST http://localhost:8080/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"홍길동","email":"hong@example.com","grade":3}'

# 응답: 201 Created
# { "id": 1, "name": "홍길동", "email": "hong@example.com", "grade": 3 }

# 중복 이메일 등록 시도
curl -X POST http://localhost:8080/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"김길동","email":"hong@example.com","grade":2}'

# 응답: 500 (이미 등록된 이메일)
```

---

## 4장. 의존성 방향과 패키지 구조 🟡

### 의존성 방향 = 위에서 아래로만!

```
Controller → Service → Repository
   ✅          ✅         ✅

Controller ← Service (역방향)
   ❌ 금지!

Repository → Service (역방향)
   ❌ 금지!
```

**규칙: 위 계층이 아래를 알지만, 아래는 위를 모른다**

### 패키지 구조 (2가지 방식)

```
방식 1: 계층별 (Layer-based) ← 초보자 추천
src/main/java/com/example/
├── controller/
│   ├── StudentController.java
│   └── CourseController.java
├── service/
│   ├── StudentService.java
│   └── CourseService.java
├── repository/
│   ├── StudentRepository.java
│   └── CourseRepository.java
└── entity/
    ├── Student.java
    └── Course.java
```

```
방식 2: 도메인별 (Domain-based) ← 프로젝트 커지면
src/main/java/com/example/
├── student/
│   ├── StudentController.java
│   ├── StudentService.java
│   ├── StudentRepository.java
│   └── Student.java
└── course/
    ├── CourseController.java
    ├── CourseService.java
    ├── CourseRepository.java
    └── Course.java
```

---

## 5장. DAO vs Repository 🟢

| 구분 | DAO | Repository |
|------|-----|-----------|
| 정의 | Data Access Object | 도메인 객체 저장소 |
| 관점 | DB 중심 (SQL 위주) | 도메인 중심 (객체 위주) |
| Spring | 직접 구현 | JpaRepository 상속 |
| 현재 | 레거시에서 사용 | **Spring에서 표준** |

**💡 Spring Data JPA에서는 Repository를 쓴다. DAO는 개념만 알면 됨!**

---

## 면접 대비

### 🔴 필수

**Q: "Layered Architecture를 설명해주세요"**

> 코드를 역할별로 Controller, Service, Repository 3계층으로 분리하는 설계 패턴입니다. Controller는 HTTP 요청/응답, Service는 비즈니스 로직, Repository는 DB 접근을 담당합니다. 각 계층은 자기 역할만 하고, 의존성은 위에서 아래로만 흐릅니다.

**Q: "Service 계층이 왜 필요한가요?"**

> Controller에 비즈니스 로직을 넣으면 HTTP와 로직이 섞여서 테스트가 어렵고, 같은 로직을 다른 Controller에서 재사용할 수 없습니다. Service로 분리하면 단위 테스트가 쉽고, 여러 Controller에서 같은 Service를 호출할 수 있습니다.

**Q: "Controller에서 Repository를 직접 호출하면 안 되나요?"**

> 기술적으로는 가능하지만, Service 계층 없이 직접 호출하면 비즈니스 로직이 Controller에 섞이게 됩니다. 트랜잭션 처리, 유효성 검사, 여러 Repository 조합 같은 로직은 Service에서 해야 합니다.

---

## 정리: 이것만 기억하기

```
🎯 3계층 = Spring 프로젝트의 기본 구조

Controller (@RestController)
  → "요청 받고, Service 호출하고, 응답 보내기"
  → 비즈니스 로직 금지!

Service (@Service)
  → "비즈니스 로직 처리"
  → 유효성 검사, 트랜잭션, 여러 Repository 조합

Repository (@Repository)
  → "DB CRUD만"
  → 비즈니스 로직 금지!

의존성 방향: Controller → Service → Repository (한 방향!)
```

---

> 🎯 **다음 주제**: 10번 "Lombok 활용" — @Data, @Builder, @RequiredArgsConstructor 등 반복 코드를 줄여주는 도구를 배운다!

