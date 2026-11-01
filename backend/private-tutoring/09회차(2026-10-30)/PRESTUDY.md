# 9회차(2026/10/30) 예습 — Redis 고가용성: Replication, Sentinel, Cluster

- 이전 회차: [8회차 PRESTUDY](<../08회차(2026-10-21)/PRESTUDY.md>) (Spring MVC, 분산 락, Lua, Pipeline, Pub/Sub)
- 8회차 복습: [8회차 STUDY_GUIDE](<../08회차(2026-10-21)/STUDY_GUIDE.md>)
- 실습 환경: [practice/compose.yaml](./practice/compose.yaml) (Master 1 + Replica 2 + Sentinel 3)
- 설명 방식: 정의 → 왜 필요한가 → 동작 원리 → 실무 포인트. 결과는 모두 직접 실행해서 확인한 값이다.

| 장 | 키워드 | 해결하는 문제 |
| -- | ------ | ------------- |
| 0 | 전체 그림 | Redis 1대의 위험 |
| 1 | Replication | 데이터 사본이 없다 |
| 2 | Sentinel | Master가 죽으면 사람이 바꿔야 한다 |
| 3 | Cluster | 서버 1대의 메모리를 넘는 데이터를 담을 수 없다 |
| 4 | Spring 연결 | 애플리케이션은 어디에 접속하나 |

---

## 0. 전체 그림 — 세 개는 순서대로 쌓인다

지금까지 실습한 Redis는 **1대(Standalone)** 다. 이 1대가 꺼지면 캐시, 분산 락, 세션이 전부 사라지고 서비스가 멈춘다. 이걸 **SPOF**(Single Point of Failure, 단일 장애점)라고 한다.

```text
Standalone      Redis 1대                       꺼지면 끝
   ↓ + 사본
Replication     Master 1 + Replica N            사본은 있지만, Master가 죽으면 사람이 전환
   ↓ + 자동 전환
Sentinel        Replication + 감시자 3대         Master가 죽으면 자동으로 Replica 승격
   ↓ + 나눠 저장
Cluster         Master N + Replica N            데이터를 여러 Master에 나눠 저장 + 자동 승격 내장
```

> 앞 단계의 한계를 다음 단계가 해결한다. 이 흐름 하나만 말할 수 있으면 오늘 수업의 뼈대는 끝이다.

---

## 1. Replication (복제)

> **Master에 쓴 데이터를 Replica가 자동으로 복사해 가지는 것**

### 왜 필요한가

| 목적 | 설명 |
| ---- | ---- |
| 데이터 사본 | Master 서버의 디스크가 망가져도 Replica에 데이터가 있다 |
| 읽기 분산 | 읽기 요청을 Replica로 보내 Master의 부하를 줄인다 |
| 장애 대비 | Master가 죽었을 때 승격시킬 후보가 된다 (2장 Sentinel의 전제) |

### 규칙 두 가지

```text
쓰기  → Master만
읽기  → Master, Replica 모두
```

Replica에 쓰면 거절된다.

```text
[replica-1] SET user:2 lee
READONLY You can't write against a read only replica.
```

### 동작 — 처음 한 번 통째로, 그 뒤로는 명령만

```text
① Replica 접속:  REPLICAOF redis-master 6379
② 전체 동기화:   Master가 fork로 RDB 스냅샷을 만들어 통째로 전송 → Replica가 그걸로 데이터 교체
③ 이후:          Master가 받은 쓰기 명령(SET, DEL ...)을 Replica에 계속 흘려보냄
```

Replica가 잠깐 끊겼다 돌아오면, Master가 최근 명령을 모아 둔 버퍼(replication backlog)에서 **빠진 부분만** 보내 준다. 너무 오래 끊겨서 버퍼를 넘었으면 ②부터 다시 한다.

```text
docker stop redis-replica-1          ← Replica 1대 끔
[master] SET while:down 1            → OK
[master] INFO replication            → connected_slaves:1
docker start redis-replica-1
[replica-1] GET while:down           → "1"   ← 꺼져 있던 동안의 쓰기도 따라잡음
```

