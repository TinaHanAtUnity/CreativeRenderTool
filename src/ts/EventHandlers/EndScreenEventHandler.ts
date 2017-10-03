import { IEndScreenHandler } from 'Views/EndScreen';
import { NativeBridge } from 'Native/NativeBridge';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { ClientInfo } from 'Models/ClientInfo';
import { Platform } from 'Constants/Platform';
import { PerformanceCampaign, StoreName } from 'Models/Campaigns/PerformanceCampaign';
import { MRAIDAdUnit } from 'AdUnits/MRAIDAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { KeyCode } from 'Constants/Android/KeyCode';
import { IosUtils } from 'Utilities/IosUtils';
import { DeviceInfo } from 'Models/DeviceInfo';
import { EventType } from 'Models/Session';
import { Diagnostics } from 'Utilities/Diagnostics';
import { RequestError } from 'Errors/RequestError';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Request } from 'Utilities/Request';

export class EndScreenEventHandler implements IEndScreenHandler {
    private _nativeBridge: NativeBridge;
    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _adUnit: AbstractAdUnit;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;

    constructor(nativeBridge: NativeBridge, adUnit: AbstractAdUnit, parameters: IAdUnitParameters) {
        this._nativeBridge = nativeBridge;
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._adUnit = adUnit;
        this._clientInfo = parameters.clientInfo;
        this._deviceInfo = parameters.deviceInfo;
    }

    public onEndScreenDownload(): void {
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            this.onDownloadIos();
        } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this.onDownloadAndroid();
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

    public onDownloadAndroid(): void {
        const campaign = <PerformanceCampaign>this._adUnit.getCampaign();

        this._nativeBridge.Listener.sendClickEvent(this._adUnit.getPlacement().getId());

        this._operativeEventManager.sendClick(this._adUnit);
        if(campaign.getClickAttributionUrl()) {
            this.handleClickAttribution();

            if(!campaign.getClickAttributionUrlFollowsRedirects()) {
                this.openAppStore();
            }
        } else {
            this.openAppStore();
        }
    }

    public onDownloadIos(): void {
        const campaign = <PerformanceCampaign>this._adUnit.getCampaign();

        this._nativeBridge.Listener.sendClickEvent(this._adUnit.getPlacement().getId());

        this._operativeEventManager.sendClick(this._adUnit);
        if(campaign.getClickAttributionUrl()) {
            this.handleClickAttribution();

            if(!campaign.getClickAttributionUrlFollowsRedirects()) {
                this.openAppStore(IosUtils.isAppSheetBroken(this._deviceInfo.getOsVersion()));
            }
        } else {
            this.openAppStore(IosUtils.isAppSheetBroken(this._deviceInfo.getOsVersion()));
        }
    }

    public onKeyEvent(keyCode: number): void {
        if (this._adUnit instanceof VideoAdUnit) {
            if (keyCode === KeyCode.BACK && this._adUnit.isShowing() && !this._adUnit.isActive()) {
                this._adUnit.hide();
            }
        } else if (this._adUnit instanceof MRAIDAdUnit) {
            if (keyCode === KeyCode.BACK && this._adUnit.isShowing() && !this._adUnit.isShowingMRAID()) {
                this._adUnit.hide();
            }
        }
    }

    private handleClickAttribution() {
        const campaign = <PerformanceCampaign>this._adUnit.getCampaign();
        const currentSession = campaign.getSession();
        if(currentSession) {
            if(currentSession.getEventSent(EventType.CLICK_ATTRIBUTION)) {
                return;
            }
            currentSession.setEventSent(EventType.CLICK_ATTRIBUTION);
        }

        const platform = this._nativeBridge.getPlatform();
        const clickAttributionUrl = campaign.getClickAttributionUrl();

        if(campaign.getClickAttributionUrlFollowsRedirects() && clickAttributionUrl) {
            this._thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, true).then(response => {
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
                        url: campaign.getClickAttributionUrl(),
                        followsRedirects: campaign.getClickAttributionUrlFollowsRedirects(),
                        response: response
                    });
                }
            }).catch(error => {
                if(error instanceof RequestError) {
                    error = new DiagnosticError(new Error(error.message), {
                        request: (<RequestError>error).nativeRequest,
                        auctionId: campaign.getSession().getId(),
                        url: campaign.getClickAttributionUrl(),
                        response: (<RequestError>error).nativeResponse
                    });
                }
                Diagnostics.trigger('click_attribution_failed', error);
            });
        } else {
            if (clickAttributionUrl) {
                this._thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, false);
            }
        }
    }

    private openAppStore(isAppSheetBroken?: boolean) {
        const platform = this._nativeBridge.getPlatform();
        const campaign = <PerformanceCampaign>this._adUnit.getCampaign();

        if(platform === Platform.ANDROID) {
            const packageName = this._clientInfo.getApplicationName();
            this._nativeBridge.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': this.getAppStoreUrl(campaign, packageName)
            });
        } else if(platform === Platform.IOS) {
            if(isAppSheetBroken || campaign.getBypassAppSheet()) {
                this._nativeBridge.UrlScheme.open(this.getAppStoreUrl(campaign));
            } else {
                this._nativeBridge.AppSheet.canOpen().then(canOpenAppSheet => {
                    if(canOpenAppSheet) {
                        const options = {
                            id: parseInt(campaign.getAppStoreId(), 10)
                        };
                        this._nativeBridge.AppSheet.present(options).then(() => {
                            this._nativeBridge.AppSheet.destroy(options);
                        }).catch(([error]) => {
                            if(error === 'APPSHEET_NOT_FOUND') {
                                this._nativeBridge.UrlScheme.open(this.getAppStoreUrl(campaign));
                            }
                        });
                    } else {
                        this._nativeBridge.UrlScheme.open(this.getAppStoreUrl(campaign));
                    }
                });
            }
        }
    }

    private getAppStoreUrl(campaign: PerformanceCampaign, packageName?: string) {
        const store = campaign.getStore();
        switch (store) {
            case StoreName.APPLE:
                return 'https://itunes.apple.com/app/id' + campaign.getAppStoreId();
            case StoreName.GOOGLE:
                return 'market://details?id=' + campaign.getAppStoreId();
            case StoreName.XIAOMI:
                return 'migamecenter://details?pkgname=' + campaign.getAppStoreId() + '&channel=unityAds&from=' + packageName + '&trace=' + campaign.getGamerId();
            default:
                return "";
        }

    }
}
