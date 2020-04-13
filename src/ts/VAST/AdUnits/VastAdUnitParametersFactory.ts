import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { IVastAdUnitParameters } from 'VAST/AdUnits/VastAdUnit';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { VastVideoOverlay } from 'Ads/Views/VastVideoOverlay';
import { VastAdVerification } from 'VAST/Models/VastAdVerification';
import { VastOpenMeasurementFactory } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementFactory';
import { VastStaticEndScreen } from 'VAST/Views/VastStaticEndScreen';
import { VastEndScreen } from 'VAST/Views/VastEndScreen';
import { VastHTMLEndScreen } from 'VAST/Views/VastHTMLEndScreen';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { IAds } from 'Ads/IAds';
import { ICore } from 'Core/ICore';

export class VastAdUnitParametersFactory extends AbstractAdUnitParametersFactory<VastCampaign, IVastAdUnitParameters> {
    private readonly _webPlayerContainer: WebPlayerContainer;
    constructor(core: ICore, ads: IAds) {
        super(core, ads);
        this._webPlayerContainer = ads.InterstitialWebPlayerContainer;
    }
    protected createParameters(baseParams: IAdUnitParameters<VastCampaign>) {
        let showPrivacyDuringVideo = true;

        // hide privacy icon for China
        if (baseParams.adsConfig.getHidePrivacy()) {
            showPrivacyDuringVideo = false;
        }

        const overlay = new VastVideoOverlay(baseParams, baseParams.privacy, this.showGDPRBanner(baseParams), showPrivacyDuringVideo);

        const vastAdUnitParameters: IVastAdUnitParameters = {
            ... baseParams,
            video: baseParams.campaign.getVideo(),
            overlay: overlay
        };

        if (baseParams.campaign.hasStaticEndscreen()) {
            vastAdUnitParameters.endScreen = new VastStaticEndScreen(baseParams);
        } else if (baseParams.campaign.hasHtmlEndscreen()) {
            vastAdUnitParameters.endScreen = new VastHTMLEndScreen(baseParams, this._webPlayerContainer);
        }

        const adVerifications: VastAdVerification[] = baseParams.campaign.getVast().getAdVerifications();
        if (adVerifications.length > 0) {
            const openMeasurementFactory = new VastOpenMeasurementFactory(adVerifications, baseParams.campaign, baseParams.deviceInfo, baseParams.platform, baseParams.clientInfo, baseParams.placement);
            vastAdUnitParameters.om = openMeasurementFactory.createOpenMeasurementManager(baseParams.core, baseParams.thirdPartyEventManager);
            openMeasurementFactory.setOMVendorTracking(baseParams.thirdPartyEventManager);
        }

        return vastAdUnitParameters;
    }
}
