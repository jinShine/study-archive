# Part 3. 완전탐색과 재귀 기초

> **키워드**: `완전탐색` `재귀` `종료 조건` `콜 스택` `상태 공간 트리`

---

## 📌 목차

1. [완전탐색이란?](#1-완전탐색이란)
2. [완전탐색 — 반복문 방식](#2-완전탐색--반복문-방식)
3. [재귀 함수 기초](#3-재귀-함수-기초)
4. [재귀의 동작 원리 — 콜 스택](#4-재귀의-동작-원리--콜-스택)
5. [재귀 vs 반복문 비교](#5-재귀-vs-반복문-비교)
6. [상태 공간 트리](#6-상태-공간-트리)
7. [완전탐색 — 재귀 방식](#7-완전탐색--재귀-방식)
8. [QUIZ](#quiz)

---

## 1. 완전탐색이란?

**완전탐색(Exhaustive Search / Brute Force)** 은 정답이 될 가능성이 있는 **모든 후보(candidates)를 체계적으로 확인**하는 방법이다.

### 구현 방법

| 방법 | 설명 | 사용 시점 |
|------|------|----------|
| **반복문 (for)** | 중첩 for문으로 모든 경우를 순회 | 뽑는 개수가 **고정**일 때 |
| **재귀 (Recursion)** | 함수가 자기 자신을 호출하며 탐색 | 뽑는 개수가 **가변**이거나 깊이가 유동적일 때 |

### 핵심 질문

> "이 문제에서 모든 경우의 수를 다 해봐도 시간 안에 들어올까?"

```
N ≤ 10  → N! (순열)     = 360만 ✅ 가능
N ≤ 20  → 2^N (부분집합) = 100만 ✅ 가능
N ≤ 8   → N! (순열)     = 40,320 ✅ 여유
```

> 💡 **완전탐색은 가장 단순하지만 가장 확실한 방법이다.** 최적화가 필요하면 완전탐색을 먼저 구현하고, 거기서 줄여나가는 것이 정석이다.

---

## 2. 완전탐색 — 반복문 방식

### 문제: 배열에서 3개를 골라 합이 target인지 확인

뽑는 개수가 **3개로 고정**이므로 3중 for문으로 해결 가능하다.

```java
public boolean solutionWithFor(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            for (int k = j + 1; k < nums.length; k++) {
                if (nums[i] + nums[j] + nums[k] == target) {
                    return true;
                }
            }
        }
    }
    return false;
}
```

### 반복문 방식의 한계

```
2개를 고르려면 → 2중 for문
3개를 고르려면 → 3중 for문
k개를 고르려면 → k중 for문 → ❌ k가 변수면 코드를 짤 수 없다!
```

> 💡 뽑는 개수가 변수(`k`)일 때는 **재귀**로 해결해야 한다. 그래서 재귀를 배우는 것!

---

## 3. 재귀 함수 기초

### 재귀란?

**재귀(Recursion)** 는 함수가 **자기 자신을 호출**하는 것이다.

큰 문제를 **같은 구조의 더 작은 문제**로 쪼개서 해결하는 방식이다.

### 재귀의 두 가지 필수 요소

```
1. 종료 조건 (Base Case)     — "여기서 멈춰라" → 없으면 무한 루프!
2. 재귀 호출 (Recursive Case) — "자신을 다시 호출하되, 문제를 줄여라"
```

### 가장 단순한 예: 카운트다운

```java
void countdown(int n) {
    // 1. 종료 조건 (Base Case)
    if (n <= 0) {
        System.out.println("발사!");
        return;
    }

    // 2. 재귀 호출 (문제를 줄임: n → n-1)
    System.out.println(n);
    countdown(n - 1);
}

// countdown(3) 실행 과정:
// countdown(3) → 출력 "3" → countdown(2)
//                             → 출력 "2" → countdown(1)
//                                           → 출력 "1" → countdown(0)
//                                                         → 출력 "발사!" → return
```

### 재귀의 핵심 사고법

> **"나는 이 단계만 처리하고, 나머지는 재귀가 알아서 해줄 것이다"**

이것이 재귀를 이해하는 가장 중요한 마인드셋이다. 전체 흐름을 머릿속으로 추적하려 하면 혼란스럽다. **현재 단계의 역할**에만 집중하자.

```
재귀 사고 패턴:
1. 이 함수가 "무엇을 하는 함수"인지 정의한다 (예: "n!을 구하는 함수")
2. 종료 조건을 정한다 (예: n이 0이면 1을 반환)
3. 현재 단계에서 할 일을 정한다 (예: n × (n-1)!을 반환)
4. "나머지는 재귀가 알아서 한다"고 믿는다
```

---

## 4. 재귀의 동작 원리 — 콜 스택

### 콜 스택(Call Stack)이란?

함수가 호출될 때마다 **스택(Stack)**에 쌓인다. 재귀 호출도 마찬가지다.

```
factorial(4) 호출 과정:

호출 단계 (스택에 쌓임 — push):

  | factorial(1) |  ← 종료 조건! return 1
  | factorial(2) |
  | factorial(3) |
  | factorial(4) |
  +--------------+

반환 단계 (스택에서 빠짐 — pop):

  factorial(1) → return 1
  factorial(2) → return 2 × 1 = 2
  factorial(3) → return 3 × 2 = 6
  factorial(4) → return 4 × 6 = 24

→ 최종 결과: 24
```

### 팩토리얼 코드

```java
int factorial(int n) {
    // 종료 조건
    if (n <= 1) return 1;

    // 재귀 호출: n × (n-1)!
    return n * factorial(n - 1);
}

// factorial(4)
// = 4 * factorial(3)
// = 4 * 3 * factorial(2)
// = 4 * 3 * 2 * factorial(1)
// = 4 * 3 * 2 * 1
// = 24
```

### StackOverflowError

재귀가 너무 깊으면 콜 스택이 넘쳐서 **StackOverflowError**가 발생한다.

```java
// ❌ 종료 조건이 없으면 무한 재귀!
void infinite(int n) {
    infinite(n);  // → StackOverflowError!
}

// ❌ 문제를 줄이지 않아도 무한 재귀!
void notShrinking(int n) {
    if (n <= 0) return;
    notShrinking(n);  // n이 줄어들지 않음! → StackOverflowError!
}
```

> 💡 Java의 기본 스택 크기는 약 512KB ~ 1MB. 재귀 깊이가 대략 **10,000 ~ 50,000**을 넘으면 위험하다.

---

## 5. 재귀 vs 반복문 비교

### 예제 1: 1부터 n까지의 합

```java
// 반복문
int sumLoop(int n) {
    int sum = 0;
    for (int i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

// 재귀
int sumRecursive(int n) {
    if (n <= 0) return 0;             // 종료 조건
    return n + sumRecursive(n - 1);   // n + (1부터 n-1까지의 합)
}

// sumRecursive(5)
// = 5 + sumRecursive(4)
// = 5 + 4 + sumRecursive(3)
// = 5 + 4 + 3 + sumRecursive(2)
// = 5 + 4 + 3 + 2 + sumRecursive(1)
// = 5 + 4 + 3 + 2 + 1 + sumRecursive(0)
// = 5 + 4 + 3 + 2 + 1 + 0
// = 15
```

### 예제 2: 배열의 최댓값 찾기

```java
// 반복문
int maxLoop(int[] arr) {
    int max = arr[0];
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] > max) max = arr[i];
    }
    return max;
}

// 재귀: "arr[0..index] 중 최댓값을 구하는 함수"
int maxRecursive(int[] arr, int index) {
    if (index == 0) return arr[0];   // 종료 조건: 원소가 1개면 그게 최댓값

    // 현재 원소 vs 나머지 중 최댓값
    return Math.max(arr[index], maxRecursive(arr, index - 1));
}

// 사용: maxRecursive(arr, arr.length - 1)
```

### 언제 재귀를 쓰는가?

| 상황 | 반복문 | 재귀 |
|------|--------|------|
| 단순 반복 (1~n 순회) | ✅ 더 직관적 | 굳이 필요 없음 |
| 깊이가 고정된 탐색 (3중 for문 등) | ✅ 가능 | 필요 없음 |
| **깊이가 가변적인 탐색** | ❌ for문 중첩 개수를 모름 | ✅ 필수 |
| **트리/그래프 탐색** (DFS) | 가능하지만 복잡 | ✅ 자연스러움 |

> 💡 **핵심**: 재귀는 "깊이를 모를 때" 빛난다. for문은 중첩 횟수를 코드에 직접 써야 하지만, 재귀는 호출 깊이가 실행 시점에 결정된다.

---

## 6. 상태 공간 트리

### 상태 공간 트리(State Space Tree)란?

**모든 경우의 수(모든 가능한 상태)를 트리 형태로 나타낸 것**이다. 이 트리를 탐색하면 모든 경우를 확인할 수 있다.

### 예: [1, 2, 3]에서 2개를 고르기

```
                         []                        ← 아무것도 선택 안 함
                  /       |       \
              [1]         [2]       [3]             ← 첫 번째 선택
            /    \         |
         [1,2]  [1,3]    [2,3]                      ← 두 번째 선택 (완료!)
```

### 상태(State)란?

재귀 함수의 **매개변수(parameter)** 가 곧 현재 상태이다.

```java
void solve(int start, List<Integer> selected) {
    //     ↑ "어디부터 고를지"    ↑ "지금까지 무엇을 골랐는지"
    //     이 두 값이 현재 상태를 정의한다!
}
```

| 매개변수 | 의미 | 예시 |
|----------|------|------|
| `start` | 다음에 고를 수 있는 시작 인덱스 | 0, 1, 2, ... |
| `selected` | 지금까지 선택한 원소들 | [1], [1, 2], ... |

> 상태 공간 트리의 **각 노드** = 재귀 함수의 **한 번의 호출** = (start, selected) 조합

---

## 7. 완전탐색 — 재귀 방식

### 같은 문제를 재귀로 풀기 (배열에서 3개 골라 합 확인)

```java
public boolean solutionWithRecursive(int[] nums, int target, int start, List<Integer> selected) {
    // 1. 종료 조건 (Base Case): 3개를 골랐으면 합을 확인
    if (selected.size() == 3) {
        int sum = 0;
        for (int n : selected) {
            sum += n;
        }
        return sum == target;
    }

    // 2. 재귀 호출: start부터 하나씩 골라보기
    for (int i = start; i < nums.length; i++) {
        selected.add(nums[i]);                                    // 선택!
        if (solutionWithRecursive(nums, target, i + 1, selected)) {
            return true;                                          // 찾으면 즉시 반환
        }
        selected.remove(selected.size() - 1);                     // 선택 취소
    }

    return false;
}

// 사용: solutionWithRecursive(nums, target, 0, new ArrayList<>())
```

### 코드 흐름 추적 (nums = [1, 2, 3, 4], target = 6)

```
solve(start=0, selected=[])
├── 선택 1 → solve(start=1, selected=[1])
│   ├── 선택 2 → solve(start=2, selected=[1,2])
│   │   ├── 선택 3 → solve(start=3, selected=[1,2,3])
│   │   │   → size==3, sum=6==target ✅ → return true!
│   │   └── (만약 false면) 선택 4 → solve(start=4, selected=[1,2,4])
│   │       → size==3, sum=7≠6 → return false
│   │       → 취소 → selected=[1,2]
│   ├── 선택 3 → solve(start=3, selected=[1,3])
│   │   └── 선택 4 → solve(start=4, selected=[1,3,4])
│   │       → sum=8≠6 → false
│   ...
```

### 재귀 완전탐색의 핵심 흐름

```
1. 종료 조건 (Base Case)
   → "원하는 만큼 골랐으면 결과를 확인한다"

2. 선택 (Choose)
   → selected.add(nums[i])

3. 탐색 (Explore)
   → 재귀 호출

4. 취소 (Unchoose)
   → selected.remove(selected.size() - 1)
   → 다른 경우도 탐색하기 위해 되돌림
```

### 왜 선택을 취소해야 하는가?

```java
// selected = [1]인 상태에서

selected.add(2);     // selected = [1, 2]
// → [1, 2, ?] 경우들을 탐색

selected.remove(...); // selected = [1]  ← 2를 빼야!
selected.add(3);      // selected = [1, 3]
// → [1, 3, ?] 경우들을 탐색

// 만약 취소 안 하면?
// selected = [1, 2] 상태에서 3을 추가 → [1, 2, 3] → 원하는 [1, 3, ?]을 못 만듦!
```

> 💡 **취소(remove)는 "다른 길도 가보기 위해 갈림길로 되돌아오는 것"**이다.

---

## 🧩 QUIZ

### 📋 QUIZ 1 — 재귀 추적 (기본)

다음 코드의 출력 결과는?

```java
void count(int n) {
    if (n <= 0) return;
    System.out.print(n + " ");
    count(n - 1);
}

// count(4) 호출 시 출력은?
```

---

<details>
<summary><b>정답 보기 (클릭)</b></summary>

```
4 3 2 1
```

### 풀이

```
count(4) → 출력 "4 " → count(3)
                        → 출력 "3 " → count(2)
                                       → 출력 "2 " → count(1)
                                                      → 출력 "1 " → count(0)
                                                                     → return
```

> 💡 재귀 호출 **전**에 출력하므로 큰 수부터 차례대로 출력된다.

</details>

---

### 📋 QUIZ 2 — 재귀 추적 (출력 위치 변경)

Quiz 1과 거의 같은 코드인데, **출력 위치가 다르다.** 출력 결과는?

```java
void count(int n) {
    if (n <= 0) return;
    count(n - 1);
    System.out.print(n + " ");   // ⚠️ 재귀 호출 "뒤"에 출력!
}

// count(4) 호출 시 출력은?
```

---

<details>
<summary><b>정답 보기 (클릭)</b></summary>

```
1 2 3 4
```

### 풀이

```
count(4) → count(3)
            → count(2)
               → count(1)
                  → count(0) → return
               → 출력 "1 "
            → 출력 "2 "
          → 출력 "3 "
→ 출력 "4 "
```

> 💡 재귀 호출 **후**에 출력하면 **돌아오면서** 출력된다 → 작은 수부터 출력!
>
> 이것이 콜 스택의 핵심이다. 들어갈 때(push) vs 나올 때(pop)에 따라 순서가 바뀐다.

</details>

---

### 📋 QUIZ 3 — 이 재귀 함수의 문제점은?

```java
int sum(int n) {
    return n + sum(n - 1);
}

// sum(5) 호출 시 어떻게 되는가?
```

---

<details>
<summary><b>정답 보기 (클릭)</b></summary>

### StackOverflowError 발생!

**종료 조건(Base Case)이 없다!**

```
sum(5) → 5 + sum(4) → 4 + sum(3) → ... → sum(0) → sum(-1) → sum(-2) → ... 끝없이 계속!
```

### 수정

```java
int sum(int n) {
    if (n <= 0) return 0;   // ← 종료 조건 추가!
    return n + sum(n - 1);
}
```

> 💡 **교훈**: 재귀 함수를 만들 때 **제일 먼저 종료 조건부터** 작성하자!

</details>

---

## 📝 Part 3 핵심 정리

```
1. 완전탐색 = 모든 경우의 수를 확인. N이 작으면 완전탐색이 정답일 가능성 높음
2. 반복문은 뽑는 개수가 고정일 때, 재귀는 가변일 때 사용
3. 재귀 = 함수가 자기 자신을 호출. 반드시 종료 조건(Base Case) 필요!
4. 콜 스택: 재귀 호출은 스택처럼 쌓였다가 역순으로 빠짐
5. 재귀 사고법: "나는 이 단계만 처리, 나머지는 재귀가 알아서 한다"
6. 상태 공간 트리 = 재귀 함수의 매개변수(start, selected)가 곧 상태
7. 재귀 완전탐색 흐름: 선택 → 탐색(재귀 호출) → 취소(다른 길 가보기)
```

---

> 📚 **다음 학습 예고**: 조합(Combination), 순열(Permutation), 부분집합(Subset), 백트래킹
