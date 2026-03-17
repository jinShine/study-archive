# 47강. React Router v7 기초 — SPA의 한계를 넘는 라우팅 시스템

## 도입

지금까지 우리는 12가지 리액트 훅을 정복하며 컴포넌트 내부 로직을 설계하는 마이크로(Micro)한 관점의 전문가가 되었다. 하지만 실제 서비스는 단 하나의 화면에 머무르지 않는다. 사용자는 상품 목록에서 상세 페이지로 이동하고, 뒤로 가기 버튼을 누르며 여러 세계를 넘나든다.

이번 섹션에서는 우리 앱에 생명력 있는 '길'을 만들어주는 기술인 라우팅(Routing)을 심도 있게 다뤄본다.

## 개념 설명

### SPA와 라우팅의 본질: 왜 라우터가 필요한가?

우리가 만드는 리액트 앱은 SPA(Single Page Application) 방식을 취한다. 전통적인 웹사이트와 무엇이 다른지 먼저 이해해야 한다.

- **MPA (Traditional)**: 메뉴를 클릭할 때마다 서버에 새 HTML을 요청한다. 화면이 깜빡이며 전체가 새로고침된다.
- **SPA (Modern)**: 단 하나의 HTML(index.html)만 존재한다. 리액트가 자바스크립트로 필요한 부품(컴포넌트)만 갈아 끼운다. 서버 요청이 없으니 전환이 비정상적으로 빠르다.
- **문제점**: 화면은 바뀌는데 URL 주소창은 그대로다. 페이지 공유도 안 되고, 뒤로 가기 버튼도 먹통이 된다.

**해결책**: 화면의 변화와 URL의 변화를 하나로 동기화해 주는 도구, 바로 **React Router**이다.

### React Router v7의 세 가지 정체성

2026년 현재 표준인 v7은 프로젝트 규모와 목적에 따라 세 가지 모드를 지원한다. 기초 체력을 기르기 위해 우리는 가장 직관적인 **선언적 모드**로 시작한다.

- **프레임워크 모드**: 빌드 도구와 서버까지 포함된 전체 프레임워크 방식이다. 고도의 SSR 최적화가 필요할 때 선택한다.
- **데이터 모드**: 자바스크립트 객체 형태로 모든 경로를 미리 정의하여 로딩 성능을 극대화하는 방식이다. 대규모 프로젝트의 표준이다.
- **선언적 모드**: 우리가 이번 강의에서 채택할 방식으로, 컴포넌트(`Routes`, `Route`)를 사용하여 리액트의 기본 원리에 충실하게 화면을 설계한다.

### BrowserRouter — 애플리케이션에 '센서' 달기

라우팅의 첫 번째 퍼즐 조각은 `BrowserRouter`이다. 이 컴포넌트는 앱 전체의 URL 변화를 실시간으로 감시하는 거대한 센서와 같다.

- **설치**: `npm install react-router` (v7부터는 `-dom`이 붙지 않은 단일 패키지가 표준이다.)
- **역할**: 브라우저의 History API를 활용해 페이지 새로고침 없이 주소창의 텍스트만 영리하게 바꾼다.

## 코드 예제

### Step 1: 앱의 뿌리에 라우팅 시스템 주입 (main.jsx)

App 컴포넌트를 가장 바깥에서 감싸주어, 하위 어떤 컴포넌트에서도 주소 정보에 접근할 수 있게 한다.

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router'; // v7 최신 표준 패키지
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter는 앱 전체의 주소 상태를 관리하는 뿌리 역할을 합니다. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

### Step 2: 주소별 지도 그리기 (App.jsx)

`Routes`는 현재 주소와 일치하는 단 하나의 길을 찾는 필터이며, `Route`는 목적지를 가리키는 표지판이다.

```jsx
import { Routes, Route } from 'react-router';
// 주의: 페이지 컴포넌트들은 src/pages 폴더 안에 생성되어야 합니다.
import InventoryPage from './pages/InventoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LogPage from './pages/LogPage';

function App() {
  return (
    <div className="app-container">
      {/* Routes는 현재 브라우저 주소와 매칭되는 단 하나의 Route만 렌더링합니다. */}
      <Routes>
        {/* '/' 경로는 앱의 시작점(홈)을 의미하며 index 속성으로 표현합니다. */}
        <Route index element={<InventoryPage />} />

        {/* 주소창이 '/analytics'가 되면 AnalyticsPage 컴포넌트가 나타납니다. */}
        <Route path="analytics" element={<AnalyticsPage />} />

        {/* 주소창이 '/logs'가 되면 시스템 로그를 보여주는 LogPage가 나타납니다. */}
        <Route path="logs" element={<LogPage />} />
      </Routes>
    </div>
  );
}

export default App;
```

## 코드 해설

### 왜 `<a>` 태그를 쓰면 안 되는가?

전통적인 `<a>` 태그를 클릭하는 순간 브라우저는 이를 완전히 새로운 페이지로의 이동이라 착각하고 전체 페이지를 새로고침하며 서버에 파일을 다시 요청한다.

- **치명적인 단점**: 페이지가 새로고침되면 우리가 공들여 쌓아온 리액트의 State나 변수 데이터가 모두 초기화되어 날아가 버린다.
- **해결책**: SPA의 이점을 유지하며 주소만 바꾸는 라우터 전용 도구인 `Link`를 사용해야 한다.

## 실무 비유

- `BrowserRouter`는 건물 전체에 설치된 **중앙 통제 센서**다. 모든 출입문(URL)의 변화를 실시간으로 감지하고 기록한다.
- `Routes`는 **교통 관제사**로, 현재 주소를 보고 단 하나의 올바른 길만 열어준다.
- `Route`는 각 방에 붙어 있는 **이름표**이며, `element` 속성이 그 방 안에 들어 있는 가구(컴포넌트)를 결정한다.

## 핵심 포인트

- React Router v7은 프레임워크/데이터/선언적 세 가지 모드를 지원하며, 기초 학습에는 선언적 모드를 사용한다
- `BrowserRouter`는 앱 전체를 감싸서 URL 변화를 감시하는 최상위 센서 역할을 한다
- `Routes`는 현재 주소와 매칭되는 단 하나의 `Route`만 렌더링하는 필터다
- SPA에서 `<a>` 태그를 사용하면 전체 페이지가 새로고침되어 State가 초기화되므로, 반드시 `Link`를 사용해야 한다
- 설치 명령어: `npm install react-router` (v7부터 단일 패키지)

## 자가 점검

- [ ] `npm install react-router` 명령어로 최신 v7 라이브러리를 설치했는가?
- [ ] `main.jsx`에서 App 컴포넌트를 `BrowserRouter`로 감싸주었는가?
- [ ] `Routes`와 `Route`의 관계(필터와 표지판)를 이해했는가?
- [ ] 브라우저 주소창 뒤에 `/analytics`를 직접 입력했을 때 `AnalyticsPage`로 화면이 잘 바뀌는가?
