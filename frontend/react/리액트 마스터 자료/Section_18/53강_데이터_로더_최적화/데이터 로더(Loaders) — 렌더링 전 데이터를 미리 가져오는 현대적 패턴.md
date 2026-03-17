# 53강. 데이터 로더(Loaders) — 렌더링 전 데이터를 미리 가져오는 현대적 패턴

## 도입

지난 강의에서 우리는 `createBrowserRouter`를 통해 앱의 엔진을 현대적인 '데이터 라우터' 체제로 업그레이드했다. 이제 원하는 곳으로 자유롭게 이동할 수 있는 기초는 다졌지만, 여전히 해결되지 않은 불편함이 있다. 바로 페이지 이동 직후 마주하게 되는 텅 빈 화면과 지루한 로딩 스피너이다.

지금까지 우리는 컴포넌트가 화면에 나타난 뒤에야 `useEffect`를 실행해 데이터를 가져오는 방식을 사용해왔다. 하지만 이 방식은 데이터가 도착하기 전까지 사용자를 기다리게 할 뿐만 아니라 화면이 번쩍이며 레이아웃이 뒤바뀌는 현상을 초래한다. 이번 강의에서 배우게 될 **데이터 로더(Data Loaders)**는 사용자가 페이지에 도착하기도 전에 데이터를 미리 낚아채는 혁신적인 **프리페칭(Pre-fetching)** 기술이다.

## 개념 설명

### 데이터 로더의 핵심 원리

- **원리**: 사용자가 링크를 클릭하면 라우터가 컴포넌트를 그리기 전에 `loader` 함수를 가로채서 실행한다. 데이터가 모두 준비될 때까지 현재 페이지를 유지하다가, 준비가 완료되는 순간 완성된 새 화면을 한꺼번에 보여준다.
- **기존 방식(useEffect)**: 식당에 도착해 자리에 앉은 다음 주문을 시작하는 것이다. 음식이 나올 때까지 빈 테이블에서 기다려야 한다.
- **데이터 로더**: 식당에 가기 위해 집에서 출발할 때 이미 메뉴를 주문해두는 시스템이다. 식당 문을 여는 순간 테이블에는 이미 갓 조리된 음식이 놓여 있다.

### 핵심 구성 요소

1. **loader 함수**: 컴포넌트 외부에서 정의하는 비동기 데이터 패칭 함수. 라우터가 컴포넌트 렌더링 전에 먼저 실행한다.
2. **useLoaderData 훅**: 로더가 미리 준비한 데이터를 컴포넌트 내부에서 즉시 꺼내쓰는 도구. `useState`나 `useEffect` 없이 데이터가 이미 채워져 있다.

## 코드 예제

### Step 1: 독립적인 데이터 로더와 페이지 정의 (InventoryPage.jsx)

기존의 `useEffect` 방식을 버리고, 컴포넌트 외부에서 데이터를 미리 가져오는 `loader` 함수를 정의한다.

```jsx
import { useLoaderData } from 'react-router';

// 1. [독립 로더] 이 함수는 컴포넌트가 그려지기 전, 라우터에 의해 먼저 실행됩니다.
// 컴포넌트 외부에서 정의하므로 라우터가 미리 가로채서 실행할 수 있습니다.
export const inventoryLoader = async () => {
  console.log("데이터 사전 확보 시작 (Pre-fetching)...");
  const response = await fetch('https://api.sampleapis.com/coffee/hot');

  if (!response.ok) {
    throw new Error("데이터를 가져오는 데 실패했습니다.");
  }

  // 여기서 반환된 데이터는 useLoaderData를 통해 컴포넌트로 전달됩니다.
  return response.json();
};

export default function InventoryPage() {
  // 2. [데이터 수신] 미리 준비된 데이터를 주문서 확인하듯 즉시 꺼내옵니다.
  // useState나 useEffect 없이도 이미 데이터가 채워져 있습니다.
  const products = useLoaderData();

  return (
    <div style={{ padding: '40px' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginBottom: '30px' }}>
        REAL-TIME INVENTORY
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {products.slice(0, 6).map(item => (
          <div key={item.id} style={{ padding: '20px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b' }}>{item.title}</h3>
            <p style={{ color: '#4f46e5', fontWeight: '900', marginTop: '10px' }}>ID: #{item.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 2: 라우터 설정에 로더 연결하기 (App.jsx)

중앙 관제 시스템인 `createBrowserRouter`의 각 경로에 우리가 만든 `loader`를 등록한다.

```jsx
import { createBrowserRouter, RouterProvider } from 'react-router';
import Layout from './components/Layout';
import InventoryPage, { inventoryLoader } from './pages/InventoryPage';

// 객체 기반의 라우터 설정을 통해 특정 경로에 loader를 심어줍니다.
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <InventoryPage />,
        // [로더 등록] 사용자가 이 방에 들어오기 전 주문서를 먼저 처리하게 합니다.
        loader: inventoryLoader,
      },
    ],
  },
]);

export default function App() {
  // RouterProvider가 등록된 로더를 감시하며 페이지 이동 시 데이터를 먼저 확보합니다.
  return <RouterProvider router={router} />;
}
```

## 코드 해설

- `loader` 함수는 **컴포넌트 외부**에서 `export`로 정의한다. 라우터가 컴포넌트를 렌더링하기 전에 이 함수를 가로채서 실행할 수 있도록 하기 위함이다.
- `loader`가 에러를 `throw`하면 라우터는 해당 경로의 `errorElement`로 자동 전환한다.
- `useLoaderData()`는 로더가 반환한 데이터를 그대로 받아온다. `useState`와 `useEffect`의 조합이 통째로 불필요해진다.
- `createBrowserRouter` 설정의 각 경로 객체에 `loader` 속성을 추가하면 해당 경로 진입 시 자동으로 로더가 실행된다.

## 실무 비유

- **기존 방식(useEffect)**: 식당에 도착해 앉은 뒤 메뉴판을 보고 주문하는 것. 음식이 나올 때까지 빈 테이블에서 기다린다.
- **데이터 로더**: 집에서 출발할 때 이미 앱으로 주문을 넣어두는 것. 식당 문을 여는 순간 테이블에 이미 갓 조리된 음식이 놓여 있다.
- 무대 뒤에서 소품을 완벽하게 배치한 뒤 **커튼을 올리는 것**과 같아, 사용자는 떨리는 화면이나 로딩 바 없이 매끄러운 경험을 얻게 된다.

## 핵심 포인트

- 데이터 로더는 컴포넌트가 렌더링되기 **전에** 데이터를 미리 가져오는 프리페칭 기술이다
- `loader` 함수는 컴포넌트 외부에서 정의하고, `createBrowserRouter` 설정에서 경로에 연결한다
- `useLoaderData` 훅으로 미리 준비된 데이터를 즉시 사용할 수 있어, `useState`와 `useEffect` 조합이 불필요해진다
- 데이터가 준비될 때까지 이전 화면을 유지하다가 한 번에 전환되므로 로딩 스피너 없는 매끄러운 UX가 가능하다

## 자가 점검

- [ ] `useEffect` 없이 `useLoaderData`만으로 데이터를 화면에 즉시 뿌려주었는가?
- [ ] `createBrowserRouter` 설정 내에 `loader` 함수를 성공적으로 등록했는가?
- [ ] 데이터가 준비될 때까지 이전 화면이 유지되다가 한 번에 바뀌는 '매끄러움'을 확인했는가?
- [ ] 네트워크 탭에서 속도를 'Slow 3G'로 설정하고 테스트했을 때, 기존 방식과의 차이를 체감했는가?
