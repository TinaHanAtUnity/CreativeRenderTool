import { ICoreApi } from 'Core/ICore';

export enum OMEvents {
    IMPRESSION_OCCURED = 'impressionOccured',
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
    SESSION_ID = 'sessionId'
}

export enum SESSIONEvents {
    SESSION_START = 'sessionStart',
    SESSION_ERROR = 'sessionError',
    SESSION_FINISH = 'sessionFinish'
}

export enum OMID3pEvents {
    VERIFICATION_RESOURCES = 'verificationResources',
    POPULATE_VENDOR_KEY = 'populateVendorKey',
    ON_EVENT_PROCESSED = 'onEventProcessed',
    OMID_IMPRESSION = 'omidImpression',
    OMID_LOADED = 'omidLoaded',
    OMID_START = 'omidStart',
    OMID_FIRST_QUARTILE = 'omidFirstQuartile',
    OMID_MIDPOINT = 'omidMidpoint',
    OMID_THIRD_QUARTILE = 'omidThirdQuartile',
    OMID_COMPLETE = 'omidComplete',
    OMID_PAUSE = 'omidPause',
    OMID_RESUME = 'omidResume',
    OMID_BUFFER_START = 'omidBufferStart',
    OMID_BUFFER_FINISH = 'omidBufferFinish',
    OMID_SKIPPED = 'omidSkipped',
    OMID_VOLUME_CHANGE = 'omidVolumeChange',
    OMID_PLAYER_STATE_CHANGE = 'omidPlayerStateChange',
    OMID_AD_USER_INTERACTION = 'omidAdUserInteraction',
    OMID_GEOMETRY_CHANGE = 'omidGeometryChange'
}

export enum VideoPosition {
    PREROLL     = 'preroll',                            // The ad plays preceding video content
    MIDROLL     = 'midroll',                            // The ad plays in the middle of video content
    POSTROLL    = 'postroll',                           // The ad plays following video content
    STANDALONE  = 'standalone'                          // The ad plays independently of any video
}

export enum VideoPlayerState {
    MINIMIZED  = 'minimized',
    COLLAPSED  = 'collapsed',
    NORMAL     = 'normal',
    EXPANDED   = 'expanded',
    FULLSCREEN = 'fullscreen'
}

export enum InteractionType {
    CLICK              = 'click',
    INVITATION_ACCEPT  = 'invitationAccept'
}

export interface IRectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface IRectangleObstructions extends IRectangle {
    obstructions: IRectangle[];
}

export interface IViewPort {
    width: number;
    height: number;
}

/**
 * https://s3-us-west-2.amazonaws.com/omsdk-files/docs/OMID_API_GA_v1.pdf pg 59-61
 * geometry - Provides geometry data of the ad view for the current ad session id
 * onScreenGeometry - Provides geometry data of the ad view after processing all parent views
 * containerGeometry - Provides geometry data of the ad container(webview) for the current ad session id
 * onScreenContainerGeometry - Provides geometry data of the ad container (webview) for the current ad session id that is currently visible/on screen
 */
export interface IAdView {
    percentageInView: number;
    geometry: IRectangle;
    onScreenGeometry: IRectangleObstructions;
    measuringElement: boolean;
    containerGeometry?: IRectangle;
    onScreenContainerGeometry?: IRectangleObstructions;
    reasons: ObstructionReasons[];
}

export enum ObstructionReasons {
    NOT_FOUND = 'notFound',
    HIDDEN = 'hidden',
    BACKGROUNDED = 'backgrounded',
    OBSTRUCTED = 'obstructed',
    CLIPPED = 'clipped'
}

export enum MediaType {
    DISPLAY = 'display',
    VIDEO = 'video'
}

export enum AccessMode {
    FULL = 'full',                                      // Verification scripts have access to the entire JS object graph and DOM.
    LIMITED = 'limited'                                 // Verification scripts are limited to a sandboxed iframe.
}

export enum VideoEventAdaptorType {
    JS_CUSTOM = 'jsCustom',                             // Verification scripts have access to the entire JS object graph and DOM.
    NATIVE_CUSTOM = 'nativeCustom'                      // Verification scripts are limited to a sandboxed iframe.
}

export interface IImpressionValues {
    mediaType: MediaType;
    videoEventAdaptorType?: string;
    videoEventAdaptorVersion?: string;
    viewPort?: unknown;
    adView?: IAdView;
}

