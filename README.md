# TokenZwap

42 learning project: a two-token automated market maker (AMM) with a fixed-price NFT marketplace on BNB Chain testnet.

Status: mandatory smart-contract features are implemented in source: two reused ERC-20s, Art42, liquidity deposits/LP receipts, partial/full withdrawals, both swap directions with a 1% fee, and NFT escrow/list/purchase/seller cancellation. NFT payments go directly buyer-to-seller. **Compilation and contract tests are still pending; this is not a verified deployment-ready release.** Scope follows the [provided subject](documentation/SUBJECT.txt); bonus slippage/minimum-output and deadline features are excluded. See the [contract reference](documentation/CONTRACTS.md) and [reuse notes](documentation/REUSE.md).

Continuing on another machine or in a new session? Read [the handoff](documentation/HANDOFF.md) first. The [three-day plan](documentation/PLAN.md) tracks the remaining scope.

Run a guided, press-Enter lesson on deposits, LP ownership, swaps and withdrawals with `python3 code/simulator.py`. See the [terminal playground guide](documentation/SIMULATOR.md). This uses pretend balances and needs no blockchain dependencies. Optional manual mode: `python3 code/simulator.py --free`.

## UI preview

A reference-inspired dark teal interface is available in `frontend/`, with Swap,
Liquidity and NFT Marketplace forms and browser-only demo interactions. From the repository root, run `npm --prefix frontend install`, then `npm run dev`.
Open http://127.0.0.1:5175/ (without `/frontend/`). No wallet or contracts are connected yet.
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

The owner initially followed small guided steps, then requested completion of all smart-contract source on 2026-11-01, leaving explanations for later. Contract testing and deployment remain deferred; verification is required before delivery.

The frontend uses Vite with pinned dependencies and a lockfile. Smart-contract tooling and deployment setup remain pending.

No blockchain deployment has been created. GitHub synchronization is separate from smart-contract deployment.
