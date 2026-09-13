# 스프링 예습 — DB 연결과 트랜잭션

> TCP 소켓 → DriverManager → DataSource → Transaction → MySQL → JDBC → Spring @Transactional

이 목록은 하나의 이야기다. **"자바 애플리케이션이 MySQL과 어떻게 연결되고, 그 연결 위에서 어떻게 작업 단위를 묶는가."**

- 1~3번(TCP, DriverManager, DataSource) = **연결** 이야기
- 4~7번(Transaction ~ @Transactional) = 연결 위에서 **작업을 묶는** 이야기

가장 아래층인 TCP부터 올라간다. 그래야 "왜 커넥션 풀이 필요한가"가 자연스럽게 나온다.

---

## 1. TCP 소켓 통신 — 모든 것의 바닥

### 소켓이란

애플리케이션이 네트워크로 데이터를 보내려면 운영체제에 "통신 창구"를 열어달라고 요청해야 한다. 그 창구가 **소켓**이고, `IP 주소 + 포트 번호` 조합으로 식별된다. 파일을 열면 파일 핸들을 받아 read/write 하듯, 소켓을 열면 소켓 핸들을 받아 send/receive 한다. 자바에서는 `java.net.Socket`이 그 핸들이다.

MySQL 서버는 3306 포트에서 연결을 기다리고(listen), JDBC 드라이버는 내부적으로 `new Socket("db-host", 3306)`을 열어 MySQL 프로토콜로 대화한다.

**JDBC 커넥션 하나 = TCP 소켓 하나.**

### 3-way handshake — 왜 세 번 오가는가

TCP는 "신뢰할 수 있는" 연결이다. 보낸 데이터가 순서대로, 빠짐없이 도착함을 보장한다. 그러려면 통신 시작 전에 양쪽이 서로의 **시작 순번(sequence number)** 을 알아야 하고, 그 순번을 맞추는 과정이 핸드셰이크다.

```
클라이언트(앱)                          서버(MySQL)
     |                                      |
     |  ── SYN (seq=100) ──────────────►    |   "연결하자. 내 순번은 100부터"
     |                                      |
     |  ◄── SYN-ACK (seq=300, ack=101) ──   |   "받았다(101 기다림). 내 순번은 300부터"
     |                                      |
     |  ── ACK (ack=301) ──────────────►    |   "너 것도 받았다(301 기다림)"
     |                                      |
     |         ===== 연결 성립 =====          |
```

- **SYN** = Synchronize. "순번을 동기화하자"는 요청. 내 시작 순번을 알려준다.
- **ACK** = Acknowledge. "네 메시지 받았다"는 확인. `ack=101`은 "100번까지 받았으니 다음엔 101 보내"라는 뜻.
- **SYN-ACK** = 서버가 "네 SYN 받았고, 여기 내 SYN도"를 한 패킷에 합친 것.

**왜 2번이 아니고 3번인가.** 통신은 양방향이다. 클라이언트→서버, 서버→클라이언트 각 방향에 대해 "보냈다 + 받았다 확인"이 필요하다. 2번만 오가면 클라이언트는 자기 SYN이 도착한 걸 알지만, 서버는 자기 SYN-ACK가 도착했는지 모른다. 세 번째 ACK가 그 마지막 확인이다. 3번이 최소다.

### 여기서 비용이 발생한다

핸드셰이크는 최소 **1 RTT**(왕복 시간)가 든다. 같은 데이터센터면 1ms 미만, 다른 리전이면 수십 ms. 그런데 MySQL은 TCP 연결 후에 **MySQL 자체 인증 핸드셰이크**를 또 한다(서버가 인증 방식 통보 → 클라이언트가 해시된 비밀번호 전송 → 서버 OK). 왕복이 몇 번 더 붙는다.

즉 DB 커넥션 하나 만드는 데 왕복이 최소 3~4번 필요하다. 쿼리 자체는 1번 왕복인데, **연결 맺는 게 쿼리보다 비싸다.**

---

## 2. DriverManager — JDBC의 원시적인 연결 방법

### JDBC의 구조

