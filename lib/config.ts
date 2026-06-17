export const config = {
  zerog: {
    rpc: process.env.ZEROG_RPC_URL || "https://evmrpc-testnet.0g.ai",
    chainId: Number(process.env.ZEROG_CHAIN_ID || 16601),
    storageIndexer: process.env.ZEROG_STORAGE_INDEXER || "https://indexer-storage-testnet-turbo.0g.ai",
    computeUrl: process.env.ZEROG_COMPUTE_URL || "https://router-api.0g.ai/v1",
    computeApiKey: process.env.ZEROG_COMPUTE_API_KEY || "",
  },
  privateKey: process.env.PRIVATE_KEY || "",
  arenaContract: process.env.ARENA_CONTRACT || "",
  groqKey: process.env.GROQ_API_KEY || "",
  coingecko: process.env.COINGECKO_API || "https://api.coingecko.com/api/v3",
}
