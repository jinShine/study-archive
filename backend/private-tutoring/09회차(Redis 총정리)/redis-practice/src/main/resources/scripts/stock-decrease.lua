-- 재고가 남아 있을 때만 1 줄인다
-- KEYS[1] = 재고 키
-- 반환: 줄인 뒤 재고, 품절이면 -1

local stock = tonumber(redis.call('GET', KEYS[1]) or '0')
if stock <= 0 then
    return -1
end
return redis.call('DECR', KEYS[1])
