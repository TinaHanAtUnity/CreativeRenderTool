import { Campaign } from 'Models/Campaign';

export class PerformanceCampaign extends Campaign {

    private _appStoreId: string;
    private _appStoreCountry: string;
    private _gameId: number;
    private _gameName: string;
    private _gameIcon: string;
    private _rating: number;
    private _ratingCount: number;
    private _landscapeImage: string;
    private _portraitImage: string;
    private _video: string;
    private _videoSize: number;
    private _streamingVideo: string;
    private _clickAttributionUrl: string;
    private _clickAttributionUrlFollowsRedirects: boolean;
    private _bypassAppSheet: boolean;

    private _isVideoCached: boolean = false;

    constructor(campaign: any, gamerId: string, abGroup: number) {
        super(campaign.id, gamerId, abGroup);
        this._appStoreId = campaign.appStoreId;
        this._appStoreCountry = campaign.appStoreCountry;
        this._gameId = campaign.gameId;
        this._gameName = campaign.gameName;
        this._gameIcon = campaign.gameIcon;
        this._rating = campaign.rating;
        this._ratingCount = campaign.ratingCount;
        this._landscapeImage = campaign.endScreenLandscape;
        this._portraitImage = campaign.endScreenPortrait;
        this._video = campaign.trailerDownloadable;
        this._videoSize = campaign.trailerDownloadableSize;
        this._streamingVideo = campaign.trailerStreaming;
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

    public getGameIcon(): string {
        return this._gameIcon;
    }

    public setGameIcon(gameIcon: string): void {
        this._gameIcon = gameIcon;
    }

    public getRating(): number {
        return this._rating;
    }

    public getRatingCount(): number {
        return this._ratingCount;
    }

    public getPortraitUrl(): string {
        return this._portraitImage;
    }

    public setPortraitUrl(portraitUrl: string): void {
        this._portraitImage = portraitUrl;
    }

    public getLandscapeUrl(): string {
        return this._landscapeImage;
    }

    public setLandscapeUrl(landscapeUrl: string): void {
        this._landscapeImage = landscapeUrl;
    }

    public getVideoUrl(): string {
        return this._video;
    }

    public setVideoUrl(videoUrl: string): void {
        this._video = videoUrl;
    }

    public getStreamingVideoUrl(): string {
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

    public isVideoCached(): boolean {
        return this._isVideoCached;
    }

    public setVideoCached(value: boolean) {
        this._isVideoCached = value;
    }

    public getTimeoutInSeconds(): number {
        return 0;
    }
}
