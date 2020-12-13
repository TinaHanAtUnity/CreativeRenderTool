import { Model } from 'Core/Models/Model';
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
export class VastAd extends Model {
    constructor(id, creatives, errorURLTemplates, impressionURLTemplates, wrapperURLs, staticCompanionAds, unsupportedCompanionAds, adVerifications, iframeCompanionAds, htmlCompanionAds) {
        super('VastAd', {
            id: ['string', 'null'],
            creatives: ['array'],
            staticCompanionAds: ['array'],
            iframeCompanionAds: ['array'],
            htmlCompanionAds: ['array'],
            errorURLTemplates: ['array'],
            impressionURLTemplates: ['array'],
            wrapperURLs: ['array'],
            unsupportedCompanionAds: ['array'],
            adVerifications: ['array']
        });
        this.set('id', id || null);
        this.set('creatives', creatives || []);
        this.set('staticCompanionAds', staticCompanionAds || []);
        this.set('iframeCompanionAds', iframeCompanionAds || []);
        this.set('htmlCompanionAds', htmlCompanionAds || []);
        this.set('errorURLTemplates', errorURLTemplates || []);
        this.set('impressionURLTemplates', impressionURLTemplates || []);
        this.set('wrapperURLs', wrapperURLs || []);
        this.set('unsupportedCompanionAds', unsupportedCompanionAds || []);
        this.set('adVerifications', adVerifications || []);
    }
    getId() {
        return this.get('id');
    }
    setId(id) {
        this.set('id', id);
    }
    getCreatives() {
        return this.get('creatives');
    }
    getCreative() {
        if (this.getCreatives() && this.getCreatives().length > 0) {
            return this.getCreatives()[0];
        }
        return null;
    }
    getAdVerifications() {
        return this.get('adVerifications');
    }
    addCreative(creative) {
        this.get('creatives').push(creative);
    }
    getStaticCompanionAds() {
        return this.get('staticCompanionAds');
    }
    addStaticCompanionAd(companionAd) {
        this.get('staticCompanionAds').push(companionAd);
    }
    getIframeCompanionAds() {
        return this.get('iframeCompanionAds');
    }
    addIframeCompanionAd(companionAd) {
        this.get('iframeCompanionAds').push(companionAd);
    }
    getHtmlCompanionAds() {
        return this.get('htmlCompanionAds');
    }
    addHtmlCompanionAd(companionAd) {
        this.get('htmlCompanionAds').push(companionAd);
    }
    getUnsupportedCompanionAds() {
        return this.get('unsupportedCompanionAds');
    }
    addUnsupportedCompanionAd(unsupportedItem) {
        this.get('unsupportedCompanionAds').push(unsupportedItem);
    }
    addAdVerifications(verfications) {
        this.set('adVerifications', this.get('adVerifications').concat(verfications));
    }
    getErrorURLTemplates() {
        return this.get('errorURLTemplates');
    }
    addErrorURLTemplate(errorURLTemplate) {
        this.get('errorURLTemplates').push(errorURLTemplate);
    }
    getImpressionURLTemplates() {
        return this.get('impressionURLTemplates');
    }
    addImpressionURLTemplate(impressionURLTemplate) {
        this.get('impressionURLTemplates').push(impressionURLTemplate);
    }
    getWrapperURL() {
        return this.get('wrapperURLs')[0];
    }
    getWrapperURLs() {
        return this.get('wrapperURLs');
    }
    addWrapperURL(url) {
        this.get('wrapperURLs').push(url);
    }
    getTrackingEventUrls(eventName) {
        const creative = this.getCreative();
        if (creative) {
            if (creative.getTrackingEvents()) {
                return creative.getTrackingEvents()[eventName];
            }
        }
        return null;
    }
    getDuration() {
        const creative = this.getCreative();
        if (creative) {
            return creative.getDuration();
        }
        else {
            return null;
        }
    }
    getVideoClickThroughURLTemplate() {
        const creative = this.getCreative();
        if (creative instanceof VastCreativeLinear) {
            return creative.getVideoClickThroughURLTemplate();
        }
        return null;
    }
    getVideoClickTrackingURLTemplates() {
        const creative = this.getCreative();
        if (creative instanceof VastCreativeLinear) {
            return creative.getVideoClickTrackingURLTemplates();
        }
        return [];
    }
    addVideoClickTrackingURLTemplate(videoClickTrackingURL) {
        const creative = this.getCreative();
        if (creative instanceof VastCreativeLinear) {
            creative.addVideoClickTrackingURLTemplate(videoClickTrackingURL);
        }
    }
    getDTO() {
        const vastCreatives = [];
        for (const vastCreative of this.getCreatives()) {
            vastCreatives.push(vastCreative.getDTO());
        }
        const staticCompanionAds = [];
        for (const companionAd of this.getStaticCompanionAds()) {
            staticCompanionAds.push(companionAd.getDTO());
        }
        const iframeCompanionAds = [];
        for (const companionAd of this.getIframeCompanionAds()) {
            iframeCompanionAds.push(companionAd.getDTO());
        }
        const htmlCompanionAds = [];
        for (const companionAd of this.getHtmlCompanionAds()) {
            htmlCompanionAds.push(companionAd.getDTO());
        }
        return {
            'id': this.getId(),
            'errorURLTemplates': this.getErrorURLTemplates(),
            'impressionURLTemplates': this.getImpressionURLTemplates(),
            'wrapperURLs': this.getWrapperURLs(),
            'vastCreatives': vastCreatives,
            'staticCompanionAds': staticCompanionAds,
            'iframeCompanionAds': iframeCompanionAds,
            'htmlCompanionAds': htmlCompanionAds,
            'unsupportedItems': this.getUnsupportedCompanionAds()
        };
    }
    getCompanionCreativeViewTrackingUrls() {
        return this.getCompanionEventTrackingUrls(TrackingEvent.CREATIVE_VIEW);
    }
    getCompanionEventTrackingUrls(eventType) {
        let urls = [];
        const companions = this.getStaticCompanionAds();
        for (const companion of companions) {
            urls = urls.concat(companion.getEventTrackingUrls(eventType));
        }
        return urls;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEFkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZBU1QvTW9kZWxzL1Zhc3RBZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFLMUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDcEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBZ0JwRSxNQUFNLE9BQU8sTUFBTyxTQUFRLEtBQWM7SUFJdEMsWUFBWSxFQUFXLEVBQUUsU0FBMEIsRUFBRSxpQkFBNEIsRUFBRSxzQkFBaUMsRUFBRSxXQUFzQixFQUFFLGtCQUFvRCxFQUFFLHVCQUFrQyxFQUFFLGVBQXNDLEVBQUUsa0JBQW9ELEVBQUUsZ0JBQWdEO1FBQ2xYLEtBQUssQ0FBQyxRQUFRLEVBQUU7WUFDWixFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDO1lBQ3RCLFNBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUNwQixrQkFBa0IsRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUM3QixrQkFBa0IsRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUM3QixnQkFBZ0IsRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUMzQixpQkFBaUIsRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUM1QixzQkFBc0IsRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUNqQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUM7WUFDdEIsdUJBQXVCLEVBQUUsQ0FBQyxPQUFPLENBQUM7WUFDbEMsZUFBZSxFQUFFLENBQUMsT0FBTyxDQUFDO1NBQzdCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxJQUFJLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxTQUFTLElBQUksRUFBRSxDQUFD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