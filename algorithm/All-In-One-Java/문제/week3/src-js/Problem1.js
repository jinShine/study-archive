/**
 * Problem 1: 최댓값과 최솟값
 * 난이도: 🟢 Lv.1
 * 주제: 기본 알고리즘, 최댓값/최솟값
 *
 * 문제: 공백으로 구분된 숫자 문자열이 주어질 때,
 *      최댓값과 최솟값을 "최솟값 최댓값" 형식으로 반환하세요.
 *
 * 입력: "1 2 -3 0"
 * 출력: "-3 2"
 *
 * 핵심: 문자열 파싱 (split), 정렬 또는 루프로 min/max 찾기
 */

function solution(s) {
  // TODO: 풀이 작성
}

// === 테스트 ===
const tests = [
  { input: ["1 2 -3 0"], expected: "-3 2" },
  { input: ["-1 -2 -3 -4"], expected: "-4 -1" },
  { input: ["-1 -1"], expected: "-1 -1" },
  { input: ["10 20 30 40 50"], expected: "10 50" },
];

console.log("=== Problem 1: 최댓값과 최솟값 ===\n");

tests.forEach((t, i) => {
  const result = solution(...t.input);
  const ok = result === t.expected;
  console.log(
    `Test ${i + 1}: "${t.input[0]}" → "${result}" (기대값: "${t.expected}") ${ok ? "✓" : "✗"}`
  );
});
