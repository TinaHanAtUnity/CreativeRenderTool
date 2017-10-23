import { IEndScreenHandler } from 'Views/EndScreen';
import { NativeBridge } from 'Native/NativeBridge';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { ClientInfo } from 'Models/ClientInfo';
import { Platform } from 'Constants/Platform';
import { StoreName } from 'Models/Campaigns/PerformanceCampaign';
import { IosUtils } from 'Utilities/IosUtils';
import { DeviceInfo } from 'Models/DeviceInfo';
import { EventType } from 'Models/Session';
import { Diagnostics } from 'Utilities/Diagnostics';
import { RequestError } from 'Errors/RequestError';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Request } from 'Utilities/Request';
import { Campaign } from 'Models/Campaign';

export interface IEndScreenDownloadParameters {
    clickAttributionUrl: string | undefined;
    clickAttributionUrlFollowsRedirects: boolean | undefined;
    bypassAppSheet: boolean | undefined;
    appStoreId: string | undefined;
    store: StoreName | undefined;
    gamerId: string;
}

export abstract class EndScreenEventHandler<T extends Campaign, T2 extends AbstractAdUnit<T>> implements IEndScreenHandler {
    protected _adUnit: T2;
    private _nativeBridge: NativeBridge;
    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;

    constructor(nativeBridge: NativeBridge, adUnit: T2, parameters: IAdUnitParameters<T>) {
        this._nativeBridge = nativeBridge;
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._adUnit = adUnit;
        this._clientInfo = parameters.clientInfo;
        this._deviceInfo = parameters.deviceInfo;
    }

    public onEndScreenDownload(parameters: IEndScreenDownloadParameters): void {
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            this.onDownloadIos(parameters);
        } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this.onDownloadAndroid(parameters);
        }
    }

    public onEndScreenPrivacy(url: string): void {
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            this._nativeBridge.UrlScheme.open(url);
        } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this._nativeBridge.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }

    public onEndScreenClose(): void {
        this._adUnit.hide();
    }

    public abstract onKeyEvent(keyCode: number): void;

    private onDownloadAndroid(parameters: IEndScreenDownloadParameters): void {
        this._nativeBridge.Listener.sendClickEvent(this._adUnit.getPlacement().getId());

        this._operativeEventManager.sendClick(this._adUnit);
        if(parameters.clickAttributionUrl) {
            this.handleClickAttribution(parameters);

            if(!parameters.clickAttributionUrlFollowsRedirects) {
                this.openAppStore(parameters);
            }
        } else {
            this.openAppStore(parameters);
        }
    }

    private onDownloadIos(parameters: IEndScreenDownloadParameters): void {
        this._nativeBridge.Listener.sendClickEvent(this._adUnit.getPlacement().getId());

        this._operativeEventManager.sendClick(this._adUnit);
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
        const campaign = this._adUnit.getCampaign();
        const currentSession = campaign.getSession();
        if(currentSession) {
            if(currentSession.getEventSent(EventType.CLICK_ATTRIBUTION)) {
                return;
            }
            currentSession.setEventSent(EventType.CLICK_ATTRIBUTION);
        }

        const platform = this._nativeBridge.getPlatform();

        if(parameters.clickAttributionUrlFollowsRedirects && parameters.clickAttributionUrl) {
            this._thirdPartyEventManager.clickAttributionEvent(parameters.clickAttributionUrl, true).then(response => {
                const location = Request.getHeader(response.headers, 'location');
                if(location) {
                    if(platform === Platform.ANDROID) {
                        this._nativeBridge.Intent.launch({
                            'action': 'android.intent.action.VIEW',
                            'uri': location
                        });
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
                        auctionId: campaign.getSession().getId(),
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
