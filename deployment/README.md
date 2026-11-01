# BNB testnet deployment

Use Node.js 22+. Install pinned tools from the repository root with `npm ci`.

```sh
npm run contracts:compile
npm run contracts:test
npm run contracts:estimate
npm run deploy:wallet
```

The last command opens a local helper at http://127.0.0.1:5176/ (separate from the demo frontend on 5175). Open it in a browser with MetaMask, select the funded TokenZwap account, and connect. It accepts only BNB Smart Chain Testnet, chain ID 97. No private key or seed phrase is requested, exported or stored.

Deploy Club42, Swap42, Art42, then TokenZwap using the buttons. Review each MetaMask transaction. Each token mints 42,000 tokens to the deploying account. Art42 receives the recovered permanent metadata URI in config.json; TokenZwap receives the newly deployed token addresses. Deployments do not add liquidity, mint NFTs or distribute tokens automatically.

The browser retains confirmed addresses and a pending hash in localStorage. If a receipt times out or the page reloads, reconnect with the same wallet to recover it; do not clear browser storage while a transaction is pending. After all four confirmations, download the public deployment record and save it as deployment/bnb-testnet.json. The assistant can then verify the hashes and on-chain configuration. No public deployment is recorded until receipts have actually been confirmed.

Compiler: solc 0.8.30, OpenZeppelin 5.4.0, optimizer enabled (200 runs), EVM target paris, no viaIR. artifacts/ is generated and ignored. Tests use ethers 6.15.0 and Ganache 7.9.2, reusing the earlier NFT toolchain. Ganache falls back to its JS implementation on Node 22. Its legacy development dependencies have npm audit findings; these do not form part of deployed Solidity bytecode. Keep the local helper on loopback.

Metadata: config.json recovers the URI from the original NFT project's deployment/remix-settings.json at commit 656aba861e669c3ba5c23a6c14cb5b1754fe0e35. All ten JSON files were retrieved from the original Pinata gateway and their image URI references checked; snapshots are in metadata/. Remote image availability/content for all ten files is not independently verified. Original branded artwork is copied into frontend/assets/art42/ for future integration.

The gas rehearsal used 4,235,138 gas for all four deployments. At the observed gas price of 0.1 gwei, that is 0.0004235138 tBNB (0.0005293922 with 25% gas buffer). This is an estimate from local execution and a live fee read, not a guaranteed quote. Run contracts:estimate again for current pricing. The user's reported 0.01 tBNB exceeds this deployment estimate.

Saved funding link: [GHOST faucet](https://ghostchain.io/faucet/bnb-testnet/). See documentation/FAUCETS.md.

## Confirmed deployment

All four contracts are deployed; see bnb-testnet.json for addresses/transactions and bnb-testnet-verification.json for RPC verification evidence. Run `node deployment/verify.cjs` to repeat read-only verification. Creation transaction inputs match local compilation. This is distinct from publishing source on BscScan, which remains pending. Actual total fees were **0.004235138 tBNB**, using 1 gwei rather than the 0.1 gwei sampled for the earlier estimate. Do not deploy again to continue; use the recorded addresses. Initial liquidity and live frontend integration remain pending.
