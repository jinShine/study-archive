📖 상세 개념 가이드 (The Core Manual)
지난 시간 우리는 useReducer의 그 무겁고 장황한 쇠사슬을 끊어버리고, 함수 하나로 모든 것을 해결하는 Zustand의 선언적 간결함에 감탄했습니다.

아키텍트의 길은 단순히 코드를 줄이는 데서 멈추지 않습니다. 엔진이 가볍고 단순해졌다면 이제는 그 엔진이 얼마나 효율적으로 에너지를 쓰는지, 즉 '연비'를 고민해야 할 때입니다. 전역 상태 관리에서 이 연비란 바로 렌더링 횟수(Rendering Count)를 의미합니다. 아무리 코드가 우아해도 데이터 하나가 바뀔 때마다 상관없는 컴포넌트들까지 모두 다시 그려진다면 그 시스템은 결국 과부하로 멈추고 말 것입니다.

오늘은 Zustand 성능 최적화의 꽃이자, 필요한 데이터만 현미경으로 보듯 정확히 골라내어 엔진의 효율을 극한으로 끌어올리는 셀렉터(Selector) 기법을 초정밀 튜토리얼 형태로 파헤쳐 보겠습니다.

1. 배경: 'Zustand 물류센터'와 구독의 문제
여러분이 아주 거대한 유통 단지인 'Zustand 물류센터'를 구독하고 있다고 가정해 봅시다. 이 물류센터에는 신선식품, 가전제품, 의류 등 수만 가지 물건이 있습니다.

문제 상황: 만약 여러분이 "물류센터에 변화가 생기면 무조건 나에게 알려줘!"라고 광범위하게 구독을 신청하면 어떤 일이 벌어질까요? 여러분은 그저 '사과' 한 알의 가격이 궁금할 뿐인데, 저 멀리 가전 매장의 냉장고 모델이 바뀌어도 매번 휴대폰 벨소리가 울리며 알림이 올 것입니다.
해결책: 이것이 바로 상태 관리에서 발생하는 불필요한 리렌더링(Unnecessary Re-rendering)의 실체입니다. 셀렉터(Selector)는 이 상황에서 "나는 오직 사과 가격만 지켜볼 거야"라고 범위를 좁혀주는 아주 정밀한 필터 역할을 수행합니다.
2. 역할: 선택적 구독 (Selective Subscription)
Zustand의 셀렉터는 엔진에게 전달하는 '정밀 구독 신청서'입니다.

필터링: 스토어라는 거대한 창고에서 다른 건 관심 없고 특정 상자의 내용물만 감시하겠다고 계약을 맺는 것입니다.
독립성: 한 데이터가 변해도 그 데이터를 구독하지 않은 다른 컴포넌트들은 평온함을 유지합니다. 이를 통해 컴포넌트 간의 결합도를 낮추고 성능을 격리합니다.
3. 기능: 엄격한 비교 (Strict Equality Check)
기술적으로 Zustand는 셀렉터 함수가 반환하는 값을 메모리에 기억해 두었다가, 상태가 변할 때마다 이 값이 이전과 엄격하게 같은지(oldValue === newValue) 비교합니다.

[상세 메커니즘 Flow]

상태 변경: 사용자가 버튼을 클릭하여 set 함수가 호출되고, Zustand 내부에 새로운 상태 객체가 생성됩니다.
셀렉터 실행: 엔진이 해당 스토어를 구독 중인 모든 컴포넌트의 셀렉터 함수(예: state => state.bears)를 다시 실행합니다.
결과값 비교: 셀렉터가 갓 계산해낸 '새 결과값'이 컴포넌트가 이전에 가지고 있던 '기존 결과값'과 일치하는지 비교합니다.
조건부 알림: 값이 다를 때만 리액트에게 "이 컴포넌트는 다시 그려야 해!"라고 신호를 보냅니다. 만약 값이 같다면 엔진은 조용히 다음 컴포넌트로 넘어갑니다.
💻 실습 1단계: 동물원 스토어 설계 (useZooStore.ts)
가장 먼저 전체 시스템의 뼈대가 될 설계도를 작성합니다. 곰과 물고기의 마릿수를 관리하는 정밀한 엔진입니다.

/* [File Path]: src/store/useZooStore.ts
   [Copyright]: © nhcodingstudio 소유
*/
import { create } from 'zustand';

// [1] 동물원의 데이터 규격을 정의하는 설계도입니다.
interface ZooStore {
  bears: number;
  fish: number;
  addBear: () => void;
  addFish: () => void;
}