### 🔴 가장 중요한 특징 — 비동기 복제

Master는 **Replica에 복사가 끝났는지 확인하지 않고** 클라이언트에 `OK`를 돌려준다.

```text
클라이언트 → Master: SET order:1 paid
Master    → 클라이언트: OK              ← 여기서 응답 끝
Master    → Replica: SET order:1 paid  ← 조금 뒤에 복사
```

여기서 두 가지 문제가 생긴다.

| 문제 | 상황 | 결과 |
| ---- | ---- | ---- |
| **복제 지연 (Replication Lag)** | Master에 쓴 직후 Replica에서 읽음 | 아직 복사 전이라 **옛날 값**이 읽힘 |
| **데이터 유실** | `OK`를 받은 직후 Replica에 복사되기 전에 Master가 죽음 | Replica가 승격되면 그 쓰기는 **없던 일**이 됨 |

`WAIT`로 "Replica N대가 받을 때까지 기다리기"를 할 수는 있다.

```text
[master] SET order:1 paid  → OK
[master] WAIT 2 1000       → (integer) 2    ← 1초 안에 Replica 2대가 받았다
```

그래도 유실을 완전히 막지는 못한다. **Redis 복제는 "대부분 안전"이지 "절대 안전"이 아니다.** 절대 잃으면 안 되는 데이터(결제, 주문)의 원본은 DB에 둔다.

> 1회차에서 배운 DB의 Primary/Replica와 같은 구조, 같은 문제(replication lag)다.

### 한계 — Master가 죽으면

Replica는 살아 있지만 **쓰기를 받을 서버가 없다.** 사람이 직접

1. Replica 하나에 `REPLICAOF NO ONE` (Master로 승격)
2. 나머지 Replica를 새 Master에 연결
3. 애플리케이션 설정의 Redis 주소를 새 Master로 바꾸고 재배포

를 해야 한다. 새벽 3시에 이걸 사람이 하는 건 현실적이지 않다. → **Sentinel**

---

## 2. Sentinel (감시자)

> **Master를 계속 감시하다가, 죽으면 Replica 하나를 새 Master로 자동 승격시키는 별도 프로세스**

Sentinel은 데이터를 저장하지 않는다. `redis-sentinel`이라는 **감시 전용 프로그램**이고, 기본 포트는 26379다.

### 하는 일 세 가지

| 역할 | 설명 |
| ---- | ---- |
| 감시 | Master와 Replica에 주기적으로 PING |
| 자동 장애 조치 (Failover) | Master가 죽으면 Replica를 승격하고 나머지를 새 Master에 붙임 |
| 주소 안내 | 애플리케이션이 "지금 Master 누구야?"라고 물으면 알려 줌 |

세 번째가 중요하다. 애플리케이션은 Redis 주소를 직접 갖지 않고 **Sentinel에게 Master 주소를 물어본다.** 그래서 Master가 바뀌어도 재배포가 필요 없다.

```text
[sentinel] SENTINEL get-master-addr-by-name mymaster
1) "redis-master"
2) "6379"
```

### 🔴 왜 3대인가 — 한 대의 판단은 믿지 않는다

Sentinel 1대가 "Master가 죽었다"고 판단해도, 사실은 **그 Sentinel과 Master 사이 네트워크만** 끊긴 것일 수 있다. 그래서 여러 대가 동의해야 장애로 인정한다.

```text
sdown (주관적 다운)   Sentinel 1대가 down-after-milliseconds 동안 응답을 못 받음 → "내가 보기엔 죽었다"
   ↓
odown (객관적 다운)   quorum(정족수) 이상의 Sentinel이 동의 → "다 같이 보기에도 죽었다"
   ↓
리더 선출             Sentinel 과반수의 투표로 장애 조치를 맡을 리더 1대를 뽑음
   ↓
승격                  리더가 Replica 하나를 골라 Master로 승격, 나머지 Replica를 새 Master에 연결
```

