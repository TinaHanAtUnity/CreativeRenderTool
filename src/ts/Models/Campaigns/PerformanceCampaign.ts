import { Campaign, ICampaign } from 'Models/Campaign';
import { Video } from 'Models/Assets/Video';
import { Image } from 'Models/Assets/Image';
import { AdUnitStyle } from 'Models/AdUnitStyle';

export enum StoreName {
    APPLE,
    GOOGLE,
    XIAOMI,
    STANDALONE_APK
}

export interface IPerformanceCampaign extends ICampaign {
    appStoreId: string;
    gameId: number;
    gameName: string;
    gameIcon: Image;
    rating: number;
    ratingCount: number;
    landscapeImage: Image;
    portraitImage: Image;
    video?: Video;
    streamingVideo?: Video;
    videoPortrait?: Video;
    streamingPortraitVideo?: Video;
    clickAttributionUrl?: string;
    clickAttributionUrlFollowsRedirects?: boolean;
    clickUrl: string;
    videoEventUrls: { [eventType: string]: string };
    bypassAppSheet: boolean;
    store: StoreName;
    adUnitStyle: AdUnitStyle | undefined;
}

export class PerformanceCampaign extends Campaign<IPerformanceCampaign> {
    constructor(campaign: IPerformanceCampaign) {
        super('PerformanceCampaign', {
            ... Campaign.Schema,
            appStoreId: ['string'],
            gameId: ['number'],
            gameName: ['string'],
            gameIcon: ['object'],
            rating: ['number'],
            ratingCount: ['number'],
            landscapeImage: ['object'],
            portraitImage: ['object'],
            video: ['object', 'undefined'],
            streamingVideo: ['object', 'undefined'],
            videoPortrait: ['object', 'undefined'],
            streamingPortraitVideo: ['object', 'undefined'],
            clickAttributionUrl: ['string', 'undefined'],
            clickAttributionUrlFollowsRedirects: ['boolean', 'undefined'],
            clickUrl: ['string'],
            videoEventUrls: ['object'],
            bypassAppSheet: ['boolean'],
            store: ['number'],
            adUnitStyle: ['object', 'undefined']
        }, campaign);
    }

    public getStore(): StoreName {
        return this.get('store');
    }

    public getAppStoreId(): string {
        return this.get('appStoreId');
    }

    public getGameId(): number {
        return this.get('gameId');
    }

    public getGameName(): string {
        return this.get('gameName');
    }

    public getGameIcon(): Image {
        return this.get('gameIcon');
    }

    public getRating(): number {
        return this.get('rating');
    }

    public getRatingCount(): number {
        return this.get('ratingCount');
    }

    public getPortrait(): Image {
        return this.get('portraitImage');
    }

    public getLandscape(): Image {
        return this.get('landscapeImage');
    }

    public getVideo(): Video | undefined {
        return this.get('video');
    }

    public getStreamingVideo(): Video | undefined {
        return this.get('streamingVideo');
    }

    public getPortraitVideo(): Video | undefined {
        return this.get('videoPortrait');
    }

    public getStreamingPortraitVideo(): Video | undefined {
        return this.get('streamingPortraitVideo');
    }

    public getClickAttributionUrl(): string | undefined {
        return this.get('clickAttributionUrl');
    }

    public getClickAttributionUrlFollowsRedirects(): boolean | undefined {
        return this.get('clickAttributionUrlFollowsRedirects');
    }

    public getClickUrl(): string {
        return this.get('clickUrl');
    }

    public getVideoEventUrls(): { [eventType: string]: string } {
        return this.get('videoEventUrls');
    }

    public getVideoEventUrl(eventType: string): string {
        return this.get('videoEventUrls')[eventType];
    }

    public getBypassAppSheet(): boolean {
        return this.get('bypassAppSheet');
    }

    public getTimeoutInSeconds(): number {
        return 0;
    }

    public getRequiredAssets() {
        return [];
    }

    public getOptionalAssets() {
        return [
            this.getGameIcon(),
            this.getPortrait(),
            this.getLandscape()
        ];
    }

    public isConnectionNeeded(): boolean {
        return false;
    }

    public getAdUnitStyle(): AdUnitStyle | undefined {
        return this.get('adUnitStyle');
    }

    public getDTO(): { [key: string]: any } {
        let gameIcon: any;
        const gameIconObject = this.getGameIcon();
        if (gameIconObject) {
            gameIcon = gameIconObject.getDTO();
        }

        let landscapeImage: any;
        const landscapeImageObject = this.getLandscape();
        if (landscapeImageObject) {
            landscapeImage = landscapeImageObject.getDTO();
        }

        let portraitImage: any;
        const portraitImageObject = this.getPortrait();
        if (portraitImageObject) {
            portraitImage = portraitImageObject.getDTO();
        }

        let video: any;
        const videoObject = this.getVideo();
        if (videoObject) {
            video = videoObject.getDTO();
        }

        let streamingVideo: any;
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
