import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { IAdMobAdUnitParameters } from 'AdMob/AdUnits/AdMobAdUnit';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';
import { AdMobView } from 'AdMob/Views/AdMobView';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement';
import { OpenMeasurementTest } from 'Core/Models/ABGroup';

export class AdMobAdUnitParametersFactory extends AbstractAdUnitParametersFactory<AdMobCampaign, IAdMobAdUnitParameters> {

    private _adMobSignalFactory: AdMobSignalFactory;

    constructor(core: ICore, ads: IAds) {
        super(core, ads);
        this._adMobSignalFactory = ads.AdMobSignalFactory;
    }

    protected createParameters(baseParams: IAdUnitParameters<AdMobCampaign>) {
        const showGDPRBanner = this.showGDPRBanner(baseParams);

        let om;
        const isOMEnabled = OpenMeasurementTest.isValid(baseParams.coreConfig.getAbGroup());
        if (isOMEnabled) {
            om = new OpenMeasurement(baseParams.platform, baseParams.core, baseParams.clientInfo, baseParams.campaign, baseParams.placement, baseParams.deviceInfo, baseParams.request);
            om.addToViewHierarchy();
        }

        const view = new AdMobView(baseParams.platform, baseParams.core, this._adMobSignalFactory, baseParams.container, baseParams.campaign, baseParams.deviceInfo.getLanguage(), baseParams.clientInfo.getGameId(), baseParams.privacy, showGDPRBanner, baseParams.programmaticTrackingService, om);

        return {
            ... baseParams,
            adMobSignalFactory: this._adMobSignalFactory,
            view
        };
    }
}
