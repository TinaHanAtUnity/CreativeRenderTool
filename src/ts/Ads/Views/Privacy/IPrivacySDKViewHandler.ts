import { IPrivacySettings } from 'Privacy/IPrivacySettings';

export interface IPrivacySDKViewHandler {
    onPrivacyReady(): void;
    onPrivacyCompleted(userSettings: IPrivacySettings): void;
    onPrivacyOpenUrl(url: string): void;
    onPrivacyEvent(name: string, data: { [key: string]: unknown }): void;
}
