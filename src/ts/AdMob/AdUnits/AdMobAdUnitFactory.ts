import { AdMobAdUnit, IAdMobAdUnitParameters } from 'AdMob/AdUnits/AdMobAdUnit';
import { AdMobEventHandler } from 'AdMob/EventHandlers/AdmobEventHandler';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';

export class AdMobAdUnitFactory extends AbstractAdUnitFactory<AdMobCampaign, IAdMobAdUnitParameters> {

    public createAdUnit(parameters: IAdMobAdUnitParameters): AdMobAdUnit {

        const adUnit = new AdMobAdUnit(parameters);

        const eventHandler = new AdMobEventHandler({
            platform: parameters.platform,
            core: parameters.core,
            adUnit: adUnit,
            request: parameters.request,
            thirdPartyEventManager: parameters.thirdPartyEventManager,
            session: parameters.campaign.getSession(),
            adMobSignalFactory: parameters.adMobSignalFactory,
            campaign: parameters.campaign,
            clientInfo: parameters.clientInfo,
            coreConfig: parameters.coreConfig,
            adsConfig: parameters.adsConfig,
            privacyManager: parameters.privacyManager,
            privacySDK: parameters.privacySDK
        });
        parameters.view.render();
        parameters.view.addEventHandler(eventHandler);

        return adUnit;
    }

}
