import { createZGComputeNetworkBroker } from "@0gfoundation/0g-compute-ts-sdk"
import { ethers } from "ethers"

const rpc = process.env.ZEROG_RPC_URL || "https://evmrpc-testnet.0g.ai"
const pk = process.env.PRIVATE_KEY

if (!pk) {
  console.error("Set PRIVATE_KEY in .env.local")
  process.exit(1)
}

async function main() {
  const provider = new ethers.JsonRpcProvider(rpc)
  const wallet = new ethers.Wallet(pk!, provider)
  console.log("Wallet:", wallet.address)

  const balance = await provider.getBalance(wallet.address)
  console.log("Balance:", ethers.formatEther(balance), "0G")

  if (balance === 0n) {
    console.error("No balance! Get tokens from https://faucet.0g.ai")
    process.exit(1)
  }

  console.log("\nCreating 0G Compute broker...")
  const broker = await createZGComputeNetworkBroker(wallet)

  try {
    const ledger = await broker.ledger.getLedger()
    console.log("Ledger already exists! Balance:", ledger.totalBalance.toString())
  } catch {
    console.log("No ledger found. Creating with 0.05 0G deposit...")
    await broker.ledger.addLedger(0.05)
    console.log("Ledger created!")
  }

  console.log("\nAvailable providers:")
  const services = await broker.inference.listService()
  for (const s of services) {
    console.log(`  ${(s as any).provider} | ${(s as any).model} | ${(s as any).serviceType} | ${(s as any).verifiability}`)
  }

  console.log("\nSetup complete!")
}

main().catch(console.error)
