import { config } from "./config"
import type { MarketData, StrategySignal } from "./types"

interface StrategyPrompt {
  name: string
  system: string
}

export const STRATEGIES: StrategyPrompt[] = [
  {
    name: "Momentum Hunter",
    system: "You are a momentum trading AI. You ONLY go LONG when 24h change is POSITIVE with high volume. You MUST go SHORT when 24h change is strongly NEGATIVE with high volume. You go HOLD when signals are mixed or weak. Never default to LONG — SHORT and HOLD are equally valid.",
  },
  {
    name: "Mean Reverter",
    system: "You are a mean-reversion trading AI. You MUST go SHORT on coins that pumped more than +3% (overbought). You MUST go LONG on coins that dumped more than -5% (oversold). If no coin is above +3% or below -5%, you HOLD. You are contrarian — never follow the crowd.",
  },
  {
    name: "Volume Sentinel",
    system: "You are a volume-analysis trading AI. High volume + small price change means accumulation (LONG). High volume + big negative change means distribution (SHORT). Low volume moves are noise (HOLD). You MUST use SHORT when distribution pattern is clear. Never default to LONG.",
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

IMPORTANT RULES:
- Pick ONE coin from this list
- You MUST choose LONG, SHORT, or HOLD based on your strategy — do NOT default to LONG
- entry_price MUST be the coin's current price from the data above
- stop_loss and take_profit MUST be realistic numbers based on entry_price (not 0)
- For LONG: stop_loss = entry × 0.95 (5% below), take_profit = entry × 1.10 (10% above)
- For SHORT: stop_loss = entry × 1.05 (5% above), take_profit = entry × 0.90 (10% below)
- confidence should be between 60-90, never 100

Respond ONLY with this JSON, nothing else:
{"target":"<SYMBOL>","action":"<LONG or SHORT or HOLD>","confidence":<0-100>,"reasoning":"<explain using actual data>","entry_price":<current price>,"stop_loss":<realistic SL>,"take_profit":<realistic TP>}`

  const messages = [
    { role: "system" as const, content: strategy.system },
    { role: "user" as const, content: userPrompt },
  ]

  const endpoints = [
    {
      url: `${config.zerog.computeUrl}/chat/completions`,
      key: config.zerog.computeApiKey,
      model: "deepseek-chat",
      name: "0G Compute",
    },
    {
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: config.groqKey,
      model: "llama-3.1-8b-instant",
      name: "Groq",
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
          temperature: 0.7,
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

      console.log(`[${strategy.name}] via ${ep.name}: ${parsed.action} ${parsed.target}`)

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
