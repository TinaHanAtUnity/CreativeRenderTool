import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { IVastAdUnitParameters } from 'VAST/AdUnits/VastAdUnit';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { VastVideoOverlay } from 'Ads/Views/VastVideoOverlay';
import { VastEndScreen, IVastEndscreenParameters } from 'VAST/Views/VastEndScreen';
import { OpenMeasurement, OpenMeasurement as Base } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
import { VastAdVerification } from 'VAST/Models/VastAdVerification';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { ThirdPartyEventMacro, ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { ProgrammaticTrackingService, OMMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';

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
            vastAdUnitParameters.om = this.createOpenMeasurementManager(baseParams, adVerifications);
            this.setOMVendorTracking(adVerifications, baseParams.campaign, baseParams.thirdPartyEventManager);
        }

        return vastAdUnitParameters;
    }

    private createOpenMeasurementManager(baseParams: IAdUnitParameters<VastCampaign>, adVerifications: VastAdVerification[]): VastOpenMeasurementController {
        const omAdViewBuilder = new OpenMeasurementAdViewBuilder(baseParams.campaign, baseParams.deviceInfo, baseParams.platform);
        const omInstances: OpenMeasurement<VastCampaign>[] = this.getOMInstances(adVerifications, baseParams, omAdViewBuilder);
        const omManager = new VastOpenMeasurementController(baseParams.platform, baseParams.placement, omInstances, omAdViewBuilder, baseParams.clientInfo, baseParams.deviceInfo);
        omManager.addToViewHierarchy();
        omManager.injectVerifications();

        return omManager;
    }

    private getOMInstances(adVerifications: VastAdVerification[], baseParams: IAdUnitParameters<VastCampaign>, omAdViewBuilder: OpenMeasurementAdViewBuilder): OpenMeasurement<VastCampaign>[] {
        const omInstances: OpenMeasurement<VastCampaign>[] = [];
        adVerifications.forEach((adverification) => {
            if (CustomFeatures.isIASVendor(adverification.getVerificationVendor()) && adverification.getVerficationResources()[0].getApiFramework() === 'omid') {
                const om = new OpenMeasurement<VastCampaign>(baseParams.platform, baseParams.core, baseParams.clientInfo, baseParams.campaign, baseParams.placement, baseParams.deviceInfo, baseParams.request, adverification.getVerificationVendor(), adverification);
                om.setOMAdViewBuilder(omAdViewBuilder);
                omInstances.push(om);
            }
        });

        return omInstances;
    }

    private setOMVendorTracking(adVerifications: VastAdVerification[], campaign: VastCampaign, thirdPartyEventManager: ThirdPartyEventManager) {
        let omVendors: string[] = [];
        adVerifications.forEach((adverification) => {
            if (adverification.getVerficationResources()[0].getApiFramework() === 'omid') {
                omVendors.push(adverification.getVerificationVendor());
            }
        });

        if (campaign.getVast().isPublicaTag()) {
            // adds publica as an om vendor to use for reporting
            omVendors.push('publica');

            // removes duplicate IAS vendor keys for reporting
            omVendors = omVendors.unique();
        }

        campaign.setOmEnabled(true);
        campaign.setOMVendors(omVendors);

        // For brandv1 and brandv2 tracking
        thirdPartyEventManager.setTemplateValue(ThirdPartyEventMacro.OM_ENABLED, 'true');
        thirdPartyEventManager.setTemplateValue(ThirdPartyEventMacro.OM_VENDORS, omVendors.join('|'));
        if (campaign.getSeatId() === 9078) {
            ProgrammaticTrackingService.reportMetricEvent(OMMetric.OMEnabledLiftOff);
        }

        return omVendors;
    }
}
