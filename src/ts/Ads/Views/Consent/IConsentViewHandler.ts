import { IPermissions } from 'Privacy/Privacy';
import { GDPREventSource } from 'Ads/Managers/UserPrivacyManager';

export interface IConsentViewHandler {
    onConsent(consent: IPermissions, agreedAll: boolean, source: GDPREventSource): void;
    onClose(): void;
    onPrivacy(url: string): void;
    onAgeGateDisagree(): void;
    onAgeGateAgree(): void;
}
