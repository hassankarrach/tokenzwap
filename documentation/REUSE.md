# Reusing the previous projects

## Contract preparation

- Token A: `code/contracts/Club42.sol`, copied unchanged from `hassankarrach/club42-tokenizer`, commit `7edde656f69a6a208ae3c2c89d332ff2dd53306b`, file `code/Club42.sol`.
- Token B: `code/contracts/Swap42.sol`, adapted from Club42 with a different contract name, token name and symbol. Both ERC-20 tokens issue 42,000 tokens to their deployer; neither exposes public minting. Evaluators will need tokens distributed to their wallets.
- NFT: `code/contracts/Art42.sol`, copied unchanged from `hassankarrach/tokenizeart-nft-minting-dapp`, commit `656aba861e669c3ba5c23a6c14cb5b1754fe0e35`, file `code/Art42.sol`. It permits free public minting of IDs 1–10 and needs an IPFS metadata directory URI at deployment.

Sources:
- https://github.com/hassankarrach/club42-tokenizer
- https://github.com/hassankarrach/tokenizeart-nft-minting-dapp

## Next setup step

Reuse the NFT project's compiler and local test approach (solc, ethers, Ganache and OpenZeppelin), adapting paths to this repository. Wallet connection patterns, NFT metadata handling and receiver test fixtures are candidates for later steps; they have not been copied yet.

Target fresh deployments on BNB Chain testnet. Old Sepolia addresses are not used. No deployment has happened, dependencies are not installed, and these copies have not yet been compiled or tested here. Verify ERC-20 supply, distribution, allowances and transfers, plus NFT minting and transfers, before testnet deployment. The AMM and marketplace are not implemented.
