📖 상세 개념 가이드 (The Core Manual)
지난 시간 우리는 내용물은 똑같은데 단지 새로운 객체라는 껍데기에 담겨 있다는 이유만으로 컴포넌트가 불필요하게 다시 그려지는 '참조 불일치'의 고통을 함께 나누었습니다. "Zustand는 죄가 없으며 매번 새로운 집을 지어준 우리 코드의 문제"라는 시니어의 통찰이 뼈아프게 다가오셨을 겁니다.

하지만 걱정하지 마세요. 오늘은 리액트의 눈을 더 똑똑하게 만들어 껍데기가 아닌 실제 내용물을 보게 만드는 마법 같은 해결책들을 배워보겠습니다. 우리가 원하는 대로 리렌더링의 조건을 재정의하는 useShallow 옵션과 커스텀 동등성 함수를 통해 진정한 의미의 미세 렌더링 통제를 실현해 보겠습니다.

1. 정석적인 해법: 셀렉터 쪼개기 (Primitive Selection)
가장 먼저 시도해 볼 수 있는 방법은 객체로 묶어 가져오지 않고 각각의 훅으로 나누어 이름과 역할을 따로 가져오는 전략입니다.

/* [Solution 1]: 원시 값(Primitive) 개별 구독 방식 */
const name = useAuthStore((state) => state.user?.name);
const role = useAuthStore((state) => state.user?.role);

💡 최적화 상세 분석

최적화 이유: 이 방식은 객체({ })를 반환하는 대신 String이나 Number 같은 원시 값을 직접 반환합니다. 자바스크립트에서 원시 값은 메모리 주소가 아닌 값 자체를 비교합니다.
데이터 변화 대응: 스토어의 다른 데이터가 아무리 변해도 name이라는 문자열 값이 이전과 철저히 동일하다면, Zustand는 참조 불일치를 일으키지 않고 리렌더링을 완벽하게 차단합니다. 코드는 조금 길어지지만 가장 확실하고 신뢰도 높은 최적화 기법입니다.
2. Zustand의 필살기: useShallow
Zustand가 제공하는 useShallow는 객체의 주소값이 바뀌었더라도 그 안의 1단계 속성(Property)들이 이전과 같다면 데이터가 바뀌지 않은 것으로 간주하는 도구입니다.

/* [Solution 2]: useShallow를 활용한 객체 구독 최적화 */
import { useShallow } from 'zustand/react/shallow';

const { name, role } = useAuthStore(
  useShallow((state) => ({
    name: state.user?.name,
    role: state.user?.role,
  }))
);

💡 최적화 상세 분석

최적화 이유:useShallow는 셀렉터가 반환한 새로운 객체를 한 꺼풀 벗겨서 내부의 name과 role을 이전 값과 대조합니다.
데이터 변화 대응: 만약 state.user 내부의 다른 값(예: lastLogin)만 변하고 name은 그대로라면, 셀렉터가 새 객체를 반환하더라도 useShallow가 이를 가로채 "내용물은 같으니 리액트에게 알리지 마!"라고 명령합니다. 결과적으로 객체 구조 분해 할당의 편리함을 유지하면서도 참조 불일치로 인한 무한 루프를 완벽히 해결합니다.
3. 최종 보스: 커스텀 동등성 함수 (Custom Equality)
얕은 비교만으로 해결되지 않는 깊은 데이터 구조나 특정 비즈니스 로직이 필요한 경우, 시니어 개발자는 커스텀 동등성 함수를 주입하여 리렌더링 조건을 직접 설계합니다.

/* [Solution 3]: 비즈니스 로직 기반의 정교한 렌더링 제어 */
const user = useAuthStore(
  (state) => state.user,
  (prev, next) => {
    // 1. ID가 다르면 무조건 데이터가 변한 것으로 간주 (리렌더링)
    // 2. ID가 같더라도 활동 시간 차이가 1분(60,000ms) 미만이라면 변화가 없는 것으로 간주
    return prev?.id === next?.id &&
           Math.abs((prev?.lastActive ?? 0) - (next?.lastActive ?? 0)) < 60000;
  }
);

💡 최적화 상세 분석

