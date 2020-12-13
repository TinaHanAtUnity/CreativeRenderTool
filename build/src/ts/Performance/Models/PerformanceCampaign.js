import { Campaign } from 'Ads/Models/Campaign';
export var StoreName;
(function (StoreName) {
    StoreName[StoreName["APPLE"] = 0] = "APPLE";
    StoreName[StoreName["GOOGLE"] = 1] = "GOOGLE";
    StoreName[StoreName["XIAOMI"] = 2] = "XIAOMI";
    // for APK campaigns
    StoreName[StoreName["STANDALONE_ANDROID"] = 3] = "STANDALONE_ANDROID";
})(StoreName || (StoreName = {}));
export class PerformanceCampaign extends Campaign {
    constructor(campaign) {
        super('PerformanceCampaign', Object.assign({}, Campaign.Schema, { appStoreId: ['string'], gameId: ['number'], gameName: ['string'], gameIcon: ['object'], rating: ['number'], ratingCount: ['number'], landscapeImage: ['object', 'undefined'], portraitImage: ['object', 'undefined'], squareImage: ['object', 'undefined'], video: ['object', 'undefined'], streamingVideo: ['object', 'undefined'], videoPortrait: ['object', 'undefined'], streamingPortraitVideo: ['object', 'undefined'], clickAttributionUrl: ['string', 'undefined'], clickAttributionUrlFollowsRedirects: ['boolean', 'undefined'], clickUrl: ['string'], videoEventUrls: ['object'], bypassAppSheet: ['boolean'], store: ['number'], adUnitStyle: ['object', 'undefined'], appDownloadUrl: ['string', 'undefined'], endScreenType: ['string', 'undefined'], endScreen: ['object', 'undefined'], endScreenSettings: ['object', 'undefined'] }), campaign);
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
    getClickUrl() {
        return this.get('clickUrl');
    }
    getVideoEventUrls() {
        return this.get('videoEventUrls');
    }
    getVideoEventUrl(eventType) {
        return this.get('videoEventUrls')[eventType];
    }
    getBypassAppSheet() {
        return this.get('bypassAppSheet');
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
        const endScreen = this.getEndScreen();
        if (endScreen) {
            assets.push(endScreen);
        }
        return assets;
    }
    getAppDownloadUrl() {
        return this.get('appDownloadUrl');
    }
    isConnectionNeeded() {
        return false;
    }
    getAdUnitStyle() {
        return this.get('adUnitStyle');
    }
    getEndScreenType() {
        return this.get('endScreenType');
    }
    getEndScreen() {
        return this.get('endScreen');
    }
    getEndScreenSettings() {
        return this.get('endScreenSettings');
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
            'store': StoreName[this.getStore()].toLowerCase(),
            'appDownloadUrl': this.getAppDownloadUrl(),
            'endScreenType': this.getEndScreenType(),
            'endScreen': this.getEndScreen(),
            'endScreenSettings': this.getEndScreenSettings()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyZm9ybWFuY2VDYW1wYWlnbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9QZXJmb3JtYW5jZS9Nb2RlbHMvUGVyZm9ybWFuY2VDYW1wYWlnbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxPQUFPLEVBQUUsUUFBUSxFQUEyQixNQUFNLHFCQUFxQixDQUFDO0FBSXhFLE1BQU0sQ0FBTixJQUFZLFNBTVg7QUFORCxXQUFZLFNBQVM7SUFDakIsMkNBQUssQ0FBQTtJQUNMLDZDQUFNLENBQUE7SUFDTiw2Q0FBTSxDQUFBO0lBQ04sb0JBQW9CO0lBQ3BCLHFFQUFrQixDQUFBO0FBQ3RCLENBQUMsRUFOVyxTQUFTLEtBQVQsU0FBUyxRQU1wQjtBQWtFRCxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsUUFBOEI7SUFDbkUsWUFBWSxRQUE4QjtRQUN0QyxLQUFLLENBQUMscUJBQXFCLG9CQUNuQixRQUFRLENBQUMsTUFBTSxJQUNuQixVQUFVLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFDdEIsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQ2xCLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUNwQixRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFDcEIsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQ2xCLFdBQVcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUN2QixjQUFjLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQ3ZDLGFBQWEsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFDdEMsV0FBVyxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUNwQyxLQUFLLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQzlCLGNBQWMsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFDdkMsYUFBYSxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUN0QyxzQkFB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