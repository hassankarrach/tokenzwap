'use strict';
// Browser-only demonstration. This file never connects to a wallet or sends transactions.
const $ = id => document.getElementById(id);
const state = { a:12500, b:25000, supply:Math.sqrt(12500*25000), lp:100, walletA:1000, walletB:2000, reverse:false, mode:'add', approved:false };
const symbols = {a:'CLUB42',b:'SWAP42'};
const listings = [
 {id:3,name:'Emerald fragment',price:50,token:'a',seller:false,color:'#72f6bf',glow:'#02cc8944'},
 {id:7,name:'Violet geometry',price:80,token:'b',seller:false,color:'#ad89f5',glow:'#9a56dd44'},
 {id:9,name:'Liquid horizon',price:120,token:'a',seller:true,color:'#9bddc4',glow:'#10d8ab44'}
];
let toastTimer;
function notify(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,6000);}
function fmt(n,d=2){return n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});}
function quote(amount){const rIn=state.reverse?state.b:state.a;const rOut=state.reverse?state.a:state.b;return amount>0?rOut*amount*99/(rIn*100+amount*99):0;}
function render(){
 $('reserve-a').replaceChildren(document.createTextNode(fmt(state.a,2)),Object.assign(document.createElement('span'),{textContent:'CLUB42'}));
 $('reserve-b').replaceChildren(document.createTextNode(fmt(state.b,2)),Object.assign(document.createElement('span'),{textContent:'SWAP42'}));
 $('lp-stat').replaceChildren(document.createTextNode(fmt(state.lp)),Object.assign(document.createElement('span'),{textContent:'TZLP'}));
 $('share-stat').textContent=fmt(state.supply?state.lp/state.supply*100:0)+'%';
 $('balance-a').textContent=fmt(state.walletA);$('balance-b').textContent=fmt(state.walletB);
 $('in-symbol').textContent=state.reverse?'SWAP42':'CLUB42';$('out-symbol').textContent=state.reverse?'CLUB42':'SWAP42';
 $('in-icon').textContent=state.reverse?'S':'C';$('out-icon').textContent=state.reverse?'C':'S';
 $('in-icon').classList.toggle('pink-icon',state.reverse);$('out-icon').classList.toggle('pink-icon',!state.reverse);
 $('in-letter').textContent=state.reverse?'B':'A';$('out-letter').textContent=state.reverse?'A':'B';
 $('input-balance').textContent='Balance: '+fmt(state.reverse?state.walletB:state.walletA);
 $('swap-output').textContent=fmt(quote(Number($('swap-input').value)),4);
 $('rate').textContent=`1 ${state.reverse?'SWAP42':'CLUB42'} ≈ ${fmt(state.reverse?state.a/state.b:state.b/state.a,4)} ${state.reverse?'CLUB42':'SWAP42'}`;
 const deposit=Number($('deposit-a').value);$('deposit-b').value=deposit>0?(deposit*state.b/state.a).toFixed(8):'';
 const shares=Number($('withdraw-shares').value);$('withdraw-estimate').textContent=`Your balance: ${fmt(state.lp)} TZLP. Estimated return: ${fmt(shares*state.a/state.supply,4)} CLUB42 + ${fmt(shares*state.b/state.supply,4)} SWAP42.`;
}
const viewNames={swap:['Your tokens. <span>In motion.</span>','Swap','Make your next move','SWAP'],liquidity:['Your share. <span>Your pool.</span>','Liquidity','A little liquidity goes a long way','LIQUIDITY'],nfts:['Something worth <span>collecting.</span>','NFT Marketplace','List your next collectible','NFT ESCROW']};
function setView(view){if(!viewNames[view])view='swap';for(const key of Object.keys(viewNames))$(key+'-view').hidden=key!==view;document.querySelectorAll('[data-view]').forEach(button=>button.classList.toggle('active',button.dataset.view===view));const names=viewNames[view];$('page-title').innerHTML=names[0];$('crumb').textContent=names[1];$('action-title').textContent=names[2];$('action-tag').textContent=names[3];history.replaceState(null,'','#'+view);}
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
$('explore-liquidity').addEventListener('click',()=>{setView('liquidity');$('action-title').scrollIntoView({block:'center'});});
$('open-listing').addEventListener('click',()=>{setView('nfts');$('nft-address').focus();});
$('wallet').addEventListener('click',()=>notify('Demo preview: wallet connection will be added when deployed contracts are available. No wallet request was sent.'));
$('swap-input').addEventListener('input',render);
$('reverse').addEventListener('click',()=>{state.reverse=!state.reverse;state.approved=false;render();});
$('max-swap').addEventListener('click',()=>{$('swap-input').value=state.reverse?state.walletB:state.walletA;render();});
$('swap-form').addEventListener('submit',event=>{event.preventDefault();const amount=Number($('swap-input').value);const wallet=state.reverse?'walletB':'walletA';if(!Number.isFinite(amount)||amount<=0)return notify('Enter a positive amount.');if(amount>state[wallet])return notify('Not enough demo tokens for this swap.');if(!state.approved){state.approved=true;return notify('Demo token approval recorded. Click Preview swap again to simulate the trade.');}const output=quote(amount);if(state.reverse){state.b+=amount;state.a-=output;state.walletA+=output;}else{state.a+=amount;state.b-=output;state.walletB+=output;}state[wallet]-=amount;state.approved=false;render();notify(`Demo swap complete: received ${fmt(output,4)} ${state.reverse?'CLUB42':'SWAP42'}. No real transaction occurred.`);});
document.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>{state.mode=button.dataset.mode;document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('selected',b===button));$('deposit-fields').hidden=state.mode!=='add';$('withdraw-fields').hidden=state.mode!=='remove';$('deposit-a').required=state.mode==='add';$('withdraw-shares').required=state.mode==='remove';$('liquidity-submit').textContent=state.mode==='add'?'Preview deposit ↗':'Preview withdrawal ↗';}));
$('deposit-a').addEventListener('input',render);$('withdraw-shares').addEventListener('input',render);
$('max-withdraw').addEventListener('click',()=>{$('withdraw-shares').value=state.lp;render();});
$('liquidity-form').addEventListener('submit',event=>{event.preventDefault();if(state.mode==='add'){const a=Number($('deposit-a').value),b=a*state.b/state.a;if(!Number.isFinite(a)||a<=0)return notify('Enter a positive deposit.');if(a>state.walletA||b>state.walletB)return notify('Not enough demo tokens for both sides of this deposit.');const shares=a*state.supply/state.a;state.a+=a;state.b+=b;state.walletA-=a;state.walletB-=b;state.supply+=shares;state.lp+=shares;notify(`Demo deposit complete: received ${fmt(shares,4)} TZLP. No real transaction occurred.`);}else{const shares=Number($('withdraw-shares').value);if(!Number.isFinite(shares)||shares<=0||shares>state.lp)return notify('Enter a positive LP amount within your balance.');const a=shares*state.a/state.supply,b=shares*state.b/state.supply;state.a-=a;state.b-=b;state.walletA+=a;state.walletB+=b;state.lp-=shares;state.supply-=shares;notify(`Demo withdrawal complete: returned ${fmt(a,4)} CLUB42 and ${fmt(b,4)} SWAP42.`);}render();});
function renderNFTs(){const grid=$('nft-grid');grid.replaceChildren();listings.forEach((item,index)=>{const card=document.createElement('article');card.className='nft-card';card.innerHTML=`<div class="nft-art art-${index%3+1}" style="--art-color:${item.color};--art-glow:${item.glow}"><span class="art-edition">ART42 / NO. ${String(item.id).padStart(2,'0')}</span><div class="crystal"></div></div><div class="nft-body"><div class="nft-name"><span></span><small></small></div><div class="nft-price"><span></span><button type="button"></button></div></div>`;card.querySelector('.nft-name>span').textContent=item.name;card.querySelector('.nft-name small').textContent=item.seller?'Your listing':'Art42';card.querySelector('.nft-price>span').textContent=`${fmt(item.price,0)} ${symbols[item.token]}`;const button=card.querySelector('button');button.textContent=item.seller?'Cancel listing':'Buy NFT ↗';button.addEventListener('click',()=>{if(!item.seller){const key=item.token==='a'?'walletA':'walletB';if(state[key]<item.price)return notify('Not enough demo tokens to purchase this NFT.');state[key]-=item.price;}listings.splice(listings.indexOf(item),1);renderNFTs();render();notify(item.seller?'Demo listing cancelled. NFT returned to the simulated seller.':'Demo purchase complete. Payment went to the simulated seller; pool reserves did not change.');});grid.append(card);});if(!listings.length)grid.textContent='No active demo listings. List an NFT to explore escrow.';}
$('nft-form').addEventListener('submit',event=>{event.preventDefault();const id=Number($('nft-id').value),price=Number($('nft-price').value),address=$('nft-address').value.trim();if(!/^0x[a-fA-F0-9]{40}$/.test(address)||!Number.isSafeInteger(id)||id<0||!Number.isFinite(price)||price<=0)return notify('Enter a valid contract address, token ID and positive price.');if(listings.some(item=>item.address===address.toLowerCase()&&item.id===id))return notify('That NFT already has an active demo listing.');listings.push({id,name:`Your collectible #${id}`,price,token:$('nft-payment').value,seller:true,address:address.toLowerCase(),color:'#72f6bf',glow:'#02cc8944'});renderNFTs();notify('Demo listing created. Ownership, approvals and escrow are simulated; no NFT was transferred.');});
setView(location.hash.slice(1));render();renderNFTs();
