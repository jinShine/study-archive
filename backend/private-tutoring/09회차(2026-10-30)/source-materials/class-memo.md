# 9회차 수업 메모 원본 (2026/10/30)

수업 중 받아 적은 메모와 실습 기록을 그대로 보관한다. 정리본은 [STUDY_GUIDE.md](../STUDY_GUIDE.md).

## 수업 메모

```text
* redis replication
replica 를 만들어서 master 의 데이터를 복제(싱크)
읽기 트래픽을 분산시킬 수 있음
(마스터)장애에 대응할수도 있음
(리플리케이션 용도 2개, read scaleout vs HA)

* redis sentinel
보초
마스터 죽었나 확인(주기적)
    - 홀수
    - 3마리 5마리 (정족수)
죽으면 리플리카를 마스터로 승격
그럼 우리 자바스프링 클라잉너트 설정은? -> 레디스 센티널의 주소를 설정한다.
장애상황발생
-> -> -> -> 그 플로우를 떠올릴 수 있으면 되겠다.

* redis cluster
- 샤딩

- 샤딩전략

- 샤딩시 데이터 리밸런싱
id 샤드3개 샤드4개
1   1     1
2   2     2
3   0     3
4   1     0
5   2     1
6   0     2
그냥 쌩으로 모듈로 연산을 하면
60-80% 데이터가 옮겨가야함(리밸런싱)
그래서 데이터가 옮겨지는 양을 최소화, 그리고 부담없이 요것만 딱 옮길수?
-> 컨시스턴트 해싱

- redis cluster 샤딩전략
Hash-based Sharding(feat modulo)
hash(key) % 16384

0 - 5000 -> 0번샤드
5001 - 10000 -> 1번샤드
10001 -> 16384 -> 2번샤드

3번샤드 추가
몇몇 구간만 떼오면됨
4000-5000
5001-7000

* redis cluster 실습
docker network create redis-cluster

* redis cluster 주의점
***) 클러스터 원리를 이해하고 있으면 당연한거기도 함
get
set {a}bc
set {a}aaa
set {a}123
MGET abc, aa, bb, cc, dd
루아스크립트
```

- 강사님: 실무에서는 **Redis Cluster만** 쓴다. 그래서 Cluster를 잘 알아야 한다. 실습도 Cluster만 진행.

## 수업 중 사용한 파일 — redis-master-replica.yml

```yaml
version: "3.8"

services:
  redis-master:
    image: redis:latest
    container_name: redis-master
    ports:
      - "6379:6379"

  redis-replica:
    image: redis:latest
    container_name: redis-replica
    ports:
      - "6380:6379"
```

## Cluster 실습 터미널 기록

