import { ethers } from "hardhat";
const { singletons } = require('@openzeppelin/test-helpers');
require('@openzeppelin/test-helpers/configure')

async function main() {
  const signers = await ethers.getSigners();
  const address = signers[0].address;
  const erc1820 = await singletons.ERC1820Registry(address);

  const ProxyAccessControl = await ethers.getContractFactory("ProxyAccessControl");
  const proxyAccessControl = await ProxyAccessControl.deploy();

  await proxyAccessControl.deployed();
  console.log(`Deploy success ProxyAccessControl on ${proxyAccessControl.address}`)

  const BasicToken = await ethers.getContractFactory("BasicToken");
  const basicToken = await BasicToken.deploy(proxyAccessControl.address);
  console.log(`Deploy success BasicToken on ${basicToken.address}`)
  await basicToken.deployed();

  const AdvanceToken = await ethers.getContractFactory("BasicToken");
  const advanceToken = await AdvanceToken.deploy(proxyAccessControl.address);

  console.log(`Deploy success AdvanceToken on ${advanceToken.address}`)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
