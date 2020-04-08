import { IPrivacyCompletedParams } from 'Privacy/IPrivacySettings';

export interface IPrivacySDKViewHandler {
    onPrivacyReady(): void;
    onPrivacyCompleted(params: IPrivacyCompletedParams): void;
    onPrivacyOpenUrl(url: string): void;
    onPrivacyMetric(data: string): void;
    onPrivacyFetch(url: string, data: { [key: string]: unknown }): void;
    onPrivacyViewError(event: string | Event): void;
}
