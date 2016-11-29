import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { HtmlCampaign } from 'Models/HtmlCampaign';
import { CacheStatus, CacheManager } from '../Utilities/CacheManager';
import { PlacementState } from 'Models/Placement';
import { CacheMode, Configuration } from 'Models/Configuration';
import { Platform } from 'Constants/Platform';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Diagnostics } from 'Utilities/Diagnostics';
import { RequestError } from 'Errors/RequestError';
import { Request } from 'Utilities/Request';
import { NativeBridge } from 'Native/NativeBridge';
import { CampaignManager } from 'Managers/CampaignManager';
import { ConfigManager } from 'Managers/ConfigManager';

export class CampaignEventHandlers {

    public static onPerformanceCampaign(nativeBridge: NativeBridge, configuration: Configuration, campaignManager: CampaignManager, cacheManager: CacheManager, campaign: PerformanceCampaign) {
        const cacheAsset = (url: string, failAllowed: boolean) => {
            return cacheManager.cache(url, {
                retries: 5,
                allowFailure: failAllowed
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
                    nativeBridge.Sdk.logInfo('Caching was stopped, using streaming instead');
                } else if(!failAllowed && error === CacheStatus.FAILED) {
                    throw error;
                }
            });
        };

        const sendReady = () => {
            ConfigManager.setPlacementStates(nativeBridge, configuration, PlacementState.READY);
        };

        const cacheMode = this._configuration.getCacheMode();
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

    public static onVastCampaign(campaign: VastCampaign) {
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

    public static onHtmlCampaign(campaign: HtmlCampaign) {
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

    public static onNoFill(nativeBridge: NativeBridge, configuration: Configuration, campaignManager: CampaignManager) {
        campaignManager.setRefillTimestamp(Date.now() + 3600 * 1000);
        campaignManager.setCampaignTimeout(0)
        nativeBridge.Sdk.logInfo('Unity Ads server returned no fill, no ads to show');
        ConfigManager.setPlacementStates(nativeBridge, configuration, PlacementState.NO_FILL);
    }

    public static onError(nativeBridge: NativeBridge, error: Error) {
        let responseCode: string = '';
        if(error instanceof RequestError) {
            const requestError = <RequestError>error;
            if (requestError.nativeResponse && requestError.nativeResponse.response) {
                responseCode = requestError.nativeResponse.responseCode.toString();
            }
        } else if(error instanceof Error && !(error instanceof DiagnosticError)) {
            error = { 'message': error.message, 'name': error.name, 'stack': error.stack };
        }

        nativeBridge.Sdk.logError(JSON.stringify(error));
        Diagnostics.trigger({
            'type': 'campaign_request_failed',
            'error': error
        });
        if (!Request._errorResponseCodes.exec(responseCode)) {
            this.onNoFill(3600); // todo: on errors, retry again in an hour
        }
    }

}