- 과반수 투표가 있어서 **홀수, 최소 3대**를 둔다. 2대면 1대만 죽어도 과반(2)을 못 채운다.
- 실습 설정: `sentinel monitor mymaster redis-master 6379 2` → 마지막 `2`가 quorum이다.

### 실습 결과 — Master를 끄고 지켜보기

`down-after-milliseconds 5000` (5초 응답 없으면 sdown) 설정으로 실행한 결과다.

```text
19:47:25  docker stop redis-master

[sentinel-1] 10:47:31.002 +sdown master mymaster redis-master 6379
[sentinel-3] 10:47:31.084 +try-failover master mymaster redis-master 6379
[sentinel-3] 10:47:31.158 +elected-leader master mymaster redis-master 6379        ← sentinel-3이 리더
[sentinel-3] 10:47:31.261 +selected-slave slave redis-replica-1:6379 ...           ← replica-1 선택
[sentinel-1] 10:47:32.140 +odown master mymaster redis-master 6379 #quorum 2/2
[sentinel-3] 10:47:32.171 +promoted-slave slave redis-replica-1:6379 ...           ← 승격
[sentinel-1] 10:47:32.221 +switch-master mymaster redis-master 6379 redis-replica-1 6379
[sentinel-3] 10:47:33.258 +failover-end

19:47:32  SENTINEL get-master-addr-by-name mymaster → redis-replica-1
```

(컨테이너 로그는 UTC라 시각이 9시간 다르다.)

| 확인 | 결과 |
| ---- | ---- |
| 새 Master (`replica-1`)의 역할 | `role:master`, `connected_slaves:1` (replica-2가 붙음) |
| 새 Master에서 `GET user:1` | `"kim"` (장애 전에 쓴 데이터 그대로) |
| Master를 끈 뒤 전환까지 | **약 7초** (5초 감지 + 투표, 승격 약 2초) |

**옛 Master를 다시 켜면?** Sentinel이 그 서버를 **Replica로** 돌려 붙인다. 두 서버가 서로 Master라고 주장하는 일은 생기지 않는다.

```text
docker start redis-master
[old master] INFO replication → role:slave, master_host:redis-replica-1, master_link_status:up
[old master] SET x 1          → READONLY You can't write against a read only replica.
[new master] INFO replication → connected_slaves:2
```

### 실무 포인트

- 전환되는 **몇 초 동안은 쓰기가 실패한다.** 애플리케이션은 재시도나 에러 처리를 해야 한다.
- 기본 `down-after-milliseconds`는 **30초**다. 짧게 잡으면 빨리 전환되지만, 네트워크가 잠깐 느린 것까지 장애로 오판한다.
- 1장의 비동기 복제 때문에, 승격 직전 Master가 받은 쓰기 일부는 **잃을 수 있다.**

### 한계

쓰기는 여전히 **Master 1대**가 다 받고, 데이터도 Master 1대의 **메모리만큼만** 담을 수 있다. Replica를 늘려도 모두 같은 데이터를 복사할 뿐이라 용량은 그대로다. → **Cluster**

---

## 3. Cluster

> **데이터를 여러 Master에 나눠 저장(샤딩)하고, 각 Master마다 Replica를 둬서 자동 승격까지 스스로 하는 구성**

### 왜 필요한가

| | Sentinel | Cluster |
| --- | --- | --- |
| 데이터 | Master 1대가 전부 가짐 | Master N대가 **나눠** 가짐 |
| 저장 용량 | Master 1대의 메모리 | 대략 N배 |
| 쓰기 처리 | Master 1대 | Master N대가 동시에 |
| 자동 승격 | Sentinel 프로세스가 함 | **노드들끼리** 함 (Sentinel 불필요) |

### 🔴 해시 슬롯 — 키가 어느 Master로 가는지 정하는 규칙

Cluster는 **0~16383번, 16384개의 슬롯**을 Master들에게 나눠 준다.