JDBC는 **인터페이스 묶음**이다. `java.sql.Connection`, `Statement`, `ResultSet`은 모두 인터페이스고, 실제 구현은 DB 벤더가 제공하는 **드라이버**(MySQL은 `mysql-connector-j`)에 있다. 자바 코드는 인터페이스만 보고, TCP 소켓을 열고 MySQL 프로토콜로 바이트를 주고받는 일은 드라이버가 한다.

### DriverManager가 하는 일

```java
Connection conn = DriverManager.getConnection(
    "jdbc:mysql://localhost:3306/shop",
    "user",
    "password"
);
```

이 한 줄 뒤에서 벌어지는 일:

1. `DriverManager`가 등록된 드라이버 목록을 훑으며 "이 URL(`jdbc:mysql://`) 처리할 수 있는 드라이버 있어?"라고 묻는다.
2. MySQL 드라이버가 응답한다.
3. 드라이버가 **TCP 소켓을 열고(3-way handshake), MySQL 인증을 하고**, `Connection` 객체를 만들어 반환한다.

드라이버 등록은 예전엔 `Class.forName("com.mysql.cj.jdbc.Driver")`를 직접 써야 했지만, JDBC 4.0부터는 드라이버 jar 안의 `META-INF/services/java.sql.Driver` 파일을 읽어 자동 등록된다. 오래된 코드의 `Class.forName`은 옛날 방식이다.

### 문제점

`getConnection()`을 부를 때마다 **1번의 비용을 전부 새로 지불**한다. 요청마다 소켓 열고 인증하고 쿼리 하나 날리고 닫는다면, 실제 일(쿼리)보다 준비 작업이 더 오래 걸린다. 초당 수백 요청이 들어오는 서버에서는 성립하지 않는다.

→ `DriverManager`는 학습용, 단발성 스크립트, 배치 정도에서만 쓰고 서버 애플리케이션에서는 직접 쓰지 않는다.

---

## 3. DataSource — 연결을 "얻는 방법"의 추상화

### 인터페이스는 단순하다

```java
public interface DataSource {
    Connection getConnection() throws SQLException;
    // ...
}
```

`javax.sql.DataSource`의 핵심은 이 메서드 하나다. "커넥션을 어떻게 얻는지는 묻지 말고, 필요하면 여기서 받아가라"는 계약이다. 뒤에서 매번 새로 만들든 미리 만들어 둔 걸 빌려주든, 코드는 상관하지 않는다.

DI에서 `OrderService`가 `OrderRepository` 인터페이스만 알고 구현체는 모르는 것과 같은 구조다. 리포지토리는 `DataSource` 인터페이스만 알고 뒤의 구현체(풀 유무)는 모른다.

### 구현체가 커넥션 풀을 한다

실무에서 쓰는 `DataSource` 구현체는 거의 전부 **커넥션 풀**이다. 스프링 부트 기본은 **HikariCP**, 그 외 Apache DBCP2, Tomcat JDBC Pool.

레스토랑 비유로 정리하면:

| 레스토랑 | 커넥션 풀 |
|---|---|
| 가게 열 때 테이블 N개 미리 세팅 | 애플리케이션 시작 시 TCP 연결 + MySQL 인증을 N번 미리 완료. 1번의 비용을 **시작할 때 한 번만** 지불 |
| 손님이 오면 빈 테이블로 안내 | `getConnection()`은 새 연결이 아니라 **풀에서 빌려오기**. 밀리초 이하 |
| 손님이 나가면 테이블을 치워 재사용 | `connection.close()`는 소켓을 닫지 않고 **풀에 반납** |
| 테이블이 다 차면 손님은 대기 | 풀이 비면 `getConnection()`은 `connection-timeout`(Hikari 기본 30초)까지 블로킹 |

### close()가 닫지 않는다

풀이 넘겨주는 `Connection`은 진짜 커넥션이 아니라 **프록시(래퍼)** 다. `close()`를 호출하면 프록시가 가로채서 "실제 소켓 닫기" 대신 "autocommit 원복하고 풀에 반납"을 한다.

그래서 풀을 써도 코드는 여전히 `try-with-resources`로 `close()`를 불러야 한다. 안 부르면 반납이 안 되어 **커넥션 누수**가 생기고, 풀이 말라서 모든 요청이 30초씩 대기하다 실패한다. 실무에서 자주 보는 장애 패턴이다.

