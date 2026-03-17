import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24시간 유지
      staleTime: 1000 * 60 * 5,
    },
  },
});

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
});

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  buster: 'v1-github-lab-2026', 
  maxAge: 1000 * 60 * 60 * 24, 
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App queryClient={queryClient} />
  </StrictMode>
);