최적화 이유: Zustand 훅의 두 번째 인자로 전달되는 이 함수는 "언제 이 컴포넌트를 다시 그릴 것인가?"에 대한 판단을 100% 개발자가 통제하게 합니다.
데이터 변화 대응: 서버에서 1초마다 lastActive 시간을 보내주더라도, 개발자가 정의한 60,000ms라는 임계치를 넘지 않으면 true(동일함)를 반환하여 리렌더링을 억제합니다. 이는 불필요한 연산량을 줄여 앱의 반응성을 극대화하며, 복잡한 실시간 시스템에서 성능 최적화의 '치트키'로 사용됩니다.
⚖️ 비교 전략 선택 가이드
사용자 요청에 따라 비교 전략을 리스트 형태로 정리해 드립니다.

단순 문자열/숫자 구독

추천 전략: 기본 비교 (Strict Equality)
특징: 별도 설정 없이도 가장 빠르고 안전합니다.
1단계 깊이의 객체 구독

추천 전략:useShallow
특징: 가독성과 성능의 균형이 가장 우수하며 실무에서 가장 많이 쓰입니다.
중첩된 객체나 배열 구독

추천 전략: Deep Equal (lodash의 isEqual 등) 또는 커스텀 함수
특징: 1단계 이상의 깊은 곳에서 발생하는 변화까지 정밀하게 감지합니다.
비즈니스 조건부 렌더링

추천 전략: 커스텀 동등성 함수
특징: 특정 임계값(시간, 점수 등)을 기준으로 렌더링 여부를 직접 통제합니다.
💻 실습: 최적화된 사이드바와 시스템 연동
1단계: useShallow가 적용된 Sidebar.tsx
/* [File Path]: src/components/Sidebar.tsx */
import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../store/useAuthStore';

export function Sidebar() {
  const { name, role } = useAuthStore(
    useShallow((state) => ({
      name: state.user?.name,
      role: state.user?.role,
    }))
  );

  console.log('✅ [성공] 사이드바가 렌더링되었습니다. (실제 데이터 변경 시에만 출력)');

  return (
    <aside style={{ border: '2px solid #4CAF50', padding: '20px', borderRadius: '8px' }}>
      <h3>사이드바 (최적화 완료)</h3>
      <p>사용자: <strong>{name || '비로그인'}</strong></p>
      <p>권한: <strong>{role || 'N/A'}</strong></p>
    </aside>
  );
}

📝 코드 상세 설명

동작 방식:useShallow로 셀렉터를 감쌈으로써 지난 강의에서 발생했던 무한 루프 에러를 즉시 해결합니다.
최적화 포인트: 이제 부모 컴포넌트나 스토어의 다른 값들이 아무리 요동쳐도, 이 컴포넌트는 오직 본인이 사용하는 name과 role이 실제 값(Value) 단위에서 변할 때만 반응하는 '철벽 방어' 상태가 됩니다.
2단계: 최적화 여부를 테스트하는 App.tsx
/* [File Path]: src/App.tsx */
import React from 'react';
import { useAuthStore } from './store/useAuthStore';
import { Sidebar } from './components/Sidebar';

export default function App() {
  const { user, login } = useAuthStore();

  return (
    <div style={{ padding: '40px' }}>
      <h1>Zustand 렌더링 최적화 시스템</h1>
      <p>상태: {user?.name ? `${user.name}님 접속 중` : '로그인이 필요합니다.'}</p>

      {/* 데이터 변화 테스트: 동일한 정보를 계속 보내도 Sidebar는 다시 그려지지 않아야 합니다. */}
      <button onClick={() => login({
        name: '리액트',
        role: 'Premium-VIP',
        id: '1',
        lastActive: Date.now()
      })}>
        유저 정보 업데이트 (최적화 테스트)
      </button>

      <hr style={{ margin: '20px 0' }} />
      <Sidebar />
    </div>
  );
}

📝 코드 상세 설명

동작 방식: 버튼을 클릭할 때마다 Date.now() 때문에 lastActive 값은 매번 변하지만, name과 role은 동일합니다.
최적화 포인트:Sidebar는 useShallow 덕분에 lastActive의 변화를 무시하고 자신의 데이터가 변하지 않았음을 인지합니다. 따라서 버튼을 연타해도 콘솔에 사이드바 렌더링 로그가 추가되지 않는 최적화의 정수를 목격하게 될 것입니다.
