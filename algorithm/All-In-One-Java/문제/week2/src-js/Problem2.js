/**
 * Problem 2: 타겟 넘버
 * 난이도: 🟡 Lv.2
 * 주제: DFS, 재귀, 모든 경로 탐색
 *
 * 문제: 배열 numbers의 각 숫자 앞에 +, - 중 하나를 선택해서
 *      target을 만드는 경우의 수를 구하세요.
 *
 * 입력: numbers = [1,1,1,1,1], target = 3
 * 출력: 5
 *
 * 핵심:
 * - 재귀로 모든 부호 조합 탐색
 * - DFS의 기본 형태
 * - 시간복잡도: O(2^n)
 */

function solution(numbers, target) {
  // TODO: 풀이 작성
}

// === 테스트 ===
const tests = [
  { input: [[1, 1, 1, 1, 1], 3], expected: 5 },
  { input: [[4, 1, 2, 1], 4], expected: 2 },
  { input: [[1, 2, 3], 0], expected: 2 },
];

console.log("=== Problem 2: 타겟 넘버 ===\n");

tests.forEach((t, i) => {
  const [numbers, target] = t.input;
  const result = solution(numbers, target);
  const ok = result === t.expected;
  console.log(
    `Test ${i + 1}: numbers=[${numbers}], target=${target} → ${result} (기대값: ${t.expected}) ${ok ? "✓" : "✗"}`
  );
});
