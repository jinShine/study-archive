-- 분산 락 해제: 값이 내 토큰일 때만 지운다
-- KEYS[1] = 락 키, ARGV[1] = 내 토큰
-- 반환: 1 = 지움, 0 = 내 락이 아님 (이미 만료됐거나 남의 락)

if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
end
return 0
