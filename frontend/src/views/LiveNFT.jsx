import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserProvider, Contract, formatUnits, ZeroAddress } from 'ethers';
import deployment from '../../../deployment/bnb-testnet.json';
import { assertWallet } from '../liquidity.js';
import { nftABI, marketABI, listingPrice, purchaseState, sendNFTTransaction } from '../nft.js';
import Art42Gallery from '../components/Art42Gallery.jsx';
import { walletError } from '../useWallet.js';

const contracts = deployment.contracts;
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
        let buyBalance = '0', buyAllowance = '0';
        if (listing.seller !== ZeroAddress && [contracts.Club42.address, contracts.Swap42.address].some(address => same(address, listing.paymentToken))) {
          const paymentToken = new Contract(listing.paymentToken, ['function balanceOf(address) view returns(uint256)', 'function allowance(address,address) view returns(uint256)'], provider);
          const values = await Promise.all([paymentToken.balanceOf(wallet.account, tag), paymentToken.allowance(wallet.account, contracts.TokenZwap.address, tag)]);
          [buyBalance, buyAllowance] = values.map(value => value.toString());
        }
        return { id, minted, owner, buyBalance, buyAllowance, approved: operator || same(approved, contracts.TokenZwap.address),
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
  const seller = item?.listed && same(item.seller, wallet.account);
  let purchase, purchaseError = '';
  if (item?.listed) { try { purchase = purchaseState(item, contracts); } catch (e) { purchaseError = e.message; } }
  async function transact(action) {
    if (lock.current) return;
    if (loading || !item) { setStatus('NFT details are refreshing. Wait for the current ownership check, then try again.'); return; }
    if (['buy', 'paymentApprove', 'cancel'].includes(action) ? !item.listed : action === 'mint' ? item.minted : !owned || item.listed) { setStatus('This action is unavailable for the selected NFT. Refresh its ownership and listing status.'); return; }
    if (action === 'list' && validation) { setStatus(validation); return; }
    if (action === 'list' && !item.approved) { setStatus(`Approve Art42 #${selected} first, then confirm the separate listing transaction.`); return; }
    if (action === 'cancel' && !seller) { setStatus('Only the listing seller can cancel.'); return; }
    if (['buy', 'paymentApprove'].includes(action) && (!purchase || purchase.insufficient)) { setStatus(purchaseError || 'Not enough payment tokens to buy this NFT.'); return; }
    if (action === 'buy' && purchase.needsApproval) { setStatus('Approve the payment token first.'); return; }
    lock.current = true; setBusy(true); setHash('');
    try {
      await assertWallet(window.ethereum, wallet.account);
      const signer = await new BrowserProvider(window.ethereum).getSigner(wallet.account);
      setStatus(`Confirm ${{ mint: 'minting', approve: 'NFT approval', list: 'the listing', paymentApprove: 'payment-token approval', buy: 'the purchase', cancel: 'listing cancellation' }[action]} in MetaMask.`);
      const tx = await sendNFTTransaction({ ethereum: window.ethereum, account: wallet.account, signer, contracts,
        action, tokenId: selected, payment: action === 'paymentApprove' ? purchase.payment : payment, price: action === 'paymentApprove' ? purchase.price : parsedPrice });
      setHash(tx.hash); setStatus('Transaction submitted. Waiting for confirmation…');
      let receipt;
      try { receipt = await tx.wait(); }
      catch (e) { if (e.code !== 'TRANSACTION_REPLACED' || e.cancelled) throw e; receipt = e.receipt; setHash(receipt.hash); }
      if (!receipt || receipt.status !== 1) throw Error('Transaction failed. No NFT action was completed.');
      setStatus({ list: 'Listing confirmed. Your NFT is now held in marketplace escrow.', approve: 'NFT approval confirmed. You can now list it.', mint: 'Mint confirmed. The NFT belongs to your wallet.', paymentApprove: 'Payment-token approval confirmed. You can now buy the NFT.', buy: 'Purchase confirmed. The NFT is yours and payment went directly to the seller.', cancel: 'Cancellation confirmed. The NFT is back in your wallet.' }[action]);
    } catch (e) { setStatus(e.code === 'ACTION_REJECTED' || e.code === 4001 ? 'Wallet request declined. You can try again.' : walletError(e)); }
    finally { await Promise.all([refresh(), wallet.refresh()]); lock.current = false; setBusy(false); }
  }
  return <Art42Gallery selected={selected} onSelect={setSelected} items={items} account={wallet.account} busy={busy}>
    <section className="panel action-panel nft-manage">
      <div className="panel-heading"><h2>Art42 marketplace</h2><button className="subtle-button" disabled={loading || busy} onClick={refresh}>Refresh NFTs</button></div>
      <p className="helper">Choose one of ten IDs. Minting is free apart from gas. Approve the selected NFT, then list it at a fixed CLUB42 or SWAP42 price.</p>
      {readError && <p role="alert" className="wallet-error">{readError}</p>}
      <label htmlFor="art-id">Art42 token ID</label>
      <select id="art-id" className="full-input" value={selected} disabled={loading || busy} onChange={e => setSelected(Number(e.target.value))}>{Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>Art42 #{i + 1}</option>)}</select>
      {loading ? <p className="helper">Refreshing NFT ownership and listings…</p> : item && <>
        {!item.minted ? <button className="primary-button" disabled={busy} onClick={() => transact('mint')}>Mint Art42 #{selected}</button>  : item.listed ? <>
          <p className="helper">Listed for {formatUnits(item.price, 18)} {same(item.paymentToken, contracts.Club42.address) ? 'CLUB42' : 'SWAP42'}. The marketplace holds this NFT in escrow.</p>
          {seller ? <>
            <p className="helper">You are the seller. Cancel to receive this NFT back in your wallet.</p>
            <button className="primary-button" disabled={busy} onClick={() => transact('cancel')}>{busy ? 'Transaction pending…' : 'Cancel listing ↗'}</button>
          </> : <>
            <p className="helper">Seller: {item.seller}</p>
            {purchaseError && <p className="helper" role="alert">{purchaseError}</p>}
            {purchase?.insufficient && <p className="helper" role="alert">Not enough {purchase.payment === 'a' ? 'CLUB42' : 'SWAP42'} to pay this price.</p>}
            {purchase?.needsApproval ? <>
              <p className="helper">Approve the exact listed payment amount, then confirm the separate purchase.</p>
              <button className="primary-button" disabled={busy || purchase.insufficient} onClick={() => transact('paymentApprove')}>{busy ? 'Transaction pending…' : `Approve ${formatUnits(purchase.price, 18)} ${purchase.payment === 'a' ? 'CLUB42' : 'SWAP42'} ↗`}</button>
            </> : <button className="primary-button" disabled={busy || !purchase || purchase.insufficient} onClick={() => transact('buy')}>{busy ? 'Transaction pending…' : 'Buy Art42 #' + selected + ' ↗'}</button>}
            <p className="helper">Payment goes directly to the seller, separate from pool reserves. Purchase uses the listing terms at execution; refresh before confirming.</p>
          </>}
        </> : !owned ? <p className="helper">This NFT belongs to another wallet. Select an available ID to mint.</p> : <>
          <p className="helper">You own Art42 #{selected}.</p>
          <div className="input-grid">
            <div className="field-box"><label htmlFor="nft-price">Listing price</label><input id="nft-price" className="full-input" inputMode="decimal" value={price} disabled={busy} onChange={e => setPrice(e.target.value)} /></div>
            <div className="field-box"><label htmlFor="nft-payment">Payment token</label><select id="nft-payment" value={payment} disabled={busy} onChange={e => setPayment(e.target.value)}><option value="a">CLUB42</option><option value="b">SWAP42</option></select></div>
          </div>
          {validation && <p role="alert" className="helper">{validation}</p>}
          {!item.approved ? <>
            <p className="helper">Step 1 of 2: approve this NFT so the marketplace can hold it in escrow. After confirmation, the List NFT button will appear.</p>
            <button className="primary-button" disabled={busy} onClick={() => transact('approve')}>{busy ? 'Approval pending…' : `Approve Art42 #${selected} ↗`}</button>
          </> : <>
            <p className="helper">Step 2 of 2: approval is confirmed. List the NFT for {price} {payment === 'a' ? 'CLUB42' : 'SWAP42'} in a separate MetaMask transaction.</p>
            <button className="primary-button" disabled={busy || Boolean(validation)} onClick={() => transact('list')}>{busy ? 'Listing pending…' : 'List NFT ↗'}</button>
          </>}
          <p className="helper">Listing transfers this NFT into escrow. Payment is received only when someone buys it. You can cancel while it remains listed.</p>
        </>}
      </>}
      <p role="status" aria-live="polite" className="helper">{status}</p>
      {hash && <a href={`https://testnet.bscscan.com/tx/${hash}`} target="_blank" rel="noopener noreferrer">View transaction ↗</a>}
    </section>
  </Art42Gallery>;
}
