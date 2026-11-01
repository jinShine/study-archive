#!/bin/sh
# 9장: 영속성 실험용 Redis를 따로 띄운다
# 사용: ./start.sh rdb   (기본 설정: RDB만)
#       ./start.sh aof   (AOF 켜기)
docker rm -f redis-persist-test >/dev/null 2>&1
if [ "$1" = "aof" ]; then
  docker run -d --name redis-persist-test redis:7.4 redis-server --appendonly yes >/dev/null
else
  docker run -d --name redis-persist-test redis:7.4 >/dev/null
fi
sleep 1
echo "redis-persist-test 준비 완료 ($1)"
