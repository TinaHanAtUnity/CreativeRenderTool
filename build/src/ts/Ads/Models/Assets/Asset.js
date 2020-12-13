import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { Model } from 'Core/Models/Model';
export class Asset extends Model {
    constructor(name, session, schema) {
        super(name, schema);
        this.set('session', session);
    }
    getUrl() {
        const cachedUrl = this.getCachedUrl();
        if (cachedUrl) {
            return cachedUrl;
        }
        return this.getOriginalUrl();
    }
    getOriginalUrl() {
        return this.get('url');
    }
    isCached() {
        const cachedUrl = this.getCachedUrl();
        return typeof cachedUrl !== 'undefined';
    }
    getCachedUrl() {
        return this.get('cachedUrl');
    }
    setCachedUrl(url) {
        this.set('cachedUrl', url);
    }
    setFileId(fileId) {
        this.set('fileId', fileId);
    }
    getFileId() {
        return this.get('fileId');
    }
    getSession() {
        return this.get('session');
    }
    getCreativeId() {
        return this.get('creativeId');
    }
    getDTO() {
        return {
            'url': this.getOriginalUrl(),
            'cachedUrl': this.getCachedUrl(),
            'fileId': this.getFileId()
        };
    }
    handleError(error) {
        SessionDiagnostics.trigger('set_model_value_failed', error, this.getSession());
        throw error;
    }
}
Asset.Schema = {
    url: ['string'],
    cachedUrl: ['string', 'undefined'],
    fileId: ['string', 'undefined'],
    session: ['object'],
    creativeId: ['string', 'undefined']
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXNzZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL01vZGVscy9Bc3NldHMvQXNzZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFFdEUsT0FBTyxFQUFXLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBVW5ELE1BQU0sT0FBZ0IsS0FBaUMsU0FBUSxLQUFRO0lBU25FLFlBQVksSUFBWSxFQUFFLE9BQWdCLEVBQUUsTUFBa0I7UUFDMUQsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBSU0sTUFBTTtRQUNULE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN0QyxJQUFJLFNBQVMsRUFBRTtZQUNYLE9BQU8sU0FBUyxDQUFDO1NBQ3BCO1FBRUQsT0FBTyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVNLGNBQWM7UUFDakIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFTSxRQUFRO1FBQ1gsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3RDLE9BQU8sT0FBTyxTQUFTLEtBQUssV0FBVyxDQUFDO0lBQzVDLENBQUM7SUFFTSxZQUFZO1FBQ2YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFTSxZQUFZLENBQUMsR0FBdUI7UUFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVNLFNBQVMsQ0FBQyxNQUEwQjtRQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU0sU0FBUztRQUNaLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRU0sVUFBVTtRQUNiLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU0sYUFBYTtRQUNoQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVNLE1BQU07UUFDVCxPQUFPO1lBQ0gsS0FBSyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDNUIsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDaEMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUU7U0FDN0IsQ0FBQztJQUNOLENBQUM7SUFFUyxXQUFXLENBQUMsS0FBbUI7UUFDckMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLHdCQUF3QixFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUMvRSxNQUFNLEtBQUssQ0FBQztJQUNoQixDQUFDOztBQXBFYSxZQUFNLEdBQW9CO0lBQ3BDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQztJQUNmLFNBQVMsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUM7SUFDbEMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQztJQUMvQixPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7SUFDbkIsVUFBVSxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQztDQUN0QyxDQUFDIn0=