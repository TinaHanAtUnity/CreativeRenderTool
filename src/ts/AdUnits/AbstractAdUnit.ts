import { AdMobSignalFactory } from 'AdMob/AdMobSignalFactory';
import { AdUnitContainer, Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { FinishState } from 'Constants/FinishState';
import { FocusManager } from 'Managers/FocusManager';
import { IForceQuitData } from 'Managers/ForceQuitManager';
import { GdprManager } from 'Managers/GdprManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Campaign } from 'Models/Campaign';
import { ClientInfo } from 'Models/ClientInfo';
import { Configuration } from 'Models/Configuration';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Placement } from 'Models/Placement';
import { NativeBridge } from 'Native/NativeBridge';
import { ProgrammaticTrackingService } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';
import { CampaignAssetInfo } from 'Utilities/CampaignAssetInfo';
import { Observable0 } from 'Utilities/Observable';
import { Request } from 'Utilities/Request';
import { WebPlayerContainer } from 'Utilities/WebPlayer/WebPlayerContainer';

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
    configuration: Configuration;
    request: Request;
    options: any;
    gdprManager: GdprManager;
    adMobSignalFactory?: AdMobSignalFactory;
    webPlayerContainer?: WebPlayerContainer;
    programmaticTrackingService: ProgrammaticTrackingService;
}

export abstract class AbstractAdUnit {

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

    protected readonly _nativeBridge: NativeBridge;
    protected readonly _forceOrientation: Orientation;
    protected readonly _container: AdUnitContainer;

    private _showing: boolean;
    private _finishState: FinishState;
    private _baseCampaign: Campaign;

    constructor(nativeBridge: NativeBridge, parameters: IAdUnitParameters<Campaign>) {
        this._nativeBridge = nativeBridge;
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
        if(this._finishState !== FinishState.COMPLETED) {
            this._finishState = finishState;
        }
    }

    public createForceQuitKey(): IForceQuitData {
        return {
            adSessionId: this._baseCampaign.getSession().getId()
        };
    }
}
