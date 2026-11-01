// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
interface IMarket { function buyNFT(address nft, uint256 id) external; }
contract Buyer is IERC721Receiver {
    IMarket public market;
    address public nft;
    bool public rejectReceipt;
    bool public nestedBlocked;
    constructor(address market_, address nft_) { market = IMarket(market_); nft = nft_; }
    function purchase(address token, uint256 id, bool reject_) external {
        rejectReceipt = reject_;
        IERC20(token).approve(address(market), type(uint256).max);
        market.buyNFT(nft, id);
    }
    function onERC721Received(address, address, uint256, bytes calldata) external returns (bytes4) {
        require(!rejectReceipt, "Reject NFT receipt");
        // A second listed NFT would be purchasable if the guard were absent.
        try market.buyNFT(nft, 2) { nestedBlocked = false; }
        catch { nestedBlocked = true; }
        return IERC721Receiver.onERC721Received.selector;
    }
}
