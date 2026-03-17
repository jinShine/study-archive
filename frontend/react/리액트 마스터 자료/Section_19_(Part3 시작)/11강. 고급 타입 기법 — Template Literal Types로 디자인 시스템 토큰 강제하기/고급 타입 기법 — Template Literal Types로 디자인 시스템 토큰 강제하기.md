🎯 학습 목표 및 결과물
지난 시간까지 우리가 외부에서 들어오는 데이터의 정체를 밝히고 입구를 단단히 걸어 잠그는 법을 배웠다면, 이제는 우리 성벽 내부에서 사용하는 언어를 더욱 정교하고 엄격하게 다듬을 차례입니다.

거대한 프로젝트에서 색상이나 간격 같은 디자인 요소들을 다룰 때 발생하는 '오타로 인한 디자인 붕괴'를 원천 봉쇄할 수 있는 템플릿 리터럴 타입(Template Literal Types)의 세계로 안내해 드립니다.

학습 목표:
type (타입 별칭)의 기초 개념을 이해하고 나만의 데이터 규격을 정의하는 법을 배웁니다.
템플릿 리터럴 타입의 기본 원리와 조합 규칙을 익힙니다.
유니온 타입을 결합하여 수십 가지의 디자인 토큰을 자동으로 생성하는 아키텍처를 구축합니다.
최종 결과: 정의되지 않은 색상이나 레벨 입력 시 즉시 에러를 발생시켜 UI 품질을 보장하는 정밀 디자인 시스템 컴포넌트 완성.
📖 상세 개념 가이드 (The Core Manual)
1. type (타입 별칭): 데이터의 이름표 정의하기
타입스크립트에서 type은 복잡한 데이터 형태에 우리가 부르기 쉬운 '별명'을 붙여주는 도구입니다. 이를 타입 별칭(Type Alias)이라고 부릅니다.

/* [Example]: type 정의 기초 */
type BrandColor = 'primary' | 'secondary';
[개념 상세 설명] 위 코드는 BrandColor라는 이름의 새로운 규격을 만든 것입니다. 이제 BrandColor라고 적힌 곳에는 오직 'primary' 혹은 'secondary'라는 글자만 들어올 수 있습니다. 마치 사전에서 단어의 뜻을 정의하듯, 우리 프로젝트에서 사용할 데이터의 범위를 명확히 규정하는 역할을 합니다.

2. 템플릿 리터럴 타입: 마법의 단어 조립 세트
자바스크립트의 백틱을 이용한 문자열 조합법을 타입 시스템으로 가져온 기술입니다. 달러 기호와 중괄호를 사용하는 Color-{Level}과 같은 형식을 사용하여 여러 단어를 하나로 합칠 수 있습니다.

/* [Example]: 템플릿 리터럴 타입을 통한 토큰 생성 */
type Color = 'primary' | 'secondary';
type Level = 100 | 200;

// 조합 규칙: primary-100, primary-200, secondary-100, secondary-200 자동 생성
type DesignToken = `${Color}-${Level}`;
[개념 상세 설명] 달러 기호와 중괄호 안에 다른 타입을 넣으면, 타입스크립트는 가능한 모든 조합의 단어를 스스로 계산해냅니다. 만약 색상이 3가지이고 단계가 5가지라면, 총 15개의 정교한 이름표가 자동으로 만들어집니다. 개발자가 수천 가지 조합을 일일이 손으로 적을 필요 없이 규칙만 정의하면 되는 아주 효율적인 기술입니다.

3. 실시간 맞춤법 검사기
이 기법을 컴포넌트에 적용하면, 개발자가 코드를 작성하는 순간 오타를 잡아주는 '실시간 맞춤법 검사기'가 작동합니다. 정의되지 않은 단어를 쓰면 즉시 빨간 줄이 뜨며 빌드가 차단됩니다.

💻 실습 1단계: 디자인 시스템 부품과 규칙 정의
먼저 디자인 시스템의 기초가 되는 색상과 밝기 단계를 정의하고 이를 조합합니다.

/* [File Path]: src/types/design.ts */

// 1. 색상 부품 정의
export type Color = 'primary' | 'secondary' | 'accent';

// 2. 밝기 단계 부품 정의
export type Level = 100 | 200 | 300 | 400 | 500;

/** * 3. 조합 규칙 정의
 * 달러 기호($)와 중괄호({})를 사용하여 Color와 Level을 결합합니다.
 * 이 한 줄로 primary-100부터 accent-500까지 총 15개의 타입이 생성됩니다.
 */
export type DesignToken = `${Color}-${Level}`;

[상세 코드 설명] 이 파일은 프로젝트의 '언어 사전' 역할을 합니다. Color와 Level이라는 기본 단어를 먼저 정의하고, 이를 조합하여 DesignToken이라는 완성된 단어 형식을 만듭니다. 여기서 ${Color}-${Level} 구문은 "Color에 속한 단어 하나와 하이픈(-), 그리고 Level에 속한 숫자 하나를 붙여서 새로운 단어를 만들겠다"는 약속입니다.

