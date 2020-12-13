import { AdMobAdUnit } from 'AdMob/AdUnits/AdMobAdUnit';
import { AdMobEventHandler } from 'AdMob/EventHandlers/AdmobEventHandler';
import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { Platform } from 'Core/Constants/Platform';
import { StreamType } from 'Core/Constants/Android/StreamType';
export class AdMobAdUnitFactory extends AbstractAdUnitFactory {
    createAdUnit(parameters) {
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
        let onMuteChangeObserverIOS;
        let onVolumeChangeObserverIOS;
        let onVolumeChangeObserverAndroid;
        if (parameters.platform === Platform.ANDROID) {
            parameters.core.DeviceInfo.Android.registerVolumeChangeListener(StreamType.STREAM_MUSIC);
            onVolumeChangeObserverAndroid = parameters.core.DeviceInfo.Android.onVolumeChanged.subscribe((streamType, volume, maxVolume) => eventHandler.onVolumeChange(volume, maxVolume));
        }
        else if (parameters.platform === Platform.IOS) {
            parameters.core.DeviceInfo.Ios.registerVolumeChangeListener();
            // If the volume is changed during playback, unmute the video
            onMuteChangeObserverIOS = parameters.core.DeviceInfo.Ios.onMuteChanged.subscribe((mute) => eventHandler.onMuteChange(mute));
            onVolumeChangeObserverIOS = parameters.core.DeviceInfo.Ios.onVolumeChanged.subscribe((volume, maxVolume) => {
                eventHandler.onMuteChange(false);
                eventHandler.onVolumeChange(volume, maxVolume);
            });
        }
        adUnit.onClose.subscribe(() => {
            if (onVolumeChangeObserverAndroid) {
                parameters.core.DeviceInfo.Android.unregisterVolumeChangeListener(StreamType.STREAM_MUSIC);
                parameters.core.DeviceInfo.Android.onVolumeChanged.unsubscribe(onVolumeChangeObserverAndroid);
            }
            if (onMuteChangeObserverIOS) {
                parameters.core.DeviceInfo.Ios.onMuteChanged.unsubscribe(onMuteChangeObserverIOS);
            }
            if (onVolumeChangeObserverIOS) {
                parameters.core.DeviceInfo.Ios.unregisterVolumeChangeListener();
                parameters.core.DeviceInfo.Ios.onVolumeChanged.unsubscribe(onVolumeChangeObserverIOS);
            }
        });
        return adUnit;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRNb2JBZFVuaXRGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0FkTW9iL0FkVW5pdHMvQWRNb2JBZFVuaXRGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQTBCLE1BQU0sMkJBQTJCLENBQUM7QUFDaEYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFFMUUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFFMUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUUvRCxNQUFNLE9BQU8sa0JBQW1CLFNBQVEscUJBQTREO0lBRXpGLFlBQVksQ0FBQyxVQUFrQztRQUVsRCxNQUFNLE1BQU0sR0FBRyxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUUzQyxNQUFNLFlBQVksR0FBRyxJQUFJLGlCQUFpQixDQUFDO1lBQ3ZDLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUTtZQUM3QixJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUk7WUFDckIsTUFBTSxFQUFFLE1BQU07WUFDZCxPQUFPLEVBQUUsVUFBVSxDQUFDLE9BQU87WUFDM0Isc0JBQXNCLEVBQUUsVUFBVSxDQUFDLHNCQUFzQjtZQUN6RCxPQUFPLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUU7WUFDekMsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLGtCQUFrQjtZQUNqRCxRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVE7WUFDN0IsVUFBVSxFQUFFLFVBQVUsQ0FBQyxVQUFVO1lBQ2pDLFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVTtZQUNqQyxTQUFTLEVBQUUsVUFBVSxDQUFDLFNBQVM7WUFDL0IsY0FBYyxFQUFFLFVBQVUsQ0FBQyxj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