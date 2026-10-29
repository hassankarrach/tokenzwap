// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Swap42 test token paired with Club42
/// @notice Adapted from the owner's Club42 token; supply is fixed at deployment.
contract Swap42 is ERC20 {
    /// @notice Total supply in base units (18 decimals).
    uint256 public constant INITIAL_SUPPLY = 42_000 * 10 ** 18;

    /// @notice Give the deployer the supply for liquidity and test-user distribution.
    constructor() ERC20("Swap42", "SWAP42") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}
