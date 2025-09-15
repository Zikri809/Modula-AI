'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import Refresh_token_component from "@/app/Components/SelfComponent/refresh_token/refresh_token_component";

export default function Providers({ children }: { children: React.ReactNode }) {
    // Create QueryClient inside the component to avoid sharing between requests
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            <Refresh_token_component>
                {children}
            </Refresh_token_component>
        </QueryClientProvider>
    )
}