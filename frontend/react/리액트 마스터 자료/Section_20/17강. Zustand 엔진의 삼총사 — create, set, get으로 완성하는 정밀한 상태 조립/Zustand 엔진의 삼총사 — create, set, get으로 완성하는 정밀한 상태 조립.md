📖 상세 개념 가이드 (The Core Manual)
드디어 우리는 타입스크립트라는 견고한 성벽을 완공하고, 그 위에 데이터를 실어 나를 강력한 엔진을 장착할 두 번째 섹션에 본격적으로 진입했습니다.

지난 섹션에서 데이터의 생성과 검증이라는 기초 공사에 집중했다면, 오늘부터는 그 데이터를 어떻게 효율적으로 모든 컴포넌트에 전달하고 관리할 것인지를 다뤄보겠습니다. 특히 오늘은 상태 관리의 거대한 패러다임 변화를 주도하고 있는 Zustand 엔진의 핵심 부품들인 create, set, 그리고 get이라는 삼총사의 내부 메커니즘을 초정밀 튜토리얼 형태로 낱낱이 파헤쳐 보겠습니다.

1. create: 엔진의 설계도이자 공장
create 함수는 엔진의 설계도이자 공장 역할을 수행합니다. 스토어를 만든다는 것은 이 함수 안에 우리가 관리할 데이터와 그 데이터를 조작할 액션들을 하나의 묶음으로 정의하는 과정을 의미합니다.

/* [Code Block 1]: create 함수의 기본 형태 */
import { create } from 'zustand';

// create 함수는 상태(State)와 액션(Action)을 포함한 커스텀 훅을 반환합니다.
// (set, get) 인자는 엔진 조립에 필요한 정밀 도구 세트입니다.
const useStore = create((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));

[개념 상세 설명] Zustand의 가장 큰 매력은 리액트 컴포넌트 트리의 외부인 순수한 자바스크립트 영역에 상태를 정의할 수 있다는 점입니다. create는 상태의 초기값뿐만 아니라 상태를 변경할 때 필요한 정밀 도구들을 인자로 넘겨줍니다. 이는 마치 공장장인 우리에게 작업에 필요한 최신 장비 세트를 쥐여주는 것과 같습니다. 과거 useContext가 컴포넌트 트리 내부에 종속되어 흐름을 파악하기 어려웠던 것과 달리, create로 만들어진 스토어는 트리 외부에서 독립적으로 존재하며 필요한 곳 어디든 데이터를 공급하는 강력한 허브가 됩니다.

2. 구독(Subscription)과 useSyncExternalStore: 리액트와의 가교
리액트 외부에 있는 Zustand가 어떻게 컴포넌트의 화면을 다시 그리게 만드는지에 대한 비밀은 리액트가 제공하는 '구독(Subscription)' 메커니즘에 있습니다.

/* [Code Block 2]: 리액트와 스토어를 잇는 가상의 연결 코드 (Conceptual) */

// 리액트 내부에서는 useSyncExternalStore라는 훅이 이 작업을 대행합니다.
// 1. subscribe: 스토어의 값이 바뀌면 리액트에게 알림을 보내는 리스너 등록
// 2. getSnapshot: 현재 스토어의 최신 값을 가져오기
const state = useSyncExternalStore(
  store.subscribe,
  store.getState
);

// Zustand 내부에서 set이 호출되면:
// 1. 상태가 업데이트됨 -> 2. 등록된 모든 리스너(컴포넌트)에 알림 발송 -> 3. 리액트가 화면 리렌더링

[배경 및 상세 설명: useSyncExternalStore] 2026년 현재, 리액트 18 이상 버전에서는 외부 상태 관리 라이브러리를 위해 useSyncExternalStore라는 전용 API를 제공합니다.

배경: 과거에는 외부 상태가 업데이트되는 도중에 리액트가 화면을 그리면(Concurrent Rendering), 같은 상태를 참조하는 두 컴포넌트가 서로 다른 값을 보여주는 '티어링(Tearing)' 현상이 발생할 수 있었습니다.
역할: 이 훅은 외부 저장소(Zustand 등)의 데이터가 변경될 때 리액트의 렌더링 사이클과 완벽하게 동기화되도록 보장합니다. Zustand 내부에서 set이 호출되면 이 가교를 통해 리액트에게 "데이터가 바뀌었으니 확인해 봐!"라고 신호를 보냅니다. 알림을 받은 리액트는 그제야 해당 컴포넌트를 리렌더링하여 화면을 최신 상태로 유지합니다.
3. set: 상태를 수정하는 마법의 지팡이
Zustand의 set 함수는 상태를 업데이트하는 핵심 기전입니다. 여기에는 두 가지 정밀한 조작 방식이 존재합니다.

방법 A: 얕은 병합(Shallow Merge) 바꾸고 싶은 부분만 객체 형태로 툭 던져주는 방식입니다.

/* [Code Block 3]: 얕은 병합 사용법 */
// 서랍장의 여러 칸 중에서 'username' 칸만 새것으로 갈아 끼우는 것과 같습니다.
set({ username: '새로운 아키텍트' });
[개념 상세 설명]

원리: Zustand는 내부적으로 Object.assign 혹은 전개 연산자(...state)와 유사하게 동작합니다.
특징: 우리가 { username: '...' }만 보내면, 나머지 points나 isLoggedIn 같은 데이터는 건드리지 않고 그대로 보존합니다. 단순한 값의 교체에 매우 유리하며, 코드의 가독성을 극대화합니다.
방법 B: 함수형 업데이트(Functional Update) 현재의 상태를 기반으로 다음 상태를 계산해야 하는 복잡한 상황에서 사용합니다.

