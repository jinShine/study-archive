📖 상세 개념 가이드 (The Core Manual)
지난 시간 우리는 리액트라는 호화로운 멤버십 클럽 밖으로 나가는 순간, 훅(Hook)이라는 전용 마이크를 사용할 수 없어 우리 스토어와 대화가 단절되는 고통을 함께 겪었습니다.

하지만 오늘은 그 높은 담장을 단번에 허물어버릴 Zustand의 비밀 병기인 Vanilla API에 대해 배워보겠습니다. Zustand는 사실 리액트만을 위한 도구가 아니라 그 자체로 아주 훌륭한 순수 자바스크립트 상태 관리 엔진입니다. 제작진은 우리 아키텍트들이 클럽 밖에서도 자유롭게 소통할 수 있도록 '전용 핫라인'을 미리 설치해 두었는데, 그 핵심이 바로 createStore입니다.

1. createStore: 리액트 옷을 벗은 순수 엔진
우리가 지금까지 사용했던 create는 리액트 훅을 자동으로 생성해 주는 리액트 친화적인 도구였습니다. 반면 zustand/vanilla 패키지의 createStore는 리액트라는 화려한 옷을 입기 전의 순수한 엔진 그 자체를 조립하는 도구입니다.

비유: createStore는 아파트 단지 중앙에 설치된 '무인 택배함'입니다. 이 택배함은 아파트 주민(컴포넌트)뿐만 아니라 외부 배달 기사님(일반 JS 함수)도 누구나 접근할 수 있는 독립적인 시설입니다.
특징: 리액트 라이브러리에 대한 의존성이 전혀 없으므로, 용량이 가볍고 어떤 자바스크립트 환경에서도 돌아갑니다.
/* [Concept Code 1]: 바닐라 엔진 조립 신택스 */
import { createStore } from 'zustand/vanilla';

// 훅이 아닌 'Store API' 객체가 생성됩니다.
// 리액트 컴포넌트가 로드되기 전에도 메모리에 존재할 수 있습니다.
const pureStore = createStore((set) => ({
  data: 0,
  update: () => set({ data: 1 }),
}));
2. getState: 사진 찍듯 가져오는 현재의 스냅샷
getState는 스토어가 가진 현재 상태를 즉시 반환하는 기능을 수행합니다.

특징: 리액트 훅처럼 데이터가 변할 때마다 화면을 다시 그리는 '구독' 과정을 거치지 않습니다.
용도: 실행되는 그 찰나의 순간에 택배함 내부를 들여다보듯 최신 상태의 스냅샷만 찍어 가져옵니다. API 인터셉터처럼 값이 "딱 한 번" 필요한 경우에 가장 적합합니다.
/* [Concept Code 2]: getState 활용법 */
// 호출하는 그 찰나의 순간에 스토어의 값을 복사해옵니다.
const currentToken = authStore.getState().token;

console.log("현재 창고에 보관된 최신 토큰:", currentToken);
3. setState: 밖에서 조절하는 마스터 키
setState는 스토어 외부에서 상태를 직접 변경하는 기능을 담당합니다.

파급 효과: 리액트 밖에서 setState를 호출하는 순간, 해당 상태를 구독하고 있는 리액트 클럽 안의 모든 컴포넌트들도 즉시 새로운 값으로 업데이트됩니다.
비유: 아파트 밖에서 관리인이 택배함 상태를 '배송 완료'로 바꾸면, 주민들의 스마트폰 앱 알람이 즉시 울리는 것과 같습니다.
/* [Concept Code 3]: setState 활용법 */
// 리액트 밖에서(예: .ts 파일) 강제로 상태를 변경합니다.
authStore.setState({ token: null, isLoggedIn: false });
💻 실습 1단계: 순수 바닐라 엔진 조립 (authStore.ts)
리액트의 성질이 전혀 섞이지 않은 순수 엔진을 먼저 만들고, 이를 리액트와 연결하는 다리를 건설합니다.

/* [File Path]: src/store/authStore.ts
   [Copyright]: © nhcodingstudio 소유
*/
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';

