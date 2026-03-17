📖 상세 개념 가이드 (The Core Manual)
지난 시간 우리는 useReducer라는 시스템 안에서 액션 하나를 추가하기 위해 서류를 작성하고, 업무 규정집을 고치고, 창구 직원에게 요청서를 전달하는 그 길고 지루한 '코드 노가다'의 현장을 함께 목격했습니다.

안전을 위해 생산성을 포기해야만 했던 그 답답한 상황을 뒤로하고, 오늘은 드디어 그 모든 쇠사슬을 끊어버릴 Zustand만의 마법 같은 간결함에 대해 배워보겠습니다. 우리가 왜 굳이 외부 도구를 빌려와야 했는지, 그 해답이 바로 '선언적 상태 변경'이라는 한 단어에 응축되어 있습니다.

1. 선언적(Declarative) 방식: 명령형 관료주의를 넘어서
19강에서 우리가 경험한 useReducer는 은행 창구에 가서 번거로운 서류 작업을 하던 '명령형 관료주의'였습니다. 반면, Zustand는 스마트폰에 설치된 아주 똑똑한 뱅킹 앱과 같습니다.

배경: 복잡한 절차(Action Type -> Reducer -> Dispatch)를 단순화하여 로직의 직관성을 높이기 위함입니다.
역할: 상태를 바꾸고 싶다면 그저 어떻게 바꿀지 함수로 정의하기만 하면 되고, 나머지는 엔진이 알아서 처리하게 합니다.
기능: 지문 인식 한 번으로 원하는 금액을 직접 입력하고 송금 버튼을 누르는 것처럼, 상태 변경 로직을 직관적이고 단순한 함수 단위로 결합합니다.
2. 액션 타입과 리듀서의 통합
Zustand가 이토록 설득력 있는 해결책이 되는 첫 번째 이유는 바로 '액션 타입과 리듀서의 통합'에 있습니다. 19강에서는 INCREMENT라는 문자열 타입을 만들고, 이를 다시 switch-case 문에서 찾아내는 이중, 삼중의 절차가 필요했습니다. 하지만 Zustand에서는 함수를 만드는 행위 자체가 곧 액션이며, 그 내부에서 set을 호출하는 것이 리듀서의 역할을 수행합니다.

/* [Concept Code 1]: 액션과 리듀서가 하나로 합쳐진 선언적 구조 */

// useReducer: 액션 타입 정의 + switch 문 (분리됨)
// Zustand: 함수 정의 자체가 곧 액션이자 리듀서 (통합됨)
const useStore = create((set) => ({
  count: 0,
  // 'increase'라는 이름을 부르는 순간, 상태가 어떻게 변할지 바로 보입니다.
  increase: () => set((state) => ({ count: state.count + 1 })),
}));

🔍 상세 코드 설명

함수 기반 액션: increase 함수는 "이름" 자체가 액션 타입(type: 'INCREMENT') 역할을 하며, 그 내부의 set 로직이 리듀서(return { ...state, count: state.count + 1 }) 역할을 동시에 수행합니다.
직관성: 개발자는 "어떤 액션을 보낼까?" 고민할 필요 없이, "어떤 함수를 실행할까?"만 생각하면 됩니다.
3. 자동화된 불변성 관리 (Shallow Merge)
Zustand의 set 함수는 기본적으로 얕은 병합(Shallow Merge)을 수행합니다.

배경: useReducer에서 단 하나의 값만 바꾸려 해도 기존 상태를 복사하기 위해 ...state라는 스프레드 연산자를 강제로 사용해야 했던 불편함을 해결하기 위해 도입되었습니다.
역할: 개발자가 "데이터를 어떻게 복사해서 안전하게 전달할까"라는 저수준의 고민에서 벗어나게 합니다.
기능: 바꾸고 싶은 데이터가 담긴 객체만 전달하면, 나머지 데이터들은 Zustand 엔진이 내부적으로 안전하게 유지해 줍니다.
/* [Concept Code 2]: 스프레드 연산자가 사라진 얕은 병합 */

// [과거 방식 (useReducer)]
// return { ...state, message: '바꿀 내용' }; // 모든 데이터를 일일이 복사해야 함

// [Zustand 방식]
// message만 던지면 끝. 다른 데이터(count 등)는 엔진이 지켜줍니다.
updateMessage: (nextMessage) => set({ message: nextMessage }),
🔍 상세 코드 설명

set({ message: nextMessage }): 이 짧은 코드 한 줄이 내부적으로는 기존의 모든 상태를 복사하고 message만 교체하는 작업을 수행합니다.
관심사 분리: 개발자는 이제 "상태 복사"라는 기계적인 업무에서 해방되어 "비즈니스 로직(데이터의 변화)"에만 집중할 수 있습니다.
💻 실습: Zustand로 구현한 선언적 스토어 (useSimpleStore.ts)
이제 개념 가이드에서 배운 내용을 바탕으로 전체 스토어를 조립해 보겠습니다.

