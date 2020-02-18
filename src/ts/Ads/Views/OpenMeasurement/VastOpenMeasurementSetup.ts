import { VastAdVerification } from 'VAST/Models/VastAdVerification';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { ThirdPartyEventMacro, ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { ProgrammaticTrackingService, OMMetric } from 'Ads/Utilities/ProgrammaticTrackingService';

export class VastOpenMeasurementSetup {

    private baseParams: IAdUnitParameters<VastCampaign>;
    private adVerifications: VastAdVerification[];

    constructor(baseParams: IAdUnitParameters<VastCampaign>, adVerifications: VastAdVerification[]) {
        this.baseParams = baseParams;
        this.adVerifications = adVerifications;
    }

    public createOpenMeasurementManager(): VastOpenMeasurementController {
        const omAdViewBuilder = new OpenMeasurementAdViewBuilder(this.baseParams.campaign, this.baseParams.deviceInfo, this.baseParams.platform);
        const omInstances: OpenMeasurement<VastCampaign>[] = this.getOMInstances(this.adVerifications, this.baseParams, omAdViewBuilder);
        const omManager = new VastOpenMeasurementController(this.baseParams.platform, this.baseParams.placement, omInstances, omAdViewBuilder, this.baseParams.clientInfo, this.baseParams.deviceInfo);
        omManager.addToViewHierarchy();
        omManager.injectVerifications();

        return omManager;
    }

    public setOMVendorTracking(adVerifications: VastAdVerification[], campaign: VastCampaign, thirdPartyEventManager: ThirdPartyEventManager): void {
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
}
