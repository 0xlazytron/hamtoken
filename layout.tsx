"use client"

import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { bsc } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { Toaster } from 'sonner'

const { chains, publicClient } = configureChains(
  [bsc],
  [publicProvider()]
)

const config = createConfig({
  autoConnect: true,
  publicClient,
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WagmiConfig config={config}>
      {children}
      <Toaster />
    </WagmiConfig>
  )
}

