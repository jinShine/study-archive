# 8회차(2026/10/21) 실제 수업 메모 (원본)

강사님 수업 메모를 그대로 옮겨 둔 것. 마지막 "다음시간수업"이 9회차 주제다.

```text
=====================================================
* redis distributed lock
- 핵심명령어
set nx
https://redis.io/docs/latest/commands/set/

- lock timeout
분산락을 할때는 꼭 이걸 신경써줘야한다.

* redis distributed lock 클라이언트 구현체
https://github.com/redisson/redisson

* redis pub/sub
https://www.vmware.com/topics/message-brokers

레디스를 이용해서 메시지를 전달한다.
vs) 카프카를 이용해서 메시지를 전달한다.

레디스 펍섭
- at-most-once
--> 유실가능

카프카
- at-least-once
--> 최소한번
   --> 중복가능

https://www.geeksforgeeks.org/redis-publish-subscribe/

* redis luascript
https://dev.gmarket.com/69

get abc
result = abc + 1
set abc result

이거 3개를 한방에 묶어서 실행할 수 있는 커스텀한 명령어를 만드는 방법
lua script -> 한방에 실행 -> atomic (원자성보장)
주의점: 루아스크립트 너무 오래걸리는 스크립트 작성하면 장애남

* redis pipeline
redistemplate 로 executepipeline 사용해보기

* 스프링 서버 전체 플로우

* 스프링 - 톰캣
https://ibb.co/vxKdNp5j

* 톰캣서버

===========다음시간수업===========
* redis replication

* redis sentinel

* redis cluster
```
