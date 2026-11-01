-- 선착순 쿠폰 발급
-- KEYS[1] = 남은 수량 키 (coupon:stock)
-- KEYS[2] = 받은 사람 Set 키 (coupon:issued)
-- ARGV[1] = 사용자 ID
-- 반환: 1 = 발급 성공, 0 = 품절, -1 = 이미 받음

-- 1. 이미 받았나?
if redis.call('SISMEMBER', KEYS[2], ARGV[1]) == 1 then
    return -1
end

-- 2. 남았나? (키가 없으면 0으로 본다)
local stock = tonumber(redis.call('GET', KEYS[1]) or '0')
if stock <= 0 then
    return 0
end

-- 3. 차감 + 받은 사람 기록
redis.call('DECR', KEYS[1])
redis.call('SADD', KEYS[2], ARGV[1])
return 1
