import { NextResponse } from "next/server"
import { fetchMarketData } from "@/lib/coingecko"

export async function GET() {
  try {
    const market = await fetchMarketData()
    return NextResponse.json({ market, timestamp: Date.now() })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
