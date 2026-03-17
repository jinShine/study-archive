import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserProfile from './components/UserProfile';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>TanStack Query 관제 센터 🛰️</h1>
        <p>동일한 데이터를 사용하는 컴포넌트들을 배치하여 중복 요청 제거를 테스트합니다.</p>
        <hr />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3>컴포넌트 A</h3>
            <UserProfile userId={1} />
          </div>
          <div>
            <h3>컴포넌트 B</h3>
            <UserProfile userId={1} />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}