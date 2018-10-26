import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { Privacy } from 'Ads/Views/Privacy';
import { StreamType } from 'Core/Constants/Android/StreamType';
import { Platform } from 'Core/Constants/Platform';
import { IObserver2, IObserver3 } from 'Core/Utilities/IObserver';
import { IVastAdUnitParameters, VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { VastEndScreenEventHandler } from 'VAST/EventHandlers/VastEndScreenEventHandler';
import { VastOverlayEventHandler } from 'VAST/EventHandlers/VastOverlayEventHandler';
import { VastVideoEventHandler } from 'VAST/EventHandlers/VastVideoEventHandler';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { IVastEndscreenParameters, VastEndScreen } from 'VAST/Views/VastEndScreen';

export class VastAdUnitFactory extends AbstractAdUnitFactory {

    public createAdUnit(parameters: IAdUnitParameters<VastCampaign>): VastAdUnit {
        const privacy = this.createPrivacy(parameters);
        const showPrivacyDuringVideo = !parameters.campaign.hasEndscreen() || this.showGDPRBanner(parameters);
        const overlay = this.createOverlay(parameters, privacy, showPrivacyDuringVideo);
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

            vastEndScreen = new VastEndScreen(parameters.platform, vastEndscreenParameters, privacy);
            vastAdUnitParameters.endScreen = vastEndScreen;
        }

        const hasAdvertiserDomain = parameters.campaign.getAdvertiserDomain() !== undefined;
        if (hasAdvertiserDomain && parameters.campaign.isMoatEnabled()) {
            MoatViewabilityService.initMoat(parameters.platform, parameters.core, parameters.campaign, parameters.clientInfo, parameters.placement, parameters.deviceInfo, parameters.coreConfig);
        }

        const vastAdUnit = new VastAdUnit(vastAdUnitParameters);

        if(parameters.campaign.hasEndscreen() && vastEndScreen) {
            const vastEndScreenHandler = new VastEndScreenEventHandler(vastAdUnit, vastAdUnitParameters);
            vastEndScreen.addEventHandler(vastEndScreenHandler);

            if (parameters.platform === Platform.ANDROID) {
                const onBackKeyObserver = parameters.ads.Android!.AdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => vastEndScreenHandler.onKeyEvent(keyCode));
                vastAdUnit.onClose.subscribe(() => {
                    parameters.ads.Android!.AdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
                });
            }
        }

        const vastOverlayHandler = new VastOverlayEventHandler(vastAdUnit, vastAdUnitParameters);
        overlay.addEventHandler(vastOverlayHandler);

        const videoEventHandlerParams = this.getVideoEventHandlerParams(vastAdUnit, parameters.campaign.getVideo(), undefined, vastAdUnitParameters);
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

        Privacy.setupReportListener(privacy, vastAdUnit);

        return vastAdUnit;
    }

}
