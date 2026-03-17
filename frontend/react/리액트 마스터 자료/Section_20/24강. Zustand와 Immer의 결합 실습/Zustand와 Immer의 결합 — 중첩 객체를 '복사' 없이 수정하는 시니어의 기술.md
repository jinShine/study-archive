📖 상세 개념 가이드 (The Core Manual)
지난 시간 우리는 Persist 미들웨어를 통해 우리 엔진에 강력한 '영구 기억력'을 선물했습니다. 이제 새로고침이라는 거센 파도가 몰아쳐도 우리 데이터는 안전하게 보존되죠.

하지만 아키텍처가 거대해질수록 우리는 또 다른 거대한 벽에 부딪히게 됩니다. 바로 중첩된 객체(Nested Object)라는 복잡한 미로입니다. 유저 정보 안에 설정이 있고, 그 설정 안에 다시 테마 정보가 들어있는 식의 깊은 데이터 구조를 다룰 때, 우리가 지금까지 배운 스프레드 연산자(...state)만으로는 감당하기 힘든 코드의 늪에 빠지게 됩니다. 오늘은 이 복잡한 중첩 구조를 마치 일반 변수를 수정하듯 우아하고 직관적으로 다룰 수 있게 해주는 시니어의 비밀 병기, Immer와의 결합에 대해 아주 상세히 파헤쳐 보겠습니다.

1. 배경: 레고 성과 불변성의 고통
중첩 객체를 수정하는 고통을 실생활에 비유해 보겠습니다. 여러분이 5층짜리 아주 정교한 '레고 성'을 조립했다고 가정해 봅시다. 그런데 3층 안쪽에 있는 작은 침대의 색깔만 파란색에서 빨간색으로 바꾸고 싶습니다.

Immer가 없다면?: 리액트의 기본 원칙인 '불변성'을 지키기 위해 여러분은 1층부터 5층까지 모든 층을 똑같이 새로 복제해서 만들어야 합니다. 침대 하나 바꾸려고 성 전체를 새로 건설하는 셈이죠. 코드로는 ...state를 대여섯 번씩 중첩하며 양파 껍질을 까듯 복사해야 합니다.
/* [Concept Code 1]: Immer 없이 중첩 객체를 수정할 때의 참상 */
// 침대 하나 바꾸기 위해 성 전체를 다시 복사해서 정의해야 함
const nextState = {
  ...state,
  castle: {
    ...state.castle,
    floor3: {
      ...state.castle.floor3,
      bed: { ...state.castle.floor3.bed, color: 'red' }
    }
  }
};

Immer가 있다면?: '마법의 복제 도면'을 얻은 것과 같습니다. 여러분은 실제 성을 건드리는 대신, 임시로 나타난 '유령 성(Draft)'에 들어가서 침대 색깔만 쓱 바꿉니다. 그러면 Immer라는 마법사가 그 변화를 감지해서 바뀐 부분만 적용된 완벽한 새 성을 순식간에 완성해 줍니다.
2. 심층 탐구: 도대체 'Proxy'가 무엇인가요?
Immer가 우리에게 '유령 성(Draft)'을 줄 수 있는 비결은 바로 자바스크립트의 Proxy(프록시) 엔진 덕분입니다.

Proxy의 핵심 개념: Proxy는 말 그대로 '대리인'입니다. 어떤 물건을 직접 만지지 못하게 중간에서 가로채는 '비서'라고 생각하면 쉽습니다.
작동 원리:
Immer는 우리의 원본 데이터(State)를 Proxy라는 투명한 비서로 감쌉니다. 이것이 바로 우리가 다루는 draft입니다.
우리가 draft.count = 1이라고 명령하면, 실제 데이터를 바꾸는 게 아니라 비서가 자기 수첩에 그 명령을 몰래 적어둡니다. (이것을 Interception, 가로채기라고 합니다.)
작업이 끝나면 비서는 수첩에 적힌 변경 사항들을 모아, 원본 데이터에서 바뀐 부분만 새것으로 갈아 끼운 새로운 객체를 만들어 우리에게 돌려줍니다.
왜 사용하나요?: 리액트에서는 원본을 직접 수정하면 안 되기 때문에(불변성), 비서를 통해 "수정하는 척"만 하고 실제로는 "새로운 복사본"을 안전하게 얻어내기 위해서입니다.
/* [Concept Code 2]: Proxy 엔진의 가상 작동 모습 */
// 실제 Immer 내부에서 일어나는 일을 단순화한 모습입니다.

const target = { count: 0 }; // 원본 (수정 불가)

const draft = new Proxy(target, {
  set(obj, prop, value) {
    // 1. 직접 수정하는 척 하지만 실제로는 '수정 요청'을 가로챕니다.
    console.log(`[Interception] ${prop}을 ${value}로 바꾸라는 요청을 수첩에 적습니다.`);

    // 2. 실제 원본(obj)은 건드리지 않고 변경 사항만 기록해둡니다.
    // 3. 나중에 이 기록을 바탕으로 새로운 객체를 생성하여 반환합니다.
    return true;
  }
});

draft.count = 10; // "수정하는 것처럼" 코드를 짤 수 있게 됨
3. 역할 및 기능: 스프레드 지옥(Spread Hell) 탈출
상태가 깊어질수록 코드는 장황해지고 버그가 숨을 곳은 많아집니다. 아키텍처는 가독성이 생명인데, 스프레드 연산자의 중첩은 이를 파괴하는 주범입니다.

/* [Concept Code 3]: 기존 방식 vs Immer 방식 비교 */

// 기존 방식 (명령형 복사): 괄호 닫는 위치 하나만 틀려도 데이터가 유실됨
set((state) => ({
  user: { ...state.user, settings: { ...state.user.settings, theme: 'dark' } }
}));

