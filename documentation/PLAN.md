# Three-day guided plan

**Next-session priority:** read [NEXT-SESSION.md](NEXT-SESSION.md). The owner agreed
to focused educational bonuses including simple dynamic fees and flash loans,
with contract changes tested locally before one planned replacement deployment.
Earlier exclusions refer to mandatory scope, not this updated optional direction.

## Time budget and expectations

Target 24–30 focused hours across three days with guided implementation and reuse of existing token/NFT code. This is an ambitious delivery target, not a guarantee. Two days is a stretch if the environment is already familiar. If the core accounting is unclear or tests fail, extend the schedule rather than skip verification. This is a testnet learning project, not an audited production exchange.

Keep the interface plain. Finish mandatory requirements before optional features. Follow the provided SUBJECT.txt. Minimum-output/slippage and deadline protections belong to bonus chapter V and are excluded from mandatory scope.

## Day 1 — understand and build the pool (8–10 hours)

1. Explain the whole project in plain language; complete Step 1 (20–30 minutes).
2. Review the existing ERC-20 and NFT repositories. Select familiar tools; install and pin dependencies. Prefer a single local blockchain/testing toolchain and a small frontend (60–90 minutes).
3. Set up two test tokens using the user's Tokenizer code and a test NFT fixture. Verify minting, approvals and transfers (60 minutes).
4. Implement initial deposits, LP shares and proportional later deposits. Handle incorrect ratios explicitly; document rounding and initial LP policy (2 hours).
5. Implement partial/full withdrawals and verify two providers cannot withdraw each other's shares (60–90 minutes).
6. Work through one numerical swap. Implement both directions with a fixed 1% fee retained in the pool, positive output (2 hours).
7. Run focused tests; explain each formula before the day ends (60 minutes).

Gate: deposits, swaps, fees and withdrawals behave correctly with multiple users. Do not connect a frontend to failing accounting.

## Day 2 — marketplace and interface (8–10 hours)

1. Add escrow listings in the same AMM contract. Allow only A or B as payment; restrict cancellation to the seller (90 minutes).
2. Add purchase and cancellation. Send NFT payments directly buyer-to-seller so they do not change pool reserves. Protect external-call paths against reentrancy (90 minutes).
3. Test authorization, duplicate listings, both payment tokens, purchase, cancellation and failed transfers; verify marketplace operations leave pool accounting unchanged (90 minutes).
4. Build a minimal interface: connect wallet, balances, token approvals, swaps, deposits, withdrawals, NFT approval/list/purchase/cancel (3–4 hours).
5. Show pending/success/failure, handle rejected wallet requests and refresh state after confirmation (60 minutes).

Gate: complete all mandatory user flows on a local network using two wallets.

## Day 3 — testnet, documentation and defense (8–10 hours)

1. Review integer rounding, zero amounts, empty pools, unsupported tokens,  repeat withdrawals and external calls. Add meaningful missing tests (2 hours).
2. Prepare reproducible deployment scripts and an environment example. Deploy on BNB Chain testnet with a dedicated test wallet; record network, addresses and deployment steps (90 minutes).
3. Make evaluation tokens mintable/distributable; complete every user flow with two testnet wallets (90 minutes, plus network/faucet delays).
4. Finish README setup/test/deployment instructions, architecture diagram, contract explanation, limitations and screenshots (2 hours).
5. Rehearse explaining the pool, LP ownership, fees and NFT escrow. Verify a fresh setup from the README (60–90 minutes).

Gate: passing tests, reproducible setup, working testnet demo, complete documentation, and the ability to explain the code.

## Verification checklist

- [ ] Initial liquidity and LP minting policy documented and tested.
- [ ] Later deposits preserve ratios; excess inputs are rejected or returned explicitly.
- [ ] Two users deposit and withdraw partially/fully with fair accounting.
- [ ] Swaps work both ways; fee is correct; rounding cannot drain reserves.
- [ ] Zero/invalid amounts and unsupported tokens fail clearly.
- [ ] NFT escrow, purchase and seller cancellation work with A and B.
- [ ] Unauthorized actions and reentrant external calls cannot corrupt accounting.
- [ ] Marketplace payments do not enter liquidity reserves.
- [ ] Wallet approvals, pending transactions and errors are understandable.
- [ ] Two-wallet testnet demo works; evaluator test tokens are available.
- [ ] Required repository structure and documentation are complete.

## Optional work only after the gates pass

