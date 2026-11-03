import { Contract, parseUnits } from 'ethers';

export function depositAmounts(a, b) {
  if (![a, b].every(value => /^\d+(\.\d{1,18})?$/.test(value))) throw Error('Enter positive amounts with up to 18 decimal places.');
  const amounts = [parseUnits(a, 18), parseUnits(b, 18)];
  if (amounts.some(value => value <= 0n)) throw Error('Enter positive amounts with up to 18 decimal places.');
  return amounts;
}

export function withdrawalQuote(value, data) {
  if (!/^\d+(\.\d{1,18})?$/.test(value)) throw Error('Enter a positive TZLP amount with up to 18 decimal places.');
  const shares = parseUnits(value, 18);
  if (shares <= 0n) throw Error('Enter a positive TZLP amount.');
  if (shares > BigInt(data.lp)) throw Error('Withdrawal exceeds your TZLP balance.');
  const supply = BigInt(data.supply);
  if (supply === 0n) throw Error('The pool is empty.');
  const amountA = shares * BigInt(data.reserveA) / supply;
  const amountB = shares * BigInt(data.reserveB) / supply;
  if (amountA === 0n || amountB === 0n) throw Error('Amount is too small to return both tokens.');
  return { shares, amountA, amountB };
}

export function laterDepositQuote(amountA, amountB, data) {
  const reserveA = BigInt(data.reserveA), reserveB = BigInt(data.reserveB), supply = BigInt(data.supply);
  if (reserveA <= 0n || reserveB <= 0n || supply <= 0n) throw Error('The pool is empty.');
  if (amountA <= 0n || amountB <= 0n) throw Error('Deposit both tokens.');
  if (amountA * reserveB !== amountB * reserveA) throw Error('Amounts must match the exact pool ratio. Use pool ratio to fill a valid pair.');
  const shares = amountA * supply / reserveA;
  if (shares === 0n) throw Error('Deposit is too small to mint TZLP.');
  return shares;
}

export async function assertWallet(ethereum, account) {
  const [accounts, chain] = await Promise.all([
    ethereum.request({ method: 'eth_accounts' }),
    ethereum.request({ method: 'eth_chainId' }),
  ]);
  if (BigInt(chain) !== 97n || accounts[0]?.toLowerCase() !== account.toLowerCase())
    throw Error('Wallet account or network changed. Refresh and try again.');
}

export async function sendLiquidityTransaction({ ethereum, account, signer, contracts, action, amountA, amountB, shares }) {
  await assertWallet(ethereum, account);
  if (action === 'withdraw') return new Contract(contracts.TokenZwap.address,
    ['function removeLiquidity(uint256) returns (uint256,uint256)'], signer).removeLiquidity(shares);
  if (action === 'add') return new Contract(contracts.TokenZwap.address,
    ['function addLiquidity(uint256,uint256)'], signer).addLiquidity(amountA, amountB);
  if (action === 'deposit') return new Contract(contracts.TokenZwap.address,
    ['function addInitialLiquidity(uint256,uint256)'], signer).addInitialLiquidity(amountA, amountB);
  if (action !== 'CLUB42' && action !== 'SWAP42') throw Error('Unknown liquidity action.');
  return new Contract(contracts[action === 'CLUB42' ? 'Club42' : 'Swap42'].address,
    ['function approve(address,uint256) returns (bool)'], signer)
    .approve(contracts.TokenZwap.address, action === 'CLUB42' ? amountA : amountB);
}
