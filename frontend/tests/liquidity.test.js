import test from 'node:test';
import assert from 'node:assert/strict';
import { Interface } from 'ethers';
import { depositAmounts, sendLiquidityTransaction } from '../src/liquidity.js';

const account = '0x0000000000000000000000000000000000000001';
const contracts = {
  Club42: { address: '0x0000000000000000000000000000000000000002' },
  Swap42: { address: '0x0000000000000000000000000000000000000003' },
  TokenZwap: { address: '0x0000000000000000000000000000000000000004' },
};
const abi = new Interface(['function approve(address,uint256) returns (bool)', 'function addInitialLiquidity(uint256,uint256)']);
function fixture(accounts = [account], chain = '0x61') {
  const sent = [];
  return { sent, args: {
    ethereum: { request: async ({ method }) => method === 'eth_accounts' ? accounts : chain },
    signer: { sendTransaction: async tx => { sent.push(tx); return { hash: '0x123' }; } },
    account, contracts, amountA: 100n * 10n ** 18n, amountB: 200n * 10n ** 18n,
  } };
}
test('token amounts retain exact base units and reject invalid precision or zero', () => {
  assert.deepEqual(depositAmounts('100.000000000000000001', '200'), [100000000000000000001n, 200000000000000000000n]);
  for (const invalid of ['0', '-1', '1e2', 'NaN', '', '1.0000000000000000001']) assert.throws(() => depositAmounts(invalid, '200'));
});
test('each approval targets its token and grants only the entered amount to the pool', async () => {
  for (const [action, token, amount] of [['CLUB42', 'Club42', 'amountA'], ['SWAP42', 'Swap42', 'amountB']]) {
    const { args, sent } = fixture();
    await sendLiquidityTransaction({ ...args, action });
    assert.equal(sent.length, 1);
    assert.equal(sent[0].to.toLowerCase(), contracts[token].address);
    const decoded = abi.parseTransaction(sent[0]);
    assert.equal(decoded.name, 'approve');
    assert.equal(decoded.args[0].toLowerCase(), contracts.TokenZwap.address);
    assert.equal(decoded.args[1], args[amount]);
    assert.equal(sent[0].value ?? 0n, 0n);
  }
});
test('deposit calls the initial-liquidity entry point with both exact amounts', async () => {
  const { args, sent } = fixture();
  await sendLiquidityTransaction({ ...args, action: 'deposit' });
  const decoded = abi.parseTransaction(sent[0]);
  assert.equal(sent[0].to.toLowerCase(), contracts.TokenZwap.address);
  assert.equal(decoded.name, 'addInitialLiquidity');
  assert.deepEqual([...decoded.args], [args.amountA, args.amountB]);
});
test('changed account, disconnected wallet and wrong network prevent every send', async () => {
  for (const [accounts, chain] of [[[], '0x61'], [[contracts.Club42.address], '0x61'], [[account], '0x38']]) {
    const { args, sent } = fixture(accounts, chain);
    await assert.rejects(sendLiquidityTransaction({ ...args, action: 'deposit' }), /account or network changed/);
    assert.equal(sent.length, 0);
  }
});
test('wallet rejection is propagated without reporting a submitted transaction', async () => {
  const { args } = fixture();
  const rejection = Object.assign(Error('Declined'), { code: 4001 });
  args.signer.sendTransaction = async () => { throw rejection; };
  await assert.rejects(sendLiquidityTransaction({ ...args, action: 'CLUB42' }), error => error === rejection);
});

const { withdrawalQuote } = await import('../src/liquidity.js');
test('partial and full withdrawal previews use proportional reserves and integer rounding', () => {
  const data = { lp: '1000000000000000000', supply: '3000000000000000000', reserveA: '10', reserveB: '20' };
  assert.deepEqual(withdrawalQuote('1', data), { shares: 1000000000000000000n, amountA: 3n, amountB: 6n });
  assert.deepEqual(withdrawalQuote('3', { ...data, lp: data.supply }), { shares: 3000000000000000000n, amountA: 10n, amountB: 20n });
});
test('withdrawal rejects excess balance, zero, empty pools and outputs rounded to zero', () => {
  const data = { lp: '1000000000000000000', supply: '1000000000000000000', reserveA: '100', reserveB: '200' };
  assert.throws(() => withdrawalQuote('2', data), /exceeds/);
  assert.throws(() => withdrawalQuote('0', data), /positive/);
  assert.throws(() => withdrawalQuote('1', { ...data, supply: '0' }), /empty/);
  assert.throws(() => withdrawalQuote('0.000000000000000001', data), /too small/);
});
test('withdrawal sends only removeLiquidity with the exact share count and no approval', async () => {
  const { args, sent } = fixture();
  const shares = 123456789012345678n;
  await sendLiquidityTransaction({ ...args, action: 'withdraw', shares });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to.toLowerCase(), contracts.TokenZwap.address);
  const removal = new Interface(['function removeLiquidity(uint256) returns (uint256,uint256)']);
  assert.equal(removal.parseTransaction(sent[0]).args[0], shares);
  assert.equal(sent[0].value ?? 0n, 0n);
});
test('withdrawal refuses a wrong chain before asking to send', async () => {
  const { args, sent } = fixture([account], '0x38');
  await assert.rejects(sendLiquidityTransaction({ ...args, action: 'withdraw', shares: 1n }), /network changed/);
  assert.equal(sent.length, 0);
});

const { laterDepositQuote } = await import('../src/liquidity.js');
test('later deposit shares follow existing supply with downward rounding', () => {
  assert.equal(laterDepositQuote(2n, 4n, { reserveA: '6', reserveB: '12', supply: '10' }), 3n);
  assert.equal(laterDepositQuote(6n, 12n, { reserveA: '6', reserveB: '12', supply: '10' }), 10n);
});
test('later deposits reject even a one-base-unit ratio mismatch and zero shares', () => {
  const data = { reserveA: '1000000000000000000', reserveB: '2000000000000000001', supply: '1000' };
  assert.throws(() => laterDepositQuote(1000000000000000000n, 2000000000000000000n, data), /exact pool ratio/);
  assert.throws(() => laterDepositQuote(1n, 2n, { reserveA: '100', reserveB: '200', supply: '1' }), /too small/);
  assert.throws(() => laterDepositQuote(1n, 2n, { reserveA: '0', reserveB: '0', supply: '0' }), /empty/);
});
test('later deposit calls addLiquidity rather than initial liquidity', async () => {
  const { args, sent } = fixture();
  await sendLiquidityTransaction({ ...args, action: 'add' });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to.toLowerCase(), contracts.TokenZwap.address);
  const iface = new Interface(['function addLiquidity(uint256,uint256)']);
  assert.deepEqual([...iface.parseTransaction(sent[0]).args], [args.amountA, args.amountB]);
});
