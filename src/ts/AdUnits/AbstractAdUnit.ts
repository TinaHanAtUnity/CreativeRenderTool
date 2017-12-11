import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { Observable0 } from 'Utilities/Observable';
import { NativeBridge } from 'Native/NativeBridge';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { FinishState } from 'Constants/FinishState';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { Configuration } from 'Models/Configuration';
import { Request } from 'Utilities/Request';
import { FocusManager } from 'Managers/FocusManager';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';

export interface IAdUnitParameters<T extends Campaign> {
    forceOrientation: ForceOrientation;
    focusManager: FocusManager;
    container: AdUnitContainer;
    deviceInfo: DeviceInfo;
    clientInfo: ClientInfo;
    thirdPartyEventManager: ThirdPartyEventManager;
    operativeEventManager: OperativeEventManager;
    comScoreTrackingService: ComScoreTrackingService;
    placement: Placement;
    campaign: T;
    configuration: Configuration;
    request: Request;
    options: any;
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
    protected readonly _forceOrientation: ForceOrientation;
    protected readonly _container: AdUnitContainer;

    private _showing: boolean;
    private _finishState: FinishState;

    constructor(nativeBridge: NativeBridge, parameters: IAdUnitParameters<Campaign>) {
        this._nativeBridge = nativeBridge;
        this._forceOrientation = parameters.forceOrientation;
        this._container = parameters.container;
        this._showing = false;
        this._finishState = FinishState.ERROR;
    }

    public abstract show(): Promise<void>;

    public abstract hide(): Promise<void>;

    public abstract description(): string;

    public abstract isCached(): boolean;

    public isShowing() {
        return this._showing;
    }

    public setShowing(showing: boolean) {
        this._showing = showing;
    }

    public getContainer(): AdUnitContainer {
        return this._container;
    }

    public getForceOrientation(): ForceOrientation {
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
}
