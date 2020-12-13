import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { Promises } from 'Core/Utilities/Promises';
import { Timer } from 'Core/Utilities/Timer';
import { Url } from 'Core/Utilities/Url';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { SDKMetrics, AdmobMetric } from 'Ads/Utilities/SDKMetrics';
export class AdMobEventHandler extends GDPREventHandler {
    constructor(parameters) {
        super(parameters.privacyManager, parameters.coreConfig, parameters.adsConfig, parameters.privacySDK);
        this._adUnit = parameters.adUnit;
        this._platform = parameters.platform;
        this._core = parameters.core;
        this._request = parameters.request;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._session = parameters.session;
        this._adMobSignalFactory = parameters.adMobSignalFactory;
        this._campaign = parameters.campaign;
        this._clientInfo = parameters.clientInfo;
        this._timeoutTimer = new Timer(() => this.onFailureToLoad(), AdMobEventHandler._loadTimeout);
    }
    // Abstracted for testing
    static setLoadTimeout(timeout) {
        AdMobEventHandler._loadTimeout = timeout;
    }
    onClose() {
        this._adUnit.hide();
    }
    onOpenURL(url) {
        const isAboutPage = url.indexOf('mobile-about') !== -1;
        if (!isAboutPage) {
            this._adUnit.sendClickEvent();
        }
        if (this._platform === Platform.IOS) {
            this._core.iOS.UrlScheme.open(url);
        }
        else {
            this._core.Android.Intent.launch({
                action: 'android.intent.action.VIEW',
                uri: url
            });
        }
    }
    onAttribution(url, touchInfo) {
        const userAgent = this.getUserAgentHeader();
        const headers = [
            ['User-Agent', userAgent]
        ];
        const isMsPresent = Url.getQueryParameter(url, 'ms');
        let urlPromise;
        if (isMsPresent) {
            urlPromise = Promise.resolve(url);
        }
        else {
            urlPromise = this.createClickUrl(url, touchInfo);
        }
        return urlPromise.then((clickUrl) => {
            // voidResult transforms promise to Promise<void>
            return Promises.voidResult(this._thirdPartyEventManager.sendWithGet('admob click', this._session.getId(), clickUrl, true, headers));
        });
    }
    onGrantReward() {
        this._adUnit.sendRewardEvent();
        this._adUnit.setFinishState(FinishState.COMPLETED);
    }
    onVideoStart() {
        // this._timeoutTimer.stop();
        this._adUnit.sendStartEvent();
    }
    onShow() {
        // this._timeoutTimer.start();
    }
    onSetOrientationProperties(allowOrientation, forceOrientation) {
        if (this._platform === Platform.IOS) {
            this._adUnit.getContainer().reorient(true, forceOrientation);
        }
        else {
            this._adUnit.getContainer().reorient(allowOrientation, forceOrientation);
        }
    }
    onOpenableIntentsRequest(request) {
        this._core.Android.Intent.canOpenIntents(request.intents).then((results) => {
            this._adUnit.sendOpenableIntentsResponse({
                id: request.id,
                results: results
            });
        });
    }
    onTrackingEvent(event, data) {
        this._adUnit.sendTrackingEvent(event);
        if (event === TrackingEvent.ERROR) {
            if (data && data.startsWith('Missing Video Error')) {
                SDKMetrics.reportMetricEvent(AdmobMetric.AdmobVideoElementMissing);
                this._adUnit.hide();
            }
        }
        else if (event === TrackingEvent.STALLED) {
            Diagnostics.trigger('admob_ad_video_stalled', {
                data: data
            });
        }
        else if (event === TrackingEvent.LOADED) {
            this._adUnit.sendVideoCanPlayEvent();
            if (this._campaign.shouldMuteByDefault()) {
                const isMuted = true;
                this.onMuteChange(isMuted);
            }
        }
    }
    onClickSignalRequest(touchInfo) {
        return this.getClickSignal(touchInfo).then((signal) => {
            const response = {
                encodedClickSignal: signal.getBase64ProtoBufNonEncoded(),
                rvdt: this._adUnit.getRequestToViewTime()
            };
            this._adUnit.sendClickSignalResponse(response);
        });
    }
    onMuteChange(isMuted) {
        this._adUnit.sendMuteChange(isMuted);
    }
    onVolumeChange(volume, maxVolume) {
        this._adUnit.sendVolumeChange(volume, maxVolume);
    }
    getClickSignal(touchInfo) {
        return this._adMobSignalFactory.getClickSignal(touchInfo, this._adUnit).then((signal) => {
            return signal;
        });
    }
    getOptionalSignal() {
        return this._adMobSignalFactory.getOptionalSignal().then((signal) => {
            return signal;
        });
    }
    getUserAgentHeader() {
        const userAgent = navigator.userAgent || 'Unknown ';
        return `${userAgent} (Unity ${this._clientInfo.getSdkVersion()})`;
    }
    onFailureToLoad() {
        this._adUnit.setFinishState(FinishState.ERROR);
        this._adUnit.hide();
    }
    createClickUrl(url, touchInfo) {
        return this.getClickSignal(touchInfo).then((signal) => {
            return Url.addParameters(url, {
                ms: signal.getBase64ProtoBufNonEncoded(),
                rvdt: this._adUnit.getRequestToViewTime()
            });
        });
    }
}
AdMobEventHandler._loadTimeout = 5000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRtb2JFdmVudEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRNb2IvRXZlbnRIYW5kbGVycy9BZG1vYkV2ZW50SGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUV0RSxPQUFPLEVBQTBCLGFBQWEsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRzVGLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFLbkQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUM3QyxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDekMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRXpELE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFrQm5FLE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxnQkFBZ0I7SUFpQm5ELFlBQVksVUFBd0M7UUFDaEQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsVUFBVSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNyRyxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFDakMsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQztRQUM3QixJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7UUFD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