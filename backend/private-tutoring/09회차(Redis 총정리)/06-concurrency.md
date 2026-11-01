# 6장. 동시성 — INCR, Lua, 분산 락

> **이 장을 마치면**: 여러 요청이 같은 데이터를 **동시에** 바꿀 때 생기는 문제(재고 초과 판매)를 직접 재현하고, 알맞은 도구로 해결할 수 있다.

| 도구 | 한 줄 | 중요도 |
| ---- | ----- | ------ |
| `INCR`/`DECR` | 숫자 더하기, 빼기를 명령 하나로 (2장) | 🔴 |
| Lua 스크립트 | 여러 명령을 **끼어들 수 없게** 하나로 묶어 실행 | 🔴 |
| 분산 락 | 여러 서버 중 **한 번에 하나만** 작업하게 하는 표시 | 🔴 |

**실습 코드**: [ch06concurrency/](./redis-practice/src/main/java/com/buzz/redis/ch06concurrency), Lua 스크립트 [resources/scripts/](./redis-practice/src/main/resources/scripts)
**실습 준비물**: [infra/hit.sh](./infra/hit.sh)

---

## 1. 문제 — 확인하고 바꾸는 사이에 끼어든다

재고 1개 줄이기를 가장 단순하게 짜면 이렇다.

```java
int stock = Integer.parseInt(redisTemplate.opsForValue().get(STOCK_KEY));   // ① 재고 읽기 (GET)
if (stock <= 0) {
    return "품절";
}
redisTemplate.opsForValue().set(STOCK_KEY, String.valueOf(stock - 1));     // ② 1 줄여서 쓰기 (SET)
```

명령 하나하나는 끊기지 않지만(1장), **①과 ② 사이에 다른 요청이 끼어들 수 있다.**

```text
요청 A: 재고 읽기 → 10                    쓰기 9
요청 B:            재고 읽기 → 10   쓰기 9          ← 2명이 샀는데 재고는 1만 줄었다
```

### 🧪 직접 재현 — 재고 50개에 주문 100건을 동시에

| 순서 | 명령 | 결과 |
| ---- | ---- | ---- |
| 1 | `curl -X POST "localhost:8083/ch06/stock/reset?qty=50"` | `stock=50` (재고 50, 판매 수 0으로) |
| 2 | `cd infra` 후 `./hit.sh 100 20 POST localhost:8083/ch06/stock/naive` | 주문 100건을 20개씩 동시에 |
| 3 | `curl localhost:8083/ch06/stock` | `{"sold":"93","stock":"0"}` |

- `sold` = "판매 성공"이라고 응답한 횟수, `stock` = 남은 재고.
- 재고는 50개인데 **93명에게 팔았다.** (숫자는 매번 다르다. 다른 실행에서는 100명에게 팔고 재고가 7 남기도 했다)

이 장의 목표: **판매 50, 남은 재고 0**

## 2. 도구 고르는 순서

```text
조건 없이 숫자만 늘리고 줄이나?            → INCR / DECR
Redis 안에서 "확인하고 바꾸기"인가?         → Lua 스크립트
DB 저장, 결제 같은 Redis 밖 작업까지 포함?  → 분산 락
```

## 3. DECR — 숫자는 정확하지만 조건을 못 건다

```java
Long left = redisTemplate.opsForValue().decrement(STOCK_KEY);   // DECR (명령 하나라 끼어들 틈이 없다)
```

| 명령 | 결과 |
| ---- | ---- |
| `reset?qty=50` → `./hit.sh 100 20 POST localhost:8083/ch06/stock/decr` → `curl localhost:8083/ch06/stock` | `{"sold":"100","stock":"-50"}` |

`DECR`은 끼어들 틈이 없어서 숫자 계산은 정확하다. 하지만 **"0보다 클 때만 빼기"를 할 수 없어서** 재고가 마이너스가 된다. 조회수처럼 조건이 없는 숫자에만 쓴다.

## 4. 🔴 Lua 스크립트 — 확인과 변경을 한 번에

> **Lua 스크립트 = 여러 Redis 명령을 묶은 작은 프로그램.** Redis는 스크립트 **전체를 명령 하나처럼** 실행한다. 실행하는 동안 다른 명령은 끼어들 수 없다.

"재고 확인 → 1 빼기"를 스크립트 하나로 만들면 1절의 틈이 사라진다.

```lua
-- resources/scripts/stock-decrease.lua
local stock = tonumber(redis.call('GET', KEYS[1]) or '0')   -- 재고 읽기 (없으면 0)
if stock <= 0 then
    return -1                                                -- 품절
end
return redis.call('DECR', KEYS[1])                           -- 1 빼고, 남은 재고를 돌려준다
```

