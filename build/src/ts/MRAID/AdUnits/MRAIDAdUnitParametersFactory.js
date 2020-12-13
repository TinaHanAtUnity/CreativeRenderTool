import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { ExtendedMRAID } from 'MRAID/Views/ExtendedMRAID';
import { CustomCloseMRAID } from 'MRAID/Views/CustomCloseMRAID';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { ARMRAID } from 'AR/Views/ARMRAID';
import { MRAID } from 'MRAID/Views/MRAID';
import { WebPlayerMRAID } from 'MRAID/Views/WebPlayerMRAID';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
import { AutomatedExperimentManager } from 'MabExperimentation/AutomatedExperimentManager';
import { AutomatedExperimentsCategories } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { arAvailableButtonDecision } from 'AR/Experiments/ARUIExperiments';
import { MraidWebplayerTest } from 'Core/Models/ABGroup';
export class MRAIDAdUnitParametersFactory extends AbstractAdUnitParametersFactory {
    constructor(ar, core, ads, automatedExperimentManager) {
        super(core, ads);
        this._automatedExperimentManager = automatedExperimentManager;
        this._automatedExperimentManager.registerExperimentCategory(AutomatedExperimentsCategories.MRAID_AR, 'MRAIDCampaign_AR');
        this._ar = ar;
        this._webPlayerContainer = ads.InterstitialWebPlayerContainer;
    }
    static setForcedExtendedMRAID(value) {
        MRAIDAdUnitParametersFactory._forcedExtendedMRAID = value;
    }
    static setForcedARMRAID(value) {
        MRAIDAdUnitParametersFactory._forcedARMRAID = value;
        AutomatedExperimentManager.setForcedARMRAID(value);
    }
    createParameters(baseParams) {
        const resourceUrl = baseParams.campaign.getResourceUrl();
        let mraid;
        const showGDPRBanner = this.showGDPRBanner(baseParams);
        baseParams.gameSessionId = baseParams.gameSessionId || 0;
        const isProgrammaticWebPlayerTest = MraidWebplayerTest.isValid(baseParams.coreConfig.getAbGroup()) && !(baseParams.campaign instanceof PerformanceMRAIDCampaign) && !ARUtil.isARCreative(baseParams.campaign) && !MRAIDAdUnitParametersFactory._forcedExtendedMRAID && !MRAIDAdUnitParametersFactory._forcedARMRAID;
        if (isProgrammaticWebPlayerTest) {
            mraid = new WebPlayerMRAID(baseParams.platform, baseParams.core, baseParams.deviceInfo, baseParams.placement, baseParams.campaign, baseParams.privacy, showGDPRBanner, baseParams.coreConfig.getAbGroup(), baseParams.gameSessionId, baseParams.adsConfig.getHidePrivacy());
        }
        else {
            if ((resourceUrl && resourceUrl.getOriginalUrl().match(/playables\/production\/unity/)) || MRAIDAdUnitParametersFactory._forcedExtendedMRAID) {
                mraid = new ExtendedMRAID(baseParams.platform, baseParams.core, baseParams.deviceInfo, baseParams.placement, baseParams.campaign, baseParams.privacy, showGDPRBanner, baseParams.coreConfig.getAbGroup(), baseParams.gameSessionId, baseParams.adsConfig.getHidePrivacy());
            }
            else if (ARUtil.isARCreative(baseParams.campaign) || MRAIDAdUnitParametersFactory._forcedARMRAID) {
                const decision = arAvailableButtonDecision(this._automatedExperimentManager, baseParams.campaign);
                mraid = new ARMRAID(baseParams.platform, baseParams.core, this._ar, baseParams.deviceInfo, baseParams.placement, baseParams.campaign, baseParams.deviceInfo.getLanguage(), baseParams.privacy, showGDPRBanner, baseParams.coreConfig.getAbGroup(), baseParams.gameSessionId, baseParams.adsConfig.getHidePrivacy(), this._automatedExperimentManager, decision);
            }
            else if (baseParams.campaign.isCustomCloseEnabled()) {
                mraid = new CustomCloseMRAID(baseParams.platform, baseParams.core, baseParams.deviceInfo, baseParams.placement, baseParams.campaign, baseParams.privacy, showGDPRBanner, baseParams.coreConfig.getAbGroup(), baseParams.gameSessionId, baseParams.adsConfig.getHidePrivacy());
            }
            else {
                mraid = new MRAID(baseParams.platform, baseParams.core, baseParams.deviceInfo, baseParams.placement, baseParams.campaign, baseParams.privacy, showGDPRBanner, baseParams.coreConfig.getAbGroup(), baseParams.gameSessionId, baseParams.adsConfig.getHidePrivacy());
            }
        }
        return Object.assign({}, baseParams, { mraid: mraid, ar: this._ar, webPlayerContainer: this._webPlayerContainer });
    }
}
MRAIDAdUnitParametersFactory._forcedExtendedMRAID = false;
MRAIDAdUnitParametersFactory._forcedARMRAID = false;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURBZFVuaXRQYXJhbWV0ZXJzRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9NUkFJRC9BZFVuaXRzL01SQUlEQWRVbml0UGFyYW1ldGVyc0ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLCtCQUErQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFLdEYsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDM0MsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBSzFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUN2RixPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUMzRixPQUFPLEVBQUUsOEJBQThCLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUNwRyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMzRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUV6RCxNQUFNLE9BQU8sNEJBQTZCLFNBQVEsK0JBQXNFO0lBa0JwSCxZQUFZLEVBQVUsRUFBRSxJQUFXLEVBQUUsR0FBUyxFQUFFLDBCQUFzRDtRQUNsRyxLQUFLLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRWpCLElBQUksQ0FBQywyQkFBMkIsR0FBRywwQkFBMEIsQ0FBQztRQUM5RCxJQUFJLENBQUMsMkJBQTJCLENBQUMsMEJB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