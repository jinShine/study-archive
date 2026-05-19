import java.util.Arrays;
import java.util.PriorityQueue;

/**
 * Problem 2: 더 맵게
 * 난이도: 🟡 Lv.2
 * 주제: 우선순위 큐, PriorityQueue, Min Heap
 *
 * 문제: Leo는 모든 음식의 스코빌 지수를 K 이상으로 만들고 싶습니다.
 *      Leo는 스코빌 지수가 가장 낮은 두 개의 음식을 아래의 식으로 섞어
 *      새로운 음식을 만듭니다.
 *
 *        섞은 음식의 스코빌 지수 = 가장 맵지 않은 음식의 스코빌 지수
 *                                + (두 번째로 맵지 않은 음식의 스코빌 지수 * 2)
 *
 *      Leo는 모든 음식의 스코빌 지수가 K 이상이 될 때까지 반복하여 섞습니다.
 *      모든 음식의 스코빌 지수를 K 이상으로 만들기 위해 섞어야 하는 최소 횟수를
 *      반환하세요. 만들 수 없는 경우 -1을 반환합니다.
 *
 * 입력: scoville = [1, 2, 3, 9, 10, 12], K = 7
 * 출력: 2
 *   - 1번째 섞기: 1, 2 → 1 + 2*2 = 5 → [5, 3, 9, 10, 12]
 *   - 2번째 섞기: 3, 5 → 3 + 5*2 = 13 → [13, 9, 10, 12] (모두 ≥ 7)
 *
 * 핵심:
 * - PriorityQueue(Min Heap)로 가장 맵지 않은 두 개를 매번 꺼냄
 * - 큐의 최솟값이 K 이상이 될 때까지 반복
 * - 원소가 1개 남았는데도 K 미만이면 -1
 */

public class Problem2 {

    static class Solution {
        public int solution(int[] scoville, int K) {
            int answer = 0;
            
            PriorityQueue<Integer> pq = new PriorityQueue<>();

            for (int s : scoville) {
                pq.offer(s);
            }

            // 최솟값이 K 미만인 동안 반복
            while (pq.peek() < K) {
                // 짝이 없으면 불가능
                if (pq.size() < 2) {
                    return -1;
                }

                int a = pq.poll();
                int b = pq.poll();
                pq.offer(calcScoville(a, b));

                answer++;
            }

            return answer;
        }

        private int calcScoville(int a, int b) {
            return a + (b * 2);
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 2: 더 맵게 ===\n");

        int[][] inputs = {
                { 1, 2, 3, 9, 10, 12 },
                { 0, 0 },
                { 1, 2, 3 },
                { 10, 10, 10, 10 }
        };
        int[] Ks = { 7, 7, 11, 5 };
        int[] expecteds = { 2, -1, 2, 0 };

        for (int i = 0; i < inputs.length; i++) {
            int[] scoville = inputs[i];
            int K = Ks[i];
            int expected = expecteds[i];
            int result = sol.solution(scoville.clone(), K);
            String status = expected == result ? "✓" : "✗";

            System.out.println("Test " + (i + 1) + ":");
            System.out.println("  scoville = " + Arrays.toString(scoville) + ", K = " + K);
            System.out.println("  결과: " + result + " (기대값: " + expected + ") " + status + "\n");
        }
    }
}
