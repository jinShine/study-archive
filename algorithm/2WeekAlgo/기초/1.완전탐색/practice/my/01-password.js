// 문제 1. 비밀번호 (#1816)
// 모든 소인수가 1,000,000보다 큰 수만 적절한 비밀번호.
// YES / NO 출력.

const input = require('fs').readFileSync('/dev/stdin').toString().trim().split('\n');

const n = parseInt(input[0]);

// TODO:
// 각 테스트 케이스마다 input[i]를 BigInt로 변환하고
// 2 ~ 1,000,000 사이의 수로 나눠본다.
//   - 하나라도 나누어떨어지면 → "NO" 출력 후 break
//   - 1,000,000까지 도달했다면 → "YES" 출력

const LIMIT = 1_000_000n;

for (let i = 1; i <= n; i++) {
  const number = BigInt(input[i]);

  for (let p = 2n; p <= LIMIT; p++) {
    if (number % p === 0n) {
      console.log("NO");
      break;
    }

    if (p === LIMIT) {
      console.log("YES");
    }
  }
}