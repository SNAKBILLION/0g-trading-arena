import { config } from "./config"
import type { MarketData } from "./types"

const TOP_COINS = [
  "bitcoin", "ethereum", "solana", "avalanche-2", "chainlink",
  "polkadot", "near", "arbitrum", "optimism", "sui",
]

export async function fetchMarketData(): Promise<MarketData[]> {
  const ids = TOP_COINS.join(",")
  const url = `${config.coingecko}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  })

  if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`)

  const data = await res.json()

  return data.map((coin: any) => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price: coin.current_price,
    change_24h: coin.price_change_percentage_24h || 0,
    volume_24h: coin.total_volume,
    market_cap: coin.market_cap,
    timestamp: Date.now(),
  }))
}
