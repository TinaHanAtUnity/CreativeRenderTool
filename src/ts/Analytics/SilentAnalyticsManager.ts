import { AnalyticsGenericEvent, IAnalyticsObject } from 'Analytics/AnalyticsProtocol';
import { IAnalyticsManager } from 'Analytics/IAnalyticsManager';

export class SilentAnalyticsManager implements IAnalyticsManager {

    public onIapTransaction(productId: string, receipt: string, currency: string, price: number): Promise<void[]> {
        return Promise.resolve([]);
    }

    public onPurchaseFailed(productId: string, reason: string, price: number | undefined, currency: string | undefined): void {
        // Do nothing
    }

    public init(): Promise<void> {
        return Promise.resolve();
    }
    public getGameSessionId(): number {
        return 0;
    }
}
