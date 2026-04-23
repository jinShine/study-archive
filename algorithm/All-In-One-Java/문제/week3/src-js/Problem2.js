/**
 * Problem 2: 게임 맵 최단거리
 * 난이도: 🟡 Lv.2
 * 주제: BFS, 격자 탐색, 최단 경로
 *
 * 문제: 2D 격자에서 1은 이동 가능, 0은 벽입니다.
 *      (0,0)에서 (n-1,m-1)까지 가는 최단 경로 길이를 구하세요.
 *      도달 불가 시 -1 반환.
 *
 * 입력: maps = [[1,0,1,1,1],
 *              [1,0,1,0,1],
 *              [1,0,1,1,1],
 *              [1,1,1,0,1],
 *              [0,0,0,0,1]]
 * 출력: 11
 *
 * 핵심:
 * - 방향 벡터 활용 (상하좌우)
 * - BFS로 격자 탐색
 * - 범위 체크 필수
 */

function solution(maps) {
  // TODO: 풀이 작성
}

// === 테스트 ===
const tests = [
  {
    input: [
      [
        [1, 0, 1, 1, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 1, 1, 1],
        [1, 1, 1, 0, 1],
        [0, 0, 0, 0, 1],
      ],
    ],
    expected: 11,
  },
  {
    input: [
      [
        [1, 0, 1, 1, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 1, 1, 1],
        [1, 1, 1, 0, 0],
        [0, 0, 0, 0, 1],
      ],
    ],
    expected: -1,
  },
];

console.log("=== Problem 2: 게임 맵 최단거리 ===\n");

tests.forEach((t, i) => {
  const [maps] = t.input;
  const result = solution(maps);
  const ok = result === t.expected;
  console.log(`Test ${i + 1}:`);
  maps.forEach((row) => console.log(`  [${row}]`));
  console.log(`  결과: ${result} (기대값: ${t.expected}) ${ok ? "✓" : "✗"}\n`);
});
