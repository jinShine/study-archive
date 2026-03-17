# 03강. useReducer 구조 완전 이해 -- state, action, reducer를 생활 비유로

## 도입

이번 강의에서는 '급식실 비유'를 실제 코드로 옮겨보며 useReducer의 작동 원리를 파헤친다. **재고표(State)**, **운영 매뉴얼(Reducer)**, **요청서(Action)**, **요청서 전달(Dispatch)** 의 관계를 명확히 이해하는 것이 목표다.

## 개념 설명

### useReducer의 4가지 구성 요소

| 구성 요소 | 급식실 비유 | 역할 |
|-----------|------------|------|
| **State** | 현재 화이트보드에 적힌 재고 수량 | 최신 상태값 |
| **Action** | "밥 1인분 추가!"라고 적힌 포스트잇 | 어떤 행동을 할지 적힌 객체 |
| **Dispatch** | 그 포스트잇을 관리 책임자에게 전달하는 팔 | 액션을 리듀서에게 전달하는 함수 |
| **Reducer** | 포스트잇을 보고 화이트보드 숫자를 지우고 새로 적는 관리 책임자 | 규칙에 따라 새로운 상태를 계산하는 순수 함수 |

### Reducer 함수의 특징

- **컴포넌트 외부에 정의해도 된다**: 오직 '현재 상태'와 '요청서'만 보고 계산만 수행하는 정직한 함수이기 때문
- **dispatch의 안정성**: 리액트가 dispatch 함수를 재생성하지 않도록 보장한다. 컴포넌트가 리렌더링되어도 dispatch의 정체성은 유지되어 성능 최적화에 유리하다

## 코드 예제

```jsx
import { useReducer } from 'react';

/**
 * [운영 매뉴얼: Reducer 함수]
 * @param {number} state - 현재 재고표 (현재 값)
 * @param {object} action - 요청서 (어떤 행동을 할지 적힌 객체)
 * @returns {number} - 규칙에 따라 업데이트된 새로운 재고표
 */
function cafeteriaReducer(state, action) {
  // 매뉴얼을 펼쳐서 요청서(action.type)를 확인한다.
  switch (action.type) {
    case 'INCREASE':
      // 밥 추가 요청이 오면 현재 재고에 1을 더한 '새 재고표'를 반환
      return state + 1;
    case 'DECREASE':
      // 밥 배식 요청이 오면 현재 재고에서 1을 뺀 '새 재고표'를 반환
      // (재고가 0 미만으로 떨어지지 않게 방어 로직 포함)
      return state > 0 ? state - 1 : 0;
    default:
      // 매뉴얼에 없는 요청이 오면 현재 재고표를 그대로 유지
      return state;
  }
}

export default function CafeteriaPage() {
  /**
   * [useReducer 설정]
   * count: 현재 식재료 재고표 (최신 상태)
   * dispatch: 요청서를 매뉴얼 담당자에게 보내는 행위 (배달원)
   * cafeteriaReducer: 운영 매뉴얼
   * 0: 초기 재고 (initialState)
   */
  const [count, dispatch] = useReducer(cafeteriaReducer, 0);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>급식실 재고 관리 시스템</h1>
      <div style={{ fontSize: '2rem', margin: '20px' }}>
        현재 남은 밥(인분): <strong>{count}</strong>
      </div>

      <div>
        {/* dispatch를 호출하는 것은 요청서(Action)를 매뉴얼(Reducer)에 던지는 것 */}
        <button onClick={() => dispatch({ type: 'INCREASE' })}>
          밥 추가 조리 (INCREASE)
        </button>
        <button onClick={() => dispatch({ type: 'DECREASE' })}>
          밥 배식 하기 (DECREASE)
        </button>
      </div>

      <p>
        버튼을 누르면 <strong>Dispatch</strong>가 <strong>Action</strong>을 들고
        <strong>Reducer</strong>로 달려간다!
      </p>
    </div>
  );
}
```

## 코드 해설

| 요소 | 설명 |
|------|------|
| `cafeteriaReducer(state, action)` | 컴포넌트 외부에 정의된 순수 함수. 현재 상태와 요청서만 보고 계산 수행 |
| `dispatch({ type: '...' })` | 컴포넌트 내부에 직접적인 계산 로직(`state + 1`)이 없음. "어떤 일이 일어났는지"만 보고 |
| `state > 0 ? state - 1 : 0` | 재고가 음수로 떨어지지 않도록 하는 방어 로직 |
| `default: return state` | 매뉴얼에 없는 요청이 오면 현재 상태를 그대로 유지 (안전장치) |
| `useReducer(cafeteriaReducer, 0)` | 리듀서 함수와 초기값(0)을 전달하여 [state, dispatch] 쌍을 생성 |

## 실무 비유

급식실을 운영한다고 생각해보자.

- **State**: 현재 화이트보드에 적힌 재고 수량
- **Action**: "밥 1인분 추가!"라고 적힌 포스트잇
- **Dispatch**: 그 포스트잇을 관리 책임자에게 전달하는 팔
- **Reducer**: 포스트잇을 보고 화이트보드 숫자를 지우고 새로 적는 관리 책임자

리액트는 관리 책임자(Reducer)가 반환하는 값을 보고 화면을 다시 그릴지 결정한다.

## 핵심 포인트

- Reducer는 **순수 함수**다: 같은 입력(state, action)이면 항상 같은 결과를 반환
- dispatch 함수는 리액트가 **재생성하지 않도록 보장**하므로, 리렌더링되어도 dispatch의 정체성이 유지된다 (성능 최적화에 유리)
- UI 코드와 비즈니스 로직이 **깔끔하게 분리**된다: 컴포넌트는 "무엇이 일어났는지"만, 리듀서는 "어떻게 바꿀지"만 담당
- `default: return state`는 정의되지 않은 액션에 대한 안전장치

## 자가 점검

- [ ] 화면에 '현재 남은 밥' 숫자가 잘 표시되는가?
- [ ] '추가 조리' 버튼 클릭 시 숫자가 정확히 1씩 증가하는가?
- [ ] '배식 하기' 버튼 클릭 시 숫자가 1씩 감소하며, 0 아래로는 떨어지지 않는가? (방어 로직 확인)
- [ ] State, Action, Dispatch, Reducer 각각의 역할을 급식실 비유로 설명할 수 있는가?
