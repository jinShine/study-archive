# Week 7 (회차 4-1) — 자바 / 자바스크립트 문제 풀이 환경

> **목표**: 프로그래머스 3문제를 Java와 JavaScript로 풀이
> **실행**: 터미널에서 `./run.sh` / `./run-js.sh` 사용 (VSCode Run 버튼 ❌)

---

## 📁 디렉토리 구조

```
week7/
├── README.md
├── build.sh (Java 컴파일)
├── run.sh (Java 실행)
├── run-js.sh (JS 실행)
├── src/
│   ├── Problem1.java (가운데 글자 가져오기)
│   ├── Problem2.java (더 맵게)
│   └── Problem3.java (정수 삼각형)
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

> ⚠️ VSCode의 Run 버튼은 사용하지 말 것. Red Hat Java 확장이 week1~week7의
> 동일 클래스명(`Problem1`)을 혼동해서 다른 week의 코드를 실행할 수 있음.

---

## 📝 문제 목록

| # | 문제 | 난이도 | 주제 |
|---|------|--------|------|
| 1 | [가운데 글자 가져오기](https://school.programmers.co.kr/learn/courses/30/lessons/12903) | 🟢 Lv.1 | 문자열 |
| 2 | [더 맵게](https://school.programmers.co.kr/learn/courses/30/lessons/42626) | 🟡 Lv.2 | 우선순위 큐, PriorityQueue |
| 3 | [정수 삼각형](https://school.programmers.co.kr/learn/courses/30/lessons/43105) | 🔴 Lv.3 | DP, 경로 최적화 |