| 문법 | 뜻 |
| ---- | -- |
| `redis.call('명령', ...)` | 스크립트 안에서 Redis 명령 실행 |
| `KEYS[1]` | 넘겨받은 첫 번째 키. **1부터** 센다 |
| `ARGV[1]` | 넘겨받은 첫 번째 값 (키가 아닌 것) |
| `local` | 변수 만들기 (Java의 지역 변수) |
| `tonumber(...)` | Redis 값은 문자열이라 숫자로 바꾼다 |
| `or '0'` | 값이 없으면(`nil`) `'0'`을 쓴다 |

### 🧪 따라 치기 (CLI)

`EVAL "스크립트" 키개수 키1 키2 ... 값1 값2 ...` 형식으로 실행한다.

| 입력 (`SELECT 1` 후) | 결과 | 확인할 것 |
| -------------------- | ---- | --------- |
| `SET stock 2` | `OK` | 재고 2개 |
| `EVAL "local s = tonumber(redis.call('GET', KEYS[1]) or '0') if s <= 0 then return -1 end return redis.call('DECR', KEYS[1])" 1 stock` | `(integer) 1` | 1 남음. `1 stock` = 키 1개, 그 키는 stock |
| 같은 명령 다시 (↑ 키로 불러오기) | `(integer) 0` | 0 남음 |
| 같은 명령 다시 | `(integer) -1` | 품절. 마이너스로 안 내려간다 |

### 🧪 Spring

```java
// 스크립트 파일을 읽어 둔다. 결과는 숫자라 Long
private static final RedisScript<Long> DECREASE_SCRIPT =
        RedisScript.of(new ClassPathResource("scripts/stock-decrease.lua"), Long.class);

@PostMapping("/lua")
public String lua() {
    Long left = redisTemplate.execute(DECREASE_SCRIPT, List.of(STOCK_KEY));   // (스크립트, 키 목록)
    if (left == null || left == -1) {
        return "품절";
    }
    return "left=" + left;
}
```

| 명령 | 결과 |
| ---- | ---- |
| `reset?qty=50` → `./hit.sh 100 20 POST localhost:8083/ch06/stock/lua` → `curl localhost:8083/ch06/stock` | `{"sold":"50","stock":"0"}` ✅ |

### 🔴 Lua 주의 두 가지

| 주의 | 이유 |
| ---- | ---- |
| **짧게 쓴다** | 스크립트가 도는 동안 Redis 전체가 멈춘다 (1장 실습의 5초짜리 명령이 바로 Lua 스크립트였다) |
| **되돌리기(롤백)가 없다** | 중간에 에러가 나면, 앞에서 이미 실행한 명령은 그대로 남는다 |

## 5. 🔴 분산 락 — Redis 밖의 작업까지 하나씩

Lua 안에서는 MySQL 저장이나 결제 API 호출을 할 수 없다. "재고 확인 → 주문 DB 저장 → 결제"처럼 **Redis 밖의 일까지** 한 번에 한 요청만 해야 하면 **분산 락**을 쓴다.

> **락** = "지금 이 작업은 내가 하고 있다"는 표시. 표시가 있으면 다른 요청은 기다린다.
> **분산 락** = 서버가 여러 대여도 통하도록, 모든 서버가 같이 보는 Redis에 그 표시를 두는 것.

Java의 `synchronized`도 락이지만 **그 서버 안에서만** 통한다. 서버가 2대면 서로를 막지 못한다.

### 동작 — 3단계

Redis에 "락" 명령은 따로 없다. 2장의 `SET NX EX`를 락으로 쓴다.

```text
① 잡기   SET lock:stock:product:1 {내 표시} NX EX 3     ← 없을 때만 저장 = 한 명만 성공
② 작업   재고 확인 → 차감 (→ DB 저장 → 결제)
③ 풀기   값이 내 표시일 때만 DEL
```

| 조각 | 역할 |
| ---- | ---- |
| `NX` | 동시에 시도해도 **한 요청만** 성공 → 락을 잡음 |
| `EX 3` | 락을 잡은 서버가 죽어도 **3초 뒤 자동으로 풀림** |
| `{내 표시}` | 풀 때 **내가 잡은 락인지** 확인하는 값 (요청마다 다른 랜덤 문자열) |

### 🔴 락 만료 시간(lock timeout) — 짧아도, 길어도 문제

| 설정 | 생기는 일 |
| ---- | --------- |
| 만료 없음 | 락을 잡은 서버가 죽으면 락이 **영원히** 남아 아무도 그 작업을 못 한다 |
| 너무 짧음 | 작업이 끝나기 전에 락이 풀려 **다른 요청이 같이 들어온다** |
| 너무 김 | 서버가 죽었을 때 그만큼 다른 요청이 기다린다 |

