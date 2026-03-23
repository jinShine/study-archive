# 22. 트랜잭션과 동시성

> **키워드**: `@Transactional` `ACID` `격리 수준` `propagation` `readOnly` `낙관적 락` `비관적 락` `@Version` `Gap Lock` `Named Lock` `Redis 분산 락` `Redisson`

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | @Transactional, ACID, 격리 수준, readOnly, 낙관적/비관적 락 | 면접 최다 출제 + 실무 매일 사용 |
| 🟡 이해 | propagation, Gap Lock, 동시성 문제 시나리오 | 트러블슈팅에 필요 |
| 🟢 참고 | Named Lock, Redis 분산 락(Redisson) | 대규모 시스템에서 필요, 당장은 개념만 |

> 💡 **21번에서 "JPA는 쓰기 지연으로 커밋 시점에 SQL을 날린다"고 배웠다.** 그 "커밋"이 바로 **트랜잭션**이다. 이번에는 트랜잭션이 뭔지, 그리고 "동시에 같은 데이터를 수정하면 어떻게 되는지"를 배운다.

---

## 1. 트랜잭션이 뭔가? 🔴

### 비유: ATM 송금

```
홍길동이 김철수에게 10만원을 보내는 과정:

Step 1: 홍길동 계좌에서 -10만원 (UPDATE)
Step 2: 김철수 계좌에서 +10만원 (UPDATE)

만약 Step 1은 성공했는데 Step 2에서 에러가 나면?
  → 홍길동 돈은 빠졌는데 김철수는 안 받음
  → 10만원이 공중에서 사라짐! 💀

해결: Step 1, 2를 하나의 "묶음"으로 처리한다
  → 둘 다 성공 → 확정 (커밋)
  → 하나라도 실패 → 전부 취소 (롤백)
  → 이 "묶음"이 트랜잭션이다!
```

### 정의

> **트랜잭션(Transaction)** = 여러 작업을 **하나의 논리적 단위**로 묶은 것. 전부 성공하거나 전부 실패한다.

### SQL로 보면

```sql
-- 트랜잭션 시작
START TRANSACTION;

UPDATE account SET balance = balance - 100000 WHERE owner = '홍길동';
UPDATE account SET balance = balance + 100000 WHERE owner = '김철수';

-- 둘 다 성공하면
COMMIT;       -- 확정! DB에 반영

-- 하나라도 실패하면
ROLLBACK;     -- 전부 취소! DB 원래 상태로
```

---

## 2. ACID — 트랜잭션의 4가지 약속 🔴

### 면접 단골!

| 속성 | 영어 | 의미 | 비유 |
|------|------|------|------|
| **A** | Atomicity (원자성) | 전부 성공 or 전부 실패 | 택배: 반만 배송은 없다. 배송 완료 or 전부 취소 |
| **C** | Consistency (일관성) | 트랜잭션 전후로 DB가 정상 상태 유지 | 송금 전후로 "총 잔액"은 변하지 않는다 |
| **I** | Isolation (격리성) | 동시에 실행되는 트랜잭션끼리 서로 영향 X | 시험: 옆 사람 답안지 못 봄 |
| **D** | Durability (지속성) | 커밋된 데이터는 영구 보관 | 계약서에 도장 찍으면 서류 없어져도 기록은 남는다 |

### 각각 자세히

#### A: 원자성 (Atomicity) 🔴

```
"전부 아니면 전무" (All or Nothing)

트랜잭션 안의 작업은 쪼갤 수 없다.
  → 10개 중 9개 성공, 1개 실패 → 10개 전부 롤백!
  → "반만 삼킨다"는 없다

실패 시나리오:
  1. 홍길동 계좌 -10만원 ✅
  2. 김철수 계좌 +10만원 ❌ (에러!)
  → ROLLBACK → 홍길동 계좌 원래대로 복구
```

#### C: 일관성 (Consistency) 🟡

