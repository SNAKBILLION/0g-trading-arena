import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "0G Trading Arena — Verifiable AI Strategy Competition",
  description: "AI trading strategies compete on real market data. Every decision stored on 0G Storage, anchored on 0G Chain. Verifiable, tamper-proof, open.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-arena-bg text-arena-text antialiased">
        <header className="border-b border-arena-border px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-arena-accent font-mono text-sm font-bold text-arena-bg">
                0G
              </div>
              <span className="font-mono text-lg font-semibold tracking-tight">
                Trading Arena
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-arena-muted">
              <span className="h-2 w-2 rounded-full bg-arena-accent animate-pulse-dot" />
              Galileo Testnet
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  )
}
