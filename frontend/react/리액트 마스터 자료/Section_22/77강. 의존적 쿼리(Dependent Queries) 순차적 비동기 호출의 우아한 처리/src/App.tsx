import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserPosts } from './components/UserPosts';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ textAlign: 'center' }}>Dependent Query Lab 🔗</h1>
        <UserPosts email="ai@google.com" />
      </main>
    </QueryClientProvider>
  );
}