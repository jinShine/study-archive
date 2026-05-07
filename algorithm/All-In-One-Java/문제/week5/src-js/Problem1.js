/**
 * Problem 1: 두 정수 사이의 합
 * 난이도: 🟢 Lv.1
 * 주제: 수학, 루프
 *
 * 문제: 두 정수 a, b가 주어질 때, a와 b 사이에 속한 모든 정수의 합을 반환하세요.
 *      (a == b 인 경우 a 반환, a > b 인 경우에도 동작해야 함)
 *
 * 입력: a = 3, b = 5
 * 출력: 12  (3 + 4 + 5)
 *
 * 핵심: 등차수열의 합 공식 또는 루프로 계산
 */

function solution(a, b) {
  // TODO: 풀이 작성
}

// === 테스트 ===
const tests = [
  { input: [3, 5], expected: 12 },
  { input: [3, 3], expected: 3 },
  { input: [5, 3], expected: 12 },
  { input: [-3, 3], expected: 0 },
  { input: [-5, -3], expected: -12 },
];

console.log("=== Problem 1: 두 정수 사이의 합 ===\n");

tests.forEach((t, i) => {
  const [a, b] = t.input;
  const result = solution(a, b);
  const ok = result === t.expected;
  console.log(
    `Test ${i + 1}: a=${a}, b=${b} → ${result} (기대값: ${t.expected}) ${ok ? "✓" : "✗"}`
  );
});
