import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { IVastAdUnitParameters, VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { VastOverlayEventHandler } from 'VAST/EventHandlers/VastOverlayEventHandler';
import { VastEndScreenEventHandler } from 'VAST/EventHandlers/VastEndScreenEventHandler';
import { Platform } from 'Core/Constants/Platform';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { VastVideoEventHandler } from 'VAST/EventHandlers/VastVideoEventHandler';
import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { IObserver2, IObserver3 } from 'Core/Utilities/IObserver';
import { StreamType } from 'Core/Constants/Android/StreamType';

export class VastAdUnitFactory extends AbstractAdUnitFactory<VastCampaign, IVastAdUnitParameters> {

    public createAdUnit(parameters: IVastAdUnitParameters): VastAdUnit {
        const hasAdvertiserDomain = parameters.campaign.getAdvertiserDomain() !== undefined;
        if (hasAdvertiserDomain && parameters.campaign.isMoatEnabled()) {
            MoatViewabilityService.initMoat(parameters.platform, parameters.core, parameters.campaign, parameters.clientInfo, parameters.placement, parameters.deviceInfo, parameters.coreConfig);
        }

        const vastAdUnit = new VastAdUnit(parameters);

        const vastOverlayHandler = new VastOverlayEventHandler(vastAdUnit, parameters);
        parameters.overlay.addEventHandler(vastOverlayHandler);

        if(parameters.campaign.hasEndscreen() && parameters.endScreen) {
            const vastEndScreenHandler = new VastEndScreenEventHandler(vastAdUnit, parameters);
            parameters.endScreen.addEventHandler(vastEndScreenHandler);

            if (parameters.platform === Platform.ANDROID) {
                const onBackKeyObserver = parameters.ads.Android!.AdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) =>  {
                    vastEndScreenHandler.onKeyEvent(keyCode);
                    if(CustomFeatures.isCheetahGame(parameters.clientInfo.getGameId())) {
                        vastOverlayHandler.onKeyEvent(keyCode);
                    }
                });

                vastAdUnit.onClose.subscribe(() => {
                    parameters.ads.Android!.AdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
                });
            }
        }

        const videoEventHandlerParams = this.getVideoEventHandlerParams(vastAdUnit, parameters.campaign.getVideo(), undefined, parameters);
        const vastVideoEventHandler = this.prepareVideoPlayer(VastVideoEventHandler, <IVideoEventHandlerParams<VastAdUnit, VastCampaign>>videoEventHandlerParams);

        let onVolumeChangeObserverAndroid: IObserver3<number, number, number>;
        let onVolumeChangeObserverIOS: IObserver2<number, number>;
        if(parameters.platform === Platform.ANDROID) {
            parameters.core.DeviceInfo.Android!.registerVolumeChangeListener(StreamType.STREAM_MUSIC);
            onVolumeChangeObserverAndroid = parameters.core.DeviceInfo.Android!.onVolumeChanged.subscribe((streamType, volume, maxVolume) => vastVideoEventHandler.onVolumeChange(volume, maxVolume));
        } else if(parameters.platform === Platform.IOS) {
            parameters.core.DeviceInfo.Ios!.registerVolumeChangeListener();
            onVolumeChangeObserverIOS = parameters.core.DeviceInfo.Ios!.onVolumeChanged.subscribe((volume, maxVolume) => vastVideoEventHandler.onVolumeChange(volume, maxVolume));
        }

        vastAdUnit.onClose.subscribe(() => {
            if(onVolumeChangeObserverAndroid) {
                parameters.core.DeviceInfo.Android!.unregisterVolumeChangeListener(StreamType.STREAM_MUSIC);
                parameters.core.DeviceInfo.Android!.onVolumeChanged.unsubscribe(onVolumeChangeObserverAndroid);
            }

            if(onVolumeChangeObserverIOS) {
                parameters.core.DeviceInfo.Ios!.unregisterVolumeChangeListener();
                parameters.core.DeviceInfo.Ios!.onVolumeChanged.unsubscribe(onVolumeChangeObserverIOS);
            }
        });

        return vastAdUnit;
    }

}
