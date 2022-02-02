import { BigNumber } from "ethers"

export enum LoanState {
    all = 0,
    open,
    repayed,
    foreclosed
}

export enum LoanRequestState {
    all = 0,
    open,
    cancelled,
    accepted
}

export interface LoanRequest {
    requestID: BigNumber
    nftContract: string
    tokenID: BigNumber
    amount: BigNumber
    repayment: BigNumber
    loanLength: BigNumber
    borrower: string
    state: LoanRequestState
}

export interface Loan {
    loanID: BigNumber
    nftContract: string
    tokenID: BigNumber
    principal: BigNumber
    repaymentAMount: BigNumber
    openedAt: BigNumber
    expiresAt: BigNumber
    closedAt: BigNumber
    interestRate: BigNumber
    state: LoanState
    lender: string
    borrower: string
}