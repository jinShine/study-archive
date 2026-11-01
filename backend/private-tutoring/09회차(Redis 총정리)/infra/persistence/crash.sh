#!/bin/sh
# 9장: Redis를 "갑자기" 죽이고(정전처럼) 다시 켠다
docker kill redis-persist-test >/dev/null && docker start redis-persist-test >/dev/null
sleep 1
echo "강제 종료 후 다시 켜짐"
