import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Asset';
import { Video } from 'Models/Video';

export enum StoreName {
    APPLE,
    GOOGLE,
    XIAOMI
}

interface IPerformanceCampaign extends ICampaign {
    appStoreId: string;
    appStoreCountry: string;

    gameId: number;
    gameName: string;
    gameIcon: Asset;

    rating: number;
    ratingCount: number;

    landscapeImage: Asset;
    portraitImage: Asset;

    video: Video;
    streamingVideo: Video;

    clickAttributionUrl: string;
    clickAttributionUrlFollowsRedirects: boolean;

    bypassAppSheet: boolean;

    store: StoreName;
}

export class PerformanceCampaign extends Campaign<IPerformanceCampaign> {
    constructor(campaign: any, gamerId: string, abGroup: number) {
        super({
            ... Campaign.Schema,
            appStoreId: ['string'],
            appStoreCountry: ['string'],
            gameId: ['number'],
            gameName: ['string'],
            gameIcon: ['object'],
            rating: ['number'],
            ratingCount: ['number'],
            landscapeImage: ['object'],
            portraitImage: ['object'],
            video: ['object'],
            streamingVideo: ['object'],
            clickAttributionUrl: ['string'],
            clickAttributionUrlFollowsRedirects: ['boolean'],
            bypassAppSheet: ['boolean'],
            store: ['object']
        }, campaign.id, gamerId, abGroup);

        this.set('appStoreId', campaign.appStoreId);
        this.set('appStoreCountry', campaign.appStoreCountry);

        this.set('gameId', campaign.gameId);
        this.set('gameName', campaign.gameName);
        this.set('gameIcon', new Asset(campaign.gameIcon));

        this.set('rating', campaign.rating);
        this.set('ratingCount', campaign.ratingCount);

        this.set('landscapeImage', new Asset(campaign.endScreenLandscape));
        this.set('portraitImage', new Asset(campaign.endScreenPortrait));

        this.set('video', new Video(campaign.trailerDownloadable, campaign.trailerDownloadableSize));
        this.set('streamingVideo', new Video(campaign.trailerStreaming));

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

    public getAppStoreCountry(): string {
        return this.get('appStoreCountry');
    }

    public getGameId(): number {
        return this.get('gameId');
    }

    public getGameName(): string {
        return this.get('gameName');
    }

    public getGameIcon(): Asset {
        return this.get('gameIcon');
    }

    public getRating(): number {
        return this.get('rating');
    }

    public getRatingCount(): number {
        return this.get('ratingCount');
    }

    public getPortrait(): Asset {
        return this.get('portraitImage');
    }

    public getLandscape(): Asset {
        return this.get('landscapeImage');
    }

    public getVideo(): Video {
        return this.get('video');
    }

    public getStreamingVideo(): Video {
        return this.get('streamingVideo');
    }

    public getClickAttributionUrl(): string {
        return this.get('clickAttributionUrl');
    }

    public getClickAttributionUrlFollowsRedirects(): boolean {
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
            'appStoreCountry': this.getAppStoreCountry(),
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
