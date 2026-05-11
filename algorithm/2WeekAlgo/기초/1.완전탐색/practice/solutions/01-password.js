// 문제 1. 비밀번호 (#1816) - 강의 정답 (Python → JS 변환)
//
// 모든 소인수가 1,000,000보다 큰 수만 적절한 비밀번호.
// 2 ~ 1,000,000 사이의 수로 나눠봐서:
//   - 하나라도 나누어떨어지면 → NO
//   - 끝까지(1,000,000) 도달했다면 → YES

const input = require('fs').readFileSync('/dev/stdin').toString().trim().split('\n');

const n = parseInt(input[0]);

for (let i = 1; i <= n; i++) {
  const number = BigInt(input[i]);

  for (let p = 2n; p <= 1000000n; p++) {
    if (number % p === 0n) {
      console.log("NO");
      break;
    }

    if (p === 1000000n) {
      console.log("YES");
    }
  }
}
