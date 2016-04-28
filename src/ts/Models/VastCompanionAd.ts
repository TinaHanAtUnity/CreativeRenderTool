export class VastCompanionAd {

    private _id: string;
    private _width: number;
    private _height: number;
    private _type: number;
    private _staticResource: string;
    private _htmlResource: string;
    private _iframeResource: string;
    private _companionClickThroughURLTemplate: string;
    private _trackingEvents: { [eventName: string]: string[] };

    constructor();
    constructor(id: string, width: number, height: number);
    constructor(id?: string, width?: number, height?: number, type?: number, staticResource?: string, htmlResource?: string,
                iframeResource?: string, companionClickThroughURLTemplate?: string, trackingEvents?: { [eventName: string]: string[] }) {
        this._id = id || null;
        this._width = width || 0;
        this._height = height || 0;
        this._type = type || null;
        this._staticResource = staticResource || null;
        this._htmlResource = htmlResource || null;
        this._iframeResource = iframeResource || null;
        this._companionClickThroughURLTemplate = companionClickThroughURLTemplate || null;
        this._trackingEvents = trackingEvents || {};
    }

    public setType(type: number) {
        this._type = type;
    }

    public setStaticResource(staticResource: string) {
        this._staticResource = staticResource;
    }

    public setHTMLResource(htmlResource: string) {
        this._htmlResource = htmlResource;
    }

    public setIFrameResource(iframeResource: string) {
        this._iframeResource = iframeResource;
    }

    public addTrackingEvent(eventName: string, trackingURLTemplate: string) {
        if (this._trackingEvents[eventName] == null) {
            this._trackingEvents[eventName] = [];
        }
        this._trackingEvents[eventName].push(trackingURLTemplate);
    }

    public setCompanionClickThroughURLTemplate(companionClickThroughURLTemplate: string) {
        this._companionClickThroughURLTemplate = companionClickThroughURLTemplate;
    }

}