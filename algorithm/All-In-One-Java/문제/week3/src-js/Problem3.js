/**
 * Problem 3: 가장 먼 노드
 * 난이도: 🔴 Lv.3
 * 주제: BFS, 다익스트라, 그래프
 *
 * 문제: 1번 노드에서 모든 다른 노드까지의 최단 거리를 구한 후,
 *      가장 먼 거리에 있는 노드의 개수를 반환하세요.
 *
 * 입력: n = 6, edge = [[3,6],[4,3],[3,2],[1,3],[1,2],[2,4],[5,2]]
 * 출력: 3
 *
 * 핵심:
 * - BFS로 각 노드까지의 최단 거리 계산
 * - 거리를 레벨별로 관리
 * - 최댓값에 해당하는 노드 개수 세기
 */

function solution(n, edge) {
  // TODO: 풀이 작성
}

// === 테스트 ===
const tests = [
  {
    input: [
      6,
      [[3, 6], [4, 3], [3, 2], [1, 3], [1, 2], [2, 4], [5, 2]],
    ],
    expected: 3,
  },
  {
    input: [4, [[1, 2], [2, 3], [3, 4]]],
    expected: 1,
  },
];

console.log("=== Problem 3: 가장 먼 노드 ===\n");

tests.forEach((t, i) => {
  const [n, edge] = t.input;
  const result = solution(n, edge);
  const ok = result === t.expected;
  console.log(`Test ${i + 1}:`);
  console.log(`  n = ${n}`);
  console.log(`  edge = [${edge.map((e) => `[${e}]`).join(", ")}]`);
  console.log(`  결과: ${result} (기대값: ${t.expected}) ${ok ? "✓" : "✗"}\n`);
});
