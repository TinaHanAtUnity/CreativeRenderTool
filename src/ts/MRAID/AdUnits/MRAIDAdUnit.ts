import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import {
    AdUnitContainerSystemMessage,
    IAdUnitContainerListener,
    Orientation
} from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { EventType } from 'Ads/Models/Session';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { EndScreen } from 'Ads/Views/EndScreen';
import { IARApi } from 'AR/AR';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { FinishState } from 'Core/Constants/FinishState';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { IMRAIDViewHandler, IOrientationProperties, MRAIDView } from 'MRAID/Views/MRAIDView';
import { WKAudiovisualMediaTypes } from 'Ads/Native/WebPlayer';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { Platform } from 'Core/Constants/Platform';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { MRAID } from 'MRAID/Views/MRAID';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

export interface IMRAIDAdUnitParameters extends IAdUnitParameters<MRAIDCampaign> {
    mraid: MRAIDView<IMRAIDViewHandler>;
    endScreen?: EndScreen;
    privacy: AbstractPrivacy;
    ar: IARApi;
    webPlayerContainer: WebPlayerContainer;
}

export class MRAIDAdUnit extends AbstractAdUnit implements IAdUnitContainerListener {

    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _mraid: MRAIDView<IMRAIDViewHandler>;
    private _ar: IARApi;
    private _options: unknown;
    private _orientationProperties: IOrientationProperties;
    private _endScreen?: EndScreen;
    private _showingMRAID: boolean;
    private _clientInfo: ClientInfo;
    private _placement: Placement;
    private _privacy: AbstractPrivacy;
    private _additionalTrackingEvents: { [eventName: string]: string[] } | undefined;
    private _webPlayerContainer: WebPlayerContainer;
    private _campaign: MRAIDCampaign;
    private _deviceInfo: DeviceInfo;

    constructor(parameters: IMRAIDAdUnitParameters) {
        super(parameters);

        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._mraid = parameters.mraid;
        this._additionalTrackingEvents = parameters.campaign.getTrackingUrls();
        this._endScreen = parameters.endScreen;
        this._clientInfo = parameters.clientInfo;
        this._placement = parameters.placement;
        this._campaign = parameters.campaign;
        this._privacy = parameters.privacy;
        this._ar = parameters.ar;
        this._webPlayerContainer = parameters.webPlayerContainer;
        this._deviceInfo = parameters.deviceInfo;

        this._mraid.render();
        document.body.appendChild(this._mraid.container());

        if(this._endScreen) {
            this._endScreen.render();
            this._endScreen.hide();
            document.body.appendChild(this._endScreen.container());
        }

        this._orientationProperties = {
            allowOrientationChange: true,
            forceOrientation: Orientation.NONE
        };

        this._options = parameters.options;
        this.setShowing(false);
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

    public hide(): Promise<void> {
        if(!this.isShowing()) {
            return Promise.resolve();
        }
        this.setShowing(false);
        this.setShowingMRAID(false);

        this._mraid.hide();
        this.removeEndScreenContainer();
        this.removePrivacyContainer();

        this.sendFinishOperativeEvents();
        this.onFinish.trigger();
        this.removeMraidContainer();
        this.unsetReferences();

        this._ads.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());
        this._container.removeEventHandler(this);

        return this._container.close().then(() => {
            this.onClose.trigger();
        });
    }

    public setOrientationProperties(properties: IOrientationProperties): void {
        this._orientationProperties = properties;
    }

    public description(): string {
        return 'mraid';
    }

    public sendClick(): void {
        this.sendTrackingEvent('click');
    }

    public sendImpression(): void {
        this.sendTrackingEvent('impression');
    }

    public getEndScreen(): EndScreen | undefined {
        return this._endScreen;
    }

    public getMRAIDView(): MRAIDView<IMRAIDViewHandler> {
        return this._mraid;
    }

    public setShowingMRAID(showing: boolean) {
        this._showingMRAID = showing;
    }

    public isShowingMRAID(): boolean {
        return this._showingMRAID;
    }

