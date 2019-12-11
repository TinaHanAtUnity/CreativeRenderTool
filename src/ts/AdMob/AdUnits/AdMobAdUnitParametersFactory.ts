import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { IAdMobAdUnitParameters } from 'AdMob/AdUnits/AdMobAdUnit';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';
import { AdMobView } from 'AdMob/Views/AdMobView';
import { OpenMeasurementTest } from 'Core/Models/ABGroup';
import { AdmobOpenMeasurementController } from 'Ads/Views/OpenMeasurement/AdmobOpenMeasurementController';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { ThirdPartyEventMacro } from 'Ads/Managers/ThirdPartyEventManager';
import { AdmobMetric } from 'Ads/Utilities/ProgrammaticTrackingService';

export class AdMobAdUnitParametersFactory extends AbstractAdUnitParametersFactory<AdMobCampaign, IAdMobAdUnitParameters> {

    private _adMobSignalFactory: AdMobSignalFactory;

    constructor(core: ICore, ads: IAds) {
        super(core, ads);
        this._adMobSignalFactory = ads.AdMobSignalFactory;
    }

    protected createParameters(baseParams: IAdUnitParameters<AdMobCampaign>) {
        const showGDPRBanner = this.showGDPRBanner(baseParams);

        let om;
        const isOMEnabled = baseParams.campaign.isOMEnabled() ? true : false;
        baseParams.thirdPartyEventManager.setTemplateValue(ThirdPartyEventMacro.OM_ENABLED, `${isOMEnabled}`);
        if (isOMEnabled) {
            const omAdViewBuilder = new OpenMeasurementAdViewBuilder(baseParams.campaign, baseParams.deviceInfo, baseParams.platform);
            om = new AdmobOpenMeasurementController(baseParams.platform, baseParams.core, baseParams.clientInfo, baseParams.campaign, baseParams.placement, baseParams.deviceInfo, baseParams.request, omAdViewBuilder, baseParams.thirdPartyEventManager, baseParams.programmaticTrackingService);
            om.addToViewHierarchy();
            baseParams.programmaticTrackingService.reportMetricEvent(AdmobMetric.AdmobOMEnabled);
        }

        const view = new AdMobView(baseParams.platform, baseParams.core, this._adMobSignalFactory, baseParams.container, baseParams.campaign, baseParams.deviceInfo, baseParams.clientInfo.getGameId(), baseParams.privacy, showGDPRBanner, baseParams.programmaticTrackingService, om);

        return {
            ... baseParams,
            adMobSignalFactory: this._adMobSignalFactory,
            view
        };
    }
}
