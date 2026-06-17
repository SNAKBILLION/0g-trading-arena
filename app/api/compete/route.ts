import { NextResponse } from "next/server"
import { fetchMarketData } from "@/lib/coingecko"
import { STRATEGIES, runStrategy } from "@/lib/zerog-compute"
import { uploadDecision } from "@/lib/zerog-storage"
import { anchorDecision, signReceipt } from "@/lib/zerog-chain"
import type { Decision } from "@/lib/types"
import { randomUUID } from "crypto"

export async function POST() {
  try {
    // 1. Fetch market data
    const market = await fetchMarketData()

    // 2. Run all strategies in parallel via 0G Compute
    const results = await Promise.allSettled(
      STRATEGIES.map((s) => runStrategy(s, market)),
    )

    const decisions: Decision[] = []

    for (let i = 0; i < STRATEGIES.length; i++) {
      const result = results[i]
      if (result.status !== "fulfilled") {
        console.error(`Strategy ${STRATEGIES[i].name} failed:`, result.reason)
        continue
      }

      const { signal, target_asset } = result.value
      const decision: Decision = {
        id: randomUUID(),
        timestamp: Date.now(),
        strategy_name: STRATEGIES[i].name,
        market_snapshot: market,
        signal,
        target_asset,
      }

      // 3. Upload to 0G Storage
      try {
        const { rootHash, txHash } = await uploadDecision(decision)
        decision.storage_root_hash = rootHash
        decision.storage_tx_hash = txHash

        // 4. Anchor on 0G Chain
        const chainResult = await anchorDecision(decision, rootHash)
        decision.chain_tx_hash = chainResult.txHash

        // 5. Sign EIP-191 receipt
        const receipt = await signReceipt(decision, rootHash)
        decision.chain_receipt_sig = receipt.signature
      } catch (err) {
        console.error(`0G ops failed for ${decision.strategy_name}:`, err)
        // Still include decision even without 0G proofs for demo
      }

      decisions.push(decision)
    }

    return NextResponse.json({ decisions, count: decisions.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
