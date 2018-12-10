import { Campaign } from 'Ads/Models/Campaign';
import { Platform } from 'Core/Constants/Platform';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { ITemplateData, View } from 'Core/Views/View';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IPermissions } from 'Ads/Views/Consent/IPermissions';
import { Observable2 } from 'Core/Utilities/Observable';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { FinishState } from 'Core/Constants/FinishState';
import { BlockingReason, CreativeBlocking } from 'Core/Utilities/CreativeBlocking';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';

export enum ReportReason {
    NOT_SHOWING = 'Ad is not showing',
    OFFENSIVE = 'Ad is very offensive',
    MALFORMED = 'Ad does not look right',
    DISLIKE = 'I don\'t like this ad',
    OTHER = 'Other'
}

export interface IPrivacyHandler {
    onPrivacy(url: string): void;
    onPrivacyClose(): void;
    onGDPROptOut(optOutEnabled: boolean): void;
    // todo: replace onGDPROptout with this new method
    onPersonalizedConsent(permissions: IPermissions): void;
}

export interface IBuildInformation extends ITemplateData {
    userAgent: string;
    platform: string;
    campaign: string;
    osVersion: string;
    group: number;
    sdk: string;
    webview: string | null;
    webviewHash: string | null;
    app: string;
    appVersion: string;
    creativeId: string | undefined;
    seatId: number | undefined;
    timestamp: string;
}

export abstract class AbstractPrivacy extends View<IPrivacyHandler> {

    protected _onReport: Observable2<Campaign, string> = new Observable2();
    protected _privacyManager: UserPrivacyManager;
    private static buildInformation: IBuildInformation;

    constructor(platform: Platform, privacyManager: UserPrivacyManager, isCoppaCompliant: boolean, isGDPREnabled: boolean, id: string) {
        super(platform, id);

        this._privacyManager = privacyManager;
        this._templateData = {
            'isCoppaCompliant': isCoppaCompliant,
            'isGDPREnabled': isGDPREnabled,
            'buildInformation': AbstractPrivacy.buildInformation
        };
    }

    public static createBuildInformation(platform: Platform, clientInfo: ClientInfo, deviceInfo: DeviceInfo, campaign: Campaign, configuration: CoreConfiguration) {
        const date = new Date();
        AbstractPrivacy.buildInformation = {
            userAgent: window.navigator.userAgent,
            platform: platform === Platform.IOS ? 'iOS' : 'Android',
            campaign: campaign.getId(),
            osVersion: deviceInfo.getOsVersion(),
            group: configuration.getAbGroup(),
            sdk: clientInfo.getSdkVersionName(),
            webview: clientInfo.getWebviewVersion(),
            webviewHash: clientInfo.getWebviewHash(),
            app: clientInfo.getApplicationName(),
            appVersion: clientInfo.getApplicationVersion(),
            creativeId: campaign.getCreativeId(),
            seatId: campaign.getSeatId(),
            timestamp: date.toUTCString()
        };
    }

    public static setupReportListener(privacy: AbstractPrivacy, ad: AbstractAdUnit | AbstractVideoOverlay): void {
        privacy._onReport.subscribe((campaign: Campaign, reasonKey: string) => {
            this.onUserReport(campaign, reasonKey, ad);
            this.timeoutAd(ad);
            privacy._onReport.unsubscribe();
        });
    }

    private static onUserReport(campaign: Campaign, reasonKey: string, ad: AbstractAdUnit | AbstractVideoOverlay): void {
        let adType;
        let isCached;
        let finishState;

        if (ad instanceof AbstractAdUnit) {
            adType = ad.description();
            finishState = FinishState[ad.getFinishState()];
            isCached = ad.isCached();
            ad.markAsSkipped(); // Don't grant user potential reward to prevent bad reports
        } else {
            adType = campaign.getAdType();
            finishState = 'VIDEO_PROGRESS';
        }

        const creativeId = campaign.getCreativeId();
        const seatId = campaign.getSeatId();
        CreativeBlocking.report(creativeId, seatId, BlockingReason.USER_REPORT, {
            message: reasonKey
        });

        const error = {
            creativeId: creativeId,
            reason: reasonKey,
            adType: adType,
            seatId: seatId,
            finishState: finishState,
            isCached: isCached
        };
        Diagnostics.trigger('reported_ad', error);
    }

    // After the report, wait four seconds and close the ad
    private static timeoutAd(ad: AbstractAdUnit | AbstractVideoOverlay): Promise<void> {
        return new Promise(() => {
            setTimeout(() => {
                return ad.hide();
            }, 4000);
        });
    }

    protected abstract onCloseEvent(event: Event): void;

    protected abstract onPrivacyEvent(event: Event): void;
}
