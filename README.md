# 0G Trading Arena — Verifiable AI Strategy Competition

> **0G Zero Cup Hackathon** | Built on 0G Storage + 0G Compute + 0G Chain

Three AI trading strategies analyze the same live market data. Every decision runs through verifiable AI inference, the full audit log is stored immutably on 0G Storage, and the content hash is anchored on 0G Chain. Anyone can independently verify that no decision was tampered with.

## Live Demo

**Testnet Explorer Proof:**
- **ArenaRegistry Contract:** [`0x164163C88843c32DD5dEa96cAAb3FbfcDA233033`](https://chainscan-galileo.0g.ai/address/0x164163C88843c32DD5dEa96cAAb3FbfcDA233033)
- **Sample Storage Tx:** [`0x8e78a5a3919d7e3a1f4cf847291ef12fa4eb38342411451708b6e6179248d1ca`](https://chainscan-galileo.0g.ai/tx/0x8e78a5a3919d7e3a1f4cf847291ef12fa4eb38342411451708b6e6179248d1ca)

## Architecture

```
CoinGecko API ──► Market Snapshot (10 coins, real-time)
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
  Momentum       Mean Reverter   Volume
  Hunter         Strategy        Sentinel
  (AI Inference)  (AI Inference) (AI Inference)
        │             │             │
        ▼             ▼             ▼
   Decision JSON ─── market data + reasoning + signal
        │
        ▼
   0G Storage ────► rootHash (immutable, Merkle-verified)
        │
        ▼
   0G Chain ──────► ArenaRegistry.anchorDecision()
                    keccak256(decision) + rootHash on-chain
        │
        ▼
   Frontend ──────► Leaderboard + Explorer links
```

## 0G Integration Proof

| Layer | What We Use | How | Proof |
|-------|------------|-----|-------|
| **0G Storage** | Every decision uploaded as JSON via `@0gfoundation/0g-storage-ts-sdk` | `Indexer.upload()` returns immutable rootHash | Live txHash on Galileo explorer |
| **0G Chain** | ArenaRegistry smart contract anchors `keccak256(decision)` + `storageRootHash` | On-chain integrity — anyone can verify hash matches stored data | Contract verified on explorer |
| **0G Compute** | Code-ready for TEE-verified inference via `@0gfoundation/0g-compute-ts-sdk` | Requires 3 0G ledger deposit (faucet rate-limited) | SDK integrated, broker pattern implemented |

## Strategies

| Strategy | Philosophy | Behavior |
|----------|-----------|----------|
| **Momentum Hunter** | Follow strong moves with volume confirmation | LONG pumpers, SHORT dumpers |
| **Mean Reverter** | Fade overextended moves | SHORT overbought, LONG oversold |
| **Volume Sentinel** | Volume leads price | Accumulation = LONG, Distribution = SHORT |

## Verification Flow

1. User clicks "Run Competition Round"
2. CoinGecko API returns live market data for 10 coins
3. Three AI strategies independently analyze the same snapshot
4. Each decision (market data + reasoning + signal) is uploaded to **0G Storage**
5. `keccak256(decision JSON)` + `storageRootHash` anchored on **0G Chain** via ArenaRegistry
6. Frontend displays explorer links — anyone can verify the full chain

**Tamper detection:** If anyone modifies the stored decision, the keccak256 hash won't match the on-chain record. Verification is permissionless.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **@0gfoundation/0g-storage-ts-sdk** for 0G Storage uploads
- **ethers v6** for 0G Chain interaction + EIP-191 receipts
- **CoinGecko API** for live market data
- **Solidity 0.8.20** for ArenaRegistry contract

## Setup

```bash
# Clone and install
git clone https://github.com/SNAKBILLION/0g-trading-arena.git
cd 0g-trading-arena
npm install

# Configure
cp .env.example .env.local
# Fill PRIVATE_KEY (test wallet) and ARENA_CONTRACT

# Fund wallet (one-time)
# Visit https://faucet.0g.ai — request 0G tokens for your wallet address

# Deploy contract
node scripts/deploy.js

# Run
npm run dev
```

## Project Structure

```
├── app/
│   ├── layout.tsx          # App shell + header
│   ├── page.tsx            # Leaderboard + competition runner
│   └── api/
│       ├── scan/           # CoinGecko market data
│       ├── compete/        # Full pipeline: AI → Storage → Chain
│       └── anchor/         # Verify decision integrity
├── lib/
│   ├── coingecko.ts        # Market data fetcher
│   ├── zerog-compute.ts    # AI strategy inference
│   ├── zerog-storage.ts    # 0G Storage upload/download
│   ├── zerog-chain.ts      # 0G Chain anchoring + verification
│   └── types.ts            # TypeScript types
├── contracts/
│   └── ArenaRegistry.sol   # On-chain decision registry
└── scripts/
    └── deploy.js           # Contract deployment script
```

## License

MIT