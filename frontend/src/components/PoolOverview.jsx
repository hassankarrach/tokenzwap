import React from "react";
import { fmt, symbols } from "../demo.js";
export function TokenIcon({ token, small = false }) {
  return (
    <span
      aria-hidden="true"
      className={`token-icon ${small ? "small" : ""} ${{ a: "club-icon", b: "pink-icon", lp: "dim-icon" }[token]}`}
    />
  );
}
export function Wallet({ pool }) {
  return (
    <article className="panel wallet-panel">
      <div className="panel-heading">
        <h2>Your balance</h2>
        <span className="small-tag">DEMO</span>
      </div>
      {["a", "b"].map((token) => (
        <div className="balance-row" key={token}>
          <TokenIcon token={token} small />
          <div>
            {token === "a" ? "Club42" : "Swap42"}
            <small>{symbols[token]}</small>
          </div>
          <strong>{fmt(pool[token === "a" ? "walletA" : "walletB"])}</strong>
        </div>
      ))}
    </article>
  );
}
export default function PoolOverview({ pool }) {
  return (
    <section className="stats" aria-label="Pool overview">
      {[
        ["a", "Token A reserve", pool.a],
        ["b", "Token B reserve", pool.b],
        ["lp", "Your liquidity", pool.lp],
      ].map(([token, label, value]) => (
        <article
          key={token}
          className={`stat-card ${token === "a" ? "teal" : token === "b" ? "pink" : ""}`}
        >
          <div className="stat-top">
            <TokenIcon token={token} />
            <span>
              {label}
              <small>{symbols[token]}</small>
            </span>
            <span className="stat-arrow">↗</span>
          </div>
          <div className="stat-number">
            {fmt(value)}
            <span>{symbols[token]}</span>
          </div>
          <div className="stat-foot">
            {token === "lp"
              ? `Your share: ${fmt((pool.lp / pool.supply) * 100)}%`
              : "Available in the pool"}
          </div>
        </article>
      ))}
    </section>
  );
}
