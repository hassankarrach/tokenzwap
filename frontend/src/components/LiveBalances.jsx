import React from 'react';
import LiveNFT from '../views/LiveNFT.jsx';
import LiveSwap from '../views/LiveSwap.jsx';
import WithdrawLiquidity from '../views/WithdrawLiquidity.jsx';
import InitialLiquidity from '../views/InitialLiquidity.jsx';
import { formatUnits } from 'ethers';
import { TokenIcon } from './PoolOverview.jsx';
export function balance(value,places=4){
  const [whole,fraction='']=formatUnits(value,18).split('.');
  const decimal=fraction.slice(0,places).replace(/0+$/,'');
  if(BigInt(value)>0n && whole==='0'&&!decimal)return '<0.'+'0'.repeat(places-1)+'1';
  return BigInt(whole).toLocaleString('en-US')+(decimal?'.'+decimal:'');
}
export default function LiveBalances({wallet,view}){
 const {data,account,chain,loading,error}=wallet;
 const wrong=chain&&BigInt(chain)!==97n;
 const share=data&&BigInt(data.supply)>0n?`${Number(BigInt(data.lp)*10000n/BigInt(data.supply))/100}%`:'0%';
 return <>
 {error&&<p className="wallet-error" role="alert">{error}</p>}
 {!account?<section className="panel action-panel"><h2>Connect your wallet</h2><p className="helper">View your BNB testnet balances.</p><button className="primary-button" disabled={wallet.pending} onClick={wallet.connect}>{wallet.pending?'Connecting…':'Connect MetaMask'}</button></section>:wrong?<section className="panel action-panel"><h2>Switch to BNB testnet</h2><p className="helper">Your wallet is on another network. Balances are hidden until you switch.</p><button className="primary-button" disabled={wallet.pending} onClick={wallet.switchNetwork}>Switch network</button></section>:<>
 {view==='overview' && <section className="stats" aria-label="Live pool overview">{[['a','Token A reserve','CLUB42',data?.reserveA],['b','Token B reserve','SWAP42',data?.reserveB],['lp','Your liquidity','TZLP',data?.lp]].map(([token,label,symbol,value])=><article key={token} className={`stat-card ${token==='a'?'teal':token==='b'?'pink':''}`}><div className="stat-top"><TokenIcon token={token}/><span>{label}<small>{symbol}</small></span></div><div className="stat-number">{value!==undefined?balance(value):'—'}<span>{symbol}</span></div><div className="stat-foot">{token==='lp'?`Your share: ${data?share:'—'}`:'Available in the pool'}</div></article>)}</section>}
 {view==='overview' && <section className="panel live-wallet" aria-label="Live wallet balances"><div className="panel-heading"><h2>Your balance</h2><button className="subtle-button" onClick={wallet.refresh} disabled={loading}>{loading?'Refreshing…':'Refresh'}</button></div><div className="live-balance-grid">{[['tBNB',data?.bnb],['CLUB42',data?.a],['SWAP42',data?.b],['TZLP',data?.lp]].map(([symbol,value])=><div key={symbol}><span>{symbol}</span><strong data-balance={symbol}>{value!==undefined?balance(value,symbol==='tBNB'?6:4):'—'}</strong></div>)}</div></section>}
 {view==='liquidity' && <InitialLiquidity key={`${account}:${chain}`} wallet={wallet}/>}
 {view==='withdraw' && <WithdrawLiquidity key={`${account}:${chain}`} wallet={wallet}/>}
 {view==='swap' && <LiveSwap key={`${account}:${chain}`} wallet={wallet}/>}
 {view==='nfts' && <LiveNFT key={`${account}:${chain}`} wallet={wallet}/>}

 </>}
 </>;
}
