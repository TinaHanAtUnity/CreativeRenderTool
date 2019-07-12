import { AdUnitContainer, IAdUnit, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IAdsApi } from 'Ads/IAds';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { FocusManager } from 'Core/Managers/FocusManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Observable0 } from 'Core/Utilities/Observable';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { IStoreApi } from 'Store/IStore';

export interface IAdUnitParameters<T extends Campaign> {
    forceOrientation: Orientation;
    focusManager: FocusManager;
    container: AdUnitContainer;
    deviceInfo: DeviceInfo;
    clientInfo: ClientInfo;
    thirdPartyEventManager: ThirdPartyEventManager;
    operativeEventManager: OperativeEventManager;
    placement: Placement;
    campaign: T;
    platform: Platform;
    core: ICoreApi;
    ads: IAdsApi;
    store: IStoreApi;
    coreConfig: CoreConfiguration;
    adsConfig: AdsConfiguration;
    request: RequestManager;
    options: unknown;
    privacyManager: UserPrivacyManager;
    programmaticTrackingService: ProgrammaticTrackingService;
    gameSessionId?: number;
    privacy: AbstractPrivacy;
}

export abstract class AbstractAdUnit implements IAdUnit {

    public static setAutoClose(value: boolean) {
        AbstractAdUnit._autoClose = value;
    }

    public static getAutoClose() {
        return AbstractAdUnit._autoClose;
    }

    public static setAutoCloseDelay(value: number) {
        AbstractAdUnit._autoCloseDelay = value;
    }

    public static getAutoCloseDelay() {
        return AbstractAdUnit._autoCloseDelay;
    }

    private static _autoClose = false;
    private static _autoCloseDelay: number = 0;

    public readonly onStart = new Observable0();
    public readonly onStartProcessed = new Observable0();
    public readonly onFinish = new Observable0();
    public readonly onClose = new Observable0();
    public readonly onError = new Observable0();

    protected readonly _forceOrientation: Orientation;
    protected readonly _container: AdUnitContainer;

    protected readonly _platform: Platform;
    protected readonly _core: ICoreApi;
    protected readonly _ads: IAdsApi;
    protected readonly _store: IStoreApi;

    private _showing: boolean;
    private _finishState: FinishState;
    private _baseCampaign: Campaign;

    constructor(parameters: IAdUnitParameters<Campaign>) {
        this._platform = parameters.platform;
        this._core = parameters.core;
        this._ads = parameters.ads;
        this._store = parameters.store;
        this._forceOrientation = parameters.forceOrientation;
        this._container = parameters.container;
        this._showing = false;
        this._finishState = FinishState.ERROR;
        this._baseCampaign = parameters.campaign;
    }

    public abstract show(): Promise<void>;

    public abstract hide(): Promise<void>;

    public abstract description(): string;

    public isCached(): boolean {
        return CampaignAssetInfo.isCached(this._baseCampaign);
    }

    public isShowing() {
        return this._showing;
    }

    public setShowing(showing: boolean) {
        this._showing = showing;
    }

    public getContainer(): AdUnitContainer {
        return this._container;
    }

    public getForceOrientation(): Orientation {
        return this._forceOrientation;
    }

    public getFinishState() {
        return this._finishState;
    }

    public setFinishState(finishState: FinishState) {
        if (this._finishState !== FinishState.COMPLETED) {
            this._finishState = finishState;
        }
    }

    public markAsSkipped() {
        this._finishState = FinishState.SKIPPED;
    }
}
