import java.util.*;

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

public class Problem3_1 {

    static class Solution {

        boolean[] visited;
        int n;
        int[][] computers;

        public int solution(int n, int[][] computers) {
            this.n = n;
            this.computers = computers;
            this.visited = new boolean[n];

            int count = 0;

            for (int i = 0; i < n; i++) {
                if (!visited[i]) {
                    dfs(i);
                    count++;
                }
            }

            return count;
        }

        private void dfs(int node) {
            visited[node] = true;

            for (int i = 0; i < n; i++) {
                if (computers[node][i] == 1 && !visited[i]) {
                    dfs(i);
                }
            }
        }
    }

    

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 3: 네트워크 ===\n");

        // 테스트 케이스
        int[] ns = {3, 3, 4, 4};
        int[][][] testCases = {
            {{1, 1, 0}, {1, 1, 0}, {0, 0, 1}},
            {{1, 0, 0}, {0, 1, 0}, {0, 0, 1}},
            {{1, 1, 0, 0}, {1, 1, 1, 0}, {0, 1, 1, 0}, {0, 0, 0, 1}},
            {{1, 1, 0, 1}, {1, 1, 1, 0}, {0, 1, 1, 1}, {1, 0, 1, 1}}
        };
        int[] expected = {2, 3, 2, 1};

        for (int i = 0; i < testCases.length; i++) {
            int n = ns[i];
            int[][] computers = testCases[i];
            int exp = expected[i];

            int result = sol.solution(n, computers);
            String status = result == exp ? "✓" : "✗";

            System.out.println("Test " + (i + 1) + ":");
            System.out.println("  n = " + n);
            System.out.println("  computers = ");
            for (int[] row : computers) {
                System.out.println("    " + Arrays.toString(row));
            }
            System.out.println("  결과: " + result + " (기대값: " + exp + ") " + status);
            System.out.println();
        }
    }
}
