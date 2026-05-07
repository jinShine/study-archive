/**
 * Problem 1: 두 정수 사이의 합
 * 난이도: 🟢 Lv.1
 * 주제: 수학, 루프
 *
 * 문제: 두 정수 a, b가 주어질 때, a와 b 사이에 속한 모든 정수의 합을 반환하세요.
 *      (a == b 인 경우 a 반환, a > b 인 경우에도 동작해야 함)
 *
 * 입력: a = 3, b = 5
 * 출력: 12  (3 + 4 + 5)
 *
 * 핵심: 등차수열의 합 공식 또는 루프로 계산
 */

public class Problem1 {

    static class Solution {
        public long solution(int a, int b) {
            // TODO: 풀이 작성
            return 0L;
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 1: 두 정수 사이의 합 ===\n");

        int[][] inputs = {
                { 3, 5 },
                { 3, 3 },
                { 5, 3 },
                { -3, 3 },
                { -5, -3 }
        };
        long[] expecteds = { 12L, 3L, 12L, 0L, -12L };

        for (int i = 0; i < inputs.length; i++) {
            int a = inputs[i][0];
            int b = inputs[i][1];
            long expected = expecteds[i];
            long result = sol.solution(a, b);
            String status = expected == result ? "✓" : "✗";

            System.out.println("Test " + (i + 1) + ":");
            System.out.println("  a = " + a + ", b = " + b);
            System.out.println("  결과: " + result + " (기대값: " + expected + ") " + status + "\n");
        }
    }
}
