import { Campaign, ICampaign } from 'Models/Campaign';
import { Video } from 'Models/Assets/Video';
import { Image } from 'Models/Assets/Image';

export enum StoreName {
    APPLE,
    GOOGLE,
    XIAOMI
}

interface IPerformanceCampaign extends ICampaign {
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

    bypassAppSheet: boolean;

    store: StoreName;
}

export class PerformanceCampaign extends Campaign<IPerformanceCampaign> {
    constructor(campaign: any, gamerId: string, abGroup: number) {
        super({
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
            bypassAppSheet: ['boolean'],
            store: ['number']
        });

        this.set('id', campaign.id);
        this.set('gamerId', gamerId);
        this.set('abGroup', abGroup);

        this.set('appStoreId', campaign.appStoreId);

        this.set('gameId', campaign.gameId);
        this.set('gameName', campaign.gameName);
        this.set('gameIcon', new Image(campaign.gameIcon));

        this.set('rating', campaign.rating);
        this.set('ratingCount', campaign.ratingCount);

        this.set('landscapeImage', new Image(campaign.endScreenLandscape));
        this.set('portraitImage', new Image(campaign.endScreenPortrait));

        if(campaign.trailerDownloadable && campaign.trailerDownloadableSize && campaign.trailerStreaming) {
            this.set('video', new Video(campaign.trailerDownloadable, campaign.trailerDownloadableSize));
            this.set('streamingVideo', new Video(campaign.trailerStreaming));
        }

        if(campaign.trailerPortraitDownloadable && campaign.trailerPortraitDownloadableSize && campaign.trailerPortraitStreaming) {
            this.set('videoPortrait', new Video(campaign.trailerPortraitDownloadable, campaign.trailerPortraitDownloadableSize));
            this.set('streamingPortraitVideo', new Video(campaign.trailerPortraitStreaming));
        }

        this.set('clickAttributionUrl', campaign.clickAttributionUrl);
        this.set('clickAttributionUrlFollowsRedirects', campaign.clickAttributionUrlFollowsRedirects);

        this.set('bypassAppSheet', campaign.bypassAppSheet);

        const campaignStore = typeof campaign.store !== 'undefined' ? campaign.store : '';
        switch(campaignStore) {
            case 'apple':
                this.set('store', StoreName.APPLE);
                break;
            case 'google':
                this.set('store', StoreName.GOOGLE);
                break;
            case 'xiaomi':
                this.set('store', StoreName.XIAOMI);
                break;
            default:
                throw new Error('Unknown store value "' + campaign.store + '"');
        }
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

    public getBypassAppSheet(): boolean {
        return this.get('bypassAppSheet');
    }

    public getTimeoutInSeconds(): number {
        return 0;
    }

    public getRequiredAssets() {
        return [
            this.getVideo()
        ];
    }

    public getOptionalAssets() {
        return [
            this.getGameIcon(),
            this.getPortrait(),
            this.getLandscape()
        ];
    }

    public getDTO(): { [key: string]: any } {
        let gameIcon: any = undefined;
        const gameIconObject = this.getGameIcon();
        if (gameIconObject) {
            gameIcon = gameIconObject.getDTO();
        }

        let landscapeImage: any = undefined;
        const landscapeImageObject = this.getLandscape();
        if (landscapeImageObject) {
            landscapeImage = landscapeImageObject.getDTO();
        }

        let portraitImage: any = undefined;
        const portraitImageObject = this.getPortrait();
        if (portraitImageObject) {
            portraitImage = portraitImageObject.getDTO();
        }

        let video: any = undefined;
        const videoObject = this.getVideo();
        if (videoObject) {
            video = videoObject.getDTO();
        }

        let streamingVideo: any = undefined;
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
