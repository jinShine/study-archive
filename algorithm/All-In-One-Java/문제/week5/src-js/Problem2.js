/**
 * Problem 2: 여행 경로
 * 난이도: 🟡 Lv.2
 * 주제: DFS, 경로 추적, 그래프
 *
 * 문제: 항공권 정보 tickets가 주어질 때, 모든 항공권을 정확히 한 번씩 사용하는
 *      여행 경로를 구하세요.
 *      - 항상 "ICN" 공항에서 출발
 *      - 가능한 경로가 여러 개라면 알파벳 순으로 앞서는 경로를 반환
 *      - 모든 항공권을 사용해야 함
 *
 * 입력: tickets = [["ICN","JFK"],["HND","IAD"],["JFK","HND"]]
 * 출력: ["ICN","JFK","HND","IAD"]
 *
 * 핵심:
 * - DFS로 모든 항공권 사용
 * - 방문한 간선(티켓) 추적
 * - 백트래킹으로 경로 복구
 */

function solution(tickets) {
  // TODO: 풀이 작성
  return [];
}

// === 테스트 ===
const tests = [
  {
    input: [
      [
        ["ICN", "JFK"],
        ["HND", "IAD"],
        ["JFK", "HND"],
      ],
    ],
    expected: ["ICN", "JFK", "HND", "IAD"],
  },
  {
    input: [
      [
        ["ICN", "SFO"],
        ["ICN", "ATL"],
        ["SFO", "ATL"],
        ["ATL", "ICN"],
        ["ATL", "SFO"],
      ],
    ],
    expected: ["ICN", "ATL", "ICN", "SFO", "ATL", "SFO"],
  },
  {
    input: [
      [
        ["ICN", "AAA"],
        ["ICN", "BBB"],
        ["BBB", "ICN"],
      ],
    ],
    expected: ["ICN", "BBB", "ICN", "AAA"],
  },
];

console.log("=== Problem 2: 여행 경로 ===\n");

tests.forEach((t, i) => {
  const [tickets] = t.input;
  const result = solution(tickets);
  const ok = JSON.stringify(result) === JSON.stringify(t.expected);
  console.log(`Test ${i + 1}:`);
  console.log(`  tickets = ${JSON.stringify(tickets)}`);
  console.log(`  결과: ${JSON.stringify(result)}`);
  console.log(`  기대값: ${JSON.stringify(t.expected)} ${ok ? "✓" : "✗"}\n`);
});
