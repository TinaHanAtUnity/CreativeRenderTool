import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { AdMobSessionInterfaceEventBridge } from 'Ads/Views/OpenMeasurement/AdMobSessionInterfaceEventBridge';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';
import { OpenMeasurementController } from 'Ads/Views/OpenMeasurement/OpenMeasurementController';
import { MediaType } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { ThirdPartyEventMacro } from 'Ads/Managers/ThirdPartyEventManager';
import { SDKMetrics, AdmobMetric } from 'Ads/Utilities/SDKMetrics';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
export class AdmobOpenMeasurementController extends OpenMeasurementController {
    constructor(platform, core, clientInfo, campaign, placement, deviceInfo, request, omAdViewBuilder, thirdPartyEventManager) {
        super(placement, omAdViewBuilder);
        this._platform = platform;
        this._core = core;
        this._clientInfo = clientInfo;
        this._campaign = campaign;
        this._deviceInfo = deviceInfo;
        this._request = request;
        this._thirdPartyEventManager = thirdPartyEventManager;
        this._omAdSessionId = JaegerUtilities.uuidv4();
        this._omSessionInterfaceBridge = new AdMobSessionInterfaceEventBridge(core, {
            onImpression: (impressionValues) => this.admobImpression(omAdViewBuilder),
            onLoaded: (vastProperties) => this.loaded(vastProperties),
            onStart: (duration, videoPlayerVolume) => this.start(duration),
            onSendFirstQuartile: () => this.sendFirstQuartile(),
            onSendMidpoint: () => this.sendMidpoint(),
            onSendThirdQuartile: () => this.sendThirdQuartile(),
            onCompleted: () => this.completed(),
            onPause: () => this.pause(),
            onResume: () => this.resume(),
            onBufferStart: () => this.bufferStart(),
            onBufferFinish: () => this.bufferFinish(),
            onSkipped: () => this.skipped(),
            onVolumeChange: (videoPlayerVolume) => this.volumeChange(videoPlayerVolume),
            onPlayerStateChange: (playerState) => this.playerStateChanged(playerState),
            onAdUserInteraction: (interactionType) => this.adUserInteraction(interactionType),
            onSlotElement: (element) => { this._admobSlotElement = element; },
            onVideoElement: (element) => { this._admobVideoElement = element; },
            onElementBounds: (elementBounds) => { this._admobElementBounds = elementBounds; },
            onInjectVerificationResources: (verifcationResources) => this.injectVerificationResources(verifcationResources),
            onSessionStart: (sessionEvent) => this.sessionStart(sessionEvent),
            onSessionFinish: (sessionEvent) => this.sessionFinish(),
            onSessionError: (sessionEvent) => this.sessionError(sessionEvent)
        }, this);
    }
    injectVerificationResources(verificationResources) {
        const omVendors = [];
        verificationResources.forEach((resource) => {
            const om = new OpenMeasurement(this._platform, this._core, this._clientInfo, this._campaign, this._placement, this._deviceInfo, this._thirdPartyEventManager, resource.vendorKey);
            this.setupOMInstance(om, resource);
            if (CustomFeatures.isDoubleClickGoogle(resource.vendorKey)) {
                SDKMetrics.reportMetricEventWithTags(AdmobMetric.DoubleClickInstanceCreated, {
                    'dckey': OpenMeasurementUtilities.getDcKeyMetricTag(resource.vendorKey)
                });
            }
            omVendors.push(resource.vendorKey);
        });
        this._campaign.setOMVendors(omVendors);
        this._thirdPartyEventManager.setTemplateValue(ThirdPartyEventMacro.OM_VENDORS, omVendors.join('|'));
    }
    setupOMInstance(om, resource) {
        this._omInstances.push(om);
        om.setAdmobOMSessionId(this._omAdSessionId);
        this.mountOMInstance(om, resource);
    }
    mountOMInstance(om, resource) {
        om.addToViewHierarchy();
        om.injectVerificationResources([resource]);
    }
    addToViewHierarchy() {
        this.addMessageListener();
    }
    removeFromViewHieararchy() {
        this.removeMessageListener();
        this._omInstances.forEach((om) => {
            om.removeFromViewHieararchy();
        });
    }
    addMessageListener() {
        if (this._omSessionInterfaceBridge) {
            this._omSessionInterfaceBridge.connect();
        }
    }
    removeMessageListener() {
        if (this._omSessionInterfaceBridge) {
            this._omSessionInterfaceBridge.disconnect();
        }
    }
    // look at getting an individual session id from an om instance
    getOMAdSessionId() {
        return this._omAdSessionId;
    }
    getSlotElement() {
        return this._admobSlotElement;
    }
    getVideoElement() {
        return this._admobVideoElement;
    }
    getAdmobVideoElementBounds() {
        return this._admobElementBounds;
    }
    getAdmobBridge() {
        return this._omSessionInterfaceBridge;
    }
    getSDKVersion() {
        return this._clientInfo.getSdkVersionName();
    }
    admobImpression(omAdViewBuilder) {
        SDKMetrics.reportMetricEvent(AdmobMetric.AdmobOMImpression);
        const viewport = OpenMeasurementUtilities.calculateViewPort(screen.width, screen.height);
        const adView = omAdViewBuilder.buildAdmobImpressionView(this, screen.width, screen.height);
        const impressionObject = {
            mediaType: MediaType.VIDEO,
            viewport: viewport,
            adView: adView
        };
        this._omInstances.forEach((om) => {
            const verificationresource = om.getVerificationResource();
            if (CustomFeatures.isDoubleClickGoogle(verificationresource.vendorKey)) {
                SDKMetrics.reportMetricEventWithTags(AdmobMetric.DoubleClickOMImpressions, {
                    'dckey': OpenMeasurementUtilities.getDcKeyMetricTag(verificationresource.vendorKey)
                });
            }
        });
        super.impression(impressionObject);
        this.geometryChange(viewport, adView);
    }
    getOMInstances() {
        return this._omInstances;
    }
    sessionStart(sessionEvent) {
        this._omInstances.forEach((om) => {
            // Need a deep assignment to avoid duplication for events
            const event = JSON.parse(JSON.stringify(sessionEvent));
            const verificationresource = om.getVerificationResource();
            event.data.verificationParameters = verificationresource.verificationParameters;
            event.data.vendorkey = verificationresource.vendorKey;
            om.sessionStart(event);
            if (CustomFeatures.isDoubleClickGoogle(verificationresource.vendorKey)) {
                SDKMetrics.reportMetricEventWithTags(AdmobMetric.DoubleClickOMStarts, {
                    'dckey': OpenMeasurementUtilities.getDcKeyMetricTag(verificationresource.vendorKey)
                });
            }
        });
    }
    /**
     * SessionFinish:
     */
    sessionFinish() {
        super.sessionFinish();
        this._omSessionInterfaceBridge.sendSessionFinish();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRtb2JPcGVuTWVhc3VyZW1lbnRDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9WaWV3cy9PcGVuTWVhc3VyZW1lbnQvQWRtb2JPcGVuTWVhc3VyZW1lbnRDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsTUFBTSw0REFBNEQsQ0FBQztBQUU5RyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFPOUQsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0scURBQXFELENBQUM7QUFDaEcsT0FBTyxFQUFpSSxTQUFTLEVBQXlFLE1BQU0sb0RBQW9ELENBQUM7QUFFclIsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDOUYsT0FBTyxFQUEwQixvQkFBb0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQ25HLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFbkUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTlELE1BQU0sT0FBTyw4QkFBK0IsU0FBUSx5QkFBeUI7SUFrQnpFLFlBQVksUUFBa0IsRUFBRSxJQUFjLEVBQUUsVUFBc0IsRUFBRSxRQUF1QixFQUFFLFNBQW9CLEVBQUUsVUFBc0IsRUFBRSxPQUF1QixFQUFFLGVBQTZDLEVBQUUsc0JBQThDO1FBQ2pRLEtBQUssQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFFbEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFDOUIsSUFB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