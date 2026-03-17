import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import LifecycleDemo from './components/LifecycleDemo';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, gcTime: 1000 * 60 * 10 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>TanStack Query Lifecycle Lab 🧪</h1>
        <hr />
        <LifecycleDemo />
      </div>
      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  );
}