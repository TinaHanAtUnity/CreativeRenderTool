import { Model } from 'Models/Model';
export class VastMediaFile extends Model {

    private _fileURL: string | null;
    private _deliveryType: string;
    private _mimeType: string | null;
    private _codec: string | null;
    private _bitrate: number;
    private _minBitrate: number;
    private _maxBitrate: number;
    private _width: number;
    private _height: number;
    private _apiFramework: string | null;
    private _scalable: boolean | null;
    private _maintainAspectRatio: boolean | null;

    constructor();
    constructor(fileURL: string, deliveryType: string, codec: string, mimeType: string, bitrate: number,
                minBitrate: number, maxBitrate: number, width: number, height: number);
    constructor(fileURL?: string, deliveryType?: string, codec?: string, mimeType?: string, bitrate?: number,
                minBitrate?: number, maxBitrate?: number, width?: number, height?: number) {
        super();

        this._fileURL = fileURL || null;
        this._deliveryType = deliveryType || 'progressive';
        this._mimeType = mimeType || null;
        this._codec = codec || null;
        this._bitrate = bitrate || 0;
        this._minBitrate = minBitrate || 0;
        this._maxBitrate = maxBitrate || 0;
        this._width = width || 0;
        this._height = height || 0;
        this._apiFramework = null;
        this._scalable = null;
        this._maintainAspectRatio = null;
    }

    public getFileURL(): string | null {
        return this._fileURL;
    }

    public getMIMEType(): string | null {
        return this._mimeType;
    }

    public getDTO(): { [key: string]: any } {
        return {
            'fileURL': this._fileURL,
            'deliveryType': this._deliveryType,
            'mimeType': this._mimeType,
            'codec': this._codec,
            'bitrate': this._bitrate,
            'minBitrate': this._minBitrate,
            'maxBitrate': this._maxBitrate,
            'width': this._width,
            'height': this._height,
            'apiFramework': this._apiFramework,
            'scalable': this._scalable,
            'maintainAspectRatio': this._maintainAspectRatio
        };
    }
}
