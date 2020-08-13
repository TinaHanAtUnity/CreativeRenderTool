import { Model } from 'Core/Models/Model';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { ICampaignTrackingUrls } from 'Ads/Models/Campaign';

export enum AuctionStatusCode {
    NORMAL = 0,
    FREQUENCY_CAP_REACHED = 999
}

export interface IRawAuctionResponse {
    auctionId?: string;
    correlationId: string;
    placements: { [key: string]: string };
    media: { [key: string]: IAuctionResponse };
    statusCode?: number;
}

export interface IPlacementPreloadData {
    campaignAvailable: boolean;
    ttlInSeconds: number;
    dataIndex: string;
}

export interface IRawAuctionV5Response {
    auctionId?: string;
    correlationId: string;
    placements: { [key: string]: { mediaId: string; trackingId: string } };
    media: { [key: string]: IAuctionResponse };
    tracking: { [key: string]: ICampaignTrackingUrls | undefined };
    statusCode?: number;
    preloadData?: { [key: string]: IPlacementPreloadData };
    encryptedPreloadData?: { [key: string]: string };
}

interface IEventTrackingV6 {
    urlIndices: number[];
    params?: { [key: string]: string };
}

export interface IPlacementTrackingV6 {
    params?: { [key: string]: string };
    events?: { [key: string]: IEventTrackingV6 };
}

export interface IRawAuctionV6Response {
    auctionId?: string;
    correlationId: string;
    statusCode?: number;
    placements: { [key: string]: { mediaId: string; tracking: IPlacementTrackingV6 } };
    media: { [key: string]: IAuctionResponse };
    trackingTemplates: string[];
    preloadData?: { [key: string]: IPlacementPreloadData };
    encryptedPreloadData?: { [key: string]: string };
}

export interface IAuctionResponse {
    placements: AuctionPlacement[];
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
    campaignId: string | undefined;
    advDomain: string | undefined;
    bundleId: string | undefined;
    useWebViewUserAgentForTracking: boolean | undefined;
    buyerId: string | undefined;
    mediaId: string;
    width: number | undefined;
    height: number | undefined;
    isMoatEnabled: boolean | undefined;
    statusCode: number | undefined;
    isOMEnabled: boolean | undefined;
    shouldMuteByDefault: boolean | undefined;
    isCustomCloseEnabled: boolean;
}

export class AuctionResponse extends Model<IAuctionResponse> {

    constructor(placements: AuctionPlacement[], data: IAuctionResponse, mediaId: string, correlationId: string, statusCode?: number) {
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
            campaignId: ['string', 'undefined'],
            advDomain: ['string', 'undefined'],
            bundleId: ['string', 'undefined'],
            useWebViewUserAgentForTracking: ['boolean', 'undefined'],
            buyerId: ['string', 'undefined'],
            mediaId: ['string'],
            width: ['number', 'undefined'],
            height: ['number', 'undefined'],
            isMoatEnabled: ['boolean', 'undefined'],
            statusCode: ['number', 'undefined'],
            isOMEnabled: ['boolean', 'undefined'],
            shouldMuteByDefault: ['boolean', 'undefined'],
            isCustomCloseEnabled: ['boolean']
        });

        this.set('placements', placements);
        this.set('contentType', data.contentType);
        this.set('content', data.content);
        this.set('cacheTTL', data.cacheTTL);
        this.set('trackingUrls', data.trackingUrls ? data.trackingUrls : {}); // todo: hack for auction v5 test, trackingUrls should be removed from this model once auction v5 is unconditionally adopted
        this.set('adType', data.adType);
        this.set('creativeId', data.creativeId);
        this.set('seatId', data.seatId);
        this.set('correlationId', correlationId);
        this.set('appCategory', data.appCategory);
        this.set('appSubCategory', data.appSubCategory);
        this.set('campaignId', data.campaignId);
        this.set('advDomain', data.advDomain);
        this.set('bundleId', data.bundleId);
        this.set('useWebViewUserAgentForTracking', data.useWebViewUserAgentForTracking || false);
        this.set('buyerId', data.buyerId);
        this.set('mediaId', mediaId);
        this.set('width', data.width);
        this.set('height', data.height);
        this.set('isMoatEnabled', data.isMoatEnabled);
        this.set('statusCode', statusCode);
        this.set('isOMEnabled', data.isOMEnabled);
        this.set('shouldMuteByDefault', data.shouldMuteByDefault);
        this.set('isCustomCloseEnabled', data.isCustomCloseEnabled || false);
    }

    public getPlacements(): AuctionPlacement[] {
        return this.get('placements');
    }

    public getContentType(): string {
        return this.get('contentType');
    }

    public getContent(): string {
        return this.get('content');
    }

    public getJsonContent(): unknown {
        return JsonParser.parse(this.getContent());
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
        return this.get('advDomain');
    }

    public getAdvertiserCampaignId(): string | undefined {
        return this.get('campaignId');
    }

    public getAdvertiserBundleId(): string | undefined {
        return this.get('bundleId');
    }

    public getUseWebViewUserAgentForTracking(): boolean | undefined {
        return this.get('useWebViewUserAgentForTracking');
    }

    public getBuyerId(): string | undefined {
        return this.get('buyerId');
    }

    public getMediaId(): string {
        return this.get('mediaId');
    }

    public getWidth(): number | undefined {
        return this.get('width');
    }

    public getHeight(): number | undefined {
        return this.get('height');
    }

    public isMoatEnabled(): boolean | undefined {
        return this.get('isMoatEnabled');
    }

    public getStatusCode(): number | undefined {
        return this.get('statusCode');
    }

    public isAdmobOMEnabled(): boolean | undefined {
        return this.get('isOMEnabled');
    }

    public shouldMuteByDefault(): boolean | undefined {
        return this.get('shouldMuteByDefault');
    }

    public isCustomCloseEnabled(): boolean {
        return this.get('isCustomCloseEnabled');
    }

    public getDTO(): {[key: string]: unknown } {
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
            'appCategory': this.getCategory(),
            'appSubCategory': this.getSubCategory(),
            'useWebViewUserAgentForTracking': this.getUseWebViewUserAgentForTracking(),
            'buyerId': this.getBuyerId(),
            'mediaId': this.getMediaId(),
            'isCustomCloseEnabled': this.isCustomCloseEnabled()
        };
    }
}
