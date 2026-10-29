# Continue here — 2026-10-29

## How to work with the owner

Read AGENTS.md, README.md and PLAN.md first. This is a guided learning project. Add one small, understandable piece to the existing final file, explain it with plain words and a small example, then pause for the owner. Do not generate the rest of the project at once. Explain technical keywords rather than assuming DeFi knowledge. The owner knows ERC-20 and ERC-721 but is learning AMMs, approvals, pool ownership and pricing.

The owner explicitly asked to defer contract tests and deployment until near completion. Do not install/run a contract toolchain or deploy as the next action. Keep verification pending in the documentation; it is necessary before final delivery. Do not request private keys in chat or commit wallet credentials.

## Current files and actual progress

- `code/contracts/Club42.sol`: unchanged original ERC-20; Token A, 42,000 fixed supply to deployer.
- `code/contracts/Swap42.sol`: adapted ERC-20; Token B, same supply policy, different name/symbol.
- `code/contracts/Art42.sol`: original NFT, public minting of IDs 1–10, IPFS directory constructor argument.
- `code/contracts/TokenZwap.sol`: the growing final AMM file. Saves two distinct nonzero token addresses, declares reserves, inherits ERC20 for LP receipts named TokenZwap LP (TZLP), and imports SafeERC20 and ReentrancyGuard. Its only pool action is `addInitialLiquidity(amountA, amountB)`: require zero LP supply and positive inputs, calculate sqrt(amountA * amountB), safely transfer both approved tokens into the AMM, record reserves and mint initial LP receipts to the caller. It is nonReentrant.
- `code/simulator.py`: standalone Python 3 guided terminal lesson. Run `python3 code/simulator.py`, press Enter through 17 steps, or q to quit. Optional `--free` command mode. Includes deposits, ownership, both-direction swaps, withdrawals, refused actions and fee comparison. This simulator was exercised successfully; this is not smart-contract verification.
- `frontend/`, `deployment/`, `code/test/`: placeholders; no working implementation or deployment setup.
- `documentation/REUSE.md`: original repository URLs and exact source commits.

No package manifest, dependency installation, compiler invocation, Solidity tests, contract deployment or wallet connection has been completed. Solidity imports are therefore not yet runnable here. Previous repositories used OpenZeppelin 5.4.0, solc 0.8.30 and ethers 6.15.0; the NFT project also used Ganache 7.9.2. Select/pin tooling when the owner is ready.

## Exact stopping point and next lesson

The last explanation walked through `using SafeERC20 for IERC20` and the new first-deposit function: checking inputs, calculating receipts, `msg.sender`, `address(this)`, approved transfers, reserves and `_mint`. The owner has not yet confirmed understanding of this latest function. First offer a brief recap or answer questions. Then implement only the next agreed small piece: proportional later deposits, explaining why new providers must match the pool ratio and how their LP shares are calculated. Continue growing TokenZwap.sol rather than replacing it wholesale.

## Design details still needing review

- Initial LP supply uses square root, rounded down; all receipts go to the first provider. No minimum liquidity is locked. The Python simulator instead chooses an arbitrary 100 first receipts for teaching. Explain that difference.
- Multiplication is Solidity checked arithmetic and may revert on overflow. Rounding, tiny deposits and later LP minting policy need review.
- Reserves are accounting variables, not automatically queried token balances. Direct donations are currently unaccounted for. Decide donation handling before completing accounting.
- Intended pool assets are the fixed-supply Club42/Swap42 pair. Fee-on-transfer and rebasing tokens are unsupported. The constructor does not verify ERC-20 implementation at supplied addresses.
- Later deposits, partial/full withdrawals, both-direction constant-product swaps, a fixed 1% fee retained by the pool, minimum output and deadlines are not implemented.
- The fixed-price NFT marketplace must be in the same AMM contract: escrow listings priced in A or B, seller cancellation, purchases. NFT payments must stay separate from liquidity reserves (planned buyer-to-seller transfer).
- Frontend, meaningful accounting/access-control/external-call tests, documentation diagrams/screenshots and reproducible deployment remain unfinished.
- Target fresh BNB Chain testnet deployments. Solidity is technically usable on Sepolia, but the assignment targets BNB. Do not reuse old Sepolia addresses.
- Evaluators need ERC-20 distribution because these fixed-supply tokens have no public mint function.

## Suggested message for a new session

“Read AGENTS.md, README.md, documentation/PLAN.md and documentation/HANDOFF.md. Continue teaching me TokenZwap one small code change at a time. We stopped after addInitialLiquidity; recap it before moving to later deposits. Keep contract tests and deployment deferred for now.”
