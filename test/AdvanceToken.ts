import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
const { singletons } = require('@openzeppelin/test-helpers');
const toBN = require('web3-utils').toBN

require('@openzeppelin/test-helpers/configure')

describe("AdvanceToken", () => {
    const deployContract
        = async () => {
        const signers = await ethers.getSigners();
        const deployer = signers[0].address;
        const erc1820 = await singletons.ERC1820Registry(deployer);
        const ProxyAccessControl = await ethers.getContractFactory("ProxyAccessControl");
        const proxyAccessControl = await ProxyAccessControl.deploy();

        await proxyAccessControl.deployed();

        const AdvanceToken = await ethers.getContractFactory("AdvanceToken");
        const advanceToken = await AdvanceToken.deploy(proxyAccessControl.address);

        const BasicToken = await ethers.getContractFactory("BasicToken");
        const basicToken = await BasicToken.deploy(proxyAccessControl.address);

        await proxyAccessControl.deployed();
        const UsingERC777SenderHook = await ethers.getContractFactory("UsingERC777SenderHook");
        const usingERC777SenderHook = await UsingERC777SenderHook.deploy(advanceToken.address, basicToken.address);
        await basicToken.transfer(usingERC777SenderHook.address, await basicToken.balanceOf(deployer));


        return { advanceToken, deployer, proxyAccessControl, signers, usingERC777SenderHook, erc1820, basicToken }
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
        it("user 1 cannot send token from user 0", async () => {
            const { advanceToken, deployer, signers } = await deployContract()
            try {
                await expect(
                    advanceToken.connect(signers[1]).operatorSend(
                        deployer,
                        signers[1].address,
                        '10000000000000000000',
                        '0x00000000000000000000000000000000',
                        '0x00000000000000000000000000000000'
                    )
                ).to.revertedWith('ERC777: caller is not an operator for holder')
            } catch (e) {

            }

        })

        it("user 0 cannot send to token address because not have registry", async () => {
            const { advanceToken, deployer, signers } = await deployContract()
            try {
                await expect(
                    advanceToken.send(
                        advanceToken.address,
                        '10000000000000000000',
                        '0x00000000000000000000000000000000',
                    )
                ).to.revertedWith('ERC777: token recipient contract has no implementer for ERC777TokensRecipient')
            } catch (e) {

            }
        })

        it("user 0 can still send token to user 1", async () => {
            const { advanceToken, deployer, signers } = await deployContract()
            await advanceToken.send(
                signers[1].address,
                '10000000000000000000',
                '0x00000000000000000000000000000000',
            )
            expect((await advanceToken.balanceOf(signers[1].address)).toString()).to.equal("10000000000000000000")
        })

        describe("usingERC777SenderHook", () => {
            it("contract can send token of user 0 if user 0 call", async () => {
                const { advanceToken, deployer, signers, usingERC777SenderHook, erc1820, basicToken } = await deployContract()
                await usingERC777SenderHook.registerHookForAccount(deployer)

                await erc1820.methods.setInterfaceImplementer(
                    deployer,
                    '0x29ddb589b1fb5fc7cf394961c1adf5f8c6454761adf795e67fe149f658abe895',
                    usingERC777SenderHook.address
                ).send({from: deployer})

                const erc1820Interface = await erc1820.methods.getInterfaceImplementer(deployer, '0x29ddb589b1fb5fc7cf394961c1adf5f8c6454761adf795e67fe149f658abe895').call()
                expect(erc1820Interface.toString()).to.equal(usingERC777SenderHook.address)

                expect((await basicToken.balanceOf(deployer)).toString()).to.equal("0")

                await advanceToken.send(
                    signers[1].address,
                    '10000000000000000000',
                    '0x00000000000000000000000000000000',
                )
                expect((await advanceToken.balanceOf(signers[1].address)).toString()).to.equal("10000000000000000000")
                expect((await basicToken.balanceOf(deployer)).toString()).to.equal("100000000000000000")
            })
            it("contract can send token of user 1 if user 0 call", async () => {
                const { advanceToken, deployer, signers, usingERC777SenderHook, erc1820, basicToken } = await deployContract()
                const user1 = signers[1]
                await usingERC777SenderHook.registerHookForAccount(user1.address)

                await erc1820.methods.setInterfaceImplementer(
                    user1.address,
                    '0x29ddb589b1fb5fc7cf394961c1adf5f8c6454761adf795e67fe149f658abe895',
                    usingERC777SenderHook.address
                ).send({from: user1.address})

                const erc1820Interface = await erc1820.methods.getInterfaceImplementer(user1.address, '0x29ddb589b1fb5fc7cf394961c1adf5f8c6454761adf795e67fe149f658abe895').call()
                expect(erc1820Interface.toString()).to.equal(usingERC777SenderHook.address)

                expect((await basicToken.balanceOf(user1.address)).toString()).to.equal("0")

                await advanceToken.send(
                    signers[1].address,
                    '10000000000000000000',
                    '0x00000000000000000000000000000000',
                )

                await advanceToken.connect(user1).send(
                    signers[1].address,
                    '10000000000000000000',
                    '0x00000000000000000000000000000000',
                )
                expect((await basicToken.balanceOf(user1.address)).toString()).to.equal("100000000000000000")
            })
        })
    })




})
