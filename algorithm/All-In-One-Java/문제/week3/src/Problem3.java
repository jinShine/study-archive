import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Queue;

public class Problem3 {

    static class Solution {
        public int solution(int n, int[][] edge) {
            List<List<Integer>> graph = new ArrayList<>();

            for (int i = 0; i <= n; i++) {
                graph.add(new ArrayList<>());
            }

            for (int[] e : edge) {
                int a = e[0];
                int b = e[1];

                graph.get(a).add(b);
                graph.get(b).add(a);
            }

            int[] distance = new int[n + 1];
            Arrays.fill(distance, -1);

            Queue<Integer> queue = new ArrayDeque<>();
            queue.offer(1);
            distance[1] = 0;

            while (!queue.isEmpty()) {
                int cur = queue.poll();

                for (int next : graph.get(cur)) {
                    if (distance[next] == -1) {
                        distance[next] = distance[cur] + 1;
                        queue.offer(next);
                    }
                }
            }

            int maxDistance = 0;

            for (int i = 1; i <= n; i++) {
                maxDistance = Math.max(maxDistance, distance[i]);
            }

            int answer = 0;

            for (int i = 1; i <= n; i++) {
                if (distance[i] == maxDistance) {
                    answer++;
                }
            }

            return answer;
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 3: 가장 먼 노드 ===\n");

        int[] ns = { 6, 4 };
        int[][][] edges = {
                { { 3, 6 }, { 4, 3 }, { 3, 2 }, { 1, 3 }, { 1, 2 }, { 2, 4 }, { 5, 2 } },
                { { 1, 2 }, { 1, 3 }, { 2, 4 }, { 3, 4 } }
        };
        int[] expected = { 3, 1 };

        for (int i = 0; i < ns.length; i++) {
            int n = ns[i];
            int[][] edgeArr = edges[i];
            int exp = expected[i];
            int result = sol.solution(n, edgeArr);
            String status = result == exp ? "✓" : "✗";

            System.out.println("Test " + (i + 1) + ":");
            System.out.println("  n = " + n);
            System.out.print("  edge = [");
            for (int j = 0; j < edgeArr.length; j++) {
                System.out.print(Arrays.toString(edgeArr[j]));
                if (j < edgeArr.length - 1)
                    System.out.print(", ");
            }
            System.out.println("]");
            System.out.println("  결과: " + result + " (기대값: " + exp + ") " + status);
            System.out.println();
        }
    }
}