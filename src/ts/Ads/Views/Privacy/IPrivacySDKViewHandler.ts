import { IPrivacyCompletedParams, IPrivacyFetchUrlParams } from 'Privacy/IPrivacySettings';

export interface IPrivacySDKViewHandler {
    onPrivacyReady(): void;
    onPrivacyCompleted(params: IPrivacyCompletedParams): void;
    onPrivacyOpenUrl(url: string): void;
    onPrivacyMetric(data: { [key: string]: unknown }): void;
    onPrivacyFetchUrl(data: IPrivacyFetchUrlParams): void;
    onPrivacyViewError(event: string | Event): void;
}
