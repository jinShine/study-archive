# 30강. Zustand 미들웨어 커스텀 — 모든 상태 변화를 추적하는 전용 로거(Logger) 제작

## 도입

데이터가 흐르는 통로는 완성되었지만, 아키텍트라면 그 통로를 흐르는 데이터가 '언제, 어떻게, 왜' 변하는지 완벽히 통제하고 감시할 수 있어야 한다. 미들웨어 커스텀은 Zustand의 내부 메커니즘을 관통하는 가장 난이도 높은 파트다. 이 산을 넘으면 Zustand의 단순한 사용자를 넘어, 엔진의 동작을 재설계할 수 있는 시니어급 제어권을 갖게 된다.

## 개념 설명

### 미들웨어란 무엇인가

미들웨어는 상태 변경 명령이 스토어의 실제 데이터에 도달하기 전 중간에서 가로채는 **가로채기(Interceptor) 레이어**다.

- **기록관의 역할**: 비행기 블랙박스처럼 조종사(개발자)가 어떤 버튼(Action)을 눌렀고, 당시 기체 상태(State)가 어땠는지 단 한 순간도 놓치지 않고 기록한다.
- **보안 요원의 역할**: 상태를 변경하라는 액션이 들어오면 잠시 멈춰 세우고 내용을 기록한 뒤, 문제가 없으면 다음 단계로 통과시킨다.

### 미들웨어의 5단계 작동 시나리오

1. **명령 포착 (The Interception)**: 컴포넌트에서 `login('James')`를 호출하면, 명령은 곧바로 스토어로 가지 않고 `loggedSet`이라는 검문소에 먼저 도착한다.
2. **과거 기록 (Snapshot Before)**: 검문소 요원(로거)은 문을 열어주기 전, 현재 스토어의 상태를 `get()`으로 조회하여 "바뀌기 전 모습"을 사진으로 남긴다.
3. **명령 이행 (Execution)**: 실제 Zustand의 `set` 함수를 실행한다. 이때 상태 변경은 동기(Synchronous)적으로 일어나며, 엔진 내부의 값이 즉시 업데이트된다.
4. **미래 기록 (Snapshot After)**: 변경이 끝나자마자 다시 `get()`을 호출하여 "바뀐 후의 모습"을 두 번째 사진으로 남긴다.
5. **보고 및 종료 (Logging & Done)**: 두 장의 사진(Prev, Next)을 콘솔에 출력하여 개발자에게 보고한 뒤, 모든 프로세스를 종료한다.

### Zustand의 타입 시스템 (T, Mps, Mcs)

미들웨어를 직접 만들 때 가장 높은 벽은 타입 정의다.

- **T (Target)**: 스토어에 담길 실제 데이터(User, Token 등)의 규격
- **StateCreator**: `(set, get, store)` 인자를 받아 상태를 정의하는 함수 그 자체
- **Mps (Mutator Previous)**: 이미 적용된 다른 미들웨어 정보
- **Mcs (Mutator Current)**: 지금 우리가 새로 끼워 넣는 로거의 정보
- **StoreMutatorIdentifier**: 이 미들웨어가 '로거'임을 알려주는 이름표

## 코드 예제

### 미들웨어의 논리적 위치

```ts
// 미들웨어는 '명령(set)'과 '실행' 사이에 존재하는 투명한 감시막이다.
const middleware = (originalSet) => {
  return (...args) => {
    console.log("변경 명령 포착:", args);
    originalSet(...args);
  };
};
```

엔진의 원본 `set` 함수를 그대로 실행하는 대신, 그것을 감싸는 래퍼(Wrapper) 함수를 만들어 중간에 로직을 끼워 넣는 것이 핵심이다.

### Zustand 내부 타입의 실제 모습

```ts
export type StateCreator<
  T, // 상태 데이터의 타입 (예: { count: number })
  Mps extends [StoreMutatorIdentifier, unknown][] = [], // 앞선 미들웨어들의 누적 타입 로그
  Mcs extends [StoreMutatorIdentifier, unknown][] = []  // 현재 미들웨어가 추가할 타입 로그
> = (
  set: StoreApi<T>['setState'],
  get: StoreApi<T>['getState'],
  store: StoreApi<T>
) => T;
```

이 복잡한 제네릭 체인은 "지금까지 어떤 미들웨어들이 거쳐갔고, 이번에 어떤 기능이 추가되는가?"를 타입스크립트가 끝까지 추적하게 만든다. 덕분에 여러 미들웨어를 중첩해서 써도 타입 추론이 깨지지 않는 안전한 스토어를 가질 수 있다.

### 1단계: 커스텀 로거의 타입 설계 (logger.ts)

```ts
// src/store/middleware/logger.ts
import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string
) => StateCreator<T, Mps, Mcs>;
```

- **import type**: 타입스크립트 컴파일러에게 "이것은 런타임에 코드가 생성되지 않는 순수 타입이다"라고 알려준다. Vite가 브라우저용 코드를 만들 때 실존하지 않는 `StateCreator`를 찾으려다 발생하는 SyntaxError를 원천 차단한다.
- **고차 함수(HOF)**: "스토어 조리법(함수)"을 인자로 받아, 로깅 기능이 추가된 "새로운 조리법(함수)"을 반환한다. 원본 코드를 수정하지 않고 기능을 덧붙이는 가장 우아한 방식이다.
- **타입 보존**: `Mps`를 그대로 전달함으로써 로거 뒤에 올 다른 미들웨어들이 이전의 타입 정보를 잃지 않도록 보존한다.

