# 4장. 키 관리 & 메모리

> **이 장을 마치면**: 운영 Redis에서 키를 안전하게 찾고 지울 수 있다(`SCAN`). 그리고 메모리가 꽉 차면 무슨 일이 생기는지 직접 보고, 어떻게 설정해야 하는지 안다.

| 주제 | 한 줄 | 중요도 |
| ---- | ----- | ------ |
| KEYS 금지 | 모든 키를 한 번에 훑어서 Redis를 멈춘다 | 🔴 |
| SCAN | 조금씩 나눠서 훑는다. KEYS 대신 쓴다 | 🔴 |
| 메모리 꽉 참 | 설정에 따라 쓰기가 거부되거나, 오래된 키가 지워진다 | 🔴 |

**실습 코드**: [ch04keys/KeysController.java](./redis-practice/src/main/java/com/buzz/redis/ch04keys/KeysController.java)
**실습 준비물**: [infra/memory/](./infra/memory) 의 `start.sh`, `fill.sh`, `stop.sh`

---

## 1. 🔴 KEYS — 운영에서는 쓰지 않는다

`KEYS 패턴` = 패턴에 맞는 키를 **한 번에 전부** 찾는다. `*`는 "아무 글자나 여러 개"라는 뜻이다.

| 입력 (`SELECT 1` 후) | 결과 |
| -------------------- | ---- |
| `MSET user:1 a user:2 b user:3 c order:1 x` | `OK` |
| `KEYS user:*` | `1) "user:2" 2) "user:1" 3) "user:3"` |

편해 보이지만 **운영 서버에서는 쓰지 않는다.**

- `KEYS`는 패턴과 상관없이 Redis에 있는 **모든 키를 처음부터 끝까지** 확인한다.
- 1장에서 본 것처럼 Redis는 명령을 하나씩 처리한다. `KEYS`가 끝날 때까지 **다른 모든 요청이 기다린다.**
- 참고로 키 100만 개에서 `KEYS`는 약 58ms 동안 Redis를 멈췄다. 실제 서비스는 키가 수천만 개라 **몇 초씩** 멈출 수 있다.

## 2. 🔴 SCAN — 조금씩 나눠서 찾기

`SCAN` = 키를 **조금씩 나눠서** 훑는다. 한 번 호출이 짧게 끝나서, 그 사이사이에 다른 요청이 처리된다.

```text
SCAN 커서 MATCH 패턴 COUNT 개수
```

| 조각 | 뜻 |
| ---- | -- |
| **커서** | "어디까지 봤는지" 표시하는 번호. **처음에는 0**을 넣고, 응답으로 받은 번호를 다음 호출에 넣는다 |
| `MATCH 패턴` | 찾을 패턴 (KEYS와 같다) |
| `COUNT 개수` | 한 번에 **대략** 몇 개를 훑을지 |

### 🧪 따라 치기 — 일부러 2개씩 나눠 찾기

| 입력 | 결과 | 확인할 것 |
| ---- | ---- | --------- |
| `SCAN 0 MATCH user:* COUNT 2` | `1) "2"`<br>`2) 1) "user:2"` | 첫 번째 줄 `"2"` = **다음 커서**. 아직 안 끝났다 |
| `SCAN 2 MATCH user:* COUNT 2` | `1) "0"`<br>`2) 1) "user:1" 2) "user:3"` | 받은 커서 2를 넣어 이어서 찾는다. 커서가 **0이 되면 끝** |

| 규칙 | 설명 |
| ---- | ---- |
| **커서가 0이 돌아오면 끝** | 결과가 비어 있어도 커서가 0이 아니면 계속 호출해야 한다 |
| 같은 키가 두 번 나올 수 있다 | 찾는 도중에 키가 늘거나 줄면 생긴다. 지우는 용도라면 문제없다 |

Spring에서는 커서를 **알아서 넘겨 준다.** `while`로 끝까지 꺼내기만 하면 된다 (아래 4절).

## 3. DEL과 UNLINK

| 명령 | 동작 |
| ---- | ---- |
| `DEL 키` | 그 자리에서 메모리까지 정리한다. 원소 100만 개짜리 키면 정리하는 동안 Redis가 멈춘다 |
| `UNLINK 키` | 키는 바로 안 보이게 하고, 메모리 정리는 **뒤에서 따로** 한다 |