```text
슬롯 번호 = CRC16(키) % 16384

Master A (7000): 슬롯     0 ~ 5460   ── Replica
Master B (7001): 슬롯  5461 ~ 10922  ── Replica
Master C (7002): 슬롯 10923 ~ 16383  ── Replica
```

```text
CLUSTER KEYSLOT user:123 → 12893   → Master C 담당
```

키 이름만 있으면 누구든 같은 슬롯을 계산할 수 있다. 그래서 클라이언트가 "이 키는 C에게 물어보면 된다"를 스스로 안다.

> 1회차의 샤딩(`id % 서버 수`)과 같은 생각이다. 다만 서버 수가 아니라 **고정된 16384**로 나누기 때문에, 서버를 추가해도 모든 키의 위치가 바뀌지 않는다. 슬롯 일부만 새 서버로 옮기면 된다.

### MOVED — 엉뚱한 Master에 물어봤을 때

```text
[7000에 접속] SET user:123 kim
→ MOVED 12893 127.0.0.1:7002       ← "그 슬롯은 7002 담당이니 거기로 가라"
```

클라이언트는 이 응답을 받으면 7002로 다시 보내고, 슬롯 배치를 기억해 둔다. Spring(Lettuce)은 이걸 자동으로 처리하므로 코드에서 신경 쓸 일이 없다. `redis-cli`는 `-c` 옵션을 붙여야 자동으로 따라간다.

### 🔴 CROSSSLOT — Cluster에서 막히는 것

**여러 키를 한 명령에 쓰려면 모두 같은 슬롯이어야 한다.** `MGET`, `MSET`, Lua 스크립트(8회차), 트랜잭션 모두 해당한다.

```text
MSET user:1:name kim user:1:age 20
→ CROSSSLOT Keys in request don't hash to the same slot
```

키에 `{ }`(해시 태그)를 넣으면 **중괄호 안만** 가지고 슬롯을 계산한다.

```text
CLUSTER KEYSLOT {user:1}:name → 10778
CLUSTER KEYSLOT {user:1}:age  → 10778
MSET {user:1}:name kim {user:1}:age 20 → OK
```

예: 8회차 선착순 쿠폰 Lua 스크립트는 `coupon:stock`, `coupon:issued` 두 키를 쓴다. Cluster에서는 `{coupon}:stock`, `{coupon}:issued`로 바꿔야 실행된다.

### 실습 결과 — Master가 죽으면

**① Replica가 있는 Master가 죽은 경우** (Master 3 + Replica 3)

```text
SET user:123 kim                  → 슬롯 12893, Master 7002에 저장
7002 SHUTDOWN

CLUSTER NODES
127.0.0.1:7002 master,fail                       ← 7002 장애로 표시
127.0.0.1:7005 master 10923-16383                ← 7002의 Replica였던 7005가 승격, 슬롯을 넘겨받음

GET user:123                      → "kim"         ← 데이터 그대로
```

Sentinel 없이 **노드들끼리** 장애를 판단하고 Replica를 승격했다.

**② Replica가 없는 Master가 죽은 경우** (Master 3, Replica 0)

```text
7002 SHUTDOWN  (15초 대기)

CLUSTER INFO           → cluster_state:fail
GET user:123           → CLUSTERDOWN The cluster is down
SET user:1 a           → CLUSTERDOWN The cluster is down    ← 살아 있는 Master 담당 키도 거부
```

슬롯 하나라도 담당자가 없으면 **클러스터 전체가 요청을 거부한다** (기본 설정 `cluster-require-full-coverage yes`). 그래서 운영에서는 **Master 3 + Replica 3**을 최소 구성으로 쓴다.

### 그 밖에 달라지는 것

| | Standalone / Sentinel | Cluster |
| --- | --- | --- |
| DB 번호 (`SELECT 1`) | 0~15 | **0번만** |
| `SCAN` | 서버 하나만 보면 됨 | **Master마다** 따로 |
| 여러 키 명령 | 자유 | 같은 슬롯끼리만 |

---

## 4. Spring 연결 — 애플리케이션은 어디에 접속하나

