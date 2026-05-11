// 문제 4. 숫자야구 (#2503) - 강의 정답 (Python → JS 변환)

const input = require('fs').readFileSync('/dev/stdin').toString().trim().split('\n');

const n = parseInt(input[0]);
const numbers = [];
for (let i = 1; i <= n; i++) {
  numbers.push(input[i].split(' '));
}

let answer = 0;

// (1) 세 자리 숫자 만들기
for (let a = 1; a <= 9; a++) {       // 100의 자리
  for (let b = 1; b <= 9; b++) {     // 10의 자리
    for (let c = 1; c <= 9; c++) {   // 1의 자리
      // (2) 다른 세 자리수
      if (a === b || b === c || c === a) continue;

      let counter = 0;

      // (3) 질문 배열 순회하며 조건 확인
      for (const arr of numbers) {
        const check = arr[0].split('').map(Number); // [1, 2, 3]
        const strike = parseInt(arr[1]);
        const ball = parseInt(arr[2]);

        let strikeCount = 0;
        let ballCount = 0;

        // 스트라이크 계산
        if (a === check[0]) strikeCount++;
        if (b === check[1]) strikeCount++;
        if (c === check[2]) strikeCount++;

        // 볼 계산
        if (a === check[1] || a === check[2]) ballCount++;
        if (b === check[0] || b === check[2]) ballCount++;
        if (c === check[0] || c === check[1]) ballCount++;

        // (4) 매칭 여부 확인
        if (strike !== strikeCount) break;
        if (ball !== ballCount) break;

        counter++;
      }

      if (counter === n) answer++;
    }
  }
}

console.log(answer);
