// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/// @title TokenZwap — a pool for two ERC-20 tokens
/// @notice The AMM itself also implements the ERC-20 token used for LP receipts.
contract TokenZwap is ERC20, ReentrancyGuard {
    // Allow IERC20 token references to use checked transfer helpers.
    using SafeERC20 for IERC20;

    /// @notice Address of the first token managed by this pool.
    address public immutable tokenA;

    /// @notice Address of the second token managed by this pool.
    address public immutable tokenB;

    /// @notice Amount of Token A accounted for as pool liquidity, in base units.
    uint256 public reserveA;

    /// @notice Amount of Token B accounted for as pool liquidity, in base units.
    uint256 public reserveB;

    /// @notice Choose the pool's two tokens once, when deploying the AMM.
    /// @param tokenA_ Address of the deployed Club42 token.
    /// @param tokenB_ Address of the deployed Swap42 token.
    constructor(address tokenA_, address tokenB_) ERC20("TokenZwap LP", "TZLP") {
        require(tokenA_ != address(0) && tokenB_ != address(0), "Token address is zero");
        require(tokenA_ != tokenB_, "Tokens must be different");

        tokenA = tokenA_;
        tokenB = tokenB_;
    }

    /// @notice Fund an empty pool and receive its first LP receipts.
    /// @dev For the fixed-supply Club42/Swap42 pair; fee-on-transfer tokens are unsupported.
    /// Both token allowances must be approved before calling this function.
    /// Initial LP supply is sqrt(amountA * amountB), rounded down, all to the caller.
    /// @param amountA Token A to deposit, in base units.
    /// @param amountB Token B to deposit, in base units.
    function addInitialLiquidity(uint256 amountA, uint256 amountB) external nonReentrant {
        require(totalSupply() == 0, "Pool already initialized");
        require(amountA > 0 && amountB > 0, "Deposit both tokens");

        uint256 shares = Math.sqrt(amountA * amountB);

        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountB);

        reserveA = amountA;
        reserveB = amountB;
        _mint(msg.sender, shares);
    }
}
