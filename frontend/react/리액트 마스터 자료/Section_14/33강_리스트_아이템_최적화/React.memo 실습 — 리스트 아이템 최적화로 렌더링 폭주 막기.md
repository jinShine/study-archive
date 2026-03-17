# 33강. React.memo 실전 — 리스트 아이템 최적화로 렌더링 폭주 막기

## 도입

실무에서 가장 빈번하게 발생하는 성능 문제 중 하나는 "리스트 렌더링 폭주"다. 수백 개의 아이템이 있는 목록에서 단 하나의 항목을 지웠는데, 나머지 수백 개의 항목이 억울하게 다시 그려지는 상황이다. `React.memo` + `useCallback` 조합으로 이 문제를 해결한다.

## 개념 설명

**문제 상황:**
- 리스트 부모의 상태가 변경되면 (예: 카운트 올리기) 모든 자식 아이템이 리렌더링
- 아이템 삭제 시 삭제되지 않은 아이템까지 모두 리렌더링
- `onDelete` 함수가 매번 새로 생성되어 `React.memo`가 무력화됨

**해결 전략:**
1. 각 아이템 컴포넌트를 `React.memo`로 감싼다
2. 삭제 핸들러를 `useCallback`으로 감싸서 함수 주소를 고정한다
3. `setUsers`에 함수형 업데이트(`prev => ...`)를 사용하여 의존성을 제거한다

## 코드 예제

### 리스트 부모 (UserList)

```jsx
import { useState, useCallback } from 'react';
import UserItem from './UserItem';

export default function UserList() {
  const [users, setUsers] = useState([
    { id: 1, name: '홍길동' },
    { id: 2, name: '김철수' },
    { id: 3, name: '이영희' }
  ]);
  const [count, setCount] = useState(0);

  // useCallback + 함수형 업데이트로 의존성 제거
  const handleDelete = useCallback((id) => {
    setUsers((prev) => prev.filter(u => u.id !== id));
  }, []); // 의존성 배열이 비어있음 -> 함수 주소 영구 고정

  return (
    <div style={{ padding: '20px' }}>
      <h3>클릭 횟수: {count}</h3>
      <button onClick={() => setCount(p => p + 1)}>리렌더링 유발</button>
      <ul>
        {users.map(user => (
          <UserItem key={user.id} user={user} onDelete={handleDelete} />
        ))}
      </ul>
    </div>
  );
}
```

### React.memo로 보호된 아이템 (UserItem)

```jsx
import { memo } from 'react';

const UserItem = memo(({ user, onDelete }) => {
  console.log(`${user.name} 아이템 렌더링`);
  return (
    <li style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
      {user.name} <button onClick={() => onDelete(user.id)}>삭제</button>
    </li>
  );
});

export default UserItem;
```

## 코드 해설

- `useCallback((id) => { setUsers(prev => prev.filter(...)) }, [])`: `setUsers`에 함수형 업데이트를 사용하면 `users` 배열을 직접 참조하지 않아도 된다. 덕분에 의존성 배열을 비워서 함수 주소를 영구 고정할 수 있다.
- `memo(({ user, onDelete }) => ...)`: 각 아이템에 파수꾼을 배치한다. `user` 객체와 `onDelete` 함수의 주소가 동일하면 렌더링을 건너뛴다.
- `key={user.id}`: 리액트의 재조정(Reconciliation) 알고리즘이 아이템을 정확히 식별하기 위해 필수다.

## 실무 비유

- 아파트 동(리스트)의 각 세대(아이템)에 경비원(React.memo)을 배치한 것과 같다. 관리소(부모)에서 공지가 바뀌어도, 각 세대의 구성원(props)이 변하지 않았으면 집을 다시 점검하지 않는다.
- 함수형 업데이트(`prev => ...`)는 "현재 상태를 직접 보지 말고, 시스템이 제공하는 최신 값을 쓰라"는 의미다.

## 핵심 포인트

1. 리스트 아이템 최적화의 핵심은 `React.memo(아이템)` + `useCallback(핸들러)`다.
2. `setUsers(prev => ...)` 함수형 업데이트를 사용하면 `users`를 의존성에 넣지 않아도 된다.
3. 의존성 배열을 비울 수 있으면 함수 주소가 영구 고정되어 최적화 효과가 극대화된다.
4. `key` props는 최적화가 아닌 리액트의 재조정 알고리즘을 위한 필수 요소다.
5. 아이템 수가 적으면(10개 미만) 최적화 비용이 더 클 수 있으므로 적용하지 않아도 된다.

## 자가 점검

- [ ] 함수형 업데이트(`prev => ...`)를 사용하면 왜 `useCallback`의 의존성 배열을 비울 수 있는지 설명할 수 있는가?
- [ ] 부모의 `count`가 변해도 자식 아이템이 리렌더링되지 않는 전체 흐름을 설명할 수 있는가?
- [ ] `key`를 인덱스(`key={index}`)로 넣으면 왜 문제가 되는지 설명할 수 있는가?
- [ ] 아이템이 100개일 때와 3개일 때 `React.memo` 적용의 가성비를 비교할 수 있는가?
