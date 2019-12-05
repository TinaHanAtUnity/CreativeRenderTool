import { IPrivacyPermissions } from 'Privacy/Privacy';
import { GDPREventAction, GDPREventSource } from 'Ads/Managers/UserPrivacyManager';
import { IPrivacySettings } from 'Privacy/IPrivacySettings';

export interface IPrivacyViewHandler {
    onConsent(consent: IPrivacyPermissions, userAction: GDPREventAction, source: GDPREventSource): void;
    onClose(): void;
    onPrivacy(url: string): void;
    onAgeGateDisagree(): void;
    onAgeGateAgree(): void;

    onPrivacyReady(): void;
    onPrivacyCompleted(userSettings: IPrivacySettings): void;
    onPrivacyOpenUrl(url: string): void;
    onPrivacyEvent(name: string, data: { [key: string]: unknown }): void;

}
