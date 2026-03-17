# 22강. useRef 실전 활용 (1부) — 이전 상태 추적과 로직 최적화의 원리

## 도입

리액트는 기본적으로 "과거 데이터를 기억하기"와 "첫 렌더링을 건너뛰기" 기능을 제공하지 않는다. 차트 앱, 금융 시스템, 복잡한 폼 검증 등 실무에서는 이전 값과 현재 값을 비교하거나, 페이지 최초 로딩 시 불필요한 동작을 방지해야 하는 상황이 빈번하다.

이번 강의에서는 `useRef`를 렌더링 사이클을 영리하게 이용하는 "데이터 타임머신"으로 활용하는 두 가지 핵심 패턴을 다룬다.

## 개념 설명

**패턴 1: 이전 상태 추적**
- `useEffect`는 렌더링이 완료된 "후에" 실행된다는 점을 활용한다.
- `useEffect` 안에서 현재 값을 Ref에 저장하면, 다음 렌더링 시점에 Ref에는 "직전 값"이 들어있게 된다.

**패턴 2: 초기 렌더링 실행 방지**
- `useRef(true)`로 "첫 방문 여부" 플래그를 만든다.
- `useEffect` 안에서 첫 실행 시 플래그만 끄고 return하면, 두 번째 렌더링부터만 로직이 실행된다.

**왜 useRef여야 하는가?**

| 상황 | let 변수 | useState | useRef (정답) |
|------|----------|----------|--------------|
| 이전 값 기억 | 렌더링 때마다 초기화됨 | 변경 시 또 리렌더링 유발 (무한 루프 위험) | 데이터만 안전하게 유지 |
| 첫 실행 방지 | 렌더링 때마다 다시 true가 됨 | 스위치 끄는 것만으로 화면이 또 깜빡임 | 로직의 흐름만 깔끔하게 제어 |

## 코드 예제

### 이전 상태 추적 (PriceTracker)

```jsx
import { useState, useEffect, useRef } from "react";

export default function PriceTracker() {
  const [price, setPrice] = useState(1000);

  // 이전 가격을 저장할 금고
  const prevPriceRef = useRef();

  useEffect(() => {
    // [핵심 타이밍] 렌더링 완료 '후'에 현재 가격을 금고에 넣는다
    // 다음 렌더링 때 이 상자에는 '직전 값'이 들어있게 된다
    prevPriceRef.current = price;
  }, [price]);

  // 렌더링 시점에 금고를 열어 지난 기록을 가져온다
  const prevPrice = prevPriceRef.current;

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '15px', backgroundColor: '#fff' }}>
      <h3>주식 시세 분석기 (이전 값 추적)</h3>
      <p>실시간 현재가: <b style={{ fontSize: '1.2rem' }}>{price}원</b></p>
      <p>직전 가격: <b>{prevPrice !== undefined ? `${prevPrice}원` : "데이터 수집 중..."}</b></p>

      <div style={{
        padding: '10px',
        borderRadius: '8px',
        color: price > prevPrice ? 'red' : price < prevPrice ? 'blue' : 'black',
        backgroundColor: '#f8f9fa'
      }}>
        결과: {price > prevPrice ? "▲ 가격 상승" : price < prevPrice ? "▼ 가격 하락" : "변동 없음"}
      </div>

      <div style={{ marginTop: '15px' }}>
        <button onClick={() => setPrice(p => p + 100)}>가격 올리기</button>
        <button onClick={() => setPrice(p => p - 100)} style={{ marginLeft: '10px' }}>가격 내리기</button>
      </div>
    </div>
  );
}
```

### 초기 렌더링 실행 방지 (SkipFirstRender)

