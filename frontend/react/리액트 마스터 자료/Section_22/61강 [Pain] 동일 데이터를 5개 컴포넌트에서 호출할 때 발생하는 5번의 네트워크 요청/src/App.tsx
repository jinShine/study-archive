import { Navbar, Sidebar, QuickMenu } from './components/UserComponents';

export default function App() {
  return (
    <div style={{ padding: '0', fontFamily: 'sans-serif', color: '#333' }}>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <h1>Disaster Lab: 중복 요청의 재앙 🧪</h1>
        <p>콘솔창(F12)을 열어 📡 <strong>[Network Log]</strong>가 몇 번 찍히는지 확인하세요.</p>
        <hr />
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <Sidebar />
          <main style={{ flex: 1, padding: '20px', border: '1px dashed #ccc' }}>
            <h3>본문 영역</h3>
            <p>화면에 컴포넌트가 나타날 때마다 각자 API를 호출합니다.</p>
          </main>
        </div>
      </div>
      <QuickMenu />
    </div>
  );
}