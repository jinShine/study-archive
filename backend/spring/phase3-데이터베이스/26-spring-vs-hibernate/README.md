# 26. Spring vs Hibernate 총정리 — "누가 뭘 하는 건가?"

> **키워드**: `@Transactional` `readOnly` `Flush` `Session` `Spring 계층 vs Hibernate 계층` `실무 패턴`

---

## 핵심만 한 문장

**지금까지 배운 JPA/QueryDSL이 실제로 어떻게 돌아가는지, Spring은 뭘 하고 Hibernate는 뭘 하는지 정리하는 주제**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~2장 (역할 분담, @Transactional) | 면접 단골 + 실무에서 버그 원인 |
| 🟡 이해 | 3~4장 (readOnly, Flush) | 성능 최적화 할 때 필요 |
| 🟢 참고 | 5장 (실무 패턴) | 프로젝트마다 다름 |

---

## 1장. 누가 뭘 하는 건가? 🔴

### 혼동하기 쉬운 부분

```java
@Repository
public interface StudyLogRepository extends JpaRepository<StudyLog, Long> {
    List<StudyLog> findByStatus(String status);
}

@Service
public class StudyLogService {
    
    @Transactional
    public void updateLog(Long id) {
        StudyLog log = repository.findById(id);
        log.setTitle("Updated");  // ← 이게 DB에 저장되는가?
    }
}
```

**질문: @Transactional만으로 저장이 되나?**

**답: 그렇다!** 하지만 "왜"인지 이해해야 한다.

---

### 계층 구조: Spring이 위, Hibernate가 아래

```
┌─────────────────────────────────────────┐
│          Spring Framework                │
│                                         │
│  @Transactional (트랜잭션 관리)          │
│  Session 열기/닫기                       │
│  커넥션 풀링                             │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Hibernate (JPA 구현체)                 │
│                                         │
│  EntityManager (영속성 컨텍스트)        │
│  Dirty Checking (변경감지)               │
│  Flush (DB에 반영)                      │
│  쿼리 생성 및 실행                       │
│                                         │
├─────────────────────────────────────────┤
│          JDBC (드라이버)                 │
│          SQL 실행                        │
└─────────────────────────────────────────┘
```

**각 계층의 역할:**

| 계층 | 담당 | 예시 |
|------|------|------|
| **Spring** | 트랜잭션 시작/종료 | `@Transactional` 메서드 시작 = 트랜잭션 시작 |
| **Hibernate** | 데이터 변경감지 | `log.setTitle()` 감지 |
| **Hibernate** | DB 동기화 | 메서드 종료 시 자동 `flush()` |
| **JDBC** | 실제 쿼리 실행 | UPDATE 문 DB로 전송 |

---

## 2장. @Transactional이 하는 일 🔴

### 동작 흐름 (매우 중요!)

```java
@Service
public class StudyLogService {
    
    @Transactional  // ← Spring이 이 메서드를 감싼다
    public void updateLog(Long id) {
        // Step 1. Spring이 트랜잭션 시작
        //        (Hibernate Session 열기, DB 커넥션 획득)
        
        StudyLog log = repository.findById(id);
        // Step 2. Hibernate가 1차 캐시에 저장
        
        log.setTitle("Updated");
        // Step 3. Hibernate가 변경감지 (Dirty Checking)
        //        → 이 시점에는 DB 미반영!
        
        // Step 4. 메서드 종료
        //        → Spring이 자동으로 flush() 호출
        //        → Hibernate가 변경사항을 SQL로 변환
        //        → JDBC가 UPDATE 실행
        //        → 트랜잭션 COMMIT
    }
}
```

**핵심: @Transactional이 없으면?**

```java
public void updateLog(Long id) {
    StudyLog log = repository.findById(id);
    log.setTitle("Updated");
    
    // ❌ 트랜잭션 없음 = 자동 flush 없음 = DB 미반영!
    // ❌ Hibernate가 변경을 감지하지만 flush() 타이밍 없음
}
```

---

### 예외 발생 시 어떻게 되나?

```java
@Transactional
public void updateLogWithError(Long id) {
    StudyLog log = repository.findById(id);
    log.setTitle("Updated");
    
    if (someCondition) {
        throw new RuntimeException("에러!");
        // ← 이 시점에 Spring이 자동으로 ROLLBACK
        //   DB 미반영 (안전!)
    }
}
```

**without @Transactional:**

