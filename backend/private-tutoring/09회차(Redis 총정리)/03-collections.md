# 3장. 자료구조 — Hash, Sorted Set, List, Set

> **이 장을 마치면**: 값 하나(String)로는 불편한 데이터를 알맞은 자료구조에 담을 수 있다. 실무에서 특히 많이 쓰는 **Hash(장바구니)** 와 **Sorted Set(랭킹)** 을 Spring으로 만든다.

| 자료구조 | 모양 | 실무 예 | 중요도 |
| -------- | ---- | ------- | ------ |
| **Hash** | 키 하나 안에 `필드 → 값` 여러 쌍 | 장바구니, 회원 정보, 게시글 통계 | 🔴 |
| **Sorted Set** | 점수 순으로 **자동 정렬**되는 목록 (중복 없음) | 랭킹 | 🔴 |
| List | 순서대로 쌓이는 목록 | 최근 본 상품 | 🟡 |
| Set | 중복 없는 목록 (순서 없음) | 좋아요 (1인 1회) | 🟡 |

**실습 코드**: [ch03collection/CollectionController.java](./redis-practice/src/main/java/com/buzz/redis/ch03collection/CollectionController.java)

> 키 하나에는 자료구조 **하나**만 담긴다. Hash가 담긴 키에 `GET`(String 명령)을 보내면 `WRONGTYPE` 에러가 난다.

---

## 1. 🔴 Hash — 키 하나에 필드 여러 개

```text
키: user:1
 ├ name → kim
 ├ age  → 30
 └ city → seoul
```

**왜 필요한가**: 회원 정보를 String에 통째로(`{"name":"kim","age":30,...}`) 넣으면, 나이 하나 바꾸는데도 **전체를 꺼내서 고치고 다시 넣어야** 한다. Hash는 **필드 하나만** 읽고 바꿀 수 있다.

### 🧪 따라 치기

`docker exec -it redis-study redis-cli` → `SELECT 1`

| 입력 | 결과 | 확인할 것 |
| ---- | ---- | --------- |
| `HSET user:1 name kim age 30 city seoul` | `(integer) 3` | 필드 3개 저장 (새로 생긴 필드 수) |
| `HGET user:1 name` | `"kim"` | 필드 하나 조회 |
| `HMGET user:1 name city nofield` | `1) "kim"`<br>`2) "seoul"`<br>`3) (nil)` | 여러 필드 조회. 없는 필드는 nil |
| `HSET user:1 age 31` | `(integer) 0` | 이미 있는 필드는 **수정** (새로 생긴 필드 0개) |
| `HINCRBY user:1 age 1` | `(integer) 32` | 필드 숫자 더하기 |
| `HGETALL user:1` | `1) "name" 2) "kim" 3) "age" 4) "32" 5) "city" 6) "seoul"` | 전체 (필드, 값 번갈아) |
| `HDEL user:1 city` | `(integer) 1` | 필드 삭제 |
| `HLEN user:1` | `(integer) 2` | 필드 개수 |

> TTL은 보통 **키 전체**에 건다 (`EXPIRE user:1 60`). 🟢 Redis 7.4부터는 필드 하나에만 만료를 거는 `HEXPIRE`도 있다.

### 🧪 Spring — 장바구니

필드 = 상품 ID, 값 = 수량. 같은 상품을 또 담으면 수량이 쌓여야 하므로 `HINCRBY`를 쓴다.

```java
@PostMapping("/cart/{userId}/items/{productId}")
public Map<String, String> addToCart(@PathVariable String userId, @PathVariable String productId,
                                     @RequestParam(defaultValue = "1") long qty) {
    HashOperations<String, String, String> hash = redisTemplate.opsForHash();   // 필드, 값을 String으로
    String key = "cart:" + userId;

    Long now = hash.increment(key, productId, qty);   // HINCRBY cart:1 product:10 1
    if (now <= 0) {
        hash.delete(key, productId);                  // 0개 이하면 장바구니에서 뺀다 (HDEL)
    }
    return hash.entries(key);                         // 장바구니 전체 (HGETALL)
}
```

