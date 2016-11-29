export class VastCreativeCompanionAd {
    private _id: string | null;
    private _width: number;
    private _height: number;
    private _type: string;
    private _staticResourceURL: string | null;
    private _creativeType: string | null;
    private _companionClickThroughURLTemplate: string | null;
    // private _trackingEvents = {}

    constructor(id: string, creativeType: string, staticResourceURL: string, companionClickThroughURLTemplate: string) {
        this._id = id || null;
        this._width = 0;
        this._height = 0;
        this._type = '';
        this._creativeType = creativeType || null;
        this._staticResourceURL = staticResourceURL || null;
        this._companionClickThroughURLTemplate = companionClickThroughURLTemplate || null;
    }

    public getId(): string | null {
        return this._id;
    }

    public getCreativeType(): string | null {
        return this._creativeType;
    }

    public getStaticResourceURL(): string | null {
        return this._staticResourceURL;
    }

    public getCompanionClickThroughURLTemplate(): string | null {
        return this._companionClickThroughURLTemplate;
    }
}
