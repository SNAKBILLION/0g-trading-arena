import { config } from "./config"
import type { MarketData, StrategySignal } from "./types"

interface StrategyPrompt {
  name: string
  system: string
}

export const STRATEGIES: StrategyPrompt[] = [
  {
    name: "Momentum Hunter",
    system: "You are a momentum trading AI. You look for strong 24h price moves backed by high volume. You go LONG on coins pumping with volume confirmation, SHORT on coins dumping with volume, HOLD if signals are weak. Be aggressive — momentum is your edge.",
  },
  {
    name: "Mean Reverter",
    system: "You are a mean-reversion trading AI. You look for overextended moves that are likely to revert. You SHORT coins that pumped too hard too fast (overbought), LONG coins that dumped too hard (oversold), HOLD if no clear extremes. Be contrarian — the crowd is usually late.",
  },
  {
    name: "Volume Sentinel",
    system: "You are a volume-analysis trading AI. You focus on unusual volume patterns as leading indicators. High volume + small price change = accumulation (LONG). High volume + big dump = distribution (SHORT). Low volume moves are noise (HOLD). Volume tells the truth before price does.",
  },
]

export async function runStrategy(
  strategy: StrategyPrompt,
  market: MarketData[],
): Promise<{ signal: StrategySignal; target_asset: string }> {
  const marketSummary = market
    .map(
      (m) =>
        `${m.symbol}: $${m.price.toFixed(2)} | 24h: ${m.change_24h > 0 ? "+" : ""}${m.change_24h.toFixed(2)}% | Vol: $${(m.volume_24h / 1e9).toFixed(2)}B | MCap: $${(m.market_cap / 1e9).toFixed(1)}B`,
    )
    .join("\n")

  const userPrompt = `Here is the current market snapshot:

${marketSummary}

Pick ONE coin from this list. Decide: LONG, SHORT, or HOLD.
Respond ONLY in this exact JSON format, nothing else:
{
  "target": "SYMBOL",
  "action": "LONG",
  "confidence": 75,
  "reasoning": "1-2 sentence explanation",
  "entry_price": 0,
  "stop_loss": 0,
  "take_profit": 0
}`

  const messages = [
    { role: "system" as const, content: strategy.system },
    { role: "user" as const, content: userPrompt },
  ]

  // Try 0G Compute first, fallback to DeepSeek
  const endpoints = [
    {
      url: `${config.zerog.computeUrl}/chat/completions`,
      key: config.zerog.computeApiKey,
      model: "llama-3.1-8b-instant",
      name: "0G Compute",
    },
    {
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: config.groqKey,
      model: "llama-3.1-8b-instant",
      name: "DeepSeek",
    },
  ].filter((e) => e.key)

  let lastError = ""

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ep.key}`,
        },
        body: JSON.stringify({
          messages,
          model: ep.model,
          temperature: 0.3,
          max_tokens: 300,
        }),
      })

      if (!res.ok) {
        lastError = `${ep.name}: ${res.status}`
        continue
      }

      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content || ""
      const clean = raw.replace(/```json|```/g, "").trim()
      const parsed = JSON.parse(clean)

      console.log(`[${strategy.name}] via ${ep.name}`)

      return {
        target_asset: parsed.target,
        signal: {
          action: parsed.action,
          confidence: parsed.confidence,
          reasoning: parsed.reasoning,
          entry_price: parsed.entry_price,
          stop_loss: parsed.stop_loss,
          take_profit: parsed.take_profit,
        },
      }
    } catch (err: any) {
      lastError = `${ep.name}: ${err.message}`
    }
  }

  throw new Error(`All inference endpoints failed. Last: ${lastError}`)
}
