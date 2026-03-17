import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SearchList from './components/SearchList';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>Search UX Lab 🛰️</h1>
        <p>검색어가 바뀌어도 화면이 고정되는 <strong>끊김 없는 UX</strong>를 체험하세요.</p>
        <hr />
        <SearchList />
      </main>
    </QueryClientProvider>
  );
}