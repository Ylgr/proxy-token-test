import { ethers } from "hardhat";

async function main() {
  const ProxyAccessControl = await ethers.getContractFactory("ProxyAccessControl");
  const proxyAccessControl = await ProxyAccessControl.deploy();

  await proxyAccessControl.deployed();
  console.log(`Deploy success ProxyAccessControl on ${proxyAccessControl.address}`)

  const AdvanceToken = await ethers.getContractFactory("AdvanceToken");
  const advanceToken = await AdvanceToken.deploy(proxyAccessControl.address);

  await advanceToken.deployed();
  console.log(`Deploy success AdvanceToken on ${advanceToken.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
