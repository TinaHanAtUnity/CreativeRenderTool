import { NativeBridge, INativeCallback, CallbackStatus } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ConfigManager } from 'Managers/ConfigManager';
import { Configuration, CacheMode } from 'Models/Configuration';
import { CampaignManager } from 'Managers/CampaignManager';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { Campaign } from 'Models/Campaign';
import { CacheManager } from 'Managers/CacheManager';
import { Placement, PlacementState } from 'Models/Placement';
import { Request, INativeResponse } from 'Utilities/Request';
import { SessionManager } from 'Managers/SessionManager';
import { ClientInfo } from 'Models/ClientInfo';
import { Diagnostics } from 'Utilities/Diagnostics';
import { EventManager } from 'Managers/EventManager';
import { FinishState } from 'Constants/FinishState';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { KeyCode } from 'Constants/Android/KeyCode';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { Platform } from 'Constants/Platform';
import { PlayerMetaData } from 'Models/MetaData/PlayerMetaData';
import { Resolve } from 'Utilities/Resolve';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { AdUnitFactory } from './AdUnits/AdUnitFactory';
import { VastParser } from 'Utilities/VastParser';

export class WebView {

    private _nativeBridge: NativeBridge;

    private _deviceInfo: DeviceInfo;
    private _clientInfo: ClientInfo;

    private _request: Request;
    private _resolve: Resolve;
    private _configuration: Configuration;

    private _campaignManager: CampaignManager;
    private _cacheManager: CacheManager;

    private _campaign: Campaign;

    private _sessionManager: SessionManager;
    private _eventManager: EventManager;
    private _wakeUpManager: WakeUpManager;

    private _initializedAt: number;
    private _mustReinitialize: boolean = false;
    private _configJsonCheckedAt: number;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;

        if(window && window.addEventListener) {
            window.addEventListener('error', this.onError.bind(this), false);
        }

