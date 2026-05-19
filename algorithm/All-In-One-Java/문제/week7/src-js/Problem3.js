/**
 * Problem 3: 정수 삼각형
 * 난이도: 🔴 Lv.3
 * 주제: DP, 경로 최적화
 *
 * 문제: 삼각형의 꼭대기에서 바닥까지 이어지는 경로 중,
 *      거쳐간 숫자의 합이 가장 큰 경우를 찾아 그 합을 반환하세요.
 *      아래 칸으로 이동할 때는 대각선 방향으로 한 칸 오른쪽 또는 왼쪽
 *      숫자로만 이동 가능합니다.
 *
 * 입력: triangle = [[7],[3,8],[8,1,0],[2,7,4,4],[4,5,2,6,5]]
 * 출력: 30
 *
 * 핵심:
 * - DP 점화식: dp[i][j] = triangle[i][j] + max(dp[i-1][j-1], dp[i-1][j])
 * - 또는 상향식(아래에서 위로): dp[i][j] = triangle[i][j] + max(dp[i+1][j], dp[i+1][j+1])
 * - 경계 처리: 양 끝 칸은 한쪽만 선택 가능
 */

function solution(triangle) {
  // TODO: 풀이 작성
  return 0;
}

// === 테스트 ===
const tests = [
  { input: [[[7], [3, 8], [8, 1, 0], [2, 7, 4, 4], [4, 5, 2, 6, 5]]], expected: 30 },
  { input: [[[1]]], expected: 1 },
  { input: [[[1], [2, 3]]], expected: 4 },
  { input: [[[5], [1, 9], [4, 6, 7]]], expected: 21 },
];

console.log("=== Problem 3: 정수 삼각형 ===\n");

tests.forEach((t, i) => {
  const [triangle] = t.input;
  const result = solution(triangle);
  const ok = result === t.expected;
  console.log(`Test ${i + 1}:`);
  console.log(`  triangle = ${JSON.stringify(triangle)}`);
  console.log(`  결과: ${result} (기대값: ${t.expected}) ${ok ? "✓" : "✗"}\n`);
});
