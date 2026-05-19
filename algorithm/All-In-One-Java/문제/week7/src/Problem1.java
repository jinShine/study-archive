/**
 * Problem 1: 가운데 글자 가져오기
 * 난이도: 🟢 Lv.1
 * 주제: 문자열
 *
 * 문제: 단어 s의 가운데 글자를 반환하세요.
 *      단어의 길이가 짝수라면 가운데 두 글자를 반환합니다.
 *
 * 입력: s = "abcde"  →  "c"
 *      s = "qwer"   →  "we"
 *
 * 핵심:
 * - 문자열 길이의 홀짝 판단
 * - substring 활용 (중간 인덱스 계산)
 */

public class Problem1 {

    static class Solution {
        public String solution(String s) {
            // TODO: 풀이 작성
            return "";
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 1: 가운데 글자 가져오기 ===\n");

        String[] inputs = { "abcde", "qwer", "a", "ab", "abcdefg" };
        String[] expecteds = { "c", "we", "a", "ab", "d" };

        for (int i = 0; i < inputs.length; i++) {
            String s = inputs[i];
            String expected = expecteds[i];
            String result = sol.solution(s);
            String status = expected.equals(result) ? "✓" : "✗";

            System.out.println("Test " + (i + 1) + ":");
            System.out.println("  s = \"" + s + "\"");
            System.out.println("  결과: \"" + result + "\" (기대값: \"" + expected + "\") " + status + "\n");
        }
    }
}
