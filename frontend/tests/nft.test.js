import test from 'node:test';
import assert from 'node:assert/strict';
import { Interface, parseUnits } from 'ethers';
import { listingPrice, sendNFTTransaction, nftABI, marketABI } from '../src/nft.js';
const account='0x0000000000000000000000000000000000000001';
const contracts={Club42:{address:'0x0000000000000000000000000000000000000002'},Swap42:{address:'0x0000000000000000000000000000000000000003'},TokenZwap:{address:'0x0000000000000000000000000000000000000004'},Art42:{address:'0x0000000000000000000000000000000000000005'}};
function fixture(chain='0x61') {const sent=[];return {sent,args:{ethereum:{request:async({method})=>method==='eth_accounts'?[account]:chain},account,contracts,tokenId:1,payment:'a',price:parseUnits('5',18),signer:{sendTransaction:async tx=>{sent.push(tx);return{hash:'0x123'};}}}};}
test('listing prices preserve exact base units and reject invalid or zero prices',()=>{
 assert.equal(listingPrice('5.000000000000000001'),5000000000000000001n);
 for(const v of ['0','-1','1e2','','1.0000000000000000001'])assert.throws(()=>listingPrice(v));
});
test('mint and per-token approval target Art42, with approval granted only for selected ID',async()=>{
 for(const action of ['mint','approve']){
  const {sent,args}=fixture();await sendNFTTransaction({...args,action,tokenId:7});
  const tx=sent[0],call=new Interface(nftABI).parseTransaction(tx);
  assert.equal(sent.length,1);assert.equal(tx.to.toLowerCase(),contracts.Art42.address);
  assert.equal(call.name,action);assert.equal(call.args[action==='mint'?0:1],7n);
  if(action==='approve')assert.equal(call.args[0].toLowerCase(),contracts.TokenZwap.address);
  assert.equal(tx.value??0n,0n);
 }
});
test('listings target marketplace escrow with Art42 ID, selected payment token and exact price',async()=>{
 for(const payment of ['a','b']){
  const {sent,args}=fixture();await sendNFTTransaction({...args,action:'list',payment});
  assert.equal(sent.length,1);assert.equal(sent[0].to.toLowerCase(),contracts.TokenZwap.address);
  const call=new Interface(marketABI).parseTransaction(sent[0]);
  assert.equal(call.name,'listNFT');assert.equal(call.args[0].toLowerCase(),contracts.Art42.address);assert.equal(call.args[1],1n);
  assert.equal(call.args[2].toLowerCase(),contracts[payment==='a'?'Club42':'Swap42'].address);assert.equal(call.args[3],args.price);
 }
});
test('invalid IDs, unsupported payment, zero price and wrong network never send',async()=>{
 for(const change of [{tokenId:0},{tokenId:11},{tokenId:1.5},{payment:'x'},{price:0n}]){
  const {sent,args}=fixture();await assert.rejects(sendNFTTransaction({...args,action:'list',...change}));assert.equal(sent.length,0);
 }
 const {sent,args}=fixture('0x38');await assert.rejects(sendNFTTransaction({...args,action:'mint'}),/network changed/);assert.equal(sent.length,0);
});
