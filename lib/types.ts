export interface MarketData {
  id: string
  symbol: string
  name: string
  price: number
  change_24h: number
  volume_24h: number
  market_cap: number
  timestamp: number
}

export interface StrategySignal {
  action: "LONG" | "SHORT" | "HOLD"
  confidence: number // 0-100
  reasoning: string
  entry_price: number
  stop_loss: number
  take_profit: number
}

export interface Decision {
  id: string
  timestamp: number
  strategy_name: string
  market_snapshot: MarketData[]
  signal: StrategySignal
  target_asset: string
  // 0G proofs
  storage_root_hash?: string
  storage_tx_hash?: string
  chain_tx_hash?: string
  chain_receipt_sig?: string
}

export interface LeaderboardEntry {
  strategy_name: string
  total_decisions: number
  correct_calls: number
  accuracy: number
  avg_confidence: number
  last_decision_id: string
}
