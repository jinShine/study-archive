import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SearchList from './components/SearchList';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ maxWidth: '600px', margin: '40px auto', padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#d9534f' }}>Pain Inducer Lab 🧪</h1>
        <p>타이핑할 때마다 <strong>화면 깜빡임</strong>과 <strong>레이아웃 이동(CLS)</strong>을 체험해 보세요.</p>
        <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />
        <SearchList />
      </main>
    </QueryClientProvider>
  );
}