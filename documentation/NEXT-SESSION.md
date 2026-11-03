# Start here next session — agreed direction, 2026-11-03

When the owner asks “hello, what's our plan for today?”, “what's next?” or a
similar continuation question, read this file, README.md, PLAN.md and the latest
HANDOFF.md entries before answering. Inspect current code/status before claiming
anything is complete. This file supersedes earlier recommendations to omit
dynamic fees and flash loans. Do not restart completed wallet exercises.

## Owner's priorities

- Maximize attainable bonus credit while keeping features small, educational,
  understandable and easy to explain during a one-corrector defense.
- Demonstrations should work with one person and sequential actions; no crowd of
  simultaneous traders should be required.
- Explain only the current concept with a small example. Implement one agreed
  learning step at a time, not the entire bonus set without guidance.
- Keep basic accounting, repayment and external-call correctness. Avoid turning
  this into a production protocol or adding unnecessary infrastructure.
- The actual evaluation scale was not found. Bonus suggestions are not a verified
  points formula; do not promise maximum XP or separate credit per feature.
- Intra participation counters were rejected by the owner as unreliable. Do not
  infer that nobody completed the project from those counters.

## Agreed bonus direction

1. Price impact displayed before a swap.
2. User-defined slippage tolerance and contract-enforced minimum output.
3. Swap deadline for basic stale-transaction protection; do not describe this as
   guaranteed prevention of sandwich attacks.
4. Swap history and a price chart sourced from on-chain activity. Combined with
   wallet connection and transaction status, this strengthens the advanced UI idea.
5. An educational impermanent-loss calculator with assumptions clearly stated.
6. NFT creator fees, with payments kept separate from pool liquidity reserves.
7. A simple dynamic swap fee based on pool usage.
8. A minimal flash-loan implementation and demonstration borrower contract.

These cover the subject's nine suggested bonus areas in principle (history/chart
also contributes to advanced UI). They are planned, not implemented or graded.
Mandatory verification/documentation still needs completion; consult the
walkthrough record instead of assuming the mandatory part is perfect.

## Dynamic fees: keep the proposed design simple

The discussed example rule is 1% for normal swaps and 2% when the input exceeds
5% of the input-side reserve, measured before the swap. This is a proposed,
documented usage-based rule, not a required subject formula or a finalized API.
Both rates stay within the subject's mandatory 1–10% range.

One corrector can enter a small amount and then a larger amount to see the fee
change, then execute sequential swaps if desired. No timing coordination or
multiple traders is needed. The frontend quote and contract must use the same
rule. Test the exact threshold, both directions and fee/reserve accounting.

Plain explanation: “A trade using a larger fraction of the pool pays a higher fee.”

## Flash loans: focused educational demonstration

The pool lends tokens to a borrower smart contract, invokes its callback, and
requires the borrowed amount plus the specified fee back in the same transaction.
If repayment fails, the whole transaction reverts. No external exchange or real
arbitrage strategy is needed.

Build a small demonstration borrower and show successful repayment and deliberate
failed repayment. Specify supported tokens, fees and accounting before coding.
Verify repayment from actual balances; keep reserves consistent, protect entry
points against re-entry, and test failed repayment/rollback and unauthorized
callbacks. These are basic correctness checks, not an unsolicited production audit.
The borrower can be pre-funded with test tokens to cover its fee.

## Deployment strategy — avoid repeating setup

The currently deployed contracts cannot acquire new code. Finish agreed contract
changes locally and test them together, then aim for one replacement pool/market
deployment. Reuse the existing CLUB42, SWAP42 and Art42 contracts where compatible.
Deploy the demo borrower as an additional contract when needed.

Before replacement deployment, explain the concrete migration steps. Existing LP
positions and NFT escrow/listings remain in the old contract. Preserve access to
that deployment so the owner can withdraw liquidity/cancel listings; do not
overwrite the only address record. The owner signs wallet transactions.
Then configure the frontend for the new pool, approve its address and seed it
again. Reusing token contracts does not migrate liquidity, allowances or listings.
Do not deploy on the next greeting automatically.

## Immediate next session

1. Briefly report this agreed scope and actual remaining mandatory checks.
2. Start the first small bonus step: price-impact calculation/display. Explain
   how it differs from the fee and slippage, then implement and verify that step.
3. Continue contract bonuses locally in understandable increments; batch their
   eventual redeployment rather than redeploying after every feature.

## Actual walkthrough evidence

Read WALKTHROUGH-RECORD.md for exact account roles, approvals, deposits, LP amounts,
withdrawals, swaps and the 5 CLUB42 NFT purchase. Latest saved evidence is
walkthrough-latest-snapshot.json. Seller cancellation/relisting and a SWAP42 NFT
purchase were still untested live at this handoff. Preserve the required later
explanation of tiny withdrawal rounding remainders staying in the pool.

The separate mobile/layout and wallet-error QA checklist item was removed at the
owner's request; do not restore it as a mandatory gate. Existing wallet compatibility
requirements still apply. Do not store API credentials in repository files.
