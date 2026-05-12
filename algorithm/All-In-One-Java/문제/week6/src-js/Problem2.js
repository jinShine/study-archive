/**
 * Problem 2: 올바른 괄호
 * 난이도: 🟡 Lv.2
 * 주제: Stack, 문자열 검증
 *
 * 문제: '(' 또는 ')' 로만 이루어진 문자열 s가 주어질 때, 괄호가 짝이
 *      올바르게 맞으면 true, 아니면 false를 반환하세요.
 *
 * 입력: s = "()()"  →  true
 *      s = "(())()" →  true
 *      s = ")()("   →  false
 *      s = "(()("   →  false
 *
 * 핵심:
 * - Stack 또는 카운터로 괄호 개수 추적
 * - 열린 괄호는 증가, 닫힌 괄호는 감소
 * - 언제든 음수가 되면 false
 * - 마지막에 0이 아니면 false
 */

function solution(s) {
  // TODO: 풀이 작성
  return true;
}

// === 테스트 ===
const tests = [
  { input: ["()()"], expected: true },
  { input: ["(())()"], expected: true },
  { input: [")()("], expected: false },
  { input: ["(()("], expected: false },
  { input: [""], expected: true },
  { input: ["((()))"], expected: true },
];

console.log("=== Problem 2: 올바른 괄호 ===\n");

tests.forEach((t, i) => {
  const [s] = t.input;
  const result = solution(s);
  const ok = result === t.expected;
  console.log(
    `Test ${i + 1}: "${s}" → ${result} (기대값: ${t.expected}) ${ok ? "✓" : "✗"}`
  );
});
