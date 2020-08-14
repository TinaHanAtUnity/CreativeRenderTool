import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { IAdUnitContainerListener } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { EndScreen } from 'Ads/Views/EndScreen';
import { IARApi } from 'AR/AR';
import { FinishState } from 'Core/Constants/FinishState';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { IMRAIDViewHandler, MRAIDView } from 'MRAID/Views/MRAIDView';
import { WKAudiovisualMediaTypes } from 'Ads/Native/WebPlayer';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { Platform } from 'Core/Constants/Platform';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { WebViewTopCalculator } from 'Ads/Utilities/WebPlayer/WebViewTopCalculator';
import { MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { WebPlayerMRAID } from 'MRAID/Views/WebPlayerMRAID';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { SDKMetrics, MraidWebplayerMetric } from 'Ads/Utilities/SDKMetrics';

export interface IMRAIDAdUnitParameters extends IAdUnitParameters<MRAIDCampaign> {
    mraid: MRAIDView<IMRAIDViewHandler>;
    endScreen?: EndScreen;
    privacy: AbstractPrivacy;
    ar: IARApi;
    webPlayerContainer: WebPlayerContainer;
}

export class WebPlayerMRAIDAdUnit extends MRAIDAdUnit implements IAdUnitContainerListener {

    private _webPlayerContainer: WebPlayerContainer;
    private _deviceInfo: DeviceInfo;

    constructor(parameters: IMRAIDAdUnitParameters) {
        super(parameters);

        this._webPlayerContainer = parameters.webPlayerContainer;
        this._deviceInfo = parameters.deviceInfo;
    }

    public onContainerShow(): void {
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

    public show(): Promise<void> {
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

    public onContainerForeground(): void {
        this.onContainerForegroundMRAID();
    }

    // public for testing
    public onContainerForegroundMRAID(): Promise<void> {
        if (this.isShowing()) {
            this._mraid.setViewableState(true);
        }

        if (this._mraid instanceof WebPlayerMRAID) {
            return this.startWebPlayer();
        }

        return Promise.resolve();
    }

    private startWebPlayer(): Promise<void> {
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

    private setupWebPlayerView(): Promise<void> {
        return this.setupWebPlayer().then(() => {
            return this.openAdUnitContainer(['webplayer', 'webview']);
        });
    }

    private openAdUnitContainer(views: string[]) {
        return this._container.open(this, views, this._orientationProperties.allowOrientationChange, this._orientationProperties.forceOrientation, true, false, true, false, this._options).then(() => {
            this.onStart.trigger();
        });
    }

    protected setupContainerView(): Promise<void> {
        return this.setupWebPlayerView();
    }

    private setupWebPlayer(): Promise<unknown> {
        if (this._platform === Platform.ANDROID) {
            return this.setupAndroidWebPlayer();
        } else {
            return this.setupIosWebPlayer();
        }
    }

    private setupAndroidWebPlayer(): Promise<{}> {
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

    private setupIosWebPlayer(): Promise<unknown> {
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
    public sendClick(): void {
        SDKMetrics.reportMetricEvent(MraidWebplayerMetric.MraidClickSent);
        super.sendClick();
    }
}
