# TokenZwap — record for the explanation walkthrough

Created 2026-11-03. Use this document when the owner starts the post-project
explanation session. Explain one concept at a time using these actual actions and
values, then open the corresponding contract function. Do not restart with
unrelated example numbers or assume unfinished verification has passed.

## Evidence conventions

- **Reported:** the owner confirmed completing an action or supplied UI text.
- **Observed UI:** browser inspection showed the state/transaction request.
- **RPC checked:** a read-only public BNB testnet query returned the recorded state.
- **Derived:** calculated from recorded values using the contract's integer math;
  not a transaction receipt or a separately saved historical state query.

Most transaction hashes were not captured. Balance snapshots corroborate the
flows but do not replace receipt/event evidence. Do not invent missing hashes,
gas usage, exact timestamps, failed transactions or approval amounts.
All wallet transactions were signed by the owner. Agent actions were source
changes, read-only checks, and opening the listing request for owner confirmation.

## Network, contracts and accounts

Network: BNB Smart Chain Testnet, chain ID 97. All fungible assets use 18 decimals.
The deployed contracts were reused throughout; no redeployments occurred during
this walkthrough. Full deployment receipts/settings: deployment/bnb-testnet.json
and deployment/bnb-testnet-verification.json.

| Name | Public address |
| --- | --- |
| Original wallet / deployer / first provider / NFT buyer | `0xfd568988A31f0Bac0d70d8bC9084F00B050FCFd3` |
| Second wallet / second provider / swapper / NFT seller | `0x7d54E7B84160eC1e894D88fd3ce2c96e48D4b709` |
| CLUB42 / token A | `0xf98415c58645CB07e9428201e987658cE4B177Cc` |
| SWAP42 / token B | `0x1368611388191C3064C105dAB78B8BDCD734061E` |
| Art42 / ART42 | `0x484CB98D952650502433934Ffb49bA25953563B9` |
| TokenZwap pool + marketplace + TZLP ERC-20 | `0x58dCA96E9F99C5FF63c68C4feCF73fb6843dE1D7` |

Each ERC-20 initially minted 42,000 tokens to the original wallet. Art42 offers
public minting of IDs 1–10 once each. Minting costs network gas, not a sale price.

Funding context: original wallet read 0.106264862 tBNB during the first session;
second wallet read 0.01 tBNB at block 140469638. Later UI readings included
0.009729 tBNB after liquidity tests. These are historical, not current balances.
Saved funding link: https://ghostchain.io/faucet/bnb-testnet/ (FAUCETS.md).
Importing custom tokens in MetaMask only displays them; it sends no transfer and
costs no gas. The owner imported CLUB42/SWAP42 and discussed optional TZLP import.

## 1. First provider: approve both tokens, then deposit

**Reported**, with the exact initial values corroborated by subsequent pool state:
original account approved CLUB42 and SWAP42, then deposited **100 CLUB42 + 200
SWAP42** into the initially empty pool. UI approval logic grants the entered
amount; original approval receipts were not archived.

Explain three separate transactions:

1. CLUB42 `approve(pool, amountA)`: record permission; no token transfer.
2. SWAP42 `approve(pool, amountB)`: separate token, separate permission.
3. Pool `addInitialLiquidity(amountA, amountB)`: use the permissions to transfer
   both tokens, record reserves and issue TZLP to the provider.

Contract: code/contracts/TokenZwap.sol, addInitialLiquidity().
Token inheritance: code/contracts/Club42.sol and Swap42.sol, OpenZeppelin ERC20.
Frontend: frontend/src/liquidity.js and views/InitialLiquidity.jsx.

Initial shares: `floor(sqrt(amountA * amountB))` in integer base units.
**Derived** initial supply: **141.421356237309504880 TZLP**, all held by the first
provider (100% ownership). Trailing zeros may be omitted by the UI.

Teaching question to revisit: why not mint 100 shares instead? A fixed initial
share quantity can work as a different unit policy if later accounting is
consistent. This implementation uses the geometric mean to scale initial units
symmetrically with both deposits. It grants no extra value or ownership merely
because the numerical supply is 141.42 rather than 100. Later deposits do not
reuse the square-root minting formula.

## 2. First provider: partial withdrawal of 10 TZLP

Owner asked how much to withdraw; suggested **10 TZLP**, owner reported completion.
Contract: removeLiquidity(shares). No LP approval is required; it burns only the
caller's own receipts.

