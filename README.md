# TokenZwap

42 learning project: a two-token automated market maker (AMM) with a fixed-price NFT marketplace on BNB Chain testnet.

Status: mandatory smart-contract features are implemented in source: two reused ERC-20s, Art42, liquidity deposits/LP receipts, partial/full withdrawals, both swap directions with a 1% fee, and NFT escrow/list/purchase/seller cancellation. NFT payments go directly buyer-to-seller. **All four contracts compile and eight focused local tests pass. All four BNB testnet deployments are confirmed; broader edge-case verification and live UI integration remain pending.** Scope follows the [provided subject](documentation/SUBJECT.txt); bonus slippage/minimum-output and deadline features are excluded. See the [contract reference](documentation/CONTRACTS.md) and [reuse notes](documentation/REUSE.md).

Continuing on another machine or in a new session? Read [the handoff](documentation/HANDOFF.md) first. The [three-day plan](documentation/PLAN.md) tracks the remaining scope.

Run a guided, press-Enter lesson on deposits, LP ownership, swaps and withdrawals with `python3 code/simulator.py`. See the [terminal playground guide](documentation/SIMULATOR.md). This uses pretend balances and needs no blockchain dependencies. Optional manual mode: `python3 code/simulator.py --free`.

## Latest progress — 2026-11-03

Live wallet approvals, initial/later deposits, withdrawals and both swap directions
are connected. Two-wallet liquidity and swaps were exercised by the owner, with
balance snapshots recorded in PLAN.md. The NFT screen supports mint/approve/list,
but the owner has not performed these steps yet; buying/cancellation UI remain
pending. All 20 frontend tests and production build pass. These checks do not
complete the remaining contract edge-case or full testnet verification gates.

## UI preview

A reference-inspired dark teal interface is available in `frontend/`, with Swap,
Liquidity and NFT Marketplace React views and browser-only demo interactions. Use Node.js 22 or newer. From the repository root, run `npm --prefix frontend ci`, then `npm run dev`.
Open http://127.0.0.1:5175/ (without `/frontend/`). MetaMask can now connect and read deployed BNB testnet balances. Live Liquidity supports exact-amount approvals, the first deposit into an empty pool, and partial/full withdrawals. The owner reports the initial deposit completed; live withdrawal still needs verification. Live swaps are connected; the UI no longer exposes demo mode.
See [frontend notes](frontend/README.md) for scope and verification limits.

## Required structure

- `code/`: Solidity contracts and automated tests.
- `frontend/`: minimal wallet-connected interface.
- `deployment/`: deployment scripts, network settings and public deployment addresses.
- `documentation/`: explanations, diagrams, limitations and screenshots.

## Mandatory scope

- One Token A / Token B pool; reuse the ERC-20 from the Tokenizer project.
- Deploy two ERC-20 tokens and make test tokens available to evaluators.
- Add liquidity, issue LP tokens, and allow partial or full withdrawal.
- Swap in both directions using constant-product pricing and a fee between 1% and 10%.
- In the same AMM contract, escrow NFT listings priced in A or B, purchase them, and cancel listings.
- Interface for swaps, liquidity, pool balances and NFT listing/purchase.
- Minimal deployment setup, tests, README instructions, diagrams, contract explanations, known limitations and screenshots.

## Working approach

The owner initially followed small guided steps, then requested completion of all smart-contract source on 2026-11-01, leaving explanations for later. On 2026-11-01 the owner authorized deployment preparation; compilation and eight focused tests now pass. All four public deployment receipts and creation inputs have now been verified.

The frontend uses React/Vite. Contract tooling is pinned separately in the root package manifest. See [deployment instructions](deployment/README.md) for compilation, tests, gas estimation and the local MetaMask deployment helper.

All four contracts are deployed on BNB testnet; addresses and transactions are saved in [the deployment record](deployment/bnb-testnet.json). [Saved faucet link](documentation/FAUCETS.md). GitHub synchronization is separate from smart-contract deployment.