```
트랜잭션 전후로 DB의 제약조건이 항상 만족되어야 한다.

예: 잔액은 0 미만이 될 수 없다 (CHECK 제약조건)
  → 송금 전: 홍길동 50만, 김철수 30만 (총 80만)
  → 송금 시: 홍길동 100만원 송금 시도 → 잔액이 -50만? → 제약조건 위반!
  → 트랜잭션 실패 → 롤백
```

#### I: 격리성 (Isolation) 🔴

```
동시에 여러 트랜잭션이 실행되어도 서로 간섭하면 안 된다.

트랜잭션 A: 홍길동 잔액 조회 → 50만원
트랜잭션 B: 홍길동에서 10만원 차감 → 40만원으로 UPDATE
트랜잭션 A: 홍길동 잔액 다시 조회 → 50만원? 40만원?

→ 이걸 어떻게 처리할지가 "격리 수준"이다 (아래에서 자세히)
```

#### D: 지속성 (Durability) 🟡

```
커밋된 데이터는 시스템이 크래시되더라도 살아있어야 한다.

→ DB는 커밋 시 WAL(Write-Ahead Log)에 기록
→ 서버가 다운되어도 로그에서 복구 가능
→ 개발자가 신경 쓸 일은 거의 없다 (DB가 보장)
```

---

## 3. @Transactional — Spring에서 트랜잭션 쓰기 🔴

### 가장 간단한 사용법

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)  // 클래스 레벨: 기본적으로 읽기 전용
public class StudyLogService {

    private final StudyLogRepository studyLogRepository;

    // 조회 — 클래스 레벨의 readOnly = true 적용
    public StudyLogResponse findById(Long id) {
        StudyLog log = studyLogRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("학습 일지를 찾을 수 없습니다"));
        return StudyLogResponse.from(log);
    }

    // 수정 — 메서드 레벨에서 readOnly = false로 오버라이드
    @Transactional  // readOnly = false (기본값)
    public StudyLogResponse update(Long id, StudyLogUpdateRequest request) {
        StudyLog log = studyLogRepository.findById(id).orElseThrow();
        log.update(request.getTitle(), request.getContent(),
                   request.getCategory(), request.getStudyTime());
        return StudyLogResponse.from(log);
    }
}
```

### 실무 패턴 🔴

```
클래스 레벨: @Transactional(readOnly = true)   ← 기본은 읽기 전용
메서드 레벨: @Transactional                     ← 쓰기가 필요한 메서드만

이유:
  ✅ readOnly = true는 성능 최적화를 해준다 (Dirty Checking 스킵, 리플리카 DB 사용 등)
  ✅ 쓰기 메서드에만 명시적으로 @Transactional → 의도가 명확
  ✅ 실수로 조회 메서드에서 데이터를 수정하는 걸 방지
```

### @Transactional의 동작 원리

```
@Transactional이 붙은 메서드를 호출하면?

1. Spring이 프록시(대리인)를 생성한다
2. 프록시가 메서드 실행 전에 트랜잭션을 시작한다
3. 실제 메서드를 실행한다
4. 정상 완료 → 커밋
   예외 발생 → 롤백

┌─────────────────────────────────────────┐
│  프록시 (Spring이 만든 대리인)              │
│                                         │
│  ① 트랜잭션 시작                          │
│  ② 실제 메서드 호출                       │
│  ③ 정상 → 커밋 / 예외 → 롤백              │
└─────────────────────────────────────────┘
```

> ⚠️ **같은 클래스 내부에서 호출하면 @Transactional이 안 먹는다!**

```java
@Service
public class StudyLogService {

    public void outerMethod() {
        innerMethod();  // ❌ 프록시를 거치지 않으므로 @Transactional 무시!
    }

    @Transactional
    public void innerMethod() {
        // 트랜잭션이 걸려야 하는데... 안 걸림!
    }
}
```

```
왜?
  → Spring은 외부에서 호출할 때만 프록시를 거친다
  → 같은 클래스 안의 this.innerMethod()는 프록시를 우회
  → @Transactional이 무시된다!

해결:
  → innerMethod()를 다른 클래스(다른 Service)로 빼거나
  → AOP 자기 호출 문제를 인식하고 설계를 바꾸기
