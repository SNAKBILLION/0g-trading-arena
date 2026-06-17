import "@nomicfoundation/hardhat-toolbox";
export default {
  solidity: "0.8.20",
  networks: {
    zerog: {
      url: "https://evmrpc-testnet.0g.ai",
      chainId: 16601,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
