import React, { useRef, useState } from 'react';
import { BrowserProvider, formatUnits } from 'ethers';
import deployment from '../../../deployment/bnb-testnet.json';
import { assertWallet } from '../liquidity.js';
import { swapQuote, sendSwapTransaction } from '../swap.js';
import { TokenIcon } from '../components/PoolOverview.jsx';
import { walletError } from '../useWallet.js';

export default function LiveSwap({ wallet }) {
  const [direction, setDirection] = useState('a'), [amount, setAmount] = useState('1');
  const [busy, setBusy] = useState(false), [status, setStatus] = useState(''), [hash, setHash] = useState('');
  const lock = useRef(false);
  const { data } = wallet;
  const input = direction === 'a' ? 'CLUB42' : 'SWAP42', output = direction === 'a' ? 'SWAP42' : 'CLUB42';
  let quote, error = '';
  if (data) {
    try { quote = swapQuote(amount, direction, data); }
    catch (e) { error = e.message; }
  }
  async function transact(approve) {
    if (lock.current || !quote || wallet.loading || (!approve && quote.needsApproval)) return;
    lock.current = true; setBusy(true); setHash('');
    const account = wallet.account;
    try {
      await assertWallet(window.ethereum, account);
      const signer = await new BrowserProvider(window.ethereum).getSigner(account);
      setStatus(`Confirm ${approve ? input + ' approval' : 'the swap'} in MetaMask.`);
      const tx = await sendSwapTransaction({ ethereum: window.ethereum, account, signer, contracts: deployment.contracts,
        direction, amountIn: quote.amountIn, approve });
      setHash(tx.hash); setStatus('Transaction submitted. Waiting for confirmation…');
      let receipt;
      try { receipt = await tx.wait(); }
      catch (e) {
        if (e.code !== 'TRANSACTION_REPLACED' || e.cancelled) throw e;
        receipt = e.receipt; setHash(receipt.hash);
      }
      if (!receipt || receipt.status !== 1) throw Error('Transaction failed. No swap was completed.');
      setStatus(approve ? `${input} approval confirmed. Refreshing allowance…` : 'Swap confirmed. Refreshing your balances and pool reserves…');
    } catch (e) {
      setStatus(e.code === 'ACTION_REJECTED' || e.code === 4001 ? 'Wallet request declined. You can try again.' : walletError(e));
    } finally {
      await wallet.refresh(); lock.current = false; setBusy(false);
    }
  }
  return <section className="panel action-panel initial-liquidity live-swap-card">
    <h2>Swap tokens</h2>
    <p className="helper">Exchange CLUB42 and SWAP42. The pool retains a 1% input fee.</p>
    {!data ? <p className="helper">Waiting for balances and pool reserves.</p> : <>
      <div className="swap-token-stack">
        <div className="field-box swap-token-panel">
          <div className="swap-token-line">
            <label className="swap-token-badge" htmlFor="live-swap-input"><TokenIcon token={direction}/><span>{input}</span></label>
            <input id="live-swap-input" aria-label={`Amount of ${input} to pay`} inputMode="decimal" value={amount} disabled={busy} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="swap-token-caption"><span>You pay</span><span>Balance: {formatUnits(data[direction], 18)}</span></div>
        </div>
        <button type="button" className="swap-direction-button" aria-label="Reverse swap direction" title="Reverse swap direction" disabled={busy} onClick={() => { setDirection(value => value === 'a' ? 'b' : 'a'); setStatus(''); setHash(''); }}><span aria-hidden="true">⇅</span></button>
        <div className="field-box swap-token-panel">
          <div className="swap-token-line">
            <label className="swap-token-badge" htmlFor="live-swap-output"><TokenIcon token={direction === 'a' ? 'b' : 'a'}/><span>{output}</span></label>
            <input id="live-swap-output" aria-label={`Estimated ${output} received`} readOnly value={quote ? formatUnits(quote.amountOut, 18) : '—'} />
          </div>
          <div className="swap-token-caption"><span>Estimated receive</span><span>Balance: {formatUnits(data[direction === 'a' ? 'b' : 'a'], 18)}</span></div>
        </div>
      </div>
      {error && <p role="alert" className="helper">{error}</p>}
      <p className="helper">Estimate includes the 1% pool fee and rounds down. The confirmed output depends on reserves when the transaction executes.</p>
      {quote?.needsApproval && <button className="primary-button" disabled={busy || wallet.loading} onClick={() => transact(true)}>Approve {input}</button>}
      <button className="primary-button" disabled={busy || wallet.loading || !quote || quote.needsApproval} onClick={() => transact(false)}>{busy ? 'Transaction pending…' : `Swap ${input} for ${output} ↗`}</button>
      <p className="form-caption">BNB testnet · gas paid in tBNB</p>
    </>}
    <p role="status" aria-live="polite" className="helper">{status}</p>
    {hash && <a href={`https://testnet.bscscan.com/tx/${hash}`} target="_blank" rel="noopener noreferrer">View transaction ↗</a>}
  </section>;
}
