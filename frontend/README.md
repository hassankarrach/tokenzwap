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

All balances, approvals, deposits, withdrawals, swaps and NFT operations are browser-memory
simulations. No wallet connection, blockchain transaction or credentials are involved.
NFT payments reduce the buyer's demo balance without entering pool reserves.
CSS collectibles are illustrative artwork, not live NFT metadata.

Floating-point calculations are for demonstration only. Real integration must use integer
base units and deployed, verified contracts. Contract compilation/tests and deployment remain deferred.

## Verification

The production build passes. Browser interaction checks and responsive checks are recorded
in documentation/PLAN.md. These frontend checks do not verify contract accounting.

## Live wallet balances

The default view now connects MetaMask to the BNB testnet contracts recorded in deployment/bnb-testnet.json. It reads tBNB, CLUB42, SWAP42, TZLP, pool reserves and LP supply without a signer or transaction. A wrong network hides balances and offers switching to chain 97. Unknown network 97 must be added in MetaMask manually. Balance reads use one block tag and refresh every 15 seconds or via Refresh; account/network/disconnect events clear stale data. Integer base units stay as strings/BigInt until display formatting.

Live transaction controls are not connected yet. Use “Try demo” for the existing simulated forms, which keep separate in-memory balances. Connecting the wallet returns to live mode. No approval, signature or transaction request is sent by the main app in this step. The dedicated deployment helper is separate.