`StringRedisTemplate`을 쓰는 코드는 **그대로**다. 접속 설정만 바뀐다.

```yaml
# Standalone: Redis 주소를 직접
spring:
  data:
    redis:
      host: localhost
      port: 6379
```

```yaml
# Sentinel: Redis 주소가 아니라 Sentinel 주소 + 감시 그룹 이름
spring:
  data:
    redis:
      sentinel:
        master: mymaster
        nodes:
          - 10.0.0.1:26379
          - 10.0.0.2:26379
          - 10.0.0.3:26379
```

```yaml
# Cluster: 노드 몇 개만 알려 주면 나머지와 슬롯 배치는 Lettuce가 알아냄
spring:
  data:
    redis:
      cluster:
        nodes:
          - 10.0.0.1:7000
          - 10.0.0.2:7001
          - 10.0.0.3:7002
```

> 실무에서는 대부분 **AWS ElastiCache** 같은 관리형 서비스를 쓴다. Replica, 자동 승격, Cluster 구성을 클라우드가 해 주고, 개발자는 엔드포인트 주소 하나를 받는다. 그래도 장애 시 몇 초간 쓰기 실패, CROSSSLOT 같은 동작은 똑같이 겪으므로 원리를 알아야 한다.

---

## 🎯 감잡기 — 직접 Master를 죽여 보기

### A. Replication + Sentinel

```bash
cd "09회차(2026-10-30)/practice"
docker compose -p redis-ha up -d
```

```bash
docker exec redis-master redis-cli INFO replication
# role:master, connected_slaves:2

docker exec redis-master redis-cli SET user:1 kim
docker exec redis-replica-1 redis-cli GET user:1       # "kim"
docker exec redis-replica-1 redis-cli SET user:2 lee   # READONLY ...

docker exec sentinel-1 redis-cli -p 26379 SENTINEL get-master-addr-by-name mymaster
# redis-master
```

터미널을 하나 더 열어 Sentinel 로그를 띄워 둔다.

```bash
docker logs -f sentinel-1
```

원래 터미널에서 Master를 끈다.

```bash
docker stop redis-master
# 약 7초 뒤 로그에 +sdown → +odown → +switch-master

docker exec sentinel-1 redis-cli -p 26379 SENTINEL get-master-addr-by-name mymaster
# redis-replica-1 또는 redis-replica-2

docker start redis-master
docker exec redis-master redis-cli INFO replication     # role:slave ← 돌아와도 Replica
```

정리:

```bash
docker compose -p redis-ha down
```

### B. Cluster (Master 3 + Replica 3)

컨테이너 하나 안에 Redis 6개(7000~7005)를 띄운다.

```bash
docker run -d --name redis-cluster-test redis:7.4 sh -c 'for p in 7000 7001 7002 7003 7004 7005; do redis-server --port $p --cluster-enabled yes --cluster-config-file n$p.conf --cluster-node-timeout 5000 --save "" --appendonly no --daemonize yes; done; sleep infinity'

docker exec redis-cluster-test redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 --cluster-replicas 1 --cluster-yes
# [OK] All 16384 slots covered.

docker exec -it redis-cluster-test redis-cli -c -p 7000
```

| 명령 | 결과 |
| ---- | ---- |
| `CLUSTER NODES` | master 3개(슬롯 범위 표시), slave 3개 |
| `CLUSTER KEYSLOT user:123` | `12893` |
| `SET user:123 kim` | `OK` (`-c` 덕분에 담당 노드로 자동 이동) |
| `MSET user:1:name kim user:1:age 20` | `CROSSSLOT ...` |
| `MSET {user:1}:name kim {user:1}:age 20` | `OK` |

`user:123`을 가진 Master를 끄고(`CLUSTER NODES`에서 10923-16383 담당 포트 확인) 약 10초 뒤 다시 확인한다.

```bash
docker exec redis-cluster-test redis-cli -p 7002 SHUTDOWN NOSAVE
docker exec redis-cluster-test redis-cli -p 7000 CLUSTER NODES   # 7002 master,fail / Replica가 master로
docker exec redis-cluster-test redis-cli -c -p 7000 GET user:123  # "kim"
docker rm -f redis-cluster-test
```

