import { OpenMeasurement, OMID_P } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { AdMobSessionInterfaceEventBridge } from 'Ads/Views/OpenMeasurement/AdMobSessionInterfaceEventBridge';
import { Placement } from 'Ads/Models/Placement';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { RequestManager } from 'Core/Managers/RequestManager';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { OpenMeasurementController } from 'Ads/Views/OpenMeasurement/OpenMeasurementController';
import { IRectangle, IImpressionValues, IVastProperties, VideoPlayerState, InteractionType, IVerificationScriptResource, ISessionEvent, MediaType, VideoEventAdaptorType, IViewPort, IAdView, DoubleClickAdmobVendorTags } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { ThirdPartyEventManager, ThirdPartyEventMacro } from 'Ads/Managers/ThirdPartyEventManager';
import { SDKMetrics, AdmobMetric } from 'Ads/Utilities/SDKMetrics';
import { Campaign } from 'Ads/Models/Campaign';

export class AdmobOpenMeasurementController extends OpenMeasurementController {

    // only for admob:
    private _omSessionInterfaceBridge: AdMobSessionInterfaceEventBridge;
    private _omAdSessionId: string;
    private _admobSlotElement: HTMLElement;
    private _admobVideoElement: HTMLElement;
    private _admobElementBounds: IRectangle;

    // base params for OM Instances:
    private _platform: Platform;
    private _core: ICoreApi;
    private _clientInfo: ClientInfo;
    private _campaign: AdMobCampaign;
    private _deviceInfo: DeviceInfo;
    private _request: RequestManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;

