import { ICoreApi } from 'Core/ICore';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';

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

export interface IOMIDMessage {
    type: string;
    event: string;
    data: { [key: string]: unknown };
}
export interface ISessionEvent {
    adSessionId: string;
    timestamp: number;
    type: string;
    data: {[key: string]: unknown};
}

export interface IVerificationEvent {
    type: string;
    adSessionId: string;
    payload?: unknown;
}

export interface IVerificationScriptResource {
    resourceUrl: string;
    vendorKey: string;
    verificationParameters: string | null;
}

export interface IOMIDEventHandler {
    onEventProcessed(eventType: string, vendorKey?: string): void;
}

export class OMIDEventBridge {
    private _core: ICoreApi;
    private _messageListener: (e: Event) => void;
    private _handler: IOMIDEventHandler;
    private _omidHandlers: { [event: string]: (msg: IOMIDMessage) => void };
    private _openMeasurement: OpenMeasurement;

    private _iframe3p: HTMLIFrameElement;

    private _eventQueue: IVerificationEvent[] = [];
    private _eventQueueSent = false;
    private _verificationsInjected = false;

    constructor(core: ICoreApi, handler: IOMIDEventHandler, iframe: HTMLIFrameElement, openMeasurement: OpenMeasurement) {
        this._core = core;
        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);
        this._omidHandlers = {};
        this._handler = handler;
        this._iframe3p = iframe;
        this._openMeasurement = openMeasurement;
        this._omidHandlers[OMID3pEvents.ON_EVENT_PROCESSED] = (msg) => this._handler.onEventProcessed(<string>msg.data.eventType, <string>msg.data.vendorKey);
    }

    public connect() {
        window.addEventListener('message', this._messageListener, false);
    }

    public disconnect() {
        window.removeEventListener('message', this._messageListener);
    }

    public setIframe(iframe: HTMLIFrameElement) {
        this._iframe3p = iframe;
    }

    public setVerificationsInjected(verificationsInjected: boolean) {
        this._verificationsInjected = verificationsInjected;
    }

    public sendQueuedEvents() {
        while (this._eventQueue.length > 0 && this._iframe3p.contentWindow) {
            const event = this._eventQueue.shift();
            this._iframe3p.contentWindow.postMessage(event, '*');
        }
        this._eventQueueSent = true;
    }

    public triggerAdEvent(type: string, payload?: unknown) {
        this._core.Sdk.logDebug('Calling OM ad event "' + type + '" with payload: ' + payload);

        const event: IVerificationEvent = {
            type: type,
            adSessionId: this._openMeasurement.getOMAdSessionId(),
            payload: payload
        };

        if (this._iframe3p.contentWindow && this._verificationsInjected) {
            this._iframe3p.contentWindow.postMessage(event, '*');
        }

        // TODO: FIX
        // if (!this._eventQueueSent) {
        //     this._eventQueue.push(event);
        // }
    }

    public triggerVideoEvent(type: string, payload?: unknown) {
        this._core.Sdk.logDebug('Calling OM viewability event "' + type + '" with payload: ' + payload);

        const event: IVerificationEvent = {
            type: type,
            adSessionId: this._openMeasurement.getOMAdSessionId(),
            payload: payload
        };

        if (this._iframe3p.contentWindow && this._verificationsInjected) {
            this._iframe3p.contentWindow.postMessage(event, '*');
        }

        if (!this._eventQueueSent) {
            this._eventQueue.push(event);
        }
    }

    public triggerSessionEvent(event: ISessionEvent) {

        // posts current event to omid3p
        this._core.Sdk.logDebug('Calling OM session event "' + event.type + '" with data: ' + event.data);
        if (this._iframe3p.contentWindow) {
            this._iframe3p.contentWindow.postMessage(event, '*');
        }

        // TODO: FIX
        // if (!this._eventQueueSent) {
        //     this._eventQueue.push(event);
        // }
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
}
