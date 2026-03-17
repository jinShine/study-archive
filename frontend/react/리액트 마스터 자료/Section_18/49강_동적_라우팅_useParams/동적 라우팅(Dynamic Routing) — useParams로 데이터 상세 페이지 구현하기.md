# 49강. 동적 라우팅(Dynamic Routing) -- useParams로 데이터 상세 페이지 구현하기

## 도입

실제 서비스에서 상품이 만 개라면 만 개의 상세 페이지 컴포넌트를 일일이 만들어야 할까? 이는 관리 측면에서 재앙에 가깝다. 단 하나의 컴포넌트만으로 수만 개의 서로 다른 상세 페이지를 완벽하게 제어할 수 있게 해주는 동적 라우팅(Dynamic Routing)과 `useParams` 훅에 대해 깊이 있게 알아본다.

## 개념 설명

리액트 라우터에서 주소 뒤에 콜론(`:`)을 붙이는 것은 "여기는 나중에 어떤 값이든 들어올 수 있는 변수 자리야"라고 약속하는 것이다.

- `/inventory/:productId` 경로를 설정하면 `/inventory/1`, `/inventory/999` 등 어떤 값이 와도 같은 컴포넌트가 렌더링된다.
- `useParams` 훅은 주소창에서 변수 자리의 값을 객체 형태로 꺼내준다.

### 데이터 타입의 함정(String vs Number)

- **원칙**: `useParams`로 가져온 모든 값은 주소창의 텍스트를 그대로 긁어오기 때문에 항상 문자열(String)이다.
- **문제**: 주소창이 `/inventory/101`일 때 `productId`는 숫자 `101`이 아니라 문자열 `"101"`이다.
- **해결**: 데이터베이스의 숫자형 ID와 비교할 때는 반드시 `Number(productId)`를 사용하여 타입을 맞춰주어야 한다.

## 코드 예제

### 동적 파라미터를 포함한 라우팅 설정 (App.jsx)

```jsx
import { Routes, Route } from 'react-router';
import Layout from './components/Layout';
import InventoryPage from './pages/InventoryPage';
import ProductDetail from './pages/ProductDetail';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<InventoryPage />} />
        {/* 주소창의 일부분을 :productId라는 변수로 비워둔다. */}
        <Route path="inventory/:productId" element={<ProductDetail />} />
      </Route>
    </Routes>
  );
}
```

### useParams를 활용한 동적 데이터 추출 (ProductDetail.jsx)

```jsx
import { useParams } from 'react-router';

export default function ProductDetail() {
  // 주소창에 찍힌 실제 값(예: 101)을 productId라는 변수에 담는다.
  const { productId } = useParams();

  return (
    <div style={{ padding: '40px' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>
        PRODUCT ANALYSIS
      </h2>

      <p style={{ marginTop: '16px', color: '#64748b' }}>
        현재 조회 중인 상품 코드:
        <span style={{ color: '#4f46e5', fontWeight: 'bold', marginLeft: '8px' }}>
          #{productId}
        </span>
      </p>

      <div style={{
        marginTop: '40px', height: '200px', background: '#f1f5f9',
        borderRadius: '24px', border: '2px dashed #cbd5e1',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#94a3b8', fontStyle: 'italic'
      }}>
        여기에 {productId}번 상품의 상세 정보와 통계 차트가 나타난다.
      </div>
    </div>
  );
}
```

## 코드 해설

- `:productId`는 URL의 변수 자리를 선언하는 문법이다. 이 자리에 어떤 값이 오든 같은 `ProductDetail` 컴포넌트가 렌더링된다.
- `useParams()`는 `{ productId: "101" }` 형태의 객체를 반환한다. 구조 분해 할당으로 꺼내 사용한다.
- 이 `productId` 값을 기반으로 API 호출, 데이터 필터링 등 서버 연동 로직을 작성할 수 있다.

## 실무 비유

동적 라우팅은 호텔의 카드키 시스템과 같다. 호텔(컴포넌트)은 하나이지만, 카드키에 적힌 방 번호(`:productId`)에 따라 서로 다른 방(데이터)을 열어준다. 방이 만 개여도 호텔 건물 자체는 하나로 충분하다.

## 핵심 포인트

- 주소창 경로에 콜론(`:`)을 붙여 변수 자리를 만들고, `useParams`로 그 값을 추출한다.
- `useParams`의 반환값은 항상 문자열이므로 숫자 연산 시 타입 변환이 필요하다.
- 하나의 컴포넌트로 수만 개의 상세 페이지를 제어할 수 있어 유지보수가 용이하다.

## 자가 점검

- [ ] 주소창 경로에 콜론(`:`)을 붙여 변수 자리를 만드는 원리를 이해했는가?
- [ ] `useParams` 훅이 주소창에서 동적 값을 객체 형태로 반환한다는 점을 파악했는가?
- [ ] 파라미터 값은 항상 문자열이므로 숫자 연산 시 타입 변환이 필요함을 인지했는가?
- [ ] 브라우저 주소창에 `/inventory/hello`라고 입력해 보고, `productId` 자리에 "hello"라는 글자가 정상적으로 출력되는지 확인했는가?
