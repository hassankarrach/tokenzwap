import React, { useRef, useState } from 'react';
import { BrowserProvider, formatUnits } from 'ethers';
import { assertWallet, depositAmounts, laterDepositQuote, sendLiquidityTransaction } from '../liquidity.js';
import deployment from '../../../deployment/bnb-testnet.json';
import { walletError } from '../useWallet.js';

const addresses = deployment.contracts;

export default function InitialLiquidity({ wallet }) {
  const [a, setA] = useState('100'), [b, setB] = useState('200');
  const [busy, setBusy] = useState(false), [status, setStatus] = useState('');
  const [hash, setHash] = useState('');
  const lock = useRef(false);
  const { data } = wallet;
  let amountA = 0n, amountB = 0n, validation = '';
  try {
    [amountA, amountB] = depositAmounts(a, b);
  } catch { validation = 'Enter positive amounts with up to 18 decimal places.'; }
  if (!validation && data && (amountA > BigInt(data.a) || amountB > BigInt(data.b))) validation = 'Not enough CLUB42 or SWAP42 for this deposit.';
  const empty = data && BigInt(data.supply) === 0n;
  let shares = null;
  if (!validation && data && !empty) {
    try { shares = laterDepositQuote(amountA, amountB, data); }
    catch (e) { validation = e.message; }
  }
  const needsA = data && BigInt(data.allowanceA) < amountA;
  const needsB = data && BigInt(data.allowanceB) < amountB;
  const disabled = busy || wallet.loading || !data || Boolean(validation);

  async function transact(action) {
    if (lock.current || disabled) return;
    lock.current = true; setBusy(true); setHash('');
    const account = wallet.account;
    try {
      await assertWallet(window.ethereum, account);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(account);
      await assertWallet(window.ethereum, account);
      setStatus('Confirm ' + (action === 'deposit' ? 'the deposit' : `the ${action} approval`) + ' in MetaMask.');
      const tx = await sendLiquidityTransaction({ ethereum: window.ethereum, account, signer, contracts: addresses, action: action === 'deposit' && !empty ? 'add' : action, amountA, amountB });
      setHash(tx.hash); setStatus('Transaction submitted. Waiting for confirmation…');
      let receipt;
      try { receipt = await tx.wait(); }
      catch (error) {
        if (error.code !== 'TRANSACTION_REPLACED' || error.cancelled) throw error;
        receipt = error.receipt; setHash(receipt.hash);
      }
      if (!receipt || receipt.status !== 1) throw Error('Transaction failed. No deposit was completed.');
      setStatus(action === 'deposit' ? 'Deposit confirmed. Reserves and your TZLP balance are refreshing.' : `${action} approval confirmed. Balances and allowances are refreshing.`);
    } catch (error) {
      setStatus(error.code === 'ACTION_REJECTED' || error.code === 4001 ? 'Wallet request declined. You can try again.' : walletError(error));
    } finally {
      await wallet.refresh(); lock.current = false; setBusy(false);
    }
  }

  return <section className="panel action-panel live-next initial-liquidity">
    <h2>{empty ? "First liquidity deposit" : "Add liquidity"}</h2>
    <p className="helper">{empty ? "Choose both amounts to set the initial pool ratio." : "Add both tokens at the exact current reserve ratio to receive new TZLP shares."} Approvals allow the pool to spend only the entered amounts; depositing is a separate transaction.</p>
    {!data ? <p className="helper">Waiting for current balances and allowances.</p> : <>
      <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0 }}>
        <div className="field-box"><label htmlFor="initial-a">CLUB42 amount</label><div className="amount-row"><input id="initial-a" inputMode="decimal" value={a} onChange={e => setA(e.target.value)} /></div></div>
        <div className="field-box"><label htmlFor="initial-b">SWAP42 amount</label><div className="amount-row"><input id="initial-b" inputMode="decimal" value={b} onChange={e => setB(e.target.value)} /></div></div>
      </fieldset>
      {!empty && <>
        <p className="helper">Current reserves: {formatUnits(data.reserveA, 18)} CLUB42 + {formatUnits(data.reserveB, 18)} SWAP42.</p>
        <button type="button" className="subtle-button" disabled={busy || wallet.loading} onClick={() => { setA(formatUnits(data.reserveA, 18)); setB(formatUnits(data.reserveB, 18)); }}>Use pool ratio · fill 100% of current reserves</button>
        <p className="helper">This fills a deposit equal to the whole current pool, not your previous withdrawal. Review both amounts before approving. Smaller deposits must preserve the exact ratio in base units.</p>
      </>}
      {shares !== null && !validation && <p className="helper">Estimated new TZLP: {formatUnits(shares, 18)}. Existing shares stay with their holders.</p>}
      {validation && <p className="helper">{validation}</p>}
      {needsA && <button className="primary-button" disabled={disabled} onClick={() => transact('CLUB42')}>Approve CLUB42</button>}
      {needsB && <button className="primary-button" disabled={disabled} onClick={() => transact('SWAP42')}>Approve SWAP42</button>}
      {!validation && !needsA && !needsB && <p className="helper">Both token allowances are sufficient.</p>}
      <button className="primary-button" disabled={disabled || needsA || needsB} onClick={() => transact('deposit')}>Deposit liquidity ↗</button>
      <p className="form-caption">Real BNB testnet transactions · gas paid in tBNB</p>
    </>}
    <p role="status" aria-live="polite" className="helper">{status}</p>
    {hash && <a href={`https://testnet.bscscan.com/tx/${hash}`} target="_blank" rel="noopener noreferrer">View transaction ↗</a>}
  </section>;
}
