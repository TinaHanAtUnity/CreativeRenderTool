import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { FinishState } from 'Core/Constants/FinishState';
import { WKAudiovisualMediaTypes } from 'Ads/Native/WebPlayer';
import { Platform } from 'Core/Constants/Platform';
import { WebViewTopCalculator } from 'Ads/Utilities/WebPlayer/WebViewTopCalculator';
import { MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { WebPlayerMRAID } from 'MRAID/Views/WebPlayerMRAID';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { SDKMetrics, MraidWebplayerMetric } from 'Ads/Utilities/SDKMetrics';
export class WebPlayerMRAIDAdUnit extends MRAIDAdUnit {
    constructor(parameters) {
        super(parameters);
        this._webPlayerContainer = parameters.webPlayerContainer;
        this._deviceInfo = parameters.deviceInfo;
    }
    onContainerShow() {
        this._mraid.setViewableState(true);
        if (AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                this.setFinishState(FinishState.COMPLETED);
                this.hide();
            }, AbstractAdUnit.getAutoCloseDelay());
        }
        // IOS does not consistently call onContainerForeground
        // so we must trigger it in show call
        if (this._platform === Platform.IOS && this._mraid instanceof WebPlayerMRAID) {
            this.onContainerForeground();
        }
    }
    show() {
        this.setShowing(true);
        this.setShowingMRAID(true);
        this._mraid.show();
        this._ads.Listener.sendStartEvent(this._placement.getId());
        this._operativeEventManager.sendStart(this.getOperativeEventParams()).then(() => {
            this.onStartProcessed.trigger();
        });
        if (!CustomFeatures.isLoopMeSeat(this._campaign.getSeatId())) {
            this.sendImpression();
        }
        this._container.addEventHandler(this);
        return this.setupContainerView();
    }
    onContainerForeground() {
        this.onContainerForegroundMRAID();
    }
    // public for testing
    onContainerForegroundMRAID() {
        if (this.isShowing()) {
            this._mraid.setViewableState(true);
        }
        if (this._mraid instanceof WebPlayerMRAID) {
            return this.startWebPlayer();
        }
        return Promise.resolve();
    }
    startWebPlayer() {
        if (!this._mraid.isLoaded()) {
            return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()])
                .then(([width, height]) => {
                const webViewResizer = new WebViewTopCalculator(this._deviceInfo, this._platform);
                const topWebViewAreaMinHeight = webViewResizer.getTopPosition(width, height);
                this._container.setViewFrame('webview', 0, 0, width, topWebViewAreaMinHeight);
            }).then(() => {
                this._mraid.loadWebPlayer(this._webPlayerContainer);
            });
        }
        return Promise.resolve();
    }
    setupWebPlayerView() {
        return this.setupWebPlayer().then(() => {
            return this.openAdUnitContainer(['webplayer', 'webview']);
        });
    }
    openAdUnitContainer(views) {
        return this._container.open(this, views, this._orientationProperties.allowOrientationChange, this._orientationProperties.forceOrientation, true, false, true, false, this._options).then(() => {
            this.onStart.trigger();
        });
    }
    setupContainerView() {
        return this.setupWebPlayerView();
    }
    setupWebPlayer() {
        if (this._platform === Platform.ANDROID) {
            return this.setupAndroidWebPlayer();
        }
        else {
            return this.setupIosWebPlayer();
        }
    }
    setupAndroidWebPlayer() {
        const promises = [];
        promises.push(this._webPlayerContainer.setSettings({
            setSupportMultipleWindows: [false],
            setJavaScriptCanOpenWindowsAutomatically: [true],
            setMediaPlaybackRequiresUserGesture: [false],
            setAllowFileAccessFromFileURLs: [true]
        }, {}));
        const eventSettings = {
            onPageStarted: { 'sendEvent': true },
            shouldOverrideUrlLoading: { 'sendEvent': true, 'returnValue': true },
            onReceivedSslError: { shouldCallSuper: true }
        };
        promises.push(this._webPlayerContainer.setEventSettings(eventSettings));
        return Promise.all(promises);
    }
    setupIosWebPlayer() {
        const settings = {
            allowsPlayback: true,
            playbackRequiresAction: false,
            typesRequiringAction: WKAudiovisualMediaTypes.NONE
        };
        const events = {
            onPageStarted: { 'sendEvent': true },
            shouldOverrideUrlLoading: { 'sendEvent': true, 'returnValue': true },
            onReceivedSslError: { shouldCallSuper: true }
        };
        return Promise.all([
            this._webPlayerContainer.setSettings(settings, {}),
            this._webPlayerContainer.setEventSettings(events)
        ]);
    }
    // overriding sendClick is a temporary addition for this metric
    sendClick() {
        SDKMetrics.reportMetricEvent(MraidWebplayerMetric.MraidClickSent);
        super.sendClick();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ViUGxheWVyTVJBSURBZFVuaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvTVJBSUQvQWRVbml0cy9XZWJQbGF5ZXJNUkFJREFkVW5pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFxQixNQUFNLDRCQUE0QixDQUFDO0FBSS9FLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUd6RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUUvRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDcEYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFOUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBVTVFLE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxXQUFXO0lBS2pELFlBQVksVUFBa0M7UUFDMUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRWxCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxVQUFVLENBQUMsa0JBQWtCLENBQUM7UUFDekQsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDO0lBQzdDLENBQUM7SUFFTSxlQUFlO1FBQ2xCLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbkMsSUFBSSxjQUFjLENBQUMsWUFBWSxFQUFFLEVBQUU7WUFDL0IsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDWixJQUFJLENBQUMsY0FBYyxDQUFD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