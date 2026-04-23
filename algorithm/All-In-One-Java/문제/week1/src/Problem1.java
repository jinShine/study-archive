/**
 * Problem 1: 자릿수 더하기
 * 난이도: 🟢 Lv.1
 * 주제: 기본 연산
 *
 * 문제: 양의 정수 n이 주어질 때, n의 각 자릿수를 모두 더한 값을 반환하세요.
 *
 * 입력: 930211
 * 출력: 16 (9+3+0+2+1+1)
 *
 * 핵심: 숫자를 문자열로 변환하거나, 나머지 연산으로 각 자릿수 추출
 */

public class Problem1 {

    static class Solution {
        public int solution(int n) {
            String str = String.valueOf(n);
            return str.chars().reduce(0, (acc, c) -> acc + Integer.parseInt(String.valueOf((char) c )));
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 1: 자릿수 더하기 ===\n");

        // 테스트 케이스
        int[][] tests = {
            {930211, 16},
            {12345, 15},
            {100, 1},
            {1, 1},
            {999, 27}
        };

        for (int[] test : tests) {
            int input = test[0];
            int expected = test[1];
            int result = sol.solution(input);
            String status = result == expected ? "✓" : "✗";
            System.out.println("Test " + input + ": " + result + " (기대값: " + expected + ") " + status);
        }
    }
}
