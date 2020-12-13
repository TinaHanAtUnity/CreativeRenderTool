import { HTML } from 'Ads/Models/Assets/HTML';
import { ProgrammaticCampaign } from 'Ads/Models/Campaigns/ProgrammaticCampaign';
export class MRAIDCampaign extends ProgrammaticCampaign {
    constructor(campaign) {
        super('MRAIDCampaign', Object.assign({}, ProgrammaticCampaign.Schema, { resourceAsset: ['object', 'undefined'], resource: ['string', 'undefined'], dynamicMarkup: ['string', 'undefined'], clickAttributionUrl: ['string', 'undefined'], clickAttributionUrlFollowsRedirects: ['boolean', 'undefined'], clickUrl: ['string', 'undefined'], gameName: ['string', 'undefined'], gameIcon: ['object', 'undefined'], rating: ['number', 'undefined'], ratingCount: ['number', 'undefined'], landscapeImage: ['object', 'undefined'], portraitImage: ['object', 'undefined'], bypassAppSheet: ['boolean', 'undefined'], store: ['number', 'undefined'], appStoreId: ['string', 'undefined'], videoEventUrls: ['object', 'undefined'], playableConfiguration: ['object', 'undefined'], targetGameId: ['number', 'undefined'], isCustomCloseEnabled: ['boolean'] }), campaign);
    }
    getResourceUrl() {
        return this.get('resourceAsset');
    }
    setResourceUrl(url) {
        this.set('resourceAsset', new HTML(url, this.getSession()));
    }
    setResource(resource) {
        this.set('resource', resource);
    }
    getResource() {
        return this.get('resource');
    }
    getGameName() {
        return this.get('gameName');
    }
    getGameIcon() {
        return this.get('gameIcon');
    }
    getRating() {
        return this.get('rating');
    }
    getRatingCount() {
        return this.get('ratingCount');
    }
    getPortrait() {
        return this.get('portraitImage');
    }
    getLandscape() {
        return this.get('landscapeImage');
    }
    getPlayableConfiguration() {
        return this.get('playableConfiguration');
    }
    getRequiredAssets() {
        const resourceUrl = this.getResourceUrl();
        return resourceUrl ? [resourceUrl] : [];
    }
    getOptionalAssets() {
        const assets = [];
        const gameIcon = this.getGameIcon();
        if (gameIcon) {
            assets.push(gameIcon);
        }
        const portrait = this.getPortrait();
        if (portrait) {
            assets.push(portrait);
        }
        const landscape = this.getLandscape();
        if (landscape) {
            assets.push(landscape);
        }
        return assets;
    }
    getDynamicMarkup() {
        return this.get('dynamicMarkup');
    }
    getClickAttributionUrl() {
        return this.get('clickAttributionUrl');
    }
    getClickAttributionUrlFollowsRedirects() {
        return this.get('clickAttributionUrlFollowsRedirects');
    }
    getClickUrl() {
        return this.get('clickUrl');
    }
    getBypassAppSheet() {
        return this.get('bypassAppSheet');
    }
    getStore() {
        return this.get('store');
    }
    getAppStoreId() {
        return this.get('appStoreId');
    }
    getVideoEventUrls() {
        return this.get('videoEventUrls');
    }
    getVideoEventUrl(eventType) {
        const urls = this.get('videoEventUrls');
        return urls ? urls[eventType] : undefined;
    }
    getTargetGameId() {
        return this.get('targetGameId');
    }
    isCustomCloseEnabled() {
        return this.get('isCustomCloseEnabled');
    }
    setPlayableConfiguration(configuration) {
        this.set('playableConfiguration', configuration);
    }
    isConnectionNeeded() {
        const resourceUrl = this.getResourceUrl();
        if (resourceUrl && resourceUrl.getOriginalUrl().match(/playables\/production\/unity/)) {
            return false;
        }
        return true;
    }
    getDTO() {
        let resourceUrlDTO;
        const resourceUrlAsset = this.getResourceUrl();
        if (resourceUrlAsset) {
            resourceUrlDTO = resourceUrlAsset.getDTO();
        }
        return {
            'campaign': super.getDTO(),
            'resourceUrl': resourceUrlDTO,
            'resource': this.getResource(),
            'dynamicMarkup': this.getDynamicMarkup()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURDYW1wYWlnbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9NUkFJRC9Nb2RlbHMvTVJBSURDYW1wYWlnbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFOUMsT0FBTyxFQUF5QixvQkFBb0IsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBZ0N4RyxNQUFNLE9BQU8sYUFBYyxTQUFRLG9CQUFvQztJQUNuRSxZQUFZLFFBQXdCO1FBQ2hDLEtBQUssQ0FBQyxlQUFlLG9CQUNiLG9CQUFvQixDQUFDLE1BQU0sSUFDL0IsYUFBYSxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUN0QyxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQ2pDLGFBQWEsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFDdEMsbUJBQW1CLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQzVDLG1DQUFtQyxFQUFFLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxFQUM3RCxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQ2pDLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFDakMsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUNqQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQy9CLFdBQVcsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFDcEMsY0FBYyxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUN2QyxhQUFhLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQ3RDLGNBQWMsRUFBRSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsRUFDeEMsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcs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