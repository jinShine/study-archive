# Week 3 (회차 2-1) — 자바 / 자바스크립트 문제 풀이 환경

> **목표**: 프로그래머스 3문제를 Java와 JavaScript로 풀이
> **실행**: 터미널에서 `./run.sh` / `./run-js.sh` 사용 (VSCode Run 버튼 ❌)

---

## 📁 디렉토리 구조

```
week3/
├── README.md
├── build.sh (Java 컴파일)
├── run.sh (Java 실행)
├── run-js.sh (JS 실행)
├── src/
│   ├── Problem1.java (최댓값과 최솟값)
│   ├── Problem2.java (게임 맵 최단거리)
│   └── Problem3.java (가장 먼 노드)
└── src-js/
    ├── Problem1.js
    ├── Problem2.js
    └── Problem3.js
```

---

## 🚀 사용 방법

### Java

```bash
./build.sh
./run.sh Problem1
```

### JavaScript

```bash
./run-js.sh Problem1
```

> ⚠️ VSCode의 Run 버튼은 사용하지 말 것. Red Hat Java 확장이 week1/week2/week3의
> 동일 클래스명(`Problem1`)을 혼동해서 다른 week의 코드를 실행할 수 있음.

---

## 📝 문제 목록

| # | 문제 | 난이도 | 주제 |
|---|------|--------|------|
| 1 | [최댓값과 최솟값](https://school.programmers.co.kr/learn/courses/30/lessons/12939) | 🟢 Lv.1 | 문자열 파싱, min/max |
| 2 | [게임 맵 최단거리](https://school.programmers.co.kr/learn/courses/30/lessons/1844) | 🟡 Lv.2 | BFS, 격자 탐색 |
| 3 | [가장 먼 노드](https://school.programmers.co.kr/learn/courses/30/lessons/49189) | 🔴 Lv.3 | BFS, 다익스트라, 그래프 |
