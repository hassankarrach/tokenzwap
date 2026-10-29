# Three-day guided plan

## Time budget and expectations

Target 24–30 focused hours across three days with guided implementation and reuse of existing token/NFT code. This is an ambitious delivery target, not a guarantee. Two days is a stretch if the environment is already familiar. If the core accounting is unclear or tests fail, extend the schedule rather than skip verification. This is a testnet learning project, not an audited production exchange.

Keep the interface plain. Finish mandatory requirements before optional features. Include minimum-output checks and transaction deadlines in the core design.

## Day 1 — understand and build the pool (8–10 hours)

1. Explain the whole project in plain language; complete Step 1 (20–30 minutes).
2. Review the existing ERC-20 and NFT repositories. Select familiar tools; install and pin dependencies. Prefer a single local blockchain/testing toolchain and a small frontend (60–90 minutes).
3. Set up two test tokens using the user's Tokenizer code and a test NFT fixture. Verify minting, approvals and transfers (60 minutes).
4. Implement initial deposits, LP shares and proportional later deposits. Handle incorrect ratios explicitly; document rounding and initial LP policy (2 hours).
5. Implement partial/full withdrawals and verify two providers cannot withdraw each other's shares (60–90 minutes).
6. Work through one numerical swap. Implement both directions with a fixed 1% fee retained in the pool, minimum output and deadline (2 hours).
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

1. Review integer rounding, zero amounts, empty pools, unsupported tokens, expiry, minimum outputs, repeat withdrawals and external calls. Add meaningful missing tests (2 hours).
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
- [ ] Minimum output and deadline protect execution.
- [ ] NFT escrow, purchase and seller cancellation work with A and B.
- [ ] Unauthorized actions and reentrant external calls cannot corrupt accounting.
- [ ] Marketplace payments do not enter liquidity reserves.
- [ ] Wallet approvals, pending transactions and errors are understandable.
- [ ] Two-wallet testnet demo works; evaluator test tokens are available.
- [ ] Required repository structure and documentation are complete.

## Optional work only after the gates pass

Price-impact display, configurable slippage, transaction history and simple notifications. Leave flash loans, dynamic fees, advanced charts and royalties outside the three-day target.

## Current next action

Read HANDOFF.md before continuing. As of 2026-10-29, the guided implementation has reached the first-deposit function in code/contracts/TokenZwap.sol. The last explanation covered `using SafeERC20 for IERC20`, transfers, square-root initial shares, reserves and LP minting. Ask whether the owner wants to revisit that function before taking the next small step: proportional later deposits.

Contract compilation, dependency setup, tests and deployment are all pending. The owner explicitly deferred contract tests and deployment until near project completion; do not run them without updated direction. Verification is still required before delivery. Only the Python simulator has been exercised. Earlier day-by-day gates remain requirements, not claims of completed work.