| 요청 | 결과 | 확인할 것 |
| ---- | ---- | --------- |
| `curl -X POST "localhost:8083/ch03/cart/1/items/product:10"` | `{"product:10":"1"}` | |
| `curl -X POST "localhost:8083/ch03/cart/1/items/product:10?qty=2"` | `{"product:10":"3"}` | 수량이 쌓였다 |
| `curl -X POST "localhost:8083/ch03/cart/1/items/product:20"` | `{"product:10":"3","product:20":"1"}` | |
| `curl -X POST "localhost:8083/ch03/cart/1/items/product:20?qty=-1"` | `{"product:10":"3"}` | 0개가 되어 빠졌다 |

| CLI | Spring (`HashOperations<String, String, String>`) |
| --- | ------------------------------------------------- |
| `HSET k f v` | `put(k, f, v)` |
| `HGET k f` | `get(k, f)` |
| `HINCRBY k f n` | `increment(k, f, n)` |
| `HGETALL k` | `entries(k)` |
| `HDEL k f` | `delete(k, f)` |

---

## 2. 🔴 Sorted Set — 점수 순으로 자동 정렬

각 원소가 **점수**를 가지고 있고, Redis가 **항상 점수 순으로 정렬된 상태**를 유지한다. 같은 원소는 한 번만 들어간다.

```text
키: ranking
  lee  300
  kim  250       ← 넣을 때마다 알아서 이 순서로 정리된다
  park 200
```

**왜 필요한가**: DB로 랭킹을 보려면 매번 `ORDER BY score DESC`로 전체를 정렬해야 한다. Sorted Set은 **이미 정렬되어 있어서** "상위 10명", "내 등수"를 바로 꺼낸다. 100만 명이어도 빠르다.

### 🧪 따라 치기

| 입력 | 결과 | 확인할 것 |
| ---- | ---- | --------- |
| `ZADD ranking 100 kim 300 lee 200 park` | `(integer) 3` | `점수 이름` 순서로 넣는다 |
| `ZADD ranking 250 kim` | `(integer) 0` | 이미 있으면 점수만 바뀐다 |
| `ZINCRBY ranking 50 park` | `"250"` | 점수 더하기 |
| `ZREVRANGE ranking 0 2 WITHSCORES` | `1) "lee" 2) "300"`<br>`3) "park" 4) "250"`<br>`5) "kim" 6) "250"` | 높은 점수부터 1~3등 (`REV` = 높은 순) |
| `ZREVRANK ranking kim` | `(integer) 2` | 등수. **0부터** 센다 → 실제 3등 |
| `ZSCORE ranking lee` | `"300"` | 점수 |
| `ZCARD ranking` | `(integer) 3` | 전체 인원 |
| `ZREVRANK ranking nobody` | `(nil)` | 없는 사람 |

| 헷갈리는 것 | 설명 |
| ----------- | ---- |
| `REV`가 붙으면 | **높은 점수부터**. 랭킹은 거의 `ZREVRANGE`, `ZREVRANK`를 쓴다 |
| 등수 | **0부터**. 화면에 보여 줄 때 `+1` |
| 점수가 같으면 | 이름의 알파벳 순서로 정한다. `REV`는 그것도 거꾸로라서 250점 동점인 park이 kim보다 앞에 온다 |

### 🧪 Spring — 게임 랭킹

