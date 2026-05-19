import java.util.Arrays;

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
 *   - 경로: 7 → 8 → 1 → 7 → 5 = ?
 *   - 실제 최대 경로: 7 → 3 → 8 → 7 → 5 = 30
 *
 * 핵심:
 * - DP 점화식: dp[i][j] = triangle[i][j] + max(dp[i-1][j-1], dp[i-1][j])
 * - 또는 상향식(아래에서 위로): dp[i][j] = triangle[i][j] + max(dp[i+1][j], dp[i+1][j+1])
 * - 경계 처리: 양 끝 칸은 한쪽만 선택 가능
 */

public class Problem3 {

    static class Solution {
        public int solution(int[][] triangle) {
            int n = triangle.length;
            int[][] dp = new int[n][];
            for (int i = 0; i < n; i++) {
                dp[i] = new int[triangle[i].length];
            }

            for (int j = 0; j < n; j++) {
                dp[n - 1][j] = triangle[n - 1][j];
            }

            for (int i = n - 2; i >= 0; i--) {
                for (int j = 0; j < triangle[i].length; j++) {
                    dp[i][j] = triangle[i][j] + Math.max(dp[i + 1][j], dp[i + 1][j + 1]);
                }
            }

            return dp[0][0];
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 3: 정수 삼각형 ===\n");

        int[][][] inputs = {
                { { 7 }, { 3, 8 }, { 8, 1, 0 }, { 2, 7, 4, 4 }, { 4, 5, 2, 6, 5 } },
                { { 1 } },
                { { 1 }, { 2, 3 } },
                { { 5 }, { 1, 9 }, { 4, 6, 7 } }
        };
        int[] expecteds = { 30, 1, 4, 21 };

        for (int i = 0; i < inputs.length; i++) {
            int[][] triangle = inputs[i];
            int expected = expecteds[i];
            int result = sol.solution(triangle);
            String status = expected == result ? "✓" : "✗";

            System.out.println("Test " + (i + 1) + ":");
            System.out.println("  triangle = " + Arrays.deepToString(triangle));
            System.out.println("  결과: " + result + " (기대값: " + expected + ") " + status + "\n");
        }
    }
}
