/**
 * Problem 3: 섬의 둘레
 * 난이도: 🔴 Lv.3
 * 주제: 격자 탐색, 경계 계산
 *
 * 문제: 격자에서 1로 표시된 섬의 둘레를 계산하세요.
 *      (대각선은 인접하지 않음)
 *
 * 입력: grid = [[0, 1, 0],
 *              [1, 1, 1],
 *              [0, 1, 0]]
 * 출력: 12
 *
 * 핵심:
 * - 각 육지 칸마다 상하좌우 확인
 * - 물 또는 경계일 때만 둘레에 카운트
 */

function solution(grid) {
  // TODO: 풀이 작성
}

// === 테스트 ===
const tests = [
  {
    input: [
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0],
      ],
    ],
    expected: 12,
  },
  {
    input: [[[1]]],
    expected: 4,
  },
  {
    input: [
      [
        [1, 1],
        [1, 1],
      ],
    ],
    expected: 8,
  },
  {
    input: [
      [
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 1, 0, 0],
        [1, 1, 0, 0],
      ],
    ],
    expected: 16,
  },
];

console.log("=== Problem 3: 섬의 둘레 ===\n");

tests.forEach((t, i) => {
  const [grid] = t.input;
  const result = solution(grid);
  const ok = result === t.expected;
  console.log(`Test ${i + 1}:`);
  grid.forEach((row) => console.log(`  [${row}]`));
  console.log(`  결과: ${result} (기대값: ${t.expected}) ${ok ? "✓" : "✗"}\n`);
});
