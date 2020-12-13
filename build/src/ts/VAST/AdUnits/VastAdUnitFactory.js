import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { VastOverlayEventHandler } from 'VAST/EventHandlers/VastOverlayEventHandler';
import { VastEndScreenEventHandler } from 'VAST/EventHandlers/VastEndScreenEventHandler';
import { Platform } from 'Core/Constants/Platform';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { VastVideoEventHandler } from 'VAST/EventHandlers/VastVideoEventHandler';
import { StreamType } from 'Core/Constants/Android/StreamType';
import { TencentVastOverlayEventHandler } from 'VAST/EventHandlers/TencentVastOverlayEventHandler';
import { TencentVastEndScreenEventHandler } from 'VAST/EventHandlers/TencentVastEndScreenEventHandler';
export class VastAdUnitFactory extends AbstractAdUnitFactory {
    createAdUnit(parameters) {
        const useTencentHandlers = CustomFeatures.isTencentSeat(parameters.campaign.getSeatId());
        const hasAdvertiserDomain = parameters.campaign.getAdvertiserDomain() !== undefined;
        if (hasAdvertiserDomain && parameters.campaign.isMoatEnabled()) {
            MoatViewabilityService.initMoat(parameters.platform, parameters.core, parameters.campaign, parameters.clientInfo, parameters.placement, parameters.deviceInfo, parameters.coreConfig);
        }
        const vastAdUnit = new VastAdUnit(parameters);
        let vastOverlayHandler;
        if (useTencentHandlers) {
            vastOverlayHandler = new TencentVastOverlayEventHandler(vastAdUnit, parameters);
        }
        else {
            vastOverlayHandler = new VastOverlayEventHandler(vastAdUnit, parameters);
        }
        parameters.overlay.addEventHandler(vastOverlayHandler);
        if ((parameters.campaign.hasStaticEndscreen() || parameters.campaign.hasIframeEndscreen() || parameters.campaign.hasHtmlEndscreen()) && parameters.endScreen) {
            let vastEndScreenHandler;
            if (useTencentHandlers) {
                vastEndScreenHandler = new TencentVastEndScreenEventHandler(vastAdUnit, parameters);
            }
            else {
                vastEndScreenHandler = new VastEndScreenEventHandler(vastAdUnit, parameters);
            }
            parameters.endScreen.addEventHandler(vastEndScreenHandler);
            if (parameters.platform === Platform.ANDROID) {
                const onBackKeyObserver = parameters.ads.Android.AdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => {
                    vastEndScreenHandler.onKeyEvent(keyCode);
                    if (CustomFeatures.isCloseIconSkipEnabled(parameters.clientInfo.getGameId())) {
                        vastOverlayHandler.onKeyEvent(keyCode);
                    }
                });
                vastAdUnit.onClose.subscribe(() => {
                    parameters.ads.Android.AdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
                });
            }
        }
        const videoEventHandlerParams = this.getVideoEventHandlerParams(vastAdUnit, parameters.campaign.getVideo(), undefined, parameters);
        const vastVideoEventHandler = this.prepareVideoPlayer(VastVideoEventHandler, videoEventHandlerParams);
        let onVolumeChangeObserverAndroid;
        let onVolumeChangeObserverIOS;
        if (parameters.platform === Platform.ANDROID) {
            parameters.core.DeviceInfo.Android.registerVolumeChangeListener(StreamType.STREAM_MUSIC);
            onVolumeChangeObserverAndroid = parameters.core.DeviceInfo.Android.onVolumeChanged.subscribe((streamType, volume, maxVolume) => vastVideoEventHandler.onVolumeChange(volume, maxVolume));
        }
        else if (parameters.platform === Platform.IOS) {
            parameters.core.DeviceInfo.Ios.registerVolumeChangeListener();
            onVolumeChangeObserverIOS = parameters.core.DeviceInfo.Ios.onVolumeChanged.subscribe((volume, maxVolume) => vastVideoEventHandler.onVolumeChange(volume, maxVolume));
        }
        vastAdUnit.onClose.subscribe(() => {
            if (onVolumeChangeObserverAndroid) {
                parameters.core.DeviceInfo.Android.unregisterVolumeChangeListener(StreamType.STREAM_MUSIC);
                parameters.core.DeviceInfo.Android.onVolumeChanged.unsubscribe(onVolumeChangeObserverAndroid);
            }
            if (onVolumeChangeObserverIOS) {
                parameters.core.DeviceInfo.Ios.unregisterVolumeChangeListener();
                parameters.core.DeviceInfo.Ios.onVolumeChanged.unsubscribe(onVolumeChangeObserverIOS);
            }
        });
        return vastAdUnit;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEFkVW5pdEZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVkFTVC9BZFVuaXRzL1Zhc3RBZFVuaXRGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBRTFFLE9BQU8sRUFBeUIsVUFBVSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDNUUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDOUUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFDckYsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDekYsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUdqRixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDL0QsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sbURBQW1ELENBQUM7QUFDbkcsT0FBTyxFQUFFLGdDQUFnQyxFQUFFLE1BQU0scURBQXFELENBQUM7QUFFdkcsTUFBTSxPQUFPLGlCQUFrQixTQUFRLHFCQUEwRDtJQUV0RixZQUFZLENBQUMsVUFBaUM7UUFDakQsTUFBTSxrQkFBa0IsR0FBRyxjQUFjLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUN6RixNQUFNLG1CQUFtQixHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxTQUFTLENBQUM7UUFDcEYsSUFBSSxtQkFBbUIsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFB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