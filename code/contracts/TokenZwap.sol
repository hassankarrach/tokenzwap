// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/// @title TokenZwap — a pool for two ERC-20 tokens
/// @notice The AMM itself also implements the ERC-20 token used for LP receipts.
contract TokenZwap is ERC20, ReentrancyGuard, IERC721Receiver {
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

    struct Listing {
        address seller;
        address paymentToken;
        uint256 price;
    }

    /// @notice NFT contract => token ID => listing; zero seller means not listed.
    mapping(address => mapping(uint256 => Listing)) public listings;

    event NFTListed(
        address indexed nft,
        uint256 indexed tokenId,
        address indexed seller,
        address paymentToken,
        uint256 price
    );

    event NFTCancelled(address indexed nft, uint256 indexed tokenId, address indexed seller);
    event NFTPurchased(
        address indexed nft,
        uint256 indexed tokenId,
        address indexed buyer,
        address seller,
        address paymentToken,
        uint256 price
    );
    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB, uint256 shares);
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB, uint256 shares);
    event Swapped(address indexed trader, address indexed tokenIn, uint256 amountIn, uint256 amountOut);

    /// @notice Choose the pool's two tokens once, when deploying the AMM.
    /// @param tokenA_ Address of the deployed Club42 token.
    /// @param tokenB_ Address of the deployed Swap42 token.
    constructor(address tokenA_, address tokenB_) ERC20("TokenZwap LP", "TZLP") {
        require(tokenA_ != address(0) && tokenB_ != address(0), "Token address is zero");
        require(tokenA_ != tokenB_, "Tokens must be different");
        require(tokenA_.code.length > 0 && tokenB_.code.length > 0, "Tokens must be contracts");

        tokenA = tokenA_;
        tokenB = tokenB_;
    }

    /// @notice Fund an empty pool and receive its first LP receipts.
    /// @dev For the fixed-supply Club42/Swap42 pair; fee-on-transfer tokens are unsupported.
    /// Both token allowances must be approved before calling this function.
    /// Initial LP supply is sqrt(amountA * amountB), rounded down, all to the caller.
    /// @param amountA Token A to deposit, in base units.
    /// @param amountB Token B to deposit, in base units.
    function addInitialLiquidity(uint256 amountA, uint256 amountB)
        external
        nonReentrant
    {
        require(totalSupply() == 0, "Pool already initialized");
        require(amountA > 0 && amountB > 0, "Deposit both tokens");

        uint256 shares = Math.sqrt(amountA * amountB);

        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountB);

        reserveA = amountA;
        reserveB = amountB;
        _mint(msg.sender, shares);
        emit LiquidityAdded(msg.sender, amountA, amountB, shares);
    }

    /// @notice Add both tokens at the existing pool ratio and receive LP receipts.
    /// @dev Exact ratios only: mismatched inputs revert without retaining either token.
    /// Shares round down; deposits that would mint zero shares revert.
    /// Cross-products use checked arithmetic, suitable for the fixed-supply pair.
    /// Both token allowances must be approved before calling this function.
    /// @param amountA Token A to deposit, in base units.
    /// @param amountB Token B to deposit, in base units.
    function addLiquidity(
        uint256 amountA,
        uint256 amountB
    ) external nonReentrant {
        uint256 supply = totalSupply();
        require(supply > 0 && reserveA > 0 && reserveB > 0, "Pool is empty");
        require(amountA > 0 && amountB > 0, "Deposit both tokens");
        require(amountA * reserveB == amountB * reserveA, "Incorrect deposit ratio");

        uint256 shares = Math.mulDiv(amountA, supply, reserveA);
        require(shares > 0, "Deposit too small");

        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountB);

        reserveA += amountA;
        reserveB += amountB;
        _mint(msg.sender, shares);
        emit LiquidityAdded(msg.sender, amountA, amountB, shares);
    }

    /// @notice Burn your LP receipts to withdraw your share of both reserves.
    /// @dev Outputs round down. Burning the entire LP supply returns all accounted reserves.
    /// No LP allowance is needed: only the caller's own receipts can be burned.
    /// @param shares LP receipts to burn, in base units.
    /// @return amountA Token A returned to the caller.
    /// @return amountB Token B returned to the caller.
    function removeLiquidity(
        uint256 shares
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        require(shares > 0, "Withdraw positive shares");
        require(shares <= balanceOf(msg.sender), "Insufficient LP shares");

        uint256 supply = totalSupply();
        amountA = Math.mulDiv(shares, reserveA, supply);
        amountB = Math.mulDiv(shares, reserveB, supply);
        require(amountA > 0 && amountB > 0, "Withdrawal too small");

        // Update ownership and accounting before calling either token contract.
        _burn(msg.sender, shares);
        reserveA -= amountA;
        reserveB -= amountB;

        IERC20(tokenA).safeTransfer(msg.sender, amountA);
        IERC20(tokenB).safeTransfer(msg.sender, amountB);
        emit LiquidityRemoved(msg.sender, amountA, amountB, shares);
    }

    /// @notice Swap Token A for B, or Token B for A, retaining a 1% fee in the pool.
    /// @dev Output rounds down. Only the fixed-supply, standard-transfer pair is supported.
    /// Approve the input token before calling. Pricing uses 99% of the input without
    /// rounding that adjusted input separately; reserves receive the full input.
    /// @param tokenIn Address of the token to pay: tokenA or tokenB.
    /// @param amountIn Input amount, in base units.
    /// @return amountOut Tokens sent back to the caller.
    function swap(
        address tokenIn,
        uint256 amountIn
    ) external nonReentrant returns (uint256 amountOut) {
        require(tokenIn == tokenA || tokenIn == tokenB, "Unsupported token");
        require(amountIn > 0, "Swap positive amount");
        require(reserveA > 0 && reserveB > 0, "Pool is empty");

        bool aToB = tokenIn == tokenA;
        uint256 reserveIn = aToB ? reserveA : reserveB;
        uint256 reserveOut = aToB ? reserveB : reserveA;
        address tokenOut = aToB ? tokenB : tokenA;

        uint256 adjustedInput = amountIn * 99;
        amountOut = Math.mulDiv(adjustedInput, reserveOut, reserveIn * 100 + adjustedInput);
        require(amountOut > 0 && amountOut < reserveOut, "Invalid swap output");

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        if (aToB) {
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            reserveB += amountIn;
            reserveA -= amountOut;
        }

        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);
        emit Swapped(msg.sender, tokenIn, amountIn, amountOut);
    }

    /// @notice Escrow an NFT you own at a fixed price in Token A or Token B.
    /// @dev Approve this contract on the NFT first. Intended for standard ERC-721s
    /// such as Art42. Listing never changes liquidity reserves.
    /// @param nft Address of the ERC-721 collection.
    /// @param tokenId NFT ID to escrow.
    /// @param paymentToken Token A or Token B address.
    /// @param price Sale price in payment-token base units.
    function listNFT(address nft, uint256 tokenId, address paymentToken, uint256 price)
        external
        nonReentrant
    {
        require(nft.code.length > 0, "Invalid NFT contract");
        require(paymentToken == tokenA || paymentToken == tokenB, "Unsupported payment token");
        require(price > 0, "Price is zero");
        require(listings[nft][tokenId].seller == address(0), "NFT already listed");
        require(IERC721(nft).ownerOf(tokenId) == msg.sender, "Not NFT owner");

        // Record the listing before the transfer so the receiver can validate it.
        listings[nft][tokenId] = Listing(msg.sender, paymentToken, price);
        IERC721(nft).safeTransferFrom(msg.sender, address(this), tokenId);
        require(IERC721(nft).ownerOf(tokenId) == address(this), "NFT not escrowed");

        emit NFTListed(nft, tokenId, msg.sender, paymentToken, price);
    }

    /// @notice Cancel your listing and safely receive the escrowed NFT.
    /// @dev Clearing the listing before transfer prevents reuse during callbacks.
    /// A seller contract must accept ERC-721 safe transfers. Failure reverts everything.
    function cancelNFTListing(address nft, uint256 tokenId) external nonReentrant {
        Listing memory listing = listings[nft][tokenId];
        require(listing.seller != address(0), "NFT not listed");
        require(listing.seller == msg.sender, "Not listing seller");

        delete listings[nft][tokenId];
        IERC721(nft).safeTransferFrom(address(this), msg.sender, tokenId);

        emit NFTCancelled(nft, tokenId, msg.sender);
    }

    /// @notice Buy an escrowed NFT at its current listed price in its payment token.
    /// @dev Approve the payment token first. Payment goes directly to the seller;
    /// neither liquidity reserves nor LP supply are changed. Any failed payment or
    /// NFT delivery reverts the entire purchase, including listing deletion.
    /// @param nft ERC-721 collection address.
    /// @param tokenId Listed NFT ID.
    function buyNFT(
        address nft,
        uint256 tokenId
    ) external nonReentrant {
        Listing memory listing = listings[nft][tokenId];
        require(listing.seller != address(0), "NFT not listed");

        delete listings[nft][tokenId];
        IERC20(listing.paymentToken).safeTransferFrom(msg.sender, listing.seller, listing.price);
        IERC721(nft).safeTransferFrom(address(this), msg.sender, tokenId);

        emit NFTPurchased(nft, tokenId, msg.sender, listing.seller, listing.paymentToken, listing.price);
    }

    /// @notice ERC-721 receiver callback required for safe NFT escrow transfers.
    /// @dev Sending NFTs directly does not create a listing; use listNFT instead.
    function onERC721Received(address, address, uint256, bytes calldata)
        external
        pure
        override
        returns (bytes4)
    {
        return IERC721Receiver.onERC721Received.selector;
    }
}
