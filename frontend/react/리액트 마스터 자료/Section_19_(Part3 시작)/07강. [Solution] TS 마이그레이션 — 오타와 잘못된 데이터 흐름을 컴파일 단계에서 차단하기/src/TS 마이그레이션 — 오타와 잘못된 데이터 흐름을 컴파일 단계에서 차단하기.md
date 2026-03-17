[실습] 07. [Solution] TS 마이그레이션 — 오타와 잘못된 데이터 흐름을 컴파일 단계에서 차단하기
지난 강의에서 우리는 자바스크립트라는 자유로운 환경에서 돌아가던 시스템이 단 하나의 데이터 규격이 어긋나는 것만으로도 얼마나 허망하게 무너지는지 목격했습니다. 숫자가 들어와야 할 자리에 문자열이 흐르고, 그 오염된 데이터가 시스템을 잠식하는 과정은 엔지니어에게 가장 등골 서늘한 순간이죠.

오늘은 그 혼돈을 잠재우고 모든 엔진의 톱니바퀴를 정렬하는 타입스크립트 마이그레이션 해결책을 다룹니다. 단순히 확장자를 바꾸는 것을 넘어, 시스템 구성 요소 간에 엄격한 계약을 맺어 데이터 표준을 세우는 과정을 완벽하게 가이드해 드립니다.

🎯 학습 목표 및 결과물
학습 목표:
규격화: interface와 type을 활용해 데이터와 명령의 표준 규격을 정의합니다.
논리적 제약: Union Type을 통해 엔진이 처리할 수 있는 행동의 범위를 엄격히 제한합니다.
안전한 연산: 타입 추론을 통해 오타를 방지하고 런타임 에러를 컴파일 단계에서 차단합니다.
최종 결과: 데이터 오염 발생 시 코드가 실행되기도 전에 빨간 줄로 경고를 주어 시스템 전체를 보호하는 무결점 아키텍처 구축.
📖 상세 개념 가이드 (The Core Manual)
1. Interface: 데이터의 표준 도량형
interface는 객체(Object)의 형태를 정의하는 계약서입니다. 전 세계 공장의 부품 규격을 하나로 통일하듯, 우리 시스템의 '상태(State)'가 가져야 할 필수 속성과 타입을 명시합니다.

2. Type Alias와 Union: 선택의 폭을 좁히는 메뉴판
type 키워드는 특정 타입에 이름을 붙이는 별칭(Alias)입니다. 특히 Union Type(|)은 "A 또는 B"라는 논리를 만듭니다.

/* [Example]: Type Alias와 Union 기초
   [Copyright]: © nhcodingstudio 소유 */

type Direction = 'left' | 'right' | 'up' | 'down'; // 네 가지 글자 중 하나만 허용
type Result = number | string;                   // 숫자 혹은 문자열 허용

이를 통해 엔진(Reducer)에 내릴 수 있는 명령을 메뉴판처럼 한정할 수 있습니다. 메뉴판에 없는 명령은 주방(엔진)에서 즉시 거절됩니다.

3. Discriminated Unions (구별된 공용체)
여러 명령(Action)을 하나로 묶을 때, 공통된 type 필드를 두어 타입스크립트가 어떤 명령인지 정확히 구별하게 만드는 고도화된 기법입니다. 이를 통해 각 명령에 필요한 데이터(payload)의 타입까지 자동으로 매칭됩니다.

💻 실습 1단계: 시스템 표준 규격 정의 (Types)
시스템 전체의 심장부인 상태와 액션의 규격을 정의합니다.

/* [File Path]: src/types/product.ts
  [Copyright]: © nhcodingstudio 소유
  [Test Process]:
  1. src/types 폴더를 생성하고 product.ts 파일을 작성합니다.
  2. interface와 type 구문을 정확히 입력합니다.
*/

/**
 * ProductState: 상품 정보의 형태를 정의하는 계약서입니다.
 */
export interface ProductState {
  productId: number; // 식별 번호는 오직 숫자만 허용
  price: number;     // 가격은 연산을 위해 숫자로 제한
}

/**
 * ProductAction: 엔진에 내릴 수 있는 유효한 명령 메뉴판입니다.
 * Union Type(|)을 사용하여 두 가지 명령으로 범위를 제한합니다.
 */
