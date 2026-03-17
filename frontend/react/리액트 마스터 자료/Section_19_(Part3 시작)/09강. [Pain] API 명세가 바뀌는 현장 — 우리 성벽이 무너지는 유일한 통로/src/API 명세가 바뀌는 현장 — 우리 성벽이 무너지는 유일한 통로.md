🎯 학습 목표 및 결과물
우리는 지금까지 타입스크립트라는 강력한 도구를 이용해 우리 내부의 로직을 철옹성처럼 견고하게 쌓아 올렸습니다. 하지만 숙련된 엔지니어라면 누구나 마주하게 되는 차가운 현실이 있습니다. 바로 우리 성벽 밖의 세상인 백엔드 API와의 연결은 우리가 100% 통제할 수 없는 미지의 영역이라는 점입니다.

이번 가이드에서는 우리가 공들여 만든 설계도가 외부에서 불어오는 갑작스러운 변화 앞에 얼마나 무력하게 무너질 수 있는지, 그 고통스러운 현장을 정밀하게 파헤쳐 보겠습니다.

학습 목표:
데이터 계약(Data Contract)의 취약성을 이해하고 API 명세 변경이 시스템에 미치는 영향을 분석합니다.
컴파일 타임(Compile-time)과 런타임(Run-time)의 간극에서 발생하는 타입 시스템의 한계를 인지합니다.
타입 단언(as) 키워드가 왜 위험한 '눈가림'인지 기술적으로 증명합니다.
최종 결과: API 응답 데이터가 설계도와 불일치할 때 발생하는 '하얀 화면의 죽음(White Screen of Death)' 현상을 재현하고, 런타임 에러의 원인을 추적합니다.
📖 상세 개념 가이드 (The Core Manual)
1. 데이터 계약(Data Contract): 깨지기 쉬운 약속
프론트엔드와 백엔드는 개발 시작 단계에서 "이런 이름과 모양의 데이터를 주고받자"라고 약속합니다. 이를 데이터 계약이라 부르며, 우리는 이 약속을 믿고 인터페이스를 작성합니다.

/* [Example]: 우리가 믿고 있는 데이터 계약
   [Copyright]: © nhcodingstudio 소유 */
interface ProductDetail {
  id: number;
  title: string;
  price: number; // 서버는 반드시 '숫자'를 보내주기로 약속함
}

[개념 설명] 위 코드는 개발자가 서버로부터 받을 데이터의 '이상적인 형태'를 정의한 것입니다. 타입스크립트는 이 설계도를 보고 "아, price는 숫자구나! 그럼 숫자에만 쓸 수 있는 수학 연산이나 포맷팅 함수를 허용해줘야지"라고 판단합니다. 하지만 이것은 어디까지나 문서상의 약속일 뿐, 실제 서버가 보낼 데이터를 물리적으로 강제하는 장치는 아닙니다.

2. 컴파일 타임 vs 런타임: 감독관의 부재
타입스크립트는 코드를 작성하고 빌드하는 '컴파일 타임'에만 작동하는 정적 분석 도구입니다. 실제 브라우저에서 코드가 돌아가는 '런타임'에는 타입스크립트가 존재하지 않습니다.

/* [Example]: 감독관(TS)이 보지 못하는 런타임의 습격
   [Copyright]: © nhcodingstudio 소유 */
const price: number = (receivedData as any).price;
// 컴파일 단계: "오케이, price는 숫자라고 했으니 통과!"
// 런타임 단계: 실제 데이터가 { price: "10,000원" } 이라면? -> 연산 시 에러 발생

[개념 설명] 타입스크립트 감독관은 건물을 짓기 전 설계도(컴파일 타임)를 검토할 때는 완벽하게 오차를 잡아냅니다. 하지만 실제 건물을 짓는 순간(런타임)에 인부(서버)가 설계도에 적힌 벽돌 대신 썩은 나무판자를 가져온다면, 이미 검토를 마친 감독관은 현장에 없으므로 이 사고를 실시간으로 막아낼 방법이 없습니다.

3. 'as' 키워드: 타입스크립트의 눈을 가리는 행위
as 키워드는 타입 단언(Type Assertion)입니다. 이는 타입스크립트에게 "이 데이터는 내가 보증할 테니 묻지도 따지지도 말고 이 타입으로 믿어줘"라고 강요하는 행위입니다.

/* [Example]: 위험한 타입 단언 'as'
   [Copyright]: © nhcodingstudio 소유 */
fetch('/api/data')
  .then(res => res.json())
  .then(data => {
    const validData = data as ProductDetail; // 감독관에게 "이건 무조건 상품 데이터야!"라고 단언함
  });

[개념 설명]as를 사용하는 순간, 타입스크립트는 해당 데이터에 대한 검사를 포기하고 개발자의 말을 맹목적으로 신뢰하게 됩니다. 만약 서버에서 price 속성의 이름을 cost로 바꿨다면, data as ProductDetail은 존재하지 않는 price를 숫자인 것처럼 속여서 시스템 안으로 들여보내는 '트로이의 목마'가 됩니다.

💻 실습 1단계: 취약한 설계도와 컴포넌트 구현
서버가 약속을 어겼을 때 어떻게 성벽이 무너지는지 확인하기 위한 실험용 컴포넌트를 작성합니다.

/* [File Path]: src/components/ProductPage.tsx
   [Copyright]: © nhcodingstudio 소유
   [Test Process]:
   1. npm run dev 실행 후 브라우저에서 해당 페이지에 접속합니다.
   2. "상품 정보를 불러오는 중입니다..." 메시지 이후 화면이 하얗게 변하는지 확인합니다.
   3. 브라우저 개발자 도구(F12)의 Console 탭에서 빨간색 에러 메시지를 확인합니다.
*/

