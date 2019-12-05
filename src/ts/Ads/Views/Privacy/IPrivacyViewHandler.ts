import { IPrivacyPermissions } from 'Privacy/Privacy';
import { GDPREventAction, GDPREventSource } from 'Ads/Managers/UserPrivacyManager';

export interface IPrivacyViewHandler {
    onConsent(consent: IPrivacyPermissions, userAction: GDPREventAction, source: GDPREventSource): void;
    onClose(): void;
    onPrivacy(url: string): void;
    onAgeGateDisagree(): void;
    onAgeGateAgree(): void;
}
