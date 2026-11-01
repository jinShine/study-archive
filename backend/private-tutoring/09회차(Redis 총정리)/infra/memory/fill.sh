#!/bin/sh
# 4장: redis-mem-test에 1KB짜리 값을 N개 넣고, 결과를 세어 보여 준다
# 사용: ./fill.sh 개수 키이름    예) ./fill.sh 3000 key
count=$1; prefix=$2
docker exec redis-mem-test sh -c "v=\$(head -c 1000 /dev/zero | tr '\\0' x); for i in \$(seq 1 $count); do echo \"SET $prefix:\$i \$v\"; done | redis-cli" \
  | grep -v '^$' | sort | uniq -c
