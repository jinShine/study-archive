📖 상세 개념 가이드 (The Core Manual)
드디어 우리는 타입스크립트라는 견고한 성벽을 완공하고, 그 위에 데이터를 실어 나를 강력한 엔진을 장착할 Section 2에 진입했습니다. 지난 섹션에서 데이터의 생성과 검증이라는 '수비'에 집중했다면, 이제부터는 그 데이터를 어떻게 효율적으로 모든 컴포넌트에 전달하고 관리할 것인가라는 '공격'을 다뤄보겠습니다.

오늘은 Zustand를 본격적으로 도입하기에 앞서, 우리가 과거에 겪었던 고통스러운 방식(Context API)과 Zustand가 가져다준 혁명적인 변화를 선명하게 대조하며 그 철학적 차이를 파헤쳐 보겠습니다.

🛠 0. 엔진 장착: Zustand 설치하기
Zustand는 용량이 매우 가볍고 의존성이 없는 라이브러리입니다. 터미널을 열고 아래 명령어를 입력하여 프로젝트에 엔진을 이식하세요.

# npm을 사용하는 경우
npm install zustand

# yarn을 사용하는 경우
yarn add zustand
1. [도입 전] Context API의 한계: 전염되는 리렌더링
우리가 상태 관리 도구 없이 순수 리액트만으로 거대한 앱을 만들던 시절을 떠올려 보면 우리를 가장 괴롭혔던 것은 바로 프롭 드릴링(Prop Drilling)이었습니다. 이는 빌딩 1층에 있는 물건을 10층까지 전달하기 위해 중간층 거주자들이 생업을 전폐하고 줄을 서서 물건을 전달하는 것과 같습니다. 정작 물건이 필요 없는 중간층 사람들도 리렌더링이라는 비용을 지불해야 했죠.

이를 해결하기 위해 등장한 Context API 역시 실무에서는 또 다른 고통을 낳았습니다. 컨텍스트는 상태 관리자가 아닌 '의존성 주입 도구'입니다. 컨텍스트라는 거대한 보자기 안에 상태를 넣는 순간, 보자기 안의 아주 작은 실밥 하나만 바뀌어도 그 보자기와 연결된 모든 컴포넌트가 깜짝 놀라며 다시 그려지는 전염성 리렌더링의 늪에 빠지게 됩니다.

2. [도입 후] Zustand의 혁명: 필요한 조각만 구독하는 중앙 창고
Zustand는 리액트 컴포넌트 트리 외부에 상태를 저장하는 방식을 취합니다. 빌딩 한가운데에 누구나 언제든 접근할 수 있는 독립적인 중앙 창고(Store)를 세우는 방식입니다. 물건이 필요한 사람은 중간층을 거칠 필요 없이 창고로 직접 가서 필요한 것만 쏙 가져오면 됩니다.

특히 Zustand의 가장 강력한 특징은 셀렉터(Selector) 패턴입니다. 이는 창고에서 사과를 꺼낸다고 해서 포도를 기다리는 사람이 방해받거나 리렌더링될 일이 전혀 없음을 의미하며, Context API가 가진 치명적인 단점인 전체 리렌더링 문제를 원천적으로 해결합니다.

💻 도입 전: Context API 방식 (The Old Way)
숫자 하나를 전역에서 관리하기 위해 우리가 감내해야 했던 전형적인 번거로움을 코드로 살펴보겠습니다.

/* [File Path]: src/contexts/CounterContext.tsx */

import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

// 1. 상태의 모양(Interface)을 정의하여 데이터 규격을 맞춥니다.
interface CounterState {
  count: number;
  increment: () => void;
}

// 2. 컨텍스트를 생성합니다. 초기값 null 처리가 항상 우리를 괴롭히는 복병이 됩니다.
const CounterContext = createContext<CounterState | null>(null);

// 3. 데이터를 공급할 '보자기(Provider)' 컴포넌트를 설계합니다.
export function CounterProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  // 리렌더링 폭주를 막기 위해 함수를 일일이 'useCallback'으로 묶어주는 수고가 동반됩니다.
  const increment = useCallback(() => setCount(prev => prev + 1), []);

  // 보자기 안의 값이 바뀔 때마다 전체가 다시 그려지는 것을 방지하려 'useMemo'를 필수적으로 사용합니다.
  const value = useMemo(() => ({ count, increment }), [count, increment]);

  return (
    <CounterContext.Provider value={value}>
      {children}
    </CounterContext.Provider>
  );
}