```java
// 점수 추가: 기존 점수에 더한다
@PostMapping("/ranking/{userId}")
public Double addScore(@PathVariable String userId, @RequestParam double score) {
    return redisTemplate.opsForZSet().incrementScore("ranking", userId, score);   // ZINCRBY
}

// Top N
@GetMapping("/ranking/top")
public List<String> top(@RequestParam(defaultValue = "3") int n) {
    // ZREVRANGE ranking 0 n-1 WITHSCORES → (이름, 점수) 쌍 목록
    Set<TypedTuple<String>> tuples = redisTemplate.opsForZSet().reverseRangeWithScores("ranking", 0, n - 1);
    int rank = 1;
    List<String> lines = new ArrayList<>();
    for (TypedTuple<String> t : tuples) {             // TypedTuple = 이름(getValue) + 점수(getScore)
        lines.add(rank++ + "등 " + t.getValue() + " (" + t.getScore().intValue() + "점)");
    }
    return lines;
}

// 내 등수
@GetMapping("/ranking/{userId}")
public Map<String, Object> myRank(@PathVariable String userId) {
    Long rank = redisTemplate.opsForZSet().reverseRank("ranking", userId);   // 0부터, 없으면 null
    Double score = redisTemplate.opsForZSet().score("ranking", userId);
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("rank", rank == null ? null : rank + 1);                     // 1등부터 보이게
    result.put("score", score);
    result.put("total", redisTemplate.opsForZSet().size("ranking"));
    return result;
}
```

| 요청 | 결과 | 확인할 것 |
| ---- | ---- | --------- |
| `curl -X POST "localhost:8083/ch03/ranking/kim?score=100"` | `100.0` | |
| `curl -X POST "localhost:8083/ch03/ranking/lee?score=300"` | `300.0` | |
| `curl -X POST "localhost:8083/ch03/ranking/park?score=200"` | `200.0` | |
| `curl -X POST "localhost:8083/ch03/ranking/kim?score=150"` | `250.0` | 기존 100에 150이 더해졌다 |
| `curl "localhost:8083/ch03/ranking/top?n=3"` | `["1등 lee (300점)","2등 kim (250점)","3등 park (200점)"]` | |
| `curl localhost:8083/ch03/ranking/park` | `{"rank":3,"score":200.0,"total":3}` | |
| `curl localhost:8083/ch03/ranking/nobody` | `{"rank":null,"score":null,"total":3}` | |

---

## 3. 🟡 List — 순서대로 쌓이는 목록

양 끝에서 넣고 뺀다. `L` = 왼쪽(앞), `R` = 오른쪽(뒤).

| 입력 | 결과 | 확인할 것 |
| ---- | ---- | --------- |
| `RPUSH queue:email mail-1 mail-2 mail-3` | `(integer) 3` | 뒤에 넣기 |
| `LRANGE queue:email 0 -1` | `1) "mail-1" 2) "mail-2" 3) "mail-3"` | 처음(0)부터 끝(-1)까지 보기 |
| `LPOP queue:email` | `"mail-1"` | 앞에서 꺼내기 → 넣은 순서대로 나온다 |
| `LLEN queue:email` | `(integer) 2` | 개수 |
| `LPUSH recent:1 10 20 30` | `(integer) 3` | 앞에 넣기 |
| `LRANGE recent:1 0 -1` | `1) "30" 2) "20" 3) "10"` | 마지막에 넣은 게 맨 앞 → "최근 것부터" |

### 🧪 Spring — 최근 본 상품 5개

```java
@PostMapping("/recent/{userId}")
public List<String> view(@PathVariable String userId, @RequestParam String productId) {
    String key = "recent:" + userId;
    redisTemplate.opsForList().remove(key, 0, productId);   // 이미 본 상품이면 목록에서 빼고 (LREM)
    redisTemplate.opsForList().leftPush(key, productId);    // 맨 앞에 넣고 (LPUSH)
    redisTemplate.opsForList().trim(key, 0, 4);             // 앞에서 5개만 남긴다 (LTRIM 0 4)
    return redisTemplate.opsForList().range(key, 0, -1);
}
```

상품 10 → 20 → 30 → **20** → 40 → 50 → 60 순서로 보면 (`curl -X POST "localhost:8083/ch03/recent/1?productId=10"` …):

```text
["10"]
["20","10"]
["30","20","10"]
["20","30","10"]                 ← 20을 다시 보면 맨 앞으로 (중복 없음)
["40","20","30","10"]
["50","40","20","30","10"]
["60","50","40","20","30"]       ← 5개를 넘으면 가장 오래된 10이 잘린다
```