Formula per token: `floor(shares * reserve / totalSupply)`.
**Derived**, matching the subsequent RPC reserve snapshot:

| Quantity | Exact tokens |
| --- | --- |
| CLUB42 returned | 7.071067811865475244 |
| SWAP42 returned | 14.142135623730950488 |
| Remaining reserve A | 92.928932188134524756 |
| Remaining reserve B | 185.857864376269049512 |
| Remaining original-wallet TZLP / total supply | 131.421356237309504880 |

The first wallet remained the only provider and owned 100% of the smaller pool.
RPC block **140469638** later checked these reserves and LP supply.

## 3. Fund the second account and add a second provider

At block **140469638**, RPC checked second wallet: **0.01 tBNB, zero CLUB42,
zero SWAP42, zero TZLP**. Suggested actions, reported completed by owner:

1. Original wallet sends **20 CLUB42 + 40 SWAP42** to the second wallet using
   MetaMask's token Send. This is wallet-to-wallet funding, not pool liquidity.
2. Switch the app's connected account to the second wallet.
3. Enter **10 CLUB42 + 20 SWAP42** on Add liquidity, approve input tokens as
   needed, then confirm the separate deposit.

Contract: addLiquidity(). It requires the exact cross-product ratio:
`amountA * reserveB == amountB * reserveA`.
Minting formula: `floor(amountA * totalSupply / reserveA)`.

**RPC checked, block 140471609:**

| Quantity | Exact tokens |
| --- | --- |
| Second wallet CLUB42 / SWAP42 | 10 / 20 |
| Second wallet newly minted TZLP | 14.142135623730950487 |
| Original wallet TZLP | 131.421356237309504880 |
| Pool reserve A | 102.928932188134524756 |
| Pool reserve B | 205.857864376269049512 |
| Total TZLP supply | 145.563491861040455367 |

Second-provider ownership: approximately **9.7154%**. Original shares were not
split or taken away; new TZLP increased total supply alongside increased reserves.

UI detail: Use pool ratio currently fills a deposit equal to **100% of current
reserves**, explicitly labelled. It is not a small-deposit preset. Exact base-unit
ratios can become awkward after swaps or rounding; do not promise arbitrary
rounded amounts will always be accepted.

## 4. Second provider: MAX full withdrawal and the rounding discussion

Suggested action: stay on second wallet, Withdraw → MAX → confirm. Owner reported:
CLUB42 **19.9999**, SWAP42 **39.9999**, TZLP **0**, tBNB **0.009729** in the UI.
The wallet already held the unused 10 CLUB42 + 20 SWAP42 from funding.

The exact preview supplied by the owner before withdrawing was:

| Quantity | Exact amount |
| --- | --- |
| All second-wallet TZLP burned | 14.142135623730950487 |
| CLUB42 returned | 9.999999999999999999 |
| SWAP42 returned | 19.999999999999999998 |
| Difference from that account's 10/20 deposit | 1 CLUB42 base unit + 2 SWAP42 base units |

**Derived** resulting second-wallet balances: **19.999999999999999999 CLUB42**
and **39.999999999999999998 SWAP42**, zero TZLP. Subsequent swap snapshots support
these numbers. Remaining reserves: **92.928932188134524757 CLUB42** and
**185.857864376269049514 SWAP42**; LP supply returned to
**131.421356237309504880**, all in the original wallet.

### Required explanation: where did the tiny units go?

The owner explicitly requested explaining this clearly after project completion.
Revisit it slowly, using the numbers above and the Solidity lines, not just saying
"rounding is normal".

- Both LP minting and proportional withdrawal use integer rounding down.
- A fraction can be more precise than either token/share's 18-decimal units.
- The 1 and 2 base units remain in the pool's actual token balances and accounted
  reserves. They are not burned, an administrator payment, or a withdrawal fee.
- After this provider exits, those units are represented by remaining LP holders.
- Burning the entire remaining LP supply returns all accounted reserves under the
  current formula. Local contract tests cover full exit/reinitialization with
  clean amounts; this exact dust case still deserves explicit regression coverage.
- Finite precision is unavoidable; this particular round-down allocation policy
  is a design choice. Other remainder-tracking designs exist.
- LP ownership is a claim on current reserves, not a guarantee of original token
  quantities after trading/fees.
- The UI's four-place truncation makes 19.999999999999999999 appear as 19.9999.
  Display truncation is separate from the on-chain 1-base-unit difference.