```

> 🔴 **이 "자기 호출 문제"는 실무에서 자주 실수하는 함정이다.** 면접에서도 물어본다.

---

## 4. @Transactional의 주요 옵션 🔴

### readOnly 🔴

```java
@Transactional(readOnly = true)
public StudyLogResponse findById(Long id) { ... }
```

```
readOnly = true가 해주는 것:

1. Hibernate 레벨:
   → Dirty Checking 스킵 (스냅샷을 안 뜸)
   → 메모리 절약 + CPU 절약

2. Spring 레벨:
   → DB 커넥션에 readOnly 힌트 전달
   → MySQL: 리플리카(읽기 전용 DB)로 라우팅 가능
   → "이 트랜잭션은 읽기만 하니까 리플리카에서 읽어도 돼"

3. 안전장치:
   → 실수로 save()를 호출해도 flush 방지 (DB 변경 차단은 아님)
```

> 🔴 **조회 메서드에는 반드시 `readOnly = true`를 붙여라.** 성능도 좋아지고, 의도도 명확해진다.

### rollbackFor 🟡

```java
// 기본: RuntimeException(Unchecked Exception)만 롤백
// Checked Exception은 롤백 안 됨!
@Transactional
public void defaultRollback() {
    // RuntimeException → 롤백 O
    // IOException (Checked) → 롤백 X (커밋됨!)
}

// 해결: 모든 예외에서 롤백하도록 설정
@Transactional(rollbackFor = Exception.class)
public void rollbackAll() {
    // 모든 Exception → 롤백
}
```

```
왜 Checked Exception은 기본적으로 롤백 안 하나?
  → Spring의 설계 철학: "Checked Exception은 복구 가능한 예외"
  → 복구할 수 있으면 롤백하지 않아도 된다고 판단
  → 하지만 실무에서는 대부분 rollbackFor = Exception.class로 설정

⚠️ 이거 모르면 진짜 버그 난다!
  → IOException 던졌는데 롤백 안 됨 → 데이터 불일치!
```

### timeout 🟡

```java
@Transactional(timeout = 5)  // 5초 내에 완료 안 되면 롤백
public void slowMethod() { ... }
```

---

## 5. propagation — 트랜잭션 전파 🟡

### "트랜잭션 안에서 또 트랜잭션을 만나면?"

```java
@Service
public class OrderService {

    @Transactional
    public void createOrder() {
        // 주문 생성...
        notificationService.sendNotification();  // 이 메서드에도 @Transactional이 있다면?
    }
}

@Service
public class NotificationService {

    @Transactional  // ← 기존 트랜잭션에 합류? 새로 생성?
    public void sendNotification() { ... }
}
```

### 주요 전파 옵션

| 옵션 | 동작 | 비유 |
|------|------|------|
| `REQUIRED` (기본값) | 기존 트랜잭션 있으면 합류, 없으면 새로 생성 | "같이 갈 차 있으면 합승, 없으면 택시" |
| `REQUIRES_NEW` | 항상 새 트랜잭션 생성 (기존 것은 일시 중지) | "내 차 타고 갈래" |
| `SUPPORTS` | 기존 트랜잭션 있으면 합류, 없으면 트랜잭션 없이 실행 | "차 있으면 타고, 없으면 걸어감" |
| `NOT_SUPPORTED` | 트랜잭션 없이 실행 (기존 것은 일시 중지) | "나는 무조건 걸어감" |
| `MANDATORY` | 기존 트랜잭션 필수, 없으면 예외 | "합승 필수, 차 없으면 안 감" |

### 실무에서 쓰는 건 2개 🔴

```
REQUIRED (기본값):
  → 대부분의 경우 이걸 쓴다
  → 하나의 트랜잭션으로 묶여서, 어디서든 실패하면 전부 롤백

REQUIRES_NEW:
  → "이 작업은 메인 트랜잭션과 별개로" 할 때
  → 예: 주문 생성 실패해도 알림 로그는 남기고 싶다
```

```java
@Service
public class OrderService {

