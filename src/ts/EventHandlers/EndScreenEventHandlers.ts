import { Double } from 'Utilities/Double';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { SessionManager } from 'Managers/SessionManager';
import { Platform } from 'Constants/Platform';
import { Campaign } from 'Models/Campaign';
import { IAppSheetOptions } from 'Native/Api/AppSheet';

export class EndScreenEventHandlers {

    public static onReplay(nativeBridge: NativeBridge, adUnit: VideoAdUnit): void {
        adUnit.setVideoActive(true);
        adUnit.setVideoPosition(0);
        adUnit.getOverlay().setSkipEnabled(true);
        adUnit.getOverlay().setSkipDuration(0);
        adUnit.getEndScreen().hide();
        adUnit.getOverlay().show();
        if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.IosAdUnit.setViews(['videoplayer', 'webview']).then(() => {
                nativeBridge.VideoPlayer.prepare(adUnit.getCampaign().getVideoUrl(), new Double(adUnit.getPlacement().muteVideo() ? 0.0 : 1.0));
            });
        } else {
            nativeBridge.AndroidAdUnit.setViews(['videoplayer', 'webview']).then(() => {
                nativeBridge.VideoPlayer.prepare(adUnit.getCampaign().getVideoUrl(), new Double(adUnit.getPlacement().muteVideo() ? 0.0 : 1.0));
            });
        }
    }

    public static onDownload(nativeBridge: NativeBridge, sessionManager: SessionManager, adUnit: VideoAdUnit): void {
        let platform = nativeBridge.getPlatform();
        let campaign = adUnit.getCampaign();

        if(campaign.getClickAttributionUrlFollowsRedirects()) {
            sessionManager.sendClick(adUnit).then(response => {
                let location = Request.getHeader(response.headers, 'location');
                if(location) {
                    if(platform === Platform.IOS) {
                        nativeBridge.UrlScheme.open(location);
                    } else {
                        nativeBridge.Intent.launch({
                            'action': 'android.intent.action.VIEW',
                            'uri': location
                        });
                    }
                } else {
                    throw new Error('No location found');
                }
            });
        } else {
            sessionManager.sendClick(adUnit);
            if(platform === Platform.IOS) {
                nativeBridge.AppSheet.canOpen().then(canOpenAppSheet => {
                    if(canOpenAppSheet && !campaign.getBypassAppSheet()) {
                        EndScreenEventHandlers.openAppSheet(nativeBridge, {
                            id: parseInt(campaign.getAppStoreId(), 10)
                        });
                    } else {
                        nativeBridge.UrlScheme.open(EndScreenEventHandlers.getAppStoreUrl(platform, campaign));
                    }
                });
            } else {
                nativeBridge.Intent.launch({
                    'action': 'android.intent.action.VIEW',
                    'uri': EndScreenEventHandlers.getAppStoreUrl(platform, campaign)
                });
            }
        }
    }

    public static onClose(nativeBridge: NativeBridge, adUnit: VideoAdUnit): void {
        if(nativeBridge.getPlatform() === Platform.IOS && !adUnit.getCampaign().getBypassAppSheet()) {
            nativeBridge.AppSheet.destroy({
                id: parseInt(adUnit.getCampaign().getAppStoreId(), 10)
            });
        }
        adUnit.hide();
    }

    private static getAppStoreUrl(platform: Platform, campaign: Campaign) {
        if(platform === Platform.IOS) {
            return 'https://itunes.apple.com/' + campaign.getAppStoreCountry() + '/app/id' + campaign.getAppStoreId();
        } else {
            return 'market://details?id=' + campaign.getAppStoreId();
        }
    }

    private static openAppSheet(nativeBridge: NativeBridge, options: IAppSheetOptions) {
        nativeBridge.AppSheet.present(options).then(() => {
            return nativeBridge.AppSheet.destroy(options);
        }).catch(([error, options]) => {
            if(error === 'APPSHEET_NOT_FOUND') {
                return nativeBridge.AppSheet.prepare(options).then(() => {
                    let preparedObserver = nativeBridge.AppSheet.onPrepared.subscribe(() => {
                        nativeBridge.AppSheet.present(options).then(() => {
                            nativeBridge.AppSheet.destroy(options);
                        });
                        nativeBridge.AppSheet.onPrepared.unsubscribe(preparedObserver);
                    });
                });
            }
            throw [error, options];
        });
    }

}
