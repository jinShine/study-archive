/**
 * Problem 1: 없는 숫자 더하기
 * 난이도: 🟢 Lv.1
 * 주제: 배열, 집합
 *
 * 문제: 0부터 9까지의 숫자 중 numbers에 없는 숫자들의 합을 반환하세요.
 *
 * 입력: numbers = [1, 2, 3, 4, 6, 7, 8, 0]
 * 출력: 14 (5 + 9)
 *
 * 핵심: Set 사용 또는 boolean[] 플래그로 존재 여부 확인
 */

function solution(numbers) {
  // TODO: 풀이 작성
}

// === 테스트 ===
const tests = [
  { input: [[1, 2, 3, 4, 6, 7, 8, 0]], expected: 14 },
  { input: [[5, 8, 4, 0, 6, 7, 9]], expected: 6 },
  { input: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]], expected: 0 },
  { input: [[]], expected: 45 },
];

console.log("=== Problem 1: 없는 숫자 더하기 ===\n");

tests.forEach((t, i) => {
  const [numbers] = t.input;
  const result = solution(numbers);
  const ok = result === t.expected;
  console.log(
    `Test ${i + 1}: [${numbers}] → ${result} (기대값: ${t.expected}) ${ok ? "✓" : "✗"}`
  );
});