// Immer 방식 (선언적 수정): Proxy 비서(draft)에게 경로를 따라가 대입만 하면 끝
set((draft) => {
  draft.user.settings.theme = 'dark';
});
🔍 상세 개념 설명

Proxy 엔진: 위 코드에서 draft는 Proxy 객체입니다. 리액트에서 금기시되는 대입 연산자(=)를 사용하더라도, 프록시가 이를 가로채어 안전한 불변 객체 생성으로 치환해줍니다.
선언적 코드: "데이터를 어떻게 복사할까"라는 절차적 고민 없이 "테마를 dark로 바꿔라"라는 결과만 선언하면 됩니다.
💻 실습 1단계: 깊은 중첩 구조 설계 (useUserStore.ts)
가장 먼저 아주 깊은 데이터 경로를 가진 유저 프로필 스토어의 설계도를 작성합니다.

/* [File Path]: src/store/useUserStore.ts (Part 1)
   [Copyright]: © nhcodingstudio 소유
*/
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// [1] 아주 깊게 중첩된 유저 정보의 설계도입니다.
// 4단계 깊이(user -> profile -> settings -> theme)의 구조를 정의합니다.
interface UserStore {
  user: {
    profile: {
      name: string;
      settings: {
        theme: string;
        notifications: boolean;
      };
    };
  };
  // 중첩된 데이터의 깊은 곳을 수정하는 액션들입니다.
  updateTheme: (newTheme: string) => void;
  toggleNotifications: () => void;
}

// [2] immer 미들웨어가 스토어 생성 함수 전체를 감싸는 구조입니다.
export const useUserStore = create<UserStore>()(
  immer((set) => ({
    user: {
      profile: {
        name: 'React Expert',
        settings: {
          theme: 'light',
          notifications: true,
        },
      },
    },
    // ... 액션 구현은 2단계에서 계속됩니다.
  }))
);
🔍 상세 코드 설명

immer(...) 미들웨어: 기존 Zustand의 set 함수를 업그레이드하여, 인자로 현재 상태(state) 대신 수정 가능한 초안(Proxy 객체인 draft)을 넘겨주도록 체질을 개선합니다.
interface UserStore: 복잡한 비즈니스 로직을 시뮬레이션하기 위해 의도적으로 깊은 depth를 설정했습니다. 일반적인 스프레드 연산자로는 가독성을 확보하기 매우 어려운 구조입니다.
💻 실습 2단계: 마법의 'draft'를 사용한 액션 구현
이제 실제로 데이터를 직접 수정하는 것처럼 보이는 선언적 액션을 구현합니다.

/* [File Path]: src/store/useUserStore.ts (Part 2) */

// ... (위의 create 함수 내부 로직 이어서 작성)
    // [3] 마법의 'draft'를 사용하여 데이터를 직접 수정하는 모습입니다.
    updateTheme: (newTheme) =>
      set((draft) => {
        /**
         * [상세 설명]: Proxy 비서를 통한 수정
         * 1. draft는 Proxy 객체이므로 직접 대입(=) 명령을 내릴 수 있습니다.
         * 2. draft.user... 경로를 따라가서 theme 값을 교체하라고 비서에게 지시합니다.
         * 3. Immer 비서는 이 연산을 가로채서 메모해두었다가 함수 종료 시 불변성을 유지한 채 새 객체를 만듭니다.
         */
        draft.user.profile.settings.theme = newTheme;
      }),

    toggleNotifications: () =>
      set((draft) => {
        /**
         * [상세 설명]: 불리언 토글
         * 중첩된 구조임에도 불구하고 ! 연산자를 사용하여 일반 변수처럼
         * 직관적으로 상태를 반전시킬 수 있습니다.
         */
        draft.user.profile.settings.notifications =
          !draft.user.profile.settings.notifications;
      }),
// ...
🔍 상세 코드 설명

draft 네이밍: 인자 이름을 state가 아닌 draft라고 적는 것은 시니어 개발자의 중요한 디테일입니다. "이 코드는 Proxy 환경에서 안전하게 직접 수정되고 있다"라는 확신을 동료에게 전달합니다.
자동 완성 지원: 타입스크립트 엔진은 우리가 인터페이스에서 정의한 구조를 끝까지 추적합니다. draft.user. 까지만 쳐도 하위 경로를 정확하게 추천해주어 오타를 원천 차단합니다.
⚖️ 일반 방식(Spread) vs Immer 결합 방식 비교
코드의 직관성

일반 방식: 양파 껍질을 까듯 수없이 많은 중괄호({ ... })를 중첩해야 하며, 괄호 위치 하나로 전체 앱이 뻗을 수 있습니다.
Immer: 마치 로컬 변수를 수정하듯 경로를 따라가 값을 대입하는 선언적 방식입니다.
유지보수 효율

일반 방식: 데이터 구조가 한 단계 깊어질 때마다 스프레드 연산자가 하나씩 더 추가되는 '스프레드 지옥'에 빠집니다.
Immer: 데이터가 아무리 깊어져도 코드의 복잡도는 일정하게 유지됩니다.
타입스크립트 공조

일반 방식: 중첩 복사 도중 타입을 잃어버리거나 any로 추론되는 경우가 잦습니다.
Immer: 경로 탐색 도중에도 타입 정보를 완벽히 유지하여 내비게이션 효과를 극대화합니다.
개발자 경험(DX)

일반 방식: "데이터를 어떻게 안전하게 복사할까"라는 저수준 고민에 에너지를 낭비합니다.
Immer: "어디를 바꿀 것인가"라는 고수준 비즈니스 로직에만 온전히 집중합니다.
