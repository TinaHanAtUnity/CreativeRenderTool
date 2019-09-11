import { IAnalyticsManager } from 'Analytics/IAnalyticsManager';
import { ITransactionDetails } from 'Purchasing/PurchasingAdapter';

export class SilentAnalyticsManager implements IAnalyticsManager {

    public onIapTransaction(transactionDetails: ITransactionDetails): Promise<void> {
        return Promise.resolve();
    }

    public init(): Promise<void> {
        return Promise.resolve();
    }
    public getGameSessionId(): number {
        return 0;
    }
}
