# Redis 총정리

Redis를 처음 배우는 사람이 **순서대로 따라 하면서** 실무에서 쓸 수 있게 되는 것을 목표로 한 자료다. 이 폴더만 보고 처음부터 끝까지 학습할 수 있다.

- 장마다 **개념(용어는 처음 나올 때 바로 설명) → 따라 치기 → 실습 문제 → 정리 → 면접 한 줄** 순서다.
- 실습은 **"입력 / 결과 / 확인할 것"** 표를 보며 한 줄씩 친다. 길고 어려운 명령은 [infra/](./infra) 스크립트로 대신한다.
- 문서의 결과값은 전부 직접 실행해서 확인한 값이다. 단, **시간(ms)과 동시 요청 결과는 실행할 때마다 다르다.** 숫자가 똑같지 않아도 "몇 배 차이 나는가"를 보면 된다.
- 실습 프로젝트: [redis-practice](./redis-practice) (Spring Boot 4.1.1, Java 21, Spring Data Redis)
- 참고 강의: [인프런 Redis 강의](https://www.inflearn.com/course/%EC%84%A4-%ED%8A%B9%EC%A7%91-%EC%B4%88%EB%8B%B9-500000%EA%B1%B4-%ED%8A%B8%EB%9E%98%ED%94%BD%EC%9D%84/dashboard?cid=340367)

## 학습 순서

| 장 | 문서 | 배우는 것 | 실습 | 중요도 |
| -- | ---- | --------- | ---- | ------ |
| 0 | [실습 환경 준비](./00-setup.md) | Docker Redis, redis-cli, Spring 연결, 에러 처리 | `GET /ping` → PONG | 🔴 |
| 1 | [Redis란](./01-redis-basics.md) | In-Memory, **싱글 스레드**, 실무 용도 | 느린 명령 하나가 전체를 막는 것 확인 | 🔴 |
| 2 | [String & TTL](./02-string-and-ttl.md) | `SET`/`GET`, **TTL**, **INCR**, **SET NX** | 조회수, 인증번호 | 🔴 |
| 3 | [자료구조](./03-collections.md) | **Hash**, **Sorted Set**, List, Set | 장바구니, 랭킹, 최근 본 상품, 좋아요 | 🔴 |
| 4 | [키 관리 & 메모리](./04-keys-and-memory.md) | `KEYS` 금지와 **SCAN**, UNLINK, maxmemory, eviction | 패턴 삭제, 메모리 꽉 채우기 | 🔴 |
| 5 | [캐싱](./05-caching.md) | **Cache-Aside**, **@Cacheable**, Cache Stampede | DB 조회 횟수 50 → 1 | 🔴 |
| 6 | [동시성](./06-concurrency.md) | **Lua 스크립트**, **분산 락**, lock timeout, Redisson | 재고 초과 판매 재현 → 해결, 선착순 쿠폰 | 🔴 |
| 7 | [Pipeline](./07-pipeline.md) | 네트워크 왕복 줄이기, Lua와 차이 | 1만 건 4.2초 → 0.07초 | 🟡 |
| 8 | [메시징](./08-messaging.md) | Pub/Sub, at-most-once vs at-least-once, Stream | 서버 2대 캐시 무효화 방송, Stream 재처리 | 🟡 |
| 9 | [영속성](./09-persistence.md) | RDB, AOF, 용도별 선택 | 강제 종료 후 데이터 확인 | 🟡 |
| 10 | [Replication과 Sentinel](./10-replication-sentinel.md) | 비동기 복제, Sentinel 투표와 자동 승격 | Master를 죽이고 약 7초 뒤 자동 승격 확인 | 🟡 |
| 11 | [Cluster](./11-cluster.md) | **해시 슬롯, CROSSSLOT, 해시 태그**, Replica 필수 | 6노드 클러스터, Master 죽이기 | 🔴 |

**중요도**

- 🔴 실무에서 직접 코드를 짜거나 자주 부딪힌다. 손에 익을 때까지 실습한다.
- 🟡 개념과 "언제 쓰나"를 말할 수 있으면 된다.
- 🟢 있다는 것만 안다 (문서 안에서 짧게만 다룬다).

**처음이라면**: 0 → 6장을 순서대로 끝내는 것이 1차 목표다 (약 6시간). 그다음 **11장 Cluster의 CROSSSLOT과 해시 태그**는 코드에 직접 영향을 주므로 꼭 읽는다. 7~10장은 그 뒤에 읽는다.

## 폴더 구조

```text
09회차(Redis 총정리)/
  README.md                 ← 지금 이 문서 (학습 순서, 복습 체크리스트)
  00-setup.md ~ 11-cluster.md
  assets/                   ← 문서 이미지
  infra/                    ← 길고 어려운 명령을 대신하는 실습 스크립트
    slow-command.sh         ← 1장: 약 5초 걸리는 명령 보내기
    memory/                 ← 4장: 2MB짜리 Redis 띄우기, 채우기
    hit.sh                  ← 5, 6장: 같은 요청을 동시에 여러 번 보내기
    persistence/            ← 9장: 임시 Redis 띄우기, 강제 종료
    sentinel/               ← 10장: Master 1 + Replica 2 + Sentinel 3
    cluster/                ← 11장: 6대 클러스터
  redis-practice/           ← Spring 실습 프로젝트
    src/main/java/com/buzz/redis/
      common/  ch02string/  ch03collection/  ch04keys/  ch05cache/
      ch06concurrency/  ch07pipeline/  ch08messaging/
    src/main/resources/scripts/   ← Lua 스크립트
```

## 실습 규칙

| 규칙 | 이유 |
| ---- | ---- |
| CLI 연습은 접속 후 `SELECT 1`(**1번 DB**)부터 | Spring 앱이 쓰는 0번과 섞이지 않게 |
| 앱이 만든 키 확인은 **0번 DB** (접속 후 바로) | 1번에서 찾으면 `(nil)` |
| 앱은 **8083**, Redis는 **6380** | 다른 프로젝트와 포트가 겹치지 않게 |
| 실습용 임시 Redis는 끝나면 각 폴더의 `stop.sh`로 지운다 | 남겨 두면 메모리를 차지한다 |

## 전체 복습 체크리스트

아래 질문에 답할 수 있으면 이 자료를 끝낸 것이다. 답이 막히면 오른쪽 장으로 돌아간다.

| 질문 | 장 |
| ---- | -- |
| Redis가 싱글 스레드라서 좋은 점과 위험한 점은? | 1 |
| 캐시 키에 TTL을 붙여야 하는 이유는? EX 없이 다시 SET하면? | 2 |
| `GET` → +1 → `SET` 대신 `INCR`을 쓰는 이유는? | 2 |
| `SET NX EX`는 어디에 쓰나? (3군데) | 2, 5, 6 |
| 랭킹을 DB `ORDER BY` 대신 Sorted Set으로 하면 무엇이 좋나? | 3 |
| 운영에서 `KEYS`를 쓰면 안 되는 이유와 대안은? SCAN이 끝나는 조건은? | 4 |
| 메모리가 꽉 찼을 때 `noeviction`과 `allkeys-lru`의 차이는? | 4 |
| Cache-Aside 흐름은? 수정할 때 캐시를 덮어쓰지 않고 지우는 이유는? | 5 |
| `@Cacheable`이 같은 클래스 안에서 동작하지 않는 이유는? | 5 |
| Cache Stampede란? 어떻게 막나? | 5 |
| 재고 차감에 `DECR`만 쓰면 생기는 문제는? Lua는 어떻게 해결하나? | 6 |
| Lua와 분산 락은 각각 언제 쓰나? | 6 |
| 분산 락의 lock timeout이 짧을 때, 길 때, 없을 때 문제는? 해제할 때 토큰을 확인하는 이유는? | 6 |
| Pipeline과 Lua의 차이는? | 7 |
| Pub/Sub이 유실되는 이유는? at-least-once에서 중복을 어떻게 다루나? | 8 |
| 캐시용 Redis와 세션 저장용 Redis의 영속성 설정은 어떻게 다른가? | 9 |
| 복제가 비동기라서 생기는 문제 두 가지는? | 10 |
| Sentinel이 최소 3대인 이유는? | 10 |
| Cluster의 해시 슬롯, MOVED, CROSSSLOT, 해시 태그를 설명하라 | 11 |
| Replica 없는 Cluster에서 Master 1대가 죽으면? | 11 |

## Redis 실무 규칙 한 장 요약

```text
1. 원본은 DB, Redis는 빠른 복사본과 임시 데이터
2. 넣을 때 지우는 방법(TTL)도 같이 정한다
3. 느린 명령 하나가 전체를 멈춘다 → KEYS 금지, 큰 키 피하기, Lua는 짧게
4. 캐시: Cache-Aside, 수정 시 DB 먼저 → 캐시 삭제
5. 동시성: 조건 없는 숫자는 INCR, 확인 후 변경은 Lua, Redis 밖까지는 분산 락
6. 분산 락: SET NX EX + 내 토큰 확인 해제 (실무는 Redisson)
7. Pub/Sub은 유실된다 → 놓치면 안 되는 건 Kafka/Stream + 멱등 처리
8. timeout은 짧게, Redis 장애 시에도 서비스가 (느리게라도) 돌아가게
9. 운영: maxmemory 설정, 캐시는 allkeys-lru, 최소 Sentinel 이상
10. Cluster를 쓸 거면 여러 키 명령에 처음부터 해시 태그
```
