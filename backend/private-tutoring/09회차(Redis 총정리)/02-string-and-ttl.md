# 2장. String & TTL

> **이 장을 마치면**: 실무에서 가장 많이 쓰는 4가지를 CLI와 Spring으로 쓸 수 있다.
> ① 저장과 조회(`SET`, `GET`) ② 자동 삭제(`TTL`) ③ 숫자 세기(`INCR`) ④ 없을 때만 저장(`NX`)

**실습 코드**: [ch02string/StringController.java](./redis-practice/src/main/java/com/buzz/redis/ch02string/StringController.java)

---

## 1. String — 키 하나에 값 하나

**String** = Redis의 가장 기본 자료구조. 키 하나에 **문자열 값 하나**를 저장한다. 숫자도 문자열로 저장하고 계산할 수 있다.

**키 이름 짓는 법**: `대상:id:속성`처럼 `:`로 구분한다. 예: `user:1:name`, `post:10:views`. Redis가 강제하는 건 아니지만, 4장에서 `user:*`처럼 패턴으로 찾기 쉬워진다.

## 2. 🧪 따라 치기 — 기본 명령

```bash
docker exec -it redis-study redis-cli
```

접속하면 먼저 `SELECT 1` (0장 실습 규칙).

| 입력 | 결과 | 확인할 것 |
| ---- | ---- | --------- |
| `SET user:1:name kim` | `OK` | 저장 |
| `GET user:1:name` | `"kim"` | 조회 |
| `SET user:1:name lee` | `OK` | 같은 키에 다시 SET = **덮어쓰기** |
| `GET user:1:name` | `"lee"` | |
| `GET user:999:name` | `(nil)` | 없는 키는 `(nil)` |
| `DEL user:1:name` | `(integer) 1` | 지운 개수 |

## 3. 🔴 TTL — 정해진 시간이 지나면 자동 삭제

**TTL(Time To Live)** = 키가 살아 있을 남은 시간. 시간이 지나면 Redis가 키를 **알아서 지운다.**

**왜 필요한가**: Redis는 메모리가 작다(1장). 넣기만 하고 안 지우면 꽉 찬다. 그래서 **넣을 때 언제 지울지도 같이 정한다.** 그 기본 방법이 TTL이다. 인증번호(3분), 캐시(10분)처럼 원래 잠깐만 필요한 데이터에도 딱 맞는다.

| 입력 | 결과 | 확인할 것 |
| ---- | ---- | --------- |
| `SET auth:code:010 123456 EX 180` | `OK` | `EX 180` = 180초 뒤 자동 삭제 |
| `TTL auth:code:010` | `(integer) 180` | 남은 초 (조금 뒤에 다시 치면 줄어 있다) |
| `SET user:1:name kim` | `OK` | EX 없이 저장 |
| `TTL user:1:name` | `(integer) -1` | **-1 = 만료 없음** (영원히 남는다) |
| `TTL nokey` | `(integer) -2` | **-2 = 키가 없음** |
| `EXPIRE user:1:name 60` | `(integer) 1` | 이미 있는 키에 만료 걸기 |
| `TTL user:1:name` | `(integer) 60` | |

### ⚠️ 함정 — EX 없이 다시 SET하면 TTL이 사라진다

| 입력 | 결과 | 확인할 것 |
| ---- | ---- | --------- |
| `SET session:1 kim EX 100` | `OK` | 100초 만료 |
| `SET session:1 lee` | `OK` | 값만 바꾸려고 EX 없이 SET |
| `TTL session:1` | `(integer) -1` | **TTL이 사라졌다.** 이제 영원히 남는다 |
| `SET session:1 park EX 100` | `OK` | 다시 SET할 때도 EX를 붙인다 |

## 4. 🔴 INCR — 숫자 세기

| 입력 | 결과 | 확인할 것 |
| ---- | ---- | --------- |
| `SET count 10` | `OK` | |
| `INCR count` | `(integer) 11` | 1 더하기 |
| `INCRBY count 5` | `(integer) 16` | 5 더하기 |
| `DECR count` | `(integer) 15` | 1 빼기 |
| `INCR newcount` | `(integer) 1` | 없는 키는 0에서 시작 |

**왜 "GET → +1 → SET" 대신 INCR인가**