interface AuthStore {
  token: string | null;
  isLoggedIn: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

// [1] createStore는 리액트 훅이 아닌 일반 객체(Store API)를 반환합니다.
export const authStore = createStore<AuthStore>((set) => ({
  token: null,
  isLoggedIn: false,
  setToken: (token) => set({ token, isLoggedIn: true }),
  logout: () => set({ token: null, isLoggedIn: false }),
}));

// [2] 연결 장치: 바닐라 스토어를 리액트 훅으로 변환합니다.
export const useAuth = () => useStore(authStore);
🔍 정밀 코드 분석 (The Engine Bridge)
*createStore vs create**: create는 리액트 환경을 가정하고 훅을 반환하지만, createStore는 순수 JS 객체를 반환합니다. 이 객체는 리액트 훅 규칙(Rules of Hooks)의 영향을 받지 않으므로 어디서든 임포트하여 즉시 사용할 수 있습니다.
authStore 객체: 이 객체 내부에는 getState(), setState(), subscribe() 메서드가 포함되어 있습니다. 이것이 우리가 리액트 외부에서 엔진을 조작할 수 있는 '물리적 버튼' 역할을 합니다.
useStore(authStore): 바닐라 엔진(authStore)을 리액트의 반응성 시스템에 연결하는 핵심 브릿지입니다. 이렇게 하면 컴포넌트에서는 평소처럼 useAuth() 훅을 사용하여 데이터 변화를 감지하고 화면을 다시 그릴 수 있습니다. 하나의 엔진으로 두 개의 세계(Vanilla & React)를 동시에 지배하는 구조입니다.
💻 실습 2단계: 리액트 밖에서 상태 읽기 (http.ts)
이제 훅을 쓸 수 없는 API 검문소(Interceptor)에서 getState 마법을 부려보겠습니다.

/* [File Path]: src/api/http.ts */
import axios from 'axios';
import { authStore } from '../store/authStore';

const http = axios.create({ baseURL: '<https://jsonplaceholder.typicode.com>' });

/**
 * [1] Request Interceptor: 요청 전 토큰 읽기
 */
http.interceptors.request.use((config) => {
  // [getState 활용]: 훅 규칙의 제약을 받지 않습니다.
  // 이 메서드는 호출하는 그 순간의 가장 최신 토큰값을 사진 찍듯 즉시 가져옵니다.
  const token = authStore.getState().token;

  if (token) {
    // Bearer 표준 인증 방식을 사용하여 헤더에 신분증을 붙여줍니다.
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

🔍 정밀 코드 분석 (The Reader Flow)
비반응성 데이터 획득: getState()는 리액트의 useState처럼 값이 바뀐다고 해서 이 함수가 다시 실행되지는 않습니다. 하지만 함수가 호출되는 '시점'에는 항상 메모리에 있는 가장 최신의 값을 반환합니다.
인터셉터와의 조화: 인터셉터는 요청이 나갈 때마다 매번 실행되는 함수입니다. 따라서 요청을 보낼 때마다 getState()가 실행되어 항상 최신 토큰을 안정적으로 가져오게 됩니다. 25강에서 발생했던 Invalid hook call 에러를 완벽하게 해결합니다.
💻 실습 3단계: 리액트 밖에서 상태 수정 (http.ts)
서버에서 "권한 없음(401)" 응답이 왔을 때, 리액트 밖에서 유저를 강제로 로그아웃시켜 보겠습니다.

/* [File Path]: src/api/http.ts (Response Part) */

/**
 * [2] Response Interceptor: 응답 에러 시 상태 수정
 */
http.interceptors.response.use(
  (res) => res,
  (err) => {
    // 서버에서 401(Unauthorized) 에러가 내려오는 상황을 가로챕니다.
    if (err.response?.status === 401) {
      // [setState 활용]: 리액트 밖에서도 유저를 즉시 로그아웃 시킵니다.
      // 이 코드가 실행되면 스토어를 구독 중인 모든 리액트 화면이 즉시 로그아웃 UI로 변합니다.
      authStore.setState({ token: null, isLoggedIn: false });
      alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
    }
    return Promise.reject(err);
  }
);

export default http;

🔍 정밀 코드 분석 (The Master Key Flow)
UI 동기화: 리액트 컴포넌트 외부(.ts 파일)에서 setState를 실행했음에도 불구하고, Zustand 엔진은 이 변화를 리액트에게 알립니다. 이로 인해 useAuth()를 쓰고 있는 모든 화면은 즉시 로그아웃 상태로 UI가 업데이트됩니다.
직접 제어: 유저가 로그인 페이지로 가기도 전에, 시스템이 먼저 상태를 정리(Cleanup)할 수 있게 해주는 강력한 중앙 제어 기능입니다.
⚖️ React Hook API vs Vanilla API 비교 (List)
반환값

React Hook API (create): 리액트 훅 (Hook) - useStore 형태
Vanilla API (createStore): 스토어 API 객체 (Object) - store 형태
사용 환경

React Hook API: 리액트 컴포넌트나 커스텀 훅 내부 전용
Vanilla API: 모든 자바스크립트 환경 (.ts, .js, 유틸 함수, 인터셉터 등)
데이터 접근 방식

React Hook API: const value = useStore(...) (구독형, 반응성 있음)
Vanilla API: store.getState() (정적 스냅샷, 반응성 없음)
데이터 수정 방식

React Hook API: 액션 함수 호출
Vanilla API: store.setState() (외부 강제 주입 가능)
🧪 테스트 가이드: 무엇을 확인해야 할까요?
Vanilla API를 도입한 후 시스템의 건전성을 테스트할 때 다음 4가지를 반드시 점검하세요.

에러 유무: .ts 파일에서 authStore.getState()를 호출할 때 브라우저 콘솔에 Invalid hook call 에러가 사라졌는지 확인합니다.
데이터 동기화: UI에서 로그인하여 토큰을 변경한 직후, API 요청을 보냈을 때 네트워크 탭의 Authorization 헤더에 최신 토큰이 박혀 있는지 확인합니다.
반응성 확인: 인터셉터에서 authStore.setState()가 실행되었을 때, 화면의 로그인/로그아웃 버튼 UI가 별도의 새로고침 없이 즉각 바뀌는지 확인합니다.
타입 추론: getState()로 가져온 데이터가 AuthStore 인터페이스에 정의된 타입을 그대로 유지하고 있는지(자동 완성 기능 작동 여부) 확인합니다.
image.png
