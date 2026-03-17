# 12강. Context 내부 구조 해부 — Provider, value, Consumer, useContext

## 도입

Props Drilling의 문제와 전역 상태의 필요성을 이해했다면, 이제 실제로 Context API의 내부 구조를 파헤쳐볼 차례다. 이번 강에서는 단순히 값을 넘기는 것을 넘어, **데이터와 함수를 한데 묶은 서비스 시스템**을 구축해본다. `createContext`, `Provider`, `useContext`가 각각 어떤 역할을 하는지 낱낱이 해부한다.

## 개념 설명

Context API의 구성 요소는 크게 세 가지다:

1. **`createContext(defaultValue)`** — 데이터가 흐를 통로(채널)를 생성한다. 인자로 넣는 값은 상위에 Provider가 없을 때 사용되는 **보험값(기본값)**이다.
2. **`<Context.Provider value={...}>`** — 하위 컴포넌트들에게 데이터를 공급(Broadcasting)하는 기지국 역할을 한다.
3. **`useContext(Context)`** — 하위 컴포넌트에서 기지국의 전파를 수신하는 안테나 역할을 한다. props 없이 직접 데이터를 꺼내 쓸 수 있다.

실무에서는 값 하나만 보내지 않는다. **데이터와 그 데이터를 바꾸는 함수를 세트로 묶어** 보내야 진정한 전역 관리 시스템이 된다.

## 코드 예제

### Context 생성 및 전용 Provider 구축

```jsx
import { createContext, useState } from "react";

// createContext의 인자는 '보험값'이다.
// 상위에 Provider가 없을 때만 이 문자열이 출력된다.
export const NoticeContext = createContext("현재 등록된 공지사항이 없습니다.");

export const CenterContext = createContext();

// 실무 패턴: 전용 Provider 컴포넌트를 만들어 로직을 은닉한다.
export function CenterProvider({ children }) {
  const [lostItems, setLostItems] = useState(["지갑", "에어팟"]);

  // 분실물 신고 기능
  const reportLost = (item) => setLostItems((prev) => [...prev, item]);

  // 물건 찾기 기능
  const claimItem = (item) => setLostItems((prev) => prev.filter((i) => i !== item));

  // 데이터와 기능을 하나의 객체로 묶어 전달한다.
  const systemValue = { lostItems, reportLost, claimItem };

  return (
    <CenterContext.Provider value={systemValue}>
      {children}
    </CenterContext.Provider>
  );
}
```

### 데이터를 사용하는 소비자들

```jsx
// NoticeBoard — 공지사항을 읽는 곳
import { useContext } from "react";
import { NoticeContext } from "../contexts/CenterContext";

export function NoticeBoard() {
  // 로비에 가서 공지사항 게시판을 직접 확인하는 행위
  const notice = useContext(NoticeContext);

  return (
    <div style={{ padding: '10px', background: '#fffbeb', border: '1px solid #f59e0b', marginBottom: '10px' }}>
      아파트 공지: {notice}
    </div>
  );
}
```

```jsx
// LostAndFoundDesk — 분실물을 신고하고 찾는 곳
import { useContext, useState } from "react";
import { CenterContext } from "../contexts/CenterContext";

export function LostAndFoundDesk() {
  // 전역 시스템에서 필요한 데이터와 기능을 구조 분해 할당으로 가져온다.
  const { lostItems, reportLost, claimItem } = useContext(CenterContext);
  const [inputText, setInputText] = useState("");

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
      <h2>분실물 센터</h2>
      <ul>
        {lostItems.map(item => (
          <li key={item}>
            {item} <button onClick={() => claimItem(item)}>찾아감</button>
          </li>
        ))}
      </ul>
      <input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="분실물 입력"
      />
      <button onClick={() => { reportLost(inputText); setInputText(""); }}>신고하기</button>
    </div>
  );
}
```

### 앱 전체에 시스템 주입하기

```jsx
import { CenterProvider, NoticeContext } from "./contexts/CenterContext";
import { NoticeBoard } from "./components/NoticeBoard";
import { LostAndFoundDesk } from "./components/LostAndFoundDesk";

export default function App() {
  return (
    <div style={{ padding: '40px' }}>
      <h1>스마트 아파트 관리 시스템</h1>

      {/* NoticeContext는 Provider 없이 '보험값'이 어떻게 나오는지 확인 */}
      <NoticeBoard />

      {/* CenterProvider로 감싸서 하위 컴포넌트들에 기능을 방송(Broadcasting) */}
      <CenterProvider>
        <LostAndFoundDesk />
      </CenterProvider>
    </div>
  );
}
```

## 코드 해설

- **`createContext("...")`:** `useContext`를 썼는데 상위에 Provider가 없다면, 앱이 죽지 않고 이 문자열을 보여준다. 에러 방지용 **보험**이다.
- **`systemValue`:** 실무에서는 데이터(`lostItems`)와 그 데이터를 바꾸는 함수(`reportLost`, `claimItem`)를 세트로 묶어 보낸다.
- **`useContext(CenterContext)`:** props를 통해 부모가 전달해주길 기다리지 않는다. 컴포넌트가 **능동적으로** 전역 시스템에 접속해 필요한 것만 골라온다.
- **`claimItem(item)`:** 자식 컴포넌트에서 버튼을 눌렀지만, 실제 데이터 수정은 전역 저장소(CenterProvider)에서 일어난다.
- **`<NoticeBoard />`:** NoticeContext.Provider로 감싸지 않았으므로, `createContext` 시 설정한 보험값 **"현재 등록된 공지사항이 없습니다."**가 화면에 나온다.

## 실무 비유

- **Provider**는 아파트 관리사무소의 **방송 기지국**이다. `value`에 담긴 정보와 기능들을 전파(Broadcasting)로 쏘아 올린다.
- **useContext**는 각 세대(컴포넌트)에 설치된 **무선 라디오**다. 기지국 주소(CenterContext)만 맞추면, 중간 벽(중간 컴포넌트)이 아무리 두꺼워도 선을 연결할 필요 없이 정보를 수신할 수 있다.

## 핵심 포인트

| 구성 요소 | 역할 | 비유 |
|-----------|------|------|
| `createContext` | 데이터 통로 생성 + 보험값 설정 | 방송 채널 개설 |
| `Provider` | 데이터를 하위 트리에 공급 | 방송 기지국 |
| `useContext` | 하위 컴포넌트에서 데이터 수신 | 무선 라디오 수신기 |
| `value` 객체 | 데이터 + 변경 함수를 묶어 전달 | 방송 콘텐츠 |

## 자가 점검

- [ ] `createContext`의 인자(기본값)가 어떤 상황에서 사용되는지 설명할 수 있는가?
- [ ] Provider가 없는 상태에서 `useContext`를 호출하면 어떤 일이 벌어지는지 이해했는가?
- [ ] `value`에 데이터와 함수를 함께 묶어 보내는 이유를 설명할 수 있는가?
- [ ] `useContext`로 데이터를 구조 분해 할당하여 필요한 것만 꺼내 쓸 수 있는가?
