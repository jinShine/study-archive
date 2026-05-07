/**
 * Problem 2: 프린터
 * 난이도: 🟡 Lv.2
 * 주제: Queue, 우선순위, 시뮬레이션
 *
 * 문제: 프린터 큐에서 중요도가 높은 문서부터 인쇄됩니다.
 *      location 위치의 문서가 몇 번째로 인쇄되는지 구하세요.
 *
 * 입력: priorities = [2, 1, 3, 2], location = 2
 * 출력: 1 (위치 2의 문서(3)가 1번째로 인쇄)
 *
 * 핵심:
 * - Queue + 우선순위 처리
 * - 각 문서의 원래 위치 추적
 */

function solution(priorities, location) {
  // TODO: 풀이 작성
}

// === 테스트 ===
const tests = [
  { input: [[2, 1, 3, 2], 2], expected: 1 },
  { input: [[1, 1, 9, 1, 1, 1], 0], expected: 5 },
  { input: [[1], 0], expected: 1 },
  { input: [[5, 4, 3, 2, 1], 4], expected: 5 },
];

console.log("=== Problem 2: 프린터 ===\n");

tests.forEach((t, i) => {
  const [priorities, location] = t.input;
  const result = solution(priorities, location);
  const ok = result === t.expected;
  console.log(`Test ${i + 1}:`);
  console.log(`  priorities = [${priorities}], location = ${location}`);
  console.log(`  결과: ${result} (기대값: ${t.expected}) ${ok ? "✓" : "✗"}\n`);
});
