import { ISchema, Model } from 'Models/Model';

interface IVastMediaFile extends ISchema {
    fileURL: [string | null, string[]];
    deliveryType: [string, string[]];
    mimeType: [string | null, string[]];
    codec: [string | null, string[]];
    bitrate: [number, string[]];
    minBitrate: [number, string[]];
    maxBitrate: [number, string[]];
    width: [number, string[]];
    height: [number, string[]];
    apiFramework: [string | null, string[]];
    scalable: [boolean | null, string[]];
    maintainAspectRatio: [boolean | null, string[]];
}

export class VastMediaFile extends Model<IVastMediaFile> {
    constructor();
    constructor(fileURL: string, deliveryType: string, codec: string, mimeType: string, bitrate: number,
                minBitrate: number, maxBitrate: number, width: number, height: number);
    constructor(fileURL?: string, deliveryType?: string, codec?: string, mimeType?: string, bitrate?: number,
                minBitrate?: number, maxBitrate?: number, width?: number, height?: number) {
        super({
            fileURL: [null, ['string', 'null']],
            deliveryType: ['', ['string']],
            mimeType: [null, ['string', 'null']],
            codec: [null, ['string', 'null']],
            bitrate: [0, ['number']],
            minBitrate: [0, ['number']],
            maxBitrate: [0, ['number']],
            width: [0, ['number']],
            height: [0, ['number']],
            apiFramework: [null, ['string', 'null']],
            scalable: [null, ['boolean', 'null']],
            maintainAspectRatio: [null, ['boolean', 'null']]
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
        this.set('apiFramework', null);
        this.set('scalable', null);
        this.set('maintainAspectRatio', null);
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

    public getDTO(): { [key: string]: any } {
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
            'maintainAspectRatio': this.getMaintainAspectRation()
        };
    }
}