### 스프링 부트에서는

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/shop
    username: user
    password: password
    hikari:
      maximum-pool-size: 10   # 기본값 10
```

이것만 쓰면 부트가 `HikariDataSource`를 빈으로 자동 등록한다. `DataSource`를 주입받으면 이것이 온다. `@Bean`으로 직접 만들 일은 DB를 두 개 쓸 때 정도 — 빈 등록 파트의 "같은 타입 빈이 여러 개" 상황이 실제로 나오는 지점이다.

**여기까지가 "연결" 이야기. 이제 연결 위에서 작업을 묶는다.**

---

## 4. Transaction — 개념

### 정의

**논리적으로 하나여야 하는 작업 묶음.** 안의 작업이 전부 성공하거나, 하나라도 실패하면 전부 없던 일이 된다. 중간 상태는 존재하지 않는다.

계좌 이체가 교과서 예시인 이유: "A 계좌 -10만원"과 "B 계좌 +10만원"은 SQL로는 UPDATE 두 개지만, 첫 번째만 실행되고 서버가 죽으면 10만원이 증발한다. 이 둘은 반드시 한 덩어리여야 한다.

### 두 개의 동작

- **COMMIT**: 묶음 안의 변경을 확정. 다른 사람에게도 보이고, 서버가 죽어도 남는다.
- **ROLLBACK**: 묶음 안의 변경을 전부 취소. 시작 전 상태로 돌아간다.

### ACID

| 성질 | 뜻 | 이체 예시 |
|---|---|---|
| **A**tomicity (원자성) | 전부 되거나 전부 안 된다 | 출금만 되고 입금 안 되는 상태 없음 |
| **C**onsistency (일관성) | 트랜잭션 전후로 제약조건이 지켜진다 | 두 계좌 합계 불변, 잔액 음수 불가 |
| **I**solation (격리성) | 동시 실행되는 트랜잭션이 서로 간섭하지 않는다 | 이체 중간 상태를 다른 조회가 보지 못함 |
| **D**urability (지속성) | 커밋되면 장애가 나도 남는다 | 커밋 직후 전원이 꺼져도 이체는 유효 |

**Isolation**은 "완벽하게 지키면 느리다"는 트레이드오프가 있어 단계를 조절할 수 있다 → 격리 수준(isolation level).

---

## 5. Transaction in MySQL

### 스토리지 엔진부터

MySQL은 테이블마다 스토리지 엔진을 고를 수 있고, **트랜잭션은 InnoDB에서만** 된다. MyISAM 테이블에서 `ROLLBACK`을 해도 아무 일도 일어나지 않는다. MySQL 5.5부터 기본 엔진이 InnoDB라 요즘은 신경 쓸 일이 거의 없지만, 오래된 DB는 `SHOW CREATE TABLE`로 확인할 것.

### autocommit — 기본은 ON

MySQL은 기본적으로 **문장 하나 = 트랜잭션 하나**로 동작한다. `UPDATE` 한 줄을 실행하면 자동으로 시작되고 자동으로 커밋된다.

여러 문장을 묶으려면 명시적으로 시작한다.

```sql
START TRANSACTION;   -- 또는 BEGIN;
UPDATE account SET balance = balance - 100000 WHERE id = 'A';
UPDATE account SET balance = balance + 100000 WHERE id = 'B';
COMMIT;              -- 또는 ROLLBACK;
```

`START TRANSACTION`을 만나면 그 커넥션은 `COMMIT`/`ROLLBACK`까지 autocommit을 잠시 끈다. `SET autocommit = 0;`으로 세션 전체를 수동 모드로 바꿀 수도 있다.

### 어떻게 되돌릴 수 있나

- **undo log**: InnoDB는 데이터를 바꾸기 전에 변경 전 값을 기록해 둔다. `ROLLBACK`은 이 로그를 거꾸로 적용하는 것. 격리 수준의 "커밋 전 데이터를 다른 트랜잭션이 못 보게 하기"도 undo log로 옛 값을 보여주는 방식으로 구현된다.
- **redo log**: 지속성(D) 담당. 커밋 시 변경 내용을 디스크의 로그에 먼저 확정 기록하고, 실제 데이터 파일 반영은 나중에 해도 장애 후 복구할 수 있게 한다.

### 가장 중요한 사실: 트랜잭션은 커넥션(세션)에 귀속된다

터미널 두 개로 실험:

```
[터미널 1]                              [터미널 2]
START TRANSACTION;
UPDATE account SET balance = 0
  WHERE id = 'A';
                                        SELECT balance FROM account
                                          WHERE id = 'A';
                                        → 아직 옛 값이 보인다 (커밋 전)
