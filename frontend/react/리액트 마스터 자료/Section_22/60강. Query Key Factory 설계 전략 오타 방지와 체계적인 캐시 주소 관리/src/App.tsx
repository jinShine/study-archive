import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import UserProfile from './components/UserProfile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>TanStack Query 관제 센터 🛰️</h1>
        <p>Query Key Factory를 활용한 계층형 캐시 관리</p>
        <hr />
        <div style={{ display: 'flex', gap: '20px' }}>
          <UserProfile userId={1} />
          <UserProfile userId={1} />
        </div>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}