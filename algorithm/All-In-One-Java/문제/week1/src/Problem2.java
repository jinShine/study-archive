import java.lang.reflect.Array;
import java.util.*;

/**
 * Problem 2: 구명보트
 * 난이도: 🟡 Lv.2
 * 주제: 그리디, 정렬, 투 포인터
 *
 * 문제: 사람들의 몸무게와 보트 무게 제한이 주어질 때,
 *      모두를 구출하는데 필요한 최소 보트 수를 구하세요.
 *
 * 조건:
 * - 각 보트에는 최대 2명씩 탈 수 있음
 * - 보트의 무게 제한을 초과하면 안됨
 *
 * 입력: people = [70, 50, 80, 50], limit = 100
 * 출력: 3
 * 설명: 70+50(100), 80, 50 → 3대
 *
 * 핵심: 가장 무거운 사람과 가장 가벼운 사람을 짝지어보기 (투 포인터)
 */

public class Problem2 {

    static class Solution {
        public int solution(int[] people, int limit) {
            Arrays.sort(people);

            int left = 0;
            int right = people.length - 1;
            int result = 0;

            while(left <= right) {
                if (people[left] + people[right] <= limit) {
                    left++;
                }

                right--;
                result++;
            }

            return result;
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 2: 구명보트 ===\n");

        // 테스트 케이스
        int[][][] testCases = {
            {{70, 50, 80, 50}},
            {{1, 2, 3, 4, 5}},
            {{5, 1, 4, 2}},
            {{1, 2}}
        };
        int[] limits = {100, 6, 6, 3};
        int[] expected = {3, 3, 2, 1};

        for (int i = 0; i < testCases.length; i++) {
            int[] people = testCases[i][0];
            int limit = limits[i];
            int exp = expected[i];

            int result = sol.solution(people, limit);
            String status = result == exp ? "✓" : "✗";

            System.out.println("Test " + (i + 1) + ":");
            System.out.println("  people = " + Arrays.toString(people) + ", limit = " + limit);
            System.out.println("  결과: " + result + " (기대값: " + exp + ") " + status);
            System.out.println();
        }
    }
}