COMMIT;
                                        SELECT ... → 이제 0이 보인다
```

터미널 1에서 시작한 트랜잭션은 **터미널 1의 커넥션에서만** 커밋/롤백할 수 있다. 터미널 2에서 `COMMIT`을 쳐도 터미널 1의 트랜잭션과 무관하다.

→ **자바에서 트랜잭션을 유지하려면, 시작부터 커밋까지 같은 `Connection` 객체를 써야 한다.** 중간에 풀에서 다른 커넥션을 빌려오면 그건 다른 세션이라 트랜잭션이 깨진다. 이것이 6·7번의 핵심 난제다.

---

## 6. Transaction in JDBC

### 코드

```java
public void transfer(String from, String to, long amount) throws SQLException {
    Connection conn = dataSource.getConnection();
    try {
        conn.setAutoCommit(false);   // ① 트랜잭션 시작 (= START TRANSACTION)

        try (PreparedStatement ps = conn.prepareStatement(
                "UPDATE account SET balance = balance - ? WHERE id = ?")) {
            ps.setLong(1, amount);
            ps.setString(2, from);
            ps.executeUpdate();
        }

        try (PreparedStatement ps = conn.prepareStatement(
                "UPDATE account SET balance = balance + ? WHERE id = ?")) {
            ps.setLong(1, amount);
            ps.setString(2, to);
            ps.executeUpdate();
        }

        conn.commit();               // ② 전부 성공 → 확정
    } catch (SQLException e) {
        conn.rollback();             // ③ 하나라도 실패 → 전부 취소
        throw e;
    } finally {
        conn.setAutoCommit(true);    // ④ 풀에 반납 전 원복
        conn.close();                // ⑤ 반납
    }
}
```

`setAutoCommit(false)`가 "지금부터 내가 커밋할 때까지 묶어라"는 선언이고, MySQL의 `START TRANSACTION`에 해당한다. 두 UPDATE가 **같은 `conn`** 으로 실행되는 것이 5번의 조건이다.

### 이 코드의 문제

**첫째, 비즈니스 로직과 트랜잭션 코드가 섞인다.** 이체 로직은 UPDATE 두 줄인데 나머지는 전부 트랜잭션 관리 코드다. 메서드가 20개면 이 try-catch-finally가 20번 반복된다.

**둘째, `Connection`을 끌고 다녀야 한다.** 실무에서는 `AccountRepository.withdraw()`, `deposit()`처럼 리포지토리가 분리돼 있다. 두 메서드가 같은 커넥션을 써야 하니 서비스가 커넥션을 얻어 **파라미터로 넘겨줘야** 한다.

```java
accountRepository.withdraw(conn, from, amount);   // conn을 넘겨야 한다
accountRepository.deposit(conn, to, amount);
```

리포지토리 시그니처가 `Connection`으로 오염되고, 서비스 계층이 JDBC라는 기술 세부사항을 알아야 한다.

**셋째, 예외 처리가 기술 종속적이다.** `SQLException`은 JDBC 예외다. JPA로 바꾸면 서비스 계층의 catch 문을 전부 고쳐야 한다.

이 세 문제를 스프링이 해결한다.

---

## 7. Transaction in Spring — @Transactional

### 결과부터

```java
@Service
@RequiredArgsConstructor
public class TransferService {
    private final AccountRepository accountRepository;