```text
~ » docker kill 5842 / docker kill 32ad / docker rm 32ad / docker rm 5842   (master-replica 컨테이너 정리)

~ » docker network create redis-cluster
~ » docker run -d --name redis-node-1 --net redis-cluster redis --cluster-enabled yes
~ » docker run -d --name redis-node-2 --net redis-cluster redis --cluster-enabled yes
~ » docker run -d --name redis-node-3 --net redis-cluster redis --cluster-enabled yes
~ » docker run -d --name redis-node-4 --net redis-cluster redis --cluster-enabled yes
~ » docker run -d --name redis-node-5 --net redis-cluster redis --cluster-enabled yes
~ » docker run -d --name redis-node-6 --net redis-cluster redis --cluster-enabled yes

~ » docker exec -it aca8 bash
root@aca862e79fa7:/data# redis-cli --cluster create \
  redis-node-1:6379 redis-node-2:6379 redis-node-3:6379 \
  redis-node-4:6379 redis-node-5:6379 redis-node-6:6379 \
  --cluster-replicas 1
>>> Performing hash slots allocation on 6 nodes...
Master[0] -> Slots 0 - 5460
Master[1] -> Slots 5461 - 10922
Master[2] -> Slots 10923 - 16383
Adding replica redis-node-5:6379 to redis-node-1:6379
Adding replica redis-node-6:6379 to redis-node-2:6379
Adding replica redis-node-4:6379 to redis-node-3:6379
M: 1972304890a8aadf7676f884cc6c51e4c2464133 redis-node-1:6379
   slots:[0-5460] (5461 slots) master
M: 2e7846e714799c9d76e1b31dedea36d49f625248 redis-node-2:6379
   slots:[5461-10922] (5462 slots) master
M: 1e7c070e6cc5d9029606b8b13a6e0ecc45e2cfc6 redis-node-3:6379
   slots:[10923-16383] (5461 slots) master
S: 6dec04c8ece2f958752c2455ff65c35ae116fbca redis-node-4:6379
   replicates 1e7c070e6cc5d9029606b8b13a6e0ecc45e2cfc6
S: 7e8ae8fd4b94a07f1b267e35dbee4cbaff63855a redis-node-5:6379
   replicates 1972304890a8aadf7676f884cc6c51e4c2464133
S: d9cd511d012a1da9d9101071c75a953d0dc53141 redis-node-6:6379
   replicates 2e7846e714799c9d76e1b31dedea36d49f625248
Can I set the above configuration? (type 'yes' to accept): yes
...
[OK] All nodes agree about slots configuration.
>>> Check for open slots...
>>> Check slots coverage...
[OK] All 16384 slots covered.

root@aca862e79fa7:/data# redis-cli
127.0.0.1:6379> set a 123
(error) MOVED 15495 172.23.0.4:6379
127.0.0.1:6379> set b 123
OK
127.0.0.1:6379> set c 123
(error) MOVED 7365 172.23.0.3:6379
127.0.0.1:6379> cluster nodes
d9cd511d... 172.23.0.7:6379@16379 slave 2e7846e7... 0 1793368156000 2 connected
19723048... 172.23.0.2:6379@16379 myself,master - 0 0 1 connected 0-5460
2e7846e7... 172.23.0.3:6379@16379 master - 0 1793368157000 2 connected 5461-10922
1e7c070e... 172.23.0.4:6379@16379 master - 0 1793368158854 3 connected 10923-16383
7e8ae8fd... 172.23.0.6:6379@16379 slave 19723048... 0 1793368157808 1 connected
6dec04c8... 172.23.0.5:6379@16379 slave 1e7c070e... 0 1793368157000 3 connected
127.0.0.1:6379> exit

root@aca862e79fa7:/data# redis-cli -c
127.0.0.1:6379> set c 123
-> Redirected to slot [7365] located at 172.23.0.3:6379
OK
172.23.0.3:6379> set a 123
-> Redirected to slot [15495] located at 172.23.0.4:6379
OK
172.23.0.4:6379> set b 123
-> Redirected to slot [3300] located at 172.23.0.2:6379
OK
172.23.0.2:6379> set asdfasfsadf 123
-> Redirected to slot [6963] located at 172.23.0.3:6379
OK
172.23.0.3:6379> set sdfsdf 123
-> Redirected to slot [12091] located at 172.23.0.4:6379
OK
172.23.0.4:6379> set asdfs 123123
-> Redirected to slot [759] located at 172.23.0.2:6379
OK
172.23.0.2:6379> set 123 sdf
-> Redirected to slot [5970] located at 172.23.0.3:6379
OK
172.23.0.3:6379> get 123
"sdf"

(redis-node-1 컨테이너가 강제 종료됨 → 종료 코드 137)

~ » docker exec -it 362b bash        (redis-node-2로 접속)
root@362b91424a02:/data# redis-cli
127.0.0.1:6379> cluster nodes
2e7846e7... 172.23.0.3:6379@16379 myself,master - 0 0 2 connected 5461-10922
1e7c070e... 172.23.0.4:6379@16379 master - 0 1793368696834 3 connected 10923-16383
19723048... 172.23.0.2:6379@16379 master,fail - 1793368667288 1793368660960 1 connected
6dec04c8... 172.23.0.5:6379@16379 slave 1e7c070e... 0 1793368694000 3 connected
7e8ae8fd... 172.23.0.6:6379@16379 master - 0 1793368695783 7 connected 0-5460
d9cd511d... 172.23.0.7:6379@16379 slave 2e7846e7... 0 1793368695000 2 connected
```

> 노드 ID는 앞 8자리만 남기고 줄였다.
