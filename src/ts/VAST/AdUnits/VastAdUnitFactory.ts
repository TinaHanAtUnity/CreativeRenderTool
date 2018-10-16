import { AbstractAdUnitFactory } from '../../Ads/AdUnits/AbstractAdUnitFactory';
import { IAdUnitParameters } from '../../Ads/AdUnits/AbstractAdUnit';
import { VastCampaign } from '../Models/VastCampaign';
import { IVastAdUnitParameters, VastAdUnit } from './VastAdUnit';
import { IVastEndscreenParameters, VastEndScreen } from '../Views/VastEndScreen';
import { MoatViewabilityService } from '../../Ads/Utilities/MoatViewabilityService';
import { VastEndScreenEventHandler } from '../EventHandlers/VastEndScreenEventHandler';
import { Platform } from '../../Core/Constants/Platform';
import { VastOverlayEventHandler } from '../EventHandlers/VastOverlayEventHandler';
import { VastVideoEventHandler } from '../EventHandlers/VastVideoEventHandler';
import { IVideoEventHandlerParams } from '../../Ads/EventHandlers/BaseVideoEventHandler';
import { IObserver2, IObserver3 } from '../../Core/Utilities/IObserver';
import { StreamType } from '../../Core/Constants/Android/StreamType';
import { Privacy } from '../../Ads/Views/Privacy';

export class VastAdUnitFactory extends AbstractAdUnitFactory {

    public static ContentType = 'programmatic/vast';

    public canCreateAdUnit(contentType: string): boolean {
        return contentType === VastAdUnitFactory.ContentType;
    }

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
