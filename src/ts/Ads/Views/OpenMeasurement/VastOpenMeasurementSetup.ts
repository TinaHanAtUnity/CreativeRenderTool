import { VastAdVerification } from 'VAST/Models/VastAdVerification';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { ThirdPartyEventMacro, ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { ProgrammaticTrackingService, OMMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Platform } from 'Core/Constants/Platform';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Placement } from 'Ads/Models/Placement';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ICoreApi } from 'Core/ICore';

export class VastOpenMeasurementSetup {

    private adVerifications: VastAdVerification[];
    private campaign: VastCampaign;
    private deviceInfo: DeviceInfo;
    private platform: Platform;
    private clientInfo: ClientInfo;
    private placement: Placement;

    constructor(adVerifications: VastAdVerification[], campaign: VastCampaign, deviceInfo: DeviceInfo, platform: Platform, clientInfo: ClientInfo, placement: Placement) {
        this.adVerifications = adVerifications;
        this.campaign = campaign;
        this.deviceInfo = deviceInfo;
        this.platform = platform;
        this.clientInfo = clientInfo;
        this.placement = placement;
    }

    public createOpenMeasurementManager(core: ICoreApi, request: RequestManager): VastOpenMeasurementController {
        const omAdViewBuilder = new OpenMeasurementAdViewBuilder(this.campaign, this.deviceInfo, this.platform);
        const omInstances: OpenMeasurement<VastCampaign>[] = this.getOMInstances(this.adVerifications, omAdViewBuilder, core, request);
        const omManager = new VastOpenMeasurementController(this.platform, this.placement, omInstances, omAdViewBuilder, this.clientInfo, this.deviceInfo);
        omManager.addToViewHierarchy();
        omManager.injectVerifications();

        return omManager;
    }

    public setOMVendorTracking(thirdPartyEventManager: ThirdPartyEventManager): void {
        let omVendors: string[] = [];
        this.adVerifications.forEach((adverification) => {
            if (adverification.getVerficationResources()[0].getApiFramework() === 'omid') {
                omVendors.push(adverification.getVerificationVendor());
            }
        });

        if (this.campaign.getVast().isPublicaTag()) {
            // adds publica as an om vendor to use for reporting
            omVendors.push('publica');

            // removes duplicate IAS vendor keys for reporting
            omVendors = omVendors.unique();
        }

        this.campaign.setOmEnabled(true);
        this.campaign.setOMVendors(omVendors);

        // For brandv1 and brandv2 tracking
        thirdPartyEventManager.setTemplateValue(ThirdPartyEventMacro.OM_ENABLED, 'true');
        thirdPartyEventManager.setTemplateValue(ThirdPartyEventMacro.OM_VENDORS, omVendors.join('|'));
        if (this.campaign.getSeatId() === 9078) {
            ProgrammaticTrackingService.reportMetricEvent(OMMetric.OMEnabledLiftOff);
        }
    }

    private getOMInstances(adVerifications: VastAdVerification[], omAdViewBuilder: OpenMeasurementAdViewBuilder, core: ICoreApi, request: RequestManager): OpenMeasurement<VastCampaign>[] {
        const omInstances: OpenMeasurement<VastCampaign>[] = [];
        adVerifications.forEach((adverification) => {
            if (CustomFeatures.isIASVendor(adverification.getVerificationVendor()) && adverification.getVerficationResources()[0].getApiFramework() === 'omid') {
                const om = new OpenMeasurement<VastCampaign>(this.platform, core, this.clientInfo, this.campaign, this.placement, this.deviceInfo, request, adverification.getVerificationVendor(), adverification);
                om.setOMAdViewBuilder(omAdViewBuilder);
                omInstances.push(om);
            }
        });

        return omInstances;
    }
}