---

## 4. 🟡 Set — 중복 없는 목록

| 입력 | 결과 | 확인할 것 |
| ---- | ---- | --------- |
| `SADD post:1:likes kim lee` | `(integer) 2` | 새로 들어간 개수 |
| `SADD post:1:likes kim` | `(integer) 0` | 이미 있어서 무시 → 좋아요 두 번 눌러도 1번 |
| `SCARD post:1:likes` | `(integer) 2` | 개수 (좋아요 수) |
| `SISMEMBER post:1:likes kim` | `(integer) 1` | 들어 있나? (1 = 예, 0 = 아니오) |
| `SREM post:1:likes lee` | `(integer) 1` | 빼기 (좋아요 취소) |

```java
Long added = redisTemplate.opsForSet().add(key, userId);            // SADD → 1 또는 0
Long count = redisTemplate.opsForSet().size(key);                   // SCARD
Boolean liked = redisTemplate.opsForSet().isMember(key, userId);    // SISMEMBER
```

| 요청 | 결과 |
| ---- | ---- |
| `curl -X POST localhost:8083/ch03/posts/1/likes/kim` | `{"count":1,"added":1}` |
| 같은 요청 한 번 더 | `{"count":1,"added":0}` |
| `curl localhost:8083/ch03/posts/1/likes/kim` | `true` |

---

## 5. 무엇을 고를까

| 하고 싶은 것 | 자료구조 |
| ------------ | -------- |
| 값 하나, 숫자 세기, 만료되는 값 | String (2장) |
| 객체의 필드를 따로 읽고 쓰기 | **Hash** |
| 점수 순 정렬, 등수 | **Sorted Set** |
| 최근 N개, 순서대로 처리 | List |
| 중복 없이 모으기, 들어 있나 확인 | Set |

---

## 🎯 실습 문제

**문제 1 (CLI).** 게시글 1번의 조회수와 좋아요 수를 키 **하나**에 모은다. 조회 3번, 좋아요 1번을 기록하고 `views`, `likes`, `comments`를 한 번에 조회하라 (`comments`는 아직 없음).

<details>
<summary>정답</summary>

| 입력 | 결과 |
| ---- | ---- |
| `HINCRBY post:1:stats views 1` (3번) | `(integer) 1`, `2`, `3` |
| `HINCRBY post:1:stats likes 1` | `(integer) 1` |
| `HMGET post:1:stats views likes comments` | `1) "3" 2) "1" 3) (nil)` |

</details>

**문제 2 (Spring).** 랭킹 API 3개(점수 추가, Top N, 내 등수)를 위 코드를 보지 않고 만들어 보라. 주소는 `/ch03/my/ranking/...`처럼 기존 것과 겹치지 않게 한다.

<details>
<summary>정답</summary>

2절 코드와 같다. 실수하기 쉬운 곳 두 가지:

- `range`가 아니라 **`reverseRange`** (높은 점수부터)
- `reverseRank`는 **0부터**이고 없으면 `null` → null인지 먼저 확인하고 `+1`

</details>

---

## 실무 주의

- 🔴 **원소가 너무 많은 키를 만들지 않는다.** 원소 수십만 개짜리 Hash를 `HGETALL`로 꺼내면 1장의 "느린 명령"이 된다. `ranking:2026-10`처럼 기간, 대상별로 키를 나누고 필요한 만큼만 꺼낸다.
- 장바구니 같은 키에도 TTL을 생각한다 (예: 30일).

## 면접 한 줄

- **Hash**: 필드 단위로 읽고 쓸 수 있어서 객체나 장바구니 저장에 쓴다.
- **Sorted Set**: 점수 기준으로 항상 정렬된 상태를 유지해, 랭킹의 상위 N명과 등수를 빠르게(O(log N)) 조회한다.

다음: [4장. 키 관리 & 메모리](./04-keys-and-memory.md)
