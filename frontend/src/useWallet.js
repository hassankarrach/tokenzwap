import { useCallback, useEffect, useRef, useState } from 'react';
import { Interface, getAddress } from 'ethers';
import deployment from '../../deployment/bnb-testnet.json';
const token = new Interface(['function balanceOf(address) view returns (uint256)']);
const pool = new Interface(['function reserveA() view returns (uint256)','function reserveB() view returns (uint256)','function totalSupply() view returns (uint256)']);
const contracts = deployment.contracts;
export function walletError(error) {
  if (error.code === 4001) return 'Wallet request declined. You can try again.';
  if (error.code === -32002) return 'A wallet request is already open. Check MetaMask.';
  return error.shortMessage || error.message || 'Unable to read wallet balances.';
}
export default function useWallet() {
  const [state,setState]=useState({account:null,chain:null,data:null,loading:false,error:''});
  const [pending,setPending]=useState(false);
  const version=useRef(0), mounted=useRef(true);
  const read=useCallback(async(clear=false)=>{
    const wallet=window.ethereum;
    if(!wallet)return;
    const request=++version.current;
    setState(s=>({...s,loading:true,error:'',...(clear?{account:null,chain:null,data:null}:{})}));
    try {
      const [accounts,chain]=await Promise.all([wallet.request({method:'eth_accounts'}),wallet.request({method:'eth_chainId'})]);
      const account=accounts[0]?getAddress(accounts[0]):null;
      let data=null;
      if(account && BigInt(chain)===97n){
        const block=await wallet.request({method:'eth_blockNumber'});
        const call=async(address,abi,method,args=[])=>{
          const result=await wallet.request({method:'eth_call',params:[{to:address,data:abi.encodeFunctionData(method,args)},block]});
          return abi.decodeFunctionResult(method,result)[0].toString();
        };
        const [bnb,a,b,lp,reserveA,reserveB,supply]=await Promise.all([
          wallet.request({method:'eth_getBalance',params:[account,block]}),
          call(contracts.Club42.address,token,'balanceOf',[account]),call(contracts.Swap42.address,token,'balanceOf',[account]),
          call(contracts.TokenZwap.address,token,'balanceOf',[account]),call(contracts.TokenZwap.address,pool,'reserveA'),
          call(contracts.TokenZwap.address,pool,'reserveB'),call(contracts.TokenZwap.address,pool,'totalSupply')
        ]);
        data={bnb:BigInt(bnb).toString(),a,b,lp,reserveA,reserveB,supply,block:BigInt(block).toString()};
      }
      if(mounted.current&&request===version.current)setState({account,chain,data,loading:false,error:''});
    }catch(e){if(mounted.current&&request===version.current)setState(s=>({...s,data:null,loading:false,error:walletError(e)}));}
  },[]);
  useEffect(()=>{
    mounted.current=true;
    const wallet=window.ethereum;
    const changed=()=>read(true);
    const disconnected=()=>{version.current++;setState({account:null,chain:null,data:null,loading:false,error:''});};
    read(true);
    wallet?.on?.('accountsChanged',changed);wallet?.on?.('chainChanged',changed);wallet?.on?.('disconnect',disconnected);
    const timer=setInterval(()=>read(),15000);
    return()=>{mounted.current=false;version.current++;clearInterval(timer);wallet?.removeListener?.('accountsChanged',changed);wallet?.removeListener?.('chainChanged',changed);wallet?.removeListener?.('disconnect',disconnected);};
  },[read]);
  async function connect(){
    if(!window.ethereum){setState(s=>({...s,error:'Install MetaMask or open this app in its browser.'}));return;}
    setPending(true);
    try{await window.ethereum.request({method:'eth_requestAccounts'});await read(true);}
    catch(e){setState(s=>({...s,error:walletError(e)}));}finally{if(mounted.current)setPending(false);}
  }
  async function switchNetwork(){
    setPending(true);
    try{await window.ethereum.request({method:'wallet_switchEthereumChain',params:[{chainId:'0x61'}]});await read(true);}
    catch(e){setState(s=>({...s,error:e.code===4902?'Add BNB Smart Chain Testnet (chain 97) in MetaMask, then try again.':walletError(e)}));}
    finally{if(mounted.current)setPending(false);}
  }
  return {...state,pending,connect,switchNetwork,refresh:()=>read()};
}
