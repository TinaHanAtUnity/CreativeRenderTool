import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { IMRAIDAdUnitParameters } from 'MRAID/AdUnits/MRAIDAdUnit';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { MRAIDView, IMRAIDViewHandler } from 'MRAID/Views/MRAIDView';
import { ExtendedMRAID } from 'MRAID/Views/ExtendedMRAID';
import { CustomCloseMRAID } from 'MRAID/Views/CustomCloseMRAID';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { ARMRAID } from 'AR/Views/ARMRAID';
import { MRAID } from 'MRAID/Views/MRAID';
import { IARApi } from 'AR/AR';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { WebPlayerMRAID } from 'MRAID/Views/WebPlayerMRAID';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AutomatedExperimentManager } from 'MabExperimentation/AutomatedExperimentManager';
import { AutomatedExperimentsCategories } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { arAvailableButtonDecision } from 'AR/Experiments/ARUIExperiments';
import { MraidWebplayer } from 'Core/Models/ABGroup';

export class MRAIDAdUnitParametersFactory extends AbstractAdUnitParametersFactory<MRAIDCampaign, IMRAIDAdUnitParameters> {

    private static _forcedExtendedMRAID: boolean = false;
    private static _forcedARMRAID: boolean = false;

    public static setForcedExtendedMRAID(value: boolean) {
        MRAIDAdUnitParametersFactory._forcedExtendedMRAID = value;
    }

    public static setForcedARMRAID(value: boolean) {
        MRAIDAdUnitParametersFactory._forcedARMRAID = value;
        AutomatedExperimentManager.setForcedARMRAID(value);
    }

    private _ar: IARApi;
    private _webPlayerContainer: WebPlayerContainer;
    private _automatedExperimentManager: AutomatedExperimentManager;

    constructor(ar: IARApi, core: ICore, ads: IAds, automatedExperimentManager: AutomatedExperimentManager) {
        super(core, ads);

        this._automatedExperimentManager = automatedExperimentManager;
        this._automatedExperimentManager.registerExperimentCategory(AutomatedExperimentsCategories.MRAID_AR, 'MRAIDCampaign_AR');

        this._ar = ar;
        this._webPlayerContainer = ads.InterstitialWebPlayerContainer;
    }

    protected createParameters(baseParams: IAdUnitParameters<MRAIDCampaign>): IMRAIDAdUnitParameters {
        const resourceUrl = baseParams.campaign.getResourceUrl();

        let mraid: MRAIDView<IMRAIDViewHandler>;
        const showGDPRBanner = this.showGDPRBanner(baseParams);

        baseParams.gameSessionId = baseParams.gameSessionId || 0;
        const isProgrammaticWebPlayerTest = MraidWebplayer.isValid(baseParams.coreConfig.getAbGroup()) && !(baseParams.campaign instanceof PerformanceMRAIDCampaign) && !ARUtil.isARCreative(baseParams.campaign) && !MRAIDAdUnitParametersFactory._forcedExtendedMRAID && !MRAIDAdUnitParametersFactory._forcedARMRAID;
        console.log('boolean 1: ' + isProgrammaticWebPlayerTest);

        if (isProgrammaticWebPlayerTest) {
            mraid = new WebPlayerMRAID(baseParams.platform, baseParams.core, baseParams.deviceInfo, baseParams.placement, baseParams.campaign, baseParams.privacy, showGDPRBanner, baseParams.coreConfig.getAbGroup(), baseParams.gameSessionId, baseParams.adsConfig.getHidePrivacy());
        } else {
            if ((resourceUrl && resourceUrl.getOriginalUrl().match(/playables\/production\/unity/)) || MRAIDAdUnitParametersFactory._forcedExtendedMRAID) {
                mraid = new ExtendedMRAID(baseParams.platform, baseParams.core, baseParams.deviceInfo, baseParams.placement, baseParams.campaign, baseParams.privacy, showGDPRBanner, baseParams.coreConfig.getAbGroup(), baseParams.gameSessionId, baseParams.adsConfig.getHidePrivacy());
            } else if (ARUtil.isARCreative(baseParams.campaign) || MRAIDAdUnitParametersFactory._forcedARMRAID) {
                const decision = arAvailableButtonDecision(this._automatedExperimentManager, baseParams.campaign);
                mraid = new ARMRAID(baseParams.platform, baseParams.core, this._ar, baseParams.deviceInfo, baseParams.placement, baseParams.campaign, baseParams.deviceInfo.getLanguage(), baseParams.privacy, showGDPRBanner, baseParams.coreConfig.getAbGroup(), baseParams.gameSessionId, baseParams.adsConfig.getHidePrivacy(), this._automatedExperimentManager, decision);
            } else if (baseParams.campaign.isCustomCloseEnabled()) {
                mraid = new CustomCloseMRAID(baseParams.platform, baseParams.core, baseParams.deviceInfo, baseParams.placement, baseParams.campaign, baseParams.privacy, showGDPRBanner, baseParams.coreConfig.getAbGroup(), baseParams.gameSessionId, baseParams.adsConfig.getHidePrivacy());
            } else {
                mraid = new MRAID(baseParams.platform, baseParams.core, baseParams.deviceInfo, baseParams.placement, baseParams.campaign, baseParams.privacy, showGDPRBanner, baseParams.coreConfig.getAbGroup(), baseParams.gameSessionId, baseParams.adsConfig.getHidePrivacy());
            }
        }

        return {
            ... baseParams,
            mraid: mraid,
            ar: this._ar,
            webPlayerContainer: this._webPlayerContainer
        };
    }
}