The owner explicitly intends to complete bonus work after finishing, verifying and understanding the mandatory scope. Keep this as a planned follow-up, not discarded scope. Initial bonus targets: user-defined slippage/minimum-output protection, transaction deadlines, and frontend price-impact display. Do not implement these before the mandatory work is complete and understood. Other bonus items remain undecided.

Price-impact display, configurable slippage, transaction history and simple notifications. Leave flash loans, dynamic fees, advanced charts and royalties outside the three-day target.

## Current status — saved 2026-11-01

Mandatory contract source is implemented. All four contracts compile with solc 0.8.30, OpenZeppelin 5.4.0, optimizer 200 runs and EVM target paris. Eight focused local tests passed with individual test results confirmed. Coverage includes two-provider LP accounting and withdrawals, both swap directions and the 1% fee, invalid inputs, failed transfer rollback, both NFT payment tokens, seller authorization/cancellation/relisting, failed NFT delivery and blocked purchase reentrancy. This is focused verification, not completion of every checklist case above.

All four contracts are deployed on BNB Smart Chain Testnet (chain 97). Addresses, constructor arguments and transaction hashes are in deployment/bnb-testnet.json. RPC verification confirmed successful receipts, code presence, exact creation inputs against local compilation, fixed token supplies and the correct pool token pair. Evidence: deployment/bnb-testnet-verification.json. Actual deployment fees totaled 0.004235138 tBNB at 1 gwei, rather than the earlier estimate at 0.1 gwei. Last verified reserves and LP supply were zero. Do not redeploy to continue.

The React/Vite frontend has separate Swap, Liquidity and NFT Marketplace views, generated branding and a simplified responsive layout. It now defaults to live read-only MetaMask balances for tBNB, CLUB42, SWAP42, TZLP, pool reserves and LP supply. Chain/account changes clear obsolete reads; chain switching and refresh are supported. Existing simulated forms are isolated under Try demo. Live approvals and transaction actions are not implemented.

Validation completed: production frontend build; eight contract tests; public deployment RPC checks; Chrome checks for demo flows and desktop/mobile layout; mocked-wallet checks for connection rejection, sample balances, empty pool, wrong-chain switching, account removal and separation from demo state. Real owner MetaMask connection and live transaction flows still need manual verification. Tests initially run under the restrictive sandbox only reported a file-level pass; the subsequent fully executed eight-test run is the result that counts.

Art42 metadata was recovered from the original NFT repository at commit 656aba861e669c3ba5c23a6c14cb5b1754fe0e35. All ten remote JSON files were fetched and image URI references checked; snapshots are in deployment/metadata/. All remote image bytes/availability remain unverified. Original branded artwork is retained in frontend/assets/art42/ for later marketplace integration.

Explorer source verification is optional under the supplied subject, not a mandatory gate. Keep it as a useful follow-up, not a blocker to required functionality. Bonus work stays deferred until mandatory work is complete and understood.

## Resume with this next learning step

1. Start the frontend with Node 22+ and verify Connect wallet with the owner's actual MetaMask account on chain 97.
2. Implement live token approvals and initial liquidity only. Proposed example: 100 CLUB42 + 200 SWAP42. Use integer base units, approved amounts, pending/rejected/failed/confirmed transaction states, and refresh after receipts. The owner signs in MetaMask; never request private credentials.
3. Verify the initial deposit and resulting reserves/LP receipts before implementing further live actions.

After that: later deposits and withdrawals; swaps in both directions; NFT mint/approval/list/purchase/cancel with reused artwork; test token distribution and two-wallet testnet demonstration; remaining edge tests, diagrams, screenshots, known limitations and reproducible setup documentation.

## Resume setup and funds

Use Node.js 22 or newer. The host's default Node is 12 and cannot run this app. A temporary Node 22.14 runtime was downloaded to /tmp/node-v22.14.0-linux-x64; it may disappear between sessions. With Node 22 selected:

```sh
npm ci
npm --prefix frontend ci
npm run dev
```

Open http://127.0.0.1:5175/. Other commands: npm run contracts:compile, npm run contracts:test, npm run build. Contract tests need an environment that allows Ganache to initialize its resources. npm run deploy:wallet starts the separate deployment helper on 5176, but deployment is already complete. Server processes are temporary and may need restarting.

