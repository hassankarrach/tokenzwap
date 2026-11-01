// Local rehearsal only. The public RPC is used solely to read the current gas price.
const ganache = require('ganache');
const {BrowserProvider,ContractFactory,JsonRpcProvider,formatEther} = require('ethers');
const {compile} = require('../code/scripts/compile.cjs');
const config = require('./config.json');
(async()=>{
 const artifacts=compile(),rpc=ganache.provider({logging:{quiet:true}});
 try {
  const local=new BrowserProvider(rpc);local.pollingInterval=10;const signer=await local.getSigner(),addresses={},gas={};
  for(const name of ['Club42','Swap42','Art42','TokenZwap']){
   const args=name==='Art42'?[config.metadataBaseURI]:name==='TokenZwap'?[addresses.Club42,addresses.Swap42]:[];
   const c=await new ContractFactory(artifacts[name].abi,artifacts[name].bytecode,signer).deploy(...args);
   const receipt=await c.deploymentTransaction().wait();addresses[name]=await c.getAddress();gas[name]=receipt.gasUsed;
  }
  const remote=new JsonRpcProvider(config.rpcUrl);let price;
  try {const network=await remote.getNetwork();if(network.chainId!==97n)throw Error('Wrong RPC network');price=(await remote.getFeeData()).gasPrice;}finally{remote.destroy();}
  let total=0n;for(const [name,used] of Object.entries(gas)){total+=used;console.log(name+': '+used+' gas · '+formatEther(used*price)+' tBNB');}
  console.log('Local deployment gas total: '+total+'; at current RPC gas price: '+formatEther(total*price)+' tBNB.');
  console.log('With 25% gas buffer: '+formatEther(total*125n/100n*price)+' tBNB. Network execution and wallet fees can differ. No public transactions sent.');
 } finally {await rpc.disconnect();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
