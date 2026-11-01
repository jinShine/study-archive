#!/bin/sh
# 10장 실습 환경 정리
cd "$(dirname "$0")"
docker compose -p redis-ha down >/dev/null 2>&1 && echo "삭제 완료"
