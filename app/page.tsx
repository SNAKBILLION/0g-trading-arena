"use client"

import { useState } from "react"
import type { Decision, MarketData } from "@/lib/types"

type Phase = "idle" | "scanning" | "competing" | "anchoring" | "done" | "error"

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle")
  const [market, setMarket] = useState<MarketData[]>([])
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [error, setError] = useState("")

  async function runCompetition() {
    setError("")
    setDecisions([])

    try {
      // Phase 1: Scan market
      setPhase("scanning")
      const scanRes = await fetch("/api/scan")
      const scanData = await scanRes.json()
      if (!scanRes.ok) throw new Error(scanData.error)
      setMarket(scanData.market)

      // Phase 2+3+4: Run strategies + store + anchor
      setPhase("competing")
      const competeRes = await fetch("/api/compete", { method: "POST" })
      const competeData = await competeRes.json()
      if (!competeRes.ok) throw new Error(competeData.error)

      setDecisions(competeData.decisions)
      setPhase("done")
    } catch (err: any) {
      setError(err.message)
      setPhase("error")
    }
  }

  const actionColor = (action: string) => {
    if (action === "LONG") return "text-green-400"
    if (action === "SHORT") return "text-red-400"
    return "text-arena-muted"
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="space-y-3">
        <h1 className="font-mono text-3xl font-bold tracking-tight">
          Verifiable AI Trading Arena
        </h1>
        <p className="max-w-2xl text-arena-muted">
          Three AI strategies analyze the same market data. Every decision runs through
          0G Compute (TEE-verified), gets stored on 0G Storage (immutable), and anchored
          on 0G Chain (tamper-proof). Anyone can verify.
        </p>
      </section>

      {/* Run Button */}
      <button
        onClick={runCompetition}
        disabled={phase !== "idle" && phase !== "done" && phase !== "error"}
        className="rounded-lg bg-arena-accent px-6 py-3 font-mono text-sm font-semibold text-arena-bg transition hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {phase === "idle" && "Run Competition Round"}
        {phase === "scanning" && "Scanning markets..."}
        {phase === "competing" && "AI strategies competing..."}
        {phase === "anchoring" && "Anchoring on 0G Chain..."}
        {phase === "done" && "Run Again"}
        {phase === "error" && "Retry"}
      </button>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Market Snapshot */}
      {market.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-arena-muted">
            Market Snapshot
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {market.slice(0, 10).map((m) => (
              <div key={m.id} className="rounded-lg border border-arena-border bg-arena-surface px-3 py-2">
                <div className="font-mono text-xs text-arena-muted">{m.symbol}</div>
                <div className="font-mono text-sm font-semibold">
                  ${m.price < 1 ? m.price.toFixed(4) : m.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
                <div className={`font-mono text-xs ${m.change_24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {m.change_24h >= 0 ? "+" : ""}{m.change_24h.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Strategy Decisions */}
      {decisions.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-arena-muted">
            Strategy Decisions
          </h2>
          <div className="space-y-3">
            {decisions.map((d) => (
              <div
                key={d.id}
                className="rounded-lg border border-arena-border bg-arena-surface p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-mono text-base font-semibold">{d.strategy_name}</div>
                  <div className={`font-mono text-lg font-bold ${actionColor(d.signal.action)}`}>
                    {d.signal.action} {d.target_asset}
                  </div>
                </div>

                <p className="text-sm text-arena-muted">{d.signal.reasoning}</p>

                <div className="flex flex-wrap gap-4 font-mono text-xs">
                  <span>Confidence: <strong>{d.signal.confidence}%</strong></span>
                  <span>Entry: <strong>${d.signal.entry_price?.toLocaleString()}</strong></span>
                  <span>SL: <strong>${d.signal.stop_loss?.toLocaleString()}</strong></span>
                  <span>TP: <strong>${d.signal.take_profit?.toLocaleString()}</strong></span>
                </div>

                {/* 0G Proofs */}
                <div className="border-t border-arena-border pt-3 space-y-1">
                  <div className="font-mono text-xs font-semibold text-arena-accent">0G Proof Chain</div>
                  {d.storage_root_hash ? (
                    <div className="space-y-1 font-mono text-xs text-arena-muted">
                      <div>
                        Storage Root:{" "}
                        <span className="text-arena-text">{d.storage_root_hash.slice(0, 20)}...</span>
                      </div>
                      <div>
                        Storage Tx:{" "}
                        <a
                          href={`https://chainscan-galileo.0g.ai/tx/${d.storage_tx_hash}`}
                          target="_blank"
                          rel="noopener"
                          className="text-arena-accent underline"
                        >
                          {d.storage_tx_hash?.slice(0, 20)}...
                        </a>
                      </div>
                      {d.chain_tx_hash && (
                        <div>
                          Chain Anchor Tx:{" "}
                          <a
                            href={`https://chainscan-galileo.0g.ai/tx/${d.chain_tx_hash}`}
                            target="_blank"
                            rel="noopener"
                            className="text-arena-accent underline"
                          >
                            {d.chain_tx_hash.slice(0, 20)}...
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="font-mono text-xs text-arena-muted italic">
                      Connect wallet + deploy contract to enable 0G proofs
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How It Works */}
      {phase === "idle" && (
        <section className="space-y-3 border-t border-arena-border pt-8">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-arena-muted">
            How It Works
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { step: "0G Compute", desc: "AI strategies run inside TEE — inference is tamper-proof and verifiable." },
              { step: "0G Storage", desc: "Full decision audit log (market data + reasoning + signal) stored immutably." },
              { step: "0G Chain", desc: "Content hash anchored on-chain. Anyone can verify nothing was changed." },
            ].map((s) => (
              <div key={s.step} className="rounded-lg border border-arena-border bg-arena-surface p-4">
                <div className="font-mono text-sm font-semibold text-arena-accent">{s.step}</div>
                <p className="mt-1 text-sm text-arena-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
