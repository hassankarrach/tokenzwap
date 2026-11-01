import React, { useState } from "react";
import { fmt, symbols } from "../demo.js";
import { TokenIcon } from "../components/PoolOverview.jsx";
import artLogo from "../../assets/branding/art42.png";
export default function MarketplaceView({
  pool,
  setPool,
  listings,
  setListings,
  notify,
}) {
  const [showForm, setShowForm] = useState(false),
    [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    address: "",
    id: "",
    price: "",
    token: "a",
  });
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  function list(e) {
    e.preventDefault();
    const address = form.address.trim().toLowerCase(),
      id = Number(form.id),
      price = Number(form.price);
    if (
      !/^0x[a-f0-9]{40}$/.test(address) ||
      !Number.isSafeInteger(id) ||
      id < 0 ||
      !Number.isFinite(price) ||
      price <= 0
    )
      return notify(
        "Enter a valid contract address, token ID and positive price.",
      );
    if (listings.some((x) => x.address === address && x.id === id))
      return notify("This NFT is already listed.");
    setListings((xs) => [
      ...xs,
      {
        key: `${address}-${id}`,
        address,
        id,
        name: `Your collectible #${id}`,
        price,
        token: form.token,
        seller: true,
        color: "#72f6bf",
        glow: "#02cc8944",
      },
    ]);
    setShowForm(false);
    notify("Demo listing created. NFT ownership and escrow are simulated.");
  }
  function purchase(item) {
    if (!item.seller) {
      const wallet = item.token === "a" ? "walletA" : "walletB";
      if (pool[wallet] < item.price)
        return notify("Not enough demo tokens to purchase this NFT.");
      setPool((p) => ({ ...p, [wallet]: p[wallet] - item.price }));
    }
    setListings((xs) => xs.filter((x) => x.key !== item.key));
    notify(
      item.seller
        ? "Demo listing cancelled. NFT returned to the simulated seller."
        : "Demo purchase complete. Seller paid; liquidity reserves unchanged.",
    );
  }
  const visible = listings.filter((x) => filter === "all" || x.seller);
  return (
    <>
      <section className="panel marketplace market-view">
        <div className="panel-heading">
          <div>
            <h2 className="collection-heading">
              <img src={artLogo} alt="ART42" />
              Worth collecting
            </h2>
            <p>
              Browse Art42 collectibles, buy an NFT, or manage your listings.
            </p>
          </div>
          <button
            className="subtle-button"
            aria-expanded={showForm}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Close form" : "List an NFT"} ↗
          </button>
        </div>
        <div className="market-toolbar">
          <div className="segmented">
            {[
              ["all", "All collectibles"],
              ["mine", "My listings"],
            ].map(([value, label]) => (
              <button
                key={value}
                aria-pressed={filter === value}
                className={filter === value ? "selected" : ""}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="muted">
            {visible.length} active{" "}
            {visible.length === 1 ? "listing" : "listings"}
          </span>
        </div>
        {showForm && (
          <form className="listing-form" onSubmit={list}>
            <h3>List a collectible</h3>
            <div className="field-box">
              <label htmlFor="nft-address">NFT contract address</label>
              <input
                id="nft-address"
                name="address"
                className="full-input"
                placeholder="0x…"
                value={form.address}
                onChange={change}
                required
                pattern="0x[a-fA-F0-9]{40}"
              />
            </div>
            <div className="input-grid">
              <div className="field-box">
                <label htmlFor="nft-id">Token ID</label>
                <input
                  id="nft-id"
                  name="id"
                  className="full-input"
                  type="number"
                  min="0"
                  step="1"
                  value={form.id}
                  onChange={change}
                  required
                />
              </div>
              <div className="field-box">
                <label htmlFor="nft-price">Sale price</label>
                <input
                  id="nft-price"
                  name="price"
                  className="full-input"
                  type="number"
                  min="0"
                  step="any"
                  value={form.price}
                  onChange={change}
                  required
                />
              </div>
            </div>
            <div className="field-box">
              <label htmlFor="nft-payment">Payment token</label>
              <select
                id="nft-payment"
                name="token"
                value={form.token}
                onChange={change}
              >
                <option value="a">CLUB42</option>
                <option value="b">SWAP42</option>
              </select>
            </div>
            <p className="helper">
              Escrow and ownership are simulated in this preview. Payments go to
              sellers separately from the pool.
            </p>
            <button className="primary-button">Preview listing ↗</button>
          </form>
        )}
        <div className="nft-grid">
          {visible.map((item, index) => (
            <article className="nft-card" key={item.key}>
              <div
                className={`nft-art art-${(index % 3) + 1}`}
                style={{ "--art-color": item.color, "--art-glow": item.glow }}
              >
                <span className="art-edition">
                  ART42 / NO. {String(item.id).padStart(2, "0")}
                </span>
                <div className="crystal" />
              </div>
              <div className="nft-body">
                <div className="nft-name">
                  <span>{item.name}</span>
                  <small>{item.seller ? "Your listing" : "Art42"}</small>
                </div>
                <div className="nft-price">
                  <span className="price-token">
                    <TokenIcon token={item.token} small />
                    {fmt(item.price, 0)} {symbols[item.token]}
                  </span>
                  <button onClick={() => purchase(item)}>
                    {item.seller ? "Cancel listing" : "Buy NFT ↗"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {!visible.length && (
          <div className="empty-state">
            <h3>
              {filter === "mine"
                ? "No listings of your own"
                : "No active listings"}
            </h3>
            <p>List a collectible to explore the marketplace.</p>
            <button
              className="secondary-button"
              onClick={() => setShowForm(true)}
            >
              List an NFT ↗
            </button>
          </div>
        )}
        <p className="market-note">
          Demo collectibles · illustrative artwork · payments stay separate from
          liquidity reserves
        </p>
      </section>
    </>
  );
}