import React, { useState, useEffect } from 'react';

// 1. 우리가 서버와 맺은 '취약한' 데이터 계약
interface ProductDetail {
  id: number;
  title: string;
  price: number;
}

export function ProductPage({ productId }: { productId: number }) {
  const [product, setProduct] = useState<ProductDetail | null>(null);

  useEffect(() => {
    // 실제 fetch를 흉내 내기 위한 모의 함수입니다.
    const simulateFetch = async () => {
      // [비극의 시작]: 백엔드 엔지니어가 예고 없이 속성명을 'price'에서 'amount'로 바꿨다고 가정합니다.
      const responseFromServer = {
        id: productId,
        title: "고난의 타입스크립트 키보드",
        amount: 89000 // 원래는 price여야 함!
      };

      // [위험 지점]: 'as'를 사용하여 검증 없이 외부 물자를 성 안으로 들입니다.
      // 실제 데이터에는 price가 없지만, 타입스크립트는 이제 price가 있다고 믿게 됩니다.
      setProduct(responseFromServer as any as ProductDetail);
    };

    simulateFetch();
  }, [productId]);

  if (!product) return <div>상품 정보를 불러오는 중입니다...</div>;

  return (
    <div style={{ padding: '20px', border: '2px dashed red' }}>
      <h1>{product.title}</h1>
      <p style={{ fontSize: '1.5rem', color: 'red' }}>
        {/* [폭발 지점]: product.price는 undefined입니다.
            undefined에서 .toLocaleString()을 호출하는 순간 앱은 사망합니다. */}
        가격: {product.price.toLocaleString()}원
      </p>
    </div>
  );
}

🔍 상세 코드 분석
setProduct(responseFromServer as any as ProductDetail): 이 구문은 타입스크립트의 가장 큰 약점입니다. as any를 거쳐 ProductDetail로 강제 변환하면, 실제 데이터에 price가 없더라도 컴파일러는 입을 다뭅니다. 이는 검증되지 않은 데이터를 시스템 심장부에 주입하는 행위입니다.
product.price.toLocaleString(): 런타임에서 price는 undefined가 됩니다. 자바스크립트 엔진은 존재하지 않는 값에서 함수를 호출하려 할 때 즉시 실행을 중단하고 에러를 발생시킵니다. 이것이 사용자가 아무것도 볼 수 없는 '하얀 화면의 공포'가 발생하는 원리입니다.
💻 실습 2단계: 시스템 통합 (App.tsx)
고통의 현장을 렌더링하기 위한 메인 조립소입니다.

/* [File Path]: src/App.tsx
   [Copyright]: © nhcodingstudio 소유
   [Test Process]: 101번 상품을 불러오며 시스템이 붕괴되는 과정을 관찰합니다. */

import React from 'react';
import { ProductPage } from './components/ProductPage';

function App() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '50px', textAlign: 'center' }}>
      <header>
        <h1 style={{ color: '#2c3e50' }}>09강. API 명세 변경의 비극</h1>
        <p style={{ color: '#7f8c8d' }}>서버가 약속을 어기면 어떤 일이 벌어질까요?</p>
      </header>

      <main style={{ marginTop: '30px' }}>
        {/* 고장 난 서버 데이터를 시뮬레이션하는 페이지를 호출합니다. */}
        <ProductPage productId={101} />
      </main>

      <footer style={{ marginTop: '50px', fontSize: '0.8rem', color: '#ccc' }}>
        © 2026 Defensive Architecture Training
      </footer>
    </div>
  );
}

export default App;

🔍 상세 코드 분석
App.tsx: 구조적으로는 완벽해 보이는 리액트 앱입니다. 하지만 하위의 ProductPage가 외부의 '오염된 데이터'를 걸러내지 못하기 때문에, 이 메인 컴포넌트까지 에러의 여파가 미치게 됩니다. 데이터 오염은 독소처럼 아래에서 위로, 혹은 위에서 아래로 퍼져나갑니다.
💻 실습 3단계: 엔트리 포인트 (main.tsx)
/* [File Path]: src/main.tsx
   [Copyright]: © nhcodingstudio 소유
   [Test Process]: 앱의 엔진을 가동합니다. */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// HTML의 id="root" 요소를 찾아 리액트 앱을 장착합니다.
const rootElement = document.getElementById('root') as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

🔍 상세 코드 분석
as HTMLElement: 여기서도 as를 사용했습니다. 이는 root 요소가 HTML에 반드시 존재한다는 개발자의 확신입니다. 만약 HTML에 id="root"가 없다면 여기서부터 앱은 동작하지 않습니다. 이처럼 as는 "내가 책임질 테니 일단 진행해"라는 위험한 약속임을 잊지 마세요.
✅ 최종 점검 (Final Verification)
1. 완성된 디렉토리 구조

09강._API_명세_변경의_고통/
├── src/
│   ├── components/
│   │   └── ProductPage.tsx    # 런타임 폭발 지점 (© nhcodingstudio)
│   ├── App.tsx               # 시스템 조립소 (© nhcodingstudio)
│   └── main.tsx              # 엔진 가동 (© nhcodingstudio)
├── index.html
└── package.json
2. 화면 동작 상태

브라우저를 열면 아주 잠깐 "상품 정보를 불러오는 중입니다..."라는 메시지가 보입니다.
데이터가 로드되자마자 화면이 갑자기 싹 비워지거나(White Screen), 콘솔창에 "Uncaught TypeError: Cannot read properties of undefined (reading 'toLocaleString')"라는 치명적인 붉은 메시지가 뜹니다.
교훈: 내부 설계의 완벽함(interface)만으로는 외부에서 들어오는 '오염된 데이터'를 막을 수 없습니다.
