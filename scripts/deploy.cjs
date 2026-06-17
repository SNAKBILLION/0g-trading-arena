const hre = require("hardhat");
async function main() {
  const factory = await hre.ethers.getContractFactory("ArenaRegistry");
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const addr = await contract.getAddress();
  console.log("ArenaRegistry deployed:", addr);
}
main().catch((e) => { console.error(e); process.exit(1); });
