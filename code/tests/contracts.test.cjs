const {test} = require('node:test');
const assert = require('node:assert/strict');
const ganache = require('ganache');
const {BrowserProvider,ContractFactory,parseEther:eth,MaxUint256,ZeroAddress} = require('ethers');
const {compile} = require('../scripts/compile.cjs');
const artifacts = compile({fixtures:true});
async function fixture(t) {
  const rpc = ganache.provider({logging:{quiet:true},wallet:{totalAccounts:3}});
  t.after(()=>rpc.disconnect());
  const provider = new BrowserProvider(rpc); provider.pollingInterval=10;
  const owner=await provider.getSigner(0), buyer=await provider.getSigner(1), other=await provider.getSigner(2);
  async function deploy(name,args=[]) {const a=artifacts[name];const c=await new ContractFactory(a.abi,a.bytecode,owner).deploy(...args);await c.waitForDeployment();return c;}
  const a=await deploy('Club42'), b=await deploy('Swap42'), nft=await deploy('Art42',['ipfs://local-test-fixture/']), pool=await deploy('TokenZwap',[a.target,b.target]);
  for(const token of [a,b]) {await (await token.transfer(buyer.address,eth('1000'))).wait();for(const signer of [owner,buyer]) await (await token.connect(signer).approve(pool.target,MaxUint256)).wait();}
  return {a,b,nft,pool,owner,buyer,other,deploy};
}
async function seed(f) {await (await f.pool.addInitialLiquidity(eth('100'),eth('400'))).wait();}
async function snapshot(f) {return Promise.all([f.pool.reserveA(),f.pool.reserveB(),f.pool.totalSupply(),f.a.balanceOf(f.pool.target),f.b.balanceOf(f.pool.target)]);}
test('deploys fixed supplies and immutable pool pair; rejects invalid constructor inputs',async t=>{
 const f=await fixture(t);assert.equal(await f.a.totalSupply(),eth('42000'));assert.equal(await f.b.totalSupply(),eth('42000'));assert.equal(await f.pool.tokenA(),f.a.target);assert.equal(await f.pool.tokenB(),f.b.target);
 await assert.rejects(f.deploy('TokenZwap',[ZeroAddress,f.b.target]));await assert.rejects(f.deploy('TokenZwap',[f.a.target,f.a.target]));await assert.rejects(f.deploy('Art42',['https://invalid/']));
});
test('two providers receive proportional shares; cannot withdraw another provider shares; full exit and reinitialization',async t=>{
 const f=await fixture(t);await seed(f);assert.equal(await f.pool.balanceOf(f.owner.address),eth('200'));
 await (await f.pool.connect(f.buyer).addLiquidity(eth('50'),eth('200'))).wait();assert.equal(await f.pool.balanceOf(f.buyer.address),eth('100'));
 await assert.rejects(f.pool.connect(f.other).removeLiquidity(1n));await assert.rejects(f.pool.connect(f.buyer).removeLiquidity(eth('101')));
 await (await f.pool.connect(f.buyer).removeLiquidity(eth('50'))).wait();assert.equal(await f.pool.reserveA(),eth('125'));assert.equal(await f.pool.reserveB(),eth('500'));
 await (await f.pool.connect(f.buyer).removeLiquidity(eth('50'))).wait();await (await f.pool.removeLiquidity(eth('200'))).wait();assert.deepEqual(await snapshot(f),[0n,0n,0n,0n,0n]);await seed(f);
});
test('both swap directions retain a 1% fee, round output down, and preserve accounting',async t=>{
 const f=await fixture(t);await seed(f);
 for(const [input,reverse] of [[f.a,false],[f.b,true]]) {const ra=await f.pool.reserveA(),rb=await f.pool.reserveB(),rin=reverse?rb:ra,rout=reverse?ra:rb,n=eth('10');const out=n*99n*rout/(rin*100n+n*99n);const dest=reverse?f.a:f.b,before=await dest.balanceOf(f.buyer.address);
 await (await f.pool.connect(f.buyer).swap(input.target,n)).wait();assert.equal(await dest.balanceOf(f.buyer.address)-before,out);const [a,b,,actualA,actualB]=await snapshot(f);assert.equal(a,actualA);assert.equal(b,actualB);assert.ok(a*b>=ra*rb);}
});
test('invalid deposits and failed second token transfer roll back the entire operation',async t=>{
 const f=await fixture(t);await seed(f);const before=await snapshot(f),balance=await f.a.balanceOf(f.buyer.address);
 await assert.rejects(f.pool.addLiquidity(eth('1'),eth('3')));await assert.rejects(f.pool.swap(f.nft.target,1n));await assert.rejects(f.pool.swap(f.a.target,0n));await assert.rejects(f.pool.removeLiquidity(0n));
 await (await f.b.connect(f.buyer).approve(f.pool.target,0n)).wait();await assert.rejects(f.pool.connect(f.buyer).addLiquidity(eth('1'),eth('4')));assert.deepEqual(await snapshot(f),before);assert.equal(await f.a.balanceOf(f.buyer.address),balance);
});
for(const payment of ['a','b']) test(`NFT escrow and purchase in ${payment} pay seller without changing pool`,async t=>{
 const f=await fixture(t);await seed(f);await (await f.nft.mint(1)).wait();await (await f.nft.approve(f.pool.target,1)).wait();const before=await snapshot(f),seller=await f[payment].balanceOf(f.owner.address);
 await (await f.pool.listNFT(f.nft.target,1,f[payment].target,eth('10'))).wait();assert.equal(await f.nft.ownerOf(1),f.pool.target);await assert.rejects(f.pool.connect(f.buyer).cancelNFTListing(f.nft.target,1));
 await (await f.pool.connect(f.buyer).buyNFT(f.nft.target,1)).wait();assert.equal(await f.nft.ownerOf(1),f.buyer.address);assert.equal(await f[payment].balanceOf(f.owner.address),seller+eth('10'));assert.deepEqual(await snapshot(f),before);assert.equal((await f.pool.listings(f.nft.target,1)).seller,ZeroAddress);
});
test('failed NFT payment preserves listing and escrow; seller can cancel and relist',async t=>{
 const f=await fixture(t);await (await f.nft.mint(1)).wait();await (await f.nft.approve(f.pool.target,1)).wait();await (await f.pool.listNFT(f.nft.target,1,f.a.target,eth('10'))).wait();await (await f.a.connect(f.buyer).approve(f.pool.target,0)).wait();await assert.rejects(f.pool.connect(f.buyer).buyNFT(f.nft.target,1));assert.equal(await f.nft.ownerOf(1),f.pool.target);assert.equal((await f.pool.listings(f.nft.target,1)).seller,f.owner.address);
 await (await f.pool.cancelNFTListing(f.nft.target,1)).wait();assert.equal(await f.nft.ownerOf(1),f.owner.address);await (await f.nft.approve(f.pool.target,1)).wait();await (await f.pool.listNFT(f.nft.target,1,f.b.target,eth('5'))).wait();
});