```text
GET → +1 → SET 으로 하면 (명령 3개)
  서버 A: GET → 10                SET 11
  서버 B:        GET → 10   SET 11            ← 두 번 올렸는데 11

INCR 로 하면 (명령 1개)
  서버 A: INCR → 11
  서버 B: INCR → 12                           ← 정확하다
```

1장에서 본 것처럼 Redis는 **명령 하나는 끊김 없이** 처리한다. `INCR`은 읽기와 더하기를 명령 하나로 하니까 끼어들 틈이 없다. 조회수, 좋아요 수, 요청 횟수 세기에 쓴다.

## 5. 🔴 NX — 없을 때만 저장

**NX** = Not eXists. 키가 **없을 때만** 저장한다. 이미 있으면 아무것도 안 한다.

| 입력 | 결과 | 확인할 것 |
| ---- | ---- | --------- |
| `SET lock:a 1 NX EX 10` | `OK` | 키가 없어서 저장됨 |
| `SET lock:a 2 NX EX 10` | `(nil)` | 이미 있어서 **실패** |
| `GET lock:a` | `"1"` | 처음 값 그대로 |

동시에 100명이 `SET ... NX`를 보내도 **딱 1명만** `OK`를 받는다. 이걸로 "먼저 온 한 명만"을 만든다.

| 쓰는 곳 | 예 |
| ------- | -- |
| 중복 요청 막기 | 인증번호 1분 안에 재발송 금지 (아래 실습) |
| 락 | 한 번에 한 서버만 작업하기 (6장) |

`NX`에는 거의 **항상 `EX`를 같이** 붙인다. `EX`가 없으면 키가 영원히 남아서 다음 사람은 영원히 실패한다.

`exit`로 나온다.

---

## 6. Spring으로

| CLI | Spring (`StringRedisTemplate`) | 반환 |
| --- | ------------------------------ | ---- |
| `SET k v` | `redisTemplate.opsForValue().set(k, v)` | |
| `SET k v EX 60` | `opsForValue().set(k, v, Duration.ofSeconds(60))` | |
| `GET k` | `opsForValue().get(k)` | 없으면 `null` |
| `INCR k` | `opsForValue().increment(k)` | 증가한 값 (`Long`) |
| `SET k v NX EX 60` | `opsForValue().setIfAbsent(k, v, Duration.ofSeconds(60))` | 성공 `true`, 실패 `false` |
| `TTL k` | `redisTemplate.getExpire(k)` | 남은 초 (`Long`) |
| `DEL k` | `redisTemplate.delete(k)` | |

### 🧪 실습 1 — 조회수

```java
@PostMapping("/posts/{postId}/views")
public Long increaseViews(@PathVariable String postId) {
    return redisTemplate.opsForValue().increment("post:" + postId + ":views");   // INCR post:1:views
}
```

앱을 실행하고 (0장 5절) 새 터미널에서:

| 요청 | 결과 |
| ---- | ---- |
| `curl -X POST localhost:8083/ch02/posts/1/views` | `1` |
| `curl -X POST localhost:8083/ch02/posts/1/views` | `2` |
| `curl -X POST localhost:8083/ch02/posts/1/views` | `3` |

### 🧪 실습 2 — 인증번호 (TTL + NX)

요구사항:

1. 인증번호는 **3분** 동안만 유효 → `SET ... EX 180`
2. 같은 번호로 **1분 안에 재발송 금지** → `SET ... NX EX 60`
3. 인증에 성공하면 **바로 삭제** (한 번만 사용) → `DEL`

```java
// 발송
@PostMapping("/auth-code/{phone}")
public Map<String, Object> sendAuthCode(@PathVariable String phone) {
    // ② "1분 동안 재발송 금지" 표시를 NX로 남긴다. 이미 있으면(1분 안에 또 요청) false
    Boolean first = redisTemplate.opsForValue()
            .setIfAbsent("auth:cooldown:" + phone, "1", Duration.ofSeconds(60));
    if (!Boolean.TRUE.equals(first)) {
        return Map.of("result", "1분 후에 다시 요청하세요",
                "남은 초", redisTemplate.getExpire("auth:cooldown:" + phone));
    }

    // ① 6자리 번호를 만들어 3분 동안 저장
    String code = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
    redisTemplate.opsForValue().set("auth:code:" + phone, code, Duration.ofMinutes(3));
    return Map.of("result", "발송", "code", code);   // 실습용. 실제로는 문자로 보내고 응답에 넣지 않는다
}

// 확인
@PostMapping("/auth-code/{phone}/verify")
public String verifyAuthCode(@PathVariable String phone, @RequestParam String code) {
    String saved = redisTemplate.opsForValue().get("auth:code:" + phone);
    if (saved == null) {
        return "만료되었거나 요청하지 않은 번호";      // 3분이 지나 TTL로 사라졌다
    }
    if (!saved.equals(code)) {
        return "번호 불일치";
    }
    redisTemplate.delete("auth:code:" + phone);      // ③ 한 번 쓰면 삭제
    return "인증 성공";
}
```

