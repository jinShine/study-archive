#!/bin/sh
# 1장: Redis를 약 5초 동안 붙잡는 명령을 보낸다 (5억 번 반복하는 Lua 스크립트)
echo "느린 명령 실행 중... (약 5초)"
docker exec redis-study redis-cli -n 1 EVAL "local i = 0 while i < 500000000 do i = i + 1 end return i" 0 >/dev/null
echo "느린 명령 끝"