    @Transactional
    public void createOrder() {
        orderRepository.save(order);            // 메인 트랜잭션

        try {
            notificationService.sendNotification();  // REQUIRES_NEW → 별도 트랜잭션
        } catch (Exception e) {
            log.error("알림 실패", e);
            // 알림 실패해도 주문은 롤백되지 않는다!
        }
    }
}

@Service
public class NotificationService {

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendNotification() {
        // 이 안에서 실패해도 createOrder()의 트랜잭션에 영향 없음!
    }
}
```

---

## 6. 격리 수준 (Isolation Level) 🔴

### 왜 필요한가?

동시에 여러 트랜잭션이 같은 데이터에 접근하면 문제가 생긴다.

### 동시성 문제 3가지

#### Dirty Read — 커밋 안 된 데이터를 읽음 🔴

```
트랜잭션 A                     트랜잭션 B
──────────                    ──────────
UPDATE 잔액 = 40만원
(아직 커밋 안 함!)
                              SELECT 잔액 → 40만원 (커밋 안 된 값을 읽음!)
ROLLBACK! (50만원으로 복구)
                              40만원 기준으로 계산... → 데이터 불일치! 💀
```

#### Non-Repeatable Read — 같은 쿼리인데 결과가 다름 🔴

```
트랜잭션 A                     트랜잭션 B
──────────                    ──────────
SELECT 잔액 → 50만원
                              UPDATE 잔액 = 40만원
                              COMMIT
SELECT 잔액 → 40만원 (???)
→ 같은 트랜잭션인데 결과가 바뀜! 💀
```

#### Phantom Read — 행이 갑자기 생기거나 사라짐 🟡

```
트랜잭션 A                     트랜잭션 B
──────────                    ──────────
SELECT COUNT(*) WHERE 팀='백엔드' → 3명
                              INSERT 새 회원 (팀='백엔드')
                              COMMIT
SELECT COUNT(*) WHERE 팀='백엔드' → 4명 (???)
→ 유령(Phantom) 행이 나타남! 💀
```

### 4가지 격리 수준

```
                  Dirty Read    Non-Repeatable Read    Phantom Read
                  ─────────     ──────────────────     ────────────
READ UNCOMMITTED    발생 O           발생 O               발생 O
READ COMMITTED      방지 ✅           발생 O               발생 O     ← 대부분의 DB 기본값
REPEATABLE READ     방지 ✅           방지 ✅               발생 O     ← MySQL(InnoDB) 기본값
SERIALIZABLE        방지 ✅           방지 ✅               방지 ✅     ← 가장 안전, 가장 느림
```

```
안전도:   READ UNCOMMITTED < READ COMMITTED < REPEATABLE READ < SERIALIZABLE
성능:     READ UNCOMMITTED > READ COMMITTED > REPEATABLE READ > SERIALIZABLE

→ 안전할수록 느리다 (락을 더 많이 잡으니까)
```

### MySQL(InnoDB)은 특별하다

```
MySQL InnoDB의 기본값: REPEATABLE READ

특이한 점:
  → InnoDB는 REPEATABLE READ에서도 Phantom Read를 거의 막아준다!
  → MVCC(Multi-Version Concurrency Control) + Gap Lock 덕분
  → 다른 DB(PostgreSQL 등)는 REPEATABLE READ에서 Phantom Read 발생

→ MySQL을 쓴다면 기본값(REPEATABLE READ)을 바꿀 일이 거의 없다
```

### Spring에서 설정

```java
@Transactional(isolation = Isolation.READ_COMMITTED)
public void method() { ... }

// 보통은 설정 안 한다 = DB 기본값 사용
// MySQL: REPEATABLE READ (기본값)
```

> 🔴 **면접에서 "격리 수준 4가지를 설명해주세요"라고 물어본다.** READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE, 각각 방지하는 문제를 말하면 된다.

---

## 7. 동시성 문제 — 같은 데이터를 동시에 수정하면? 🔴

### 실제 시나리오: 좌석 예약

```
콘서트 좌석 A1 — 잔여 1석

사용자 A                      사용자 B
──────────                   ──────────
잔여석 조회 → 1석
                             잔여석 조회 → 1석
잔여석 = 1 - 1 = 0, UPDATE
                             잔여석 = 1 - 1 = 0, UPDATE
