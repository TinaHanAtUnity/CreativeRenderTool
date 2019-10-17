import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { IVastAdUnitParameters } from 'VAST/AdUnits/VastAdUnit';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { VastVideoOverlay } from 'Ads/Views/VastVideoOverlay';
import { VastEndScreen, IVastEndscreenParameters } from 'VAST/Views/VastEndScreen';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
import { VastAdVerification } from 'VAST/Models/VastAdVerification';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';

export class VastAdUnitParametersFactory extends AbstractAdUnitParametersFactory<VastCampaign, IVastAdUnitParameters> {
    protected createParameters(baseParams: IAdUnitParameters<VastCampaign>) {
        let showPrivacyDuringVideo = true;

        // hide privacy icon for China
        if (baseParams.adsConfig.getHidePrivacy()) {
            showPrivacyDuringVideo = false;
        }

        const overlay = new VastVideoOverlay(baseParams, baseParams.privacy, this.showGDPRBanner(baseParams), showPrivacyDuringVideo);
        let vastEndScreen: VastEndScreen | undefined;

        const vastAdUnitParameters: IVastAdUnitParameters = {
            ... baseParams,
            video: baseParams.campaign.getVideo(),
            overlay: overlay
        };

        if (baseParams.campaign.hasStaticEndscreen() || baseParams.campaign.hasIframeEndscreen() || baseParams.campaign.hasHtmlEndscreen()) {
            const vastEndscreenParameters: IVastEndscreenParameters = {
                campaign: baseParams.campaign,
                clientInfo: baseParams.clientInfo,
                country: baseParams.coreConfig.getCountry(),
                hidePrivacy: baseParams.adsConfig.getHidePrivacy()
            };

            vastEndScreen = new VastEndScreen(baseParams.platform, vastEndscreenParameters, baseParams.privacy);
            vastAdUnitParameters.endScreen = vastEndScreen;
        }

        const adVerifications: VastAdVerification[] = baseParams.campaign.getVast().getAdVerifications();
        if (adVerifications) {
            const omInstances: OpenMeasurement[] = [];
            const omAdViewBuilder = new OpenMeasurementAdViewBuilder(baseParams.campaign, baseParams.deviceInfo, baseParams.platform);

            adVerifications.forEach((adverification) => {
                // if (adverification.getVerificationVendor() === 'IAS') {
                const om = new OpenMeasurement(baseParams.platform, baseParams.core, baseParams.clientInfo, baseParams.campaign, baseParams.placement, baseParams.deviceInfo, baseParams.request, adverification.getVerificationVendor(), adverification, baseParams.programmaticTrackingService);
                om.setOMAdViewBuilder(omAdViewBuilder);
                omInstances.push(om);
                // }
            });

            const omManager = new VastOpenMeasurementController(baseParams.placement, omInstances, omAdViewBuilder);
            omManager.addToViewHierarchy();
            omManager.injectVerifications();
            vastAdUnitParameters.om = omManager;
        }

        return vastAdUnitParameters;
    }
}