```jsx
import { useState, useEffect, useRef } from "react";

export default function SkipFirstRender() {
  const [count, setCount] = useState(0);

  // 처음 왔는지 알려주는 플래그 (화면에 보일 필요 없으므로 useRef)
  const isFirstRender = useRef(true);

  useEffect(() => {
    // 첫 방문이라면 스위치만 끄고 빠져나간다
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // 두 번째 렌더링부터만 실행되는 영역
    console.log("실제 수량 변경 감지! 알림을 전송합니다.");
    alert(`현재 수량이 ${count}개로 변경되었습니다.`);
  }, [count]);

  return (
    <div style={{ padding: '20px', backgroundColor: '#eef2ff', borderRadius: '15px', marginTop: '20px' }}>
      <h3>장바구니 수량 제어 (초기 실행 방지)</h3>
      <p>수량: <b>{count}</b></p>
      <button onClick={() => setCount(prev => prev + 1)}>수량 추가하기</button>
      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>
        * 페이지가 처음 열릴 때는 alert가 뜨지 않는다.<br />
        * 버튼을 누르는 순간부터 alert가 작동한다.
      </p>
    </div>
  );
}
```

## 코드 해설

**PriceTracker:**
- `useEffect` 내의 저장 로직: 리액트는 렌더링을 먼저 하고 `useEffect`를 실행한다. 현재 화면을 다 그린 뒤에야 "이 값은 이제 과거가 될 거야"라며 상자에 담는 것이다. 덕분에 다음 렌더링 때 상자에서 "과거의 나"를 꺼낼 수 있다.
- `prevPriceRef.current`: 상태(useState)와 달리 값이 바뀌어도 화면을 다시 그리지 않으므로, 데이터 비교 로직에만 순수하게 집중할 수 있다.

**SkipFirstRender:**
- `isFirstRender.current = false`: 이 값이 바뀐다고 해서 화면이 다시 그려지지 않는다. 하지만 `useEffect`는 이 값을 보고 "이젠 실행해도 되겠구나"라고 판단한다.
- `return` (조기 종료): 첫 실행 시 로직을 Early Return시켜서 불필요한 알림이나 API 호출을 완벽하게 차단한다.

## 실무 비유

- **이전 값 추적**: 주식 거래 화면에서 현재가 옆에 표시되는 "이전 종가"와 같다. 이전 가격을 별도 금고에 보관해두었다가 현재 가격과 비교해 상승/하락 표시를 한다.
- **초기 렌더링 방지**: 서버에 수량을 저장하는 API가 있다면, 페이지 접속 시 초기값(0)이 서버에 전송되는 것을 막고, 사용자가 실제로 수량을 변경했을 때만 API를 호출하는 최적화가 가능하다.

## 핵심 포인트

1. `useEffect`는 렌더링 "후에" 실행되므로, 그 안에서 현재 값을 Ref에 저장하면 다음 렌더링 시 "직전 값"이 된다.
2. 이전 값 추적 패턴: `useRef()` → `useEffect` 안에서 `ref.current = 현재값` → 다음 렌더링에서 `ref.current`가 이전 값.
3. 초기 렌더링 방지 패턴: `useRef(true)` → `useEffect` 안에서 첫 실행이면 `false`로 전환 후 return → 두 번째부터 로직 실행.
4. 이 두 패턴 모두 `useState`로 구현하면 무한 루프나 불필요한 리렌더링이 발생한다.
5. 화면에 보이지 않는 로직 제어 플래그는 항상 `useRef`가 최적이다.

## 자가 점검

- [ ] PriceTracker에서 가격을 올릴 때마다 "직전 가격"이 한 단계 늦게 따라오는 원리를 `useEffect` 실행 타이밍으로 설명할 수 있는가?
- [ ] SkipFirstRender에서 페이지를 새로고침했을 때 바로 alert가 뜨지 않는 이유를 설명할 수 있는가?
- [ ] 이전 값 추적을 `useState`로 구현하면 어떤 문제가 생기는지 말할 수 있는가?
- [ ] 초기 렌더링 방지 패턴을 다른 상황(예: API 호출)에 적용할 수 있는가?
