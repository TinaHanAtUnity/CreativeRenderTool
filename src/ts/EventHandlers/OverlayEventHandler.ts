import { IOverlayHandler } from 'Views/AbstractOverlay';
import { NativeBridge } from 'Native/NativeBridge';
import { IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { FinishState } from 'Constants/FinishState';
import { Double } from 'Utilities/Double';
import { Campaign } from 'Models/Campaign';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Placement } from 'Models/Placement';
import { IEndScreenDownloadParameters } from "./EndScreenEventHandler";
import { IosUtils } from 'Utilities/IosUtils';
import { Url } from 'Utilities/Url';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Diagnostics } from 'Utilities/Diagnostics';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Platform } from 'Constants/Platform';
import { RequestError } from 'Errors/RequestError';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { ClientInfo } from 'Models/ClientInfo';
import { StoreName } from 'Models/Campaigns/PerformanceCampaign';
import { Request } from 'Utilities/Request';

export class OverlayEventHandler<T extends Campaign> implements IOverlayHandler {
    protected _placement: Placement;
    protected _nativeBridge: NativeBridge;
    protected _clientInfo: ClientInfo;
    private _adUnit: VideoAdUnit<T>;
    private _operativeEventManager: OperativeEventManager;
    private _comScoreTrackingService: ComScoreTrackingService;
    private _abGroup: number;
    private _campaign: T;
    private _deviceInfo: DeviceInfo;
    private _thirdPartyEventManager: ThirdPartyEventManager;

    constructor(nativeBridge: NativeBridge, adUnit: VideoAdUnit<T>, parameters: IAdUnitParameters<T>) {
        this._nativeBridge = nativeBridge;
        this._operativeEventManager = parameters.operativeEventManager;
        this._comScoreTrackingService = parameters.comScoreTrackingService;
        this._abGroup = parameters.campaign.getAbGroup();
        this._adUnit = adUnit;
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
        this._deviceInfo = parameters.deviceInfo;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._clientInfo = parameters.clientInfo;
    }

    public onOverlaySkip(position: number): void {
        this._nativeBridge.VideoPlayer.pause();
        this._adUnit.setActive(false);
        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._operativeEventManager.sendSkip(this._campaign.getSession(), this._placement, this._campaign, this._adUnit.getVideo().getPosition(), this.getVideoOrientation());
        this.sendComscoreEvent();

        this._adUnit.getContainer().reconfigure(ViewConfiguration.ENDSCREEN);

        const overlay = this._adUnit.getOverlay();
        if (overlay) {
            overlay.hide();
        }

        this._adUnit.onFinish.trigger();
    }

    public onOverlayMute(isMuted: boolean): void {
        this._nativeBridge.VideoPlayer.setVolume(new Double(isMuted ? 0.0 : 1.0));
    }

    public onOverlayCallButton(): void {
        // EMPTY
    }

    public onOverlayPauseForTesting(paused: boolean): void {
        // EMPTY
    }

