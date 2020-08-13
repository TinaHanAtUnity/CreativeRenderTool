import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import {
    AdUnitContainerSystemMessage,
    IAdUnitContainerListener,
    Orientation
} from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager, TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
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
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';

export interface IMRAIDAdUnitParameters extends IAdUnitParameters<MRAIDCampaign> {
    mraid: MRAIDView<IMRAIDViewHandler>;
    endScreen?: EndScreen;
    ar: IARApi;
    webPlayerContainer: WebPlayerContainer;
}

export class MRAIDAdUnit extends AbstractAdUnit implements IAdUnitContainerListener {

    protected _operativeEventManager: OperativeEventManager;
    protected _thirdPartyEventManager: ThirdPartyEventManager;
    protected _mraid: MRAIDView<IMRAIDViewHandler>;
    protected _ar: IARApi;
    protected _options: unknown;
    protected _orientationProperties: IOrientationProperties;
    protected _endScreen?: EndScreen;
    protected _showingMRAID: boolean;
    protected _clientInfo: ClientInfo;
    protected _placement: Placement;
    protected _campaign: MRAIDCampaign;
    protected _privacy: AbstractPrivacy;
    protected _additionalTrackingEvents: ICampaignTrackingUrls;

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

        this._mraid.render();
        document.body.appendChild(this._mraid.container());

        if (this._endScreen) {
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

        // Temporary for PTS Migration Investigation
        this.sendTrackingEvent(TrackingEvent.START);

        this._container.addEventHandler(this);

        const views: string[] = ['webview'];

        const isARCreative = ARUtil.isARCreative(this._campaign);
        const isARSupported = isARCreative ? ARUtil.isARSupported(this._ar) : Promise.resolve<boolean>(false);

        return isARSupported.then(arSupported => {
            if (arSupported) {
                views.unshift('arview');
            }

            return this._container.open(this, views, this._orientationProperties.allowOrientationChange, this._orientationProperties.forceOrientation, true, false, true, false, this._options).then(() => {
                this.onStart.trigger();
            });
        });
    }

    public hide(): Promise<void> {
        if (!this.isShowing()) {
            return Promise.resolve();
        }
        this.setShowing(false);
        this.setShowingMRAID(false);

        if (this._mraid) {
            this._mraid.hide();
        }
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
        this.sendTrackingEvent(TrackingEvent.CLICK);
    }

    public sendImpression(): void {
        this.sendTrackingEvent(TrackingEvent.IMPRESSION);
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

        if (AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                this.setFinishState(FinishState.COMPLETED);
                this.hide();
            }, AbstractAdUnit.getAutoCloseDelay());
        }
    }

    public onContainerDestroy(): void {
        if (this.isShowing()) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    public onContainerBackground(): void {
        if (this.isShowing()) {
            this._mraid.setViewableState(false);

            if (CustomFeatures.isSimejiJapaneseKeyboardApp(this._clientInfo.getGameId())) {
                this.setFinishState(FinishState.SKIPPED);
                this.hide();
            }
        }
    }

    public onContainerForeground(): void {
        if (this.isShowing()) {
            this._mraid.setViewableState(true);
        }
    }

    public onContainerSystemMessage(message: AdUnitContainerSystemMessage): void {
        // EMPTY
    }

    protected unsetReferences() {
        delete this._mraid;
        delete this._endScreen;
        delete this._privacy;
    }

    public sendTrackingEvent(event: TrackingEvent): void {
        this._thirdPartyEventManager.sendTrackingEvents(this._campaign, event, 'mraid', this._campaign.getUseWebViewUserAgentForTracking());
    }

    protected getOperativeEventParams(): IOperativeEventParams {
        return {
            placement: this._placement,
            asset: this._campaign.getResourceUrl()
        };
    }

    protected removeEndScreenContainer() {
        if (this._endScreen) {
            this._endScreen.hide();

            const endScreenContainer = this._endScreen.container();
            if (endScreenContainer && endScreenContainer.parentElement) {
                endScreenContainer.parentElement.removeChild(this._endScreen.container());
            }
        }
    }

    protected removePrivacyContainer() {
        if (this._privacy) {
            const privacyContainer = this._privacy.container();
            if (privacyContainer && privacyContainer.parentElement) {
                privacyContainer.parentElement.removeChild(privacyContainer);
            }
        }
    }

    protected removeMraidContainer() {
        if (this._mraid) {
            const mraidContainer = this._mraid.container();
            if (mraidContainer && mraidContainer.parentElement) {
                mraidContainer.parentElement.removeChild(mraidContainer);
            }
        }
    }

    protected sendFinishOperativeEvents() {
        const operativeEventParams = this.getOperativeEventParams();
        const finishState = this.getFinishState();

        if (finishState === FinishState.COMPLETED) {
            if (!this._campaign.getSession().getEventSent(EventType.THIRD_QUARTILE)) {
                this._operativeEventManager.sendThirdQuartile(operativeEventParams);
            }

            if (!this._campaign.getSession().getEventSent(EventType.VIEW)) {
                this._operativeEventManager.sendView(operativeEventParams);

                // Temporary for PTS Migration Investigation
                this.sendTrackingEvent(TrackingEvent.COMPLETE);
            }
        } else if (finishState === FinishState.SKIPPED) {
            this._operativeEventManager.sendSkip(operativeEventParams);
        }
    }
}
