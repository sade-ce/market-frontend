import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import ChedaMarket from '../../artifacts/CheddaMarket.json'
import { NFT } from '../nfts/models/nft.model';
import { DefaultProviderService } from '../providers/default-provider.service';
import { WalletProviderService } from '../providers/wallet-provider.service';

@Injectable({
  providedIn: 'root'
})
export class CheddaMarketService {

  marketContract: any
  nftContract: any
  nfts: NFT[]

  constructor(provider: DefaultProviderService, private wallet: WalletProviderService, private http: HttpClient) {
    this.marketContract = new ethers.Contract(
      wallet.currentConfig.contracts.CheddaMarket,
      ChedaMarket.abi,
      provider.provider
      );
  }

  async getMarketItems(): Promise<NFT[]> {
    let items = await this.marketContract.getAllListings()
    return items
  }

  async buyItem(nft: NFT): Promise<any> {
    let result = await this.marketContract.connect(this.wallet.signer).buyItem(nft.nftContract, nft.tokenID, {value: nft.price})
    console.log('result of purchase = ', result)
    return result
  }

  async listItem(nft: NFT, price: string): Promise<any> {
    let priceInEth = ethers.utils.parseEther(price)
    let result = await this.marketContract.connect(this.wallet.signer).listItemForSale(nft.nftContract, nft.tokenID, priceInEth)
    return result
  }

  async cancelListing(nft): Promise<any> {
    let result = await this.marketContract.connect(this.wallet.signer).cancelListing(nft.nftContract, nft.tokenID)
    return result
  }

  async listingForItem(contractAddress: string, tokenID: string) {
    let result = await this.marketContract.listings(contractAddress, tokenID)
    console.log('got listing = ', result)
    return result
  }

  getMarketItemsInCollection(address: string) {

  }
}
