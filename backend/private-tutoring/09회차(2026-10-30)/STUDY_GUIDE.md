# 9회차(2026/10/30) — Redis를 여러 대로: Replication, Sentinel, Cluster

- 예습 자료: [PRESTUDY.md](./PRESTUDY.md)
- 수업 메모와 실습 터미널 기록 원본: [source-materials/class-memo.md](./source-materials/class-memo.md)
- 실습 파일: [practice/redis-master-replica.yml](./practice/redis-master-replica.yml) (Master + Replica), [practice/compose.yaml](./practice/compose.yaml) (Sentinel까지)
- 더 자세한 정리: [Redis 총정리 10장](<../09회차(Redis 총정리)/10-replication-sentinel.md>), [11장 Cluster](<../09회차(Redis 총정리)/11-cluster.md>)

이 문서는 **실제 수업 순서**대로 정리했다. 실습은 수업에서 친 명령 그대로 따라 칠 수 있게 표로 만들었다.

---

## 오늘의 핵심 한 문장

> **Redis 1대는 죽으면 끝이고(장애), 담을 수 있는 양도 한계가 있다(용량). 복사본을 두고(Replication), 죽으면 자동으로 교체하고(Sentinel), 데이터를 여러 대에 나눠 담는다(Cluster). 실무에서는 이 셋을 한 번에 해 주는 Cluster를 쓴다.**

## 왜 이 순서로 배웠나

7회차와 8회차는 **Redis 1대가 살아 있다**는 전제였다. 오늘은 그 전제가 깨지는 상황을 다룬다.

```text
문제 1. Redis가 죽으면 데이터도 서비스도 멈춘다
   └─▶ Replication: 복사본(Replica)을 둔다
          문제 2. Master가 죽으면 사람이 직접 Replica를 Master로 바꿔야 한다
             └─▶ Sentinel: 감시하다가 자동으로 바꿔 준다
                    문제 3. 그래도 쓰기는 Master 1대만 받는다. 메모리도 1대만큼만 쓴다
                       └─▶ Cluster: 데이터를 Master 여러 대에 나눠 담는다 (+ 자동 교체 내장)
```

| 수업 순서 | 주제 | 한 줄 | 중요도 |
| -- | ---- | ----- | ------ |
| 1 | Replication | Master 데이터를 Replica에 복사. 용도는 **읽기 분산**과 **장애 대비** | 🟡 |
| 2 | Sentinel | Master가 죽었는지 감시하고, 죽으면 Replica를 Master로 승격 | 🟡 흐름만 |
| 3 | Cluster와 샤딩 | 데이터를 나눠 담는 방법, 서버를 늘릴 때 옮기는 양 | 🔴 |
| 4 | Cluster 실습 | Docker로 Master 3 + Replica 3 만들고, MOVED, 장애 조치 확인 | 🔴 |
| 5 | Cluster 주의점 | 키 여러 개를 한 번에 쓰는 명령, 해시 태그 `{ }`, Lua | 🔴 |

---

## 1. Replication (복제)

