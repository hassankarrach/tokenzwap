// Read-only verification; never requests a signer or sends transactions.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {JsonRpcProvider,Contract,ContractFactory,formatEther,parseEther,getAddress} = require('ethers');
const {compile} = require('../code/scripts/compile.cjs');
const config = require('./config.json');
(async()=>{
 const record=JSON.parse(fs.readFileSync(process.argv[2] || path.join(__dirname,'bnb-testnet.json'),'utf8'));
 assert.equal(record.chainId,97);
 const artifacts=compile(),provider=new JsonRpcProvider(config.rpcUrl);
 try {
  assert.equal((await provider.getNetwork()).chainId,97n);
  let totalFee=0n;
  const contracts={};
  for(const name of ['Club42','Swap42','Art42','TokenZwap']){
   const entry=record.contracts[name];
   const [tx,receipt,code]=await Promise.all([provider.getTransaction(entry.transactionHash),provider.getTransactionReceipt(entry.transactionHash),provider.getCode(entry.address)]);
   assert.ok(tx && receipt,name+': transaction missing');assert.equal(receipt.status,1);assert.equal(tx.chainId,97n);assert.equal(tx.to,null);
   assert.equal(getAddress(receipt.contractAddress),getAddress(entry.address));assert.equal(getAddress(tx.from),getAddress(record.deployer));assert.equal(receipt.blockNumber,entry.blockNumber);assert.equal(receipt.gasUsed.toString(),entry.gasUsed);assert.notEqual(code,'0x');
   const expectedArgs=name==='TokenZwap'?[record.contracts.Club42.address,record.contracts.Swap42.address]:name==='Art42'?[config.metadataBaseURI]:[];
   assert.deepEqual(entry.constructorArguments,expectedArgs);
   const expected=await new ContractFactory(artifacts[name].abi,artifacts[name].bytecode).getDeployTransaction(...expectedArgs);
   assert.equal(tx.data,expected.data,name+': deployed creation input differs from current compiled source');
   const fee=receipt.gasUsed*receipt.gasPrice;totalFee+=fee;
   contracts[name]={address:entry.address,transactionHash:entry.transactionHash,status:'success',creationInputMatchesLocalCompilation:true,gasUsed:receipt.gasUsed.toString(),feeTBNB:formatEther(fee)};
   console.log(name+': verified '+entry.address);
  }
  const pool=new Contract(record.contracts.TokenZwap.address,artifacts.TokenZwap.abi,provider);
  assert.equal(await pool.tokenA(),record.contracts.Club42.address);assert.equal(await pool.tokenB(),record.contracts.Swap42.address);
  const tokens={};for(const name of ['Club42','Swap42']){const token=new Contract(record.contracts[name].address,artifacts[name].abi,provider);const supply=await token.totalSupply();assert.equal(supply,parseEther('42000'));tokens[name]={symbol:await token.symbol(),totalSupply:supply.toString()};}
  const evidence={verifiedAt:new Date().toISOString(),chainId:97,contracts,tokens,pool:{tokenA:await pool.tokenA(),tokenB:await pool.tokenB(),reserveA:(await pool.reserveA()).toString(),reserveB:(await pool.reserveB()).toString(),lpSupply:(await pool.totalSupply()).toString()},totalDeploymentFeeTBNB:formatEther(totalFee),explorerSourceVerification:'not checked'};
  fs.writeFileSync(path.join(__dirname,'bnb-testnet-verification.json'),JSON.stringify(evidence,null,2)+'\n');
  console.log('Total actual deployment fees: '+formatEther(totalFee)+' tBNB');
 }finally{provider.destroy();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
