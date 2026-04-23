/**
 * Problem 2: 구명보트
 * 난이도: 🟡 Lv.2
 * 주제: 그리디, 정렬, 투 포인터
 *
 * 문제: 사람들의 몸무게와 보트 무게 제한이 주어질 때,
 *      모두를 구출하는데 필요한 최소 보트 수를 구하세요.
 *
 * 조건:
 * - 각 보트에는 최대 2명씩 탈 수 있음
 * - 보트의 무게 제한을 초과하면 안됨
 *
 * 입력: people = [70, 50, 80, 50], limit = 100
 * 출력: 3
 * 설명: 70+50(100), 80, 50 → 3대
 *
 * 핵심: 가장 무거운 사람과 가장 가벼운 사람을 짝지어보기 (투 포인터)
 */

function solution(people, limit) {
  
  people.sort((a, b) => a - b);

  let left = 0;
  let right = people.length - 1;
  let boats = 0;

  while(left <= right) {
    if (people[left] + people[right] <= limit) {
      left++;
    }

    right--;
    boats++;
  }

  return boats;
}

// === 테스트 ===
const tests = [
  { input: [[70, 50, 80, 50], 100], expected: 3 },
  { input: [[1, 2, 3, 4, 5], 6], expected: 3 },
  { input: [[5, 1, 4, 2], 6], expected: 2 },
  { input: [[1, 2], 3], expected: 1 },
];

console.log("=== Problem 2: 구명보트 ===\n");

tests.forEach((t, i) => {
  const [people, limit] = t.input;
  const result = solution(people, limit);
  const ok = result === t.expected;
  console.log(`Test ${i + 1}:`);
  console.log(`  people = [${people}], limit = ${limit}`);
  console.log(`  결과: ${result} (기대값: ${t.expected}) ${ok ? "✓" : "✗"}\n`);
});