export interface IVastProperties {
    isSkippable: boolean;
    skipOffset: number;
    isAutoplay: boolean;
    position: VideoPosition;
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
    onPopulateVendorKey(vendorKey: string): void;
    onEventProcessed(eventType: string): void;
}

export interface IOMIDMessage {
    type: string;
    event: string;
    data: { [key: string]: unknown };
}
export interface ISessionEvent {
    adSessionId: string;
    timestamp: Date;
    type: string;
    data: {[key: string]: unknown};
}

export interface IVerificationScriptResource {
    resourceUrl: string;
    vendorKey: string;
    verificationParameters: string | null;
}

export class OMIDEventBridge {
    private _core: ICoreApi;
    private _messageListener: (e: Event) => void;
    private _handler: IOMIDHandler;
    private _omidHandlers: { [event: string]: (msg: IOMIDMessage) => void };
    private _iframe: HTMLIFrameElement;
    private _sessionId: string;

    constructor(core: ICoreApi, handler: IOMIDHandler, iframe: HTMLIFrameElement, sessionId: string) {
        this._core = core;
        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);
        this._omidHandlers = {};
        this._handler = handler;
        this._iframe = iframe;
        this._sessionId = sessionId;

        this._omidHandlers = {};
        this._omidHandlers[OMEvents.IMPRESSION_OCCURED] = (msg) => this._handler.onImpression(<IImpressionValues>msg.data);
        this._omidHandlers[OMEvents.LOADED] = (msg) => this._handler.onLoaded(<IVastProperties>msg.data);
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

        this._omidHandlers[SESSIONEvents.SESSION_START] = (msg) => this._handler.onSessionStart(<ISessionEvent>msg.data);
        this._omidHandlers[SESSIONEvents.SESSION_FINISH] = (msg) => this._handler.onSessionFinish(<ISessionEvent>msg.data);
        this._omidHandlers[SESSIONEvents.SESSION_ERROR] = (msg) => this._handler.onSessionError(<ISessionEvent>msg.data);

        this._omidHandlers[OMID3pEvents.VERIFICATION_RESOURCES] = (msg) => this._handler.onInjectVerificationResources(<IVerificationScriptResource[]>msg.data);
        this._omidHandlers[OMID3pEvents.POPULATE_VENDOR_KEY] = (msg) => this._handler.onPopulateVendorKey(<string>msg.data.vendorkey);
        this._omidHandlers[OMID3pEvents.ON_EVENT_PROCESSED] = (msg) => this._handler.onEventProcessed(<string>msg.data.eventType);
    }

    public connect() {
        window.addEventListener('message', this._messageListener, false);
    }

    public disconnect() {
        window.removeEventListener('message', this._messageListener);
    }

    public setIframe(iframe: HTMLIFrameElement) {
        this._iframe = iframe;
    }

    public sendSDKVersion(sdkVersion: String) {
        this.postMessage(OMSessionInfo.SDK_VERSION, sdkVersion);
    }

    public sendSessionId(sessionId: String) {
        this.postMessage(OMSessionInfo.SESSION_ID, sessionId);
    }

    public triggerAdEvent(type: string, payload?: unknown) {
        this._core.Sdk.logDebug('Calling OM ad event "' + type + '" with payload: ' + payload);
        if (this._iframe.contentWindow) {
            this._iframe.contentWindow.postMessage({
                type: type,
                sessionId: this._sessionId,
                payload: payload
            }, '*');
        }
    }

    public triggerVideoEvent(type: string, payload?: unknown) {
        this._core.Sdk.logDebug('Calling OM viewability event "' + type + '" with payload: ' + payload);
        if (this._iframe.contentWindow) {
            this._iframe.contentWindow.postMessage({
                type: type,
                sessionId: this._sessionId,
                payload: payload
            }, '*');
        }
    }

    public triggerSessionEvent(event: ISessionEvent) {
        this._core.Sdk.logDebug('Calling OM session event "' + event.type + '" with data: ' + event.data);
        if (this._iframe.contentWindow) {
            this._iframe.contentWindow.postMessage(event, '*');
        }
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
        if (this._iframe && this._iframe.contentWindow) {
            this._iframe.contentWindow.postMessage({
                type: event,
                value: data
            }, '*');
        }
    }
}
