# redis-practice

[Redis 총정리](../README.md)의 Spring 실습 프로젝트. 장마다 패키지가 나뉘어 있고, API는 `/ch02/...`처럼 장 번호로 시작한다.

- Spring Boot 4.1.1, Java 21, Spring Data Redis (Lettuce), Spring Cache
- 앱 포트 **8083**, Redis 포트 **6380**

## 실행

```bash
docker compose up -d            # 처음 한 번 (redis-study 컨테이너)
docker start redis-study        # 다음부터
./gradlew bootRun
curl localhost:8083/ping        # → PONG
```

서버 2대가 필요한 실습(8장)은 포트만 바꿔 하나 더 띄운다.

```bash
./gradlew bootRun --args='--server.port=8084'
```

## 구조

| 패키지 | 문서 | 내용 |
| ------ | ---- | ---- |
| `common` | [0장](../00-setup.md) | `GET /ping`, Redis 장애 시 503 응답 |
| `ch02string` | [2장](../02-string-and-ttl.md) | 기본 명령, 조회수(INCR), 인증번호(TTL + NX) |
| `ch03collection` | [3장](../03-collections.md) | 장바구니(Hash), 랭킹(Sorted Set), 최근 본 상품(List), 좋아요(Set) |
| `ch04keys` | [4장](../04-keys-and-memory.md) | SCAN으로 패턴 삭제, TTL 없는 키 찾기, INFO memory |
| `ch05cache` | [5장](../05-caching.md) | Cache-Aside 직접 구현, `@Cacheable`, Stampede 방지 락 |
| `ch06concurrency` | [6장](../06-concurrency.md) | 재고 차감 4가지(GET-SET, DECR, Lua, 분산 락), 선착순 쿠폰 |
| `ch07pipeline` | [7장](../07-pipeline.md) | 하나씩 vs Pipeline, 캐시 워밍업 |
| `ch08messaging` | [8장](../08-messaging.md) | Pub/Sub(캐시 무효화 방송, 채팅 패턴 구독), Stream(Consumer Group, 재처리) |

Lua 스크립트: `src/main/resources/scripts/` (`stock-decrease.lua`, `unlock.lua`, `coupon-issue.lua`)

## 테스트

```bash
./gradlew test                  # Redis가 떠 있어야 통과
```
