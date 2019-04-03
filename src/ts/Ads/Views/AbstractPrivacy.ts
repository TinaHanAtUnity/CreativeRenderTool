import { Campaign } from 'Ads/Models/Campaign';
import { Platform } from 'Core/Constants/Platform';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { ITemplateData, View } from 'Core/Views/View';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IPermissions } from 'Ads/Models/Privacy';
import { Observable2 } from 'Core/Utilities/Observable';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { FinishState } from 'Core/Constants/FinishState';
import { BlockingReason, CreativeBlocking } from 'Core/Utilities/CreativeBlocking';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { Observables } from 'Core/Utilities/Observables';

export enum ReportReason {
    NOT_SHOWING = 'Ad is not showing',
    OFFENSIVE = 'Ad is very offensive',
    MALFORMED = 'Ad does not look right',
    DISLIKE = 'I don\'t like this ad',
    OTHER = 'Other'
}

export interface IPrivacyHandlerView {
    onPrivacyClose(): void;
    onPrivacy?(url: string): void;
    onGDPROptOut?(optOutEnabled: boolean): void;
    onPersonalizedConsent?(permissions: IPermissions): void;
}

export interface IPrivacyHandler extends IPrivacyHandlerView {
    onPrivacy(url: string): void;
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

export abstract class AbstractPrivacy extends View<IPrivacyHandlerView> {

    protected _onReport: Observable2<Campaign, string> = new Observable2();
    protected _userPrivacyManager: UserPrivacyManager;
    private static buildInformation: IBuildInformation;

    constructor(platform: Platform, privacyManager: UserPrivacyManager, isCoppaCompliant: boolean, isGDPREnabled: boolean, id: string, attachTap?: boolean) {
        super(platform, id, attachTap);

        this._userPrivacyManager = privacyManager;
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

    public setupReportListener(ad: AbstractAdUnit): void {
        Observables.once2(this._onReport, (campaign, reasonKey) => {
            this.onUserReport(campaign, reasonKey, ad);
            this.timeoutAd(ad);
        });
    }

    private onUserReport(campaign: Campaign, reasonKey: string, ad: AbstractAdUnit): void {

        if (ad.getFinishState() !== FinishState.COMPLETED) {
            ad.markAsSkipped(); // Don't grant user reward unless report is on Endcard
        }

        const creativeId = campaign.getCreativeId();
        const seatId = campaign.getSeatId();
        CreativeBlocking.report(creativeId, seatId, BlockingReason.USER_REPORT, {
            message: reasonKey
        });

        const error = {
            creativeId: creativeId,
            reason: reasonKey,
            adType: ad.description(),
            seatId: seatId
        };
        SessionDiagnostics.trigger('reported_ad', error, campaign.getSession());
    }

    // After the report, wait four seconds and close the ad
    private timeoutAd(ad: AbstractAdUnit): Promise<void> {
        return new Promise(() => {
            setTimeout(() => {
                return ad.hide();
            }, 4000);
        });
    }

    protected abstract onCloseEvent(event: Event): void;

    protected abstract onPrivacyEvent(event: Event): void;
}
