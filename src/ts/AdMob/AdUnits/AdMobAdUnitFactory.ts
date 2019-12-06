import { AdMobAdUnit, IAdMobAdUnitParameters } from 'AdMob/AdUnits/AdMobAdUnit';
import { AdMobEventHandler } from 'AdMob/EventHandlers/AdmobEventHandler';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { IObserver1, IObserver2, IObserver3 } from 'Core/Utilities/IObserver';
import { Platform } from 'Core/Constants/Platform';
import { StreamType } from 'Core/Constants/Android/StreamType';

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

        let onMuteChangeObserverIOS: IObserver1<boolean>;
        let onVolumeChangeObserverIOS: IObserver2<number, number>;
        let onVolumeChangeObserverAndroid: IObserver3<number, number, number>;

        if (parameters.platform === Platform.ANDROID) {
            parameters.core.DeviceInfo.Android!.registerVolumeChangeListener(StreamType.STREAM_MUSIC);
            onVolumeChangeObserverAndroid = parameters.core.DeviceInfo.Android!.onVolumeChanged.subscribe((streamType, volume, maxVolume) => eventHandler.onVolumeChange(volume, maxVolume));
        } else if (parameters.platform === Platform.IOS) {
            parameters.core.DeviceInfo.Ios!.registerVolumeChangeListener();
            // If the volume is changed during playback, unmute the video
            onMuteChangeObserverIOS = parameters.core.DeviceInfo.Ios!.onMuteChanged.subscribe((mute) => eventHandler.onMuteChange(mute));
            onVolumeChangeObserverIOS = parameters.core.DeviceInfo.Ios!.onVolumeChanged.subscribe((volume, maxVolume) => {
                eventHandler.onMuteChange(false);
                eventHandler.onVolumeChange(volume, maxVolume);
            });
        }

        adUnit.onClose.subscribe(() => {
            if (onVolumeChangeObserverAndroid) {
                parameters.core.DeviceInfo.Android!.unregisterVolumeChangeListener(StreamType.STREAM_MUSIC);
                parameters.core.DeviceInfo.Android!.onVolumeChanged.unsubscribe(onVolumeChangeObserverAndroid);
            }

            if (onMuteChangeObserverIOS) {
                parameters.core.DeviceInfo.Ios!.onMuteChanged.unsubscribe(onMuteChangeObserverIOS);
            }

            if (onVolumeChangeObserverIOS) {
                parameters.core.DeviceInfo.Ios!.unregisterVolumeChangeListener();
                parameters.core.DeviceInfo.Ios!.onVolumeChanged.unsubscribe(onVolumeChangeObserverIOS);
            }
        });

        return adUnit;
    }

}
