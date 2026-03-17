# 50강. 쿼리 스트링(Query String) -- useSearchParams로 데이터 필터링 구현하기

## 도입

실무에서는 한 페이지 안에서 '전자기기만 보기'나 '가격순 정렬' 같은 세밀한 조작이 필요하다. 주소창 경로 뒤에 `?`로 시작하는 상세 요청서, 쿼리 스트링(Query String)과 이를 자유자재로 다루는 `useSearchParams` 훅을 마스터해 본다.

## 개념 설명

`useSearchParams`는 `useState`와 매우 비슷하지만, 데이터를 메모리가 아닌 브라우저 주소창에 저장한다. 덕분에 새로고침을 해도 필터 상태가 유지된다.

- `searchParams.get('key')`: 주소창에서 특정 키의 값을 읽어온다.
- `setSearchParams({ key: value })`: 페이지 새로고침 없이 주소창의 쿼리 부분만 바꾼다.

### 왜 쿼리 스트링이 중요한가? (공유 가능성)

- **일반 변수 사용 시**: 친구에게 링크를 보내면 친구는 '전체 목록'을 보게 된다 (상태가 내 메모리에만 있기 때문).
- **쿼리 스트링 사용 시**: 주소창에 `?color=blue&max=30000`이 박제된다. 이 링크를 받은 친구는 내가 보던 필터링 된 화면을 정확히 똑같이 보게 된다.
- **SEO 이점**: 구글 같은 검색 로봇이 각 필터 결과물을 개별 페이지로 인식하여 검색 유입을 늘려준다.

## 코드 예제

### 주소창 기반의 State 관리 (InventoryPage.jsx)

```jsx
import { useSearchParams } from 'react-router';

export default function InventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 주소창에서 'category' 값을 읽어온다. 값이 없으면 'all'을 기본값으로 사용한다.
  const category = searchParams.get('category') || 'all';

  const handleFilter = (type) => {
    setSearchParams({ category: type });
  };

  return (
    <div style={{ padding: '40px' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', marginBottom: '24px' }}>
        INVENTORY MANAGEMENT
      </h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button onClick={() => handleFilter('all')} style={getButtonStyle(category === 'all')}>전체</button>
        <button onClick={() => handleFilter('electronics')} style={getButtonStyle(category === 'electronics')}>전자기기</button>
        <button onClick={() => handleFilter('furniture')} style={getButtonStyle(category === 'furniture')}>가구</button>
      </div>

      <div style={{
        background: 'white', padding: '30px', borderRadius: '32px',
        border: '2px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        <p style={{ color: '#64748b', fontWeight: '500' }}>
          현재 필터링 된 카테고리:
          <span style={{ color: '#4f46e5', fontWeight: '900', marginLeft: '8px', textTransform: 'uppercase' }}>
            {category}
          </span>
        </p>
      </div>
    </div>
  );
}

const getButtonStyle = (isActive) => ({
  padding: '10px 20px',
  borderRadius: '12px',
  border: 'none',
  fontWeight: 'bold',
  cursor: 'pointer',
  backgroundColor: isActive ? '#4f46e5' : '#e2e8f0',
  color: isActive ? 'white' : '#475569',
  transition: 'all 0.2s'
});
```

## 코드 해설

- `useSearchParams`는 URL의 `?` 이후 부분을 읽고 쓸 수 있는 훅이다.
- `searchParams.get('category')`로 현재 필터 상태를 읽고, `setSearchParams({ category: type })`로 URL을 갱신한다.
- URL이 바뀌면 리액트가 리렌더링되므로 화면이 자동으로 필터링 결과를 반영한다.
- 새로고침해도 URL에 상태가 남아있으므로 필터 조건이 유지된다.

## 실무 비유

쿼리 스트링은 카페의 주문서와 같다. "아이스 아메리카노, 샷 추가, 시럽 빼기"(`?type=iced&shot=extra&syrup=none`)라는 주문서를 누군가에게 건네면, 그 사람도 정확히 같은 음료를 받을 수 있다. 주문서가 없으면(일반 변수) 매번 처음부터 다시 주문해야 한다.

## 핵심 포인트

- 주소창 뒤의 `?key=value` 형태가 페이지의 옵션을 결정하는 '주문서'이다.
- `searchParams.get('key')`로 읽고, `setSearchParams({ key: value })`로 쓴다.
- 쿼리 스트링은 새로고침 시 상태 유지, URL 공유, SEO 이점을 제공한다.

## 자가 점검

- [ ] 주소창 뒤의 `?key=value` 형태가 페이지의 옵션을 결정하는 '주문서'임을 이해했는가?
- [ ] `searchParams.get('key')`로 주소창의 데이터를 읽어오는 법을 익혔는가?
- [ ] `setSearchParams({ key: value })`로 페이지 새로고침 없이 주소만 바꾸는 법을 마스터했는가?
- [ ] 버튼을 눌러 필터를 적용한 뒤 브라우저를 새로고침해 보고, 필터 상태가 그대로 유지되는지 확인했는가?
