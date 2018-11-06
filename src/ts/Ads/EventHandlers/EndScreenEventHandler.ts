import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { Video } from 'Ads/Models/Assets/Video';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { IEndScreenHandler } from 'Ads/Views/EndScreen';
import { Platform } from 'Core/Constants/Platform';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { RequestError } from 'Core/Errors/RequestError';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Request } from 'Core/Utilities/Request';
import { Url } from 'Core/Utilities/Url';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { StoreName } from 'Performance/Models/PerformanceCampaign';
import { XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { IDownloadEventHandler, IDownloadParameters } from './DownloadEventHandler';

export interface IEndScreenDownloadParameters {
    clickAttributionUrl: string | undefined;
    clickAttributionUrlFollowsRedirects: boolean | undefined;
    bypassAppSheet: boolean | undefined;
    appStoreId: string | undefined;
    store: StoreName | undefined;
    appDownloadUrl?: string | undefined;
    adUnitStyle?: AdUnitStyle;
}

export abstract class EndScreenEventHandler<T extends Campaign, T2 extends AbstractAdUnit> extends GDPREventHandler implements IEndScreenHandler {

    protected _adUnit: T2;
    protected _campaign: T;
    protected _thirdPartyEventManager: ThirdPartyEventManager;
    protected _nativeBridge: NativeBridge;

    private _operativeEventManager: OperativeEventManager;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _placement: Placement;
    private _downloadHelper: IDownloadEventHandler;

    constructor(nativeBridge: NativeBridge, adUnit: T2, parameters: IAdUnitParameters<T>, downloadHelper: IDownloadEventHandler) {
        super(parameters.gdprManager, parameters.coreConfig, parameters.adsConfig);
        this._nativeBridge = nativeBridge;
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._adUnit = adUnit;
        this._clientInfo = parameters.clientInfo;
        this._deviceInfo = parameters.deviceInfo;
        this._placement = parameters.placement;
        this._campaign = parameters.campaign;
    }

    public onEndScreenDownload(parameters: IDownloadParameters): void {
        this._downloadHelper.onDownload(parameters);
    }

    public onEndScreenClose(): void {
        this._adUnit.hide();
    }

    public abstract onKeyEvent(keyCode: number): void;
}
