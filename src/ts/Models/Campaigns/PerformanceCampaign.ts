import { Campaign, ICampaign } from 'Models/Campaign';
import { Video } from 'Models/Assets/Video';
import { Image } from 'Models/Assets/Image';

export enum StoreName {
    APPLE,
    GOOGLE,
    XIAOMI
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
            store: ['number']
        });

        this.set('id', campaign.id);
        this.set('session', campaign.session);
        this.set('gamerId', campaign.gamerId);
        this.set('abGroup', campaign.abGroup);

        this.set('appStoreId', campaign.appStoreId);

        this.set('gameId', campaign.gameId);
        this.set('gameName', campaign.gameName);
        this.set('gameIcon', campaign.gameIcon);

        this.set('rating', campaign.rating);
        this.set('ratingCount', campaign.ratingCount);

        this.set('landscapeImage', campaign.landscapeImage);
        this.set('portraitImage', campaign.portraitImage);

        if(campaign.video && campaign.streamingVideo) {
            this.set('video', campaign.video);
            this.set('streamingVideo', campaign.streamingVideo);
        }

        if(campaign.videoPortrait && campaign.streamingPortraitVideo) {
            this.set('videoPortrait', campaign.videoPortrait);
            this.set('streamingPortraitVideo', campaign.streamingPortraitVideo);
        }

        this.set('clickUrl', campaign.clickUrl);
        this.set('videoEventUrls', campaign.videoEventUrls);
        this.set('clickAttributionUrl', campaign.clickAttributionUrl);
        this.set('clickAttributionUrlFollowsRedirects', campaign.clickAttributionUrlFollowsRedirects);

        this.set('bypassAppSheet', campaign.bypassAppSheet);
        this.set('store', campaign.store);

        this.set('meta', campaign.meta);
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
