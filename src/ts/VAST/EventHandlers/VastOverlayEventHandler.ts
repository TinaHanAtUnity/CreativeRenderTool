import { IVideoAdUnitParameters } from 'Ads/AdUnits/VideoAdUnit';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { MOAT } from 'Ads/Views/MOAT';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { ABGroup } from 'Core/Models/ABGroup';
import { ClickDiagnostics } from 'Ads/Utilities/ClickDiagnostics';
import { Url } from 'Core/Utilities/Url';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
import { ObstructionReasons, InteractionType } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

export class VastOverlayEventHandler extends OverlayEventHandler<VastCampaign> {
    private _platform: Platform;
    private _core: ICoreApi;
    private _vastAdUnit: VastAdUnit;
    private _request: RequestManager;
    private _vastCampaign: VastCampaign;
    private _moat?: MOAT;
    protected _vastOverlay?: AbstractVideoOverlay;
    private _gameSessionId?: number;
    private _abGroup: ABGroup;
    private _om?: VastOpenMeasurementController;
    private _deviceInfo: DeviceInfo;

    constructor(adUnit: VastAdUnit, parameters: IVideoAdUnitParameters<VastCampaign>) {
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

    public onShowPrivacyPopUp(x: number, y: number, width: number, height: number): Promise<void> {
        if (this._om) {

            const obstructionRectangle = OpenMeasurementUtilities.createRectangle(x, y, width, height);
            const adViewBuilder = this._om.getOMAdViewBuilder();
            const adView = adViewBuilder.buildVastAdView([ObstructionReasons.OBSTRUCTED], obstructionRectangle);
            const viewPort = adViewBuilder.getViewPort();
            this._om.geometryChange(viewPort, adView);
        }

        return super.onShowPrivacyPopUp(x, y, width, height);
    }

    public onClosePrivacyPopUp(): Promise<void> {
        if (this._om) {
            const adViewBuilder = this._om.getOMAdViewBuilder();
            const adView = adViewBuilder.buildVastAdView([]);
            const viewPort = adViewBuilder.getViewPort();
            this._om.geometryChange(viewPort, adView);
        }

        return super.onClosePrivacyPopUp();
    }

    public onOverlaySkip(position: number): void {
        if (this._placement.skipEndCardOnClose()) {
            super.onOverlayClose();
        } else {
            super.onOverlaySkip(position);

            const endScreen = this._vastAdUnit.getEndScreen();
            if (endScreen && this._vastAdUnit.hasImpressionOccurred()) {
                endScreen.show();
                this._vastAdUnit.onFinish.trigger();
            } else {
                this._vastAdUnit.hide();
            }
        }

        if (this._om) {
            this._om.skipped();
            this._om.sessionFinish();
        }
    }

    public onOverlayMute(isMuted: boolean): void {
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
        } else {
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

    public onOverlayCallButton(): Promise<void> {
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
            }).then((storeUrl: string) => {
                return this.openUrlOnCallButton(storeUrl, Date.now() - ctaClickedTime, clickThroughURL);
            });
        } else {
            return Promise.reject(new Error('No clickThroughURL was defined'));
        }
    }

    protected getClickThroughURL(): string | null {
        return this._vastAdUnit.getVideoClickThroughURL();
    }

    private openUrlOnCallButton(url: string, clickDuration: number, clickUrl: string): Promise<void> {
        return this.openUrl(url).then(() => {
            this.setCallButtonEnabled(true);
            this._vastAdUnit.sendVideoClickTrackingEvent(this._vastCampaign.getSession().getId());

            ClickDiagnostics.sendClickDiagnosticsEvent(clickDuration, clickUrl, 'vast_overlay', this._vastCampaign, this._abGroup.valueOf(), this._gameSessionId!);
        }).catch(() => {
            this.setCallButtonEnabled(true);
        });
    }

    private openUrl(url: string): Promise<void> {
        if (this._platform === Platform.IOS) {
            return this._core.iOS!.UrlScheme.open(url);
        } else {
            return this._core.Android!.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }

    private setCallButtonEnabled(enabled: boolean): void {
        if (this._vastOverlay) {
            this._vastOverlay.setCallButtonEnabled(enabled);
        }
    }
}