커밋
                             커밋

→ 1석인데 2명이 예약됨! 💀 (Lost Update)
```

이걸 해결하는 방법이 **락(Lock)**이다.

---

## 8. 비관적 락 (Pessimistic Lock) 🔴

### 비유: 화장실 잠금장치

```
비관적 = "누군가 반드시 방해할 것이다" 라고 비관적으로 생각
→ 미리 잠가둔다

화장실에 들어가면 문을 잠근다
  → 다른 사람은 문이 열릴 때까지 기다린다
  → 나올 때 잠금 해제
  → 다음 사람이 들어간다
```

### 동작

```
사용자 A                      사용자 B
──────────                   ──────────
SELECT ... FOR UPDATE (락!)
→ 좌석 A1을 잠금
                             SELECT ... FOR UPDATE
                             → 락이 걸려있다! 대기...
잔여석 = 1 - 1 = 0, UPDATE
커밋 → 락 해제
                             → 락 해제됨! 조회 시작
                             잔여석 조회 → 0석
                             → 예약 불가! (정상 동작 ✅)
```

### JPA에서 비관적 락

```java
public interface SeatRepository extends JpaRepository<Seat, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.id = :id")
    Optional<Seat> findByIdForUpdate(@Param("id") Long id);
}
```

```java
@Transactional
public void reserveSeat(Long seatId) {
    Seat seat = seatRepository.findByIdForUpdate(seatId)  // SELECT ... FOR UPDATE
        .orElseThrow();

    if (seat.getRemaining() <= 0) {
        throw new IllegalStateException("잔여석이 없습니다");
    }

    seat.decreaseRemaining();  // remaining - 1
}
// 커밋 → 락 해제
```

### 생성되는 SQL

```sql
SELECT * FROM seat WHERE id = 1 FOR UPDATE;
-- FOR UPDATE → 이 행에 쓰기 락!
-- 다른 트랜잭션은 이 행을 읽거나 수정할 때 대기
```

### 장단점

```
장점:
  ✅ 확실한 동시성 제어 (데이터 정합성 보장)
  ✅ 구현이 단순

단점:
  ❌ 락 대기로 인한 성능 저하
  ❌ 데드락 위험 (A가 B를 기다리고, B가 A를 기다리는 상황)
  ❌ 동시 접속자가 많으면 병목
```

---

## 9. 낙관적 락 (Optimistic Lock) 🔴

### 비유: 위키 문서 편집

```
낙관적 = "충돌은 거의 안 일어날 것이다" 라고 낙관적으로 생각
→ 잠그지 않고, 충돌이 나면 그때 처리

위키 문서를 편집할 때:
  1. 문서를 열면 버전(version=1)을 함께 받아온다
  2. 수정 후 저장 시: "나는 version=1을 수정했어. 반영해줘"
  3. DB에서 확인: 현재 version이 아직 1이면 → 성공! version=2로 업데이트
  4. 다른 사람이 먼저 수정해서 version=2가 됐다면 → 실패! "다시 해주세요"
```

### 동작

```
사용자 A                      사용자 B
──────────                   ──────────
조회: 좌석 A1 (version=1)
                             조회: 좌석 A1 (version=1)

수정: remaining = 0
UPDATE WHERE version=1
→ 성공! version=2로 변경
                             수정: remaining = 0
                             UPDATE WHERE version=1
                             → 실패! (현재 version=2라서 WHERE 조건 불일치)
                             → OptimisticLockException 발생!
                             → 다시 시도하거나, 사용자에게 알림
```

### JPA에서 낙관적 락 — @Version

```java
@Entity
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String seatNumber;
    private int remaining;

    @Version                    // ← 이것만 추가하면 낙관적 락!
    private Long version;

    public void decreaseRemaining() {
        if (this.remaining <= 0) {
            throw new IllegalStateException("잔여석이 없습니다");
        }
        this.remaining--;
    }
}
```

### 생성되는 SQL

```sql
-- 수정할 때
UPDATE seat
SET remaining = 0, version = 2     -- version + 1
WHERE id = 1 AND version = 1;     -- 조회 시점의 version으로 조건!

