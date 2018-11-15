import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { FinishState } from 'Core/Constants/FinishState';
import { FocusManager } from 'Core/Managers/FocusManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable0 } from 'Core/Utilities/Observable';
import { Request } from 'Core/Utilities/Request';
import { GDPRConsent } from 'Ads/Views/Consent/GDPRConsent';

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
    coreConfig: CoreConfiguration;
    adsConfig: AdsConfiguration;
    request: Request;
    options: any;
    gdprManager: GdprManager;
    adMobSignalFactory?: AdMobSignalFactory;
    webPlayerContainer?: WebPlayerContainer;
    programmaticTrackingService: ProgrammaticTrackingService;
    gameSessionId?: number;
    gdprConsentView?: GDPRConsent;
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

    private _showingAd: boolean;
    private _finishState: FinishState;
    private _baseCampaign: Campaign;
    private _gdprConsent: GDPRConsent | undefined;

    constructor(nativeBridge: NativeBridge, parameters: IAdUnitParameters<Campaign>) {
        this._nativeBridge = nativeBridge;
        this._forceOrientation = parameters.forceOrientation;
        this._container = parameters.container;
        this._showingAd = false;
        this._finishState = FinishState.ERROR;
        this._baseCampaign = parameters.campaign;
        this._gdprConsent = parameters.gdprConsentView;
    }

    protected openContainer(adUnit: AbstractAdUnit, views: string[], allowRotation: boolean, forceOrientation: Orientation, disableBackbutton: boolean, isTransparent: boolean, withAnimation: boolean, allowStatusBar: boolean, options: any): Promise<void> {
        if (this._gdprConsent) {
            this.setShowingAd(false);
            this._gdprConsent.render();
            document.body.appendChild(this._gdprConsent.container());
            this._gdprConsent.show();
        } else {
            this.setShowingAd(true);
        }
        return this._container.open(this, views, allowRotation, forceOrientation, disableBackbutton, isTransparent, withAnimation, allowStatusBar, options);
    }

    public abstract open(): Promise<void>;

    public abstract show(): Promise<void>;

    public abstract hide(): Promise<void>;

    public abstract showAd(): void;

    public abstract description(): string;

    public isCached(): boolean {
        return CampaignAssetInfo.isCached(this._baseCampaign);
    }

    public isShowingAd() {
        return this._showingAd;
    }

    public setShowingAd(showing: boolean) {
        this._showingAd = showing;
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

    public markAsSkipped() {
        this._finishState = FinishState.SKIPPED;
    }
}
