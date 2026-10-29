# Terminal playground

From the repository root, run `python3 code/simulator.py`. Requires Python 3; no packages, wallet or network needed. Balances are pretend and disappear when you exit.

The default is a complete guided session. Press Enter at each prompt to perform the announced action, or type `q` to leave. No commands need to be memorized. Each step explains the action, prints wallet and pool balances, and points out what changed.

The session covers an empty-pool rejection, the first deposit, repeated swaps, a reverse swap, a full withdrawal, two providers sharing ownership, a rejected deposit ratio, partial withdrawal, an excessive-withdrawal rejection, and a comparison of zero-fee and 1%-fee trades. Separate scenarios explicitly reset the balances.

## Optional manual mode

For a command prompt instead, run `python3 code/simulator.py --free`.

Try these commands one at a time and read the explanation after each:

```text
deposit 10 10
user bob
swap A 10
user alice
withdraw 100
```

Alice funds the pool. Bob gives 10 A and receives 5 B. Alice then withdraws the remaining 20 A and 5 B. Alice's receipt was for the pool's contents, not the exact original amounts.

For shared ownership, use `reset`, then:

```text
deposit 10 10
user bob
deposit 10 10
withdraw 50
```

Each provider initially gets 100 LP receipts and owns 50%. Bob returns 50 LP (half his receipts) and receives 5 A plus 5 B. Use `status` to see the remaining shares.

The first deposit receives an arbitrary 100 LP for teaching; later deposits must match the current pool ratio exactly. This is not a final contract minting policy. Arithmetic uses exact fractions, but display values are rounded to six decimal places; a displayed ratio after swaps may not be exact enough for a later deposit. Reset to explore easy ratios.

Fees start at zero to explain constant-product pricing. Try `fee 1` for a 1% fee retained in the pool. The assignment requires a fee between 1% and 10%; zero is only a teaching mode. Fees increase the reserve product. Deposits and withdrawals also change that product.

This model omits blockchain integer rounding, approvals, gas, transaction ordering, minimum-output/deadline protections and NFTs. It is a learning aid, not Solidity code or proof that the eventual contracts are correct. No contracts are deployed or tested by running it.
