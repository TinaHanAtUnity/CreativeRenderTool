import { Campaign } from 'Models/Campaign';
import { Asset } from 'Models/Asset';
import { Video } from 'Models/Video';

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

}
