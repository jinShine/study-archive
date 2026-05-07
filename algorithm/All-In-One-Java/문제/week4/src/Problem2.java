import java.util.LinkedList;
import java.util.Queue;



/**
 * Problem 2: 프린터
 * 난이도: 🟡 Lv.2
 * 주제: Queue, 우선순위, 시뮬레이션
 *
 * 문제: 프린터 큐에서 중요도가 높은 문서부터 인쇄됩니다.
 *      location 위치의 문서가 몇 번째로 인쇄되는지 구하세요.
 *
 * 입력: priorities = [2, 1, 3, 2], location = 2
 * 출력: 1 (위치 2의 문서(3)가 1번째로 인쇄)
 *
 * 핵심:
 * - Queue + 우선순위 처리
 * - 각 문서의 원래 위치 추적
 */

public class Problem2 {
    static class Solution {
        
        public int solution(int[] priorities, int location) {
            Queue<int[]> queue = new LinkedList<>();
            
            for (int i = 0; i < priorities.length; i++) {
                queue.offer(new int[] { priorities[i], i });
            }

            int answer = 0;

            while(!queue.isEmpty()) {
                int[] current = queue.poll();

                boolean hasHigherPriority = false;

                for (int[] doc : queue) {
                    if (doc[0] > current[0]) {
                        hasHigherPriority = true;
                        break;
                    }
                }

                if (hasHigherPriority) {
                    queue.offer(current);
                } else {
                    answer++;

                    if (current[1] == location) {
                        return answer;
                    }
                }
            }

            return 0;
        }

    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 2: 프린터 ===\n");

        int[][] inputs = {
                { 2, 1, 3, 2 },
                { 1, 1, 9, 1, 1, 1 },
                { 1 },
                { 5, 4, 3, 2, 1 }
        };
        int[] locations = { 2, 0, 0, 4 };
        int[] expecteds = { 1, 5, 1, 5 };

        for (int i = 0; i < inputs.length; i++) {
            int[] priorities = inputs[i];
            int location = locations[i];
            int expected = expecteds[i];
            int result = sol.solution(priorities, location);
            String status = expected == result ? "✓" : "✗";

            StringBuilder sb = new StringBuilder("[");
            for (int j = 0; j < priorities.length; j++) {
                if (j > 0)
                    sb.append(",");
                sb.append(priorities[j]);
            }
            sb.append("]");

            System.out.println("Test " + (i + 1) + ":");
            System.out.println("  priorities = " + sb.toString() + ", location = " + location);
            System.out.println("  결과: " + result + " (기대값: " + expected + ") " + status + "\n");
        }
    }
}