---

## 9회차 전체 요약

| 구성 | 한 줄 | 해결 | 남는 한계 |
| ---- | ----- | ---- | --------- |
| Replication | Master의 데이터를 Replica가 비동기로 복사 | 데이터 사본, 읽기 분산 | Master가 죽으면 수동 전환 |
| Sentinel | 감시자 3대가 투표로 장애를 판단해 Replica를 자동 승격 | 자동 장애 조치, 주소 안내 | 쓰기, 용량이 Master 1대 |
| Cluster | 16384 슬롯을 Master들이 나눠 갖고, 노드끼리 자동 승격 | 용량, 쓰기 확장 + 자동 장애 조치 | 여러 키 명령은 같은 슬롯만 |

**고르는 기준**

```text
데이터가 날아가도 되는 개발용          → Standalone
데이터가 서버 1대 메모리에 들어간다     → Sentinel (Master 1 + Replica 2 + Sentinel 3)
1대로 부족하다 (용량, 쓰기량)          → Cluster (Master 3 + Replica 3 이상)
```

## 면접에서 말할 수 있는 문장

- **Replication**: "Master에 쓴 데이터를 Replica가 비동기로 복사합니다. 응답 후에 복사하기 때문에 복제 지연으로 옛날 값을 읽거나, Master 장애 시 최근 쓰기를 잃을 수 있습니다."
- **Sentinel**: "Sentinel 여러 대가 Master를 감시하다가 quorum 이상이 장애에 동의하면 리더를 뽑아 Replica를 승격합니다. 오판을 막기 위해 홀수, 최소 3대를 둡니다. 애플리케이션은 Sentinel에게 현재 Master 주소를 받기 때문에 재배포 없이 전환됩니다."
- **Cluster**: "키를 CRC16 해시로 16384개 슬롯 중 하나에 배정하고, 슬롯을 여러 Master가 나눠 가집니다. 다른 노드의 키를 요청하면 MOVED로 안내합니다. 여러 키 명령은 같은 슬롯이어야 해서 해시 태그로 묶습니다."
- **Sentinel vs Cluster**: "둘 다 자동 장애 조치를 하지만, Sentinel은 Master 1대에 모든 데이터를 두고 Cluster는 여러 Master에 나눠 저장해 용량과 쓰기를 확장합니다."

## 복습 질문

1. Replica에서 방금 쓴 값을 읽었는데 옛날 값이 나왔다. 왜인가?
2. Sentinel을 2대만 두면 어떤 문제가 생기나?
3. Sentinel 구성에서 애플리케이션 설정에 Redis Master 주소를 직접 적지 않는 이유는?
4. Cluster에서 Lua 스크립트가 `CROSSSLOT` 에러를 냈다. 어떻게 고치나?
5. Replica 없이 Master 3대로만 Cluster를 만들었다. Master 1대가 죽으면?

<details>
<summary>정답</summary>

1. 복제가 비동기라서 Master에 쓴 값이 아직 Replica에 복사되지 않았다 (복제 지연). 쓴 직후 읽어야 하는 데이터는 Master에서 읽는다.
2. 1대만 죽어도 남은 1대로는 과반수(2)를 채우지 못해 리더를 뽑을 수 없다. 자동 장애 조치가 안 된다.
3. Master가 바뀔 수 있기 때문이다. Sentinel에게 현재 Master를 물어보면 장애 후에도 설정 변경, 재배포 없이 새 Master에 붙는다.
4. 스크립트가 쓰는 키들을 해시 태그로 같은 슬롯에 묶는다. 예: `{coupon}:stock`, `{coupon}:issued`.
5. 그 Master의 슬롯을 넘겨받을 Replica가 없어 `cluster_state:fail`이 되고, 살아 있는 Master의 키까지 전부 `CLUSTERDOWN`으로 거부된다.

</details>
