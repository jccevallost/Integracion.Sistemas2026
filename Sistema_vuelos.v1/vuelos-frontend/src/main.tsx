// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppRouter } from '@/router/AppRouter';
import '@/index.css';

// ============================================================
//   QueryClient — configuración global de React Query
//
//   staleTime: 5 min → no re-fetches innecesarios
//   retry: 1 → reintento único ante error (idempotencia)
//   En Reto 2, agregar onError global para manejo de 503
// ============================================================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>
);