**왜 "내 표시일 때만" 풀어야 하나** — 그냥 `DEL`하면 남의 락을 지울 수 있다.

```text
A: 락 잡음 (3초) → 작업이 5초 걸림 ... 3초에 락이 저절로 풀림
B:                        락 잡음 → 작업 중
A: 작업 끝 → DEL         ← B의 락을 지워 버렸다 → C도 들어온다
```

"값 확인 → 삭제"를 Lua 하나로 묶어서 끼어들 틈 없이 한다.

```lua
-- resources/scripts/unlock.lua
if redis.call('GET', KEYS[1]) == ARGV[1] then     -- 값이 내 표시면
    return redis.call('DEL', KEYS[1])             -- 지운다 → 1
end
return 0                                          -- 내 락이 아니면 안 지운다 → 0
```

### 🧪 따라 치기 (CLI) — 터미널 2개를 서버 A, B라고 생각한다

두 터미널 모두 `docker exec -it redis-study redis-cli` → `SELECT 1`.

| 터미널 | 입력 | 결과 | 확인할 것 |
| ------ | ---- | ---- | --------- |
| A | `SET lock:order:1 server-A NX EX 30` | `OK` | A가 락을 잡음 |
| B | `SET lock:order:1 server-B NX EX 30` | `(nil)` | B는 실패 → 기다려야 한다 |
| B | `GET lock:order:1` | `"server-A"` | 누가 잡고 있는지 보인다 |
| A | `EVAL "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0" 1 lock:order:1 server-A` | `(integer) 1` | A가 자기 락을 풂 |
| B | `SET lock:order:1 server-B NX EX 30` | `OK` | 이제 B 차례 |
| A | 위 `EVAL` 한 번 더 (`server-A`) | `(integer) 0` | A는 **B의 락을 지우지 못한다** ✅ |

### 🧪 Spring

```java
private static final String LOCK_KEY = "lock:stock:product:1";
private static final RedisScript<Long> UNLOCK_SCRIPT =
        RedisScript.of(new ClassPathResource("scripts/unlock.lua"), Long.class);

@PostMapping("/lock")
public String lock() throws InterruptedException {
    String token = UUID.randomUUID().toString();   // 내 표시 (요청마다 다른 랜덤 값)

    for (int i = 0; i < 300; i++) {                // 최대 3초 동안 다시 시도
        // ① 잡기: SET lock:stock:product:1 {token} NX EX 3
        Boolean locked = redisTemplate.opsForValue().setIfAbsent(LOCK_KEY, token, Duration.ofSeconds(3));
        if (Boolean.TRUE.equals(locked)) {
            try {
                return decreaseWithGetSet();       // ② 작업: 1절의 GET → SET 그대로. 이 안은 한 번에 한 요청만
            } finally {
                redisTemplate.execute(UNLOCK_SCRIPT, List.of(LOCK_KEY), token);   // ③ 풀기: 내 표시일 때만
            }
        }
        Thread.sleep(10);                          // 못 잡으면 0.01초 기다렸다 다시
    }
    return "락 획득 실패";
}
```

| 명령 | 결과 |
| ---- | ---- |
| `reset?qty=50` → `./hit.sh 100 20 POST localhost:8083/ch06/stock/lock` → `curl localhost:8083/ch06/stock` | `{"sold":"50","stock":"0"}` ✅ |

1절과 **똑같은 GET → SET 코드**인데 락 안에서 실행하니 정확해졌다. 대신 요청이 줄을 서서 기다리므로 Lua보다 느리다 (100건에 Lua 0.25초, 락 0.46초).

### 실무에서는 Redisson 라이브러리

