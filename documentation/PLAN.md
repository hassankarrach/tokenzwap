# Three-day guided plan

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
