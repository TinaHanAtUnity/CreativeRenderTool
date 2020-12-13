import { SdkStats } from 'Ads/Utilities/SdkStats';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { Localization } from 'Core/Utilities/Localization';
import { Template } from 'Core/Utilities/Template';
import MRAIDPerfContainer from 'html/mraid/container-perf.html';
import MRAIDContainer from 'html/mraid/container.html';
import ExtendedMRAIDTemplate from 'html/ExtendedMRAID.html';
import { MRAIDView } from 'MRAID/Views/MRAIDView';
import { MRAIDIFrameEventAdapter } from 'MRAID/EventBridge/MRAIDIFrameEventAdapter';
import { MacroUtil } from 'Ads/Utilities/MacroUtil';
export class ExtendedMRAID extends MRAIDView {
    constructor(platform, core, deviceInfo, placement, campaign, privacy, showGDPRBanner, abGroup, gameSessionId, hidePrivacy = false) {
        super(platform, core, deviceInfo, 'extended-mraid', placement, campaign, privacy, showGDPRBanner, abGroup, hidePrivacy, gameSessionId);
        this._deviceInfo = deviceInfo;
        this._placement = placement;
        this._campaign = campaign;
        this._localization = new Localization(deviceInfo.getLanguage(), 'mraid');
        this._template = new Template(ExtendedMRAIDTemplate, this._localization);
        if (campaign) {
            this._templateData = {
                'gameName': campaign.getGameName()
            };
            const gameIcon = campaign.getGameIcon();
            if (gameIcon) {
                this._templateData.gameIcon = gameIcon.getUrl();
            }
            const rating = campaign.getRating();
            if (rating) {
                const adjustedRating = rating * 20;
                this._templateData.rating = adjustedRating.toString();
            }
            const ratingCount = campaign.getRatingCount();
            if (ratingCount) {
                this._templateData.ratingCount = this._localization.abbreviate(ratingCount);
            }
        }
    }
    render() {
        super.render();
        this._loadingScreen = this._container.querySelector('.loading-screen');
        this.loadIframe();
    }
    show() {
        super.show();
        this._showTimestamp = Date.now();
        this.sendMraidAnalyticsEvent('playable_show');
        this.showLoadingScreen();
    }
    hide() {
        if (this._loadingScreenTimeout) {
            clearTimeout(this._loadingScreenTimeout);
            this._loadingScreenTimeout = undefined;
        }
        if (this._prepareTimeout) {
            clearTimeout(this._prepareTimeout);
            this._prepareTimeout = undefined;
        }
        super.hide();
        this._mraidAdapterContainer.disconnect();
    }
    setViewableState(viewable) {
        if (this._isLoaded && !this._loadingScreenTimeout) {
            this._mraidAdapterContainer.sendViewableEvent(viewable);
        }
        this.setAnalyticsBackgroundTime(viewable);
    }
    loadIframe() {
        const iframe = this._iframe = this._container.querySelector('#mraid-iframe');
        this._mraidAdapterContainer.connect(new MRAIDIFrameEventAdapter(this._core, this._mraidAdapterContainer, iframe));
        const container = this.setUpMraidContainer();
        this.createMRAID(container).then(mraid => {
            iframe.onload = () => this.onIframeLoaded();
            SdkStats.setFrameSetStartTimestamp(this._placement.getId());
            this._core.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' set iframe.src started ' + SdkStats.getFrameSetStartTimestamp(this._placement.getId()));
            iframe.srcdoc = mraid;
        });
    }
    setUpMraidContainer() {
        let originalUrl = 'none';
        const htmlResource = this._campaign.getResourceUrl();
        if (htmlResource) {
            originalUrl = htmlResource.getOriginalUrl();
        }
        let container = this._gameSessionId % 1000 === 0 ? MRAIDPerfContainer : MacroUtil.replaceMacro(MRAIDContainer, { '{{ CREATIVE_URL }}': originalUrl });
        const playableConfiguration = this._campaign.getPlayableConfiguration();
        if (playableConfiguration) {
            // check configuration based on the ab group
            const groupKey = 'group' + this._abGroup;
            if (playableConfiguration[groupKey]) {
                this._configuration = playableConfiguration[groupKey];
            }
            else if (playableConfiguration.default) {
                this._configuration = playableConfiguration.default;
            }
            else {
                this._configuration = {};
            }
            container = container.replace('var playableConfiguration = {};', 'var playableConfiguration = ' + JSON.stringify(this._configuration) + ';');
        }
        return container;
    }
    onIframeLoaded() {
        this._isLoaded = true;
        if (!this._loadingScreenTimeout) {
            clearTimeout(this._prepareTimeout);
            this._prepareTimeout = undefined;
            this.showMRAIDAd();
        }
        const frameLoadDuration = (Date.now() - SdkStats.getFrameSetStartTimestamp(this._placement.getId())) / 1000;
        this._core.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' iframe load duration ' + frameLoadDuration + ' s');
        if (this.isKPIDataValid({ frameLoadDuration }, 'playable_mraid_playable_loading_time')) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(frameLoadDuration, 0, 0, 'playable_loading_time', {}));
        }
    }
    showLoadingScreen() {
        this._loadingScreen.style.display = 'block';
        this._loadingScreenTimeout = window.setTimeout(() => {
            if (this._isLoaded) {
                this.showMRAIDAd();
            }
            else {
                // start the prepare timeout and wait for the onload event
                this._prepareTimeout = window.setTimeout(() => {
                    this._canClose = true;
                    this._closeElement.style.opacity = '1';
                    this._closeElement.style.display = 'block';
                    this.updateProgressCircle(this._closeElement, 1);
                    const resourceUrl = this._campaign.getResourceUrl();
                    SessionDiagnostics.trigger('playable_prepare_timeout', {
                        'url': resourceUrl ? resourceUrl.getOriginalUrl() : ''
                    }, this._campaign.getSession());
                    this._prepareTimeout = undefined;
                }, 4500);
            }
            this._loadingScreenTimeout = undefined;
        }, 2500);
    }
    showMRAIDAd() {
        this.prepareProgressCircle();
        ['webkitTransitionEnd', 'transitionend'].forEach((e) => {
            if (this._loadingScreen.style.display === 'none') {
                return;
            }
            this._loadingScreen.addEventListener(e, () => {
                this._closeElement.style.display = 'block';
                this._playableStartTimestamp = Date.now();
                this.sendMraidAnalyticsEvent('playable_start');
                this._mraidAdapterContainer.sendViewableEvent(true);
                this._loadingScreen.style.display = 'none';
            }, false);
        });
        this._loadingScreen.classList.add('hidden');
    }
    onCloseEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        if (this._canSkip && !this._canClose) {
            this._handlers.forEach(handler => handler.onMraidSkip());
            this.sendMraidAnalyticsEvent('playable_skip');
        }
        else if (this._canClose) {
            this._handlers.forEach(handler => handler.onMraidClose());
            this.sendMraidAnalyticsEvent('playable_close');
        }
    }
    sendMraidAnalyticsEvent(eventName, eventData) {
        const timeFromShow = (Date.now() - this._showTimestamp - this._backgroundTime) / 1000;
        const backgroundTime = this._backgroundTime / 1000;
        const timeFromPlayableStart = this._playableStartTimestamp ? (Date.now() - this._playableStartTimestamp - this._backgroundTime) / 1000 : 0;
        if (this.isKPIDataValid({
            timeFromShow,
            backgroundTime,
            timeFromPlayableStart
        }, 'playable_mraid_' + eventName)) {
            this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, eventName, eventData));
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXh0ZW5kZWRNUkFJRC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9NUkFJRC9WaWV3cy9FeHRlbmRlZE1SQUlELnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUt0RSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDM0QsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sa0JBQWtCLE1BQU0sZ0NBQWdDLENBQUM7QUFDaEUsT0FBTyxjQUFjLE1BQU0sMkJBQTJCLENBQUM7QUFDdkQsT0FBTyxxQkFBcUIsTUFBTSx5QkFBeUIsQ0FBQztBQUM1RCxPQUFPLEVBQXFCLFNBQVMsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBR3JFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQ3BGLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVwRCxNQUFNLE9BQU8sYUFBYyxTQUFRLFNBQTRCO0lBYTNELFlBQVksUUFBa0IsRUFBRSxJQUFjLEVBQUUsVUFBc0IsRUFBRSxTQUFvQixFQUFFLFFBQWtDLEVBQUUsT0FBd0IsRUFBRSxjQUF1QixFQUFFLE9BQWdCLEVBQUUsYUFBcUIsRUFBRSxjQUF1QixLQUFLO1FBQ3RQLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUV2SSxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUM5QixJQUFJLENBQUMsVUFBVSxHQUFHLFNB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