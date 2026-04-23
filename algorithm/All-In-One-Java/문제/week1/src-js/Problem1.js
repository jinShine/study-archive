/**
 * Problem 1: 자릿수 더하기
 * 난이도: 🟢 Lv.1
 * 주제: 기본 연산
 *
 * 문제: 양의 정수 n이 주어질 때, n의 각 자릿수를 모두 더한 값을 반환하세요.
 *
 * 입력: 930211
 * 출력: 16 (9+3+0+2+1+1)
 *
 * 핵심: 숫자를 문자열로 변환하거나, 나머지 연산으로 각 자릿수 추출
 */

function solution(n) {
  // TODO: 풀이 작성
}

// === 테스트 ===
const tests = [
  { input: [930211], expected: 16 },
  { input: [12345], expected: 15 },
  { input: [100], expected: 1 },
  { input: [1], expected: 1 },
  { input: [999], expected: 27 },
];

console.log("=== Problem 1: 자릿수 더하기 ===\n");

tests.forEach((t, i) => {
  const result = solution(...t.input);
  const ok = result === t.expected;
  console.log(
    `Test ${i + 1}: input=${JSON.stringify(t.input)} → ${result} (기대값: ${t.expected}) ${ok ? "✓" : "✗"}`
  );
});
