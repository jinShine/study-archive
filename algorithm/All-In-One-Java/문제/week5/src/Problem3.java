import java.util.Arrays;

/**
 * Problem 3: 외벽 점검
 * 난이도: 🔴 Lv.3
 * 주제: BFS, 조합, 완전탐색, 최적화
 *
 * 문제: 길이 n의 원형 외벽에 취약점 weak[]가 있고, 친구들의 점검 가능 거리
 *      dist[]가 주어집니다. 시계 방향으로만 이동할 때, 모든 취약점을 점검하는
 *      데 필요한 최소 친구 수를 반환하세요. (불가능하면 -1)
 *
 * 입력: n = 12, weak = [1, 5, 6, 10], dist = [2, 4, 6]
 * 출력: 2
 *
 * 풀이 흐름:
 *   ① 원형 → 일자 (weak를 2배로 펼침)
 *   ② dist의 모든 순열을 만든다
 *   ③ 모든 시작점에서 그리디 시뮬레이션 → 최소 친구 수 갱신
 */

public class Problem3 {

    static class Solution {
        int len;          // 원래 weak 길이
        int[] hWeak;      // 펼친 weak (2배)
        int[] dist;
        int answer;

        public int solution(int n, int[] weak, int[] dist) {
            this.len = weak.length;
            this.dist = dist;
            this.answer = Integer.MAX_VALUE;

            // ① 원형 → 일자: weak를 두 배로 펼친다
            hWeak = new int[len * 2];
            for (int i = 0; i < len; i++) {
                hWeak[i] = weak[i];
                hWeak[i + len] = weak[i] + n; // 한 바퀴 돈 위치
            }

            // ② 친구 줄세우는 모든 순서 시도 → ③ 즉시 점검
            tryAllOrders(new int[dist.length], new boolean[dist.length], 0);

            return answer == Integer.MAX_VALUE ? -1 : answer;
        }

        // ② 친구를 줄세우는 모든 순서 시도 (백트래킹)
        void tryAllOrders(int[] order, boolean[] used, int depth) {
            if (depth == order.length) {
                check(order); // 줄세우기 완성되면 점검
                return;
            }
            for (int i = 0; i < dist.length; i++) {
                if (used[i]) continue;
                used[i] = true;
                order[depth] = dist[i];
                tryAllOrders(order, used, depth + 1);
                used[i] = false;
            }
        }

        // ③ 모든 시작점에서 줄세운 순서대로 친구 투입 → 최소 친구 수 갱신
        void check(int[] order) {
            for (int start = 0; start < len; start++) {
                int idx = start;
                int end = start + len;
                int friendIdx = 0;

                // 친구를 한 명씩 투입하며 weak 커버
                while (idx < end && friendIdx < order.length) {
                    int reach = hWeak[idx] + order[friendIdx]; // 현재 친구가 닿는 끝
                    while (idx < end && hWeak[idx] <= reach) {
                        idx++; // reach 안의 weak는 다 커버
                    }
                    friendIdx++; // 다음 친구
                }

                // 모든 weak 커버 성공 → 사용한 친구 수가 후보
                if (idx == end) {
                    answer = Math.min(answer, friendIdx);
                }
            }
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 3: 외벽 점검 ===\n");

        int[] ns = { 12, 12 };
        int[][] weaks = {
                { 1, 5, 6, 10 },
                { 1, 3, 4, 9, 10 }
        };
        int[][] dists = {
                { 2, 4, 6 },
                { 3, 5, 7 }
        };
        int[] expecteds = { 2, 1 };

        for (int i = 0; i < ns.length; i++) {
            int n = ns[i];
            int[] weak = weaks[i];
            int[] dist = dists[i];
            int expected = expecteds[i];
            int result = new Solution().solution(n, weak, dist);
            String status = expected == result ? "✓" : "✗";

            System.out.println("Test " + (i + 1) + ":");
            System.out.println("  n = " + n);
            System.out.println("  weak = " + Arrays.toString(weak));
            System.out.println("  dist = " + Arrays.toString(dist));
            System.out.println("  결과: " + result + " (기대값: " + expected + ") " + status + "\n");
        }
    }
}