| 순서 | 요청 | 결과 | 확인할 것 |
| ---- | ---- | ---- | --------- |
| 1 | `curl -X POST localhost:8083/ch02/auth-code/01012345678` | `{"result":"발송","code":"769323"}` | 번호는 매번 다르다 |
| 2 | 같은 요청 한 번 더 | `{"result":"1분 후에 다시 요청하세요","남은 초":60}` | NX가 막았다 |
| 3 | `docker exec redis-study redis-cli TTL auth:code:01012345678` | `180` 이하 | 앱이 만든 키라 0번 DB에서 확인 |
| 4 | `curl -X POST "localhost:8083/ch02/auth-code/01012345678/verify?code=000000"` | `번호 불일치` | |
| 5 | 1번에서 받은 번호로 확인 (`code=769323`) | `인증 성공` | |
| 6 | 5번을 한 번 더 | `만료되었거나 요청하지 않은 번호` | 성공하면서 삭제됐다 |

---

## 🎯 실습 문제

**문제 1 (CLI).** 로그인 실패 횟수를 센다. 실패할 때마다 1씩 올리고, **10분 동안 5번** 실패하면 로그인을 막는다. 10분은 **첫 실패부터** 센다. `kim`이 5번 실패한 상황을 만들어 보라.

<details>
<summary>정답</summary>

| 입력 | 결과 | 설명 |
| ---- | ---- | ---- |
| `INCR login:fail:kim` | `(integer) 1` | 첫 실패 |
| `EXPIRE login:fail:kim 600 NX` | `(integer) 1` | `NX` = TTL이 **없을 때만** 건다 → 첫 실패에만 걸린다 |
| `INCR login:fail:kim` | `(integer) 2` | 두 번째 실패 |
| `EXPIRE login:fail:kim 600 NX` | `(integer) 0` | 이미 TTL이 있어서 안 바뀜 (10분이 늘어나지 않는다) |
| (5번째까지 반복) | | |
| `GET login:fail:kim` | `"5"` | 5 이상이면 로그인 거부 |

로그인에 성공하면 `DEL login:fail:kim`으로 지운다.

</details>

**문제 2 (Spring).** 위 인증번호 API를 보지 않고 직접 만들어 보라. 같은 주소가 이미 있으면 앱이 뜨지 않으니(`Ambiguous mapping` 에러) `/ch02/my/auth-code/...`처럼 **다른 주소**로 만든다.

<details>
<summary>정답</summary>

실습 2의 코드와 같다. 핵심 세 줄:

- 재발송 제한 = `setIfAbsent(..., Duration.ofSeconds(60))`
- 3분 유효 = `set(..., Duration.ofMinutes(3))`
- 한 번만 사용 = 성공하면 `delete`

</details>

---

## 실무 주의

- 🔴 **키를 만들 때 TTL을 붙일 수 있는지 먼저 생각한다.** TTL이 `-1`인 키는 영원히 메모리를 차지한다.
- 🔴 다시 `SET`할 때 `EX`를 빼먹으면 TTL이 사라진다.
- 인증번호처럼 맞히면 이득인 값은 **시도 횟수도 제한**한다. 6자리는 3분 안에 무작정 대입해 볼 수 있다. 문제 1의 방법으로 세고 5번 넘으면 번호를 지운다.

## 면접 한 줄

- **TTL**: 키에 만료 시간을 줘서 Redis가 자동으로 지우게 한다. 메모리가 한정적이라 캐시와 임시 데이터에는 항상 TTL을 준다.
- **INCR**: 읽기와 증가를 명령 하나로 처리해서 동시 요청에도 정확하다.
- **SET NX EX**: 키가 없을 때만 저장하고 자동 만료시킨다. 중복 요청 방지와 락의 기본이다.

다음: [3장. 자료구조](./03-collections.md)
