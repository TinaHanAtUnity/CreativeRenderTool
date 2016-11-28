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
import { JsonParser } from 'Utilities/JsonParser';
import { MetaData } from 'Utilities/MetaData';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { HtmlCampaign } from 'Models/HtmlCampaign';
import { Overlay } from 'Views/Overlay';
import { IosUtils } from 'Utilities/IosUtils';
import { HttpKafka } from 'Utilities/HttpKafka';
import { ConfigError } from 'Errors/ConfigError';

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
    private _campaignTimeout: number;

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
            this._clientInfo = new ClientInfo(this._nativeBridge.getPlatform(), data);
            this._eventManager = new EventManager(this._nativeBridge, this._request);
            HttpKafka.setRequest(this._request);
            HttpKafka.setClientInfo(this._clientInfo);

            return this._deviceInfo.fetch();
        }).then(() => {
            if(this._clientInfo.getPlatform() === Platform.ANDROID) {
                document.body.classList.add('android');
                this._nativeBridge.setApiLevel(this._deviceInfo.getApiLevel());
            } else if(this._clientInfo.getPlatform() === Platform.IOS) {
                const model = this._deviceInfo.getModel();
                if(model.match(/iphone/i) || model.match(/ipod/i)) {
                    document.body.classList.add('iphone');
                } else if(model.match(/ipad/i)) {
                    document.body.classList.add('ipad');
                }
            }
            HttpKafka.setDeviceInfo(this._deviceInfo);
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
            HttpKafka.setConfiguration(this._configuration);
            return this._sessionManager.create();
        }).then(() => {
            const defaultPlacement = this._configuration.getDefaultPlacement();
            this._nativeBridge.Placement.setDefaultPlacement(defaultPlacement.getId());
            this.setPlacementStates(PlacementState.NOT_AVAILABLE);

            this._campaignManager = new CampaignManager(this._nativeBridge, this._request, this._clientInfo, this._deviceInfo, new VastParser());
            this._campaignManager.onCampaign.subscribe(campaign => this.onCampaign(campaign));
            this._campaignManager.onVastCampaign.subscribe(campaign => this.onVastCampaign(campaign));
            this._campaignManager.onThirdPartyCampaign.subscribe(campaign => this.onThirdPartyCampaign(campaign));
            this._campaignManager.onNoFill.subscribe(retryLimit => this.onNoFill(retryLimit));
            this._campaignManager.onError.subscribe(error => this.onCampaignError(error));
            this._refillTimestamp = 0;
            this._campaignTimeout = 0;
            return this._campaignManager.request();
        }).then(() => {
            this._initialized = true;

            return this._eventManager.sendUnsentSessions();
        }).catch(error => {
            if(error instanceof ConfigError) {
                error = { 'message': error.message, 'name': error.name };
                this._nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.INITIALIZE_FAILED], error.message);
            } else if(error instanceof Error) {
                error = { 'message': error.message, 'name': error.name, 'stack': error.stack };
                if(error.message === UnityAdsError[UnityAdsError.INVALID_ARGUMENT]) {
                    this._nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.INVALID_ARGUMENT], 'Game ID is not valid');
                }
            }
            this._nativeBridge.Sdk.logError(JSON.stringify(error));
            Diagnostics.trigger({
                'type': 'initialization_error',
                'error': error
            });
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

        const placement: Placement = this._configuration.getPlacement(placementId);
        if(!placement) {
            this.showError(true, placementId, 'No such placement: ' + placementId);
            return;
        }

        if(!this._campaign) {
            this.showError(true, placementId, 'Campaign not found');
            return;
        }

        if(this.isCampaignExpired()) {
            this._campaignTimeout = 0;
            this.showError(true, placementId, 'Campaign has expired');
            this.onCampaignExpired();

            const error = new DiagnosticError(new Error('Campaign expired'), {
                id: this._campaign.getId(),
                appStoreId: this._campaign.getAppStoreId(),
                timeoutInSeconds: this._campaign.getTimeoutInSeconds()
            });

            Diagnostics.trigger({
                type: 'campaign_expired',
                error: error
            });

            return;
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

            this._adUnit = AdUnitFactory.createAdUnit(this._nativeBridge, this._deviceInfo, this._sessionManager, placement, this._campaign, this._configuration, options);
            this._adUnit.onFinish.subscribe(() => this.onNewAdRequestAllowed());
            this._adUnit.onClose.subscribe(() => this.onClose());

            if (this._nativeBridge.getPlatform() === Platform.IOS && !(this._campaign instanceof VastCampaign)) {
                if(!IosUtils.isAppSheetBroken(this._deviceInfo.getOsVersion()) && !this._campaign.getBypassAppSheet()) {
                    const appSheetOptions = {
                        id: parseInt(this._campaign.getAppStoreId(), 10)
                    };
                    this._nativeBridge.AppSheet.prepare(appSheetOptions).then(() => {
                        const onCloseObserver = this._nativeBridge.AppSheet.onClose.subscribe(() => {
                            this._nativeBridge.AppSheet.prepare(appSheetOptions);
                        });
                        this._adUnit.onClose.subscribe(() => {
                            this._nativeBridge.AppSheet.onClose.unsubscribe(onCloseObserver);
                            this._nativeBridge.AppSheet.destroy(appSheetOptions);
                        });
                    });
                }
            }

            this._adUnit.show();

            delete this._campaign;
            this.setPlacementStates(PlacementState.WAITING);
            this._refillTimestamp = 0;
            this._campaignTimeout = 0;
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
        const placements: { [id: string]: Placement } = this._configuration.getPlacements();
        for(const placementId in placements) {
            if(placements.hasOwnProperty(placementId)) {
                const placement: Placement = placements[placementId];
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
        this._refillTimestamp = 0;
        this.setCampaignTimeout(campaign.getTimeoutInSeconds());

        const cacheMode = this._configuration.getCacheMode();

        const cacheAsset = (url: string, failAllowed: boolean) => {
            return this._cacheManager.cache(url, { retries: 5 }).then(([status, fileId]) => {
                if(status === CacheStatus.OK) {
                    return this._cacheManager.getFileUrl(fileId);
                }
                throw status;
            }).catch(error => {
                if(failAllowed === true && error === CacheStatus.FAILED) {
                    return url;
                }
                throw error;
            });
        };

        const cacheAssets = (failAllowed: boolean) => {
            return cacheAsset(campaign.getVideoUrl(), failAllowed).then(fileUrl => {
                campaign.setVideoUrl(fileUrl);
                campaign.setVideoCached(true);
            }).then(() =>
                cacheAsset(campaign.getLandscapeUrl(), failAllowed)).then(fileUrl => campaign.setLandscapeUrl(fileUrl)).then(() =>
                cacheAsset(campaign.getPortraitUrl(), failAllowed)).then(fileUrl => campaign.setPortraitUrl(fileUrl)).then(() =>
                cacheAsset(campaign.getGameIcon(), failAllowed)).then(fileUrl => campaign.setGameIcon(fileUrl)).catch(error => {
                if(error === CacheStatus.STOPPED) {
                    this._nativeBridge.Sdk.logInfo('Caching was stopped, using streaming instead');
                } else if(!failAllowed && error === CacheStatus.FAILED) {
                    throw error;
                }
            });
        };

        const sendReady = () => {
            this.setPlacementStates(PlacementState.READY);
        };

        if(cacheMode === CacheMode.FORCED) {
            cacheAssets(false).then(() => {
                if(this._showing) {
                    const onCloseObserver = this._adUnit.onClose.subscribe(() => {
                        this._adUnit.onClose.unsubscribe(onCloseObserver);
                        sendReady();
                    });
                } else {
                    sendReady();
                }
            }).catch(() => {
                this._nativeBridge.Sdk.logError('Caching failed when cache mode is forced, setting no fill');
                this.onNoFill(3600);
            });
        } else if(cacheMode === CacheMode.ALLOWED) {
            cacheAssets(true);
            if(this._showing) {
                const onCloseObserver = this._adUnit.onClose.subscribe(() => {
                    this._adUnit.onClose.unsubscribe(onCloseObserver);
                    sendReady();
                });
            } else {
                sendReady();
            }
        } else {
            if(this._showing) {
                const onCloseObserver = this._adUnit.onClose.subscribe(() => {
                    this._adUnit.onClose.unsubscribe(onCloseObserver);
                    sendReady();
                });
            } else {
                sendReady();
            }
        }
    }

    private onVastCampaign(campaign: Campaign): void {
        this._campaign = campaign;
        this._refillTimestamp = 0;
        this.setCampaignTimeout(campaign.getTimeoutInSeconds());

        const cacheMode = this._configuration.getCacheMode();

        const cacheAsset = (url: string, failAllowed: boolean) => {
            return this._cacheManager.cache(url, { retries: 5 }).then(([status, fileId]) => {
                if(status === CacheStatus.OK) {
                    return this._cacheManager.getFileUrl(fileId);
                }
                throw status;
            }).catch(error => {
                if(failAllowed === true && error === CacheStatus.FAILED) {
                    return url;
                }
                throw error;
            });
        };

        const getVideoUrl = (videoUrl: string) => {
            // todo: this is a temporary hack to follow video url 302 redirects until we get the real video location
            // todo: remove this when CacheManager is refactored to support redirects
            return this._request.head(videoUrl, [], {
                retries: 5,
                retryDelay: 1000,
                followRedirects: true,
                retryWithConnectionEvents: false
            }).then(response => {
                if(response.url) {
                    if(this._nativeBridge.getPlatform() === Platform.IOS && !response.url.match(/^https:\/\//)) {
                        throw new Error('Non https VAST video url after redirects');
                    }
                    return response.url;
                }
                throw new Error('Invalid VAST video url after redirects');
            });
        };

        const cacheAssets = (videoUrl: string, failAllowed: boolean) => {
            return cacheAsset(videoUrl, failAllowed).then(fileUrl => {
                campaign.setVideoUrl(fileUrl);
                campaign.setVideoCached(true);
            }).catch(error => {
                if(error === CacheStatus.STOPPED) {
                    this._nativeBridge.Sdk.logInfo('Caching was stopped, using streaming instead');
                } else if(!failAllowed && error === CacheStatus.FAILED) {
                    throw error;
                }
            });
        };

        const sendReady = () => {
            this.setPlacementStates(PlacementState.READY);
        };

        getVideoUrl(campaign.getVideoUrl()).then((videoUrl: string) => {
            if(cacheMode === CacheMode.FORCED) {
                cacheAssets(videoUrl, false).then(() => {
                    if(this._showing) {
                        const onCloseObserver = this._adUnit.onClose.subscribe(() => {
                            this._adUnit.onClose.unsubscribe(onCloseObserver);
                            sendReady();
                        });
                    } else {
                        sendReady();
                    }
                }).catch(() => {
                    this._nativeBridge.Sdk.logError('Caching failed when cache mode is forced, setting no fill');
                    this.onNoFill(3600);
                });
            } else if(cacheMode === CacheMode.ALLOWED) {
                cacheAssets(videoUrl, true);
                if(this._showing) {
                    const onCloseObserver = this._adUnit.onClose.subscribe(() => {
                        this._adUnit.onClose.unsubscribe(onCloseObserver);
                        sendReady();
                    });
                } else {
                    sendReady();
                }
            } else {
                if(this._showing) {
                    const onCloseObserver = this._adUnit.onClose.subscribe(() => {
                        this._adUnit.onClose.unsubscribe(onCloseObserver);
                        sendReady();
                    });
                } else {
                    sendReady();
                }
            }
        }).catch(() => {
            const message = 'Caching failed to get VAST video URL location';
            const error = new DiagnosticError(new Error(message), {
                url: campaign.getVideoUrl()
            });
            Diagnostics.trigger({
                'type': 'cache_error',
                'error': error
            });
            this._nativeBridge.Sdk.logError(message);
            this.onNoFill(3600);
        });
    }

    private onThirdPartyCampaign(campaign: HtmlCampaign): void {
        this._campaign = campaign;
        this._refillTimestamp = 0;
        this.setCampaignTimeout(campaign.getTimeoutInSeconds());

        const cacheMode = this._configuration.getCacheMode();

        const cacheAsset = (url: string, failAllowed: boolean) => {
            return this._cacheManager.cache(url, { retries: 5 }).then(([status, fileId]) => {
                if(status === CacheStatus.OK) {
                    return this._cacheManager.getFileUrl(fileId);
                }
                throw status;
            }).catch(error => {
                if(failAllowed === true && error === CacheStatus.FAILED) {
                    return url;
                }
                throw error;
            });
        };

        const cacheAssets = (failAllowed: boolean) => {
            const resourceUrl = campaign.getResourceUrl();
            return cacheAsset(resourceUrl, failAllowed).then(fileUrl => {
                campaign.setResourceUrl(fileUrl);
                campaign.setVideoCached(true);
            }).catch(error => {
                if(error === CacheStatus.STOPPED) {
                    this._nativeBridge.Sdk.logInfo('Caching was stopped, using streaming instead');
                } else if(!failAllowed && error === CacheStatus.FAILED) {
                    throw error;
                }
            });
        };

        const sendReady = () => {
            this.setPlacementStates(PlacementState.READY);
        };

        if(cacheMode === CacheMode.FORCED) {
            cacheAssets(false).then(() => {
                if(this._showing) {
                    const onCloseObserver = this._adUnit.onClose.subscribe(() => {
                        this._adUnit.onClose.unsubscribe(onCloseObserver);
                        sendReady();
                    });
                } else {
                    sendReady();
                }
            }).catch(() => {
                this._nativeBridge.Sdk.logError('Caching failed when cache mode is forced, setting no fill');
                this.onNoFill(3600);
            });
        } else if(cacheMode === CacheMode.ALLOWED) {
            cacheAssets(true);
            if(this._showing) {
                const onCloseObserver = this._adUnit.onClose.subscribe(() => {
                    this._adUnit.onClose.unsubscribe(onCloseObserver);
                    sendReady();
                });
            } else {
                sendReady();
            }
        } else {
            if(this._showing) {
                const onCloseObserver = this._adUnit.onClose.subscribe(() => {
                    this._adUnit.onClose.unsubscribe(onCloseObserver);
                    sendReady();
                });
            } else {
                sendReady();
            }
        }
    }

    private onNoFill(retryTime: number) {
        this._refillTimestamp = Date.now() + retryTime * 1000;
        this._campaignTimeout = 0;
        this._nativeBridge.Sdk.logInfo('Unity Ads server returned no fill, no ads to show');
        this.setPlacementStates(PlacementState.NO_FILL);
    }

    private setCampaignTimeout(campaignTimeout: number) {
        if(campaignTimeout === 0) {
            this._campaignTimeout = 0;
        } else {
            this._nativeBridge.Sdk.logInfo('Campaign will expire in ' + campaignTimeout + ' seconds');
            this._campaignTimeout = Date.now() + campaignTimeout * 1000;
        }
    }

    private onCampaignExpired() {
        this._nativeBridge.Sdk.logInfo('Unity Ads campaign has expired, requesting new ads');
        this.setPlacementStates(PlacementState.NO_FILL);
        this._campaignManager.request();
    }

    private onCampaignError(error: any) {
        if(error instanceof Error && !(error instanceof DiagnosticError)) {
            error = { 'message': error.message, 'name': error.name, 'stack': error.stack };
        }

        this._nativeBridge.Sdk.logError(JSON.stringify(error));
        Diagnostics.trigger({
            'type': 'campaign_request_failed',
            'error': error
        });

        this.onNoFill(3600); // todo: on errors, retry again in an hour
    }

    private onNewAdRequestAllowed(): void {
        if(this._mustRefill && !this._mustReinitialize) {
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
                    this.checkCampaignStatus();
                    this._eventManager.sendUnsentSessions();
                }
            });
        }
    }

    private onScreenOn(): void {
        this.checkCampaignStatus();
    }

    private onAppForeground(): void {
        this.checkCampaignStatus();
    }

    private checkCampaignStatus(): void {
        if(this._refillTimestamp !== 0 && Date.now() > this._refillTimestamp) {
            this._refillTimestamp = 0;
            this._campaignManager.request();
        } else {
            if(this.isCampaignExpired()) {
                this._campaignTimeout = 0;
                this.onCampaignExpired();
            }
        }
    }

    private isCampaignExpired(): boolean {
        return this._campaignTimeout !== 0 && Date.now() > this._campaignTimeout;
    }

    /*
     GENERIC ONERROR HANDLER
     */
    private onError(event: ErrorEvent): boolean {
        Diagnostics.trigger({
            'type': 'js_error',
            'message': event.message,
            'url': event.filename,
            'line': event.lineno,
            'column': event.colno,
            'object': event.error
        });
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
            const configJson = JsonParser.parse(response.response);
            return configJson.hash !== this._clientInfo.getWebviewHash();
        }).catch((error) => {
            return false;
        });
    }

    /*
     TEST HELPERS
     */

    private setupTestEnvironment(): void {
        const metaData: MetaData = new MetaData(this._nativeBridge);

        metaData.get<string>('test.serverUrl', true).then(([found, url]) => {
            if(found && url) {
                ConfigManager.setTestBaseUrl(url);
                CampaignManager.setTestBaseUrl(url);
                SessionManager.setTestBaseUrl(url);
            }
        });

        metaData.get<string>('test.kafkaUrl', true).then(([found, url]) => {
            if(found && url) {
                HttpKafka.setTestBaseUrl(url);
            }
        });

        metaData.get<string>('test.abGroup', true).then(([found, abGroup]) => {
            if(found && typeof abGroup === 'number') {
                CampaignManager.setAbGroup(abGroup);
            }
        });

        metaData.get<boolean>('test.autoSkip', true).then(([found, autoSkip]) => {
            if(found && autoSkip !== null) {
                Overlay.setAutoSkip(autoSkip);
            }
        });

        metaData.get<boolean>('test.autoClose', false).then(([found, autoClose]) => {
            if(found && autoClose) {
                AbstractAdUnit.setAutoClose(autoClose);
            }
        });
    }
}
