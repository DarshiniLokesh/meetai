'use client';

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {createTRPCClient, httpBatchLink} from '@trpc/client';
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import { makeQueryClient } from "./query-client";
import type {AppRouter} from "./routers/_app";

export const {TRPCProvider, useTRPC} = createTRPCContext<AppRouter>();
let browserQueryClient : QueryClient;
function getQueryClient(){
    if(typeof window === 'undefined'){
        return makeQueryClient();
    }

    if(!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
}
function getUrl() {
    if(typeof window !== 'undefined') {
        // Client-side: use relative URL
        return '/api/trpc';
    }
    // Server-side: use absolute URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/api/trpc`;
}
export function TRPCReactProvide(
    props:Readonly<{
        children: React.ReactNode;
    }>,
){



    const queryClient = getQueryClient();
    const [trpcClient] = useState(() =>
         createTRPCClient<AppRouter>({
            links: [
                httpBatchLink({
                    url: getUrl(),
                    fetch(url, options) {
                        return fetch(url, {
                            ...options,
                            credentials: 'include',
                        });
                    },
                }),
            ],
         }),
    );
    return (
        <QueryClientProvider client = {queryClient}>
            <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
                {props.children}
            </TRPCProvider>
        </QueryClientProvider>
    );
}