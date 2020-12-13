import { RequestManager } from 'Core/Managers/RequestManager';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { RequestError } from 'Core/Errors/RequestError';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
/**
 * Base StoreHandler class contains basic, must-have methods for attribution handling and
 * event tracking for all store handlers. Also provides a onDownload method that is expected
 * to be called in overridden implementations of concrete classes.
 */
export class StoreHandler {
    constructor(parameters) {
        this._core = parameters.core;
        this._ads = parameters.ads;
        this._store = parameters.store;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._operativeEventManager = parameters.operativeEventManager;
        this._placement = parameters.placement;
        this._campaign = parameters.campaign;
        this._adUnit = parameters.adUnit;
    }
    /**
     * The default implementation of onDownload that contains the event tracking of
     * download click that applies to all concrete StoreHandlers class implementations.
     * This method must be called with super() by concrete classes that extend the
     * abstract StoreHandler class.
     * @param parameters the parameters of the download click
     */
    onDownload(parameters) {
        this._ads.Listener.sendClickEvent(this._placement.getId());
        const operativeEventParameters = this.getOperativeEventParams(parameters);
        this._operativeEventManager.sendClick(operativeEventParameters);
        if (this._campaign instanceof XPromoCampaign) {
            this._thirdPartyEventManager.sendTrackingEvents(this._campaign, TrackingEvent.CLICK, 'xpromo');
        }
    }
    handleClickAttribution(parameters) {
        if (parameters.clickAttributionUrlFollowsRedirects && parameters.clickAttributionUrl) {
            this.handleClickAttributionWithRedirects(parameters.clickAttributionUrl);
            return;
        }
        if (parameters.clickAttributionUrl) {
            this.handleClickAttributionWithoutRedirect(parameters.clickAttributionUrl);
        }
    }
    handleClickAttributionWithoutRedirect(clickAttributionUrl) {
        this._thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, false).catch(error => {
            this.triggerDiagnosticsError(error, clickAttributionUrl);
        });
    }
    handleClickAttributionWithRedirects(clickAttributionUrl) {
        this._thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, true).then(response => {
            const location = RequestManager.getHeader(response.headers, 'location');
            if (location) {
                this.openURL(location);
            }
            else {
                Diagnostics.trigger('click_attribution_misconfigured', {
                    url: clickAttributionUrl,
                    followsRedirects: true,
                    response: response
                });
            }
        }).catch(error => {
            this.triggerDiagnosticsError(error, clickAttributionUrl);
        });
    }
    triggerDiagnosticsError(error, clickAttributionUrl) {
        const currentSession = this._campaign.getSession();
        if (error instanceof RequestError) {
            error = new DiagnosticError(new Error(error.message), {
                request: error.nativeRequest,
                auctionId: currentSession.getId(),
                url: clickAttributionUrl,
                response: error.nativeResponse
            });
        }
        SessionDiagnostics.trigger('click_attribution_failed', error, currentSession);
    }
    getVideo() {
        if (this._adUnit instanceof PerformanceAdUnit) {
            return this._adUnit.getVideo();
        }
        return undefined;
    }
    getVideoOrientation() {
        return this._adUnit.getVideoOrientation();
    }
    getOperativeEventParams(parameters) {
        return {
            placement: this._placement,
            videoOrientation: this.getVideoOrientation(),
            adUnitStyle: parameters.adUnitStyle,
            asset: this.getVideo()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RvcmVIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9FdmVudEhhbmRsZXJzL1N0b3JlSGFuZGxlcnMvU3RvcmVIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUk5RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRTlELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUV0RSxPQUFPLEVBQTBCLGFBQWEsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBSzVGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUU5RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQWtDMUU7Ozs7R0FJRztBQUNILE1BQU0sT0FBZ0IsWUFBWTtJQVk5QixZQUFzQixVQUFtQztRQUNyRCxJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDO1FBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUMvQixJQUFJLENBQUMsdUJBQXVCLEdBQUcsVUFBVSxDQUFDLHNCQUFzQixDQUFDO1FBQ2pFLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxVQUFVLENBQUMscUJBQXFCLENBQUM7UUFDL0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUNy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