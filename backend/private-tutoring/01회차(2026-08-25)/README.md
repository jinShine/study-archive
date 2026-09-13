# 1회차(2026/08/25)

## 주제

백엔드 전체 흐름과 확장 구조

## 이번 회차 핵심

클라이언트가 서버에 요청하고, 서버가 DB를 읽고 쓰는 가장 단순한 구조에서 시작해 Scale up, Scale out, APM, Primary/Replica, Sharding, Redis, Message Queue, MSA까지 큰 흐름을 잡았습니다.

## 바로가기

- 대표 학습 가이드: [STUDY_GUIDE.md](./STUDY_GUIDE.md)
- 세부 수업 정리: [01-backend-architecture.md](./notes/01-backend-architecture.md)
- Spring 실습: [practice/spring/README.md](./practice/spring/README.md)
- 원본 자료: [01-session-original.pdf](./source-materials/01-session-original.pdf)

## 자료

| 구분 | 파일 |
| --- | --- |
| 원본 PDF | [01-session-original.pdf](./source-materials/01-session-original.pdf) |
| 손그림 1 | [클라이언트-서버-DB](./assets/01-client-server-db.png) |
| 손그림 2 | [Scale up](./assets/02-scale-up.png) |
| 손그림 3 | [Scale out과 Read Replica](./assets/03-scale-out-read-replica.png) |
| 손그림 4 | [Modulo Sharding](./assets/04-sharding-modulo.png) |
| 손그림 5 | [MSA overview](./assets/05-msa-overview.png) |

## 실습 메모

1회차는 Spring 코드를 바로 작성하기보다 백엔드 시스템의 전체 흐름을 이해하는 데 초점이 있었습니다. 이후 Spring 실습을 하면서 Controller, Service, Repository, DB 접근, Redis, 메시지 큐 같은 개념이 나오면 이 회차의 큰 그림과 연결해서 다시 보면 좋습니다.
