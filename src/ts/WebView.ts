import { NativeBridge, INativeCallback, CallbackStatus } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ConfigManager } from 'Managers/ConfigManager';
import { Configuration, CacheMode } from 'Models/Configuration';
import { CampaignManager } from 'Managers/CampaignManager';
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
import { UnityAdsError } from 'Constants/UnityAdsError';
import { Platform } from 'Constants/Platform';
import { PlayerMetaData } from 'Models/MetaData/PlayerMetaData';
import { Resolve } from 'Utilities/Resolve';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { AdUnitFactory } from 'AdUnits/AdUnitFactory';

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
    private _refillTimestamp: number;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;

        if(window && window.addEventListener) {
            window.addEventListener('error', (event) => this.onError(<ErrorEvent>event), false);
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
            this._clientInfo = new ClientInfo(this._nativeBridge.getPlatform(), data);
            return this._deviceInfo.fetch(this._nativeBridge);
        }).then(() => {
            if(this._clientInfo.getPlatform() === Platform.ANDROID) {
                document.body.classList.add('android');
                this._nativeBridge.setApiLevel(this._deviceInfo.getApiLevel());
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

            this._campaignManager = new CampaignManager(this._nativeBridge, this._request, this._clientInfo, this._deviceInfo);
            this._campaignManager.onCampaign.subscribe((campaign) => this.onCampaign(campaign));
            this._campaignManager.onNoFill.subscribe((retryLimit) => this.onNoFill(retryLimit));
            this._campaignManager.onError.subscribe((error) => this.onCampaignError(error));
            this._refillTimestamp = 0;
            this._campaignManager.request();

            this._initializedAt = this._configJsonCheckedAt = Date.now();

            this._wakeUpManager.setListenConnectivity(true);
            this._wakeUpManager.onNetworkConnected.subscribe(() => this.onNetworkConnected());

            this._eventManager.sendUnsentSessions();

            return this._nativeBridge.Sdk.initComplete();
        }).catch(error => {
            if(error instanceof Error) {
                error = {'message': error.message, 'name': error.name, 'stack': error.stack};
                if(error.message === UnityAdsError[UnityAdsError.INVALID_ARGUMENT]) {
                    this._nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.INVALID_ARGUMENT], 'Game ID is not valid');
                }
            }
            this._nativeBridge.Sdk.logError(JSON.stringify(error));
            Diagnostics.trigger(this._eventManager, {
                'type': 'initialization_error',
                'error': error
            }, this._clientInfo, this._deviceInfo);
        });
    }

    /*
     PUBLIC API EVENT HANDLERS
     */

    public show(placementId: string, options: any, callback: INativeCallback): void {
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

        PlayerMetaData.fetch(this._nativeBridge).then(player => {
            if(player) {
                this._sessionManager.setGamerServerId(player.getServerId());
            }

            let adUnit: AbstractAdUnit = AdUnitFactory.createAdUnit(this._nativeBridge, this._sessionManager, placement, this._campaign);
            adUnit.setNativeOptions(options);
            adUnit.onClose.subscribe(() => this.onClose());

            adUnit.show().then(() => {
                this._sessionManager.sendShow(adUnit);
            });

            this._campaign = null;
            this.setPlacementStates(PlacementState.WAITING);
            this._refillTimestamp = 0;
            this._campaignManager.request();
        });
    }

    private showError(sendFinish: boolean, placementId: string, errorMsg: string): void {
        this._nativeBridge.Sdk.logError('Show invocation failed: ' + errorMsg);
        this._nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.SHOW_ERROR], errorMsg);
        if(sendFinish) {
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
        ];

        if(this._nativeBridge.getPlatform() === Platform.IOS && !campaign.getBypassAppSheet()) {
            this._nativeBridge.AppSheet.prepare({
                id: parseInt(campaign.getAppStoreId(), 10)
            });
        }

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
            cacheAssets().then(() => sendReady());
        } else if(cacheMode === CacheMode.ALLOWED) {
            cacheAssets();
            sendReady();
        } else {
            sendReady();
        }
    }

    private onNoFill(retryTime: number) {
        this._refillTimestamp = Date.now() + retryTime * 1000;
        this._nativeBridge.Sdk.logInfo('Unity Ads server returned no fill, no ads to show');
        this.setPlacementStates(PlacementState.NO_FILL);
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

    private onClose(): void {
        if(this._mustReinitialize) {
            this.reinitialize();
        } else {
            this._sessionManager.create();
        }
    }

    private isShowing(): boolean {
        return true; // todo: fixme?
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
                    if(this._refillTimestamp !== 0 && Date.now() > this._refillTimestamp) {
                        this._refillTimestamp = 0;
                        this._campaignManager.request();
                    }
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
