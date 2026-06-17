import { ethers } from "ethers";
import { readFileSync } from "fs";
import solc from "solc";

const source = readFileSync("contracts/ArenaRegistry.sol", "utf8");
const input = JSON.stringify({
  language: "Solidity",
  sources: { "ArenaRegistry.sol": { content: source } },
  settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } } },
});

const output = JSON.parse(solc.compile(input));
const compiled = output.contracts["ArenaRegistry.sol"]["ArenaRegistry"];
const abi = compiled.abi;
const bytecode = "0x" + compiled.evm.bytecode.object;

const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

console.log("Deploying from:", wallet.address);
const factory = new ethers.ContractFactory(abi, bytecode, wallet);
const contract = await factory.deploy();
await contract.waitForDeployment();
console.log("ArenaRegistry deployed:", await contract.getAddress());
