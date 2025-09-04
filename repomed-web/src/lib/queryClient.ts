import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (count, err: any) => {
        const status = err?.status ?? 0;
        if (status >= 400 && status < 500) return false;
        return count < 2;
      }
    }
  }
});