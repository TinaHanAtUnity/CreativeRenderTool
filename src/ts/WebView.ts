import { NativeBridge, INativeCallback, CallbackStatus } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ConfigManager } from 'Managers/ConfigManager';
import { Configuration, CacheMode } from 'Models/Configuration';
import { CampaignManager } from 'Managers/CampaignManager';
import { Campaign } from 'Models/Campaign';
import { CacheManager, CacheStatus } from 'Managers/CacheManager';
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
import { MetaDataManager } from 'Managers/MetaDataManager';
import { Resolve } from 'Utilities/Resolve';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { AdUnitFactory } from 'AdUnits/AdUnitFactory';
import { VastParser } from 'Utilities/VastParser';
import { StorageType, StorageError } from 'Native/Api/Storage';
import { JsonParser } from 'Utilities/JsonParser';

export class WebView {

    private _nativeBridge: NativeBridge;

    private _deviceInfo: DeviceInfo;
    private _clientInfo: ClientInfo;

    private _request: Request;
    private _resolve: Resolve;
    private _configuration: Configuration;

    private _campaignManager: CampaignManager;
    private _cacheManager: CacheManager;

    private _adUnit: AbstractAdUnit;
    private _campaign: Campaign;

    private _sessionManager: SessionManager;
    private _eventManager: EventManager;
    private _wakeUpManager: WakeUpManager;

    private _showing: boolean = false;
    private _initialized: boolean = false;
    private _initializedAt: number;
    private _mustReinitialize: boolean = false;
    private _configJsonCheckedAt: number;
    private _mustRefill: boolean;
    private _refillTimestamp: number;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;

