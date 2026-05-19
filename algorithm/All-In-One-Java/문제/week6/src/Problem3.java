import java.util.Arrays;
import java.util.PriorityQueue;

/**
 * Problem 3: 디스크 컨트롤러
 * 난이도: 🔴 Lv.3
 * 주제: 우선순위 큐, 스케줄링 (SJF)
 *
 * 문제: 하드디스크는 한 번에 하나의 작업만 수행 가능합니다.
 *      jobs[i] = [요청시각, 소요시간] 일 때, 모든 작업이 요청 시점부터
 *      종료될 때까지 걸린 시간의 평균을 가장 줄이는 처리 순서를 사용했을 때의
 *      평균 시간(소수점 버림, 정수)을 반환하세요.
 *
 * 입력: jobs = [[0, 3], [1, 9], [2, 6]]
 * 출력: 9
 *   - (0+3) + ((3-1)+9) + ((14-2)+6) → 평균 (3+11+18)/3 = 9
 *
 * 핵심:
 * - 요청시각 순으로 정렬
 * - 현재 시간까지 들어온 작업을 PriorityQueue(소요시간 짧은 순)에 넣고
 *   가장 짧은 작업부터 처리 (SJF: Shortest Job First)
 */

public class Problem3 {

    static class Solution {
        public int solution(int[][] jobs) {
            // 소요시간으로 정렬
        Arrays.sort(jobs, (a, b) -> a[0] - b[0]);

        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);

        int time = 0;

        int index = 0;

        int count = 0;

        int total = 0;

        while (count < jobs.length) {

            while (index < jobs.length && jobs[index][0] <= time) {
                pq.offer(jobs[index]);
                index++;
            }

            if (pq.isEmpty()) {

                time = jobs[index][0];

                continue;

            }

            int[] job = pq.poll();

            time += job[1];

            total += time - job[0];

            count++;

        }

        return total / jobs.length;
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 3: 디스크 컨트롤러 ===\n");

        int[][][] inputs = {
                { { 0, 3 }, { 1, 9 }, { 2, 6 } },
                { { 0, 10 } },
                { { 0, 5 }, { 1, 1 }, { 3, 1 }, { 5, 1 } },
                { { 1, 9 }, { 0, 3 }, { 2, 6 } } // 정렬 안 된 입력
        };
        int[] expecteds = { 9, 10, 2, 9 };

        for (int i = 0; i < inputs.length; i++) {
            int[][] jobs = inputs[i];
            int expected = expecteds[i];
            int result = sol.solution(jobs);
            String status = expected == result ? "✓" : "✗";

            System.out.println("Test " + (i + 1) + ":");
            System.out.println("  jobs = " + Arrays.deepToString(jobs));
            System.out.println("  결과: " + result + " (기대값: " + expected + ") " + status + "\n");
        }
    }
}
