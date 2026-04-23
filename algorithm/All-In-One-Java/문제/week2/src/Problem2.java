/**
 * Problem 2: 타겟 넘버
 * 난이도: 🟡 Lv.2
 * 주제: DFS, 재귀, 모든 경로 탐색
 *
 * 문제: 배열 numbers의 각 숫자 앞에 +, - 중 하나를 선택해서
 *      target을 만드는 경우의 수를 구하세요.
 *
 * 입력: numbers = [1,1,1,1,1], target = 3
 * 출력: 5
 *
 * 핵심:
 * - 재귀로 모든 부호 조합 탐색
 * - DFS의 기본 형태
 * - 시간복잡도: O(2^n)
 */

public class Problem2 {

    static class Solution {
        public int solution(int[] numbers, int target) {
            return dfs(numbers, target, 0, 0);
        }

        private int dfs(int[] numbers, int target, int index, int sum) {
            if (index == numbers.length) {
                return sum == target ? 1 : 0;
            }

            int plus = dfs(numbers, target, index + 1, sum + numbers[index]);
            int minus = dfs(numbers, target, index + 1, sum - numbers[index]);

            return plus + minus;
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 2: 타겟 넘버 ===\n");

        // 테스트 케이스 1
        int[] numbers1 = {1, 1, 1, 1, 1};
        int target1 = 3;
        int expected1 = 5;
        int result1 = sol.solution(numbers1, target1);
        System.out.println("Test 1: " + result1 + " (기대값: " + expected1 + ") " + (result1 == expected1 ? "✓" : "✗"));

        // 테스트 케이스 2
        int[] numbers2 = {4, 1, 2, 1};
        int target2 = 4;
        int expected2 = 2;
        int result2 = sol.solution(numbers2, target2);
        System.out.println("Test 2: " + result2 + " (기대값: " + expected2 + ") " + (result2 == expected2 ? "✓" : "✗"));

        // 테스트 케이스 3
        int[] numbers3 = {1, 2, 3};
        int target3 = 0;
        int expected3 = 2;
        int result3 = sol.solution(numbers3, target3);
        System.out.println("Test 3: " + result3 + " (기대값: " + expected3 + ") " + (result3 == expected3 ? "✓" : "✗"));
    }
}
