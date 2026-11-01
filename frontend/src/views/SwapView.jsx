import React, { useState } from "react";
import { fmt, quote, symbols } from "../demo.js";
import { TokenIcon, Wallet } from "../components/PoolOverview.jsx";
export default function SwapView({ pool, setPool, notify }) {
  const [amount, setAmount] = useState("10"),
    [reverse, setReverse] = useState(false),
    [approved, setApproved] = useState(false);
  const input = reverse ? "b" : "a",
    output = reverse ? "a" : "b",
    wallet = reverse ? "walletB" : "walletA";
  const estimate = quote(pool, Number(amount), reverse);
  function submit(e) {
    e.preventDefault();
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0)
      return notify("Enter a positive amount.");
    if (n > pool[wallet]) return notify("Not enough demo tokens.");
    if (!approved) {
      setApproved(true);
      return notify(
        "Demo approval recorded. Preview swap again to simulate the trade.",
      );
    }
    setPool((p) => ({
      ...p,
      [input]: p[input] + n,
      [output]: p[output] - estimate,
      [wallet]: p[wallet] - n,
      [reverse ? "walletA" : "walletB"]:
        p[reverse ? "walletA" : "walletB"] + estimate,
    }));
    setApproved(false);
    notify(
      `Demo swap complete: received ${fmt(estimate, 4)} ${symbols[output]}.`,
    );
  }
  return (
    <div className="swap-layout">
      <div className="swap-balances"><Wallet pool={pool} /></div>
      <section className="panel action-panel">
        <div className="panel-heading">
          <h2>Make your next move</h2>
          <span className="small-tag">SWAP</span>
        </div>
        <form onSubmit={submit}>
          <div className="field-box">
            <div className="field-top">
              <label htmlFor="swap-input">You pay</label>
              <span>Balance: {fmt(pool[wallet])}</span>
            </div>
            <div className="amount-row">
              <input
                id="swap-input"
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setApproved(false);
                }}
                required
              />
              <span className="asset-pill">
                <TokenIcon token={input} small />
                {symbols[input]}
              </span>
            </div>
            <div className="field-bottom">
              Token {input.toUpperCase()}
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setAmount(String(pool[wallet]));
                  setApproved(false);
                }}
              >
                MAX
              </button>
            </div>
          </div>
          <div className="reverse-wrap">
            <button
              className="reverse-button"
              type="button"
              aria-label="Reverse swap direction"
              onClick={() => {
                setReverse(!reverse);
                setApproved(false);
              }}
            >
              ⇅
            </button>
          </div>
          <div className="field-box receive-box">
            <div className="field-top">
              <label htmlFor="swap-output">You receive</label>
              <span>Estimated output</span>
            </div>
            <div className="amount-row">
              <output id="swap-output">{fmt(estimate, 4)}</output>
              <span className="asset-pill">
                <TokenIcon token={output} small />
                {symbols[output]}
              </span>
            </div>
          </div>
          <div className="swap-details">
            <div>
              <span>Exchange rate</span>
              <span>
                1 {symbols[input]} ≈ {fmt(pool[output] / pool[input], 4)}{" "}
                {symbols[output]}
              </span>
            </div>
            <div>
              <span>Pool fee</span>
              <span>1.00% · stays in the pool</span>
            </div>
          </div>
          <button className="primary-button">
            {approved ? "Preview swap" : "Preview approval"} ↗
          </button>
          <p className="form-caption">
            Simulated trade · no gas, no real funds
          </p>
        </form>
      </section>
    </div>
  );
}
