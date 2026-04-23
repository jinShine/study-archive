/**
 * Problem 1: 문자열 내 p와 y의 개수
 * 난이도: 🟢 Lv.1
 * 주제: 문자열, 카운팅
 *
 * 문제: 문자열 s에서 p(또는 P)와 y(또는 Y)의 개수가 같으면 true,
 *      다르면 false를 반환하세요.
 *
 * 입력: "pPoooyY"
 * 출력: true (p가 2개, y가 2개)
 *
 * 핵심: 문자열 순회, 대소문자 처리 (toLowerCase)
 */

function solution(s) {
  // TODO: 풀이 작성
}

// === 테스트 ===
const tests = [
  { input: ["pPoooyY"], expected: true },
  { input: ["Pyy"], expected: false },
  { input: ["xzy"], expected: false },
  { input: ["pppYYYp"], expected: false },
  { input: ["PpYy"], expected: true },
];

console.log("=== Problem 1: 문자열 내 p와 y의 개수 ===\n");

tests.forEach((t, i) => {
  const result = solution(...t.input);
  const ok = result === t.expected;
  console.log(
    `Test ${i + 1}: "${t.input[0]}" → ${result} (기대값: ${t.expected}) ${ok ? "✓" : "✗"}`
  );
});
