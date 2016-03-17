import { NativeBridge, INativeCallback, CallbackStatus } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ConfigManager } from 'Managers/ConfigManager';
import { CampaignManager } from 'Managers/CampaignManager';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { Campaign } from 'Models/Campaign';
import { CacheManager } from 'Managers/CacheManager';
import { Placement, PlacementState } from 'Models/Placement';
import {Request, NativeResponse} from 'Utilities/Request';
import { SessionManager } from 'Managers/SessionManager';
import { ClientInfo } from 'Models/ClientInfo';
import { Diagnostics } from 'Utilities/Diagnostics';
import { EventManager } from 'Managers/EventManager';
import {FinishState} from "./Constants/FinishState";
import {VideoAdUnit} from "./AdUnits/VideoAdUnit";
import {Connectivity} from "./Native/Api/Connectivity";
import {Listener} from "./Native/Api/Listener";

export class WebView {

    private _deviceInfo: DeviceInfo;
    private _clientInfo: ClientInfo;

    private _request: Request;

    private _configManager: ConfigManager;
    private _campaignManager: CampaignManager;

    private _cacheManager: CacheManager;

    private _sessionManager: SessionManager;
    private _eventManager: EventManager;

    private _initializedAt: number;
    private _mustReinitialize: boolean = false;
    private _configJsonCheckedAt: number;

    constructor() {
        if(window && window.addEventListener) {
            window.addEventListener('error', this.onError.bind(this), false);
        }

        this._deviceInfo = new DeviceInfo();
        this._cacheManager = new CacheManager();
        this._request = new Request();
        this._eventManager = new EventManager(this._request);
    }

    public initialize(): Promise<void> {
        return NativeBridge.getInstance().invoke<any[]>('Sdk', 'loadComplete').then((data) => {
            this._clientInfo = new ClientInfo(data);
            return this._deviceInfo.fetch();
        }).then(() => {
            this._configManager = new ConfigManager(this._request, this._clientInfo, this._deviceInfo);
            return this._configManager.fetch();
        }).then(() => {
            this._sessionManager = new SessionManager(this._clientInfo, this._deviceInfo, this._eventManager);
            return this._sessionManager.create();
        }).then(() => {
            this._campaignManager = new CampaignManager(this._request, this._clientInfo, this._deviceInfo);
            this._campaignManager.onCampaign.subscribe(this.onCampaign.bind(this));
            this._campaignManager.onError.subscribe(this.onCampaignError.bind(this));

            let defaultPlacement = this._configManager.getDefaultPlacement();
            NativeBridge.getInstance().invoke('Placement', 'setDefaultPlacement', [defaultPlacement.getId()]);

            let placements: Object = this._configManager.getPlacements();
            for(let placementId in placements) {
                if(placements.hasOwnProperty(placementId)) {
                    let placement: Placement = placements[placementId];
                    NativeBridge.getInstance().invoke('Placement', 'setPlacementState', [placement.getId(), PlacementState[PlacementState.NOT_AVAILABLE]]);
                    this._campaignManager.request(placements[placementId]);
                }
            }

            this._initializedAt = this._configJsonCheckedAt = Date.now();
            Connectivity.setListeningStatus(true);
            Connectivity.onConnected.subscribe(this.onConnected.bind(this));

            this._eventManager.sendUnsentSessions();

            return NativeBridge.getInstance().invoke('Sdk', 'initComplete');
        }).catch(error => {
            console.log(error);
            if(error instanceof Error) {
                error = {'message': error.message, 'name': error.name, 'stack': error.stack};
            }
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
        }).catch(error => {
            console.dir(error);
        });

        let placement: Placement = this._configManager.getPlacement(placementId);
        if(!placement) {
            // this.showError(true, placementId, 'No such placement: ' + placementId); // todo: fix me
            return;
        }

        let videoAdUnit = new VideoAdUnit(placement, placement.getCampaign());
        videoAdUnit.getEndScreen().onClose.subscribe(this.onClose.bind(this)); // todo: clean me up
        //this._adUnitManager.subscribe('close', this.onClose.bind(this));

        //this._sessionManager.sendShow(adUnit);
    }

    public hide(): void {
        //this._adUnitManager.hide();
    }

    /*
     CAMPAIGN EVENT HANDLERS
     */

    private onCampaign(placement: Placement, campaign: Campaign): void {
        let cacheableAssets: string[] = [
            campaign.getGameIcon(),
            campaign.getLandscapeUrl(),
            campaign.getPortraitUrl(),
            campaign.getVideoUrl()
        ];

        this._cacheManager.cacheAll(cacheableAssets).then((fileUrls) => {
            campaign.setGameIcon(fileUrls[campaign.getGameIcon()]);
            campaign.setLandscapeUrl(fileUrls[campaign.getLandscapeUrl()]);
            campaign.setPortraitUrl(fileUrls[campaign.getPortraitUrl()]);
            campaign.setVideoUrl(fileUrls[campaign.getVideoUrl()]);

            NativeBridge.getInstance().invoke('Placement', 'setPlacementState', [placement.getId(), PlacementState[PlacementState.READY]]).then(() => {
                Listener.sendReadyEvent(placement.getId());
            });
        });
    }

    private onCampaignError(error: any) {
        console.log(error);
        if(error instanceof Error) {
            error = {'message': error.message, 'name': error.name, 'stack': error.stack};
        }
        Diagnostics.trigger(this._eventManager, {
            'type': 'campaign_request_failed',
            'error': error
        }, this._clientInfo, this._deviceInfo);
        // todo: implement retry logic
    }

    private onClose(placement: Placement): void {
        this.hide();
        if(this._mustReinitialize) {
            this.reinitialize();
        } else {
            NativeBridge.getInstance().invoke('Placement', 'setPlacementState', [placement.getId(), PlacementState[PlacementState.WAITING]]);
            this._campaignManager.request(placement);
        }
    }

    private isShowing(): boolean {
        return true;
    }

    /*
     CONNECTIVITY EVENT HANDLERS
     */

    private onConnected(wifi: boolean, networkType: number) {
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
        NativeBridge.getInstance().invoke('Sdk', 'reinitialize');
    }

    private getConfigJson(): Promise<NativeResponse> {
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
