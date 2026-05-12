/**
 * Problem 1: 평균 구하기
 * 난이도: 🟢 Lv.1
 * 주제: 배열, 기본 연산
 *
 * 문제: 정수를 담고 있는 배열 arr의 평균값을 return하는 함수를 작성하세요.
 *
 * 입력: arr = [1, 2, 3, 4]
 * 출력: 2.5
 *
 * 핵심: 합계 구하기, 길이로 나누기
 */

function solution(arr) {
  // TODO: 풀이 작성
}

// === 테스트 ===
const tests = [
  { input: [[1, 2, 3, 4]], expected: 2.5 },
  { input: [[5, 5]], expected: 5 },
  { input: [[10]], expected: 10 },
  { input: [[-1, 0, 1]], expected: 0 },
];

console.log("=== Problem 1: 평균 구하기 ===\n");

tests.forEach((t, i) => {
  const [arr] = t.input;
  const result = solution(arr);
  const ok = result === t.expected;
  console.log(
    `Test ${i + 1}: [${arr}] → ${result} (기대값: ${t.expected}) ${ok ? "✓" : "✗"}`
  );
});
