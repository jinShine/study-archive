import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import UserProfile from './components/UserProfile';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>TanStack Query 지능형 관제 센터 🛰️</h1>
        <p>동일한 ID(1)를 가진 컴포넌트 3개가 동시에 데이터를 요청하지만,</p>
        <p><strong>네트워크 요청은 단 1번만 발생합니다.</strong></p>
        <hr />
        
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <UserProfile userId={1} />
          <UserProfile userId={1} />
          <UserProfile userId={1} />
        </div>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}