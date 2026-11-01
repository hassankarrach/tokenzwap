# Smart-contract source reference

Source implementation is complete for mandatory contract features. Compilation,
dependencies, automated contract tests and deployment remain pending. This document
describes intended behavior, not verified results.

## Assets and ownership

Club42 and Swap42 each issue 42,000 tokens with 18 decimals to the deployer.
They have no public mint function or privileged confiscation function. Art42 permits
public minting of IDs 1–10; its constructor needs an IPFS directory ending in `/`.
TokenZwap itself is the transferable LP ERC-20, named TokenZwap LP (TZLP).
There is no exchange administrator or protocol fee withdrawal.

All ERC-20 amounts, prices and LP quantities are base-unit integers. Scope follows
SUBJECT.txt, mandatory section IV. Minimum-output/slippage and deadline features
are listed in subject chapter V as bonuses and are deliberately excluded.

## Pool interface

| Function | Behavior |
| --- | --- |
| `addInitialLiquidity(amountA, amountB)` | Approve A/B first. For zero LP supply only. Mint `floor(sqrt(amountA * amountB))` receipts to the caller. |
| `addLiquidity(amountA, amountB)` | Approve A/B first. Require positive amounts at the exact reserve ratio. Mint `floor(amountA * totalSupply / reserveA)` receipts; reject zero receipts. |
| `removeLiquidity(shares)` | Burn only caller-owned receipts. Return `floor(shares * reserve / totalSupply)` of each asset using supply before burning. Reject zero output of either asset. No LP approval is needed. |
| `swap(tokenIn, amountIn)` | Approve input first. Input must be A or B; output is the other asset. Require a funded pool and positive input/output. |

Swap output is:

```text
floor(amountIn * 99 * reserveOut / (reserveIn * 100 + amountIn * 99))
```

Only final output is rounded down; the scaled input is not rounded separately.
The entire input enters reserves: the fixed 1% pricing fee stays with liquidity
providers. For 100 A / 200 B and 10 A input, output is about 18.016378526 B.

Pool getters are `tokenA`, `tokenB`, `reserveA`, `reserveB`, and inherited ERC-20
getters including `totalSupply` and `balanceOf`. LiquidityAdded, LiquidityRemoved
and Swapped events describe completed pool actions, alongside ERC-20 Transfer events.

## Marketplace interface

| Function | Behavior |
| --- | --- |
| `listNFT(nft, tokenId, paymentToken, price)` | Owner approves TokenZwap on the NFT first. Accept only positive prices in A/B and unlisted IDs. Record the listing, safely transfer into escrow, and check custody. |
| `cancelNFTListing(nft, tokenId)` | Only the recorded seller can cancel. Delete the listing and safely return the NFT. |
| `buyNFT(nft, tokenId)` | Buyer approves payment first. Require an active listing and use its current payment token and price. Delete listing, pay seller directly, then safely deliver NFT to buyer. |
| `listings(nft, tokenId)` | Return seller, paymentToken and price. A zero seller means no active listing. |

NFTListed, NFTCancelled and NFTPurchased events support discovering listings and
following their lifecycle. Purchases use the current listing at execution time, including a listing replaced
between transaction submission and execution. No bonus price or deadline guard is included.

Marketplace actions never modify reserve variables or LP supply, and purchase
payments never pass through the pool. All asset-moving entry points use
nonReentrant. Purchase/cancellation delete listings before external transfers.
A failed payment, approval, NFT delivery or receiver callback reverts the entire
transaction, restoring payment, listing and NFT ownership as applicable.
Contract buyers/sellers must accept safe ERC-721 delivery.

The standard ERC-721 receiver callback accepts safe transfers so listing escrow
works. Sending or minting NFTs directly to TokenZwap does not create a listing.

## Policies and limitations to verify

- Only the intended standard-transfer Club42/Swap42 pair is supported. Fee-on-transfer
  and rebasing tokens are unsupported. Constructor code checks do not certify ERC-20 behavior.
- Reserves account only for deposits, swaps and withdrawals. Direct ERC-20 donations
  are deliberately excluded from pricing/withdrawals and have no recovery function;
  do not transfer tokens directly to the pool. They stay excluded after reinitialization.
- Initial LP receipts all go to the first provider; none are permanently locked.
  Full redemption empties accounted reserves and allows a new initial deposit.
- Later deposits reject excess or mismatched ratios instead of returning excess.
  After swaps, exact integer ratios may require impractically large deposits.
  Improving this requires a deliberate future interface/accounting change.
- All proportional outputs round down. Tiny withdrawals yielding zero of either
  asset revert. Checked arithmetic may revert on large products; supported fixed
  supplies keep ordinary accounting within bounds, while arbitrary huge inputs may revert.
- NFT collections are expected to follow ERC-721, as Art42 does. Owner checks and
  receiver checks cannot certify malicious collections or guarantee their behavior.
- Unsolicited safe or plain NFT transfers and direct mints can strand unlisted NFTs. There is no admin or unlisted-asset rescue function.
- No quote helper, listing enumeration array, royalties or protocol marketplace fee
  is included. Clients can read reserves/listings and discover listings from events.
- No minimum-output, slippage or deadline protections are included: these are
  bonus features in the subject. Prices can change before execution. No frontend
  or deployment is supplied yet.

Tests must cover accounting with multiple providers, fee/rounding properties,
authorization, both payment assets, relisting, failed external calls,
reentrancy and unchanged pool accounting across marketplace flows. All remain pending.
