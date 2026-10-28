# Step 1 — what are we building?

A small exchange website connected to a smart contract.

It does two things:

1. Exchange your Token A for Token B, or the reverse.
2. Let someone sell an NFT for a chosen amount of A or B.

For the exchange to pay users, someone first deposits both tokens into the contract. Those shared tokens form a **pool**.

Example: the contract holds 100 A and 100 B. Alice gives it some A, and it sends her some B. Afterward, the pool has more A and less B.

The next lesson will explain how the contract decides how much B Alice receives. We do not need formulas yet.

## Before coding

Locate your existing Tokenizer and NFT repositories so we can reuse familiar code and tools.

## Understanding check

When Alice trades A for B, where does the B come from?

Once you can explain that in your own words, move to tool setup. Do not jump to the full implementation.
