import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileSearch } from './components/ProfileSearch';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ maxWidth: '500px', margin: '3rem auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1>Offline Pain Point Lab ⚡️</h1>
        <p style={{ color: '#666' }}>
          <strong>테스트 가이드:</strong><br />
          1. 온라인에서 검색 → 2. Offline 설정 → 3. 재검색 및 새로고침
        </p>
        <hr style={{ margin: '2rem 0', opacity: 0.2 }} />
        <ProfileSearch />
      </main>
    </QueryClientProvider>
  );
}