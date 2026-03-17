# 51강. 프로그래밍 방식의 이동 — useNavigate로 조건부 페이지 전환 구현하기

## 도입

지난 강의에서 우리는 주소창 뒤에 붙는 쿼리 스트링을 통해 사용자의 필터링 조건을 주소창에 박제하고 공유하는 기술을 배웠다. 이제 우리 앱은 원하는 페이지를 찾아가고 상세 데이터를 필터링하는 기능까지 갖추었지만, 여전히 중요한 퍼즐이 하나 남아있다.

바로 사용자가 버튼을 직접 클릭하지 않더라도 **특정한 로직이 끝났을 때 코드가 스스로 페이지를 이동시켜야 하는 상황**이다. 이번 강의에서는 코드 한 줄로 페이지의 흐름을 자유자재로 통제하는 **useNavigate** 훅을 마스터해 본다.

## 개념 설명

### Link vs useNavigate의 구분 기준

실무에서 이 두 도구를 구분하는 기준은 **'누가 주도권을 쥐고 있는가'**에 있다.

- **Link (에스컬레이터)**: 사용자가 직접 발을 디뎌 이동한다. 능동적인 클릭이 발생할 때만 작동한다.
- **useNavigate (엘리베이터 자동 제어)**: 시스템이 상황을 판단하여 내리는 명령이다. 화재 감지 시 1층으로 강제 이동시키듯, 개발자가 작성한 자바스크립트 로직이라는 지휘관이 사용자를 최적의 위치로 보낸다.

### replace 옵션

로그인 페이지에서 메인으로 갈 때 `replace: true`를 쓰지 않으면, 메인에서 뒤로 가기를 눌렀을 때 다시 로그인 창이 나오는 어색한 UX가 발생한다. `replace`는 기록을 덮어써서 보안과 세련된 UX를 동시에 잡는 핵심 기술이다.

### 숫자 인자 활용

`navigate(-1)`은 브라우저의 뒤로 가기와 동일하게 작동한다. 주소를 일일이 기억할 필요 없이 사용자가 왔던 길을 되짚어 가게 하는 친절한 안내원 역할을 한다.

## 코드 예제

### Step 1: 라우팅 지도 설정 (App.jsx)

먼저 사용자가 이동할 수 있는 경로들을 정의한다.

```jsx
import { Routes, Route } from 'react-router';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Routes>
      {/* 기본 경로는 대시보드로, /login 경로는 로그인 페이지로 연결합니다. */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
```

### Step 2: useNavigate를 활용한 조건부 이동 (LoginPage.jsx)

`useNavigate`를 호출하여 반환받은 함수는 브라우저의 방문 기록인 히스토리 스택을 조작하는 정교한 기능을 수행한다.

```jsx
import { useNavigate } from 'react-router';

export default function LoginPage() {
  // 1. navigate 함수는 호출되는 순간 주소창과 라우터 상태를 동기화합니다.
  const navigate = useNavigate();

  const handleLogin = async () => {
    console.log("로그인 프로세스 시작...");

    // 2. 비동기 작업: 서버 응답을 기다리는 1초의 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 3. 성공 시 메인으로 이동하되, { replace: true } 옵션을 사용합니다.
    // 현재의 로그인 페이지 기록을 지우고 메인 페이지로 덮어씁니다.
    navigate('/', { replace: true });

    alert("인증에 성공하였습니다. 대시보드로 진입합니다.");
  };

  return (
    <div>
      <h2>SYSTEM ACCESS</h2>
      <button onClick={handleLogin}>
        LOGIN TO DASHBOARD
      </button>
    </div>
  );
}
```

## 코드 해설

- `useNavigate()`는 함수를 반환하며, 이 함수를 호출하면 프로그래밍 방식으로 페이지를 전환할 수 있다.
- `navigate('/', { replace: true })`에서 `replace: true`는 현재 히스토리 항목을 **덮어쓰기**한다. 뒤로 가기를 눌러도 로그인 페이지로 돌아가지 않는다.
- `async/await`와 결합하면 서버 인증 같은 비동기 작업이 완료된 후 안전하게 이동할 수 있다.
- `navigate(-1)`은 브라우저의 뒤로 가기 버튼과 동일한 효과를 낸다. 상세 페이지에서 '이전 목록으로 돌아가기' 버튼 구현에 자주 사용된다.

## 실무 비유

- **Link**는 에스컬레이터다. 사용자가 직접 발을 올려야 움직인다.
- **useNavigate**는 엘리베이터 자동 제어 시스템이다. 화재(인증 실패) 시 1층(로그인 페이지)으로 강제 이동시키고, 정상 상태면 목적 층(대시보드)으로 보낸다.
- `replace: true`는 **엘리베이터의 층 기록을 지우는 것**과 같다. 올라온 경로를 기록하지 않으므로 뒤로 가기를 눌러도 이전 층으로 돌아가지 않는다.

## 핵심 포인트

- `Link`는 사용자의 클릭용, `useNavigate`는 시스템의 로직용이다
- `navigate(경로, { replace: true })`는 히스토리를 덮어써서 뒤로 가기를 방지한다
- `navigate(-1)`로 브라우저의 뒤로 가기와 동일한 동작을 코드로 구현할 수 있다
- `async/await`와 결합하여 비동기 작업 완료 후 안전하게 이동하는 패턴이 실무의 표준이다

## 자가 점검

- [ ] `Link`는 사용자의 클릭용, `useNavigate`는 시스템의 로직용임을 이해했는가?
- [ ] `async/await`와 결합하여 비동기 작업 완료 후 안전하게 이동하는 패턴을 익혔는가?
- [ ] `replace: true` 옵션이 브라우저 히스토리 스택을 어떻게 조작하는지 파악했는가?
- [ ] `navigate(-1)`을 사용하여 상세 페이지에서 '이전 목록으로 돌아가기' 버튼을 구현할 수 있는가?
