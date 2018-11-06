import { View } from 'Core/Views/View';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export interface IGDPRConsentParameters {
    nativeBridge: NativeBridge;
}

export interface IConsentHandler {
    onConsent(consent: boolean): void;
}

export class GDPRConsent extends View<IConsentHandler> {

    constructor(parameters: IGDPRConsentParameters) {
        super(parameters.nativeBridge, 'gdpr-consent');
    }
}
