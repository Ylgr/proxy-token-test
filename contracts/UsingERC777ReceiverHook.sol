// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777.sol";
import "@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol";

contract UsingERC777ReceiverHook is IERC777Recipient {
    IERC777 public token;
    IERC1820Registry public registry
    = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);

    // keccak256('ERC777TokensRecipient')
    bytes32 constant private TOKENS_RECIPIENT_INTERFACE_HASH
    = 0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b;

    mapping(address => uint256) private _balances;

    constructor(IERC777 _token) {
        token = _token;

        registry.setInterfaceImplementer(
            address(this),
            TOKENS_RECIPIENT_INTERFACE_HASH,
            address(this)
        );
    }

    function tokensReceived(
        address /*operator*/,
        address from,
        address /*to*/,
        uint256 amount,
        bytes calldata /*userData*/,
        bytes calldata /*operatorData*/
    ) external override {
        require(msg.sender == address(token), "Invalid token");

        // like approve + transferFrom, but only one tx
        _balances[from] += amount;
    }

    function getBalance() public view returns(uint256) {
        return _balances[msg.sender];
    }
}