-- 영향받은 행이 0이면? → 누가 먼저 수정했다는 뜻
-- → OptimisticLockException 발생!
```

### 재시도 로직

```java
@Service
public class SeatService {

    @Retryable(
        retryFor = OptimisticLockException.class,
        maxAttempts = 3,
        backoff = @Backoff(delay = 100)
    )
    @Transactional
    public void reserveSeat(Long seatId) {
        Seat seat = seatRepository.findById(seatId).orElseThrow();
        seat.decreaseRemaining();
    }
    // → 충돌 시 100ms 후 재시도, 최대 3번
}
```

### 장단점

```
장점:
  ✅ DB 락을 안 잡으므로 성능이 좋다
  ✅ 데드락 위험 없음
  ✅ 동시 접속자가 많아도 대기 없음

단점:
  ❌ 충돌 시 재시도 로직 필요
  ❌ 충돌이 자주 발생하면 재시도만 하다가 성능 저하
  ❌ 재시도 실패 시 사용자에게 에러 보여야 함
```

---

## 10. 낙관적 vs 비관적 — 언제 뭘 써? 🔴

```
┌──────────────────┬──────────────────┬──────────────────┐
│                  │  비관적 락        │  낙관적 락        │
├──────────────────┼──────────────────┼──────────────────┤
│ 전략             │ 미리 잠금         │ 충돌 시 처리      │
│ DB 락            │ 사용 (FOR UPDATE) │ 미사용 (@Version) │
│ 충돌 빈도 높을 때 │ ✅ 유리           │ ❌ 재시도 폭주     │
│ 충돌 빈도 낮을 때 │ ❌ 불필요한 대기   │ ✅ 유리           │
│ 데드락 위험       │ 있음             │ 없음              │
│ 사용 사례         │ 좌석 예약, 재고   │ 게시글 수정, 설정  │
└──────────────────┴──────────────────┴──────────────────┘

선택 기준:
  충돌이 자주 발생 → 비관적 락 (좌석 예약, 재고 차감, 포인트 차감)
  충돌이 거의 없음 → 낙관적 락 (게시글 수정, 설정 변경, 프로필 수정)
```

> 🔴 **면접에서 "낙관적 락과 비관적 락의 차이점은?"은 거의 100% 물어본다.**

---

## 11. Gap Lock — MySQL InnoDB의 특별한 락 🟡

### Gap Lock이란?

```
일반 행 락:  특정 행만 잠금
Gap Lock:   행과 행 사이의 "빈 공간"도 잠금 (유령 행 방지)

예: id가 1, 5, 10인 행이 있을 때

일반 락:  [1] (잠금) ... [5] ... [10]
Gap Lock: [1] (잠금)(간격 잠금)[5](간격 잠금)[10]
          → id=3 같은 새 행의 INSERT도 차단!
```

```sql
-- Gap Lock 발생 예시
SELECT * FROM seat WHERE id BETWEEN 1 AND 10 FOR UPDATE;
-- → id 1~10 범위의 행 + 그 사이 간격까지 잠금
-- → 다른 트랜잭션이 id=3인 새 행을 INSERT 못 함
```

> 🟡 Gap Lock은 MySQL InnoDB의 REPEATABLE READ에서 자동으로 동작한다. Phantom Read를 방지하기 위해서다. 직접 설정할 일은 거의 없지만, 원인 모를 락 대기가 발생하면 Gap Lock을 의심할 수 있다.

---

## 12. Named Lock — 이름으로 잠그기 🟢

```
행이 아닌 "이름"으로 잠그는 DB 레벨 락

SELECT GET_LOCK('seat_reservation_1', 10);  -- 'seat_reservation_1' 이름으로 락 (10초 대기)
-- ... 비즈니스 로직 ...
SELECT RELEASE_LOCK('seat_reservation_1');  -- 락 해제
```

```java
// JPA에서 Named Lock 사용
public interface LockRepository extends JpaRepository<Seat, Long> {

    @Query(value = "SELECT GET_LOCK(:key, 10)", nativeQuery = true)
    void getLock(@Param("key") String key);

