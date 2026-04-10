# 10. Lombok 활용 — "반복 코드를 어노테이션 하나로"

> **키워드**: `@Getter` `@Setter` `@Data` `@Builder` `@RequiredArgsConstructor` `@Slf4j` `@NoArgsConstructor`

---

## 핵심만 한 문장

**Getter, Setter, 생성자, toString 같은 반복 코드를 어노테이션 하나로 자동 생성해주는 도구**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~3장 (핵심 어노테이션, @Builder, @RequiredArgsConstructor) | 매일 쓰는 것들 |
| 🟡 이해 | 4장 (주의사항) | 실수 방지 |
| 🟢 참고 | 5장 (@ToString, @EqualsAndHashCode) | 필요할 때 찾기 |

---

## 1장. Lombok이 왜 필요한가? 🔴

### 비유

```
❌ Lombok 없이 = 매번 수작업으로 편지 봉투 쓰기
✅ Lombok 사용 = 라벨 프린터로 한 번에 출력
```

### 코드로 보면

```java
// ❌ Lombok 없이 — 40줄
public class Student {
    private Long id;
    private String name;
    private String email;
    
    public Student() {}
    
    public Student(Long id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    @Override
    public String toString() {
        return "Student{id=" + id + ", name=" + name + ", email=" + email + "}";
    }
}
```

```java
// ✅ Lombok 사용 — 7줄 (동일한 코드!)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    private Long id;
    private String name;
    private String email;
}
```

### 설치

```gradle
// build.gradle
dependencies {
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
}
```

IntelliJ: Settings → Plugins → "Lombok" 검색 → Install → Restart

---

## 2장. 핵심 어노테이션 🔴

### @Getter / @Setter

```java
@Getter
@Setter
public class Student {
    private Long id;        // → getId(), setId() 자동 생성
    private String name;    // → getName(), setName() 자동 생성
}
```

### @NoArgsConstructor / @AllArgsConstructor

```java
@NoArgsConstructor      // → public Student() {} 자동 생성
@AllArgsConstructor     // → public Student(Long id, String name, String email) {} 자동 생성
public class Student {
    private Long id;
    private String name;
    private String email;
}
```

### @Data (올인원)

```java
@Data  // = @Getter + @Setter + @ToString + @EqualsAndHashCode + @RequiredArgsConstructor
public class Student {
    private Long id;
    private String name;
    private String email;
}
```

**⚠️ Entity에는 @Data 쓰지 마라!** (4장에서 설명)

### @Slf4j (로깅)

```java
@Slf4j  // → private static final Logger log = LoggerFactory.getLogger(StudentService.class);
@Service
public class StudentService {
    
    public Student create(Student student) {
        log.info("학생 등록: {}", student.getName());  // ← 바로 사용
        return repository.save(student);
    }
}
```

---

## 3장. @Builder와 @RequiredArgsConstructor 🔴

### @Builder — 객체를 깔끔하게 생성

```java
@Builder
public class Student {
    private Long id;
    private String name;
    private String email;
    private int grade;
}

// 사용
Student student = Student.builder()
    .name("홍길동")
    .email("hong@example.com")
    .grade(3)
    .build();
```

**장점:**
- 파라미터 순서 상관없음
- 어떤 필드에 어떤 값인지 명확함
- 필요한 필드만 설정 가능

### @RequiredArgsConstructor — DI의 필수 파트너

```java
// ❌ 생성자를 직접 작성
@Service
public class StudentService {
    private final StudentRepository repository;
    
    public StudentService(StudentRepository repository) {
        this.repository = repository;
    }
}

// ✅ @RequiredArgsConstructor로 자동 생성
@Service
@RequiredArgsConstructor  // ← final 필드의 생성자를 자동 생성!
public class StudentService {
    private final StudentRepository repository;  // ← Spring이 자동 주입
}
```

**이게 실무에서 가장 많이 쓰는 DI 패턴이다!**

---

## 4장. 주의사항 🟡

### ❌ Entity에 @Data 쓰지 마라

```java
// ❌ 위험
@Data        // toString(), equals(), hashCode() 자동 생성됨
@Entity
public class Student {
    @Id
    private Long id;
    
    @OneToMany
    private List<Course> courses;  // ← toString()에서 무한 루프!
}

// ✅ 안전
@Getter
@Setter
@Entity
public class Student {
    @Id
    private Long id;
    // @Data 대신 @Getter/@Setter만 사용
}
```

**이유:**
- `@Data`의 `toString()`이 연관 관계 객체를 순환 참조 → 무한 루프
- `equals()`/`hashCode()`가 모든 필드를 비교 → JPA 프록시에서 문제

### 어디에 뭘 쓸까?

| 상황 | 추천 |
|------|------|
| **Entity** | `@Getter` + `@Setter` + `@NoArgsConstructor` |
| **DTO** | `@Data` (또는 `@Getter` + `@NoArgsConstructor`) |
| **Service** | `@RequiredArgsConstructor` + `@Slf4j` |
| **Controller** | `@RequiredArgsConstructor` |
| **Builder 패턴** | `@Builder` + `@NoArgsConstructor` + `@AllArgsConstructor` |

---

## 5장. 기타 어노테이션 🟢

### @ToString

```java
@ToString
public class Student {
    private Long id;
    private String name;
}
// → System.out.println(student); → "Student(id=1, name=홍길동)"

@ToString(exclude = "password")  // 민감 정보 제외
public class User {
    private String email;
    private String password;
}
```

### @EqualsAndHashCode

```java
@EqualsAndHashCode(of = "id")  // id만으로 동등성 비교
public class Student {
    private Long id;
    private String name;
}
```

---

## 면접 대비

### 🔴 필수

**Q: "Lombok이 뭔가요?"**

> 컴파일 타임에 Getter, Setter, 생성자 같은 반복 코드를 자동 생성해주는 라이브러리입니다. 어노테이션만 붙이면 되서 코드가 간결해집니다. `@RequiredArgsConstructor`로 DI 생성자를 자동 생성하고, `@Slf4j`로 Logger를 자동 생성하는 게 가장 많이 쓰입니다.

**Q: "Entity에 @Data를 쓰면 안 되는 이유는?"**

> `@Data`가 자동 생성하는 `toString()`이 연관 관계 객체를 포함하면 무한 루프가 발생할 수 있고, `equals()`/`hashCode()`가 모든 필드를 비교해서 JPA 프록시와 충돌할 수 있습니다. Entity에는 `@Getter`/`@Setter`만 쓰는 게 안전합니다.

---

## 정리: 이것만 기억하기

```
🎯 Lombok = 반복 코드 자동 생성

매일 쓰는 것:
  @Getter / @Setter     ← Entity, DTO
  @Data                 ← DTO만! (Entity에 쓰면 안 됨)
  @RequiredArgsConstructor ← Service, Controller (DI용)
  @Slf4j                ← Service (로깅용)
  @Builder              ← 객체 생성 (선택)
  @NoArgsConstructor    ← Entity, DTO

규칙:
  Entity → @Getter + @Setter + @NoArgsConstructor
  DTO    → @Data (또는 @Getter + @NoArgsConstructor)
  Service → @RequiredArgsConstructor + @Slf4j
```

---

> 🎯 **다음 주제**: 11번 "DTO와 Validation" — Entity를 그대로 반환하면 안 되는 이유와, 입력값 검증을 배운다!