```java
public void updateLogWithError(Long id) {
    StudyLog log = repository.findById(id);
    log.setTitle("Updated");
    
    if (someCondition) {
        throw new RuntimeException("에러!");
        // ❌ @Transactional 없음 = ROLLBACK 안 됨
        //    부분적으로 변경될 수 있음 (위험!)
    }
}
```

---

## 3장. readOnly 최적화: Spring vs Hibernate 🟡

### 상황: 조회만 하는 메서드

```java
@Service
public class StudyLogService {
    
    @Transactional(readOnly = false)  // ← 기본값
    public List<StudyLog> findAll() {
        return repository.findAll();
    }
}
```

**비효율:**
- Hibernate가 **Dirty Checking 준비**
- 1차 캐시에 엔티티 저장
- 메모리 사용 증가
- 변경감지 비용 (필요 없는데!)

---

### 개선: readOnly = true

```java
@Transactional(readOnly = true)  // ← 조회 전용
public List<StudyLog> findAll() {
    return repository.findAll();
}
```

**Spring 계층에서 하는 일:**
```
@Transactional(readOnly = true)
  ↓
Spring: "이건 읽기만 하겠네"
  ↓
트랜잭션을 READ_ONLY 모드로 시작
  ↓
"이 트랜잭션에서는 UPDATE/INSERT/DELETE 안 함"
```

**Hibernate 계층에서 하는 일:**
```
readOnly = true
  ↓
Hibernate: "그럼 Dirty Checking 안 할래"
  ↓
변경감지 로직 스킵
  ↓
메모리 절약, 성능 향상 ✅
```

---

### 비교: readOnly 차이

```
조회 100개 데이터:

❌ readOnly = false (기본값)
├─ 1차 캐시에 100개 저장
├─ Dirty Checking 준비 (메모리)
├─ 변경감지 로직 실행 (CPU)
└─ 무거움

✅ readOnly = true
├─ 1차 캐시 사용 최소화
├─ Dirty Checking 스킵
├─ 변경감지 로직 스킵
└─ 가벼움 (약 10~30% 성능 향상)
```

---

### 언제 뭘 쓸까?

```java
// 1️⃣ 조회만
@Transactional(readOnly = true)
public StudyLog getById(Long id) {
    return repository.findById(id).orElseThrow();
}

// 2️⃣ 조회 + 복잡한 처리
@Transactional(readOnly = true)
public Page<StudyLogDto> search(SearchRequest req) {
    List<StudyLog> logs = queryRepository.search(req);
    return mapToDto(logs);  // 변환 로직 (엔티티 수정 X)
}

// 3️⃣ 저장/수정
@Transactional  // readOnly = false (기본값)
public void updateLog(Long id, String title) {
    StudyLog log = repository.findById(id).orElseThrow();
    log.setTitle(title);  // 수정함!
}

// 4️⃣ 조회 + 저장 섞임
@Transactional  // readOnly = false
public void complexLogic(Long id) {
    StudyLog log = repository.findById(id).orElseThrow();  // 읽기
    log.setTitle("Updated");  // 쓰기
    saveAuditLog(log);  // 추가 저장
}
```

---

## 4장. Flush: 언제 DB로 보낼까? 🟡

### Flush의 의미

```
Flush = Hibernate가 변경사항을 SQL로 변환하고 DB로 보내는 것
```

```java
@Transactional
public void updateLog(Long id) {
    StudyLog log = repository.findById(id);
    log.setTitle("Updated");
    
    // 이 시점: DB에 미반영! (메모리에만 있음)
    
    em.flush();  // ← 명시적 flush
    
    // 이 시점: DB에 반영됨!
}
```

**자동 flush 타이밍:**

```java
@Transactional
public void demo() {
    // 1️⃣ 메서드 종료 (자동 flush + commit)
    // 2️⃣ 쿼리 실행 전 (충돌 방지)
    // 3️⃣ em.flush() 명시적 호출
}
```

---

### 실제 상황

```java
@Transactional
public void updateLogThenRead() {
    StudyLog log = repository.findById(1L);
    log.setTitle("Updated");
    
    // flush 안 했는데, 새로운 쿼리 실행하면?
    List<StudyLog> all = repository.findAll();  // ← 자동 flush 먼저 실행!
    
    // all 에는 "Updated" 제목이 포함됨
}
```

**flush 없으면:**

```
1. findAll() 쿼리 생성
2. flush 필요한가? 확인 (yes!)
3. 변경사항 flush
4. findAll() 실행
```

---