    @Transactional
    public void transfer(String from, String to, long amount) {
        accountRepository.withdraw(from, amount);   // Connection 안 넘긴다
        accountRepository.deposit(to, amount);
    }
}
```

트랜잭션 코드가 전부 사라지고 `@Transactional` 한 줄로 대체됐다. 리포지토리에 커넥션을 넘기지도 않는다.

### 프록시가 대신한다

빈 라이프사이클 6번 단계("초기화 후 BeanPostProcessor에서 AOP 프록시가 씌워진다")에서 `@Transactional`이 붙은 빈은 **프록시로 감싸져** 컨텍스트에 등록된다. 다른 빈이 `TransferService`를 주입받으면 진짜 객체가 아니라 프록시를 받는다.

프록시의 `transfer()`가 호출되면:

```
컨트롤러 ──► [프록시 TransferService.transfer()]
               │
               │ ① TransactionManager.getTransaction()
               │    → DataSource에서 Connection 빌려옴
               │    → conn.setAutoCommit(false)
               │    → Connection을 ThreadLocal에 보관  ★
               │
               │ ② 진짜 TransferService.transfer() 호출
               │      ├─ accountRepository.withdraw()
               │      │    → ThreadLocal에서 Connection 꺼내 사용 ★
               │      └─ accountRepository.deposit()
               │           → ThreadLocal에서 같은 Connection 꺼내 사용 ★
               │
               │ ③ 정상 종료   → conn.commit()
               │    RuntimeException → conn.rollback()
               │
               │ ④ ThreadLocal 정리, Connection 풀에 반납
               ▼
```

★ 가 6번의 "커넥션 끌고 다니기" 문제를 푼 지점이다. 스프링은 트랜잭션 시작 시 커넥션을 **`ThreadLocal`** 에 넣어둔다(트랜잭션 동기화 매니저). 같은 스레드에서 실행되는 리포지토리들은 `DataSourceUtils.getConnection(dataSource)`로 그 커넥션을 꺼내 쓴다. `JdbcTemplate`, JPA의 `EntityManager` 모두 내부적으로 이렇게 동작한다. 파라미터로 넘기지 않아도 같은 커넥션이 유지되어 5번의 조건이 만족된다.

### TransactionManager는 기술을 추상화한다

프록시는 직접 JDBC를 다루지 않고 `PlatformTransactionManager` 인터페이스를 통한다. JDBC면 `DataSourceTransactionManager`, JPA면 `JpaTransactionManager`. 서비스 코드는 어느 쪽이든 `@Transactional`만 붙이면 된다 → 6번의 기술 종속 문제 해결. 스프링 부트는 의존성을 보고 적절한 TransactionManager를 자동 등록한다.

### 실무에서 밟는 지뢰 3개

**1) checked exception은 롤백되지 않는다.**
기본 롤백 대상은 `RuntimeException`과 `Error`. `IOException` 같은 checked exception이 튀어나오면 **커밋된다.** 의도적 설계(checked = 복구 가능한 비즈니스 상황)지만 실무에서는 대부분 의도와 다르다. 필요하면 `@Transactional(rollbackFor = Exception.class)`.

**2) 같은 클래스 안에서 부르면 프록시를 거치지 않는다.**

```java
public void outer() {
    inner();   // this.inner() → 프록시 아님 → @Transactional 무시됨
}

@Transactional
public void inner() { ... }
```

`this.inner()`는 프록시가 아니라 진짜 객체의 메서드를 직접 부르는 것이라 트랜잭션이 안 걸린다. 해결은 클래스를 분리해서 빈 경유로 호출하게 만드는 것.

**3) private 메서드에는 동작하지 않는다.**
프록시가 오버라이드할 수 없는 메서드는 가로챌 수 없다. `public`에 붙이는 게 원칙.

---

## 전체 그림

```
[애플리케이션]
  @Transactional 프록시 ──── TransactionManager
        │                          │
        │                    DataSource (HikariCP 풀)
        │                          │
        │                   Connection (프록시, close = 반납)
        │                          │
        └──── SQL ────────── JDBC 드라이버 (mysql-connector-j)
                                   │
                             TCP 소켓 (3-way handshake는 풀 생성 시 1회)
                                   │
                                 MySQL
                              InnoDB 트랜잭션 (undo/redo log)
```

위에서 아래로 읽으면 요청 하나가 DB까지 닿는 경로, 아래에서 위로 읽으면 각 층이 왜 필요했는지가 보인다.

---

## 다음 예습 — 여유되면

- **Transaction propagation**: 이미 트랜잭션 안에서 `@Transactional` 메서드를 또 부르면? (7번의 확장)
- **Transaction isolation level**: ACID의 I를 얼마나 느슨하게 할지의 단계 (4번의 확장)