/* [Code Block 4]: 함수형 업데이트 사용법 */
// 현재 상태(state)를 인자로 받는 콜백을 전달하여 +10 연산을 수행합니다.
set((state) => ({ points: state.points + 10 }));
[개념 상세 설명]

원리: 현재 상태(state)를 인자로 받는 콜백 함수를 전달합니다.
특징: 이 방식은 클로저(Closure) 원리를 활용하여 항상 절대적인 최신 상태를 참조하도록 보장합니다. 특히 비동기 처리가 섞여 있거나 짧은 시간에 업데이트가 여러 번 일어날 때 데이터가 유실(Race Condition)되는 사고를 방지합니다. 불변성을 엄격히 유지해야 하는 대규모 시스템 설계에서 가장 권장되는 방식입니다.
4. get: 리렌더링 없는 정밀 관측기
get 함수는 구독 없이 현재 스토어의 최신 값을 스냅샷처럼 찍어오는 도구입니다.

/* [Code Block 5]: get()을 활용한 연산 로직 */
const currentPoints = get().points;

// 화면을 다시 그릴 필요 없이 오직 '연산'을 위해서만 데이터를 읽어옵니다.
if (currentPoints > 100) {
  set({ rank: 'VIP' });
}
[개념 상세 설명] 보통 컴포넌트는 상태를 구독하며 화면을 그리지만, 액션 내부에서 단순히 현재 값이 무엇인지 확인만 해야 할 때가 있습니다. 이때 get()을 호출하는 행위는 화면을 다시 그리게 만드는 리렌더링 유발 없이 오직 연산을 위한 데이터만 쏙 뽑아오는 매우 경제적인 방식입니다. 마치 필요한 정보만 살짝 훔쳐보는 스냅샷과 같아서 조건문에 활용하거나 로그를 남길 때 유용합니다.

💻 실습: 통합 엔진 조립 (useUserStore.ts)
기술적 요소들과 설계 의도들이 실제 통합된 코드에서 어떻게 유기적으로 맞물리는지 확인해보겠습니다.

/* [File Path]: src/store/useUserStore.ts
   [Copyright]: © nhcodingstudio 소유
   [Test Process]:
   1. increasePoints를 실행하여 points가 안전하게 합산되는지 확인합니다.
   2. resetUser를 실행하여 get()이 현재 상태를 정확히 읽고 로그를 남긴 후 set이 전체를 초기화하는지 확인합니다.
*/

import { create } from 'zustand';

// 1. [설계도] 유저의 프로필과 활동 상태를 관리하는 스토어의 규격입니다.
interface UserStore {
  username: string;
  points: number;
  isLoggedIn: boolean;
  increasePoints: (amount: number) => void;
  resetUser: () => void;
}

// 2. [엔진 조립] create 함수를 통해 실제 스토어를 생성하며 정밀 도구인 set과 get을 부여받습니다.
export const useUserStore = create<UserStore>((set, get) => ({
  username: '아키텍트',
  points: 100,
  isLoggedIn: true,

  // 3. [액션: set] 함수형 업데이트 방식으로 기존 상태를 안전하게 참조합니다.
  increasePoints: (amount) => set((state) => ({
    points: state.points + amount
  })),

  // 4. [액션: get & set] 현재 상태를 확인하고 조건에 따라 초기화합니다.
  resetUser: () => {
    // get()을 호출하여 리렌더링 없이 스냅샷을 찍어옵니다.
    const currentPoints = get().points;

    if (currentPoints > 0) {
      // get()을 통해 읽어온 데이터로 로그 기록
      console.log(`${get().username}님의 ${currentPoints}포인트가 소멸됩니다.`);

      // 얕은 병합을 사용하여 초기값으로 상태를 안전하게 되돌립니다.
      set({ username: '', points: 0, isLoggedIn: false });
    }
  },
}));
🔍 상세 코드 분석 (Recap Analysis)
interface UserStore: 엔진이 다룰 데이터의 모양을 결정하는 엄격한 법전입니다. 타입스크립트는 이 가드레일 안에서 우리가 오타를 내는 것을 원천적으로 차단합니다.
create<UserStore>((set, get) => ...): 제네릭을 사용하여 이 스토어가 설계도를 완벽히 준수하도록 강제합니다.
불변성 관리: Zustand의 set 함수는 내부적으로 불변성(Immutability)을 관리해 줍니다. 과거 리듀서나 컨텍스트 API에서는 상태를 하나 바꿀 때마다 ...state를 써서 모든 값을 일일이 복사해야 했지만, Zustand는 바꾸고자 하는 특정 속성만 선언하면 내부적으로 안전하게 새로운 객체를 생성합니다.
✅ 최종 점검 (Final Verification)
1. 삼총사의 역할 분담

create: 엔진 공장 건설 및 설계도 확정.
set: 상태의 실제 변경(병합 or 함수형) 및 리액트 구독자 알림.
get: 리렌더링 없는 정밀 관측(스냅샷).
2. 아키텍처적 가치 이 삼총사를 완벽히 다루는 능력은 Zustand 엔진의 마력을 100% 끌어올리는 것과 같습니다. 리액트 컴파일러가 최적화를 수행하는 2026년 현재의 환경에서도 이 세 가지 부품의 유기적인 결합은 컴포넌트 외부 데이터의 신뢰성을 보장하는 가장 강력한 수단이 될 것입니다.