        this._deviceInfo = new DeviceInfo();
        this._cacheManager = new CacheManager(this._nativeBridge);
        this._wakeUpManager = new WakeUpManager(this._nativeBridge);
        this._request = new Request(this._nativeBridge, this._wakeUpManager);
        this._resolve = new Resolve(this._nativeBridge);
        this._eventManager = new EventManager(this._nativeBridge, this._request);
    }

    public initialize(): Promise<void> {
        return this._nativeBridge.Sdk.loadComplete().then((data) => {
            this._clientInfo = new ClientInfo(data);
            return this._deviceInfo.fetch(this._nativeBridge, this._clientInfo.getPlatform());
        }).then(() => {
            if(this._clientInfo.getPlatform() === Platform.ANDROID) {
                document.body.classList.add('android');
            } else if(this._clientInfo.getPlatform() === Platform.IOS) {
                let model = this._deviceInfo.getModel();
                if(model.match(/iphone/i)) {
                    document.body.classList.add('iphone');
                } else if(model.match(/ipad/i)) {
                    document.body.classList.add('ipad');
                }
            }
            return this._cacheManager.cleanCache();
        }).then(() => {
            return ConfigManager.fetch(this._nativeBridge, this._request, this._clientInfo, this._deviceInfo);
        }).then((configuration) => {
            this._configuration = configuration;
            this._sessionManager = new SessionManager(this._nativeBridge, this._clientInfo, this._deviceInfo, this._eventManager);
            return this._sessionManager.create();
        }).then(() => {
            let defaultPlacement = this._configuration.getDefaultPlacement();
            this._nativeBridge.Placement.setDefaultPlacement(defaultPlacement.getId());
            this.setPlacementStates(PlacementState.NOT_AVAILABLE);

            this._campaignManager = new CampaignManager(this._nativeBridge, this._request, this._clientInfo, this._deviceInfo, new VastParser());
            this._campaignManager.onCampaign.subscribe(this.onCampaign.bind(this));
            this._campaignManager.onError.subscribe(this.onCampaignError.bind(this));
            this._campaignManager.request();

            this._initializedAt = this._configJsonCheckedAt = Date.now();

            this._wakeUpManager.setListenConnectivity(true);
            this._wakeUpManager.onNetworkConnected.subscribe(this.onNetworkConnected.bind(this));

            this._eventManager.sendUnsentSessions();

            return this._nativeBridge.Sdk.initComplete();
        }).catch(error => {
            if(error instanceof Error) {
                error = {'message': error.message, 'name': error.name, 'stack': error.stack};
                if (error.message === UnityAdsError[UnityAdsError.INVALID_ARGUMENT]) {
                    this._nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.INVALID_ARGUMENT], 'Game ID is not valid');
                }
            }
            this._nativeBridge.Sdk.logError(JSON.stringify(error));
            Diagnostics.trigger(this._eventManager, {
                'type': 'unhandled_initialization_error',
                'error': error
            }, this._clientInfo, this._deviceInfo);
        });
    }

    /*
     PUBLIC API EVENT HANDLERS
     */

    public show(placementId: string, requestedOrientation: ScreenOrientation, callback: INativeCallback): void {
        callback(CallbackStatus.OK);

        this.shouldReinitialize().then((reinitialize) => {
            this._mustReinitialize = reinitialize;
        });

        let placement: Placement = this._configuration.getPlacement(placementId);
        if(!placement) {
            this.showError(true, placementId, 'No such placement: ' + placementId);
            return;
        }

        if(!this._campaign) {
            this.showError(true, placementId, 'Campaign not found');
            return;
        }

        let orientation: ScreenOrientation = requestedOrientation;
        if(!placement.useDeviceOrientationForVideo()) {
            orientation = ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
        }

        let keyEvents: any[] = [];
        if(placement.disableBackButton()) {
            keyEvents = [KeyCode.BACK];
        }

        PlayerMetaData.fetch(this._nativeBridge).then(player => {
            if(player) {
                this._sessionManager.setGamerSid(player.getSid());
            }

            let adUnit: AbstractAdUnit = AdUnitFactory.createAdUnit(this._nativeBridge, this._sessionManager, placement, this._campaign);
            adUnit.onClose.subscribe(this.onClose.bind(this));
            adUnit.show(orientation, keyEvents).then(() => {
                this._sessionManager.sendShow(adUnit);
            });

            this._campaign = null;
            this.setPlacementStates(PlacementState.WAITING);
            this._campaignManager.request();
        });
    }

    private showError(sendFinish: boolean, placementId: string, errorMsg: string): void {
        this._nativeBridge.Sdk.logError('Show invocation failed: ' + errorMsg);
        this._nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.SHOW_ERROR], errorMsg);
        if (sendFinish) {
            this._nativeBridge.Listener.sendFinishEvent(placementId, FinishState.ERROR);
        }
    }

    private setPlacementStates(placementState: PlacementState): void {
        let placements: { [id: string]: Placement } = this._configuration.getPlacements();
        for(let placementId in placements) {
            if(placements.hasOwnProperty(placementId)) {
                let placement: Placement = placements[placementId];
                this._nativeBridge.Placement.setPlacementState(placement.getId(), placementState);
                if(placementState === PlacementState.READY) {
                    this._nativeBridge.Listener.sendReadyEvent(placement.getId());
                }
            }
        }
    }

    /*
     CAMPAIGN EVENT HANDLERS
     */

    private onCampaign(campaign: Campaign): void {
        this._campaign = campaign;

        let cacheMode = this._configuration.getCacheMode();

        let cacheableAssets: string[] = [
            campaign.getGameIcon(),
            campaign.getLandscapeUrl(),
            campaign.getPortraitUrl(),
            campaign.getVideoUrl()
        ].filter((asset: string) => {
            return asset != null;
        });

        let cacheAssets = () => {
            return this._cacheManager.cacheAll(cacheableAssets).then(fileUrls => {
                campaign.setGameIcon(fileUrls[campaign.getGameIcon()]);
                campaign.setLandscapeUrl(fileUrls[campaign.getLandscapeUrl()]);
                campaign.setPortraitUrl(fileUrls[campaign.getPortraitUrl()]);
                campaign.setVideoUrl(fileUrls[campaign.getVideoUrl()]);
            });
        };

        let sendReady = () => {
            this.setPlacementStates(PlacementState.READY);
        };

        if(cacheMode === CacheMode.FORCED) {
            cacheAssets().then(sendReady);
        } else if(cacheMode === CacheMode.ALLOWED) {
            cacheAssets();
            sendReady();
        } else {
            sendReady();
        }
    }

    private onCampaignError(error: any) {
        if(error instanceof Error) {
            error = {'message': error.message, 'name': error.name, 'stack': error.stack};
        }
        this._nativeBridge.Sdk.logError(JSON.stringify(error));
        Diagnostics.trigger(this._eventManager, {
            'type': 'campaign_request_failed',
            'error': error
        }, this._clientInfo, this._deviceInfo);
    }

    private onClose(placement: Placement): void {
        if(this._mustReinitialize) {
            this.reinitialize();
        } else {
            this._sessionManager.create();
        }
    }

    private isShowing(): boolean {
        return true;
    }

    /*
     CONNECTIVITY EVENT HANDLERS
     */

    private onNetworkConnected() {
        if(!this.isShowing()) {
            this.shouldReinitialize().then((reinitialize) => {
                if(reinitialize) {
                    if(this.isShowing()) {
                        this._mustReinitialize = true;
                    } else {
                        this.reinitialize();
                    }
                } else {
                    this._eventManager.sendUnsentSessions();
                }
            });
        }
    }

    /*
     GENERIC ONERROR HANDLER
     */
    private onError(event: ErrorEvent): boolean {
        Diagnostics.trigger(this._eventManager, {
            'type': 'js_error',
            'message': event.message,
            'url': event.filename,
            'line': event.lineno,
            'column': event.colno,
            'object': event.error
        }, this._clientInfo, this._deviceInfo);
        return true; // returning true from window.onerror will suppress the error (in theory)
    }

    /*
     REINITIALIZE LOGIC
     */

    private reinitialize() {
        // todo: make sure session data and other similar things are saved before issuing reinit
        this._nativeBridge.Sdk.reinitialize();
    }

    private getConfigJson(): Promise<INativeResponse> {
        return this._request.get(this._clientInfo.getConfigUrl() + '?ts=' + Date.now() + '&sdkVersion=' + this._clientInfo.getSdkVersion());
    }

    private shouldReinitialize(): Promise<boolean> {
        if(!this._clientInfo.getWebviewHash()) {
            return Promise.resolve(false);
        }
        if(Date.now() - this._configJsonCheckedAt <= 15 * 60 * 1000) {
            return Promise.resolve(false);
        }
        return this.getConfigJson().then(response => {
            this._configJsonCheckedAt = Date.now();
            let configJson = JSON.parse(response.response);
            return configJson.hash === this._clientInfo.getWebviewHash();
        }).catch((error) => {
            return false;
        });
    }
}
