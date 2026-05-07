import java.util.Arrays;

/**
 * Problem 2: 여행 경로
 * 난이도: 🟡 Lv.2
 * 주제: DFS, 경로 추적, 그래프
 *
 * 문제: 항공권 정보 tickets가 주어질 때, 모든 항공권을 정확히 한 번씩 사용하는
 *      여행 경로를 구하세요.
 *      - 항상 "ICN" 공항에서 출발
 *      - 가능한 경로가 여러 개라면 알파벳 순으로 앞서는 경로를 반환
 *      - 모든 항공권을 사용해야 함
 *
 * 입력: tickets = [["ICN","JFK"],["HND","IAD"],["JFK","HND"]]
 * 출력: ["ICN","JFK","HND","IAD"]
 *
 * 핵심:
 * - DFS로 모든 항공권 사용
 * - 방문한 간선(티켓) 추적
 * - 백트래킹으로 경로 복구
 */

public class Problem2 {

    static class Solution {
        public String[] solution(String[][] tickets) {
            // TODO: 풀이 작성
            return new String[0];
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 2: 여행 경로 ===\n");

        String[][][] inputs = {
                { { "ICN", "JFK" }, { "HND", "IAD" }, { "JFK", "HND" } },
                { { "ICN", "SFO" }, { "ICN", "ATL" }, { "SFO", "ATL" }, { "ATL", "ICN" }, { "ATL", "SFO" } },
                { { "ICN", "AAA" }, { "ICN", "BBB" }, { "BBB", "ICN" } }
        };
        String[][] expecteds = {
                { "ICN", "JFK", "HND", "IAD" },
                { "ICN", "ATL", "ICN", "SFO", "ATL", "SFO" },
                { "ICN", "BBB", "ICN", "AAA" }
        };

        for (int i = 0; i < inputs.length; i++) {
            String[][] tickets = inputs[i];
            String[] expected = expecteds[i];
            String[] result = sol.solution(tickets);
            boolean ok = Arrays.equals(result, expected);
            String status = ok ? "✓" : "✗";

            System.out.println("Test " + (i + 1) + ":");
            System.out.println("  tickets = " + Arrays.deepToString(tickets));
            System.out.println("  결과: " + Arrays.toString(result));
            System.out.println("  기대값: " + Arrays.toString(expected) + " " + status + "\n");
        }
    }
}
