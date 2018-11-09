import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { Campaign } from 'Ads/Models/Campaign';
import { IGDPRConsentHandler } from 'Ads/Views/GDPRConsent';

export class GDPRConsentHandler<T extends Campaign> implements IGDPRConsentHandler {

    private adUnit: AbstractAdUnit;

    constructor(adUnit: AbstractAdUnit, parameters: IAdUnitParameters<T>) {
        this.adUnit = adUnit;

    }

    public onConsent(consent: boolean): void {
        console.log('onConsent');
        // todo: send events
        this.adUnit.showAd();
    }

}