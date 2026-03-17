import ManualScroll from './components/ManualScroll';

export default function App() {
  return (
    <main style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Manual Scroll Lab 🧪</h1>
      <p style={{color: '#666'}}>상태 하나 꼬이면 데이터가 중복되는 지옥을 체험하세요.</p>
      <hr />
      <ManualScroll />
      <div style={{ marginTop: '20px', fontSize: '12px', background: '#f9f9f9', padding: '10px' }}>
        💡 <strong>테스트:</strong> 버튼을 광속으로 연타해 보세요. 중복 호출 방지 로직(isFetching)이 없다면 똑같은 데이터가 리스트에 도배될 것입니다.
      </div>
    </main>
  );
}