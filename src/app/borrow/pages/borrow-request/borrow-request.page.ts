import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonButton, NavController, ToastController, ModalController, AlertController, LoadingController } from '@ionic/angular';
import { ethers } from 'ethers';
import { request } from 'http';
import { Subscription } from 'rxjs';
import { NftLikeModalComponent } from 'src/app/components/nft-like-modal/nft-like-modal.component';
import { CheddaLoanManagerService } from 'src/app/contracts/chedda-loan-manager.service';
import { CheddaMarketService } from 'src/app/contracts/chedda-market.service';
import { MarketExplorerService } from 'src/app/contracts/market-explorer.service';
import { LoanRequest } from 'src/app/lend/lend.models';
import { NFT } from 'src/app/nfts/models/nft.model';
import { WalletProviderService } from 'src/app/providers/wallet-provider.service';
import { ZeroAddress } from 'src/app/shared/constants';
import { GlobalAlertService } from 'src/app/shared/global-alert.service';
import { environment } from 'src/environments/environment';
import { GetLoanModalComponent } from '../../components/get-loan-modal/get-loan-modal.component';

@Component({
  selector: 'app-borrow-request',
  templateUrl: './borrow-request.page.html',
  styleUrls: ['./borrow-request.page.scss'],
})
export class BorrowRequestPage implements OnInit {

  @ViewChild('buyButton') buyButton: IonButton
  priceString = ''
  nft: NFT
  numberOfLikes
  account

  listingExists = false
  iAmOwner = false
  txPending = false
  env = environment
  request?: LoanRequest
  currency

  private routeSubscription?: Subscription
  private accountSubscription?: Subscription
  private itemListingSubscription?: Subscription
  private listingCancelledSubscription?: Subscription
  private itemSoldSubscription?: Subscription

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private toastController: ToastController,
    private modalController: ModalController,
    private alertController: AlertController,
    private wallet: WalletProviderService,
    private alert: GlobalAlertService,
    private market: CheddaMarketService,
    private marketExplorer: MarketExplorerService,
    private loanManager: CheddaLoanManagerService,
    ) { }

  async ngOnInit() {
    this.currency = environment.config.networkParams.nativeCurrency.name
    await this.subscribeToRouteChanges()
  }

  ngOnDestroy(): void {
      this.routeSubscription?.unsubscribe()
      this.accountSubscription?.unsubscribe()
      this.itemListingSubscription?.unsubscribe()
      this.itemSoldSubscription?.unsubscribe()
      this.listingCancelledSubscription?.unsubscribe()
  }

  async onCancelRequest() {
    if (this.wallet.isConnected && this.request) {
      this.txPending = true
      await this.loanManager.cancelRequest(this.request.requestID)
    } else {
      this.alert.showConnectAlert()
    }
  }

  async onLikeClicked() {
    const modal = await this.modalController.create({
      component: NftLikeModalComponent,
      cssClass: 'stack-modal',
      showBackdrop: true,
      componentProps: {
        nft: this.nft
      }
    })
    modal.onDidDismiss().then(async (result) => {
      if (result && result.data) {
        await this.showConfirmAlert(result.data)
        setTimeout(() => {
          this.loadLikes()
        }, 3000)
      }
    })
    await modal.present()
  }

  async onGetLoanClicked() {
    console.log('passing in nft: ', this.nft)
    const modal = await this.modalController.create({
      component: GetLoanModalComponent,
      cssClass: 'stack-modal',
      showBackdrop: true,
      componentProps: {
        nft: this.nft
      }
    })
    modal.onDidDismiss().then(async (result) => {
      if (result && result.data) {
        await this.showConfirmAlert(result.data)
        setTimeout(() => {
          this.loadLikes()
        }, 3000)
      }
    })
    await modal.present() 
  }

  private async subscribeToRouteChanges() {
    this.routeSubscription = this.route.paramMap.subscribe(async paramMap => {
      if (!paramMap.has('nftContract') || !paramMap.has('tokenID')) {
        this.navController.navigateBack('/borrow')
        return
      }
      try {
        const nftContract = paramMap.get('nftContract')
        const tokenID = paramMap.get('tokenID')

        let tokenURI = await this.market.getNFTMetadata(nftContract, tokenID)
        let nft = await this.marketExplorer.assembleNFT(nftContract, tokenID, tokenURI)
        if (!nft) {
          this.navController.navigateBack('/borrow')
          return
        }
        this.nft = nft
        let loanRequest: LoanRequest = await this.loanManager.getOpenLoanRequest(nftContract, tokenID)
        console.log('request = ', loanRequest)
        this.request = loanRequest
      } catch (error) {
        //todo: show error before navigating back
        console.error('caught error: ', error)
        this.navController.navigateBack('/nfts')
      }
    })
  }


  private async loadLikes() {
    this.numberOfLikes = await this.marketExplorer.getItemLikes(this.nft.nftContract, this.nft.tokenID)
  }

  private async showToast(title: string, message: string) {
    const toast =  await this.toastController.create({
      header: title,
      message: message,
      position: 'bottom',
      duration: 5000
    })

    await toast.present() 
  }

  private async showConfirmAlert(amount) {
    await this.alert.showRewardConfirmationAlert(amount)
  }


}