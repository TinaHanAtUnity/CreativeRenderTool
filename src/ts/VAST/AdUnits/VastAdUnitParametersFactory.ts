import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { IVastAdUnitParameters } from 'VAST/AdUnits/VastAdUnit';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { VastVideoOverlay } from 'Ads/Views/VastVideoOverlay';
import { VastEndScreen, IVastEndscreenParameters } from 'VAST/Views/VastEndScreen';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { OpenMeasurementTest } from 'Core/Models/ABGroup';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
import { VastAdVerification } from 'VAST/Models/VastAdVerification';

export class VastAdUnitParametersFactory extends AbstractAdUnitParametersFactory<VastCampaign, IVastAdUnitParameters> {
    protected createParameters(baseParams: IAdUnitParameters<VastCampaign>) {
        const overlay = new VastVideoOverlay(baseParams, baseParams.privacy, this.showGDPRBanner(baseParams));
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
                country: baseParams.coreConfig.getCountry()
            };

            vastEndScreen = new VastEndScreen(baseParams.platform, vastEndscreenParameters, baseParams.privacy);
            vastAdUnitParameters.endScreen = vastEndScreen;
        }

        const adVerifications: VastAdVerification[] = baseParams.campaign.getVast().getAdVerifications();
        if (adVerifications) {
            const omInstances: OpenMeasurement[] = [];
            adVerifications.forEach((adverification) => {
                if (adverification.getVerificationVendor() === 'IAS') {
                    const om = new OpenMeasurement(baseParams.platform, baseParams.core, baseParams.clientInfo, baseParams.campaign, baseParams.placement, baseParams.deviceInfo, baseParams.request, adverification.getVerificationVendor(), adverification, baseParams.programmaticTrackingService);
                    omInstances.push(om);
                }
            });

            const omManager = new VastOpenMeasurementController(baseParams.placement, omInstances);
            omManager.addToViewHierarchy();
            omManager.injectVerifications();
            vastAdUnitParameters.om = omManager;
        }

        return vastAdUnitParameters;
    }
}
