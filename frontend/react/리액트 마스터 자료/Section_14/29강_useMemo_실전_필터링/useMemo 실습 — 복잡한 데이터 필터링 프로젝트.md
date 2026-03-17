# 29강. useMemo 실전 — 복잡한 데이터 필터링 프로젝트

## 도입

실무에서 가장 흔하게 `useMemo`가 필요한 상황은 대량 데이터의 필터링/정렬이다. 1만 개의 사용자 데이터를 검색하는 기능에서, 검색어와 무관한 상태 변경(예: 테마 전환)이 일어날 때마다 1만 개를 다시 필터링하는 것은 심각한 성능 낭비다.

## 개념 설명

**문제 상황:**
- 1만 개의 사용자 데이터가 있는 리스트 컴포넌트
- 검색 기능(query)과 테마 변경 기능(isDark)이 동시에 존재
- useMemo 없이는 테마 변경만 해도 1만 개를 다시 필터링

**해결:**
- `useMemo`로 필터링 결과를 캐싱하고, `[query]`를 의존성으로 지정
- 테마 변경 시에는 캐싱된 필터링 결과를 그대로 사용

## 코드 예제

### 대량 데이터 생성기 (dataGenerator.js)

```js
export const generateUsers = () => {
  return Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `User_${i}_${Math.random().toString(36).substring(7)}`,
    age: Math.floor(Math.random() * 50) + 20
  }));
};
```

### useMemo로 필터링 최적화 (UserList)

```jsx
import { useState, useMemo } from 'react';
import { generateUsers } from '../utils/dataGenerator';

// 컴포넌트 바깥에서 한 번만 생성 (리렌더링과 무관)
const users = generateUsers();

export default function UserList() {
  const [query, setQuery] = useState("");
  const [isDark, setIsDark] = useState(false);

  // useMemo: query가 변할 때만 1만 개 필터링을 다시 실행
  const filteredUsers = useMemo(() => {
    console.log("필터링 연산 가동 (1만 개)");
    return users.filter(u =>
      u.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <div style={{
      backgroundColor: isDark ? '#333' : '#fff',
      color: isDark ? '#fff' : '#000',
      padding: '20px'
    }}>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="검색..."
      />
      <button onClick={() => setIsDark(!isDark)}>테마 전환</button>
      <p>결과: {filteredUsers.length}명</p>
    </div>
  );
}
```

## 코드 해설

- `const users = generateUsers()`: 컴포넌트 바깥에 선언하여 리렌더링과 무관하게 한 번만 데이터를 생성한다. 컴포넌트 안에 넣으면 매 렌더링마다 1만 개를 새로 생성하는 낭비가 발생한다.
- `useMemo(() => users.filter(...), [query])`: `query`가 변할 때만 1만 개 데이터에 대해 `filter`를 실행한다. `isDark`가 변해서 리렌더링이 일어나도 이전 필터링 결과를 그대로 사용한다.
- `u.name.toLowerCase().includes(query.toLowerCase())`: 대소문자를 구분하지 않는 검색을 구현한다. 1만 번의 문자열 비교가 필요한 연산이므로 useMemo로 캐싱할 가치가 있다.

## 실무 비유

- 도서관에서 1만 권의 책을 매번 처음부터 뒤지는 것(useMemo 없음) vs 검색어별로 결과 목록을 만들어두고 재사용하는 것(useMemo 적용)의 차이다.
- 검색어가 바뀌면 새로 찾아야 하지만, 조명(테마)만 바뀌었다고 책을 다시 찾을 필요는 없다.

## 핵심 포인트

1. 대량 데이터의 `filter`, `sort`, `map` 연산은 `useMemo`의 대표적 적용 대상이다.
2. 불변 데이터(고정 배열)는 컴포넌트 바깥에 선언하여 리렌더링과 분리한다.
3. 의존성 배열에 실제로 연산에 영향을 주는 값만 정확히 넣는다.
4. `useMemo`가 효과적인 상황: 데이터 규모가 크고, 연산과 무관한 리렌더링이 빈번할 때.
5. 콘솔 로그로 연산이 언제 재실행되는지 확인하는 습관이 최적화의 기본이다.

## 자가 점검

- [ ] `const users = generateUsers()`를 컴포넌트 안에 넣으면 어떤 문제가 생기는지 설명할 수 있는가?
- [ ] 테마 전환 시 필터링이 재실행되지 않는 원리를 의존성 배열로 설명할 수 있는가?
- [ ] 데이터가 100개뿐이라면 useMemo를 쓸 필요가 있는지 판단할 수 있는가?
- [ ] 검색어 + 나이 필터를 동시에 적용하려면 의존성 배열을 어떻게 수정해야 하는가?
