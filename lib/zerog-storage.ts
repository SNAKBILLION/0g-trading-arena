import { ethers } from "ethers"
import { config } from "./config"
import type { Decision } from "./types"
import { writeFileSync, readFileSync, mkdirSync, unlinkSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"

// Use require — the new SDK has ESM export quirks with Next.js
const SDK = require("@0gfoundation/0g-storage-ts-sdk") as {
  Indexer: any
  ZgFile: any
}

export async function uploadDecision(decision: Decision): Promise<{
  rootHash: string
  txHash: string
}> {
  const signer = new ethers.Wallet(
    config.privateKey,
    new ethers.JsonRpcProvider(config.zerog.rpc),
  )
  const indexer = new SDK.Indexer(config.zerog.storageIndexer)

  const json = JSON.stringify(decision, null, 2)
  const tmpPath = join(tmpdir(), `arena-${decision.id}.json`)
  writeFileSync(tmpPath, json)

  try {
    const file = await SDK.ZgFile.fromFilePath(tmpPath)
    const [result, err] = await indexer.upload(file, config.zerog.rpc, signer, {
      tags: "0x" + Buffer.from("0g-arena-v1").toString("hex"),
      finalityRequired: true,
    })

    if (err || !result) {
      throw new Error(`0G Storage upload failed: ${err?.message ?? "unknown"}`)
    }

    await file.close()
    const r: any = result
    return {
      rootHash: r.rootHash ?? r.rootHashes?.[0],
      txHash: r.txHash ?? r.txHashes?.[0] ?? "",
    }
  } finally {
    try { unlinkSync(tmpPath) } catch {}
  }
}

export async function downloadDecision(rootHash: string): Promise<Decision> {
  const indexer = new SDK.Indexer(config.zerog.storageIndexer)
  const tmpPath = join(tmpdir(), `arena-dl-${Date.now()}.json`)

  const err = await indexer.download(rootHash, tmpPath, true)
  if (err) throw new Error(`Download failed: ${err?.message ?? "unknown"}`)

  const raw = readFileSync(tmpPath, "utf-8")
  try { unlinkSync(tmpPath) } catch {}
  return JSON.parse(raw)
}