// 4. 안전한 사용을 위해 매번 null 체크를 수행하는 커스텀 훅을 별도로 정의해야 합니다.
export function useCounter() {
  const context = useContext(CounterContext);
  if (!context) throw new Error("CounterProvider 내부에서만 사용 가능합니다.");
  return context;
}

🔍 상세 코드 분석 (Context API)

복잡한 보일러플레이트: 숫자 하나를 위해 인터페이스, 컨텍스트, 프로바이더, 커스텀 훅까지 총 4단계를 구축해야 합니다.
성능 최적화의 짐: useCallback과 useMemo를 강제적으로 사용하여 객체 참조 무결성을 지켜야 합니다. 이를 놓치면 하위의 모든 컴포넌트가 무차별적으로 리렌더링됩니다.
런타임 불안정성: Provider 밖에서 훅을 호출하면 앱이 즉시 터지기 때문에, 항상 예외 처리 로직이 코드에 포함되어야 합니다.
💻 도입 후: Zustand 방식 (The Modern Way)
동일한 기능을 Zustand로 구현했을 때 얼마나 경이로울 정도로 단순해지는지 확인해 보겠습니다.

/* [File Path]: src/store/useCounterStore.ts */

import { create } from 'zustand';

// 1. 창고(Store)의 설계도를 작성합니다. Section 1에서 배운 인터페이스 기술이 여기서 활약합니다.
interface CounterStore {
  count: number;
  increment: () => void;
}

// 2. 창고를 즉석에서 생성합니다. create 함수를 통해 별도의 Provider 래핑 없이
// 어디서든 즉시 접근 가능한 상태 저장소가 탄생합니다.
export const useCounterStore = create<CounterStore>((set) => ({
  count: 0, // 상태의 초기값입니다.
  // 상태를 변화시키는 액션입니다. 'set' 함수가 불변성을 내부적으로 안전하게 관리합니다.
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

/* [Usage]: 실제 컴포넌트에서의 사용 */
function CounterDisplay() {
  // 3. 셀렉터(Selector) 패턴: 전체 창고에서 오직 'count'만 선택해서 가져옵니다.
  const count = useCounterStore((state) => state.count);
  return <h1>현재 숫자: {count}</h1>;
}

🔍 상세 코드 분석 (Zustand)

압도적 간결함: create 함수 하나로 모든 정의가 끝납니다. 리액트 컴포넌트 트리를 Provider로 감싸는 작업이 완전히 사라져 코드가 훨씬 깨끗해집니다.
정밀한 리렌더링: (state) => state.count 셀렉터를 사용하면, 리액트는 이 컴포넌트가 오직 count 변화에만 반응하도록 최적화합니다. 창고 내의 다른 데이터가 수만 번 바뀌어도 이 컴포넌트는 침묵을 유지합니다.
불변성 자동 관리: set 함수 내부에서 이전 상태(state)를 안전하게 참조하여 업데이트할 수 있으며, 복잡한 스프레드 연산 없이도 상태를 우아하게 변경합니다.
⚖️ 전략적 선택: 중앙 창고 vs 지역적 설정
Zustand가 강력하다고 해서 Context API가 아예 쓸모없는 것은 아닙니다. 아키텍트의 전략적 선택이 필요합니다.

Zustand (중앙 엔진): 앱 전체를 관통하는 비즈니스 데이터(사용자 정보, 장바구니 등)와 빈번하게 업데이트되는 성능 민감 상태에 사용합니다.
Context API (지역적 설정): 한 번 결정되면 거의 바뀌지 않는 정적인 데이터(다크 모드, 다국어 설정)나 컴포넌트 트리 일부에만 적용되는 의존성 주입에 적합합니다.
✅ 최종 점검 (Final Verification)
1. 완성된 디렉토리 구조

16강._상태관리_세대교체/
├── src/
│   ├── store/
│   │   └── useCounterStore.ts # Zustand 중앙 창고 (© nhcodingstudio)
│   ├── App.tsx               # 상태 소비 컴포넌트
│   └── main.tsx              # 앱 엔트리 포인트

2. 화면 동작 상태

Context 방식: 숫자 변경 시 Provider 하위의 모든 컴포넌트가 리렌더링 영향을 받습니다.
Zustand 방식: 셀렉터를 통해 구독한 데이터가 변할 때만 해당 컴포넌트가 반응하며, 리렌더링을 0에 가깝게 줄여줍니다.
