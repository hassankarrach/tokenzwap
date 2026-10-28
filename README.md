# TokenZwap

42 learning project: a two-token automated market maker (AMM) with a fixed-price NFT marketplace on BNB Chain testnet.

Status: repository prepared; implementation has not started.

Start with [the three-day plan](documentation/PLAN.md), then [Step 1](documentation/STEP-01.md).

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

Learn one idea, implement one small piece, verify it, then commit it. Do not generate the entire solution before the owner understands the previous step.

Tooling will be selected at the first setup session, preferably reusing the existing projects. No dependencies are installed yet; there are no build or deployment commands to run yet.

This repository is local. No remote repository or deployment has been created.
