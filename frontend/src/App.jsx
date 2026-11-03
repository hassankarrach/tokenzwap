import React, { useEffect, useState } from "react";
import logo from "../assets/branding/tokenzwap.png";
import useWallet from "./useWallet.js";
import LiveBalances from "./components/LiveBalances.jsx";
import MeshBackground from "./components/MeshBackground.jsx";
import bnbIcon from "../assets/branding/bnb-chain.svg";
const views = {
  overview: { label: "Pool & balances", icon: "◉" },
  swap: {
    label: "Swap",
    icon: "⇄",
    title: "Your tokens.",
    accent: "In motion.",
    description: "Exchange CLUB42 and SWAP42 in one shared pool.",
  },
  liquidity: {
    label: "Add liquidity",
    icon: "◈",
    title: "Your share.",
    accent: "Your pool.",
    description:
      "Add both tokens, track your LP position, or withdraw your share.",
  },
  withdraw: { label: "Withdraw", icon: "↙" },
  nfts: {
    label: "NFT Marketplace",
    icon: "▧",
    title: "Something worth",
    accent: "collecting.",
    description: "Explore Art42 collectibles and manage fixed-price listings.",
  },
};
const currentView = () =>
  location.hash === "#balances" ? "overview" : Object.hasOwn(views, location.hash.slice(1))
    ? location.hash.slice(1)
    : "swap";
export default function App() {
  const [view, setView] = useState(currentView);
  const wallet = useWallet();
  useEffect(() => {
    const change = () => setView(currentView());
    window.addEventListener("hashchange", change);
    return () => {
      window.removeEventListener("hashchange", change);
    };
  }, []);
  useEffect(() => {
    document.title = `${views[view].label} · TokenZwap`;
    window.scrollTo(0, 0);
  }, [view]);
  const page = views[view];
  return (
    <>
      <MeshBackground />
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
                BNB Testnet
              </span>
              <button
                className="wallet-button"
                disabled={wallet.pending}
                onClick={wallet.connect}
              >
                {wallet.pending ? "Connecting…" : wallet.account ? `${wallet.account.slice(0,6)}…${wallet.account.slice(-4)}` : "Connect wallet ↗"}
              </button>
            </div>
          </header>
          <main className={view === "nfts" ? "nft-marketplace-page" : undefined}>
            <div className="page-heading">
              <div>
                <h1>{page.label}</h1>
              </div>
              <span className="chain-pill">
                <img className="bnb-icon" src={bnbIcon} alt="" />BNB Testnet{" "}
                <span className="live-dot" />
              </span>
            </div>
            <div key={view} className="route-view">
              <LiveBalances wallet={wallet} view={view} />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
