import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { IMRAIDAdUnitParameters } from 'MRAID/AdUnits/MRAIDAdUnit';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { MRAIDView, IMRAIDViewHandler } from 'MRAID/Views/MRAIDView';
import { MRAIDAdUnitFactory } from 'MRAID/AdUnits/MRAIDAdUnitFactory';
import { ExtendedMRAID } from 'MRAID/Views/ExtendedMRAID';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { ARMRAID } from 'AR/Views/ARMRAID';
import { MRAID } from 'MRAID/Views/MRAID';
import { AR, IARApi } from 'AR/AR';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';

export class MRAIDAdUnitParametersFactory extends AbstractAdUnitParametersFactory<MRAIDCampaign, IMRAIDAdUnitParameters> {

    private static _forcedExtendedMRAID: boolean = false;
    private static _forcedARMRAID: boolean = false;

    public static setForcedExtendedMRAID(value: boolean) {
        MRAIDAdUnitParametersFactory._forcedExtendedMRAID = value;
    }

    public static setForcedARMRAID(value: boolean) {
        MRAIDAdUnitParametersFactory._forcedARMRAID = value;
    }

    private _ar: IARApi;

    constructor(ar: IARApi, core: ICore, ads: IAds) {
        super(core, ads);
        this._ar = ar;
    }

    protected createParameters(baseParams: IAdUnitParameters<MRAIDCampaign>): IMRAIDAdUnitParameters {
        const resourceUrl = baseParams.campaign.getResourceUrl();

        let mraid: MRAIDView<IMRAIDViewHandler>;
        const showGDPRBanner = this.showGDPRBanner(baseParams);
        const privacy = this.createPrivacy(baseParams);

        baseParams.gameSessionId = baseParams.gameSessionId || 0;

        if((resourceUrl && resourceUrl.getOriginalUrl().match(/playables\/production\/unity/)) || MRAIDAdUnitParametersFactory._forcedExtendedMRAID) {
            mraid = new ExtendedMRAID(baseParams.platform, baseParams.core, baseParams.deviceInfo, baseParams.placement, baseParams.campaign, baseParams.deviceInfo.getLanguage(), privacy, showGDPRBanner, baseParams.coreConfig.getAbGroup(), baseParams.gameSessionId);
        } else if (ARUtil.isARCreative(baseParams.campaign) || MRAIDAdUnitParametersFactory._forcedARMRAID) {
            mraid = new ARMRAID(baseParams.platform, baseParams.core, this._ar, baseParams.deviceInfo, baseParams.placement, baseParams.campaign, baseParams.deviceInfo.getLanguage(), privacy, showGDPRBanner, baseParams.coreConfig.getAbGroup(), baseParams.gameSessionId);
        } else {
            mraid = new MRAID(baseParams.platform, baseParams.core, baseParams.deviceInfo, baseParams.placement, baseParams.campaign, privacy, showGDPRBanner, baseParams.coreConfig.getAbGroup(), baseParams.gameSessionId);
        }

        return {
            ... baseParams,
            mraid: mraid,
            privacy: privacy,
            ar: this._ar
        };
    }
}