    public onContainerShow(): void {
        this._mraid.setViewableState(true);

        if(AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                this.setFinishState(FinishState.COMPLETED);
                this.hide();
            }, AbstractAdUnit.getAutoCloseDelay());
        }

        // IOS does not consistently call onContainerForeground
        // so we must trigger it in show call
        if (this._platform === Platform.IOS && this._mraid instanceof MRAID) {
            this.onContainerForeground();
        }
    }

    public onContainerDestroy(): void {
        if(this.isShowing()) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    public onContainerBackground(): void {
        if(this.isShowing()) {
            this._mraid.setViewableState(false);

            if(CustomFeatures.isSimejiJapaneseKeyboardApp(this._clientInfo.getGameId())) {
                this.setFinishState(FinishState.SKIPPED);
                this.hide();
            }
        }
    }

    public onContainerForeground(): void {
        this.onContainerForegroundMRAID();
    }

    // public for testing
    public onContainerForegroundMRAID(): Promise<void> {
        if (this.isShowing()) {
            this._mraid.setViewableState(true);
        }

        if (this._mraid instanceof MRAID) {
            return this.startWebPlayer();
        }

        return Promise.resolve();
    }

    public onContainerSystemMessage(message: AdUnitContainerSystemMessage): void {
        // EMPTY
    }

    private unsetReferences() {
        delete this._mraid;
        delete this._endScreen;
        delete this._privacy;
    }

    private sendTrackingEvent(eventName: string): void {
        const sessionId = this._campaign.getSession().getId();

        if(this._additionalTrackingEvents && this._additionalTrackingEvents[eventName]) {
            const trackingEventUrls = this._additionalTrackingEvents[eventName];

            if(trackingEventUrls) {
                for (const url of trackingEventUrls) {
                    this._thirdPartyEventManager.sendWithGet(`mraid ${eventName}`, sessionId, url, this._campaign.getUseWebViewUserAgentForTracking());
                }
            }
        }
    }

    private getOperativeEventParams(): IOperativeEventParams {
        return {
            placement: this._placement,
            asset: this._campaign.getResourceUrl()
        };
    }

    private removeEndScreenContainer() {
        if(this._endScreen) {
            this._endScreen.hide();

            const endScreenContainer = this._endScreen.container();
            if (endScreenContainer && endScreenContainer.parentElement) {
                endScreenContainer.parentElement.removeChild(this._endScreen.container());
            }
        }
    }

    private removePrivacyContainer() {
        const privacyContainer = this._privacy.container();
        if (privacyContainer && privacyContainer.parentElement) {
            privacyContainer.parentElement.removeChild(this._privacy.container());
        }
    }

    private removeMraidContainer() {
        const mraidContainer = this._mraid.container();
        if (mraidContainer && mraidContainer.parentElement) {
            mraidContainer.parentElement.removeChild(this._mraid.container());
        }
    }

    private sendFinishOperativeEvents() {
        const operativeEventParams = this.getOperativeEventParams();
        const finishState = this.getFinishState();

        if(finishState === FinishState.COMPLETED) {
            if(!this._campaign.getSession().getEventSent(EventType.THIRD_QUARTILE)) {
                this._operativeEventManager.sendThirdQuartile(operativeEventParams);
            }

            if(!this._campaign.getSession().getEventSent(EventType.VIEW)) {
                this._operativeEventManager.sendView(operativeEventParams);
            }

            this.sendTrackingEvent('complete');
        } else if(finishState === FinishState.SKIPPED) {
            this._operativeEventManager.sendSkip(operativeEventParams);
        }
    }

    private startWebPlayer(): Promise<void> {
        if (!this._mraid.isLoaded()) {
            return this._deviceInfo.getScreenWidth().then((width) => {
                const topWebViewAreaMinHeight = 100;
                this._container.setViewFrame('webview', 0, 0, width, topWebViewAreaMinHeight);
            }).then(() => {
                this._mraid.loadWebPlayer(this._webPlayerContainer);
            });
        }

        return Promise.resolve();
    }

    private setupContainerView(): Promise<void> {
        if (this._mraid instanceof MRAID) {
            return this.setupWebPlayerView();
        }

        return this.setupIFrameView();
    }

    private setupIFrameView(): Promise<void> {
        const views: string[] = ['webview'];
        const isARCreative = ARUtil.isARCreative(this._campaign);
        const isARSupported = isARCreative ? ARUtil.isARSupported(this._ar) : Promise.resolve<boolean>(false);

        return isARSupported.then(arSupported => {
            if (arSupported) {
                views.unshift('arview');
            }

            return this.openAdUnitContainer(views);
        });
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
            shouldOverrideUrlLoading: { 'sendEvent': true, 'returnValue': true }
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
            shouldOverrideUrlLoading: { 'sendEvent': true, 'returnValue': true }
        };
        return Promise.all([
            this._webPlayerContainer.setSettings(settings, {}),
            this._webPlayerContainer.setEventSettings(events)
        ]);
    }
}