## 5장. 예외와 롤백 🔴

### 예상과 다른 동작

```java
@Transactional
public void updateWithTryCatch() {
    StudyLog log = repository.findById(1L);
    log.setTitle("Updated");
    
    try {
        someMethod();  // 예외 발생
    } catch (Exception e) {
        // 예외 처리함!
        return;
    }
}

// 결과: 타이틀이 DB에 저장됨!
// (예외를 처리했으니까 메서드가 정상 종료됨)
```

**그래서 이렇게 해야 한다:**

```java
@Transactional
public void updateWithProperHandling() {
    try {
        StudyLog log = repository.findById(1L);
        log.setTitle("Updated");
        someMethod();
    } catch (Exception e) {
        // 예외를 처리하되, 트랜잭션 롤백해야 함!
        throw new RuntimeException("Rollback needed", e);
    }
}
```

**또는:**

```java
@Transactional
public void updateWithManualRollback(TransactionStatus status) {
    try {
        StudyLog log = repository.findById(1L);
        log.setTitle("Updated");
        someMethod();
    } catch (Exception e) {
        status.setRollbackOnly();  // 명시적 롤백 표시
        throw e;
    }
}
```

---

### 체크 예외 (Checked Exception)

```java
@Transactional
public void methodWithCheckedException() throws IOException {
    StudyLog log = repository.findById(1L);
    log.setTitle("Updated");
    
    throw new IOException("파일 없음");
    // ❌ 체크 예외 = 롤백 안 됨!
}
```

**해결:**

```java
@Transactional(rollbackFor = IOException.class)
public void methodWithCheckedException() throws IOException {
    StudyLog log = repository.findById(1L);
    log.setTitle("Updated");
    
    throw new IOException("파일 없음");
    // ✅ 롤백됨
}
```

---

## 6장. 실무 패턴 🟢

### 패턴 1: 조회 + 저장 분리

```java
@Service
public class StudyLogService {
    
    private final StudyLogRepository repository;
    private final AuditLogRepository auditRepository;
    
    // 1️⃣ 조회 메서드
    @Transactional(readOnly = true)
    public StudyLogDto getById(Long id) {
        StudyLog log = repository.findById(id).orElseThrow();
        return mapToDto(log);  // 엔티티 수정 안 함
    }
    
    // 2️⃣ 저장 메서드
    @Transactional
    public void updateLog(Long id, String title) {
        StudyLog log = repository.findById(id).orElseThrow();
        log.setTitle(title);  // 자동 flush + commit
    }
    
    // 3️⃣ 복합 로직
    @Transactional
    public void updateLogWithAudit(Long id, String title) {
        // 로그 수정
        StudyLog log = repository.findById(id).orElseThrow();
        log.setTitle(title);
        
        // 감사 로그 저장
        AuditLog audit = new AuditLog(id, "UPDATE", title);
        auditRepository.save(audit);
        
        // flush + commit (한 번에!)
    }
}
```

---

### 패턴 2: 리플리카 라우팅 (읽기 복제)

대규모 서비스에서:
- **Master DB**: 쓰기 전용
- **Replica DB**: 읽기 전용 (여러 개 가능)

```java
@Configuration
public class DataSourceConfig {
    
    @Bean
    public DataSource masterDataSource() {
        // 쓰기용 DB
        return DriverManagerDataSource.create(masterUrl);
    }
    
    @Bean
    public DataSource replicaDataSource() {
        // 읽기용 DB (1초 지연, 허용)
        return DriverManagerDataSource.create(replicaUrl);
    }
    
    @Bean
    public DataSource routingDataSource(
        DataSource master, 
        DataSource replica
    ) {
        // readOnly = true면 replica로, 아니면 master로
        return new RoutingDataSource(master, replica);
    }
}

// 사용
@Service
public class StudyLogService {
    
    @Transactional(readOnly = true)  // ← replica로 자동 라우팅
    public List<StudyLog> getAll() {
        return repository.findAll();
    }
    
    @Transactional  // ← master로 라우팅
    public void updateLog(Long id, String title) {
        StudyLog log = repository.findById(id).orElseThrow();
        log.setTitle(title);
    }
}
```

---

### 패턴 3: 배치 처리 (대량 저장)

