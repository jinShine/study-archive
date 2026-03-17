# 48강. 중첩 라우팅(Nested Routes) -- Outlet을 활용한 레이아웃 설계

## 도입

기초에서는 각 방에 이름표를 붙이는 기초를 배웠다. 하지만 방을 옮길 때마다 화면 전체가 깜빡이며 교체되는 점이 아쉬웠다.

이번에는 리액트 라우터의 정수이자 실무 아키텍처의 핵심인 중첩 라우팅(Nested Routes)과 `Outlet`을 사용하여, 상단 바나 사이드바는 고정된 채 중앙의 컨텐츠만 부드럽게 바뀌는 공통 레이아웃 시스템을 구축해 본다.

## 개념 설명

중첩 라우팅의 핵심은 "무엇이 변하고, 무엇이 변하지 않는가"를 구분하는 것이다.

- **변하지 않는 것(Layout)**: 미술관 건물의 벽, 조명, 복도. 페이지를 이동해도 이 요소들은 메모리상에 그대로 유지된다.
- **변하는 것(Outlet)**: 벽에 걸린 액자 속 그림. 주소가 바뀌면 리액트 라우터는 `Outlet` 자리에 있는 그림만 갈아 끼운다.

## 코드 예제

### 공통 레이아웃과 액자 틀 (Layout.jsx)

```jsx
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '20px', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
          <h2>Admin Dashboard</h2>
        </header>

        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          {/* Outlet: 현재 주소와 일치하는 자식 컴포넌트가 이 자리에 갈아 끼워진다. */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

### 활성화 상태를 감지하는 메뉴 (Sidebar.jsx)

```jsx
import { NavLink } from 'react-router';

export default function Sidebar() {
  const getStyle = ({ isActive }) => ({
    display: 'block',
    padding: '12px 20px',
    marginBottom: '8px',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'all 0.2s',
    backgroundColor: isActive ? '#2563eb' : 'transparent',
    color: isActive ? 'white' : '#475569',
    boxShadow: isActive ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
  });

  return (
    <nav style={{ width: '260px', padding: '20px', background: 'white', borderRight: '1px solid #e2e8f0' }}>
      <h3 style={{ marginBottom: '30px' }}>Menu</h3>
      <NavLink to="/" style={getStyle}>인벤토리 관리</NavLink>
      <NavLink to="/analytics" style={getStyle}>데이터 분석</NavLink>
      <NavLink to="/logs" style={getStyle}>시스템 로그</NavLink>
    </nav>
  );
}
```

### 중첩 라우팅 지도 그리기 (App.jsx)

```jsx
import { Routes, Route } from 'react-router';
import Layout from './components/Layout';
import InventoryPage from './pages/InventoryPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  return (
    <Routes>
      {/* 1. 최상위 경로를 Layout 컴포넌트로 잡는다. */}
      <Route path="/" element={<Layout />}>
        {/* 2. 자식 라우트들은 부모의 Outlet 자리에 렌더링된다. */}
        <Route index element={<InventoryPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>
    </Routes>
  );
}
```

## 코드 해설

- `Layout` 컴포넌트 안의 `<Outlet />`이 자식 컴포넌트가 교체될 예약석 역할을 한다.
- `Route`를 중첩(Nesting)하여 부모-자식 관계를 설정하면, 부모의 `Outlet` 위치에 자식이 렌더링된다.
- `<a>` 태그 대신 `Link`나 `NavLink`를 써야만 SPA의 부드러움을 유지할 수 있다.

## 실무 비유

중첩 라우팅은 미술관의 액자 시스템과 같다. 미술관 건물(Layout)은 그대로 두고, 벽에 걸린 액자 속 그림(Outlet의 자식 컴포넌트)만 교체한다. 건물을 허물고 새로 짓는 것(새로고침)이 아니라 액자만 바꾸는 것(컴포넌트 교체)이므로 매우 효율적이다.

## 핵심 포인트

- `Layout.jsx` 내부의 `<Outlet />`이 자식 컴포넌트의 예약석이다.
- `Route`를 중첩 구조로 설정하여 공통 레이아웃을 유지하면서 내부 컨텐츠만 교체할 수 있다.
- `NavLink`의 `isActive`를 활용해 현재 메뉴를 시각적으로 강조할 수 있다.

## 자가 점검

- [ ] `Layout.jsx` 내부에서 `<Outlet />`이 자식 컴포넌트의 예약석임을 이해했는가?
- [ ] `App.jsx`에서 `Route`를 중첩(Nesting)하여 부모-자식 관계를 설정했는가?
- [ ] `NavLink`의 `isActive`를 활용해 현재 메뉴를 시각적으로 표시했는가?
- [ ] 페이지를 이동할 때마다 사이드바의 색상이 자연스럽게 변하는지 확인했는가?
