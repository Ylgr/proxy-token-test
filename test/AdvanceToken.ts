import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
const { singletons } = require('@openzeppelin/test-helpers');
const toBN = require('web3-utils').toBN

require('@openzeppelin/test-helpers/configure')

describe("AdvanceToken", () => {
    const deployContract = async () => {
        const signers = await ethers.getSigners();
        const deployer = signers[0].address;
        const erc1820 = await singletons.ERC1820Registry(deployer);
        const ProxyAccessControl = await ethers.getContractFactory("ProxyAccessControl");
        const proxyAccessControl = await ProxyAccessControl.deploy();

        await proxyAccessControl.deployed();

        const AdvanceToken = await ethers.getContractFactory("BasicToken");
        const advanceToken = await AdvanceToken.deploy(proxyAccessControl.address);
        return { advanceToken, deployer, proxyAccessControl, signers }
    }

    it("should correct name & symbol", async () => {
        const { advanceToken } = await deployContract()
        expect(await advanceToken.symbol()).to.equal("BIC")
    })

    it("should mint enough balance for deployer", async () => {
        const { advanceToken , deployer } = await deployContract()
        expect((await advanceToken.balanceOf(deployer)).toString()).to.equal("6339777879000000000000000000")
    })

    describe("transfer", () => {
        it("user 2 cannot send token from user 1", async () => {
            const { advanceToken, deployer, signers } = await deployContract()
            await expect(advanceToken.connect(signers[1]).transferFrom(deployer, advanceToken.address, '10000000000000000000'))
                .to.be.revertedWith('ERC20: insufficient allowance')
        })
    })


})
