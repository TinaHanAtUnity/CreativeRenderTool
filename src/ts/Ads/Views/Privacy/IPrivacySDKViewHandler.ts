import { IPrivacySettings } from 'Privacy/IPrivacySettings';

export interface IPrivacySDKViewHandler {
    onPrivacyReady(): void;
    onPrivacyCompleted(userSettings: IPrivacySettings): void;
    onPrivacyOpenUrl(url: string): void;
    onPrivacyMetric(data: { [key: string]: unknown }): void;
    onPrivacyFetch(url: string, data: { [key: string]: unknown }): void;
}
