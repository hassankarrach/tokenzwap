# Continue here — 2026-11-01

## Latest owner direction

Read AGENTS.md, README.md and PLAN.md first. The owner initially requested guided small steps, then explicitly requested: “lets complete the full smart contract code for now, i'll leave understanding it for later”. All mandatory smart-contract source features are now implemented. The owner then supplied the subject and requested mandatory scope only; see SUBJECT.txt. Bonus minimum outputs/deadlines and extra purchase terms/self-purchase restrictions were removed. Do not treat this as verified completion of the project. Tests, toolchain installation and deployment remain deferred; do not run them without updated direction. Never request or commit real wallet credentials.

## Planned bonus follow-up

The owner explicitly wants bonus work after the mandatory scope is finished, verified and properly understood. Preserve that intent in future sessions. Initial targets are user-defined slippage/minimum-output protection, transaction deadlines and frontend price-impact display. Keep current work focused on mandatory scope; do not add bonuses early. Other bonus items remain undecided.

## Implemented source

- Club42: original fixed-supply Token A; Swap42: adapted fixed-supply Token B. Each gives 42,000 tokens to its deployer. Evaluators still need token distribution.
- Art42: original standard ERC-721, public minting of IDs 1–10 and immutable IPFS directory constructor argument.
- TokenZwap: ERC-20 LP receipts, initial deposits, exact-ratio later deposits, partial/full withdrawals, both swap directions with fixed 1% retained fee, and NFT escrow/list/purchase/seller cancellation. All asset-moving actions use nonReentrant. Marketplace payments go directly buyer-to-seller. Transaction events cover pool and marketplace actions.
- Current signatures: `addInitialLiquidity(amountA, amountB)`, `addLiquidity(amountA, amountB)`, `removeLiquidity(shares)`, `swap(tokenIn, amountIn)`, `listNFT(nft, tokenId, paymentToken, price)`, `cancelNFTListing(nft, tokenId)`, `buyNFT(nft, tokenId)`. See CONTRACTS.md.
- Standard receiver callback accepts safe NFT transfers. Unsolicited transfers/mints do not create listings and have no rescue path. Purchase uses current listing terms, without bonus price/deadline guards.

## Verification and remaining work

No contract dependency manifest, pinned installation, Solidity compilation, contract tests or blockchain deployment exists yet. A buildless mock frontend now exists; see frontend/README.md. Existing Solidity imports are not runnable here until tooling is set up. Source whitespace checks passed; they are not contract verification. Earlier Python simulator checks are also not contract verification.

Previous projects used OpenZeppelin 5.4.0, solc 0.8.30, ethers 6.15.0 and Ganache 7.9.2. Reuse provenance is in REUSE.md. Target fresh BNB Chain testnet deployments, not old Sepolia addresses. Deployment/test directories remain placeholders. The frontend has HTML/CSS/JS source, in-memory demo flows and no wallet/contract integration.

Review CONTRACTS.md limitations before tests: exact-ratio deposit usability after swaps, initial LP/rounding policy, ignored direct token donations, unsupported fee-on-transfer/rebasing tokens, unchecked authenticity of arbitrary NFT collections, no rescue for unsolicited plain NFT transfers, standard receiver callback behavior and atomic rollback. No minimum liquidity is locked; full exit allows reinitialization.

The next required engineering work is dependency setup, compilation and meaningful contract tests, when authorized. PLAN.md lists verification cases. After passing accounting tests, build the frontend, deployment scripts, two-wallet testnet demo and final documentation. The learning explanation can resume later at the owner's request.

## Latest UI work

The owner requested a UI before tests, matching a supplied dark teal dashboard
reference (rounded cards, turquoise buttons, gradients). frontend/index.html,
styles.css and app.js implement this with Swap/Liquidity/NFT navigation and demo
balances/actions. Keep every action clearly labelled as simulated. No real wallet
requests or transactions are sent. Run the static preview command in
frontend/README.md. JS syntax passed; browser QA was blocked by unavailable browser
access host. Continue UI feedback, then contract verification and real integration.
Keep bonuses for after mandatory completion and understanding.

### Vite preview update

After repeated Python preview 404s on the owner's machine, the frontend now uses
Vite with an explicit frontend root. From repository root:
`npm --prefix frontend install`, then `npm run dev`; open http://127.0.0.1:5175/.
`npm run build` produces frontend/dist. Frontend dependencies are separate from
contract tooling. All app flows are still simulated; contract testing stays deferred.
