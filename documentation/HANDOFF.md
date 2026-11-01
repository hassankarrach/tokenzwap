# Continue here — 2026-11-01

Read AGENTS.md, README.md and PLAN.md. This is a guided learning project: implement one agreed step at a time. The owner asked to save and push progress so they can resume later.

## Next step

Verify the real MetaMask connection, then implement live token approvals and the first liquidity deposit (example: 100 CLUB42 + 200 SWAP42). No new deployment is needed. Include pending, rejected, failed and confirmed transaction handling; refresh balances after confirmation. The owner signs wallet transactions. Never request or commit private keys or seed phrases.

## Completed

- Reused Club42 and Art42 source; adapted Swap42. TokenZwap implements LP shares, deposits/withdrawals, both swap directions with 1% retained fee and NFT escrow/list/purchase/cancel. NFT payments go directly buyer-to-seller, separate from reserves.
- Pinned solc 0.8.30, OpenZeppelin 5.4.0, ethers 6.15.0 and Ganache 7.9.2. All four compile (optimizer 200, EVM paris). Eight focused local tests passed, including accounting, authorization, failed transfer/delivery rollback and purchase reentrancy. Additional edge coverage remains in PLAN.md.
- All four BNB testnet contracts deployed. Public addresses and receipts: deployment/bnb-testnet.json. Read-only verification evidence: deployment/bnb-testnet-verification.json. Creation inputs match compiled source; pool token pair and token supplies checked. Last verified pool is empty. Actual fees totaled 0.004235138 tBNB. Explorer source verification is optional under the provided subject and remains undone.
- Original Art42 metadata URI recovered and used at deployment. Ten remote metadata files fetched; image URI references checked. Snapshots: deployment/metadata/. Remote image bytes/availability for all ten remain unverified. Branded artwork: frontend/assets/art42/.
- React/Vite app with separate views and local branding. Default live read-only wallet view connects MetaMask and reads tBNB/CLUB42/SWAP42/TZLP, reserves and LP supply from recorded addresses. Handles network/account changes, rejection and refresh. Demo forms remain separate under Try demo. No live main-app write flows yet.
- Production build, Chrome demo/layout checks and mocked-wallet checks passed. Actual user wallet connection and live flows are not yet confirmed.

## Running again

Use Node 22+. System default Node 12 is too old. Temporary runtime: /tmp/node-v22.14.0-linux-x64/bin (may disappear). With compatible Node on PATH:

```sh
npm ci
npm --prefix frontend ci
npm run dev
```

App: http://127.0.0.1:5175/. Servers may need restarting in a new session. Root scripts also provide contracts:compile, contracts:test, contracts:estimate and build. Contract tests require Ganache resources allowed by the environment. The separate deploy:wallet helper on 5176 was used for the completed deployment; do not redeploy the contracts to resume. Read deployment/README.md for details.

## Remaining mandatory work

Live approvals/deposits/withdrawals/swaps; NFT mint/approval/list/buy/cancel and artwork integration; evaluator token distribution; two-wallet testnet demonstration; remaining edge tests; final README, diagrams, screenshots and limitations. Frontend mock tests do not verify actual wallet execution.

## Funds and scope

Saved faucet: https://ghostchain.io/faucet/bnb-testnet/ (documentation/FAUCETS.md). Owner previously received 0.01 tBNB; read current balance from wallet. No scheduled faucet claims or reminder configured.

Bonus features stay deferred until mandatory scope is complete and understood. Initial planned bonuses: minimum output/slippage, deadlines and price impact. They are not mandatory under SUBJECT.txt.
