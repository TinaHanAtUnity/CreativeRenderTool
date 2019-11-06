import { IPermissions } from 'Privacy/Privacy';
import { GDPREventAction, GDPREventSource } from 'Ads/Managers/UserPrivacyManager';

export interface IConsentViewHandler {
    onConsent(consent: IPermissions, userAction: GDPREventAction, source: GDPREventSource): void;
    onClose(): void;
    onPrivacy(url: string): void;
    onAgeGateDisagree(): void;
    onAgeGateAgree(): void;
}
