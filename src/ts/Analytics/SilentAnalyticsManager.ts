import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { AnalyticsGenericEvent, IAnalyticsObject } from 'Analytics/AnalyticsProtocol';

export class SilentAnalyticsManager extends AnalyticsManager {

    public onIapTransaction(productId: string, receipt: string, currency: string, price: number): Promise<void[]> {
        return Promise.resolve([]);
    }

    public onPurchaseFailed(productId: string, reason: string, price: number | undefined, currency: string | undefined): void {
        // Do nothing
    }

    protected onPostEvent(events: AnalyticsGenericEvent[]): void {
        // Do nothing
    }

    protected send<T>(event: IAnalyticsObject<T>): Promise<void> {
        return Promise.resolve();
    }
}
