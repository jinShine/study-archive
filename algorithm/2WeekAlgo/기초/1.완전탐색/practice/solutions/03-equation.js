// 문제 3. 연립방정식 (#19532) - 강의 정답 (Python → JS 변환)
//
// A·x + B·y = C
// D·x + E·y = F
// x, y는 -999 ~ 999 정수 범위에서 완전탐색.

const input = require('fs').readFileSync('/dev/stdin').toString().trim().split('\n');
const [a, b, c, d, e, f] = input[0].split(' ').map(Number);

for (let x = -999; x < 1000; x++) {
  for (let y = -999; y < 1000; y++) {
    if (a * x + b * y === c) {
      if (d * x + e * y === f) {
        console.log(`${x} ${y}`);
        break;
      }
    }
  }
}
