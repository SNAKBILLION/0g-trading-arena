import { ethers } from "ethers"
import { config } from "./config"
import type { Decision } from "./types"

const ARENA_ABI = [
  "function anchorDecision(string decisionId, string strategyName, bytes32 contentHash, string storageRootHash) external",
  "function getDecision(string decisionId) external view returns (tuple(string decisionId, string strategyName, bytes32 contentHash, string storageRootHash, uint256 timestamp, address signer))",
  "function totalDecisions() external view returns (uint256)",
  "event DecisionAnchored(string indexed decisionId, string strategyName, bytes32 contentHash, string storageRootHash, uint256 timestamp, address signer)",
]

function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(config.arenaContract, ARENA_ABI, signerOrProvider)
}

export async function anchorDecision(decision: Decision, storageRootHash: string) {
  const provider = new ethers.JsonRpcProvider(config.zerog.rpc)
  const signer = new ethers.Wallet(config.privateKey, provider)
  const contract = getContract(signer)

  // Hash the full decision JSON for integrity verification
  const json = JSON.stringify(decision, null, 2)
  const contentHash = ethers.keccak256(ethers.toUtf8Bytes(json))

  const tx = await contract.anchorDecision(
    decision.id,
    decision.strategy_name,
    contentHash,
    storageRootHash,
  )

  const receipt = await tx.wait()
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  }
}

export async function verifyDecision(decisionId: string) {
  const provider = new ethers.JsonRpcProvider(config.zerog.rpc)
  const contract = getContract(provider)
  const record = await contract.getDecision(decisionId)
  return {
    decisionId: record.decisionId,
    strategyName: record.strategyName,
    contentHash: record.contentHash,
    storageRootHash: record.storageRootHash,
    timestamp: Number(record.timestamp),
    signer: record.signer,
  }
}

// Sign an EIP-191 receipt for extra verifiability
export async function signReceipt(decision: Decision, storageRootHash: string) {
  const signer = new ethers.Wallet(config.privateKey)
  const message = `0G-Arena|${decision.id}|${decision.strategy_name}|${storageRootHash}|${decision.timestamp}`
  const signature = await signer.signMessage(message)
  return { message, signature, signer: signer.address }
}
