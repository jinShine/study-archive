# 54강. 에러 바운더리(Error Boundaries)와 리다이렉트(Redirects) — 안정적인 라우팅을 위한 방어 코드 설계

## 도입

지난 강의에서 우리는 리액트 라우터 v7의 꽃인 데이터 로더를 통해 사용자가 페이지에 도착하기도 전에 데이터를 미리 준비하는 초고속 프리페칭 기술을 배웠다. 이제 우리 앱은 로딩 스피너 없는 쾌적한 속도를 자랑하게 되었다.

하지만 실제 서비스에서는 API 장애, 권한 없는 접근 등 예외 상황이 반드시 발생한다. 이번 강의에서는 이러한 상황에서도 앱이 하얗게 죽지 않도록 방어하는 **에러 바운더리(Error Boundaries)**와, 권한 없는 사용자를 즉시 돌려보내는 **리다이렉트(Redirects)** 패턴을 배운다.

## 개념 설명

### 에러 바운더리

데이터 로더가 실패하거나 컴포넌트 렌더링 중 자바스크립트 오류가 발생하면, 리액트 라우터는 즉시 일반 컴포넌트 대신 **에러 전용 컴포넌트(`errorElement`)**를 그 자리에 갈아 끼운다.

- 빌딩 50층에서 화재가 났을 때 건물 전체를 폐쇄하지 않고 **해당 층의 방화셔터만 내려** 불길을 차단하는 것과 같다.
- 덕분에 다른 층의 사람들은 안전하게 서비스를 계속 이용할 수 있다.

### 리다이렉트

`redirect` 함수는 컴포넌트가 그려지기도 전(로더 단계)에 응답을 가로채 항로를 변경한다.

- 위험한 구역(권한 없는 페이지)으로 들어오려는 사람을 발견 즉시 **안전한 비상구(로그인 페이지)**로 돌려보내는 가이드 역할이다.
- `useNavigate`와 달리 컴포넌트 렌더링 없이 **로더 단계에서 즉각 작동**한다.

## 코드 예제

### Step 1: 에러 상황을 감지하고 대응하는 에러 바운더리 (ErrorPage.jsx)

```jsx
import { useRouteError, Link } from 'react-router';

export default function ErrorPage() {
  // 1. useRouteError 훅은 라우터가 포착한 에러 정보를 객체 형태로 반환합니다.
  // 이 안에는 에러 상태(status)나 구체적인 메시지가 담겨 있습니다.
  const error = useRouteError();
  console.error("시스템 장애 감지:", error);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>System Interrupted</h2>
      <p>
        죄송합니다. 현재 요청하신 페이지를 처리하는 과정에서 예상치 못한 문제가 발생했습니다.
      </p>
      <p>에러 상태: {error.status || "Unknown Error"}</p>
      <Link to="/">BACK TO DASHBOARD</Link>
    </div>
  );
}
```

### Step 2: 라우터 설정에 방어벽과 리다이렉트 적용 (App.jsx)

`errorElement`를 최상위에 등록하여 모든 하위 경로의 사고를 방어하고, `redirect` 함수로 권한 없는 사용자의 접근을 원천 차단한다.

```jsx
import { createBrowserRouter, RouterProvider, redirect } from 'react-router';
import Layout from './components/Layout';
import ErrorPage from './pages/ErrorPage';
import InventoryPage, { inventoryLoader } from './pages/InventoryPage';

// 보안 로직이 추가된 로더입니다.
// redirect는 컴포넌트가 그려지기도 전(로더 단계)에 응답을 가로채 항로를 변경합니다.
export const protectedLoader = async () => {
  const isUserAuthenticated = false; // 실무에서는 세션이나 토큰을 확인합니다.

  if (!isUserAuthenticated) {
    // 사용자가 권한이 없다면 화면을 그리기 시도조차 하기 전에 주소를 꺾어버립니다.
    return redirect('/login');
  }
  return inventoryLoader();
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    // 최상위 루트에 설정하여 하위 모든 경로의 에러를 낚아채 앱 크래시를 방어합니다.
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <InventoryPage />,
        loader: protectedLoader, // 리다이렉트 보안 로직이 적용된 로더
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

## 코드 해설

- `useRouteError()` 훅은 라우터가 포착한 에러 정보(status, message 등)를 객체 형태로 반환한다. 에러의 원인과 상태 코드를 읽어내는 데 사용한다.
- `errorElement`를 최상위 Route에 배치하면, 해당 경로와 모든 하위 경로에서 발생하는 에러를 한 곳에서 처리한다. 앱 전체가 하얗게 죽는 것을 방지한다.
- `redirect('/login')`은 `useNavigate`와 달리 **로더 단계에서 즉각 작동**한다. 컴포넌트 렌더링 시도 자체를 하지 않고 주소를 변경한다.
- `protectedLoader`처럼 인증 확인 로직을 로더에 넣으면, 권한 없는 사용자가 페이지 깜빡임 없이 즉시 로그인 페이지로 리다이렉트된다.

## 실무 비유

- **에러 바운더리**는 빌딩의 **방화셔터 시스템**이다. 한 층에서 화재가 나도 건물 전체가 폐쇄되지 않고 해당 층만 격리된다.
- **리다이렉트**는 **보안 게이트**다. 출입증(인증 토큰)이 없는 사람이 접근하면 화면을 보여주기도 전에 즉시 로비(로그인 페이지)로 돌려보낸다.
- 대규모 서비스일수록 API 장애는 피할 수 없다. 이때 앱이 하얗게 죽는 대신 **"현재 정보를 불러올 수 없습니다"**라는 정중한 안내를 보여주는 것이 진정한 프로 개발자의 디테일이다.

## 핵심 포인트

- `errorElement`를 최상위 Route에 배치하면 하위 모든 경로의 에러를 한 곳에서 방어할 수 있다
- `useRouteError` 훅으로 발생한 에러의 원인과 상태 코드를 읽어낼 수 있다
- `redirect` 함수는 `useNavigate`와 달리 로더 단계에서 즉각 작동하여, 컴포넌트 렌더링 없이 주소를 변경한다
- 인증 확인 로직을 로더에 넣으면 권한 없는 접근을 화면 깜빡임 없이 즉시 차단할 수 있다

## 자가 점검

- [ ] `useRouteError` 훅을 통해 발생한 에러의 원인과 상태 코드를 읽어낼 수 있는가?
- [ ] `errorElement`를 최상위 라우트에 배치하여 앱 전체의 크래시를 방지했는가?
- [ ] `redirect` 함수가 `useNavigate`와 달리 로더 단계에서 즉각 작동함을 이해했는가?
- [ ] 로더 내부의 `isUserAuthenticated` 값을 `false`로 바꾸고 접속했을 때, 화면이 깜빡이지 않고 즉시 리다이렉트되는가?
