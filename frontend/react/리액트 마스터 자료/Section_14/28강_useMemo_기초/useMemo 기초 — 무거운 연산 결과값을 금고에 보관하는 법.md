# 28강. useMemo 기초 — 무거운 연산 결과값을 금고에 보관하는 법

## 도입

리액트 컴포넌트가 리렌더링될 때마다 함수 내부의 모든 코드가 재실행된다. 만약 그 안에 무거운 연산이 있다면, 관련 없는 상태 변경에도 CPU가 불필요한 계산을 반복하게 된다. `useMemo`는 연산의 결과값을 캐싱하여, 의존성이 변하지 않으면 이전 결과를 재사용하는 훅이다.

## 개념 설명

**useMemo 기본 문법:**
```jsx
const cachedValue = useMemo(() => 무거운연산(입력값), [의존성]);
```

- 첫 번째 인자: 캐싱할 연산을 담은 콜백 함수
- 두 번째 인자: 의존성 배열 (이 값이 변할 때만 연산을 다시 실행)
- 반환값: 캐싱된 연산 결과

**동작 원리:**
1. 첫 렌더링: 콜백을 실행하고 결과를 저장
2. 이후 렌더링: 의존성이 이전과 같으면 저장된 결과를 반환 (연산 건너뜀)
3. 의존성이 변하면: 콜백을 다시 실행하고 새 결과를 저장

**핵심 비교:**

| 상황 | useMemo 없이 | useMemo 적용 |
|------|-------------|-------------|
| 관련 없는 상태 변경 시 | 무거운 연산 재실행 | 캐시된 결과 즉시 반환 |
| 관련 있는 상태 변경 시 | 연산 재실행 | 연산 재실행 (동일) |

## 코드 예제

### 무거운 연산을 useMemo로 캐싱 (CalculationConsole)

```jsx
import { useState, useMemo } from 'react';

export default function CalculationConsole() {
  const [number, setNumber] = useState(0);
  const [isDark, setIsDark] = useState(false);

  // useMemo: number가 변할 때만 연산을 다시 실행
  // isDark가 변해도 이 연산은 건너뛴다
  const result = useMemo(() => {
    console.log("연산 가동!");
    for (let i = 0; i < 1000000000; i++) {} // 무거운 연산 모사
    return number * 100;
  }, [number]); // number가 바뀔 때만 재계산

  return (
    <div style={{
      backgroundColor: isDark ? '#333' : '#fff',
      color: isDark ? '#fff' : '#000',
      padding: '40px'
    }}>
      <input
        type="number"
        value={number}
        onChange={(e) => setNumber(Number(e.target.value))}
      />
      <p>결과: {result}</p>
      <button onClick={() => setIsDark(!isDark)}>테마 변경</button>
    </div>
  );
}
```

## 코드 해설

- `useMemo(() => { ... }, [number])`: `number`가 변할 때만 콜백을 실행한다. `isDark`가 변해서 리렌더링이 일어나도 이 연산은 건너뛴다.
- `for (let i = 0; i < 1000000000; i++) {}`: 실제로는 복잡한 수학 연산, 대량 데이터 정렬, 필터링 등이 들어갈 자리다. useMemo 없이는 테마 변경만 해도 이 루프가 실행되어 화면이 멈춘다.
- `[number]` (의존성 배열): useMemo에게 "이 값이 바뀔 때만 다시 계산해"라고 지시하는 감시 목록이다.
- 테마 변경 버튼을 눌렀을 때 콘솔에 "연산 가동!"이 찍히지 않으면 useMemo가 정상 작동하는 것이다.

## 실무 비유

- `useMemo`는 은행 금고와 같다. 한 번 계산한 결과(돈)를 금고에 넣어두고, 같은 요청이 오면 금고에서 바로 꺼내준다. 입금(의존성 변경)이 새로 들어왔을 때만 금고를 열어 내용을 교체한다.
- useMemo 없는 상태는 매번 주문할 때마다 원두를 로스팅하는 카페와 같다. useMemo가 적용된 상태는 미리 로스팅해둔 원두를 바로 내리는 것이다.

## 핵심 포인트

1. `useMemo`는 연산의 "결과값"을 캐싱한다 (함수가 아닌 값).
2. 의존성 배열의 값이 변하지 않으면 이전 결과를 재사용한다.
3. 모든 연산에 useMemo를 쓰는 것이 아니라, 실제로 무거운 연산에만 적용해야 한다 (오버헤드 존재).
4. useMemo 자체도 비교 연산과 캐시 관리 비용이 있으므로, 단순한 연산에는 오히려 성능이 나빠질 수 있다.
5. 의존성 배열을 정확하게 지정하는 것이 핵심이다. 빈 배열 `[]`이면 최초 한 번만 계산한다.

## 자가 점검

- [ ] `useMemo`의 첫 번째 인자와 두 번째 인자의 역할을 각각 설명할 수 있는가?
- [ ] 테마 변경(isDark) 시 무거운 연산이 재실행되지 않는 이유를 의존성 배열로 설명할 수 있는가?
- [ ] `useMemo`를 모든 곳에 남발하면 안 되는 이유를 말할 수 있는가?
- [ ] `useMemo`가 캐싱하는 것이 "함수"인지 "값"인지 정확히 구분할 수 있는가?
