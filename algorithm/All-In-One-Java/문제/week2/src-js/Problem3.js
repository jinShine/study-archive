/**
 * Problem 3: 단어 변환
 * 난이도: 🔴 Lv.3
 * 주제: BFS, 그래프 구축, 최단 경로
 *
 * 문제: begin에서 target으로 변환하는데, words의 단어를 거쳐
 *      한 글자씩만 변환 가능합니다. 최소 변환 횟수를 구하세요.
 *
 * 입력: begin = "hit", target = "cog",
 *      words = ["hot","dot","dog","lot","log","cog"]
 * 출력: 4
 * 경로: hit → hot → dot → dog → cog
 *
 * 핵심:
 * - 한 글자 차이 나는 단어들을 간선으로 연결 (그래프 구축)
 * - BFS로 최단 경로 찾기
 * - 그래프 구축 방법이 핵심
 */

function solution(begin, target, words) {
  // TODO: 풀이 작성
}

// === 테스트 ===
const tests = [
  {
    input: ["hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]],
    expected: 4,
  },
  {
    input: ["hit", "cog", ["hot", "dot", "dog", "lot", "log"]],
    expected: 0,
  },
];

console.log("=== Problem 3: 단어 변환 ===\n");

tests.forEach((t, i) => {
  const [begin, target, words] = t.input;
  const result = solution(begin, target, words);
  const ok = result === t.expected;
  console.log(`Test ${i + 1}:`);
  console.log(`  begin="${begin}", target="${target}"`);
  console.log(`  words=[${words.map((w) => `"${w}"`).join(", ")}]`);
  console.log(`  결과: ${result} (기대값: ${t.expected}) ${ok ? "✓" : "✗"}\n`);
});
