import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { IAdsApi } from 'Ads/IAds';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { EventType } from 'Ads/Models/Session';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { IMRAIDViewHandler, IOrientationProperties, MRAIDView } from 'MRAID/Views/MRAIDView';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { ABGroup } from 'Core/Models/ABGroup';

export class MRAIDEventHandler extends GDPREventHandler implements IMRAIDViewHandler {

    private _operativeEventManager: OperativeEventManager;
    private _adUnit: MRAIDAdUnit;
    private _placement: Placement;
    private _platform: Platform;
    private _core: ICoreApi;
    private _ads: IAdsApi;
    private _customImpressionFired: boolean;

    protected _mraidView: MRAIDView<IMRAIDViewHandler>;
    protected _request: RequestManager;
    protected _campaign: MRAIDCampaign;
    protected _gameSessionId?: number;
    protected _abGroup: ABGroup;
    protected _thirdPartyEventManager: ThirdPartyEventManager;

    constructor(adUnit: MRAIDAdUnit, parameters: IMRAIDAdUnitParameters) {
        super(parameters.privacyManager, parameters.coreConfig, parameters.adsConfig);
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._adUnit = adUnit;
        this._mraidView = adUnit.getMRAIDView();
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
        this._request = parameters.request;
        this._platform = parameters.platform;
        this._core = parameters.core;
        this._ads = parameters.ads;
        this._customImpressionFired = false;
        this._gameSessionId = parameters.gameSessionId;
        this._abGroup = parameters.coreConfig.getAbGroup();
    }

    public onMraidClick(url: string): Promise<void> {
        this._ads.Listener.sendClickEvent(this._placement.getId());

        return Promise.resolve();
    }

    public onMraidReward(): void {
        this._operativeEventManager.sendThirdQuartile(this.getOperativeEventParams());
    }

    public onMraidSkip(): void {
        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._adUnit.hide();
    }

    public onMraidClose(): void {
        this._adUnit.setFinishState(FinishState.COMPLETED);
        this._adUnit.hide();
    }

    public onMraidOrientationProperties(orientationProperties: IOrientationProperties): void {
        if(this._adUnit.isShowing()) {
            if(this._platform === Platform.IOS) {
                this._adUnit.getContainer().reorient(true, orientationProperties.forceOrientation);
            } else {
                this._adUnit.getContainer().reorient(orientationProperties.allowOrientationChange, orientationProperties.forceOrientation);
            }
        } else {
            this._adUnit.setOrientationProperties(orientationProperties);
        }
    }

    public onPlayableAnalyticsEvent(timeFromShow: number, timeFromPlayableStart: number, backgroundTime: number, event: string, eventData: unknown): void {
        // no-op
    }

    public onMraidShowEndScreen(): void {
        const endScreen = this._adUnit.getEndScreen();
        if(endScreen) {
            this._adUnit.setShowingMRAID(false);
            this._adUnit.getMRAIDView().hide();
            endScreen.show();
        }
    }

    public onCustomImpressionEvent(): void {
        if (!this._customImpressionFired) {
            this._adUnit.sendImpression();
            this._customImpressionFired = true;
        }
    }

    protected sendTrackingEvents() {
        const operativeEventParams: IOperativeEventParams = this.getOperativeEventParams();
        if (!this._campaign.getSession().getEventSent(EventType.THIRD_QUARTILE)) {
            this._operativeEventManager.sendThirdQuartile(operativeEventParams);
        }
        if (!this._campaign.getSession().getEventSent(EventType.VIEW)) {
            this._operativeEventManager.sendView(operativeEventParams);
        }
        if (!this._campaign.getSession().getEventSent(EventType.CLICK)) {
            this._operativeEventManager.sendClick(operativeEventParams);
        }

        this._adUnit.sendClick();
    }

    protected openUrl(url: string): Promise<void> {
        if(this._platform === Platform.IOS) {
            return this._core.iOS!.UrlScheme.open(url);
        } else {
            return this._core.Android!.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url // todo: these come from 3rd party sources, should be validated before general MRAID support
            });
        }
    }

    private getOperativeEventParams(): IOperativeEventParams {
        return {
            placement: this._placement,
            asset: this._campaign.getResourceUrl()
        };
    }
}
