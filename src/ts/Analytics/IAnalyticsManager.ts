import { StoreTransaction } from 'Store/Models/StoreTransaction';

export interface IAnalyticsManager {
    onTransactionSuccess(transactionDetails: StoreTransaction): Promise<void>;
    init(): Promise<void>;
    getGameSessionId(): number;
}
