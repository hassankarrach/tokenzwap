import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserProvider, Contract, formatUnits, ZeroAddress } from 'ethers';
import deployment from '../../../deployment/bnb-testnet.json';
import { assertWallet } from '../liquidity.js';
import { nftABI, marketABI, listingPrice, sendNFTTransaction } from '../nft.js';
import { walletError } from '../useWallet.js';

const contracts = deployment.contracts;
const artwork = import.meta.glob('../../assets/art42/character-*-branded.png', { eager: true, query: '?url', import: 'default' });
const imageFor = id => artwork[`../../assets/art42/character-${String(id).padStart(2, '0')}-branded.png`];
const same = (a, b) => a?.toLowerCase() === b?.toLowerCase();

export default function LiveNFT({ wallet }) {
  const [items, setItems] = useState([]), [selected, setSelected] = useState(1);
  const [payment, setPayment] = useState('a'), [price, setPrice] = useState('5');
  const [loading, setLoading] = useState(true), [readError, setReadError] = useState('');
  const [busy, setBusy] = useState(false), [status, setStatus] = useState(''), [hash, setHash] = useState('');
  const version = useRef(0), lock = useRef(false);
  const refresh = useCallback(async () => {
    const request = ++version.current;
    setLoading(true); setReadError('');
    try {
      await assertWallet(window.ethereum, wallet.account);
      const provider = new BrowserProvider(window.ethereum), block = await provider.getBlockNumber(), tag = { blockTag: block };
      const nft = new Contract(contracts.Art42.address, nftABI, provider);
      const market = new Contract(contracts.TokenZwap.address, marketABI, provider);
      const rows = await Promise.all(Array.from({ length: 10 }, async (_, index) => {
        const id = index + 1, minted = await nft.isMinted(id, tag);
        if (!minted) return { id, minted: false };
        const [owner, approved, listing] = await Promise.all([nft.ownerOf(id, tag), nft.getApproved(id, tag), market.listings(contracts.Art42.address, id, tag)]);
        const operator = same(owner, wallet.account) ? await nft.isApprovedForAll(owner, contracts.TokenZwap.address, tag) : false;
        return { id, minted, owner, approved: operator || same(approved, contracts.TokenZwap.address),
          listed: listing.seller !== ZeroAddress, seller: listing.seller, paymentToken: listing.paymentToken, price: listing.price.toString() };
      }));
      if (request === version.current) setItems(rows);
    } catch (e) { if (request === version.current) { setItems([]); setReadError(walletError(e)); } }
    finally { if (request === version.current) setLoading(false); }
  }, [wallet.account]);
  useEffect(() => { refresh(); return () => { version.current++; }; }, [refresh, wallet.data?.block]);
  const item = items.find(row => row.id === selected), owned = item && same(item.owner, wallet.account);
  let parsedPrice, validation = '';
  try { parsedPrice = listingPrice(price); } catch (e) { validation = e.message; }
  async function transact(action) {
    if (lock.current || loading || !item) return;
    if (action === 'mint' ? item.minted : !owned || item.listed) return;
    if (action === 'list' && (validation || !item.approved)) return;
    lock.current = true; setBusy(true); setHash('');
    try {
      await assertWallet(window.ethereum, wallet.account);
      const signer = await new BrowserProvider(window.ethereum).getSigner(wallet.account);
      setStatus(`Confirm ${action === 'mint' ? 'minting' : action === 'approve' ? 'NFT approval' : 'the listing'} in MetaMask.`);
      const tx = await sendNFTTransaction({ ethereum: window.ethereum, account: wallet.account, signer, contracts,
        action, tokenId: selected, payment, price: parsedPrice });
      setHash(tx.hash); setStatus('Transaction submitted. Waiting for confirmation…');
      let receipt;
      try { receipt = await tx.wait(); }
      catch (e) { if (e.code !== 'TRANSACTION_REPLACED' || e.cancelled) throw e; receipt = e.receipt; setHash(receipt.hash); }
      if (!receipt || receipt.status !== 1) throw Error('Transaction failed. No NFT action was completed.');
      setStatus(action === 'list' ? 'Listing confirmed. Your NFT is now held in marketplace escrow.' : action === 'approve' ? 'NFT approval confirmed. You can now list it.' : 'Mint confirmed. The NFT belongs to your wallet.');
    } catch (e) { setStatus(e.code === 'ACTION_REJECTED' || e.code === 4001 ? 'Wallet request declined. You can try again.' : walletError(e)); }
    finally { await Promise.all([refresh(), wallet.refresh()]); lock.current = false; setBusy(false); }
  }
  return <>
    <section className="panel action-panel nft-manage">
      <div className="panel-heading"><h2>Mint & list Art42</h2><button className="subtle-button" disabled={loading || busy} onClick={refresh}>Refresh NFTs</button></div>
      <p className="helper">Choose one of ten IDs. Minting is free apart from gas. Approve the selected NFT, then list it at a fixed CLUB42 or SWAP42 price.</p>
      {readError && <p role="alert" className="wallet-error">{readError}</p>}
      <label htmlFor="art-id">Art42 token ID</label>
      <select id="art-id" className="full-input" value={selected} disabled={loading || busy} onChange={e => setSelected(Number(e.target.value))}>{Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>Art42 #{i + 1}</option>)}</select>
      {loading ? <p className="helper">Refreshing NFT ownership and listings…</p> : item && <>
        {!item.minted ? <button className="primary-button" disabled={busy} onClick={() => transact('mint')}>Mint Art42 #{selected}</button> : item.listed ? <p className="helper">Listed for {formatUnits(item.price, 18)} {same(item.paymentToken, contracts.Club42.address) ? 'CLUB42' : 'SWAP42'}. The marketplace holds this NFT in escrow.</p> : !owned ? <p className="helper">This NFT belongs to another wallet. Select an available ID to mint.</p> : <>
          <p className="helper">You own Art42 #{selected}.</p>
          <div className="input-grid">
            <div className="field-box"><label htmlFor="nft-price">Listing price</label><input id="nft-price" className="full-input" inputMode="decimal" value={price} disabled={busy} onChange={e => setPrice(e.target.value)} /></div>
            <div className="field-box"><label htmlFor="nft-payment">Payment token</label><select id="nft-payment" value={payment} disabled={busy} onChange={e => setPayment(e.target.value)}><option value="a">CLUB42</option><option value="b">SWAP42</option></select></div>
          </div>
          {validation && <p role="alert" className="helper">{validation}</p>}
          {!item.approved && <button className="primary-button" disabled={busy} onClick={() => transact('approve')}>Approve Art42 #{selected}</button>}
          <button className="primary-button" disabled={busy || !item.approved || Boolean(validation)} onClick={() => transact('list')}>List NFT ↗</button>
          <p className="helper">Listing transfers this NFT into escrow. Payment is received only when someone buys it. Purchase and cancellation controls are the next step.</p>
        </>}
      </>}
      <p role="status" aria-live="polite" className="helper">{status}</p>
      {hash && <a href={`https://testnet.bscscan.com/tx/${hash}`} target="_blank" rel="noopener noreferrer">View transaction ↗</a>}
    </section>
    <section className="nft-grid live-art-grid" aria-label="Art42 collection">{items.map(row => <article className="nft-card" key={row.id}>
      <img loading="lazy" className="live-art-image" src={imageFor(row.id)} alt={`Branded Art42 preview ${row.id}`} />
      <div className="nft-body"><h3>Art42 #{row.id}</h3><p className="helper">{!row.minted ? 'Available to mint' : row.listed ? 'Listed · in escrow' : same(row.owner, wallet.account) ? 'Owned by you' : 'Owned by another wallet'}</p><button className="subtle-button" disabled={busy || loading} onClick={() => setSelected(row.id)}>Select #{row.id}</button></div>
    </article>)}</section>
    <p className="helper">Branded collection previews; these images do not replace the NFT’s immutable on-chain metadata.</p>
  </>;
}
