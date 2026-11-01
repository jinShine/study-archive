#!/bin/sh
# 11장 실습 환경 정리
docker rm -f redis-cluster-test >/dev/null 2>&1 && echo "클러스터 삭제 완료"
