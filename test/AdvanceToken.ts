import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
const { singletons } = require('@openzeppelin/test-helpers');
require('@openzeppelin/test-helpers/configure')

describe("AdvanceToken", () => {
    const deployContract = async () => {
        const signers = await ethers.getSigners();
        const address = signers[0].address;
        const erc1820 = await singletons.ERC1820Registry(address);
        const ProxyAccessControl = await ethers.getContractFactory("ProxyAccessControl");
        const proxyAccessControl = await ProxyAccessControl.deploy();

        await proxyAccessControl.deployed();

        const AdvanceToken = await ethers.getContractFactory("BasicToken");
        const advanceToken = await AdvanceToken.deploy(proxyAccessControl.address);
        return { advanceToken }
    }

    it("should correct name & symbol", async () => {
        const { advanceToken } = await deployContract()
        expect(await advanceToken.symbol()).to.equal("BIC")
    })

})
