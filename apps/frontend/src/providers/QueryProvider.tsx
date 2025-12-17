import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount: number, error: Error): boolean => {
        // Don't retry on 4xx errors except 408, 429
        if (
          Boolean(error) &&
          typeof error === 'object' &&
          error !== null &&
          'statusCode' in error
        ) {
          const statusCode = error.statusCode as number;
          if (
            statusCode >= 400 &&
            statusCode < 500 &&
            statusCode !== 408 &&
            statusCode !== 429
          ) {
            return false;
          }
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount: number, error: Error): boolean => {
        // Don't retry mutations on client errors
        if (
          Boolean(error) &&
          typeof error === 'object' &&
          error !== null &&
          'statusCode' in error
        ) {
          const statusCode = error.statusCode as number;
          if (statusCode >= 400 && statusCode < 500) {
            return false;
          }
        }
        return failureCount < 2;
      },
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({
  children,
}): React.JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};
