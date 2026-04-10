# 16. 디버깅 완벽 가이드 🟡 — "버그 잡는 기술"

> **키워드**: `Breakpoint` `Step Over` `Step Into` `Watch` `Evaluate Expression` `조건부 BP`

---

## 핵심만 한 문장

**println 대신 IntelliJ 디버거를 쓰면, 코드를 한 줄씩 실행하면서 변수 값을 실시간으로 볼 수 있다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🟡 이해 | 1~2장 (Breakpoint, Step Over/Into) | 매일 쓰는 기본 |
| 🟢 참고 | 3장 (조건부 BP, Evaluate) | 복잡한 버그에 필요 |

---

## 1장. Breakpoint — 코드를 멈추는 지점

### println 디버깅의 한계

```java
// ❌ println 디버깅
public Student getById(Long id) {
    System.out.println("id = " + id);                    // 추가
    Student student = repository.findById(id).orElse(null);
    System.out.println("student = " + student);          // 추가
    if (student == null) {
        System.out.println("student is null!");            // 추가
        throw new RuntimeException("없음");
    }
    System.out.println("return student: " + student);    // 추가
    return student;
}
// → 디버깅 끝나면 println 다 지워야 함... 😫
```

### Breakpoint 사용

```
IntelliJ에서:

1. 코드 왼쪽 줄번호 클릭 → 빨간 점(Breakpoint) 생성
2. Debug 모드로 실행 (벌레 아이콘 🪲 클릭)
3. 해당 줄에서 코드가 멈춤!
4. 변수 값을 실시간으로 확인

→ 코드 수정 없이 모든 변수를 볼 수 있다!
```

### 단축키

| 동작 | Mac | Windows |
|------|-----|---------|
| Debug 실행 | `Ctrl + D` | `Shift + F9` |
| Breakpoint 토글 | `Cmd + F8` | `Ctrl + F8` |

---

## 2장. Step Over / Step Into — 한 줄씩 실행

### Step Over (F8) — 다음 줄로 이동

```java
public Student getById(Long id) {
    Student student = repository.findById(id);  ← [여기서 멈춤]
    // F8 누르면 ↓
    if (student == null) {                       ← [여기로 이동]
    // F8 누르면 ↓
        throw new RuntimeException("없음");      ← [여기로 이동]
    }
}
```

### Step Into (F7) — 메서드 안으로 들어가기

```java
public Student getById(Long id) {
    Student student = repository.findById(id);  ← [여기서 멈춤]
    // F7 누르면 ↓
    // repository.findById() 메서드 안으로 들어감!
}
```

### Step Out (Shift + F8) — 현재 메서드에서 나오기

```
findById() 안에 들어왔는데 더 볼 필요 없다
→ Shift + F8 → 호출한 곳으로 돌아감
```

### 단축키 정리

| 동작 | Mac | Windows | 설명 |
|------|-----|---------|------|
| **Step Over** | `F8` | `F8` | 다음 줄로 (메서드 안 안 들어감) |
| **Step Into** | `F7` | `F7` | 메서드 안으로 들어감 |
| **Step Out** | `Shift+F8` | `Shift+F8` | 현재 메서드에서 나옴 |
| **Resume** | `Cmd+Opt+R` | `F9` | 다음 BP까지 실행 |

---

## 3장. 고급 기능 🟢

### 조건부 Breakpoint

```
Breakpoint 우클릭 → Condition 입력

예: id == 5
→ id가 5일 때만 멈춤 (다른 id는 통과)

예: student.getName().equals("홍길동")
→ 이름이 홍길동일 때만 멈춤
```

### Evaluate Expression (Alt + F8)

```
디버그 중 임의의 코드를 실행할 수 있음

예: student.getName()          → "홍길동"
예: repository.findAll().size() → 5
예: id * 2 + 1                 → 11

→ 코드를 수정하지 않고도 실험 가능!
```

### Watch — 변수 감시

```
Debug 패널 → Watch에 변수 추가

+ student.getName()
+ studentMap.size()
+ request.getHeader("Authorization")

→ 코드 실행될 때마다 값이 자동 업데이트
```

---

## 실무 디버깅 순서

```
🎯 버그 발생 시:

1. 에러 로그 읽기 (어디서 터졌나?)
2. 해당 줄에 Breakpoint 찍기
3. Debug 모드로 실행
4. Step Over로 한 줄씩 추적
5. 변수 값 확인 (어디서 예상과 다른가?)
6. 원인 파악 → 수정 → 재실행

println 지옥에서 벗어나자!
```

---

## 면접 대비

### 🟡 개념

**Q: "디버깅은 어떻게 하시나요?"**

> IntelliJ 디버거를 사용합니다. 의심되는 코드에 Breakpoint를 걸고 Debug 모드로 실행해서, Step Over/Into로 한 줄씩 추적하면서 변수 값을 확인합니다. 조건부 Breakpoint로 특정 조건에서만 멈추게 할 수도 있고, Evaluate Expression으로 런타임에 코드를 실험할 수도 있습니다.

---

## 정리

```
🎯 디버깅 = "println 대신 디버거"

핵심 단축키:
  F8         = Step Over (다음 줄)
  F7         = Step Into (메서드 안으로)
  Shift+F8   = Step Out (메서드 밖으로)
  F9         = Resume (다음 BP까지)

실무 순서:
  에러 로그 → Breakpoint → Debug → Step → 변수 확인 → 수정
```

---

> 🎯 **Phase 2 완료!** 다음은 Phase 3 "데이터베이스" — SQL, JPA, 트랜잭션, QueryDSL 등 백엔드의 핵심을 배운다!

