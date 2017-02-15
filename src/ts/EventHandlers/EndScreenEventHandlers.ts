import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { SessionManager } from 'Managers/SessionManager';
import { Platform } from 'Constants/Platform';
import { AbstractAdUnit}  from 'AdUnits/AbstractAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { KeyCode } from 'Constants/Android/KeyCode';
import { DeviceInfo } from 'Models/DeviceInfo';
import { IosUtils } from 'Utilities/IosUtils';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { StoreName } from "Models/Campaign";

export class EndScreenEventHandlers {

    public static onDownloadAndroid(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: AbstractAdUnit): void {
        const campaign = <PerformanceCampaign>adUnit.getCampaign();
        const packageName = sessionManager.getClientInfo().getApplicationName();

        nativeBridge.Listener.sendClickEvent(adUnit.getPlacement().getId());

        if(campaign.getClickAttributionUrlFollowsRedirects()) {
            sessionManager.sendClick(adUnit).then(response => {
                const location = Request.getHeader(response.headers, 'location');
                if(location) {
                    nativeBridge.Intent.launch({
                        'action': 'android.intent.action.VIEW',
                        'uri': location
                    });
                } else {
                    throw new Error('No location found');
                }
            });
        } else {
            sessionManager.sendClick(adUnit);
            nativeBridge.Sdk.logInfo(EndScreenEventHandlers.getAppStoreUrl(campaign, packageName));
            nativeBridge.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': EndScreenEventHandlers.getAppStoreUrl(campaign, packageName)
            });
        }
    }

    public static onDownloadIos(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: AbstractAdUnit, deviceInfo: DeviceInfo): void {
        const campaign = <PerformanceCampaign>adUnit.getCampaign();

        nativeBridge.Listener.sendClickEvent(adUnit.getPlacement().getId());

        if(campaign.getClickAttributionUrlFollowsRedirects()) {
            sessionManager.sendClick(adUnit).then(response => {
                const location = Request.getHeader(response.headers, 'location');
                if(location) {
                    nativeBridge.UrlScheme.open(location);
                } else {
                    throw new Error('No location found');
                }
            });
        } else {
            sessionManager.sendClick(adUnit);
            if(IosUtils.isAppSheetBroken(deviceInfo.getOsVersion()) || campaign.getBypassAppSheet()) {
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

    public static onKeyEvent(keyCode: number, adUnit: VideoAdUnit): void {
        if(keyCode === KeyCode.BACK && adUnit.isShowing() && !adUnit.getVideo().isActive()) {
            adUnit.hide();
        }
    }

    private static getAppStoreUrl(campaign: PerformanceCampaign, packageName?: string) {
        const store = campaign.getStore();
        switch (store) {
            case StoreName.APPLE: {
                return 'https://itunes.apple.com/app/id' + campaign.getAppStoreId();
            }
            case StoreName.GOOGLE: {
                return 'market://details?id=' + campaign.getAppStoreId();
            }
            case StoreName.XIAOMI: {
                return 'migamecenter://details?pkgname=' + campaign.getAppStoreId() + '&channel=unityAds&from=' + packageName + '&trace=' + campaign.getGamerId();
            }
            default: {
                return "migamecenter://details?pkgname=store.not.set.correctly" + store;
            }
        }

    }
}
