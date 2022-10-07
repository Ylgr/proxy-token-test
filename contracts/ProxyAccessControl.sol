// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./IProxyAccessControl.sol";

contract ProxyAccessControl is AccessControl, Pausable, IProxyAccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function pause() external virtual {
        require(hasRole(OPERATOR_ROLE, _msgSender()), "ProxyAccessControl: Must have operator role to pause");
        _pause();
    }

    function unpause() external virtual {
        require(hasRole(OPERATOR_ROLE, _msgSender()), "ProxyAccessControl: Must have operator role to unpause");
        _unpause();
    }

    function isOperator() external view returns (bool) {
        return hasRole(OPERATOR_ROLE, _msgSender());
    }

    function checkAllow() external view {
        _requireNotPaused();
    }
}
