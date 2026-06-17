import { NextResponse } from "next/server"
import { downloadDecision } from "@/lib/zerog-storage"
import { verifyDecision } from "@/lib/zerog-chain"
import { ethers } from "ethers"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  const rootHash = searchParams.get("rootHash")

  if (!id || !rootHash) {
    return NextResponse.json({ error: "id and rootHash required" }, { status: 400 })
  }

  try {
    // Fetch from 0G Storage
    const storedDecision = await downloadDecision(rootHash)

    // Fetch from 0G Chain
    const chainRecord = await verifyDecision(id)

    // Verify integrity: hash stored JSON and compare with on-chain hash
    const json = JSON.stringify(storedDecision, null, 2)
    const computedHash = ethers.keccak256(ethers.toUtf8Bytes(json))
    const matches = computedHash === chainRecord.contentHash

    return NextResponse.json({
      verified: matches,
      stored_decision: storedDecision,
      chain_record: chainRecord,
      computed_hash: computedHash,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
