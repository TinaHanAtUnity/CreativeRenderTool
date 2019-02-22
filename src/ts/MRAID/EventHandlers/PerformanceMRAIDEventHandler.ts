import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { MRAIDEventHandler } from 'MRAID/EventHandlers/MRAIDEventHandler';
import { IMRAIDViewHandler } from 'MRAID/Views/MRAIDView';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { RequestError } from 'Core/Errors/RequestError';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { ClickDiagnostics } from 'Ads/Utilities/ClickDiagnostics';
import { CTAClickHandlingTest } from 'Core/Models/ABGroup';
import { Url } from 'Core/Utilities/Url';

export class PerformanceMRAIDEventHandler extends MRAIDEventHandler implements IMRAIDViewHandler {

    public onMraidClick(url: string): Promise<void> {
        super.onMraidClick(url);

        this.sendTrackingEvents();

        const ctaClickedTime = Date.now();
        if (this._campaign.getClickAttributionUrl()) {
            this.handleClickAttribution();
            if (!this._campaign.getClickAttributionUrlFollowsRedirects()) {
                const redirectBreakers = CTAClickHandlingTest.isValid(this._abGroup) ? Url.getAppStoreUrlTemplates(this._platform) : [];
                return this._request.followRedirectChain(url, this._campaign.getUseWebViewUserAgentForTracking(), redirectBreakers).catch(() => {
                    return url;
                }).then((storeUrl) => {
                    return this.openUrlOnCallButton(storeUrl, Date.now() - ctaClickedTime, url);
                });
            }
        } else {
            return this.openUrlOnCallButton(url, Date.now() - ctaClickedTime, url);
        }
        return Promise.resolve();
    }

    public onPlayableAnalyticsEvent(timeFromShow: number, timeFromPlayableStart: number, backgroundTime: number, event: string, eventData: unknown): void {
        const kafkaObject: { [key: string]: unknown } = {};
        kafkaObject.type = event;
        kafkaObject.eventData = eventData;
        kafkaObject.timeFromShow = timeFromShow;
        kafkaObject.timeFromPlayableStart = timeFromPlayableStart;
        kafkaObject.backgroundTime = backgroundTime;

        const resourceUrl = this._campaign.getResourceUrl();
        if (resourceUrl) {
            kafkaObject.url = resourceUrl.getOriginalUrl();
        }

        kafkaObject.auctionId = this._campaign.getSession().getId();
        kafkaObject.abGroup = this._coreConfig.getAbGroup();

        HttpKafka.sendEvent('ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }

    private handleClickAttribution() {
        const clickAttributionUrl = this._campaign.getClickAttributionUrl();
        if (this._campaign.getClickAttributionUrlFollowsRedirects() && clickAttributionUrl) {
            this._thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, true, this._campaign.getUseWebViewUserAgentForTracking()).then(response => {
                const location = RequestManager.getHeader(response.headers, 'location');
                if (location) {
                    this.openUrl(location);
                } else {
                    Diagnostics.trigger('mraid_click_attribution_misconfigured', {
                        url: this._campaign.getClickAttributionUrl(),
                        followsRedirects: this._campaign.getClickAttributionUrlFollowsRedirects(),
                        response: response
                    });
                }
            }).catch(error => {
                if (error instanceof RequestError) {
                    error = new DiagnosticError(new Error(error.message), {
                        request: error.nativeRequest,
                        auctionId: this._campaign.getSession().getId(),
                        url: this._campaign.getClickAttributionUrl(),
                        response: error.nativeResponse
                    });
                }
                Diagnostics.trigger('mraid_click_attribution_failed', error);
            });
        } else {
            if (clickAttributionUrl) {
                this._thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, false, this._campaign.getUseWebViewUserAgentForTracking());
            }
        }
    }

    private openUrlOnCallButton(url: string, clickDuration: number, clickUrl: string): Promise<void> {
        return this.openUrl(url).then(() => {
            ClickDiagnostics.sendClickDiagnosticsEvent(clickDuration, clickUrl, 'performance_mraid', this._campaign, this._abGroup.valueOf(), this._gameSessionId);
        });
    }

}