test('rejecting NFT receiver rolls back seller payment; callback cannot reenter purchase',async t=>{
 const f=await fixture(t);await seed(f);
 for(const id of [1,2]) {await (await f.nft.mint(id)).wait();await (await f.nft.approve(f.pool.target,id)).wait();await (await f.pool.listNFT(f.nft.target,id,f.a.target,eth('10'))).wait();}
 const buyer=await f.deploy('Buyer',[f.pool.target,f.nft.target]);await (await f.a.transfer(buyer.target,eth('30'))).wait();const sellerBefore=await f.a.balanceOf(f.owner.address),before=await snapshot(f);
 await assert.rejects(buyer.purchase(f.a.target,1,true));assert.equal(await f.a.balanceOf(f.owner.address),sellerBefore);assert.equal(await f.a.balanceOf(buyer.target),eth('30'));assert.equal(await f.nft.ownerOf(1),f.pool.target);assert.equal((await f.pool.listings(f.nft.target,1)).seller,f.owner.address);
 await (await buyer.purchase(f.a.target,1,false)).wait();assert.equal(await buyer.nestedBlocked(),true);assert.equal(await f.nft.ownerOf(1),buyer.target);assert.equal(await f.nft.ownerOf(2),f.pool.target);assert.equal((await f.pool.listings(f.nft.target,2)).seller,f.owner.address);assert.deepEqual(await snapshot(f),before);
});