// [2] 실제 엔진 구현부입니다.
// 초기 마릿수는 0에서 시작하며, 각각의 액션은 자신의 영역만 수정하도록 설정합니다.
export const useZooStore = create<ZooStore>((set) => ({
  bears: 0,
  fish: 0,

  /**
   * [정밀 분석]: addBear 액션 Flow
   * 1. 현재 상태(state)를 함수형 업데이트 인자로 받습니다.
   * 2. 'bears' 값만 1 증가시킨 새로운 객체를 반환합니다.
   * 3. 이때 'fish' 값은 기존 상태를 그대로 유지(Shallow Merge)합니다.
   */
  addBear: () => set((state) => ({ bears: state.bears + 1 })),

  addFish: () => set((state) => ({ fish: state.fish + 1 })),
}));

🔍 정밀 코드 Flow 분석 (Store 측면)
State Initializing: bears: 0, fish: 0으로 메모리에 초기 상태 객체가 생성됩니다.
Immutable Update: set이 실행될 때 Zustand는 기존 객체를 수정하지 않고, 변경된 값만 반영된 새로운 참조(Reference)를 가진 객체를 생성합니다. 이 참조의 변화가 리액트의 '반응성'을 깨우는 첫 번째 신호탄이 됩니다.
💻 실습 2단계: 곰 관찰소 컴포넌트 (BearCounter.tsx)
오직 곰의 숫자만 궁금해하는 '곰 관찰소' 컴포넌트입니다.

/* [File Path]: src/components/BearCounter.tsx
   [Copyright]: © nhcodingstudio 소유
*/
import React from 'react';
import { useZooStore } from '../store/useZooStore';

export function BearCounter() {
  /**
   * [핵심]: 셀렉터 서명
   * (state) => state.bears 는 "나는 스토어 전체가 아니라 bears 필드만 감시하겠다"는 계약입니다.
   * 이로 인해 fish가 0에서 100이 되어도 이 컴포넌트는 영향을 받지 않습니다.
   */
  const bears = useZooStore((state) => state.bears);

  // 함수(액션) 역시 셀렉터로 가져오면 참조 무결성을 지키는 데 유리합니다.
  const addBear = useZooStore((state) => state.addBear);

  console.log('🐻 곰 컴포넌트가 다시 그려집니다!');

  return (
    <div style={{ border: '2px solid brown', padding: '20px', borderRadius: '10px' }}>
      <h2>곰 우리</h2>
      <p>현재 곰: <strong>{bears}</strong>마리</p>
      <button onClick={addBear}>곰 추가</button>
    </div>
  );
}

🔍 정밀 코드 Flow 분석 (Subscriber: Bear)
State Change (Fish): 만약 물고기 버튼을 눌러 fish가 0에서 1로 변하면?
Zustand 엔진이 BearCounter의 셀렉터 state.bears를 실행합니다.
결과값은 여전히 0입니다.
이전 값(0)과 비교: 은 True이므로 변화가 없다고 판단합니다.
결과: 리액트에게 리렌더링 신호를 보내지 않습니다. 콘솔 로그가 찍히지 않는 것을 확인하세요!
💻 실습 3단계: 물고기 연못 컴포넌트 (FishCounter.tsx)
물고기만 전문적으로 지켜보는 독립적인 컴포넌트입니다.

/* [File Path]: src/components/FishCounter.tsx
   [Copyright]: © nhcodingstudio 소유
*/
import React from 'react';
import { useZooStore } from '../store/useZooStore';

export function FishCounter() {
  /**
   * [핵심]: 물고기 전용 주파수 구독
   * bears의 변화는 무시하고 오직 fish의 변화에만 귀를 기울입니다.
   */
  const fish = useZooStore((state) => state.fish);
  const addFish = useZooStore((state) => state.addFish);

  console.log('🐟 물고기 컴포넌트가 다시 그려집니다!');

  return (
    <div style={{ border: '2px solid blue', padding: '20px', marginTop: '20px', borderRadius: '10px' }}>
      <h2>물고기 연못</h2>
      <p>현재 물고기: <strong>{fish}</strong>마리</p>
      <button onClick={addFish}>물고기 추가</button>
    </div>
  );
}

🔍 정밀 코드 Flow 분석 (Subscriber: Fish)
Independent Tracking: 곰 우리 버튼을 아무리 눌러도 이 컴포넌트의 셀렉터 결과값은 변하지 않습니다.
렌더링 격리: 동일한 중앙 통제실(Store)을 공유하지만, 성능 관점에서는 마치 두 개의 독립된 useState를 쓰는 것처럼 완벽하게 분리되어 동작합니다. 이것이 바로 아키텍트가 추구하는 '관심사의 분리'와 '성능의 격리'입니다.
✅ 최종 점검 (Final Verification)
Selective Subscription: 거대한 전역 상태라는 바다에서 우리가 필요한 낚싯줄만 드리우는 기술입니다.
렌더링 효율: useState를 개별 컴포넌트에서 쓰는 것과 동일한 수준의 민첩함을 전역 상태에서도 누릴 수 있게 됩니다.
Best Practice: const state = useStore() 처럼 통째로 가져오는 습관을 버리고, 반드시 (state) => state.part 형태의 셀렉터를 사용하여 "연비"를 챙기세요.
