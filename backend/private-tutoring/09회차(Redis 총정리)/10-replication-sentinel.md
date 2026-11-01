# 10장. 고가용성 1 — Replication과 Sentinel

> **이 장을 마치면**: Redis 서버가 죽었을 때 서비스가 멈추지 않게 하는 두 단계 — **복사본 만들기**(Replication)와 **자동으로 바꾸기**(Sentinel) — 를 설명하고, 직접 서버를 죽여서 확인한다.

| 주제 | 한 줄 | 중요도 |
| ---- | ----- | ------ |
| Replication | Master의 데이터를 Replica가 자동으로 복사해 가진다 | 🟡 |
| 비동기 복제 | 복사는 응답 **뒤에** 일어난다 → 옛날 값, 유실이 생길 수 있다 | 🔴 |
| Sentinel | Master가 죽으면 Replica를 자동으로 Master로 올린다 | 🟡 |

**실습 준비물**: [infra/sentinel/](./infra/sentinel) 의 `start.sh`, `stop.sh`, `watch-master.sh`

---

## 1. 문제 — Redis 1대는 죽으면 끝

지금까지 실습한 Redis는 **1대**다. 이 1대가 꺼지면 캐시, 로그인 세션, 분산 락이 전부 멈추고 서비스도 멈춘다.

이렇게 **그것 하나가 죽으면 전체가 멈추는 지점**을 SPOF(Single Point of Failure, 단일 장애점)라고 한다. 이 장과 11장은 Redis를 여러 대로 구성해 SPOF를 없애는 방법이다.

```text
Redis 1대        죽으면 끝
   ↓ 복사본을 만든다
Replication      복사본은 있다. 하지만 Master가 죽으면 사람이 직접 바꿔야 한다
   ↓ 자동으로 바꿔 주는 감시자를 붙인다
Sentinel         Master가 죽으면 자동으로 복사본이 Master가 된다
   ↓ 데이터를 여러 Master에 나눠 담는다
Cluster          (11장)
```

## 2. Replication — 복사본 만들기

### 정의

> **Master**: 쓰기와 읽기를 받는 원본 서버
> **Replica**: Master의 데이터를 자동으로 복사해 가지는 서버. 읽기만 된다

```text
          쓰기 ──▶ Master ──복사──▶ Replica 1
                          └─복사──▶ Replica 2
```

Master에 `SET`하면 잠시 뒤 Replica에도 같은 값이 생긴다. Replica에 직접 쓰면 거절된다 (`READONLY` 에러).

### 왜 필요한가

| 목적 | 설명 |
| ---- | ---- |
| 데이터 사본 | Master 서버가 망가져도 Replica에 데이터가 남아 있다 |
| 읽기 나누기 | 읽기 요청을 Replica로 보내면 Master가 덜 바쁘다 |
| 대타 | Master가 죽으면 Replica가 대신 Master가 될 수 있다 (3절 Sentinel) |

### 🔴 비동기 복제 — 꼭 알아야 할 성질

**비동기** = 기다리지 않고 나중에 한다는 뜻. Master는 Replica에 복사가 끝났는지 **기다리지 않고** 먼저 `OK`를 응답한다.

```text
① 앱 → Master:      SET order:1 paid
② Master → 앱:      OK                  ← 여기서 앱은 "저장됐다"고 생각한다
③ Master → Replica: SET order:1 paid    ← 복사는 그다음에 (보통 1ms 이내)
```

②와 ③ 사이의 아주 짧은 틈 때문에 두 가지 일이 생길 수 있다.

| 상황 | 결과 |
| ---- | ---- |
| ② 직후 Replica에서 읽음 | 아직 복사 전이라 **옛날 값**이 나온다 (복제 지연) |
| ② 직후 ③ 전에 Master가 죽음 | Replica에는 그 값이 없다. Replica가 Master가 되면 그 쓰기는 **없던 일**이 된다 (유실) |

그래서 **절대 잃으면 안 되는 데이터(주문, 결제)의 원본은 DB에 둔다.** Redis에는 잃어도 다시 만들 수 있는 데이터를 둔다.

### 한계

