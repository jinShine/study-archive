import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PostEditor from './components/PostEditor';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
        <h1>TanStack Query Mutation Lab 🧪</h1>
        <p>서버의 상태를 직접 바꾸는 <strong>명령형 엔진</strong>을 가동합니다.</p>
        <hr />
        <PostEditor />
      </main>
    </QueryClientProvider>
  );
}