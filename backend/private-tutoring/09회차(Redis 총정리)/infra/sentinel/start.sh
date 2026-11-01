#!/bin/sh
# 10장 실습 환경: Master 1 + Replica 2 + Sentinel 3
# 실행: ./start.sh   (infra/sentinel 폴더에서)
cd "$(dirname "$0")"

# 이전 실습이 남아 있으면 지우고 새로 시작한다 (Sentinel은 이전 장애 전환 상태를 기억하기 때문)
docker compose -p redis-ha down >/dev/null 2>&1
docker compose -p redis-ha up -d >/dev/null 2>&1

# Replica 2대가 붙을 때까지 기다린다 (최대 30초)
for i in $(seq 1 30); do
  n=$(docker exec redis-master redis-cli INFO replication 2>/dev/null | grep connected_slaves | cut -d: -f2 | tr -d '\r')
  [ "$n" = "2" ] && break
  sleep 1
done
sleep 2

echo "준비 완료"
echo "Master: $(docker exec sentinel-1 redis-cli -p 26379 SENTINEL get-master-addr-by-name mymaster | head -1)"
echo "Master에 붙은 Replica 수: $n"
