import { Campaign } from 'Ads/Models/Campaign';
export var StoreName;
(function (StoreName) {
    StoreName[StoreName["APPLE"] = 0] = "APPLE";
    StoreName[StoreName["GOOGLE"] = 1] = "GOOGLE";
    StoreName[StoreName["XIAOMI"] = 2] = "XIAOMI";
    StoreName[StoreName["STANDALONE_ANDROID"] = 3] = "STANDALONE_ANDROID";
})(StoreName || (StoreName = {}));
export class XPromoCampaign extends Campaign {
    constructor(campaign) {
        super('XPromoCampaign', Object.assign({}, Campaign.Schema, { appStoreId: ['string'], gameId: ['number'], gameName: ['string'], gameIcon: ['object'], rating: ['number'], ratingCount: ['number'], landscapeImage: ['object', 'undefined'], portraitImage: ['object', 'undefined'], squareImage: ['object', 'undefined'], video: ['object', 'undefined'], streamingVideo: ['object', 'undefined'], videoPortrait: ['object', 'undefined'], streamingPortraitVideo: ['object', 'undefined'], clickAttributionUrl: ['string', 'undefined'], clickAttributionUrlFollowsRedirects: ['boolean', 'undefined'], bypassAppSheet: ['boolean'], store: ['number'], videoEventUrls: ['object'] }), campaign);
    }
    getStore() {
        return this.get('store');
    }
    getAppStoreId() {
        return this.get('appStoreId');
    }
    getGameId() {
        return this.get('gameId');
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
    getSquare() {
        return this.get('squareImage');
    }
    getVideo() {
        return this.get('video');
    }
    getStreamingVideo() {
        return this.get('streamingVideo');
    }
    getPortraitVideo() {
        return this.get('videoPortrait');
    }
    getStreamingPortraitVideo() {
        return this.get('streamingPortraitVideo');
    }
    getClickAttributionUrl() {
        return this.get('clickAttributionUrl');
    }
    getClickAttributionUrlFollowsRedirects() {
        return this.get('clickAttributionUrlFollowsRedirects');
    }
    getBypassAppSheet() {
        return this.get('bypassAppSheet');
    }
    getVideoEventUrl(eventType) {
        return this.get('videoEventUrls')[eventType];
    }
    getTimeoutInSeconds() {
        return 0;
    }
    getRequiredAssets() {
        return [];
    }
    getOptionalAssets() {
        const assets = [];
        assets.push(this.getGameIcon());
        const square = this.getSquare();
        if (square) {
            assets.push(square);
        }
        const landscape = this.getLandscape();
        if (landscape) {
            assets.push(landscape);
        }
        const portrait = this.getPortrait();
        if (portrait) {
            assets.push(portrait);
        }
        return assets;
    }
    isConnectionNeeded() {
        return false;
    }
    getDTO() {
        let gameIcon;
        const gameIconObject = this.getGameIcon();
        if (gameIconObject) {
            gameIcon = gameIconObject.getDTO();
        }
        let squareImage;
        const squareImageObject = this.getSquare();
        if (squareImageObject) {
            squareImage = squareImageObject.getDTO();
        }
        let landscapeImage;
        const landscapeImageObject = this.getLandscape();
        if (landscapeImageObject) {
            landscapeImage = landscapeImageObject.getDTO();
        }
        let portraitImage;
        const portraitImageObject = this.getPortrait();
        if (portraitImageObject) {
            portraitImage = portraitImageObject.getDTO();
        }
        let video;
        const videoObject = this.getVideo();
        if (videoObject) {
            video = videoObject.getDTO();
        }
        let streamingVideo;
        const streamingVideoObject = this.getStreamingVideo();
        if (streamingVideoObject) {
            streamingVideo = streamingVideoObject.getDTO();
        }
        return {
            'campaign': super.getDTO(),
            'appStoreId': this.getAppStoreId(),
            'gameId': this.getGameId(),
            'gameName': this.getGameName(),
            'gameIcon': gameIcon,
            'rating': this.getRating(),
            'ratingCount': this.getRatingCount(),
            'squareImage': squareImage,
            'landscapeImage': landscapeImage,
            'portraitImage': portraitImage,
            'video': video,
            'streamingVideo': streamingVideo,
            'clickAttributionUrl': this.getClickAttributionUrl(),
            'clickAttributionUrlFollowsRedirects': this.getClickAttributionUrlFollowsRedirects(),
            'bypassAppSheet': this.getBypassAppSheet(),
            'store': StoreName[this.getStore()].toLowerCase()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWFByb21vQ2FtcGFpZ24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvWFByb21vL01vZGVscy9YUHJvbW9DYW1wYWlnbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsUUFBUSxFQUFhLE1BQU0scUJBQXFCLENBQUM7QUFHMUQsTUFBTSxDQUFOLElBQVksU0FLWDtBQUxELFdBQVksU0FBUztJQUNqQiwyQ0FBSyxDQUFBO0lBQ0wsNkNBQU0sQ0FBQTtJQUNOLDZDQUFNLENBQUE7SUFDTixxRUFBa0IsQ0FBQTtBQUN0QixDQUFDLEVBTFcsU0FBUyxLQUFULFNBQVMsUUFLcEI7QUF1QkQsTUFBTSxPQUFPLGNBQWUsU0FBUSxRQUF5QjtJQUN6RCxZQUFZLFFBQXlCO1FBQ2pDLEtBQUssQ0FBQyxnQkFBZ0Isb0JBQ2QsUUFBUSxDQUFDLE1BQU0sSUFDbkIsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQ3RCLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUNsQixRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFDcEIsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQ3BCLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUNsQixXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFDdkIsY0FBYyxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUN2QyxhQUFhLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQ3RDLFdBQVcsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFDcEMsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUM5QixjQUFjLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQ3ZDLGFBQWEsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFDdEMsc0JBQXNCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFD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