### 2단계: 로거 로직 구현 (가로채기와 시간 여행)

```ts
// src/store/middleware/logger.ts (계속)
export const logger: Logger = (f, name) => (set, get, store) => {
  const loggedSet: typeof set = (...a) => {
    console.log(`%c[Zustand] ${name || 'Store'} 업데이트 시작`, 'color: #4CAF50; font-weight: bold;');
    console.log('이전 상태(Prev):', get());

    // Zustand의 set은 동기(Synchronous)적으로 작동한다.
    // 이 줄이 끝나면 상태는 이미 변해 있다.
    set(...a);

    console.log('다음 상태(Next):', get());
    console.log('%c업데이트 완료', 'color: #4CAF50; font-weight: bold;');
  };

  // 원래의 set 대신 우리가 가로챈 loggedSet을 전달하는 것이 핵심이다.
  return f(loggedSet, get, store);
};
```

## 코드 해설

- **가로채기(Interception)**: 컴포넌트에서 상태 변경을 요청하면, 명령은 스토어가 아닌 `loggedSet` 검문소에 먼저 도착한다.
- **typeof set**: Zustand의 `set`은 상태의 일부만 바꾸거나 전체를 교체하는 등 내부 오버로딩이 복잡하다. `typeof`로 복제하여 원본의 모든 타입 정보를 그대로 계승한다.
- **순서의 미학**: `set` 호출 직전에 `get()`을 찍고, 직후에 다시 `get()`을 찍는 이 단순한 배치가 상태 변화를 한눈에 보여주는 강력한 '시간 여행' 디버깅 도구가 된다.

### 수동 로그 vs 커스텀 로거 미들웨어 비교

| 항목 | 수동 로그 | 커스텀 로거 미들웨어 |
|------|-----------|---------------------|
| 구현 효율성 | 모든 액션마다 로그를 작성해야 함 | 단 한 번의 설정으로 모든 변화 자동 추적 |
| 관심사의 분리 | 비즈니스 로직에 디버깅 코드가 섞임 | 코드가 매우 깨끗하게 유지됨 |
| 데이터 정확성 | 수동 기록이므로 누락 가능 | set 함수 자체를 가로채기 때문에 100% 정확 |
| 확장성 | 변경 시 모든 곳을 수정해야 함 | Sentry나 로그 서버 전송 기능을 쉽게 추가 가능 |

### 테스트 시 주목해야 할 포인트

코드를 실행하고 버튼을 누른 뒤, 브라우저 콘솔(F12)에서 다음을 확인한다.

- **초록색 라벨**: `[Zustand] AuthStore 업데이트 시작` 문구가 눈에 띄게 나타나는지 확인
- **Prev vs Next**: 업데이트 전 `user: null`이었던 데이터가, 업데이트 후 입력한 값으로 변해 있는지 객체 내용을 대조
- **동기적 기록**: 로그 순서가 항상 `시작 -> Prev -> Next -> 완료` 순으로 고정되어 나타나는지 확인
- **타입 추론**: 에디터 상에서 `get()`이나 `set()` 위에 마우스를 올렸을 때 타입 정보가 깨지지 않는지 확인

## 실무 비유

미들웨어는 건물 입구의 **보안 게이트**와 같다. 모든 방문자(상태 변경 요청)는 건물에 들어가기 전에 게이트를 통과해야 하고, 게이트에서는 방문 기록을 남기고 신원을 확인한 뒤에야 출입을 허가한다. 이 게이트가 없으면 누가 언제 들어왔는지 전혀 추적할 수 없지만, 한번 설치해두면 모든 출입 기록이 자동으로 남는다.

## 핵심 포인트

- 미들웨어는 원본 `set` 함수를 **감싸는 래퍼 함수**를 만들어 중간에 로직을 끼워 넣는 구조다
- `import type`을 사용하면 런타임에 코드가 생성되지 않는 순수 타입 임포트가 되어 빌드 에러를 방지한다
- 로거의 핵심은 `set` 호출 전후로 `get()`을 찍어 **이전/이후 상태를 대조**하는 것이다
- 고차 함수(HOF) 패턴으로 원본 코드를 수정하지 않고 기능을 덧붙인다
- Zustand의 타입 시스템(`T`, `Mps`, `Mcs`)은 여러 미들웨어를 중첩해도 **타입 추론이 깨지지 않도록** 설계되어 있다

## 자가 점검

1. 미들웨어가 원본 `set` 함수를 직접 수정하지 않고 기능을 추가하는 패턴의 이름은 무엇인가?
2. `import type`과 일반 `import`의 차이는 무엇이며, 왜 미들웨어 작성 시 `import type`을 사용해야 하는가?
3. 로거 미들웨어에서 `set` 호출 전후에 `get()`을 호출하는 이유는 무엇인가?
4. 커스텀 로거를 Sentry 같은 외부 모니터링 서비스로 확장하려면 어떤 부분을 수정하면 되는가?
5. Zustand 타입 시스템에서 `Mps`와 `Mcs`가 각각 담당하는 역할은 무엇인가?
