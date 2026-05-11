// 문제 3. 연립방정식 (#19532)
//
// A·x + B·y = C
// D·x + E·y = F
// x, y는 -999 ~ 999 정수

const input = require('fs').readFileSync('/dev/stdin').toString().trim().split('\n');
const [a, b, c, d, e, f] = input[0].split(' ').map(Number);

// TODO: x, y 2중 for문으로 -999 ~ 999 모두 시도
//       두 식 모두 만족하는 (x, y) 발견 시 출력
