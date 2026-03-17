# Part 5. Grid + 암시적 그래프

> **키워드**: `Grid` `2차원 배열` `암시적 그래프` `4방향/8방향` `경계 체크` `섬 개수` `최단 경로` `Flood Fill`

---

## 📌 목차

1. [Grid(격자)란?](#1-grid격자란)
2. [암시적 그래프란?](#2-암시적-그래프란)
3. [Grid에서의 이동 — 4방향과 8방향](#3-grid에서의-이동--4방향과-8방향)
4. [경계 체크 — 배열 범위 밖 방지](#4-경계-체크--배열-범위-밖-방지)
5. [Grid BFS 구현](#5-grid-bfs-구현)
6. [Grid DFS 구현](#6-grid-dfs-구현)
7. [명시적 그래프 vs Grid(암시적 그래프) 비교](#7-명시적-그래프-vs-grid암시적-그래프-비교)
8. [대표 문제 유형](#8-대표-문제-유형)
9. [실전 팁 & 자주 하는 실수](#9-실전-팁--자주-하는-실수)
10. [QUIZ](#quiz)

---

## 1. Grid(격자)란?

### 한 줄 정의

**Grid(격자)** 는 **2차원 배열**로 표현된 격자판이다. 각 칸 `(r, c)`가 노드이고, **인접한 칸**으로 이동할 수 있다.

### 시각화

```
int[][] grid = {
    {1, 1, 1, 1},
    {0, 1, 0, 1},
    {1, 0, 1, 0},
    {1, 0, 1, 1},
};

격자 시각화:
    c→  0  1  2  3
r↓
 0    [1][1][1][1]
 1    [0][1][0][1]
 2    [1][0][1][0]
 3    [1][0][1][1]

r = 행 (row, 세로)
c = 열 (column, 가로)
```

### 크기 표현

```java
int n = grid.length;       // 행의 수 (세로 길이)
int m = grid[0].length;    // 열의 수 (가로 길이)

// 위 예시: n=4, m=4 (4×4 격자)
```

> ⚠️ **주의**: `n`과 `m`이 헷갈릴 수 있다. `grid.length`는 **행(row)의 수**, `grid[0].length`는 **열(col)의 수**이다.

### Grid의 각 칸 = 그래프의 노드

```
grid[r][c] 한 칸 = 그래프의 노드 하나

(0,0) (0,1) (0,2) (0,3)
(1,0) (1,1) (1,2) (1,3)
(2,0) (2,1) (2,2) (2,3)
(3,0) (3,1) (3,2) (3,3)

→ 총 16개의 노드가 있는 것과 같다!
```

---

## 2. 암시적 그래프란?

### 한 줄 정의

**암시적 그래프(Implicit Graph)** 는 노드와 간선이 **미리 저장되지 않고**, 탐색하면서 **동적으로 생성**되는 그래프다.

### 명시적 그래프 vs 암시적 그래프

```
명시적 그래프 (Part 4에서 배운 것):
  → 인접 리스트/행렬로 간선을 미리 저장해둔다
  → adj.get(1) = [2, 3, 4]  ← "1번 노드에서 갈 수 있는 곳"이 이미 저장됨

암시적 그래프 (Grid):
  → 간선을 미리 저장하지 않는다
  → 대신 "규칙"으로 이웃을 알 수 있다
  → (r, c)의 이웃 = (r-1,c), (r+1,c), (r,c-1), (r,c+1)  ← 규칙!
  → 탐색하는 그 순간에 "갈 수 있는 곳"을 계산한다
```

### 왜 "암시적"인가?

```
Grid:
    [1][1][0]
    [0][1][1]
    [1][0][1]

(1,1)에서 갈 수 있는 곳은?
→ 상: (0,1) = 1 ✅
→ 하: (2,1) = 0 ❌ (벽!)
→ 좌: (1,0) = 0 ❌ (벽!)
→ 우: (1,2) = 1 ✅

→ 간선이 어디에도 저장되지 않았지만,
  "4방향으로 이동 + 값이 1인 칸만 이동 가능"이라는 규칙으로
  그 자리에서 바로 이웃을 알 수 있다!

이것이 "암시적(implicit)" 그래프다.
```

### 핵심 정리

| | 명시적 그래프 | 암시적 그래프 (Grid) |
|---|---|---|
| **간선 저장** | 인접 리스트/행렬에 미리 저장 | 저장 안 함, 규칙으로 계산 |
| **이웃 탐색** | `adj.get(node)` | dr/dc 배열로 4방향 계산 |
| **노드 표현** | 정수 하나 (`int node`) | 좌표 두 개 (`int r, int c`) |
| **방문 배열** | `boolean[] visited` (1차원) | `boolean[][] visited` (2차원) |
| **대표 예시** | SNS 친구 관계, 도로 네트워크 | 미로, 지도, 게임 맵 |

---

## 3. Grid에서의 이동 — 4방향과 8방향

### (r, c)에서의 이웃

```
          (r-1, c)         ← 상 (위)
             |
(r, c-1) — (r, c) — (r, c+1)    ← 좌, 현재, 우
             |
          (r+1, c)         ← 하 (아래)
```

### 4방향 이동 (상하좌우)

```java
// dr = row 변화량, dc = col 변화량
int[] dr = {-1, 1, 0, 0};    // 상, 하, 좌, 우 (row 변화)
int[] dc = {0, 0, -1, 1};    // 상, 하, 좌, 우 (col 변화)

// 사용: 현재 위치 (r, c)에서 4방향 이웃 구하기
for (int i = 0; i < 4; i++) {
    int nr = r + dr[i];   // next row
    int nc = c + dc[i];   // next col
}
```

```
i=0: dr=-1, dc= 0 → (r-1, c)   ← 상 (위로 한 칸)
i=1: dr= 1, dc= 0 → (r+1, c)   ← 하 (아래로 한 칸)
i=2: dr= 0, dc=-1 → (r, c-1)   ← 좌 (왼쪽으로 한 칸)
i=3: dr= 0, dc= 1 → (r, c+1)   ← 우 (오른쪽으로 한 칸)
```

> 💡 **외우는 팁**: dr/dc 배열은 짝으로 외우자. `{-1,1,0,0}` / `{0,0,-1,1}` — 상하는 row만 변하고, 좌우는 col만 변한다.

### 8방향 이동 (상하좌우 + 대각선)

```java
//                      상  하  좌  우  좌상 우상 좌하 우하
int[] dr = {-1, 1, 0, 0, -1, -1, 1, 1};
int[] dc = { 0, 0, -1, 1, -1, 1, -1, 1};
```

```
(r-1,c-1) (r-1,c) (r-1,c+1)     좌상  상  우상
(r,  c-1) (r,  c) (r,  c+1)      좌  현재  우
(r+1,c-1) (r+1,c) (r+1,c+1)     좌하  하  우하
```

> ⚠️ **주의**: 8방향은 **8개**의 값이 필요하다! 4방향에 대각선 4개를 추가한 것이다.

### 문제에서 방향 결정하기

```
문제: "상하좌우로 이동 가능"     → 4방향 (dr/dc 길이 4)
문제: "인접한 8칸으로 이동 가능"  → 8방향 (dr/dc 길이 8)
문제: "대각선 이동도 가능"       → 8방향

대부분의 코테 문제는 4방향이다!
```

---

## 4. 경계 체크 — 배열 범위 밖 방지

### 왜 필요한가?

```
Grid (3×3):
    [1][1][1]
    [0][1][0]
    [1][0][1]

현재 위치: (0, 0)
→ 상: (0-1, 0) = (-1, 0) → 💥 ArrayIndexOutOfBoundsException!
→ 좌: (0, 0-1) = (0, -1) → 💥 ArrayIndexOutOfBoundsException!

격자의 가장자리에서는 일부 방향이 배열 범위를 벗어난다!
→ 반드시 범위 체크를 해야 한다.
```

### 경계 체크 코드

```java
// nr, nc가 격자 안에 있는지 확인
if (nr >= 0 && nr < n && nc >= 0 && nc < m) {
    // 격자 안에 있음 → 접근 가능
}
```

```
4가지 조건:
  nr >= 0    → 위로 벗어나지 않음
  nr < n     → 아래로 벗어나지 않음
  nc >= 0    → 왼쪽으로 벗어나지 않음
  nc < m     → 오른쪽으로 벗어나지 않음

하나라도 만족하지 않으면 → 격자 밖! → 무시
```

### Grid 탐색의 전체 패턴 (for문 안에서)

```java
for (int i = 0; i < 4; i++) {
    int nr = r + dr[i];
    int nc = c + dc[i];

    // 1. 경계 체크
    if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;

    // 2. 이동 가능 조건 (예: 벽이 아닌 곳)
    if (grid[nr][nc] == 0) continue;

    // 3. 방문 여부 체크
    if (visited[nr][nc]) continue;

    // 4. 이동!
    // ...
}
```

> 💡 **팁**: `if (조건) continue;` 패턴으로 쓰면 중첩 if문보다 읽기 쉽다. 불가능한 경우를 먼저 걸러내는 **얼리 리턴(Early Return)** 스타일.

---

## 5. Grid BFS 구현

### Part 4의 BFS와 뭐가 달라졌나?

```
Part 4 (명시적 그래프)              Part 5 (Grid / 암시적 그래프)
─────────────────────────────────────────────────────────────
노드: int (번호)                   노드: int[] {r, c} (좌표)
이웃: adj.get(cur)                 이웃: dr/dc 배열로 4방향 계산
방문: boolean[] visited            방문: boolean[][] visited
경계: 없음                         경계: 0 ≤ nr < n, 0 ≤ nc < m
이동 조건: 없음 (간선 있으면 이동)    이동 조건: grid[nr][nc] == 1 등

→ 3단계 구조(예약 → 방문 → 다음 예약)는 완전히 동일!
```

### BFS 코드

```java
void bfs(int sr, int sc, int[][] grid, boolean[][] visited) {
    int n = grid.length;
    int m = grid[0].length;
    int[] dr = {-1, 1, 0, 0};
    int[] dc = {0, 0, -1, 1};

    // 1. 시작 노드 예약
    Queue<int[]> queue = new ArrayDeque<>();
    queue.offer(new int[]{sr, sc});
    visited[sr][sc] = true;

    while (!queue.isEmpty()) {
        // 2. 방문
        int[] cur = queue.poll();
        int r = cur[0];
        int c = cur[1];

        // 3. 다음 노드 예약 (4방향)
        for (int i = 0; i < 4; i++) {
            int nr = r + dr[i];
            int nc = c + dc[i];

            // 경계 체크
            if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
            // 이동 가능 조건
            if (grid[nr][nc] != 1) continue;
            // 방문 여부
            if (visited[nr][nc]) continue;

            queue.offer(new int[]{nr, nc});
            visited[nr][nc] = true;
        }
    }
}
```

### BFS 탐색 과정 시각화

```
grid:                     시작: (0,0)
    [1][1][0][1]
    [0][1][0][1]
    [1][0][1][0]
    [1][0][1][1]

Step 1: 큐=[{0,0}]  방문={(0,0)}
  꺼냄: (0,0) → 이웃 중 이동 가능: (0,1)✅
  큐=[{0,1}]  방문={(0,0),(0,1)}

Step 2:
  꺼냄: (0,1) → 이웃: (1,1)✅
  큐=[{1,1}]  방문={(0,0),(0,1),(1,1)}

Step 3:
  꺼냄: (1,1) → 이웃: 상(0,1)방문, 하(2,1)=0, 좌(1,0)=0, 우(1,2)=0
  → 갈 곳 없음!
  큐=[]  → 종료

→ (0,0)에서 시작하면 {(0,0), (0,1), (1,1)} 3칸이 연결된 영역
```

---

## 6. Grid DFS 구현

### DFS 코드

```java
void dfs(int r, int c, int[][] grid, boolean[][] visited) {
    int n = grid.length;
    int m = grid[0].length;
    int[] dr = {-1, 1, 0, 0};
    int[] dc = {0, 0, -1, 1};

    // 1. 방문
    visited[r][c] = true;

    // 2. 방문 안 한 다음 노드 찾기
    for (int i = 0; i < 4; i++) {
        int nr = r + dr[i];
        int nc = c + dc[i];

        // 경계 체크
        if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
        // 이동 가능 조건
        if (grid[nr][nc] != 1) continue;
        // 방문 여부
        if (visited[nr][nc]) continue;

        // 3. 다음 노드 DFS 실행
        dfs(nr, nc, grid, visited);
    }
}
```

### Part 4 DFS와 비교

```java
// Part 4: 명시적 그래프 DFS
void dfs(int cur, List<List<Integer>> graph, boolean[] visited) {
    visited[cur] = true;
    for (int next : graph.get(cur)) {       // ← 인접 리스트에서 이웃 가져옴
        if (!visited[next]) {
            dfs(next, graph, visited);
        }
    }
}

// Part 5: Grid DFS
void dfs(int r, int c, int[][] grid, boolean[][] visited) {
    visited[r][c] = true;
    for (int i = 0; i < 4; i++) {           // ← dr/dc로 4방향 이웃 계산
        int nr = r + dr[i];
        int nc = c + dc[i];
        if (경계 안 && grid[nr][nc] == 1 && !visited[nr][nc]) {
            dfs(nr, nc, grid, visited);
        }
    }
}

// 구조는 완전히 같다! "이웃을 가져오는 방법"만 다를 뿐.
```

---

## 7. 명시적 그래프 vs Grid(암시적 그래프) 비교

| 비교 항목 | 명시적 그래프 (Part 4) | Grid / 암시적 그래프 (Part 5) |
|:---------:|:---------------------:|:---------------------------:|
| **노드** | `int node` (번호 1개) | `int r, int c` (좌표 2개) |
| **간선** | 인접 리스트에 미리 저장 | dr/dc 배열로 그때그때 계산 |
| **방문 배열** | `boolean[N]` | `boolean[N][M]` |
| **큐에 넣는 것** | `int` | `int[]{r, c}` |
| **이웃 탐색** | `for (int next : adj.get(cur))` | `for (int i = 0; i < 4; i++)` |
| **경계 체크** | 필요 없음 | **필수** (`0 ≤ nr < n, 0 ≤ nc < m`) |
| **이동 조건** | 간선 있으면 이동 | `grid[nr][nc]` 값 확인 필요 |
| **BFS/DFS 구조** | 동일 | 동일 |

> 💡 **핵심**: 그래프 BFS/DFS와 Grid BFS/DFS는 **구조가 같다.** "노드를 표현하는 방식"과 "이웃을 찾는 방식"만 다를 뿐!

---

## 8. 대표 문제 유형

### 유형 1: 섬 개수 세기 (Number of Islands)

Part 4에서 배운 "연결된 영역 개수"의 Grid 버전이다.

```
grid:
    [1][1][0][0][0]
    [1][1][0][0][0]
    [0][0][1][0][0]
    [0][0][0][1][1]

섬(1로 연결된 영역) = 3개
  섬1: {(0,0),(0,1),(1,0),(1,1)}
  섬2: {(2,2)}
  섬3: {(3,3),(3,4)}
```

```java
int countIslands(int[][] grid) {
    int n = grid.length;
    int m = grid[0].length;
    boolean[][] visited = new boolean[n][m];
    int count = 0;

    for (int r = 0; r < n; r++) {
        for (int c = 0; c < m; c++) {
            if (grid[r][c] == 1 && !visited[r][c]) {
                dfs(r, c, grid, visited);   // 연결된 영역 전체 방문
                count++;                     // 섬 하나 완료!
            }
        }
    }

    return count;
}
```

```
Part 4의 네트워크 개수와 비교:

Part 4:                              Part 5 (Grid):
for (int i = 0; i < n; i++) {       for (int r = 0; r < n; r++) {
    if (!visited[i]) {                   for (int c = 0; c < m; c++) {
        dfs(i, ...);                         if (grid[r][c] == 1 && !visited[r][c]) {
        count++;                                 dfs(r, c, ...);
    }                                            count++;
}                                            }
                                         }
                                     }

→ 1차원 순회가 2차원 순회로 바뀌었을 뿐, 로직은 동일!
```

---

### 유형 2: 영역의 크기 (가장 큰 섬)

DFS/BFS 실행 시 방문한 칸의 수를 세면 된다.

```java
int dfsCount(int r, int c, int[][] grid, boolean[][] visited) {
    int n = grid.length;
    int m = grid[0].length;
    int[] dr = {-1, 1, 0, 0};
    int[] dc = {0, 0, -1, 1};

    visited[r][c] = true;
    int count = 1;  // 현재 칸 포함

    for (int i = 0; i < 4; i++) {
        int nr = r + dr[i];
        int nc = c + dc[i];

        if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
        if (grid[nr][nc] != 1) continue;
        if (visited[nr][nc]) continue;

        count += dfsCount(nr, nc, grid, visited);
    }

    return count;
}

// 가장 큰 섬 찾기
int maxIsland = 0;
for (int r = 0; r < n; r++) {
    for (int c = 0; c < m; c++) {
        if (grid[r][c] == 1 && !visited[r][c]) {
            maxIsland = Math.max(maxIsland, dfsCount(r, c, grid, visited));
        }
    }
}
```

---

### 유형 3: 최단 경로 (미로 탈출)

```
grid (벽:1, 길:0):
    [0][0][0][1][1]
    [1][1][0][1][1]
    [1][1][0][1][1]
    [1][0][0][0][0]
    [1][1][1][1][0]

시작: (0,0) → 도착: (4,4)
최단 경로: (0,0)→(0,1)→(0,2)→(1,2)→(2,2)→(3,2)→(3,3)→(3,4)→(4,4)
→ 최단 거리 = 8
```

```java
int bfsShortestPath(int[][] grid, int sr, int sc, int er, int ec) {
    int n = grid.length;
    int m = grid[0].length;
    int[] dr = {-1, 1, 0, 0};
    int[] dc = {0, 0, -1, 1};
    boolean[][] visited = new boolean[n][m];

    // 1. 시작 노드 예약 — {row, col, 거리}
    Queue<int[]> queue = new ArrayDeque<>();
    queue.offer(new int[]{sr, sc, 0});
    visited[sr][sc] = true;

    while (!queue.isEmpty()) {
        // 2. 방문
        int[] cur = queue.poll();
        int r = cur[0], c = cur[1], dist = cur[2];

        // 도착하면 거리 리턴
        if (r == er && c == ec) {
            return dist;
        }

        // 3. 다음 노드 예약
        for (int i = 0; i < 4; i++) {
            int nr = r + dr[i];
            int nc = c + dc[i];

            if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
            if (grid[nr][nc] != 0) continue;   // 0이 길!
            if (visited[nr][nc]) continue;

            queue.offer(new int[]{nr, nc, dist + 1});
            visited[nr][nc] = true;
        }
    }

    return -1;  // 도달 불가
}
```

```
Part 4의 최단 거리 BFS와 비교:

Part 4: queue.offer(new int[]{node, dist})
Part 5: queue.offer(new int[]{r, c, dist})

→ 노드가 int 하나에서 (r, c) 두 개로 바뀌었을 뿐, 동일한 패턴!
```

> 💡 **기억하기**: "최단 거리" 문제 → BFS + `int[]{r, c, dist}` 패턴. Grid에서도 Part 4와 같은 원리!

---

### 유형 4: Flood Fill (영역 채우기)

그림판에서 "페인트 통" 도구와 같은 원리다. 특정 칸에서 시작해서 같은 값으로 연결된 영역을 새로운 값으로 바꾼다.

```
시작: (1,1), 새 색: 2

Before:              After:
[1][1][1]            [2][2][2]
[1][1][0]     →      [2][2][0]
[1][0][1]            [2][0][1]

(1,1)에서 시작, 값이 1인 연결된 칸을 전부 2로 변경
```

```java
void floodFill(int[][] grid, int r, int c, int newColor) {
    int oldColor = grid[r][c];
    if (oldColor == newColor) return;  // 같으면 할 필요 없음
    dfsFill(grid, r, c, oldColor, newColor);
}

void dfsFill(int[][] grid, int r, int c, int oldColor, int newColor) {
    int n = grid.length, m = grid[0].length;
    int[] dr = {-1, 1, 0, 0};
    int[] dc = {0, 0, -1, 1};

    grid[r][c] = newColor;  // 색 변경 (= 방문 표시 겸용!)

    for (int i = 0; i < 4; i++) {
        int nr = r + dr[i];
        int nc = c + dc[i];

        if (nr < 0 || nr >= n || nc < 0 || nc >= m) continue;
        if (grid[nr][nc] != oldColor) continue;   // 같은 색이 아니면 스킵

        dfsFill(grid, nr, nc, oldColor, newColor);
    }
}
```

> 💡 Flood Fill에서는 `visited` 배열이 필요 없다! 값을 바꾸는 것 자체가 방문 표시 역할을 한다. (`oldColor → newColor`로 바뀌면 다시 방문하지 않으니까)

---

## 9. 실전 팁 & 자주 하는 실수

### Grid 문제 풀이 순서

```
1. 격자의 의미 파악
   → 벽과 길의 값은? (0이 벽? 1이 벽?)
   → 4방향? 8방향?

2. 문제 유형 파악
   → 영역 개수 세기? → DFS/BFS + 2중 for문
   → 최단 거리?     → BFS + dist
   → 영역 채우기?   → Flood Fill (DFS/BFS)

3. 코드 작성
   → dr/dc 배열 선언
   → visited 배열 선언 (또는 grid 자체를 변경)
   → 경계 체크 잊지 말기!
```

### 자주 하는 실수

| 실수 | 결과 | 해결 |
|------|------|------|
| **경계 체크 안 함** | `ArrayIndexOutOfBoundsException` | `nr >= 0 && nr < n && nc >= 0 && nc < m` |
| **n, m 헷갈림** | 직사각형 격자에서 오답 | `n = grid.length`(행), `m = grid[0].length`(열) |
| **벽/길 값 반대로** | 벽을 뚫고 지나감 | 문제를 다시 읽고 `grid[nr][nc]` 조건 확인 |
| **8방향인데 4방향만 탐색** | 연결된 영역이 끊김 | 문제에서 "인접" 정의 확인 |
| **dr/dc 배열 개수 불일치** | 일부 방향 누락 | 4방향이면 4개, 8방향이면 **8개** 확인! |
| **BFS에서 꺼낼 때 방문 표시** | 같은 칸 중복 방문 → TLE | **넣을 때** `visited = true` |
| **DFS 재귀 깊이 초과** | `StackOverflowError` | Grid가 매우 크면 BFS 사용 |

### dr/dc 실수하기 쉬운 포인트

```java
// ❌ 8방향인데 7개만 있음 (하나 빠짐!)
int[] dr = {-1, 1, 0, 0, 1, -1, -1};
int[] dc = {0, 0, -1, 1, 1, -1, 1};

// ✅ 8방향 정확한 배열 (8개!)
int[] dr = {-1, -1, -1, 0, 0, 1, 1, 1};
int[] dc = {-1, 0, 1, -1, 1, -1, 0, 1};
```

> 💡 **팁**: dr/dc 배열을 선언한 후 `for (int i = 0; i < dr.length; i++)` 로 쓰면 개수를 틀릴 일이 없다. 하드코딩된 `4`나 `8` 대신 `dr.length`를 쓰자.

---

## 🧩 QUIZ

### 📋 QUIZ 1 — Grid BFS 탐색 순서

다음 Grid에서 **(0, 0)부터 BFS**로 탐색하면 방문하는 칸은?
(1인 칸만 이동 가능, 4방향)

```
[1][1][0]
[1][0][0]
[0][0][1]
```

---

<details>
<summary><b>정답 보기 (클릭)</b></summary>

```
방문하는 칸: (0,0), (0,1), (1,0)
```

### 풀이

```
Step 1: 큐=[{0,0}]
  꺼냄(0,0) → 이웃: 상(범위밖), 하(1,0)=1✅, 좌(범위밖), 우(0,1)=1✅
  큐=[{1,0}, {0,1}]

Step 2:
  꺼냄(1,0) → 이웃: 상(0,0)방문, 하(2,0)=0, 좌(범위밖), 우(1,1)=0
  큐=[{0,1}]

Step 3:
  꺼냄(0,1) → 이웃: 상(범위밖), 하(1,1)=0, 좌(0,0)방문, 우(0,2)=0
  큐=[] → 종료!
```

> 💡 (2,2)의 1은 다른 칸과 연결되어 있지 않아서 방문할 수 없다. 이것은 **별도의 섬**이다!

</details>

---

### 📋 QUIZ 2 — 섬 개수

다음 Grid에서 **섬(1로 연결된 영역)의 개수**는? (4방향 기준)

```
[1][0][1][1]
[1][0][0][1]
[0][0][0][0]
[1][1][0][1]
```

---

<details>
<summary><b>정답 보기 (클릭)</b></summary>

```
섬 개수: 4개
```

### 풀이

```
섬 1: {(0,0), (1,0)}            ← 좌측 상단
섬 2: {(0,2), (0,3), (1,3)}     ← 우측 상단
섬 3: {(3,0), (3,1)}            ← 좌측 하단
섬 4: {(3,3)}                   ← 우측 하단

시각화 (같은 섬을 같은 기호로):
    [A][0][B][B]
    [A][0][0][B]
    [0][0][0][0]
    [C][C][0][D]
```

> 💡 4방향 기준이므로 **대각선으로는 연결되지 않는다!** (0,0)과 (1,1)은 연결 아님.

</details>

---

### 📋 QUIZ 3 — 최단 거리

다음 Grid에서 **(0,0)에서 (2,4)까지 최단 거리**는? (0이 길, 1이 벽, 4방향)

```
[0][0][0][1][0]
[1][1][0][1][0]
[0][0][0][0][0]
```

---

<details>
<summary><b>정답 보기 (클릭)</b></summary>

```
최단 거리: 6
```

### 풀이

```
경로: (0,0)→(0,1)→(0,2)→(1,2)→(2,2)→(2,3)→(2,4)

시각화 (경로를 *로 표시):
    [*][*][*][1][0]
    [1][1][*][1][0]
    [0][0][*][*][*]  ← (2,4) 도착!

거리 = 이동 횟수 = 6
```

> 💡 BFS는 레벨 순서대로 탐색하므로, (2,4)를 **처음 방문했을 때의 거리 = 최단 거리**!

</details>

---

### 📋 QUIZ 4 — 이 코드의 문제점은?

```java
void dfs(int r, int c, int[][] grid) {
    int n = grid.length;
    int m = grid[0].length;
    int[] dr = {-1, 1, 0, 0};
    int[] dc = {0, 0, -1, 1};

    for (int i = 0; i < 4; i++) {
        int nr = r + dr[i];
        int nc = c + dc[i];
        if (grid[nr][nc] == 1) {
            dfs(nr, nc, grid);
        }
    }
}
```

---

<details>
<summary><b>정답 보기 (클릭)</b></summary>

### 문제점 3가지!

**1. 경계 체크가 없다!**
```java
// ❌ nr, nc가 격자 밖일 수 있다
if (grid[nr][nc] == 1)  // → ArrayIndexOutOfBoundsException!

// ✅ 경계 체크 추가
if (nr >= 0 && nr < n && nc >= 0 && nc < m && grid[nr][nc] == 1)
```

**2. visited 배열이 없다!**
```java
// ❌ 이미 방문한 칸을 다시 방문 → 무한 재귀 → StackOverflowError!

// ✅ visited 추가
boolean[][] visited = new boolean[n][m];
visited[r][c] = true;  // 방문 표시
if (!visited[nr][nc]) { dfs(nr, nc, grid, visited); }
```

**3. 현재 칸의 방문 처리가 없다!**
```java
// ❌ visited[r][c] = true가 없으면 시작 칸을 다시 방문할 수 있다

// ✅ 함수 맨 위에 방문 표시
visited[r][c] = true;
```

> 💡 **교훈**: Grid DFS/BFS에서는 **경계 체크 + visited + 방문 표시** 3가지가 세트다!

</details>

---

## 📝 Part 5 핵심 정리

```
1. Grid = 2차원 배열, 각 칸 (r,c)가 노드, 인접한 칸이 이웃
2. 암시적 그래프 = 간선을 저장하지 않고 dr/dc 규칙으로 이웃을 계산
3. n = grid.length (행 수), m = grid[0].length (열 수) — 헷갈리지 말 것!
4. 4방향: dr={-1,1,0,0}, dc={0,0,-1,1} / 8방향: 8개씩!
5. 경계 체크 필수: 0 ≤ nr < n, 0 ≤ nc < m
6. Grid BFS/DFS는 Part 4의 BFS/DFS와 구조가 동일 — "이웃 찾는 방법"만 다르다
7. 섬 개수 = 2중 for문 + DFS/BFS (Part 4 네트워크 개수의 Grid 버전)
8. 최단 거리 = BFS + int[]{r, c, dist} (Part 4와 동일 패턴)
9. Flood Fill = 색 변경 자체가 visited 역할 → visited 배열 불필요
10. 자주 하는 실수: 경계 체크 누락, n/m 혼동, 벽/길 값 반대
```

---

> 📚 **다음 학습 예고**: 백트래킹(Backtracking), 순열/조합의 재귀 구현
