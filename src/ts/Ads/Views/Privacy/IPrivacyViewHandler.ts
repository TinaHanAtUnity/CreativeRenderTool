import { IPermissions } from 'Privacy/Privacy';
import { GDPREventSource } from 'Ads/Managers/UserPrivacyManager';
import { IUserPrivacySettings } from 'Ads/Views/Privacy/PrivacyView';

export interface IPrivacyViewHandler {
    onConsent(consent: IPermissions, source: GDPREventSource): void;
    onClose(): void;
    onPrivacy(url: string): void;
    onAgeGateDisagree(): void;
    onAgeGateAgree(): void;

    // TODO: Temporary
    onPrivacyCompleted(userSettings: IUserPrivacySettings): void;
    onPrivacyReady(): void;
    onPrivacyEvent(name: string, data: { [key: string]: unknown }): void;
}
