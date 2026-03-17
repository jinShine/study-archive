🎯 학습 목표 및 결과물
지난 강의에서 우리는 외부 API의 예고 없는 변화가 어떻게 우리 리액트 앱의 성벽을 무너뜨리는지 목격했습니다. 설계도가 있어도 실행 단계인 런타임에서 무너졌던 이유는, 인터페이스가 실질적인 검열 능력이 없는 '종이 위의 약속'이었기 때문입니다.

오늘은 이 막연한 믿음을 확신으로 바꾸기 위해, 데이터의 생존 조건을 규정하는 스키마(Schema) 기반 설계와 그 핵심 열쇠인 is 구문을 도입해 보겠습니다. 2026년의 아키텍트라면 반드시 갖춰야 할 방어적 코딩의 정수입니다.

학습 목표:
스키마(Schema)의 개념을 이해하고 단순 타입 정의와의 차별점을 파악합니다.
is 키워드(Type Predicate)의 원리를 파헤쳐 런타임 검증과 타입 추론을 연결합니다.
*타입 가드(Type Guard)를 활용하여 오염된 데이터의 유입을 원천 차단합니다.
빠른 실패(Fail Fast) 전략으로 '하얀 화면의 죽음'을 방어합니다.
최종 결과: 서버 데이터가 규격에 맞지 않을 때 앱이 터지는 대신, 사용자에게 안전한 안내를 제공하는 무결점 방어 아키텍처 완성.
📖 상세 개념 가이드 (The Core Manual)
1. 스키마 vs 인터페이스: 포스트잇과 정밀 검열기
인터페이스가 "이 상자에는 사과가 들어있어야 합니다"라고 적어둔 포스트잇이라면, 스키마는 상자가 통과해야 하는 정밀 검열기입니다. 상자가 들어올 때마다 실제로 사과가 맞는지 전수 조사하여 규격에 맞지 않으면 즉시 퇴출합니다.

2. is 키워드 (Type Predicate): 검열관의 공식 인증
is 구문은 타입스크립트에서 타입 술어(Type Predicate)라고 불리는 아주 특수한 문법입니다. 일반적인 함수 리턴 타입인 boolean과 결정적인 차이가 있습니다.

boolean 리턴: 함수가 true를 줘도, 함수 밖에서는 데이터가 여전히 any로 취급됩니다.
data is Type 리턴: 함수가 true를 반환하는 순간, 타입스크립트는 "이 변수는 이제부터 확실히 이 타입이다"라고 메모리 상에서 확정(Narrowing) 짓습니다.
/* [Example]: 'is' 구문의 마법
   [Copyright]: © nhcodingstudio 소유 */

// 단순히 boolean을 쓰면 타입스크립트는 '무엇이' true인지 모릅니다.
function check(data: any): data is string {
  return typeof data === 'string';
}

const value: any = "Hello";
if (check(value)) {
  // 여기서 value는 이제 any가 아니라 'string'으로 완벽하게 추론됩니다!
  console.log(value.toUpperCase());
}

[개념 상세 설명]is 키워드는 타입스크립트의 눈을 런타임 영역으로 확장해 줍니다. 함수의 실행 결과가 true일 때, 해당 인자의 타입을 우리가 지정한 타입으로 '고정'시켜버리는 힘을 가집니다. 이를 통해 우리는 런타임의 불확실성을 타입 시스템의 안정성으로 편입시킬 수 있습니다.

3. 타입 가드(Type Guard): 냉혹한 세관원
데이터가 우리 시스템에 발을 들이는 1ms의 찰나에 완벽한 검열을 수행하는 로직입니다.

/* [Example]: 인터페이스와 검열관 함수의 결합
   [Copyright]: © nhcodingstudio 소유 */

interface ProductDetail {
  id: number;
  title: string;
  price: number;
}

function validateProduct(data: any): data is ProductDetail {
  return (
    data &&
    typeof data.id === 'number' &&
    typeof data.title === 'string' &&
    typeof data.price === 'number'
  );
}

[개념 상세 설명] 위 함수는 외부에서 들어온 정체불명의 데이터(any)를 받아 우리가 정의한 ProductDetail 인터페이스 조항과 하나하나 대조합니다. typeof 연산자를 활용해 실제 값의 자료형을 검사하며, 모든 조건이 충족되어 true가 반환되는 순간 is 구문에 의해 데이터는 안전한 '정식 여권'을 얻게 됩니다.

💻 실습 1단계: 방어 초소 컴포넌트 구현 (ProductPage)
리액트 컴포넌트 내부에서 검열 시스템을 가동하여 앱을 보호합니다.

/* [File Path]: src/components/ProductPage.tsx
   [Copyright]: © nhcodingstudio 소유
   [Test Process]:
   1. API 데이터를 받아온 직후 validateProduct를 호출합니다.
   2. 검증 실패 시 에러 상태(error)를 업데이트하여 UI를 안전하게 전환합니다.
*/

