import { ethers, run, network} from "hardhat";
const { singletons } = require('@openzeppelin/test-helpers');
require('@openzeppelin/test-helpers/configure')

async function main() {
  if(network.name == 'hardhat' || network.name === 'localhost'){
    const signers = await ethers.getSigners();
    const address = signers[0].address;
    const erc1820 = await singletons.ERC1820Registry(address);
  }


  const ProxyAccessControl = await ethers.getContractFactory("ProxyAccessControl");
  const proxyAccessControl = await ProxyAccessControl.deploy();

  await proxyAccessControl.deployed();
  console.log(`Deploy success ProxyAccessControl on ${proxyAccessControl.address}`)

  const BasicToken = await ethers.getContractFactory("BasicToken");
  const basicToken = await BasicToken.deploy(proxyAccessControl.address);
  console.log(`Deploy success BasicToken on ${basicToken.address}`)
  await basicToken.deployed();

  const AdvanceToken = await ethers.getContractFactory("AdvanceToken");
  const advanceToken = await AdvanceToken.deploy(proxyAccessControl.address);
  await advanceToken.deployed();

  console.log(`Deploy success AdvanceToken on ${advanceToken.address}`)

  const priceFeedAddress = '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526';

  const priceFeedConsumerFactory = await ethers.getContractFactory('PriceConsumerV3');
  const priceFeedConsumer = await priceFeedConsumerFactory.deploy(priceFeedAddress);

  const WAIT_BLOCK_CONFIRMATIONS = 6;
  await priceFeedConsumer.deployTransaction.wait(WAIT_BLOCK_CONFIRMATIONS);

  console.log(`Contract PriceConsumerV3 deployed to ${priceFeedConsumer.address}`);

  console.log(`Verifying contract on Etherscan...`);

  await run(`verify:verify`, {
    address: proxyAccessControl.address,
    constructorArguments: [],
  });

  await run(`verify:verify`, {
    address: basicToken.address,
    constructorArguments: [proxyAccessControl.address],
  });

  await run(`verify:verify`, {
    address: advanceToken.address,
    constructorArguments: [proxyAccessControl.address],
  });

  await run(`verify:verify`, {
    address: priceFeedConsumer.address,
    constructorArguments: [priceFeedAddress],
  });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
