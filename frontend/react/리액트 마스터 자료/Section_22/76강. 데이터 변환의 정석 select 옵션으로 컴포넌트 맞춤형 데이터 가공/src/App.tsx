import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserDisplay } from './components/UserDisplay';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ maxWidth: '600px', margin: '40px auto', padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>Data Transformation Lab 👨‍🍳</h1>
        <hr style={{ margin: '20px 0' }} />
        <UserDisplay />
      </main>
    </QueryClientProvider>
  );
}