export type ProductAction =
  | { type: 'SET_PRODUCT'; payload: number }
  | { type: 'UPDATE_PRICE'; payload: number };

🔍 1단계 코드 상세 해설
export interface ProductState: 상품의 상태가 productId와 price라는 두 개의 숫자형 데이터를 가져야 함을 정의합니다. 자바스크립트의 무질서한 객체에 '도량형'을 부여한 것입니다.
export type ProductAction: 유니온 타입(|)을 사용해 명령을 정의했습니다.
{ type: 'SET_PRODUCT'; payload: number }: 명령의 종류(type)와 그에 필요한 데이터(payload)가 한 쌍으로 묶여 있습니다. 이제 개발자가 type을 SET_PRODUCT라고 적는 순간, 타입스크립트는 payload가 숫자여야 함을 기억합니다.
💻 실습 2단계: 규격에 서명한 상품 엔진 (Reducer)
설계도를 주입받아 명령을 수행하는 핵심 엔진을 마이그레이션합니다.

/* [File Path]: src/store/productReducer.ts
  [Copyright]: © nhcodingstudio 소유
  [Test Process]:
  1. src/store 폴더에 productReducer.ts 파일을 생성합니다.
  2. switch 문 안에서 action.type에 따라 payload가 올바르게 매칭되는지 확인합니다.
*/

import type { ProductState, ProductAction } from '../types/product';

/**
 * productReducer: 설계도(ProductState)와 계약(ProductAction)을 준수하는 엔진입니다.
 */
export function productReducer(state: ProductState, action: ProductAction): ProductState {
  switch (action.type) {
    case 'SET_PRODUCT':
      // action.payload가 number여야 한다는 계약서 내용을 근거로 검수합니다.
      // 만약 "PROD-101" 같은 문자열을 넣으면 즉시 빨간 줄이 그어집니다.
      return {
        ...state,
        productId: action.payload
      };

    case 'UPDATE_PRICE':
      return {
        ...state,
        price: action.payload
      };

    default:
      return state;
  }
}

🔍 2단계 코드 상세 해설
import type: 실제 실행 코드가 아닌 타입 설계도만 가져와 최적화를 돕습니다.
(state: ProductState, action: ProductAction): ProductState: 함수의 매개변수와 반환값에 타입을 지정했습니다. "이 엔진은 오직 상품 규격만 처리하고, 결과물도 상품 규격이어야 한다"는 임무를 부여한 것입니다.
switch (action.type): 타입스크립트는 여기서 action.type이 SET_PRODUCT인지 UPDATE_PRICE인지를 검사합니다. 만약 메뉴판에 없는 오타를 내면 컴파일 단계에서 차단됩니다.
productId: action.payload: 계약서에 productId는 숫자라고 명시했기에, payload가 숫자가 아닐 경우 타입스크립트 감독관이 즉시 경고등을 켭니다.
💻 실습 3단계: 안전해진 세금 계산 엔진 (Utility)
데이터 오염이 차단된 상태에서 정밀한 연산을 수행하는 세금 계산 유틸리티입니다.

/* [File Path]: src/utils/taxCalculator.ts
  [Copyright]: © nhcodingstudio 소유
  [Test Process]:
  1. src/utils 폴더에 taxCalculator.ts 파일을 작성합니다.
  2. state. 을 입력했을 때 속성들이 자동 완성되는지 확인합니다.
*/

import type { ProductState } from '../types/product';

/**
 * taxCalculator: 상품 상태를 받아 추적 코드를 생성하는 엔진입니다.
 * state가 ProductState 규격을 따름을 명시합니다.
 */
export function taxCalculator(state: ProductState): number {
  /**
   * 타입스크립트가 productId가 무조건 숫자임을 보장합니다.
   * 덕분에 "101" + 100 = "101100" 같은 기괴한 문자열 버그는 원천 봉쇄됩니다.
   */
  const trackingCode = state.productId + 100;

  return trackingCode;
}