Master가 죽으면 Replica는 살아 있지만 **쓰기를 받을 서버가 없다.** 사람이 Replica 하나를 Master로 바꾸고, 앱 설정의 Redis 주소를 바꿔서 다시 배포해야 한다. 새벽 3시에 죽으면 사람이 일어날 때까지 쓰기가 멈춘다.

## 3. Sentinel — 자동으로 바꿔 주는 감시자

### 정의

> **Sentinel**: Master가 살아 있는지 계속 확인하다가, 죽으면 **Replica 하나를 새 Master로 자동으로 바꿔 주는** 감시 전용 프로그램. 데이터는 저장하지 않는다

```text
Sentinel 1 ─┐
Sentinel 2 ─┼─ 감시 ──▶ Master, Replica 1, Replica 2
Sentinel 3 ─┘
```

### 하는 일

1. **감시**: Master에 계속 "살아 있니?"(PING)를 보낸다.
2. **자동 전환**: Master가 응답이 없으면 Replica 하나를 Master로 올리고, 나머지 Replica는 새 Master를 복사하게 바꾼다.
3. **주소 안내**: 앱이 "지금 Master 누구야?"라고 물으면 알려 준다. 그래서 Master가 바뀌어도 **앱 설정을 바꾸거나 다시 배포할 필요가 없다.**

### 🔴 왜 Sentinel을 3대 두나

Sentinel 1대가 "Master가 응답이 없다"고 느껴도, 실제로는 **그 Sentinel과 Master 사이 네트워크만** 끊긴 것일 수 있다. 그런데 Master를 바꿔 버리면 멀쩡한 Master를 내리는 셈이다.

그래서 **여러 대가 동의해야** 바꾼다.

```text
1. Sentinel 1대가 "응답 없다"고 판단
2. 다른 Sentinel들에게 확인 → 정해진 수(이 실습은 2대) 이상이 "응답 없다"에 동의
3. Sentinel들이 투표로 "바꾸는 작업"을 맡을 대표 1대를 뽑음 (과반수 = 3대 중 2대 이상)
4. 대표가 Replica 하나를 Master로 올림
```

3번이 과반수 투표라서 **홀수, 최소 3대**를 둔다. 2대면 1대만 죽어도 남은 1대로는 과반수(2)를 채울 수 없어 아무것도 못 한다.

### 한계

Master는 여전히 **1대**다. 데이터는 그 1대의 메모리만큼만 담을 수 있다. → 11장 Cluster

## 4. Spring 설정

코드는 그대로다. Redis 주소 대신 **Sentinel 주소**를 적는다.

```yaml
spring:
  data:
    redis:
      sentinel:
        master: mymaster        # Sentinel이 감시하는 Master 그룹 이름
        nodes:
          - 10.0.0.1:26379      # Sentinel 주소 (포트 26379)
          - 10.0.0.2:26379
          - 10.0.0.3:26379
```

앱은 Sentinel에게 현재 Master를 물어서 접속하고, Master가 바뀌면 새 Master로 다시 접속한다.

> Master가 바뀌는 **몇 초 동안은 쓰기가 실패한다.** 앱은 실패하면 다시 시도하거나 에러 응답을 주도록 만든다.
> 실무에서는 AWS ElastiCache 같은 관리형 서비스가 이 구성을 대신 해 준다. 그래도 위 두 가지(비동기 복제, 전환 중 실패)는 똑같이 겪는다.

---

## 🧪 실습 — 따라 하기

### 1단계. 환경 띄우기

```bash
cd infra/sentinel
./start.sh
```

```text
준비 완료
Master: redis-master
Master에 붙은 Replica 수: 2
```

컨테이너 6개가 떴다: `redis-master`, `redis-replica-1`, `redis-replica-2`, `sentinel-1`, `sentinel-2`, `sentinel-3`.

### 2단계. 복제 확인 — 터미널 2개

**터미널 A** (Master에 접속)

```bash
docker exec -it redis-master redis-cli
```

**터미널 B** (Replica에 접속)

```bash
docker exec -it redis-replica-1 redis-cli
```

