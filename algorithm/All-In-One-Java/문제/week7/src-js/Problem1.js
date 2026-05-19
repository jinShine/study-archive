/**
 * Problem 1: 가운데 글자 가져오기
 * 난이도: 🟢 Lv.1
 * 주제: 문자열
 *
 * 문제: 단어 s의 가운데 글자를 반환하세요.
 *      단어의 길이가 짝수라면 가운데 두 글자를 반환합니다.
 *
 * 입력: s = "abcde"  →  "c"
 *      s = "qwer"   →  "we"
 *
 * 핵심:
 * - 문자열 길이의 홀짝 판단
 * - substring / slice 활용 (중간 인덱스 계산)
 */

function solution(s) {
  // TODO: 풀이 작성
  return "";
}

// === 테스트 ===
const tests = [
  { input: ["abcde"], expected: "c" },
  { input: ["qwer"], expected: "we" },
  { input: ["a"], expected: "a" },
  { input: ["ab"], expected: "ab" },
  { input: ["abcdefg"], expected: "d" },
];

console.log("=== Problem 1: 가운데 글자 가져오기 ===\n");

tests.forEach((t, i) => {
  const [s] = t.input;
  const result = solution(s);
  const ok = result === t.expected;
  console.log(
    `Test ${i + 1}: "${s}" → "${result}" (기대값: "${t.expected}") ${ok ? "✓" : "✗"}`
  );
});
