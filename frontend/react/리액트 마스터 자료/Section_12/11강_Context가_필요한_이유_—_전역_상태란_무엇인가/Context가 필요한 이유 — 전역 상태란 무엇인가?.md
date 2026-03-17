# 11강. Context가 필요한 이유 — 전역 상태란 무엇인가?

## 도입

10강에서 Props Drilling의 문제를 확인했다. 데이터를 여러 층을 거쳐 전달하면 중간 컴포넌트들이 불필요하게 오염된다. 이 문제를 해결하기 위해 등장하는 것이 **전역 상태(Global State)**와 **Context API**다. "한 컴포넌트의 소유가 아니라 앱 전체가 알아야 하는 데이터"를 어떻게 다뤄야 할지를 배운다.

## 개념 설명

**전역 상태(Global State)**란 특정 컴포넌트 하나가 아닌, 앱 전체 혹은 여러 컴포넌트가 공유해야 하는 데이터를 말한다. 대표적인 예시로 로그인한 사용자 정보, 테마 설정(다크모드 등), 언어 설정 등이 있다.

Props Drilling 방식에서는 이 전역 데이터를 최상위에서 최하위까지 줄줄이 전달해야 했다. Context API는 이 문제를 해결하기 위해, 중간 컴포넌트를 건너뛰고 **필요한 곳에서 직접 데이터를 꺼내 쓸 수 있는 메커니즘**을 제공한다.

**Props Drilling 구조 (4단계 전달):**
- `App` (소유자) → `Content` (전달자 1) → `ProductPage` (전달자 2) → `ProductLayout` (전달자 3) → `ProductList` (소비자)

## 코드 예제

### 최종 소비자 (ProductList)

```jsx
export function ProductList({ user }) {
  return (
    <div style={{ padding: '10px', border: '2px solid #4f46e5', backgroundColor: '#eef2ff' }}>
      <h4>ProductList (Consumer)</h4>
      <p>현재 사용자: <strong>{user.name}</strong></p>
      <p>관리자 여부: {user.isAdmin ? "예" : "아니오"}</p>
    </div>
  );
}
```

### 중간 전달자(Pipe) 컴포넌트들

```jsx
// ProductLayout (전달자 3)
import { ProductList } from './ProductList';

export function ProductLayout({ user }) {
  return (
    <div style={{ border: '1px solid #cbd5e1', padding: '10px', margin: '10px' }}>
      <h5>ProductLayout (Pipe)</h5>
      <ProductList user={user} />
    </div>
  );
}
```

```jsx
// ProductPage (전달자 2)
import { ProductLayout } from './ProductLayout';

export function ProductPage({ user }) {
  return (
    <div style={{ border: '1px solid #94a3b8', padding: '10px', margin: '10px' }}>
      <h5>ProductPage (Pipe)</h5>
      <ProductLayout user={user} />
    </div>
  );
}
```

```jsx
// Content (전달자 1)
import { ProductPage } from './ProductPage';

export function Content({ user }) {
  return (
    <div style={{ border: '1px solid #64748b', padding: '10px', margin: '10px' }}>
      <h5>Content (Pipe)</h5>
      <ProductPage user={user} />
    </div>
  );
}
```

### 전역 상태 소유자 (App)

```jsx
import React from 'react';
import { Content } from './components/Content';

export default function App() {
  // 전역 상태 정의 (스마트폰의 '다크모드 설정'과 같은 존재)
  const user = {
    name: "chulsoo",
    isAdmin: true,
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#4f46e5' }}>전역 상태 소유자 (App)</h1>
      <p>user 데이터가 아래로 4단계나 내려갑니다.</p>
      <hr />
      {/* 기나긴 Props Drilling의 시작점 */}
      <Content user={user} />
    </div>
  );
}
```

## 코드 해설

- 모든 중간 컴포넌트의 함수 정의에 `{ user }`가 포함되어 있다. 이들은 `user`가 누군지 관심이 없지만, 자식에게 전달하기 위해 자신의 인터페이스(매개변수)를 오염시켜야만 한다.
- `App`의 `user` 값은 한 컴포넌트의 소유가 아니라 앱 전체가 알아야 하는 **전역 상태**다.
- `<Content user={user} />`는 직접 `ProductList`에 줄 방법이 없어, 가장 가까운 자식에게 전달을 부탁하는 비극적인 시작점이다.

## 실무 비유

**기존 방식(Props Drilling):** 사장님이 신입 사원에게 전달할 "로그인 토큰"을 중간 관리자(부장, 과장, 대리)를 모두 불러서 한 명 한 명 손에 쥐여주는 방식이다. 중간 관리자들은 자기 일 하기도 바쁜데, 하루 종일 종이 한 장을 들고 있어야 한다.

**새로운 방식(Context API):** 사장님이 회사 게시판(Context)에 정보를 딱 붙여두는 것이다. 그러면 중간 관리자들은 손이 자유로워지고, 신입 사원은 필요할 때 게시판에 가서 직접 확인하면 된다.

## 핵심 포인트

| 구분 | Props Drilling | Context API |
|------|---------------|-------------|
| 전달 방식 | 유선(줄줄이 연결) | 무선(브로드캐스팅) |
| 중간 컴포넌트 | 데이터 파이프로 전락 | 자신의 역할에만 집중 |
| 유지보수 | 이름 변경 시 모든 파일 수정 | 소유자와 소비자만 수정 |
| 재사용성 | 특정 props에 의존하여 낮음 | 독립적인 구조로 높음 |

## 자가 점검

- [ ] 전역 상태(Global State)란 무엇이며, 어떤 데이터가 전역 상태에 해당하는지 예를 들 수 있는가?
- [ ] Props Drilling에서 중간 컴포넌트가 데이터를 사용하지 않으면서도 전달해야 하는 구조적 문제를 설명할 수 있는가?
- [ ] Context API가 Props Drilling의 어떤 문제를 해결하는지 비유를 통해 설명할 수 있는가?
- [ ] 데이터 속성 이름이 바뀔 때, Props Drilling 방식과 Context 방식의 수정 범위 차이를 비교할 수 있는가?
