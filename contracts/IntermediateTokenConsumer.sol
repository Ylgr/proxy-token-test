// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "./IntermediateToken.sol";
import "hardhat/console.sol";


contract IntermediateTokenConsumer {
    IntermediateToken public intermediateToken;
    constructor(IntermediateToken _intermediateToken) {
        intermediateToken = _intermediateToken;
    }

    function oppTransfer(
        address destination,
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        intermediateToken.permit(owner, spender, value, deadline, v, r, s);
        uint256 allowance = intermediateToken.allowance(owner, spender);
        console.log("allow: %s", allowance);
        console.log("value: %s", value);

    intermediateToken.transferFrom(owner, destination, value);
    }
}
