import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { Privacy } from 'Ads/Views/Privacy';
import { ARMRAID } from 'AR/Views/ARMRAID';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAIDEventHandler } from 'MRAID/EventHandlers/MRAIDEventHandler';
import { PlayableEventHandler } from 'MRAID/EventHandlers/PlayableEventHandler';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { IMRAIDViewHandler } from 'MRAID/Views/MRAIDView';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
import { ARMRAIDEventHandler } from 'AR/EventHandlers/ARMRAIDEventHandler';
import { WebPlayerMRAIDAdUnit } from 'MRAID/AdUnits/WebPlayerMRAIDAdUnit';
import { WebPlayerMRAIDTest } from 'Core/Models/ABGroup';

export class MRAIDAdUnitFactory extends AbstractAdUnitFactory<MRAIDCampaign, IMRAIDAdUnitParameters> {
    public createAdUnit(parameters: IMRAIDAdUnitParameters): MRAIDAdUnit {
        // let mraidAdUnit;
        // if (WebPlayerMRAIDTest.isValid(parameters.coreConfig.getAbGroup())) {
        //     mraidAdUnit = new WebPlayerMRAIDAdUnit(parameters);
        // } else {
        //     mraidAdUnit = new MRAIDAdUnit(parameters);
        // }

        const mraidAdUnit = new WebPlayerMRAIDAdUnit(parameters);

        // NOTE: When content type is correct for playables we want to change this to content type check.
        const isPlayable: boolean = parameters.campaign instanceof PerformanceMRAIDCampaign;
        const isAR: boolean = parameters.mraid instanceof ARMRAID;
        const isSonicPlayable: boolean = CustomFeatures.isSonicPlayable(parameters.campaign.getCreativeId());
        const EventHandler = (isSonicPlayable || isPlayable) ? PlayableEventHandler :
            isAR ? ARMRAIDEventHandler : MRAIDEventHandler;
        const mraidEventHandler: IMRAIDViewHandler = new EventHandler(mraidAdUnit, parameters);
        parameters.mraid.addEventHandler(mraidEventHandler);
        Privacy.setupReportListener(parameters.privacy, mraidAdUnit);
        return mraidAdUnit;
    }
}
