import { SdkStats } from 'Ads/Utilities/SdkStats';
import { Platform } from 'Core/Constants/Platform';
import { Observable0 } from 'Core/Utilities/Observable';
import { Template } from 'Core/Utilities/Template';
import MRAIDTemplate from 'html/MRAID.html';
import MRAIDContainer from 'html/mraid/container-webplayer.html';
import { MRAIDView } from 'MRAID/Views/MRAIDView';
import { MRAIDWebPlayerEventAdapter } from 'MRAID/EventBridge/MRAIDWebPlayerEventAdapter';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { JaegerSpan } from 'Core/Jaeger/JaegerSpan';
import { ProgrammaticMRAIDEventHandler } from 'MRAID/EventHandlers/ProgrammaticMRAIDEventHandler';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
export class WebPlayerMRAID extends MRAIDView {
    constructor(platform, core, deviceInfo, placement, campaign, privacy, showGDPRBanner, abGroup, gameSessionId, hidePrivacy = false) {
        super(platform, core, deviceInfo, 'webplayer-mraid', placement, campaign, privacy, showGDPRBanner, abGroup, hidePrivacy, gameSessionId);
        this.onLoaded = new Observable0();
        this._domContentLoaded = false;
        this._deviceInfo = deviceInfo;
        this._placement = placement;
        this._campaign = campaign;
        this._jaegarSpan = new JaegerSpan('webplayer-mraid');
        this._template = new Template(MRAIDTemplate);
    }
    show() {
        super.show();
        this._showTimestamp = Date.now();
        this.sendMraidAnalyticsEvent('playable_show');
        this.prepareProgressCircle();
        if (this._domContentLoaded) {
            this.setViewableState(true);
            this.sendCustomImpression();
        }
        else {
            const observer = this.onLoaded.subscribe(() => {
                this.setViewableState(true);
                this.sendCustomImpression();
                this.onLoaded.unsubscribe(observer);
            });
        }
    }
    hide() {
        super.hide();
        this._mraidAdapterContainer.disconnect();
    }
    setViewableState(viewable) {
        if (this._domContentLoaded) {
            this._mraidAdapterContainer.sendViewableEvent(viewable);
        }
        this.setAnalyticsBackgroundTime(viewable);
    }
    loadWebPlayer(webPlayerContainer) {
        this._isLoaded = true;
        this._mraidAdapterContainer.connect(new MRAIDWebPlayerEventAdapter(this._core, this._mraidAdapterContainer, webPlayerContainer));
        return this.createMRAID(MRAIDContainer).then(mraid => {
            this._core.Sdk.logDebug('setting webplayer srcdoc (' + mraid.length + ')');
            SdkStats.setFrameSetStartTimestamp(this._placement.getId());
            this._core.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' set webplayer data started ' + SdkStats.getFrameSetStartTimestamp(this._placement.getId()));
            mraid = this._platform === Platform.ANDROID ? encodeURIComponent(mraid) : mraid;
            return this.setWebPlayerContainerData(webPlayerContainer, mraid);
        }).catch((e) => {
            this._core.Sdk.logError('failed to create mraid: ' + e.message);
        });
    }
    onBridgeSendStats(totalTime, playTime, frameCount) {
        if (this._gameSessionId % 1000 === 999) {
            super.onBridgeSendStats(totalTime, playTime, frameCount);
        }
    }
    sendMraidAnalyticsEvent(eventName, eventData) {
        const timeFromShow = (Date.now() - this._showTimestamp - this._backgroundTime) / 1000;
        const backgroundTime = this._backgroundTime / 1000;
        const timeFromPlayableStart = this._playableStartTimestamp ? (Date.now() - this._playableStartTimestamp - this._backgroundTime) / 1000 : 0;
        if (this.isKPIDataValid({ timeFromShow, backgroundTime, timeFromPlayableStart }, 'mraid_' + eventName)) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, eventName, eventData));
        }
    }
    onCloseEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        this._jaegarSpan.addAnnotation('on X button close in WebPlayerView');
        this._jaegarSpan.stop();
        SessionDiagnostics.trigger('webplayer-mraid-trace', {
            spanData: this._jaegarSpan
        }, this._campaign.getSession());
        if (this._canSkip && !this._canClose) {
            this._handlers.forEach(handler => handler.onMraidSkip());
            this.sendMraidAnalyticsEvent('playable_skip');
        }
        else if (this._canClose) {
            this._handlers.forEach(handler => handler.onMraidClose());
            this.sendMraidAnalyticsEvent('playable_close');
        }
    }
    onLoadedEvent() {
        this._domContentLoaded = true;
        this.onLoaded.trigger();
        const frameLoadDuration = (Date.now() - SdkStats.getFrameSetStartTimestamp(this._placement.getId())) / 1000;
        this._core.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' iframe load duration ' + frameLoadDuration + ' s');
        if (this.isKPIDataValid({ frameLoadDuration }, 'mraid_playable_loading_time')) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(frameLoadDuration, 0, 0, 'playable_loading_time', {}));
        }
        this._playableStartTimestamp = Date.now();
        this.sendMraidAnalyticsEvent('playable_start');
    }
    onOpen(url) {
        this._jaegarSpan.addAnnotation(`onOpen from onBridgeOpen in WebPlayerView ${this._callButtonEnabled}`);
        if (!this._callButtonEnabled) {
            return;
        }
        this._handlers.forEach(handler => handler.onMraidClick(url));
    }
    onPrivacyClose() {
        if (this._privacy) {
            this._privacy.hide();
            // After Privacy screen is hidden, we need to reduce webview overlay size
            // to allow interactability on the webplayer
            this.reduceWebViewContainerHeight();
        }
    }
    onPrivacyEvent(event) {
        event.preventDefault();
        // Webview container must be full screened for users to interact with
        // the full screened Privacy Screen
        this.fullScreenWebViewContainer().then(() => {
            this._privacy.show();
        });
    }
    onGDPRPopupEvent(event) {
        event.preventDefault();
        this._gdprPopupClicked = true;
        // Webview container must be full screened for users to interact with
        // the full screened Privacy Screen
        this.fullScreenWebViewContainer().then(() => {
            this._privacy.show();
        });
    }
    onBridgeResizeWebview() {
        this.reduceWebViewContainerHeight();
    }
    onBridgeOpen(url) {
        this._jaegarSpan.addAnnotation('onBridgeOpen in WebPlayerView');
        super.onBridgeOpen(url);
    }
    onBridgeClose() {
        this._jaegarSpan.addAnnotation('onBridgeClose in WebPlayerView');
        this._jaegarSpan.stop();
        SessionDiagnostics.trigger('webplayer-mraid-trace', {
            spanData: this._jaegarSpan
        }, this._campaign.getSession());
        super.onBridgeClose();
    }
    addEventHandler(handler) {
        if (handler instanceof ProgrammaticMRAIDEventHandler) {
            handler.setJaegerSpan(this._jaegarSpan);
        }
        return super.addEventHandler(handler);
    }
    fullScreenWebViewContainer() {
        return this._handlers[0].onWebViewFullScreen();
    }
    reduceWebViewContainerHeight() {
        return this._handlers[0].onWebViewReduceSize();
    }
    setWebPlayerContainerData(webPlayerContainer, mraid) {
        if (this._platform === Platform.ANDROID) {
            return this.getMraidAsUrl(mraid).then((url) => {
                return webPlayerContainer.setUrl(`file://${url}`);
            });
        }
        else {
            return webPlayerContainer.setData(mraid, 'text/html', 'UTF-8');
        }
    }
    getMraidAsUrl(mraid) {
        mraid = this._platform === Platform.ANDROID ? decodeURIComponent(mraid) : mraid;
        return this._core.Cache.setFileContent('webPlayerMraid', 'UTF-8', mraid)
            .then(() => {
            return this._core.Cache.getFilePath('webPlayerMraid');
        });
    }
    sendCustomImpression() {
        if (CustomFeatures.isLoopMeSeat(this._campaign.getSeatId())) {
            this._handlers.forEach(handler => handler.onCustomImpressionEvent());
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ViUGxheWVyTVJBSUQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvTVJBSUQvVmlld3MvV2ViUGxheWVyTVJBSUQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRWxELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUduRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sYUFBYSxNQUFNLGlCQUFpQixDQUFDO0FBQzVDLE9BQU8sY0FBYyxNQUFNLHFDQUFxQyxDQUFDO0FBRWpFLE9BQU8sRUFBcUIsU0FBUyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFckUsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFFMUYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNwRCxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSxtREFBbUQsQ0FBQztBQUNsRyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUV0RSxNQUFNLE9BQU8sY0FBZSxTQUFRLFNBQTRCO0lBTTVELFlBQVksUUFBa0IsRUFBRSxJQUFjLEVBQUUsVUFBc0IsRUFBRSxTQUFvQixFQUFFLFFBQXVCLEVBQUUsT0FBd0IsRUFBRSxjQUF1QixFQUFFLE9BQWdCLEVBQUUsYUFBc0IsRUFBRSxjQUF1QixLQUFLO1FBQzVPLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsT0FB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