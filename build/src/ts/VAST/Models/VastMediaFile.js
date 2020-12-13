import { Model } from 'Core/Models/Model';
export class VastMediaFile extends Model {
    constructor(fileURL, deliveryType, codec, mimeType, bitrate, minBitrate, maxBitrate, width, height, apiFramework, fileSize) {
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
    getFileURL() {
        return this.get('fileURL');
    }
    getDeliveryType() {
        return this.get('deliveryType');
    }
    getMIMEType() {
        return this.get('mimeType');
    }
    getCodec() {
        return this.get('codec');
    }
    getBitrate() {
        return this.get('bitrate');
    }
    getMinBitrate() {
        return this.get('minBitrate');
    }
    getMaxBitrate() {
        return this.get('maxBitrate');
    }
    getWidth() {
        return this.get('width');
    }
    getHeight() {
        return this.get('height');
    }
    getApiFramework() {
        return this.get('apiFramework');
    }
    getScalable() {
        return this.get('scalable');
    }
    getMaintainAspectRation() {
        return this.get('maintainAspectRatio');
    }
    getFileSize() {
        return this.get('fileSize');
    }
    getDTO() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdE1lZGlhRmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9WQVNUL01vZGVscy9WYXN0TWVkaWFGaWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQWtCMUMsTUFBTSxPQUFPLGFBQWMsU0FBUSxLQUFxQjtJQUlwRCxZQUFZLE9BQWdCLEVBQUUsWUFBNEIsRUFBRSxLQUFxQixFQUFFLFFBQXdCLEVBQUUsT0FBZ0IsRUFDekgsVUFBbUIsRUFBRSxVQUFtQixFQUFFLEtBQWMsRUFBRSxNQUFlLEVBQUUsWUFBNEIsRUFBRSxRQUFpQjtRQUMxSCxLQUFLLENBQUMsZUFBZSxFQUFFO1lBQ25CLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7WUFDM0IsWUFBWSxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ3hCLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7WUFDNUIsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztZQUN6QixPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDbkIsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ3RCLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUN0QixLQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDakIsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ2xCLFlBQVksRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7WUFDaEMsUUFBUSxFQUFFLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQztZQUM3QixtQkFBbUIsRUFBRSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUM7WUFDeEMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDO1NBQ3ZCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE9BQU8sSUFBSSxJQUFJ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