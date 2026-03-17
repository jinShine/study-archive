# 10강. Props Drilling의 문제점 — 데이터가 깊이 내려갈 때 생기는 피로감

## 도입

React에서 데이터는 부모에서 자식으로 props를 통해 전달된다. 하지만 데이터가 실제로 필요한 컴포넌트가 트리의 깊은 곳에 있다면, 중간 컴포넌트들이 자신은 쓰지도 않는 데이터를 단순히 전달만 해야 하는 상황이 발생한다. 이것이 바로 **Props Drilling** 문제다.

## 개념 설명

Props Drilling이란 최상위 컴포넌트가 가진 데이터를 최하위 컴포넌트에 전달하기 위해, 중간에 있는 모든 컴포넌트가 해당 데이터를 props로 받아서 다시 아래로 넘기는 현상을 말한다.

**핵심 구조:**
- `App` (데이터 소유자) → `Layout` (전달자 1) → `Sidebar` (전달자 2) → `UserPanel` (전달자 3) → `UserName` (최종 소비자)

중간 컴포넌트인 Layout, Sidebar, UserPanel은 `user` 데이터를 직접 사용하지 않으면서도, 자식에게 전달하기 위해 props 인터페이스를 오염시켜야 한다.

## 코드 예제

### 최종 소비자 컴포넌트 (UserName)

```jsx
import React from 'react';

// 트리의 가장 깊은 곳에서 실제로 데이터를 사용하는 유일한 컴포넌트
export function UserName({ user }) {
  return (
    <div style={{
      padding: '10px',
      border: '2px solid #4caf50',
      borderRadius: '8px',
      backgroundColor: '#f0fff0'
    }}>
      <h4>최종 소비자 (UserName)</h4>
      <p>반갑습니다, <strong>{user.name}</strong>님!</p>
    </div>
  );
}
```

### 중간 전달자 컴포넌트들

```jsx
// UserPanel (전달자 3)
import { UserName } from './UserName';

export function UserPanel({ user }) {
  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', margin: '10px' }}>
      <h5>UserPanel (전달 중...)</h5>
      {/* 본인은 user가 필요 없지만 자식을 위해 넘겨준다 */}
      <UserName user={user} />
    </div>
  );
}
```

```jsx
// Sidebar (전달자 2)
import { UserPanel } from './UserPanel';

export function Sidebar({ user }) {
  return (
    <aside style={{ padding: '10px', border: '1px solid #bbb', margin: '10px' }}>
      <h4>Sidebar (전달 중...)</h4>
      <UserPanel user={user} />
    </aside>
  );
}
```

```jsx
// Layout (전달자 1)
import { Sidebar } from './Sidebar';

export function Layout({ user }) {
  return (
    <main style={{ padding: '10px', border: '1px solid #999' }}>
      <h2>Layout (전달 중...)</h2>
      <Sidebar user={user} />
    </main>
  );
}
```

### 데이터 소유자 (App)

```jsx
import React from 'react';
import { Layout } from './components/Layout';

export default function App() {
  // 전역 데이터
  const user = {
    name: "철수",
    id: "user-001",
    isAdmin: true,
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#4f46e5' }}>App (데이터 소유자)</h1>
      <p>데이터가 여기서부터 가장 깊은 곳까지 먼 여행을 시작합니다.</p>
      <hr />
      {/* 여기서부터 Props Drilling이 시작된다 */}
      <Layout user={user} />
    </div>
  );
}
```

## 코드 해설

- **UserName**은 택배를 실제로 뜯어서 물건을 사용하는 **최종 수령인**이다. 하지만 이 물건을 받기까지 위층의 모든 이웃을 거쳐야 한다는 점이 문제의 핵심이다.
- **Layout, Sidebar, UserPanel**은 택배 상자의 내용물에는 관심이 없지만, 배달을 완료하기 위해 계속 들고 있어야 하는 **중간 배달원**들이다. 이들은 배달 업무 때문에 다른 일을 하기 번거로워진 상태다.
- **App**은 데이터의 출발점이다. 직접 `UserName`에 줄 방법이 없어, 가장 가까운 자식에게 전달을 부탁하는 비극적인 시작점이다.

## 실무 비유

사장님이 신입 사원에게 전달할 "로그인 토큰"을 중간 관리자(부장, 과장, 대리)를 모두 불러서 한 명 한 명 손에 쥐여주는 방식이다. 중간 관리자들은 자기 일 하기도 바쁜데, 하루 종일 종이 한 장을 들고 있어야 한다.

만약 `user` 객체의 속성 이름이 `name`에서 `userName`으로 바뀐다면, App 포함 5개 파일 모두를 수정해야 한다. 이것이 Props Drilling이 유지보수성을 떨어뜨리는 결정적인 이유다.

## 핵심 포인트

| 문제 | 설명 |
|------|------|
| 인터페이스 오염 | 중간 컴포넌트들이 필요 없는 props를 받아야 한다 |
| 유지보수 비용 | 데이터 구조가 바뀌면 모든 경로의 파일을 수정해야 한다 |
| 재사용성 저하 | 특정 props에 의존하게 되어 컴포넌트의 독립성이 깨진다 |
| 관심사 혼재 | UI 레이아웃만 담당해야 할 컴포넌트가 데이터 전달까지 맡게 된다 |

## 자가 점검

- [ ] Props Drilling이란 무엇이며, 왜 발생하는지 설명할 수 있는가?
- [ ] 중간 컴포넌트들이 데이터를 직접 사용하지 않으면서도 props를 받아야 하는 구조를 이해했는가?
- [ ] 데이터 속성 이름이 바뀔 때 수정해야 할 파일의 범위를 파악할 수 있는가?
- [ ] Props Drilling이 유지보수성과 재사용성에 미치는 영향을 설명할 수 있는가?