    constructor(platform: Platform, core: ICoreApi, clientInfo: ClientInfo, campaign: AdMobCampaign, placement: Placement, deviceInfo: DeviceInfo, request: RequestManager, omAdViewBuilder: OpenMeasurementAdViewBuilder, thirdPartyEventManager: ThirdPartyEventManager) {
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
            onImpression: (impressionValues: IImpressionValues) => this.admobImpression(omAdViewBuilder),
            onLoaded: (vastProperties: IVastProperties) => this.loaded(vastProperties),
            onStart: (duration: number, videoPlayerVolume: number) => this.start(duration), // TODO: Add for admob videos
            onSendFirstQuartile: () => this.sendFirstQuartile(),
            onSendMidpoint: () =>  this.sendMidpoint(),
            onSendThirdQuartile: () => this.sendThirdQuartile(),
            onCompleted: () => this.completed(),
            onPause: () => this.pause(),
            onResume: () => this.resume(),
            onBufferStart: () => this.bufferStart(),
            onBufferFinish: () => this.bufferFinish(),
            onSkipped: () => this.skipped(),
            onVolumeChange: (videoPlayerVolume: number) => this.volumeChange(videoPlayerVolume),
            onPlayerStateChange: (playerState: VideoPlayerState) => this.playerStateChanged(playerState),
            onAdUserInteraction: (interactionType: InteractionType) => this.adUserInteraction(interactionType),
            onSlotElement: (element: HTMLElement) => { this._admobSlotElement = element; },
            onVideoElement: (element: HTMLElement) => { this._admobVideoElement = element; },
            onElementBounds: (elementBounds: IRectangle) => { this._admobElementBounds = elementBounds; },
            onInjectVerificationResources: (verifcationResources: IVerificationScriptResource[]) => this.injectVerificationResources(verifcationResources),
            onSessionStart: (sessionEvent: ISessionEvent) => this.sessionStart(sessionEvent),
            onSessionFinish: (sessionEvent: ISessionEvent) => this.sessionFinish(),
            onSessionError: (sessionEvent: ISessionEvent) => this.sessionError(sessionEvent)
        }, this);
        SDKMetrics.reportMetricEvent(AdmobMetric.AdmobOMEnabled);
    }

    public injectVerificationResources(verificationResources: IVerificationScriptResource[]) {
        const omVendors: string[] = [];
        verificationResources.forEach((resource) => {
            const om = new OpenMeasurement<AdMobCampaign>(this._platform, this._core, this._clientInfo, this._campaign, this._placement, this._deviceInfo, this._request, resource.vendorKey);
            this.setupOMInstance(om, resource);
            if (resource.vendorKey.startsWith('doubleclickbygoogle.com')) {
                SDKMetrics.reportMetricEventWithTags(AdmobMetric.DoubleClickInstanceCreated,
                [
                    SDKMetrics.createAdsSdkTag('dckey', OpenMeasurementUtilities.setMetricTag(resource.vendorKey))
                ]);
            }
            omVendors.push(resource.vendorKey);
        });
        this._campaign.setOMVendors(omVendors);
        this._thirdPartyEventManager.setTemplateValue(ThirdPartyEventMacro.OM_VENDORS, omVendors.join('|'));
        SDKMetrics.reportMetricEvent(AdmobMetric.AdmobOMInjected);
    }

    public setupOMInstance(om: OpenMeasurement<AdMobCampaign>, resource: IVerificationScriptResource) {
        this._omInstances.push(om);
        om.setAdmobOMSessionId(this._omAdSessionId);
        this.mountOMInstance(om, resource);
    }

    public mountOMInstance(om: OpenMeasurement<AdMobCampaign>, resource: IVerificationScriptResource): void {
        om.addToViewHierarchy();
        om.injectVerificationResources([resource]);
    }

    public addToViewHierarchy(): void {
        this.addMessageListener();
    }

    public removeFromViewHieararchy(): void {
        this.removeMessageListener();
        this._omInstances.forEach((om) => {
            om.removeFromViewHieararchy();
        });
    }

    private addMessageListener() {
        if (this._omSessionInterfaceBridge) {
            this._omSessionInterfaceBridge.connect();
        }
    }

    private removeMessageListener() {
        if (this._omSessionInterfaceBridge) {
            this._omSessionInterfaceBridge.disconnect();
        }
    }

    // look at getting an individual session id from an om instance
    public getOMAdSessionId(): string {
        return this._omAdSessionId;
    }

    public getSlotElement(): HTMLElement {
        return this._admobSlotElement;
    }

    public getVideoElement(): HTMLElement {
        return this._admobVideoElement;
    }

    public getAdmobVideoElementBounds(): IRectangle {
        return this._admobElementBounds;
    }

    public getAdmobBridge(): AdMobSessionInterfaceEventBridge {
        return this._omSessionInterfaceBridge;
    }

    public getSDKVersion(): string {
        return this._clientInfo.getSdkVersionName();
    }

    public admobImpression(omAdViewBuilder: OpenMeasurementAdViewBuilder): Promise<void> {
        return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()]).then(([screenWidth, screenHeight]) => {
            const impressionObject: IImpressionValues = {
                mediaType: MediaType.VIDEO
            };

            let viewport: IViewPort;
            let adView: IAdView;

            if (this._platform === Platform.ANDROID) {
                viewport = OpenMeasurementUtilities.calculateViewPort(OpenMeasurementUtilities.pxToDpAdmobScreenView(screenWidth, this._deviceInfo), OpenMeasurementUtilities.pxToDpAdmobScreenView(screenHeight, this._deviceInfo));
            } else {
                viewport = OpenMeasurementUtilities.calculateViewPort(screenWidth, screenHeight);
            }

            adView = omAdViewBuilder.buildAdmobImpressionView(this, screenWidth, screenHeight);

            impressionObject.viewport = viewport;
            impressionObject.adView = adView;

            this._omInstances.forEach((om) => {
                SDKMetrics.reportMetricEvent(AdmobMetric.AdmobOMImpression);

                const verificationresource = om.getVerificationResource();
                if (verificationresource.vendorKey.startsWith('doubleclickbygoogle.com')) {
                    SDKMetrics.reportMetricEventWithTags(AdmobMetric.DoubleClickOMImpressions,
                    [
                        SDKMetrics.createAdsSdkTag('dckey', OpenMeasurementUtilities.setMetricTag(verificationresource.vendorKey))
                    ]);
                }
            });
            super.impression(impressionObject);

            // TODO: Remove once Admob fixes their issue in Jan 2020
            this.geometryChange(viewport, adView);
        }).catch((e) => {
            const impressionObject: IImpressionValues = {
                mediaType: MediaType.VIDEO
            };

            this._omInstances.forEach((om) => {
                SDKMetrics.reportMetricEvent(AdmobMetric.AdmobOMImpression);

                const verificationresource = om.getVerificationResource();
                if (verificationresource.vendorKey.startsWith('doubleclickbygoogle.com')) {
                    SDKMetrics.reportMetricEventWithTags(AdmobMetric.DoubleClickOMImpressions,
                    [
                        SDKMetrics.createAdsSdkTag('dckey', OpenMeasurementUtilities.setMetricTag(verificationresource.vendorKey))
                    ]);
                }
            });
            super.impression(impressionObject);
        });
    }

    public getOMInstances(): OpenMeasurement<Campaign>[] {
        return this._omInstances;
    }

    public sessionStart(sessionEvent: ISessionEvent) {

        this._omInstances.forEach((om) => {
            // Need a deep assignment to avoid duplication for events
            const event = JSON.parse(JSON.stringify(sessionEvent));
            const verificationresource = om.getVerificationResource();
            event.data.verificationParameters = verificationresource.verificationParameters;
            event.data.vendorkey = verificationresource.vendorKey;
            om.sessionStart(event);

            if (verificationresource.vendorKey.startsWith('doubleclickbygoogle.com')) {
                SDKMetrics.reportMetricEventWithTags(AdmobMetric.DoubleClickOMStarts,
                [
                    SDKMetrics.createAdsSdkTag('dckey', OpenMeasurementUtilities.setMetricTag(verificationresource.vendorKey))
                ]);
            }
            SDKMetrics.reportMetricEvent(AdmobMetric.AdmobOMSessionStart);
        });
    }

    /**
     * SessionFinish:
     */
    public sessionFinish() {
        super.sessionFinish();
        this._omSessionInterfaceBridge.sendSessionFinish();
    }
}
