// 문제 4. 숫자야구 (#2503)
// 가능한 정답 후보의 수를 구한다.
//   (1) 세 자리 숫자 만들기  → a, b, c (1~9)
//   (2) 다른 세 자리수       → a≠b, b≠c, c≠a
//   (3) 질문마다 Strike/Ball 계산
//   (4) 모든 질문 일치 시 카운트

const input = require('fs').readFileSync('/dev/stdin').toString().trim().split('\n');

const n = parseInt(input[0]);
const numbers = [];
for (let i = 1; i <= n; i++) {
  numbers.push(input[i].split(' '));
}

let answer = 0;

// TODO: 풀이 작성

console.log(answer);
