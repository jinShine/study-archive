import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TodoEditor from './components/TodoEditor';
import TodoList from './components/TodoList';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' }}>
        <h1>Optimistic UX Lab ⚡</h1>
        <hr />
        <TodoEditor />
        <TodoList />
      </main>
    </QueryClientProvider>
  );
}