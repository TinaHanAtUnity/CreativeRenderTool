import { IPermissions } from 'Privacy/Privacy';
import { GDPREventSource } from 'Ads/Managers/UserPrivacyManager';

export interface IPrivacyViewHandler {
    onConsent(consent: IPermissions, source: GDPREventSource): void;
    onClose(): void;
    onPrivacy(url: string): void;
    onAgeGateDisagree(): void;
    onAgeGateAgree(): void;
}
