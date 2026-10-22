// validate request body
// convert string/numbers to big int
// call services
// convert domain models to  json-safe response dtos
// setup http status code

import { Request , Response } from "express";
import { WalletService } from "../services/wallet-transaction";
import { CreateWalletDto , AddMoneyDto , WalletResponseDto} from "../../shared/dtos/wallet-dto";


// safe parser for a url path paramter thats supposed to be a number (:/userId)
// but store as BigInt in your code
function tryParseBigIntPathSegment(raw:string | undefined):{ok:true , value:bigint} | {ok:false}{
    if(raw === undefined || raw === ''){
        return {ok : false};
    }
    try {
        return {ok : true , value :BigInt(raw)}
    } catch (error) {
        return {ok : false};
        
    }

}
export class WalletController {
    private walletService : WalletService;

    constructor(){
        this.walletService = new WalletService();
    }

    async createWallet(req : Request , res : Response):Promise<void>{
        try {
            const dto : CreateWalletDto = req.body;
            const rawUserId = (dto as {user_id?:unknown}).user_id;

            if(rawUserId === undefined || rawUserId === null || rawUserId === ''){
                res.status(400).json({error : 'user_id is required bro'})
            }

            let userId: bigint;

            try {
                userId = BigInt(rawUserId as string | number | bigint)
            } catch (error) {
                res.status(400).json({error : 'Invalid user id format'});
                return;
                
            }

            const wallet = await this.walletService.createWallet(userId);
            const response: WalletResponseDto = {
                id : wallet.id.toString(),
                user_id : wallet.user_id.toString(),
                balance : wallet.balance.toString(),
                version : wallet.version,
                createdAt : wallet.created_at.toISOString(),
                updatedAt : wallet.updated_at.toISOString(),

            }
            res.status(201).json(response);


        } catch(error : any){
            const msg = error?.message || 'Internal serve error';
            if(msg.includes('already exist')){
                res.status(500).json({error:msg});
            }

        }
    }

    // Get api/wallets/:userId


    async getWallet(req : Request , res : Response): Promise<void>{
        const parsed = tryParseBigIntPathSegment(req.params.userId as string);
        if(!parsed.ok){
            res.status(400).json({error: 'Invalid user_id format'});
            return;
        }

        try {
            const wallet = await this.walletService.getWallet(parsed.value);
            if(!wallet){
                res.status(400).json({error : 'wallet has not been found'});
                return;
            }

            const response : WalletResponseDto = {
                id : wallet.id.toString(),
                user_id : wallet.user_id.toString(),
                balance : wallet.balance.toString(),
                version : wallet.version,
                createdAt : wallet.created_at.toISOString(),
                updatedAt : wallet.updated_at.toISOString(),
                

            }
            res.status(200).json(response);
        } catch (error : any) {
            res.status(500).json({error : 'Internal server error'});
            
        }
    }

    // Add money endpoint
    // POST api/wallets/:userId/add-money


    async addMoney(req: Request, res: Response): Promise<void> {
        const parsed = tryParseBigIntPathSegment(req.params.userId as string);

        if(!parsed.ok) {
            res.status(400).json({error: 'Invalid user_id format'});
            return;
        }

        try {
            
            const dto: AddMoneyDto = req.body;
            const rawAmount = (dto as {amount?: unknown}).amount;

            if(rawAmount === undefined || rawAmount === null || rawAmount === '') {
                res.status(400).json({error: 'amount is required'});
                return;
            }

           let amount: bigint;
           try{
            amount = BigInt(rawAmount as string | number | bigint);
           }catch{
            res.status(400).json({error: 'Invalid amount format'});
            return;
           }

           if(amount <= 0n) {
            res.status(400).json({error: 'Amount must be positive'});
            return;
           }

           const wallet = await this.walletService.addMoney(parsed.value, amount, undefined);

           const response: WalletResponseDto  = {
            id: wallet.id.toString(),
            user_id: wallet.user_id.toString(),
            balance: wallet.balance.toString(),
            version: wallet.version,
            createdAt: wallet.created_at.toISOString(),
            updatedAt: wallet.updated_at.toISOString(),
           }
           res.status(200).json(response);

        }catch(error: any){
            const msg = error?.message || 'Internal Server Error';
            if(msg.includes('Wallet not found')) {
                res.status(404).json({error: msg});
                return;
            }
            res.status(500).json({error: msg});
        }
    }


}