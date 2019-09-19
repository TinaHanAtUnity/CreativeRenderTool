import { ICoreApi } from 'Core/ICore';
import { AdmobOpenMeasurementManager } from 'Ads/Views/OpenMeasurement/AdmobOpenMeasurementManager';
import { OMID3pEvents, SessionEvents, ISessionEvent, IImpressionValues, IVastProperties, VideoPlayerState, InteractionType, IVerificationScriptResource, IRectangle } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';

export enum OMEvents {
    IMPRESSION_OCCURRED = 'impressionOccurred',
    LOADED = 'loaded',
    START = 'start',
    FIRST_QUARTILE = 'firstQuartile',
    MIDPOINT = 'midpoint',
    THIRD_QUARTILE = 'thirdQuartile',
    COMPLETE = 'complete',
    PAUSE = 'pause',
    RESUME = 'resume',
    BUFFER_START = 'bufferStart',
    BUFFER_FINISH = 'bufferFinish',
    SKIPPED = 'skipped',
    VOLUME_CHANGE = 'volumeChange',
    PLAYER_STATE_CHANGE = 'playerStateChange',
    AD_USER_INTERACTION = 'adUserInteraction',
    GEOMETRY_CHANGE = 'geometryChange'
}

export enum OMSessionInfo {
    SDK_VERSION = 'sdkVersion',
    SESSION_ID = 'sessionId',
    VIDEO_ELEMENT = 'videoElement',
    SLOT_ELEMENT = 'slotElement',
    ELEMENT_BOUNDS = 'elementBounds'
}

export interface IOMIDHandler {
    onImpression(impressionValues: IImpressionValues): void;
    onLoaded(vastPropeties: IVastProperties): void;
    onStart(duration: number, videoPlayerVolume: number): void;
    onSendFirstQuartile(): void;
    onSendMidpoint(): void;
    onSendThirdQuartile(): void;
    onCompleted(): void;
    onPause(): void;
    onResume(): void;
    onBufferStart(): void;
    onBufferFinish(): void;
    onSkipped(): void;
    onVolumeChange(videoPlayerVolume: number): void;
    onPlayerStateChange(videoPlayerState: VideoPlayerState): void;
    onAdUserInteraction(interactionType: InteractionType): void;
    onInjectVerificationResources(verificationResources: IVerificationScriptResource[]): void;
    onSessionStart(event: ISessionEvent): void;
    onSessionError(event: ISessionEvent): void;
    onSessionFinish(event: ISessionEvent): void;
    onSlotElement(element: HTMLElement): void;
    onVideoElement(element: HTMLElement): void;
    onElementBounds(elementBounds: IRectangle): void;
}

export interface IOMIDMessage {
    type: string;
    event: string;
    data: { [key: string]: unknown };
}

export class AdMobSessionInterfaceEventBridge {
    private _core: ICoreApi;
    private _messageListener: (e: Event) => void;
    private _handler: IOMIDHandler;
    private _omidHandlers: { [event: string]: (msg: IOMIDMessage) => void };

    private _iframeSessionInterface: HTMLIFrameElement;

    constructor(core: ICoreApi, handler: IOMIDHandler, openMeasurement: AdmobOpenMeasurementManager) {
        this._core = core;
        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);
        this._omidHandlers = {};
        this._handler = handler;

