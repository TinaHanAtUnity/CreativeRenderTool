export class VastMediaFile {

    private _fileURL: string;
    private _deliveryType: string;
    private _mimeType: string;
    private _codec: string;
    private _bitrate: number;
    private _minBitrate: number;
    private _maxBitrate: number;
    private _width: number;
    private _height: number;
    private _apiFramework: string;
    private _scalable: boolean;
    private _maintainAspectRatio: boolean;

    constructor();
    constructor(fileURL: string, deliveryType: string, codec: string, mimeType: string, bitrate: number,
                minBitrate: number, maxBitrate: number, width: number, height: number);
    constructor(fileURL?: string, deliveryType?: string, codec?: string, mimeType?: string, bitrate?: number,
                minBitrate?: number, maxBitrate?: number, width?: number, height?: number) {
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

    public getFileURL(): string {
        return this._fileURL;
    }

    public getMIMEType(): string {
        return this._mimeType;
    }
}