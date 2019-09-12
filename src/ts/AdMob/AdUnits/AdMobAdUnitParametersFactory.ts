import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { IAdMobAdUnitParameters } from 'AdMob/AdUnits/AdMobAdUnit';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';
import { AdMobView } from 'AdMob/Views/AdMobView';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { OpenMeasurementTest } from 'Core/Models/ABGroup';
import { OpenMeasurementManager } from 'Ads/Views/OpenMeasurement/OpenMeasurementManager';
import { AdmobOpenMeasurementManager } from 'Ads/Views/OpenMeasurement/AdmobOpenMeasurementManager';

export class AdMobAdUnitParametersFactory extends AbstractAdUnitParametersFactory<AdMobCampaign, IAdMobAdUnitParameters> {

    private _adMobSignalFactory: AdMobSignalFactory;

    constructor(core: ICore, ads: IAds) {
        super(core, ads);
        this._adMobSignalFactory = ads.AdMobSignalFactory;
    }

    protected createParameters(baseParams: IAdUnitParameters<AdMobCampaign>) {
        const showGDPRBanner = this.showGDPRBanner(baseParams);

        let om;
        const isOMEnabled = true; //OpenMeasurementTest.isValid(baseParams.coreConfig.getAbGroup());
        if (isOMEnabled) {
            om = new AdmobOpenMeasurementManager(baseParams.placement, baseParams);
            om.addToViewHierarchy();
        }

        const view = new AdMobView(baseParams.platform, baseParams.core, this._adMobSignalFactory, baseParams.container, baseParams.campaign, baseParams.deviceInfo, baseParams.clientInfo.getGameId(), baseParams.privacy, showGDPRBanner, baseParams.programmaticTrackingService, om);

        return {
            ... baseParams,
            adMobSignalFactory: this._adMobSignalFactory,
            view
        };
    }
}
