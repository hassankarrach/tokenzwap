/* global ethers */
'use strict';
const names=['Club42','Swap42','Art42','TokenZwap'];
const $=id=>document.getElementById(id);
let bundle,provider,signer,account,busy=false;
const storageKey='tokenzwap-bnb-deployment-v1';
let record;
try { record=JSON.parse(localStorage.getItem(storageKey)||'null'); } catch { record=null; }
const status=message=>{$('status').textContent=message;};
function render(){
 $('contracts').replaceChildren();
 names.forEach((name,index)=>{
  const li=document.createElement('li'),entry=record?.contracts?.[name];
  const title=document.createElement('strong');title.textContent=name+' ';li.append(title);
  if(entry){const a=document.createElement('a');a.href=bundle.config.explorer+'/address/'+entry.address;a.textContent=entry.address;a.target='_blank';a.rel='noopener';li.append(a);}
  else {const button=document.createElement('button');button.textContent='Deploy '+name;button.disabled=busy||!signer||(index>0&&!record?.contracts[names[index-1]]);button.onclick=()=>deploy(name);li.append(button);}
  $('contracts').append(li);
 });
 $('download').disabled=!record||!names.every(n=>record.contracts[n]);
}
async function assertWallet(){
 if((await provider.send('eth_chainId',[]))!=='0x61')throw Error('Select BNB Smart Chain Testnet (chain 97).');
 const accounts=await provider.send('eth_accounts',[]);
 if(!accounts[0]||ethers.getAddress(accounts[0])!==account)throw Error('Wallet account changed. Reconnect before deploying.');
}
async function connect(){try{
 if(!window.ethereum)throw Error('Open this page in a browser with MetaMask installed.');
 await ethereum.request({method:'eth_requestAccounts'});
 if(await ethereum.request({method:'eth_chainId'})!=='0x61')await ethereum.request({method:'wallet_switchEthereumChain',params:[{chainId:'0x61'}]});
 provider=new ethers.BrowserProvider(window.ethereum);signer=await provider.getSigner();account=await signer.getAddress();await assertWallet();
 if(record&&(record.deployer!==account||record.chainId!==97))throw Error('Saved deployment belongs to another account/network. Use the original account.');
 record ||= {chainId:97,network:bundle.config.network,deployer:account,metadataBaseURI:bundle.config.metadataBaseURI,compiler:bundle.artifacts.Club42.compiler,optimizer:{enabled:true,runs:200},evmVersion:'paris',contracts:{}};
 const pending=JSON.parse(localStorage.getItem(storageKey+'-pending')||'null');
 if(pending){
  if(pending.deployer!==account)throw Error('A deployment from another account is pending. Switch back to that account.');
  const receipt=await provider.getTransactionReceipt(pending.hash);
  if(!receipt)throw Error('Transaction '+pending.hash+' is still pending. Reconnect after it confirms; do not redeploy.');
  if(receipt.status===1){record.contracts[pending.name]={address:receipt.contractAddress,transactionHash:pending.hash,blockNumber:receipt.blockNumber,gasUsed:receipt.gasUsed.toString(),constructorArguments:pending.args};localStorage.setItem(storageKey,JSON.stringify(record));}
  localStorage.removeItem(storageKey+'-pending');
 }
 for(const [name,entry] of Object.entries(record.contracts)){if(!names.includes(name)||!ethers.isAddress(entry.address)||await provider.getCode(entry.address)==='0x')throw Error('Saved deployment cannot be verified on this network.');}
 $('account').textContent=account+' · '+ethers.formatEther(await provider.getBalance(account))+' tBNB';status('Connected. Start with Club42.');render();
 }catch(e){signer=null;status(e.shortMessage||e.message);render();}}
async function deploy(name){
 if(busy)return;busy=true;render();
 try{
 if(localStorage.getItem(storageKey+'-pending'))throw Error('Reconnect to recover the pending transaction before continuing.');
 await assertWallet();const args=name==='Art42'?[record.metadataBaseURI]:name==='TokenZwap'?[record.contracts.Club42.address,record.contracts.Swap42.address]:[];
 const artifact=bundle.artifacts[name],factory=new ethers.ContractFactory(artifact.abi,artifact.bytecode,signer);
 const transaction=await factory.getDeployTransaction(...args),gas=await signer.estimateGas(transaction),fees=await provider.getFeeData();
 const estimatedFee=gas*(fees.maxFeePerGas||fees.gasPrice);status(`${name}: estimated gas ${gas}; estimated fee ${ethers.formatEther(estimatedFee)} tBNB. Review MetaMask.`);
 const contract=await factory.deploy(...args);const tx=contract.deploymentTransaction();
 // Retain the hash before waiting so a slow RPC does not lose the sent transaction.
 localStorage.setItem(storageKey+'-pending',JSON.stringify({name,hash:tx.hash,address:contract.target,deployer:account,args}));
 status('Sent '+tx.hash+' · waiting for confirmation…');const receipt=await tx.wait();if(receipt.status!==1)throw Error('Deployment failed.');
 record.contracts[name]={address:await contract.getAddress(),transactionHash:tx.hash,blockNumber:receipt.blockNumber,gasUsed:receipt.gasUsed.toString(),constructorArguments:args};
 localStorage.setItem(storageKey,JSON.stringify(record));localStorage.removeItem(storageKey+'-pending');status(name+' confirmed.');$('account').textContent=account+' · '+ethers.formatEther(await provider.getBalance(account))+' tBNB';
 }catch(e){status(e.shortMessage||e.message);}finally{busy=false;render();}
}
$('connect').onclick=connect;
$('download').onclick=()=>{const blob=new Blob([JSON.stringify(record,null,2)+'\n'],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='bnb-testnet.json';a.click();URL.revokeObjectURL(url);};
fetch('/bundle.json').then(r=>r.json()).then(data=>{bundle=data;$('metadata').value=bundle.config.metadataBaseURI;render();}).catch(e=>status(e.message));
