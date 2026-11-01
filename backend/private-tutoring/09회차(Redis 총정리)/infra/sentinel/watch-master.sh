#!/bin/sh
# Sentinel에게 "지금 Master가 누구냐"를 1초마다 20번 물어본다
for i in $(seq 1 20); do
  echo "$i초: $(docker exec sentinel-1 redis-cli -p 26379 SENTINEL get-master-addr-by-name mymaster | head -1)"
  sleep 1
done
