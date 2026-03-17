import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserAndPosts from './components/UserAndPosts';

/**
 * ⚠️ 테스트를 위해 retry 옵션을 꺼줍니다.
 * 에러 발생 시 엔진이 재시도하느라 로딩이 길어지는 것을 방지합니다.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const GlobalSkeleton = () => (
  <div style={{ padding: '2rem', background: '#f0f0f0', borderRadius: '12px', textAlign: 'center' }}>
    ⌛ 데이터를 병렬로 동기화 중입니다... (Waterfall 격파 중)
  </div>
);

const ErrorPage = ({ error }: { error: Error }) => (
  <div style={{ color: 'red', padding: '1rem', border: '2px solid red', borderRadius: '8px' }}>
    ❌ 에러 발생: {error.message}
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Optimization Lab 🧪</h1>
        <hr />
        <ErrorBoundary fallbackRender={ErrorPage}>
          <Suspense fallback={<GlobalSkeleton />}>
            {/* ⚠️ 테스트: id를 0으로 바꾸면 2초 뒤 즉시 ErrorPage가 나타납니다. */}
            <UserAndPosts id={1} />
          </Suspense>
        </ErrorBoundary>
      </main>
    </QueryClientProvider>
  );
}