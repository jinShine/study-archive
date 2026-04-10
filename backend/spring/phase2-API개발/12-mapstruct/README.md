# 12. MapStruct — 객체 매핑 자동화 🟡

> **키워드**: `MapStruct` `@Mapper` `@Mapping` `Entity↔DTO 변환` `컴파일 타임 매핑`

---

## 핵심만 한 문장

**Entity ↔ DTO 변환 코드를 직접 안 쓰고, 인터페이스만 선언하면 MapStruct가 자동으로 만들어주는 도구**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🟡 이해 | 1~2장 (왜 쓰나, 기본 사용법) | 프로젝트에서 선택적으로 사용 |
| 🟢 참고 | 3장 (커스텀 매핑) | 필요할 때 찾아보기 |

> 💡 **이 주제는 🟡 도구 수준이다.** 11번에서 배운 `StudentResponse.from(entity)` 방식으로도 충분하다. MapStruct는 "DTO가 많아질 때" 편해지는 도구다.

---

## 1장. 왜 필요한가?

### 수동 변환 (11번에서 배운 방식)

```java
// Entity → DTO 변환을 직접 작성
public static StudentResponse from(Student student) {
    return new StudentResponse(
        student.getId(),
        student.getName(),
        student.getEmail(),
        student.getGrade()
    );
}
// → 필드가 20개면? 20줄 반복...
```

### MapStruct 사용

```java
// 인터페이스만 선언하면 자동 생성!
@Mapper(componentModel = "spring")
public interface StudentMapper {
    StudentResponse toResponse(Student student);
    Student toEntity(StudentCreateRequest request);
}
// → 필드명이 같으면 자동 매핑!
```

---

## 2장. 기본 사용법

### 의존성 추가

```gradle
dependencies {
    implementation 'org.mapstruct:mapstruct:1.5.5.Final'
    annotationProcessor 'org.mapstruct:mapstruct-processor:1.5.5.Final'
}
```

### Mapper 인터페이스 선언

```java
package com.example.demo.mapper;

import com.example.demo.dto.StudentCreateRequest;
import com.example.demo.dto.StudentResponse;
import com.example.demo.entity.Student;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")  // ← Spring Bean으로 등록
public interface StudentMapper {
    
    // Entity → Response DTO
    StudentResponse toResponse(Student student);
    
    // Request DTO → Entity
    Student toEntity(StudentCreateRequest request);
}
```

### Service에서 사용

```java
@Service
@RequiredArgsConstructor
public class StudentService {
    
    private final StudentRepository repository;
    private final StudentMapper mapper;  // ← DI로 주입!
    
    public StudentResponse create(StudentCreateRequest req) {
        Student student = mapper.toEntity(req);      // DTO → Entity
        Student saved = repository.save(student);
        return mapper.toResponse(saved);             // Entity → DTO
    }
}
```

---

## 3장. 커스텀 매핑 🟢

```java
@Mapper(componentModel = "spring")
public interface StudentMapper {
    
    // 필드명이 다를 때
    @Mapping(source = "studentName", target = "name")
    StudentResponse toResponse(Student student);
    
    // 특정 필드 무시
    @Mapping(target = "id", ignore = true)
    Student toEntity(StudentCreateRequest request);
}
```

---

## 실무 판단: 언제 MapStruct를 도입하나?

| 상황 | 판단 |
|------|------|
| DTO 5개 이하 | `from()` 정적 메서드로 충분 |
| DTO 10개 이상 | MapStruct 도입 고려 |
| 필드가 20개 이상 | MapStruct 강력 추천 |
| 팀에서 이미 사용 중 | 당연히 사용 |

---

## 정리

```
🎯 MapStruct = "Entity ↔ DTO 변환 자동화"

필수가 아니라 선택!
소규모: from() 정적 메서드로 충분
대규모: MapStruct로 자동화
```

---

> 🎯 **다음 주제**: 13번 "ResponseEntity와 API 응답 표준화" — API 응답 형식을 통일하는 방법을 배운다!

