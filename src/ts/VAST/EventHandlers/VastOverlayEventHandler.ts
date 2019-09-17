import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
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
import { InteractionType, ObstructionReasons, IViewPort, IAdView } from 'Ads/Views/OpenMeasurement/OMIDEventBridge';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { VastOpenMeasurementManager } from 'Ads/Views/OpenMeasurement/OpenMeasurementManager';

export class VastOverlayEventHandler extends OverlayEventHandler<VastCampaign> {
    private _platform: Platform;
    private _core: ICoreApi;
    private _vastAdUnit: VastAdUnit;
    private _request: RequestManager;
    private _vastCampaign: VastCampaign;
    private _moat?: MOAT;
    private _vastOverlay?: AbstractVideoOverlay;
    private _gameSessionId?: number;
    private _abGroup: ABGroup;
    private _om?: VastOpenMeasurementManager;
    private _deviceInfo: DeviceInfo;

    private _viewPort: IViewPort;
    private _obstructedAdView: IAdView;
    private _unObstructedAdView: IAdView;

    constructor(adUnit: VastAdUnit, parameters: IAdUnitParameters<VastCampaign>) {
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
        this._om = this._vastAdUnit.getOpenMeasurementManager();
        this._deviceInfo = parameters.deviceInfo;
    }

    public onShowPrivacyPopUp(x: number, y: number, width: number, height: number): Promise<void> {

        if (this._om) {
            // if obstruction already calculated
            if (this._viewPort && this._obstructedAdView) {
                this._om.geometryChange(this._viewPort, this._obstructedAdView);
                return Promise.resolve();
            }

            return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight(), this._vastAdUnit.getVideoViewRectangle()]).then(([screenWidth, screenHeight, rectangle]) => {
                if (this._om) {

                    // TODO: Move to internal function
                    this._viewPort = OpenMeasurementUtilities.calculateViewPort(screenWidth, screenHeight);
                    let obstructionRectangle = OpenMeasurementUtilities.createRectangle(x, y, width, height);

                    if (this._platform === Platform.ANDROID) {
                        const screenDensity = OpenMeasurementUtilities.getScreenDensity(this._platform, this._deviceInfo);
                        const adjustedx = OpenMeasurementUtilities.getAndroidViewSize(x, screenDensity);
                        const adjustedy = OpenMeasurementUtilities.getAndroidViewSize(y, screenDensity);
                        const adjustedwidth = OpenMeasurementUtilities.getAndroidViewSize(width, screenDensity);
                        const adjustedheight = OpenMeasurementUtilities.getAndroidViewSize(height, screenDensity);
                        obstructionRectangle = OpenMeasurementUtilities.createRectangle(adjustedx, adjustedy, adjustedwidth, adjustedheight);
                    }

                    const screenView = OpenMeasurementUtilities.createRectangle(0, 0, screenWidth, screenHeight);
                    const videoView = OpenMeasurementUtilities.createRectangle(rectangle[0], rectangle[1], rectangle[2], rectangle[3]);
                    const obstructionReasons: ObstructionReasons[] = [];

                    if (OpenMeasurementUtilities.calculateObstructionOverlapPercentage(videoView, screenView) < 100) {
                        obstructionReasons.push(ObstructionReasons.HIDDEN);
                    }

                    const percentInView = OpenMeasurementUtilities.calculatePercentageInView(videoView, obstructionRectangle, screenView);
                    obstructionReasons.push(ObstructionReasons.OBSTRUCTED);

                    this._obstructedAdView = OpenMeasurementUtilities.calculateVastAdView(percentInView, obstructionReasons, screenWidth, screenHeight, true, [obstructionRectangle]);
                    this._om.geometryChange(this._viewPort, this._obstructedAdView);
                }
            });
        }

        return super.onShowPrivacyPopUp(x, y, width, height);
    }

    public onClosePrivacyPopUp(): Promise<void> {

        if (this._om) {
            // if obstruction already calculated
            if (this._viewPort && this._unObstructedAdView) {
                this._om.geometryChange(this._viewPort, this._unObstructedAdView);
                return Promise.resolve();
            }

            return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight(), this._vastAdUnit.getVideoViewRectangle()]).then(([width, height, rectangle]) => {
                if (this._om) {

                    // TODO: Move to internal function
                    const screenView = OpenMeasurementUtilities.createRectangle(0, 0, width, height);
                    const videoView = OpenMeasurementUtilities.createRectangle(rectangle[0], rectangle[1], rectangle[2], rectangle[3]);

                    const percentInView = OpenMeasurementUtilities.calculateObstructionOverlapPercentage(videoView, screenView);
                    const obstructionReasons: ObstructionReasons[] = [];
                    if (percentInView < 100) {
                        obstructionReasons.push(ObstructionReasons.HIDDEN);
                    }

                    this._viewPort = OpenMeasurementUtilities.calculateViewPort(width, height);
                    this._unObstructedAdView = OpenMeasurementUtilities.calculateVastAdView(percentInView, obstructionReasons, width, height, true, []);
                    this._om.geometryChange(this._viewPort, this._unObstructedAdView);
                }
            });
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

        const clickThroughURL = this._vastAdUnit.getVideoClickThroughURL();
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
