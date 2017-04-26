import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Asset';
import { Video } from 'Models/Video';

export enum StoreName {
    APPLE,
    GOOGLE,
    XIAOMI
}

interface IPerformanceCampaign extends ICampaign {
    appStoreId: [string, string[]];
    appStoreCountry: [string, string[]];

    gameId: [number, string[]];
    gameName: [string, string[]];
    gameIcon: [Asset, string[]];

    rating: [number, string[]];
    ratingCount: [number, string[]];

    landscapeImage: [Asset, string[]];
    portraitImage: [Asset, string[]];

    video: [Video, string[]];
    streamingVideo: [Video, string[]];

    clickAttributionUrl: [string, string[]];
    clickAttributionUrlFollowsRedirects: [boolean, string[]];

    bypassAppSheet: [boolean, string[]];

    store: [StoreName, string[]];
}

export class PerformanceCampaign extends Campaign<IPerformanceCampaign> {
    constructor(campaign: any, gamerId: string, abGroup: number) {
        super({
            id: [campaign.id, ['string']],
            gamerId: [gamerId, ['string']],
            abGroup: [abGroup, ['number']],
            timeout: [undefined, ['number', 'undefined']],
            willExpireAt: [undefined, ['number', 'undefined']],
            appStoreId: ['', ['string']],
            appStoreCountry: ['', ['string']],
            gameId: [0, ['number']],
            gameName: ['', ['string']],
            gameIcon: [new Asset(''), ['object']],
            rating: [0, ['number']],
            ratingCount: [0, ['number']],
            landscapeImage: [new Asset(''), ['object']],
            portraitImage: [new Asset(''), ['object']],
            video: [new Video(''), ['object']],
            streamingVideo: [new Video(''), ['object']],
            clickAttributionUrl: ['', ['string']],
            clickAttributionUrlFollowsRedirects: [false, ['boolean']],
            bypassAppSheet: [false, ['boolean']],
            store: [StoreName.APPLE, ['object']]
        });

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
        return this._store;
    }

    public getAppStoreId(): string {
        return this._appStoreId;
    }

    public getAppStoreCountry(): string {
        return this._appStoreCountry;
    }

    public getGameId(): number {
        return this._gameId;
    }

    public getGameName(): string {
        return this._gameName;
    }

    public getGameIcon(): Asset {
        return this._gameIcon;
    }

    public getRating() {
        return this._rating;
    }

    public getRatingCount() {
        return this._ratingCount;
    }

    public getPortrait(): Asset {
        return this._portraitImage;
    }

    public getLandscape(): Asset {
        return this._landscapeImage;
    }

    public getVideo(): Video {
        return this._video;
    }

    public getStreamingVideo(): Video {
        return this._streamingVideo;
    }

    public getClickAttributionUrl(): string {
        return this._clickAttributionUrl;
    }

    public getClickAttributionUrlFollowsRedirects(): boolean {
        return this._clickAttributionUrlFollowsRedirects;
    }

    public getBypassAppSheet(): boolean {
        return this._bypassAppSheet;
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
        if (this._gameIcon) {
            gameIcon = this._gameIcon.getDTO();
        }

        let landscapeImage: any = undefined;
        if (this._landscapeImage) {
            landscapeImage = this._landscapeImage.getDTO();
        }

        let portraitImage: any = undefined;
        if (this._portraitImage) {
            portraitImage = this._portraitImage.getDTO();
        }

        let video: any = undefined;
        if (this._video) {
            video = this._video.getDTO();
        }

        let streamingVideo: any = undefined;
        if (this._streamingVideo) {
            streamingVideo = this._streamingVideo.getDTO();
        }

        return {
            'campaign': super.getDTO(),
            'appStoreId': this._appStoreId,
            'appStoreCountry': this._appStoreCountry,
            'gameId': this._gameId,
            'gameName': this._gameName,
            'gameIcon': gameIcon,
            'rating': this._rating,
            'ratingCount': this._ratingCount,
            'landscapeImage': landscapeImage,
            'portraitImage': portraitImage,
            'video': video,
            'streamingVideo': streamingVideo,
            'clickAttributionUrl': this._clickAttributionUrl,
            'clickAttributionUrlFollowsRedirects': this._clickAttributionUrlFollowsRedirects,
            'bypassAppSheet': this._bypassAppSheet,
            'store': StoreName[this._store].toLowerCase()
        };
    }
}
