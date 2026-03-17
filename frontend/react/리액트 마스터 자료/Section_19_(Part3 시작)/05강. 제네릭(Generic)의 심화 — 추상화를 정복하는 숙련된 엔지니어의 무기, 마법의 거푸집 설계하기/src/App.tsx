/* [File Path]: src/App.tsx
   [Copyright]: © nhcodingstudio 소유 */
import React from 'react';
import { DataList } from './components/DataList';
import { wrapWithMetadata } from './utils/wrapWithMetadata';

interface User { id: number; name: string; role: string; }
interface Product { id: string; title: string; price: number; }

function App() {
  const users: User[] = [
    { id: 1, name: "Alice", role: "아키텍트" },
    { id: 2, name: "Bob", role: "시니어 엔지니어" }
  ];
  const products: Product[] = [
    { id: "p1", title: "엔터프라이즈 키보드", price: 185000 },
    { id: "p2", title: "정밀 설계용 마우스", price: 92000 }
  ];
  const metaExample = wrapWithMetadata<User>(users[0]);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>05강. 제네릭 실습: 마법의 거푸집</h1>
      <DataList<User> items={users} renderRow={(u) => <div><strong>{u.name}</strong> - {u.role}</div>} />
      <DataList<Product> items={products} renderRow={(p) => <div>{p.title} - {p.price.toLocaleString()}원</div>} />
      <footer style={{ marginTop: '40px', color: '#999' }}>ID: {metaExample.id}</footer>
    </div>
  );
}
export default App;
