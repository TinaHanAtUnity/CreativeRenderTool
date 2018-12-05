import { AdMobAdUnit, IAdMobAdUnitParameters } from 'AdMob/AdUnits/AdMobAdUnit';
import { AdMobEventHandler } from 'AdMob/EventHandlers/AdmobEventHandler';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { AdMobView } from 'AdMob/Views/AdMobView';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';

export class AdMobAdUnitFactory extends AbstractAdUnitFactory {

    public createAdUnit(parameters: IAdUnitParameters<AdMobCampaign>): AdMobAdUnit {
        // AdMobSignalFactory will always be defined, checking and throwing just to remove the undefined type.
        if (!parameters.adMobSignalFactory) {
            throw new Error('AdMobSignalFactory is undefined, should not get here.');
        }

        const privacy = this.createPrivacy(parameters);
        const showGDPRBanner = this.showGDPRBanner(parameters);
        const view = new AdMobView(parameters.platform, parameters.core, parameters.adMobSignalFactory, parameters.container, parameters.campaign, parameters.deviceInfo.getLanguage(), parameters.clientInfo.getGameId(), privacy, showGDPRBanner, parameters.programmaticTrackingService);
        view.render();

        const adUnitParameters: IAdMobAdUnitParameters = {
            ... parameters,
            view: view
        };
        const adUnit = new AdMobAdUnit(adUnitParameters);

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
            privacyManager: parameters.privacyManager
        });
        view.addEventHandler(eventHandler);
        AbstractPrivacy.setupReportListener(privacy, adUnit);

        return adUnit;
    }

}
