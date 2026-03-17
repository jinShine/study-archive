import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import UserProfile from './components/UserProfile';
import UserEditor from './components/UserEditor';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
        <h1>Invalidation Lab 🧪</h1>
        <hr />
        <div style={{ display: 'flex', gap: '2rem', marginTop: '20px' }}>
          <UserProfile id={1} />
          <UserEditor id={1} />
        </div>
      </main>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}