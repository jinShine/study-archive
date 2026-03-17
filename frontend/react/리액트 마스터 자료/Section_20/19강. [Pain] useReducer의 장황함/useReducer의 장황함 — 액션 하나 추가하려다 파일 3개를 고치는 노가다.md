📖 상세 개념 가이드 (The Core Manual)
지난 시간 우리는 백화점의 층을 나누듯 스토어를 조각내어 관리하는 슬라이스 패턴(Slice Pattern)을 통해, 거대한 시스템을 어떻게 체계적으로 설계하는지 배웠습니다. 구조를 잡는 법을 익혔으니, 이제 그 내부를 채우는 '방식'에 대해 고민할 차례입니다.

사실 리액트 생태계에는 Zustand가 등장하기 훨씬 전부터 복잡한 상태를 관리하기 위해 전수되어 온 useReducer라는 정석적인 방법이 있었습니다. 하지만 수많은 시니어 개발자들이 왜 이 정석을 뒤로하고 Zustand로 망설임 없이 '망명'을 떠났을까요? 오늘은 그 이유를 증명하기 위해 useReducer가 강요하는 장황한 절차와 그로 인한 '코드 노가다'의 실체를 파헤쳐 보겠습니다.

1. 배경: 은행 창구 시스템과 useReducer
useReducer는 은행의 창구 업무 시스템과 매우 닮아 있습니다. 금고로 직접 달려가 돈을 꺼내는 것(상태 직접 변경)은 위험하기에, 은행은 정해진 절차를 요구합니다.

배경: 컴포넌트 내부의 복잡한 상태 로직을 외부로 분리하여 예측 가능한 상태 변경을 유도하기 위해 탄생했습니다.
역할:
액션(Action): "돈 10,000원 출금해줘"라는 요청서.
디스패처(Dispatcher): 요청서를 창구 직원에게 전달하는 행위.
리듀서(Reducer): 업무 규정집을 보고 실제로 금고의 돈을 계산하는 직원.
기능: 현재 상태와 액션을 받아, 규칙에 따라 계산된 새로운 상태를 반환합니다.
2. 문제점: 보일러플레이트(Boilerplate)의 늪
이론적으로는 견고해 보이지만, 실제 개발 현장에서는 아주 작은 기능을 하나 추가하려고 해도 산더미 같은 '서류 작업'이 필요합니다. 아키텍트들은 이를 보일러플레이트라고 부르는데, 이는 기능에 비해 너무나 장황하고 반복적인 코드를 뜻합니다.

타입 정의의 고통: 액션의 종류가 늘어날 때마다 유니온 타입을 계속 업데이트해야 합니다.
파일 간의 의존성: 액션 타입을 고치면, 리듀서의 switch 문을 고쳐야 하고, 마지막으로 UI의 dispatch 호출부까지 최소 3군데를 동시에 수정해야 합니다.
스프레드 지옥: 상태가 조금이라도 깊어지면 ...state를 수없이 중첩해서 사용해야 하는 불변성 유지의 고통이 뒤따릅니다.
💻 실습: 고통의 useReducer 현장 (PainfulCounter.tsx)
카운터 숫자 조작과 유저 메시지 업데이트라는 단순한 기능을 구현하기 위해 우리가 감내해야 할 코드를 확인해 보겠습니다.

/* [File Path]: src/components/PainfulCounter.tsx
   [Copyright]: © nhcodingstudio 소유
   [Test Process]:
   1. INCREMENT 액션을 추가하기 위해 1, 3, 5번 과정을 모두 거쳐야 함을 인지합니다.
   2. 중첩된 객체를 수정할 때 발생하는 스프레드 연산자의 피로도를 체감합니다.
*/

import React, { useReducer } from 'react';

// [1] 요청서의 종류를 정의합니다 (Action Type).
// 새로운 기능(예: RESET)을 넣으려면 반드시 이 타입을 가장 먼저 수정해야 합니다.
type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'UPDATE_MESSAGE'; payload: string };

