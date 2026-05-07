/**
 * Problem 3: 외벽 점검
 * 난이도: 🔴 Lv.3
 * 주제: BFS, 조합, 완전탐색, 최적화
 *
 * 문제: 길이 n의 원형 외벽에 취약점 weak[]가 있고, 친구들의 점검 가능 거리
 *      dist[]가 주어집니다. 시계 방향으로만 이동할 때, 모든 취약점을 점검하는
 *      데 필요한 최소 친구 수를 반환하세요. (불가능하면 -1)
 *
 * 입력: n = 12, weak = [1, 5, 6, 10], dist = [2, 4, 6]
 * 출력: 2  (최소 2명이 필요)
 *
 * 핵심:
 * - 원형 배열 처리 (weak를 두 배로 펼치기)
 * - dist의 모든 순열 탐색
 * - 시작점 후보 = 각 weak 지점
 * - 최소 인원 찾기
 */

function solution(n, weak, dist) {
  // TODO: 풀이 작성
  return -1;
}

// === 테스트 ===
const tests = [
  { input: [12, [1, 5, 6, 10], [2, 4, 6]], expected: 2 },
  { input: [12, [1, 3, 4, 9, 10], [3, 5, 7]], expected: 1 },
];

console.log("=== Problem 3: 외벽 점검 ===\n");

tests.forEach((t, i) => {
  const [n, weak, dist] = t.input;
  const result = solution(n, weak, dist);
  const ok = result === t.expected;
  console.log(`Test ${i + 1}:`);
  console.log(`  n = ${n}, weak = [${weak}], dist = [${dist}]`);
  console.log(`  결과: ${result} (기대값: ${t.expected}) ${ok ? "✓" : "✗"}\n`);
});
