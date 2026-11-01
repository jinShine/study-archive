# Lua Script 연습 문제 (redis-cli)

- 개념 설명: [PRESTUDY.md 2장](../../PRESTUDY.md#2-redis-lua-script)
- 환경: Docker `redis:7.4`
- 정답은 전부 직접 실행해서 확인한 결과다.

**푸는 방법**: 문제를 읽고 스크립트를 직접 써서 실행해 본 뒤, 결과가 "기대 결과"와 같으면 정답을 펼쳐 비교한다.

---

## 준비

```bash
docker start redis-study                      # 컨테이너가 꺼져 있으면
docker exec -it redis-study redis-cli
```

실습 데이터와 섞이지 않게 **1번 DB**에서 연습한다. (Redis는 0~15번 DB가 있고, 기본은 0번이다.)

```text
127.0.0.1:6379> SELECT 1
OK
127.0.0.1:6379[1]> FLUSHDB          ← 1번 DB만 비우기 (연습 중 언제든)
OK
```

### 기본 형식

```text
EVAL "스크립트" 키개수 키1 키2 ... 인자1 인자2 ...
```

| 스크립트 안에서          | 뜻                                  |
| ------------------------ | ----------------------------------- |
| `KEYS[1]`, `KEYS[2]`     | 넘겨준 키 (1번부터)                 |
| `ARGV[1]`, `ARGV[2]`     | 넘겨준 인자                         |
| `redis.call('명령', ...)` | Redis 명령 실행                     |
| `tonumber(값)`           | 문자열 → 숫자 (Redis 값은 전부 문자열) |
| `local 변수 = 값`        | 변수                                |
| `if 조건 then ... end`   | 조건문                              |
| `==`, `<`, `>`, `<=`     | 비교 (`~=`는 "같지 않다")           |

⚠️ 스크립트는 **한 줄**로 쓰고 전체를 큰따옴표 `"`로 감싼다. 스크립트 안의 문자열은 작은따옴표 `'`를 쓴다.

---

## 문제 1. 워밍업 — 값 돌려받기

**(a)** `"hello lua"`를 돌려주는 스크립트를 실행하라. 키는 0개다.
**(b)** 키 `mykey`와 인자 `myvalue`를 넘겨서, 둘을 그대로 돌려받아라. (Lua 배열은 `{a, b}`)

기대 결과:

```text
"hello lua"

1) "mykey"
2) "myvalue"
```

<details><summary>정답</summary>

```text
EVAL "return 'hello lua'" 0
EVAL "return {KEYS[1], ARGV[1]}" 1 mykey myvalue
```

`1 mykey myvalue` → 키가 1개(`mykey`)이고, 그 뒤는 전부 인자(`myvalue`)다.

</details>

---

## 문제 2. 강사님 예제 — GET → +1 → SET을 한 번에

`GET abc` → 1 더하기 → `SET abc 결과`를 하나의 스크립트로 만들고, 결과를 반환하라. 키가 없으면 0에서 시작한다.

```text
SET abc 10
EVAL "..." 1 abc     → (integer) 11
EVAL "..." 1 abc     → (integer) 12
```

힌트: 키가 없으면 `GET`은 `false`를 돌려준다. `redis.call('GET', KEYS[1]) or '0'`이면 없을 때 `'0'`이 된다.

<details><summary>정답</summary>

```text
EVAL "local v = tonumber(redis.call('GET', KEYS[1]) or '0') local r = v + 1 redis.call('SET', KEYS[1], r) return r" 1 abc
```

```text
127.0.0.1:6379[1]> SET abc 10
OK
127.0.0.1:6379[1]> EVAL "..." 1 abc
(integer) 11
127.0.0.1:6379[1]> EVAL "..." 1 abc
(integer) 12
```

</details>

---

## 문제 3. 인자 받기 — 포인트 n만큼 더하기

문제 2를 고쳐서, 더할 값을 **인자(ARGV)** 로 받아라. 음수를 넣으면 빼진다.

```text
SET point:1 100
EVAL "..." 1 point:1 50     → (integer) 150
EVAL "..." 1 point:1 -30    → (integer) 120
```

<details><summary>정답</summary>

```text
EVAL "local v = tonumber(redis.call('GET', KEYS[1]) or '0') local r = v + tonumber(ARGV[1]) redis.call('SET', KEYS[1], r) return r" 1 point:1 50
```

인자도 문자열로 들어오므로 `tonumber(ARGV[1])`로 바꿔야 한다.

</details>

---

## 문제 4. 🔴 확인하고 실행 — 재고가 충분할 때만 n개 차감

주문 수량을 인자로 받아, **재고가 주문 수량보다 적으면 `-1`을 반환하고 아무것도 하지 않는다.** 충분하면 차감하고 남은 재고를 반환한다.

```text
SET stock:1 5
EVAL "..." 1 stock:1 3     → (integer) 2     ← 5개 중 3개 차감
EVAL "..." 1 stock:1 3     → (integer) -1    ← 2개뿐이라 거절
GET stock:1                → "2"             ← 그대로
EVAL "..." 1 stock:1 2     → (integer) 0     ← 딱 맞게 차감
```

힌트: n만큼 빼는 명령은 `DECRBY 키 n`이다.

<details><summary>정답</summary>

```text
EVAL "local stock = tonumber(redis.call('GET', KEYS[1]) or '0') local qty = tonumber(ARGV[1]) if stock < qty then return -1 end return redis.call('DECRBY', KEYS[1], qty)" 1 stock:1 3
```

`DECRBY`만 쓰면 재고 2개에 3개 주문도 그냥 빼서 `-1`이 된다(초과 판매). **확인과 차감을 한 스크립트에** 넣어야 그 사이에 다른 주문이 끼어들지 못한다.

</details>

---

## 문제 5. 기대한 값일 때만 바꾸기 (Compare-And-Set)

주문 상태가 **인자 1(기대 상태)과 같을 때만** 인자 2(새 상태)로 바꾸고 `1`을 반환한다. 다르면 바꾸지 않고 `0`을 반환한다.

```text
SET status:order:1 PAID
EVAL "..." 1 status:order:1 READY SHIPPED    → (integer) 0     ← 지금은 PAID라 실패
EVAL "..." 1 status:order:1 PAID SHIPPED     → (integer) 1     ← 성공
GET status:order:1                           → "SHIPPED"
```

<details><summary>정답</summary>

```text
EVAL "if redis.call('GET', KEYS[1]) == ARGV[1] then redis.call('SET', KEYS[1], ARGV[2]) return 1 end return 0" 1 status:order:1 PAID SHIPPED
```

6회차에서 배운 **CAS(Compare-And-Swap)** 를 Redis에서 직접 만든 것이다. "결제 완료(PAID)인 주문만 배송(SHIPPED)으로 바꿀 수 있다" 같은 상태 전이 규칙에 쓴다.

</details>

---

## 문제 6. 실무 패턴 — 요청 횟수 제한 (Rate Limit)

사용자별로 **60초 동안 최대 3번**만 허용한다. 허용이면 `1`, 초과면 `0`을 반환한다.

- 인자 1 = 제한 시간(초), 인자 2 = 최대 횟수
- 첫 요청일 때만 만료 시간을 건다 (그래야 60초 뒤 횟수가 초기화된다)

```text
EVAL "..." 1 rate:user:1 60 3    → (integer) 1
EVAL "..." 1 rate:user:1 60 3    → (integer) 1
EVAL "..." 1 rate:user:1 60 3    → (integer) 1
EVAL "..." 1 rate:user:1 60 3    → (integer) 0     ← 4번째는 거절
TTL rate:user:1                  → (integer) 60 이하
```

힌트: `INCR`은 증가한 뒤의 값을 돌려준다. 그 값이 `1`이면 첫 요청이다.

<details><summary>정답</summary>

```text
EVAL "local count = redis.call('INCR', KEYS[1]) if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end if count > tonumber(ARGV[2]) then return 0 end return 1" 1 rate:user:1 60 3
```

`INCR`과 `EXPIRE`를 따로 보내면, 그 사이에 서버가 죽었을 때 **만료 없는 키**가 남아 그 사용자는 영원히 차단된다. 한 스크립트로 묶으면 둘이 함께 실행된다. (API 요청 제한, 로그인 시도 제한, 인증번호 재발송 제한에 쓰는 패턴)

</details>

---

## 문제 7. 3장 미리 보기 — 내 락만 해제하기

락 키의 값이 **내 토큰(인자 1)과 같을 때만** 삭제하고, 삭제했으면 `1`, 아니면 `0`을 반환한다.

```text
SET lock:order:1 token-A NX EX 30
EVAL "..." 1 lock:order:1 token-B    → (integer) 0     ← 남의 락은 못 지움
EVAL "..." 1 lock:order:1 token-A    → (integer) 1     ← 내 락은 해제
EXISTS lock:order:1                  → (integer) 0
```

<details><summary>정답</summary>

```text
EVAL "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0" 1 lock:order:1 token-A
```

`GET`으로 확인하고 `DEL`을 따로 보내면, 그 사이에 락이 만료되고 다른 사람이 새로 잡은 락을 지울 수 있다. 분산 락(3장)의 해제가 이 스크립트다.

</details>

---

## 팁

### 에러 메시지 읽기

```text
127.0.0.1:6379[1]> EVAL "return redis.call('GET')" 0
(error) ERR Wrong number of args calling Redis command from script ... on @user_script:1.
```

`@user_script:1` = 스크립트의 **1번째 줄**에서 에러. 위는 `GET`에 키를 안 넘겨서 난 에러다.

### 긴 스크립트는 파일로

한 줄이 길어지면 `.lua` 파일로 써서 `--eval`로 실행할 수 있다. 여러 줄로 쓸 수 있어서 읽기 쉽다.

```lua
-- add.lua
local v = tonumber(redis.call('GET', KEYS[1]) or '0')
local r = v + tonumber(ARGV[1])
redis.call('SET', KEYS[1], r)
return r
```

```bash
docker cp add.lua redis-study:/tmp/add.lua
docker exec redis-study redis-cli -n 1 --eval /tmp/add.lua point:2 , 7
```

```text
7
```

`--eval 파일 키1 키2 , 인자1 인자2` 형식이다. **키와 인자 사이를 ` , `(앞뒤 공백 포함 쉼표)로 구분**하고, 키 개수는 쓰지 않는다. `-n 1`은 1번 DB를 쓴다는 뜻이다.