| 터미널 | 입력 | 결과 | 확인할 것 |
| ------ | ---- | ---- | --------- |
| A | `SET user:1 kim` | `OK` | |
| B | `GET user:1` | `"kim"` | Master에 쓴 값이 Replica에 복사됐다 |
| B | `SET user:2 lee` | `(error) READONLY You can't write against a read only replica.` | Replica는 쓰기 불가 |
| A | `INFO replication` | `role:master`<br>`connected_slaves:2` | 나는 Master, Replica 2대가 붙어 있다 |

두 터미널 모두 `exit`로 나온다.

### 3단계. Master 죽이기 — 자동 전환 보기

Master를 끄고, Sentinel에게 1초마다 "지금 Master 누구야?"를 물어본다.

```bash
docker stop redis-master && ./watch-master.sh
```

```text
1초: redis-master
...
6초: redis-master          ← 아직 확인 중 (5초 동안 응답이 없어야 "죽었다"고 본다)
7초: redis-replica-1       ← Replica 1이 새 Master가 됐다 (replica-2일 수도 있다)
8초: redis-replica-1
...
```

**약 7초 만에** 사람 없이 Master가 바뀌었다.

새 Master에 데이터가 남아 있는지 확인한다.

```bash
docker exec -it redis-replica-1 redis-cli
```

| 입력 | 결과 | 확인할 것 |
| ---- | ---- | --------- |
| `GET user:1` | `"kim"` | 데이터 그대로 |
| `INFO replication` | `role:master` | 이제 이 서버가 Master |
| `SET user:2 lee` | `OK` | 아까는 거절됐던 쓰기가 된다 |

### 4단계. 죽었던 Master 다시 켜기

```bash
docker start redis-master
```

15초쯤 기다린 뒤 접속한다.

```bash
docker exec -it redis-master redis-cli
```

| 입력 | 결과 | 확인할 것 |
| ---- | ---- | --------- |
| `INFO replication` | `role:slave`<br>`master_host:redis-replica-1` | 돌아온 옛 Master는 **Replica**가 되었다 |
| `SET x 1` | `(error) READONLY ...` | Master가 둘이 되는 일은 없다 |

### 5단계. 정리

```bash
./stop.sh
```

---

## 🎯 실습 문제

**문제 1.** Replica에서 방금 쓴 값을 읽었는데 옛날 값이 나왔다. 왜일까? 어떻게 해야 할까?

<details>
<summary>정답</summary>

복제가 비동기라서, Master가 `OK`를 응답한 시점에 아직 Replica에 복사되지 않았다. 쓴 직후 다시 읽어야 하는 데이터는 Master에서 읽는다.

</details>

**문제 2.** Sentinel을 2대만 두면 어떤 문제가 생길까?

<details>
<summary>정답</summary>

1대만 죽어도 남은 1대로는 과반수(2)를 채우지 못해 Master를 바꾸지 못한다. 그래서 홀수, 최소 3대를 둔다.

</details>

**문제 3.** 3단계에서 Master가 바뀌는 7초 동안 앱이 `SET`을 보내면 어떻게 될까?

<details>
<summary>정답</summary>

실패한다. 옛 Master는 꺼져 있고, 새 Master는 아직 정해지지 않았다. 앱은 이 몇 초를 대비해 다시 시도하거나 에러를 처리해야 한다.

</details>

---

## 정리

```text
Replication = Master의 데이터를 Replica가 복사. 복사는 응답 뒤라서 옛날 값, 유실이 생길 수 있다
Sentinel    = Master가 죽으면 Replica를 자동으로 Master로. 오판을 막으려고 3대가 투표한다
전환 중     = 몇 초 동안 쓰기 실패 → 앱에서 재시도, 에러 처리
```

## 면접 한 줄

- **Replication**: Master의 데이터를 Replica가 비동기로 복사한다. 응답 후에 복사하므로 복제 지연과 장애 시 유실이 있을 수 있다.
- **Sentinel**: 여러 Sentinel이 Master를 감시하다가 일정 수 이상이 장애에 동의하면 투표로 대표를 뽑아 Replica를 승격한다. 오판 방지를 위해 홀수, 최소 3대를 둔다. 앱은 Sentinel에게 현재 Master 주소를 받는다.

다음: [11장. Cluster](./11-cluster.md)
