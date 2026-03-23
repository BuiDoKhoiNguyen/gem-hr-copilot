"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { I18nextProvider } from "react-i18next";
import { Toaster } from "sonner";
import { useState, type ReactNode } from "react";

import i18n from "@/lib/i18n/config";

/**
 * Application providers wrapper
 * - React Query for server state management
 * - i18next for internationalization
 * - Sonner for toast notifications
 */
export function Providers({ children }: { children: ReactNode }) {
  // Create QueryClient instance (stable across renders)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Don't refetch on window focus (reduces unnecessary requests)
            refetchOnWindowFocus: false,
            // Retry failed requests 3 times with exponential backoff
            retry: 3,
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Show error toast on mutation failure
            onError: (error: any) => {
              console.error("Mutation error:", error);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
          toastOptions={{
            classNames: {
              error: "border-red-500",
              success: "border-green-500",
              warning: "border-yellow-500",
              info: "border-blue-500",
            },
          }}
        />
        {/* React Query Devtools - only in development */}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </I18nextProvider>
    </QueryClientProvider>
  );
}
