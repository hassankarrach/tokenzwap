# TokenZwap React client

React 19 with Vite 6. Use Node.js 22 or newer (the system Node 12 cannot run this app).

From the repository root:

```sh
npm --prefix frontend ci
npm run dev
```

Open http://127.0.0.1:5175/. Vite serves the app, transforms JSX and reloads source changes.
Stop with Ctrl+C. Production build: `npm run build`; preview: `npm run preview`.
Output is in `frontend/dist/`. The dev server binds to localhost with a strict port.

## Views and source

- `/#swap`: exchange CLUB42 and SWAP42, reverse direction, preview approval and trade.
- `/#liquidity`: deposit both assets, inspect LP ownership and withdraw shares.
- `/#nfts`: browse collectibles, filter your listings, list, buy and cancel.

`src/App.jsx` owns shared demo balances and listings, the sidebar, hash navigation and status messages.
`src/views/` contains the three React view components. `src/components/PoolOverview.jsx`
contains reusable pool stats, token icons and wallet balances. `src/demo.js` holds initial
fixtures and presentation helpers. Hash links support refresh, direct links and browser history.
Navigation preserves balances; refreshing resets the demo.

The generated icons and app mark are in `assets/branding/`, with their prompts in its README.
Vite bundles local assets for production. Google Fonts supplies DM Sans and Manrope when online.

## Scope

The default live mode supports wallet balances, exact-amount CLUB42/SWAP42 approvals
and the first liquidity deposit into an empty deployed pool. Other live writes remain
pending. “Try demo” keeps the existing browser-memory simulations separate; refreshing
resets them. Demo NFT payments do not enter demo pool reserves.
Live token amounts use integer base units; floating-point calculations belong to the demo only.

## Verification

The production build passes. Browser interaction checks and responsive checks are recorded
in documentation/PLAN.md. These frontend checks do not verify contract accounting.

## Live wallet balances

The default view now connects MetaMask to the BNB testnet contracts recorded in deployment/bnb-testnet.json. It reads tBNB, CLUB42, SWAP42, TZLP, pool reserves and LP supply without a signer or transaction. A wrong network hides balances and offers switching to chain 97. Unknown network 97 must be added in MetaMask manually. Balance reads use one block tag and refresh every 15 seconds or via Refresh; account/network/disconnect events clear stale data. Integer base units stay as strings/BigInt until display formatting.

## First live liquidity deposit

Connect MetaMask on BNB testnet, open Liquidity, and enter both amounts (defaults:
100 CLUB42 + 200 SWAP42). Approve each token if its allowance is insufficient,
then select Deposit liquidity. Each action requires a separate MetaMask confirmation
and tBNB for gas. Approvals grant only the entered amount to the recorded pool address.
They do not transfer tokens. After confirmation, balances and allowances refresh;
approval buttons disappear when the allowance covers the inputs.

The UI shows wallet confirmation, pending, confirmed, declined and failed states,
with a transaction explorer link after submission. Account/network checks run before
sending. An initialized pool disables this first-deposit form; later deposits and
withdrawals are a separate upcoming step. Swaps and NFT writes remain pending.

Validation: `node --test frontend/tests/liquidity.test.js` covers exact amounts,
approval targets/allowances, initial-deposit calldata, account/network guards and
wallet rejection. Production build passes. These mocked transaction tests do not
verify real MetaMask execution or confirmation UI. Browser automation was unavailable;
real approvals/deposit and resulting reserve/LP balances still need owner verification.

## Colorflow background

The background uses Colorflow's live iframe export, authored from preset a001 with
Film Grain. Mesh colors were edited in Colorflow (deep teal #071B1B, transition
#14524B, mint #399D8B, sage #437B6C, lower mint #5DBDA4/#8ACFBC/#A3D8C6
and pearl #F3FFF9). Current export: https://colorflow-embed.b-cdn.net/embed.html#e=zEZMpujd.
It is displayed without hue filters, opacity changes or dark overlays. CSS controls
placement; this export is an iframe, not standalone CSS or a video.

The mesh animates without a pause control, as requested. Reduced-motion preferences
use a local static gradient. Cards use translucent dark surfaces and backdrop blur,
with an opaque fallback in browsers without backdrop-filter support. The live mesh requires
Colorflow's external hosting and WebGL support; the iframe is isolated from the
parent app and wallet. Desktop appearance was checked in Brave; mobile and
reduced-motion rendering need further visual verification.

## Live-only navigation update

The main app no longer exposes Try demo or the live-approval status banner. All
three navigation routes use LiveBalances; only initial liquidity and approvals are
currently enabled as writes. Legacy demo view components remain in source for
reference but are not imported by App. Their simulated workflows are not available
through the interface.

## Live withdrawals

Open Liquidity and enter TZLP to redeem, or use MAX for your exact full balance.
The preview shows both token returns at the latest read reserves. Confirm Withdraw
in MetaMask; no approval is needed. Transaction confirmation refreshes balances.
Previews may change before mining. Nine frontend tests and the production build
pass; real wallet withdrawal and resulting balances remain to be manually verified.

## Later deposits

Initialized pools use addLiquidity with exact reserve-ratio validation and a preview
of newly minted TZLP. Use pool ratio fills amounts equal to 100% of current reserves;
review this size before approving. Smaller custom amounts must match the ratio in
integer base units. Rounding after withdrawals can prevent a visually matching
rounded pair from being exact. Existing approvals are reused when sufficient.
Twelve frontend tests pass; real later-deposit execution remains to be verified.

### Dedicated task pages — 2026-11-03

Split the stacked live sections into sidebar routes: #overview for pool statistics,
#balances for wallet balances, #liquidity for deposits and #withdraw for withdrawals.
Swap and NFT routes remain. Wallet state stays shared, route changes scroll to the
top, and mobile navigation wraps to keep every link reachable. Production build
passes; desktop/mobile browser navigation checks remain pending.

Pool overview and wallet balances now share #overview (Pool & balances). The old
#balances link resolves to that combined page. Deposit and withdrawal stay separate.

## Live swaps

Swap supports CLUB42 → SWAP42 and the reverse direction. Enter an input amount,
review the estimated output including the 1% retained pool fee, approve the input
token if needed, and confirm Swap in MetaMask. Quotes use integer contract math;
confirmed outputs can change with reserves before execution. Transaction statuses
and explorer links are shown; receipts trigger balance/allowance/reserve refresh.
No bonus slippage/deadline features were added. Run `node --test frontend/tests/*.test.js`
for all 16 frontend tests. Build passes; browser QA and actual two-direction swaps
are still pending owner verification.

## Live Art42 minting and listing

NFT Marketplace reads the ten deployed Art42 IDs, their owners/approvals and live
escrow listings. Select an available ID, confirm Mint, approve that specific NFT,
then choose a positive price in CLUB42 or SWAP42 and confirm List NFT. Listing
moves the NFT into marketplace escrow, without paying the seller yet. Existing
branded artwork is used as labelled preview imagery; immutable NFT metadata is
unchanged. Buying and seller cancellation controls are the next step. All 20
frontend tests and the build pass; real NFT transactions and browser QA remain
pending. Run `node --test frontend/tests/*.test.js` for frontend tests.