        this._omidHandlers = {};
        this._omidHandlers[OMEvents.IMPRESSION_OCCURRED] = (msg) => this._handler.onImpression(<IImpressionValues><unknown>msg.data);
        this._omidHandlers[OMEvents.LOADED] = (msg) => this._handler.onLoaded(<IVastProperties><unknown>msg.data);
        this._omidHandlers[OMEvents.START] = (msg) => this._handler.onStart(<number>msg.data.duration, <number>msg.data.videoPlayerVolume);
        this._omidHandlers[OMEvents.FIRST_QUARTILE] = (msg) => this._handler.onSendFirstQuartile();
        this._omidHandlers[OMEvents.MIDPOINT] = (msg) => this._handler.onSendMidpoint();
        this._omidHandlers[OMEvents.THIRD_QUARTILE] = (msg) => this._handler.onSendThirdQuartile();
        this._omidHandlers[OMEvents.COMPLETE] = (msg) => this._handler.onCompleted();
        this._omidHandlers[OMEvents.PAUSE] = (msg) => this._handler.onPause();
        this._omidHandlers[OMEvents.RESUME] = (msg) => this._handler.onResume();
        this._omidHandlers[OMEvents.BUFFER_START] = (msg) => this._handler.onBufferStart();
        this._omidHandlers[OMEvents.BUFFER_FINISH] = (msg) => this._handler.onBufferFinish();
        this._omidHandlers[OMEvents.SKIPPED] = (msg) => this._handler.onSkipped();
        this._omidHandlers[OMEvents.VOLUME_CHANGE] = (msg) => this._handler.onVolumeChange(<number>msg.data.videoPlayerVolume);
        this._omidHandlers[OMEvents.PLAYER_STATE_CHANGE] = (msg) => this._handler.onPlayerStateChange(<VideoPlayerState>msg.data.playerState);
        this._omidHandlers[OMEvents.AD_USER_INTERACTION] = (msg) => this._handler.onAdUserInteraction(<InteractionType>msg.data.interactionType);

        this._omidHandlers[SessionEvents.SESSION_START] = (msg) => this._handler.onSessionStart(<ISessionEvent><unknown>msg.data);
        this._omidHandlers[SessionEvents.SESSION_FINISH] = (msg) => this._handler.onSessionFinish(<ISessionEvent><unknown>msg.data);
        this._omidHandlers[SessionEvents.SESSION_ERROR] = (msg) => this._handler.onSessionError(<ISessionEvent><unknown>msg.data);

        this._omidHandlers[OMID3pEvents.VERIFICATION_RESOURCES] = (msg) => this._handler.onInjectVerificationResources(<IVerificationScriptResource[]><unknown>msg.data);

        this._omidHandlers[OMSessionInfo.SDK_VERSION] = (msg) => this.sendSDKVersion(openMeasurement.getSDKVersion());
        this._omidHandlers[OMSessionInfo.SESSION_ID] = (msg) => this.sendSessionId(openMeasurement.getOMAdSessionId());

        this._omidHandlers[OMSessionInfo.VIDEO_ELEMENT] = (msg) => this._handler.onSlotElement(<HTMLElement>msg.data.videoElement);
        this._omidHandlers[OMSessionInfo.SLOT_ELEMENT] = (msg) => this._handler.onVideoElement(<HTMLElement>msg.data.slotElement);
        this._omidHandlers[OMSessionInfo.ELEMENT_BOUNDS] = (msg) => this._handler.onElementBounds(<IRectangle>msg.data.elementBounds);
    }

    public connect() {
        window.addEventListener('message', this._messageListener, false);
    }

    public disconnect() {
        window.removeEventListener('message', this._messageListener);
    }

    public setAdmobIframe(iframe: HTMLIFrameElement) {
        this._iframeSessionInterface = iframe;
    }

    public sendSDKVersion(sdkVersion: string) {
        this.postMessage(OMSessionInfo.SDK_VERSION, sdkVersion);
    }

    public sendSessionId(sessionId: string) {
        this.postMessage(OMSessionInfo.SESSION_ID, sessionId);
    }

    public sendSessionFinish() {
        this.postMessage(SessionEvents.SESSION_FINISH);
    }

    private onMessage(e: MessageEvent) {
        const message = <IOMIDMessage>e.data;
        if (message.type === 'omid') {
            this._core.Sdk.logInfo(`omid: event=${message.event}, data=${JSON.stringify(message.data)}`);
            if (message.event in this._omidHandlers) {
                const handler = this._omidHandlers[message.event];
                handler(message);
            }
        }
    }

    private postMessage(event: string, data?: unknown) {
        if (this._iframeSessionInterface && this._iframeSessionInterface.contentWindow) {
            this._iframeSessionInterface.contentWindow.postMessage({
                type: event,
                value: data
            }, '*');
        }
    }
}
