import { AbstractAdUnitFactory } from '../../Ads/AdUnits/AbstractAdUnitFactory';
import { NativeBridge } from '../../Core/Native/Bridge/NativeBridge';
import { IAdUnitParameters } from '../../Ads/AdUnits/AbstractAdUnit';
import { MRAIDCampaign } from '../Models/MRAIDCampaign';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from './MRAIDAdUnit';
import { IMRAIDViewHandler, MRAIDView } from '../Views/MRAIDView';
import { PlayableMRAID } from '../Views/PlayableMRAID';
import { ARUtil } from '../../AR/Utilities/ARUtil';
import { ARMRAID } from '../../AR/Views/ARMRAID';
import { MRAID } from '../Views/MRAID';
import { PerformanceMRAIDCampaign } from '../../Performance/Models/PerformanceMRAIDCampaign';
import { CustomFeatures } from '../../Ads/Utilities/CustomFeatures';
import { PlayableEventHandler } from '../EventHandlers/PlayableEventHandler';
import { MRAIDEventHandler } from '../EventHandlers/MRAIDEventHandler';
import { Privacy } from '../../Ads/Views/Privacy';

export class MRAIDAdUnitFactory extends AbstractAdUnitFactory {

    private static _forcedPlayableMRAID: boolean = false;
    private static _forcedARMRAID: boolean = false;

    public static setForcedPlayableMRAID(value: boolean) {
        MRAIDAdUnitFactory._forcedPlayableMRAID = value;
    }

    public static setForcedARMRAID(value: boolean) {
        MRAIDAdUnitFactory._forcedARMRAID = value;
    }

    public createAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<MRAIDCampaign>): MRAIDAdUnit {
        const resourceUrl = parameters.campaign.getResourceUrl();

        let mraid: MRAIDView<IMRAIDViewHandler>;
        const showGDPRBanner = this.showGDPRBanner(parameters);
        const privacy = this.createPrivacy(nativeBridge, parameters);

        parameters.gameSessionId = parameters.gameSessionId || 0;

        if((resourceUrl && resourceUrl.getOriginalUrl().match(/playables\/production\/unity/)) || MRAIDAdUnitFactory._forcedPlayableMRAID) {
            mraid = new PlayableMRAID(nativeBridge, parameters.placement, parameters.campaign, parameters.deviceInfo.getLanguage(), privacy, showGDPRBanner, parameters.coreConfig.getAbGroup(), parameters.gameSessionId);
        } else if (ARUtil.isARCreative(parameters.campaign) || MRAIDAdUnitFactory._forcedARMRAID) {
            mraid = new ARMRAID(nativeBridge, parameters.placement, parameters.campaign, parameters.deviceInfo.getLanguage(), privacy, showGDPRBanner, parameters.coreConfig.getAbGroup(), parameters.gameSessionId);
        } else {
            mraid = new MRAID(nativeBridge, parameters.placement, parameters.campaign, privacy, showGDPRBanner, parameters.coreConfig.getAbGroup(), parameters.gameSessionId);
        }

        const mraidAdUnitParameters: IMRAIDAdUnitParameters = {
            ... parameters,
            mraid: mraid,
            privacy: privacy
        };

        const mraidAdUnit: MRAIDAdUnit = new MRAIDAdUnit(nativeBridge, mraidAdUnitParameters);

        // NOTE: When content type is correct for playables we want to change this to content type check.
        const isPlayable: boolean = parameters.campaign instanceof PerformanceMRAIDCampaign;
        const isSonicPlayable: boolean = CustomFeatures.isSonicPlayable(parameters.campaign.getCreativeId());
        const EventHandler =  (isSonicPlayable || isPlayable) ? PlayableEventHandler : MRAIDEventHandler;
        const mraidEventHandler: IMRAIDViewHandler = new EventHandler(nativeBridge, mraidAdUnit, mraidAdUnitParameters);
        mraid.addEventHandler(mraidEventHandler);
        Privacy.setupReportListener(privacy, mraidAdUnit);
        return mraidAdUnit;
    }

}
