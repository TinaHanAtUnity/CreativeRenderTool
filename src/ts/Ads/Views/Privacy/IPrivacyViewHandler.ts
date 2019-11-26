import { IPermissions } from 'Privacy/Privacy';
import { GDPREventSource } from 'Ads/Managers/UserPrivacyManager';
import { IPrivacySettings } from 'Privacy/IPrivacySettings';

export interface IPrivacyViewHandler {
    onConsent(consent: IPermissions, source: GDPREventSource): void;
    onClose(): void;
    onPrivacy(url: string): void;
    onAgeGateDisagree(): void;
    onAgeGateAgree(): void;

    // TODO: Temporary
    onPrivacyCompleted(userSettings: IPrivacySettings): void;
    onPrivacyReady(): void;
    onPrivacyOpenUrl(url: string): void;
    onPrivacyEvent(name: string, data: { [key: string]: unknown }): void;
}
