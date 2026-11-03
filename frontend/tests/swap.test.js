import test from 'node:test';
import assert from 'node:assert/strict';
import { Interface, parseUnits } from 'ethers';
import { swapQuote, sendSwapTransaction } from '../src/swap.js';
const unit = 10n ** 18n;
const data = { a: String(10n*unit), b: String(10n*unit), reserveA: String(100n*unit), reserveB: String(200n*unit), allowanceA:'0', allowanceB:String(10n*unit) };
test('both directions apply 1% fee without separately rounding adjusted input', () => {
  for (const direction of ['a','b']) {
    const q = swapQuote('1', direction, data);
    const rin=BigInt(direction==='a'?data.reserveA:data.reserveB), rout=BigInt(direction==='a'?data.reserveB:data.reserveA);
    assert.equal(q.amountOut, unit*99n*rout/(rin*100n+unit*99n));
    assert.ok((rin+unit)*(rout-q.amountOut)>=rin*rout);
    assert.equal(q.needsApproval, direction==='a');
  }
});
test('quotes reject unsupported direction, invalid input, excess balance, empty pools and zero outputs', () => {
  for (const value of ['0','-1','1e2','1.0000000000000000001','11']) assert.throws(()=>swapQuote(value,'a',data));
  assert.throws(()=>swapQuote('1','x',data),/Unsupported/);
  assert.throws(()=>swapQuote('1','a',{...data,reserveA:'0'}),/liquidity/);
  assert.throws(()=>swapQuote('0.000000000000000001','b',data),/too small/);
});
const account='0x0000000000000000000000000000000000000001';
const contracts={Club42:{address:'0x0000000000000000000000000000000000000002'},Swap42:{address:'0x0000000000000000000000000000000000000003'},TokenZwap:{address:'0x0000000000000000000000000000000000000004'}};
const abi=new Interface(['function approve(address,uint256) returns(bool)','function swap(address,uint256) returns(uint256)']);
test('approval and swap encode exact amounts and correct input tokens for both directions',async()=>{
  for(const direction of ['a','b']) for(const approve of [true,false]) {
    const sent=[];
    const args={ethereum:{request:async({method})=>method==='eth_accounts'?[account]:'0x61'},account,contracts,direction,amountIn:parseUnits('1.000000000000000001',18),approve,signer:{sendTransaction:async tx=>{sent.push(tx);return{hash:'0x123'};}}};
    await sendSwapTransaction(args);
    assert.equal(sent.length,1);
    const tx=sent[0],decoded=abi.parseTransaction(tx),token=contracts[direction==='a'?'Club42':'Swap42'].address;
    assert.equal(tx.to.toLowerCase(),approve?token:contracts.TokenZwap.address);
    assert.equal(decoded.name,approve?'approve':'swap');
    assert.equal(decoded.args[0].toLowerCase(),approve?contracts.TokenZwap.address:token);
    assert.equal(decoded.args[1],args.amountIn);
    assert.equal(tx.value??0n,0n);
  }
});
test('wrong network and changed account prevent any swap request',async()=>{
  for(const [accounts,chain] of [[[account],'0x38'],[[],'0x61']]){
    let sends=0;
    await assert.rejects(sendSwapTransaction({ethereum:{request:async({method})=>method==='eth_accounts'?accounts:chain},account,contracts,direction:'a',amountIn:unit,signer:{sendTransaction:async()=>{sends++;}}}),/account or network changed/);
    assert.equal(sends,0);
  }
});
