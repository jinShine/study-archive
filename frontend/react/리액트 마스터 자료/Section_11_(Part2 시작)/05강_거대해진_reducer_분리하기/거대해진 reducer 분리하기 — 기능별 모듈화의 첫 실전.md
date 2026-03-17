# 05강. 거대해진 reducer 분리하기 -- 기능별 모듈화의 첫 실전

## 도입

실무에서는 리듀서가 커지면 한 파일에 두지 않고 **상수(Constants)**, **액션 생성 함수(Action Creators)**, **리듀서(Reducer)**를 각각 분리하여 관리한다. 이번 강의에서는 이 세 가지를 별도 파일로 나누고 컴포넌트에서 조립하는 모듈화 패턴을 학습한다.

## 개념 설명

### 모듈화의 세 가지 축

| 파일 | 역할 | 비유 |
|------|------|------|
| `cafeteriaConstants.js` | 액션 이름(상수) 정의 | 오타 방지용 목록표 |
| `cafeteriaActions.js` | 액션 생성 함수 (Action Creator) | 요청서 자동 작성 기계 |
| `cafeteriaReducer.js` | 운영 매뉴얼 (Reducer) | 전용 운영 지침서 책자 |

### 왜 분리하는가?

- **Action Creator**: 급식실 직원이 수작업으로 요청서를 쓸 필요 없이, '밥 10인분' 버튼만 누르면 규격에 맞는 요청서가 출력되는 기계와 같다. 사용자는 내부 구조(type이 뭔지, payload 이름이 뭔지)를 몰라도 함수만 부르면 된다.
- **모듈화**: 요리 매뉴얼을 주방 벽면에 포스트잇으로 붙여놓는 대신, 전용 '운영 지침서' 책자로 만들어 서재에 꽂아두는 것과 같다. 덕분에 주방(컴포넌트)은 더 넓고 깨끗해진다.
- **Constants(상수)**: `"ADD_RICE"`라고 직접 치면 `"ADD_RISE"`(오타)라고 쳐도 에러가 안 나서 찾기 힘들지만, 상수를 쓰면 오타 시 자바스크립트가 바로 빨간 줄을 그어준다.

## 코드 예제

### 1. 액션 상수 정의

```js
// cafeteriaConstants.js
export const ACTIONS = {
  ADD_RICE: "ADD_RICE",       // 밥 추가 요청서 이름
  REFILL_SOUP: "REFILL_SOUP", // 국 리필 요청서 이름
  CHANGE_SIDE: "CHANGE_SIDE"  // 반찬 교체 요청서 이름
};
```

### 2. 액션 크리에이터 정의

```js
// cafeteriaActions.js
import { ACTIONS } from './cafeteriaConstants';

// [밥 추가 요청서 자동 작성 함수]
// 수량(amount)만 인자로 넘겨주면 정해진 규격의 객체를 반환한다.
export function addRice(amount) {
  return {
    type: ACTIONS.ADD_RICE,
    amount // 화물(payload) 데이터
  };
}

// [국 리필 요청서 자동 작성 함수]
export function refillSoup(amount) {
  return {
    type: ACTIONS.REFILL_SOUP,
    amount
  };
}

// [반찬 교체 요청서 자동 작성 함수]
export function changeSide(newSide) {
  return {
    type: ACTIONS.CHANGE_SIDE,
    newSide // 새로운 반찬 이름 데이터
  };
}
```

### 3. 리듀서 분리

```js
// cafeteriaReducer.js
import { ACTIONS } from './cafeteriaConstants';

// 오직 '상태'와 '액션'만 받아서 '새 상태'를 계산하는 순수 함수 매뉴얼
export function cafeteriaReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_RICE:
      return { ...state, rice: state.rice + action.amount };

    case ACTIONS.REFILL_SOUP:
      return { ...state, soup: state.soup + action.amount };

    case ACTIONS.CHANGE_SIDE:
      return { ...state, side: action.newSide };

    default:
      return state;
  }
}
```

### 4. 컴포넌트에서 조립하기

```jsx
// ModularCafeteria.jsx
import { useReducer } from 'react';
import { cafeteriaReducer } from '../store/cafeteriaReducer';
import { addRice, refillSoup, changeSide } from '../store/cafeteriaActions';

export default function ModularCafeteria() {
  const initialState = {
    rice: 20,
    soup: 30,
    side: "김치",
  };

  const [state, dispatch] = useReducer(cafeteriaReducer, initialState);

  return (
    <div>
      <h1>실전! 모듈화 급식실 시스템</h1>

      <p>밥 재고: <strong>{state.rice}</strong>인분</p>
      {/* dispatch({ type: ... }) 대신 자동 작성 함수를 호출한다! */}
      <button onClick={() => dispatch(addRice(10))}>밥 10인분 추가</button>

      <p>국 재고: <strong>{state.soup}</strong>인분</p>
      <button onClick={() => dispatch(refillSoup(5))}>국 5인분 추가</button>

      <p>오늘 반찬: <strong>{state.side}</strong></p>
      <button onClick={() => dispatch(changeSide("메추리알장조림"))}>반찬 교체</button>
    </div>
  );
}
```

## 코드 해설

| 요소 | 설명 |
|------|------|
| `ACTIONS` 상수 객체 | 문자열 오타를 원천 차단. 자동 완성 지원 |
| `addRice(amount)` | Action Creator. 함수 호출 한 번으로 규격화된 액션 객체 생성 |
| `cafeteriaReducer` | 별도 파일로 분리된 순수 함수. 컴포넌트 코드를 가볍게 만듬 |
| `dispatch(addRice(10))` | 컴포넌트는 내부 구조를 몰라도 함수만 호출하면 됨 |

## 실무 비유

**모듈화 전**: 주방 벽면에 포스트잇이 잔뜩 붙어 있는 상태. 주방이 지저분하고 레시피를 찾기 어렵다.

**모듈화 후**: 전용 '운영 지침서' 책자로 만들어 서재에 꽂아둔 상태. 주방(컴포넌트)은 깨끗하고, 레시피(로직)를 수정해야 할 때 서재(store 폴더)에서 해당 책자만 꺼내면 된다. 이것이 바로 대규모 서비스로 나아가는 **관심사 분리**의 첫걸음이다.

## 핵심 포인트

- **상수 파일**: 액션 이름을 상수로 관리하면 오타로 인한 디버깅 시간을 크게 줄일 수 있다
- **Action Creator**: 컴포넌트가 액션 객체의 구체적인 생김새를 몰라도 함수 호출만으로 요청서를 만들 수 있다
- **파일 분리**: Constants, Actions, Reducer를 각각 별도 파일로 관리하면 코드가 깔끔해지고 유지보수가 쉬워진다
- 컴포넌트에는 **화면 구성만** 남고, 복잡한 로직은 store 폴더로 이동한다

## 자가 점검

- [ ] `dispatch(addRice(10))` 등의 Action Creator가 실행되어 상태가 잘 바뀌는가?
- [ ] `ACTIONS`나 `addRice`가 정의되지 않았다는 에러가 없는가? (Import 경로 확인 필수)
- [ ] 컴포넌트 파일에서 복잡한 액션 객체 생성 코드가 사라졌음을 확인했는가?
- [ ] Constants, Actions, Reducer 세 파일의 역할을 각각 설명할 수 있는가?
