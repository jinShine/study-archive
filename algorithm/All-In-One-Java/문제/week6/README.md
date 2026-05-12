# Week 6 (회차 3-2) — 자바 / 자바스크립트 문제 풀이 환경

> **목표**: 프로그래머스 3문제를 Java와 JavaScript로 풀이
> **실행**: 터미널에서 `./run.sh` / `./run-js.sh` 사용 (VSCode Run 버튼 ❌)

---

## 📁 디렉토리 구조

```
week6/
├── README.md
├── build.sh (Java 컴파일)
├── run.sh (Java 실행)
├── run-js.sh (JS 실행)
├── src/
│   ├── Problem1.java (평균 구하기)
│   ├── Problem2.java (올바른 괄호)
│   └── Problem3.java (디스크 컨트롤러)
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

> ⚠️ VSCode의 Run 버튼은 사용하지 말 것. Red Hat Java 확장이 week1~week6의
> 동일 클래스명(`Problem1`)을 혼동해서 다른 week의 코드를 실행할 수 있음.

---

## 📝 문제 목록

| # | 문제 | 난이도 | 주제 |
|---|------|--------|------|
| 1 | [평균 구하기](https://school.programmers.co.kr/learn/courses/30/lessons/12944) | 🟢 Lv.1 | 배열, 기본 연산 |
| 2 | [올바른 괄호](https://school.programmers.co.kr/learn/courses/30/lessons/12909) | 🟡 Lv.2 | Stack, 문자열 검증 |
| 3 | [디스크 컨트롤러](https://school.programmers.co.kr/learn/courses/30/lessons/42627) | 🔴 Lv.3 | 우선순위 큐, 스케줄링 |