## 5. Second account swaps 10 CLUB42 for SWAP42

Owner reported swapping **10 CLUB42**. Frontend approves the input token if
allowance is insufficient, then calls pool `swap(tokenA, 10 * 10^18)`.

Exact output **derived from checked wallet/reserve differences**:
**17.893727165800338505 SWAP42**.

**RPC checked after the reported swap** (block number was not retained in PLAN.md):

| Quantity | Exact tokens |
| --- | --- |
| Second wallet CLUB42 | 9.999999999999999999 |
| Second wallet SWAP42 | 57.893727165800338503 |
| Reserve A | 102.928932188134524757 |
| Reserve B | 167.964137210468711009 |
| LP supply | 131.421356237309504880 |

Contract: swap(). `adjustedInput = amountIn * 99`;
`amountOut = floor(adjustedInput * reserveOut / (reserveIn * 100 + adjustedInput))`.
Full input enters reserves; 99% is used for pricing, retaining a 1% fee.
For this trade, nominal retained fee is **0.1 CLUB42**. The output also reflects
the changing pool ratio; it is not merely 20 SWAP42 minus a fee.

Event lookup was rate-limited. No receipt/event hash was captured; do not describe
this as a completed transaction-log audit.

## 6. Reverse swap: second account pays 1 SWAP42

Owner reported completion after direction reversal. **RPC checked, block 140483930:**

| Quantity | Exact tokens |
| --- | --- |
| Input | 1 SWAP42 |
| CLUB42 received (difference) | 0.603120139871539582 |
| Second wallet CLUB42 | 10.603120139871539581 |
| Second wallet SWAP42 | 56.893727165800338503 |
| Reserve A | 102.325812048262985175 |
| Reserve B | 168.964137210468711009 |
| LP supply | 131.421356237309504880 |

Nominal retained input fee: **0.01 SWAP42**. Swap operations do not mint/burn TZLP.
Frontend references: src/swap.js and views/LiveSwap.jsx. Minimum-output and deadline
parameters remain excluded as bonus scope, so the displayed quote is an estimate.

## 7. Mint Campus Tiger / Art42 #1 on the second account

Initially the owner explicitly had not tried NFT steps; later browser inspection
showed mint confirmation and ownership by the second wallet. Captured mint link:
https://testnet.bscscan.com/tx/0xbb1356bbfe29f3347657f9f74e6c4436b4fa4d642393f8361f097af1dff5acf0

Contract: Art42.mint(1), validates ID/not already minted, then _safeMint to caller.
Observed UI: **Campus Tiger / Art42 #1**, owned by second wallet.
This transaction's receipt has not been independently archived in the repository.
Catalog imagery/traits are original project previews, not fresh tokenURI evidence.

## 8. Seller NFT approval versus creation of the 5-CLUB42 listing

Owner initially said List NFT did nothing, then thought listing had executed.
Browser inspection first showed Approve Art42 #1 and a disabled List NFT button.
We clarified the UI into two sequential actions with explanatory status.

**RPC checked at block 140492402:**

- Art42 #1 owner: second wallet.
- getApproved(1): TokenZwap pool/marketplace address.
- isApprovedForAll(owner, marketplace): false (per-token approval was sufficient).
- Listing seller/payment token: zero address; price zero — no listing yet.

This proved the NFT was approved but not listed. It does not prove which button
label the owner saw or identify the approval transaction hash.

Next, agent inspected the open tab and requested **List Art42 #1 for 5 CLUB42**.
MetaMask displayed the pool address, BNB testnet and estimated gas ~0.0002 tBNB
(estimate only, not an archived actual fee). Agent stopped; owner confirmed.
Owner then supplied: **"Listed for 5.0 CLUB42. The marketplace holds this NFT in
escrow."** This listing state was owner-reported, not a saved RPC snapshot.

Contract: listNFT(Art42, 1, CLUB42, 5 * 10^18). Records seller/token/price and
safe-transfers the NFT from seller into marketplace escrow. No sale payment yet.
NFT approval permits the transfer; listing actually creates the sale and escrow.

## 9. Original account purchases Art42 #1 for 5 CLUB42

Suggested and owner-reported completed:

1. Switch to original account (buyer); second account is the seller.
2. Select listed Art42 #1.
3. Approve exactly **5 CLUB42** if allowance is insufficient.
4. Confirm **Buy** as a separate transaction.

