import { Contract, parseUnits } from 'ethers';
import { assertWallet } from './liquidity.js';

export const nftABI = ['function isMinted(uint256) view returns(bool)', 'function ownerOf(uint256) view returns(address)',
  'function getApproved(uint256) view returns(address)', 'function isApprovedForAll(address,address) view returns(bool)',
  'function mint(uint256)', 'function approve(address,uint256)'];
export const marketABI = ['function listings(address,uint256) view returns(address seller,address paymentToken,uint256 price)',
  'function listNFT(address,uint256,address,uint256)'];

export function listingPrice(value) {
  if (!/^\d+(\.\d{1,18})?$/.test(value)) throw Error('Enter a positive price with up to 18 decimal places.');
  const price = parseUnits(value, 18);
  if (price <= 0n) throw Error('Price must be positive.');
  return price;
}

export async function sendNFTTransaction({ ethereum, account, signer, contracts, action, tokenId, payment, price }) {
  await assertWallet(ethereum, account);
  if (!Number.isInteger(tokenId) || tokenId < 1 || tokenId > 10) throw Error('Choose an Art42 ID from 1 to 10.');
  const nft = new Contract(contracts.Art42.address, nftABI, signer);
  if (action === 'mint') return nft.mint(tokenId);
  if (action === 'approve') return nft.approve(contracts.TokenZwap.address, tokenId);
  if (action !== 'list') throw Error('Unknown NFT action.');
  if (payment !== 'a' && payment !== 'b') throw Error('Unsupported payment token.');
  if (typeof price !== 'bigint' || price <= 0n) throw Error('Price must be positive.');
  return new Contract(contracts.TokenZwap.address, marketABI, signer).listNFT(contracts.Art42.address, tokenId,
    contracts[payment === 'a' ? 'Club42' : 'Swap42'].address, price);
}
