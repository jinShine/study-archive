/**
 * Problem 3: 디스크 컨트롤러
 * 난이도: 🔴 Lv.3
 * 주제: 우선순위 큐, 스케줄링 (SJF)
 *
 * 문제: 하드디스크는 한 번에 하나의 작업만 수행 가능합니다.
 *      jobs[i] = [요청시각, 소요시간] 일 때, 모든 작업이 요청 시점부터
 *      종료될 때까지 걸린 시간의 평균을 가장 줄이는 처리 순서를 사용했을 때의
 *      평균 시간(소수점 버림, 정수)을 반환하세요.
 *
 * 입력: jobs = [[0, 3], [1, 9], [2, 6]]
 * 출력: 9
 *   - (0+3) + ((3-1)+9) + ((14-2)+6) → 평균 (3+11+18)/3 = 9
 *
 * 핵심:
 * - 요청시각 순으로 정렬
 * - 현재 시간까지 들어온 작업을 PriorityQueue(소요시간 짧은 순)에 넣고
 *   가장 짧은 작업부터 처리 (SJF: Shortest Job First)
 * - JS는 PriorityQueue가 기본 제공 안 됨 → 직접 구현하거나 sort로 대체
 */

function solution(jobs) {
  // TODO: 풀이 작성
  return 0;
}

// === 테스트 ===
const tests = [
  { input: [[[0, 3], [1, 9], [2, 6]]], expected: 9 },
  { input: [[[0, 10]]], expected: 10 },
  { input: [[[0, 5], [1, 1], [3, 1], [5, 1]]], expected: 2 },
  { input: [[[1, 9], [0, 3], [2, 6]]], expected: 9 }, // 정렬 안 된 입력
];

console.log("=== Problem 3: 디스크 컨트롤러 ===\n");

tests.forEach((t, i) => {
  const [jobs] = t.input;
  const result = solution(jobs);
  const ok = result === t.expected;
  console.log(`Test ${i + 1}:`);
  console.log(`  jobs = ${JSON.stringify(jobs)}`);
  console.log(`  결과: ${result} (기대값: ${t.expected}) ${ok ? "✓" : "✗"}\n`);
});
