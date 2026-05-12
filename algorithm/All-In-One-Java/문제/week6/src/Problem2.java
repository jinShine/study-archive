/**
 * Problem 2: 올바른 괄호
 * 난이도: 🟡 Lv.2
 * 주제: Stack, 문자열 검증
 *
 * 문제: '(' 또는 ')' 로만 이루어진 문자열 s가 주어질 때, 괄호가 짝이
 *      올바르게 맞으면 true, 아니면 false를 반환하세요.
 *
 * 입력: s = "()()"  →  true
 *      s = "(())()" →  true
 *      s = ")()("   →  false
 *      s = "(()("   →  false
 *
 * 핵심:
 * - Stack 또는 카운터로 괄호 개수 추적
 * - 열린 괄호는 증가, 닫힌 괄호는 감소
 * - 언제든 음수가 되면 false
 * - 마지막에 0이 아니면 false
 */

public class Problem2 {

    static class Solution {
        boolean solution(String s) {
            int count = 0;

            for (char c : s.toCharArray()) {
                if (c == '(') {
                    count++;
                } else {
                    count--;
                }
                
                if (count < 0) {
                    return false;
                }
            }

            return count == 0;
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 2: 올바른 괄호 ===\n");

        String[] inputs = {
                "()()",
                "(())()",
                ")()(",
                "(()(",
                "",
                "((()))"
        };
        boolean[] expecteds = { true, true, false, false, true, true };

        for (int i = 0; i < inputs.length; i++) {
            String s = inputs[i];
            boolean expected = expecteds[i];
            boolean result = sol.solution(s);
            String status = expected == result ? "✓" : "✗";

            System.out.println("Test " + (i + 1) + ":");
            System.out.println("  s = \"" + s + "\"");
            System.out.println("  결과: " + result + " (기대값: " + expected + ") " + status + "\n");
        }
    }
}
