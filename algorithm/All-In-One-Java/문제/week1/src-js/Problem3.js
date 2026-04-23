/**
 * Problem 3: 네트워크
 * 난이도: 🔴 Lv.3
 * 주제: 그래프, DFS/BFS, 연결 컴포넌트
 *
 * 문제: 컴퓨터 n개가 있고 인접행렬 computers가 주어질 때,
 *      네트워크의 개수를 반환하세요.
 *
 * 조건:
 * - computers[i][j] = 1: i번 컴퓨터와 j번 컴퓨터가 연결됨
 * - computers[i][i] = 1: 항상 true (자기 자신과는 항상 연결)
 *
 * 입력: n = 3, computers = [[1,1,0],[1,1,0],[0,0,1]]
 * 출력: 2
 * 설명: 네트워크 2개: {0,1}, {2}
 *
 * 핵심: DFS/BFS로 연결된 컴포넌트 개수 세기, visited 배열로 중복 방지
 */

function solution(n, computers) {
  // TODO: 풀이 작성
}

// === 테스트 ===
const tests = [
  {
    input: [3, [[1, 1, 0], [1, 1, 0], [0, 0, 1]]],
    expected: 2,
  },
  {
    input: [3, [[1, 0, 0], [0, 1, 0], [0, 0, 1]]],
    expected: 3,
  },
  {
    input: [4, [[1, 1, 0, 0], [1, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 1]]],
    expected: 2,
  },
  {
    input: [4, [[1, 1, 0, 1], [1, 1, 1, 0], [0, 1, 1, 1], [1, 0, 1, 1]]],
    expected: 1,
  },
];

console.log("=== Problem 3: 네트워크 ===\n");

tests.forEach((t, i) => {
  const [n, computers] = t.input;
  const result = solution(n, computers);
  const ok = result === t.expected;
  console.log(`Test ${i + 1}:`);
  console.log(`  n = ${n}`);
  console.log(`  computers =`);
  computers.forEach((row) => console.log(`    [${row}]`));
  console.log(`  결과: ${result} (기대값: ${t.expected}) ${ok ? "✓" : "✗"}\n`);
});
