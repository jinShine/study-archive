#!/bin/sh
# 4장: 메모리 상한이 2MB인 작은 Redis를 따로 띄운다 (실습용 redis-study와 별개)
# 사용: ./start.sh
docker rm -f redis-mem-test >/dev/null 2>&1
docker run -d --name redis-mem-test redis:7.4 redis-server --maxmemory 2mb --maxmemory-policy noeviction >/dev/null
sleep 1
echo "redis-mem-test 준비 완료 (maxmemory 2mb, noeviction)"