The owner previously received 0.01 tBNB; the current wallet balance should be read live. Saved daily funding resource: [GHOST BNB testnet faucet](https://ghostchain.io/faucet/bnb-testnet/), also in FAUCETS.md. Eligibility and cooldown can change. No automation or daily reminder was configured.

## Live initial-liquidity update — 2026-11-02

Implemented exact-amount token approvals and initial liquidity in the live Liquidity
screen. Reads now include both allowances at the same block as balances. Approval
buttons appear when needed, and deposit stays disabled until both allowances suffice.
Amounts use 18-decimal integer base units. Confirmation/pending/success/rejection/failure
states and explorer links are present; balances refresh after transactions. Wallet
account and chain are checked before sending. Later deposits/withdrawals remain out
of this step; an initialized pool disables the initial-deposit controls.

Validation: production build and five mocked transaction tests pass (exact parsing,
approval targets and amounts, deposit calldata, changed-account/network blocking,
wallet rejection). Browser access host was unavailable and native browser automation
timed out; visual/interaction QA and actual MetaMask approvals/deposit remain pending.
No public transactions were sent. The owner's saved wallet read 0.106264862 tBNB on
chain 97 today. Next: owner verifies Connect wallet, both approvals, first deposit,
and resulting reserves/TZLP before implementing later live actions.

### Colorflow visual update — 2026-11-02

Liquidity work is on standby at the owner's request. Added a live Colorflow mesh
background, editing the actual a001 mesh colors and Film Grain in Colorflow.
Final requested palette: deep teal upper region, teal/mint transitions and a brighter
pearl-white lower glow; bottom pink removed. Export ID zEZMpujd is used without
CSS recoloring, opacity changes or dark overlays. It depends on external Colorflow
hosting; paused/reduced-motion mode uses a local static gradient. Desktop appearance
and pause/resume controls checked in Brave; production build passed. Mobile and
reduced-motion visual checks remain pending. Actual MetaMask balance reads were
visible for the saved owner wallet; no approvals or deposit were signed or sent.

### Frosted cards — 2026-11-02

Applied translucent dark glass surfaces and backdrop blur to stat cards, panels,
NFT cards, listing forms and the status banner. Preserved colored stat-card rims
and added a dark fallback for browsers without backdrop-filter. Removed the
background pause control at the owner's request; reduced-motion still uses a
static gradient. Desktop Liquidity appearance and absence of the pause button
verified in Brave; production build passed. Mobile visual checks remain pending.

### Live-only interface — 2026-11-02

Removed the demo toggle, demo route rendering and live-approvals banner at the
owner's request. Navigation now exposes live balances and supported live initial
liquidity only; swap and NFT write flows remain pending. Legacy simulated views
remain in source but are no longer imported by App.

## Live withdrawals — 2026-11-03

The owner reports both token approvals and the initial deposit completed. Added a
live withdrawal form below the initial-deposit section in Liquidity. It previews
both returns using integer shares * reserve / totalSupply, rounded down exactly
like removeLiquidity(). MAX preserves all 18 decimals. Zero/excess shares, empty
pools and zero-output rounding are blocked. Withdraw calls removeLiquidity(shares)
without approval, handles wallet confirmation/pending/rejection/failure/confirmation
and replacement receipts, then refreshes balances. Account and chain are checked
before sending. No contracts were changed or redeployed.

Nine focused frontend tests pass, including partial/full withdrawal math, rounding,
invalid inputs, exact calldata with no approval and wrong-chain blocking. Production
build passes. No withdrawal was sent by the agent. Actual MetaMask execution and
post-withdrawal reserves, TZLP supply and wallet balances remain to be verified by
the owner. Later deposits, swaps and NFT writes are still pending.

## Later liquidity deposits — 2026-11-03

Owner reports the 10-TZLP partial withdrawal completed; post-transaction chain
balances have not been independently checked in this step. Connected initialized
pool deposits to addLiquidity(amountA, amountB), retaining exact-amount approvals
and confirmation states. The UI checks the contract's exact cross-product ratio,
positive inputs, wallet balances and nonzero minted shares. The TZLP preview uses
amountA * supply / reserveA, rounded down. Initial empty pools still use the initial
entry point.

Use pool ratio fills one entire reserve-sized pair (100% of current reserves),
explicitly labelled; it does not infer a small deposit or restore the prior
withdrawal. Both amounts remain editable. Integer rounding after withdrawal can
make a visually 1:2 pair fail the exact base-unit ratio; this is an existing contract
limitation, not relaxed in the UI. No contracts changed or public transactions sent.
Twelve frontend transaction/math tests and production build pass. Real later-deposit
execution, post-deposit balances and browser interaction QA remain pending.

### Dedicated task pages — 2026-11-03

Split the stacked live sections into sidebar routes: #overview for pool statistics,
#balances for wallet balances, #liquidity for deposits and #withdraw for withdrawals.
Swap and NFT routes remain. Wallet state stays shared, route changes scroll to the
top, and mobile navigation wraps to keep every link reachable. Production build
passes; desktop/mobile browser navigation checks remain pending.

### Combined overview and second-provider preparation — 2026-11-03

Pool overview and wallet balances now share #overview (Pool & balances); legacy
#balances resolves to the same page. Separate deposit/withdraw pages remain.
Read-only chain-97 RPC at block 140469638 confirmed second wallet
0x7d54E7B84160eC1e894D88fd3ce2c96e48D4b709 holds 0.01 tBNB and zero
CLUB42/SWAP42/TZLP. Pool reserves: 92.928932188134524756 CLUB42 and
185.857864376269049512 SWAP42; LP supply 131.42135623730950488. Exact ratio
is currently 1:2. This corroborates the owner's initial deposit and 10-TZLP
withdrawal. Next manual test: distribute tokens from the funded original wallet,
then connect second wallet, approve and deposit 10 CLUB42 + 20 SWAP42, check
separate LP ownership and test its withdrawal. No transfers or deposits sent by agent.

### Second-provider deposit verified — 2026-11-03

Read-only chain-97 RPC at block 140471609 confirms second-wallet balances of
10 CLUB42, 20 SWAP42 and 14.142135623730950487 TZLP. Original wallet still holds
131.42135623730950488 TZLP. Reserves are 102.928932188134524756 CLUB42 and
205.857864376269049512 SWAP42; total LP supply 145.563491861040455367.
This confirms the second-provider 10/20 deposit and separate LP balances.
Second-provider withdrawal, full exit/reinitialization and remaining live flows
are not yet verified. No transaction sent by agent.

## Required topic for the post-project explanation walkthrough

Owner explicitly requested revisiting LP rounding after the project is finished,
when the explanation walkthrough begins. Explain slowly with a small numerical
example and the relevant Solidity lines:

- Initial LP minting uses floor(sqrt(amountA * amountB)); later minting uses
  floor(amountA * totalSupply / reserveA).
- Withdrawals use floor(shares * reserve / totalSupply) for each token. Finite
  base-unit precision means a proportional entitlement need not be exactly
  representable; rounding occurs in share minting as well as withdrawal.
- In the owner's second-provider example, redeeming all 14.142135623730950487
  TZLP previews 9.999999999999999999 CLUB42 and 19.999999999999999998 SWAP42
  after depositing 10 and 20. The 1 and 2 base-unit differences stay in pool
  reserves; they are not destroyed, a withdrawal fee, or sent to an administrator.
- After that provider exits, the remainder is represented by remaining holders'
  LP ownership. Redeeming the entire remaining LP supply returns all accounted
  reserves under the current formula; verify this with tests before presenting
  it as tested behavior.
- Distinguish unavoidable finite precision from the chosen round-down policy.
  Other remainder-accounting designs exist; this exact dust outcome is not
  inevitable in every design or every withdrawal.
- LP ownership is a proportion of current reserves, not a guarantee of the
  original deposit quantities after swaps/fees. Display rounding is separate
  from actual on-chain integer rounding.

Relevant code: code/contracts/TokenZwap.sol, addInitialLiquidity(), addLiquidity()
and removeLiquidity(). This is a deferred explanation requirement, not a request
to change the contract's rounding policy now.

## Live swap step — 2026-11-03

Owner reports second-provider full withdrawal: zero TZLP and near-20/40 token
balances; exact post-withdrawal RPC verification remains pending. Implemented live
Swap page for both directions, exact-input approvals, 18-decimal integer quotes,
contract 1% retained-fee formula, wallet/network checks, pending/rejected/failed/
confirmed states, replacement receipts, explorer links and refresh after receipts.
Quotes are estimates using current reserves; no bonus minimum-output/deadline
parameters were added. No contract changes, redeployments or public swaps sent.

Production build and all 16 frontend tests pass. Swap-specific coverage includes
both directional fee calculations and reserve-product checks, invalid/zero inputs,
empty pools, insufficient balance, zero output, exact approval and swap calldata,
and account/network send guards. These are mocked frontend tests, not new contract
verification. Browser interaction QA and real swaps in both directions remain
pending. Next manual test: second account approves/swaps 1 CLUB42, checks confirmed
balances/reserves, then reverses direction and tests 1 SWAP42. Verify retained fee
and unchanged LP supply using receipts and same-block reads.

### Wallet-style card refresh — 2026-11-03

Restyled cards using the owner's supplied wallet reference: larger rounded corners,
soft top lighting, mint/teal glossy gradients, muted token-colored accents, recessed
input surfaces and pill buttons. Removed the sharp bottom-lit stat-card rims while
keeping the existing Colorflow background. Added token icons to live Swap input
and output. Desktop Swap appearance checked in Brave; mobile visual verification
remains pending. Functional transaction behavior is unchanged.

Card styling clarification: the wallet-reference redesign applies only to the live
Swap card. Scoped it under .live-swap-card and restored the previous frosted panels,
stat-card rims, balances, shared buttons and other forms.

Swap layout refinement: grouped the pay/receive panels into one tight stack, with
a centered circular reverse-direction control, token badges, right-aligned amounts
and balance captions matching the owner screenshot structure. Other cards remain
unchanged. Build passes; browser visual verification of this layout is pending.

### Live swaps checked by same-block balances — 2026-11-03

After owner-reported 10 CLUB42 -> SWAP42 trade, read balances were
9.999999999999999999 CLUB42 / 57.893727165800338503 SWAP42; reserves
102.928932188134524757 / 167.964137210468711009. Event lookup was rate-limited,
so receipt/event verification was not completed. After owner-reported reverse
1 SWAP42 trade, RPC block 140483930 shows 10.603120139871539581 CLUB42 /
56.893727165800338503 SWAP42; reserves 102.325812048262985175 /
168.964137210468711009. Differences match 1 SWAP42 paid and
0.603120139871539582 CLUB42 received. LP supply stayed 131.42135623730950488.
Both directions are corroborated by balance/reserve changes; full receipt/event
and fee-invariant evidence remains to be collected. Agent sent no transactions.
Next mandatory feature: connect live NFT marketplace flows using deployed Art42.

## Live Art42 mint/approve/list step — 2026-11-03

Connected the NFT Marketplace to deployed Art42 and TokenZwap. Reads all ten IDs'
mint status, ownership, per-token/operator approvals and escrow listings at one
block. Uses existing branded artwork as clearly labelled previews, not replacement
immutable metadata. Owners can mint an available ID, approve only that NFT to the
marketplace and list at an exact integer-base-unit CLUB42 or SWAP42 price. Listing
transfers the NFT into escrow; no sale payment occurs until purchase. Pending,
rejected, failed, confirmed/replacement receipts, explorer links and refresh are
handled. Account/network checks precede sends. Purchase/cancellation controls are
intentionally deferred to the next agreed step, not marked complete.

All 20 frontend tests pass, including mint/approval/list calldata, both payment
tokens, invalid IDs/prices/payment and wrong-network guards. Production build
passes. Browser interaction QA, live mint/approve/list and their receipts/escrow
ownership remain pending owner verification. No public transactions sent by agent;
no contract modifications or redeployment. Marketplace reserve isolation still
requires full live flow checks after purchase/cancellation integration.

## Saved checkpoint requested by owner — 2026-11-03

Owner explicitly confirms none of the suggested NFT mint/approve/list actions
have been performed. These are implemented but unverified live; purchase and
cancellation UI remain unfinished. Save/push current frontend and documentation
before changing discussion topics. Contract source and deployed addresses were
not changed during this session. All 20 frontend tests and production build pass;
broader contract, receipt/event, mobile and NFT live verification remain pending.

## TokenizeArt collection presentation reuse — 2026-11-03

Owner requested the original NFT project's listing presentation and display font.
Inspected tokenizeart-nft-minting-dapp/website/dist via the GitHub connector. Found
Gang of Three by Vic Fieger and the selected-artwork / horizontal collectible shelf
layout. Reused original scene/cutouts/font from commit 656aba8, retained font credit,
and adapted catalog, rarity/search, arrows, mouse drag/touch scrolling, character
layers and stepped bases into Art42Gallery. Source provenance is recorded in
frontend/assets/art42-source/README.md. Token 6 has no original cutout and uses its
full preview. Current chain ownership/listing state stays separate from catalog
traits and preview assets; contracts/immutable metadata are unchanged.

The display font is used across app headings/navigation/action buttons, with normal
fonts for amounts, body text and wallet identifiers. Mint/approve/list controls
remain connected alongside the selected artwork. Owner has still not performed
NFT transactions; purchasing/cancellation UI remain pending. Build passes. Browser
check showed the selected preview and global display font, but further interaction
QA was interrupted by native automation timeout; shelf filtering/selection/drag,
mobile layout and actual NFT transactions need verification. No commits/push made
for this new design step yet.

Typography clarification: Gang of Three is restricted to page headings and titles.
Sidebar, brand/logo text and buttons use their previous standard UI fonts.

Final typography scope: Gang of Three is limited to NFT Marketplace headings and
artwork titles. Other pages retain their original typography.

### NFT layout revision — 2026-11-03

Changed collection browsing from a carousel to a responsive static grid. Removed
arrow, drag and horizontal-scroll interaction code; search/rarity filters and
card selection remain. Removed the rarity/availability badges from the large NFT
preview (card status text remains). On desktop, the mint/list panel extends left
across the column gap and approximately 6% into the preview; mobile stays within
its column. Build passes; visual/browser checks of this revision remain pending.

### Listing-button diagnosis — 2026-11-03

Browser inspection shows owner wallet 0x7d54…b709 owns Art42 #1 with a mint
confirmation displayed (tx 0xbb1356bbfe29f3347657f9f74e6c4436b4fa4d642393f8361f097af1dff5acf0).
The NFT is not approved to the marketplace: Approve Art42 #1 was visible and
List NFT was disabled. Replaced the unexplained disabled listing action with a
sequential UI: step 1 approval, then step 2 listing after a confirmed allowance
read. Added visible reasons instead of silent returns on loading/invalid action.
Four NFT transaction tests and build pass. Agent did not approve/list the NFT;
real approval/listing still require owner confirmation and verification.

## NFT purchase and cancellation controls — 2026-11-03

Owner confirms Art42 #1 displays listed for 5 CLUB42 after their MetaMask
confirmation. Connected seller cancelNFTListing and buyer buyNFT controls. Listed
NFT reads include buyer balance/allowance for the listing's actual payment token
at the same block as listing/ownership reads. Buyers approve exactly the listed
price if needed, then confirm the separate purchase; sellers see cancellation.
Listing creation inputs cannot determine buyer payment approval. Unsupported
payment tokens, inadequate balance and missing allowance are shown clearly.
Receipts refresh NFT state and wallet balances. Existing account/network guards,
rejection/failure/status and replacement receipt handling remain. No contracts
changed, no new deployment, and no agent purchase/cancellation transactions sent.

All 23 frontend tests and production build pass. Added coverage for both payment
tokens/allowance thresholds, exact approval amounts, buy/cancel calldata with no
native BNB value, wrong-network guards and rejection. Browser purchase/cancel QA,
real purchase/cancel receipts, ownership/payment changes and unchanged pool
reserves/LP supply still need live verification. Next manual test: switch from
seller (second account) to original funded account, select listed Art42 #1,
approve 5 CLUB42 if needed, then Buy and verify both wallets. Afterwards test
seller cancellation with a relisting or another NFT.

## Walkthrough record and NFT purchase verified — 2026-11-03

Owner requested one detailed explanation-session record. Read
[WALKTHROUGH-RECORD.md](WALKTHROUGH-RECORD.md) first when that session begins.
It records accounts, exact amounts/actions, contract functions, evidence levels,
rounding questions and outstanding checks. Latest same-block RPC evidence is saved
in walkthrough-latest-snapshot.json (block 140494172): Art42 #1 belongs to original
wallet; listing cleared; seller holds 15.603120139871539581 CLUB42 (+5), and pool
reserves/LP supply match the previous swap snapshot. This corroborates the owner's
5-CLUB42 NFT purchase. Cancellation/relisting and SWAP42 NFT purchase remain
untested live. Receipt/event archive and broader verification/documentation remain.

## Checklist scope correction — 2026-11-03

At the owner's request, remove the separate mobile/layout and wallet-error,
account/network-change and stale-state QA item from the remaining checklist.
The subject does not specify that separate verification gate. Earlier pending
notes about these checks are historical, not remaining mandatory requirements.
The subject's requirement for a minimal UI working with a wallet like MetaMask
still applies. This scope change does not mark those extra checks as performed.
