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

public class Problem3 {

    static class Solution {
        public int solution(int[][] grid) {
            int answer = 0;

        int rows = grid.length;

        int cols = grid[0].length;

        int[] dr = {-1, 1, 0, 0};

        int[] dc = {0, 0, -1, 1};

        for (int r = 0; r < rows; r++) {

            for (int c = 0; c < cols; c++) {

                // 물이면 스킵

                if (grid[r][c] == 0) {

                    continue;

                }

                // 땅이면 상하좌우 확인

                for (int d = 0; d < 4; d++) {

                    int nr = r + dr[d];

                    int nc = c + dc[d];

                    // 격자 밖이면 둘레

                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {

                        answer++;

                    }

                    // 옆이 물이면 둘레

                    else if (grid[nr][nc] == 0) {

                        answer++;

                    }

                }

            }

        }

        return answer;
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 3: 섬의 둘레 ===\n");

        int[][][] inputs = {
                {
                        { 0, 1, 0 },
                        { 1, 1, 1 },
                        { 0, 1, 0 }
                },
                {
                        { 1 }
                },
                {
                        { 1, 1 },
                        { 1, 1 }
                },
                {
                        { 0, 1, 0, 0 },
                        { 1, 1, 1, 0 },
                        { 0, 1, 0, 0 },
                        { 1, 1, 0, 0 }
                }
        };
        int[] expecteds = { 12, 4, 8, 16 };

        for (int i = 0; i < inputs.length; i++) {
            int[][] grid = inputs[i];
            int expected = expecteds[i];
            int result = sol.solution(grid);
            String status = expected == result ? "✓" : "✗";

            System.out.println("Test " + (i + 1) + ":");
            for (int[] row : grid) {
                StringBuilder sb = new StringBuilder("  [");
                for (int j = 0; j < row.length; j++) {
                    if (j > 0)
                        sb.append(",");
                    sb.append(row[j]);
                }
                sb.append("]");
                System.out.println(sb.toString());
            }
            System.out.println("  결과: " + result + " (기대값: " + expected + ") " + status + "\n");
        }
    }
}
