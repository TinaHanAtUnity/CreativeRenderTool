import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { Model } from 'Core/Models/Model';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';
export class Campaign extends Model {
    constructor(name, schema, data) {
        super(name, schema, data);
        this._uniqueId = JaegerUtilities.uuidv4();
    }
    getId() {
        return this.get('id');
    }
    getSession() {
        return this.get('session');
    }
    getAdType() {
        return this.get('adType');
    }
    getContentType() {
        return this.get('contentType');
    }
    getCorrelationId() {
        return this.get('correlationId');
    }
    getCreativeId() {
        return this.get('creativeId');
    }
    getSeatId() {
        return this.get('seatId');
    }
    getMeta() {
        return this.get('meta');
    }
    getWillExpireAt() {
        return this.get('willExpireAt');
    }
    isExpired() {
        const willExpireAt = this.get('willExpireAt');
        return willExpireAt !== undefined && Date.now() > willExpireAt;
    }
    setIsLoadEnabled(isLoadEnabled) {
        this.set('isLoadEnabled', isLoadEnabled);
    }
    isLoadEnabled() {
        return this.get('isLoadEnabled');
    }
    setMediaId(id) {
        this.set('mediaId', id);
    }
    getMediaId() {
        return this.get('mediaId');
    }
    setTrackingUrls(trackingUrls) {
        this.set('trackingUrls', trackingUrls);
    }
    getTrackingUrls() {
        return this.get('trackingUrls');
    }
    getTrackingUrlsForEvent(event) {
        const urls = this.getTrackingUrls();
        if (urls) {
            return urls[event] || [];
        }
        return [];
    }
    getUniqueId() {
        return this._uniqueId;
    }
    getDTO() {
        return {
            'id': this.getId(),
            'willExpireAt': this.getWillExpireAt(),
            'mediaId': this.getMediaId()
        };
    }
    handleError(error) {
        SessionDiagnostics.trigger('set_model_value_failed', error, this.getSession());
        throw error;
    }
}
Campaign.Schema = {
    id: ['string'],
    willExpireAt: ['number', 'undefined'],
    contentType: ['string'],
    adType: ['string', 'undefined'],
    correlationId: ['string', 'undefined'],
    creativeId: ['string', 'undefined'],
    seatId: ['number', 'undefined'],
    meta: ['string', 'undefined'],
    session: ['object'],
    mediaId: ['string'],
    trackingUrls: ['object'],
    isLoadEnabled: ['boolean']
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtcGFpZ24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL01vZGVscy9DYW1wYWlnbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUV0RSxPQUFPLEVBQVcsS0FBSyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFbkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBaUM5RCxNQUFNLE9BQWdCLFFBQTBDLFNBQVEsS0FBUTtJQWtCNUUsWUFBWSxJQUFZLEVBQUUsTUFBa0IsRUFBRSxJQUFPO1FBQ2pELEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTFCLElBQUksQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzlDLENBQUM7SUFFTSxLQUFLO1FBQ1IsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFTSxVQUFVO1FBQ2IsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFTSxTQUFTO1FBQ1osT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFTSxjQUFjO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRU0sZ0JBQWdCO1FBQ25CLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU0sYUFBYTtRQUNoQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVNLFNBQVM7UUFDWixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENB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