        if(window && window.addEventListener) {
            window.addEventListener('error', (event) => this.onError(<ErrorEvent>event), false);
        }
    }

    public initialize(): Promise<void> {
        return this._nativeBridge.Sdk.loadComplete().then((data) => {
            this._deviceInfo = new DeviceInfo(this._nativeBridge);
            this._wakeUpManager = new WakeUpManager(this._nativeBridge);
            this._cacheManager = new CacheManager(this._nativeBridge, this._wakeUpManager);
            this._request = new Request(this._nativeBridge, this._wakeUpManager);
            this._resolve = new Resolve(this._nativeBridge);
            this._eventManager = new EventManager(this._nativeBridge, this._request);
            this._clientInfo = new ClientInfo(this._nativeBridge.getPlatform(), data);
            return this._deviceInfo.fetch();
        }).then(() => {
            if(this._clientInfo.getPlatform() === Platform.ANDROID) {
                document.body.classList.add('android');
                this._nativeBridge.setApiLevel(this._deviceInfo.getApiLevel());
            } else if(this._clientInfo.getPlatform() === Platform.IOS) {
                let model = this._deviceInfo.getModel();
                if(model.match(/iphone/i) || model.match(/ipod/i)) {
                    document.body.classList.add('iphone');
                } else if(model.match(/ipad/i)) {
                    document.body.classList.add('ipad');
                }
            }

            this._sessionManager = new SessionManager(this._nativeBridge, this._clientInfo, this._deviceInfo, this._eventManager);

            this._initializedAt = this._configJsonCheckedAt = Date.now();
            this._nativeBridge.Sdk.initComplete();

            this._wakeUpManager.setListenConnectivity(true);
            this._wakeUpManager.onNetworkConnected.subscribe(() => this.onNetworkConnected());

            if(this._nativeBridge.getPlatform() === Platform.IOS) {
                this._wakeUpManager.setListenAppForeground(true);
                this._wakeUpManager.onAppForeground.subscribe(() => this.onAppForeground());
            } else {
                this._wakeUpManager.setListenScreen(true);
                this._wakeUpManager.onScreenOn.subscribe(() => this.onScreenOn());
            }

            this._cacheManager.cleanCache();

            return this.setupTestEnvironment();
        }).then(() => {
            return ConfigManager.fetch(this._nativeBridge, this._request, this._clientInfo, this._deviceInfo);
        }).then((configuration) => {
            this._configuration = configuration;
            return this._sessionManager.create();
        }).then(() => {
            let defaultPlacement = this._configuration.getDefaultPlacement();
            this._nativeBridge.Placement.setDefaultPlacement(defaultPlacement.getId());
            this.setPlacementStates(PlacementState.NOT_AVAILABLE);

            this._campaignManager = new CampaignManager(this._nativeBridge, this._request, this._clientInfo, this._deviceInfo, new VastParser());
            this._campaignManager.onCampaign.subscribe((campaign) => this.onCampaign(campaign));
            this._campaignManager.onVastCampaign.subscribe((campaign) => this.onVastCampaign(campaign));
            this._campaignManager.onNoFill.subscribe((retryLimit) => this.onNoFill(retryLimit));
            this._campaignManager.onError.subscribe((error) => this.onCampaignError(error));
            this._refillTimestamp = 0;
            return this._campaignManager.request();
        }).then(() => {
            this._initialized = true;

            return this._eventManager.sendUnsentSessions();
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

        if(this._showing) {
            // do not send finish event because there will be a finish event from currently open ad unit
            this.showError(false, placementId, 'Can\'t show a new ad unit when ad unit is already open');
            return;
        }

        let placement: Placement = this._configuration.getPlacement(placementId);
        if(!placement) {
            this.showError(true, placementId, 'No such placement: ' + placementId);
            return;
        }

        if(!this._campaign) {
            this.showError(true, placementId, 'Campaign not found');
            return;
        }

        if(this._nativeBridge.getPlatform() === Platform.IOS && !this._campaign.getBypassAppSheet()) {
            this._nativeBridge.AppSheet.prepare({
                id: parseInt(this._campaign.getAppStoreId(), 10)
            });
        }

        this._showing = true;

        this.shouldReinitialize().then((reinitialize) => {
            this._mustReinitialize = reinitialize;
        });

        if(this._configuration.getCacheMode() === CacheMode.ALLOWED) {
            this._cacheManager.stop();
        }

        MetaDataManager.fetchPlayerMetaData(this._nativeBridge).then(player => {
            if(player) {
                this._sessionManager.setGamerServerId(player.getServerId());
            }

            this._adUnit = AdUnitFactory.createAdUnit(this._nativeBridge, this._sessionManager, placement, this._campaign, this._configuration);
            this._adUnit.setNativeOptions(options);
            this._adUnit.onNewAdRequestAllowed.subscribe(() => this.onNewAdRequestAllowed());
            this._adUnit.onClose.subscribe(() => this.onClose());

            this._adUnit.show().then(() => {
                this._sessionManager.sendShow(this._adUnit);
            });

            this._campaign = null;
            this.setPlacementStates(PlacementState.WAITING);
            this._refillTimestamp = 0;
            this._mustRefill = true;
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

        let cacheAsset = (url: string) => {
            return this._cacheManager.cache(url, { retries: 5 }).then(([status, fileId]) => {
                if(status === CacheStatus.OK) {
                    return this._cacheManager.getFileUrl(fileId);
                }
                throw status;
            }).catch(error => {
                if(error !== CacheStatus.STOPPED) {
                    this.onError(error);
                    return url;
                }
                throw error;
            });
        };

        let cacheAssets = () => {
            return cacheAsset(campaign.getVideoUrl()).then(fileUrl => {
                campaign.setVideoUrl(fileUrl);
                campaign.setVideoCached(true);
            }).then(() =>
                cacheAsset(campaign.getLandscapeUrl())).then(fileUrl => campaign.setLandscapeUrl(fileUrl)).then(() =>
                cacheAsset(campaign.getPortraitUrl())).then(fileUrl => campaign.setPortraitUrl(fileUrl)).then(() =>
                cacheAsset(campaign.getGameIcon())).then(fileUrl => campaign.setGameIcon(fileUrl)).catch(error => {
                if(error === CacheStatus.STOPPED) {
                    this._nativeBridge.Sdk.logInfo('Caching was stopped, using streaming instead');
                }
            });
        };

        let sendReady = () => {
            this.setPlacementStates(PlacementState.READY);
        };

        if(cacheMode === CacheMode.FORCED) {
            cacheAssets().then(() => {
                if(this._showing) {
                    let onCloseObserver = this._adUnit.onClose.subscribe(() => {
                        this._adUnit.onClose.unsubscribe(onCloseObserver);
                        sendReady();
                    });
                } else {
                    sendReady();
                }
            });
        } else if(cacheMode === CacheMode.ALLOWED) {
            if(this._showing) {
                let onCloseObserver = this._adUnit.onClose.subscribe(() => {
                    this._adUnit.onClose.unsubscribe(onCloseObserver);
                    cacheAssets();
                    sendReady();
                });
            } else {
                cacheAssets();
                sendReady();
            }
        } else {
            sendReady();
        }
    }

    private onVastCampaign(campaign: Campaign): void {
        this._campaign = campaign;

        let cacheMode = this._configuration.getCacheMode();

        let cacheAsset = (url: string) => {
            return this._cacheManager.cache(url, { retries: 5 }).then(([status, fileId]) => {
                if(status === CacheStatus.OK) {
                    return this._cacheManager.getFileUrl(fileId);
                }
                throw status;
            }).catch(error => {
                if(error !== CacheStatus.STOPPED) {
                    this.onError(error);
                    return url;
                }
                throw error;
            });
        };

        let cacheAssets = () => {
            let videoUrl = campaign.getVideoUrl();
            // todo: this is a temporary hack to follow video url 302 redirects until we get the real video location
            // todo: remove this when CacheManager is refactored to support redirects
            return this._request.head(videoUrl, [], {
                retries: 5,
                retryDelay: 1000,
                followRedirects: true,
                retryWithConnectionEvents: false
            }).then(response => {
                let locationUrl = response.url || videoUrl;
                cacheAsset(locationUrl).then(fileUrl => {
                    campaign.setVideoUrl(fileUrl);
                    campaign.setVideoCached(true);
                }).catch(error => {
                    if(error === CacheStatus.STOPPED) {
                        this._nativeBridge.Sdk.logInfo('Caching was stopped, using streaming instead');
                    }
                });
            }).catch(error => {
                this._nativeBridge.Sdk.logError('Caching failed to get VAST video URL location: ' + error);
            });
        };

        let sendReady = () => {
            this.setPlacementStates(PlacementState.READY);
        };

        if(cacheMode === CacheMode.FORCED) {
            cacheAssets().then(() => {
                if(this._showing) {
                    let onCloseObserver = this._adUnit.onClose.subscribe(() => {
                        this._adUnit.onClose.unsubscribe(onCloseObserver);
                        sendReady();
                    });
                } else {
                    sendReady();
                }
            });
        } else if(cacheMode === CacheMode.ALLOWED) {
            if(this._showing) {
                let onCloseObserver = this._adUnit.onClose.subscribe(() => {
                    this._adUnit.onClose.unsubscribe(onCloseObserver);
                    cacheAssets();
                    sendReady();
                });
            } else {
                cacheAssets();
                sendReady();
            }
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
        this.onNoFill(3600); // todo: on errors, retry again in an hour
    }

    private onNewAdRequestAllowed(): void {
        if(this._mustRefill) {
            this._mustRefill = false;
            this._campaignManager.request();
        }
    }

    private onClose(): void {
        this._nativeBridge.Sdk.logInfo('Closing Unity Ads ad unit');
        this._showing = false;
        if(this._mustReinitialize) {
            this._nativeBridge.Sdk.logInfo('Unity Ads webapp has been updated, reinitializing Unity Ads');
            this.reinitialize();
        } else {
            if(this._mustRefill) {
                this._mustRefill = false;
                this._campaignManager.request();
            }
            this._sessionManager.create();
        }
    }

    private isShowing(): boolean {
        return this._showing;
    }

    /*
     CONNECTIVITY AND USER ACTIVITY EVENT HANDLERS
     */

    private onNetworkConnected() {
        if(!this.isShowing() && this._initialized) {
            this.shouldReinitialize().then((reinitialize) => {
                if(reinitialize) {
                    if(this.isShowing()) {
                        this._mustReinitialize = true;
                    } else {
                        this._nativeBridge.Sdk.logInfo('Unity Ads webapp has been updated, reinitializing Unity Ads');
                        this.reinitialize();
                    }
                } else {
                    this.checkRefill();
                    this._eventManager.sendUnsentSessions();
                }
            });
        }
    }

    private onScreenOn(): void {
        this.checkRefill();
    }

    private onAppForeground(): void {
        this.checkRefill();
    }

    private checkRefill(): void {
        if(this._refillTimestamp !== 0 && Date.now() > this._refillTimestamp) {
            this._refillTimestamp = 0;
            this._campaignManager.request();
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
            let configJson = JsonParser.parse(response.response);
            return configJson.hash !== this._clientInfo.getWebviewHash();
        }).catch((error) => {
            return false;
        });
    }

    /*
     TEST HELPERS
     */

    private setupTestEnvironment(): void {
        this._nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'test.serverUrl.value').then((url) => {
            if(url) {
                ConfigManager.setTestBaseUrl(url);
                CampaignManager.setTestBaseUrl(url);
                SessionManager.setTestBaseUrl(url);

                this._nativeBridge.Storage.delete(StorageType.PUBLIC, 'test.serverUrl');
                this._nativeBridge.Storage.write(StorageType.PUBLIC);
            }
        }).catch(([error]) => {
            switch(error) {
                case StorageError[StorageError.COULDNT_GET_VALUE]:
                    // normal case, use default urls
                    break;

                default:
                    throw new Error(error);
            }
        });

        this._nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'test.kafkaUrl.value').then((url) => {
            if(url) {
                Diagnostics.setTestBaseUrl(url);

                this._nativeBridge.Storage.delete(StorageType.PUBLIC, 'test.kafkaUrl');
                this._nativeBridge.Storage.write(StorageType.PUBLIC);
            }
        }).catch(([error]) => {
            switch(error) {
                case StorageError[StorageError.COULDNT_GET_VALUE]:
                    // normal case, use default urls
                    break;

                default:
                    throw new Error(error);
            }
        });
    }
}
