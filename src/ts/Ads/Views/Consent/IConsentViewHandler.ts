import { IPermissions } from 'Ads/Models/Privacy';
import { GDPREventSource } from 'Ads/Managers/UserPrivacyManager';

export interface IConsentViewHandler {
    onConsent(consent: IPermissions, source: GDPREventSource): void;
    onClose(): void;
    onPrivacy(url: string): void;
}
