# Part 5. 고급 그래프 알고리즘 (다익스트라 / 위상정렬)

> **키워드**: `힙` `우선순위 큐` `다익스트라` `최단 경로` `위상정렬` `DAG` `진입 차수`

---

## 📌 목차

1. [힙(Heap) — 우선순위 큐의 기반](#1-힙-heap--우선순위-큐의-기반)
2. [우선순위 큐(Priority Queue)](#2-우선순위-큐-priority-queue)
3. [다익스트라 알고리즘 — 가중치 그래프의 최단 경로](#3-다익스트라-알고리즘--가중치-그래프의-최단-경로)
4. [위상정렬(Topological Sort) — DAG의 순서 결정](#4-위상정렬-topological-sort--dag의-순서-결정)
5. [실전 팁 & 자주 하는 실수](#5-실전-팁--자주-하는-실수)
6. [QUIZ](#quiz)

---

## 1. 힙(Heap) — 우선순위 큐의 기반

### 힙이란?

**힙(Heap)** 은 부모 노드가 자식 노드보다 **항상 우선** 인 완전 이진 트리다. 이진 탐색 트리와 달리 **왼쪽/오른쪽 구분이 없고**, 부모만 자식보다 크거나 작으면 된다.

```
Min Heap (최소힙):              Max Heap (최대힙):
부모 < 자식                     부모 > 자식

      (1)                            (10)
     /   \                          /    \
   (2)   (3)                      (9)    (8)
  /  \   /                       /  \   /
(4) (5)(6)                     (7) (5)(6)

최소값이 루트            최대값이 루트
→ 최솟값을 빨리 뽑을 수 있음     → 최댓값을 빨리 뽑을 수 있음
```

### 힙의 성질

| 성질 | 설명 |
|------|------|
| **Complete Binary Tree** | 마지막 레벨을 제외한 모든 레벨이 가득 참 |
| **Heap Property** | 부모 노드가 자식 노드보다 항상 우선 (min heap: 작음, max heap: 큼) |
| **배열 표현** | 배열로 저장 가능 (부모 = i, 자식 = 2i+1, 2i+2) |
| **시간 복잡도** | 삽입/삭제 O(log n), 최댓값/최솟값 조회 O(1) |

### Min Heap vs Max Heap

```java
// Java에서 사용하는 PriorityQueue

// Min Heap (작은 값이 먼저 나옴)
Queue<Integer> minHeap = new PriorityQueue<>();  // 기본값
minHeap.add(5);
minHeap.add(1);
minHeap.add(3);
System.out.println(minHeap.poll());  // 1 출력

// Max Heap (큰 값이 먼저 나옴)
Queue<Integer> maxHeap = new PriorityQueue<>((a, b) -> b - a);  // Comparator로 역순
maxHeap.add(5);
maxHeap.add(1);
maxHeap.add(3);
System.out.println(maxHeap.poll());  // 5 출력
```

> 💡 **코테에서**: PriorityQueue는 기본이 Min Heap이다. Max Heap이 필요하면 Comparator를 역순으로 설정하자.

---

## 2. 우선순위 큐(Priority Queue)

### 우선순위 큐란?

**우선순위 큐(Priority Queue)** 는 일반 큐와 달리 **우선순위가 높은 원소가 먼저 나오는** 자료구조다. 내부적으로 힙을 사용해 구현된다.

```
일반 큐 (FIFO):          우선순위 큐:
[1, 2, 3, 4] → 1 출력    [1(우선3), 2(우선1), 3(우선2)] → 1 출력 (우선도 3)
                         → 3 출력 (우선도 2)
```

### 사용 예시

```java
// 객체를 우선순위 큐에 넣을 때
class Node implements Comparable<Node> {
    int node;
    int cost;

    public Node(int node, int cost) {
        this.node = node;
        this.cost = cost;
    }

    // cost가 작을수록 우선 (min heap)
    @Override
    public int compareTo(Node other) {
        return Integer.compare(this.cost, other.cost);
    }
}

// 사용
Queue<Node> pq = new PriorityQueue<>();
pq.add(new Node(1, 5));
pq.add(new Node(2, 2));
pq.add(new Node(3, 8));

Node first = pq.poll();  // cost=2인 노드 (2번)
Node second = pq.poll(); // cost=5인 노드 (1번)
```

### 코테에서의 활용

| 상황 | 활용 |
|------|------|
| **최단 경로 (다익스트라)** | 가장 짧은 거리의 노드부터 처리 |
| **최댓값/최솟값 반복 찾기** | "반복적으로 가장 큰/작은 것을 뽑아야 함" |
| **작업 스케줄링** | 우선순위가 높은 작업부터 처리 |

---

## 3. 다익스트라 알고리즘 — 가중치 그래프의 최단 경로

### 핵심 개념

**다익스트라(Dijkstra)** 는 **가중치 그래프**에서 한 노드에서 다른 모든 노드까지의 **최단 경로**를 구하는 알고리즘이다.

| | 비가중치 그래프 | 가중치 그래프 |
|---|---|---|
| **최단 경로** | BFS로 가능 | 다익스트라 필요 |
| **이유** | 모든 간선이 동일한 비용 | 간선마다 비용이 다름 |
| **예시** | "최소 몇 칸?" | "최소 비용이?" |

```
비가중치: (1)---(2)---(3)   최단 거리 1→3 = 2
         가중치: (1)--10--(2)--1--(3)   최단 거리 1→3 = 11
         비가중치로는 2칸으로 보이지만, 가중치를 고려하면 우회로가 나을 수 있음
```

### 알고리즘 아이디어

```
1. 시작 노드를 우선순위 큐에 넣음 (거리 = 0)
2. 우선순위 큐에서 거리가 가장 짧은 노드를 뽑음
3. 이미 방문했으면 스킵 (더 짧은 경로로 온 것)
4. 현재 노드의 이웃들의 거리를 업데이트
5. 업데이트된 이웃을 우선순위 큐에 추가
6. 큐가 비워질 때까지 반복

→ 각 노드마다 한 번씩만 "최종 처리"되므로 O(E log V) 시간에 완료
```

### 코드

```java
class Edge {
    int to;
    int distance;

    public Edge(int to, int distance) {
        this.to = to;
        this.distance = distance;
    }
}

class Node implements Comparable<Node> {
    int node;
    int distance;

    public Node(int node, int distance) {
        this.node = node;
        this.distance = distance;
    }

    @Override
    public int compareTo(Node other) {
        return Integer.compare(this.distance, other.distance);  // 거리 짧은 순
    }
}

int dijkstra(Map<Integer, List<Edge>> graph, int start, int end, int n) {
    final int INF = Integer.MAX_VALUE;
    int[] distance = new int[n + 1];
    Arrays.fill(distance, INF);

    Queue<Node> pq = new PriorityQueue<>();
    pq.add(new Node(start, 0));
    distance[start] = 0;

    while (!pq.isEmpty()) {
        Node current = pq.poll();

        // 이미 더 짧은 경로로 방문했으면 스킵
        if (distance[current.node] < current.distance) {
            continue;
        }

        // 이웃 노드들 거리 업데이트
        for (Edge edge : graph.getOrDefault(current.node, new ArrayList<>())) {
            int newDist = current.distance + edge.distance;

            // 더 짧은 경로를 발견했으면 업데이트
            if (newDist < distance[edge.to]) {
                distance[edge.to] = newDist;
                pq.add(new Node(edge.to, newDist));
            }
        }
    }

    return distance[end] == INF ? -1 : distance[end];
}
```

### 단계별 실행 예시

```
그래프:  (1)--1--(2)--2--(5)
         |  \    |
         4   3   1
         |    \  |
        (3)----(4)

dijkstra(graph, 1, 5)

[초기화]
distance = [INF, 0, INF, INF, INF, INF]
pq = [(1, 0)]

[1단계] 노드 1 처리
  이웃: 2(비용1), 3(비용4), 4(비용3)
  distance = [INF, 0, 1, 4, 3, INF]
  pq = [(2, 1), (4, 3), (3, 4)]

[2단계] 노드 2 처리 (거리 1)
  이웃: 4(비용1), 5(비용2)
  distance = [INF, 0, 1, 4, 2, 3]  ← 4: 3→2, 5: INF→3
  pq = [(4, 2), (5, 3), (4, 3), (3, 4)]

[3단계] 노드 4 처리 (거리 2) ← (4,3)은 스킵 (이미 2로 처리함)
  이웃: 3(비용1), 5(비용2)
  distance = [INF, 0, 1, 3, 2, 3]  ← 3: 4→3
  pq = [(3, 3), (5, 3), (5, 4), (3, 4)]

[4단계] 노드 3 처리 (거리 3)
  이웃: 1, 2, 4 모두 이미 더 짧은 거리로 도달
  pq = [(5, 3), (5, 4), (3, 4)]

[5단계] 노드 5 처리 (거리 3) ← (5,4)는 스킵
  최종 distance[5] = 3 ✅

→ 결과: 1에서 5까지 최단 거리 = 3
경로: 1 → 2 → 4 → 5 (비용: 1+1+2=4) 또는
     1 → 2 → 5 (비용: 1+2=3) ← 이것이 최단
```

### 핵심 포인트

```
⚠️ visited 배열을 쓰지 않는다!

❌ 잘못된 예:
if (visited[current.node]) continue;
visited[current.node] = true;

✅ 올바른 예:
if (distance[current.node] < current.distance) continue;

이유: 같은 노드를 여러 거리로 방문할 수 있고,
      더 짧은 거리로 온 것만 처리하면 되기 때문!
```

### 시간복잡도

- **시간**: O(E log V) — 각 간선을 한 번 봄, 우선순위 큐는 O(log V)
- **공간**: O(V) — distance 배열

> 💡 BFS는 모든 노드를 방문하지만, 다익스트라는 최단 거리가 확정된 노드부터만 처리한다.

---

## 4. 위상정렬(Topological Sort) — DAG의 순서 결정

### 핵심 개념

**위상정렬(Topological Sort)** 는 **방향 비순환 그래프(DAG, Directed Acyclic Graph)** 의 모든 노드를 방향을 따르도록 **일렬로 정렬**하는 알고리즘이다.

```
예시: 수강 선수 조건
  데이터 구조 → 알고리즘 → 고급 알고리즘
  선형대수 → 머신러닝
  
→ 위상정렬 결과: [데이터 구조, 선형대수, 알고리즘, 머신러닝, 고급 알고리즘]
  (선수 조건을 모두 만족하는 순서)
```

### 핵심: 진입 차수 (In-degree)

**진입 차수(In-degree)** = 어떤 노드로 **들어오는** 간선의 개수

```
    (1)
   /   \
 (2)   (3)
   \   /
   (4)

노드 1: 진입 차수 0 (아무도 1을 가리키지 않음)
노드 2: 진입 차수 1 (1→2)
노드 3: 진입 차수 1 (1→3)
노드 4: 진입 차수 2 (2→4, 3→4)
```

### 알고리즘 (Kahn의 알고리즘)

```
1. 모든 노드의 진입 차수를 계산
2. 진입 차수가 0인 노드를 큐에 넣음 (의존성이 없음)
3. 큐에서 노드를 꺼내 결과에 추가
4. 그 노드로부터 나가는 간선을 제거 (이웃의 진입 차수 -1)
5. 이웃의 진입 차수가 0이 되면 큐에 추가
6. 큐가 비워질 때까지 반복

→ 모든 의존성을 먼저 처리한 순서대로 배열됨!
```

### 코드

```java
int[] topologicalSort(int n, int[][] edges) {
    // 1. 그래프 구축 + 진입 차수 계산
    Map<Integer, List<Integer>> graph = new HashMap<>();
    int[] indegree = new int[n];

    for (int[] edge : edges) {
        int from = edge[0];
        int to = edge[1];

        graph.putIfAbsent(from, new ArrayList<>());
        graph.get(from).add(to);
        indegree[to]++;  // to의 진입 차수 증가
    }

    // 2. 진입 차수가 0인 노드를 큐에 추가
    Queue<Integer> queue = new ArrayDeque<>();
    for (int i = 0; i < n; i++) {
        if (indegree[i] == 0) {
            queue.add(i);
        }
    }

    // 3. 위상정렬 수행
    int[] order = new int[n];
    int count = 0;

    while (!queue.isEmpty()) {
        int current = queue.poll();
        order[count++] = current;

        // 현재 노드로부터 나가는 간선 제거
        if (graph.containsKey(current)) {
            for (int next : graph.get(current)) {
                indegree[next]--;  // next의 진입 차수 감소

                // next의 모든 의존성이 해결되면 큐에 추가
                if (indegree[next] == 0) {
                    queue.add(next);
                }
            }
        }
    }

    // 4. 모든 노드가 정렬되었는지 확인 (사이클 검출)
    if (count != n) {
        return new int[0];  // 사이클 존재!
    }

    return order;
}
```

### 단계별 실행 예시

```
간선: 0→1, 0→2, 1→3, 2→3
노드 수: 4

[초기화]
indegree = [0, 1, 1, 2]
graph: 0→[1,2], 1→[3], 2→[3]
queue = [0] (진입 차수 0인 노드)

[단계 1] 노드 0 처리
  order[0] = 0
  0의 이웃: 1, 2
  indegree = [0, 0, 0, 2]
  queue = [1, 2] (진입 차수가 0이 된 노드들)

[단계 2] 노드 1 처리
  order[1] = 1
  1의 이웃: 3
  indegree = [0, 0, 0, 1]
  queue = [2]

[단계 3] 노드 2 처리
  order[2] = 2
  2의 이웃: 3
  indegree = [0, 0, 0, 0]
  queue = [3]

[단계 4] 노드 3 처리
  order[3] = 3
  3의 이웃: 없음
  queue = []

→ 결과: [0, 1, 2, 3] ✅
```

### 코테에서 나오는 형태

```
"작업 순서 결정" → 위상정렬
"학습 선수 조건" → 위상정렬
"의존성 해결" → 위상정렬

❌ 사이클이 있으면 안 됨!
  예: A→B→C→A (순환 의존성)
  → 위상정렬 불가능 = return -1 또는 empty array
```

---

## 5. 실전 팁 & 자주 하는 실수

### 다익스트라 vs 위상정렬

| | 다익스트라 | 위상정렬 |
|---|---|---|
| **목표** | **최단 경로** 구하기 | **순서** 결정하기 |
| **전제 조건** | 음수 가중치 없음 | 사이클 없음 (DAG) |
| **사용 자료구조** | 우선순위 큐 | 큐 (진입 차수) |
| **시간 복잡도** | O(E log V) | O(V + E) |
| **예시** | "최소 비용은?", "최단 거리는?" | "실행 순서는?", "선수 조건 충족?" |

### 자주 하는 실수

| 실수 | 결과 | 해결 |
|------|------|------|
| 다익스트라에서 visited 사용 | 잘못된 최단 경로 | `distance[node] < dist` 체크로 충분 |
| 우선순위 큐에 잘못된 정렬 | 알고리즘 실패 | `Comparable` 또는 `Comparator` 올바르게 구현 |
| 위상정렬에서 사이클 미검사 | 틀린 답 | count != n이면 사이클 존재 체크 |
| 간선 구축 시 진입 차수 계산 누락 | NullPointerException | 항상 `indegree[to]++` 잊지 말기 |
| INF 값을 Integer.MAX_VALUE로 설정 | 오버플로우 | INF + 가중치 계산 시 Long 사용 또는 충분히 큰 값 |

### 코테 풀이 체크리스트

**다익스트라 문제 풀 때:**
```
☐ 가중치 그래프인가? (비가중치면 BFS!)
☐ 음수 가중치가 없는가? (있으면 벨만-포드)
☐ 시작점이 명확한가?
☐ Comparable 구현했는가?
☐ distance 배열 초기화했는가? (INF)
☐ distance[node] < dist 체크했는가?
```

**위상정렬 문제 풀 때:**
```
☐ 방향 그래프인가?
☐ 사이클이 없는가? (있으면 불가능 -1 리턴)
☐ 진입 차수 계산 맞는가?
☐ 큐에 진입 차수 0인 노드 모두 넣었는가?
☐ 최종 count == n 확인했는가? (사이클 검출)
```

---

## 🧩 QUIZ

### 📋 QUIZ 1 — 다익스트라 vs BFS

다음 상황에서 어떤 알고리즘을 써야 할까?

```
1) 지도에서 "최소 비용으로 도시 A에서 B로 가는 길"
2) "미로에서 최소 칸 수로 탈출하기"
3) "수강 선수 조건을 만족하는 학습 순서"
```

---

<details>
<summary><b>정답 보기 (클릭)</b></summary>

```
1) 다익스트라 → 도로마다 비용(거리/시간)이 다름 (가중치)
2) BFS → 모든 칸의 비용이 동일 (비가중치)
3) 위상정렬 → 순서를 결정해야 함 (의존성)
```

</details>

---

### 📋 QUIZ 2 — 우선순위 큐 정렬 방향

Max Heap과 Min Heap의 Comparator를 작성하시오.

```java
// 비용이 작을수록 먼저 나오게 (Min Heap)
Queue<Node> minHeap = new PriorityQueue<>(/* ??? */);

// 비용이 클수록 먼저 나오게 (Max Heap)
Queue<Node> maxHeap = new PriorityQueue<>(/* ??? */);
```

---

<details>
<summary><b>정답 보기 (클릭)</b></summary>

```java
// Min Heap
Queue<Node> minHeap = new PriorityQueue<>((a, b) -> Integer.compare(a.cost, b.cost));
// 또는 Comparable 인터페이스 구현

// Max Heap
Queue<Node> maxHeap = new PriorityQueue<>((a, b) -> Integer.compare(b.cost, a.cost));
// b.cost - a.cost 사용 가능 (오버플로우 주의)
```

</details>

---

### 📋 QUIZ 3 — 위상정렬 사이클 검출

다음 코드에서 사이클을 검출하는 코드를 작성하시오.

```java
int[] order = new int[n];
int count = 0;

while (!queue.isEmpty()) {
    int current = queue.poll();
    order[count++] = current;

    if (graph.containsKey(current)) {
        for (int next : graph.get(current)) {
            indegree[next]--;
            if (indegree[next] == 0) {
                queue.add(next);
            }
        }
    }
}

// 여기에 사이클 검출 코드 추가!
if (/* ??? */) {
    return new int[0];  // 또는 -1
}
```

---

<details>
<summary><b>정답 보기 (클릭)</b></summary>

```java
if (count != n) {
    // 모든 노드가 정렬되지 않았다 = 사이클 존재!
    return new int[0];
}

return order;
```

> 💡 이유: 위상정렬이 성공하려면 n개의 노드 모두가 큐에서 나와야 한다.
> 사이클이 있으면 진입 차수가 0이 되지 않는 노드가 생겨 큐에 진입하지 못한다.

</details>

---

### 📋 QUIZ 4 — 다익스트라 코드 오류 찾기

다음 코드의 버그를 찾아 수정하시오.

```java
int dijkstra(Map<Integer, List<Edge>> graph, int start, int end) {
    int[] distance = new int[6];
    Arrays.fill(distance, Integer.MAX_VALUE);

    Queue<Node> pq = new PriorityQueue<>();
    pq.add(new Node(start, 0));
    distance[start] = 0;

    while (!pq.isEmpty()) {
        Node current = pq.poll();
        
        // 버그 1: 이 줄이 없으면?
        // ...

        for (Edge edge : graph.getOrDefault(current.node, new ArrayList<>())) {
            int newDist = current.distance + edge.distance;

            if (newDist < distance[edge.to]) {
                distance[edge.to] = newDist;
                pq.add(new Node(edge.to, newDist));
            }
        }
    }

    return distance[end];
}
```

---

<details>
<summary><b>정답 보기 (클릭)</b></summary>

**버그 1**: visited 체크 또는 거리 체크 누락

```java
// ✅ 올바른 코드:
if (distance[current.node] < current.distance) {
    continue;  // 이미 더 짧은 경로로 방문했으면 스킵
}
```

이 체크가 없으면:
- 같은 노드를 여러 번 처리
- 시간 복잡도 증가
- 틀린 답 가능성

**버그 2**: return value 확인
```java
return distance[end] == Integer.MAX_VALUE ? -1 : distance[end];
// 도달 불가능하면 -1 반환하는 것이 일반적
```

</details>

---

## 📝 Part 5 핵심 정리

```
1. 힙 = Complete Binary Tree, 부모가 항상 자식보다 우선 (min/max heap)
2. 우선순위 큐 = 힙으로 구현, PriorityQueue 사용 (기본은 min heap)
3. 다익스트라 = 가중치 그래프의 최단 경로, O(E log V), 음수 가중치 불가
4. 다익스트라는 visited 대신 distance[node] < dist 체크 사용
5. 위상정렬 = DAG의 순서 결정, 진입 차수(in-degree) 활용
6. 위상정렬은 큐 사용, O(V+E), 사이클 있으면 불가능
7. 사이클 검출 = count != n이면 사이클 존재
8. 우선순위 큐 정렬: Min Heap은 a-b, Max Heap은 b-a
9. 다익스트라에서 INF는 Integer.MAX_VALUE 또는 충분히 큰 값
10. 코테에서는 "최단", "최소" → 다익스트라 / "순서" → 위상정렬
```

---

> 📚 **다음 학습 예고**: 동적 프로그래밍(DP)
