import { QueryClientProvider } from '@tanstack/react-query';
import { ProfileSearch } from './components/ProfileSearch';

export default function App({ queryClient }: { queryClient: any }) {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#28a745' }}>Offline Support Lab ✅</h1>
        <p><strong>공룡 퇴치 테스트:</strong> 검색 후 Offline 설정 &rarr; <strong>새로고침(F5)은 금지!</strong></p>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>(데이터 박제 확인용 검색을 이용하세요)</p>
        <hr style={{ margin: '2rem 0', opacity: 0.1 }} />
        <ProfileSearch />
      </main>
    </QueryClientProvider>
  );
}