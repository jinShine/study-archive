// 문제 5. 모이기 (#1090)
// k = 1..N 명이 모일 수 있는 최소 거리(맨해튼)를 출력.
// 모이는 위치 후보: 학생들의 X, Y 좌표 조합.

const input = require('fs').readFileSync('/dev/stdin').toString().trim().split('\n');

const n = parseInt(input[0]);
const arr = [];
for (let i = 1; i <= n; i++) {
  const [a, b] = input[i].split(' ').map(Number);
  arr.push([a, b]);
}

const answer = Array(n).fill(-1);

// TODO:
// 1) 후보 위치(arr_x × arr_y)를 모두 시도
// 2) 각 위치까지의 거리 배열을 정렬
// 3) 누적합으로 k명이 모이는 비용 계산 → answer[i] 최솟값 갱신

console.log(answer.join(' '));