```java
@Service
public class BatchService {
    
    @Transactional
    public void saveLogs(List<StudyLog> logs) {
        // ❌ 나쁜 방식 (메모리 부족)
        // logs.forEach(repository::save);  // 10000개? 메모리 터짐
        
        // ✅ 좋은 방식 (배치 처리)
        for (int i = 0; i < logs.size(); i++) {
            repository.save(logs.get(i));
            
            // 100개마다 flush + clear
            if ((i + 1) % 100 == 0) {
                entityManager.flush();
                entityManager.clear();  // 1차 캐시 비우기
            }
        }
    }
}
```

또는 `application.yml`:

```yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 100  # 100개씩 배치 처리
        order_inserts: true
        order_updates: true
```

---

## 7장. 정리 & 면접 대비 🔴

### 핵심 개념

```
┌─────────────────────────────────────────┐
│  @Transactional = Spring의 책임         │
│                                         │
│  1️⃣ 트랜잭션 시작 (메서드 진입)         │
│  2️⃣ Hibernate Session 생성              │
│  3️⃣ DB 커넥션 획득                       │
│                                         │
└─────────────────────────────────────────┘
         ↓ (메서드 실행)
┌─────────────────────────────────────────┐
│  Hibernate = 데이터 관리의 책임           │
│                                         │
│  1️⃣ 엔티티 로드 → 1차 캐시 저장        │
│  2️⃣ 수정 감지 (Dirty Checking)        │
│  3️⃣ 필요시 flush (SQL 생성 + 전송)    │
│                                         │
└─────────────────────────────────────────┘
         ↓ (메서드 종료)
┌─────────────────────────────────────────┐
│  Spring = 트랜잭션 마무리                │
│                                         │
│  1️⃣ 자동 flush (변경사항 반영)          │
│  2️⃣ COMMIT (성공) 또는 ROLLBACK (예외) │
│  3️⃣ Session 종료                        │
│                                         │
└─────────────────────────────────────────┘
```

---

### 면접 질문

**Q: "@Transactional만으로 저장이 되는데, save()를 안 해도 되나요?"**

> 맞습니다. `@Transactional`이 있으면 메서드 종료 시 자동으로 flush가 실행되어 변경사항이 DB에 반영됩니다. setter로 수정한 후 save()를 호출하면 같은 엔티티를 두 번 저장하는 셈이므로 불필요합니다. 다만 새로운 엔티티를 추가할 때는 save()를 호출해야 합니다.

**Q: "readOnly = true는 뭐가 다른가요?"**

> Dirty Checking을 스킵합니다. 읽기 전용이니까 변경감지를 할 필요가 없다는 뜻이고, 그러면 Hibernate가 불필요한 메모리를 쓰지 않고 CPU도 덜 씁니다. 조회 메서드에는 항상 `readOnly = true`를 붙이는 게 좋습니다.

**Q: "예외 발생 시 자동 롤백되나요?"**

> Runtime Exception이면 자동 롤백됩니다. 하지만 Checked Exception은 기본적으로 롤백되지 않으니 `rollbackFor`로 명시해야 합니다. 또한 `try-catch`로 예외를 처리하면 메서드가 정상 종료된 것으로 취급되어 COMMIT되므로, 롤백이 필요하면 예외를 다시 던져야 합니다.

**Q: "flush는 뭐고 언제 일어나나요?"**

> Hibernate가 메모리의 변경사항을 SQL로 변환해서 DB로 보내는 것입니다. 자동으로는 트랜잭션 종료 시, 새로운 쿼리 실행 전, `em.flush()` 호출 시에 발생합니다. flush는 commit과 다릅니다. flush는 SQL을 보내는 것이고, commit은 트랜잭션을 완료하는 것입니다.

---

## 정리: Phase 3 마무리

```
Phase 3: 데이터베이스 (17~26)

17. RDBMS 기초와 SQL           ✅
18. SQL 심화                    ✅
19. DB 모델링과 정규화          ✅
20. JPA 기초 — ORM 개념과 Entity ✅
21. JPA 동작 원리               ✅
22. 트랜잭션과 동시성           ✅
23. Spring Data JPA            ✅
24. 연관 관계 매핑과 N+1 문제   ✅
25. QueryDSL                   ✅
26. Spring vs Hibernate 총정리  ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 4: 실전 심화 (27~32)
├─ 27. 인증/인가 기초
├─ 28. JWT 인증 구현
├─ 29. 테스트 코드 작성
├─ 30. 캐싱과 성능
├─ 31. 비동기와 이벤트 기반 설계
└─ 32. 외부 API 연동

다음 주제부터는 "보안", "테스트", "성능", "외부 연동" 같은
더 실전적인 주제들을 배운다.
```