작은 키는 차이가 없다. 크기를 모르는 키를 지울 때는 `UNLINK`가 안전하다.

## 4. 🧪 Spring — "temp:session:으로 시작하는 키를 전부 지워 주세요"

실무에서 자주 받는 요청이다. `SCAN`으로 찾고, **1000개씩 모아서** 지운다.

```java
@DeleteMapping("/keys")
public Map<String, Object> deleteByPattern(@RequestParam String pattern) {
    ScanOptions options = ScanOptions.scanOptions().match(pattern).count(1000).build();
    List<String> buffer = new ArrayList<>();
    long deleted = 0;
    int deleteCalls = 0;

    try (Cursor<String> cursor = redisTemplate.scan(options)) {   // SCAN (커서는 Spring이 알아서 넘긴다)
        while (cursor.hasNext()) {
            buffer.add(cursor.next());
            if (buffer.size() == 1000) {                         // 1000개 모이면
                deleted += redisTemplate.unlink(buffer);         // 한 번에 지운다 (UNLINK)
                deleteCalls++;
                buffer.clear();
            }
        }
    }
    if (!buffer.isEmpty()) {                                     // 남은 것 지우기
        deleted += redisTemplate.unlink(buffer);
        deleteCalls++;
    }
    return Map.of("deleted", deleted, "deleteCalls", deleteCalls);
}
```

- `try (...)`: 다 쓴 커서를 자동으로 닫는다.
- 2500개를 한 번에 지우지 않고 1000개씩 나누는 이유: 명령 하나가 너무 커지면 그것도 "느린 명령"이 된다.

| 요청 | 결과 | 확인할 것 |
| ---- | ---- | --------- |
| `curl -X POST "localhost:8083/ch04/seed?count=2500"` | `2500개 생성` | 연습용 키 `temp:session:1 ~ 2500` |
| `curl -X DELETE "localhost:8083/ch04/keys?pattern=temp:session:*"` | `{"deleted":2500,"deleteCalls":3}` | 1000 + 1000 + 500, 3번에 나눠 지웠다 |

> ⚠️ 이 API는 연습용이라 아무 패턴이나 받는다. `pattern=*`이면 전부 지워진다. 실무에서는 지울 대상을 코드에 고정하고, 관리자만 호출하게 막는다.
> `redisTemplate.keys("user:*")`라는 메서드도 있지만 내부적으로 `KEYS`다. 쓰지 않는다.

---

## 5. 🔴 메모리가 꽉 차면

Redis는 RAM에 저장한다. **넣기만 하고 지우지 않으면 반드시 꽉 찬다.** 그때 어떻게 될지는 두 설정이 정한다.

| 설정 | 뜻 | 기본값 |
| ---- | -- | ------ |
| `maxmemory` | Redis가 쓸 메모리 상한 | `0` = 제한 없음 (서버 메모리를 끝까지 씀) |
| `maxmemory-policy` | 상한에 닿으면 어떻게 할지 | `noeviction` |

| 정책 | 상한에 닿으면 | 언제 쓰나 |
| ---- | ------------- | --------- |
| `noeviction` | 새로 쓰는 명령을 **에러로 거부**한다 | 데이터가 사라지면 안 될 때 |
| `allkeys-lru` | **가장 오래 안 쓴 키부터** Redis가 스스로 지운다 | **캐시** (가장 흔함) |

**eviction** = 메모리가 꽉 차서 Redis가 키를 스스로 지우는 것. **LRU**(Least Recently Used) = 가장 오래 안 쓴 것부터.

### 🧪 실습 — 2MB짜리 Redis를 꽉 채워 보기

실습용 `redis-study`가 아니라, 메모리 상한이 **2MB**인 작은 Redis를 따로 띄워서 한다.

**1단계. 띄우기**

```bash
cd infra/memory
./start.sh
```

```text
redis-mem-test 준비 완료 (maxmemory 2mb, noeviction)
```

**2단계. 1KB짜리 값 3000개 넣기 (`noeviction`)**

```bash
./fill.sh 3000 key
```

```text
 982 OK
2018 OOM command not allowed when used memory > 'maxmemory'.
```

