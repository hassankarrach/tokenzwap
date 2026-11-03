import { Contract, parseUnits } from 'ethers';
import { assertWallet } from './liquidity.js';

export function swapQuote(value, direction, data) {
  if (direction !== 'a' && direction !== 'b') throw Error('Unsupported token.');
  if (!/^\d+(\.\d{1,18})?$/.test(value)) throw Error('Enter a positive amount with up to 18 decimal places.');
  const amountIn = parseUnits(value, 18);
  if (amountIn <= 0n) throw Error('Enter a positive amount.');
  if (amountIn > BigInt(data[direction])) throw Error('Insufficient input-token balance.');
  const reserveIn = BigInt(direction === 'a' ? data.reserveA : data.reserveB);
  const reserveOut = BigInt(direction === 'a' ? data.reserveB : data.reserveA);
  if (reserveIn <= 0n || reserveOut <= 0n) throw Error('Add liquidity before swapping.');
  const adjusted = amountIn * 99n;
  const amountOut = adjusted * reserveOut / (reserveIn * 100n + adjusted);
  if (amountOut <= 0n || amountOut >= reserveOut) throw Error('Amount is too small for a valid swap.');
  return { amountIn, amountOut, needsApproval: BigInt(direction === 'a' ? data.allowanceA : data.allowanceB) < amountIn };
}

export async function sendSwapTransaction({ ethereum, account, signer, contracts, direction, amountIn, approve }) {
  await assertWallet(ethereum, account);
  if (direction !== 'a' && direction !== 'b') throw Error('Unsupported token.');
  const tokenIn = contracts[direction === 'a' ? 'Club42' : 'Swap42'].address;
  if (approve) return new Contract(tokenIn, ['function approve(address,uint256) returns(bool)'], signer).approve(contracts.TokenZwap.address, amountIn);
  return new Contract(contracts.TokenZwap.address, ['function swap(address,uint256) returns(uint256)'], signer).swap(tokenIn, amountIn);
}
