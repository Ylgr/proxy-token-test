// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "@openzeppelin/contracts/token/ERC777/ERC777.sol";
import "./IProxyAccessControl.sol";

contract AdvanceToken is ERC777 {
    IProxyAccessControl proxyAccessControl;
    constructor(IProxyAccessControl _proxyAccessControl) ERC777("Bein Community", "BIC", new address[](0)) {
        _mint(_msgSender(), 6339777879 * 1e18,  "", "");
        proxyAccessControl = _proxyAccessControl;
    }

    function _spendAllowance(
        address owner,
        address spender,
        uint256 amount
    ) internal virtual override {
        if(!proxyAccessControl.isOperator()) {
            super._spendAllowance(owner, spender, amount);
        }
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        proxyAccessControl.checkAllow();
        super._beforeTokenTransfer(operator, from, to, amount);
    }
}

