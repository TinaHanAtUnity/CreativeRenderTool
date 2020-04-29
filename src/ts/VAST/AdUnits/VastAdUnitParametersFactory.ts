import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { IVastAdUnitParameters } from 'VAST/AdUnits/VastAdUnit';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { VastVideoOverlay } from 'Ads/Views/VastVideoOverlay';
import { VastAdVerification } from 'VAST/Models/VastAdVerification';
import { VastOpenMeasurementFactory } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementFactory';
import { VastStaticEndScreen } from 'VAST/Views/VastStaticEndScreen';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';

export class VastAdUnitParametersFactory extends AbstractAdUnitParametersFactory<VastCampaign, IVastAdUnitParameters> {
    protected createParameters(baseParams: IAdUnitParameters<VastCampaign>) {
        let showPrivacyDuringVideo = true;
        const attachTapForTencentVast = CustomFeatures.isTencentSeat(baseParams.campaign.getSeatId());

        // hide privacy icon for China
        if (baseParams.adsConfig.getHidePrivacy()) {
            showPrivacyDuringVideo = false;
        }

        const overlay = new VastVideoOverlay(baseParams, baseParams.privacy, this.showGDPRBanner(baseParams), showPrivacyDuringVideo, attachTapForTencentVast ? true : undefined);

        const vastAdUnitParameters: IVastAdUnitParameters = {
            ... baseParams,
            video: baseParams.campaign.getVideo(),
            overlay: overlay
        };

        if (baseParams.campaign.hasStaticEndscreen()) {
            vastAdUnitParameters.endScreen = new VastStaticEndScreen(baseParams, attachTapForTencentVast ? true : undefined);
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
