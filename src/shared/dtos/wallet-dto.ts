export interface CreateWalletDto {
    user_id : number

}

export interface AddMoneyDto {
    user_id : number;
    amount : number;
    transactionId : number
}

export interface WalletResponseDto {
    id : string;
    user_id : string;
    balance : string;
    version : number;
    createdAt : string;
    updatedAt : string;
}

// In js json.stringify actually cannot sereialized bigint directly 
// so we convert bigint field to strings

// id:wallet.id.toString()