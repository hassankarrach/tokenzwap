import React, { useState } from "react";
import { fmt } from "../demo.js";
import { TokenIcon, Wallet } from "../components/PoolOverview.jsx";
export default function LiquidityView({ pool, setPool, notify }) {
  const [mode, setMode] = useState("add"),
    [amount, setAmount] = useState("10");
  const n = Number(amount),
    b = (n * pool.b) / pool.a;
  function submit(e) {
    e.preventDefault();
    if (!Number.isFinite(n) || n <= 0)
      return notify("Enter a positive amount.");
    if (mode === "add") {
      if (n > pool.walletA || b > pool.walletB)
        return notify("Not enough demo tokens for both sides.");
      const shares = (n * pool.supply) / pool.a;
      setPool((p) => ({
        ...p,
        a: p.a + n,
        b: p.b + b,
        walletA: p.walletA - n,
        walletB: p.walletB - b,
        lp: p.lp + shares,
        supply: p.supply + shares,
      }));
      notify(`Demo deposit complete: received ${fmt(shares, 4)} TZLP.`);
    } else {
      if (n > pool.lp) return notify("Withdrawal exceeds your LP balance.");
      const a = (n * pool.a) / pool.supply,
        b = (n * pool.b) / pool.supply;
      setPool((p) => ({
        ...p,
        a: p.a - a,
        b: p.b - b,
        walletA: p.walletA + a,
        walletB: p.walletB + b,
        lp: p.lp - n,
        supply: p.supply - n,
      }));
      notify(`Demo withdrawal: ${fmt(a, 4)} CLUB42 + ${fmt(b, 4)} SWAP42.`);
    }
  }
  return (
    <div className="content-grid">
      <section className="panel action-panel">
        <div className="panel-heading">
          <h2>Manage your liquidity</h2>
          <span className="small-tag">TZLP</span>
        </div>
        <div className="segmented">
          {["add", "remove"].map((m) => (
            <button
              key={m}
              aria-pressed={mode === m}
              className={mode === m ? "selected" : ""}
              onClick={() => setMode(m)}
            >
              {m === "add" ? "Add liquidity" : "Withdraw"}
            </button>
          ))}
        </div>
        <form onSubmit={submit}>
          <div className="field-box">
            <label htmlFor="lp-amount">
              {mode === "add"
                ? "Token A · CLUB42"
                : "LP tokens to redeem · TZLP"}
            </label>
            <div className="amount-row">
              <input
                id="lp-amount"
                type="number"
                min="0"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <TokenIcon token={mode === "add" ? "a" : "lp"} />
            </div>
            {mode === "remove" && (
              <button
                className="text-button"
                type="button"
                onClick={() => setAmount(String(pool.lp))}
              >
                MAX
              </button>
            )}
          </div>
          {mode === "add" ? (
            <>
              <div className="field-box">
                <label htmlFor="lp-b">Token B · SWAP42</label>
                <div className="amount-row">
                  <input
                    id="lp-b"
                    value={Number.isFinite(b) ? b.toFixed(8) : ""}
                    readOnly
                  />
                  <TokenIcon token="b" />
                </div>
              </div>
              <p className="helper">
                Both tokens are added at the current pool ratio.
              </p>
            </>
          ) : (
            <p className="helper">
              Your balance: {fmt(pool.lp)} TZLP.
              <br />
              Estimated return: {fmt((n * pool.a) / pool.supply, 4)} CLUB42 +{" "}
              {fmt((n * pool.b) / pool.supply, 4)} SWAP42.
            </p>
          )}
          <button className="primary-button">
            {mode === "add" ? "Preview deposit" : "Preview withdrawal"} ↗
          </button>
          <p className="form-caption">Simulated liquidity · no real funds</p>
        </form>
      </section>
      <aside className="right-column">
        <article className="panel action-panel">
          <div className="panel-heading">
            <h2>Your pool position</h2>
            <TokenIcon token="lp" />
          </div>
          <div className="position-number">
            {fmt(pool.lp)} <small>TZLP</small>
          </div>
          <p className="helper">
            {fmt((pool.lp / pool.supply) * 100)}% of the pool
          </p>
          <div className="swap-details">
            <div>
              <span>Your CLUB42 share</span>
              <span>{fmt((pool.lp * pool.a) / pool.supply)}</span>
            </div>
            <div>
              <span>Your SWAP42 share</span>
              <span>{fmt((pool.lp * pool.b) / pool.supply)}</span>
            </div>
            <div>
              <span>Pool swap fee</span>
              <span>1%</span>
            </div>
          </div>
        </article>
        <Wallet pool={pool} />
      </aside>
    </div>
  );
}
