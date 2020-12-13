import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { Observable0 } from 'Core/Utilities/Observable';
import { Template } from 'Core/Utilities/Template';
import MRAIDTemplate from 'html/MRAID.html';
import MRAIDPerfContainer from 'html/mraid/container-perf.html';
import MRAIDContainer from 'html/mraid/container.html';
import { MRAIDView } from 'MRAID/Views/MRAIDView';
import { MRAIDIFrameEventAdapter } from 'MRAID/EventBridge/MRAIDIFrameEventAdapter';
import { Localization } from 'Core/Utilities/Localization';
import { MacroUtil } from 'Ads/Utilities/MacroUtil';
export class MRAID extends MRAIDView {
    constructor(platform, core, deviceInfo, placement, campaign, privacy, showGDPRBanner, abGroup, gameSessionId, hidePrivcy = false) {
        super(platform, core, deviceInfo, 'mraid', placement, campaign, privacy, showGDPRBanner, abGroup, hidePrivcy, gameSessionId);
        this.onLoaded = new Observable0();
        this._domContentLoaded = false;
        this._deviceInfo = deviceInfo;
        this._placement = placement;
        this._campaign = campaign;
        this._creativeId = campaign.getCreativeId();
        this._localization = new Localization(deviceInfo.getLanguage(), 'mraid');
        this._template = new Template(MRAIDTemplate, this._localization);
    }
    render() {
        super.render();
        this.loadIframe();
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
        if (this._canSkip && !this._canClose) {
            this._handlers.forEach(handler => handler.onMraidSkip());
            this.sendMraidAnalyticsEvent('playable_skip');
        }
        else if (this._canClose) {
            this._handlers.forEach(handler => handler.onMraidClose());
            this.sendMraidAnalyticsEvent('playable_close');
        }
    }
    loadIframe() {
        const iframe = this._iframe = this._container.querySelector('#mraid-iframe');
        this._mraidAdapterContainer.connect(new MRAIDIFrameEventAdapter(this._core, this._mraidAdapterContainer, iframe));
        let originalUrl = 'none';
        const htmlResource = this._campaign.getResourceUrl();
        if (htmlResource) {
            originalUrl = htmlResource.getOriginalUrl();
        }
        this.createMRAID(this._gameSessionId % 1000 === 999 ? MRAIDPerfContainer : MacroUtil.replaceMacro(MRAIDContainer, { '{{ CREATIVE_URL }}': originalUrl })).then(mraid => {
            this._core.Sdk.logDebug('setting iframe srcdoc (' + mraid.length + ')');
            SdkStats.setFrameSetStartTimestamp(this._placement.getId());
            this._core.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' set iframe.src started ' + SdkStats.getFrameSetStartTimestamp(this._placement.getId()));
            iframe.srcdoc = mraid;
            if (CustomFeatures.isNestedIframePlayable(this._creativeId)) {
                iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
            }
        }).catch((e) => {
            this._core.Sdk.logError('failed to create mraid: ' + e.message);
            SessionDiagnostics.trigger('create_mraid_error', {
                message: e.message
            }, this._campaign.getSession());
        });
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
        if (!this._callButtonEnabled) {
            return;
        }
        this._handlers.forEach(handler => handler.onMraidClick(url));
    }
    sendCustomImpression() {
        if (CustomFeatures.isLoopMeSeat(this._campaign.getSeatId())) {
            this._handlers.forEach(handler => handler.onCustomImpressionEvent());
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSUQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvTVJBSUQvVmlld3MvTVJBSUQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQU90RSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sYUFBYSxNQUFNLGlCQUFpQixDQUFDO0FBQzVDLE9BQU8sa0JBQWtCLE1BQU0sZ0NBQWdDLENBQUM7QUFDaEUsT0FBTyxjQUFjLE1BQU0sMkJBQTJCLENBQUM7QUFFdkQsT0FBTyxFQUFxQixTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUVyRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUNwRixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDM0QsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRXBELE1BQU0sT0FBTyxLQUFNLFNBQVEsU0FBNEI7SUFVbkQsWUFBWSxRQUFrQixFQUFFLElBQWMsRUFBRSxVQUFzQixFQUFFLFNBQW9CLEVBQUUsUUFBdUIsRUFBRSxPQUF3QixFQUFFLGNBQXVCLEVBQUUsT0FBZ0IsRUFBRSxhQUFzQixFQUFFLGFBQXNCLEtBQUs7UUFDM08sS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FB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