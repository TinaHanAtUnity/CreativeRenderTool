import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { Campaign } from 'Ads/Models/Campaign';
import { IGDPRConsentHandler } from 'Ads/Views/Consent/GDPRConsent';
import { IConsent } from 'Ads/Views/Consent/IConsent';

export class GDPRConsentHandler<T extends Campaign> implements IGDPRConsentHandler {

    private adUnit: AbstractAdUnit;

    constructor(adUnit: AbstractAdUnit, parameters: IAdUnitParameters<T>) {
        this.adUnit = adUnit;

    }

    public onConsent(consent: IConsent): void {
        // todo: send events
    }

    // IGDPRConsentHandler
    public onShowOptions(): void {
        // TODO: Implement
    }

    // IGDPRConsentHandler
    public onConsentHide(): void {
        // Blank
    }
}
