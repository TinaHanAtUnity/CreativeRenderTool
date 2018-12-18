import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { Privacy } from 'Ads/Views/Privacy';
import { ExtendedMRAID } from 'MRAID//Views/ExtendedMRAID';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { ARMRAID } from 'AR/Views/ARMRAID';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAIDEventHandler } from 'MRAID/EventHandlers/MRAIDEventHandler';
import { PlayableEventHandler } from 'MRAID/EventHandlers/PlayableEventHandler';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { MRAID } from 'MRAID/Views/MRAID';
import { IMRAIDViewHandler, MRAIDView } from 'MRAID/Views/MRAIDView';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
import { Platform } from 'Core/Constants/Platform';
import { AndroidBackButtonSkipTest } from 'Core/Models/ABGroup';

export class MRAIDAdUnitFactory extends AbstractAdUnitFactory<MRAIDCampaign, IMRAIDAdUnitParameters> {
    public createAdUnit(parameters: IMRAIDAdUnitParameters): MRAIDAdUnit {
        const mraidAdUnit: MRAIDAdUnit = new MRAIDAdUnit(parameters);
        // NOTE: When content type is correct for playables we want to change this to content type check.
        const isPlayable: boolean = parameters.campaign instanceof PerformanceMRAIDCampaign;
        const isSonicPlayable: boolean = CustomFeatures.isSonicPlayable(parameters.campaign.getCreativeId());
        const EventHandler =  (isSonicPlayable || isPlayable) ? PlayableEventHandler : MRAIDEventHandler;
        const mraidEventHandler: IMRAIDViewHandler = new EventHandler(mraidAdUnit, parameters);
        parameters.mraid.addEventHandler(mraidEventHandler);

        if (parameters.platform === Platform.ANDROID) {
            const onBackKeyObserver = parameters.ads.Android!.AdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => {
                const abGroup = parameters.coreConfig.getAbGroup();
                const backButtonTestEnabled = AndroidBackButtonSkipTest.isValid(abGroup);
                if(backButtonTestEnabled) {
                    mraidEventHandler.onKeyEvent(keyCode);
                }
            });
            mraidAdUnit.onClose.subscribe(() => {
                if(onBackKeyObserver) {
                    parameters.ads.Android!.AdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
                }
            });
        }

        Privacy.setupReportListener(parameters.privacy, mraidAdUnit);
        return mraidAdUnit;
    }
}
