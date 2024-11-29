"use client"
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '../store'
import { WagmiConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { chains, demoAppInfo, wagmiConfig } from "@/config/rainbow-kit";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

const queryClient = new QueryClient();

export default function RootProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const storeRef = useRef<AppStore>()
    if (!storeRef.current) {
        storeRef.current = makeStore()
    }

    return (
        <QueryClientProvider client={queryClient}>
            <WagmiConfig config={wagmiConfig}>
                <RainbowKitProvider appInfo={demoAppInfo} chains={chains}>
                    <Provider store={storeRef.current}>{children}</Provider>
                </RainbowKitProvider>
            </WagmiConfig>
        </QueryClientProvider>
    )
}