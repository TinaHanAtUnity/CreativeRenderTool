import { ITransactionDetails } from 'Purchasing/PurchasingAdapter';

export interface IAnalyticsManager {
    onIapTransaction(transactionDetails: ITransactionDetails): Promise<void>;
    init(): Promise<void>;
    getGameSessionId(): number;
}
