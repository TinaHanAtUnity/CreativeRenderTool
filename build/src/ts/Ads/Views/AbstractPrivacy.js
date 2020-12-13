import { Platform } from 'Core/Constants/Platform';
import { View } from 'Core/Views/View';
import { Observable2 } from 'Core/Utilities/Observable';
import { FinishState } from 'Core/Constants/FinishState';
import { BlockingReason, CreativeBlocking } from 'Core/Utilities/CreativeBlocking';
import { LegalFramework } from 'Ads/Managers/UserPrivacyManager';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { Observables } from 'Core/Utilities/Observables';
export var ReportReason;
(function (ReportReason) {
    ReportReason["NOT_SHOWING"] = "Ad is not showing";
    ReportReason["OFFENSIVE"] = "Ad is very offensive";
    ReportReason["MALFORMED"] = "Ad does not look right";
    ReportReason["DISLIKE"] = "I don't like this ad";
    ReportReason["OTHER"] = "Other";
})(ReportReason || (ReportReason = {}));
export class AbstractPrivacy extends View {
    constructor(platform, privacyManager, isCoppaCompliant, isGDPREnabled, id, attachTap) {
        super(platform, id, attachTap);
        this._onReport = new Observable2();
        this._isCoppaCompliant = isCoppaCompliant;
        this._userPrivacyManager = privacyManager;
        this._templateData = {
            'isCoppaCompliant': isCoppaCompliant,
            'isGDPREnabled': isGDPREnabled,
            'buildInformation': AbstractPrivacy.buildInformation,
            'isUserUnderAgeLimit': privacyManager.isUserUnderAgeLimit(),
            'isCCPA': privacyManager.getLegalFramework() === LegalFramework.CCPA
        };
    }
    static createBuildInformation(platform, clientInfo, deviceInfo, campaign, configuration) {
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
    setupReportListener(ad) {
        Observables.once2(this._onReport, (campaign, reasonKey) => {
            this.onUserReport(campaign, reasonKey, ad);
            this.timeoutAd(ad);
        });
    }
    onUserReport(campaign, reasonKey, ad) {
        if (ad.getFinishState() !== FinishState.COMPLETED) {
            ad.markAsSkipped(); // Don't grant user reward unless report is on Endcard
        }
        const creativeId = campaign.getCreativeId();
        const seatId = campaign.getSeatId();
        const campaignId = campaign.getId();
        CreativeBlocking.report(creativeId, seatId, campaignId, BlockingReason.USER_REPORT, {
            message: reasonKey
        });
        const error = {
            creativeId: creativeId,
            reason: reasonKey,
            adType: ad.description(),
            seatId: seatId,
            campaignId: campaignId
        };
        SessionDiagnostics.trigger('reported_ad', error, campaign.getSession());
    }
    // After the report, wait four seconds and close the ad
    timeoutAd(ad) {
        return new Promise(() => {
            setTimeout(() => {
                return ad.hide();
            }, 4000);
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWJzdHJhY3RQcml2YWN5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9WaWV3cy9BYnN0cmFjdFByaXZhY3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBR25ELE9BQU8sRUFBaUIsSUFBSSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFHdEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXhELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsY0FBYyxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDbkYsT0FBTyxFQUFFLGNBQWMsRUFBc0IsTUFBTSxpQ0FBaUMsQ0FBQztBQUNyRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFekQsTUFBTSxDQUFOLElBQVksWUFNWDtBQU5ELFdBQVksWUFBWTtJQUNwQixpREFBaUMsQ0FBQTtJQUNqQyxrREFBa0MsQ0FBQTtJQUNsQyxvREFBb0MsQ0FBQTtJQUNwQyxnREFBaUMsQ0FBQTtJQUNqQywrQkFBZSxDQUFBO0FBQ25CLENBQUMsRUFOVyxZQUFZLEtBQVosWUFBWSxRQU12QjtBQWdDRCxNQUFNLE9BQWdCLGVBQWdCLFNBQVEsSUFBeUI7SUFPbkUsWUFBWSxRQUFrQixFQUFFLGNBQWtDLEVBQUUsZ0JBQXlCLEVBQUUsYUFBc0IsRUFBRSxFQUFVLEVBQUUsU0FBbUI7UUFDbEosS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFOekIsY0FBUyxHQUFrQyxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBUW5FLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0Is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