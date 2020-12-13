import { View } from 'Core/Views/View';
import { Template } from 'Core/Utilities/Template';
import { PrivacyFrameEventAdapter } from 'Privacy/PrivacyFrameEventAdapter';
import { PrivacyAdapterContainer } from 'Privacy/PrivacyAdapterContainer';
import { WebViewError } from 'Core/Errors/WebViewError';
import DeviceOrientationScript from 'html/mraid/deviceorientation-support.html';
import PrivacyTemplate from 'html/Privacy-iframe.html';
import PrivacyContainer from 'html/consent/privacy-container.html';
export class PrivacySDKView extends View {
    constructor(params) {
        super(params.platform, 'privacy-sdk-container');
        this._domContentLoaded = false;
        this._template = new Template(PrivacyTemplate);
        this._privacyManager = params.privacyManager;
        this._coreApi = params.core;
    }
    loadIframe() {
        this._iFrame = this._container.querySelector('#privacy-iframe');
        this._iFrameAdapterContainer = new PrivacyAdapterContainer(this);
        this._frameEventAdapter = new PrivacyFrameEventAdapter(this._coreApi, this._iFrameAdapterContainer, this._iFrame);
        try {
            this._iFrameAdapterContainer.connect(this._frameEventAdapter);
        }
        catch (e) {
            this._handlers.forEach(handler => handler.onPrivacyViewError(e.message));
            return;
        }
        this._iFrame.onerror = (event) => {
            this._handlers.forEach(handler => handler.onPrivacyViewError(event));
            return true;
        };
        this._iFrame.srcdoc = this.loadPrivacyHtml(PrivacyContainer);
    }
    setPrivacyConfig(privacyConfig) {
        this._privacyConfig = privacyConfig;
    }
    render() {
        super.render();
        this.loadIframe();
    }
    loadPrivacyHtml(container) {
        let privacyHtml = this._privacyConfig.getHtml();
        if (privacyHtml) {
            container = container.replace('<script id=\"deviceorientation-support\"></script>', DeviceOrientationScript);
            privacyHtml = privacyHtml.replace(/\$/g, '$$$');
            return container.replace('<body></body>', '<body>' + privacyHtml + '</body>');
        }
        throw new WebViewError('Unable to fetch privacy WebView!');
    }
    hide() {
        super.hide();
        if (this._iFrameAdapterContainer) {
            this._iFrameAdapterContainer.disconnect();
        }
    }
    onPrivacyReady() {
        if (this._domContentLoaded) {
            return;
        }
        this._iFrame.onerror = () => {
            return;
        };
        this._domContentLoaded = true;
        this._handlers.forEach(handler => handler.onPrivacyReady());
    }
    readyCallback(params) {
        this._frameEventAdapter.postMessage('readyCallback', params);
    }
    onPrivacyCompleted(params) {
        this._handlers.forEach(handler => handler.onPrivacyCompleted(params));
    }
    completeCallback() {
        this._frameEventAdapter.postMessage('completeCallback');
    }
    onPrivacyOpenUrl(url) {
        this._handlers.forEach(handler => handler.onPrivacyOpenUrl(url));
    }
    openUrlCallback(url) {
        this._frameEventAdapter.postMessage('openUrlCallback', url);
    }
    onPrivacyMetric(data) {
        this._handlers.forEach(handler => handler.onPrivacyMetric(data));
    }
    metricCallback() {
        this._frameEventAdapter.postMessage('metricCallback');
    }
    onPrivacyFetchUrl(data) {
        this._handlers.forEach(handler => handler.onPrivacyFetchUrl(data));
    }
    fetchUrlCallback(response, property) {
        this._frameEventAdapter.postMessage('fetchUrlCallback', { value: response, property });
    }
    postMessage(event, data) {
        this._frameEventAdapter.postMessage(event, data);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeVNES1ZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1ZpZXdzL1ByaXZhY3kvUHJpdmFjeVNES1ZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUM1RSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUUxRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFZeEQsT0FBTyx1QkFBdUIsTUFBTSwyQ0FBMkMsQ0FBQztBQUNoRixPQUFPLGVBQWUsTUFBTSwwQkFBMEIsQ0FBQztBQUN2RCxPQUFPLGdCQUFnQixNQUFNLHFDQUFxQyxDQUFDO0FBY25FLE1BQU0sT0FBTyxjQUFlLFNBQVEsSUFBNEI7SUFXNUQsWUFBWSxNQUFpQztRQUN6QyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1FBTDVDLHNCQUFpQixHQUFHLEtBQUssQ0FBQztRQU05QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQztRQUM3QyxJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDaEMsQ0FBQztJQUVPLFVBQVU7UUFDZCxJQUFJLENBQUMsT0FBTyxHQUF1QixJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3BGLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLHdCQUF3QixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVsSCxJQUFJO1lBQ0EsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztTQUNqRTtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDekUsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUM3QixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRU0sZ0JBQWdCLENBQUMsYUFBNEI7UUFDaEQsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7SUFDeEMsQ0FBQztJQUVNLE1BQU07UUFDVCxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVNLGVBQWUsQ0FBQyxTQUFpQjtRQUNwQyxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWhELElBQUksV0FBVyxFQUFFO1lBQ2IsU0FBUyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsb0RBQW9ELEVBQUUsdUJBQXVCLENBQUMsQ0FBQztZQUM3RyxXQUFXLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEQsT0FBTyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxRQUFRLEdBQUcsV0FBVyxHQUFHLFNBQVMsQ0FBQyxDQUFDO1NBQ2pGO1FBRUQsTUFBTSxJQUFJLFlBQVksQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFTSxJQUFJO1FBQ1AsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRWIsSUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUU7WUFDOUIsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsRUFBRSxDQUFDO1NBQzdDO0lBQ0wsQ0FBQztJQUVNLGNBQWM7UUFDakIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDeEIsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsR0FBRyxFQUFFO1lBQ3hCLE9BQU87UUFDWCxDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1FBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVNLGFBQWEsQ0FBQyxNQUFtQztRQUNwRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRU0sa0JBQWtCLENBQUMsTUFBK0I7UUFDckQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBRU0sZ0JBQWdCO1FBQ25CLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRU0sZ0JBQWdCLENBQUMsR0FBVztRQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFTSxlQUFlLENBQUMsR0FBVztRQUM5QixJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFTSxlQUFlLENBQUMsSUFBZ0M7UUFDbkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUVNLGNBQWM7UUFDakIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFTSxpQkFBaUIsQ0FBQyxJQUE0QjtRQUNqRCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFTSxnQkFBZ0IsQ0FBQyxRQUFvQyxFQUFFLFFBQWdCO1FBQzFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDM0YsQ0FBQztJQUVNLFdBQVcsQ0FBQyxLQUFhLEVBQUUsSUFBYztRQUM1QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyRCxDQUFDO0NBQ0oifQ==