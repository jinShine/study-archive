
import java.util.ArrayList;
import java.util.List;

/**
 * Problem 1: 없는 숫자 더하기
 * 난이도: 🟢 Lv.1
 * 주제: 배열, 집합
 *
 * 문제: 0부터 9까지의 숫자 중 numbers에 없는 숫자들의 합을 반환하세요.
 *
 * 입력: numbers = [1, 2, 3, 4, 6, 7, 8, 0]
 * 출력: 14 (5 + 9)
 *
 * 핵심: Set 사용 또는 boolean[] 플래그로 존재 여부 확인
 */

public class Problem1 {

    static class Solution {
        public int solution(int[] numbers) {
            int answer = 0;

            List<Integer> list = new ArrayList<>();
            for (int num : numbers) {
                list.add(num);
            }

            for (int i = 0; i <= 9; i++) {
                if (!list.contains(i)) {
                    answer += i;
                }
            }

            return answer;
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 1: 없는 숫자 더하기 ===\n");

        int[][] inputs = {
                { 1, 2, 3, 4, 6, 7, 8, 0 },
                { 5, 8, 4, 0, 6, 7, 9 },
                { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 },
                {}
        };
        int[] expecteds = { 14, 6, 0, 45 };

        for (int i = 0; i < inputs.length; i++) {
            int[] input = inputs[i];
            int expected = expecteds[i];
            int result = sol.solution(input);
            String status = expected == result ? "✓" : "✗";

            StringBuilder sb = new StringBuilder("[");
            for (int j = 0; j < input.length; j++) {
                if (j > 0)
                    sb.append(",");
                sb.append(input[j]);
            }
            sb.append("]");

            System.out.println("Test " + sb.toString() + ": " + result + " (기대값: " + expected + ") " + status);
        }
    }
}
