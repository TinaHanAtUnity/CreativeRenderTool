import { Model } from 'Core/Models/Model';
import { JsonParser } from 'Core/Utilities/JsonParser';
export var AuctionStatusCode;
(function (AuctionStatusCode) {
    AuctionStatusCode[AuctionStatusCode["NORMAL"] = 0] = "NORMAL";
    AuctionStatusCode[AuctionStatusCode["FREQUENCY_CAP_REACHED"] = 999] = "FREQUENCY_CAP_REACHED";
})(AuctionStatusCode || (AuctionStatusCode = {}));
export class AuctionResponse extends Model {
    constructor(placements, data, mediaId, correlationId, statusCode) {
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
    getPlacements() {
        return this.get('placements');
    }
    getContentType() {
        return this.get('contentType');
    }
    getContent() {
        return this.get('content');
    }
    getJsonContent() {
        return JsonParser.parse(this.getContent());
    }
    getCacheTTL() {
        return this.get('cacheTTL');
    }
    getTrackingUrls() {
        return this.get('trackingUrls');
    }
    getAdType() {
        return this.get('adType');
    }
    getCreativeId() {
        return this.get('creativeId');
    }
    getSeatId() {
        return this.get('seatId');
    }
    getCorrelationId() {
        return this.get('correlationId');
    }
    getCategory() {
        return this.get('appCategory');
    }
    getSubCategory() {
        return this.get('appSubCategory');
    }
    getAdvertiserDomain() {
        return this.get('advDomain');
    }
    getAdvertiserCampaignId() {
        return this.get('campaignId');
    }
    getAdvertiserBundleId() {
        return this.get('bundleId');
    }
    getUseWebViewUserAgentForTracking() {
        return this.get('useWebViewUserAgentForTracking');
    }
    getBuyerId() {
        return this.get('buyerId');
    }
    getMediaId() {
        return this.get('mediaId');
    }
    getWidth() {
        return this.get('width');
    }
    getHeight() {
        return this.get('height');
    }
    isMoatEnabled() {
        return this.get('isMoatEnabled');
    }
    getStatusCode() {
        return this.get('statusCode');
    }
    isAdmobOMEnabled() {
        return this.get('isOMEnabled');
    }
    shouldMuteByDefault() {
        return this.get('shouldMuteByDefault');
    }
    isCustomCloseEnabled() {
        return this.get('isCustomCloseEnabled');
    }
    getDTO() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXVjdGlvblJlc3BvbnNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9Nb2RlbHMvQXVjdGlvblJlc3BvbnNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMxQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFJdkQsTUFBTSxDQUFOLElBQVksaUJBR1g7QUFIRCxXQUFZLGlCQUFpQjtJQUN6Qiw2REFBVSxDQUFBO0lBQ1YsNkZBQTJCLENBQUE7QUFDL0IsQ0FBQyxFQUhXLGlCQUFpQixLQUFqQixpQkFBaUIsUUFHNUI7QUEyRUQsTUFBTSxPQUFPLGVBQWdCLFNBQVEsS0FBdUI7SUFFeEQsWUFBWSxVQUE4QixFQUFFLElBQXNCLEVBQUUsT0FBZSxFQUFFLGFBQXFCLEVBQUUsVUFBbUI7UUFDM0gsS0FBSyxDQUFDLGlCQUFpQixFQUFFO1lBQ3JCLFVBQVUsRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUNyQixXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDdkIsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ25CLFFBQVEsRUFBRSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUM7WUFDbEMsWUFBWSxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ3hCLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUNsQixVQUFVLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDO1lBQ25DLE1BQU0sRUFBRSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUM7WUFDaEMsV0FBVyxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQztZQUNwQyxjQUFjLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDO1lBQ3ZDLGFBQWEsRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUN6QixVQUFVLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxD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