// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "./IProxyAccessControl.sol";

contract IntermediateToken is ERC20Permit {
    string private _name = "Beincom";
    string private _symbol = "BIC";
    IProxyAccessControl proxyAccessControl;

    constructor(IProxyAccessControl _proxyAccessControl) ERC20(_name, _symbol) ERC20Permit(_name) {
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
