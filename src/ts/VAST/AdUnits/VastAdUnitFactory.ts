import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { IVastAdUnitParameters, VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { IVastEndscreenParameters, VastEndScreen } from 'VAST/Views/VastEndScreen';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { VastOverlayEventHandler } from 'VAST/EventHandlers/VastOverlayEventHandler';
import { VastEndScreenEventHandler } from 'VAST/EventHandlers/VastEndScreenEventHandler';
import { Platform } from 'Core/Constants/Platform';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { VastVideoEventHandler } from 'VAST/EventHandlers/VastVideoEventHandler';
import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { IObserver2, IObserver3 } from 'Core/Utilities/IObserver';
import { StreamType } from 'Core/Constants/Android/StreamType';
import { Privacy } from 'Ads/Views/Privacy';

export class VastAdUnitFactory extends AbstractAdUnitFactory {

    public createAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<VastCampaign>): VastAdUnit {
        const privacy = this.createPrivacy(nativeBridge, parameters);
        const showPrivacyDuringVideo = !parameters.campaign.hasEndscreen() || this.showGDPRBanner(parameters);
        const overlay = this.createOverlay(nativeBridge, parameters, privacy, showPrivacyDuringVideo);
        let vastEndScreen: VastEndScreen | undefined;

        const vastAdUnitParameters: IVastAdUnitParameters = {
            ... parameters,
            video: parameters.campaign.getVideo(),
            overlay: overlay
        };

        if(parameters.campaign.hasEndscreen()) {
            const vastEndscreenParameters: IVastEndscreenParameters = {
                campaign: vastAdUnitParameters.campaign,
                clientInfo: vastAdUnitParameters.clientInfo,
                seatId: vastAdUnitParameters.campaign.getSeatId(),
                showPrivacyDuringEndscreen: !showPrivacyDuringVideo
            };

            vastEndScreen = new VastEndScreen(nativeBridge, vastEndscreenParameters, privacy);
            vastAdUnitParameters.endScreen = vastEndScreen;
        }

        const hasAdvertiserDomain = parameters.campaign.getAdvertiserDomain() !== undefined;
        if (hasAdvertiserDomain && parameters.campaign.isMoatEnabled()) {
            MoatViewabilityService.initMoat(nativeBridge, parameters.campaign, parameters.clientInfo, parameters.placement, parameters.deviceInfo, parameters.coreConfig);
        }

        const vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);

        const vastOverlayHandler = new VastOverlayEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
        overlay.addEventHandler(vastOverlayHandler);

        if(parameters.campaign.hasEndscreen() && vastEndScreen) {
            const vastEndScreenHandler = new VastEndScreenEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
            vastEndScreen.addEventHandler(vastEndScreenHandler);

            if (nativeBridge.getPlatform() === Platform.ANDROID) {
                const onBackKeyObserver = nativeBridge.AndroidAdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) =>  {
                    vastEndScreenHandler.onKeyEvent(keyCode);
                    if(CustomFeatures.isCheetahGame(parameters.clientInfo.getGameId())) {
                        vastOverlayHandler.onKeyEvent(keyCode);
                    }
                });

                vastAdUnit.onClose.subscribe(() => {
                    nativeBridge.AndroidAdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
                });
            }
        }

        const videoEventHandlerParams = this.getVideoEventHandlerParams(nativeBridge, vastAdUnit, parameters.campaign.getVideo(), undefined, vastAdUnitParameters);
        const vastVideoEventHandler = this.prepareVideoPlayer(VastVideoEventHandler, <IVideoEventHandlerParams<VastAdUnit, VastCampaign>>videoEventHandlerParams);

        let onVolumeChangeObserverAndroid: IObserver3<number, number, number>;
        let onVolumeChangeObserverIOS: IObserver2<number, number>;
        if(nativeBridge.getPlatform() === Platform.ANDROID) {
            nativeBridge.DeviceInfo.Android.registerVolumeChangeListener(StreamType.STREAM_MUSIC);
            onVolumeChangeObserverAndroid = nativeBridge.DeviceInfo.Android.onVolumeChanged.subscribe((streamType, volume, maxVolume) => vastVideoEventHandler.onVolumeChange(volume, maxVolume));
        } else if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.DeviceInfo.Ios.registerVolumeChangeListener();
            onVolumeChangeObserverIOS = nativeBridge.DeviceInfo.Ios.onVolumeChanged.subscribe((volume, maxVolume) => vastVideoEventHandler.onVolumeChange(volume, maxVolume));
        }

        vastAdUnit.onClose.subscribe(() => {
            if(onVolumeChangeObserverAndroid) {
                nativeBridge.DeviceInfo.Android.unregisterVolumeChangeListener(StreamType.STREAM_MUSIC);
                nativeBridge.DeviceInfo.Android.onVolumeChanged.unsubscribe(onVolumeChangeObserverAndroid);
            }

            if(onVolumeChangeObserverIOS) {
                nativeBridge.DeviceInfo.Ios.unregisterVolumeChangeListener();
                nativeBridge.DeviceInfo.Ios.onVolumeChanged.unsubscribe(onVolumeChangeObserverIOS);
            }
        });

        Privacy.setupReportListener(privacy, vastAdUnit);

        return vastAdUnit;
    }

}
