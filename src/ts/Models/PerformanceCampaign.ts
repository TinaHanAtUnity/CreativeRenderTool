import { Campaign } from 'Models/Campaign';
import { Asset } from 'Models/Asset';
import { Video } from 'Models/Video';

export enum StoreName {
    APPLE,
    GOOGLE,
    XIAOMI
}

export class PerformanceCampaign extends Campaign {

    private _appStoreId: string;
    private _appStoreCountry: string;

    private _gameId: number;
    private _gameName: string;
    private _gameIcon: Asset;

    private _rating: number;
    private _ratingCount: number;

    private _landscapeImage: Asset;
    private _portraitImage: Asset;

    private _video: Video;
    private _streamingVideo: Video;

    private _clickAttributionUrl: string;
    private _clickAttributionUrlFollowsRedirects: boolean;

    private _bypassAppSheet: boolean;

    private _store: StoreName;

    constructor(campaign: any, gamerId: string, abGroup: number) {
        super(campaign.id, gamerId, abGroup);

        this._appStoreId = campaign.appStoreId;
        this._appStoreCountry = campaign.appStoreCountry;

        this._gameId = campaign.gameId;
        this._gameName = campaign.gameName;
        this._gameIcon = new Asset(campaign.gameIcon);

        this._rating = campaign.rating;
        this._ratingCount = campaign.ratingCount;

        this._landscapeImage = new Asset(campaign.endScreenLandscape);
        this._portraitImage = new Asset(campaign.endScreenPortrait);

        this._video = new Video(campaign.trailerDownloadable, campaign.trailerDownloadableSize);
        this._streamingVideo = new Video(campaign.trailerStreaming);

        this._clickAttributionUrl = campaign.clickAttributionUrl;
        this._clickAttributionUrlFollowsRedirects = campaign.clickAttributionUrlFollowsRedirects;

        this._bypassAppSheet = campaign.bypassAppSheet;

        const campaignStore = typeof campaign.store !== 'undefined' ? campaign.store : '';
        switch(campaignStore) {
            case 'apple':
                this._store = StoreName.APPLE;
                break;
            case 'google':
                this._store = StoreName.GOOGLE;
                break;
            case 'xiaomi':
                this._store = StoreName.XIAOMI;
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
