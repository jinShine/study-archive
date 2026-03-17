📖 상세 개념 가이드 (The Core Manual)
지난 시간 우리는 새로고침이라는 거센 파도 앞에서 우리 엔진의 기억이 얼마나 허망하게 씻겨 나가는지, 그리고 그 기억을 지키기 위해 우리가 얼마나 고달픈 수동 기록 노동을 해야 했는지 낱낱이 파헤쳐 보았습니다.

오늘은 그 모든 복잡한 해체와 조립 과정을 단 한 줄의 코드로 해결해 주는 Zustand의 마법, Persist 미들웨어라는 강력한 해법을 배워보겠습니다.

1. 배경: 우체통과 가구의 비유 (직렬화의 이해)
브라우저가 제공하는 로컬 스토리지는 입구가 아주 좁은 우체통과 같습니다. 우리가 관리하는 상태는 입체적인 가구(객체)인데, 이 커다란 가구는 좁은 우체통 입구를 통과할 수 없습니다.

직렬화(Serialization): 가구를 판자 형태로 분해하여 평평하게 만드는 과정(객체 → 문자열).
역직렬화(Deserialization): 우체통에서 꺼낸 판자들을 다시 설계도대로 조립하는 과정(문자열 → 객체).
2. 역할: 영속성(Persistence)의 확보
영속성이란 프로그램이 종료되거나 페이지가 새로고침되어도 데이터가 사라지지 않고 끈질기게 살아남는 특성을 말합니다.

기능: 엔진 내부에서 상태가 변할 때마다 이를 가로채서 브라우저의 로컬 스토리지에 실시간으로 기록을 남깁니다. 마치 비행기의 블랙박스나 게임의 자동 저장 기능과 같습니다.
💻 실습: 영구 저장 기능이 탑재된 Auth 스토어 조립
유저의 로그인 상태를 새로고침 후에도 안전하게 지켜주는 스토어를 구현해 보겠습니다.

/* [File Path]: src/store/useAuthStore.ts
   [Copyright]: © nhcodingstudio 소유
*/
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// [1] 엔진의 설계도(Interface) 정의
interface AuthStore {
  isLoggedIn: boolean;
  username: string;
  login: (name: string) => void;
  logout: () => void;
}

// [2] persist 미들웨어를 사용하여 엔진 조립
// 커링(Currying) 문법인 create<T>()(persist(...)) 형식에 주목하세요.
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      username: '',
      login: (name) => set({ isLoggedIn: true, username: name }),
      logout: () => set({ isLoggedIn: false, username: '' }),
    }),
    {
      // [3] 브라우저 창고(localStorage)에서 사용할 고유한 이름표입니다.
      name: 'user-auth-storage',
    }
  )
);

🔍 정밀 코드 동작 원리 (Internal Flow Analysis)
미들웨어 래핑(Middleware Wrapping):persist 함수가 스토어 생성 로직을 감쌉니다. 이는 상태 변경이 일어날 때마다 미들웨어가 중간에서 이벤트를 가로챌 수 있는 상태가 됨을 의미합니다.
상태 변경 감지 및 직렬화: 사용자가 login('James')를 호출하여 set이 실행되면, persist 미들웨어가 즉시 개입합니다. 새로운 상태 객체를 JSON.stringify 기계에 넣어 문자열(String)로 으깹니다.
저장소 기록: 으깨진 문자열 데이터를 name 설정값(user-auth-storage)을 키(Key)로 삼아 localStorage에 즉시 저장합니다.
하이드레이션(Hydration/복구): 페이지가 새로고침되면 엔진은 UI를 그리기 전, 설정된 name으로 창고를 먼저 뒤집니다. 데이터가 있다면 JSON.parse로 다시 조립하여 컴포넌트가 마운트되기 전에 스토어를 이전 데이터로 채워넣습니다.
📖 상세 개념 가이드: 하이드레이션(Hydration)
하이드레이션은 메마른 땅에 물을 주듯, 비어있는 스토어에 과거의 데이터를 채워 넣는 복구 과정을 의미합니다.

사용자 경험: 사용자는 데이터가 사라졌다가 다시 나타나는 깜빡임을 전혀 느끼지 못한 채, 마치 아무 일도 없었다는 듯 이전 화면을 그대로 이어 보게 됩니다.
타입 안정성: 22강에서 우리를 괴롭혔던 any 타입의 공포는 없습니다. Zustand는 제네릭 시스템을 통해 AuthStore 규격을 끝까지 추적하여 창고에서 꺼낸 데이터가 안전한지 검증합니다.
⚖️ 수동 관리(22강) vs Persist 미들웨어(23강) 비교
저장 로직의 자동화

수동 관리: 모든 set 호출 뒤에 useEffect를 붙여야 하거나, 수동으로 저장 코드를 심어야 합니다.
Persist: 엔진 내부의 컨베이어 벨트에서 자동 저장이 일어납니다.
데이터 변환 과정

수동 관리:JSON.stringify와 JSON.parse를 직접 호출하며 오타와 예외 처리를 감수해야 합니다.
Persist: 내부 엔진이 자동 직렬화 및 역직렬화를 수행하여 개발자의 실수를 원천 차단합니다.
코드의 가독성 및 응집도

수동 관리: 비즈니스 로직(로그인)과 저장 로직(localStorage)이 뒤섞여 코드가 장황해집니다.
Persist: 저장 설정이 별도의 옵션 객체로 분리되어 있어 로직이 매우 간결하고 깨끗합니다.
타입 안정성(Type Safety)

수동 관리:localStorage에서 데이터를 꺼낼 때 any 타입을 반환하므로 런타임 에러 위험이 큽니다.
Persist: 제네릭 기반으로 완벽한 타입 추론을 지원하여 설계의 견고함을 유지합니다.
환경 대응(SSR 등)

수동 관리: 서버 환경에서 localStorage 접근 시 터지는 에러를 막기 위해 수동 조건문이 필수입니다.
Persist: 하이드레이션 과정을 최적화하여 서버 사이드 렌더링 환경에서도 안정적으로 동작합니다.
