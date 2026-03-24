# Part 6. Tree

> **키워드**: `Tree` `이진 트리` `완전 이진 트리` `N-진 트리` `전위 순회` `중위 순회` `후위 순회` `레벨 순회` `트리 높이` `트리 깊이`

---

## 목차

1. [트리란?](#1-트리란)
2. [트리 용어 정리](#2-트리-용어-정리)
3. [트리의 종류](#3-트리의-종류)
4. [트리 vs 그래프](#4-트리-vs-그래프)
5. [트리 구현 방법](#5-트리-구현-방법)
6. [트리 BFS — 레벨 순서 순회](#6-트리-bfs--레벨-순서-순회)
7. [트리 DFS — 전위/중위/후위 순회](#7-트리-dfs--전위중위후위-순회)
8. [면접 필수 패턴](#8-면접-필수-패턴)
9. [실전 팁 & 자주 하는 실수](#9-실전-팁--자주-하는-실수)
10. [QUIZ](#quiz)

---

## 1. 트리란?

### 한 줄 정의

**트리(Tree)** 는 단 하나의 **루트 노드**에서 시작하여, 모든 노드가 **부모-자식 관계**로 연결된 **계층형 자료구조**다.

### 핵심 성질

```
1. 노드가 n개이면, 간선은 항상 n-1개
2. 임의의 두 노드 사이에 경로가 정확히 1개 (유일한 경로)
3. 사이클(순환)이 없다 → 연결된 비순환 그래프(Connected Acyclic Graph)
```

### 시각화

```
         (1)            ← Root (루트)
        / | \
      (2) (3) (4)       ← Level 1
     / \       |
   (5) (6)    (7)       ← Level 2
              / \
            (8) (9)      ← Level 3 (Leaf들)
```

### 현실 세계의 트리

```
파일 시스템:
  / (루트)
  ├── home/
  │   ├── user/
  │   │   ├── documents/
  │   │   └── photos/
  │   └── guest/
  └── etc/

회사 조직도:
  CEO
  ├── CTO
  │   ├── 개발팀장
  │   └── 인프라팀장
  └── CFO
      └── 재무팀장

HTML DOM:
  <html>
  ├── <head>
  │   └── <title>
  └── <body>
      ├── <div>
      └── <p>
```

---

## 2. 트리 용어 정리

```
         (1)            ← Root (루트): 최상위 노드
        / | \
      (2) (3) (4)       ← (2), (3), (4)는 (1)의 자식(Child)
     / \       |           (1)은 (2), (3), (4)의 부모(Parent)
   (5) (6)    (7)       ← (5), (6)은 형제(Sibling)
              / \
            (8) (9)      ← Leaf (리프): 자식이 없는 노드
```

### 필수 용어

| 용어 | 영어 | 의미 | 위 트리 예시 |
|------|------|------|-------------|
| **루트** | Root | 부모가 없는 최상위 노드 | (1) |
| **리프 (단말 노드)** | Leaf | 자식이 없는 노드 | (5), (6), (8), (9), (3) |
| **내부 노드** | Internal Node | 리프가 아닌 노드 (자식 있음) | (1), (2), (4), (7) |
| **부모** | Parent | 바로 위 노드 | (2)의 부모 = (1) |
| **자식** | Child | 바로 아래 노드 | (1)의 자식 = (2), (3), (4) |
| **형제** | Sibling | 같은 부모를 가진 노드 | (5)와 (6), (8)과 (9) |
| **조상** | Ancestor | 루트까지의 경로에 있는 모든 노드 | (8)의 조상 = (7), (4), (1) |
| **자손** | Descendant | 아래로 내려가며 만나는 모든 노드 | (4)의 자손 = (7), (8), (9) |
| **서브트리** | Subtree | 어떤 노드를 루트로 하는 부분 트리 | (4)의 서브트리 = {(4),(7),(8),(9)} |

### 숫자로 표현하는 용어

| 용어 | 영어 | 의미 | 위 트리 예시 |
|------|------|------|-------------|
| **차수** | Degree | 한 노드의 **자식 수** | (1)의 차수=3, (2)의 차수=2, (5)의 차수=0 |
| **레벨** | Level | 루트에서의 거리 (루트=0) | (1)=Level 0, (2)=Level 1, (8)=Level 3 |
| **깊이** | Depth | 루트에서 해당 노드까지의 **간선 수** | (8)의 깊이=3, (2)의 깊이=1 |
| **높이** | Height | 해당 노드에서 **가장 먼 리프**까지의 간선 수 | 트리의 높이=3, (2)의 높이=1 |

### 깊이(Depth) vs 높이(Height) — 면접 단골!

```
         (1)      ← depth=0, height=3
        / | \
      (2) (3) (4) ← depth=1, (4)의 height=2
     / \       |
   (5) (6)    (7) ← depth=2, (7)의 height=1
              / \
            (8) (9) ← depth=3, height=0 (리프)

깊이(Depth) = 위에서 아래로 (루트 → 해당 노드) → "얼마나 깊이 있나?"
높이(Height) = 아래에서 위로 (해당 노드 → 가장 먼 리프) → "아래로 얼마나 높나?"

트리의 높이 = 루트의 높이 = 가장 깊은 리프의 깊이
```

---

## 3. 트리의 종류

### 일반 트리 (General Tree)

자식 수에 제한이 없는 트리. N-진 트리라고도 한다.

```
      (1)
    / | | \
  (2)(3)(4)(5)    ← 자식 4개
  /\
(6)(7)
```

### 이진 트리 (Binary Tree)

각 노드의 자식이 **최대 2개**인 트리. 코딩테스트에서 **가장 많이** 나온다.

```
       (1)
      /   \
    (2)   (3)      ← 각 노드의 자식은 최대 2개
   /  \      \
 (4)  (5)    (6)
```

### 완전 이진 트리 (Complete Binary Tree)

마지막 레벨을 제외한 모든 레벨이 꽉 차 있고, 마지막 레벨은 **왼쪽부터 채워진** 트리.

```
완전 이진 트리 ✅           완전 이진 트리 ❌

       (1)                       (1)
      /   \                     /   \
    (2)   (3)                 (2)   (3)
   /  \   /                  /       \
 (4)  (5)(6)               (4)      (6)   ← 왼쪽부터 안 채워짐!
```

> 힙(Heap)이 완전 이진 트리 구조다.

### 포화 이진 트리 (Full/Perfect Binary Tree)

모든 레벨이 완전히 채워진 트리. 노드 수 = `2^(h+1) - 1` (h = 높이)

```
       (1)
      /   \
    (2)   (3)       높이=2, 노드 수 = 2^3 - 1 = 7
   /  \   /  \
 (4)  (5)(6) (7)
```

### 이진 탐색 트리 (BST: Binary Search Tree)

**왼쪽 < 부모 < 오른쪽** 규칙을 만족하는 이진 트리.

```
       (8)
      /   \
    (3)   (10)       3 < 8 < 10 ✅
   /  \      \
 (1)  (6)   (14)     1 < 3, 3 < 6, 10 < 14 ✅
     /  \
   (4)  (7)          4 < 6, 6 < 7 ✅
```

```
BST에서 값 검색: O(log n) (균형 잡힌 경우)
→ 매번 절반을 버릴 수 있으니까 이진 탐색과 같은 원리!

최악 (한쪽으로 치우침): O(n)
→ (1)→(2)→(3)→(4) 같은 편향 트리
```

### 종류 정리

| 종류 | 자식 수 | 특징 | 코테 빈도 |
|------|---------|------|----------|
| 일반 트리 | 제한 없음 | N-진 트리 | 보통 |
| **이진 트리** | 최대 2개 | left, right | **매우 높음** |
| 완전 이진 트리 | 최대 2개 | 왼쪽부터 채움 | 높음 (힙) |
| 포화 이진 트리 | 최대 2개 | 모든 레벨 꽉 참 | 낮음 |
| **이진 탐색 트리** | 최대 2개 | 왼쪽 < 부모 < 오른쪽 | **높음** |

---

## 4. 트리 vs 그래프

```
트리는 그래프의 특수한 형태다!

그래프 ⊃ 트리

트리 = 연결된 + 비순환 + 그래프
```

| 비교 항목 | 그래프 (Part 4) | 트리 (Part 6) |
|:---------:|:--------------:|:-------------:|
| **사이클** | 있을 수 있음 | **절대 없음** |
| **방향** | 방향/무방향 가능 | 부모→자식 (계층) |
| **루트** | 없음 | **있음** (정확히 1개) |
| **간선 수** | 자유 | **노드 수 - 1** |
| **경로** | 여러 개 가능 | **정확히 1개** (유일) |
| **visited** | **필수** (사이클 방지) | 단방향이면 **불필요** |

### 왜 단방향 트리에서는 visited가 필요 없는가?

```
단방향 (부모 → 자식):
       (1)
      /   \
    (2)   (3)

  1→2, 1→3 방향으로만 갈 수 있음
  2에서 1로 되돌아갈 방법이 없다 → 사이클 불가 → visited 불필요!

양방향 (부모 ↔ 자식):
  1↔2, 1↔3
  2에서 1로 되돌아갈 수 있다 → 무한 루프 가능 → visited 필요!
```

> 이것이 트리 BFS/DFS에서 가장 중요한 차이점이다.

---

## 5. 트리 구현 방법

### 방법 1: 인접 리스트 (간선 리스트 → 변환)

Part 4에서 배운 그래프와 동일한 방식. 코테에서 트리가 간선 리스트로 주어질 때 사용한다.

```java
int n = 5;
int[][] edges = {{0,1}, {0,2}, {2,3}, {2,4}};

List<List<Integer>> tree = new ArrayList<>();
for (int i = 0; i < n; i++) {
    tree.add(new ArrayList<>());
}

// 단방향 (부모 → 자식) — visited 불필요
for (int[] edge : edges) {
    tree.get(edge[0]).add(edge[1]);
}

// 양방향 (부모 ↔ 자식) — visited 필요
for (int[] edge : edges) {
    tree.get(edge[0]).add(edge[1]);
    tree.get(edge[1]).add(edge[0]);
}
```

```
결과 (단방향):
  0 → [1, 2]
  1 → []
  2 → [3, 4]
  3 → []
  4 → []

시각화:
       (0)
      /   \
    (1)   (2)
         /   \
       (3)   (4)
```

### 방법 2: 클래스 구현 — 이진 트리 (Binary)

코테에서 트리가 Node 클래스로 주어질 때 사용한다. LeetCode 스타일.

```java
class Node {
    int value;
    Node left;
    Node right;

    public Node(int value) {
        this.value = value;
    }
}

//        (1)
//       /   \
//     (2)   (3)
//    /  \      \
//  (4)  (5)    (6)

Node root = new Node(1);
root.left = new Node(2);
root.right = new Node(3);
root.left.left = new Node(4);
root.left.right = new Node(5);
root.right.right = new Node(6);
```

### 방법 3: 클래스 구현 — N-진 트리 (N-ary)

자식이 여러 개일 수 있는 일반 트리.

```java
class Node {
    int value;
    List<Node> children;

    public Node(int value) {
        this.value = value;
        this.children = new ArrayList<>();
    }
}

//       (1)
//      / | \
//    (2)(3)(4)
//        |
//       (5)

Node root = new Node(1);
root.children.add(new Node(2));
root.children.add(new Node(3));
root.children.add(new Node(4));
root.children.get(1).children.add(new Node(5));  // (3)의 자식으로 (5) 추가
```

### 언제 어떤 구현을 쓰나?

| 상황 | 구현 방법 |
|------|----------|
| 문제에서 `int[][] edges`로 트리를 줄 때 | **인접 리스트** |
| 문제에서 `TreeNode root`로 트리를 줄 때 | **클래스 (Binary)** |
| 자식이 여러 개인 트리 | **클래스 (N-ary)** 또는 **인접 리스트** |

---

## 6. 트리 BFS -- 레벨 순서 순회

### 한 줄 정의

**레벨 순서 순회(Level-order Traversal)** 는 루트에서 시작하여 같은 레벨(깊이)의 노드를 모두 방문한 뒤 다음 레벨로 넘어가는 탐색이다. **큐(Queue)** 를 사용한다.

```
       (1)             방문 순서: 1 → 2 → 3 → 4 → 5 → 6
      /   \
    (2)   (3)          Level 0: [1]
   /  \      \         Level 1: [2, 3]
 (4)  (5)    (6)       Level 2: [4, 5, 6]
```

### 인접 리스트 — 단방향 (visited 불필요)

```java
void bfs(int start, List<List<Integer>> tree) {
    Queue<Integer> q = new ArrayDeque<>();
    q.offer(start);

    while (!q.isEmpty()) {
        int cur = q.poll();                  // 방문
        System.out.print(cur + " ");

        for (int child : tree.get(cur)) {    // 자식 노드 예약
            q.offer(child);
        }
    }
}
```

### 인접 리스트 — 양방향 (visited 필요)

```java
void bfs(int start, List<List<Integer>> tree, boolean[] visited) {
    Queue<Integer> q = new ArrayDeque<>();
    q.offer(start);
    visited[start] = true;

    while (!q.isEmpty()) {
        int cur = q.poll();
        System.out.print(cur + " ");

        for (int next : tree.get(cur)) {
            if (!visited[next]) {
                q.offer(next);
                visited[next] = true;
            }
        }
    }
}
```

### 클래스 — Binary

```java
void bfs(Node root) {
    if (root == null) return;

    Queue<Node> q = new ArrayDeque<>();
    q.offer(root);

    while (!q.isEmpty()) {
        Node cur = q.poll();                  // 방문
        System.out.print(cur.value + " ");

        if (cur.left != null) q.offer(cur.left);    // 왼쪽 자식 예약
        if (cur.right != null) q.offer(cur.right);   // 오른쪽 자식 예약
    }
}
```

### 클래스 — N-ary

```java
void bfs(Node root) {
    if (root == null) return;

    Queue<Node> q = new ArrayDeque<>();
    q.offer(root);

    while (!q.isEmpty()) {
        Node cur = q.poll();
        System.out.print(cur.value + " ");

        for (Node child : cur.children) {
            q.offer(child);
        }
    }
}
```

### 레벨별 분리 BFS — 면접 필수 패턴!

"각 레벨의 노드를 따로 모아라" 같은 문제에서 사용한다. **`queue.size()`** 로 현재 레벨의 노드 수를 알 수 있다.

```java
List<List<Integer>> levelOrder(Node root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;

    Queue<Node> q = new ArrayDeque<>();
    q.offer(root);

    while (!q.isEmpty()) {
        int levelSize = q.size();             // 현재 레벨의 노드 수!
        List<Integer> level = new ArrayList<>();

        for (int i = 0; i < levelSize; i++) { // 현재 레벨만큼만 처리
            Node cur = q.poll();
            level.add(cur.value);

            if (cur.left != null) q.offer(cur.left);
            if (cur.right != null) q.offer(cur.right);
        }

        result.add(level);                    // 한 레벨 완료!
    }

    return result;
}
```

```
       (1)
      /   \
    (2)   (3)
   /  \      \
 (4)  (5)    (6)

실행 과정:

반복 1: levelSize = 1 (큐에 1개)
  꺼냄: (1) → 자식 (2),(3) 예약
  level = [1]
  큐: [(2), (3)]

반복 2: levelSize = 2 (큐에 2개)
  꺼냄: (2) → 자식 (4),(5) 예약
  꺼냄: (3) → 자식 (6) 예약
  level = [2, 3]
  큐: [(4), (5), (6)]

반복 3: levelSize = 3
  꺼냄: (4), (5), (6) → 자식 없음
  level = [4, 5, 6]
  큐: []

result = [[1], [2, 3], [4, 5, 6]]
```

> 이 `queue.size()` 테크닉은 트리 BFS 문제의 절반 이상에서 사용된다. **반드시 외워둘 것!**

---

## 7. 트리 DFS -- 전위/중위/후위 순회

### DFS 기본 구조

```java
// 인접 리스트 — 단방향
void dfs(int cur, List<List<Integer>> tree) {
    // 현재 노드 처리 (방문)
    for (int child : tree.get(cur)) {
        dfs(child, tree);
    }
}

// 인접 리스트 — 양방향 (visited 필요)
void dfs(int cur, List<List<Integer>> tree, boolean[] visited) {
    visited[cur] = true;
    for (int child : tree.get(cur)) {
        if (!visited[child]) {
            dfs(child, tree, visited);
        }
    }
}

// 클래스 — Binary
void dfs(Node cur) {
    if (cur == null) return;    // 종료 조건
    dfs(cur.left);
    dfs(cur.right);
}

// 클래스 — N-ary
void dfs(Node cur) {
    if (cur == null) return;
    for (Node child : cur.children) {
        dfs(child);
    }
}
```

### 전위/중위/후위 — 처리 위치가 다를 뿐!

이진 트리 DFS에서 **현재 노드를 언제 처리하느냐**에 따라 3가지로 나뉜다.

```java
void dfs(Node cur) {
    if (cur == null) return;

    // (A) 여기서 처리하면 → 전위 순회 (Pre-order)
    dfs(cur.left);
    // (B) 여기서 처리하면 → 중위 순회 (In-order)
    dfs(cur.right);
    // (C) 여기서 처리하면 → 후위 순회 (Post-order)
}
```

---

### 전위 순회 (Pre-order): **현재 → 왼쪽 → 오른쪽**

"나를 먼저 처리하고, 자식들을 처리한다"

```java
void preorder(Node cur) {
    if (cur == null) return;
    System.out.print(cur.value + " ");   // 현재 노드 처리 (먼저!)
    preorder(cur.left);                   // 왼쪽 서브트리
    preorder(cur.right);                  // 오른쪽 서브트리
}
```

```
       (1)
      /   \
    (2)   (3)
   /  \
 (4)  (5)

전위 순회: 1 → 2 → 4 → 5 → 3

실행 추적:
  preorder(1) → 출력 "1"
    preorder(2) → 출력 "2"
      preorder(4) → 출력 "4"
        preorder(null) → return
        preorder(null) → return
      preorder(5) → 출력 "5"
        preorder(null) → return
        preorder(null) → return
    preorder(3) → 출력 "3"
      preorder(null) → return
      preorder(null) → return
```

> 전위 순회 = 트리를 **복사**할 때 사용. 부모를 먼저 만들고, 자식을 붙이니까.

---

### 중위 순회 (In-order): **왼쪽 → 현재 → 오른쪽**

"왼쪽 자식을 먼저 처리하고, 나를 처리하고, 오른쪽 자식을 처리한다"

```java
void inorder(Node cur) {
    if (cur == null) return;
    inorder(cur.left);                    // 왼쪽 서브트리
    System.out.print(cur.value + " ");   // 현재 노드 처리 (중간!)
    inorder(cur.right);                   // 오른쪽 서브트리
}
```

```
       (4)
      /   \
    (2)   (6)
   /  \   /  \
 (1)  (3)(5) (7)

중위 순회: 1 → 2 → 3 → 4 → 5 → 6 → 7   ← 오름차순!
```

> **BST(이진 탐색 트리)를 중위 순회하면 정렬된 순서가 나온다!** 면접 단골 질문이다.

---

### 후위 순회 (Post-order): **왼쪽 → 오른쪽 → 현재**

"자식들을 먼저 처리하고, 나를 마지막에 처리한다"

```java
void postorder(Node cur) {
    if (cur == null) return;
    postorder(cur.left);                  // 왼쪽 서브트리
    postorder(cur.right);                 // 오른쪽 서브트리
    System.out.print(cur.value + " ");   // 현재 노드 처리 (마지막!)
}
```

```
       (1)
      /   \
    (2)   (3)
   /  \
 (4)  (5)

후위 순회: 4 → 5 → 2 → 3 → 1

실행 추적:
  postorder(1)
    postorder(2)
      postorder(4)
        postorder(null) → return
        postorder(null) → return
        출력 "4"
      postorder(5)
        postorder(null) → return
        postorder(null) → return
        출력 "5"
      출력 "2"
    postorder(3)
      postorder(null) → return
      postorder(null) → return
      출력 "3"
    출력 "1"
```

> 후위 순회 = **자식 정보를 모아서 부모에서 계산**할 때 사용. 트리 높이, 노드 수, 삭제 등.

---

### 3가지 순회 비교

```
       (1)
      /   \
    (2)   (3)
   /  \
 (4)  (5)

전위 (Pre):  1 2 4 5 3     ← 현재 → 왼쪽 → 오른쪽  (위에서 아래로)
중위 (In):   4 2 5 1 3     ← 왼쪽 → 현재 → 오른쪽  (BST면 정렬 순서)
후위 (Post): 4 5 2 3 1     ← 왼쪽 → 오른쪽 → 현재  (아래에서 위로)
```

| 순회 | 순서 | 사용 시점 | 비유 |
|------|------|----------|------|
| **전위** | 현재→왼→오 | 트리 복사, 직렬화 | "내가 먼저" |
| **중위** | 왼→현재→오 | **BST 정렬 출력** | "중간에 나" |
| **후위** | 왼→오→현재 | 높이 계산, 삭제, **자식 결과 합산** | "내가 마지막" |
| **레벨** | 레벨별 | 레벨 관련 문제, 최단 거리 | "한 층씩" |

---

## 8. 면접 필수 패턴

### 패턴 1: 트리 높이 구하기 (후위 순회)

```java
int height(Node cur) {
    if (cur == null) return -1;   // 빈 트리의 높이 = -1 (간선 기준)
                                   // 노드 기준이면 return 0

    int leftH = height(cur.left);     // 왼쪽 서브트리 높이
    int rightH = height(cur.right);   // 오른쪽 서브트리 높이

    return Math.max(leftH, rightH) + 1;  // 더 높은 쪽 + 1
}
```

```
       (1)
      /   \
    (2)   (3)
   /  \
 (4)  (5)

height(4) = max(-1, -1) + 1 = 0
height(5) = max(-1, -1) + 1 = 0
height(2) = max(0, 0) + 1 = 1
height(3) = max(-1, -1) + 1 = 0
height(1) = max(1, 0) + 1 = 2   ← 트리 높이 = 2
```

> 후위 순회 패턴! 자식의 높이를 먼저 구하고, 부모에서 합산한다.

---

### 패턴 2: 노드 수 세기 (후위 순회)

```java
int countNodes(Node cur) {
    if (cur == null) return 0;

    int left = countNodes(cur.left);
    int right = countNodes(cur.right);

    return left + right + 1;   // 왼쪽 + 오른쪽 + 나 자신
}
```

---

### 패턴 3: 최대 깊이 (= 높이와 동일)

LeetCode 104번. 트리 문제의 기본 중 기본.

```java
int maxDepth(Node root) {
    if (root == null) return 0;   // 노드 수 기준 (깊이 0)

    return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1;
}
```

---

### 패턴 4: 경로 합 (Path Sum)

루트에서 리프까지의 경로 합이 target인지 확인.

```java
boolean hasPathSum(Node root, int target) {
    if (root == null) return false;

    // 리프 노드에 도달했을 때 남은 합이 0이면 경로 존재
    if (root.left == null && root.right == null) {
        return target - root.value == 0;
    }

    // 현재 값을 빼고 자식에게 전달 (전위 순회 패턴)
    return hasPathSum(root.left, target - root.value)
        || hasPathSum(root.right, target - root.value);
}
```

```
       (5)             target = 8
      /   \
    (4)   (8)          경로 5→4→(−1)? 합=8 ❌ (리프가 아닌 곳에서 8이 됨)
   /                   경로 5→4→? ... 리프까지 가봐야 함
 (-1)

5 → 4 → (-1): 합 = 5+4+(-1) = 8 ✅
```

---

### 패턴 5: 트리 대칭 여부 (Symmetric Tree)

```java
boolean isSymmetric(Node root) {
    if (root == null) return true;
    return isMirror(root.left, root.right);
}

boolean isMirror(Node left, Node right) {
    if (left == null && right == null) return true;
    if (left == null || right == null) return false;
    if (left.value != right.value) return false;

    return isMirror(left.left, right.right)    // 바깥쪽 비교
        && isMirror(left.right, right.left);   // 안쪽 비교
}
```

```
대칭 ✅                    비대칭 ❌

       (1)                      (1)
      /   \                    /   \
    (2)   (2)                (2)   (2)
   /  \   /  \              /  \   /  \
 (3)  (4)(4) (3)          (3)  (4)(3) (4)
                                       ↑ 위치가 다름!
```

---

### 패턴 6: 트리 지름 (Diameter)

트리에서 **가장 먼 두 노드 사이의 거리**. 면접 고빈출.

```java
int diameter = 0;

int diameterOfTree(Node root) {
    height(root);
    return diameter;
}

int height(Node cur) {
    if (cur == null) return -1;

    int leftH = height(cur.left);
    int rightH = height(cur.right);

    // 현재 노드를 지나는 경로의 길이 = 왼쪽 높이 + 오른쪽 높이 + 2
    diameter = Math.max(diameter, leftH + rightH + 2);

    return Math.max(leftH, rightH) + 1;
}
```

```
       (1)
      /   \
    (2)   (3)       지름 = (4)→(2)→(1)→(3) = 3
   /  \              또는 (5)→(2)→(1)→(3) = 3
 (4)  (5)
```

---

### 면접 패턴 정리

| 패턴 | 순회 방식 | 핵심 | 대표 문제 |
|------|----------|------|----------|
| 트리 높이 | 후위 | `max(왼, 오) + 1` | LeetCode 104 |
| 노드 수 | 후위 | `왼 + 오 + 1` | — |
| 경로 합 | 전위 | `target - cur.value`를 전달 | LeetCode 112 |
| 대칭 여부 | 재귀 | 바깥쪽끼리, 안쪽끼리 비교 | LeetCode 101 |
| 트리 지름 | 후위 | `leftH + rightH + 2` | LeetCode 543 |
| 레벨별 분리 | BFS | `queue.size()` 테크닉 | LeetCode 102 |
| BST 정렬 | 중위 | 중위 순회 = 오름차순 | LeetCode 94 |

---

## 9. 실전 팁 & 자주 하는 실수

### 트리 문제 풀이 순서

```
1. 트리 구현 확인
   → 인접 리스트로 주어졌나? 클래스(Node)로 주어졌나?
   → 이진 트리인가? N-진 트리인가?

2. 탐색 방향 결정
   → 레벨 관련 → BFS (queue.size() 테크닉)
   → 높이, 크기 계산 → 후위 DFS
   → 경로 탐색 → 전위 DFS
   → 정렬 출력 (BST) → 중위 DFS

3. 단방향 vs 양방향 확인
   → 단방향이면 visited 불필요
   → 양방향이면 visited 필요
```

### 자주 하는 실수

| 실수 | 결과 | 해결 |
|------|------|------|
| `cur == null` 체크 안 함 | `NullPointerException` | DFS 시작에 `if (cur == null) return;` |
| 단방향인데 visited 사용 | 불필요한 코드 | 단방향 트리면 visited 제거 |
| 양방향인데 visited 안 사용 | 무한 루프 | 양방향이면 반드시 visited |
| 전위/중위/후위 순서 혼동 | 오답 | "처리 위치"만 기억: 앞/중간/뒤 |
| BFS 레벨 구분 안 함 | 레벨별 분리 불가 | `queue.size()` 테크닉 사용 |
| 높이/깊이 헷갈림 | 오답 | 깊이=위→아래, 높이=아래→위 |
| `height(null)` 반환값 혼동 | off-by-one 에러 | 간선 기준 -1, 노드 기준 0 |

### 순회 방식 선택 치트시트

```
"레벨별" "너비" "최단"          → BFS (큐)
"높이" "깊이" "크기" "삭제"      → 후위 DFS
"경로" "루트에서 리프까지"       → 전위 DFS
"정렬" "BST" "오름차순"         → 중위 DFS
```

---

## QUIZ

### QUIZ 1 — 전위/중위/후위 순회 결과

다음 이진 트리의 **전위, 중위, 후위** 순회 결과를 각각 구하시오.

```
       (A)
      /   \
    (B)   (C)
   /     /   \
 (D)   (E)   (F)
```

---

<details>
<summary><b>정답 보기 (클릭)</b></summary>

```
전위 (Pre):  A → B → D → C → E → F    (현재→왼→오)
중위 (In):   D → B → A → E → C → F    (왼→현재→오)
후위 (Post): D → B → E → F → C → A    (왼→오→현재)
```

### 풀이 — 전위 순회 추적

```
preorder(A) → 출력 "A"
  preorder(B) → 출력 "B"
    preorder(D) → 출력 "D"
      preorder(null) → return
      preorder(null) → return
    preorder(null) → return
  preorder(C) → 출력 "C"
    preorder(E) → 출력 "E"
      preorder(null) → return
      preorder(null) → return
    preorder(F) → 출력 "F"
```

> 전위: 루트가 **맨 앞**, 후위: 루트가 **맨 뒤**에 온다는 것을 기억하면 빠르게 검증 가능!

</details>

---

### QUIZ 2 — 이 트리의 높이는?

```
         (1)
        /   \
      (2)   (3)
     /
   (4)
   /
 (5)
```

---

<details>
<summary><b>정답 보기 (클릭)</b></summary>

```
높이 = 3 (간선 기준)
```

### 풀이

```
height(5) = max(-1, -1) + 1 = 0
height(4) = max(0, -1) + 1 = 1
height(2) = max(1, -1) + 1 = 2
height(3) = max(-1, -1) + 1 = 0
height(1) = max(2, 0) + 1 = 3   ← 트리 높이!

가장 긴 경로: (1)→(2)→(4)→(5) = 간선 3개
```

</details>

---

### QUIZ 3 — BST 중위 순회

다음 이진 탐색 트리를 **중위 순회**하면 어떤 순서로 출력되는가?

```
       (8)
      /   \
    (3)   (10)
   /  \      \
 (1)  (6)   (14)
```

---

<details>
<summary><b>정답 보기 (클릭)</b></summary>

```
1 → 3 → 6 → 8 → 10 → 14     ← 오름차순!
```

### 풀이

```
inorder(8)
  inorder(3)
    inorder(1) → 출력 "1"
    출력 "3"
    inorder(6) → 출력 "6"
  출력 "8"
  inorder(10)
    (왼쪽 없음)
    출력 "10"
    inorder(14) → 출력 "14"
```

> BST를 중위 순회하면 **항상 오름차순**으로 나온다. 이 성질은 면접에서 자주 물어본다!

</details>

---

### QUIZ 4 — 레벨별 BFS 결과

다음 트리를 **레벨별로 분리**하여 BFS 하면 결과는?

```
       (1)
      /   \
    (2)   (3)
   /  \      \
 (4)  (5)    (6)
       |
      (7)
```

---

<details>
<summary><b>정답 보기 (클릭)</b></summary>

```
[[1], [2, 3], [4, 5, 6], [7]]
```

### 풀이 (queue.size() 테크닉)

```
큐: [(1)]         → levelSize=1 → level=[1]
큐: [(2),(3)]     → levelSize=2 → level=[2,3]
큐: [(4),(5),(6)] → levelSize=3 → level=[4,5,6]
큐: [(7)]         → levelSize=1 → level=[7]
큐: []            → 종료
```

</details>

---

### QUIZ 5 — 이 코드의 순회 방식은?

```java
void mystery(Node cur) {
    if (cur == null) return;
    mystery(cur.left);
    mystery(cur.right);
    System.out.print(cur.value + " ");
}
```

---

<details>
<summary><b>정답 보기 (클릭)</b></summary>

### 후위 순회 (Post-order)!

```
출력이 왼쪽, 오른쪽 재귀 호출 "뒤에" 있다.
→ 왼 → 오 → 현재 = 후위 순회

전위: 출력이 맨 앞 (재귀 호출 전)
중위: 출력이 left와 right 사이
후위: 출력이 맨 뒤 (재귀 호출 후)  ← 이것!
```

> 출력(처리) 위치만 보면 순회 방식을 바로 알 수 있다.

</details>

---

## Part 6 핵심 정리

```
1. 트리 = 루트 + 부모-자식 관계 + 사이클 없음, 노드 n개면 간선 n-1개
2. 깊이 = 위→아래 (루트에서 거리), 높이 = 아래→위 (리프까지 거리)
3. 이진 트리 = 자식 최대 2개, 코테 가장 빈출
4. BST: 왼쪽 < 부모 < 오른쪽, 중위 순회 = 오름차순
5. 단방향 트리 → visited 불필요, 양방향 → visited 필요
6. BFS = 레벨 순서 순회, queue.size()로 레벨 구분 (필수 테크닉!)
7. 전위(현재→왼→오), 중위(왼→현재→오), 후위(왼→오→현재)
   → "처리 위치"만 다르고 코드 구조는 동일
8. 후위 = 높이/크기 계산, 전위 = 경로 탐색, 중위 = BST 정렬
9. 면접 필수: 높이, 지름, 경로 합, 대칭, 레벨별 BFS, BST 중위 순회
10. null 체크 잊지 말 것! if (cur == null) return;
```

---

> 다음 학습 예고: 백트래킹(Backtracking), 이진 탐색(Binary Search), 힙(Heap)
