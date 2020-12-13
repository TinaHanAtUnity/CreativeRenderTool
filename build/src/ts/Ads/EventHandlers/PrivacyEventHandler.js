import { GDPREventAction, GDPREventSource, LegalFramework } from 'Ads/Managers/UserPrivacyManager';
import { Platform } from 'Core/Constants/Platform';
import { isPrivacyPermissions, PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
import { ConsentPage } from 'Ads/Views/Privacy/Privacy';
export class PrivacyEventHandler {
    constructor(parameters) {
        this._platform = parameters.platform;
        this._core = parameters.core;
        this._privacyManager = parameters.privacyManager;
        this._configuration = parameters.adsConfig;
        this._privacy = parameters.privacySDK;
    }
    onPrivacy(url) {
        if (this._platform === Platform.IOS) {
            this._core.iOS.UrlScheme.open(url);
        }
        else if (this._platform === Platform.ANDROID) {
            this._core.Android.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }
    onPrivacyClose() {
        //
    }
    onGDPROptOut(optOutEnabled) {
        let permissions = UserPrivacy.PERM_ALL_FALSE;
        if (!optOutEnabled) {
            // TODO, we could consider creating a separate view for DEVELOPER_CONSENT which does not include controls
            if (this._privacy.getGamePrivacy().getMethod() === PrivacyMethod.DEVELOPER_CONSENT) {
                permissions = UserPrivacy.PERM_DEVELOPER_CONSENTED;
            }
            else {
                const legalFramework = this._privacy.getLegalFramework();
                permissions = legalFramework === LegalFramework.GDPR ? UserPrivacy.PERM_OPTIN_LEGITIMATE_INTEREST_GDPR : UserPrivacy.PERM_OPTIN_LEGITIMATE_INTEREST;
            }
        }
        this._privacyManager.updateUserPrivacy(permissions, GDPREventSource.USER, GDPREventAction.BANNER_PERMISSIONS);
    }
    onPersonalizedConsent(permissions) {
        const gamePrivacy = this._privacy.getGamePrivacy();
        if (gamePrivacy.getMethod() === PrivacyMethod.UNITY_CONSENT && isPrivacyPermissions(permissions)) {
            this._privacyManager.updateUserPrivacy(permissions, GDPREventSource.USER, GDPREventAction.PERSONALIZED_PERMISSIONS, ConsentPage.MY_CHOICES);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeUV2ZW50SGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvRXZlbnRIYW5kbGVycy9Qcml2YWN5RXZlbnRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBc0IsTUFBTSxpQ0FBaUMsQ0FBQztBQUd2SCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUF1QixvQkFBb0IsRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDeEcsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBV3hELE1BQU0sT0FBTyxtQkFBbUI7SUFRNUIsWUFBWSxVQUEwQztRQUNsRCxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUM7UUFDckMsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQzdCLElBQUksQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDLGNBQWMsQ0FBQztRQUNqRCxJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUM7UUFDM0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDO0lBQzFDLENBQUM7SUFFTSxTQUFTLENBQUMsR0FBVztRQUN4QixJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNqQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3ZDO2FBQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxPQUFPLEVBQUU7WUFDNUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDOUIsUUFBUSxFQUFFLDRCQUE0QjtnQkFDdEMsS0FBSyxFQUFFLEdBQUc7YUFDYixDQUFDLENBQUM7U0FDTjtJQUNMLENBQUM7SUFFTSxjQUFjO1FBQ2pCLEVBQUU7SUFDTixDQUFDO0lBRU0sWUFBWSxDQUFDLGFBQXNCO1FBQ3RDLElBQUksV0FBVyxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUM7UUFDN0MsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNoQix5R0FBeUc7WUFDekcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRTtnQkFDaEYsV0FBVyxHQUFHLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQzthQUN0RDtpQkFBTTtnQkFDSCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3pELFdBQVcsR0FBRyxjQUFjLEtBQUssY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLG1DQUFtQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsOEJBQThCLENBQUM7YUFDdko7U0FDSjtRQUNELElBQUksQ0FBQyxlQUFlLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLGVBQWUsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDbEgsQ0FBQztJQUVNLHFCQUFxQixDQUFDLFdBQWdDO1FBQ3pELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDbkQsSUFBSSxXQUFXLENBQUMsU0FBUyxFQUFFLEtBQUssYUFBYSxDQUFDLGFBQWEsSUFBSSxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUM5RixJQUFJLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxlQUFlLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyx3QkFBd0IsRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDL0k7SUFDTCxDQUFDO0NBQ0oifQ==