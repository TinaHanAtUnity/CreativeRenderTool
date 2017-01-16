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

export class EndScreenEventHandlers {

    public static onDownloadAndroid(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: AbstractAdUnit): void {
        const platform = nativeBridge.getPlatform();
        const campaign = <PerformanceCampaign>adUnit.getCampaign();

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
            nativeBridge.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': EndScreenEventHandlers.getAppStoreUrl(platform, campaign)
            });
        }
    }

    public static onDownloadIos(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: AbstractAdUnit, deviceInfo: DeviceInfo): void {
        const platform = nativeBridge.getPlatform();
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
                nativeBridge.UrlScheme.open(EndScreenEventHandlers.getAppStoreUrl(platform, campaign));
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
                                nativeBridge.UrlScheme.open(EndScreenEventHandlers.getAppStoreUrl(platform, campaign));
                            }
                        });
                    } else {
                        nativeBridge.UrlScheme.open(EndScreenEventHandlers.getAppStoreUrl(platform, campaign));
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

    private static getAppStoreUrl(platform: Platform, campaign: PerformanceCampaign) {
        if(platform === Platform.IOS) {
            return 'https://itunes.apple.com/app/id' + campaign.getAppStoreId();
        } else {
            return 'market://details?id=' + campaign.getAppStoreId();
        }
    }
}
