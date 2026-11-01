# TokenZwap UI preview

Vite serves the existing HTML, CSS and JavaScript. No framework is required.

From the repository root:

```sh
npm --prefix frontend install
npm run dev
```

Open **http://127.0.0.1:5175/** (no `/frontend/` suffix). Stop with Ctrl+C.
The Vite root is explicitly configured so assets resolve consistently.
If the port is already in use, stop the previous process or run
`npm run dev --prefix frontend -- --port 5176` and use the printed URL.

Production build: `npm run build` from the repository root. Output: `frontend/dist/`.
Local build preview: `npm run preview`.

## Current scope

The visual direction follows the supplied dark teal dashboard reference: rounded
cards, turquoise actions, subdued pink accents, soft gradients and a dark sidebar.
Swap, Liquidity and NFT Marketplace navigation selects the main action form.
CSS artwork is illustrative and does not use live NFT metadata.

All balances, approvals, swaps, deposits, withdrawals, listings, purchases and
cancellations are **browser-memory simulations**. Refreshing resets the demo.
The Connect wallet button explains this state; it does not request an account.
No blockchain transactions are sent, and no credentials are stored.

The demo uses JavaScript floating-point arithmetic for presentation, not contract
accounting. The real integration must use integer base units, read chain balances,
verify chain/account, handle approvals and receipts, and follow the contract's
exact-ratio deposit policy. This preview does not certify contract behavior.

Google Fonts supplies DM Sans and Manrope when online; system fonts are fallbacks.
Responsive styles cover narrow/mobile layouts and keyboard focus is visible.
No bonus slippage, deadlines, price-impact controls or on-chain history are included.

## Verification

JavaScript syntax check: `node --check frontend/app.js`.
Vite production build passed. Dev-server checks returned HTTP 200 for the app,
JavaScript, CSS and contract reference.
Contract compilation/testing remains deferred. Browser visual and interaction QA
is still pending because the browser automation host was unavailable in this session.
