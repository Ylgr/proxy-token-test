// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IProxyAccessControl.sol";

contract BasicToken is ERC20 {
    IProxyAccessControl proxyAccessControl;
    constructor(IProxyAccessControl _proxyAccessControl) ERC20("Bein Community", "BIC") {
        proxyAccessControl = _proxyAccessControl;
        _mint(_msgSender(), 6339777879 * 1e18);
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
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        proxyAccessControl.checkAllow();
        super._beforeTokenTransfer(from, to, amount);
    }
}

