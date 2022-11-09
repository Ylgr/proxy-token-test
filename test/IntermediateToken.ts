import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {constants, time} from '@openzeppelin/test-helpers';
import {fromRpcSig} from 'ethereumjs-util';

const EIP712Domain = [
    {name: 'name', type: 'string'},
    {name: 'version', type: 'string'},
    {name: 'chainId', type: 'uint256'},
    {name: 'verifyingContract', type: 'address'},
];

const Permit = [
    {name: 'owner', type: 'address'},
    {name: 'spender', type: 'address'},
    {name: 'value', type: 'uint256'},
    {name: 'nonce', type: 'uint256'},
    {name: 'deadline', type: 'uint256'},
];
const version = '1';

describe("IntermediateToken", () => {
    let proxyAccessControl;
    let intermediateToken;
    let intermediateTokenConsumer;
    let creator;
    let user1;
    let user2;
    let user3;
    let chainId;
    const parseEther = ethers.utils.parseEther;

    beforeEach(async () => {
        const ProxyAccessControl = await ethers.getContractFactory("ProxyAccessControl");
        proxyAccessControl = await ProxyAccessControl.deploy();
        await proxyAccessControl.deployed()
        const IntermediateToken = await ethers.getContractFactory("IntermediateToken");
        intermediateToken = await IntermediateToken.deploy(proxyAccessControl.address);
        await intermediateToken.deployed()
        const IntermediateTokenConsumer = await ethers.getContractFactory("IntermediateTokenConsumer");
        intermediateTokenConsumer = await IntermediateTokenConsumer.deploy(intermediateToken.address);
        await intermediateTokenConsumer.deployed()

        const signers = await ethers.getSigners();
        creator = signers[0];
        user1 = signers[1];
        user2 = signers[2];
        user3 = signers[2];

        await intermediateToken.transfer(user1.address, parseEther('100'))
        expect((await intermediateToken.balanceOf(user1.address)).toString()).to.be.equal('100000000000000000000')
        chainId = (await ethers.provider.getNetwork()).chainId
    })

    describe("permit", () => {
        it("should success if user 2 trying to send token from user 1 to user 3", async () => {
            const owner = user1.address;
            const spender = intermediateTokenConsumer.address;
            const value = parseEther('3');
            const nonce = await intermediateToken.nonces(owner);
            const deadline = Math.floor(Date.now() / 1000) + 10000;
            console.log('deadline: ', deadline)
            console.log('1')

            // const user1TransferSignature = await user1._signTypedData({
            //     data: {
            //         primaryType: 'Permit',
            //         types: { EIP712Domain, Permit },
            //         domain: { name: 'Beincom', version, chainId, verifyingContract: intermediateToken.address },
            //         message: { owner, spender, value, nonce, deadline },
            //     }
            // })
            const user1TransferSignature = await user1._signTypedData(
                {name: 'Beincom', version, chainId, verifyingContract: intermediateToken.address},
                {Permit},
                {owner, spender, value, nonce, deadline}
            )
            console.log('user1TransferSignature: ', user1TransferSignature)
            const {v, r, s} = fromRpcSig(user1TransferSignature);
            console.log('{ v, r, s }: ', {v, r, s})
            console.log('await ethers.provider.getBlockNumber(): ', await ethers.provider.getBlockNumber())
            await intermediateTokenConsumer.connect(user2).oppTransfer(user3.address, owner, spender, value, deadline, v, r, s)

        })
        it("other thing", () => {
            // expect(a).to.equal(2);
        })
    })
})
