/**
 * Problem 2: 더 맵게
 * 난이도: 🟡 Lv.2
 * 주제: 우선순위 큐, Min Heap
 *
 * 문제: Leo는 모든 음식의 스코빌 지수를 K 이상으로 만들고 싶습니다.
 *      Leo는 스코빌 지수가 가장 낮은 두 개의 음식을 아래의 식으로 섞어
 *      새로운 음식을 만듭니다.
 *
 *        섞은 음식의 스코빌 지수 = 가장 맵지 않은 음식의 스코빌 지수
 *                                + (두 번째로 맵지 않은 음식의 스코빌 지수 * 2)
 *
 *      Leo는 모든 음식의 스코빌 지수가 K 이상이 될 때까지 반복하여 섞습니다.
 *      모든 음식의 스코빌 지수를 K 이상으로 만들기 위해 섞어야 하는 최소 횟수를
 *      반환하세요. 만들 수 없는 경우 -1을 반환합니다.
 *
 * 입력: scoville = [1, 2, 3, 9, 10, 12], K = 7
 * 출력: 2
 *
 * 핵심:
 * - PriorityQueue(Min Heap)로 가장 맵지 않은 두 개를 매번 꺼냄
 * - JS는 PriorityQueue가 기본 제공 안 됨 → 직접 구현하거나
 *   sort + 이진 삽입(splice) 활용 (큰 입력에서는 직접 Heap 구현 권장)
 * - 큐의 최솟값이 K 이상이 될 때까지 반복
 * - 원소가 1개 남았는데도 K 미만이면 -1
 */

function solution(scoville, K) {
  // TODO: 풀이 작성
  return 0;
}

// === 테스트 ===
const tests = [
  { input: [[1, 2, 3, 9, 10, 12], 7], expected: 2 },
  { input: [[0, 0], 7], expected: -1 },
  { input: [[1, 2, 3], 11], expected: 2 },
  { input: [[10, 10, 10, 10], 5], expected: 0 },
];

console.log("=== Problem 2: 더 맵게 ===\n");

tests.forEach((t, i) => {
  const [scoville, K] = t.input;
  const result = solution([...scoville], K);
  const ok = result === t.expected;
  console.log(`Test ${i + 1}:`);
  console.log(`  scoville = ${JSON.stringify(scoville)}, K = ${K}`);
  console.log(`  결과: ${result} (기대값: ${t.expected}) ${ok ? "✓" : "✗"}\n`);
});
