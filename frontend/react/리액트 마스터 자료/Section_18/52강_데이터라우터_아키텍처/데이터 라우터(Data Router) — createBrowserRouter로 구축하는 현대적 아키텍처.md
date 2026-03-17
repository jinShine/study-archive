# 52강. 데이터 라우터(Data Router) — createBrowserRouter로 구축하는 현대적 아키텍처

## 도입

지금까지 우리는 `BrowserRouter`를 사용해 왔다. 하지만 실제 서비스에서 페이지 이동 직후 마주하는 '텅 빈 화면'과 '로딩 스피너'는 사용자 경험을 저해하는 고질적인 문제이다.

이번 강의에서는 2026년 현재 리액트 라우터 v7의 표준이자, 페이지가 뜨기 전 데이터를 미리 확보할 수 있는 최신 엔진인 **데이터 라우터(Data Router)**로 우리 앱의 아키텍처를 완전히 업그레이드해 본다.

## 개념 설명

### 선언적 방식 vs 데이터 라우터 방식

- **기존 방식 (JSX/선언적)**: 종이 지도를 들고 각 건물(컴포넌트)을 직접 찾아가서 내부 표지판을 보고 다음 길을 찾는 방식이다. 직관적이지만 길을 떠나기 전 교통 상황(데이터)을 미리 알 수 없다.
- **데이터 라우터 (Object)**: 중앙 관제실의 디지털 GPS 시스템이다. 전체 경로를 한눈에 파악하고 있으므로, 사용자가 도착하기 전에 필요한 물자(데이터)를 미리 보내두는 데이터 로더(Data Loader) 기능을 사용할 준비가 된 것이다.

### 핵심 변경 사항

- `createBrowserRouter` 함수로 자바스크립트 객체 형태의 경로 설정을 생성한다
- `RouterProvider`에 생성한 라우터를 전달하여 앱에 주입한다
- `main.jsx`에서 기존의 `<BrowserRouter>` 감싸기가 **더 이상 필요하지 않다**

## 코드 예제

### Step 1: 중앙 집중식 경로 설계 (App.jsx)

기존의 JSX 방식 대신 `createBrowserRouter` 함수를 사용하여 자바스크립트 객체 형태로 지도를 그린다.

```jsx
import { createBrowserRouter, RouterProvider } from 'react-router';
import Layout from './components/Layout';
import InventoryPage from './pages/InventoryPage';
import AnalyticsPage from './pages/AnalyticsPage';

// 1. 모든 경로를 하나의 객체 배열 안에서 중앙 관리합니다.
// 이 방식은 컴포넌트가 렌더링되기 전에 라우터가 전체 지도를 파악하게 해줍니다.
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // 건물의 외벽과 복도
    children: [
      {
        index: true, // 메인 로비 (부모 주소로 들어왔을 때 기본 화면)
        element: <InventoryPage />,
      },
      {
        path: "analytics", // 건물 내부의 특정 사무실
        element: <AnalyticsPage />,
      },
    ],
  },
]);

export default function App() {
  // 2. RouterProvider에 생성한 router를 전달하여 시스템을 주입합니다.
  return <RouterProvider router={router} />;
}
```

### Step 2: 환경 정리 및 독립 엔진 가동 (main.jsx)

데이터 라우터를 사용하면 라우팅의 주도권이 컴포넌트 내부가 아닌 '라우터 객체'로 넘어온다.

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 중요: 더 이상 <BrowserRouter>로 감싸지 않습니다. */}
    {/* App 컴포넌트 내부의 RouterProvider가 그 역할을 대신합니다. */}
    <App />
  </React.StrictMode>
);
```

## 코드 해설

- `createBrowserRouter([...])` 함수는 자바스크립트 객체 배열을 받아 라우터 인스턴스를 생성한다. 각 객체는 `path`, `element`, `children` 등의 속성으로 경로를 정의한다.
- `RouterProvider`는 생성된 라우터 인스턴스를 받아 앱 전체에 라우팅 시스템을 주입한다. 기존의 `BrowserRouter` 역할을 완전히 대체한다.
- `children` 배열로 중첩 라우팅을 구현하며, `index: true`는 부모 경로로 접근했을 때 기본으로 보여줄 자식을 지정한다.
- 이 객체 기반 설정 방식이 데이터 로더(loader), 에러 바운더리(errorElement) 등 고급 기능의 기반이 된다.

## 실무 비유

- 기존 `BrowserRouter` + JSX 방식은 **종이 지도를 들고 직접 걸어 다니는 것**과 같다. 직관적이지만 미리 준비할 수 없다.
- `createBrowserRouter`는 **중앙 관제실의 디지털 GPS**다. 전체 경로를 미리 파악하고 있으므로, 목적지에 도착하기 전에 필요한 데이터를 선제적으로 준비할 수 있다.

## 핵심 포인트

- `createBrowserRouter`는 자바스크립트 객체 기반으로 경로를 설계하는 현대적 방식이다
- `RouterProvider`가 `BrowserRouter`를 대체하므로, `main.jsx`에서 `BrowserRouter` 감싸기를 제거해야 한다
- 객체 기반 설정은 데이터 로더(loader), 에러 바운더리(errorElement) 등 고급 기능의 필수 기반이다
- 경로 간의 관계(중첩, 인덱스 등)를 `children` 배열로 한눈에 파악할 수 있다

## 자가 점검

- [ ] `createBrowserRouter`를 사용하여 객체 기반으로 경로를 설계했는가?
- [ ] `RouterProvider`를 통해 앱에 라우팅 엔진을 성공적으로 주입했는가?
- [ ] `main.jsx`에서 기존의 `BrowserRouter`를 깨끗하게 제거했는가?
- [ ] 객체 설정에서 경로의 컴포넌트를 바꿔보며, 파일 구조를 건드리지 않고도 경로 관리가 편해졌음을 체감했는가?
