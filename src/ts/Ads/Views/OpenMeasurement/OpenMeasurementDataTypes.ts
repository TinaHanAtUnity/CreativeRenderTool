export enum SessionEvents {
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
    OMID_GEOMETRY_CHANGE = 'omidGeometryChange',
    OMID_VIDEO = 'omidVideo'
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
    viewport?: unknown;
    adView?: IAdView;
}

export interface IVastProperties {
    isSkippable: boolean;
    skipOffset: number;
    isAutoplay: boolean;
    position: VideoPosition;
}

export interface ISessionEvent {
    adSessionId: string;
    timestamp: number;
    type: string;
    data: {[key: string]: unknown};
    uuid?: string;
}

export interface IVerificationScriptResource {
    resourceUrl: string;
    vendorKey: string;
    verificationParameters: string | null;
}

export interface IContext {
    apiVersion: string;
    environment: string;
    accessMode: AccessMode;
    videoElement?: HTMLVideoElement | null; // Only required for AccessMode.FULL video
    slotElement?: HTMLElement;              // Only required for AccessMode.FULL display
    adSessionType: AdSessionType;
    adServingId?: string;                   // VAST optional field - <AdServingId>
    transactionId?: string;                 // VAST optional field - VAST 4.1 [TRANSACTIONID]
    podSequence?: string;                   // VAST optional field - sequence <Ad> attribute
    adCount?: number;                       // VAST optional field - number of <InLine> elements
    omidNativeInfo?: {
        partnerName: string;
        partnerVersion: string;
    };
    omidJsInfo: IOmidJsInfo;
    app?: IApp;
    deviceInfo: IDeviceInfo;
    supports: string[];
    customReferenceData?: string;
}

export enum AdSessionType {
    NATIVE = 'native',
    HTML = 'html'
}

export const PARTNER_NAME = 'Unity3d';
export const DEFAULT_VENDOR_KEY = 'default_key';
export const OM_JS_VERSION = '1.2.10';
export const OMID_P = `${PARTNER_NAME}/${OM_JS_VERSION}`;
export const SDK_APIS = '7';