> 자세히: [PRESTUDY 1장](./PRESTUDY.md#1-replication-복제)

### 무엇인가

- **Master** = 쓰기를 받는 원본 서버
- **Replica** = Master의 데이터를 계속 받아 똑같이 맞추는 복사본 서버 (예전 이름은 slave. `cluster nodes` 출력에는 아직 `slave`로 나온다)
- Replica는 **읽기만** 된다. 쓰면 `READONLY You can't write against a read only replica.` 에러가 난다.

### 용도 두 가지 — 수업 메모 "read scale-out vs HA"

| 용도 | 뜻 | 예 |
| ---- | -- | -- |
| **읽기 분산** (read scale-out) | 읽기 요청을 Replica들에게 나눠 보낸다. scale-out = 서버 대수를 늘려서 처리량을 늘리는 것 | 조회가 쓰기보다 훨씬 많은 서비스 |
| **장애 대비** (HA, High Availability = 고가용성) | Master가 죽어도 같은 데이터를 가진 Replica가 대신한다. 가용성 = 서비스가 멈추지 않고 쓸 수 있는 정도 | Master 서버 고장 |

### 🔴 꼭 알아야 할 특징 — 비동기 복제

Master는 쓰기를 처리하고 **바로 응답한다.** Replica에 복사하는 건 그 뒤다 (비동기 = 상대가 끝날 때까지 기다리지 않는다).

| 결과 | 이유 |
| ---- | ---- |
| 방금 쓴 값을 Replica에서 읽으면 **옛날 값**이 나올 수 있다 | 아직 복사가 안 끝났다 (복제 지연) |
| Master가 갑자기 죽으면 **복사 안 된 마지막 쓰기는 사라진다** | Replica가 받지 못한 채로 승격된다 |

### 🧪 실습 — Master + Replica

수업 때 쓴 `redis-master-replica.yml`에는 **복제 설정이 빠져 있었다.** 두 컨테이너가 떠 있어도 서로 모르는 Redis 2대일 뿐이다. Replica 쪽에 `command: redis-server --replicaof redis-master 6379` 한 줄을 넣은 파일이 [practice/redis-master-replica.yml](./practice/redis-master-replica.yml)이다.

- `--replicaof 주소 포트` = "이 주소의 Redis를 복제하라"는 설정. 같은 compose 파일 안에서는 **서비스 이름(`redis-master`)이 주소**가 된다.

**1단계. 띄우기** (`practice` 폴더에서)

```bash
docker compose -f redis-master-replica.yml up -d
```

처음 복사(전체 데이터를 한 번 통째로 보내기)에 **약 5초** 걸린다. 5초쯤 기다린다.

**2단계. 터미널 2개**

```bash
# 터미널 A — Master
docker exec -it redis-master redis-cli
```

```bash
# 터미널 B — Replica
docker exec -it redis-replica redis-cli
```

| 터미널 | 입력 | 결과 | 확인할 것 |
| ------ | ---- | ---- | --------- |
| A | `INFO replication` | `role:master`, `connected_slaves:1` | Replica 1대가 붙어 있다 |
| B | `INFO replication` | `role:slave`, `master_host:redis-master`, `master_link_status:up` | Master와 연결됨 (`down`이면 몇 초 더 기다린다) |
| A | `SET user:1 kim` | `OK` | |
| B | `GET user:1` | `"kim"` | Master에 쓴 값이 Replica에 복사됐다 |
| B | `SET user:2 lee` | `(error) READONLY You can't write against a read only replica.` | Replica는 읽기 전용 |

**3단계. 정리**

```bash
docker compose -f redis-master-replica.yml down
```

### 한계

Master가 죽으면 Replica는 **자동으로 Master가 되지 않는다.** 사람이 Replica에 `REPLICAOF NO ONE`(이제 복제 그만, 네가 Master)을 쳐야 한다. 새벽 3시에 죽으면 그때까지 쓰기가 전부 실패한다. → Sentinel

---

## 2. Sentinel (감시자)

> 자세히: [PRESTUDY 2장](./PRESTUDY.md#2-sentinel-감시자), 직접 해 보기: [Redis 총정리 10장](<../09회차(Redis 총정리)/10-replication-sentinel.md>)

**Sentinel** = 보초. Redis와 따로 떠 있는 감시 프로그램이다. 하는 일은 세 가지다.

1. Master가 살아 있는지 **주기적으로** 확인한다 (ping)
2. 죽었다고 판단하면 Replica 하나를 **Master로 승격**한다
3. 앱에게 **새 Master 주소**를 알려 준다

### 왜 3대, 5대처럼 홀수인가

Sentinel 1대만 있으면, 그 Sentinel과 Master 사이 네트워크만 끊겨도 "Master가 죽었다"고 잘못 판단한다. 그래서 여러 대가 **투표**한다.

- **quorum (정족수)** = "Master가 죽었다"고 인정하려면 몇 대가 동의해야 하는지. 3대면 보통 2
- **과반수** = 승격을 지휘할 리더 Sentinel을 뽑을 때 전체의 절반 넘게 찬성해야 한다

| Sentinel 수 | 과반수 | 몇 대까지 죽어도 되나 |
| ----------- | ------ | --------------------- |
| 3 | 2 | 1대 |
| 4 | 3 | 1대 (3대와 같다 → 1대 낭비) |
| 5 | 3 | 2대 |

짝수로 늘려도 버틸 수 있는 수가 늘지 않는다. 그래서 홀수로 둔다.

### 🔴 장애 상황 흐름 — "이 플로우를 떠올릴 수 있으면 된다"

```text
① Master가 죽는다
② Sentinel들이 ping을 보내는데 응답이 없다 (정해진 시간 동안, 예: 5초)
③ 각 Sentinel이 "내가 보기엔 죽었다"고 판단한다              ← SDOWN (주관적 다운)
④ quorum(2대) 이상이 동의한다                                 ← ODOWN (객관적 다운)
⑤ Sentinel끼리 투표해서 리더 1대를 뽑는다 (과반수)
⑥ 리더가 Replica 하나를 골라 Master로 승격한다 (REPLICAOF NO ONE)
⑦ 나머지 Replica에게 "이제 새 Master를 복제해라"라고 바꾼다
⑧ 앱(Lettuce)은 Sentinel에게 새 Master 주소를 받아 다시 접속한다
⑨ 죽었던 옛 Master가 다시 켜지면 Replica로 들어온다
```

예습 실습에서는 Master를 끄고 **약 7초** 만에 새 Master로 바뀌었다 (판단 5초 + 투표와 승격).

### Spring 설정 — 수업 질문 "그럼 클라이언트 설정은?"

Master 주소는 장애 때마다 바뀐다. 그래서 Redis 주소가 아니라 **Sentinel 주소**를 적는다.

```properties
# Sentinel이 감시하는 그룹 이름 (Sentinel 설정의 monitor 이름과 같아야 한다)
spring.data.redis.sentinel.master=mymaster
# Redis 주소가 아니라 Sentinel 주소들
spring.data.redis.sentinel.nodes=sentinel-1:26379,sentinel-2:26379,sentinel-3:26379
```

Lettuce가 Sentinel에게 "지금 Master 누구야?"를 물어서 접속한다.

### 한계

여전히 **쓰기는 Master 1대**만 받고, 데이터도 **1대 메모리만큼**만 담는다. Replica를 늘려도 전부 같은 데이터의 복사본이기 때문이다. → Cluster

---

## 3. Cluster와 샤딩

> 자세히: [PRESTUDY 3장](./PRESTUDY.md#3-cluster), [Redis 총정리 11장](<../09회차(Redis 총정리)/11-cluster.md>)

### 샤딩이란

**샤딩(Sharding)** = 데이터를 **나눠서** 여러 서버에 담는 것. 나눠진 한 조각(또는 그 조각을 맡은 서버)을 **샤드**라고 한다.

| | Replication | 샤딩 |
| --- | --- | --- |
| 각 서버가 가진 데이터 | **전부 같다** (복사본) | **서로 다르다** (나눠 가짐) |
| 늘어나는 것 | 읽기 처리량, 장애 대비 | 쓰기 처리량, **저장 용량** |

Redis Cluster는 이 둘을 같이 한다. **Master 여러 대에 나눠 담고(샤딩), 각 Master마다 Replica를 붙인다(복제).**

### 샤딩 전략 — 어떤 키를 어느 샤드에 둘까

| 전략 | 방법 | 문제 |
| ---- | ---- | ---- |
| 범위 기반 (Range) | id 1~1만은 A, 1만~2만은 B | 최근 가입자처럼 한 범위에만 요청이 몰린다 |
| **해시 기반** (Hash) | 키를 숫자로 바꾼 뒤(해시) 샤드 수로 나눈 나머지(모듈로, `%`) | 골고루 퍼진다. 대신 **샤드 수가 바뀌면** 문제가 생긴다 ↓ |

- **해시 함수** = 문자열을 정해진 규칙으로 숫자로 바꾸는 함수. 같은 입력이면 항상 같은 숫자가 나온다.
- **모듈로(%)** = 나눈 나머지. `7 % 3 = 1`

### 🔴 샤드를 늘리면 — 리밸런싱 문제

**리밸런싱** = 샤드 구성이 바뀌어서 데이터를 다른 샤드로 옮기는 것.

`id % 샤드수`로 나눴다고 하자. 샤드를 3개에서 4개로 늘리면:

| id | `id % 3` (샤드 3개) | `id % 4` (샤드 4개) | 옮겨야 하나 |
| -- | ------------------- | ------------------- | ----------- |
| 1 | 1 | 1 | 그대로 |
| 2 | 2 | 2 | 그대로 |
| 3 | 0 | 3 | **이동** |
| 4 | 1 | 0 | **이동** |
| 5 | 2 | 1 | **이동** |
| 6 | 0 | 2 | **이동** |
| … | | | |
| 12 | 0 | 0 | 그대로 |

1~12 중 그대로인 건 1, 2, 12 세 개뿐이다. **약 75%가 이동**한다 (수업 메모: 60~80%). 서비스 중에 데이터 대부분을 옮기면 그동안 서버가 매우 바빠지고, 옮기는 중인 키는 찾기 어렵다.

> 그래서 "샤드가 늘어도 **조금만** 옮기는 방법"이 필요하다.

### 해결 1 — 컨시스턴트 해싱 (Consistent Hashing)

서버와 키를 모두 해시해서 **원(링) 위의 위치**로 놓고, 키는 **시계 방향으로 가장 가까운 서버**에 둔다.

```text
            서버A
        ●         ○ 키1 → 시계 방향 다음 서버 = B
   서버C               ●  서버B
        ○ 키2 → 다음 = C
```

새 서버 D를 B와 C 사이에 넣으면, **B~D 사이에 있던 키만** D로 옮긴다. 나머지는 그대로다. 서버가 N대면 약 1/N만 옮긴다.

### 해결 2 — Redis Cluster의 방법: 해시 슬롯 16384개

Redis Cluster는 컨시스턴트 해싱이 아니라 **슬롯**을 쓴다. 목적(조금만 옮기기)은 같다.

- **슬롯** = 키를 담는 번호 붙은 칸. 0번부터 16383번까지 **16384개로 고정**이다.
- 키 → 슬롯: `CRC16(키) % 16384` (CRC16 = Redis가 쓰는 해시 함수). **서버 수로 나누지 않는다.** 그래서 서버가 늘어도 키의 슬롯 번호는 **절대 안 바뀐다.**
- 슬롯 → 서버: "0~5460번 칸은 1번 Master" 같은 **배정표**로 정한다.

```text
키 "a"  ──CRC16 % 16384──▶  슬롯 15495  ──배정표──▶  10923~16383 담당 Master
           (절대 안 바뀜)                  (이것만 바뀜)
```

샤드를 추가하면 **배정표만** 바꾼다. 기존 샤드들이 슬롯 일부를 떼어 새 샤드에 넘긴다.

| | 샤드 3개 (실습 배정) | 4번째 샤드 추가 후 (예) |
| --- | --- | --- |
| Master 1 | 0 ~ 5460 | 0 ~ 4095 |
| Master 2 | 5461 ~ 10922 | 5461 ~ 9556 |
| Master 3 | 10923 ~ 16383 | 10923 ~ 15018 |
| **Master 4 (새로)** | 없음 | 4096 ~ 5460, 9557 ~ 10922, 15019 ~ 16383 |

각 샤드가 **약 1/4씩** 떼어 준다. 옮기는 건 그 슬롯에 든 키뿐이다. 수업 메모의 "몇몇 구간만 떼오면 된다"가 이것이다.

> 🟢 실제로는 `redis-cli --cluster add-node`로 노드를 넣고 `--cluster reshard`(또는 `rebalance`)로 슬롯을 옮긴다. 명령 이름만 알아 두면 된다.

---

## 4. 🧪 Cluster 실습 — 수업에서 한 그대로

Master 3대 + Replica 3대 = 컨테이너 6개를 만든다.

### 1단계. 네트워크 만들기

```bash
docker network create redis-cluster
```

- **Docker 네트워크** = 컨테이너끼리 **이름으로** 서로를 찾을 수 있게 묶는 가상 네트워크. 이 안에서는 `redis-node-1`이 주소가 된다.

### 2단계. Redis 6대 띄우기

```bash
docker run -d --name redis-node-1 --net redis-cluster redis --cluster-enabled yes
docker run -d --name redis-node-2 --net redis-cluster redis --cluster-enabled yes
docker run -d --name redis-node-3 --net redis-cluster redis --cluster-enabled yes
docker run -d --name redis-node-4 --net redis-cluster redis --cluster-enabled yes
docker run -d --name redis-node-5 --net redis-cluster redis --cluster-enabled yes
docker run -d --name redis-node-6 --net redis-cluster redis --cluster-enabled yes
```

| 조각 | 뜻 |
| ---- | -- |
| `-d` | 백그라운드로 실행 |
| `--name redis-node-1` | 컨테이너 이름 (네트워크 안에서 주소로 쓰인다) |
| `--net redis-cluster` | 1단계 네트워크에 연결 |
| `redis` | 이미지 이름 (태그를 안 쓰면 `latest` = 최신 버전) |
| `--cluster-enabled yes` | 이 Redis를 **클러스터 모드**로 켠다. 아직 혼자일 뿐, 클러스터에 묶이지는 않았다 |

```bash
docker ps
```

`redis-node-1` ~ `redis-node-6`이 `Up`이면 된다.

### 3단계. 6대를 하나의 클러스터로 묶기

컨테이너 하나에 들어간다. `docker exec`는 **컨테이너 이름**이나 **ID 앞 몇 글자**를 받는다. 이름이 헷갈리지 않는다.

```bash
docker exec -it redis-node-1 bash
```

- `bash`를 `bahs`로 잘못 치면 `executable file not found`가 난다. 수업 때 한 번 겪은 것.
- `docker exec -it redis-node-1`처럼 **실행할 명령을 빼먹으면** `requires at least 2 arguments` 에러가 난다.

컨테이너 안에서:

```bash
redis-cli --cluster create \
  redis-node-1:6379 redis-node-2:6379 redis-node-3:6379 \
  redis-node-4:6379 redis-node-5:6379 redis-node-6:6379 \
  --cluster-replicas 1
```

- `--cluster create 주소들` = 이 Redis들을 묶어서 클러스터를 만든다
- `--cluster-replicas 1` = **Master 1대마다 Replica 1대**. 6대 ÷ 2 = Master 3 + Replica 3

물어보면 `yes`를 친다. 출력 읽는 법:

| 출력 | 뜻 |
| ---- | -- |
| `Master[0] -> Slots 0 - 5460` | 첫 번째 Master가 슬롯 0~5460번을 맡는다 (16384 ÷ 3 ≈ 5461개씩) |
| `Adding replica redis-node-5:6379 to redis-node-1:6379` | node-5는 node-1의 Replica |
| `M: 1972304890a8...` | **M** = Master. 긴 16진수는 **노드 ID** (노드마다 붙는 고유 이름) |
| `S: 7e8ae8fd...` / `replicates 19723048...` | **S** = slave(Replica). 그 노드 ID의 Master를 복제한다 |
| `[OK] All 16384 slots covered.` | 16384개 슬롯이 전부 어느 Master에 배정됐다 = 완성 |

이번 실습의 배치:

| Master | 맡은 슬롯 | 그 Master의 Replica |
| ------ | --------- | ------------------- |
| node-1 (172.23.0.2) | 0 ~ 5460 | node-5 (172.23.0.6) |
| node-2 (172.23.0.3) | 5461 ~ 10922 | node-6 (172.23.0.7) |
| node-3 (172.23.0.4) | 10923 ~ 16383 | node-4 (172.23.0.5) |

> 172.23.0.x는 Docker 네트워크 안에서 각 컨테이너가 받은 IP다. 실행할 때마다 달라질 수 있다.

### 4단계. MOVED 보기 — `-c` 없이 접속

```bash
redis-cli
```

이렇게 접속하면 **node-1(슬롯 0~5460)에만** 붙는다.

| 입력 | 결과 | 확인할 것 |
| ---- | ---- | --------- |
| `SET a 123` | `(error) MOVED 15495 172.23.0.4:6379` | `a`는 슬롯 15495번. 그건 node-3(172.23.0.4) 담당이니 **거기로 가라** |
| `SET b 123` | `OK` | `b`는 슬롯 3300번 = node-1 담당. 내가 접속한 곳이 맞아서 바로 저장 |
| `SET c 123` | `(error) MOVED 7365 172.23.0.3:6379` | 슬롯 7365번 = node-2 담당 |
| `CLUSTER KEYSLOT a` | `(integer) 15495` | 키의 슬롯 번호를 직접 확인하는 명령 |
| `exit` | | |

- **MOVED** = "그 키는 내 담당이 아니다. 이 서버로 가라"는 안내. Redis가 대신 가져다주지 않는다. **클라이언트가 다시 보내야** 한다.

### 5단계. `-c`로 접속 — 자동으로 따라가기

```bash
redis-cli -c
```

- `-c` = cluster 모드. MOVED를 받으면 **알아서 그 서버로 다시 보낸다.**

| 입력 | 결과 | 확인할 것 |
| ---- | ---- | --------- |
| `SET c 123` | `-> Redirected to slot [7365] located at 172.23.0.3:6379` `OK` | 자동으로 node-2로 옮겨 가서 저장. **프롬프트가 `172.23.0.3:6379>`로 바뀐다** |
| `SET a 123` | `-> Redirected to slot [15495] located at 172.23.0.4:6379` `OK` | 이번엔 node-3으로 |
| `SET b 123` | `-> Redirected to slot [3300] located at 172.23.0.2:6379` `OK` | node-1로 |
| `SET 123 sdf` | `-> Redirected to slot [5970] located at 172.23.0.3:6379` `OK` | 숫자도 키다. 슬롯 5970 = node-2 |
| `GET 123` | `"sdf"` | 이미 node-2에 있어서 이동 없이 바로 |

키마다 **다른 Master**에 저장된다. 이게 샤딩이다. Spring(Lettuce)도 `-c`처럼 MOVED를 따라간다. 게다가 슬롯 배정표를 미리 받아 두고 처음부터 맞는 서버로 보낸다.

### 6단계. `CLUSTER NODES` 읽기

| 입력 |
| ---- |
| `CLUSTER NODES` |

```text
19723048... 172.23.0.2:6379@16379 myself,master - 0 0 1 connected 0-5460
7e8ae8fd... 172.23.0.6:6379@16379 slave 19723048... 0 1793368157808 1 connected
```

| 칸 | 예 | 뜻 |
| -- | -- | -- |
| 1 | `19723048...` | 노드 ID |
| 2 | `172.23.0.2:6379@16379` | 주소:포트. **`@16379`** = 노드끼리 서로 살았는지 확인하고 정보를 주고받는 전용 포트 (클러스터 버스, 포트 + 10000) |
| 3 | `myself,master` | 역할. `myself` = 지금 접속한 노드, `master` / `slave` |
| 4 | `-` 또는 `19723048...` | Replica면 **복제하는 Master의 ID**, Master면 `-` |
| 5, 6 | `0 1793368157808` | 마지막으로 확인 신호를 보낸 시각, 받은 시각 (밀리초). 신경 안 써도 된다 |
| 7 | `1` | config epoch. 설정 버전 번호. **승격이 일어나면 커진다** |
| 8 | `connected` | 연결 상태 |
| 9 | `0-5460` | 맡은 슬롯 (Master만) |

### 7단계. 🔴 Master 하나 죽이기

**다른 터미널(컨테이너 밖)** 에서 node-1(슬롯 0~5460의 Master)을 강제 종료한다.

```bash
docker kill redis-node-1
```

node-1 안에 접속해 있던 터미널은 끊긴다 (종료 코드 137 = 강제 종료됨). 살아 있는 node-2로 접속한다.

```bash
docker exec -it redis-node-2 redis-cli
```

`CLUSTER NODES`를 몇 초 간격으로 쳐 본다. 직접 다시 해 봤을 때의 변화:

| 죽인 뒤 | node-1 줄 | node-5 줄 | 뜻 |
| ------- | --------- | --------- | -- |
| 0 ~ 15초 | `master` | `slave` | 아직 모른다. 응답이 없어도 **15초**(기본 대기 시간)는 기다린다 |
| 약 18초 | `master,fail?` | `slave` | **fail?** = 한 노드가 "죽은 것 같다"고 의심 |
| 약 20초 | `master,fail` (슬롯 없음) | **`master` … `0-5460`**, epoch **7** | **fail** = Master 과반수가 동의 → node-5가 **스스로 승격** |

수업 기록의 마지막 출력이 바로 이 상태다.

```text
19723048... 172.23.0.2:6379@16379 master,fail - ... 1 connected          ← 죽은 node-1, 슬롯 없음
7e8ae8fd... 172.23.0.6:6379@16379 master - 0 ... 7 connected 0-5460      ← node-5가 승격, epoch 7
```

| 확인 (node-2에서 `redis-cli -c`) | 결과 | 확인할 것 |
| --------------------------------- | ---- | --------- |
| `GET b` | `-> Redirected to slot [3300] located at 172.23.0.6:6379` `"123"` | node-1에 있던 데이터를 **node-5가 이어서** 준다 |

> **Sentinel이 없다.** Cluster는 노드끼리 서로 감시하고(16379 포트), 투표하고, Replica가 스스로 승격한다. Sentinel이 하던 일이 **내장**되어 있다.

**8단계. 죽은 노드 다시 켜기**

```bash
docker start redis-node-1
```

`CLUSTER NODES`에서 node-1이 이제 `slave`로 나온다. 옛 Master는 **새 Master(node-5)의 Replica**로 돌아온다.

### 9단계. 정리

```bash
docker rm -f redis-node-1 redis-node-2 redis-node-3 redis-node-4 redis-node-5 redis-node-6
docker network rm redis-cluster
```

> ⚠️ Replica 없이 Master 3대로만 만들면, 하나만 죽어도 그 슬롯을 받아 줄 노드가 없다. 그러면 **클러스터 전체가** `CLUSTERDOWN` 에러로 멈춘다 (기본 설정이 "슬롯이 하나라도 비면 전체 중단"). 그래서 Master마다 Replica를 붙인다.

---

## 5. 🔴 Cluster 주의점 — 키 여러 개를 한 번에

> "클러스터 원리를 이해하고 있으면 당연한 것" — 키마다 사는 서버가 다를 수 있다.

### 규칙

명령 하나에 **키가 여러 개** 들어가면, 그 키들은 **같은 슬롯**이어야 한다. 아니면 `CROSSSLOT` 에러가 난다.

- 같은 **서버**가 아니라 같은 **슬롯**이다. 같은 Master에 있어도 슬롯이 다르면 에러다.
- 이유: Redis는 명령 하나를 **서버 한 대에서** 처리한다. 서버를 넘나들며 한 번에 처리하는 기능이 없다. 그리고 슬롯은 나중에 다른 서버로 옮겨질 수 있으니 슬롯 기준으로 막는다.

| 명령 (`redis-cli -c`) | 결과 | 이유 |
| --------------------- | ---- | ---- |
| `GET a` | 된다 | 키 1개 |
| `MGET a b` | `(error) CROSSSLOT Keys in request don't hash to the same slot` | a=15495, b=3300 |
| `MSET user:1:name kim user:1:age 20` | CROSSSLOT | 이름은 비슷해도 슬롯은 12440, 13180 |
| Lua: `EVAL "..." 2 a b` | CROSSSLOT | Lua에 넘기는 키도 같은 슬롯이어야 한다 |

해당되는 것: `MGET`, `MSET`, `DEL k1 k2`, Lua 스크립트, `MULTI`/`EXEC` 트랜잭션, `RENAME` 등.

### 해결 — 해시 태그 `{ }`

키에 `{ }`가 있으면 **`{ }` 안의 글자만** 슬롯 계산에 쓴다.

| 키 | 슬롯 계산에 쓰는 글자 | 슬롯 |
| -- | --------------------- | ---- |
| `{user:1}:name` | `user:1` | 10778 |
| `{user:1}:age` | `user:1` | 10778 |
| `{a}bc`, `{a}aaa`, `{a}123` | `a` | 전부 15495 |

| 입력 (`redis-cli -c`) | 결과 |
| --------------------- | ---- |
| `MSET {user:1}:name kim {user:1}:age 20` | `OK` |
| `MGET {user:1}:name {user:1}:age` | `1) "kim"` `2) "20"` |

수업 예제 `set {a}bc`, `set {a}aaa`, `set {a}123`가 이것이다. 셋 다 같은 슬롯이라 `MGET {a}bc {a}aaa {a}123`이 된다.

### ⚠️ 해시 태그를 남발하면

같은 태그를 단 키는 **전부 한 슬롯 = 한 서버**에 몰린다. `{shop}:...`처럼 모든 키에 같은 태그를 달면 샤딩한 의미가 없어진다. **함께 쓰는 키끼리만**(한 사용자, 한 주문) 묶는다.

> 6장 선착순 쿠폰 Lua(`coupon:stock`, `coupon:issued` 두 키 사용)를 Cluster로 옮기면 CROSSSLOT이 난다. `{coupon}:stock`, `{coupon}:issued`로 바꿔야 한다. → [Redis 총정리 11장 4절](<../09회차(Redis 총정리)/11-cluster.md>)

### 그 밖에

- **DB 번호가 0번 하나뿐이다.** `SELECT 1`을 못 쓴다.
- `KEYS`, `SCAN`은 **접속한 노드 1대**의 키만 본다.

---

## 6. 실무에서는 무엇을 쓰나 — 직접 만드나, AWS인가

### 대부분은 클라우드 관리형 서비스

오늘처럼 컨테이너 6개를 직접 띄우고 묶는 건 **원리를 배우는 실습**이다. 실무에서 서버를 직접 관리하면 장애 대응, 버전 업그레이드, 백업, 노드 추가를 전부 우리가 해야 한다. 그래서 보통 **관리형 서비스**를 쓴다. 관리형 = 설치, 감시, 장애 조치, 백업을 클라우드 회사가 대신 해 주는 서비스다.

| 클라우드 | 서비스 |
| -------- | ------ |
| **AWS** | **ElastiCache** (가장 흔하다), MemoryDB (데이터를 잃으면 안 될 때) |
| Google Cloud | Memorystore |
| Azure | Azure Cache for Redis |
| Redis 회사 | Redis Cloud |

직접 운영하는 경우도 있다. Kubernetes(컨테이너 운영 플랫폼) 위에 띄우거나, 비용이나 사내 규정 때문이다. 이때도 오늘 배운 구조와 명령을 그대로 쓴다.

### AWS ElastiCache에서 고르는 것

콘솔에서 만들 때 **"클러스터 모드"** 를 고른다.

| 선택 | 구조 | 오늘 배운 것 중 |
| ---- | ---- | --------------- |
| 클러스터 모드 **비활성화** | Primary(=Master) 1대 + Replica 여러 대. 장애 조치는 AWS가 해 준다 | Replication + Sentinel 역할 |
| 클러스터 모드 **활성화** | 샤드 여러 개 × (Primary + Replica) | **Redis Cluster** |

- 데이터가 늘어날 것을 생각하면 처음부터 **클러스터 모드 활성화**를 고르는 곳이 많다. 강사님이 "실무는 Cluster만 쓴다"고 한 이유다.
- ElastiCache에서는 Sentinel을 직접 띄우지 않는다. 그 역할은 AWS가 대신한다.
- 엔진으로 Redis OSS와 **Valkey** 중 고른다. Valkey는 2024년 Redis 라이선스가 바뀌었을 때 갈라져 나온 Redis 호환 엔진이다. 명령도 Spring 설정도 같다.

### Spring 설정 — Cluster

```properties
# 노드 몇 개만 적어도 된다. Lettuce가 접속해서 나머지 노드와 슬롯 배정표를 알아낸다
spring.data.redis.cluster.nodes=redis-node-1:6379,redis-node-2:6379,redis-node-3:6379
```

ElastiCache 클러스터 모드면 AWS가 주는 **구성 엔드포인트** 주소 하나를 여기에 적는다. 구성 엔드포인트 = 클러스터 전체를 대표하는 접속 주소다.

| 구성 | Spring 설정 |
| ---- | ----------- |
| Redis 1대 | `spring.data.redis.host`, `port` |
| Sentinel | `spring.data.redis.sentinel.master`, `sentinel.nodes` |
| **Cluster** | `spring.data.redis.cluster.nodes` |

코드(`StringRedisTemplate`, `@Cacheable`)는 **바꿀 게 없다.** 설정만 바꾸면 된다. 단, 5절의 CROSSSLOT 규칙은 코드에서 지켜야 한다.

> 🟢 오늘 실습한 클러스터는 Docker 내부 IP(172.23.0.x)로 서로를 알리기 때문에, Mac에서 실행한 Spring 앱은 그 주소로 접속하지 못한다. 앱까지 연결하려면 노드가 밖에서 보이는 주소를 알리게 하는 추가 설정(`cluster-announce-ip` 등)이 필요하다.

---

## Redis 과정 전체 흐름 (7~9회차)

| 회차 | 질문 | 답 |
| ---- | ---- | -- |
| 7회차 | DB가 느리다. 어떻게 빠르게? | **캐시.** 메모리에 두는 Redis, 자료구조, 캐싱 전략, Spring Cache |
| 8회차 | 서버가 여러 대다. 어떻게 같이 일하나? | Redis를 **공용 저장소**로: 분산 락, Lua, Pipeline, Pub/Sub |
| 9회차 | 그 Redis가 죽거나 꽉 차면? | **Redis도 여러 대로**: Replication → Sentinel → **Cluster** |

처음부터 순서대로 다시 공부하려면 [Redis 총정리 README](<../09회차(Redis 총정리)/README.md>)를 따라간다 (0~11장, 실습 포함).

## 실무에서 조심할 점

- Replica에서 읽으면 **방금 쓴 값이 안 보일 수 있다** (비동기 복제). "쓰고 바로 읽기"는 Master에서 한다.
- Master가 갑자기 죽으면 **마지막 몇 개의 쓰기는 잃을 수 있다.** 절대 잃으면 안 되는 데이터는 DB에 둔다.
- Cluster에서는 키 여러 개를 쓰는 명령(MGET, Lua, 트랜잭션)에 **해시 태그**를 붙여 같은 슬롯으로 모은다. 단, 모든 키에 같은 태그는 금지.
- 장애 조치에는 **수 초~20초** 걸린다. 그동안 그 슬롯의 요청은 실패한다. 앱은 Redis 에러가 나도 죽지 않게 처리한다.
- 실무에서는 대부분 **관리형 서비스**(AWS ElastiCache 등)를 쓰지만, 구조와 CROSSSLOT 규칙은 똑같이 적용된다.

## 면접에서 말할 수 있는 문장

- **Replication**: "Master의 데이터를 Replica에 비동기로 복제합니다. 읽기를 분산하고 장애에 대비하는 용도이고, 비동기라서 복제 지연과 장애 시 일부 쓰기 유실이 있을 수 있습니다."
- **Sentinel**: "Sentinel 여러 대가 Master를 감시하다가 quorum 이상이 장애에 동의하면 리더를 뽑아 Replica를 Master로 승격하고, 클라이언트에게 새 Master 주소를 알려 줍니다. 과반수 투표를 위해 홀수로 둡니다."
- **샤딩과 리밸런싱**: "단순 모듈로 샤딩은 샤드 수가 바뀌면 대부분의 키가 이동합니다. 컨시스턴트 해싱이나 Redis Cluster의 해시 슬롯은 일부 구간만 옮기도록 해서 이동량을 줄입니다."
- **Redis Cluster**: "키를 CRC16 % 16384로 슬롯에 매핑하고 슬롯을 Master들에 나눠 배정합니다. 노드를 추가하면 슬롯만 옮기면 됩니다. 각 Master에 Replica를 두면 장애 시 Replica가 자동 승격됩니다."
- **CROSSSLOT**: "다중 키 명령과 Lua는 모든 키가 같은 슬롯이어야 해서, 함께 쓰는 키에 해시 태그 `{}`를 붙여 같은 슬롯으로 모읍니다."

## 복습 질문

1. Replication의 용도 두 가지는?
2. Replica에 `SET`을 하면 어떻게 되나? 수업 때 쓴 `redis-master-replica.yml`에서 Replica에 `SET`을 하면 왜 성공했을까?
3. Sentinel을 4대가 아니라 3대나 5대로 두는 이유는?
4. 샤드를 3개에서 4개로 늘릴 때, `id % 샤드수` 방식은 무엇이 문제인가? Redis Cluster는 어떻게 피하나?
5. `-c` 없이 `redis-cli`로 `SET a 123`을 쳤더니 `MOVED 15495 172.23.0.4:6379`가 나왔다. 무슨 뜻인가? `SET b 123`은 왜 그냥 `OK`였나?
6. 실습에서 node-1을 죽인 뒤 슬롯 0~5460은 누가 맡았나? 그 뒤 node-1을 다시 켜면?
7. `MGET user:1:name user:1:age`가 Cluster에서 실패하는 이유와 해결 방법은?
8. Spring 앱을 Redis 1대 → Cluster로 바꾸면 무엇을 바꿔야 하나?

<details>
<summary>정답</summary>

1. 읽기 분산(read scale-out)과 장애 대비(HA).
2. `READONLY` 에러가 난다. 수업 때 파일에는 `--replicaof` 설정이 없어서, 이름만 replica인 **독립된 Master**였기 때문이다 (`INFO replication`에서 `role:master`).
3. 승격을 지휘할 리더를 과반수로 뽑는다. 3대도 4대도 1대까지만 죽어도 버티므로 4대는 1대가 낭비다. 5대면 2대까지 버틴다.
4. 키의 약 75%가 다른 샤드로 옮겨야 한다. Redis Cluster는 키 → 슬롯(16384개 고정)은 그대로 두고, 슬롯 → 서버 배정표만 바꿔 일부 슬롯만 옮긴다.
5. `a`의 슬롯은 15495번이고 그 슬롯은 172.23.0.4(node-3) 담당이니 거기로 가라는 안내. `b`는 슬롯 3300번이라 접속한 node-1(0~5460) 담당이어서 바로 저장됐다.
6. node-1의 Replica였던 node-5가 약 20초 뒤 Master로 승격되어 맡았다 (epoch 7). node-1을 다시 켜면 node-5의 Replica가 된다.
7. 두 키의 슬롯이 다르다(12440, 13180). `{user:1}:name`, `{user:1}:age`처럼 해시 태그로 같은 슬롯에 모은다.
8. 설정만 `spring.data.redis.cluster.nodes`로 바꾼다. 코드는 그대로지만, 다중 키 명령과 Lua의 키에는 해시 태그를 붙여야 한다.

</details>

## Redis 마무리

오늘로 Redis 수업이 끝났다. 남은 것:

- [ ] 4절 Cluster 실습을 처음부터 혼자 다시 쳐 보기 (네트워크 → 6대 → create → MOVED → kill → 정리)
- [ ] 1절 Master + Replica 실습 (수정한 yml)
- [ ] [Redis 총정리](<../09회차(Redis 총정리)/README.md>) 0장부터 순서대로 복습
