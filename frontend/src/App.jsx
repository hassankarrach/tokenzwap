import React, { useEffect, useRef, useState } from "react";
import PoolOverview from "./components/PoolOverview.jsx";
import SwapView from "./views/SwapView.jsx";
import LiquidityView from "./views/LiquidityView.jsx";
import MarketplaceView from "./views/MarketplaceView.jsx";
import { initialPool, initialListings } from "./demo.js";
import logo from "../assets/branding/tokenzwap.png";
import useWallet from "./useWallet.js";
import LiveBalances from "./components/LiveBalances.jsx";
import bnbIcon from "../assets/branding/bnb-chain.svg";
const views = {
  swap: {
    label: "Swap",
    icon: "⇄",
    title: "Your tokens.",
    accent: "In motion.",
    description: "Exchange CLUB42 and SWAP42 in one shared pool.",
  },
  liquidity: {
    label: "Liquidity",
    icon: "◈",
    title: "Your share.",
    accent: "Your pool.",
    description:
      "Add both tokens, track your LP position, or withdraw your share.",
  },
  nfts: {
    label: "NFT Marketplace",
    icon: "▧",
    title: "Something worth",
    accent: "collecting.",
    description: "Explore Art42 collectibles and manage fixed-price listings.",
  },
};
const currentView = () =>
  Object.hasOwn(views, location.hash.slice(1))
    ? location.hash.slice(1)
    : "swap";
export default function App() {
  const [view, setView] = useState(currentView),
    [pool, setPool] = useState(initialPool),
    [listings, setListings] = useState(initialListings),
    [toast, setToast] = useState("");
  const timer = useRef();
  const wallet = useWallet();
  const [demoMode, setDemoMode] = useState(false);
  useEffect(() => {
    const change = () => setView(currentView());
    window.addEventListener("hashchange", change);
    return () => {
      window.removeEventListener("hashchange", change);
      clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    document.title = `${views[view].label} · TokenZwap`;
  }, [view]);
  function notify(message) {
    setToast(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 6000);
  }
  const page = views[view];
  const props = { pool, setPool, notify };
  return (
    <>
      <div className="app-shell">
        <aside className="sidebar">
          <a className="brand" href="#swap">
            <img className="brand-logo" src={logo} alt="" />
            TokenZwap<span className="brand-dot">.</span>
          </a>
          <nav aria-label="Main navigation">
            {Object.entries(views).map(([key, item]) => (
              <a
                key={key}
                href={`#${key}`}
                aria-current={view === key ? "page" : undefined}
                className={`nav-item ${view === key ? "active" : ""}`}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
                {view === key && <span className="nav-arrow">↗</span>}
              </a>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <a href="/contract-reference.txt" target="_blank" rel="noopener">
              Contract reference ↗
            </a>
          </div>
        </aside>
        <div className="main-shell">
          <header>
            <div className="breadcrumb">
              <strong>{page.label}</strong>
            </div>
            <div className="header-actions">
              <span className="demo-badge">
                <i />
                {demoMode ? "Demo preview" : "BNB Testnet"}
              </span>
              <button
                className="wallet-button"
                disabled={wallet.pending}
                onClick={() => { setDemoMode(false); wallet.connect(); }}
              >
                {wallet.pending ? "Connecting…" : wallet.account ? `${wallet.account.slice(0,6)}…${wallet.account.slice(-4)}` : "Connect wallet ↗"}
              </button>
            </div>
          </header>
          <main>
            <div className="page-heading">
              <div>
                <h1>{page.label}</h1>
              </div>
              <span className="chain-pill">
                <img className="bnb-icon" src={bnbIcon} alt="" />BNB Testnet{" "}
                <span className="live-dot" />
              </span>
            </div>
            <div className="demo-note">
              <span>◉</span>
              <p>{demoMode ? "Demo · Simulated balances. No real transactions." : "Live balances · Transactions are not enabled yet."}</p>
              <button className="text-button" onClick={() => setDemoMode(!demoMode)}>{demoMode ? "Live balances" : "Try demo"}</button>
            </div>
            {demoMode && view !== "nfts" && <PoolOverview pool={pool} />}
            <div key={view} className="route-view">
              {!demoMode ? <LiveBalances wallet={wallet} view={view} /> : view === "swap" ? (
                <SwapView {...props} />
              ) : view === "liquidity" ? (
                <LiquidityView {...props} />
              ) : (
                <MarketplaceView
                  {...props}
                  listings={listings}
                  setListings={setListings}
                />
              )}
            </div>
          </main>
        </div>
      </div>
      {toast && (
        <div id="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </>
  );
}