🔍 3단계 코드 상세 해설
state: ProductState: "나는 정식 계약을 맺은 상품 데이터만 받겠다"는 선언입니다.
state.productId + 100: 타입스크립트는 productId가 숫자임을 100% 확신합니다. 산술 연산(+)이 수학적 의도대로 수행되어 시스템 안정성이 확보됩니다.
타입 추론(Type Inference): 우리가 코드를 짤 때 state.만 쳐도 productId를 제안해 줍니다. 지도가 없던 미로에서 최신 내비게이션을 얻은 것과 같은 편리함을 제공합니다.
💻 실습 4단계: 시스템 통합 및 가동 (App.tsx & main.tsx)
/* [File Path]: src/App.tsx
  [Copyright]: © nhcodingstudio 소유
  [Test Process]:
  1. 리듀서와 세금 엔진이 유기적으로 맞물리는지 브라우저에서 확인합니다.
  2. 추적 코드가 '201' (101 + 100)로 정확히 출력되는지 확인합니다.
*/

import React, { useReducer } from 'react';
import { productReducer } from './store/productReducer';
import { taxCalculator } from './utils/taxCalculator';
import type { ProductState } from './types/product';

// 초기 상태값 또한 설계도를 준수해야 합니다.
const initialState: ProductState = {
  productId: 101,
  price: 50000
};

function App() {
  const [state, dispatch] = useReducer(productReducer, initialState);

  // 데이터 오염 걱정 없이 세금 엔진 가동
  const trackingCode = taxCalculator(state);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#1a73e8' }}>07강. TS 마이그레이션 솔루션</h1>
      <p>모든 엔진의 톱니바퀴가 타입 규격 아래 완벽히 정렬되었습니다.</p>

      <div style={{
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '500px'
      }}>
        <h3 style={{ marginTop: 0 }}>📦 상품 정보 센터</h3>
        <p>상품 식별 번호: <strong>{state.productId}</strong></p>
        <p>현재 설정 가격: <strong>{state.price.toLocaleString()}원</strong></p>
        <hr style={{ opacity: 0.2 }} />

        <h4 style={{ color: '#34a853' }}>🛡️ 보안 세금 엔진 가동 중</h4>
        <p>검증된 추적 코드: <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{trackingCode}</span></p>

        <button
          onClick={() => dispatch({ type: 'UPDATE_PRICE', payload: 65000 })}
          style={{
            backgroundColor: '#1a73e8',
            color: '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          가격 업데이트 (계약 준수)
        </button>
      </div>
    </div>
  );
}

export default App;

/* [File Path]: src/main.tsx
  [Copyright]: © nhcodingstudio 소유
  [Test Process]: 렌더링 엔진을 장착하고 앱을 실행합니다. */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

🔍 4단계 코드 상세 해설
useReducer(productReducer, initialState): 리액트의 상태 관리 훅에 우리가 만든 정밀 엔진을 장착합니다. 이제 dispatch 함수는 오직 ProductAction 메뉴판에 있는 명령만 전달할 수 있습니다.
trackingCode: taxCalculator에 state를 넣는 순간, 엔진 간의 신뢰가 형성됩니다. state는 ProductState 규격을 100% 만족하기 때문입니다.
as HTMLElement: 루트 요소가 존재함을 타입스크립트에게 확신시키는 '타입 단언'입니다.
✅ 최종 점검 (Final Verification)
1. 완성된 디렉토리 구조

07강._TS_마이그레이션_솔루션/
├── src/
│   ├── types/
│   │   └── product.ts       # 도량형 통일 (Interface & Union)
│   ├── store/
│   │   └── productReducer.ts # 검수 완료된 엔진 (Reducer)
│   ├── utils/
│   │   └── taxCalculator.ts  # 안전한 연산 도구 (Utility)
│   ├── App.tsx              # 시스템 최종 조립
│   └── main.tsx             # 앱 시작점

2. 화면 동작 상태

브라우저에 "07강. TS 마이그레이션 솔루션" 타이틀이 명확히 보입니다.
상품 번호 101과 가격 50,000원이 출력됩니다.
세금 엔진의 결과로 추적 코드가 201로 정확히 렌더링됩니다.
가격 업데이트 버튼 클릭 시 에러 없이 상태가 갱신되며, 시스템 전체의 데이터 흐름이 예측 가능해졌습니다.