/* [File Path]: src/store/useSimpleStore.ts
   [Copyright]: © nhcodingstudio 소유
   [Test Process]:
   1. increase 호출 시 count만 증가하고 message가 유지되는지 확인합니다. (얕은 병합)
   2. updateMessage에 문자열이 아닌 값을 넣었을 때 타입 에러가 나는지 확인합니다. (타입 추론)
*/

import { create } from 'zustand';

// 1. [설계도] 상태와 액션 함수를 한곳에 정의합니다.
interface SimpleStore {
  count: number;
  message: string;
  increase: () => void;
  updateMessage: (nextMessage: string) => void;
  reset: () => void;
}

// 2. [스토어 구현] 복잡한 switch 문 없이 함수 단위로 로직을 작성합니다.
export const useSimpleStore = create<SimpleStore>((set) => ({
  count: 0,
  message: '안녕하세요!',

  // 함수형 업데이트로 이전 상태를 참조하여 숫자를 올립니다.
  increase: () => set((state) => ({ count: state.count + 1 })),

  // 얕은 병합 덕분에 바꾸고 싶은 데이터만 툭 던져주면 끝납니다.
  updateMessage: (nextMessage) => set({ message: nextMessage }),

  // 여러 상태를 한꺼번에 초기화하는 것도 객체 하나로 해결됩니다.
  reset: () => set({ count: 0, message: '초기화됨' }),
}));

🔍 상세 코드 설명

interface SimpleStore: 19강의 Action 타입과 State 인터페이스를 하나로 합친 모습입니다. 이것이 '선언적' 설계의 정석입니다.
set({ message: nextMessage }): 얕은 병합의 위력입니다. count를 따로 명시하지 않아도 Zustand가 안전하게 보존해 줍니다.
타입 추론: updateMessage의 인자가 string임을 명시했으므로, 컴포넌트에서 잘못된 데이터를 넘기면 즉각 빨간 줄이 그어집니다.
💻 실습: UI에서의 선언적 호출 (SimpleCounter.tsx)
/* [File Path]: src/components/SimpleCounter.tsx */
import React from 'react';
import { useSimpleStore } from '../store/useSimpleStore';

export function SimpleCounter() {
  // 1. 필요한 상태와 함수를 구조 분해 할당으로 가져옵니다.
  const { count, message, increase, updateMessage } = useSimpleStore();

  return (
    <div style={{ padding: '20px', border: '1px solid #646cff', borderRadius: '15px' }}>
      <h1>{message}</h1>
      <p>현재 숫자: <strong>{count}</strong></p>

      {/* 2. 복잡한 dispatch 대신 직관적인 함수를 직접 실행합니다. */}
      <button onClick={increase} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        숫자 올리기
      </button>

      <button
        onClick={() => updateMessage('Zustand는 정말 간결하네요!')}
        style={{ marginLeft: '10px', padding: '10px 20px', cursor: 'pointer' }}
      >
        메시지 변경
      </button>
    </div>
  );
}

🔍 상세 코드 설명

선언적 호출: onClick={increase} 처럼 액션을 직접 이벤트 핸들러에 연결합니다. "이 버튼을 누르면 이 행위가 실행된다"는 인과관계가 명확하여 유지보수가 매우 쉬워집니다.
인지 부하 감소: dispatch({ type: '...' }) 처럼 매번 객체를 생성할 필요가 없어 코드 읽기가 매우 쾌적합니다.
⚖️ useReducer vs Zustand: 변화 요약 (List)
19강의 고통과 20강의 해결책을 비교해 보면 아키텍처적 차이가 선명해집니다.

액션 정의 방식

useReducer: 별도의 Action Type 유니온 타입을 설계하고 오타를 감수해야 했습니다.
Zustand: 인터페이스 내부에 함수 형태로 정의하여 타입스크립트의 전폭적인 지원을 받습니다.
상태 업데이트 로직

useReducer: 거대한 switch-case 문(리듀서)을 타고 내려가며 복사본을 만들어야 했습니다.
Zustand: 기능을 수행하는 함수 내부에서 set 한 줄로 업데이트를 선언합니다.
불변성 관리

useReducer: ...state 스프레드 연산자를 매번 수동으로 사용하여 객체를 복제해야 했습니다.
Zustand: 얕은 병합(Shallow Merge)을 통해 변경하고 싶은 값만 던져주면 나머지는 자동 보존됩니다.
코드 수정 및 확장성

useReducer: 기능을 하나 추가하려면 Type -> Reducer -> Dispatch 호출부까지 최소 3곳을 고쳐야 했습니다.
Zustand: 스토어 정의부 한 곳에 함수만 추가하면 모든 준비가 끝납니다.
✅ 최종 점검 (Final Verification)
선언적 방식의 이해: "어떻게(How) 복사할까"가 아닌 "무엇을(What) 바꿀까"에 집중하게 된 변화를 느끼셨나요?
보일러플레이트 제거: 파일 세 개를 넘나들던 노가다가 함수 하나로 압축된 것을 확인하셨나요?
타입 안정성: 함수의 매개변수 문법만으로 payload 타입 추론이 완벽하게 이루어지는 이점을 인지하셨나요?
