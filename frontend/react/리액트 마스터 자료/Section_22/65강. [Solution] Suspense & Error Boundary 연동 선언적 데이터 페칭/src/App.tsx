import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserProfile from './components/UserProfile';

const queryClient = new QueryClient();

// Fallback UI 컴포넌트
const UserProfileSkeleton = () => (
  <div style={{ padding: '2rem', background: '#eee', borderRadius: '12px', textAlign: 'center' }}>
    ⌛ 스켈레톤 UI가 데이터를 기다리는 중...
  </div>
);

const ErrorPage = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div style={{ color: 'red', border: '2px solid red', padding: '1rem', borderRadius: '12px' }}>
    <h3>❌ 차단기 작동 (에러 격리)</h3>
    <p>{error.message}</p>
    <button onClick={resetErrorBoundary}>다시 시도</button>
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
        <h1>선언적 데이터 페칭 Lab 🧪</h1>
        <p>어떻게(How)가 아닌 무엇(What)에 집중하는 아키텍처</p>
        <hr />

        <div style={{ marginTop: '20px' }}>
          {/* 1. 에러 격리 안전 펜스 */}
          <ErrorBoundary 
             FallbackComponent={ErrorPage} 
             onReset={() => queryClient.resetQueries()}
          >
            {/* 2. 로딩 상태 대기실 */}
            <Suspense fallback={<UserProfileSkeleton />}>
              <UserProfile id={1} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </QueryClientProvider>
  );
}