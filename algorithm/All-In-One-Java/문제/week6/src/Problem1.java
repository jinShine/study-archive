import java.util.Arrays;

/**
 * Problem 1: 평균 구하기
 * 난이도: 🟢 Lv.1
 * 주제: 배열, 기본 연산
 *
 * 문제: 정수를 담고 있는 배열 arr의 평균값을 return하는 함수를 작성하세요.
 *
 * 입력: arr = [1, 2, 3, 4]
 * 출력: 2.5
 *
 * 핵심: 합계 구하기, 길이로 나누기
 */

public class Problem1 {

    static class Solution {
        public double solution(int[] arr) {
            double answer = 0;

            for (int num : arr) {
                answer += num;
            }
            
            System.out.println("합계: " + answer + ", 길이: " + arr.length);

            // return Arrays.stream(arr).average().getAsDouble()
            return answer / arr.length;
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 1: 평균 구하기 ===\n");

        int[][] inputs = {
                { 1, 2, 3, 4 },
                { 5, 5 },
                { 10 },
                { -1, 0, 1 }
        };
        double[] expecteds = { 2.5, 5.0, 10.0, 0.0 };

        for (int i = 0; i < inputs.length; i++) {
            int[] arr = inputs[i];
            double expected = expecteds[i];
            double result = sol.solution(arr);
            String status = expected == result ? "✓" : "✗";

            System.out.println("Test " + (i + 1) + ":");
            System.out.println("  arr = " + Arrays.toString(arr));
            System.out.println("  결과: " + result + " (기대값: " + expected + ") " + status + "\n");
        }
    }
}
