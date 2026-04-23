import java.util.*;

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

public class Problem3 {

    static class Solution {
        public int solution(String begin, String target, String[] words) {
            
            boolean targetExists = false;
            for (String word : words) {
                if (word.equals(target)) {
                    targetExists = true;
                    break;
                }
            }
            if (!targetExists) return 0;

            Queue<String> queue = new ArrayDeque<>();
            boolean[] visited = new boolean[words.length];

            queue.offer(begin);

            int depth = 0;

            while (!queue.isEmpty()) {
                int size = queue.size();
                depth++;

                for (int i = 0; i < size; i++) {
                    
                    String cur = queue.poll();

                    for (int j = 0; j < words.length; j++) {
                        if (!visited[j] && isDiff(cur, words[j])) {
                            if (words[j].equals(target)) {
                                return depth;
                            }
                            visited[j] = true;
                            queue.offer(words[j]);
                        }
                    }
                }
            }

            return 0;
        }

        private boolean isDiff(String a, String b) {
            if (a.length() != b.length()) return false;

            int diffCount = 0;
            for (int i = 0; i < a.length(); i++) {
                if (a.charAt(i) != b.charAt(i)) {
                    diffCount++;
                }
                if (diffCount > 1) return false;
            }

            return diffCount == 1;
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 3: 단어 변환 ===\n");

        // 테스트 케이스 1
        String begin1 = "hit";
        String target1 = "cog";
        String[] words1 = {"hot", "dot", "dog", "lot", "log", "cog"};
        int expected1 = 4;
        int result1 = sol.solution(begin1, target1, words1);
        System.out.println("Test 1: " + result1 + " (기대값: " + expected1 + ") " + (result1 == expected1 ? "✓" : "✗"));

        // 테스트 케이스 2
        String begin2 = "hit";
        String target2 = "cog";
        String[] words2 = {"hot", "dot", "dog", "lot", "log"};
        int expected2 = 0;
        int result2 = sol.solution(begin2, target2, words2);
        System.out.println("Test 2: " + result2 + " (기대값: " + expected2 + ") " + (result2 == expected2 ? "✓" : "✗"));
    }
}