    @Query(value = "SELECT RELEASE_LOCK(:key)", nativeQuery = true)
    void releaseLock(@Param("key") String key);
}
```

```
언제 쓰나?
  → 특정 행이 아닌 "논리적 단위"로 락을 잡고 싶을 때
  → 예: 동일 사용자의 동시 결제 방지 → "payment_user_123"

주의:
  ⚠️ 별도의 커넥션에서 락을 관리해야 한다
  ⚠️ 락 해제를 빼먹으면 영원히 잠긴다
```

---

## 13. Redis 분산 락 (Redisson) 🟢

### 왜 DB 락으로 부족한가?

```
서버가 여러 대일 때:

서버 A ──→ MySQL (락)
서버 B ──→ MySQL (락)

→ 같은 DB를 쓰면 DB 락으로 충분하다

하지만:
서버 A ──→ MySQL Master
서버 B ──→ MySQL Replica (읽기 전용)

또는 MSA에서:
주문 서비스 ──→ MySQL A
재고 서비스 ──→ MySQL B

→ DB가 다르면 DB 락으로 못 잡는다!
→ Redis 같은 외부 시스템에서 "분산 락"을 잡아야 한다
```

### Redisson 사용 예시

```java
// build.gradle
// implementation 'org.redisson:redisson-spring-boot-starter:3.27.0'

@Service
@RequiredArgsConstructor
public class SeatService {

    private final RedissonClient redissonClient;
    private final SeatRepository seatRepository;

    public void reserveSeat(Long seatId) {
        RLock lock = redissonClient.getLock("seat:" + seatId);

        try {
            // 최대 10초 대기, 락 획득 후 5초 유지
            boolean acquired = lock.tryLock(10, 5, TimeUnit.SECONDS);

            if (!acquired) {
                throw new IllegalStateException("락 획득 실패");
            }

            // 락 안에서 비즈니스 로직 실행
            Seat seat = seatRepository.findById(seatId).orElseThrow();
            seat.decreaseRemaining();
            seatRepository.save(seat);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(e);
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();  // 반드시 해제!
            }
        }
    }
}
```

> 🟢 Redis 분산 락은 대규모 시스템에서 필요한 고급 주제다. 지금은 "DB 락으로 안 되는 상황이 있고, 그때 Redis를 쓴다" 정도만 알면 된다.

---

## 14. 락 선택 가이드 — 정리 🔴

```
상황별 추천:

1. 단일 서버 + 충돌 거의 없음
   → 낙관적 락 (@Version)

2. 단일 서버 + 충돌 자주 발생
   → 비관적 락 (FOR UPDATE)

3. 다중 서버 + 같은 DB
   → 비관적 락 or Named Lock

4. 다중 서버 + 다른 DB (MSA)
   → Redis 분산 락 (Redisson)

┌───────────┐   ┌──────────────┐   ┌───────────────┐
│ 낙관적 락  │ → │ 비관적 락    │ → │ 분산 락       │
│ (@Version) │   │ (FOR UPDATE) │   │ (Redis)       │
│ 간단, 빠름 │   │ 확실, DB 락  │   │ 서버 여러 대  │
└───────────┘   └──────────────┘   └───────────────┘
  충돌 적음        충돌 많음           서버 분산