982개를 넣자 2MB가 찼고, 나머지 2018개는 **에러로 거부**됐다 (OOM = Out Of Memory, 메모리 부족). 이 상태에서는 어떤 쓰기도 안 된다. 캐시 저장, 로그인 세션 생성이 전부 에러가 난다.

**3단계. 정책을 `allkeys-lru`로 바꾸고 500개 더 넣기**

```bash
docker exec -it redis-mem-test redis-cli
```

| 입력 | 결과 | 확인할 것 |
| ---- | ---- | --------- |
| `CONFIG SET maxmemory-policy allkeys-lru` | `OK` | 정책 변경 |
| `exit` | | |

```bash
./fill.sh 500 more
```

```text
 500 OK                     ← 이번엔 전부 성공
```

```bash
docker exec redis-mem-test redis-cli INFO stats | grep evicted_keys
```

```text
evicted_keys:538            ← 자리를 만들려고 Redis가 오래된 키 538개를 지웠다 (숫자는 매번 다르다)
```

**4단계. 정리**

```bash
./stop.sh
```

> 캐시는 지워져도 DB에서 다시 가져오면 되니 `allkeys-lru`가 맞다. 하지만 같은 Redis에 **사라지면 안 되는 키**(인증번호, 락)가 있으면 그것도 지워질 수 있다.

## 6. 내 Redis 메모리 확인

```bash
curl localhost:8083/ch04/memory
```

```json
{"used_memory_human":"3.32M","used_memory_peak_human":"63.92M","maxmemory_human":"0B","maxmemory_policy":"noeviction"}
```

| 항목 | 뜻 |
| ---- | -- |
| `used_memory_human` | 지금 사용량 |
| `used_memory_peak_human` | 켠 뒤 가장 많이 썼을 때 |
| `maxmemory_human` | 상한. `0B` = 제한 없음 → 운영에서는 반드시 정한다 |
| `maxmemory_policy` | 꽉 찼을 때 정책 |

redis-cli에서는 `INFO memory`로 같은 내용을 본다.

---

## 🎯 실습 문제

**문제 1 (CLI).** 1번 DB에 `MSET user:1 a user:2 b user:3 c order:1 x`를 넣고, `KEYS` 없이 `user:`로 시작하는 키를 모두 찾아라.

<details>
<summary>정답</summary>

| 입력 | 결과 |
| ---- | ---- |
| `SCAN 0 MATCH user:* COUNT 100` | `1) "0"`<br>`2) 1) "user:2" 2) "user:1" 3) "user:3"` |

커서가 바로 `0`이라 한 번에 끝났다. 키가 많으면 받은 커서로 계속 호출한다.

</details>

**문제 2 (생각).** 운영 Redis가 `maxmemory 0`, `noeviction`이다. 캐시를 TTL 없이 계속 넣으면 어떻게 될까? 무엇을 바꿔야 할까?

<details>
<summary>정답</summary>

상한이 없어서 서버 메모리를 끝까지 쓰다가, 운영체제가 Redis를 강제로 종료할 수 있다. 바꿀 것:

1. 캐시 키에 **TTL**을 붙인다 (근본 원인)
2. `maxmemory`를 서버 메모리보다 작게 정한다
3. 캐시 전용 Redis면 `allkeys-lru`

</details>

---

## 실무 주의

- 🔴 운영에서 `KEYS`, `FLUSHALL`은 쓰지 않는다. 아예 막아 두는 회사도 많다.
- 🔴 `maxmemory`는 꼭 정한다. 서버 메모리를 꽉 채우지 말고 여유를 둔다.
- 메모리가 계속 늘기만 하면 TTL 없는 키가 쌓이는 중일 가능성이 크다 (`TTL 키`가 `-1`인 키).

## 면접 한 줄

- **KEYS vs SCAN**: KEYS는 모든 키를 한 번에 훑어 Redis를 멈추게 한다. SCAN은 커서로 나눠 훑어서 사이사이 다른 요청이 처리된다. 커서가 0이 돌아오면 끝이다.
- **maxmemory-policy**: 메모리 상한에 닿았을 때의 정책. 기본은 쓰기를 거부하는 noeviction이고, 캐시는 오래 안 쓴 키부터 지우는 allkeys-lru를 쓴다.

다음: [5장. 캐싱](./05-caching.md)
