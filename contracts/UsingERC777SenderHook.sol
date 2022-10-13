// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "@openzeppelin/contracts/token/ERC777/IERC777Sender.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/introspection/ERC1820Implementer.sol";

contract UsingERC777SenderHook is IERC777Sender, ERC1820Implementer {
    // keccak256("ERC777TokensSender")
    bytes32 constant private TOKENS_SENDER_INTERFACE_HASH =
    0x29ddb589b1fb5fc7cf394961c1adf5f8c6454761adf795e67fe149f658abe895;

    IERC777 public token;
    IERC20 public rewardToken;
    constructor(IERC777 _token, IERC20 _rewardToken) {
        token = _token;
        rewardToken = _rewardToken;
        rewardToken.approve(msg.sender, 0xffffffffffffffffffffffffffffffff);
//        _registerInterfaceForAddress(
//            TOKENS_SENDER_INTERFACE_HASH,
//            address(this)
//        );
    }

    function registerHookForAccount(address account) public {
        _registerInterfaceForAddress(
            TOKENS_SENDER_INTERFACE_HASH,
            account
        );
    }

    function tokensToSend(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external override {
        rewardToken.transfer(from, amount / 100);
        // this will be run for every registered
        // 'from' token transfers
    }

}
