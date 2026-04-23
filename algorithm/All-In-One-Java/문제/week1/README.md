# Week 1 — 자바 문제 풀이 환경

> **목표**: 프로그래머스 3문제를 자바로 풀이
> **구조**: 각 문제별 독립적인 Solution 클래스

---

## 📁 디렉토리 구조

```
week1/
├── README.md (이 파일)
├── build.sh (컴파일 스크립트)
├── run.sh (실행 스크립트)
└── src/
    ├── Problem1.java (올바른 괄호)
    ├── Problem2.java (구명보트)
    └── Problem3.java (네트워크)
```

---

## 🚀 사용 방법

### 1️⃣ 자바 파일 작성

`src/` 디렉토리에 각 문제별 파일을 만들어 작성합니다.

```bash
# 예시
src/Problem1.java
src/Problem2.java
src/Problem3.java
```

### 2️⃣ 컴파일

```bash
./build.sh
```

또는 개별 컴파일:
```bash
javac src/Problem1.java
```

### 3️⃣ 실행

```bash
./run.sh Problem1
```

또는 직접 실행:
```bash
java -cp src Problem1
```

---

## 📝 코드 템플릿

### 프로그래머스 한 문제 풀이 형식

```java
import java.util.*;

public class Problem1 {
    // 프로그래머스 제출용 Solution 클래스
    static class Solution {
        public boolean solution(String s) {
            // 풀이 코드
            return true;
        }
    }

    // 테스트용 main 메서드
    public static void main(String[] args) {
        Solution sol = new Solution();
        
        // 테스트 케이스 1
        System.out.println("Test 1: " + sol.solution("()"));  // true
        
        // 테스트 케이스 2
        System.out.println("Test 2: " + sol.solution("()()"));  // true
        
        // 테스트 케이스 3
        System.out.println("Test 3: " + sol.solution("()("))  // false
    }
}
```

---

## 💡 각 문제별 가이드

### Problem 1: 올바른 괄호
- **난이도**: Lv.2
- **주제**: Stack
- **파일**: `src/Problem1.java`

```java
public class Problem1 {
    static class Solution {
        public boolean isValidParentheses(String s) {
            // TODO: Stack을 이용해 구현
            return true;
        }
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.isValidParentheses("()"));     // true
        System.out.println(sol.isValidParentheses("()[]{}"));  // true
        System.out.println(sol.isValidParentheses("([)]"));    // false
    }
}
```

---

### Problem 2: 구명보트
- **난이도**: Lv.2
- **주제**: 그리디, 투 포인터
- **파일**: `src/Problem2.java`

```java
public class Problem2 {
    static class Solution {
        public int numRescueBoats(int[] people, int limit) {
            // TODO: 투 포인터로 구현
            return 0;
        }
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.numRescueBoats(new int[]{5,1,4,2}, 6));      // 2
        System.out.println(sol.numRescueBoats(new int[]{1,2}, 3));          // 1
        System.out.println(sol.numRescueBoats(new int[]{70,50,80,50}, 100)); // 3
    }
}
```

---

### Problem 3: 네트워크
- **난이도**: Lv.3
- **주제**: 그래프, DFS/BFS
- **파일**: `src/Problem3.java`

```java
public class Problem3 {
    static class Solution {
        public int countComponents(int n, int[][] edges) {
            // TODO: DFS/BFS로 연결 컴포넌트 개수 세기
            return 0;
        }
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        
        int[][] edges1 = {{0,1}, {1,2}, {3,4}};
        System.out.println(sol.countComponents(5, edges1));  // 2
        
        int[][] edges2 = {{0,1}, {0,2}, {1,2}};
        System.out.println(sol.countComponents(3, edges2));  // 1
    }
}
```

---

## 🔧 필요한 임포트

대부분의 경우 다음만으로 충분합니다:

```java
import java.util.*;
```

구체적으로:
- `Stack<T>`
- `Queue<T>`
- `LinkedList<T>`
- `ArrayList<T>`
- `HashMap<K,V>`
- `HashSet<T>`
- `PriorityQueue<T>`

---

## ✅ 체크리스트

문제를 풀 때마다:

```
☐ 문제 이해
☐ 입출력 형식 확인
☐ 테스트 케이스 작성
☐ 풀이 코드 구현
☐ 컴파일 (./build.sh)
☐ 실행 (./run.sh ProblemX)
☐ 테스트 케이스 통과 확인
☐ 시간복잡도/공간복잡도 확인
```

---

## 📚 디버깅 팁

### 1. 컴파일 에러
```bash
javac src/Problem1.java
# 에러 메시지 확인 후 수정
```

### 2. 런타임 에러
```bash
java -cp src Problem1
# 예: NullPointerException, IndexOutOfBoundsException 등
```

### 3. 잘못된 답
- 테스트 케이스 추가로 검증
- System.out.println()으로 중간 과정 출력
- 알고리즘 로직 재검토

---

## 🎯 추가 학습

각 주제별 주요 클래스:

### Stack 사용
```java
Stack<Integer> stack = new Stack<>();
stack.push(1);
int top = stack.pop();
boolean empty = stack.isEmpty();
```

### Queue 사용
```java
Queue<Integer> queue = new LinkedList<>();
queue.offer(1);
int front = queue.poll();
boolean empty = queue.isEmpty();
```

### PriorityQueue (Min Heap)
```java
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.offer(5);
int min = pq.poll();
```

### Graph (BFS/DFS)
```java
List<List<Integer>> graph = new ArrayList<>();
boolean[] visited = new boolean[n];

for (int i = 0; i < n; i++) {
    graph.add(new ArrayList<>());
}
```

---

> **다음 주 Week 2로 진행할 준비!**
