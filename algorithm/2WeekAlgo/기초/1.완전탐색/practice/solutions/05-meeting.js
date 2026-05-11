// 문제 5. 모이기 (#1090) - 강의 정답 (Python → JS 변환)

const input = require('fs').readFileSync('/dev/stdin').toString().trim().split('\n');

const n = parseInt(input[0]);
const arr = [];
const arrY = [];
const arrX = [];
const answer = Array(n).fill(-1);

// 입력 받기
for (let i = 1; i <= n; i++) {
  const [a, b] = input[i].split(' ').map(Number);
  arr.push([a, b]);
  arrY.push(b);
  arrX.push(a);
}

// 만날 장소 정하기
for (const y of arrY) {
  for (const x of arrX) {
    const dist = [];

    // 만날 장소로 각각의 점들이 오는 비용 계산
    for (const [ex, ey] of arr) {
      dist.push(Math.abs(ex - x) + Math.abs(ey - y));
    }

    // 가까운 순으로 정렬
    dist.sort((p, q) => p - q);

    let tmp = 0;
    for (let i = 0; i < dist.length; i++) {
      tmp += dist[i];
      if (answer[i] === -1) {
        answer[i] = tmp;
      } else {
        answer[i] = Math.min(tmp, answer[i]);
      }
    }
  }
}

console.log(answer.join(' '));
