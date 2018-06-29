import { AdMobSignalFactory } from 'AdMob/AdMobSignalFactory';
import { IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { AdUnitContainer, Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { FocusManager } from 'Managers/FocusManager';
import { GdprManager } from 'Managers/GdprManager';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Managers/SessionManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Campaign } from 'Models/Campaign';
import { ClientInfo } from 'Models/ClientInfo';
import { Configuration } from 'Models/Configuration';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Placement } from 'Models/Placement';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { WebPlayerContainer } from 'Utilities/WebPlayer/WebPlayerContainer';

export class BannerAdUnitParametersFactory {

    private _nativeBridge: NativeBridge;
    private _request: Request;
    private _metadataManager: MetaDataManager;
    private _configuration: Configuration;
    private _container: AdUnitContainer;
    private _deviceInfo: DeviceInfo;
    private _clientInfo: ClientInfo;
    private _sessionManager: SessionManager;
    private _focusManager: FocusManager;
    private _adMobSignalFactory: AdMobSignalFactory;
    private _webPlayerContainer: WebPlayerContainer;
    private _gdprManager: GdprManager;

    constructor(nativeBridge: NativeBridge, request: Request, metadataManager: MetaDataManager, configuration: Configuration, container: AdUnitContainer, deviceInfo: DeviceInfo, clientInfo: ClientInfo, sessionManager: SessionManager, focusManager: FocusManager, analyticsManager: AnalyticsManager, adMobSignalFactory: AdMobSignalFactory, gdprManager: GdprManager, webPlayerContainer: WebPlayerContainer) {
        this._nativeBridge = nativeBridge;
        this._request = request;
        this._metadataManager = metadataManager;
        this._configuration = configuration;
        this._container = container;
        this._deviceInfo = deviceInfo;
        this._clientInfo = clientInfo;
        this._sessionManager = sessionManager;
        this._focusManager = focusManager;
        this._adMobSignalFactory = adMobSignalFactory;
        this._gdprManager = gdprManager;
        this._webPlayerContainer = webPlayerContainer;
    }

    public create(campaign: Campaign, placement: Placement, options: any): Promise<IAdUnitParameters<Campaign>> {
        return Promise.all([
            this.getDeviceOrientation()
        ]).then(([orientation]) => {
            return {
                forceOrientation: orientation,
                webPlayerContainer: this._webPlayerContainer,
                focusManager: this._focusManager,
                container: this._container,
                deviceInfo: this._deviceInfo,
                clientInfo: this._clientInfo,
                thirdPartyEventManager: new ThirdPartyEventManager(this._nativeBridge, this._request, {
                    '%ZONE%': placement.getId(),
                    '%SDK_VERSION%': this._clientInfo.getSdkVersion().toString(),
                }),
                operativeEventManager: OperativeEventManagerFactory.createOperativeEventManager({
                    nativeBridge: this._nativeBridge,
                    request: this._request,
                    metaDataManager: this._metadataManager,
                    sessionManager: this._sessionManager,
                    clientInfo: this._clientInfo,
                    deviceInfo: this._deviceInfo,
                    configuration: this._configuration,
                    campaign: campaign
                }),
                placement: placement,
                campaign: campaign,
                configuration: this._configuration,
                request: this._request,
                options: options,
                adMobSignalFactory: this._adMobSignalFactory,
                gdprManager: this._gdprManager
            };
        });
    }

    private getDeviceOrientation(): Promise<Orientation> {
        return Promise.all([
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight()
        ]).then(([width, height]) => width >= height ? Orientation.LANDSCAPE : Orientation.LANDSCAPE);
    }
}
