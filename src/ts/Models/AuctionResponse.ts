import { Model } from 'Models/Model';

export interface IAuctionResponse {
    placements: string[];
    contentType: string;
    content: string;
    cacheTTL: number | undefined;
    trackingUrls: { [eventName: string]: string[] };
    adType: string;
    creativeId: string | undefined;
    seatId: number | undefined;
    correlationId: string;
    appCategory: string | undefined;
    appSubCategory: string | undefined;
    advertiserCampaignId: string | undefined;
    advertiserDomain: string | undefined;
    advertiserBundleId: string | undefined;
    ext: string | undefined;
    mediaId: string;
    rawData: any;
}

export class AuctionResponse extends Model<IAuctionResponse> {
    constructor(placements: string[], data: any, mediaId: string, correlationId: string) {
        super('AuctionResponse', {
            placements: ['array'],
            contentType: ['string'],
            content: ['string'],
            cacheTTL: ['integer', 'undefined'],
            trackingUrls: ['object'],
            adType: ['string'],
            creativeId: ['string', 'undefined'],
            seatId: ['integer', 'undefined'],
            appCategory: ['string', 'undefined'],
            appSubCategory: ['string', 'undefined'],
            correlationId: ['string'],
            advertiserCampaignId: ['string', 'undefined'],
            advertiserDomain: ['string', 'undefined'],
            advertiserBundleId: ['string', 'undefined'],
            ext: ['string', 'undefined'],
            mediaId: ['string'],
            rawData: ['object']
        });

        this.set('placements', placements);
        this.set('contentType', data.contentType);
        this.set('content', data.content);
        this.set('cacheTTL', data.cacheTTL);
        this.set('trackingUrls', data.trackingUrls);
        this.set('adType', data.adType);
        this.set('creativeId', data.creativeId);
        this.set('seatId', data.seatId);
        this.set('correlationId', correlationId);
        this.set('appCategory', data.appCategory);
        this.set('appSubCategory', data.appSubCategory);
        this.set('advertiserCampaignId', data.campaignId);
        this.set('advertiserDomain', data.advDomain);
        this.set('advertiserBundleId', data.bundleId);
        this.set('ext', data.ext);
        this.set('mediaId', mediaId);
        this.set('rawData', data);
    }

    public getPlacements(): string[] {
        return this.get('placements');
    }

    public getContentType(): string {
        return this.get('contentType');
    }

    public getContent(): string {
        return this.get('content');
    }

    public getCacheTTL(): number | undefined {
        return this.get('cacheTTL');
    }

    public getTrackingUrls(): { [eventName: string]: string[] } {
        return this.get('trackingUrls');
    }

    public getAdType(): string {
        return this.get('adType');
    }

    public getCreativeId(): string | undefined {
        return this.get('creativeId');
    }

    public getSeatId(): number | undefined {
        return this.get('seatId');
    }

    public getCorrelationId(): string {
        return this.get('correlationId');
    }

    public getCategory(): string | undefined {
        return this.get('appCategory');
    }

    public getSubCategory(): string | undefined {
        return this.get('appSubCategory');
    }

    public getAdvertiserDomain(): string | undefined {
        return this.get('advertiserDomain');
    }

    public getAdvertiserCampaignId(): string | undefined {
        return this.get('advertiserCampaignId');
    }

    public getAdvertiserBundleId(): string | undefined {
        return this.get('advertiserBundleId');
    }

    public getExt(): string | undefined {
        return this.get('ext');
    }

    public getMediaId(): string {
        return this.get('mediaId');
    }

    public getRawData(): any {
        return this.get('rawData');
    }

    public getDTO(): {[key: string]: any } {
        return {
            'placements': this.getPlacements(),
            'contentType': this.getContentType(),
            'content': this.getContent(),
            'cacheTTL': this.getCacheTTL(),
            'trackingUrls': this.getTrackingUrls(),
            'adType': this.getAdType(),
            'creativeId': this.getCreativeId(),
            'seatId': this.getSeatId(),
            'correlationId': this.getCorrelationId(),
            'ext': this.getExt()
            'appCategory': this.getCategory(),
            'appSubCategory': this.getSubCategory()
        };
    }
}
