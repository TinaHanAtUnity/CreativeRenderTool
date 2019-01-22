import { Placement } from 'Ads/Models/Placement';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { ABGroup } from 'Core/Models/ABGroup';
import { Observable0 } from 'Core/Utilities/Observable';
import { Template } from 'Core/Utilities/Template';
import MRAIDTemplate from 'html/MRAID.html';
import MRAIDContainer from 'html/mraid/container-webplayer.html';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { IMRAIDViewHandler, MRAIDView } from 'MRAID/Views/MRAIDView';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { MRAIDWebPlayerEventAdapter } from 'MRAID/EventBridge/MRAIDWebPlayerEventAdapter';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';

export class WebPlayerMRAID extends MRAIDView<IMRAIDViewHandler> {

    private readonly onLoaded = new Observable0();
    private _domContentLoaded = false;

    constructor(platform: Platform, core: ICoreApi, deviceInfo: DeviceInfo, placement: Placement, campaign: MRAIDCampaign, privacy: AbstractPrivacy, showGDPRBanner: boolean, abGroup: ABGroup, gameSessionId?: number) {
        super(platform, core, deviceInfo, 'mraid', placement, campaign, privacy, showGDPRBanner, abGroup, gameSessionId);

        this._deviceInfo = deviceInfo;
        this._placement = placement;
        this._campaign = campaign;

        this._template = new Template(MRAIDTemplate);
    }

    public show(): void {
        super.show();
        this._showTimestamp = Date.now();
        this.sendMraidAnalyticsEvent('playable_show');

        this.prepareProgressCircle();

        if(this._domContentLoaded) {
            this.setViewableState(true);
            this.sendCustomImpression();
        } else {
            const observer = this.onLoaded.subscribe(() => {
                this.setViewableState(true);
                this.sendCustomImpression();

                this.onLoaded.unsubscribe(observer);
            });
        }
    }

    public hide() {
        super.hide();
        this._mraidAdapterContainer.disconnect();
    }

    public setViewableState(viewable: boolean) {
        if(this._domContentLoaded) {
            this._mraidAdapterContainer.sendViewableEvent(viewable);
        }
        this.setAnalyticsBackgroundTime(viewable);
    }

    public loadWebPlayer(webPlayerContainer: WebPlayerContainer): Promise<void> {
        this._isLoaded = true;
        this._mraidAdapterContainer.connect(new MRAIDWebPlayerEventAdapter(this._core, this._mraidAdapterContainer, webPlayerContainer));

        return this.createMRAID(MRAIDContainer).then(mraid => {
            this._core.Sdk.logDebug('setting webplayer srcdoc (' + mraid.length + ')');
            SdkStats.setFrameSetStartTimestamp(this._placement.getId());
            this._core.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' set webplayer data started ' + SdkStats.getFrameSetStartTimestamp(this._placement.getId()));
            mraid = this._platform === Platform.ANDROID ? encodeURIComponent(mraid) : mraid;

            return this.setWebPlayerContainerData(webPlayerContainer, mraid);
        }).catch(e => this._core.Sdk.logError('failed to create mraid: ' + e));
    }

    public onBridgeSendStats(totalTime: number, playTime: number, frameCount: number) {
        if (this._gameSessionId % 1000 === 999) {
            super.onBridgeSendStats(totalTime, playTime, frameCount);
        }
    }

    protected sendMraidAnalyticsEvent(eventName: string, eventData?: unknown) {
        const timeFromShow = (Date.now() - this._showTimestamp - this._backgroundTime) / 1000;
        const backgroundTime = this._backgroundTime / 1000;
        const timeFromPlayableStart = this._playableStartTimestamp ? (Date.now() - this._playableStartTimestamp - this._backgroundTime) / 1000 : 0;

        if (this.isKPIDataValid({timeFromShow, backgroundTime, timeFromPlayableStart}, 'mraid_' + eventName)) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, eventName, eventData));
        }
    }

    protected onCloseEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();

        if(this._canSkip && !this._canClose) {
            this._handlers.forEach(handler => handler.onMraidSkip());
            this.sendMraidAnalyticsEvent('playable_skip');
        } else if(this._canClose) {
            this._handlers.forEach(handler => handler.onMraidClose());
            this.sendMraidAnalyticsEvent('playable_close');
        }
    }

    protected onLoadedEvent(): void {
        this._domContentLoaded = true;
        this.onLoaded.trigger();

        const frameLoadDuration = (Date.now() - SdkStats.getFrameSetStartTimestamp(this._placement.getId())) / 1000;
        this._core.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' iframe load duration ' + frameLoadDuration + ' s');

        if (this.isKPIDataValid({frameLoadDuration}, 'mraid_playable_loading_time')) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(frameLoadDuration, 0, 0, 'playable_loading_time', {}));
        }

        this._playableStartTimestamp = Date.now();
        this.sendMraidAnalyticsEvent('playable_start');
    }

    protected onOpen(url: string) {
        if (!this._callButtonEnabled) {
            return;
        }
        this._handlers.forEach(handler => handler.onMraidClick(url));
    }

    public onPrivacyClose(): void {
        if (this._privacy) {
            this._privacy.hide();

            // After Privacy screen is hidden, we need to reduce webview overlay size
            // to allow interactability on the webplayer
            this.reduceWebViewContainerHeight();
        }
    }

    protected onPrivacyEvent(event: Event): void {
        event.preventDefault();

        // Webview container must be full screened for users to interact with
        // the full screened Privacy Screen
        this.fullScreenWebViewContainer().then(() => {
            this._privacy.show();
        });

    }

    protected onGDPRPopupEvent(event: Event) {
        event.preventDefault();
        this._gdprPopupClicked = true;

        // Webview container must be full screened for users to interact with
        // the full screened Privacy Screen
        this.fullScreenWebViewContainer().then(() => {
            this._privacy.show();
        });
    }

    private setWebPlayerContainerData(webPlayerContainer: WebPlayerContainer, mraid: string): Promise<void> {
        if (this._platform === Platform.ANDROID) {
            return this.getMraidAsUrl(mraid).then((url) => {
                return webPlayerContainer.setUrl(`file://${url}`);
            });
        } else {
            return webPlayerContainer.setData(mraid, 'text/html', 'UTF-8');
        }
    }

    private getMraidAsUrl(mraid: string): Promise<string> {
        mraid = this._platform === Platform.ANDROID ? decodeURIComponent(mraid) : mraid;

        return this._core.Cache.setFileContent('webPlayerMraid', 'UTF-8', mraid)
        .then(() => {
            return this._core.Cache.getFilePath('webPlayerMraid');
        });
    }

    private sendCustomImpression() {
        if (CustomFeatures.isLoopMeSeat(this._campaign.getSeatId())) {
            this._handlers.forEach(handler => handler.onCustomImpressionEvent());
        }
    }
}
