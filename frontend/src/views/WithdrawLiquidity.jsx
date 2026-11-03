import React, { useRef, useState } from 'react';
import { BrowserProvider, formatUnits } from 'ethers';
import deployment from '../../../deployment/bnb-testnet.json';
import { assertWallet, sendLiquidityTransaction, withdrawalQuote } from '../liquidity.js';
import { walletError } from '../useWallet.js';

export default function WithdrawLiquidity({ wallet }) {
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false), [status, setStatus] = useState(''), [hash, setHash] = useState('');
  const lock = useRef(false);
  const { data } = wallet;
  let quote, error = '';
  if (data && amount) {
    try { quote = withdrawalQuote(amount, data); }
    catch (e) { error = e.message; }
  }
  async function withdraw(e) {
    e.preventDefault();
    if (lock.current || !quote || wallet.loading) return;
    lock.current = true; setBusy(true); setHash('');
    const account = wallet.account;
    try {
      await assertWallet(window.ethereum, account);
      const signer = await new BrowserProvider(window.ethereum).getSigner(account);
      setStatus('Confirm the withdrawal in MetaMask.');
      const tx = await sendLiquidityTransaction({ ethereum: window.ethereum, account, signer,
        contracts: deployment.contracts, action: 'withdraw', shares: quote.shares });
      setHash(tx.hash); setStatus('Withdrawal submitted. Waiting for confirmation…');
      let receipt;
      try { receipt = await tx.wait(); }
      catch (e) {
        if (e.code !== 'TRANSACTION_REPLACED' || e.cancelled) throw e;
        receipt = e.receipt; setHash(receipt.hash);
      }
      if (!receipt || receipt.status !== 1) throw Error('Withdrawal failed. Your liquidity was not withdrawn.');
      setStatus('Withdrawal confirmed. Your TZLP was burned and both tokens returned. Refreshing balances…');
      setAmount('');
    } catch (e) {
      setStatus(e.code === 'ACTION_REJECTED' || e.code === 4001 ? 'Wallet request declined. You can try again.' : walletError(e));
    } finally {
      await wallet.refresh(); lock.current = false; setBusy(false);
    }
  }
  return <section className="panel action-panel initial-liquidity withdrawal-panel">
    <h2>Withdraw liquidity</h2>
    <p className="helper">Redeem your TZLP for your share of both pool reserves. No token approval is needed.</p>
    {!data ? <p className="helper">Waiting for pool balances.</p> : <form onSubmit={withdraw}>
      <div className="field-box">
        <label htmlFor="withdraw-shares">TZLP to redeem</label>
        <div className="amount-row"><input id="withdraw-shares" inputMode="decimal" value={amount} disabled={busy} onChange={e => setAmount(e.target.value)} /></div>
        <button type="button" className="text-button" disabled={busy || wallet.loading || BigInt(data.lp) === 0n} onClick={() => setAmount(formatUnits(data.lp, 18))}>MAX</button>
      </div>
      <p className="helper">Available: {formatUnits(data.lp, 18)} TZLP</p>
      {BigInt(data.lp) === 0n && <p className="helper">You have no TZLP to withdraw.</p>}
      {error && <p role="alert" className="helper">{error}</p>}
      {quote && <div className="swap-details" aria-live="polite">
        <div><span>Estimated CLUB42 return</span><span>{formatUnits(quote.amountA, 18)}</span></div>
        <div><span>Estimated SWAP42 return</span><span>{formatUnits(quote.amountB, 18)}</span></div>
      </div>}
      <p className="helper">Returns use current reserves and round down, matching the contract. They can change before confirmation.</p>
      <button className="primary-button" disabled={busy || wallet.loading || !quote}>{busy ? 'Withdrawal pending…' : 'Withdraw liquidity ↗'}</button>
      <p className="form-caption">BNB testnet · gas paid in tBNB</p>
    </form>}
    <p role="status" aria-live="polite" className="helper">{status}</p>
    {hash && <a href={`https://testnet.bscscan.com/tx/${hash}`} target="_blank" rel="noopener noreferrer">View transaction ↗</a>}
  </section>;
}
