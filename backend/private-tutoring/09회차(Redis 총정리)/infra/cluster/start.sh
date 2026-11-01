#!/bin/sh
# 11장 실습 환경: Redis 6대(포트 7000~7005)로 Master 3 + Replica 3 클러스터를 만든다
# 실행: ./start.sh   (infra/cluster 폴더에서)

docker rm -f redis-cluster-test >/dev/null 2>&1

# 컨테이너 1개 안에 Redis 6개를 띄운다
docker run -d --name redis-cluster-test redis:7.4 sh -c '
  for p in 7000 7001 7002 7003 7004 7005; do
    redis-server --port $p --cluster-enabled yes --cluster-config-file n$p.conf \
      --cluster-node-timeout 5000 --save "" --appendonly no --daemonize yes
  done
  sleep infinity' >/dev/null
sleep 2

# 6대를 클러스터로 묶는다 (Master마다 Replica 1대)
docker exec redis-cluster-test redis-cli --cluster create \
  127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 \
  --cluster-replicas 1 --cluster-yes >/dev/null
sleep 3

echo "클러스터 준비 완료 (포트, 역할, 맡은 슬롯)"
docker exec redis-cluster-test redis-cli -p 7000 CLUSTER NODES \
  | awk '{print $2, $3, $9}' | sed 's/@[0-9]*//; s/myself,//' | sort
