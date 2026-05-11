// 문제 2. 사탕 (#14568) - 강의 정답 (Python → JS 변환)
//
// 변수: a = 택희, b = 영훈, c = 재현
// 조건:
//   - a + b + c === n   (남는 사탕 없음)
//   - c >= b + 2        (재현은 영훈보다 2개 이상)
//   - a % 2 === 0       (택희는 짝수)
//   - 1 ≤ a, b, c       (모두 1개 이상)

const input = require('fs').readFileSync('/dev/stdin').toString().trim().split('\n');

const n = parseInt(input[0]);

let answer = 0;

// 사탕 줄 모든 경우의 수
for (let a = 1; a <= n; a++) {       // 택희
  for (let b = 1; b <= n; b++) {     // 영훈
    for (let c = 1; c <= n; c++) {   // 재현
      if (a + b + c === n) {
        if (c >= b + 2) {
          if (a % 2 === 0) {
            answer += 1;
          }
        }
      }
    }
  }
}

console.log(answer);
