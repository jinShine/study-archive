// 문제 2. 사탕 (#14568)
//
// 변수: a = 택희, b = 영훈, c = 재현
// 조건:
//   - a + b + c === n
//   - c >= b + 2
//   - a % 2 === 0
//   - 1 ≤ a, b, c

const input = require('fs').readFileSync('/dev/stdin').toString().trim().split('\n');

const n = parseInt(input[0]);

let answer = 0;

for (let a = 1; a <= n; a++) {
    for (let b = 1; b <= n; b++) {
        for (let c = 1; c <= n; c++) {
            if ((a + b + c === n) && (a >= b + 2) && ((a !== 0) && (b !== 0) && (c !== 0)) && (a % 2 === 0)) {
                answer++;
            }
        }
    }
}

console.log(answer);
