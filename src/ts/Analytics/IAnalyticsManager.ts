
export interface IAnalyticsManager {
    onPurchaseFailed(productId: string, reason: string, price: number | undefined, currency: string | undefined): void;
    onIapTransaction(productId: string, receipt: string, currency: string, price: number): Promise<void[]>;
    init(): Promise<void>;
    getGameSessionId(): number;
}
