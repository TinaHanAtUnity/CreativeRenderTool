import { MRAIDEventHandler } from 'MRAID/EventHandlers/MRAIDEventHandler';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { RequestError } from 'Core/Errors/RequestError';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { ClickDiagnostics } from 'Ads/Utilities/ClickDiagnostics';
import { Url } from 'Core/Utilities/Url';
export class PerformanceMRAIDEventHandler extends MRAIDEventHandler {
    onMraidClick(url) {
        super.onMraidClick(url);
        this.sendTrackingEvents();
        const ctaClickedTime = Date.now();
        if (this._campaign.getClickAttributionUrl()) {
            this.handleClickAttribution();
            if (!this._campaign.getClickAttributionUrlFollowsRedirects()) {
                const redirectBreakers = Url.getAppStoreUrlTemplates(this._platform);
                return this._request.followRedirectChain(url, this._campaign.getUseWebViewUserAgentForTracking(), redirectBreakers).catch(() => {
                    return url;
                }).then((storeUrl) => {
                    return this.openUrlOnCallButton(storeUrl, Date.now() - ctaClickedTime, url);
                });
            }
        }
        else {
            return this.openUrlOnCallButton(url, Date.now() - ctaClickedTime, url);
        }
        return Promise.resolve();
    }
    handleClickAttribution() {
        const clickAttributionUrl = this._campaign.getClickAttributionUrl();
        if (this._campaign.getClickAttributionUrlFollowsRedirects() && clickAttributionUrl) {
            this._thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, true, this._campaign.getUseWebViewUserAgentForTracking()).then(response => {
                const location = RequestManager.getHeader(response.headers, 'location');
                if (location) {
                    this.openUrl(location);
                }
                else {
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
        }
        else {
            if (clickAttributionUrl) {
                this._thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, false, this._campaign.getUseWebViewUserAgentForTracking());
            }
        }
    }
    openUrlOnCallButton(url, clickDuration, clickUrl) {
        return this.openUrl(url).then(() => {
            ClickDiagnostics.sendClickDiagnosticsEvent(clickDuration, clickUrl, 'performance_mraid', this._campaign, this._abGroup.valueOf(), this._gameSessionId);
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyZm9ybWFuY2VNUkFJREV2ZW50SGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9NUkFJRC9FdmVudEhhbmRsZXJzL1BlcmZvcm1hbmNlTVJBSURFdmVudEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFFMUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzlELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ2xFLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUV6QyxNQUFNLE9BQU8sNEJBQTZCLFNBQVEsaUJBQWlCO0lBRXhELFlBQVksQ0FBQyxHQUFXO1FBQzNCLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFeEIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFMUIsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2xDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsRUFBRSxFQUFFO1lBQ3pDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHNDQUFzQyxFQUFFLEVBQUU7Z0JBQzFELE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDckUsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLG1C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