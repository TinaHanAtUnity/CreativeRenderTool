import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { AdMobOmidEventBridge } from 'Ads/Views/OpenMeasurement/AdMobOmidEventBridge';
import { Placement } from 'Ads/Models/Placement';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { RequestManager } from 'Core/Managers/RequestManager';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { OpenMeasurementManager } from 'Ads/Views/OpenMeasurement/OpenMeasurementManager';
import { IRectangle, IImpressionValues, IVastProperties, VideoPlayerState, InteractionType, IVerificationScriptResource, ISessionEvent } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';

export class AdmobOpenMeasurementManager extends OpenMeasurementManager {

    // only for admob:
    private _omBridge: AdMobOmidEventBridge;
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

    constructor(platform: Platform, core: ICoreApi, clientInfo: ClientInfo, campaign: AdMobCampaign, placement: Placement, deviceInfo: DeviceInfo, request: RequestManager) {
        super(placement);

        this._platform = platform;
        this._core = core;
        this._clientInfo = clientInfo;
        this._campaign = campaign;
        this._deviceInfo = deviceInfo;
        this._request = request;

        this._omAdSessionId = JaegerUtilities.uuidv4();

        this._omBridge = new AdMobOmidEventBridge(core, {
            onImpression: (impressionValues: IImpressionValues) => this.impression(impressionValues),
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
            onSessionStart: (sessionEvent: ISessionEvent) => this.sessionStart(),   // fired by us
            onSessionFinish: (sessionEvent: ISessionEvent) => this.sessionFinish(), // fired by us
            onSessionError: (sessionEvent: ISessionEvent) => this.sessionError(sessionEvent)
        }, this);
    }

    public injectVerificationResources(verificationResources: IVerificationScriptResource[]) {
        verificationResources.forEach((resource) => {
            const om = new OpenMeasurement(this._platform, this._core, this._clientInfo, this._campaign, this._placement, this._deviceInfo, this._request);
            this._omInstances.push(om);
            this.setupOMInstance(om, resource);
        });
    }

    public setupOMInstance(om: OpenMeasurement, resource: IVerificationScriptResource) {
        om.setAdmobOMSessionId(this._omAdSessionId);
        om.addToViewHierarchy();
        om.injectVerificationResources([resource]);
    }

    public addToViewHierarchy(): void {
        this.addMessageListener();
    }

    public removeFromViewHieararchy(): void {
        this.removeMessageListener();
    }

    // only used above and test
    private addMessageListener() {
        if (this._omBridge) {
            this._omBridge.connect();
        }
    }

    // only used above and test
    private removeMessageListener() {
        if (this._omBridge) {
            this._omBridge.disconnect();
        }
    }

    // look at getting an individual session id from an om instance
    public getOMAdSessionId() {
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

    public getAdmobBridge(): AdMobOmidEventBridge {
        return this._omBridge;
    }

    public getSDKVersion() {
        return this._clientInfo.getSdkVersionName();
    }

    /**
     * SessionFinish:
     */
    public sessionFinish() {
        super.sessionFinish();
        this._omBridge.sendSessionFinish();
    }
}