The purchase is corroborated by the latest same-block snapshot below. No buy or
buyer-approval transaction hash was captured. Do not claim a separate approval was
necessarily required if allowance already sufficed.

### Approval and Buy are different calls

- Buyer approval: CLUB42.approve(marketplace, 5 * 10^18). It authorizes spending;
  tokens stay in the buyer's wallet and NFT stays in escrow.
- Buy: TokenZwap.buyNFT(Art42, 1). It reads the current listing, deletes it,
  transfers **5 CLUB42 directly buyer-to-seller** and safely transfers the NFT
  escrow-to-buyer. Failed payment/delivery reverts the entire purchase.
- This token approval is different from the seller's earlier ERC-721 approval.
- Each submitted transaction uses tBNB gas. The NFT price is paid in CLUB42,
  not tBNB. NFT proceeds never enter liquidity reserves or mint LP shares.

### Latest RPC evidence: block 140494172

Saved machine-readable evidence: documentation/walkthrough-latest-snapshot.json.
Read timestamp: 2026-11-03T02:33:13.252Z (UTC, as stored by RPC check script).

| Wallet | CLUB42 | SWAP42 | TZLP |
| --- | --- | --- | --- |
| Original / buyer | 41882.071067811865475244 | 41774.142135623730950488 | 131.421356237309504880 |
| Second / seller | 15.603120139871539581 | 56.893727165800338503 | 0 |

- Art42 #1 owner is now the original wallet.
- Listing seller/payment token are zero and price is zero (listing cleared).
- Seller CLUB42 increased by exactly **5** versus the pre-purchase snapshot.
- Original-wallet CLUB42 is consistent with 42,000 initial supply, the recorded
  liquidity withdrawal/funding history and the 5-token purchase.
- Reserve A: **102.325812048262985175**, equal to actual pool CLUB42 holdings.
- Reserve B: **168.964137210468711009**, equal to actual pool SWAP42 holdings.
- LP supply: **131.421356237309504880**.
- Reserves and LP supply match the post-reverse-swap snapshot: this CLUB42 NFT
  purchase did not change pool accounting. Individual marketplace receipt/event
  evidence still needs archiving to make the proof more complete.

## Questions and concepts the owner wants explained later

Use the stages above, one at a time, with a small example and corresponding code:

1. Permissions vs transfers: both ERC-20 and ERC-721 approvals, who can spend what,
   where allowances live, when consumed, and why direct transfers are not deposits.
2. First LP mint amount vs ownership percentage; geometric mean vs fixed initial
   share-count policy; proportional new minting for later providers.
3. Partial vs full withdrawal, integer rounding, whereabouts of remainder units,
   final-provider exit, and UI precision (explicit owner request).
4. Exact-ratio deposit cross-products and usability after reserve changes.
5. Constant-product pricing vs a fixed exchange rate, 1% retained fees, and swaps
   changing reserves without changing LP supply.
6. NFT mint → per-token approval → escrow listing → buyer token approval → buy;
   distinguish ownership from sale listing and payment from escrow custody.
7. Seller cancellation and relisting, atomic rollback, access control and
   reentrancy, with test evidence and limitations rather than assumed guarantees.

## Remaining work — do not mark these complete from this document

- Live seller cancellation and relisting, then NFT purchase in SWAP42 using two
  accounts. Verify ownership, both wallets' payment changes and reserve isolation.
- Capture missing receipts/events where available and record public evidence;
  a latest-state snapshot does not establish every historical transaction detail.
- Review/add remaining contract edge coverage, especially this exact LP dust
  example, small rounding values, duplicate/missing listings, invalid IDs/tokens,
  unauthorized paths and external-call/rollback behavior. Eight focused contract
  tests were previously reported passing; 23 frontend tests currently pass.
- Confirm original Art42 remote image/metadata availability; current gallery uses
  labelled local previews. Confirm evaluator wallet/token distribution instructions.
- Finish architecture diagrams, screenshots, limitations and clean reproducible
  setup/test/deployment instructions. Deployment itself is already done.
- Save/push subsequent work when requested; do not assume changes after commit
  151784a are on GitHub. Record actual completion rather than checking every box.
- After mandatory verification/documentation: guided explanation/defense session
  using this record, then agreed bonuses (slippage/minimum output, deadlines,
  price-impact display). Bonuses are not implemented in mandatory scope.
