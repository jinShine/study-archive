import ManualUserFetcher from './components/ManualUserFetcher';
import SafeUserDetail from './components/SafeUserDetail';

export default function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Manual State Management Disaster 🧪</h1>
      <p>TanStack Query 없이 수동으로 불을 켜고 끄는 고통을 체험합니다.</p>
      <hr />
      
      <section>
        <h2>Case 1: 지옥의 보일러플레이트</h2>
        <ManualUserFetcher />
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2>Case 2: 경합 조건(Race Condition) 방어</h2>
        <SafeUserDetail id={1} />
      </section>
    </div>
  );
}