📖 기준 1. 렌더링 퍼포먼스: 아파트 방송 vs 전용 호출기
지난 시간 우리는 상태의 역사를 기록하고 되돌리는 타임머신 시스템을 통해 전역 상태 관리의 강력한 가능성을 엿보았습니다. 이제 여러분은 Zustand를 자유자재로 다루는 숙련된 개발자가 되었죠.

하지만 실무에서 마주하게 될 가장 현실적인 질문은 이것입니다. "리액트가 이미 Context API를 제공하는데, 왜 굳이 외부 라이브러리인 Zustand를 써야 하나요?" 아키텍트는 단순히 도구의 기능을 아는 것에 그치지 않고, 프로젝트의 규모와 팀의 생산성, 그리고 성능이라는 저울 위에서 냉철하게 기술을 선택할 수 있어야 합니다. 오늘은 시니어 개발자가 실무에서 내리는 명확한 기술 선택 기준 3가지를 통해 이 갈증을 완벽하게 해결해 보겠습니다.

기술을 선택할 때 가장 먼저 고려해야 할 기준은 화면이 얼마나 효율적으로 다시 그려지는가입니다.

1. Context API: 아파트 전체 방송 시스템
Context API는 본질적으로 상태 관리 도구가 아니라 데이터를 하위 컴포넌트로 전달하는 의존성 주입(Dependency Injection) 장치입니다.

동작 방식: 아파트 전체에 울려 퍼지는 방송과 같습니다. 나에게 필요한 내용이든 아니든 일단 모든 주민(구독 컴포넌트)이 귀를 기울여야 합니다.
한계: Context에 담긴 값 중 단 하나라도 바뀌면, 그 Context를 구독하는 모든 하위 컴포넌트는 강제로 다시 그려지며 데이터가 변했는지 확인하는 절차를 거칩니다.
/* [Background Code]: Context API의 리렌더링 문제점 */
const DashboardContext = createContext(null);

function App() {
  const [state, setState] = useState({ count: 0, user: 'James' });

  // count만 바뀌어도 DashboardContext를 구독하는 컴포넌트들은 모두 리렌더링됩니다.
  return (
    <DashboardContext.Provider value={state}>
      <UserComponent />  {/* user만 사용하지만 count 변경 시 리렌더링됨 */}
      <CountComponent /> {/* count만 사용함 */}
    </DashboardContext.Provider>
  );
}

2. Zustand: 필요한 사람에게만 울리는 전용 호출기
Zustand는 구독 모델 기반의 Selector 기술을 사용하여 외과 수술처럼 예리하게 렌더링을 통제합니다.

동작 방식: 스토어의 전체 데이터 중 내가 필요한 아주 작은 조각이 변했을 때만 해당 컴포넌트를 업데이트합니다.
장점: 상태 변화를 감지하는 리스너가 각 조각마다 연결되어 있어 불필요한 연산을 원천 차단합니다.
/* [Background Code]: Zustand의 정교한 렌더링 통제 */
const useStore = create((set) => ({ count: 0, user: 'James' }));

function UserComponent() {
  // 오직 user가 변할 때만 이 컴포넌트가 다시 그려집니다.
  const user = useStore((state) => state.user);
  return <div>{user}</div>;
}

📖 기준 2. 개발자 경험(DX): 마트료시카 vs 평면적 자유
두 번째 기준은 아키텍처의 단순성과 개발자가 느끼는 편리함입니다.

1. Context API: 프로바이더 지옥 (Provider Hell)
Context를 사용하면 전역 상태를 하나 추가할 때마다 최상위 파일에 프로바이더를 배치해야 합니다. 이는 러시아 인형인 마트료시카처럼 컴포넌트를 계속 중첩시킵니다.

/* [Pain Case]: 겹겹이 쌓이는 프로바이더 트리의 공포 */
function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <Dashboard /> {/* 깊숙이 숨겨진 실제 메인 컴포넌트 */}
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

2. Zustand: 프로바이더가 없는 자유 (Flat Architecture)
Zustand는 어느 파일에서든 스토어를 생성하고 필요한 곳에서 훅으로 불러오기만 하면 끝나는 평면적인 구조를 지향합니다.

/* [Solution Case]: 어느 컴포넌트에서든 한 줄로 호출 끝! */
const { isDark } = useThemeStore();
const { user } = useAuthStore();

시니어의 통찰: 2026년의 현대적인 프론트엔드는 "설정보다 규약"을 선호합니다. 코드를 한 줄이라도 덜 짜면서 직관적인 흐름을 유지하는 Zustand는 팀 전체의 개발 속도를 비약적으로 향상시킵니다.

📖 기준 3. 생태계와 확장성: 순정 자동차 vs 풀옵션 자동차
1. Context API: 아무 옵션 없는 순정 자동차
리액트 기본 기능이므로 외부 의존성이 없다는 장점이 있지만, 에어컨부터 내비게이션까지 직접 설치해야 합니다. 로컬 스토리지 저장, 로깅, 시간 여행 디버깅 등을 모두 직접 코드로 짜야 하며 이 과정에서 버그가 발생할 확률도 높습니다.

2. Zustand: 모든 기능이 내장된 풀옵션 자동차
이미 실무에서 검증된 강력한 미들웨어들을 내장하고 있습니다.

/* [Solution Case]: 한 줄로 해결되는 데이터 영속성(Persist) */
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set) => ({ items: [] }),
    { name: 'cart-storage' } // 이 한 줄로 LocalStorage 자동 저장 완결!
  )
);

💡 시니어 아키텍트의 황금률: 하이브리드 모델 (Hybrid)
억지로 하나의 도구만 고집하지 마세요. 실무에서는 다음과 같은 조합이 가장 권장됩니다.

Context API: 다크 모드, 언어 설정 등 변화가 거의 없고 정적인 설정값에 사용.
Zustand: 장바구니, 게시글, 실시간 데이터 등 변화가 잦고 비즈니스 로직이 복잡한 데이터에 사용.
🚀 실무 꿀팁: "이럴 땐 이걸 쓰세요"
단위 테스트가 중요한가요? Zustand를 쓰세요. 프로바이더 없이 훅만 테스트하면 되어 훨씬 간편합니다.
번들 사이즈가 1KB라도 아쉬운 초경량 프로젝트인가요? Context API를 쓰세요. 추가 설치가 필요 없습니다.
전역 상태가 5개 이상인가요? 무조건 Zustand입니다. 프로바이더 지옥에 갇히면 유지보수가 불가능해집니다.
