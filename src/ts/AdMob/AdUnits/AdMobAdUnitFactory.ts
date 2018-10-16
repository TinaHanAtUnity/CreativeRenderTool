import { AbstractAdUnitFactory } from '../../Ads/AdUnits/AbstractAdUnitFactory';
import { IAdUnitParameters } from '../../Ads/AdUnits/AbstractAdUnit';
import { AdMobCampaign } from '../Models/AdMobCampaign';
import { AdMobAdUnit, IAdMobAdUnitParameters } from './AdMobAdUnit';
import { AdMobView } from '../Views/AdMobView';
import { AdMobEventHandler } from '../EventHandlers/AdmobEventHandler';
import { Privacy } from '../../Ads/Views/Privacy';

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
            gdprManager: parameters.gdprManager
        });
        view.addEventHandler(eventHandler);
        Privacy.setupReportListener(privacy, adUnit);

        return adUnit;
    }

}
