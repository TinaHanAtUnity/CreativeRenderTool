import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { Platform } from 'Core/Constants/Platform';
import { ClickDiagnostics } from 'Ads/Utilities/ClickDiagnostics';
import { Url } from 'Core/Utilities/Url';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { ObstructionReasons, InteractionType } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
export class VastOverlayEventHandler extends OverlayEventHandler {
    constructor(adUnit, parameters) {
        super(adUnit, parameters);
        this._platform = parameters.platform;
        this._core = parameters.core;
        this._vastAdUnit = adUnit;
        this._request = parameters.request;
        this._vastCampaign = parameters.campaign;
        this._placement = parameters.placement;
        this._moat = MoatViewabilityService.getMoat();
        this._vastOverlay = this._vastAdUnit.getOverlay();
        this._gameSessionId = parameters.gameSessionId;
        this._abGroup = parameters.coreConfig.getAbGroup();
        this._om = this._vastAdUnit.getOpenMeasurementController();
        this._deviceInfo = parameters.deviceInfo;
    }
    onShowPrivacyPopUp(x, y, width, height) {
        if (this._om) {
            const obstructionRectangle = OpenMeasurementUtilities.createRectangle(x, y, width, height);
            const adViewBuilder = this._om.getOMAdViewBuilder();
            const adView = adViewBuilder.buildVastAdView([ObstructionReasons.OBSTRUCTED], obstructionRectangle);
            const viewPort = adViewBuilder.getViewPort();
            this._om.geometryChange(viewPort, adView);
        }
        return super.onShowPrivacyPopUp(x, y, width, height);
    }
    onClosePrivacyPopUp() {
        if (this._om) {
            const adViewBuilder = this._om.getOMAdViewBuilder();
            const adView = adViewBuilder.buildVastAdView([]);
            const viewPort = adViewBuilder.getViewPort();
            this._om.geometryChange(viewPort, adView);
        }
        return super.onClosePrivacyPopUp();
    }
    onOverlaySkip(position) {
        if (this._placement.skipEndCardOnClose()) {
            super.onOverlayClose();
        }
        else {
            super.onOverlaySkip(position);
            const endScreen = this._vastAdUnit.getEndScreen();
            if (endScreen && this._vastAdUnit.hasImpressionOccurred()) {
                endScreen.show();
                this._vastAdUnit.onFinish.trigger();
            }
            else {
                this._vastAdUnit.hide();
            }
        }
        if (this._om) {
            this._om.skipped();
            this._om.sessionFinish();
        }
    }
    onOverlayMute(isMuted) {
        super.onOverlayMute(isMuted);
        if (isMuted) {
            this._vastAdUnit.setVideoPlayerMuted(true);
            if (this._moat) {
                this._moat.setPlayerVolume(0);
                this._moat.volumeChange(this._vastAdUnit.getVolume());
            }
            if (this._om) {
                this._om.setDeviceVolume(this._vastAdUnit.getVolume());
                this._om.volumeChange(0);
            }
            this._vastAdUnit.sendTrackingEvent(TrackingEvent.MUTE);
        }
        else {
            this._vastAdUnit.setVideoPlayerMuted(false);
            if (this._moat) {
                this._moat.setPlayerVolume(1);
                this._moat.volumeChange(this._vastAdUnit.getVolume());
            }
            if (this._om) {
                this._om.setDeviceVolume(this._vastAdUnit.getVolume());
                this._om.volumeChange(1);
            }
            this._vastAdUnit.sendTrackingEvent(TrackingEvent.UNMUTE);
        }
    }
    onOverlayCallButton() {
        super.onOverlayCallButton();
        this.setCallButtonEnabled(false);
        this._ads.Listener.sendClickEvent(this._placement.getId());
        if (this._om) {
            this._om.adUserInteraction(InteractionType.CLICK);
        }
        const clickThroughURL = this.getClickThroughURL();
        if (clickThroughURL) {
            const useWebViewUserAgentForTracking = this._vastCampaign.getUseWebViewUserAgentForTracking();
            const ctaClickedTime = Date.now();
            const redirectBreakers = Url.getAppStoreUrlTemplates(this._platform);
            return this._request.followRedirectChain(clickThroughURL, useWebViewUserAgentForTracking, redirectBreakers).catch(() => {
                return clickThroughURL;
            }).then((storeUrl) => {
                return this.openUrlOnCallButton(storeUrl, Date.now() - ctaClickedTime, clickThroughURL);
            });
        }
        else {
            return Promise.reject(new Error('No clickThroughURL was defined'));
        }
    }
    getClickThroughURL() {
        return this._vastAdUnit.getVideoClickThroughURL();
    }
    openUrlOnCallButton(url, clickDuration, clickUrl) {
        return this.openUrl(url).then(() => {
            this.setCallButtonEnabled(true);
            this._vastAdUnit.sendVideoClickTrackingEvent(this._vastCampaign.getSession().getId());
            ClickDiagnostics.sendClickDiagnosticsEvent(clickDuration, clickUrl, 'vast_overlay', this._vastCampaign, this._abGroup.valueOf(), this._gameSessionId);
        }).catch(() => {
            this.setCallButtonEnabled(true);
        });
    }
    openUrl(url) {
        if (this._platform === Platform.IOS) {
            return this._core.iOS.UrlScheme.open(url);
        }
        else {
            return this._core.Android.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }
    setCallButtonEnabled(enabled) {
        if (this._vastOverlay) {
            this._vastOverlay.setCallButtonEnabled(enabled);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdE92ZXJsYXlFdmVudEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVkFTVC9FdmVudEhhbmRsZXJzL1Zhc3RPdmVybGF5RXZlbnRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBRzlFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQU1uRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNsRSxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDekMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBRTlGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxlQUFlLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUd6RyxNQUFNLE9BQU8sdUJBQXdCLFNBQVEsbUJBQWlDO0lBYTFFLFlBQVksTUFBa0IsRUFBRSxVQUFnRDtRQUM1RSxLQUFLLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRTFCLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUNyQyxJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDN0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7UUFDMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQ25DLElBQUksQ0FBQyxhQUFhLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUN6QyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENB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