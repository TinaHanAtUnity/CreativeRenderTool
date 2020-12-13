import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { ThirdPartyEventMacro } from 'Ads/Managers/ThirdPartyEventManager';
import { SDKMetrics, OMMetric } from 'Ads/Utilities/SDKMetrics';
export class VastOpenMeasurementFactory {
    constructor(adVerifications, campaign, deviceInfo, platform, clientInfo, placement) {
        this.adVerifications = adVerifications;
        this.campaign = campaign;
        this.deviceInfo = deviceInfo;
        this.platform = platform;
        this.clientInfo = clientInfo;
        this.placement = placement;
    }
    createOpenMeasurementManager(core, thirdPartyEventManager) {
        const omAdViewBuilder = new OpenMeasurementAdViewBuilder(this.campaign);
        const omInstances = this.getOMInstances(this.adVerifications, omAdViewBuilder, core, thirdPartyEventManager);
        const omManager = new VastOpenMeasurementController(this.platform, this.placement, omInstances, omAdViewBuilder, this.clientInfo, this.deviceInfo);
        omManager.addToViewHierarchy();
        omManager.injectVerifications();
        return omManager;
    }
    setOMVendorTracking(thirdPartyEventManager) {
        let omVendors = [];
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
            SDKMetrics.reportMetricEvent(OMMetric.OMEnabledLiftOff);
        }
    }
    getOMInstances(adVerifications, omAdViewBuilder, core, thirdPartyEventManager) {
        const omInstances = [];
        adVerifications.forEach((adverification) => {
            if (CustomFeatures.isWhitelistedOMVendor(adverification.getVerificationVendor()) && adverification.getVerficationResources()[0].getApiFramework() === 'omid') {
                const om = new OpenMeasurement(this.platform, core, this.clientInfo, this.campaign, this.placement, this.deviceInfo, thirdPartyEventManager, adverification.getVerificationVendor(), adverification);
                om.setOMAdViewBuilder(omAdViewBuilder);
                omInstances.push(om);
            }
        });
        return omInstances;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdE9wZW5NZWFzdXJlbWVudEZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1ZpZXdzL09wZW5NZWFzdXJlbWVudC9WYXN0T3Blbk1lYXN1cmVtZW50RmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSx3REFBd0QsQ0FBQztBQUN0RyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDNUUsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0seURBQXlELENBQUM7QUFDeEcsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxvQkFBb0IsRUFBMEIsTUFBTSxxQ0FBcUMsQ0FBQztBQUNuRyxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBT2hFLE1BQU0sT0FBTywwQkFBMEI7SUFTbkMsWUFBWSxlQUFxQyxFQUFFLFFBQXNCLEVBQUUsVUFBc0IsRUFBRSxRQUFrQixFQUFFLFVBQXNCLEVBQUUsU0FBb0I7UUFDL0osSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUM7UUFDdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVNLDRCQUE0QixDQUFDLElBQWMsRUFBRSxzQkFBOEM7UUFDOUYsTUFBTSxlQUFlLEdBQUcsSUFBSSw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEUsTUFBTSxXQUFXLEdBQW9D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