    public onOverlayDownload(parameters: IEndScreenDownloadParameters): void {
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            this.onDownloadIos(parameters);
        } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this.onDownloadAndroid(parameters);
        }
    }

    public onOverlayClose(): void {
        this._nativeBridge.VideoPlayer.pause();
        this._adUnit.setActive(false);
        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._operativeEventManager.sendSkip(this._campaign.getSession(), this._placement, this._campaign, this._adUnit.getVideo().getPosition(), this.getVideoOrientation());

        this._adUnit.onFinish.trigger();

        this._adUnit.hide();
    }

    private getVideoOrientation(): string | undefined {
        if(this._adUnit instanceof PerformanceAdUnit) {
            return (<PerformanceAdUnit>this._adUnit).getVideoOrientation();
        }

        return undefined;
    }

    private sendComscoreEvent() {
        const sessionId = this._campaign.getSession().getId();
        const positionAtSkip = this._adUnit.getVideo().getPosition();
        const comScoreDuration = (this._adUnit.getVideo().getDuration()).toString(10);
        const creativeId = this._campaign.getCreativeId();
        const category = this._campaign.getCategory();
        const subCategory = this._campaign.getSubCategory();
        this._comScoreTrackingService.sendEvent('end', sessionId, comScoreDuration, positionAtSkip, creativeId, category, subCategory);
    }

    private onDownloadAndroid(parameters: IEndScreenDownloadParameters): void {
        this._nativeBridge.Listener.sendClickEvent(this._placement.getId());

        this._operativeEventManager.sendClick(this._campaign.getSession(), this._placement, this._campaign, this.getVideoOrientation());
        if (parameters.clickAttributionUrl) {
            this.handleClickAttribution(parameters);

            if (!parameters.clickAttributionUrlFollowsRedirects) {
                this.openAppStore(parameters);
            }
        } else {
            this.openAppStore(parameters);
        }
    }

    private onDownloadIos(parameters: IEndScreenDownloadParameters): void {
        this._nativeBridge.Listener.sendClickEvent(this._placement.getId());

        this._operativeEventManager.sendClick(this._campaign.getSession(), this._placement, this._campaign, this.getVideoOrientation());
        if(parameters.clickAttributionUrl) {
            this.handleClickAttribution(parameters);

            if(!parameters.clickAttributionUrlFollowsRedirects) {
                this.openAppStore(parameters, IosUtils.isAppSheetBroken(this._deviceInfo.getOsVersion()));
            }
        } else {
            this.openAppStore(parameters, IosUtils.isAppSheetBroken(this._deviceInfo.getOsVersion()));
        }
    }

     private handleClickAttribution(parameters: IEndScreenDownloadParameters) {
        const currentSession = this._campaign.getSession();
        const platform = this._nativeBridge.getPlatform();

        if(parameters.clickAttributionUrlFollowsRedirects && parameters.clickAttributionUrl) {
            this._thirdPartyEventManager.clickAttributionEvent(parameters.clickAttributionUrl, true).then(response => {
                const location = Request.getHeader(response.headers, 'location');
                if(location) {
                    if(platform === Platform.ANDROID) {
                        const parsedLocation = Url.parse(location);
                        if(parsedLocation.pathname.match(/\.apk$/i) && this._nativeBridge.getApiLevel() >= 21) {
                            // Using WEB_SEARCH bypasses some security check for directly downloading .apk files
                            this._nativeBridge.Intent.launch({
                                'action': 'android.intent.action.WEB_SEARCH',
                                'extras': [
                                    {
                                        'key': 'query',
                                        'value': location
                                    }
                                ]
                            });
                        } else {
                            this._nativeBridge.Intent.launch({
                                'action': 'android.intent.action.VIEW',
                                'uri': location
                            });
                        }
                    } else if(platform === Platform.IOS) {
                        this._nativeBridge.UrlScheme.open(location);
                    }
                } else {
                    Diagnostics.trigger('click_attribution_misconfigured', {
                        url: parameters.clickAttributionUrl,
                        followsRedirects: parameters.clickAttributionUrlFollowsRedirects,
                        response: response
                    });
                }
            }).catch(error => {
                if(error instanceof RequestError) {
                    error = new DiagnosticError(new Error(error.message), {
                        request: (<RequestError>error).nativeRequest,
                        auctionId: currentSession.getId(),
                        url: parameters.clickAttributionUrl,
                        response: (<RequestError>error).nativeResponse
                    });
                }
                Diagnostics.trigger('click_attribution_failed', error);
            });
        } else {
            if (parameters.clickAttributionUrl) {
                this._thirdPartyEventManager.clickAttributionEvent(parameters.clickAttributionUrl, false);
            }
        }
    }

     private openAppStore(parameters: IEndScreenDownloadParameters, isAppSheetBroken?: boolean) {
        const platform = this._nativeBridge.getPlatform();
        let packageName: string | undefined;

        if(platform === Platform.ANDROID) {
            packageName = this._clientInfo.getApplicationName();
        }

        const appStoreUrl = this.getAppStoreUrl(parameters, packageName);
        if(!appStoreUrl) {
            Diagnostics.trigger('no_appstore_url', {
                message: 'cannot generate appstore url'
            });
            return;
        }

        if(platform === Platform.ANDROID) {
            this._nativeBridge.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': appStoreUrl
            });
        } else if(platform === Platform.IOS) {
            if(isAppSheetBroken || parameters.bypassAppSheet) {
                this._nativeBridge.UrlScheme.open(appStoreUrl);
            } else {
                this._nativeBridge.AppSheet.canOpen().then(canOpenAppSheet => {
                    if(canOpenAppSheet) {
                        if(!parameters.appStoreId) {
                            Diagnostics.trigger('no_appstore_id', {
                                message: 'trying to open ios appstore without appstore id'
                            });
                            return;
                        }
                        const options = {
                            id: parseInt(parameters.appStoreId, 10)
                        };
                        this._nativeBridge.AppSheet.present(options).then(() => {
                            this._nativeBridge.AppSheet.destroy(options);
                        }).catch(([error]) => {
                            if(error === 'APPSHEET_NOT_FOUND') {
                                this._nativeBridge.UrlScheme.open(appStoreUrl);
                            }
                        });
                    } else {
                        this._nativeBridge.UrlScheme.open(appStoreUrl);
                    }
                });
            }
        }
    }

    private getAppStoreUrl(parameters: IEndScreenDownloadParameters, packageName?: string): string | undefined {
        if(!parameters.appStoreId) {
            return;
        }

        switch (parameters.store) {
            case StoreName.APPLE:
                return 'https://itunes.apple.com/app/id' + parameters.appStoreId;
            case StoreName.GOOGLE:
                return 'market://details?id=' + parameters.appStoreId;
            case StoreName.XIAOMI:
                return 'migamecenter://details?pkgname=' + parameters.appStoreId + '&channel=unityAds&from=' + packageName + '&trace=' + parameters.gamerId;
            default:
                return "";
        }
    }

}
