import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InfinitePostList from './components/InfinitePostList';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>Infinite Scroll Lab 🧪</h1>
        <p>배열 합치기 노가다에서 해방된 선언적 리스트</p>
        <hr />
        <InfinitePostList />
      </main>
    </QueryClientProvider>
  );
}