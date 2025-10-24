'use client'

import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { SessionProvider } from './SessionProvider'

const queryClient = new QueryClient()

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 5000,
                        style: {
                            fontSize: '14px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                        },
                    }}
                />
                {children}
            </QueryClientProvider>
        </SessionProvider>
    )
}
