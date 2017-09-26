import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { Platform } from 'Constants/Platform';
import { AbstractAdUnit} from 'AdUnits/AbstractAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { KeyCode } from 'Constants/Android/KeyCode';
import { DeviceInfo } from 'Models/DeviceInfo';
import { IosUtils } from 'Utilities/IosUtils';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { StoreName } from 'Models/Campaigns/PerformanceCampaign';
import { Diagnostics } from 'Utilities/Diagnostics';
import { RequestError } from 'Errors/RequestError';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { EventType } from 'Models/Session';
import { MRAIDAdUnit } from 'AdUnits/MRAIDAdUnit';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { ClientInfo } from 'Models/ClientInfo';

export class EndScreenEventHandlers {

    public static onDownloadAndroid(nativeBridge: NativeBridge, operativeEventManager: OperativeEventManager, thirdPartyEventManager: ThirdPartyEventManager, adUnit: AbstractAdUnit, clientInfo: ClientInfo): void {
        const campaign = <PerformanceCampaign>adUnit.getCampaign();

        nativeBridge.Listener.sendClickEvent(adUnit.getPlacement().getId());

        operativeEventManager.sendClick(adUnit);
        if(campaign.getClickAttributionUrl()) {
            EndScreenEventHandlers.handleClickAttribution(nativeBridge, thirdPartyEventManager, campaign);

            if(!campaign.getClickAttributionUrlFollowsRedirects()) {
                EndScreenEventHandlers.openAppStore(nativeBridge, clientInfo, campaign);
            }
        } else {
            EndScreenEventHandlers.openAppStore(nativeBridge, clientInfo, campaign);
        }
    }

    public static onDownloadIos(nativeBridge: NativeBridge, operativeEventManager: OperativeEventManager, thirdPartyEventManager: ThirdPartyEventManager, adUnit: AbstractAdUnit, deviceInfo: DeviceInfo, clientInfo: ClientInfo): void {
        const campaign = <PerformanceCampaign>adUnit.getCampaign();

        nativeBridge.Listener.sendClickEvent(adUnit.getPlacement().getId());

        operativeEventManager.sendClick(adUnit);
        if(campaign.getClickAttributionUrl()) {
            EndScreenEventHandlers.handleClickAttribution(nativeBridge, thirdPartyEventManager, campaign);

            if(!campaign.getClickAttributionUrlFollowsRedirects()) {
                EndScreenEventHandlers.openAppStore(nativeBridge, clientInfo, campaign, IosUtils.isAppSheetBroken(deviceInfo.getOsVersion()));
            }
        } else {
            EndScreenEventHandlers.openAppStore(nativeBridge, clientInfo, campaign, IosUtils.isAppSheetBroken(deviceInfo.getOsVersion()));
        }
    }

    public static handleClickAttribution(nativeBridge: NativeBridge, thirdPartyEventManager: ThirdPartyEventManager, campaign: PerformanceCampaign) {
        const currentSession = campaign.getSession();
        if(currentSession) {
            if(currentSession.getEventSent(EventType.CLICK_ATTRIBUTION)) {
                return;
            }
            currentSession.setEventSent(EventType.CLICK_ATTRIBUTION);
        }

        const platform = nativeBridge.getPlatform();
        const clickAttributionUrl = campaign.getClickAttributionUrl();

        if(campaign.getClickAttributionUrlFollowsRedirects() && clickAttributionUrl) {
            thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, true).then(response => {
                const location = Request.getHeader(response.headers, 'location');
                if(location) {
                    if(platform === Platform.ANDROID) {
                        nativeBridge.Intent.launch({
                            'action': 'android.intent.action.VIEW',
                            'uri': location
                        });
                    } else if(platform === Platform.IOS) {
                        nativeBridge.UrlScheme.open(location);
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
                thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, false);
            }
        }
    }

    public static onPrivacy(nativeBridge: NativeBridge, url: string): void {
        if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.UrlScheme.open(url);
        } else if(nativeBridge.getPlatform() === Platform.ANDROID) {
            nativeBridge.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }

    public static onClose(adUnit: AbstractAdUnit): void {
        adUnit.hide();
    }

    public static onKeyEvent(keyCode: number, adUnit: AbstractAdUnit): void {
        if(adUnit instanceof VideoAdUnit) {
            if(keyCode === KeyCode.BACK && adUnit.isShowing() && !adUnit.isActive()) {
                adUnit.hide();
            }
        } else if(adUnit instanceof MRAIDAdUnit) {
            if(keyCode === KeyCode.BACK && adUnit.isShowing() && !adUnit.isShowingMRAID()) {
                adUnit.hide();
            }
        }
    }

    private static openAppStore(nativeBridge: NativeBridge, clientInfo: ClientInfo, campaign: PerformanceCampaign, isAppSheetBroken?: boolean) {
        const platform = nativeBridge.getPlatform();

        if(platform === Platform.ANDROID) {
            const packageName = clientInfo.getApplicationName();
            nativeBridge.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': EndScreenEventHandlers.getAppStoreUrl(campaign, packageName)
            });
        } else if(platform === Platform.IOS) {
            if(isAppSheetBroken || campaign.getBypassAppSheet()) {
                nativeBridge.UrlScheme.open(EndScreenEventHandlers.getAppStoreUrl(campaign));
            } else {
                nativeBridge.AppSheet.canOpen().then(canOpenAppSheet => {
                    if(canOpenAppSheet) {
                        const options = {
                            id: parseInt(campaign.getAppStoreId(), 10)
                        };
                        nativeBridge.AppSheet.present(options).then(() => {
                            nativeBridge.AppSheet.destroy(options);
                        }).catch(([error]) => {
                            if(error === 'APPSHEET_NOT_FOUND') {
                                nativeBridge.UrlScheme.open(EndScreenEventHandlers.getAppStoreUrl(campaign));
                            }
                        });
                    } else {
                        nativeBridge.UrlScheme.open(EndScreenEventHandlers.getAppStoreUrl(campaign));
                    }
                });
            }
        }
    }

    private static getAppStoreUrl(campaign: PerformanceCampaign, packageName?: string) {
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
