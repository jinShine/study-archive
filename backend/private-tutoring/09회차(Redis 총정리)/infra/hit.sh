#!/bin/sh
# 같은 요청을 여러 번 "동시에" 보낸다 (5장, 6장)
# 사용: ./hit.sh 횟수 동시개수 METHOD URL
# 예:   ./hit.sh 100 20 POST localhost:8083/ch06/stock/naive
#       URL에 {}를 넣으면 1, 2, 3 ... 번호로 바뀐다 (예: .../coupon/user{})
count=$1; parallel=$2; method=$3; url=$4
seq "$count" | xargs -P "$parallel" -I{} curl -s -o /dev/null -X "$method" "$url"
echo "요청 ${count}번 보냄 (동시에 ${parallel}개씩): $method $url"