import React, { useState, useEffect } from 'react';

// 1. 내부 표준 규격 정의
interface ProductDetail {
  id: number;
  title: string;
  price: number;
}

/**
 * [상세 해설]: validateProduct 함수
 * 'data is ProductDetail'을 반환 타입으로 지정하여,
 * 이 함수를 통과한 데이터만이 setProduct에 담길 수 있도록 강제합니다.
 */
function validateProduct(data: any): data is ProductDetail {
  return (
    data &&
    typeof data.id === 'number' &&
    typeof data.title === 'string' &&
    typeof data.price === 'number'
  );
}

export function ProductPage({ productId }: { productId: number }) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 09강에서 겪은 '하얀 화면' 비극을 막기 위한 방어 로직
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        // [방어 지점]: 데이터를 무작정 믿지 않고 세관원에게 보냅니다.
        if (validateProduct(data)) {
          // 검열 통과: 이때부터 data는 완벽한 ProductDetail로 대접받습니다.
          setProduct(data);
          setError(null);
        } else {
          // 검열 실패: 즉시 차단하고 '우아한 실패'를 준비합니다.
          console.error("🚨 [규격 불일치]: 서버가 약속을 어긴 데이터가 감지되었습니다.");
          setError("시스템 규격에 맞지 않는 데이터입니다.");
        }
      })
      .catch(() => setError("네트워크 통신 중 오류가 발생했습니다."));
  }, [productId]);

  // 빠른 실패(Fail Fast) 전략에 따른 UI 분기
  if (error) return <div style={{ color: 'red', padding: '20px', border: '1px solid red' }}>{error}</div>;
  if (!product) return <div>데이터를 정밀 검사하는 중입니다...</div>;

  return (
    <div className="product-container" style={{ padding: '20px', border: '1px solid #646cff' }}>
      <h1>{product.title}</h1>
      <p style={{ fontSize: '1.2rem' }}>가격: {product.price.toLocaleString()}원</p>
    </div>
  );
}

🔍 상세 코드 분석
if (validateProduct(data)): 데이터가 상태(setProduct)에 주입되기 전의 최전방 방어선입니다. 이 문을 통과한 데이터만 시스템 내부로 진입할 수 있습니다.
data is ProductDetail: 이 구문 덕분에 if 블록 안에서 setProduct(data)를 호출할 때 어떠한 타입 에러도 발생하지 않습니다. 타입스크립트가 data의 정체를 확신하게 되었기 때문입니다.
setError(...): 데이터 오염 발견 시 화면을 터뜨리는 대신, 사용자에게 상황을 설명하는 안내를 렌더링합니다. 이것이 시니어급 엔지니어링의 정수입니다.
💻 실습 2단계: 시스템 통합 (App.tsx & main.tsx)
/* [File Path]: src/App.tsx
   [Copyright]: © nhcodingstudio 소유 */

import React from 'react';
import { ProductPage } from './components/ProductPage';

function App() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '50px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50' }}>10강. 스키마 기반 방어 아키텍처</h1>
        <p>외부의 변화로부터 우리 앱을 지키는 정밀 검열 시스템</p>
      </header>
      <hr style={{ opacity: 0.1, margin: '30px 0' }} />
      <main>
        {/* 101번 상품을 호출하여 방어 로직을 가동합니다. */}
        <ProductPage productId={101} />
      </main>
    </div>
  );
}

export default App;

/* [File Path]: src/main.tsx
   [Copyright]: © nhcodingstudio 소유 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root') as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

🔍 상세 코드 분석
App.tsx: 구조적으로 독립된 방어 초소(ProductPage)를 조립합니다. 내부에서 에러가 발생해도 앱 전체가 붕괴하지 않도록 격리된 설계를 보여줍니다.
main.tsx: 리액트 엔진을 구동하는 진입점입니다. as HTMLElement 단언을 통해 root 요소의 존재를 확신시키며 앱을 쏘아 올립니다.
✅ 최종 점검 (Final Verification)
1. 완성된 디렉토리 구조

10강._스키마_기반_타입_설계/
├── src/
│   ├── components/
│   │   └── ProductPage.tsx    # 타입 가드 및 is 구문 적용 (© nhcodingstudio)
│   ├── App.tsx               # 시스템 조립소 (© nhcodingstudio)
│   └── main.tsx              # 엔진 가동 (© nhcodingstudio)

2. 화면 동작 상태

서버 정상: 상품명과 콤마가 포함된 가격이 우아하게 렌더링됩니다.
서버 비정상 (price가 문자열): 화면이 터지지 않고 "시스템 규격에 맞지 않는 데이터입니다"라는 붉은색 안내가 출력됩니다.
디버깅: 콘솔창에 로그가 찍혀 원인을 1초 만에 파악할 수 있습니다.
