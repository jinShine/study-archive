import java.util.Arrays;
import java.util.LinkedList;
import java.util.Queue;

/**
 * Problem 2: 게임 맵 최단거리
 * 난이도: 🟡 Lv.2
 * 주제: BFS, 격자 탐색, 최단 경로
 *
 * 문제: 2D 격자에서 1은 이동 가능, 0은 벽입니다.
 * (0,0)에서 (n-1,m-1)까지 가는 최단 경로 길이를 구하세요.
 * 도달 불가 시 -1 반환.
 *
 * 입력: maps = [[1,0,1,1,1],
 * [1,0,1,0,1],
 * [1,0,1,1,1],
 * [1,1,1,0,1],
 * [0,0,0,0,1]]
 * 출력: 11
 *
 * 핵심:
 * - 방향 벡터 활용 (상하좌우)
 * - BFS로 격자 탐색
 * - 범위 체크 필수
 */

public class Problem2 {

    static class Solution {
        public int solution(int[][] maps) {

            int[] dx = { -1, 1, 0, 0 };
            int[] dy = { 0, 0, -1, 1 };

            int n = maps.length;
            int m = maps[0].length;

            Queue<int[]> queue = new LinkedList<>();
            queue.offer(new int[] { 0, 0 });

            while (!queue.isEmpty()) {
                int[] current = queue.poll();
                int x = current[0];
                int y = current[1];

                for (int i = 0; i < 4; i++) {
                    int nx = x + dx[i];
                    int ny = y + dy[i];

                    if (nx < 0 || ny < 0 || nx >= n || ny >= m) {
                        continue;
                    }

                    if (maps[nx][ny] != 1) {
                        continue;
                    }

                    maps[nx][ny] = maps[x][y] + 1;
                    queue.offer(new int[] { nx, ny });
                }
            }

            if (maps[n - 1][m - 1] == 1) {
                return -1;
            }

            return maps[n - 1][m - 1];
        }
    }

    public static void main(String[] args) {
        Solution sol = new Solution();

        System.out.println("=== Problem 2: 게임 맵 최단거리 ===\n");

        int[][][] testCases = {
                {
                        { 1, 0, 1, 1, 1 },
                        { 1, 0, 1, 0, 1 },
                        { 1, 0, 1, 1, 1 },
                        { 1, 1, 1, 0, 1 },
                        { 0, 0, 0, 0, 1 }
                },
                {
                        { 1, 0, 1, 1, 1 },
                        { 1, 0, 1, 0, 1 },
                        { 1, 0, 1, 1, 1 },
                        { 1, 1, 1, 0, 0 },
                        { 0, 0, 0, 0, 1 }
                }
        };
        int[] expected = { 11, -1 };

        for (int i = 0; i < testCases.length; i++) {
            int[][] maps = testCases[i];
            int exp = expected[i];
            int result = sol.solution(maps);
            String status = result == exp ? "✓" : "✗";

            System.out.println("Test " + (i + 1) + ":");
            for (int[] row : maps) {
                System.out.println("  " + Arrays.toString(row));
            }
            System.out.println("  결과: " + result + " (기대값: " + exp + ") " + status);
            System.out.println();
        }
    }
}