// [2] 상태의 모양(설계도)입니다 (State Interface).
interface State {
  count: number;
  message: string;
}

const initialState: State = { count: 0, message: '안녕하세요!' };

// [3] 핵심 로직인 '업무 규정집(Reducer)'입니다.
// 모든 로직이 이 거대한 switch-case 문 안에 갇히게 됩니다.
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT':
      // [불변성의 고통]: 기존 상태를 잃지 않기 위해 매번 ...state를 적어야 합니다.
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'UPDATE_MESSAGE':
      // payload에서 데이터를 꺼내 새로운 객체를 반환합니다.
      return { ...state, message: action.payload };
    default:
      // 정의되지 않은 액션이 올 경우 현재 상태를 유지하는 방어 로직입니다.
      return state;
  }
}

export function PainfulCounter() {
  // [4] 컴포넌트와 리듀서를 연결합니다.
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h2>고통의 카운터</h2>
      <p>카운트: {state.count} | 메시지: {state.message}</p>

      {/* [5] 상태 변경을 위해 매번 객체를 생성하여 dispatch해야 합니다. */}
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>증가</button>
      <button onClick={() => dispatch({ type: 'UPDATE_MESSAGE', payload: '반가워요!' })}>
        메시지 변경
      </button>
    </div>
  );
}

🔍 상세 코드 분석 (Recap Analysis)
Action Type: 발생할 수 있는 모든 '사건'의 목록입니다. 실무에서는 수백 줄에 달하게 되며, 오타가 나면 타입스크립트의 에러를 마주하게 됩니다.
Reducer Function: 순수 함수로 작성되어야 하기에 외부 변수를 참조할 수 없고, 오직 인자로 받은 state와 action만으로 새로운 상태를 계산해야 합니다.
Spread Operator (...state): 객체의 참조값을 바꿔 리액트에게 변화를 알리기 위한 필수 작업입니다. 상태가 복잡해지면 수많은 중괄호가 겹치는 '스프레드 지옥'이 펼쳐집니다.
Dispatch: 액션을 '발행'하는 행위입니다. 직접 함수를 실행하는 Zustand와 달리, dispatch라는 우체통을 거쳐야만 상태가 변경됩니다.
⚖️ 아키텍트의 시선: useReducer의 양면성
"아키텍처는 복잡한 것을 단순하게 만들어야 합니다. 하지만 대규모 시스템에서의 useReducer는 단순한 것을 복잡하게 만듭니다."

1. useReducer를 써야 할 때 (Defense)
복잡한 로컬 상태: 특정 컴포넌트 내부에서만 쓰이는 상태가 대여섯 개가 넘고, 이들이 서로 얽혀 '상태 머신'처럼 동작할 때 최고의 선택입니다.
의존성 주입: 외부 라이브러리(Zustand 등) 설치 없이 리액트 내장 기능만으로 엄격한 로직 분리가 필요할 때 유용합니다.
2. Zustand로 넘어가야 할 때 (Pain)
전역 상태 관리: 여러 도메인이 얽힌 로직을 관리할 때 useReducer의 장황함은 개발자의 인지 에너지를 엄청나게 갉아먹습니다.
빠른 개발 속도: 버튼 하나 추가하려고 파일 3개를 넘나드는 '서류 작업'에 지쳤을 때 Zustand의 선언적 코드가 해답이 됩니다.
✅ 최종 점검 (Final Verification)
보일러플레이트 인지: 하나의 액션을 추가하기 위해 Type -> Reducer -> UI를 모두 수정해야 함을 이해했나요?
불변성 관리: ...state가 왜 필요한지, 그리고 그것이 왜 개발자를 피로하게 만드는지 느꼈나요?
적재적소: 복잡한 전역 로직에서는 Zustand를, 격리된 고난도 로컬 로직에서는 useReducer를 쓰는 분별력을 갖췄나요?
