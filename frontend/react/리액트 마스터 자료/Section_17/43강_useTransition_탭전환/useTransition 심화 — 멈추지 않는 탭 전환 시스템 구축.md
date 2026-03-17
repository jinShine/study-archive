# 43강. useTransition 심화 -- 멈추지 않는 탭 전환 시스템 구축

## 도입

`useTransition`이 이론을 넘어 실제 복잡한 탭 시스템에서 어떻게 '먹통 현상'을 해결하는지 확인한다. 가벼운 탭들과 의도적으로 부하를 준 무거운 대시보드 사이를 이동할 때, 리액트가 어떻게 사용자의 추가 클릭을 감지하고 무거운 작업을 중단(Interrupt)하는지 눈으로 직접 확인할 수 있게 설계되었다.

## 개념 설명

이 실습의 핵심은 '중단 가능성(Interruptibility)'이다.

- **클릭 가로채기**: 사용자가 '대시보드'를 누르면 `isPending`이 즉시 `true`가 되며 리액트는 뒤에서 대시보드를 그리기 시작한다.
- **작업 폐기**: 대시보드를 그리느라 CPU가 바쁜 와중에 사용자가 마음이 바뀌어 '홈'을 다시 누르면, 리액트는 진행 중이던 대시보드 연산을 즉시 쓰레기통에 버리고 '홈' 화면을 최우선으로 보여준다.
- **반응성 유지**: 이 과정에서 브라우저 메인 스레드는 멈추지 않는다. 탭 버튼의 호버 효과나 다른 상호작용이 여전히 부드럽게 작동한다.

## 코드 예제

### 무거운 대시보드 컴포넌트 (AdminDashboard.jsx)

```jsx
import { memo } from 'react';

const AdminDashboard = memo(() => {
  const items = Array.from({ length: 10000 }, (_, i) => `대시보드 리포트 데이터 #${i + 1}`);

  console.log("무거운 대시보드 렌더링 시작...");

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>관리자 상세 리포트 (방대함)</h3>
      <ul style={{ height: '400px', overflowY: 'auto', border: '1px solid #ddd' }}>
        {items.map((item, index) => (
          <li key={index} style={{ padding: '5px', fontSize: '12px' }}>{item}</li>
        ))}
      </ul>
    </div>
  );
});

export default AdminDashboard;
```

### 동시성 탭 컨테이너 엔진 (App.jsx)

```jsx
import { useState, useTransition } from 'react';
import HomeTab from './components/HomeTab';
import PostsTab from './components/PostsTab';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [tab, setTab] = useState('home');
  const [isPending, startTransition] = useTransition();

  const handleTabSelect = (nextTab) => {
    // 탭 전환 로직을 비긴급 작업으로 마킹한다.
    startTransition(() => {
      setTab(nextTab);
    });
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>동시성 탭 전환 시스템</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => handleTabSelect('home')}
          style={{ padding: '10px 20px', backgroundColor: tab === 'home' ? '#4f46e5' : '#eee', color: tab === 'home' ? 'white' : 'black' }}
        >홈</button>
        <button
          onClick={() => handleTabSelect('posts')}
          style={{ padding: '10px 20px', backgroundColor: tab === 'posts' ? '#4f46e5' : '#eee', color: tab === 'posts' ? 'white' : 'black' }}
        >게시판</button>
        <button
          onClick={() => handleTabSelect('admin')}
          style={{ padding: '10px 20px', backgroundColor: tab === 'admin' ? '#ef4444' : '#eee', color: tab === 'admin' ? 'white' : 'black' }}
        >대시보드 (무거움)</button>
      </div>

      <hr />

      <div style={{ height: '30px' }}>
        {isPending && <p style={{ color: '#4f46e5', fontWeight: 'bold' }}>백그라운드에서 화면을 구성 중입니다...</p>}
      </div>

      <main style={{
        opacity: isPending ? 0.4 : 1,
        transition: 'opacity 0.3s ease',
        pointerEvents: isPending ? 'none' : 'auto'
      }}>
        {tab === 'home' && <HomeTab />}
        {tab === 'posts' && <PostsTab />}
        {tab === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
}
```

## 코드 해설

- `startTransition`으로 `setTab`을 감쌌기 때문에 탭 전환은 비긴급 업데이트로 처리된다.
- 대시보드를 그리는 도중에도 다른 탭 버튼 클릭이 즉시 반응하며, 기존 작업은 자동으로 폐기된다.
- `isPending` 상태 동안 `pointerEvents: 'none'`을 설정하여 계산 중 중복 클릭을 방지할 수도 있다(선택 사항).
- `memo`로 `AdminDashboard`를 감싸 탭이 확정되기 전까지 불필요한 연산을 방어한다.

## 실무 비유

`useTransition`을 활용한 탭 전환은 TV 채널 변경과 같다. 리모컨(사용자 입력)은 항상 즉시 반응하고, 채널 화면(무거운 컴포넌트)은 신호를 잡는 중에도 리모컨이 먹통이 되지 않는다. 채널을 빠르게 돌리면 중간 채널은 건너뛰고 마지막 채널만 표시된다.

## 핵심 포인트

- `startTransition`은 무거운 탭 전환을 비긴급으로 분류하여 UI 반응성을 보호한다.
- 사용자의 추가 클릭이 감지되면 진행 중이던 렌더링은 즉시 중단(interrupt)된다.
- `isPending`과 투명도/텍스트 피드백 조합으로 사용자에게 진행 상태를 알린다.

## 자가 점검

- [ ] '대시보드' 버튼을 누른 직후, 바로 '홈' 버튼을 눌러보았을 때 화면이 굳지 않고 즉시 홈으로 돌아오는지 확인했는가?
- [ ] 대시보드를 로딩하는 동안 "백그라운드에서 구성 중..." 문구가 잘 보이는지 확인했는가?
- [ ] `startTransition`을 제거하고 `setTab(nextTab)`만 남겨보았을 때, 대시보드를 누르는 순간 모든 버튼이 먹통이 되는 현상을 확인했는가?
