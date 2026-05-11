# 실습 환경 — 완전탐색

JavaScript(Node.js)로 백준 문제를 푸는 실습 폴더.

## 폴더 구조

```text
practice/
├── package.json       # 단축 스크립트
├── my/                # 직접 풀이 (빈 템플릿)
├── solutions/         # 강의 정답 (강의에 정답 코드가 있는 4, 5번만 포함)
└── inputs/            # 표준 입력 파일
    ├── 01.txt ~ 05.txt
```

## 실행 방법

표준 입력으로 파일을 넣어 실행한다.

```bash
# 직접 푼 코드 실행
node my/04-baseball.js < inputs/04.txt

# 강의 정답 실행
node solutions/04-baseball.js < inputs/04.txt
```

또는 npm 스크립트:

```bash
npm run p4   # my/04-baseball.js
npm run s4   # solutions/04-baseball.js
```

## 입력 처리 패턴

백준 스타일 표준 입력은 아래 한 줄로 받는다.

```js
const input = require('fs').readFileSync('/dev/stdin').toString().trim().split('\n');
```

- `input[0]`이 첫 줄, `input[1]`이 두 번째 줄...
- 공백 분리는 `input[i].split(' ').map(Number)` 패턴 활용

## 학습 흐름

1. `my/0X-*.js` 빈 템플릿을 열어 직접 풀이
2. 막히면 [../README.md](../README.md)의 "풀이 포인트" 참고
3. 정답 코드(`solutions/`)는 마지막에 비교용으로