💻 실습 2단계: 디자인 토큰이 적용된 컴포넌트 (DesignButton)
정해진 규칙을 따르지 않으면 화면에 그려지는 것을 거부하는 엄격한 버튼을 만듭니다.

/* [File Path]: src/components/DesignButton.tsx */

import React from 'react';
import type { DesignToken } from '../types/design';

interface ButtonProps {
  token: DesignToken; // 우리가 정의한 15가지 조합만 허용합니다.
  label: string;
}

export function DesignButton({ token, label }: ButtonProps) {
  // className이 'btn-primary-100'과 같은 정밀한 이름으로 조립됩니다.
  return (
    <button
      className={`btn-${token}`}
      style={{
        padding: '10px 20px',
        margin: '10px',
        borderRadius: '6px',
        border: '1px solid #646cff',
        backgroundColor: token.startsWith('primary') ? '#646cff' : '#eee',
        color: token.startsWith('primary') ? 'white' : '#333',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}
    >
      {label} (토큰: {token})
    </button>
  );
}

[상세 코드 설명]DesignButton 컴포넌트는 오직 검증된 DesignToken만을 입력값으로 받습니다. 컴포넌트 내부에서 className을 만들 때 백틱을 사용하여 btn- 뒤에 token을 붙여주는데, 이때 token은 이미 약속된 단어임이 보장되므로 CSS 클래스와 어긋날 확률이 0%가 됩니다. 이것이 바로 내부 언어 체계를 완벽하게 통제하는 아키텍트의 설계입니다.

💻 실습 3단계: 시스템 통합 및 자동 완성 체험 (App.tsx)
개발 환경에서 타입스크립트가 제공하는 내비게이션 기능을 직접 체험해 봅니다.

/* [File Path]: src/App.tsx */

import React from 'react';
import { DesignButton } from './components/DesignButton';

function App() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>11강. 정밀 디자인 토큰 시스템</h1>
      <p>조합 규칙에 어긋나는 단어는 성벽 내부로 들어올 수 없습니다.</p>

      <hr style={{ margin: '30px 0', opacity: 0.1 }} />

      <main>
        {/* [정상 사용]: primary-500은 사전에 등록된 올바른 조합입니다. */}
        <DesignButton token="primary-500" label="승인" />

        {/* [정상 사용]: secondary-200 역시 안전하게 통과됩니다. */}
        <DesignButton token="secondary-200" label="취소" />

        {/* [에러 재현]: 아래 주석을 풀면 'red-100'이나 'primary-600'은 빨간 줄이 뜹니다. */}
        {/* <DesignButton token="red-100" label="오류" /> */}
      </main>
    </div>
  );
}

export default App;

[상세 코드 설명] 실제 App.tsx에서 코드를 작성할 때 token="" 부분에서 따옴표 사이에 커서를 두고 컨트롤(Ctrl) + 스페이스를 누르면, 우리가 정의한 15가지의 유효한 토큰 목록이 나타납니다. 만약 개발자가 실수로 primary-600이라고 적는다면 타입스크립트는 "그런 단어는 설계도에 없습니다"라며 즉시 경고합니다. 이는 수백 명의 개발자가 협업할 때 문서를 뒤지는 시간을 획기적으로 줄여줍니다.

💻 실습 4단계: 엔트리 포인트 (main.tsx)
/* [File Path]: src/main.tsx */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// id가 root인 요소를 찾아 리액트 앱을 장착합니다.
const rootElement = document.getElementById('root') as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

[상세 코드 설명] 리액트 앱이 브라우저 화면에 실제 렌더링되는 시작점입니다. as HTMLElement라는 타입 단언을 사용하여 root 요소가 HTML에 반드시 존재함을 타입스크립트에게 확신시킨 뒤, 우리가 정밀하게 설계한 디자인 토큰 시스템이 포함된 App 컴포넌트를 구동합니다.

✅ 최종 점검 (Final Verification)
1. 완성된 디렉토리 구조

11강._디자인_토큰_시스템/
├── src/
│   ├── types/
│   │   └── design.ts          # 조합 규칙 정의 (type & Template Literal)
│   ├── components/
│   │   └── DesignButton.tsx   # 토큰 강제 컴포넌트
│   ├── App.tsx               # 통합 테스트 및 자동 완성 확인
│   └── main.tsx              # 앱 엔트리 포인트

2. 화면 동작 상태

브라우저 실행 시 "11강. 정밀 디자인 토큰 시스템"이 명확하게 보입니다.
각각 primary-500과 secondary-200이 적용된 버튼들이 안전하게 렌더링됩니다.
코드 상에서 오타를 냈을 때 실시간으로 에러가 감지된다면, 당신은 내부 언어 체계의 완벽한 통제권을 손에 넣은 것입니다.
