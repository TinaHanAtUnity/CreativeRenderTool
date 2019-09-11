import { IAnalyticsManager } from 'Analytics/IAnalyticsManager';
import { StoreTransaction } from 'Store/Models/StoreTransaction';

export class SilentAnalyticsManager implements IAnalyticsManager {

    public onTransactionSuccess(transaction: StoreTransaction): Promise<void> {
        return Promise.resolve();
    }

    public init(): Promise<void> {
        return Promise.resolve();
    }
    public getGameSessionId(): number {
        return 0;
    }
}
