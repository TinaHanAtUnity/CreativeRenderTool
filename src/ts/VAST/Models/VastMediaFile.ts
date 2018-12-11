import { Model } from 'Core/Models/Model';

interface IVastMediaFile {
    fileURL: string | null;
    deliveryType: string;
    mimeType: string | null;
    codec: string | null;
    bitrate: number;
    minBitrate: number;
    maxBitrate: number;
    width: number;
    height: number;
    apiFramework: string | null;
    scalable: boolean | null;
    maintainAspectRatio: boolean | null;
    fileSize: number;
}

export class VastMediaFile extends Model<IVastMediaFile> {
    constructor();
    constructor(fileURL?: string, deliveryType?: string | null, codec?: string | null, mimeType?: string | null, bitrate?: number,
        minBitrate?: number, maxBitrate?: number, width?: number, height?: number, apiFramework?: string | null, fileSize?: number) {
        super('VastMediaFile', {
            fileURL: ['string', 'null'],
            deliveryType: ['string'],
            mimeType: ['string', 'null'],
            codec: ['string', 'null'],
            bitrate: ['number'],
            minBitrate: ['number'],
            maxBitrate: ['number'],
            width: ['number'],
            height: ['number'],
            apiFramework: ['string', 'null'],
            scalable: ['boolean', 'null'],
            maintainAspectRatio: ['boolean', 'null'],
            fileSize: ['number']
        });

        this.set('fileURL', fileURL || null);
        this.set('deliveryType', deliveryType || 'progressive');
        this.set('mimeType', mimeType || null);
        this.set('codec', codec || null);
        this.set('bitrate', bitrate || 0);
        this.set('minBitrate', minBitrate || 0);
        this.set('maxBitrate', maxBitrate || 0);
        this.set('width', width || 0);
        this.set('height', height || 0);
        this.set('apiFramework', apiFramework || null);
        this.set('scalable', null);
        this.set('maintainAspectRatio', null);
        this.set('fileSize', fileSize || 0);
    }

    public getFileURL(): string | null {
        return this.get('fileURL');
    }

    public getDeliveryType(): string {
        return this.get('deliveryType');
    }

    public getMIMEType(): string | null {
        return this.get('mimeType');
    }

    public getCodec(): string | null {
        return this.get('codec');
    }

    public getBitrate(): number {
        return this.get('bitrate');
    }

    public getMinBitrate(): number {
        return this.get('minBitrate');
    }

    public getMaxBitrate(): number {
        return this.get('maxBitrate');
    }

    public getWidth(): number {
        return this.get('width');
    }

    public getHeight(): number {
        return this.get('height');
    }

    public getApiFramework(): string | null {
        return this.get('apiFramework');
    }

    public getScalable(): boolean | null {
        return this.get('scalable');
    }

    public getMaintainAspectRation(): boolean | null {
        return this.get('maintainAspectRatio');
    }

    public getFileSize(): number {
        return this.get('fileSize');
    }

    public getDTO(): { [key: string]: unknown } {
        return {
            'fileURL': this.getFileURL(),
            'deliveryType': this.getDeliveryType(),
            'mimeType': this.getMIMEType(),
            'codec': this.getCodec(),
            'bitrate': this.getBitrate(),
            'minBitrate': this.getMinBitrate(),
            'maxBitrate': this.getMaxBitrate(),
            'width': this.getWidth(),
            'height': this.getHeight(),
            'apiFramework': this.getApiFramework(),
            'scalable': this.getScalable(),
            'maintainAspectRatio': this.getMaintainAspectRation(),
            'fileSize': this.getFileSize()
        };
    }
}
