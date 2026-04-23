/**
 * Problem 1: 문자열 내 p와 y의 개수
 * 난이도: 🟢 Lv.1
 * 주제: 문자열, 카운팅
 *
 * 문제: 문자열 s에서 p(또는 P)와 y(또는 Y)의 개수가 같으면 true,
 *      다르면 false를 반환하세요.
 *
 * 입력: "pPoooyY"
 * 출력: true (p가 2개, y가 2개)
 *
 * 핵심: 문자열 순회, 대소문자 처리 (toLowerCase)
 */

public class Problem1 {

    static class Solution {
        boolean solution(String s) {
            s = s.toLowerCase();

            int countP = 0;
            int countY = 0;

            for (char c : s.toCharArray()) {
                if (c == 'p') {
                    countP++;
                }

                if (c == 'y') {
                    countY++;
                }
            }

            return countP == countY;
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 1: 문자열 내 p와 y의 개수 ===\n");

        // 테스트 케이스
        Object[][] tests = {
            {"pPoooyY", true},
            {"Pyy", false},
            {"xzy", false},      // p=0, y=1 → false
            {"pppYYYp", false},
            {"PpYy", true}
        };

        for (Object[] test : tests) {
            String input = (String) test[0];
            boolean expected = (boolean) test[1];
            boolean result = sol.solution(input);
            String status = result == expected ? "✓" : "✗";
            System.out.println("Test \"" + input + "\": " + result + " (기대값: " + expected + ") " + status);
        }
    }
}
