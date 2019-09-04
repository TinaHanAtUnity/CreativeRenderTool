import { AdMobAdUnit, IAdMobAdUnitParameters } from 'AdMob/AdUnits/AdMobAdUnit';
import { AdMobEventHandler } from 'AdMob/EventHandlers/AdmobEventHandler';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { IObserver1, IObserver2 } from 'Core/Utilities/IObserver';
import { Platform } from 'Core/Constants/Platform';

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
            privacyManager: parameters.privacyManager
        });
        parameters.view.render();
        parameters.view.addEventHandler(eventHandler);

        let onMuteChangeObserverIOS: IObserver1<boolean>;
        let onVolumeChangeObserverIOS: IObserver2<number, number>;

        if (parameters.platform === Platform.IOS) {
            // If the volume is changed during playback, unmute the video
            onVolumeChangeObserverIOS = parameters.core.DeviceInfo.Ios!.onVolumeChanged.subscribe((volume, maxVolume) => eventHandler.onMuteChange(false));
            onMuteChangeObserverIOS = parameters.core.DeviceInfo.Ios!.onMuteChanged.subscribe((mute) => eventHandler.onMuteChange(mute));
        }

        adUnit.onClose.subscribe(() => {
            if (onMuteChangeObserverIOS) {
                parameters.core.DeviceInfo.Ios!.onMuteChanged.unsubscribe(onMuteChangeObserverIOS);
            }

            if (onVolumeChangeObserverIOS) {
                parameters.core.DeviceInfo.Ios!.onVolumeChanged.unsubscribe(onVolumeChangeObserverIOS);
            }
        });

        return adUnit;
    }

}
