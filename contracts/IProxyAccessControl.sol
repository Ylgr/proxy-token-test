// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IProxyAccessControl {
    function isOperator() external view returns (bool);
    function checkAllow() external view;
}
