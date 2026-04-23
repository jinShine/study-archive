import java.lang.reflect.Array;
import java.util.Arrays;

/**
 * Problem 1: 최댓값과 최솟값
 * 난이도: 🟢 Lv.1
 * 주제: 기본 알고리즘, 최댓값/최솟값
 *
 * 문제: 공백으로 구분된 숫자 문자열이 주어질 때,
 * 최댓값과 최솟값을 "최솟값 최댓값" 형식으로 반환하세요.
 *
 * 입력: "1 2 -3 0"
 * 출력: "-3 2"
 *
 * 핵심: 문자열 파싱 (split), 정렬 또는 루프로 min/max 찾기
 */

public class Problem1 {

    static class Solution {
        public String solution(String s) {

            // String[] arr = s.split(" ");

            // int min = Integer.MAX_VALUE;
            // int max = Integer.MIN_VALUE;

            // for (String str : arr) {
            // int num = Integer.parseInt(str);

            // if (num < min) {
            // min = num;
            // }

            // if (num > max) {
            // max = num;
            // }
            // }

            // return min + " " + max;

            int[] arr = Arrays.stream(s.split(" "))
                    .mapToInt(Integer::parseInt)
                    .sorted()
                    .toArray();

            return arr[0] + " " + arr[arr.length - 1];
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 1: 최댓값과 최솟값 ===\n");

        String[][] tests = {
                { "1 2 -3 0", "-3 2" },
                { "-1 -2 -3 -4", "-4 -1" },
                { "-1 -1", "-1 -1" },
                { "10 20 30 40 50", "10 50" }
        };

        for (String[] test : tests) {
            String input = test[0];
            String expected = test[1];
            String result = sol.solution(input);
            String status = expected.equals(result) ? "✓" : "✗";
            System.out.println("Test \"" + input + "\": \"" + result + "\" (기대값: \"" + expected + "\") " + status);
        }
    }
}