위 문제들을 직접 다 처리하기는 어렵다. 실무에서는 [Redisson](https://github.com/redisson/redisson) 라이브러리를 쓴다. 작업이 길어지면 락 만료 시간을 **자동으로 늘려 주는**(Watchdog) 기능 등이 들어 있다.

```java
// 참고용 (이 실습 프로젝트에는 넣지 않았다)
RLock lock = redissonClient.getLock("lock:order:1");
if (lock.tryLock(5, TimeUnit.SECONDS)) {     // 최대 5초 기다리며 락 시도
    try {
        // 재고 확인 → 주문 저장 → 결제
    } finally {
        lock.unlock();
    }
}
```

## 6. 결과 한눈에

| 방식 | 판매 | 남은 재고 | 언제 쓰나 |
| ---- | ---- | --------- | --------- |
| ❌ GET → SET | 50보다 많다 | 틀릴 수 있다 | 쓰지 않는다 |
| ❌ DECR | 100 | -50 | 조건 없는 숫자 (조회수) |
| ✅ Lua | 50 | 0 | Redis 안에서 끝나는 "확인하고 바꾸기" |
| ✅ 분산 락 | 50 | 0 | DB, 외부 API까지 포함한 작업 |

## 🟢 참고 — Redis Transaction (MULTI / EXEC)

Redis에도 "트랜잭션" 명령이 있지만, DB의 트랜잭션과 달리 **되돌리기(롤백)가 없다.** 명령을 모아 두었다가(`MULTI`) 한 번에 실행(`EXEC`)하는 것까지만 해 준다. 중간 명령이 실패해도 나머지는 실행된다. "확인하고 바꾸기"도 어렵다. 그래서 실무에서는 대부분 **Lua**를 쓴다.

---

## 🎯 실습 문제

**문제 1 (Lua). 선착순 쿠폰.** 쿠폰 100장, **한 사람당 1장**. 300명이 동시에 요청해도 정확히 100명만 받아야 한다. Lua 스크립트를 만들어라.
힌트: 받은 사람 목록은 Set(3장). 반환값은 `1` 발급 / `0` 품절 / `-1` 이미 받음.

<details>
<summary>정답</summary>

```lua
-- resources/scripts/coupon-issue.lua
-- KEYS[1] = 남은 수량, KEYS[2] = 받은 사람 Set, ARGV[1] = 사용자 ID
if redis.call('SISMEMBER', KEYS[2], ARGV[1]) == 1 then
    return -1                                  -- 이미 받음
end
local stock = tonumber(redis.call('GET', KEYS[1]) or '0')
if stock <= 0 then
    return 0                                   -- 품절
end
redis.call('DECR', KEYS[1])                    -- 수량 빼기
redis.call('SADD', KEYS[2], ARGV[1])           -- 받은 사람 기록
return 1                                       -- 발급
```

```java
// CouponController.java
Long result = redisTemplate.execute(ISSUE_SCRIPT, List.of("coupon:stock", "coupon:issued"), userId);
if (Long.valueOf(1).equals(result)) {      // result == 1L 로 쓰면 result가 null일 때 에러
    return "발급";
}
return Long.valueOf(0).equals(result) ? "품절" : "이미 받음";
```

| 순서 | 명령 | 결과 |
| ---- | ---- | ---- |
| 1 | `curl -X POST "localhost:8083/ch06/coupon/reset?stock=100"` | `stock=100` |
| 2 | `./hit.sh 300 30 POST 'localhost:8083/ch06/coupon/user{}'` | 사용자 user1 ~ user300이 동시에 요청 |
| 3 | `curl localhost:8083/ch06/coupon/status` | `{"issued":100,"stock":"0"}` |
| 4 | `curl -X POST localhost:8083/ch06/coupon/user1` | `이미 받음` |

직접 만들 때는 이미 있는 주소와 겹치지 않게 `/ch06/my/coupon`, 키도 `my:coupon:stock`처럼 다른 이름을 쓴다.

</details>

**문제 2 (생각).** 분산 락의 만료 시간을 3초로 했는데 결제 API가 5초 걸렸다. 무슨 일이 생기나?

<details>
<summary>정답</summary>

3초에 락이 저절로 풀려서 다른 요청이 락을 잡고 같은 작업을 동시에 한다. 락이 의미가 없어진다. 작업 시간보다 넉넉하게 잡거나, Redisson처럼 작업 중에는 만료를 자동으로 늘려 준다. 풀 때는 반드시 "내 표시일 때만" 지워야 남의 락을 지우지 않는다.

</details>

---

## 실무 주의

- 🔴 "읽고 → 판단하고 → 쓰기"를 명령 여러 개로 나누면 동시 요청에서 깨진다.
- 🔴 분산 락에는 **반드시 만료 시간**, 풀 때는 **내 표시 확인**. 실무에서는 Redisson.
- Lua 스크립트는 짧게. 반복문, 대량 조회를 넣지 않는다.
- 정확성이 정말 중요한 데이터는 DB에도 마지막 방어선(유니크 제약 등)을 둔다. 락도 서버 장애 상황에서는 완벽하지 않다.

## 면접 한 줄

- **Lua 스크립트**: 여러 명령을 하나로 묶어 원자적으로 실행한다. "재고가 있을 때만 차감"처럼 확인과 변경을 같이 할 때 쓴다. 실행 중에는 Redis 전체가 멈추므로 짧게 쓴다.
- **분산 락**: 여러 서버에서 한 번에 하나만 작업하도록 `SET NX EX`로 락을 건다. 서버 장애에 대비해 만료 시간을 주고, 해제는 Lua로 내 토큰일 때만 한다. 실무에서는 Redisson을 쓴다.

다음: [7장. Pipeline](./07-pipeline.md)
