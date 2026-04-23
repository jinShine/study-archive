import java.util.*;

/**
 * Problem 3: 가장 먼 노드
 * 난이도: 🔴 Lv.3
 * 주제: BFS, 다익스트라, 그래프
 *
 * 문제: 1번 노드에서 모든 다른 노드까지의 최단 거리를 구한 후,
 *      가장 먼 거리에 있는 노드의 개수를 반환하세요.
 *
 * 입력: n = 6, edge = [[3,6],[4,3],[3,2],[1,3],[1,2],[2,4],[5,2]]
 * 출력: 3
 *
 * 핵심:
 * - BFS로 각 노드까지의 최단 거리 계산
 * - 거리를 레벨별로 관리
 * - 최댓값에 해당하는 노드 개수 세기
 */

public class Problem3 {

    static class Solution {
        public int solution(int n, int[][] edge) {
            // TODO: 풀이 작성
            return 0;
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 3: 가장 먼 노드 ===\n");

        int[] ns = {6, 4};
        int[][][] edges = {
            {{3, 6}, {4, 3}, {3, 2}, {1, 3}, {1, 2}, {2, 4}, {5, 2}},
            {{1, 2}, {2, 3}, {3, 4}}
        };
        int[] expected = {3, 1};

        for (int i = 0; i < ns.length; i++) {
            int n = ns[i];
            int[][] edge = edges[i];
            int exp = expected[i];
            int result = sol.solution(n, edge);
            String status = result == exp ? "✓" : "✗";

            System.out.println("Test " + (i + 1) + ":");
            System.out.println("  n = " + n);
            System.out.print("  edge = [");
            for (int j = 0; j < edge.length; j++) {
                System.out.print(Arrays.toString(edge[j]));
                if (j < edge.length - 1) System.out.print(", ");
            }
            System.out.println("]");
            System.out.println("  결과: " + result + " (기대값: " + exp + ") " + status);
            System.out.println();
        }
    }
}
