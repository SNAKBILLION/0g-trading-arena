# 0G Trading Arena — Verifiable AI Strategy Competition

> Built for the **0G Zero Cup** hackathon. Powered by 0G Storage + Compute + Chain.

Three AI trading strategies analyze the same live market data from CoinGecko. Every decision runs through 0G Compute (TEE-verified inference), the full audit log (market snapshot + AI reasoning + trading signal) is stored on 0G Storage (immutable, Merkle-verified), and the content hash is anchored on 0G Chain via the ArenaRegistry smart contract. Anyone can independently verify that no decision was tampered with.

## Architecture

```
CoinGecko API ──► Market Snapshot
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
  Momentum       Mean Reverter   Volume
  Hunter         Strategy        Sentinel
  (0G Compute)   (0G Compute)   (0G Compute)
        │             │             │
        ▼             ▼             ▼
   Decision JSON (market data + reasoning + signal)
        │
        ▼
   0G Storage  →  rootHash (immutable audit log)
        │
        ▼
   0G Chain    →  ArenaRegistry.anchorDecision()
                  (contentHash + rootHash on-chain)
        │
        ▼
   Frontend    →  Leaderboard + Verify buttons
                  (links to 0G explorer for proof)
```

## Why this is real work on 0G

| Layer | Use | Details |
|-------|-----|---------|
| **0G Compute** | AI inference via TEE-verified provider | Each strategy prompt runs through `router-api.0g.ai` — tamper-proof reasoning |
| **0G Storage** | Full audit log per decision | Uploaded via `@0glabs/0g-ts-sdk` Indexer — immutable rootHash on testnet |
| **0G Chain** | On-chain integrity anchor | ArenaRegistry smart contract stores keccak256(decision) + storageRootHash |

## Setup

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local
# Fill in PRIVATE_KEY (test wallet)

# 3. Fund test wallet
# Visit https://faucet.0g.ai — request ~0.1 0G for:
# <your-wallet-address>

# 4. Deploy ArenaRegistry contract
# Use Remix or Hardhat on 0G Galileo (chainId: 16601)
# Then set ARENA_CONTRACT in .env.local

# 5. Run
npm run dev
```

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind**
- **@0glabs/0g-ts-sdk** for Storage
- **router-api.0g.ai** for Compute (OpenAI-compatible)
- **ethers v6** for Chain interaction + EIP-191 receipts
- **CoinGecko API** for live market data

## Strategies

| Strategy | Philosophy | Typical Behavior |
|----------|-----------|-----------------|
| Momentum Hunter | Follow strong moves | LONG pumpers, SHORT dumpers |
| Mean Reverter | Fade extremes | SHORT overbought, LONG oversold |
| Volume Sentinel | Volume leads price | Accumulation = LONG, Distribution = SHORT |

## License

MIT