```

---

## 15. 면접 대비 🔴🟡

### 🔴 필수 — 이것만은 반드시 답할 수 있어야 한다

**Q1: ACID를 설명해주세요.**

> Atomicity(원자성: 전부 성공 or 전부 실패), Consistency(일관성: 트랜잭션 전후 DB 정합성 유지), Isolation(격리성: 동시 트랜잭션 간 간섭 방지), Durability(지속성: 커밋된 데이터 영구 보관)를 말합니다.

**Q2: @Transactional(readOnly=true)를 쓰는 이유는?**

> Hibernate가 Dirty Checking을 위한 스냅샷을 생성하지 않아 메모리와 CPU를 절약합니다. 또한 Spring이 DB 커넥션에 readOnly 힌트를 전달해 리플리카 DB로 라우팅할 수 있어 부하 분산에도 유리합니다.

**Q3: 낙관적 락과 비관적 락의 차이점은?**

> 비관적 락은 데이터를 조회할 때 **미리 DB 락을 잡아** 다른 트랜잭션의 접근을 차단합니다. 낙관적 락은 락을 잡지 않고, 수정 시 **@Version 컬럼으로 충돌을 감지**하여 충돌이 발생하면 예외를 던집니다. 충돌이 자주 생기면 비관적, 거의 없으면 낙관적 락이 유리합니다.

**Q4: 격리 수준 4가지를 설명해주세요.**

> READ UNCOMMITTED(커밋 안 된 데이터 읽기 허용), READ COMMITTED(커밋된 데이터만 읽기), REPEATABLE READ(트랜잭션 내 반복 조회 일관성 보장), SERIALIZABLE(완전 직렬화)입니다. 안전할수록 성능이 떨어집니다. MySQL InnoDB의 기본값은 REPEATABLE READ입니다.

**Q5: @Transactional의 자기 호출 문제란?**

> 같은 클래스 내에서 @Transactional이 붙은 메서드를 호출하면, Spring의 AOP 프록시를 거치지 않아 트랜잭션이 적용되지 않는 문제입니다. 해결하려면 해당 메서드를 다른 빈(Service)으로 분리해야 합니다.

**Q6: @Transactional의 롤백 기본 동작은?**

> 기본적으로 RuntimeException(Unchecked Exception)에서만 롤백되고, Checked Exception에서는 롤백되지 않습니다. 모든 예외에서 롤백하려면 `rollbackFor = Exception.class`를 설정해야 합니다.

### 🟡 개념만 — 물어보면 설명할 수 있으면 OK

**Q7: propagation의 REQUIRED와 REQUIRES_NEW의 차이는?**

> REQUIRED는 기존 트랜잭션이 있으면 합류하고, REQUIRES_NEW는 항상 새 트랜잭션을 생성합니다. REQUIRES_NEW는 메인 트랜잭션과 독립적으로 커밋/롤백되어야 하는 작업(로그 기록, 알림 등)에 사용합니다.

**Q8: Gap Lock이란?**

> MySQL InnoDB에서 행과 행 사이의 간격(Gap)에 대한 락입니다. REPEATABLE READ 격리 수준에서 범위 조건 조회 시 자동으로 적용되며, Phantom Read를 방지합니다.

**Q9: 분산 락(Redis Lock)은 언제 필요한가요?**

> 서버가 여러 대이고 서로 다른 DB를 사용하는 MSA 환경에서, 단일 DB 락으로는 동시성을 제어할 수 없을 때 필요합니다. Redis의 Redisson 라이브러리를 사용해 서비스 간 공유 자원에 대한 락을 구현합니다.

---

## 16. 핵심 요약

```
┌──────────────────────────────────────────────────────┐
│            트랜잭션과 동시성 요약                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  🔒 트랜잭션                                          │
│    전부 성공 or 전부 실패 (All or Nothing)              │
│    ACID: 원자성 / 일관성 / 격리성 / 지속성              │
│                                                      │
│  ⚡ @Transactional 실무 패턴                           │
│    클래스: readOnly = true (기본 읽기 전용)             │
│    메서드: @Transactional (쓰기 필요할 때만)            │
│    주의: 자기 호출 문제, Checked Exception 롤백 안 됨   │
│                                                      │
│  🏗️ 격리 수준                                         │
│    READ UNCOMMITTED < READ COMMITTED                 │
│    < REPEATABLE READ < SERIALIZABLE                  │
│    MySQL 기본: REPEATABLE READ                       │
│                                                      │
│  🔑 락 선택                                           │
│    충돌 적음 → 낙관적 (@Version)                       │
│    충돌 많음 → 비관적 (FOR UPDATE)                     │
│    서버 분산 → Redis 분산 락                           │
│                                                      │
│  🔗 다음 단계 (23번 Spring Data JPA)                   │
│    JpaRepository 쿼리 메서드, @Query, JPQL,          │
│    Pageable — 실전 데이터 조회 기법                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```
